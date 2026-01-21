# StreamForge Video Transcoding Pipeline

Distributed video transcoding system built with FastAPI, Celery, and Next.js.

## Features

- Upload videos (MP4, MOV, AVI, MKV)
- Parallel transcoding to 5 resolutions (1080p, 720p, 480p, 360p, 240p)
- Real-time progress tracking
- 3 worker nodes for distributed processing
- Clean, modern UI

## Tech Stack

**Backend:**
- Python 3.11
- FastAPI
- Celery + Redis
- PostgreSQL
- FFmpeg

**Frontend:**
- Next.js 14
- TypeScript
- Tailwind CSS

## Setup
```bash
# Start all services
docker-compose up --build

# Frontend will be at http://localhost:3000
# API will be at http://localhost:8000
```

## Usage

1. Go to http://localhost:3000
2. Upload a video file
3. Watch real-time transcoding progress
4. Download transcoded videos

## Architecture

- Upload video → FastAPI receives file
- Creates 5 transcode jobs (one per resolution)
- Jobs queued in Redis
- 3 Celery workers process jobs in parallel
- Real-time progress updates via polling
- Completed videos available for download
