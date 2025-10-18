"""
Projects Management API Router
"""

from fastapi import APIRouter, HTTPException, Form
from typing import Optional, List, Dict, Any
from datetime import datetime
import json

router = APIRouter()

@router.get("/")
async def get_projects():
    """Get all projects"""
    # Mock projects data
    projects = [
        {
            "id": 1,
            "name": "AI Music Video",
            "type": "multimedia",
            "status": "active",
            "created_at": "2025-01-01T10:00:00",
            "generations": 5
        },
        {
            "id": 2,
            "name": "Mobile App Prototype",
            "type": "code",
            "status": "completed",
            "created_at": "2025-01-02T14:30:00",
            "generations": 12
        }
    ]
    
    return {
        "projects": projects,
        "total": len(projects)
    }

@router.post("/")
async def create_project(
    name: str = Form(...),
    project_type: str = Form(...),
    description: Optional[str] = Form(None)
):
    """Create a new project"""
    try:
        project_id = hash(f"{name}_{datetime.now().isoformat()}") % 10000
        
        new_project = {
            "id": project_id,
            "name": name,
            "type": project_type,
            "description": description,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "generations": 0
        }
        
        return {
            "success": True,
            "project": new_project,
            "message": f"Project '{name}' created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Project creation failed: {str(e)}")

@router.get("/{project_id}")
async def get_project(project_id: int):
    """Get specific project details"""
    # Mock project data
    project = {
        "id": project_id,
        "name": "Sample Project",
        "type": "multimedia",
        "description": "A sample AI-generated project",
        "status": "active",
        "created_at": "2025-01-01T10:00:00",
        "generations": [
            {
                "id": "vid_20250101_100000",
                "type": "video",
                "status": "completed",
                "created_at": "2025-01-01T10:15:00"
            },
            {
                "id": "aud_20250101_102000", 
                "type": "audio",
                "status": "completed",
                "created_at": "2025-01-01T10:30:00"
            }
        ]
    }
    
    return {"project": project}

@router.delete("/{project_id}")
async def delete_project(project_id: int):
    """Delete a project"""
    return {
        "success": True,
        "message": f"Project {project_id} deleted successfully"
    }