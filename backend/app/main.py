from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import get_db, engine
from . import models
from .tasks import transcode_video
import os
import shutil
import uuid
from datetime import datetime

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RESOLUTIONS = ['1080p', '720p', '480p', '360p', '240p']

@app.post("/api/upload")
async def upload_video(video: UploadFile = File(...), db: Session = Depends(get_db)):
    # Generate video ID
    video_id = str(uuid.uuid4())
    
    # Save uploaded file
    upload_dir = "/storage/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = f"{upload_dir}/{video_id}_{video.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path) / (1024 * 1024)  # MB
    
    # Create video record
    db_video = models.Video(
        id=video_id,
        original_filename=video.filename,
        original_path=file_path,
        file_size_mb=round(file_size, 2),
        status='processing'
    )
    db.add(db_video)
    db.commit()
    
    # Create transcode jobs
    jobs = []
    for resolution in RESOLUTIONS:
        job = models.TranscodeJob(
            video_id=video_id,
            resolution=resolution,
            status='queued'
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Queue Celery task
        transcode_video.delay(str(job.id), video_id, file_path, resolution)
        
        jobs.append({
            "resolution": resolution,
            "status": "queued"
        })
    
    return {
        "video_id": video_id,
        "original_filename": video.filename,
        "status": "processing",
        "jobs": jobs
    }

@app.get("/api/videos/{video_id}")
def get_video(video_id: str, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    jobs = db.query(models.TranscodeJob).filter(models.TranscodeJob.video_id == video_id).all()
    
    return {
        "video_id": str(video.id),
        "original_filename": video.original_filename,
        "status": video.status,
        "uploaded_at": video.uploaded_at.isoformat(),
        "jobs": [
            {
                "resolution": job.resolution,
                "status": job.status,
                "progress": job.progress,
                "output_path": job.output_path,
                "output_size_mb": float(job.output_size_mb) if job.output_size_mb else None,
                "worker_id": job.worker_id
            }
            for job in jobs
        ]
    }

@app.get("/api/videos")
def list_videos(db: Session = Depends(get_db)):
    videos = db.query(models.Video).order_by(models.Video.uploaded_at.desc()).all()
    
    return {
        "videos": [
            {
                "video_id": str(v.id),
                "original_filename": v.original_filename,
                "status": v.status,
                "uploaded_at": v.uploaded_at.isoformat()
            }
            for v in videos
        ]
    }

@app.get("/api/download/{video_id}/{resolution}")
def download_video(video_id: str, resolution: str, db: Session = Depends(get_db)):
    job = db.query(models.TranscodeJob).filter(
        models.TranscodeJob.video_id == video_id,
        models.TranscodeJob.resolution == resolution,
        models.TranscodeJob.status == 'completed'
    ).first()
    
    if not job or not job.output_path:
        raise HTTPException(status_code=404, detail="Video not ready")
    
    return FileResponse(job.output_path, media_type='video/mp4', filename=f"{video_id}_{resolution}.mp4")
