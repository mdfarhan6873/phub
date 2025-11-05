"use client";

import { useState, useEffect } from "react";

interface Category {
  _id: string;
  name: string;
}

interface Video {
  _id: string;
  title: string;
  category?: Category;
  categoryId?: string;
  streamtapeId: string;
  link: string;
  thumbnail?: string;
  likes: number;
  views: number;
}

export default function VideosComponent() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    file: null as File | null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    streamtapeId: "",
    link: "",
    thumbnail: "",
    likes: 0,
    views: 0,
  });
  const [loading, setLoading] = useState(false);

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'retrieving' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      } else {
        console.error("Failed to fetch videos");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus('uploading');

    let streamtapeId = "";
    let link = "";

    if (form.file) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", form.file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          streamtapeId = uploadData.streamtapeId;
          link = uploadData.link;
          setUploadStatus('retrieving');
        } else {
          alert("Failed to upload video to Streamtape");
          setLoading(false);
          setUploadStatus('error');
          return;
        }
      } catch (error) {
        alert("Error uploading video");
        setLoading(false);
        setUploadStatus('error');
        return;
      }
    }

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        category: form.category,
        streamtapeId,
        link,
        // thumbnail is now automatically retrieved from Streamtape
      }),
    });
    if (res.ok) {
      setForm({ title: "", category: "", file: null });
      fetchVideos();
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000); // Reset after 3 seconds
    } else {
      setUploadStatus('error');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (video: Video) => {
    setEditingId(video._id);
    setEditForm({
      title: video.title,
      category: video.category?._id || video.categoryId || "",
      streamtapeId: video.streamtapeId,
      link: video.link,
      thumbnail: video.thumbnail || "",
      likes: video.likes,
      views: video.views,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    const res = await fetch(`/api/videos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingId(null);
      setEditForm({ title: "", category: "", streamtapeId: "", link: "", thumbnail: "", likes: 0, views: 0 });
      fetchVideos();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      const res = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchVideos();
      }
    }
  };

  const handleRetrieveThumbnail = async (id: string) => {
    try {
      const res = await fetch(`/api/videos/${id}/thumbnail`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        alert("Thumbnail retrieved successfully!");
        fetchVideos(); // Refresh the list to show the new thumbnail
      } else {
        const errorData = await res.json();
        alert(`Failed to retrieve thumbnail: ${errorData.error}`);
      }
    } catch (error) {
      alert("Error retrieving thumbnail");
    }
  };

  const getCategoryName = (video: Video) => {
    if (video.category?.name) return video.category.name;
    if (video.categoryId) {
      const cat = categories.find(c => c._id === video.categoryId);
      return cat?.name || "Unknown";
    }
    return "Unknown";
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Videos</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Video title"
          className="border p-2 w-full"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="border p-2 w-full"
        />
        {/* Thumbnail URL is now automatically retrieved from Streamtape */}
        <p className="text-sm text-gray-600">Thumbnail will be automatically retrieved from Streamtape after upload</p>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            uploadStatus === 'success'
              ? 'bg-green-500'
              : uploadStatus === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
        >
          {uploadStatus === 'uploading'
            ? 'Uploading Video...'
            : uploadStatus === 'retrieving'
            ? 'Retrieving Thumbnail...'
            : uploadStatus === 'success'
            ? 'Successfully Uploaded!'
            : uploadStatus === 'error'
            ? 'Upload Failed'
            : 'Add Video'}
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video._id} className="border p-4 rounded">
            {editingId === video._id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="Video title"
                  className="border p-2 w-full"
                />
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="border p-2 w-full"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="streamtapeId"
                  value={editForm.streamtapeId}
                  onChange={handleEditChange}
                  placeholder="Streamtape ID"
                  className="border p-2 w-full"
                />
                <input
                  type="text"
                  name="link"
                  value={editForm.link}
                  onChange={handleEditChange}
                  placeholder="Video link"
                  className="border p-2 w-full"
                />
                <input
                  type="text"
                  name="thumbnail"
                  value={editForm.thumbnail}
                  onChange={handleEditChange}
                  placeholder="Thumbnail URL"
                  className="border p-2 w-full"
                />
                <input
                  type="number"
                  name="likes"
                  value={editForm.likes}
                  onChange={handleEditChange}
                  placeholder="Likes"
                  className="border p-2 w-full"
                />
                <input
                  type="number"
                  name="views"
                  value={editForm.views}
                  onChange={handleEditChange}
                  placeholder="Views"
                  className="border p-2 w-full"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(video._id)}
                    disabled={loading}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover mb-2" />}
                <h3 className="font-semibold">{video.title}</h3>
                <p>Category: {getCategoryName(video)}</p>
                <p>Likes: {video.likes} | Views: {video.views}</p>
                <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 block mb-2">
                  Watch Video
                </a>
                <div className="flex space-x-2 flex-wrap">
                  <button
                    onClick={() => handleEdit(video)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                  {!video.thumbnail && (
                    <button
                      onClick={() => handleRetrieveThumbnail(video._id)}
                      className="bg-purple-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Get Thumbnail
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
