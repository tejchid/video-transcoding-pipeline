'use client';

import { useEffect, useState } from 'react';
import { listVideos } from '@/lib/api';
import Link from 'next/link';
import { CheckCircle, Clock, XCircle, Upload } from 'lucide-react';

export default function Dashboard() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await listVideos();
        setVideos(data.videos);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload New
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No videos uploaded yet</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Upload Your First Video
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <Link
                key={video.video_id}
                href={`/video/${video.video_id}`}
                className="block p-6 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(video.status)}
                      <h2 className="text-xl font-bold">{video.original_filename}</h2>
                    </div>
                    <p className="text-gray-400">
                      Uploaded {new Date(video.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-gray-700 rounded-lg text-sm capitalize">
                    {video.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
