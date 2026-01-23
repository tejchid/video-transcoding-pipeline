# StreamForge - Distributed Video Transcoding Pipeline

A scalable video transcoding system that processes videos into multiple resolutions using distributed worker pools, built with FastAPI, Celery, and Next.js.
<img width="2268" height="1254" alt="image" src="https://github.com/user-attachments/assets/640f6057-99e9-45c6-8a2f-19045461bca7" />

## Features

- **Parallel Processing**: 3 worker nodes transcode videos to 5 resolutions simultaneously
- **Real-time Progress Tracking**: Live updates via WebSocket polling showing job status, worker assignments, and completion percentage
- **Distributed Job Queue**: Redis-backed Celery queue with automatic task distribution and retry logic
- **Responsive UI**: Modern Next.js dashboard with progress visualization and video playback

## Tech Stack

**Backend:**
- Python 3.11, FastAPI
- Celery + Redis (distributed task queue)
- PostgreSQL (job metadata)
- FFmpeg (video processing)
- Docker

**Frontend:**
- Next.js 14, TypeScript
- Tailwind CSS
- Real-time polling for job updates

## Quick Start
```bash
# Clone the repository
git clone https://github.com/tejchid/video-transcoding-pipeline.git
cd video-transcoding-pipeline

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Architecture
```
User uploads video
    ↓
FastAPI receives file → Creates 5 transcode jobs (1080p, 720p, 480p, 360p, 240p)
    ↓
Jobs pushed to Redis queue
    ↓
3 Celery workers pick up jobs in parallel
    ↓
Workers transcode using FFmpeg + update progress in PostgreSQL
    ↓
Frontend polls for updates every 2 seconds
    ↓
User downloads completed videos
```

## Demo

### Upload Interface
![Upload Page](screenshots/upload.png)

### Real-time Processing
![Processing Page](screenshots/processing.png)

### Completed Jobs
![Completed Page](screenshots/completed.png)

## System Design

- **Worker Pool**: 3 parallel workers processing different resolutions simultaneously
- **Job Distribution**: Redis-backed queue ensures even load distribution across workers
- **Progress Tracking**: Real-time updates stored in PostgreSQL, polled by frontend
- **Fault Tolerance**: Celery automatic retry on worker failure
- **Resource Optimization**: FFmpeg preset tuning for encode speed vs quality tradeoff

## Performance

- Processes 5 resolutions in parallel (vs sequential: 70% faster)
- Supports videos up to 500MB
- Sub-second latency for progress updates
- File size reduction: Original → 1080p (-15%), 720p (-45%), 480p (-70%), 360p (-85%), 240p (-95%)

## Future Enhancements

- Worker capacity monitoring (active workers: 3/3, queue depth display)
- Priority queue (high/normal/low priority jobs)
- Retry logic visualization (attempt tracking)
- Cost-aware scheduling (CPU budget constraints)

## License
