"""
Result Storage Service for AI Agent Studio Cloud Backend
Handles file storage, cloud storage integration, and result management
"""

import os
import aiofiles
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, BinaryIO
from dataclasses import dataclass, asdict
import hashlib
import mimetypes
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

@dataclass
class StoredFile:
    file_id: str
    original_name: str
    stored_path: str
    public_url: Optional[str]
    file_size: int
    mime_type: str
    checksum: str
    user_id: str
    task_id: Optional[str]
    created_at: datetime
    expires_at: Optional[datetime] = None
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        # Convert datetime objects to ISO strings
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat() if value else None
        return data

class ResultStorage:
    def __init__(self, base_path: str = "/tmp/ai_studio_storage"):
        self.base_path = base_path
        self.files: Dict[str, StoredFile] = {}
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        self.default_expiry_days = 30
        
        # Cloud storage configurations (optional)
        self.cloud_storage_enabled = False
        self.cloud_provider = None  # 'aws', 'gcp', 'azure'
        self.cloud_bucket = None
        
        # Create storage directories
        self._create_directories()
    
    def _create_directories(self):
        """Create necessary storage directories"""
        directories = [
            self.base_path,
            os.path.join(self.base_path, "videos"),
            os.path.join(self.base_path, "audio"),
            os.path.join(self.base_path, "images"),
            os.path.join(self.base_path, "code"),
            os.path.join(self.base_path, "text"),
            os.path.join(self.base_path, "temp"),
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
    
    async def store_file(
        self, 
        file_data: bytes, 
        filename: str, 
        user_id: str,
        task_id: Optional[str] = None,
        file_type: str = "general",
        expiry_days: Optional[int] = None,
        metadata: Dict[str, Any] = None
    ) -> StoredFile:
        """Store a file and return storage information"""
        
        # Validate file size
        if len(file_data) > self.max_file_size:
            raise ValueError(f"File size {len(file_data)} exceeds maximum {self.max_file_size}")
        
        # Generate unique file ID
        file_id = self._generate_file_id(filename, user_id)
        
        # Determine storage path
        storage_subdir = self._get_storage_subdir(file_type)
        file_extension = os.path.splitext(filename)[1]
        stored_filename = f"{file_id}{file_extension}"
        stored_path = os.path.join(self.base_path, storage_subdir, stored_filename)
        
        # Calculate checksum
        checksum = hashlib.md5(file_data).hexdigest()
        
        # Determine MIME type
        mime_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        
        # Calculate expiry
        expiry_date = None
        if expiry_days is not None:
            expiry_date = datetime.utcnow() + timedelta(days=expiry_days)
        elif self.default_expiry_days:
            expiry_date = datetime.utcnow() + timedelta(days=self.default_expiry_days)
        
        try:
            # Store file locally
            async with aiofiles.open(stored_path, 'wb') as f:
                await f.write(file_data)
            
            # Generate public URL (for now, just a local path reference)
            public_url = self._generate_public_url(storage_subdir, stored_filename)
            
            # Store in cloud if enabled
            if self.cloud_storage_enabled:
                try:
                    public_url = await self._store_in_cloud(file_data, stored_filename, mime_type)
                except Exception as e:
                    logger.warning(f"Failed to store file in cloud: {e}")
            
            # Create stored file record
            stored_file = StoredFile(
                file_id=file_id,
                original_name=filename,
                stored_path=stored_path,
                public_url=public_url,
                file_size=len(file_data),
                mime_type=mime_type,
                checksum=checksum,
                user_id=user_id,
                task_id=task_id,
                created_at=datetime.utcnow(),
                expires_at=expiry_date,
                metadata=metadata or {}
            )
            
            self.files[file_id] = stored_file
            
            logger.info(f"Stored file {filename} as {file_id} for user {user_id}")
            return stored_file
            
        except Exception as e:
            # Clean up on failure
            if os.path.exists(stored_path):
                try:
                    os.remove(stored_path)
                except:
                    pass
            raise e
    
    async def get_file(self, file_id: str) -> Optional[StoredFile]:
        """Get file information by ID"""
        return self.files.get(file_id)
    
    async def get_file_data(self, file_id: str) -> Optional[bytes]:
        """Get actual file data by ID"""
        stored_file = self.files.get(file_id)
        if not stored_file:
            return None
        
        # Check if file exists
        if not os.path.exists(stored_file.stored_path):
            logger.warning(f"File {file_id} not found at {stored_file.stored_path}")
            return None
        
        # Check if file is expired
        if stored_file.expires_at and datetime.utcnow() > stored_file.expires_at:
            logger.info(f"File {file_id} has expired")
            await self.delete_file(file_id)
            return None
        
        try:
            async with aiofiles.open(stored_file.stored_path, 'rb') as f:
                return await f.read()
        except Exception as e:
            logger.error(f"Error reading file {file_id}: {e}")
            return None
    
    async def delete_file(self, file_id: str) -> bool:
        """Delete a file"""
        stored_file = self.files.get(file_id)
        if not stored_file:
            return False
        
        try:
            # Remove local file
            if os.path.exists(stored_file.stored_path):
                os.remove(stored_file.stored_path)
            
            # Remove from cloud if enabled
            if self.cloud_storage_enabled and stored_file.public_url:
                await self._delete_from_cloud(stored_file.public_url)
            
            # Remove from records
            del self.files[file_id]
            
            logger.info(f"Deleted file {file_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting file {file_id}: {e}")
            return False
    
    async def get_user_files(self, user_id: str, limit: int = 100) -> List[StoredFile]:
        """Get all files for a user"""
        user_files = [
            stored_file for stored_file in self.files.values()
            if stored_file.user_id == user_id
        ]
        
        # Sort by creation time, newest first
        user_files.sort(key=lambda x: x.created_at, reverse=True)
        return user_files[:limit]
    
    async def get_task_files(self, task_id: str) -> List[StoredFile]:
        """Get all files for a specific task"""
        return [
            stored_file for stored_file in self.files.values()
            if stored_file.task_id == task_id
        ]
    
    async def cleanup_expired_files(self) -> int:
        """Clean up expired files"""
        now = datetime.utcnow()
        expired_files = []
        
        for file_id, stored_file in self.files.items():
            if stored_file.expires_at and now > stored_file.expires_at:
                expired_files.append(file_id)
        
        deleted_count = 0
        for file_id in expired_files:
            if await self.delete_file(file_id):
                deleted_count += 1
        
        logger.info(f"Cleaned up {deleted_count} expired files")
        return deleted_count
    
    async def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        total_files = len(self.files)
        total_size = sum(f.file_size for f in self.files.values())
        
        # Count by type
        type_counts = {}
        type_sizes = {}
        
        for stored_file in self.files.values():
            file_type = self._get_file_type_from_mime(stored_file.mime_type)
            type_counts[file_type] = type_counts.get(file_type, 0) + 1
            type_sizes[file_type] = type_sizes.get(file_type, 0) + stored_file.file_size
        
        # Calculate available space (simplified)
        import shutil
        disk_usage = shutil.disk_usage(self.base_path)
        available_space = disk_usage.free
        
        return {
            "total_files": total_files,
            "total_size": total_size,
            "available_space": available_space,
            "files_by_type": type_counts,
            "size_by_type": type_sizes,
            "cloud_enabled": self.cloud_storage_enabled,
            "max_file_size": self.max_file_size
        }
    
    def _generate_file_id(self, filename: str, user_id: str) -> str:
        """Generate a unique file ID"""
        import uuid
        timestamp = datetime.utcnow().isoformat()
        data = f"{filename}_{user_id}_{timestamp}_{uuid.uuid4()}"
        return hashlib.md5(data.encode()).hexdigest()[:16]
    
    def _get_storage_subdir(self, file_type: str) -> str:
        """Get storage subdirectory based on file type"""
        type_mapping = {
            "video": "videos",
            "audio": "audio", 
            "image": "images",
            "code": "code",
            "text": "text",
        }
        return type_mapping.get(file_type, "temp")
    
    def _get_file_type_from_mime(self, mime_type: str) -> str:
        """Determine file type from MIME type"""
        if mime_type.startswith("video/"):
            return "video"
        elif mime_type.startswith("audio/"):
            return "audio"
        elif mime_type.startswith("image/"):
            return "image"
        elif mime_type.startswith("text/"):
            return "text"
        else:
            return "other"
    
    def _generate_public_url(self, subdir: str, filename: str) -> str:
        """Generate public URL for file access"""
        # For now, return a simple path-based URL
        # In production, this would be a proper HTTP URL
        return f"/storage/{subdir}/{filename}"
    
    async def _store_in_cloud(self, file_data: bytes, filename: str, mime_type: str) -> str:
        """Store file in cloud storage (placeholder implementation)"""
        # This would implement actual cloud storage (AWS S3, Google Cloud, Azure, etc.)
        # For now, just return a mock URL
        logger.info(f"Would store {filename} in cloud storage")
        return f"https://cloud-storage.example.com/{filename}"
    
    async def _delete_from_cloud(self, public_url: str) -> bool:
        """Delete file from cloud storage (placeholder implementation)"""
        # This would implement actual cloud deletion
        logger.info(f"Would delete {public_url} from cloud storage")
        return True
    
    # Cloud Storage Configuration Methods
    def configure_aws_storage(self, bucket_name: str, region: str = "us-east-1"):
        """Configure AWS S3 storage"""
        self.cloud_storage_enabled = True
        self.cloud_provider = "aws"
        self.cloud_bucket = bucket_name
        logger.info(f"Configured AWS S3 storage: {bucket_name}")
    
    def configure_gcp_storage(self, bucket_name: str):
        """Configure Google Cloud Storage"""
        self.cloud_storage_enabled = True
        self.cloud_provider = "gcp"
        self.cloud_bucket = bucket_name
        logger.info(f"Configured GCP storage: {bucket_name}")
    
    def configure_azure_storage(self, container_name: str):
        """Configure Azure Blob Storage"""
        self.cloud_storage_enabled = True
        self.cloud_provider = "azure"
        self.cloud_bucket = container_name
        logger.info(f"Configured Azure storage: {container_name}")

# Global storage instance
result_storage = ResultStorage()