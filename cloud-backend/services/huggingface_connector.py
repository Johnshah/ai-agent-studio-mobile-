"""
Hugging Face Model Connector
Handles all AI model integrations with Hugging Face Inference API
"""

import os
import asyncio
import aiohttp
from typing import Dict, Any, Optional, List
from huggingface_hub import InferenceClient
import base64
import json

class HuggingFaceConnector:
    """Connector for Hugging Face AI models"""
    
    def __init__(self):
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        self.client = InferenceClient(token=self.hf_token)
        
        # Model endpoints
        self.models = {
            "video": {
                "wan22": "alibaba-pai/animate-anything",
                "stable-video": "stabilityai/stable-video-diffusion-img2vid",
                "modelscope": "damo-vilab/text-to-video-ms-1.7b"
            },
            "audio": {
                "musicgen": "facebook/musicgen-large",
                "bark": "suno/bark",
                "jukebox": "openai/jukebox",
                "coqui-tts": "coqui/XTTS-v2"
            },
            "code": {
                "code-llama": "codellama/CodeLlama-34b-Instruct-hf",
                "deepseek-coder": "deepseek-ai/deepseek-coder-33b-instruct",
                "starcoder": "bigcode/starcoder2-15b",
                "wizardcoder": "WizardLM/WizardCoder-Python-34B-V1.0"
            },
            "image": {
                "stable-diffusion-xl": "stabilityai/stable-diffusion-xl-base-1.0",
                "gfpgan": "tencentarc/gfpgan",
                "real-esrgan": "xinntao/realesrgan-x4plus",
                "remove-bg": "briaai/RMBG-1.4"
            }
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check if Hugging Face services are available"""
        try:
            # Test with a simple model
            result = await self.client.text_generation(
                "Hello", 
                model="microsoft/DialoGPT-medium",
                max_new_tokens=1
            )
            return {
                "status": "healthy",
                "models_available": len(self.get_all_models()),
                "api_accessible": True
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "api_accessible": False
            }
    
    def get_all_models(self) -> Dict[str, Dict[str, str]]:
        """Get all available models"""
        return self.models
    
    async def get_available_models(self) -> Dict[str, Any]:
        """Get available models with status"""
        all_models = []
        
        for category, models in self.models.items():
            for model_id, model_name in models.items():
                all_models.append({
                    "id": model_id,
                    "name": model_name,
                    "category": category,
                    "status": "available",
                    "provider": "Hugging Face"
                })
        
        return {
            "models": all_models,
            "total": len(all_models),
            "categories": list(self.models.keys())
        }
    
    async def generate_video(self, prompt: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate video using Hugging Face models"""
        try:
            model_id = config.get("model", "wan22")
            model_name = self.models["video"].get(model_id)
            
            if not model_name:
                raise ValueError(f"Unknown video model: {model_id}")
            
            # For video generation, we'll use text-to-video
            result = await asyncio.to_thread(
                self.client.text_to_video,
                prompt=prompt,
                model=model_name
            )
            
            return {
                "success": True,
                "model_used": model_id,
                "result": result,
                "format": "mp4"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_used": model_id
            }
    
    async def generate_audio(self, prompt: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate audio using Hugging Face models"""
        try:
            model_id = config.get("model", "musicgen")
            model_name = self.models["audio"].get(model_id)
            
            if not model_name:
                raise ValueError(f"Unknown audio model: {model_id}")
            
            # Generate audio
            if model_id == "musicgen":
                result = await asyncio.to_thread(
                    self.client.text_to_audio,
                    text=prompt,
                    model=model_name
                )
            elif model_id == "bark":
                result = await asyncio.to_thread(
                    self.client.text_to_speech,
                    text=prompt,
                    model=model_name
                )
            else:
                # Use generic text-to-audio
                result = await asyncio.to_thread(
                    self.client.text_to_audio,
                    text=prompt,
                    model=model_name
                )
            
            return {
                "success": True,
                "model_used": model_id,
                "result": result,
                "format": "wav"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_used": model_id
            }
    
    async def generate_code(self, prompt: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate code using Hugging Face models"""
        try:
            model_id = config.get("model", "code-llama")
            model_name = self.models["code"].get(model_id)
            
            if not model_name:
                raise ValueError(f"Unknown code model: {model_id}")
            
            # Enhance prompt for code generation
            enhanced_prompt = f"""
            Create a {config.get('app_type', 'mobile')} app using {config.get('framework', 'react-native')}.
            
            Requirements: {prompt}
            
            Please provide:
            1. Complete source code
            2. File structure
            3. Installation instructions
            4. Usage guide
            
            Generate production-ready code:
            """
            
            result = await asyncio.to_thread(
                self.client.text_generation,
                prompt=enhanced_prompt,
                model=model_name,
                max_new_tokens=4000,
                temperature=0.7
            )
            
            return {
                "success": True,
                "model_used": model_id,
                "result": result,
                "format": "code"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_used": model_id
            }
    
    async def generate_image(self, prompt: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate images using Hugging Face models"""
        try:
            model_id = config.get("model", "stable-diffusion-xl")
            model_name = self.models["image"].get(model_id)
            
            if not model_name:
                raise ValueError(f"Unknown image model: {model_id}")
            
            # Generate image
            result = await asyncio.to_thread(
                self.client.text_to_image,
                prompt=prompt,
                model=model_name,
                width=config.get("width", 1024),
                height=config.get("height", 1024)
            )
            
            return {
                "success": True,
                "model_used": model_id,
                "result": result,
                "format": "png"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_used": model_id
            }
    
    async def enhance_image(self, image_data: bytes, enhancement_type: str) -> Dict[str, Any]:
        """Enhance image using specialized models"""
        try:
            if enhancement_type == "upscale":
                model_name = self.models["image"]["real-esrgan"]
            elif enhancement_type == "face-restore":
                model_name = self.models["image"]["gfpgan"]
            elif enhancement_type == "remove-bg":
                model_name = self.models["image"]["remove-bg"]
            else:
                raise ValueError(f"Unknown enhancement type: {enhancement_type}")
            
            # Convert image data to base64 for API
            image_b64 = base64.b64encode(image_data).decode()
            
            # Process image
            result = await asyncio.to_thread(
                self.client.image_to_image,
                image=image_b64,
                model=model_name
            )
            
            return {
                "success": True,
                "enhancement_type": enhancement_type,
                "result": result,
                "format": "png"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "enhancement_type": enhancement_type
            }
    
    async def get_model_info(self, model_id: str, category: str) -> Dict[str, Any]:
        """Get detailed information about a specific model"""
        try:
            if category not in self.models:
                raise ValueError(f"Unknown category: {category}")
            
            if model_id not in self.models[category]:
                raise ValueError(f"Unknown model: {model_id}")
            
            model_name = self.models[category][model_id]
            
            # Get model info from Hugging Face API
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"https://huggingface.co/api/models/{model_name}",
                    headers={"Authorization": f"Bearer {self.hf_token}"}
                ) as response:
                    if response.status == 200:
                        model_info = await response.json()
                        return {
                            "id": model_id,
                            "name": model_name,
                            "category": category,
                            "description": model_info.get("description", ""),
                            "tags": model_info.get("tags", []),
                            "downloads": model_info.get("downloads", 0),
                            "likes": model_info.get("likes", 0),
                            "status": "available"
                        }
            
            return {
                "id": model_id,
                "name": model_name,
                "category": category,
                "status": "available"
            }
            
        except Exception as e:
            return {
                "id": model_id,
                "category": category,
                "status": "error",
                "error": str(e)
            }
    
    async def batch_generate(self, requests: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process multiple generation requests in batch"""
        tasks = []
        
        for request in requests:
            task_type = request.get("type")
            prompt = request.get("prompt")
            config = request.get("config", {})
            
            if task_type == "video":
                task = self.generate_video(prompt, config)
            elif task_type == "audio":
                task = self.generate_audio(prompt, config)
            elif task_type == "code":
                task = self.generate_code(prompt, config)
            elif task_type == "image":
                task = self.generate_image(prompt, config)
            else:
                task = asyncio.coroutine(lambda: {
                    "success": False,
                    "error": f"Unknown task type: {task_type}"
                })()
            
            tasks.append(task)
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    "success": False,
                    "error": str(result),
                    "request_index": i
                })
            else:
                result["request_index"] = i
                processed_results.append(result)
        
        return processed_results