from fastapi import APIRouter, HTTPException, BackgroundTasks, Form, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio

from ..models.video_generation import VideoGenerationService

router = APIRouter()

# Initialize service
video_service = VideoGenerationService()

# Pydantic models for request/response
class VideoGenerationRequest(BaseModel):
    prompt: str
    model_name: str = "wan22"
    duration: int = 30
    fps: int = 24
    resolution: str = "1080p"
    style: str = "cinematic"
    seed: Optional[int] = None
    additional_params: Optional[Dict[str, Any]] = None

class VideoGenerationResponse(BaseModel):
    success: bool
    video_path: Optional[str] = None
    video_url: Optional[str] = None
    duration: Optional[float] = None
    resolution: Optional[str] = None
    file_size: Optional[int] = None
    model_used: Optional[str] = None
    prompt: Optional[str] = None
    created_at: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None

@router.post("/generate", response_model=VideoGenerationResponse)
async def generate_video(request: VideoGenerationRequest, background_tasks: BackgroundTasks):
    """
    Generate AI video using Wan2.2, Stable Video Diffusion, or other models
    
    Supported models:
    - wan22: High-quality video generation optimized for mobile
    - stable_video: Stable Video Diffusion for advanced effects
    - deforum: Deforum Stable Diffusion for artistic videos
    """
    try:
        # Validate request parameters
        if not request.prompt or len(request.prompt.strip()) == 0:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        if request.duration > 300:  # Max 5 minutes for mobile optimization
            request.duration = 300
        
        # Generate video
        result = await video_service.generate_video(
            prompt=request.prompt,
            model_name=request.model_name,
            duration=request.duration,
            fps=request.fps,
            resolution=request.resolution,
            style=request.style,
            seed=request.seed,
            additional_params=request.additional_params
        )
        
        return VideoGenerationResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-from-image")
async def generate_video_from_image(
    prompt: str = Form(...),
    model_name: str = Form("stable_video"),
    duration: int = Form(10),
    fps: int = Form(24),
    resolution: str = Form("720p"),
    style: str = Form("cinematic"),
    image: UploadFile = File(...)
):
    """
    Generate video from input image using image-to-video models
    """
    try:
        # Save uploaded image
        import tempfile
        import os
        
        temp_dir = tempfile.mkdtemp()
        image_path = os.path.join(temp_dir, f"input_{image.filename}")
        
        with open(image_path, "wb") as f:
            f.write(await image.read())
        
        # Generate video from image
        # This would use image-to-video specific generation
        result = await video_service.generate_video(
            prompt=f"Transform this image: {prompt}",
            model_name=model_name,
            duration=duration,
            fps=fps,
            resolution=resolution,
            style=style,
            additional_params={"input_image": image_path}
        )
        
        return VideoGenerationResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def get_video_models():
    """Get available video generation models and their capabilities"""
    return {
        "models": [
            {
                "id": "wan22",
                "name": "Wan2.2",
                "description": "High-quality video generation optimized for mobile devices",
                "capabilities": ["text-to-video", "style-transfer"],
                "max_duration": 300,
                "supported_resolutions": ["480p", "720p", "1080p"],
                "github_url": "https://github.com/modelscope/modelscope"
            },
            {
                "id": "stable_video",
                "name": "Stable Video Diffusion",
                "description": "Advanced video generation with stable diffusion",
                "capabilities": ["text-to-video", "image-to-video", "video-editing"],
                "max_duration": 120,
                "supported_resolutions": ["720p", "1080p"],
                "github_url": "https://github.com/Stability-AI/generative-models"
            },
            {
                "id": "deforum",
                "name": "Deforum Stable Diffusion",
                "description": "Artistic video generation with camera movements",
                "capabilities": ["text-to-video", "artistic-effects", "camera-movement"],
                "max_duration": 60,
                "supported_resolutions": ["720p", "1080p"],
                "github_url": "https://github.com/deforum-art/deforum-stable-diffusion"
            }
        ]
    }

@router.get("/styles")
async def get_video_styles():
    """Get supported video styles"""
    styles = await video_service.get_supported_styles()
    return {"styles": styles}

@router.get("/resolutions")
async def get_video_resolutions():
    """Get supported video resolutions"""
    resolutions = await video_service.get_supported_resolutions()
    return {"resolutions": resolutions}

@router.post("/enhance")
async def enhance_video_prompt(
    prompt: str = Form(...),
    style: str = Form("cinematic"),
    mood: str = Form("dramatic"),
    lighting: str = Form("natural")
):
    """
    Enhance video prompt with style, mood, and technical parameters
    """
    try:
        enhanced_prompt = f"{prompt}, {style} style, {mood} mood, {lighting} lighting, high quality, detailed, professional cinematography"
        
        return {
            "original_prompt": prompt,
            "enhanced_prompt": enhanced_prompt,
            "style": style,
            "mood": mood,
            "lighting": lighting
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/presets")
async def get_video_presets():
    """Get pre-configured video generation presets"""
    return {
        "presets": [
            {
                "name": "Mobile Optimized",
                "description": "Optimized for mobile devices (Poco X6 Pro)",
                "settings": {
                    "resolution": "720p",
                    "fps": 24,
                    "duration": 30,
                    "model": "wan22",
                    "style": "cinematic"
                }
            },
            {
                "name": "High Quality",
                "description": "Best quality for high-end devices",
                "settings": {
                    "resolution": "1080p",
                    "fps": 30,
                    "duration": 60,
                    "model": "stable_video",
                    "style": "realistic"
                }
            },
            {
                "name": "Anime Style",
                "description": "Optimized for anime-style videos",
                "settings": {
                    "resolution": "720p",
                    "fps": 24,
                    "duration": 30,
                    "model": "wan22",
                    "style": "anime"
                }
            },
            {
                "name": "Social Media",
                "description": "Perfect for TikTok, Instagram, YouTube Shorts",
                "settings": {
                    "resolution": "720p",
                    "fps": 30,
                    "duration": 15,
                    "model": "wan22",
                    "style": "vibrant"
                }
            }
        ]
    }

@router.post("/batch-generate")
async def batch_generate_videos(
    prompts: List[str],
    model_name: str = "wan22",
    duration: int = 30,
    resolution: str = "720p",
    style: str = "cinematic"
):
    """
    Generate multiple videos from a list of prompts
    """
    try:
        if len(prompts) > 5:  # Limit for performance
            raise HTTPException(status_code=400, detail="Maximum 5 prompts per batch")
        
        results = []
        
        for i, prompt in enumerate(prompts):
            result = await video_service.generate_video(
                prompt=prompt,
                model_name=model_name,
                duration=duration,
                fps=24,
                resolution=resolution,
                style=style,
                seed=i * 1000  # Different seed for each video
            )
            results.append(result)
        
        return {
            "success": True,
            "total_videos": len(results),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/queue")
async def get_generation_queue():
    """Get current video generation queue status"""
    return {
        "queue_length": 0,  # Implement actual queue management
        "estimated_wait_time": "0 minutes",
        "active_generations": 0
    }

@router.delete("/cancel/{task_id}")
async def cancel_generation(task_id: str):
    """Cancel video generation task"""
    # Implement task cancellation
    return {
        "success": True,
        "message": f"Generation task {task_id} cancelled"
    }

@router.get("/health")
async def video_service_health():
    """Video generation service health check"""
    health = await video_service.health_check()
    return health