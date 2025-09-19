'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

const VideoUploadForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!video || !thumbnail) {
        throw new Error('Please select both video and thumbnail files');
      }

      // Upload video
      const formData = new FormData();
      formData.append('video', video);

      const videoUploadRes = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!videoUploadRes.ok) {
        throw new Error('Failed to upload video');
      }

      const { videoId, duration } = await videoUploadRes.json();

      // Upload thumbnail
      const thumbnailFormData = new FormData();
      thumbnailFormData.append('thumbnail', thumbnail);
      thumbnailFormData.append('videoId', videoId);

      const thumbnailUploadRes = await fetch('/api/videos/thumbnail', {
        method: 'POST',
        body: thumbnailFormData,
      });

      if (!thumbnailUploadRes.ok) {
        throw new Error('Failed to upload thumbnail');
      }

      const { thumbnailUrl } = await thumbnailUploadRes.json();

      // Create video entry in database
      const createVideoRes = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          videoId,
          thumbnail: thumbnailUrl,
          duration,
        }),
      });

      if (!createVideoRes.ok) {
        throw new Error('Failed to create video entry');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setVideo(null);
      setThumbnail(null);

      alert('Video uploaded successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="video" className="block text-sm font-medium text-gray-700">
          Video File
        </label>
        <input
          type="file"
          id="video"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
          required
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
          Thumbnail Image
        </label>
        <input
          type="file"
          id="thumbnail"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
          required
          className="mt-1 block w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
      >
        {loading ? 'Uploading...' : 'Upload Video'}
      </button>
    </form>
  );
};

export default VideoUploadForm;
