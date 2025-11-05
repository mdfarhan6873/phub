"use client";

import { useState } from "react";
import CategoriesComponent from "./components/categories";
import VideosComponent from "./components/vedios";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "videos">("categories");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded ${
            activeTab === "categories" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`px-4 py-2 rounded ${
            activeTab === "videos" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Videos
        </button>
      </div>
      {activeTab === "categories" && <CategoriesComponent />}
      {activeTab === "videos" && <VideosComponent />}
    </div>
  );
}
