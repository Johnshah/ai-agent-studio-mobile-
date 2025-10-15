from fastapi import APIRouter, HTTPException, BackgroundTasks, Form, UploadFile, File, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import asyncio
import json
from datetime import datetime
import os
from pathlib import Path

# Import enhanced services
from ..models.enhanced_video_generation import EnhancedVideoGenerationService
from ..models.enhanced_audio_generation import EnhancedAudioGenerationService
from ..models.enhanced_app_generation import EnhancedAppGenerationService
from ..models.enhanced_image_generation import EnhancedImageGenerationService

router = APIRouter()

# Initialize enhanced services
video_service = EnhancedVideoGenerationService()
audio_service = EnhancedAudioGenerationService()
app_service = EnhancedAppGenerationService()
image_service = EnhancedImageGenerationService()

# ======================== VIDEO GENERATION ========================

class VideoGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Video description prompt")
    model: str = Field(default="wan2.2", description="AI model to use")
    style: str = Field(default="cinematic", description="Video style")
    duration: int = Field(default=30, ge=5, le=600, description="Duration in seconds")
    resolution: str = Field(default="1080p", description="Video resolution")
    fps: int = Field(default=30, ge=24, le=60, description="Frames per second")
    language: str = Field(default="en", description="Language code")

class VideoGenerationResponse(BaseModel):
    success: bool
    videoUrl: Optional[str] = None
    duration: Optional[int] = None
    resolution: Optional[str] = None
    model: Optional[str] = None
    task_id: Optional[str] = None
    error: Optional[str] = None

@router.post("/api/video/generate", response_model=VideoGenerationResponse)
async def generate_video(request: VideoGenerationRequest, background_tasks: BackgroundTasks):
    """Generate AI video using enhanced models (Wan2.2, Stable Video, etc.)"""
    try:
        result = await video_service.generate_video(
            prompt=request.prompt,
            model=request.model,
            style=request.style,
            duration=request.duration,
            resolution=request.resolution,
            fps=request.fps,
            language=request.language
        )
        return VideoGenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/video/models")
async def get_video_models():
    """Get all available video generation models"""
    models = await video_service.get_available_models()
    return {"models": models}

# ======================== AUDIO GENERATION ========================

class AudioGenerationRequest(BaseModel):
    type: str = Field(..., description="Audio type: music, voice, effects")
    prompt: str = Field(..., description="Audio description")
    model: str = Field(default="musicgen", description="AI model to use")
    duration: int = Field(default=30, ge=5, le=300, description="Duration in seconds")
    genre: Optional[str] = Field(None, description="Music genre")
    voice: Optional[str] = Field(None, description="Voice type for TTS")

class AudioGenerationResponse(BaseModel):
    success: bool
    audioUrl: Optional[str] = None
    duration: Optional[int] = None
    model: Optional[str] = None
    task_id: Optional[str] = None
    error: Optional[str] = None

@router.post("/api/audio/generate", response_model=AudioGenerationResponse)
async def generate_audio(request: AudioGenerationRequest):
    """Generate AI audio using enhanced models (MusicGen, Bark, Jukebox, etc.)"""
    try:
        result = await audio_service.generate_audio(
            audio_type=request.type,
            prompt=request.prompt,
            model=request.model,
            duration=request.duration,
            genre=request.genre,
            voice=request.voice
        )
        return AudioGenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/audio/clone-voice")
async def clone_voice(
    voice_samples: List[UploadFile] = File(...),
    voice_name: str = Form(...),
    model: str = Form("chatterbox")
):
    """Clone voice using uploaded samples"""
    try:
        result = await audio_service.clone_voice(voice_samples, voice_name, model)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/audio/models")
async def get_audio_models():
    """Get all available audio generation models"""
    models = await audio_service.get_available_models()
    return {"models": models}

# ======================== APP GENERATION ========================

class AppGenerationRequest(BaseModel):
    description: str = Field(..., description="App description")
    appType: str = Field(..., description="App type: android, ios, web, desktop")
    framework: str = Field(default="react-native", description="Development framework")
    features: List[str] = Field(default=[], description="Required features")
    designStyle: str = Field(default="modern", description="Design style")
    model: str = Field(default="code-llama-3", description="AI model to use")

class AppGenerationResponse(BaseModel):
    success: bool
    code: Optional[str] = None
    downloadUrl: Optional[str] = None
    previewUrl: Optional[str] = None
    framework: Optional[str] = None
    task_id: Optional[str] = None
    error: Optional[str] = None

@router.post("/api/app/generate", response_model=AppGenerationResponse)
async def generate_app(
    description: str = Form(...),
    appType: str = Form(...),
    framework: str = Form("react-native"),
    features: str = Form("[]"),
    designStyle: str = Form("modern"),
    model: str = Form("code-llama-3"),
    files: List[UploadFile] = File(default=[])
):
    """Generate complete application using AI coding models"""
    try:
        features_list = json.loads(features) if features else []
        
        result = await app_service.generate_app(
            description=description,
            app_type=appType,
            framework=framework,
            features=features_list,
            design_style=designStyle,
            model=model,
            uploaded_files=files
        )
        return AppGenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/app/build-apk")
async def build_apk(
    appCode: str = Form(...),
    appName: str = Form(...),
    framework: str = Form("react-native")
):
    """Build APK from generated app code"""
    try:
        result = await app_service.build_apk(appCode, appName, framework)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/app/models")
