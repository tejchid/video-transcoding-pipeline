'use client';

import { CheckCircle, Clock, XCircle, Download, Play } from 'lucide-react';

export default function ProgressCard({ job, videoId, onPlay }) {
  const downloadUrl = 'http://localhost:8000/api/download/' + videoId + '/' + job.resolution;
  
  let statusClass = 'bg-gray-500/10 border-gray-500/50';
  if (job.status === 'completed') statusClass = 'bg-green-500/10 border-green-500/50';
  if (job.status === 'processing') statusClass = 'bg-blue-500/10 border-blue-500/50';
  if (job.status === 'failed') statusClass = 'bg-red-500/10 border-red-500/50';

  let progressClass = 'bg-gray-500';
  if (job.status === 'completed') progressClass = 'bg-gradient-to-r from-green-500 to-green-400';
  if (job.status === 'processing') progressClass = 'bg-gradient-to-r from-blue-500 to-blue-400 animate-pulse';
  if (job.status === 'failed') progressClass = 'bg-red-500';

  let icon = <Clock className="w-5 h-5 text-gray-500" />;
  if (job.status === 'completed') icon = <CheckCircle className="w-5 h-5 text-green-500 animate-checkmark" />;
  if (job.status === 'processing') icon = <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
  if (job.status === 'failed') icon = <XCircle className="w-5 h-5 text-red-500" />;

  return (
    <div className={statusClass + ' p-6 rounded-2xl border transition-all duration-300 hover:scale-105'}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-bold text-lg">{job.resolution}</span>
        </div>
        <span className="text-sm text-gray-400">{job.progress}%</span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className={progressClass + ' h-2 rounded-full transition-all duration-500 ease-out'}
          style={{ width: job.progress + '%' }}
        />
      </div>

      <div className="space-y-1 text-sm">
        {job.worker_id && (
          <p className="text-gray-400">
            Worker: <span className="text-white font-mono">{job.worker_id}</span>
          </p>
        )}
        {job.status === 'completed' && job.output_size_mb && (
          <p className="text-gray-400">
            Output: <span className="text-white">{job.output_size_mb} MB</span>
          </p>
        )}
        <p className="text-gray-400">
          Status: <span className="text-white capitalize">{job.status}</span>
        </p>
      </div>

      {job.status === 'completed' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={function() { onPlay(downloadUrl, job.resolution); }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover:scale-105"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
          <a
            href={downloadUrl}
            download
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      )}
    </div>
  );
}
