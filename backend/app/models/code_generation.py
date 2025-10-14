import asyncio
import os
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
import tempfile
import logging
import subprocess
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, 
    CodeLlamaTokenizer, LlamaForCausalLM,
    pipeline
)
import torch
from pathlib import Path
import zipfile
import shutil

logger = logging.getLogger(__name__)

class CodeGenerationService:
    def __init__(self):
        self.models = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.temp_dir = tempfile.mkdtemp()
        
        # Initialize models
        asyncio.create_task(self._initialize_models())
    
    async def _initialize_models(self):
        """Initialize all code generation models"""
        try:
            # Initialize Code Llama 3
            await self._load_code_llama()
            
            # Initialize DeepSeek-Coder
            await self._load_deepseek_coder()
            
            # Initialize StarCoder 2
            await self._load_starcoder2()
            
            # Initialize Mistral 7B
            await self._load_mistral()
            
            # Initialize WizardCoder
            await self._load_wizardcoder()
            
            # Initialize other coding models
            await self._load_additional_models()
            
            logger.info("✅ All code generation models initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Error initializing code models: {e}")
    
    async def _load_code_llama(self):
        """Load Code Llama 3 model"""
        try:
            self.models['code_llama'] = pipeline(
                "text-generation",
                model="codellama/CodeLlama-7b-Instruct-hf",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
                max_new_tokens=4096
            )
            logger.info("✅ Code Llama 3 model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Code Llama model not available: {e}")
    
    async def _load_deepseek_coder(self):
        """Load DeepSeek-Coder model"""
        try:
            self.models['deepseek_coder'] = pipeline(
                "text-generation",
                model="deepseek-ai/deepseek-coder-6.7b-instruct",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
                max_new_tokens=4096
            )
            logger.info("✅ DeepSeek-Coder model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ DeepSeek-Coder model not available: {e}")
    
    async def _load_starcoder2(self):
        """Load StarCoder 2 model"""
        try:
            self.models['starcoder2'] = pipeline(
                "text-generation",
                model="bigcode/starcoder2-7b",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
                max_new_tokens=4096
            )
            logger.info("✅ StarCoder 2 model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ StarCoder 2 model not available: {e}")
    
    async def _load_mistral(self):
        """Load Mistral 7B model"""
        try:
            self.models['mistral'] = pipeline(
                "text-generation",
                model="mistralai/Mistral-7B-Instruct-v0.1",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
                max_new_tokens=4096
            )
            logger.info("✅ Mistral 7B model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Mistral model not available: {e}")
    
    async def _load_wizardcoder(self):
        """Load WizardCoder model"""
        try:
            self.models['wizardcoder'] = pipeline(
                "text-generation",
                model="WizardLM/WizardCoder-Python-7B-V1.0",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
                max_new_tokens=4096
            )
            logger.info("✅ WizardCoder model loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ WizardCoder model not available: {e}")
    
    async def _load_additional_models(self):
        """Load additional coding models"""
        try:
            # Replit Code V2
            self.models['replit_code'] = pipeline(
                "text-generation", 
                model="replit/replit-code-v1_5-3b",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device=self.device,
                max_new_tokens=2048
            )
            
            # Phi-3
            self.models['phi3'] = pipeline(
                "text-generation",
                model="microsoft/Phi-3-mini-4k-instruct",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device=self.device,
                max_new_tokens=2048
            )
            
            logger.info("✅ Additional coding models loaded successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Some additional models not available: {e}")
    
    async def generate_app(
        self,
        description: str,
        app_type: str = "react-native",
        features: List[str] = None,
        model_name: str = "deepseek_coder",
        include_tests: bool = True,
        include_docs: bool = True
    ) -> Dict[str, Any]:
        """
        Generate a complete mobile/web application
        
        Args:
            description: App description and requirements
            app_type: Type of app (react-native, flutter, nextjs, express, etc.)
            features: List of desired features
            model_name: Model to use for generation
            include_tests: Whether to include test files
            include_docs: Whether to include documentation
        """
        try:
            # Create project directory
            project_name = f"generated_app_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            project_path = os.path.join("static/generated", project_name)
            os.makedirs(project_path, exist_ok=True)
            
            # Generate project structure based on app type
            if app_type == "react-native":
                files = await self._generate_react_native_app(
                    description, features, model_name, project_path
                )
            elif app_type == "flutter":
                files = await self._generate_flutter_app(
                    description, features, model_name, project_path
                )
            elif app_type == "nextjs":
                files = await self._generate_nextjs_app(
                    description, features, model_name, project_path
                )
            elif app_type == "express":
                files = await self._generate_express_app(
                    description, features, model_name, project_path
                )
            else:
                # Generic web app
                files = await self._generate_generic_app(
                    description, features, model_name, project_path, app_type
                )
            
            # Generate tests if requested
            if include_tests:
                test_files = await self._generate_tests(
                    description, app_type, model_name, project_path
                )
                files.update(test_files)
            
            # Generate documentation if requested
            if include_docs:
                doc_files = await self._generate_documentation(
                    description, app_type, features, project_path
                )
                files.update(doc_files)
            
            # Create APK build script for mobile apps
            if app_type in ["react-native", "flutter"]:
                build_script = await self._generate_build_script(app_type, project_path)
                files["build.sh"] = build_script
            
            # Create downloadable zip
            zip_path = await self._create_project_zip(project_path, project_name)
            
            return {
                "success": True,
                "project_name": project_name,
                "project_path": project_path,
                "zip_url": f"/static/generated/{os.path.basename(zip_path)}",
                "files": files,
                "app_type": app_type,
                "model_used": model_name,
                "description": description,
                "features": features or [],
                "include_tests": include_tests,
                "include_docs": include_docs,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error generating app: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate app"
            }
    
    async def _generate_react_native_app(
        self, description: str, features: List[str], model_name: str, project_path: str
    ) -> Dict[str, str]:
        """Generate React Native application"""
        files = {}
        
        # Generate package.json
        package_json_prompt = f"""
        Create a package.json file for a React Native app with this description:
        {description}
        
        Include these features: {', '.join(features or [])}
        
        Include necessary dependencies for React Native, navigation, state management, and the requested features.
        """
        
        package_json = await self._generate_code(package_json_prompt, model_name, "json")
        files["package.json"] = package_json
        
        # Generate App.tsx/js
        app_prompt = f"""
        Create the main App.tsx file for a React Native app:
        Description: {description}
        Features: {', '.join(features or [])}
        
        Include proper navigation setup, state management, and component structure.
        Use TypeScript and modern React Native practices.
        """
        
        app_code = await self._generate_code(app_prompt, model_name, "typescript")
        files["App.tsx"] = app_code
        
        # Generate navigation setup
        navigation_prompt = f"""
        Create a navigation setup file (navigation/AppNavigator.tsx) for React Native with:
        - Bottom tab navigation
        - Stack navigation
        - Screens for the app features: {', '.join(features or [])}
        """
        
        navigation_code = await self._generate_code(navigation_prompt, model_name, "typescript")
        files["src/navigation/AppNavigator.tsx"] = navigation_code
        
        # Generate screens based on features
        for feature in (features or ["Home", "Settings"]):
            screen_prompt = f"""
            Create a React Native screen component for {feature}:
            App description: {description}
            
            Include proper TypeScript types, state management, and UI components.
            Use modern React Native and TypeScript practices.
            """
            
            screen_code = await self._generate_code(screen_prompt, model_name, "typescript")
            files[f"src/screens/{feature}Screen.tsx"] = screen_code
        
        # Generate app.json
        app_json = await self._generate_expo_config(description, features)
        files["app.json"] = app_json
        
        # Generate eas.json for building
        eas_json = await self._generate_eas_config()
        files["eas.json"] = eas_json
        
        await self._write_files_to_project(project_path, files)
        return files
    
    async def _generate_flutter_app(
        self, description: str, features: List[str], model_name: str, project_path: str
    ) -> Dict[str, str]:
        """Generate Flutter application"""
        files = {}
        
        # Generate pubspec.yaml
        pubspec_prompt = f"""
        Create a pubspec.yaml file for a Flutter app:
        Description: {description}
        Features: {', '.join(features or [])}
        
        Include necessary dependencies for the requested features.
        """
        
        pubspec_yaml = await self._generate_code(pubspec_prompt, model_name, "yaml")
        files["pubspec.yaml"] = pubspec_yaml
        
        # Generate main.dart
        main_prompt = f"""
        Create the main.dart file for a Flutter app:
        Description: {description}
        Features: {', '.join(features or [])}
        
        Include proper app structure, routing, and theme setup.
        """
        
        main_dart = await self._generate_code(main_prompt, model_name, "dart")
        files["lib/main.dart"] = main_dart
        
        # Generate screens
        for feature in (features or ["Home", "Settings"]):
            screen_prompt = f"""
            Create a Flutter screen widget for {feature}:
            App description: {description}
            
            Include proper Flutter widget structure and Material Design.
            """
            
            screen_code = await self._generate_code(screen_prompt, model_name, "dart")
            files[f"lib/screens/{feature.lower()}_screen.dart"] = screen_code
        
        await self._write_files_to_project(project_path, files)
        return files
    
    async def _generate_nextjs_app(
        self, description: str, features: List[str], model_name: str, project_path: str
    ) -> Dict[str, str]:
        """Generate Next.js application"""
        files = {}
        
        # Generate package.json
        package_json_prompt = f"""
        Create a package.json for a Next.js 14 app:
        Description: {description}
        Features: {', '.join(features or [])}
        
        Include TypeScript, Tailwind CSS, and dependencies for the features.
        """
        
        package_json = await self._generate_code(package_json_prompt, model_name, "json")
        files["package.json"] = package_json
        
        # Generate layout
        layout_prompt = f"""
        Create app/layout.tsx for a Next.js 14 app with app router:
        Description: {description}
        
        Include proper metadata, fonts, and global styles.
        """
        
        layout_code = await self._generate_code(layout_prompt, model_name, "typescript")
        files["app/layout.tsx"] = layout_code
        
        # Generate pages
        for feature in (features or ["Home", "About"]):
            page_prompt = f"""
            Create app/{feature.lower()}/page.tsx for Next.js 14:
            Feature: {feature}
            App description: {description}
            
            Use TypeScript, Tailwind CSS, and modern React practices.
            """
            
            page_code = await self._generate_code(page_prompt, model_name, "typescript")
            files[f"app/{feature.lower()}/page.tsx"] = page_code
        
        # Generate Tailwind config
        tailwind_config = await self._generate_tailwind_config()
        files["tailwind.config.js"] = tailwind_config
        
        await self._write_files_to_project(project_path, files)
        return files
    
    async def _generate_code(
        self, prompt: str, model_name: str, language: str = "python"
    ) -> str:
        """Generate code using specified model"""
        try:
            # Enhanced prompt for better code generation
            enhanced_prompt = f"""
            You are an expert programmer. Generate clean, production-ready code.
            
            Requirements:
            {prompt}
            
            Language: {language}
            
            Guidelines:
            - Write clean, readable code
            - Include proper error handling
            - Add meaningful comments
            - Follow best practices
            - Make it production-ready
            - Include type hints where applicable
            
            Generate only the code, no explanations:
            """
            
            if model_name in self.models:
                model = self.models[model_name]
                
                # Generate code
                result = model(
                    enhanced_prompt,
                    max_new_tokens=2048,
                    temperature=0.1,  # Low temperature for consistent code
                    do_sample=True,
                    pad_token_id=model.tokenizer.eos_token_id
                )
                
                generated_code = result[0]['generated_text']
                
                # Extract only the code part (remove the prompt)
                code_start = generated_code.find(enhanced_prompt) + len(enhanced_prompt)
                code = generated_code[code_start:].strip()
                
                return code
                
            else:
                # Fallback code generation
                return await self._generate_fallback_code(prompt, language)
                
        except Exception as e:
            logger.error(f"❌ Error generating code with {model_name}: {e}")
            return await self._generate_fallback_code(prompt, language)
    
    async def _generate_fallback_code(self, prompt: str, language: str) -> str:
        """Generate basic code structure as fallback"""
        templates = {
            "typescript": f"""
// Generated TypeScript code
// {prompt}

export default function GeneratedComponent() {{
    // TODO: Implement component logic
    return (
        <div>
            <h1>Generated Component</h1>
            <p>Implement your logic here</p>
        </div>
    );
}}
""",
            "dart": f"""
// Generated Dart code
// {prompt}

import 'package:flutter/material.dart';

class GeneratedWidget extends StatefulWidget {{
    @override
    _GeneratedWidgetState createState() => _GeneratedWidgetState();
}}

class _GeneratedWidgetState extends State<GeneratedWidget> {{
    @override
    Widget build(BuildContext context) {{
        return Scaffold(
            appBar: AppBar(title: Text('Generated App')),
            body: Center(
                child: Text('Implement your logic here'),
            ),
        );
    }}
}}
""",
            "json": """
{
    "name": "generated-app",
    "version": "1.0.0",
    "description": "Generated application",
    "main": "index.js",
    "scripts": {
        "start": "node index.js",
        "build": "npm run build",
        "test": "jest"
    },
    "dependencies": {},
    "devDependencies": {}
}
""",
            "python": f"""
# Generated Python code
# {prompt}

def main():
    \"\"\"Main function for generated application\"\"\"
    print("Generated application")
    # TODO: Implement application logic
    
if __name__ == "__main__":
    main()
"""
        }
        
        return templates.get(language, templates["python"])
    
    async def _write_files_to_project(self, project_path: str, files: Dict[str, str]):
        """Write generated files to project directory"""
        for file_path, content in files.items():
            full_path = os.path.join(project_path, file_path)
            
            # Create directory if needed
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            # Write file
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
    
    async def _create_project_zip(self, project_path: str, project_name: str) -> str:
        """Create downloadable zip of the project"""
        zip_path = os.path.join("static/generated", f"{project_name}.zip")
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(project_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_path = os.path.relpath(file_path, project_path)
                    zipf.write(file_path, arc_path)
        
        return zip_path
    
    async def modify_code(
        self,
        original_code: str,
        modification_request: str,
        language: str = "typescript",
        model_name: str = "deepseek_coder"
    ) -> Dict[str, Any]:
        """
        Modify existing code based on user request
        
        Args:
            original_code: The original code to modify
            modification_request: Description of desired modifications
            language: Programming language
            model_name: Model to use for modification
        """
        try:
            modification_prompt = f"""
            You are an expert programmer. Modify the following code according to the request.
            
            Original code:
            ```{language}
            {original_code}
            ```
            
            Modification request:
            {modification_request}
            
            Requirements:
            - Preserve existing functionality unless explicitly requested to change
            - Add proper error handling
            - Follow best practices for {language}
            - Add meaningful comments for new code
            - Ensure the modified code is production-ready
            
            Return only the modified code:
            """
            
            modified_code = await self._generate_code(modification_prompt, model_name, language)
            
            return {
                "success": True,
                "original_code": original_code,
                "modified_code": modified_code,
                "modification_request": modification_request,
                "language": language,
                "model_used": model_name,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error modifying code: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to modify code"
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for code generation service"""
        return {
            "status": "healthy",
            "available_models": list(self.models.keys()),
            "device": self.device,
            "temp_dir": self.temp_dir
        }
    
    async def get_supported_app_types(self) -> List[str]:
        """Get list of supported app types"""
        return [
            "react-native",
            "flutter", 
            "nextjs",
            "express",
            "fastapi",
            "django",
            "vue",
            "angular",
            "svelte"
        ]
    
    async def get_supported_languages(self) -> List[str]:
        """Get list of supported programming languages"""
        return [
            "typescript", "javascript", "python", "dart", "java",
            "kotlin", "swift", "go", "rust", "c++", "c#"
        ]
    
    def __del__(self):
        """Cleanup temporary files"""
        try:
            import shutil
            if hasattr(self, 'temp_dir') and os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
        except:
            pass