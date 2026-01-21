from celery import Celery
import ffmpeg
import os
import time
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import TranscodeJob, Video
from datetime import datetime

celery_app = Celery(
    'tasks',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)

RESOLUTION_CONFIG = {
    '1080p': {'width': 1920, 'height': 1080, 'bitrate': '5000k'},
    '720p': {'width': 1280, 'height': 720, 'bitrate': '2500k'},
    '480p': {'width': 854, 'height': 480, 'bitrate': '1000k'},
    '360p': {'width': 640, 'height': 360, 'bitrate': '500k'},
    '240p': {'width': 426, 'height': 240, 'bitrate': '250k'},
}

@celery_app.task(bind=True)
def transcode_video(self, job_id: str, video_id: str, input_path: str, resolution: str):
    db = SessionLocal()
    
    try:
        # Update job status to processing
        job = db.query(TranscodeJob).filter(TranscodeJob.id == job_id).first()
        job.status = 'processing'
        job.started_at = datetime.utcnow()
        job.worker_id = self.request.hostname
        db.commit()
        
        # Create output directory
        output_dir = f"/storage/outputs/{video_id}"
        os.makedirs(output_dir, exist_ok=True)
        output_path = f"{output_dir}/{resolution}.mp4"
        
        # Get resolution config
        config = RESOLUTION_CONFIG[resolution]
        
        # Transcode video
        stream = ffmpeg.input(input_path)
        stream = ffmpeg.output(
            stream,
            output_path,
            vcodec='libx264',
            acodec='aac',
            s=f"{config['width']}x{config['height']}",
            video_bitrate=config['bitrate'],
            preset='fast',
            movflags='faststart'
        )
        
        # Run FFmpeg (simulate progress updates)
        ffmpeg.run(stream, overwrite_output=True, quiet=True)
        
        # Simulate progress updates (in real implementation, parse FFmpeg output)
        for progress in range(0, 101, 10):
            job.progress = progress
            db.commit()
            time.sleep(0.5)  # Simulate processing time
        
        # Get output file size
        output_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
        
        # Update job as completed
        job.status = 'completed'
        job.progress = 100
        job.output_path = output_path
        job.output_size_mb = round(output_size, 2)
        job.completed_at = datetime.utcnow()
        db.commit()
        
        # Check if all jobs for this video are complete
        all_jobs = db.query(TranscodeJob).filter(TranscodeJob.video_id == video_id).all()
        if all(j.status == 'completed' for j in all_jobs):
            video = db.query(Video).filter(Video.id == video_id).first()
            video.status = 'completed'
            video.completed_at = datetime.utcnow()
            db.commit()
        
        return {'status': 'success', 'job_id': job_id}
        
    except Exception as e:
        job = db.query(TranscodeJob).filter(TranscodeJob.id == job_id).first()
        job.status = 'failed'
        job.error_message = str(e)
        db.commit()
        return {'status': 'error', 'message': str(e)}
    
    finally:
        db.close()
