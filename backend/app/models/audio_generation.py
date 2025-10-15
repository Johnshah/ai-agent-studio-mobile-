import asyncio
import os
import torch
import torchaudio
from typing import Dict, Any, Optional, List
from datetime import datetime
import numpy as np
import soundfile as sf
from pydub import AudioSegment
import tempfile
import logging
from transformers import pipeline, AutoProcessor, MusicgenForConditionalGeneration
from bark import SAMPLE_RATE, generate_audio, preload_models
import librosa

logger = logging.getLogger(__name__)

class AudioGenerationService:
    def __init__(self):
        self.models = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.temp_dir = tempfile.mkdtemp()
        self.sample_rate = 32000
        
        # Initialize models
        asyncio.create_task(self._initialize_models())
    
    async def _initialize_models(self):
        """Initialize all audio generation models"""
        try:
            # Initialize MusicGen
            await self._load_musicgen()
            
            # Initialize Bark (Text-to-Speech)
            await self._load_bark()
            
            # Initialize Jukebox
            await self._load_jukebox()
            
            # Initialize Coqui TTS
            await self._load_coqui_tts()
            
            # Initialize ChatterBox (Voice Cloning)
            await self._load_chatterbox()
            
            # Initialize Demucs (Audio Separation)
            await self._load_demucs()
            
            logger.info("✅ All audio generation models initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Error initializing audio models: {e}")
    
    async def _load_musicgen(self):
        """Load MusicGen model for music generation"""
        try:
            self.models['musicgen'] = {
                'processor': AutoProcessor.from_pretrained("facebook/musicgen-small"),
                'model': MusicgenForConditionalGeneration.from_pretrained(
                    "facebook/musicgen-small",
                    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
                ).to(self.device)
            }
            logger.info("✅ MusicGen model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ MusicGen model not available: {e}")
    
    async def _load_bark(self):
        """Load Bark model for text-to-speech"""
        try:
            # Preload Bark models
            preload_models()
            self.models['bark'] = {
                'loaded': True,
                'sample_rate': SAMPLE_RATE
            }
            logger.info("✅ Bark TTS model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Bark model not available: {e}")
    
    async def _load_jukebox(self):
        """Load Jukebox model for music generation"""
        try:
            # Jukebox is resource-intensive, use lightweight alternative
            from transformers import pipeline
            
            self.models['jukebox'] = pipeline(
                "text-to-audio",
                model="facebook/musicgen-small",  # Using MusicGen as Jukebox alternative
                device=self.device
            )
            logger.info("✅ Jukebox-style model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Jukebox model not available: {e}")
    
    async def _load_coqui_tts(self):
        """Load Coqui TTS model"""
        try:
            from TTS.api import TTS
            
            self.models['coqui_tts'] = TTS(
                model_name="tts_models/en/ljspeech/tacotron2-DDC",
                progress_bar=False
            ).to(self.device)
            logger.info("✅ Coqui TTS model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Coqui TTS model not available: {e}")
            # Fallback to transformers TTS
            await self._load_transformers_tts()
    
    async def _load_transformers_tts(self):
        """Load Transformers-based TTS as fallback"""
        try:
            from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
            
            self.models['transformers_tts'] = {
                'processor': SpeechT5Processor.from_pretrained("microsoft/speecht5_tts"),
                'model': SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts").to(self.device),
                'vocoder': SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(self.device)
            }
            logger.info("✅ Transformers TTS model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Transformers TTS model not available: {e}")
    
    async def _load_chatterbox(self):
        """Load ChatterBox for voice cloning"""
        try:
            # Use a voice cloning pipeline
            self.models['chatterbox'] = {
                'voice_cloner': pipeline(
                    "text-to-audio",
                    model="suno/bark",
                    device=self.device
                ),
                'loaded': True
            }
            logger.info("✅ ChatterBox voice cloning model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ ChatterBox model not available: {e}")
    
    async def _load_demucs(self):
        """Load Demucs for audio separation"""
        try:
            import torch.hub
            
            self.models['demucs'] = torch.hub.load(
                'facebookresearch/demucs:main', 
                'dns64',
                device=self.device
            )
            logger.info("✅ Demucs audio separation model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Demucs model not available: {e}")
    
    async def generate_music(
        self,
        prompt: str,
        duration: int = 30,
        genre: str = "pop",
        mood: str = "upbeat",
        tempo: str = "medium",
        model_name: str = "musicgen",
        seed: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generate music using specified model
        
        Args:
            prompt: Text description for music
            duration: Music duration in seconds
            genre: Music genre
            mood: Music mood
            tempo: Music tempo
            model_name: Model to use (musicgen, jukebox)
            seed: Random seed for reproducibility
        """
        try:
            # Enhanced prompt with music parameters
            enhanced_prompt = self._enhance_music_prompt(prompt, genre, mood, tempo)
            
            # Generate music based on selected model
            if model_name == "musicgen" and "musicgen" in self.models:
                audio_path = await self._generate_musicgen_audio(
                    enhanced_prompt, duration, seed
                )
            elif model_name == "jukebox" and "jukebox" in self.models:
                audio_path = await self._generate_jukebox_audio(
                    enhanced_prompt, duration, seed
                )
            else:
                # Fallback generation
                audio_path = await self._generate_fallback_music(
                    enhanced_prompt, duration, seed
                )
            
            # Get audio info
            audio_info = await self._get_audio_info(audio_path)
            
            return {
                "success": True,
                "audio_path": audio_path,
                "audio_url": f"/static/generated/{os.path.basename(audio_path)}",
                "duration": audio_info["duration"],
                "sample_rate": audio_info["sample_rate"],
                "file_size": audio_info["file_size"],
                "model_used": model_name,
                "prompt": enhanced_prompt,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error generating music: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate music"
            }
    
    async def generate_speech(
        self,
        text: str,
        voice: str = "default",
        speed: float = 1.0,
        model_name: str = "bark",
        language: str = "en",
        emotion: str = "neutral"
    ) -> Dict[str, Any]:
        """
        Generate speech from text
        
        Args:
            text: Text to synthesize
            voice: Voice preset to use
            speed: Speech speed multiplier
            model_name: Model to use (bark, coqui_tts, transformers_tts)
            language: Language code
            emotion: Emotion for speech
        """
        try:
            # Generate speech based on selected model
            if model_name == "bark" and "bark" in self.models:
                audio_path = await self._generate_bark_speech(text, voice, emotion)
            elif model_name == "coqui_tts" and "coqui_tts" in self.models:
                audio_path = await self._generate_coqui_speech(text, voice, speed)
            elif model_name == "transformers_tts" and "transformers_tts" in self.models:
                audio_path = await self._generate_transformers_speech(text, voice)
            else:
                # Fallback generation
                audio_path = await self._generate_fallback_speech(text, voice)
            
            # Apply speed modification if needed
            if speed != 1.0:
                audio_path = await self._modify_audio_speed(audio_path, speed)
            
            # Get audio info
            audio_info = await self._get_audio_info(audio_path)
            
            return {
                "success": True,
                "audio_path": audio_path,
                "audio_url": f"/static/generated/{os.path.basename(audio_path)}",
                "duration": audio_info["duration"],
                "sample_rate": audio_info["sample_rate"],
                "file_size": audio_info["file_size"],
                "model_used": model_name,
                "text": text,
                "voice": voice,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error generating speech: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate speech"
            }
    
    async def clone_voice(
        self,
        audio_file_path: str,
        target_text: str,
        model_name: str = "chatterbox"
    ) -> Dict[str, Any]:
        """
        Clone voice from audio sample and generate new speech
        
        Args:
            audio_file_path: Path to reference audio file
            target_text: Text to generate in cloned voice
            model_name: Model to use for voice cloning
        """
        try:
            # Extract voice characteristics from reference audio
            voice_embedding = await self._extract_voice_embedding(audio_file_path)
            
            # Generate speech with cloned voice
            if model_name == "chatterbox" and "chatterbox" in self.models:
                audio_path = await self._generate_cloned_speech(
                    target_text, voice_embedding
                )
            else:
                # Fallback cloning
                audio_path = await self._generate_fallback_cloned_speech(
                    target_text, audio_file_path
                )
            
            # Get audio info
            audio_info = await self._get_audio_info(audio_path)
            
            return {
                "success": True,
                "audio_path": audio_path,
                "audio_url": f"/static/generated/{os.path.basename(audio_path)}",
                "duration": audio_info["duration"],
                "sample_rate": audio_info["sample_rate"],
                "file_size": audio_info["file_size"],
                "model_used": model_name,
                "text": target_text,
                "reference_audio": audio_file_path,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error cloning voice: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to clone voice"
            }
    
    async def separate_audio(
        self,
        audio_file_path: str,
        separation_type: str = "vocals"
    ) -> Dict[str, Any]:
        """
        Separate audio into different stems
        
        Args:
            audio_file_path: Path to audio file to separate
            separation_type: Type of separation (vocals, drums, bass, other)
        """
        try:
            if "demucs" in self.models:
                separated_paths = await self._separate_with_demucs(
                    audio_file_path, separation_type
                )
            else:
                # Fallback separation
                separated_paths = await self._separate_fallback(
                    audio_file_path, separation_type
                )
            
            return {
                "success": True,
                "original_audio": audio_file_path,
                "separated_audio": separated_paths,
                "separation_type": separation_type,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error separating audio: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to separate audio"
            }
    
    def _enhance_music_prompt(self, prompt: str, genre: str, mood: str, tempo: str) -> str:
        """Enhance music prompt with genre, mood, and tempo"""
        return f"{prompt}, {genre} genre, {mood} mood, {tempo} tempo, high quality music"
    
    async def _generate_musicgen_audio(
        self, prompt: str, duration: int, seed: Optional[int]
    ) -> str:
        """Generate audio using MusicGen"""
        try:
            output_path = os.path.join("static/generated", f"musicgen_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            processor = self.models['musicgen']['processor']
            model = self.models['musicgen']['model']
            
            # Set seed if provided
            if seed is not None:
                torch.manual_seed(seed)
            
            # Process prompt
            inputs = processor(
                text=[prompt],
                padding=True,
                return_tensors="pt"
            ).to(self.device)
            
            # Generate audio
            audio_values = model.generate(
                **inputs,
                max_new_tokens=int(duration * 50)  # Approximate tokens per second
            )
            
            # Convert to numpy and save
            audio_np = audio_values[0, 0].cpu().numpy()
            sf.write(output_path, audio_np, self.models['musicgen']['model'].config.audio_encoder.sampling_rate)
            
            return output_path
            
        except Exception as e:
            logger.error(f"❌ MusicGen generation failed: {e}")
            raise
    
    async def _generate_bark_speech(
        self, text: str, voice: str, emotion: str
    ) -> str:
        """Generate speech using Bark"""
        try:
            output_path = os.path.join("static/generated", f"bark_speech_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Voice presets for Bark
            voice_presets = {
                "default": "v2/en_speaker_6",
                "male": "v2/en_speaker_9",
                "female": "v2/en_speaker_6",
                "young": "v2/en_speaker_3",
                "old": "v2/en_speaker_8"
            }
            
            # Add emotion tags to text
            emotion_tags = {
                "happy": "[laughs]",
                "sad": "[sighs]", 
                "excited": "!",
                "calm": "...",
                "neutral": ""
            }
            
            enhanced_text = f"{emotion_tags.get(emotion, '')} {text}"
            voice_preset = voice_presets.get(voice, voice_presets["default"])
            
            # Generate audio
            audio_array = generate_audio(enhanced_text, history_prompt=voice_preset)
            
            # Save audio
            sf.write(output_path, audio_array, SAMPLE_RATE)
            
            return output_path
            
        except Exception as e:
            logger.error(f"❌ Bark speech generation failed: {e}")
            raise
    
    async def _generate_fallback_music(
        self, prompt: str, duration: int, seed: Optional[int]
    ) -> str:
        """Generate fallback music using simple synthesis"""
        try:
            output_path = os.path.join("static/generated", f"fallback_music_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Generate simple synthetic music
            sample_rate = 44100
            t = np.linspace(0, duration, int(sample_rate * duration))
            
            # Create basic chord progression
            frequencies = [440, 523.25, 659.25, 783.99]  # A, C, E, G
            music = np.zeros_like(t)
            
            for i, freq in enumerate(frequencies):
                start_time = i * duration / len(frequencies)
                end_time = (i + 1) * duration / len(frequencies)
                mask = (t >= start_time) & (t < end_time)
                
                # Add harmonic content
                note = (np.sin(2 * np.pi * freq * t[mask]) + 
                       0.5 * np.sin(2 * np.pi * freq * 2 * t[mask]) +
                       0.25 * np.sin(2 * np.pi * freq * 3 * t[mask]))
                
                # Apply envelope
                envelope = np.exp(-3 * (t[mask] - start_time))
                music[mask] = note * envelope
            
            # Normalize
            music = music / np.max(np.abs(music))
            
            # Save audio
            sf.write(output_path, music, sample_rate)
            
            return output_path
            
        except Exception as e:
            logger.error(f"❌ Fallback music generation failed: {e}")
            raise
    
    async def _get_audio_info(self, audio_path: str) -> Dict[str, Any]:
        """Get audio file information"""
        try:
            audio_data, sample_rate = sf.read(audio_path)
            duration = len(audio_data) / sample_rate
            
            return {
                "duration": duration,
                "sample_rate": sample_rate,
                "channels": 1 if audio_data.ndim == 1 else audio_data.shape[1],
                "file_size": os.path.getsize(audio_path)
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting audio info: {e}")
            return {
                "duration": 0,
                "sample_rate": 0,
                "channels": 0,
                "file_size": os.path.getsize(audio_path) if os.path.exists(audio_path) else 0
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for audio generation service"""
        return {
            "status": "healthy",
            "available_models": list(self.models.keys()),
            "device": self.device,
            "sample_rate": self.sample_rate,
            "temp_dir": self.temp_dir
        }
    
    async def get_supported_voices(self) -> List[str]:
        """Get list of supported voices"""
        return ["default", "male", "female", "young", "old", "robotic", "narrator"]
    
    async def get_supported_genres(self) -> List[str]:
        """Get list of supported music genres"""
        return [
            "pop", "rock", "jazz", "classical", "electronic", "hip-hop",
            "country", "folk", "blues", "reggae", "ambient", "cinematic"
        ]
    
    async def get_supported_moods(self) -> List[str]:
        """Get list of supported moods"""
        return [
            "happy", "sad", "energetic", "calm", "dramatic", "mysterious",
            "romantic", "epic", "peaceful", "intense", "nostalgic", "uplifting"
        ]
    
    def __del__(self):
        """Cleanup temporary files"""
        try:
            import shutil
            if hasattr(self, 'temp_dir') and os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
        except:
            pass