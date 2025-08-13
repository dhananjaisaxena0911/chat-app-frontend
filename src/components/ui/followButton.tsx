"use client";

import { useEffect, useState } from "react";

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
        const res = await fetch(
          `http://localhost:3001/follow/isFollowing?followerId=${currentUserId}&followingId=${profileUserId}`
        );
        const data = await res.json();

        setIsFollowing(data.isFollowing);
      } catch (error) {
        console.error("Failed to fetch following status:", error);
      }
    };
    checkIfFollowing();
  }, [currentUserId, profileUserId]);

   const toggleFollow = async () => {
    if (!currentUserId || !profileUserId) return;

    const endpoint = isFollowing
      ? "http://localhost:3001/follow/unfollow"
      : "http://localhost:3001/follow";

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerId: currentUserId,
          followingId: profileUserId,
        }),
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