async def get_app_models():
    """Get all available app generation models"""
    models = await app_service.get_available_models()
    return {"models": models}

# ======================== IMAGE GENERATION ========================

class ImageGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Image description")
    style: str = Field(default="photorealistic", description="Image style")
    size: str = Field(default="1024x1024", description="Image size")
    model: str = Field(default="stable-diffusion", description="AI model to use")
    negative_prompt: Optional[str] = Field(None, description="Negative prompt")
    num_images: int = Field(default=1, ge=1, le=8, description="Number of images")

class ImageGenerationResponse(BaseModel):
    success: bool
    imageUrls: Optional[List[str]] = None
    model: Optional[str] = None
    task_id: Optional[str] = None
    error: Optional[str] = None

@router.post("/api/image/generate", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    """Generate AI images using enhanced models (Stable Diffusion, GFPGAN, etc.)"""
    try:
        result = await image_service.generate_image(
            prompt=request.prompt,
            style=request.style,
            size=request.size,
            model=request.model,
            negative_prompt=request.negative_prompt,
            num_images=request.num_images
        )
        return ImageGenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/image/enhance")
async def enhance_image(
    image: UploadFile = File(...),
    tool: str = Form(...),  # upscale, enhance, remove-bg, face-restore
    model: str = Form("gfpgan")
):
    """Enhance image using AI tools"""
    try:
        result = await image_service.enhance_image(image, tool, model)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/image/models")
async def get_image_models():
    """Get all available image generation models"""
    models = await image_service.get_available_models()
    return {"models": models}

# ======================== SOCIAL MEDIA INTEGRATION ========================

class SocialMediaUploadRequest(BaseModel):
    platforms: List[str] = Field(..., description="Social media platforms")
    fileUrl: str = Field(..., description="File URL to upload")
    metadata: Dict[str, Any] = Field(..., description="Upload metadata")

@router.post("/api/social/upload")
async def upload_to_social_media(request: SocialMediaUploadRequest):
    """Upload content to social media platforms"""
    try:
        # Simulate social media upload
        results = {}
        
        for platform in request.platforms:
            # In production, this would integrate with actual platform APIs
            results[platform] = {
                "success": True,
                "upload_id": f"{platform}_{datetime.now().timestamp()}",
                "url": f"https://{platform}.com/post/example",
                "status": "uploaded"
            }
        
        return {
            "success": True,
            "platforms": request.platforms,
            "results": results,
            "message": f"Uploaded to {len(request.platforms)} platform(s)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ======================== MODEL MANAGEMENT ========================

class AddModelRequest(BaseModel):
    name: str = Field(..., description="Model name")
    type: str = Field(..., description="Model type")
    githubUrl: str = Field(..., description="GitHub repository URL")
    apiKey: Optional[str] = Field(None, description="API key if required")
    description: Optional[str] = Field(None, description="Model description")

@router.post("/api/models/add")
async def add_custom_model(request: AddModelRequest):
    """Add custom AI model from GitHub repository"""
    try:
        # Route to appropriate service based on model type
        if request.type == "video":
            result = await video_service.add_custom_model(
                request.name, request.githubUrl, capabilities=["text-to-video"]
            )
        elif request.type == "audio":
            result = await audio_service.add_custom_model(
                request.name, request.githubUrl, capabilities=["audio-generation"]
            )
        elif request.type == "code":
            result = await app_service.add_custom_model(
                request.name, request.githubUrl, capabilities=["code-generation"]
            )
        elif request.type == "image":
            result = await image_service.add_custom_model(
                request.name, request.githubUrl, capabilities=["image-generation"]
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported model type")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/models")
async def get_all_models():
    """Get all available AI models across all categories"""
    try:
        video_models = await video_service.get_available_models()
        audio_models = await audio_service.get_available_models()
        app_models = await app_service.get_available_models()
        image_models = await image_service.get_available_models()
        
        return {
            "video": video_models,
            "audio": audio_models,
            "code": app_models,
            "image": image_models,
            "total_models": len(video_models) + len(audio_models) + len(app_models) + len(image_models)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/models/{model_id}/toggle")
async def toggle_model_status(model_id: str, enabled: bool):
    """Enable or disable a model"""
    try:
        # This would update the model status in the database
        return {
            "success": True,
            "model_id": model_id,
            "enabled": enabled,
            "message": f"Model {model_id} {'enabled' if enabled else 'disabled'}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ======================== SYSTEM STATUS ========================

@router.get("/api/system/status")
async def get_system_status():
    """Get comprehensive system status"""
    try:
        # Get service health checks
        video_health = await video_service.health_check()
        audio_health = await audio_service.health_check()
        app_health = await app_service.health_check()
        image_health = await image_service.health_check()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "video_generation": video_health,
                "audio_generation": audio_health,
                "app_generation": app_health,
                "image_generation": image_health
            },
            "total_models": (
                video_health.get("available_models", 0) +
                audio_health.get("available_models", 0) +
                app_health.get("available_models", 0) +
                image_health.get("available_models", 0)
            ),
            "version": "1.0.0",
            "environment": "production"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ======================== HEALTH CHECK ========================

@router.get("/api/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "AI Agent Studio API is running"
    }