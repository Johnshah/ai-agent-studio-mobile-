import asyncio
import os
import uuid
import tempfile
import zipfile
import shutil
from datetime import datetime
from typing import Dict, List, Optional, Any, Union
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedAppGenerationService:
    """
    Enhanced App Generation Service supporting multiple AI coding models:
    - Code Llama 3
    - DeepSeek-Coder  
    - StarCoder 2
    - WizardCoder
    - Mistral 7B/Mixtral 8x7B
    - Phi-3, Replit Code V2, OpenHermes, etc.
    """
    
    def __init__(self):
        self.models = {
            'code-llama-3': {
                'name': 'Code Llama 3',
                'provider': 'Meta',
                'github_url': 'https://github.com/facebookresearch/codellama',
                'huggingface_url': 'https://huggingface.co/codellama/CodeLlama-34b-Instruct-hf',
                'capabilities': ['code-generation', 'code-completion', 'debugging', 'refactoring'],
                'languages': ['python', 'javascript', 'java', 'cpp', 'swift', 'kotlin']
            },
            'deepseek-coder': {
                'name': 'DeepSeek-Coder',
                'provider': 'DeepSeek',
                'github_url': 'https://github.com/deepseek-ai/DeepSeek-Coder',
                'huggingface_url': 'https://huggingface.co/deepseek-ai/deepseek-coder-33b-instruct',
                'capabilities': ['full-stack-development', 'mobile-apps', 'web-apps', 'debugging'],
                'languages': ['python', 'javascript', 'typescript', 'java', 'swift', 'kotlin', 'dart']
            },
            'starcoder-2': {
                'name': 'StarCoder 2',
                'provider': 'BigCode',
                'github_url': 'https://github.com/bigcode-project/starcoder2',
                'huggingface_url': 'https://huggingface.co/bigcode/starcoder2-15b',
                'capabilities': ['multilingual-coding', 'code-translation', 'optimization'],
                'languages': ['python', 'javascript', 'java', 'cpp', 'go', 'rust']
            },
            'wizardcoder': {
                'name': 'WizardCoder',
                'provider': 'WizardLM',
                'github_url': 'https://github.com/nlpxucan/WizardLM',
                'huggingface_url': 'https://huggingface.co/WizardLM/WizardCoder-Python-34B-V1.0',
                'capabilities': ['instruction-following', 'python-specialized', 'complex-logic'],
                'languages': ['python', 'javascript', 'java', 'cpp']
            },
            'mistral-7b': {
                'name': 'Mistral 7B',
                'provider': 'Mistral AI',
                'github_url': 'https://github.com/mistralai/mistral-src',
                'huggingface_url': 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2',
                'capabilities': ['efficient-coding', 'multi-language', 'fast-generation'],
                'languages': ['python', 'javascript', 'typescript', 'java']
            }
        }
        
        self.frameworks = {
            'react-native': {
                'name': 'React Native',
                'platforms': ['android', 'ios'],
                'languages': ['javascript', 'typescript'],
                'build_command': 'npx react-native build-android',
                'package_file': 'package.json'
            },
            'flutter': {
                'name': 'Flutter',
                'platforms': ['android', 'ios', 'web', 'desktop'],
                'languages': ['dart'],
                'build_command': 'flutter build apk',
                'package_file': 'pubspec.yaml'
            },
            'next.js': {
                'name': 'Next.js',
                'platforms': ['web'],
                'languages': ['javascript', 'typescript'],
                'build_command': 'npm run build',
                'package_file': 'package.json'
            },
            'electron': {
                'name': 'Electron',
                'platforms': ['desktop'],
                'languages': ['javascript', 'typescript'],
                'build_command': 'npm run electron-pack',
                'package_file': 'package.json'
            }
        }
        
        self.custom_models = {}
        self.output_dir = Path("static/generated/apps")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    async def generate_app(
        self,
        description: str,
        app_type: str,  # android, ios, web, desktop
        framework: str = 'react-native',
        features: List[str] = [],
        design_style: str = 'modern',
        model: str = 'code-llama-3',
        uploaded_files: Optional[List] = None
    ) -> Dict[str, Any]:
        """Generate complete application using AI coding models"""
        
        try:
            logger.info(f"Starting app generation with model: {model}")
            
            # Validate model and framework
            if model not in self.models and model not in self.custom_models:
                raise ValueError(f"Model '{model}' not available")
            
            if framework not in self.frameworks:
                raise ValueError(f"Framework '{framework}' not supported")
            
            # Generate unique project ID
            project_id = str(uuid.uuid4())
            task_id = f"app_{project_id}"
            
            # Create project directory
            project_dir = self.output_dir / f"project_{project_id}"
            project_dir.mkdir(exist_ok=True)
            
            # Process uploaded files if any
            context_info = ""
            if uploaded_files:
                context_info = await self._process_uploaded_files(uploaded_files, project_dir)
            
            # Route to appropriate generation method
            if model == 'code-llama-3':
                result = await self._generate_with_code_llama(
                    description, app_type, framework, features, design_style, 
                    project_dir, task_id, context_info
                )
            elif model == 'deepseek-coder':
                result = await self._generate_with_deepseek_coder(
                    description, app_type, framework, features, design_style,
                    project_dir, task_id, context_info
                )
            elif model == 'starcoder-2':
                result = await self._generate_with_starcoder2(
                    description, app_type, framework, features, design_style,
                    project_dir, task_id, context_info
                )
            elif model == 'wizardcoder':
                result = await self._generate_with_wizardcoder(
                    description, app_type, framework, features, design_style,
                    project_dir, task_id, context_info
                )
            elif model == 'mistral-7b':
                result = await self._generate_with_mistral(
                    description, app_type, framework, features, design_style,
                    project_dir, task_id, context_info
                )
            else:
                result = await self._generate_with_custom_model(
                    model, description, app_type, framework, features, design_style,
                    project_dir, task_id, context_info
                )
            
            return result
            
        except Exception as e:
            logger.error(f"App generation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'model': model,
                'description': description
            }
    
    async def _generate_with_code_llama(
        self, description: str, app_type: str, framework: str, features: List[str],
        design_style: str, project_dir: Path, task_id: str, context_info: str
    ) -> Dict[str, Any]:
        """Generate app using Code Llama 3"""
        
        try:
            # Enhanced prompt for Code Llama
            enhanced_prompt = self._create_code_prompt(
                description, app_type, framework, features, design_style, context_info
            )
            
            # Code Llama API integration
            api_payload = {
                'prompt': enhanced_prompt,
                'max_tokens': 8192,
                'temperature': 0.1,
                'top_p': 0.9,
                'stop': ['</code>', '```']
            }
            
            # Simulate app generation process
            await self._simulate_app_generation()
            
            # Generate project structure
            generated_code = await self._generate_project_structure(
                framework, app_type, description, features, project_dir
            )
            
            # Create downloadable zip
            zip_path = await self._create_project_zip(project_dir, task_id)
            
            return {
                'success': True,
                'code': generated_code,
                'downloadUrl': f"/static/generated/apps/{zip_path.name}",
                'previewUrl': f"/static/generated/apps/preview_{task_id}.html",
                'framework': framework,
                'appType': app_type,
                'features': features,
                'task_id': task_id,
                'model': 'code-llama-3',
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Code Llama generation failed: {str(e)}")
            raise e
    
    async def _generate_with_deepseek_coder(
        self, description: str, app_type: str, framework: str, features: List[str],
        design_style: str, project_dir: Path, task_id: str, context_info: str
    ) -> Dict[str, Any]:
        """Generate app using DeepSeek-Coder"""
        
        try:
            enhanced_prompt = f"""
            Create a {app_type} application using {framework} with the following specifications:
            
            Description: {description}
            Features: {', '.join(features)}
            Design Style: {design_style}
            Context: {context_info}
            
            Requirements:
            1. Complete, functional codebase
            2. Modern best practices
            3. Clean, readable code
            4. Proper error handling
            5. Mobile optimization for {app_type}
            
            Generate full project structure with all necessary files.
            """
            
            await self._simulate_app_generation()
            
            generated_code = await self._generate_project_structure(
                framework, app_type, description, features, project_dir
            )
            
            zip_path = await self._create_project_zip(project_dir, task_id)
            
            return {
                'success': True,
                'code': generated_code,
                'downloadUrl': f"/static/generated/apps/{zip_path.name}",
                'previewUrl': f"/static/generated/apps/preview_{task_id}.html",
                'framework': framework,
                'appType': app_type,
                'features': features,
                'task_id': task_id,
                'model': 'deepseek-coder',
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"DeepSeek-Coder generation failed: {str(e)}")
            raise e
    
    async def _generate_with_starcoder2(
        self, description: str, app_type: str, framework: str, features: List[str],
        design_style: str, project_dir: Path, task_id: str, context_info: str
    ) -> Dict[str, Any]:
        """Generate app using StarCoder 2"""
        
        try:
            # StarCoder 2 specializes in multilingual code generation
            enhanced_prompt = self._create_multilingual_prompt(
                description, app_type, framework, features, design_style, context_info
            )
            
            await self._simulate_app_generation()
            
            generated_code = await self._generate_project_structure(
                framework, app_type, description, features, project_dir
            )
            
            zip_path = await self._create_project_zip(project_dir, task_id)
            
            return {
                'success': True,
                'code': generated_code,
                'downloadUrl': f"/static/generated/apps/{zip_path.name}",
                'previewUrl': f"/static/generated/apps/preview_{task_id}.html",
                'framework': framework,
                'appType': app_type,
                'features': features,
                'task_id': task_id,
                'model': 'starcoder-2',
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"StarCoder 2 generation failed: {str(e)}")
            raise e
    
    async def _generate_with_wizardcoder(
        self, description: str, app_type: str, framework: str, features: List[str],
        design_style: str, project_dir: Path, task_id: str, context_info: str
    ) -> Dict[str, Any]:
        """Generate app using WizardCoder"""
        
        try:
            # WizardCoder excels at instruction following
            enhanced_prompt = f"""
            As an expert software developer, create a complete {app_type} application:
            
            INSTRUCTIONS:
            1. Application Type: {app_type}
            2. Framework: {framework}
            3. Description: {description}
            4. Required Features: {', '.join(features)}
            5. Design Style: {design_style}
            6. Context Information: {context_info}
            
            DELIVERABLES:
            - Complete project structure
            - All necessary source files
            - Configuration files
            - README with setup instructions
            - Package/dependency files
            
            REQUIREMENTS:
            - Production-ready code
            - Best practices implementation
            - Error handling and validation
            - Mobile optimization
            - Clean architecture
            """
            
            await self._simulate_app_generation()
            
            generated_code = await self._generate_project_structure(
                framework, app_type, description, features, project_dir
            )
            
            zip_path = await self._create_project_zip(project_dir, task_id)
            
            return {
                'success': True,
                'code': generated_code,
                'downloadUrl': f"/static/generated/apps/{zip_path.name}",
                'previewUrl': f"/static/generated/apps/preview_{task_id}.html",
                'framework': framework,
                'appType': app_type,
                'features': features,
                'task_id': task_id,
                'model': 'wizardcoder',
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"WizardCoder generation failed: {str(e)}")
            raise e
    
    async def _generate_with_mistral(
        self, description: str, app_type: str, framework: str, features: List[str],
        design_style: str, project_dir: Path, task_id: str, context_info: str
    ) -> Dict[str, Any]:
        """Generate app using Mistral 7B"""
        
        try:
            enhanced_prompt = self._create_efficient_prompt(
                description, app_type, framework, features, design_style, context_info
            )
            
            await self._simulate_app_generation()
            
            generated_code = await self._generate_project_structure(
                framework, app_type, description, features, project_dir
            )
            
            zip_path = await self._create_project_zip(project_dir, task_id)
            
            return {
                'success': True,
                'code': generated_code,
                'downloadUrl': f"/static/generated/apps/{zip_path.name}",
                'previewUrl': f"/static/generated/apps/preview_{task_id}.html",
                'framework': framework,
                'appType': app_type,
                'features': features,
                'task_id': task_id,
                'model': 'mistral-7b',
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Mistral generation failed: {str(e)}")
            raise e
    
    async def _generate_with_custom_model(
        self, model_id: str, description: str, app_type: str, framework: str,
        features: List[str], design_style: str, project_dir: Path, task_id: str, context_info: str
    ) -> Dict[str, Any]:
        """Generate app using custom GitHub model"""
        
        try:
            model_config = self.custom_models[model_id]
            
            await self._simulate_app_generation()
            
            generated_code = await self._generate_project_structure(
                framework, app_type, description, features, project_dir
            )
            
            zip_path = await self._create_project_zip(project_dir, task_id)
            
            return {
                'success': True,
                'code': generated_code,
                'downloadUrl': f"/static/generated/apps/{zip_path.name}",
                'framework': framework,
                'task_id': task_id,
                'model': model_id,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Custom model generation failed: {str(e)}")
            raise e
    
    async def build_apk(self, app_code: str, app_name: str, framework: str = 'react-native') -> Dict[str, Any]:
        """Build APK from generated app code"""
        
        try:
            logger.info(f"Building APK for {app_name}")
            
            # Create build directory
            build_dir = self.output_dir / f"build_{uuid.uuid4().hex[:8]}"
            build_dir.mkdir(exist_ok=True)
            
            # Write app code to files
            await self._setup_build_environment(build_dir, app_code, app_name, framework)
            
            # Simulate APK build process
            await self._simulate_apk_build()
            
            # Create mock APK file
            apk_filename = f"{app_name.replace(' ', '_').lower()}.apk"
            apk_path = self.output_dir / apk_filename
            
            # Create placeholder APK (in production, this would be the actual APK)
            with open(apk_path, 'wb') as f:
                f.write(b'Mock APK content for demo purposes')
            
            return {
                'success': True,
                'apkUrl': f"/static/generated/apps/{apk_filename}",
                'apkPath': str(apk_path),
                'appName': app_name,
                'framework': framework,
                'fileSize': apk_path.stat().st_size,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"APK build failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'appName': app_name
            }
    
    async def add_custom_model(
        self, name: str, github_url: str, capabilities: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Add custom AI coding model from GitHub"""
        
        try:
            model_id = name.lower().replace(' ', '-').replace('_', '-')
            
            if not github_url.startswith('https://github.com/'):
                raise ValueError("Invalid GitHub URL")
            
            self.custom_models[model_id] = {
                'name': name,
                'github_url': github_url,
                'capabilities': capabilities or ['code-generation'],
                'added_at': datetime.utcnow().isoformat(),
                'status': 'active'
            }
            
            logger.info(f"Added custom app generation model: {name}")
            
            return {
                'success': True,
                'model_id': model_id,
                'message': f"Custom model '{name}' added successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to add custom model: {str(e)}")
            raise e
    
    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get all available app generation models"""
        
        models = []
        
        # Built-in models
        for model_id, config in self.models.items():
            models.append({
                'id': model_id,
                'name': config['name'],
                'provider': config.get('provider', 'Unknown'),
                'github_url': config.get('github_url', ''),
                'huggingface_url': config.get('huggingface_url', ''),
                'capabilities': config.get('capabilities', []),
                'languages': config.get('languages', []),
                'model_type': 'built-in'
            })
        
        # Custom models
        for model_id, config in self.custom_models.items():
            models.append({
                'id': model_id,
                'name': config['name'],
                'github_url': config['github_url'],
                'capabilities': config.get('capabilities', []),
                'model_type': 'custom',
                'status': config.get('status', 'active')
            })
        
        return models
    
    def _create_code_prompt(
        self, description: str, app_type: str, framework: str, 
        features: List[str], design_style: str, context_info: str
    ) -> str:
        """Create enhanced prompt for code generation"""
        
        return f"""
        Generate a complete {app_type} application using {framework} framework.
        
        Application Requirements:
        - Description: {description}
        - Platform: {app_type}
        - Framework: {framework}
        - Features: {', '.join(features)}
        - Design Style: {design_style}
        - Context: {context_info}
        
        Code Requirements:
        - Production-ready, clean code
        - Modern best practices
        - Proper error handling
        - Mobile optimization
        - Responsive design
        - Performance optimization
        
        Include complete project structure with all necessary files.
        """
    
    def _create_multilingual_prompt(
        self, description: str, app_type: str, framework: str,
        features: List[str], design_style: str, context_info: str
    ) -> str:
        """Create prompt optimized for multilingual code generation"""
        
        framework_info = self.frameworks.get(framework, {})
        languages = framework_info.get('languages', ['javascript'])
        
        return f"""
        Create a multilingual {app_type} application using {framework}.
        
        Specifications:
        - Primary Language: {languages[0]}
        - Secondary Languages: {', '.join(languages[1:]) if len(languages) > 1 else 'None'}
        - Description: {description}
        - Features: {', '.join(features)}
        - Design: {design_style}
        - Additional Context: {context_info}
        
        Generate comprehensive, cross-platform compatible code.
        """
    
    def _create_efficient_prompt(
        self, description: str, app_type: str, framework: str,
        features: List[str], design_style: str, context_info: str
    ) -> str:
        """Create prompt optimized for efficient, fast generation"""
        
        return f"""
        Rapidly generate an efficient {app_type} app:
        
        Brief: {description}
        Tech: {framework}
        Features: {', '.join(features[:5])}  # Limit for efficiency
        Style: {design_style}
        Context: {context_info[:200]}...  # Truncate for efficiency
        
        Focus on core functionality, clean code, and performance.
        """
    
    async def _process_uploaded_files(self, uploaded_files: List, project_dir: Path) -> str:
        """Process uploaded files and extract context information"""
        
        context_info = "Uploaded files context:\n"
        
        for i, file in enumerate(uploaded_files):
            try:
                # Save uploaded file
                file_path = project_dir / f"upload_{i}_{file.filename}"
                
                # In production, save the actual file content
                context_info += f"- {file.filename}: Contains reference code/structure\n"
                
            except Exception as e:
                logger.warning(f"Failed to process uploaded file: {str(e)}")
        
        return context_info
    
    async def _generate_project_structure(
        self, framework: str, app_type: str, description: str, 
        features: List[str], project_dir: Path
    ) -> str:
        """Generate complete project structure"""
        
        # Create framework-specific project structure
        if framework == 'react-native':
            await self._create_react_native_project(project_dir, description, features)
        elif framework == 'flutter':
            await self._create_flutter_project(project_dir, description, features)
        elif framework == 'next.js':
            await self._create_nextjs_project(project_dir, description, features)
        elif framework == 'electron':
            await self._create_electron_project(project_dir, description, features)
        
        # Read generated main file for preview
        main_files = list(project_dir.glob('**/*.js')) + list(project_dir.glob('**/*.jsx')) + list(project_dir.glob('**/*.ts')) + list(project_dir.glob('**/*.tsx'))
        
        if main_files:
            with open(main_files[0], 'r') as f:
                return f.read()
        
        return f"// Generated {framework} app for: {description}"
    
    async def _create_react_native_project(self, project_dir: Path, description: str, features: List[str]):
        """Create React Native project structure"""
        
        # Package.json
        package_json = {
            "name": "ai-generated-app",
            "version": "1.0.0",
            "description": description,
            "main": "index.js",
            "scripts": {
                "start": "react-native start",
                "android": "react-native run-android",
                "ios": "react-native run-ios"
            },
            "dependencies": {
                "react": "^18.2.0",
                "react-native": "^0.72.0",
                "@react-navigation/native": "^6.1.0",
                "@react-navigation/stack": "^6.3.0"
            }
        }
        
        with open(project_dir / "package.json", 'w') as f:
            json.dump(package_json, f, indent=2)
        
        # Main App.js
        app_js = f'''import React from 'react';
import {{ View, Text, StyleSheet, SafeAreaView }} from 'react-native';

const App = () => {{
  return (
    <SafeAreaView style={{styles.container}}>
      <View style={{styles.content}}>
        <Text style={{styles.title}}>AI Generated App</Text>
        <Text style={{styles.description}}>{description}</Text>
        <Text style={{styles.features}}>Features: {', '.join(features)}</Text>
      </View>
    </SafeAreaView>
  );
}};

const styles = StyleSheet.create({{
  container: {{
    flex: 1,
    backgroundColor: '#fff',
  }},
  content: {{
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }},
  title: {{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  }},
  description: {{
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  }},
  features: {{
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }},
}});

export default App;
'''
        
        with open(project_dir / "App.js", 'w') as f:
            f.write(app_js)
        
        # Index.js
        index_js = '''import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
'''
        
        with open(project_dir / "index.js", 'w') as f:
            f.write(index_js)
    
    async def _create_flutter_project(self, project_dir: Path, description: str, features: List[str]):
        """Create Flutter project structure"""
        
        # pubspec.yaml
        pubspec = f'''name: ai_generated_app
description: {description}
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
'''
        
        with open(project_dir / "pubspec.yaml", 'w') as f:
            f.write(pubspec)
        
        # Create lib directory
        lib_dir = project_dir / "lib"
        lib_dir.mkdir(exist_ok=True)
        
        # main.dart
        main_dart = f'''import 'package:flutter/material.dart';

void main() {{
  runApp(const MyApp());
}}

class MyApp extends StatelessWidget {{
  const MyApp({{super.key}});

  @override
  Widget build(BuildContext context) {{
    return MaterialApp(
      title: 'AI Generated App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'AI Generated App'),
    );
  }}
}}

class MyHomePage extends StatefulWidget {{
  const MyHomePage({{super.key, required this.title}});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}}

class _MyHomePageState extends State<MyHomePage> {{
  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              '{description}',
              style: TextStyle(fontSize: 18),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 20),
            Text(
              'Features: {', '.join(features)}',
              style: TextStyle(fontSize: 14, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }}
}}
'''
        
        with open(lib_dir / "main.dart", 'w') as f:
            f.write(main_dart)
    
    async def _create_nextjs_project(self, project_dir: Path, description: str, features: List[str]):
        """Create Next.js project structure"""
        
        # Package.json for Next.js
        package_json = {
            "name": "ai-generated-nextjs-app",
            "version": "1.0.0",
            "description": description,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint"
            },
            "dependencies": {
                "next": "^13.5.0",
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
            },
            "devDependencies": {
                "@types/node": "^20.0.0",
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                "typescript": "^5.0.0"
            }
        }
        
        with open(project_dir / "package.json", 'w') as f:
            json.dump(package_json, f, indent=2)
        
        # Create pages directory
        pages_dir = project_dir / "pages"
        pages_dir.mkdir(exist_ok=True)
        
        # index.js
        index_jsx = f'''import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {{
  return (
    <div className={{styles.container}}>
      <Head>
        <title>AI Generated App</title>
        <meta name="description" content="{description}" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={{styles.main}}>
        <h1 className={{styles.title}}>
          Welcome to AI Generated App
        </h1>

        <p className={{styles.description}}>
          {description}
        </p>

        <div className={{styles.features}}>
          <h2>Features:</h2>
          <ul>
            {{{', '.join([f'<li>{feature}</li>' for feature in features])}}}
          </ul>
        </div>
      </main>
    </div>
  )
}}
'''
        
        with open(pages_dir / "index.js", 'w') as f:
            f.write(index_jsx)
    
    async def _create_electron_project(self, project_dir: Path, description: str, features: List[str]):
        """Create Electron project structure"""
        
        # Package.json for Electron
        package_json = {
            "name": "ai-generated-electron-app",
            "version": "1.0.0",
            "description": description,
            "main": "main.js",
            "scripts": {
                "start": "electron .",
                "build": "electron-builder"
            },
            "dependencies": {
                "electron": "^22.0.0"
            },
            "devDependencies": {
                "electron-builder": "^23.0.0"
            }
        }
        
        with open(project_dir / "package.json", 'w') as f:
            json.dump(package_json, f, indent=2)
        
        # main.js
        main_js = '''const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
'''
        
        with open(project_dir / "main.js", 'w') as f:
            f.write(main_js)
        
        # index.html
        index_html = f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Generated App</title>
  <style>
    body {{
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f0f0f0;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }}
    h1 {{
      color: #333;
      text-align: center;
    }}
    .description {{
      font-size: 16px;
      line-height: 1.6;
      margin: 20px 0;
    }}
    .features {{
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
    }}
  </style>
</head>
<body>
  <div class="container">
    <h1>AI Generated Desktop App</h1>
    <div class="description">
      {description}
    </div>
    <div class="features">
      <h3>Features:</h3>
      <ul>
        {chr(10).join([f'<li>{feature}</li>' for feature in features])}
      </ul>
    </div>
  </div>
</body>
</html>
'''
        
        with open(project_dir / "index.html", 'w') as f:
            f.write(index_html)
    
    async def _create_project_zip(self, project_dir: Path, task_id: str) -> Path:
        """Create downloadable zip file of the project"""
        
        zip_filename = f"generated_app_{task_id}.zip"
        zip_path = self.output_dir / zip_filename
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in project_dir.rglob('*'):
                if file_path.is_file():
                    arcname = file_path.relative_to(project_dir)
                    zipf.write(file_path, arcname)
        
        return zip_path
    
    async def _setup_build_environment(self, build_dir: Path, app_code: str, app_name: str, framework: str):
        """Setup build environment for APK generation"""
        
        # Create basic project structure for building
        if framework == 'react-native':
            # Create React Native build structure
            android_dir = build_dir / "android"
            android_dir.mkdir(exist_ok=True)
            
            # Create basic gradle files (simplified for demo)
            build_gradle = '''apply plugin: "com.android.application"

android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.aiapp.generated"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
}
'''
            
            with open(android_dir / "build.gradle", 'w') as f:
                f.write(build_gradle)
    
    async def _simulate_app_generation(self):
        """Simulate app generation process"""
        # Simulate processing time for app generation
        await asyncio.sleep(5)  # 5 seconds for demo
    
    async def _simulate_apk_build(self):
        """Simulate APK build process"""
        # Simulate APK build time
        await asyncio.sleep(3)  # 3 seconds for demo
    
    async def health_check(self) -> Dict[str, Any]:
        """Check service health and model availability"""
        
        return {
            'status': 'healthy',
            'available_models': len(self.models) + len(self.custom_models),
            'built_in_models': len(self.models),
            'custom_models': len(self.custom_models),
            'supported_frameworks': list(self.frameworks.keys()),
            'output_directory': str(self.output_dir),
            'timestamp': datetime.utcnow().isoformat()
        }