from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime
import json

# Import our AI model services
from .models.video_generation import VideoGenerationService
from .models.audio_generation import AudioGenerationService
from .models.code_generation import CodeGenerationService  
from .models.image_generation import ImageGenerationService
from .services.social_media import SocialMediaService
from .services.project_manager import ProjectManager
from .utils.config import settings
from .core.database import init_db
from .api import video, audio, code, image, projects, social

# Initialize FastAPI app
app = FastAPI(
    title="AI Agent Studio API",
    description="Complete AI-Powered Creative Suite API with video, music, code, and image generation",
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

# Static files for serving generated content
os.makedirs("static/generated", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize services
video_service = VideoGenerationService()
audio_service = AudioGenerationService()
code_service = CodeGenerationService()
image_service = ImageGenerationService()
social_service = SocialMediaService()
project_manager = ProjectManager()

# Include API routers
app.include_router(video.router, prefix="/api/v1/video", tags=["Video Generation"])
app.include_router(audio.router, prefix="/api/v1/audio", tags=["Audio Generation"])
app.include_router(code.router, prefix="/api/v1/code", tags=["Code Generation"])
app.include_router(image.router, prefix="/api/v1/image", tags=["Image Generation"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(social.router, prefix="/api/v1/social", tags=["Social Media"])

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await init_db()
    print("🚀 AI Agent Studio API started successfully!")
    print(f"📊 Available AI Models:")
    print(f"   🎥 Video: Wan2.2, Stable Video Diffusion, ModelScope")
    print(f"   🎵 Audio: MusicGen, Bark, Jukebox, Coqui TTS")
    print(f"   💻 Code: Code Llama, DeepSeek-Coder, StarCoder 2")
    print(f"   🎨 Image: Stable Diffusion XL, GFPGAN, Real-ESRGAN")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Agent Studio API",
        "version": "1.0.0",
        "description": "Complete AI-Powered Creative Suite",
        "features": [
            "High-quality video generation with Wan2.2 and Stable Diffusion",
            "Music and audio generation with MusicGen and Bark",
            "Full-stack app development with Code Llama and DeepSeek",
            "Professional image generation and editing",
            "Social media integration and direct upload",
            "Real-time project management and collaboration"
        ],
        "endpoints": {
            "video": "/api/v1/video",
            "audio": "/api/v1/audio", 
            "code": "/api/v1/code",
            "image": "/api/v1/image",
            "projects": "/api/v1/projects",
            "social": "/api/v1/social"
        },
        "docs": "/docs",
        "status": "active"
    }

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "video_generation": await video_service.health_check(),
            "audio_generation": await audio_service.health_check(),
            "code_generation": await code_service.health_check(),
            "image_generation": await image_service.health_check(),
            "social_media": await social_service.health_check()
        }
    }

@app.get("/api/v1/models")
async def get_available_models():
    """Get all available AI models and their status"""
    return {
        "video_models": [
            {
                "id": "wan22",
                "name": "Wan2.2",
                "type": "video",
                "provider": "ModelScope",
                "github_url": "https://github.com/modelscope/modelscope",
                "description": "High-quality video generation model optimized for mobile devices",
                "status": "active",
                "capabilities": ["text-to-video", "image-to-video", "style-transfer"]
            },
            {
                "id": "stable-video-diffusion",
                "name": "Stable Video Diffusion",
                "type": "video",
                "provider": "Stability AI",
                "github_url": "https://github.com/Stability-AI/generative-models",
                "description": "Advanced video generation with stable diffusion technology",
                "status": "active",
                "capabilities": ["text-to-video", "image-to-video", "video-editing"]
            }
        ],
        "audio_models": [
            {
                "id": "musicgen",
                "name": "MusicGen",
                "type": "audio",
                "provider": "Meta",
                "github_url": "https://github.com/facebookresearch/audiocraft",
                "description": "AI music generation model",
                "status": "active",
                "capabilities": ["text-to-music", "melody-conditioning", "genre-control"]
            },
            {
                "id": "bark",
                "name": "Bark",
                "type": "audio",
                "provider": "Suno AI",
                "github_url": "https://github.com/suno-ai/bark",
                "description": "Text-to-speech and audio generation",
                "status": "active",
                "capabilities": ["text-to-speech", "voice-cloning", "sound-effects"]
            },
            {
                "id": "jukebox",
                "name": "Jukebox",
                "type": "audio",
                "provider": "OpenAI",
                "github_url": "https://github.com/openai/jukebox",
                "description": "Neural net that generates music",
                "status": "active",
                "capabilities": ["music-generation", "artist-style", "genre-control"]
            }
        ],
        "code_models": [
            {
                "id": "code-llama",
                "name": "Code Llama 3",
                "type": "code",
                "provider": "Meta",
                "github_url": "https://github.com/facebookresearch/codellama",
                "description": "Advanced code generation model",
                "status": "active",
                "capabilities": ["code-generation", "code-completion", "debugging"]
            },
            {
                "id": "deepseek-coder",
                "name": "DeepSeek-Coder",
                "type": "code", 
                "provider": "DeepSeek",
                "github_url": "https://github.com/deepseek-ai/DeepSeek-Coder",
                "description": "Specialized coding AI model",
                "status": "active",
                "capabilities": ["full-stack-development", "mobile-apps", "web-apps"]
            },
            {
                "id": "starcoder2",
                "name": "StarCoder 2",
                "type": "code",
                "provider": "BigCode",
                "github_url": "https://github.com/bigcode-project/starcoder2",
                "description": "Next-generation code generation model",
                "status": "active",
                "capabilities": ["multi-language", "code-translation", "optimization"]
            }
        ],
        "image_models": [
            {
                "id": "stable-diffusion-xl",
                "name": "Stable Diffusion XL",
                "type": "image",
                "provider": "Stability AI",
                "github_url": "https://github.com/Stability-AI/generative-models",
                "description": "High-quality image generation",
                "status": "active",
                "capabilities": ["text-to-image", "image-to-image", "inpainting"]
            },
            {
                "id": "gfpgan",
                "name": "GFPGAN",
                "type": "image",
                "provider": "TencentARC",
                "github_url": "https://github.com/TencentARC/GFPGAN",
                "description": "Face restoration and enhancement",
                "status": "active",
                "capabilities": ["face-restoration", "enhancement", "upscaling"]
            }
        ]
    }

@app.post("/api/v1/models/add")
async def add_custom_model(
    name: str = Form(...),
    model_type: str = Form(...),
    github_url: str = Form(...),
    api_key: Optional[str] = Form(None),
    description: Optional[str] = Form(None)
):
    """Add a new AI model from GitHub repository"""
    try:
        # Validate GitHub URL
        if not github_url.startswith("https://github.com/"):
            raise HTTPException(status_code=400, detail="Invalid GitHub URL")
        
        # Create new model entry
        new_model = {
            "id": name.lower().replace(" ", "-"),
            "name": name,
            "type": model_type,
            "github_url": github_url,
            "api_key": api_key,
            "description": description or f"Custom {model_type} model",
            "status": "installing",
            "created_at": datetime.utcnow().isoformat()
        }
        
        # TODO: Implement actual model installation from GitHub
        # This would clone the repo and set up the model
        
        return {
            "success": True,
            "message": f"Model '{name}' added successfully",
            "model": new_model
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding model: {str(e)}")

@app.get("/api/v1/system/status")
async def get_system_status():
    """Get system performance and resource usage"""
    import psutil
    
    return {
        "cpu_usage": psutil.cpu_percent(),
        "memory_usage": psutil.virtual_memory().percent,
        "disk_usage": psutil.disk_usage('/').percent,
        "gpu_available": torch.cuda.is_available() if 'torch' in globals() else False,
        "active_projects": len(await project_manager.get_active_projects()),
        "total_projects": len(await project_manager.get_all_projects()),
        "uptime": "24/7 (Hugging Face Spaces)"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )