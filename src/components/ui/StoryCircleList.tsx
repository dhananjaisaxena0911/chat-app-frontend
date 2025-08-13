"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import clsx from "clsx";

export default function StoryCircleList({
  userId,
  onStoryClick,
}: {
  userId: string;
  onStoryClick: (userId: string) => void;
}) {
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    async function fetchStories() {
      try {
        const res = await axios.get(
          `http://localhost:3001/story/active/${userId}`
        );
        setStories(res.data);
      } catch (error) {
        console.error("Error fetching stories circles", error);
      }
    }
    fetchStories();
  }, [userId]);

  const userGroupStoryMap = new Map<string, any>();

  stories.forEach((story) => {
    const uid = story.user.id;
    if (!userGroupStoryMap.has(uid)) {
      userGroupStoryMap.set(uid, story);
    }
  });

  const uniqueUserStories = Array.from(userGroupStoryMap.values());
  return (
   <div className="flex overflow-x-auto space-x-4">
  {uniqueUserStories.map((story) => (
    <div
      key={story.user.id}
      className="flex flex-col items-center cursor-pointer"
      onClick={() => onStoryClick(story.user.id)}
    >
      {/* This wrapper ensures proper clipping and shape */}
      <div
        className={clsx(
          "w-16 h-16 border-4 rounded-full overflow-hidden flex items-center justify-center",
          story.user.id === userId ? "border-blue-500" : "border-pink-500"
        )}
      >
        <Image
          src={story.imageUrl}
          alt={story.user.username || "user"}
          width={64}
          height={64}
          className="object-cover"
        />
      </div>
      <p className="text-xs mt-1 text-white truncate w-16 text-center">
        {story.user.username}
      </p>
    </div>
  ))}
</div>

  );
}
