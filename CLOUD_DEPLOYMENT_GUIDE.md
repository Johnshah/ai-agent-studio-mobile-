# 🚀 AI Agent Studio Cloud - Deployment Guide

**Complete Guide for Deploying Frontend App + Cloud Backend Architecture**

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Backend Deployment](#backend-deployment)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  Mobile App     │ ← Android APK (Poco X6 Pro Optimized)
│  (React Native) │
└────────┬────────┘
         │ HTTPS + WebSocket
         ↓
┌─────────────────┐
│  Cloud Backend  │ ← FastAPI Server (Python)
│   (FastAPI)     │
└────────┬────────┘
         │ API Calls
         ↓
┌─────────────────┐
│ Hugging Face    │ ← AI Model Processing
│   AI Models     │   (Video, Audio, Image, Code)
└─────────────────┘
```

---

## 📦 Prerequisites

### For Backend Deployment:
- Python 3.11+
- Docker & Docker Compose (optional)
- Hugging Face Account & API Token
- Cloud Platform Account (Heroku, AWS, GCP, Azure, or Railway)

### For Mobile App:
- Node.js 18+ & npm
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Expo Account (for building APK)

---

## 🌐 Backend Deployment

### Method 1: Deploy to Hugging Face Spaces (Recommended)

**Step 1: Create Hugging Face Space**

```bash
# Install Hugging Face CLI
pip install huggingface_hub

# Login to Hugging Face
huggingface-cli login

# Create new Space
cd cloud-backend
huggingface-cli repo create ai-agent-studio-cloud --type space --space_sdk docker

# Push to Hugging Face
git init
git add .
git commit -m "Initial cloud backend"
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/ai-agent-studio-cloud
git push hf main
```

**Step 2: Configure Environment Variables**

In your Hugging Face Space settings, add:

```
HUGGINGFACE_TOKEN=your_hf_token_here
JWT_SECRET=your_secret_key_here
ENV=production
PORT=7860
```

**Step 3: Your Backend URL**

```
https://huggingface.co/spaces/YOUR_USERNAME/ai-agent-studio-cloud
```

### Method 2: Deploy to Heroku

**Step 1: Install Heroku CLI**

```bash
# macOS
brew install heroku/brew/heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh
```

**Step 2: Create & Deploy**

```bash
cd cloud-backend

# Login to Heroku
heroku login

# Create app
heroku create ai-agent-studio-cloud

# Set environment variables
heroku config:set HUGGINGFACE_TOKEN=your_token_here
heroku config:set JWT_SECRET=your_secret_here
heroku config:set ENV=production

# Add PostgreSQL (optional)
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git init
git add .
git commit -m "Deploy cloud backend"
git push heroku main

# Check logs
heroku logs --tail
```

**Your Backend URL:**
```
https://ai-agent-studio-cloud.herokuapp.com
```

### Method 3: Deploy to Railway

**Step 1: Install Railway CLI**

```bash
npm install -g @railway/cli
```

**Step 2: Deploy**

```bash
cd cloud-backend

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variables
railway variables set HUGGINGFACE_TOKEN=your_token_here
railway variables set JWT_SECRET=your_secret_here

# Get URL
railway domain
```

### Method 4: Deploy with Docker

**Step 1: Build Image**

```bash
cd cloud-backend

# Build Docker image
docker build -t ai-agent-studio-cloud .

# Test locally
docker run -p 7860:7860 \
  -e HUGGINGFACE_TOKEN=your_token \
  -e JWT_SECRET=your_secret \
  ai-agent-studio-cloud
```

**Step 2: Deploy to Cloud**

```bash
# Tag for Docker Hub
docker tag ai-agent-studio-cloud your-username/ai-agent-studio-cloud:latest

# Push to Docker Hub
docker push your-username/ai-agent-studio-cloud:latest

# Deploy on any cloud platform that supports Docker
```

### Method 5: Deploy with Docker Compose (Full Stack)

```bash
cd cloud-backend

# Create .env file
cat > .env << EOF
HUGGINGFACE_TOKEN=your_token_here
JWT_SECRET=your_secret_key_here
ENV=production
EOF

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📱 Mobile App Deployment

### Method 1: Build APK with EAS (Recommended)

**Step 1: Configure App**

```bash
cd cloud-mobile-app

# Install dependencies
npm install

# Login to Expo
eas login

# Configure EAS
eas build:configure
```

**Step 2: Update API URL**

Edit `src/services/CloudAPIService.ts`:

```typescript
// Replace with your backend URL
const API_BASE_URL = 'https://your-backend.herokuapp.com/api/v1';
```

Edit `src/services/WebSocketService.ts`:

```typescript
// Replace with your WebSocket URL
const WS_BASE_URL = 'wss://your-backend.herokuapp.com/ws';
```

**Step 3: Build APK**

```bash
# Build APK for Android
eas build -p android --profile production

# Download APK when complete
# APK will be available in your Expo account
```

**Step 4: Install on Poco X6 Pro**

1. Download APK from Expo build page
2. Transfer to your phone
3. Enable "Install from Unknown Sources"
4. Install the APK

### Method 2: Build Locally (No EAS)

**Step 1: Setup**

```bash
cd cloud-mobile-app

# Install dependencies
npm install

# Update API URLs (same as above)
```

**Step 2: Build**

```bash
# Build APK locally
expo build:android -t apk

# Or use Expo's build service
expo build:android
```

### Method 3: Development Build

**For Testing:**

```bash
cd cloud-mobile-app

# Start Expo server
npm start

# Scan QR code with Expo Go app on Poco X6 Pro
```

---

## ⚙️ Configuration

### Backend Configuration

**Environment Variables:**

```bash
# Required
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxx        # Your HF API token
JWT_SECRET=your-secret-key-here          # Random secret for JWT
ENV=production                           # Environment

# Optional Cloud Storage
CLOUD_STORAGE_PROVIDER=aws               # aws, gcp, azure, or local
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=your-bucket

# Optional Redis
REDIS_URL=redis://localhost:6379
```

### Mobile App Configuration

**Update URLs in these files:**

1. **CloudAPIService.ts** - Backend API URL
2. **WebSocketService.ts** - WebSocket URL

**For Production:**

```typescript
// CloudAPIService.ts
const API_BASE_URL = 'https://your-backend-url.com/api/v1';

// WebSocketService.ts
const WS_BASE_URL = 'wss://your-backend-url.com/ws';
```

---

## 🧪 Testing

### Test Backend

```bash
# Health check
curl https://your-backend-url.com/api/v1/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-29T...",
  "services": {...}
}
```

### Test Mobile App

1. **Open app on Poco X6 Pro**
2. **Register new account**
3. **Test each feature:**
   - Video Generation
   - Audio Generation
   - Image Generation
   - Code Generation
4. **Verify real-time progress updates**
5. **Check WebSocket connectivity**

### Performance Test

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API performance
ab -n 100 -c 10 https://your-backend-url.com/api/v1/health
```

---

## 🔧 Troubleshooting

### Backend Issues

**1. Port Already in Use**

```bash
# Kill process on port 7860
kill -9 $(lsof -t -i:7860)
```

**2. Hugging Face API Errors**

```bash
# Verify token
export HUGGINGFACE_TOKEN=your_token
python -c "from huggingface_hub import HfApi; print(HfApi().whoami())"
```

**3. Memory Issues**

```bash
# Increase Docker memory
docker-compose down
docker system prune -a
docker-compose up -d
```

### Mobile App Issues

**1. Can't Connect to Backend**

- Check if backend URL is correct
- Verify backend is running
- Check firewall/CORS settings

**2. WebSocket Connection Failed**

- Ensure WebSocket URL uses `wss://` for HTTPS
- Check if backend supports WebSocket
- Verify no proxy blocking WebSocket

**3. APK Install Failed**

- Enable "Unknown Sources" in Android settings
- Check if APK is corrupted (re-download)
- Verify Poco X6 Pro has enough storage

**4. Generation Timeout**

- Check internet connection
- Verify Hugging Face API quota
- Check backend logs for errors

---

## 🎯 Quick Start Commands

### Deploy Everything (Full Stack)

```bash
# 1. Deploy Backend to Heroku
cd cloud-backend
heroku create ai-studio-cloud
heroku config:set HUGGINGFACE_TOKEN=your_token
git push heroku main

# 2. Get Backend URL
heroku info

# 3. Update Mobile App URLs
cd ../cloud-mobile-app
# Edit CloudAPIService.ts and WebSocketService.ts with your URL

# 4. Build APK
eas build -p android --profile production

# 5. Download and install APK on Poco X6 Pro
```

---

## 📞 Support

- **Documentation**: See COMPLETE_INSTALLATION_GUIDE.md
- **Issues**: Check GitHub Issues
- **Discord**: Join our community server
- **Email**: support@aiagentstudio.com

---

## 🎉 Success!

Your AI Agent Studio Cloud is now deployed!

**Mobile App**: APK installed on Poco X6 Pro  
**Backend**: Running on cloud with Hugging Face  
**WebSocket**: Real-time updates active  

**Now you can create:**
- 🎬 AI Videos
- 🎵 AI Music & Audio
- 🖼️ AI Images
- 💻 AI Code

Enjoy your cloud-powered AI creation suite! 🚀