from fastapi import APIRouter, HTTPException, BackgroundTasks, Form, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json

from ..models.code_generation import CodeGenerationService

router = APIRouter()

# Initialize service
code_service = CodeGenerationService()

# Pydantic models
class AppGenerationRequest(BaseModel):
    description: str
    app_type: str = "react-native"
    features: Optional[List[str]] = None
    model_name: str = "deepseek_coder"
    include_tests: bool = True
    include_docs: bool = True

class CodeModificationRequest(BaseModel):
    original_code: str
    modification_request: str
    language: str = "typescript"
    model_name: str = "deepseek_coder"

class AppGenerationResponse(BaseModel):
    success: bool
    project_name: Optional[str] = None
    project_path: Optional[str] = None
    zip_url: Optional[str] = None
    files: Optional[Dict[str, str]] = None
    app_type: Optional[str] = None
    model_used: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    created_at: Optional[str] = None
    error: Optional[str] = None

@router.post("/generate-app", response_model=AppGenerationResponse)
async def generate_app(request: AppGenerationRequest):
    """
    Generate complete mobile/web application using AI
    
    Supported app types:
    - react-native: Cross-platform mobile app
    - flutter: Cross-platform mobile app (Dart)
    - nextjs: Full-stack web application
    - express: Node.js backend API
    - fastapi: Python backend API
    - django: Python web framework
    """
    try:
        if not request.description or len(request.description.strip()) == 0:
            raise HTTPException(status_code=400, detail="App description is required")
        
        result = await code_service.generate_app(
            description=request.description,
            app_type=request.app_type,
            features=request.features,
            model_name=request.model_name,
            include_tests=request.include_tests,
            include_docs=request.include_docs
        )
        
        return AppGenerationResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/modify-code")
