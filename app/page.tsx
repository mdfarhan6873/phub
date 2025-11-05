
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";



interface Video {
  _id: string;
  title: string;
  category: { _id: string; name: string };
  streamtapeId: string;
  link: string;
  thumbnail?: string;
  likes: number;
  views: number;
}

interface Category {
  _id: string;
  name: string;
}

export default function Home() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchVideos = async (pageNum: number = 1, append: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const categoryParam = selectedCategory ? `&category=${selectedCategory}` : '';
      const res = await fetch(`/api/videos?page=${pageNum}&limit=20${categoryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setVideos(prev => [...prev, ...data]);
        } else {
          setVideos(data);
        }
        if (data.length < 20) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchVideos();

    // Check screen size
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640); // sm breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [selectedCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
          fetchVideos(page + 1, true);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Reset page and videos when category changes
  useEffect(() => {
    setPage(1);
    setVideos([]);
    setHasMore(true);
  }, [selectedCategory]);

  const visibleCount = 4;
  const visibleCategories = categories.slice(0, visibleCount);
  const dropdownCategories = categories.slice(visibleCount);

  return (
    <>
      <div className="min-h-screen bg-black flex justify-center">
        <div className="w-full max-w-full lg:max-w-[90vw]">
          <header className="w-full bg-stone-800 flex items-center justify-between px-4 py-2 h-16">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={200} height={60} />
            </Link>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </header>
          <nav className="bg-transparent px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-white mr-4">Explore Categories</span>
              <div className="hidden sm:flex space-x-4">
                  {visibleCategories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(selectedCategory === cat._id ? null : cat._id)}
                      className={`text-white hover:text-gray-300 ${selectedCategory === cat._id ? 'text-red-500' : ''}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              {((isSmallScreen && categories.length > 0) || (!isSmallScreen && dropdownCategories.length > 0)) && (
                <div className="relative dropdown-container">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="text-white hover:text-gray-300 flex items-center">
                    More
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                      {(isSmallScreen ? categories : dropdownCategories).map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => {
                            setSelectedCategory(selectedCategory === cat._id ? null : cat._id);
                            setDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-white hover:bg-gray-600 ${selectedCategory === cat._id ? 'text-red-500' : ''}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
          <div className="p-4 bg-stone-800 min-h-screen">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl sm:text-2xl font-bold">
                {selectedCategory ? `${categories.find(cat => cat._id === selectedCategory)?.name} Videos` : 'Trending XMASTER Videos'}
              </h2>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded ${selectedCategory ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`}
                >
                  {selectedCategory ? 'Clear Filter' : 'All'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.length === 0 && loading ? (
                // Skeleton loading
                Array.from({ length: 20 }).map((_, index) => (
                  <div key={index} className="cursor-pointer">
                    <div className="bg-gray-800 rounded-lg overflow-hidden mb-2 animate-pulse">
                      <div className="w-full aspect-video bg-gray-700"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-700 rounded mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                videos.map((video) => (
                  <Link key={video._id} href={`/videoplay?videoId=${video._id}`}>
                    <div className="cursor-pointer">
                      <div className="bg-gray-800 rounded-lg overflow-hidden mb-2">
                        <Image
                          src={video.thumbnail || "/logo.png"}
                          alt={video.title}
                          width={320}
                          height={180}
                          className="w-full aspect-video object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-white text-sm font-medium line-clamp-2">{video.title}</h3>
                        <p className="text-gray-400 text-xs mt-1">{video.category?.name}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            {loading && <div className="text-white text-center py-4">Loading more videos...</div>}
            <div ref={observerRef} className="h-10"></div>
          </div>
        </div>
      </div>

    </>
  );
}
