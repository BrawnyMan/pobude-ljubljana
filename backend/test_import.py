#!/usr/bin/env python3
"""
Test script for importing JSON data
"""

import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

# Import the import function
from import_data import import_json_data

def test_import():
    """Test the import functionality"""
    print("🧪 Testing import functionality...")
    
    try:
        # Test import without clearing existing data
        result = import_json_data(clear_existing=False)
        print("✅ Import test completed successfully!")
        return True
    except Exception as e:
        print(f"❌ Import test failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_import() 