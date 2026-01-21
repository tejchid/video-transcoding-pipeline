'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getVideo } from '@/lib/api';
import ProgressCard from '@/components/ProgressCard';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

export default function VideoPage() {
  const params = useParams();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({ url: '', resolution: '' });

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await getVideo(params.id as string);
        setVideo(data);
      } catch (error) {
        console.error('Failed to fetch video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
    const interval = setInterval(fetchVideo, 2000);
    return () => clearInterval(interval);
  }, [params.id]);

  const handlePlay = (url: string, resolution: string) => {
    setCurrentVideo({ url, resolution });
    setPlayerOpen(true);
  };

  const completedJobs = video?.jobs?.filter((j: any) => j.status === 'completed').length || 0;
  const totalJobs = video?.jobs?.length || 0;
  const progressPercent = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

  // Calculate ETA
  const processingJobs = video?.jobs?.filter((j: any) => j.status === 'processing').length || 0;
  const avgProgress = video?.jobs
    ?.filter((j: any) => j.status === 'processing')
    .reduce((sum: number, j: any) => sum + j.progress, 0) / (processingJobs || 1);
  const estimatedSeconds = processingJobs > 0 ? Math.round(((100 - avgProgress) / 10) * 30) : 0;
  const etaMinutes = Math.floor(estimatedSeconds / 60);
  const etaSeconds = estimatedSeconds % 60;

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-32 bg-gray-700 rounded mb-8 animate-pulse" />
          <div className="h-10 w-64 bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="h-6 w-48 bg-gray-700 rounded mb-8 animate-pulse" />
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Video not found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{video.original_filename}</h1>
          <p className="text-gray-400">
            Status: <span className="capitalize">{video.status}</span> • Uploaded {new Date(video.uploaded_at).toLocaleString()}
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Overall Progress</h2>
              <p className="text-gray-400 text-sm">
                {completedJobs} of {totalJobs} jobs completed
              </p>
            </div>
            {processingJobs > 0 && estimatedSeconds > 0 && (
              <div className="flex items-center gap-2 text-blue-400">
                <Clock className="w-5 h-5" />
                <span className="font-mono">
                  ~{etaMinutes}:{etaSeconds.toString().padStart(2, '0')} remaining
                </span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: progressPercent + '%' }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Transcoding Jobs</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {video.jobs && video.jobs.map((job: any) => (
            <ProgressCard
              key={job.resolution}
              job={job}
              videoId={video.video_id}
              onPlay={handlePlay}
            />
          ))}
        </div>
      </div>

      <VideoPlayerModal
        isOpen={playerOpen}
        onClose={() => setPlayerOpen(false)}
        videoUrl={currentVideo.url}
        resolution={currentVideo.resolution}
      />
    </main>
  );
}
