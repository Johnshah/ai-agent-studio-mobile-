#!/usr/bin/env python3
"""
Basic Backend Test - Validates core functionality without dependencies
"""

def test_imports():
    """Test if basic Python functionality works"""
    try:
        import json
        import os
        import sys
        from datetime import datetime
        
        print("✅ Basic Python imports successful")
        return True
    except ImportError as e:
        print(f"❌ Basic import failed: {e}")
        return False

def test_file_structure():
    """Test if required files and directories exist"""
    import os
    
    required_files = [
        "app/main.py",
        "app/__init__.py",
        "requirements.txt"
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"⚠️ Missing files: {missing_files}")
        return False
    else:
        print("✅ All required files present")
        return True

def test_requirements():
    """Test if requirements.txt is valid"""
    try:
        with open("requirements.txt", "r") as f:
            lines = f.readlines()
        
        valid_lines = [line.strip() for line in lines if line.strip() and not line.startswith("#")]
        print(f"✅ Requirements.txt has {len(valid_lines)} dependencies")
        
        # Check for essential packages
        essential = ["fastapi", "uvicorn", "python-multipart"]
        missing_essential = []
        
        req_text = " ".join(valid_lines)
        for package in essential:
            if package not in req_text:
                missing_essential.append(package)
        
        if missing_essential:
            print(f"⚠️ Missing essential packages: {missing_essential}")
            return False
        else:
            print("✅ All essential packages present in requirements")
            return True
            
    except Exception as e:
        print(f"❌ Error reading requirements.txt: {e}")
        return False

def create_init_files():
    """Create missing __init__.py files"""
    import os
    
    dirs_need_init = [
        "app",
        "app/api", 
        "app/models",
        "app/services",
        "app/utils",
        "app/core"
    ]
    
    for dir_path in dirs_need_init:
        if os.path.exists(dir_path):
            init_file = os.path.join(dir_path, "__init__.py")
            if not os.path.exists(init_file):
                with open(init_file, "w") as f:
                    f.write(f'"""Backend module: {dir_path}"""\n')
                print(f"✅ Created {init_file}")

def main():
    """Run all tests"""
    print("🔧 Backend Basic Functionality Test")
    print("=" * 40)
    
    tests = [
        ("Basic Imports", test_imports),
        ("File Structure", test_file_structure),
        ("Requirements Check", test_requirements),
    ]
    
    passed = 0
    for test_name, test_func in tests:
        print(f"\n🧪 Running: {test_name}")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print(f"\n📊 Test Results: {passed}/{len(tests)} passed")
    
    # Create missing files
    print(f"\n🔧 Creating missing __init__.py files...")
    create_init_files()
    
    if passed == len(tests):
        print(f"\n🎉 Backend structure is valid!")
        print(f"💡 To run the backend:")
        print(f"   1. Install dependencies: pip install -r requirements.txt")
        print(f"   2. Run server: python -m uvicorn app.main:app --reload")
    else:
        print(f"\n⚠️ Some tests failed, but basic structure is being created")
    
    return passed == len(tests)

if __name__ == "__main__":
    main()