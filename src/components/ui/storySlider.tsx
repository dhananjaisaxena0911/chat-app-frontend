"use client"

import { ImagesSlider } from "./images-slider"
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../../utils/api";

interface StoryUser {
  id: string;
  username: string;
  email: string;
}

interface Story {
  id: string;
  user: StoryUser;
  imageUrl: string;
  createdAt: string;
}

export default function StorySlider({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch stories
  useEffect(() => {
    if (!userId) return;

    async function fetchStories() {
      try {
        const data = await api.get<Story[]>(`/story/active/${userId}`);
        setStories(data);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, [userId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, stories.length]);

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, stories.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const currentStory = stories[currentIndex];

  // Loading skeleton - YouTube Shorts style
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative w-full max-w-[400px] aspect-[9/16] bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Phone frame */}
          <div className="absolute inset-0 border-8 border-gray-800 rounded-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-white/80 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - YouTube Shorts style
  if (stories.length === 0) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-[400px] aspect-[9/16] bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Phone frame */}
          <div className="absolute inset-0 border-8 border-gray-800 rounded-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No stories yet</h2>
            <p className="text-white/60 mb-6 text-sm">This user hasn't shared any stories</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200"
            >
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const images = stories.map(s => s.imageUrl);
  const userInitial = (currentStory?.user?.email?.charAt(0).toUpperCase() || currentStory?.user?.username?.charAt(0).toUpperCase() || "?");

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Phone frame border */}
        <div className="absolute inset-0 border-8 border-gray-800 rounded-3xl pointer-events-none z-50" />
        
        {/* Main image display */}
        <ImagesSlider className="h-full" images={images} onClose={onClose}>
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="z-50 flex flex-col justify-start items-center pt-20"
          >
            <motion.p className="font-bold text-2xl text-center text-white drop-shadow-lg">
              {currentStory?.user?.username || "Story"}
            </motion.p>
          </motion.div>
        </ImagesSlider>

        {/* Custom overlay UI - rendered on top of ImagesSlider */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top header with user info and close button */}
          <div className="absolute top-0 left-0 right-0 p-4 pt-6 z-50 pointer-events-auto">
            {/* Progress bars */}
            <div className="flex gap-1 mb-4 px-2">
              {stories.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: index < currentIndex ? "100%" : index === currentIndex ? "100%" : "0%" }}
                    transition={{ duration: 0.1 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              ))}
            </div>

            {/* User info row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold ring-2 ring-white/30">
                  {userInitial}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm drop-shadow-md">
                    {currentStory?.user?.username || "User"}
                  </p>
                  <p className="text-white/70 text-xs drop-shadow-md">
                    {currentStory?.createdAt ? new Date(currentStory.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Navigation areas - clickable halves */}
          <div className="absolute inset-0 flex pt-20">
            <div 
              className="flex-1 cursor-pointer pointer-events-auto" 
              onClick={goToPrevious}
              title="Previous story"
            />
            <div 
              className="flex-1 cursor-pointer pointer-events-auto" 
              onClick={goToNext}
              title="Next story"
            />
          </div>

          {/* Bottom actions */}
          <div className="absolute bottom-6 right-4 z-50 flex flex-col gap-4 pointer-events-auto">
            {/* Like button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </motion.button>
            
            {/* Comment button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </motion.button>
            
            {/* Share button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </motion.button>
            
            {/* More options */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </motion.button>
          </div>

          {/* Story caption area */}
          <div className="absolute bottom-6 left-4 right-20 z-50">
            <p className="text-white text-sm drop-shadow-md">
              @{currentStory?.user?.username || "user"} • {currentStory?.createdAt ? new Date(currentStory.createdAt).toLocaleDateString() : ""}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

