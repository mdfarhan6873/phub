"use client";

import { useState, useEffect } from "react";

interface Category {
  _id: string;
  name: string;
}

export default function CategoriesComponent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName("");
      fetchCategories();
    }
    setLoading(false);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setEditName(category.name);
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditName("");
      fetchCategories();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCategories();
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="border p-2 mr-2"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>
      <ul>
        {categories.map((category) => (
          <li key={category._id} className="border p-2 mb-2 flex justify-between items-center">
            {editingId === category._id ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-1 mr-2"
                />
                <button
                  onClick={() => handleUpdate(category._id)}
                  disabled={loading}
                  className="bg-green-500 text-white px-2 py-1 rounded mr-1"
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
            ) : (
              <>
                <span>{category.name}</span>
                <div>
                  <button
                    onClick={() => handleEdit(category)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
