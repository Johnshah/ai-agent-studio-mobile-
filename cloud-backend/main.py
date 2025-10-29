"""
AI Agent Studio Cloud - Main FastAPI Server
Lightweight cloud backend for mobile app with Hugging Face integration
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, UploadFile, File, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import asyncio
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import os
import logging

# Import cloud services
from services.huggingface_connector import HuggingFaceConnector
from services.task_manager import TaskManager, TaskType
from services.result_storage import ResultStorage
from services.user_manager import UserManager
from services.security_manager import SecurityManager

# Initialize FastAPI app
app = FastAPI(
    title="AI Agent Studio Cloud",
    description="Cloud backend for AI Agent Studio mobile app",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
hf_connector = HuggingFaceConnector()
from services.task_manager import task_manager
from services.result_storage import result_storage
from services.user_manager import user_manager
from services.security_manager import security_manager

# Security
security = HTTPBearer()

# WebSocket connections
active_connections: Dict[str, WebSocket] = {}

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    user_id = user_manager.verify_jwt_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    user = await user_manager.get_user(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user_id

# Security middleware
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Security middleware for all requests"""
    # Get client IP
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    # Check security
    security_check = await security_manager.check_request_security(
        endpoint=str(request.url.path),
        ip=client_ip,
        user_agent=user_agent,
        request_data=dict(request.query_params) if request.method == "GET" else None
    )
    
    if not security_check["allowed"]:
        return JSONResponse(
            status_code=429 if "rate" in security_check["reason"] else 403,
            content={"detail": security_check["reason"]}
        )
    
    response = await call_next(request)
    return response

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "AI Agent Studio Cloud API",
        "version": "1.0.0",
        "status": "active",
        "features": [
            "Video Generation with Wan2.2 & Stable Diffusion",
            "Audio Generation with MusicGen & Bark",
            "Code Generation with Code Llama & DeepSeek",
            "Image Generation with SDXL & GFPGAN",
            "Real-time progress tracking",
            "Cloud storage & sharing"
        ],
        "endpoints": {
            "video": "/api/v1/generate/video",
            "audio": "/api/v1/generate/audio",
            "code": "/api/v1/generate/code", 
            "image": "/api/v1/generate/image",
            "status": "/api/v1/status/{task_id}"
        }
    }

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    try:
        task_stats = await task_manager.get_queue_status()
        storage_stats = await result_storage.get_storage_stats()
        security_stats = await security_manager.get_security_stats()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "task_manager": task_stats,
                "storage": storage_stats,
                "security": security_stats,
                "huggingface": {"status": "connected"}
            }
        }
    except Exception as e:
        return {
            "status": "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@app.post("/api/v1/generate/video")
async def generate_video_cloud(
    prompt: str,
    model: str = "wan22",
    duration: int = 5,
    resolution: str = "1080p", 
    style: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    """Generate video using cloud AI models"""
    try:
        # Validate prompt
        validation = await security_manager.validate_prompt(prompt)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=f"Invalid prompt: {validation['threats']}")
        
        # Check quotas
        if not await user_manager.check_quota(user_id, "video_generation"):
            raise HTTPException(status_code=429, detail="Video generation quota exceeded")
        
        # Create generation task
        task_id = await task_manager.create_task(
            task_type=TaskType.VIDEO_GENERATION,
            user_id=user_id,
            prompt=validation.get("filtered_prompt", prompt),
            parameters={
                "model": model,
                "duration": duration,
                "resolution": resolution,
                "style": style
            }
        )
        
        # Consume quota
        await user_manager.consume_quota(user_id, "video_generation")
        await user_manager.consume_quota(user_id, "daily_tasks")
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": duration * 20,
            "progress_url": f"/api/v1/status/{task_id}",
            "websocket_url": f"/ws/{user_id}",
            "config": {
                "model": model,
                "duration": duration,
                "resolution": resolution,
                "style": style
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.post("/api/v1/generate/audio")
async def generate_audio_cloud(
    prompt: str,
    model: str = "musicgen",
    duration: int = 30,
    audio_type: str = "music",
    user_id: str = Depends(get_current_user)
):
    """Generate audio using cloud AI models"""
    try:
        # Validate prompt
        validation = await security_manager.validate_prompt(prompt)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=f"Invalid prompt: {validation['threats']}")
        
        # Check quotas
        if not await user_manager.check_quota(user_id, "audio_generation"):
            raise HTTPException(status_code=429, detail="Audio generation quota exceeded")
        
        task_id = await task_manager.create_task(
            task_type=TaskType.AUDIO_GENERATION,
            user_id=user_id,
            prompt=validation.get("filtered_prompt", prompt),
            parameters={
                "model": model,
                "duration": duration,
                "audio_type": audio_type
            }
        )
        
        # Consume quota
        await user_manager.consume_quota(user_id, "audio_generation")
        await user_manager.consume_quota(user_id, "daily_tasks")
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": duration * 2,
            "progress_url": f"/api/v1/status/{task_id}",
            "websocket_url": f"/ws/{user_id}",
            "config": {
                "model": model,
                "duration": duration,
                "audio_type": audio_type
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.post("/api/v1/generate/code")
async def generate_code_cloud(
    prompt: str,
    model: str = "code-llama",
    language: str = "python",
    framework: str = "react-native",
    user_id: str = Depends(get_current_user)
):
    """Generate code using cloud AI models"""
    try:
        # Validate prompt
        validation = await security_manager.validate_prompt(prompt)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=f"Invalid prompt: {validation['threats']}")
        
        # Check quotas
        if not await user_manager.check_quota(user_id, "code_generation"):
            raise HTTPException(status_code=429, detail="Code generation quota exceeded")
        
        task_id = await task_manager.create_task(
            task_type=TaskType.CODE_GENERATION,
            user_id=user_id,
            prompt=validation.get("filtered_prompt", prompt),
            parameters={
                "model": model,
                "language": language,
                "framework": framework
            }
        )
        
        # Consume quota
        await user_manager.consume_quota(user_id, "code_generation")
        await user_manager.consume_quota(user_id, "daily_tasks")
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": 180,
            "progress_url": f"/api/v1/status/{task_id}",
            "websocket_url": f"/ws/{user_id}",
            "config": {
                "model": model,
                "language": language,
                "framework": framework
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.post("/api/v1/generate/image")
async def generate_image_cloud(
    prompt: str,
    model: str = "stable-diffusion-xl",
    width: int = 1024,
    height: int = 1024,
    num_images: int = 1,
    style: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    """Generate images using cloud AI models"""
    try:
        # Validate prompt
        validation = await security_manager.validate_prompt(prompt)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=f"Invalid prompt: {validation['threats']}")
        
        # Check quotas
        if not await user_manager.check_quota(user_id, "image_generation", num_images):
            raise HTTPException(status_code=429, detail="Image generation quota exceeded")
        
        task_id = await task_manager.create_task(
            task_type=TaskType.IMAGE_GENERATION,
            user_id=user_id,
            prompt=validation.get("filtered_prompt", prompt),
            parameters={
                "model": model,
                "width": width,
                "height": height,
                "num_images": num_images,
                "style": style
            }
        )
        
        # Consume quota
        await user_manager.consume_quota(user_id, "image_generation", num_images)
        await user_manager.consume_quota(user_id, "daily_tasks")
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": 60 * num_images,
            "progress_url": f"/api/v1/status/{task_id}",
            "websocket_url": f"/ws/{user_id}", 
            "config": {
                "model": model,
                "width": width,
                "height": height,
                "num_images": num_images,
                "style": style
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.get("/api/v1/status/{task_id}")
async def get_task_status(task_id: str):
    """Get generation task status and progress"""
    try:
        task = await task_manager.get_task(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {
            "task_id": task_id,
            "status": task.status.value,
            "progress": task.progress,
            "type": task.type.value,
            "prompt": task.prompt,
            "result": task.result,
            "error": task.error,
            "created_at": task.created_at.isoformat(),
            "started_at": task.started_at.isoformat() if task.started_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "estimated_duration": task.estimated_duration
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@app.get("/api/v1/user/{user_id}/tasks")
async def get_user_tasks(
    user_id: str,
    limit: int = 50,
    current_user: str = Depends(get_current_user)
):
    """Get user's generation history"""
    try:
        # Verify user can access these tasks
        if user_id != current_user:
            raise HTTPException(status_code=403, detail="Access denied")
        
        tasks = await task_manager.get_user_tasks(user_id, limit)
        task_dicts = [task.to_dict() for task in tasks]
        
        return {
            "tasks": task_dicts,
            "total": len(task_dicts),
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tasks: {str(e)}")

@app.get("/api/v1/models")
async def get_available_models():
    """Get available AI models and their status"""
    return {
        "video": {
            "wan22": {"name": "Alibaba Animate Anything", "status": "available"},
            "stable-video": {"name": "Stable Video Diffusion", "status": "available"}
        },
        "audio": {
            "musicgen": {"name": "Facebook MusicGen", "status": "available"},
            "bark": {"name": "Suno Bark", "status": "available"}
        },
        "image": {
            "stable-diffusion-xl": {"name": "Stable Diffusion XL", "status": "available"},
            "dalle3": {"name": "DALL-E 3", "status": "available"}
        },
        "code": {
            "code-llama": {"name": "Code Llama", "status": "available"},
            "deepseek": {"name": "DeepSeek Coder", "status": "available"}
        }
    }

@app.post("/api/v1/upload")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    """Upload file for processing"""
    try:
        # Validate file
        validation = security_manager.input_validator.validate_file_upload(
            file.filename, file.content_type, file.size
        )
        
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=f"File validation failed: {validation['threats']}")
        
        # Read file data
        file_data = await file.read()
        
        # Store file
        stored_file = await result_storage.store_file(
            file_data=file_data,
            filename=file.filename,
            user_id=user_id,
            file_type="upload"
        )
        
        return {
            "success": True,
            "file_id": stored_file.file_id,
            "public_url": stored_file.public_url,
            "filename": stored_file.original_name,
            "size": stored_file.file_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user)
):
    """Delete a task and its results"""
    try:
        # Get task to verify ownership
        task = await task_manager.get_task(task_id)
        if not task or task.user_id != user_id:
            raise HTTPException(status_code=404, detail="Task not found or access denied")
        
        # Cancel task if it's still running
        success = await task_manager.cancel_task(task_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"success": True, "message": "Task deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

# Authentication endpoints
@app.post("/api/v1/auth/register")
async def register(
    username: str,
    email: str,
    password: str
):
    """Register new user"""
    try:
        user = await user_manager.create_user(username, email, password)
        token = user_manager.generate_jwt_token(user.user_id)
        
        return {
            "success": True,
            "user": user.to_dict(),
            "token": token
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/auth/login")
async def login(
    email: str,
    password: str,
    request: Request
):
    """Login user"""
    try:
        user = await user_manager.authenticate_user(email, password)
        if not user:
            await security_manager.record_failed_login(email, request.client.host)
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = user_manager.generate_jwt_token(user.user_id)
        
        return {
            "success": True,
            "user": user.to_dict(),
            "token": token
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/api/v1/user/profile")
async def get_user_profile(user_id: str = Depends(get_current_user)):
    """Get user profile and stats"""
    try:
        user_stats = await user_manager.get_user_stats(user_id)
        return user_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time updates
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time task updates"""
    await websocket.accept()
    active_connections[user_id] = websocket
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except:
        # Connection closed
        if user_id in active_connections:
            del active_connections[user_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 7860)),  # Hugging Face Spaces port
        reload=True if os.getenv("ENV") == "development" else False
    )