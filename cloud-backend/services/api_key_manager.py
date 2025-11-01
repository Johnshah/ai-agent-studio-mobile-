"""
API Key Manager Service
Handles storage and management of user API keys for various AI services
Supports encryption and secure storage
"""

import os
import json
import logging
from typing import Dict, Optional, List
from datetime import datetime
from cryptography.fernet import Fernet
import base64
import hashlib

logger = logging.getLogger(__name__)

class APIKeyManager:
    """Manage API keys for users securely"""
    
    def __init__(self, encryption_key: Optional[str] = None):
        # Generate or use provided encryption key
        if encryption_key:
            key = hashlib.sha256(encryption_key.encode()).digest()
            self.encryption_key = base64.urlsafe_b64encode(key)
        else:
            self.encryption_key = Fernet.generate_key()
        
        self.cipher = Fernet(self.encryption_key)
        
        # Storage for user API keys {user_id: {service: encrypted_key}}
        self.user_keys: Dict[str, Dict[str, str]] = {}
        
        # Supported services
        self.supported_services = [
            "huggingface",
            "openai",
            "anthropic",
            "stability-ai",
            "replicate",
            "runway",
            "midjourney",
            "elevenlabs",
            "cohere",
            "google-ai",
            "azure-openai",
            "aws-bedrock",
        ]
    
    def encrypt_key(self, api_key: str) -> str:
        """Encrypt an API key"""
        try:
            encrypted = self.cipher.encrypt(api_key.encode())
            return base64.b64encode(encrypted).decode()
        except Exception as e:
            logger.error(f"Error encrypting API key: {e}")
            raise
    
    def decrypt_key(self, encrypted_key: str) -> str:
        """Decrypt an API key"""
        try:
            decoded = base64.b64decode(encrypted_key.encode())
            decrypted = self.cipher.decrypt(decoded)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Error decrypting API key: {e}")
            raise
    
    async def set_api_key(self, user_id: str, service: str, api_key: str) -> bool:
        """Set API key for a user and service"""
        try:
            if service not in self.supported_services:
                logger.warning(f"Service {service} not in supported list, adding anyway")
            
            # Encrypt the API key
            encrypted_key = self.encrypt_key(api_key)
            
            # Store in memory (in production, use database)
            if user_id not in self.user_keys:
                self.user_keys[user_id] = {}
            
            self.user_keys[user_id][service] = encrypted_key
            
            logger.info(f"API key set for user {user_id}, service {service}")
            return True
            
        except Exception as e:
            logger.error(f"Error setting API key: {e}")
            return False
    
    async def get_api_key(self, user_id: str, service: str) -> Optional[str]:
        """Get API key for a user and service"""
        try:
            if user_id not in self.user_keys:
                return None
            
            encrypted_key = self.user_keys[user_id].get(service)
            if not encrypted_key:
                return None
            
            # Decrypt and return
            return self.decrypt_key(encrypted_key)
            
        except Exception as e:
            logger.error(f"Error getting API key: {e}")
            return None
    
    async def delete_api_key(self, user_id: str, service: str) -> bool:
        """Delete API key for a user and service"""
        try:
            if user_id not in self.user_keys:
                return False
            
            if service in self.user_keys[user_id]:
                del self.user_keys[user_id][service]
                logger.info(f"API key deleted for user {user_id}, service {service}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting API key: {e}")
            return False
    
    async def get_user_services(self, user_id: str) -> List[str]:
        """Get list of services user has API keys for"""
        if user_id not in self.user_keys:
            return []
        
        return list(self.user_keys[user_id].keys())
    
    async def has_api_key(self, user_id: str, service: str) -> bool:
        """Check if user has API key for service"""
        if user_id not in self.user_keys:
            return False
        
        return service in self.user_keys[user_id]
    
    def get_supported_services(self) -> List[Dict[str, str]]:
        """Get list of supported services with descriptions"""
        return [
            {"id": "huggingface", "name": "Hugging Face", "description": "Access 100k+ AI models"},
            {"id": "openai", "name": "OpenAI", "description": "GPT-4, DALL-E 3, Whisper"},
            {"id": "anthropic", "name": "Anthropic", "description": "Claude AI models"},
            {"id": "stability-ai", "name": "Stability AI", "description": "Stable Diffusion models"},
            {"id": "replicate", "name": "Replicate", "description": "Run AI models in the cloud"},
            {"id": "runway", "name": "Runway", "description": "Gen-2 video generation"},
            {"id": "midjourney", "name": "Midjourney", "description": "AI art generation"},
            {"id": "elevenlabs", "name": "ElevenLabs", "description": "Voice cloning and TTS"},
            {"id": "cohere", "name": "Cohere", "description": "Language AI models"},
            {"id": "google-ai", "name": "Google AI", "description": "Gemini and other models"},
            {"id": "azure-openai", "name": "Azure OpenAI", "description": "Microsoft Azure AI"},
            {"id": "aws-bedrock", "name": "AWS Bedrock", "description": "Amazon AI services"},
        ]
    
    async def validate_api_key(self, service: str, api_key: str) -> bool:
        """Validate an API key (basic validation)"""
        if not api_key or len(api_key) < 10:
            return False
        
        # Service-specific validation
        validations = {
            "huggingface": lambda k: k.startswith("hf_"),
            "openai": lambda k: k.startswith("sk-"),
            "anthropic": lambda k: k.startswith("sk-ant-"),
            "stability-ai": lambda k: k.startswith("sk-"),
        }
        
        if service in validations:
            return validations[service](api_key)
        
        # Generic validation for other services
        return True
    
    async def export_keys(self, user_id: str) -> Optional[Dict[str, str]]:
        """Export user's API keys (for backup)"""
        if user_id not in self.user_keys:
            return None
        
        decrypted_keys = {}
        for service, encrypted_key in self.user_keys[user_id].items():
            try:
                decrypted_keys[service] = self.decrypt_key(encrypted_key)
            except Exception as e:
                logger.error(f"Error decrypting key for service {service}: {e}")
        
        return decrypted_keys
    
    async def import_keys(self, user_id: str, keys: Dict[str, str]) -> int:
        """Import API keys for a user"""
        imported_count = 0
        
        for service, api_key in keys.items():
            if await self.set_api_key(user_id, service, api_key):
                imported_count += 1
        
        logger.info(f"Imported {imported_count} keys for user {user_id}")
        return imported_count

# Global instance
api_key_manager = APIKeyManager(os.getenv("API_KEY_ENCRYPTION_SECRET", "default-secret-change-in-production"))