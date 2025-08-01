# Data Import Instructions

This document explains how to import the JSON data files into the database.

## Available Methods

### 1. Command Line Script (Windows)

You can run the import script directly from the command line:

```bash
# Navigate to the backend directory
cd backend

# Method 1: Use the batch file (recommended for Windows)
import_data.bat

# Method 2: Activate virtual environment manually and run script
venv\Scripts\activate
python run_import.py

# Import data and clear existing records first
python run_import.py --clear
```

### 2. API Endpoints

The FastAPI application provides endpoints for importing data:

#### Check Import Status
```bash
curl http://localhost:8000/api/import-status
```

This will show:
- Available JSON files in the `data/` directory
- Number of records in each file
- Current number of records in the database

#### Import Data via API
```bash
# Import without clearing existing data
curl -X POST "http://localhost:8000/api/import-data"

# Import and clear existing data first
curl -X POST "http://localhost:8000/api/import-data?clear_existing=true"
```

### 3. Troubleshooting

If you get a "ModuleNotFoundError: No module named 'sqlmodel'" error:

1. **Activate the virtual environment first:**
   ```bash
   cd backend
   venv\Scripts\activate
   ```

2. **Install dependencies if needed:**
   ```bash
   pip install sqlmodel fastapi uvicorn
   ```

3. **Then run the import script:**
   ```bash
   python run_import.py
   ```

## File Structure

The import functionality expects JSON files in the `data/` directory with the pattern `*_converted.json`:

```
data/
├── data1_converted.json
├── data2_converted.json
└── data3_converted.json
```

## JSON Data Format

Each JSON file should contain an array of objects with the following structure:

```json
{
  "title": "Pobuda title",
  "description": "Pobuda description",
  "location": "Ljubljana",
  "latitude": 46.0569,
  "longitude": 14.5058,
  "email": "user@example.com",
  "category": "Ceste",
  "status": "v obravnavi",
  "created_at": "2023-01-01T12:00:00",
  "image_path": null,
  "response": "Response text (optional)",
  "responded_at": "2023-01-02T10:00:00"
}
```

## Error Handling

The import process includes error handling for:
- Missing JSON files
- Invalid JSON format
- Missing required fields
- Database connection issues

Errors are logged but don't stop the entire import process.

## Database Schema

The import uses the existing `Pobuda` model with the following fields:
- `id` (auto-generated)
- `title`
- `description`
- `location`
- `latitude`
- `longitude`
- `email`
- `category`
- `status`
- `created_at`
- `image_path`
- `response`
- `responded_at`

## Notes

- The import process is designed to handle large datasets efficiently
- Each file is processed separately with its own database transaction
- If `clear_existing=true`, all existing records are deleted before import
- The script automatically handles missing optional fields with default values 