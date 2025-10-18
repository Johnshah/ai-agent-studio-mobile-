#!/usr/bin/env python3
"""
Advanced Backend Setup Script for AI Agent Studio
Handles complex AI model installations and dependencies
"""

import subprocess
import sys
import os
import platform

def run_command(command, description=""):
    """Run a command and handle errors gracefully"""
    print(f"🔧 {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Success")
        return True
    except subprocess.CalledProcessError as e:
        print(f"⚠️ {description} - Warning: {e.stderr}")
        return False

def install_basic_requirements():
    """Install basic requirements first"""
    print("📦 Installing basic requirements...")
    return run_command(
        "pip install -r requirements.txt", 
        "Basic requirements installation"
    )

def install_audio_models():
    """Install advanced audio models"""
    print("🎵 Installing advanced audio models...")
    
    commands = [
        ("pip install git+https://github.com/facebookresearch/audiocraft.git", "AudioCraft (MusicGen)"),
        ("pip install git+https://github.com/suno-ai/bark.git", "Bark Text-to-Speech"),
        ("pip install TTS", "Coqui TTS"),
    ]
    
    for command, description in commands:
        run_command(command, description)

def install_image_models():
    """Install advanced image processing models"""
    print("🎨 Installing image processing models...")
    
    commands = [
        ("pip install gfpgan", "GFPGAN Face Enhancement"),
        ("pip install realesrgan", "Real-ESRGAN Super Resolution"),
        ("pip install basicsr", "BasicSR Image Restoration"),
    ]
    
    for command, description in commands:
        run_command(command, description)

def install_video_models():
    """Install video processing models"""
    print("🎬 Installing video processing models...")
    
    commands = [
        ("pip install av", "PyAV Video Processing"),
        ("pip install ffmpeg-python", "FFmpeg Python Bindings"),
    ]
    
    for command, description in commands:
        run_command(command, description)

def install_code_models():
    """Install code generation models"""
    print("💻 Installing code generation models...")
    
    # Code models are usually loaded via transformers
    print("✅ Code models will be loaded via transformers library")

def install_gpu_acceleration():
    """Install GPU acceleration libraries if available"""
    print("⚡ Checking for GPU acceleration...")
    
    # Check if CUDA is available
    try:
        import torch
        if torch.cuda.is_available():
            print("🚀 CUDA detected, installing GPU acceleration...")
            commands = [
                ("pip install xformers", "xFormers for memory efficiency"),
                ("pip install bitsandbytes", "Quantization support"),
            ]
            for command, description in commands:
                run_command(command, description)
        else:
            print("💡 No CUDA detected, using CPU optimized versions")
    except ImportError:
        print("⚠️ PyTorch not installed yet, skipping GPU check")

def create_model_directories():
    """Create necessary directories for model storage"""
    print("📁 Creating model directories...")
    
    directories = [
        "models/video",
        "models/audio", 
        "models/image",
        "models/code",
        "models/cache",
        "data/uploads",
        "data/outputs",
        "logs"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created {directory}")

def setup_environment():
    """Set up environment variables and configuration"""
    print("⚙️ Setting up environment configuration...")
    
    env_content = """# AI Agent Studio Backend Configuration
# Copy this file to .env and configure according to your setup

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
RELOAD=True

# AI Model Configuration
MODEL_CACHE_DIR=./models/cache
ENABLE_GPU=True
MAX_CONCURRENT_GENERATIONS=3
DEFAULT_TIMEOUT=300

# Hugging Face Configuration
HUGGINGFACE_TOKEN=your_token_here
HUGGINGFACE_CACHE_DIR=./models/cache/huggingface

# Social Media API Keys (Optional)
YOUTUBE_API_KEY=your_youtube_api_key
TWITTER_BEARER_TOKEN=your_twitter_token
INSTAGRAM_ACCESS_TOKEN=your_instagram_token

# Security
SECRET_KEY=your_secret_key_here_change_this_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./data/ai_agent_studio.db
REDIS_URL=redis://localhost:6379

# File Storage
MAX_UPLOAD_SIZE=100MB
ALLOWED_FILE_TYPES=mp4,mp3,wav,jpg,jpeg,png,gif,pdf,txt,py,js,html,css

# Performance Optimization
WORKER_PROCESSES=1
WORKER_CONNECTIONS=1000
KEEPALIVE=2

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log
"""
    
    with open(".env.example", "w") as f:
        f.write(env_content)
    
    print("✅ Created .env.example file")
    print("💡 Copy .env.example to .env and configure your settings")

def main():
    """Main setup function"""
    print("🚀 AI Agent Studio Advanced Backend Setup")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version} detected")
    print(f"✅ Platform: {platform.system()} {platform.machine()}")
    
    # Installation steps
    steps = [
        ("Basic Requirements", install_basic_requirements),
        ("Model Directories", create_model_directories),
        ("Environment Setup", setup_environment),
        ("Audio Models", install_audio_models),
        ("Image Models", install_image_models),
        ("Video Models", install_video_models),
        ("Code Models", install_code_models),
        ("GPU Acceleration", install_gpu_acceleration),
    ]
    
    success_count = 0
    for step_name, step_function in steps:
        print(f"\n{'='*20} {step_name} {'='*20}")
        if step_function():
            success_count += 1
        else:
            print(f"⚠️ {step_name} completed with warnings")
    
    print(f"\n🎉 Setup completed! {success_count}/{len(steps)} steps successful")
    
    print("\n📋 Next Steps:")
    print("1. Copy .env.example to .env and configure your settings")
    print("2. Run: python -m uvicorn app.main:app --reload")
    print("3. Access API documentation at: http://localhost:8000/docs")
    print("4. Start generating amazing AI content!")
    
    print("\n💡 For production deployment:")
    print("- Use environment variables for sensitive configuration")
    print("- Enable GPU acceleration if available")
    print("- Configure proper logging and monitoring")
    print("- Set up reverse proxy (nginx) for production")

if __name__ == "__main__":
    main()