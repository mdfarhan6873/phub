'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  thumbnailUrl: string;
}

const CategoryForm = () => {
  const [name, setName] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]); // 👈 categories state

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!thumbnail) {
        throw new Error('Please select a thumbnail image');
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('thumbnail', thumbnail);

      const res = await fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create category');
      }

      setName('');
      setThumbnail(null);
      alert('Category created successfully!');
      await fetchCategories(); // 👈 refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="categoryThumbnail" className="block text-sm font-medium text-gray-700">
            Category Thumbnail
          </label>
          <input
            type="file"
            id="categoryThumbnail"
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
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>

      {/* Display Categories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Added Categories</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">No categories added yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <li key={category.id} className="border rounded-md p-4 flex flex-col items-center text-center">
                <img
                  src={category.thumbnailUrl}
                  alt={category.name}
                  className="w-24 h-24 object-cover rounded-md mb-2"
                />
                <span className="font-medium">{category.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryForm;
