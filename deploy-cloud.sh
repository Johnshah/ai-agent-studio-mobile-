#!/bin/bash

##############################################################################
# AI Agent Studio Cloud - Automated Deployment Script
# This script automates the deployment of both backend and mobile app
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main deployment menu
show_menu() {
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     🚀 AI Agent Studio Cloud - Deployment Script 🚀      ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Select deployment target:"
    echo ""
    echo "  ${BLUE}1)${NC} Deploy Backend to Hugging Face Spaces"
    echo "  ${BLUE}2)${NC} Deploy Backend to Heroku"
    echo "  ${BLUE}3)${NC} Deploy Backend to Railway"
    echo "  ${BLUE}4)${NC} Deploy Backend with Docker"
    echo "  ${BLUE}5)${NC} Build Mobile App APK"
    echo "  ${BLUE}6)${NC} Deploy Full Stack (Backend + Mobile)"
    echo "  ${BLUE}7)${NC} Test Backend Locally"
    echo "  ${BLUE}8)${NC} Test Mobile App Locally"
    echo "  ${BLUE}9)${NC} Exit"
    echo ""
    read -p "Enter your choice [1-9]: " choice
    echo ""
}

# Deploy to Hugging Face Spaces
deploy_to_huggingface() {
    print_header "Deploying to Hugging Face Spaces"
    
    if ! command_exists huggingface-cli; then
        print_warning "Hugging Face CLI not found. Installing..."
        pip install huggingface_hub
    fi
    
    read -p "Enter your Hugging Face username: " hf_username
    read -p "Enter space name (default: ai-agent-studio-cloud): " space_name
    space_name=${space_name:-ai-agent-studio-cloud}
    
    print_info "Logging in to Hugging Face..."
    huggingface-cli login
    
    print_info "Creating Hugging Face Space..."
    huggingface-cli repo create "$space_name" --type space --space_sdk docker || true
    
    cd cloud-backend
    
    print_info "Initializing git repository..."
    git init
    git add .
    git commit -m "Deploy AI Agent Studio Cloud to Hugging Face Spaces"
    
    print_info "Pushing to Hugging Face..."
    git remote add hf "https://huggingface.co/spaces/$hf_username/$space_name" || git remote set-url hf "https://huggingface.co/spaces/$hf_username/$space_name"
    git push hf main --force
    
    cd ..
    
    print_success "Backend deployed to Hugging Face Spaces!"
    print_info "Your backend URL: https://huggingface.co/spaces/$hf_username/$space_name"
    print_warning "Remember to set HUGGINGFACE_TOKEN in Space settings!"
}

# Deploy to Heroku
deploy_to_heroku() {
    print_header "Deploying to Heroku"
    
    if ! command_exists heroku; then
        print_error "Heroku CLI not found. Please install from https://devcenter.heroku.com/articles/heroku-cli"
        return 1
    fi
    
    read -p "Enter Heroku app name (default: ai-agent-studio-cloud): " app_name
    app_name=${app_name:-ai-agent-studio-cloud}
    
    cd cloud-backend
    
    print_info "Logging in to Heroku..."
    heroku login
    
    print_info "Creating Heroku app..."
    heroku create "$app_name" || print_warning "App already exists"
    
    read -p "Enter your Hugging Face Token: " hf_token
    read -p "Enter JWT Secret (or press enter for auto-generate): " jwt_secret
    jwt_secret=${jwt_secret:-$(openssl rand -base64 32)}
    
    print_info "Setting environment variables..."
    heroku config:set HUGGINGFACE_TOKEN="$hf_token" --app "$app_name"
    heroku config:set JWT_SECRET="$jwt_secret" --app "$app_name"
    heroku config:set ENV=production --app "$app_name"
    
    print_info "Deploying to Heroku..."
    git init
    git add .
    git commit -m "Deploy AI Agent Studio Cloud to Heroku"
    git remote add heroku "https://git.heroku.com/$app_name.git" || git remote set-url heroku "https://git.heroku.com/$app_name.git"
    git push heroku main --force
    
    cd ..
    
    print_success "Backend deployed to Heroku!"
    heroku open --app "$app_name"
}

# Deploy to Railway
deploy_to_railway() {
    print_header "Deploying to Railway"
    
    if ! command_exists railway; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    cd cloud-backend
    
    print_info "Logging in to Railway..."
    railway login
    
    print_info "Initializing Railway project..."
    railway init
    
    read -p "Enter your Hugging Face Token: " hf_token
    read -p "Enter JWT Secret (or press enter for auto-generate): " jwt_secret
    jwt_secret=${jwt_secret:-$(openssl rand -base64 32)}
    
    print_info "Setting environment variables..."
    railway variables set HUGGINGFACE_TOKEN="$hf_token"
    railway variables set JWT_SECRET="$jwt_secret"
    railway variables set ENV=production
    
    print_info "Deploying to Railway..."
    railway up
    
    print_info "Getting deployment URL..."
    railway domain
    
    cd ..
    
    print_success "Backend deployed to Railway!"
}

