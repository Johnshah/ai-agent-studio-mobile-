#!/usr/bin/env python3
"""
Comprehensive Repository Validation Script
Tests all components, dependencies, and deployment configurations
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Tuple

def run_command(command: str, cwd: str = None) -> Tuple[bool, str]:
    """Run command and return success status and output"""
    try:
        result = subprocess.run(
            command, shell=True, cwd=cwd, 
            capture_output=True, text=True, timeout=30
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, "Command timed out"
    except Exception as e:
        return False, str(e)

def check_file_exists(file_path: str) -> bool:
    """Check if file exists"""
    return Path(file_path).exists()

def validate_json_file(file_path: str) -> Tuple[bool, str]:
    """Validate JSON file syntax"""
    try:
        with open(file_path, 'r') as f:
            json.load(f)
        return True, "Valid JSON"
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"
    except Exception as e:
        return False, f"Error reading file: {e}"

def validate_package_json(file_path: str) -> Dict[str, Any]:
    """Validate package.json files"""
    results = {"exists": False, "valid_json": False, "has_dependencies": False, "issues": []}
    
    if not check_file_exists(file_path):
        results["issues"].append("File does not exist")
        return results
    
    results["exists"] = True
    
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        results["valid_json"] = True
        
        # Check essential fields
        if "dependencies" in data:
            results["has_dependencies"] = True
            dep_count = len(data["dependencies"])
            results["dependency_count"] = dep_count
        
        if "scripts" not in data:
            results["issues"].append("No scripts section")
        
        if "name" not in data:
            results["issues"].append("No name field")
            
    except Exception as e:
        results["issues"].append(f"JSON parsing error: {e}")
    
    return results

def validate_backend() -> Dict[str, Any]:
    """Validate backend configuration"""
    print("🔧 Validating Backend...")
    
    results = {
        "structure": {"passed": 0, "total": 0, "issues": []},
        "requirements": {"passed": 0, "total": 0, "issues": []},
        "main_app": {"passed": 0, "total": 0, "issues": []}
    }
    
    # Check file structure
    required_files = [
        "backend/requirements.txt",
        "backend/app/main.py",
        "backend/app/__init__.py",
        "backend/app/api/__init__.py",
        "backend/app/models/__init__.py"
    ]
    
    for file_path in required_files:
        results["structure"]["total"] += 1
        if check_file_exists(file_path):
            results["structure"]["passed"] += 1
        else:
            results["structure"]["issues"].append(f"Missing: {file_path}")
    
    # Check requirements.txt
    results["requirements"]["total"] += 1
    if check_file_exists("backend/requirements.txt"):
        try:
            with open("backend/requirements.txt", "r") as f:
                lines = [line.strip() for line in f if line.strip() and not line.startswith("#")]
            
            if len(lines) > 10:
                results["requirements"]["passed"] += 1
            else:
                results["requirements"]["issues"].append("Too few dependencies")
                
            # Check for essential packages
            req_text = " ".join(lines)
            essential = ["fastapi", "uvicorn"]
            for pkg in essential:
                if pkg not in req_text:
                    results["requirements"]["issues"].append(f"Missing essential package: {pkg}")
        except Exception as e:
            results["requirements"]["issues"].append(f"Error reading requirements: {e}")
    else:
        results["requirements"]["issues"].append("requirements.txt not found")
    
    # Test basic import
    results["main_app"]["total"] += 1
    success, output = run_command('python -c "import sys; sys.path.append(\'app\'); print(\'Import test passed\')"', cwd="backend")
    if success:
        results["main_app"]["passed"] += 1
    else:
        results["main_app"]["issues"].append(f"Import test failed: {output}")
    
    return results

def validate_mobile_app(app_dir: str) -> Dict[str, Any]:
    """Validate mobile app configuration"""
    print(f"📱 Validating Mobile App: {app_dir}...")
    
    results = {
        "package_json": {},
        "app_config": {"passed": 0, "total": 0, "issues": []},
        "structure": {"passed": 0, "total": 0, "issues": []},
        "assets": {"passed": 0, "total": 0, "issues": []}
    }
    
    # Validate package.json
    package_path = f"{app_dir}/package.json"
    results["package_json"] = validate_package_json(package_path)
    
    # Check app configuration files
    config_files = [
        f"{app_dir}/App.tsx",
        f"{app_dir}/app.json",
        f"{app_dir}/eas.json"
    ]
    
    for file_path in config_files:
        results["app_config"]["total"] += 1
        if check_file_exists(file_path):
            results["app_config"]["passed"] += 1
        else:
            results["app_config"]["issues"].append(f"Missing: {file_path}")
    
    # Check source structure
    src_dirs = [
        f"{app_dir}/src/components",
        f"{app_dir}/src/screens", 
        f"{app_dir}/src/services",
        f"{app_dir}/src/navigation"
    ]
    
    for dir_path in src_dirs:
        results["structure"]["total"] += 1
        if Path(dir_path).is_dir():
            results["structure"]["passed"] += 1
        else:
            results["structure"]["issues"].append(f"Missing directory: {dir_path}")
    
    # Check assets
    asset_dirs = [
        f"{app_dir}/assets/fonts",
        f"{app_dir}/assets/images",
        f"{app_dir}/assets/icons"
    ]
    
    for dir_path in asset_dirs:
        results["assets"]["total"] += 1
        if Path(dir_path).is_dir():
            results["assets"]["passed"] += 1
        else:
            results["assets"]["issues"].append(f"Missing asset directory: {dir_path}")
    
    return results

def validate_deployment_configs() -> Dict[str, Any]:
    """Validate deployment configurations"""
    print("🌐 Validating Deployment Configurations...")
    
    results = {
        "huggingface": {"passed": 0, "total": 0, "issues": []},
        "docker": {"passed": 0, "total": 0, "issues": []},
        "scripts": {"passed": 0, "total": 0, "issues": []},
        "documentation": {"passed": 0, "total": 0, "issues": []}
    }
    
    # Check Hugging Face setup
    hf_files = ["huggingface-spaces/app.py", "huggingface-spaces/requirements.txt"]
    for file_path in hf_files:
        results["huggingface"]["total"] += 1
        if check_file_exists(file_path):
            results["huggingface"]["passed"] += 1
        else:
            results["huggingface"]["issues"].append(f"Missing: {file_path}")
    
    # Check build scripts
    script_files = ["mobile-app-advanced/build-apk-pro.sh", "backend/setup_advanced.py"]
    for file_path in script_files:
        results["scripts"]["total"] += 1
        if check_file_exists(file_path):
            results["scripts"]["passed"] += 1
            # Check if executable
            if Path(file_path).suffix == ".sh":
                if os.access(file_path, os.X_OK):
                    pass  # Already executable
                else:
                    results["scripts"]["issues"].append(f"Script not executable: {file_path}")
        else:
            results["scripts"]["issues"].append(f"Missing: {file_path}")
    
    # Check documentation
    doc_files = [
        "README.md", 
        "COMPLETE_DEPLOYMENT_GUIDE.md",
        "releases/APK-BUILD-INSTRUCTIONS.md"
    ]
    for file_path in doc_files:
        results["documentation"]["total"] += 1
        if check_file_exists(file_path):
            results["documentation"]["passed"] += 1
            # Check file size (should not be empty)
            if Path(file_path).stat().st_size < 100:
                results["documentation"]["issues"].append(f"Documentation too short: {file_path}")
        else:
            results["documentation"]["issues"].append(f"Missing: {file_path}")
    
    return results

def print_results(section_name: str, results: Dict[str, Any]):
    """Print validation results for a section"""
    print(f"\n{'='*20} {section_name} {'='*20}")
    
    total_passed = 0
    total_checks = 0
    
    for category, data in results.items():
        if isinstance(data, dict) and "passed" in data and "total" in data:
            passed = data["passed"]
            total = data["total"]
            issues = data.get("issues", [])
            
            total_passed += passed
            total_checks += total
            
            status = "✅" if passed == total else "⚠️" if passed > 0 else "❌"
            print(f"{status} {category.title()}: {passed}/{total}")
            
            for issue in issues:
                print(f"   🔸 {issue}")
        
        elif category == "package_json":
            pkg_data = data
            if pkg_data.get("exists") and pkg_data.get("valid_json"):
                deps = pkg_data.get("dependency_count", 0)
                print(f"✅ Package.json: Valid ({deps} dependencies)")
            else:
                print(f"❌ Package.json: Issues found")
                for issue in pkg_data.get("issues", []):
                    print(f"   🔸 {issue}")
    
    # Overall section score
    if total_checks > 0:
        score = (total_passed / total_checks) * 100
        status_emoji = "🎉" if score >= 90 else "✅" if score >= 70 else "⚠️" if score >= 50 else "❌"
        print(f"\n{status_emoji} {section_name} Score: {score:.1f}% ({total_passed}/{total_checks})")
    
    return total_passed, total_checks

def main():
    """Main validation function"""
    print("🔍 AI Agent Studio - Comprehensive Repository Validation")
    print("=" * 60)
    
    # Change to repository root
    os.chdir(Path(__file__).parent)
    
    all_results = {}
    overall_passed = 0
    overall_total = 0
    
    # Validate backend
    all_results["Backend"] = validate_backend()
    passed, total = print_results("Backend", all_results["Backend"])
    overall_passed += passed
    overall_total += total
    
    # Validate mobile apps
    mobile_apps = ["mobile-app", "mobile-app-advanced"]
    for app in mobile_apps:
        if Path(app).exists():
            all_results[f"Mobile App ({app})"] = validate_mobile_app(app)
            passed, total = print_results(f"Mobile App ({app})", all_results[f"Mobile App ({app})"])
            overall_passed += passed
            overall_total += total
    
    # Validate deployment
    all_results["Deployment"] = validate_deployment_configs()
    passed, total = print_results("Deployment", all_results["Deployment"])
    overall_passed += passed
    overall_total += total
    
    # Overall results
    print("\n" + "=" * 60)
    overall_score = (overall_passed / overall_total) * 100 if overall_total > 0 else 0
    
    if overall_score >= 90:
        status = "🎉 EXCELLENT"
        color = "GREEN"
    elif overall_score >= 75:
        status = "✅ GOOD"
        color = "BLUE"
    elif overall_score >= 60:
        status = "⚠️ NEEDS IMPROVEMENT"  
        color = "YELLOW"
    else:
        status = "❌ CRITICAL ISSUES"
        color = "RED"
    
    print(f"🏆 OVERALL REPOSITORY HEALTH: {status}")
    print(f"📊 Score: {overall_score:.1f}% ({overall_passed}/{overall_total} checks passed)")
    
    if overall_score >= 75:
        print("\n🚀 Repository Status: READY FOR DEPLOYMENT")
        print("💡 Recommended next steps:")
        print("   1. Install dependencies: pip install -r backend/requirements.txt")
        print("   2. Build mobile app: cd mobile-app-advanced && ./build-apk-pro.sh")
        print("   3. Deploy to preferred platform (see deployment guide)")
    else:
        print("\n⚠️ Repository Status: NEEDS FIXES BEFORE DEPLOYMENT")
        print("💡 Priority fixes needed:")
        
        # Show critical issues
        for section, results in all_results.items():
            for category, data in results.items():
                if isinstance(data, dict) and data.get("issues"):
                    print(f"   🔸 {section} - {category}: {len(data['issues'])} issues")
    
    print(f"\n📋 Validation completed at: {__import__('datetime').datetime.now()}")
    return overall_score >= 75

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)