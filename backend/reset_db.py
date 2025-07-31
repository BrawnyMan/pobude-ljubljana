#!/usr/bin/env python3
"""
Script to reset the database with the new schema including the category column.
Run this if you encounter database schema issues.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import reset_database

if __name__ == "__main__":
    print("Resetting database with new schema...")
    reset_database()
    print("Database reset complete!")
    print("The category column has been added to the pobuda table.") 