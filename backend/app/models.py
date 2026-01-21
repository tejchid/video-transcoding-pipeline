from sqlalchemy import Column, String, Integer, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from .database import Base

class Video(Base):
    __tablename__ = "videos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_filename = Column(String, nullable=False)
    original_path = Column(String, nullable=False)
    file_size_mb = Column(Numeric(10, 2))
    duration_seconds = Column(Integer)
    status = Column(String, default='processing')
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    jobs = relationship("TranscodeJob", back_populates="video")

class TranscodeJob(Base):
    __tablename__ = "transcode_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    video_id = Column(UUID(as_uuid=True), ForeignKey('videos.id'))
    resolution = Column(String, nullable=False)
    status = Column(String, default='queued')
    progress = Column(Integer, default=0)
    output_path = Column(String)
    output_size_mb = Column(Numeric(10, 2))
    worker_id = Column(String)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    error_message = Column(Text)
    
    video = relationship("Video", back_populates="jobs")