async def modify_code(request: CodeModificationRequest):
    """
    Modify existing code based on user instructions
    """
    try:
        if not request.original_code or not request.modification_request:
            raise HTTPException(
                status_code=400, 
                detail="Both original code and modification request are required"
            )
        
        result = await code_service.modify_code(
            original_code=request.original_code,
            modification_request=request.modification_request,
            language=request.language,
            model_name=request.model_name
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-from-files")
async def generate_app_from_files(
    description: str = Form(...),
    app_type: str = Form("react-native"),
    model_name: str = Form("deepseek_coder"),
    files: List[UploadFile] = File(...)
):
    """
    Generate or modify app based on uploaded files (PDFs, code, structure)
    """
    try:
        # Process uploaded files
        processed_files = {}
        
        for file in files:
            content = await file.read()
            
            if file.filename.endswith('.pdf'):
                # Extract text from PDF
                processed_files[file.filename] = await _extract_pdf_content(content)
            elif file.filename.endswith(('.py', '.js', '.ts', '.dart', '.json')):
                # Code file
                processed_files[file.filename] = content.decode('utf-8')
            else:
                # Other text files
                try:
                    processed_files[file.filename] = content.decode('utf-8')
                except:
                    processed_files[file.filename] = f"Binary file: {file.filename}"
        
        # Enhanced description with file context
        enhanced_description = f"""
        {description}
        
        Based on the following uploaded files:
        {json.dumps(list(processed_files.keys()), indent=2)}
        
        File contents:
        {json.dumps(processed_files, indent=2)[:2000]}...
        """
        
        # Generate app with file context
        result = await code_service.generate_app(
            description=enhanced_description,
            app_type=app_type,
            model_name=model_name,
            include_tests=True,
            include_docs=True
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def get_code_models():
    """Get available code generation models"""
    return {
        "models": [
            {
                "id": "code_llama",
                "name": "Code Llama 3",
                "description": "Meta's advanced code generation model",
                "languages": ["python", "javascript", "typescript", "java", "c++"],
                "capabilities": ["code-generation", "code-completion", "debugging"],
                "github_url": "https://github.com/facebookresearch/codellama"
            },
            {
                "id": "deepseek_coder", 
                "name": "DeepSeek-Coder",
                "description": "Specialized coding AI model",
                "languages": ["all major languages"],
                "capabilities": ["full-stack-development", "mobile-apps", "web-apps"],
                "github_url": "https://github.com/deepseek-ai/DeepSeek-Coder"
            },
            {
                "id": "starcoder2",
                "name": "StarCoder 2",
                "description": "Next-generation code generation",
                "languages": ["80+ programming languages"],
                "capabilities": ["multi-language", "code-translation", "optimization"],
                "github_url": "https://github.com/bigcode-project/starcoder2"
            },
            {
                "id": "mistral",
                "name": "Mistral 7B",
                "description": "Versatile language model for coding",
                "languages": ["python", "javascript", "typescript"],
                "capabilities": ["general-purpose", "code-generation"],
                "github_url": "https://github.com/mistralai/mistral-src"
            },
            {
                "id": "wizardcoder",
                "name": "WizardCoder",
                "description": "Code-focused instruction-tuned model",
                "languages": ["python", "javascript", "java", "c++"],
                "capabilities": ["code-generation", "explanation", "debugging"],
                "github_url": "https://github.com/nlpxucan/WizardLM"
            }
        ]
    }

@router.get("/app-types")
async def get_app_types():
    """Get supported application types"""
    app_types = await code_service.get_supported_app_types()
    return {
        "app_types": [
            {
                "id": "react-native",
                "name": "React Native",
                "description": "Cross-platform mobile app (iOS & Android)",
                "languages": ["TypeScript", "JavaScript"],
                "deployment": "APK, App Store, Google Play"
            },
            {
                "id": "flutter",
                "name": "Flutter",
                "description": "Cross-platform mobile app with native performance",
                "languages": ["Dart"],
                "deployment": "APK, App Store, Google Play"
            },
            {
                "id": "nextjs",
                "name": "Next.js",
                "description": "Full-stack web application",
                "languages": ["TypeScript", "JavaScript"],
                "deployment": "Vercel, Netlify, Custom hosting"
            },
            {
                "id": "express",
                "name": "Express.js",
                "description": "Node.js backend API",
                "languages": ["TypeScript", "JavaScript"],
                "deployment": "Heroku, Railway, Custom server"
            },
            {
                "id": "fastapi",
                "name": "FastAPI",
                "description": "Python backend API",
                "languages": ["Python"],
                "deployment": "Heroku, Railway, Custom server"
            }
        ]
    }

@router.get("/templates")
async def get_app_templates():
    """Get pre-built app templates"""
    return {
        "templates": [
            {
                "id": "ecommerce",
                "name": "E-commerce App",
                "description": "Complete shopping app with cart, payments, user auth",
                "app_types": ["react-native", "flutter", "nextjs"],
                "features": ["user-auth", "product-catalog", "cart", "payments", "orders"]
            },
            {
                "id": "social-media",
                "name": "Social Media App",
                "description": "Social platform with posts, comments, likes, messaging",
                "app_types": ["react-native", "flutter"],
                "features": ["user-profiles", "posts", "comments", "messaging", "notifications"]
            },
            {
                "id": "productivity",
                "name": "Productivity App",
                "description": "Task management and productivity tracking",
                "app_types": ["react-native", "flutter", "nextjs"],
                "features": ["tasks", "calendar", "notes", "reminders", "analytics"]
            },
            {
                "id": "fitness",
                "name": "Fitness Tracker",
                "description": "Health and fitness tracking application",
                "app_types": ["react-native", "flutter"],
                "features": ["workouts", "nutrition", "progress-tracking", "social-sharing"]
            },
            {
                "id": "educational",
                "name": "Educational App",
                "description": "Learning platform with courses and quizzes",
                "app_types": ["react-native", "flutter", "nextjs"],
                "features": ["courses", "quizzes", "progress-tracking", "certificates"]
            }
        ]
    }

@router.post("/build-apk/{project_id}")
async def build_apk(project_id: str, background_tasks: BackgroundTasks):
    """
    Build APK from generated React Native or Flutter project
    """
    try:
        # Add APK building to background tasks
        background_tasks.add_task(_build_apk_task, project_id)
        
        return {
            "success": True,
            "message": f"APK build started for project {project_id}",
            "build_id": f"build_{project_id}_{int(datetime.now().timestamp())}",
            "estimated_time": "5-10 minutes"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/build-status/{build_id}")
async def get_build_status(build_id: str):
    """
    Get APK build status
    """
    # Implement build status tracking
    return {
        "build_id": build_id,
        "status": "building",  # building, completed, failed
        "progress": 65,
        "estimated_time_remaining": "3 minutes",
        "download_url": None  # Available when completed
    }

@router.post("/deploy")
async def deploy_app(
    project_id: str = Form(...),
    platform: str = Form(...),  # vercel, netlify, heroku, railway
    api_key: str = Form(...)
):
    """
    Deploy generated app to hosting platform
    """
    try:
        # Implement deployment logic
        deployment_result = await _deploy_to_platform(project_id, platform, api_key)
        
        return {
            "success": True,
            "platform": platform,
            "deployment_url": deployment_result["url"],
            "project_id": project_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def _extract_pdf_content(pdf_content: bytes) -> str:
    """Extract text content from PDF"""
    try:
        # Implement PDF text extraction
        # This is a placeholder implementation
        return "PDF content extracted here..."
        
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"

async def _build_apk_task(project_id: str):
    """Background task for building APK"""
    try:
        # Implement APK building logic
        # This would use EAS Build, Flutter build, or similar tools
        pass
        
    except Exception as e:
        print(f"APK build failed: {e}")

async def _deploy_to_platform(project_id: str, platform: str, api_key: str) -> Dict[str, str]:
    """Deploy app to hosting platform"""
    # Implement deployment logic for different platforms
    return {"url": f"https://{project_id}.{platform}.app"}

@router.get("/health")
async def code_service_health():
    """Code generation service health check"""
    health = await code_service.health_check()
    return health