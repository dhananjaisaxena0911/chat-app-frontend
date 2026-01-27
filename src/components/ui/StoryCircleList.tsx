"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import clsx from "clsx";

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
        const res = await axios.get<Story[]>(`http://localhost:3001/story/active/${userId}`);
        setStories(res.data);
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
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-16 h-3 bg-gray-200 rounded mt-1 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (uniqueUserStories.length === 0) {
    return (
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <p className="text-sm text-gray-400 dark:text-gray-500">No stories yet</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {uniqueUserStories.map((story) => {
        const isOwnStory = story.user.id === userId;
        const userInitial = story.user.username?.charAt(0).toUpperCase() || story.user.email?.charAt(0).toUpperCase() || "?";

        return (
          <div
            key={story.user.id}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
            onClick={() => onStoryClick(story.user.id)}
          >
            {/* Story ring */}
            <div
              className={clsx(
                "w-16 h-16 rounded-full p-[3px] transition-all duration-300 group-hover:scale-105",
                isOwnStory 
                  ? "bg-gradient-to-br from-blue-500 to-purple-500" 
                  : "bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600"
              )}
            >
              <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-gray-900">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
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
                    <span className="text-lg font-semibold text-gray-400">{userInitial}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Username */}
            <p className="text-xs mt-2 text-gray-600 dark:text-gray-300 truncate w-16 text-center font-medium">
              {isOwnStory ? "Your story" : story.user.username || "User"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

