import UploadZone from '@/components/UploadZone';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <nav className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
        <h1 className="text-3xl font-bold">StreamForge</h1>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Dashboard
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Video Transcoding Pipeline</h2>
          <p className="text-xl text-gray-400">
            Upload your video and transcode to multiple resolutions in parallel
          </p>
        </div>

        <UploadZone />
      </div>
    </main>
  );
}
