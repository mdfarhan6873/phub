import { MoreVertical, Play } from "lucide-react";
import VideoCard from "@/components/VideoCard";

async function getVideos() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/videos?limit=12`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.videos || [];
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    return [];
  }
}

export default async function Home() {
  const videos = await getVideos();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">VideoHub</h1>
          </div>

          {/* Three Dots Menu */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Videos Grid */}
      <main className="p-4">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video: any) => (
              <VideoCard
                key={video._id}
                id={video._id}
                title={video.title}
                thumbnail={video.thumbnail || '/placeholder-video.jpg'}
                duration={video.duration || 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No videos yet</h3>
            <p className="text-gray-500 text-center">Videos will appear here once they're uploaded</p>
          </div>
        )}
      </main>
    </div>
  );
}
