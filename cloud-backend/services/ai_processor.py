"""
AI Processor Service for AI Agent Studio Cloud Backend
Handles actual AI model processing using Hugging Face integration
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from .task_manager import Task, TaskType, TaskStatus
from .huggingface_connector import HuggingFaceConnector

logger = logging.getLogger(__name__)

class AIProcessor:
    def __init__(self):
        self.hf_connector = HuggingFaceConnector()
    
    async def process_task(self, task: Task) -> Dict[str, Any]:
        """Process a task based on its type"""
        try:
            if task.type == TaskType.VIDEO_GENERATION:
                return await self._process_video_generation(task)
            elif task.type == TaskType.AUDIO_GENERATION:
                return await self._process_audio_generation(task)
            elif task.type == TaskType.IMAGE_GENERATION:
                return await self._process_image_generation(task)
            elif task.type == TaskType.CODE_GENERATION:
                return await self._process_code_generation(task)
            elif task.type == TaskType.TEXT_GENERATION:
                return await self._process_text_generation(task)
            else:
                raise ValueError(f"Unknown task type: {task.type}")
        
        except Exception as e:
            logger.error(f"Error processing task {task.id}: {e}")
            raise
    
    async def _process_video_generation(self, task: Task) -> Dict[str, Any]:
        """Process video generation task"""
        from .task_manager import task_manager
        
        await task_manager.update_task_progress(task.id, 10)
        
        # Extract parameters
        prompt = task.prompt
        model = task.parameters.get("model", "wan22")
        duration = task.parameters.get("duration", 5)
        style = task.parameters.get("style", "realistic")
        
        await task_manager.update_task_progress(task.id, 30)
        
        try:
            # Generate video using Hugging Face
            result = await self.hf_connector.generate_video(
                prompt=prompt,
                model=model,
                duration=duration,
                style=style,
                progress_callback=lambda p: asyncio.create_task(
                    task_manager.update_task_progress(task.id, 30 + int(p * 0.6))
                )
            )
            
            await task_manager.update_task_progress(task.id, 95)
            
            return {
                "type": "video",
                "video_url": result.get("video_url"),
                "thumbnail_url": result.get("thumbnail_url"),
                "duration": result.get("duration", duration),
                "format": result.get("format", "mp4"),
                "model_used": model,
                "generation_time": result.get("generation_time"),
                "metadata": {
                    "prompt": prompt,
                    "style": style,
                    "parameters": task.parameters
                }
            }
            
        except Exception as e:
            logger.error(f"Video generation failed for task {task.id}: {e}")
            raise
    
    async def _process_audio_generation(self, task: Task) -> Dict[str, Any]:
        """Process audio generation task"""
        from .task_manager import task_manager
        
        await task_manager.update_task_progress(task.id, 15)
        
        # Extract parameters
        prompt = task.prompt
        model = task.parameters.get("model", "musicgen")
        duration = task.parameters.get("duration", 30)
        genre = task.parameters.get("genre", "ambient")
        
        await task_manager.update_task_progress(task.id, 35)
        
        try:
            # Generate audio using Hugging Face
            result = await self.hf_connector.generate_audio(
                prompt=prompt,
                model=model,
                duration=duration,
                genre=genre,
                progress_callback=lambda p: asyncio.create_task(
                    task_manager.update_task_progress(task.id, 35 + int(p * 0.5))
                )
            )
            
            await task_manager.update_task_progress(task.id, 90)
            
            return {
                "type": "audio",
                "audio_url": result.get("audio_url"),
                "waveform_url": result.get("waveform_url"),
                "duration": result.get("duration", duration),
                "format": result.get("format", "mp3"),
                "model_used": model,
                "generation_time": result.get("generation_time"),
                "metadata": {
                    "prompt": prompt,
                    "genre": genre,
                    "parameters": task.parameters
                }
            }
            
        except Exception as e:
            logger.error(f"Audio generation failed for task {task.id}: {e}")
            raise
    
    async def _process_image_generation(self, task: Task) -> Dict[str, Any]:
        """Process image generation task"""
        from .task_manager import task_manager
        
        await task_manager.update_task_progress(task.id, 20)
        
        # Extract parameters
        prompt = task.prompt
        model = task.parameters.get("model", "stable-diffusion-xl")
        width = task.parameters.get("width", 512)
        height = task.parameters.get("height", 512)
        style = task.parameters.get("style", "photorealistic")
        
        await task_manager.update_task_progress(task.id, 40)
        
        try:
            # Generate image using Hugging Face
            result = await self.hf_connector.generate_image(
                prompt=prompt,
                model=model,
                width=width,
                height=height,
                style=style,
                progress_callback=lambda p: asyncio.create_task(
                    task_manager.update_task_progress(task.id, 40 + int(p * 0.45))
                )
            )
            
            await task_manager.update_task_progress(task.id, 90)
            
            return {
                "type": "image",
                "image_url": result.get("image_url"),
                "thumbnail_url": result.get("thumbnail_url"),
                "width": result.get("width", width),
                "height": result.get("height", height),
                "format": result.get("format", "png"),
                "model_used": model,
                "generation_time": result.get("generation_time"),
                "metadata": {
                    "prompt": prompt,
                    "style": style,
                    "parameters": task.parameters
                }
            }
            
        except Exception as e:
            logger.error(f"Image generation failed for task {task.id}: {e}")
            raise
    
    async def _process_code_generation(self, task: Task) -> Dict[str, Any]:
        """Process code generation task"""
        from .task_manager import task_manager
        
        await task_manager.update_task_progress(task.id, 25)
        
        # Extract parameters
        prompt = task.prompt
        model = task.parameters.get("model", "code-llama")
        language = task.parameters.get("language", "python")
        max_tokens = task.parameters.get("max_tokens", 1000)
        
        await task_manager.update_task_progress(task.id, 45)
        
        try:
            # Generate code using Hugging Face
            result = await self.hf_connector.generate_code(
                prompt=prompt,
                model=model,
                language=language,
                max_tokens=max_tokens,
                progress_callback=lambda p: asyncio.create_task(
                    task_manager.update_task_progress(task.id, 45 + int(p * 0.4))
                )
            )
            
            await task_manager.update_task_progress(task.id, 90)
            
            return {
                "type": "code",
                "code": result.get("code"),
                "explanation": result.get("explanation"),
                "language": result.get("language", language),
                "model_used": model,
                "generation_time": result.get("generation_time"),
                "metadata": {
                    "prompt": prompt,
                    "language": language,
                    "parameters": task.parameters
                }
            }
            
        except Exception as e:
            logger.error(f"Code generation failed for task {task.id}: {e}")
            raise
    
    async def _process_text_generation(self, task: Task) -> Dict[str, Any]:
        """Process text generation task"""
        from .task_manager import task_manager
        
        await task_manager.update_task_progress(task.id, 30)
        
        # Extract parameters
        prompt = task.prompt
        model = task.parameters.get("model", "gpt2")
        max_tokens = task.parameters.get("max_tokens", 500)
        temperature = task.parameters.get("temperature", 0.7)
        
        await task_manager.update_task_progress(task.id, 50)
        
        try:
            # Generate text using Hugging Face
            result = await self.hf_connector.generate_text(
                prompt=prompt,
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                progress_callback=lambda p: asyncio.create_task(
                    task_manager.update_task_progress(task.id, 50 + int(p * 0.35))
                )
            )
            
            await task_manager.update_task_progress(task.id, 90)
            
            return {
                "type": "text",
                "text": result.get("text"),
                "tokens_used": result.get("tokens_used"),
                "model_used": model,
                "generation_time": result.get("generation_time"),
                "metadata": {
                    "prompt": prompt,
                    "temperature": temperature,
                    "parameters": task.parameters
                }
            }
            
        except Exception as e:
            logger.error(f"Text generation failed for task {task.id}: {e}")
            raise