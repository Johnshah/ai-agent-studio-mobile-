"""
Advanced AI Routes - Extended AI Generation Endpoints
Includes: Image-to-Video, AI Avatars, Voice Cloning, 3D Generation, and more
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import Optional, Dict, Any
import logging

from services.advanced_ai_models import advanced_ai_models
from services.task_manager import task_manager, TaskType
from services.user_manager import user_manager
from services.security_manager import security_manager
from services.api_key_manager import api_key_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/advanced", tags=["Advanced AI"])

# IMAGE TO VIDEO GENERATION
@router.post("/generate/image-to-video")
async def generate_image_to_video(
    image_file: UploadFile = File(...),
    model: str = "stable-video-diffusion",
    duration: int = 3,
    fps: int = 24,
    motion_intensity: int = 127,
    user_id: str = Depends(lambda: "current-user")  # Replace with actual auth
):
    """
    Generate video from image
    
    Models:
    - stable-video-diffusion: Stability AI's image-to-video model
    - animatediff: AnimateDiff for character animation
    - wan22: Alibaba's Animate Anything
    - runway-gen2: Runway Gen-2
    """
    try:
        # Validate prompt
        validation = await security_manager.validate_prompt(f"Image to video: {image_file.filename}")
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=f"Invalid request: {validation['threats']}")
        
        # Check quotas
        if not await user_manager.check_quota(user_id, "video_generation"):
            raise HTTPException(status_code=429, detail="Video generation quota exceeded")
        
        # Create task
        task_id = await task_manager.create_task(
            task_type=TaskType.VIDEO_GENERATION,
            user_id=user_id,
            prompt=f"Image-to-video using {model}",
            parameters={
                "model": model,
                "image_file": image_file.filename,
                "duration": duration,
                "fps": fps,
                "motion_intensity": motion_intensity,
                "type": "image-to-video"
            }
        )
        
        # Consume quota
        await user_manager.consume_quota(user_id, "video_generation")
        await user_manager.consume_quota(user_id, "daily_tasks")
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": 120,
            "model": model,
            "message": "Image-to-video generation started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI AVATAR GENERATION
@router.post("/generate/talking-avatar")
async def generate_talking_avatar(
    image_file: UploadFile = File(...),
    audio_file: UploadFile = File(...),
    model: str = "sadtalker",
    user_id: str = Depends(lambda: "current-user")
):
    """
    Generate talking avatar from image and audio
    
    Models:
    - sadtalker: SadTalker for realistic talking heads
    - wav2lip: Wav2Lip for lip-sync
    - live-portrait: LivePortrait for expression transfer
    - facefusion: FaceFusion for face swapping
    """
    try:
        # Check quotas
        if not await user_manager.check_quota(user_id, "video_generation"):
            raise HTTPException(status_code=429, detail="Avatar generation quota exceeded")
        
        task_id = await task_manager.create_task(
            task_type=TaskType.VIDEO_GENERATION,
            user_id=user_id,
            prompt=f"Talking avatar using {model}",
            parameters={
                "model": model,
                "image_file": image_file.filename,
                "audio_file": audio_file.filename,
                "type": "talking-avatar"
            }
        )
        
        await user_manager.consume_quota(user_id, "video_generation")
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": 180,
            "model": model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# VOICE CLONING
@router.post("/generate/voice-clone")
async def clone_voice(
    reference_audio: UploadFile = File(...),
    text: str = "",
    model: str = "coqui-tts",
    language: str = "en",
    user_id: str = Depends(lambda: "current-user")
):
    """
    Clone voice from reference audio
    
    Models:
    - coqui-tts: Coqui TTS for voice cloning
    - bark: Bark for text-to-speech with voice cloning
    - tortoise-tts: Tortoise TTS for high-quality voice cloning
    - rvc: RVC for voice conversion
    """
    try:
        if not await user_manager.check_quota(user_id, "audio_generation"):
            raise HTTPException(status_code=429, detail="Voice cloning quota exceeded")
        
        task_id = await task_manager.create_task(
            task_type=TaskType.AUDIO_GENERATION,
            user_id=user_id,
            prompt=text,
            parameters={
                "model": model,
                "reference_audio": reference_audio.filename,
                "text": text,
                "language": language,
                "type": "voice-clone"
            }
        )
        
        await user_manager.consume_quota(user_id, "audio_generation")
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": 60,
            "model": model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3D MODEL GENERATION
@router.post("/generate/3d-model")
async def generate_3d_model(
    prompt: str,
    model: str = "shap-e",
    user_id: str = Depends(lambda: "current-user")
):
    """
    Generate 3D model from text or image
    
    Models:
    - shap-e: OpenAI Shap-E for 3D generation
    - point-e: OpenAI Point-E for point cloud generation
    """
    try:
        validation = await security_manager.validate_prompt(prompt)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=f"Invalid prompt: {validation['threats']}")
        
        task_id = await task_manager.create_task(
            task_type=TaskType.IMAGE_GENERATION,  # Reuse image type for 3D
            user_id=user_id,
            prompt=prompt,
            parameters={
                "model": model,
                "type": "3d-generation"
            }
        )
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": 120,
            "model": model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# IMAGE UPSCALING
@router.post("/enhance/upscale")
async def upscale_image(
    image_file: UploadFile = File(...),
    scale: int = 4,
    model: str = "real-esrgan",
    user_id: str = Depends(lambda: "current-user")
):
    """
    Upscale and enhance image
    
    Models:
    - real-esrgan: Real-ESRGAN for image upscaling
    - gfpgan: GFPGAN for face restoration
    """
    try:
        if not await user_manager.check_quota(user_id, "image_generation"):
            raise HTTPException(status_code=429, detail="Image enhancement quota exceeded")
        
        task_id = await task_manager.create_task(
            task_type=TaskType.IMAGE_GENERATION,
            user_id=user_id,
            prompt=f"Upscale image {scale}x",
            parameters={
                "model": model,
                "image_file": image_file.filename,
                "scale": scale,
                "type": "upscaling"
            }
        )
        
        await user_manager.consume_quota(user_id, "image_generation")
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": 30,
            "model": model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# BACKGROUND REMOVAL
@router.post("/enhance/remove-background")
async def remove_background(
    image_file: UploadFile = File(...),
    model: str = "rembg",
    user_id: str = Depends(lambda: "current-user")
):
    """
    Remove background from image
    
    Models:
    - rembg: RemBG for background removal
    """
    try:
        task_id = await task_manager.create_task(
            task_type=TaskType.IMAGE_GENERATION,
            user_id=user_id,
            prompt="Remove background",
            parameters={
                "model": model,
                "image_file": image_file.filename,
                "type": "background-removal"
            }
        )
        
        return {
            "success": True,
            "task_id": task_id,
            "status": "queued",
            "estimated_time": 15,
            "model": model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GET AVAILABLE MODELS
@router.get("/models/list")
async def list_advanced_models(feature: Optional[str] = None):
    """Get list of available AI models, optionally filtered by feature"""
    try:
        models = advanced_ai_models.get_available_models(feature)
        return {
            "success": True,
            "models": models,
            "total": len(models),
            "filter": feature
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GET MODEL INFO
@router.get("/models/{model_id}")
async def get_model_info(model_id: str):
    """Get detailed information about a specific model"""
    try:
        info = advanced_ai_models.get_model_info(model_id)
        if not info:
            raise HTTPException(status_code=404, detail="Model not found")
        
        return {
            "success": True,
            "model": info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API KEY MANAGEMENT ENDPOINTS
@router.post("/api-keys/set")
async def set_api_key(
    service: str,
    api_key: str,
    user_id: str = Depends(lambda: "current-user")
):
    """Set API key for a service"""
    try:
        # Validate API key format
        if not await api_key_manager.validate_api_key(service, api_key):
            raise HTTPException(status_code=400, detail="Invalid API key format")
        
        success = await api_key_manager.set_api_key(user_id, service, api_key)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to set API key")
        
        return {
            "success": True,
            "message": f"API key set for {service}",
            "service": service
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api-keys/list")
async def list_user_api_keys(user_id: str = Depends(lambda: "current-user")):
    """Get list of services user has API keys for"""
    try:
        services = await api_key_manager.get_user_services(user_id)
        supported = api_key_manager.get_supported_services()
        
        return {
            "success": True,
            "configured_services": services,
            "supported_services": supported
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api-keys/{service}")
async def delete_api_key(
    service: str,
    user_id: str = Depends(lambda: "current-user")
):
    """Delete API key for a service"""
    try:
        success = await api_key_manager.delete_api_key(user_id, service)
        
        if not success:
            raise HTTPException(status_code=404, detail="API key not found")
        
        return {
            "success": True,
            "message": f"API key deleted for {service}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api-keys/services")
async def get_supported_services():
    """Get list of all supported AI services"""
    try:
        services = api_key_manager.get_supported_services()
        return {
            "success": True,
            "services": services
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))