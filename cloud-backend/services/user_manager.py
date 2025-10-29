"""
User Manager Service for AI Agent Studio Cloud Backend
Handles user authentication, authorization, and user data management
"""

import asyncio
import hashlib
import secrets
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import json
import jwt

logger = logging.getLogger(__name__)

class UserRole(Enum):
    USER = "user"
    PREMIUM = "premium"
    ADMIN = "admin"

class UserStatus(Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"

@dataclass
class User:
    user_id: str
    username: str
    email: str
    password_hash: str
    role: UserRole
    status: UserStatus
    created_at: datetime
    last_login: Optional[datetime] = None
    api_key: Optional[str] = None
    quota_limits: Dict[str, int] = None
    quota_used: Dict[str, int] = None
    metadata: Dict[str, Any] = None
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        data = asdict(self)
        # Convert datetime objects to ISO strings
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat() if value else None
            elif isinstance(value, (UserRole, UserStatus)):
                data[key] = value.value
        
        # Remove sensitive information unless explicitly requested
        if not include_sensitive:
            data.pop('password_hash', None)
            data.pop('api_key', None)
        
        return data

@dataclass
class UserSession:
    session_id: str
    user_id: str
    created_at: datetime
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_active: bool = True

class UserManager:
    def __init__(self, jwt_secret: str = None):
        self.users: Dict[str, User] = {}
        self.sessions: Dict[str, UserSession] = {}
        self.jwt_secret = jwt_secret or secrets.token_urlsafe(32)
        self.session_duration_hours = 24
        
        # Default quota limits for different user roles
        self.default_quotas = {
            UserRole.USER: {
                "daily_tasks": 10,
                "monthly_storage_mb": 100,
                "concurrent_tasks": 2,
                "video_generation": 2,
                "audio_generation": 5,
                "image_generation": 10,
                "code_generation": 20,
                "text_generation": 50
            },
            UserRole.PREMIUM: {
                "daily_tasks": 100,
                "monthly_storage_mb": 1000,
                "concurrent_tasks": 5,
                "video_generation": 20,
                "audio_generation": 50,
                "image_generation": 100,
                "code_generation": 200,
                "text_generation": 500
            },
            UserRole.ADMIN: {
                "daily_tasks": -1,  # Unlimited
                "monthly_storage_mb": -1,
                "concurrent_tasks": -1,
                "video_generation": -1,
                "audio_generation": -1,
                "image_generation": -1,
                "code_generation": -1,
                "text_generation": -1
            }
        }
    
    async def create_user(
        self, 
        username: str, 
        email: str, 
        password: str, 
        role: UserRole = UserRole.USER
    ) -> User:
        """Create a new user"""
        # Check if user already exists
        if await self.get_user_by_email(email):
            raise ValueError(f"User with email {email} already exists")
        
        if await self.get_user_by_username(username):
            raise ValueError(f"User with username {username} already exists")
        
        # Generate user ID
        user_id = self._generate_user_id(username, email)
        
        # Hash password
        password_hash = self._hash_password(password)
        
        # Generate API key
        api_key = self._generate_api_key()
        
        # Set default quotas
        quota_limits = self.default_quotas[role].copy()
        quota_used = {key: 0 for key in quota_limits.keys()}
        
        user = User(
            user_id=user_id,
            username=username,
            email=email,
            password_hash=password_hash,
            role=role,
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            api_key=api_key,
            quota_limits=quota_limits,
            quota_used=quota_used,
            metadata={}
        )
        
        self.users[user_id] = user
        
        logger.info(f"Created user {username} ({user_id}) with role {role.value}")
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        
        if user.status != UserStatus.ACTIVE:
            raise ValueError("User account is not active")
        
        if not self._verify_password(password, user.password_hash):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        
        logger.info(f"User {user.username} authenticated successfully")
        return user
    
    async def authenticate_api_key(self, api_key: str) -> Optional[User]:
        """Authenticate user with API key"""
        for user in self.users.values():
            if user.api_key == api_key and user.status == UserStatus.ACTIVE:
                return user
        return None
    
    async def create_session(self, user_id: str, ip_address: str = None, user_agent: str = None) -> UserSession:
        """Create a new user session"""
        user = await self.get_user(user_id)
        if not user:
            raise ValueError("User not found")
        
        session_id = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=self.session_duration_hours)
        
        session = UserSession(
            session_id=session_id,
            user_id=user_id,
            created_at=datetime.utcnow(),
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
            is_active=True
        )
        
        self.sessions[session_id] = session
        
        logger.info(f"Created session {session_id} for user {user_id}")
        return session
    
    async def get_session(self, session_id: str) -> Optional[UserSession]:
        """Get session by ID"""
        session = self.sessions.get(session_id)
        if not session:
            return None
        
        # Check if session is expired
        if datetime.utcnow() > session.expires_at:
            await self.invalidate_session(session_id)
            return None
        
        return session
    
    async def invalidate_session(self, session_id: str) -> bool:
        """Invalidate a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Invalidated session {session_id}")
            return True
        return False
    
    async def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.users.get(user_id)
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        for user in self.users.values():
            if user.email.lower() == email.lower():
                return user
        return None
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        for user in self.users.values():
            if user.username.lower() == username.lower():
                return user
        return None
    
    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user information"""
        user = await self.get_user(user_id)
        if not user:
            return False
        
        # Update allowed fields
        allowed_fields = ['username', 'email', 'role', 'status', 'quota_limits', 'metadata']
        
        for field, value in updates.items():
            if field in allowed_fields:
                if field == 'role' and isinstance(value, str):
                    value = UserRole(value)
                elif field == 'status' and isinstance(value, str):
                    value = UserStatus(value)
                
                setattr(user, field, value)
        
        logger.info(f"Updated user {user_id}")
        return True
    
    async def change_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        """Change user password"""
        user = await self.get_user(user_id)
        if not user:
            return False
        
        if not self._verify_password(old_password, user.password_hash):
            return False
        
        user.password_hash = self._hash_password(new_password)
        logger.info(f"Password changed for user {user_id}")
        return True
    
    async def reset_api_key(self, user_id: str) -> str:
        """Reset user API key"""
        user = await self.get_user(user_id)
        if not user:
            raise ValueError("User not found")
        
        new_api_key = self._generate_api_key()
        user.api_key = new_api_key
        
        logger.info(f"API key reset for user {user_id}")
        return new_api_key
    
    async def check_quota(self, user_id: str, quota_type: str, amount: int = 1) -> bool:
        """Check if user has quota available"""
        user = await self.get_user(user_id)
        if not user:
            return False
        
        limit = user.quota_limits.get(quota_type, 0)
        used = user.quota_used.get(quota_type, 0)
        
        # -1 means unlimited
        if limit == -1:
            return True
        
        return (used + amount) <= limit
    
    async def consume_quota(self, user_id: str, quota_type: str, amount: int = 1) -> bool:
        """Consume user quota"""
        if not await self.check_quota(user_id, quota_type, amount):
            return False
        
        user = await self.get_user(user_id)
        if not user:
            return False
        
        user.quota_used[quota_type] = user.quota_used.get(quota_type, 0) + amount
        
        logger.debug(f"Consumed {amount} {quota_type} quota for user {user_id}")
        return True
    
    async def reset_daily_quotas(self):
        """Reset daily quotas for all users (should be called daily)"""
        daily_quotas = ['daily_tasks']
        
        for user in self.users.values():
            for quota_type in daily_quotas:
                if quota_type in user.quota_used:
                    user.quota_used[quota_type] = 0
        
        logger.info("Reset daily quotas for all users")
    
    async def reset_monthly_quotas(self):
        """Reset monthly quotas for all users (should be called monthly)"""
        monthly_quotas = ['monthly_storage_mb']
        
        for user in self.users.values():
            for quota_type in monthly_quotas:
                if quota_type in user.quota_used:
                    user.quota_used[quota_type] = 0
        
        logger.info("Reset monthly quotas for all users")
    
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics"""
        user = await self.get_user(user_id)
        if not user:
            return {}
        
        # Count user's active sessions
        active_sessions = sum(1 for session in self.sessions.values() 
                            if session.user_id == user_id and 
                               session.is_active and 
                               datetime.utcnow() <= session.expires_at)
        
        return {
            "user_id": user_id,
            "role": user.role.value,
            "status": user.status.value,
            "created_at": user.created_at.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "quota_limits": user.quota_limits,
            "quota_used": user.quota_used,
            "active_sessions": active_sessions
        }
    
    def generate_jwt_token(self, user_id: str) -> str:
        """Generate JWT token for user"""
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.jwt_secret, algorithm='HS256')
    
    def verify_jwt_token(self, token: str) -> Optional[str]:
        """Verify JWT token and return user ID"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            return payload.get('user_id')
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def _generate_user_id(self, username: str, email: str) -> str:
        """Generate unique user ID"""
        import uuid
        data = f"{username}_{email}_{datetime.utcnow().isoformat()}_{uuid.uuid4()}"
        return hashlib.md5(data.encode()).hexdigest()[:12]
    
    def _hash_password(self, password: str) -> str:
        """Hash password with salt"""
        salt = secrets.token_hex(16)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return f"{salt}:{pwd_hash.hex()}"
    
    def _verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            salt, stored_hash = password_hash.split(':')
            pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return pwd_hash.hex() == stored_hash
        except Exception:
            return False
    
    def _generate_api_key(self) -> str:
        """Generate API key"""
        return f"aistudio_{secrets.token_urlsafe(32)}"

# Global user manager instance
user_manager = UserManager()