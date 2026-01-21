'use client';

import { Upload } from 'lucide-react';
import { useState } from 'react';
import { uploadVideo } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Toast from './Toast';

export default function UploadZone() {
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const result = await uploadVideo(file);
      setToast({ message: 'Upload successful! Processing started.', type: 'success' });
      setTimeout(() => {
        router.push(`/video/${result.video_id}`);
      }, 1000);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setToast({ message: 'Upload failed. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="border-2 border-dashed border-gray-600 rounded-3xl p-16 text-center hover:border-blue-500 transition-all duration-300 hover:scale-105">
        <Upload className={'w-16 h-16 mx-auto mb-4 transition-all ' + (uploading ? 'text-blue-500 animate-bounce' : 'text-gray-400')} />
        <h2 className="text-2xl font-bold mb-2">
          {uploading ? 'Uploading...' : 'Upload Video'}
        </h2>
        <p className="text-gray-400 mb-6">
          Drag & drop video file or click to browse
        </p>
        <label className="inline-block">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <span className={'px-8 py-3 bg-blue-600 text-white rounded-xl cursor-pointer transition-all inline-block ' + (uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:scale-105')}>
            {uploading ? 'Uploading...' : 'Browse Files'}
          </span>
        </label>
        <p className="text-sm text-gray-500 mt-4">
          Supported formats: MP4, MOV, AVI, MKV • Max size: 500MB
        </p>
      </div>
    </div>
  );
}