# Deploy with Docker
deploy_with_docker() {
    print_header "Deploying with Docker"
    
    if ! command_exists docker; then
        print_error "Docker not found. Please install from https://docs.docker.com/get-docker/"
        return 1
    fi
    
    cd cloud-backend
    
    read -p "Enter your Hugging Face Token: " hf_token
    read -p "Enter JWT Secret (or press enter for auto-generate): " jwt_secret
    jwt_secret=${jwt_secret:-$(openssl rand -base64 32)}
    
    print_info "Creating .env file..."
    cat > .env << EOF
HUGGINGFACE_TOKEN=$hf_token
JWT_SECRET=$jwt_secret
ENV=production
EOF
    
    print_info "Building Docker image..."
    docker build -t ai-agent-studio-cloud .
    
    print_info "Starting Docker container..."
    docker run -d -p 7860:7860 --env-file .env --name ai-studio-cloud ai-agent-studio-cloud
    
    cd ..
    
    print_success "Backend deployed with Docker!"
    print_info "Backend running at: http://localhost:7860"
    print_info "View logs: docker logs -f ai-studio-cloud"
    print_info "Stop container: docker stop ai-studio-cloud"
}

# Build Mobile App APK
build_mobile_apk() {
    print_header "Building Mobile App APK"
    
    if ! command_exists npm; then
        print_error "Node.js/npm not found. Please install from https://nodejs.org/"
        return 1
    fi
    
    cd cloud-mobile-app
    
    print_info "Installing dependencies..."
    npm install
    
    if ! command_exists eas; then
        print_info "Installing EAS CLI..."
        npm install -g eas-cli
    fi
    
    print_info "Logging in to Expo..."
    eas login
    
    read -p "Enter your backend URL (e.g., https://your-app.herokuapp.com): " backend_url
    
    print_info "Updating API URLs..."
    # Note: In production, use proper configuration management
    print_warning "Please manually update URLs in:"
    print_warning "  - src/services/CloudAPIService.ts"
    print_warning "  - src/services/WebSocketService.ts"
    
    read -p "Press enter after updating URLs to continue..."
    
    print_info "Configuring EAS Build..."
    eas build:configure
    
    print_info "Building APK for Android..."
    eas build -p android --profile production
    
    cd ..
    
    print_success "APK build started!"
    print_info "Check build status: eas build:list"
    print_info "Download APK from your Expo account when ready"
}

# Test Backend Locally
test_backend_locally() {
    print_header "Testing Backend Locally"
    
    cd cloud-backend
    
    print_info "Installing Python dependencies..."
    pip install -r requirements.txt
    
    read -p "Enter your Hugging Face Token: " hf_token
    export HUGGINGFACE_TOKEN="$hf_token"
    export JWT_SECRET="test-secret-key"
    export ENV="development"
    
    print_info "Starting FastAPI server..."
    print_info "Server will run at: http://localhost:7860"
    print_info "API Docs: http://localhost:7860/docs"
    print_info "Press Ctrl+C to stop"
    
    python -m uvicorn main:app --host 0.0.0.0 --port 7860 --reload
    
    cd ..
}

# Test Mobile App Locally
test_mobile_locally() {
    print_header "Testing Mobile App Locally"
    
    cd cloud-mobile-app
    
    print_info "Installing dependencies..."
    npm install
    
    print_info "Starting Expo development server..."
    print_info "Scan QR code with Expo Go app on your Poco X6 Pro"
    print_info "Press Ctrl+C to stop"
    
    npm start
    
    cd ..
}

# Full Stack Deployment
deploy_full_stack() {
    print_header "Full Stack Deployment"
    
    print_info "This will deploy both backend and mobile app"
    read -p "Continue? (y/n): " confirm
    
    if [ "$confirm" != "y" ]; then
        return
    fi
    
    # Deploy backend first
    echo ""
    echo "Step 1: Deploy Backend"
    echo ""
    deploy_to_heroku
    
    # Build mobile app
    echo ""
    echo "Step 2: Build Mobile App"
    echo ""
    build_mobile_apk
    
    print_success "Full stack deployment initiated!"
}

# Main script execution
main() {
    # Check if running from correct directory
    if [ ! -d "cloud-backend" ] || [ ! -d "cloud-mobile-app" ]; then
        print_error "Please run this script from the ai-agent-studio root directory"
        exit 1
    fi
    
    while true; do
        show_menu
        
        case $choice in
            1) deploy_to_huggingface ;;
            2) deploy_to_heroku ;;
            3) deploy_to_railway ;;
            4) deploy_with_docker ;;
            5) build_mobile_apk ;;
            6) deploy_full_stack ;;
            7) test_backend_locally ;;
            8) test_mobile_locally ;;
            9) 
                print_success "Thanks for using AI Agent Studio Cloud Deployment Script!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-9."
                ;;
        esac
        
        echo ""
        read -p "Press enter to continue..."
        clear
    done
}

# Run main function
clear
main