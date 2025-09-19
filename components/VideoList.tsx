'use client';

import { useState, useEffect } from 'react';

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: {
    _id: string;
    name: string;
  };
  views: number;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

const VideoList = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos?limit=50');
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description,
      category: video.category?._id || ''
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    try {
      const res = await fetch(`/api/videos?id=${editingVideo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setEditingVideo(null);
        fetchVideos();
        alert('Video updated successfully!');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update video');
      }
    } catch (error) {
      console.error('Failed to update video:', error);
      alert('Failed to update video');
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/videos?id=${videoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchVideos();
        alert('Video deleted successfully!');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading videos...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Manage Videos</h2>

      {videos.length === 0 ? (
        <p className="text-gray-500">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video._id} className="border rounded-lg p-4 bg-white shadow-sm">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h3 className="font-medium text-sm mb-1">{video.title}</h3>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{video.description}</p>
              <p className="text-xs text-gray-500 mb-2">
                Category: {video.category?.name || 'None'}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Views: {video.views} | Created: {new Date(video.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(video)}
                  className="flex-1 bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(video._id)}
                  className="flex-1 bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Video</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;
