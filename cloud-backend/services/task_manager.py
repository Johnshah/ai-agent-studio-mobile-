"""
Task Manager Service for AI Agent Studio Cloud Backend
Handles task queuing, progress tracking, and result management
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
import json
import logging
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

class TaskStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(Enum):
    VIDEO_GENERATION = "video_generation"
    AUDIO_GENERATION = "audio_generation"
    IMAGE_GENERATION = "image_generation"
    CODE_GENERATION = "code_generation"
    TEXT_GENERATION = "text_generation"

@dataclass
class Task:
    id: str
    type: TaskType
    status: TaskStatus
    user_id: str
    prompt: str
    parameters: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: int = 0
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    estimated_duration: Optional[int] = None  # seconds
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        # Convert datetime objects to ISO strings
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, (TaskStatus, TaskType)):
                data[key] = value.value
        return data

class TaskManager:
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.task_queue: asyncio.Queue = asyncio.Queue()
        self.active_tasks: Dict[str, asyncio.Task] = {}
        self.max_concurrent_tasks = 5
        self.processing = False
        
        # Task estimation times (seconds)
        self.task_estimations = {
            TaskType.VIDEO_GENERATION: 180,  # 3 minutes
            TaskType.AUDIO_GENERATION: 60,   # 1 minute
            TaskType.IMAGE_GENERATION: 30,   # 30 seconds
            TaskType.CODE_GENERATION: 15,    # 15 seconds
            TaskType.TEXT_GENERATION: 10,    # 10 seconds
        }
    
    async def create_task(
        self, 
        task_type: TaskType, 
        user_id: str, 
        prompt: str, 
        parameters: Dict[str, Any] = None
    ) -> str:
        """Create a new task and add it to the queue"""
        task_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        task = Task(
            id=task_id,
            type=task_type,
            status=TaskStatus.PENDING,
            user_id=user_id,
            prompt=prompt,
            parameters=parameters or {},
            created_at=now,
            updated_at=now,
            estimated_duration=self.task_estimations.get(task_type, 60)
        )
        
        self.tasks[task_id] = task
        await self.task_queue.put(task_id)
        
        logger.info(f"Created task {task_id} of type {task_type.value} for user {user_id}")
        
        # Start processing if not already running
        if not self.processing:
            asyncio.create_task(self.process_queue())
        
        return task_id
    
    async def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        return self.tasks.get(task_id)
    
    async def get_user_tasks(self, user_id: str, limit: int = 50) -> List[Task]:
        """Get all tasks for a user"""
        user_tasks = [
            task for task in self.tasks.values() 
            if task.user_id == user_id
        ]
        # Sort by creation time, newest first
        user_tasks.sort(key=lambda x: x.created_at, reverse=True)
        return user_tasks[:limit]
    
    async def update_task_progress(self, task_id: str, progress: int, status: TaskStatus = None):
        """Update task progress and status"""
        if task_id not in self.tasks:
            return
        
        task = self.tasks[task_id]
        task.progress = max(0, min(100, progress))
        task.updated_at = datetime.utcnow()
        
        if status:
            task.status = status
            if status == TaskStatus.PROCESSING and not task.started_at:
                task.started_at = datetime.utcnow()
            elif status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
                task.completed_at = datetime.utcnow()
        
        logger.debug(f"Task {task_id} progress: {progress}%, status: {task.status.value}")
    
    async def complete_task(self, task_id: str, result: Dict[str, Any]):
        """Mark task as completed with result"""
        if task_id not in self.tasks:
            return
        
        task = self.tasks[task_id]
        task.status = TaskStatus.COMPLETED
        task.progress = 100
        task.result = result
        task.completed_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()
        
        # Remove from active tasks
        if task_id in self.active_tasks:
            del self.active_tasks[task_id]
        
        logger.info(f"Task {task_id} completed successfully")
    
    async def fail_task(self, task_id: str, error: str):
        """Mark task as failed with error"""
        if task_id not in self.tasks:
            return
        
        task = self.tasks[task_id]
        task.status = TaskStatus.FAILED
        task.error = error
        task.completed_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()
        
        # Remove from active tasks
        if task_id in self.active_tasks:
            del self.active_tasks[task_id]
        
        logger.error(f"Task {task_id} failed: {error}")
    
    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a task"""
        if task_id not in self.tasks:
            return False
        
        task = self.tasks[task_id]
        
        # If task is still pending, just mark as cancelled
        if task.status == TaskStatus.PENDING:
            task.status = TaskStatus.CANCELLED
            task.completed_at = datetime.utcnow()
            task.updated_at = datetime.utcnow()
            return True
        
        # If task is processing, cancel the asyncio task
        if task_id in self.active_tasks:
            self.active_tasks[task_id].cancel()
            task.status = TaskStatus.CANCELLED
            task.completed_at = datetime.utcnow()
            task.updated_at = datetime.utcnow()
            del self.active_tasks[task_id]
            return True
        
        return False
    
    async def process_queue(self):
        """Process tasks from the queue"""
        self.processing = True
        
        try:
            while True:
                # Check if we have capacity for more tasks
                if len(self.active_tasks) >= self.max_concurrent_tasks:
                    await asyncio.sleep(1)
                    continue
                
                try:
                    # Wait for a task with timeout to prevent blocking forever
                    task_id = await asyncio.wait_for(self.task_queue.get(), timeout=5.0)
                    
                    if task_id in self.tasks:
                        # Start processing the task
                        process_task = asyncio.create_task(self._process_single_task(task_id))
                        self.active_tasks[task_id] = process_task
                    
                except asyncio.TimeoutError:
                    # Check if there are any active tasks, if not, stop processing
                    if not self.active_tasks:
                        break
                    continue
                
        except Exception as e:
            logger.error(f"Error in task processing queue: {e}")
        finally:
            self.processing = False
    
    async def _process_single_task(self, task_id: str):
        """Process a single task"""
        task = self.tasks.get(task_id)
        if not task:
            return
        
        try:
            await self.update_task_progress(task_id, 0, TaskStatus.PROCESSING)
            
            # Import here to avoid circular imports
            from .ai_processor import AIProcessor
            
            processor = AIProcessor()
            result = await processor.process_task(task)
            
            await self.complete_task(task_id, result)
            
        except asyncio.CancelledError:
            await self.update_task_progress(task_id, task.progress, TaskStatus.CANCELLED)
            logger.info(f"Task {task_id} was cancelled")
        except Exception as e:
            await self.fail_task(task_id, str(e))
        finally:
            # Clean up
            if task_id in self.active_tasks:
                del self.active_tasks[task_id]
    
    async def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue status"""
        pending_count = sum(1 for task in self.tasks.values() if task.status == TaskStatus.PENDING)
        processing_count = len(self.active_tasks)
        completed_count = sum(1 for task in self.tasks.values() if task.status == TaskStatus.COMPLETED)
        failed_count = sum(1 for task in self.tasks.values() if task.status == TaskStatus.FAILED)
        
        return {
            "queue_size": self.task_queue.qsize(),
            "active_tasks": processing_count,
            "max_concurrent": self.max_concurrent_tasks,
            "total_tasks": len(self.tasks),
            "pending": pending_count,
            "processing": processing_count,
            "completed": completed_count,
            "failed": failed_count,
            "is_processing": self.processing
        }
    
    async def cleanup_old_tasks(self, days: int = 7):
        """Clean up old completed/failed tasks"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        tasks_to_remove = []
        for task_id, task in self.tasks.items():
            if (task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED] and
                task.updated_at < cutoff_date):
                tasks_to_remove.append(task_id)
        
        for task_id in tasks_to_remove:
            del self.tasks[task_id]
        
        logger.info(f"Cleaned up {len(tasks_to_remove)} old tasks")
        return len(tasks_to_remove)

# Global task manager instance
task_manager = TaskManager()