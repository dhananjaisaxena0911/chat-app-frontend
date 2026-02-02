"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function FollowButton({
  currentUserId,
  profileUserId,
}: {
  currentUserId: string;
  profileUserId: string;
}) {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkIfFollowing = async () => {
      try {
        const data = await api.get<{ isFollowing: boolean }>(
          "/follow/isFollowing",
          { followerId: currentUserId, followingId: profileUserId }
        );
        setIsFollowing(data.isFollowing);
      } catch (error) {
        console.error("Failed to fetch following status:", error);
      }
    };
    checkIfFollowing();
  }, [currentUserId, profileUserId]);

  const toggleFollow = async () => {
    if (!currentUserId || !profileUserId) return;

    const endpoint = isFollowing ? "/follow/unfollow" : "/follow";

    try {
      await api.post(endpoint, {
        followerId: currentUserId,
        followingId: profileUserId,
      });
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(error);
    }
  };

  if (currentUserId === profileUserId) return null;
  return (
    <button
      className={`px-4 py-2 rounded-md ${
        isFollowing ? "bg-gray-300 text-black" : "bg-blue-600 text-white"
      }`}
      onClick={toggleFollow}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}

