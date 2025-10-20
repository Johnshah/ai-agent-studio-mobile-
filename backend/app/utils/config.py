"""
Configuration settings for AI Agent Studio Backend
"""

import os
from typing import Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    RELOAD: bool = True
    
    # AI Model Configuration
    MODEL_CACHE_DIR: str = "./models/cache"
    ENABLE_GPU: bool = True
    MAX_CONCURRENT_GENERATIONS: int = 3
    DEFAULT_TIMEOUT: int = 300
    
    # Hugging Face Configuration
    HUGGINGFACE_TOKEN: Optional[str] = None
    HUGGINGFACE_CACHE_DIR: str = "./models/cache/huggingface"
    
    # Social Media API Keys
    YOUTUBE_API_KEY: Optional[str] = None
    TWITTER_BEARER_TOKEN: Optional[str] = None
    INSTAGRAM_ACCESS_TOKEN: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "your_secret_key_here_change_this_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/ai_agent_studio.db"
    REDIS_URL: str = "redis://localhost:6379"
    
    # File Storage
    MAX_UPLOAD_SIZE: str = "100MB"
    ALLOWED_FILE_TYPES: str = "mp4,mp3,wav,jpg,jpeg,png,gif,pdf,txt,py,js,html,css"
    
    # Performance
    WORKER_PROCESSES: int = 1
    WORKER_CONNECTIONS: int = 1000
    KEEPALIVE: int = 2
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()

# Ensure required directories exist
os.makedirs(settings.MODEL_CACHE_DIR, exist_ok=True)
os.makedirs(settings.HUGGINGFACE_CACHE_DIR, exist_ok=True)
os.makedirs("./data", exist_ok=True)
os.makedirs("./logs", exist_ok=True)
os.makedirs("./static/generated", exist_ok=True)