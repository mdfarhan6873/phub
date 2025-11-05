"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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

function VideoPlay() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string>("");

  // Get video ID from URL params
  const searchParams = useSearchParams();
  const videoId = searchParams.get('videoId');

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

  const fetchVideo = async (id: string) => {
    try {
      const res = await fetch(`/api/videos/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentVideo(data);
      }
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };

  const fetchVideos = async (pageNum: number = 1, append: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const url = selectedCategory
        ? `/api/videos?category=${selectedCategory}&page=${pageNum}&limit=20`
        : `/api/videos?page=${pageNum}&limit=20`;
      const res = await fetch(url);
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
    if (videoId) {
      fetchVideo(videoId);
      // Increment views only if not already viewed in this session
      const viewed = localStorage.getItem(`viewed-${videoId}`);
      if (!viewed) {
        incrementViews(videoId);
        localStorage.setItem(`viewed-${videoId}`, 'true');
      }
      // Check if user has liked this video in this session
      const liked = localStorage.getItem(`liked-${videoId}`);
      setIsLiked(liked === 'true');
    }
  }, [videoId]);

  const incrementViews = async (id: string) => {
    try {
      await fetch(`/api/videos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "incrementViews" }),
      });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const handleLike = async () => {
    if (!currentVideo) return;
    try {
      const action = isLiked ? "decrementLike" : "incrementLike";
      const res = await fetch(`/api/videos/${currentVideo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updatedVideo = await res.json();
        setCurrentVideo(updatedVideo);
        setIsLiked(!isLiked);
        // Store like state in localStorage
        localStorage.setItem(`liked-${currentVideo._id}`, (!isLiked).toString());
      }
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(url);
      setShareMessage('Link copied to clipboard!');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (error) {
      console.error('Modern clipboard failed, trying fallback:', error);
      try {
        // Fallback for older browsers or non-HTTPS contexts
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          setShareMessage('Link copied to clipboard!');
          setTimeout(() => setShareMessage(''), 3000);
        } else {
          throw new Error('execCommand failed');
        }
      } catch (fallbackError) {
        console.error('Fallback clipboard failed:', fallbackError);
        setShareMessage('Failed to copy link. Please copy manually.');
        setTimeout(() => setShareMessage(''), 5000);
      }
    }
  };

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
                    <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className="text-white hover:text-gray-300">{cat.name}</button>
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
                        <button key={cat._id} onClick={() => { setSelectedCategory(cat._id); setDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600">{cat.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Video Player Section */}
          <div className="p-4 bg-stone-800">
            <div className="w-full max-w-4xl mx-auto">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {currentVideo ? (
                  <iframe
                    src={`https://streamtape.com/e/${currentVideo.streamtapeId}${currentVideo.thumbnail ? `?thumb=${encodeURIComponent(currentVideo.thumbnail)}` : ''}`}
                    className="w-full h-full"
                    allowFullScreen
                    frameBorder="0"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    Loading video...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Actions Section */}
          <div className="p-4 bg-stone-800">
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLike}>
                    <svg className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-white text-sm">{currentVideo?.likes || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-white text-sm">{currentVideo?.views || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 cursor-pointer" onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'Check out this video',
                        url: url
                      });
                      // Success, no message needed as native dialog appears
                    } catch (error) {
                      console.error('Share failed, trying clipboard:', error);
                      copyToClipboard(url);
                    }
                  } else {
                    copyToClipboard(url);
                  }
                }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-white text-sm">Share</span>
                </div>
                {shareMessage && (
                  <div className="text-green-400 text-sm mt-2">{shareMessage}</div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Videos Section */}
          <div className="p-4 bg-stone-800 min-h-screen">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl sm:text-2xl font-bold">Similar Videos</h2>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="bg-gray-700 text-white px-4 py-2 rounded"
                >
                  <option value="">All</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoPlay />
    </Suspense>
  );
}
