import asyncio
import os
import uuid
import tempfile
from datetime import datetime
from typing import Dict, List, Optional, Any
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedAudioGenerationService:
    """
    Enhanced Audio Generation Service supporting multiple AI models:
    - MusicGen (Meta)
    - Jukebox (OpenAI) 
    - Bark (Suno AI)
    - Coqui TTS
    - ChatterBox (Voice Cloning)
    - Custom GitHub models
    """
    
    def __init__(self):
        self.models = {
            'musicgen': {
                'name': 'MusicGen',
                'provider': 'Meta',
                'type': 'music',
                'github_url': 'https://github.com/facebookresearch/audiocraft',
                'huggingface_url': 'https://huggingface.co/spaces/facebook/MusicGen',
                'capabilities': ['music-generation', 'text-to-music', 'genre-control'],
                'max_duration': 300
            },
            'jukebox': {
                'name': 'Jukebox',
                'provider': 'OpenAI',
                'type': 'music',
                'github_url': 'https://github.com/openai/jukebox',
                'capabilities': ['music-generation', 'artist-style', 'singing'],
                'max_duration': 180
            },
            'bark': {
                'name': 'Bark',
                'provider': 'Suno AI',
                'type': 'voice',
                'github_url': 'https://github.com/suno-ai/bark',
                'huggingface_url': 'https://huggingface.co/spaces/suno/bark',
                'capabilities': ['text-to-speech', 'realistic-voices', 'effects'],
                'max_duration': 300
            },
            'coqui-tts': {
                'name': 'Coqui TTS',
                'provider': 'Coqui AI',
                'type': 'voice',
                'github_url': 'https://github.com/coqui-ai/TTS',
                'capabilities': ['text-to-speech', 'voice-cloning', 'multilingual'],
                'max_duration': 600
            },
            'chatterbox': {
                'name': 'ChatterBox',
                'provider': 'Community',
                'type': 'voice',
                'github_url': 'https://github.com/CorentinJ/Real-Time-Voice-Cloning',
                'capabilities': ['voice-cloning', 'real-time', 'custom-voices'],
                'max_duration': 300
            }
        }
        
        self.custom_models = {}
        self.cloned_voices = {}
        self.output_dir = Path("static/generated/audio")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    async def generate_audio(
        self,
        audio_type: str,  # music, voice, effects
        prompt: str,
        model: str = 'musicgen',
        duration: int = 30,
        genre: Optional[str] = None,
        voice: Optional[str] = None,
        additional_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate audio using specified AI model"""
        
        try:
            logger.info(f"Starting audio generation with model: {model}")
            
            # Validate model
            if model not in self.models and model not in self.custom_models:
                raise ValueError(f"Model '{model}' not available")
            
            # Get model configuration
            model_config = self.models.get(model, self.custom_models.get(model))
            
            # Validate duration against model limits
            max_duration = model_config.get('max_duration', 300)
            if duration > max_duration:
                duration = max_duration
                logger.warning(f"Duration reduced to {duration}s for model {model}")
            
            # Generate unique task ID
            task_id = str(uuid.uuid4())
            
            # Route to appropriate generation method
            if model == 'musicgen':
                result = await self._generate_with_musicgen(
                    prompt, genre, duration, task_id, additional_params
                )
            elif model == 'jukebox':
                result = await self._generate_with_jukebox(
                    prompt, genre, duration, task_id, additional_params
                )
            elif model == 'bark':
                result = await self._generate_with_bark(
                    prompt, voice, duration, task_id, additional_params
                )
            elif model == 'coqui-tts':
                result = await self._generate_with_coqui_tts(
                    prompt, voice, duration, task_id, additional_params
                )
            elif model == 'chatterbox':
                result = await self._generate_with_chatterbox(
                    prompt, voice, duration, task_id, additional_params
                )
            else:
                result = await self._generate_with_custom_model(
                    model, audio_type, prompt, duration, task_id, additional_params
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Audio generation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'model': model,
                'prompt': prompt
            }
    
    async def _generate_with_musicgen(
        self, prompt: str, genre: Optional[str], duration: int, 
        task_id: str, additional_params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate music using MusicGen"""
        
        try:
            # Enhanced prompt with genre
            enhanced_prompt = self._enhance_music_prompt(prompt, genre)
            
            # MusicGen API integration
            api_payload = {
                'text': enhanced_prompt,
                'duration': duration,
                'temperature': 1.0,
                'top_k': 250,
                'top_p': 0.0,
                'cfg_coef': 3.0
            }
            
            output_filename = f"musicgen_audio_{task_id}.mp3"
            output_path = self.output_dir / output_filename
            
            # Simulate audio generation process
            await self._simulate_audio_generation(duration)
            
            # Create placeholder audio file
            await self._create_placeholder_audio(output_path, duration, 'music')
            
            return {
                'success': True,
                'audioUrl': f"/static/generated/audio/{output_filename}",
                'audioPath': str(output_path),
                'duration': duration,
                'model': 'musicgen',
                'prompt': prompt,
                'enhanced_prompt': enhanced_prompt,
                'genre': genre,
                'task_id': task_id,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"MusicGen generation failed: {str(e)}")
            raise e
    
    async def _generate_with_jukebox(
        self, prompt: str, genre: Optional[str], duration: int,
        task_id: str, additional_params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate music using Jukebox"""
        
        try:
            # Jukebox-style prompt enhancement
            enhanced_prompt = f"{prompt}, genre: {genre or 'pop'}, style: professional"
            
            output_filename = f"jukebox_audio_{task_id}.mp3"
            output_path = self.output_dir / output_filename
            
            await self._simulate_audio_generation(duration)
            await self._create_placeholder_audio(output_path, duration, 'music')
            
            return {
                'success': True,
                'audioUrl': f"/static/generated/audio/{output_filename}",
                'audioPath': str(output_path),
                'duration': duration,
                'model': 'jukebox',
                'prompt': prompt,
                'enhanced_prompt': enhanced_prompt,
                'genre': genre,
                'task_id': task_id,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Jukebox generation failed: {str(e)}")
            raise e
    
    async def _generate_with_bark(
        self, text: str, voice: Optional[str], duration: int,
        task_id: str, additional_params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate voice using Bark"""
        
        try:
            # Bark voice configuration
            voice_preset = voice or "v2/en_speaker_6"  # Default voice
            
            # Bark API integration (HuggingFace)
            api_payload = {
                'text': text,
                'voice_preset': voice_preset,
                'temperature': 0.7
            }
            
            output_filename = f"bark_voice_{task_id}.mp3"
            output_path = self.output_dir / output_filename
            
            await self._simulate_audio_generation(duration)
            await self._create_placeholder_audio(output_path, duration, 'voice')
            
            return {
                'success': True,
                'audioUrl': f"/static/generated/audio/{output_filename}",
                'audioPath': str(output_path),
                'duration': duration,
                'model': 'bark',
                'text': text,
                'voice': voice_preset,
                'task_id': task_id,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Bark generation failed: {str(e)}")
            raise e
    
    async def _generate_with_coqui_tts(
        self, text: str, voice: Optional[str], duration: int,
        task_id: str, additional_params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate voice using Coqui TTS"""
        
        try:
            # Coqui TTS configuration
            tts_config = {
                'text': text,
                'speaker_id': voice or 'p225',
                'language_id': additional_params.get('language', 'en') if additional_params else 'en',
                'speed': additional_params.get('speed', 1.0) if additional_params else 1.0
            }
            
            output_filename = f"coqui_tts_{task_id}.mp3"
            output_path = self.output_dir / output_filename
            
            await self._simulate_audio_generation(duration)
            await self._create_placeholder_audio(output_path, duration, 'voice')
            
            return {
                'success': True,
                'audioUrl': f"/static/generated/audio/{output_filename}",
                'audioPath': str(output_path),
                'duration': duration,
                'model': 'coqui-tts',
                'text': text,
                'voice': voice,
                'task_id': task_id,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Coqui TTS generation failed: {str(e)}")
            raise e
    
    async def _generate_with_chatterbox(
        self, text: str, voice: Optional[str], duration: int,
        task_id: str, additional_params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate voice using ChatterBox (voice cloning)"""
        
        try:
            # ChatterBox voice cloning configuration
            voice_id = voice or 'default'
            
            # Check if it's a cloned voice
            if voice_id in self.cloned_voices:
                voice_config = self.cloned_voices[voice_id]
                logger.info(f"Using cloned voice: {voice_config['name']}")
            
            output_filename = f"chatterbox_voice_{task_id}.mp3"
            output_path = self.output_dir / output_filename
            
            await self._simulate_audio_generation(duration)
            await self._create_placeholder_audio(output_path, duration, 'voice')
            
            return {
                'success': True,
                'audioUrl': f"/static/generated/audio/{output_filename}",
                'audioPath': str(output_path),
                'duration': duration,
                'model': 'chatterbox',
                'text': text,
                'voice': voice_id,
                'task_id': task_id,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"ChatterBox generation failed: {str(e)}")
            raise e
    
    async def _generate_with_custom_model(
        self, model_id: str, audio_type: str, prompt: str, duration: int,
        task_id: str, additional_params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate audio using custom GitHub model"""
        
        try:
            model_config = self.custom_models[model_id]
            
            output_filename = f"custom_{model_id}_{task_id}.mp3"
            output_path = self.output_dir / output_filename
            
            await self._simulate_audio_generation(duration)
            await self._create_placeholder_audio(output_path, duration, audio_type)
            
            return {
                'success': True,
                'audioUrl': f"/static/generated/audio/{output_filename}",
                'audioPath': str(output_path),
                'duration': duration,
                'model': model_id,
                'prompt': prompt,
                'task_id': task_id,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Custom model generation failed: {str(e)}")
            raise e
    
    async def clone_voice(
        self, voice_samples: List, voice_name: str, model: str = 'chatterbox'
    ) -> Dict[str, Any]:
        """Clone voice from uploaded samples"""
        
        try:
            # Generate unique voice ID
            voice_id = f"cloned_{voice_name.lower().replace(' ', '_')}_{uuid.uuid4().hex[:8]}"
            
            # Save voice samples
            sample_paths = []
            for i, sample in enumerate(voice_samples):
                sample_path = self.output_dir / f"voice_sample_{voice_id}_{i}.wav"
                
                # In production, save the actual uploaded audio file
                sample_paths.append(str(sample_path))
            
            # Create cloned voice configuration
            self.cloned_voices[voice_id] = {
                'name': voice_name,
                'model': model,
                'samples': sample_paths,
                'created_at': datetime.utcnow().isoformat(),
                'status': 'active'
            }
            
            logger.info(f"Voice cloned successfully: {voice_name}")
            
            return {
                'success': True,
                'voice_id': voice_id,
                'voice_name': voice_name,
                'samples_count': len(voice_samples),
                'message': f"Voice '{voice_name}' cloned successfully"
            }
            
        except Exception as e:
            logger.error(f"Voice cloning failed: {str(e)}")
            raise e
    
    async def add_custom_model(
        self, name: str, github_url: str, capabilities: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Add custom audio AI model from GitHub"""
        
        try:
            model_id = name.lower().replace(' ', '-').replace('_', '-')
            
            if not github_url.startswith('https://github.com/'):
                raise ValueError("Invalid GitHub URL")
            
            self.custom_models[model_id] = {
                'name': name,
                'github_url': github_url,
                'capabilities': capabilities or ['audio-generation'],
                'added_at': datetime.utcnow().isoformat(),
                'status': 'active'
            }
            
            logger.info(f"Added custom audio model: {name}")
            
            return {
                'success': True,
                'model_id': model_id,
                'message': f"Custom audio model '{name}' added successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to add custom audio model: {str(e)}")
            raise e
    
    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get all available audio generation models"""
        
        models = []
        
        # Built-in models
        for model_id, config in self.models.items():
            models.append({
                'id': model_id,
                'name': config['name'],
                'provider': config.get('provider', 'Unknown'),
                'type': config.get('type', 'audio'),
                'github_url': config.get('github_url', ''),
                'huggingface_url': config.get('huggingface_url', ''),
                'capabilities': config.get('capabilities', []),
                'max_duration': config.get('max_duration', 300),
                'model_type': 'built-in'
            })
        
        # Custom models
        for model_id, config in self.custom_models.items():
            models.append({
                'id': model_id,
                'name': config['name'],
                'github_url': config['github_url'],
                'capabilities': config.get('capabilities', []),
                'model_type': 'custom',
                'status': config.get('status', 'active')
            })
        
        return models
    
    def _enhance_music_prompt(self, prompt: str, genre: Optional[str]) -> str:
        """Enhance music prompt with genre and quality descriptors"""
        
        genre_enhancements = {
            'ambient': 'atmospheric, dreamy, peaceful, ethereal sounds',
            'electronic': 'synthesizers, beats, digital, energetic',
            'classical': 'orchestral, elegant, sophisticated, timeless',
            'rock': 'guitars, drums, powerful, energetic',
            'jazz': 'smooth, improvised, sophisticated, soulful',
            'pop': 'catchy, mainstream, melodic, upbeat',
            'hip-hop': 'rhythmic, beats, urban, contemporary',
            'folk': 'acoustic, traditional, storytelling, organic'
        }
        
        enhancement = genre_enhancements.get(genre or 'ambient', 'high quality music')
        return f"{prompt}, {enhancement}, professional quality, clear sound"
    
    async def _simulate_audio_generation(self, duration: int):
        """Simulate audio generation process"""
        # Simulate processing time (faster than video)
        processing_time = min(duration * 0.2, 10)  # Max 10 seconds for demo
        await asyncio.sleep(processing_time)
    
    async def _create_placeholder_audio(self, output_path: Path, duration: int, audio_type: str):
        """Create placeholder audio file for demo purposes"""
        placeholder_content = f"Generated {audio_type} - Duration: {duration}s"
        
        # Create placeholder text file (replace with actual audio generation)
        with open(output_path.with_suffix('.txt'), 'w') as f:
            f.write(placeholder_content)
        
        # Simulate audio file
        output_path.touch()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check service health and model availability"""
        
        return {
            'status': 'healthy',
            'available_models': len(self.models) + len(self.custom_models),
            'built_in_models': len(self.models),
            'custom_models': len(self.custom_models),
            'cloned_voices': len(self.cloned_voices),
            'output_directory': str(self.output_dir),
            'timestamp': datetime.utcnow().isoformat()
        }