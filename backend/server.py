from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import uuid
import json
from datetime import datetime
import asyncio

app = FastAPI(title="AI Photoshoot API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection (placeholder for future use)
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/ai_photoshoot')

# Pydantic models
class CatalogModel(BaseModel):
    id: int
    title: str
    description: str
    category: str
    images: list
    thumbnail: str

class ProcessingRequest(BaseModel):
    catalog_id: int
    user_image_url: str

class ProcessingResponse(BaseModel):
    job_id: str
    status: str
    estimated_time: int

class ResultResponse(BaseModel):
    job_id: str
    status: str
    processed_images: list

# Mock catalog data (same as frontend for consistency)
MOCK_CATALOGS = [
    {
        "id": 1,
        "title": "Oversized T-Shirts",
        "description": "Casual oversized tee photoshoot styles",
        "category": "casual",
        "images": [
            "https://images.pexels.com/photos/7657856/pexels-photo-7657856.jpeg",
            "https://images.pexels.com/photos/7659342/pexels-photo-7659342.jpeg",
            "https://images.pexels.com/photos/7277960/pexels-photo-7277960.jpeg"
        ],
        "thumbnail": "https://images.pexels.com/photos/7657856/pexels-photo-7657856.jpeg"
    },
    {
        "id": 2,
        "title": "Hoodies & Streetwear",
        "description": "Urban streetwear photoshoot collection",
        "category": "streetwear",
        "images": [
            "https://images.pexels.com/photos/7945745/pexels-photo-7945745.jpeg",
            "https://images.pexels.com/photos/30623846/pexels-photo-30623846.jpeg",
            "https://images.unsplash.com/photo-1512977141980-8cc662e38a0c"
        ],
        "thumbnail": "https://images.pexels.com/photos/7945745/pexels-photo-7945745.jpeg"
    },
    {
        "id": 3,
        "title": "Dark Streetwear",
        "description": "Edgy dark style photoshoot collection",
        "category": "streetwear",
        "images": [
            "https://images.pexels.com/photos/32275955/pexels-photo-32275955.jpeg",
            "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
            "https://images.unsplash.com/photo-1514866726862-0f081731e63f"
        ],
        "thumbnail": "https://images.pexels.com/photos/32275955/pexels-photo-32275955.jpeg"
    },
    {
        "id": 4,
        "title": "Casual Collection",
        "description": "Relaxed casual wear photoshoot styles",
        "category": "casual",
        "images": [
            "https://images.pexels.com/photos/7277960/pexels-photo-7277960.jpeg",
            "https://images.unsplash.com/photo-1512977141980-8cc662e38a0c",
            "https://images.pexels.com/photos/7659342/pexels-photo-7659342.jpeg"
        ],
        "thumbnail": "https://images.pexels.com/photos/7277960/pexels-photo-7277960.jpeg"
    }
]

# In-memory storage for demo (replace with database in production)
processing_jobs = {}

@app.get("/")
async def read_root():
    return {"message": "AI Photoshoot API is running!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/catalogs")
async def get_catalogs():
    """Get all available photoshoot catalogs"""
    return {"catalogs": MOCK_CATALOGS}

@app.get("/api/catalogs/{catalog_id}")
async def get_catalog(catalog_id: int):
    """Get specific catalog by ID"""
    catalog = next((cat for cat in MOCK_CATALOGS if cat["id"] == catalog_id), None)
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")
    return catalog

@app.get("/api/catalogs/category/{category}")
async def get_catalogs_by_category(category: str):
    """Get catalogs filtered by category"""
    if category == "all":
        return {"catalogs": MOCK_CATALOGS}
    
    filtered_catalogs = [cat for cat in MOCK_CATALOGS if cat["category"] == category]
    return {"catalogs": filtered_catalogs}

@app.post("/api/upload")
async def upload_product_image(file: UploadFile = File(...)):
    """Upload product image for processing"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # For demo, we'll just return a mock URL
    # In production, save to cloud storage (S3, etc.)
    mock_upload_url = f"https://storage.example.com/uploads/{unique_filename}"
    
    return {
        "upload_id": str(uuid.uuid4()),
        "filename": unique_filename,
        "url": mock_upload_url,
        "message": "File uploaded successfully"
    }

@app.post("/api/process")
async def start_processing(request: ProcessingRequest):
    """Start AI processing of product image with selected catalog"""
    
    # Validate catalog exists
    catalog = next((cat for cat in MOCK_CATALOGS if cat["id"] == request.catalog_id), None)
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Mock processing job
    processing_jobs[job_id] = {
        "status": "processing",
        "catalog_id": request.catalog_id,
        "user_image_url": request.user_image_url,
        "created_at": datetime.now().isoformat(),
        "estimated_completion": datetime.now().isoformat(),
        "processed_images": []
    }
    
    return ProcessingResponse(
        job_id=job_id,
        status="processing",
        estimated_time=30  # seconds
    )

@app.get("/api/process/{job_id}")
async def get_processing_status(job_id: str):
    """Get processing status and results"""
    
    if job_id not in processing_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = processing_jobs[job_id]
    
    # Mock completion after 30 seconds (for demo)
    if job["status"] == "processing":
        # In real implementation, check actual processing status
        catalog = next((cat for cat in MOCK_CATALOGS if cat["id"] == job["catalog_id"]), None)
        
        # Mock processed images (using catalog images as results for demo)
        processed_images = [
            {
                "id": i,
                "url": img,
                "download_url": img,
                "style": f"Style {i+1}"
            }
            for i, img in enumerate(catalog["images"])
        ]
        
        job["status"] = "completed"
        job["processed_images"] = processed_images
    
    return ResultResponse(
        job_id=job_id,
        status=job["status"],
        processed_images=job.get("processed_images", [])
    )

@app.delete("/api/process/{job_id}")
async def delete_processing_job(job_id: str):
    """Delete processing job and cleanup resources"""
    
    if job_id not in processing_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    del processing_jobs[job_id]
    return {"message": "Job deleted successfully"}

@app.get("/api/stats")
async def get_api_stats():
    """Get API usage statistics"""
    return {
        "total_catalogs": len(MOCK_CATALOGS),
        "active_jobs": len([job for job in processing_jobs.values() if job["status"] == "processing"]),
        "completed_jobs": len([job for job in processing_jobs.values() if job["status"] == "completed"]),
        "categories": list(set([cat["category"] for cat in MOCK_CATALOGS]))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)