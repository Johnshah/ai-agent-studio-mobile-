#!/bin/bash
# AI Agent Studio - Hugging Face Deployment Script
# Deploys the complete AI studio to Hugging Face Spaces for free hosting

set -e

echo "🚀 AI Agent Studio - Hugging Face Deployment"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Check if huggingface-spaces directory exists
if [ ! -d "huggingface-spaces" ]; then
    echo "❌ Error: huggingface-spaces directory not found."
    exit 1
fi

echo "📋 Preparing deployment..."

# Create deployment directory
DEPLOY_DIR="huggingface-deployment"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy Hugging Face Spaces files
echo "📂 Copying Hugging Face Spaces files..."
cp -r huggingface-spaces/* $DEPLOY_DIR/

# Copy backend models
echo "🤖 Copying AI models..."
mkdir -p $DEPLOY_DIR/backend/app/models
cp backend/app/models/enhanced_*.py $DEPLOY_DIR/backend/app/models/

# Create a simplified version for Hugging Face Spaces
echo "🔧 Creating Hugging Face optimized version..."

# Create .gitignore for deployment
cat > $DEPLOY_DIR/.gitignore << 'EOF'
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
.env
.venv
env/
venv/
.DS_Store
*.log
.pytest_cache/
.coverage
htmlcov/
.tox/
dist/
build/
*.egg-info/
.idea/
.vscode/
*.swp
*.swo
*~
node_modules/
static/generated/
temp/
uploads/
EOF

# Create README for Hugging Face Spaces
cat > $DEPLOY_DIR/README.md << 'EOF'
---
title: AI Agent Studio
emoji: 🤖
colorFrom: purple
colorTo: blue
sdk: gradio
sdk_version: 4.8.0
app_file: app.py
pinned: true
license: mit
tags:
  - ai
  - video-generation
  - audio-generation
  - app-development
  - image-generation
  - mobile
  - free
  - open-source
short_description: Complete AI-powered creative suite for mobile devices
---

# 🤖 AI Agent Studio - Complete Creative Suite

**The ultimate free AI-powered creative platform for mobile devices!**

## ✨ What Can You Create?

- 🎬 **AI Videos**: Wan2.2, ModelScope, Stable Video Diffusion
- 🎵 **AI Audio**: MusicGen, Jukebox, Bark, Coqui TTS
- 📱 **AI Apps**: Code Llama 3, DeepSeek-Coder, StarCoder 2
- 🎨 **AI Images**: Stable Diffusion XL, GFPGAN, Real-ESRGAN

## 📱 Mobile Optimized

Specially optimized for Poco X6 Pro (12GB RAM) and 8GB+ RAM devices.

## 🆓 Completely Free

All AI models are open-source with no usage limits or subscription fees.

## 🔗 Links

- [GitHub Repository](https://github.com/Johnshah/ai-agent-studio-mobile-)
- [Mobile App Download](https://github.com/Johnshah/ai-agent-studio-mobile-/releases)
- [Documentation](https://github.com/Johnshah/ai-agent-studio-mobile-/wiki)

**Made with ❤️ using open-source AI models**
EOF

# Create a space configuration
cat > $DEPLOY_DIR/spaces.py << 'EOF'
# Hugging Face Spaces Configuration for AI Agent Studio

import os
import logging
from pathlib import Path

# Configure logging for Spaces
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Spaces-specific configurations
SPACES_CONFIG = {
    'title': 'AI Agent Studio',
    'description': 'Complete AI-powered creative suite for mobile devices',
    'max_concurrent_users': 10,
    'enable_queue': True,
    'queue_max_size': 20,
    'timeout': 300,  # 5 minutes max per generation
    'allow_flagging': 'never',
    'show_error': True,
    'show_tips': True,
    'enable_monitoring': True
}

# Model configurations optimized for Spaces
MODEL_CONFIG = {
    'video': {
        'max_duration': 60,  # Reduced for Spaces
        'max_resolution': '720p',  # Optimized for Spaces GPU
        'batch_size': 1
    },
    'audio': {
        'max_duration': 120,
        'max_batch_size': 1,
        'sample_rate': 44100
    },
    'image': {
        'max_images': 4,  # Reduced for Spaces
        'max_resolution': '1024x1024',
        'batch_size': 1
    },
    'code': {
        'max_tokens': 4096,  # Optimized for Spaces
        'timeout': 60
    }
}

# Resource limits for Spaces
RESOURCE_LIMITS = {
    'cpu_count': 2,
    'memory_limit': '16GB',
    'gpu_memory': '16GB',
    'disk_space': '50GB',
    'network_timeout': 30
}

def get_spaces_config():
    """Get configuration optimized for Hugging Face Spaces"""
    return SPACES_CONFIG

def get_model_config():
    """Get model configuration for Spaces"""
    return MODEL_CONFIG

def get_resource_limits():
    """Get resource limits for Spaces"""
    return RESOURCE_LIMITS
EOF

# Create optimized requirements for Spaces
cat > $DEPLOY_DIR/requirements.txt << 'EOF'
# Optimized for Hugging Face Spaces
gradio==4.8.0
torch>=2.0.0,<2.2.0
transformers>=4.35.0
diffusers>=0.24.0
accelerate>=0.24.0
numpy>=1.24.0,<2.0.0
Pillow>=10.0.0
requests>=2.31.0
aiohttp>=3.9.0
aiofiles>=23.2.0
python-multipart>=0.0.6
pydantic>=2.5.0
fastapi>=0.104.0
uvicorn>=0.24.0
python-dotenv>=1.0.0
asyncio
pathlib
typing-extensions>=4.8.0

# Audio processing (lightweight)
librosa>=0.10.0,<0.11.0
soundfile>=0.12.0

# Image processing (essential only)
opencv-python-headless>=4.8.0

# Utilities
scipy>=1.11.0,<1.12.0
pyyaml>=6.0.0
EOF

# Create deployment info
cat > $DEPLOY_DIR/deployment-info.md << EOF
# AI Agent Studio - Hugging Face Spaces Deployment

## Deployment Information

- **Deployment Date**: $(date)
- **Version**: 1.0.0
- **Platform**: Hugging Face Spaces
- **SDK**: Gradio 4.8.0
- **Python**: 3.10+

## Features Deployed

### 🎬 Video Generation
- Wan2.2 (ModelScope)
- ModelScope Text2Video
- Stable Video Diffusion
- Deforum Stable Diffusion

### 🎵 Audio Generation
- MusicGen (Meta)
- Jukebox (OpenAI)
- Bark (Suno AI)
- Coqui TTS
- ChatterBox (Voice Cloning)

### 📱 App Development
- Code Llama 3 (Meta)
- DeepSeek-Coder
- StarCoder 2 (BigCode)
- WizardCoder
- Mistral 7B

### 🎨 Image Generation
- Stable Diffusion XL
- Automatic1111 WebUI
- ComfyUI
- GFPGAN (Face Restoration)
- Real-ESRGAN (Upscaling)
- RemBG (Background Removal)

## Configuration

### Resource Optimization
- **GPU**: Automatic detection and usage
- **CPU**: Multi-core processing
- **Memory**: Optimized for 16GB limit
- **Queue**: Enabled for concurrent users

### Model Settings
- **Video**: Max 60s duration, 720p resolution
- **Audio**: Max 120s duration, 44.1kHz sample rate
- **Image**: Max 4 images, 1024x1024 resolution
- **Code**: Max 4096 tokens, 60s timeout

### Security Features
- Input validation and sanitization
- Rate limiting per user
- Safe model execution environment
- No persistent user data storage

## Usage Instructions

1. **Access the Space**: Visit the Hugging Face Spaces URL
2. **Select Tool**: Choose from Video, Audio, App, or Image generation
3. **Enter Prompt**: Describe what you want to create
4. **Configure Settings**: Adjust model, style, and parameters
5. **Generate**: Click generate and wait for results
6. **Download**: Save your generated content

## Performance Tips

- Use shorter durations for faster generation
- Choose appropriate resolution for your needs
- Be specific in prompts for better results
- Use queue system during high traffic

## Support

- **GitHub**: [Repository Issues](https://github.com/Johnshah/ai-agent-studio-mobile-/issues)
- **Documentation**: [Project Wiki](https://github.com/Johnshah/ai-agent-studio-mobile-/wiki)
- **Community**: [GitHub Discussions](https://github.com/Johnshah/ai-agent-studio-mobile-/discussions)

## Technical Details

### Architecture
- **Frontend**: Gradio web interface
- **Backend**: FastAPI with async processing
- **Models**: Hugging Face Transformers integration
- **Storage**: Temporary file system (auto-cleanup)

### API Endpoints
- `/video/generate` - Video generation
- `/audio/generate` - Audio generation
- `/app/generate` - App development
- `/image/generate` - Image generation
- `/models` - Model management

### Deployment Commands
\`\`\`bash
# Deploy to Hugging Face Spaces
git clone https://huggingface.co/spaces/YourUsername/ai-agent-studio
cd ai-agent-studio
git add .
git commit -m "Deploy AI Agent Studio"
git push
\`\`\`

---

**🚀 Ready to create amazing content with AI!**
EOF

echo "✅ Deployment package created in '$DEPLOY_DIR'"
echo ""
echo "📋 Next Steps:"
echo "1. Create a new Hugging Face Space:"
echo "   - Go to https://huggingface.co/new-space"
echo "   - Name: ai-agent-studio"
echo "   - SDK: Gradio"
echo "   - Hardware: GPU (recommended)"
echo ""
echo "2. Upload deployment files:"
echo "   - Copy contents from '$DEPLOY_DIR' to your Space repository"
echo "   - Commit and push to deploy"
echo ""
echo "3. Access your deployed app:"
echo "   - Visit: https://huggingface.co/spaces/YourUsername/ai-agent-studio"
echo ""
echo "🎉 Your AI Agent Studio will be live and free to use!"

# Create a quick deploy script
cat > $DEPLOY_DIR/quick-deploy.sh << 'EOF'
#!/bin/bash
# Quick deployment to Hugging Face Spaces

echo "🚀 Quick Deploy to Hugging Face Spaces"
echo "======================================"

# Check if git is configured
if ! git config --get user.name &> /dev/null; then
    echo "Please configure git first:"
    echo "git config --global user.name 'Your Name'"
    echo "git config --global user.email 'your.email@example.com'"
    exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

# Add all files
git add .

# Commit
git commit -m "Deploy AI Agent Studio to Hugging Face Spaces

✨ Features:
- 🎬 Video Generation (Wan2.2, Stable Video Diffusion)
- 🎵 Audio Generation (MusicGen, Bark, Jukebox)
- 📱 App Development (Code Llama 3, DeepSeek-Coder)
- 🎨 Image Generation (Stable Diffusion XL, GFPGAN)
- 🔧 All open-source models
- 📱 Mobile optimized interface

🚀 Ready for production use!"

echo "✅ Files committed locally"
echo ""
echo "📤 To deploy to Hugging Face Spaces:"
echo "1. Create a new Space at https://huggingface.co/new-space"
echo "2. Set the remote URL:"
echo "   git remote add origin https://huggingface.co/spaces/YourUsername/ai-agent-studio"
echo "3. Push to deploy:"
echo "   git push -u origin main"
echo ""
echo "🎉 Your app will be live in a few minutes!"
EOF

chmod +x $DEPLOY_DIR/quick-deploy.sh

echo ""
echo "📁 Deployment package contents:"
echo "   - app.py (Gradio interface)"
echo "   - requirements.txt (Dependencies)"
echo "   - README.md (Space configuration)"
echo "   - AI model services"
echo "   - Deployment documentation"
echo "   - Quick deploy script"
echo ""
echo "💡 Tip: Use 'cd $DEPLOY_DIR && ./quick-deploy.sh' for automated deployment"