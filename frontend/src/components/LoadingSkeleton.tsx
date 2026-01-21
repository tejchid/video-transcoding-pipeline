'use client';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-2xl border border-gray-700 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-24 bg-gray-700 rounded" />
            <div className="h-6 w-16 bg-gray-700 rounded" />
          </div>
          <div className="h-2 bg-gray-700 rounded-full mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-700 rounded" />
            <div className="h-4 w-40 bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
