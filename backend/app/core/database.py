"""
Database initialization and management for AI Agent Studio
"""

import asyncio
import sqlite3
from pathlib import Path
from typing import Optional, Dict, Any
import json
from datetime import datetime

class DatabaseManager:
    """Simple database manager for AI Agent Studio"""
    
    def __init__(self, db_path: str = "./data/ai_agent_studio.db"):
        self.db_path = db_path
        self.connection: Optional[sqlite3.Connection] = None
    
    def connect(self):
        """Connect to the SQLite database"""
        try:
            # Ensure data directory exists
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
            
            self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row  # Enable dict-like access
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def create_tables(self):
        """Create necessary tables"""
        if not self.connection:
            return False
        
        try:
            cursor = self.connection.cursor()
            
            # Projects table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    status TEXT DEFAULT 'active',
                    config TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Generations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS generations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER,
                    type TEXT NOT NULL,
                    prompt TEXT,
                    config TEXT,
                    status TEXT DEFAULT 'pending',
                    result_path TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects (id)
                )
            """)
            
            # Models table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS models (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    provider TEXT,
                    config TEXT,
                    status TEXT DEFAULT 'available',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Users table (for future authentication)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE,
                    preferences TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            self.connection.commit()
            print("✅ Database tables created successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            return False
    
    def insert_default_models(self):
        """Insert default AI models"""
        if not self.connection:
            return False
        
        try:
            cursor = self.connection.cursor()
            
            default_models = [
                {
                    "name": "Wan2.2",
                    "type": "video",
                    "provider": "ModelScope",
                    "config": json.dumps({
                        "github_url": "https://github.com/modelscope/modelscope",
                        "capabilities": ["text-to-video", "image-to-video"]
                    })
                },
                {
                    "name": "Stable Video Diffusion",
                    "type": "video",
                    "provider": "Stability AI",
                    "config": json.dumps({
                        "github_url": "https://github.com/Stability-AI/generative-models",
                        "capabilities": ["text-to-video", "image-to-video"]
                    })
                },
                {
                    "name": "MusicGen",
                    "type": "audio",
                    "provider": "Meta",
                    "config": json.dumps({
                        "github_url": "https://github.com/facebookresearch/audiocraft",
                        "capabilities": ["text-to-music", "melody-conditioning"]
                    })
                },
                {
                    "name": "Code Llama 3",
                    "type": "code",
                    "provider": "Meta",
                    "config": json.dumps({
                        "github_url": "https://github.com/facebookresearch/codellama",
                        "capabilities": ["code-generation", "code-completion"]
                    })
                },
                {
                    "name": "Stable Diffusion XL",
                    "type": "image",
                    "provider": "Stability AI",
                    "config": json.dumps({
                        "github_url": "https://github.com/Stability-AI/generative-models",
                        "capabilities": ["text-to-image", "image-to-image"]
                    })
                }
            ]
            
            for model in default_models:
                cursor.execute("""
                    INSERT OR IGNORE INTO models (name, type, provider, config)
                    VALUES (?, ?, ?, ?)
                """, (model["name"], model["type"], model["provider"], model["config"]))
            
            self.connection.commit()
            print("✅ Default models inserted successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error inserting default models: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            self.connection = None

# Global database manager instance
db_manager = DatabaseManager()

async def init_db():
    """Initialize database asynchronously"""
    try:
        if db_manager.connect():
            if db_manager.create_tables():
                db_manager.insert_default_models()
                print("🗄️ Database initialized successfully")
            else:
                print("⚠️ Database tables creation failed")
        else:
            print("⚠️ Database connection failed")
    except Exception as e:
        print(f"❌ Database initialization error: {e}")

def get_db():
    """Get database connection"""
    if not db_manager.connection:
        db_manager.connect()
    return db_manager.connection