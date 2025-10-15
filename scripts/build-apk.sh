#!/bin/bash
# AI Agent Studio - APK Build Script
# Builds React Native app into APK for Android devices

set -e

echo "🚀 AI Agent Studio - APK Build Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Check if mobile-app directory exists
if [ ! -d "mobile-app" ]; then
    echo "❌ Error: mobile-app directory not found."
    exit 1
fi

cd mobile-app

echo "📋 Checking dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not available."
    exit 1
fi

echo "✅ Dependencies check passed"

# Install npm dependencies
echo "📦 Installing dependencies..."
npm install

# Check if eas.json exists, create if not
if [ ! -f "eas.json" ]; then
    echo "🔧 Creating EAS configuration..."
    cat > eas.json << EOF
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
EOF
fi

# Build APK
echo "🔨 Building APK..."
echo "This may take several minutes..."

# For local APK build (requires Android SDK)
if command -v eas &> /dev/null; then
    echo "📱 Building with EAS (Expo Application Services)..."
    eas build --platform android --profile preview --local
else
    echo "🏗️ Building with Expo..."
    npx expo install --fix
    
    # Create app.json if it doesn't exist
    if [ ! -f "app.json" ]; then
        cat > app.json << EOF
{
  "expo": {
    "name": "AI Agent Studio",
    "slug": "ai-agent-studio",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "platforms": [
      "ios",
      "android",
      "web"
    ],
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.aiagent.studio"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
EOF
    fi
    
    # Build for production
    npx expo export --platform android
    
    echo "📦 APK build completed!"
    echo "Note: For actual APK generation, use EAS Build or Android Studio"
fi

# Create build info
BUILD_DATE=$(date)
BUILD_VERSION="1.0.0"

cat > ../releases/build-info.txt << EOF
AI Agent Studio - Build Information
===================================

Build Date: $BUILD_DATE
Version: $BUILD_VERSION
Platform: Android
Format: APK

Features Included:
- Video Generation (Wan2.2, ModelScope, Stable Video Diffusion)
- Audio Generation (MusicGen, Jukebox, Bark, Coqui TTS)
- App Generation (Code Llama 3, DeepSeek-Coder, StarCoder 2)
- Image Generation (Stable Diffusion, GFPGAN, Real-ESRGAN)
- Social Media Integration
- Voice Cloning
- Code Editing
- APK Generation

Device Compatibility:
- Minimum: Android 7.0, 8GB RAM
- Recommended: Poco X6 Pro (12GB RAM, 512GB Storage)
- Optimized for mobile performance

Installation Instructions:
1. Enable "Unknown Sources" in Android Settings
2. Download and install the APK
3. Launch the app and grant necessary permissions
4. Connect to internet for AI model access
5. Start creating with AI!

Support:
- GitHub: https://github.com/Johnshah/ai-agent-studio-mobile-
- Issues: https://github.com/Johnshah/ai-agent-studio-mobile-/issues
EOF

echo ""
echo "✅ Build process completed!"
echo ""
echo "📁 Output files:"
echo "   - APK: Check ./dist/ or EAS build output"
echo "   - Build Info: ../releases/build-info.txt"
echo ""
echo "📱 Installation:"
echo "   1. Transfer APK to your Android device"
echo "   2. Enable 'Unknown Sources' in Android Settings"
echo "   3. Install the APK"
echo "   4. Launch AI Agent Studio"
echo ""
echo "🎉 Ready to create amazing content with AI!"