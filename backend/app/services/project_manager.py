"""
Project Management Service
"""

class ProjectManager:
    """Service for managing AI generation projects"""
    
    def __init__(self):
        self.active_projects = []
        self.all_projects = []
    
    async def get_active_projects(self):
        """Get all active projects"""
        return self.active_projects
    
    async def get_all_projects(self):
        """Get all projects"""
        return self.all_projects
    
    async def health_check(self):
        """Check service health"""
        return {
            "status": "healthy",
            "active_projects": len(self.active_projects),
            "total_projects": len(self.all_projects)
        }