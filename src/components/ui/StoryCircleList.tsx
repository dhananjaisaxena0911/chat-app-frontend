"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
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

interface StoryCircleListProps {
  userId: string;
  onStoryClick: (userId: string) => void;
}

export default function StoryCircleList({ userId, onStoryClick }: StoryCircleListProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchStories() {
      try {
        const data = await api.get<Story[]>(`/story/active/${userId}`);
        setStories(data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, [userId]);

  // Get unique user stories
  const userGroupStoryMap = new Map<string, Story>();
  stories.forEach((story) => {
    if (!userGroupStoryMap.has(story.user.id)) {
      userGroupStoryMap.set(story.user.id, story);
    }
  });
  const uniqueUserStories = Array.from(userGroupStoryMap.values());

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="w-14 h-3 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (uniqueUserStories.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-[3px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs mt-2 text-gray-400 dark:text-gray-500 font-medium">No stories</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence mode="popLayout">
        {uniqueUserStories.map((story, index) => {
          const isOwnStory = story.user.id === userId;
          const userInitial = story.user.username?.charAt(0).toUpperCase() || story.user.email?.charAt(0).toUpperCase() || "?";

          return (
            <motion.div
              key={story.user.id}
              layout
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              onClick={() => onStoryClick(story.user.id)}
            >
              {/* Story ring with animated gradient border */}
              <div className="relative">
                {/* Animated gradient border */}
                <motion.div
                  className={clsx(
                    "w-16 h-16 rounded-full p-[3px]",
                    isOwnStory 
                      ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" 
                      : "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500"
                  )}
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  <motion.div 
                    className="w-full h-full rounded-full p-[2px] bg-white dark:bg-gray-900"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                      {story.imageUrl ? (
                        <Image
                          src={story.imageUrl}
                          alt={story.user.username || "user"}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/image11.png";
                          }}
                        />
                      ) : (
                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-pink-500">
                          {userInitial}
                        </span>
                      )}
                      
                      {/* Viewed overlay for own stories */}
                      {isOwnStory && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Plus badge for own story */}
                {isOwnStory && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-md"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.div>
                )}
              </div>
              
              {/* Username with truncation */}
              <motion.p 
                className="text-xs mt-2 text-gray-600 dark:text-gray-300 truncate w-16 text-center font-medium"
                whileHover={{ scale: 1.05 }}
              >
                {isOwnStory ? "You" : (story.user.username?.split(" ")[0] || "User")}
              </motion.p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

