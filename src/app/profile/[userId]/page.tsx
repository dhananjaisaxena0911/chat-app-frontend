"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SidebarDemo } from "../../../../components/sideBarDemo";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

type UserProfile = {
  id: string;
  email: string;
  username: string;
  followerCount: number;
  followingCount: number;
};

export default function PublicProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("currentUserId");
    if (user) {
      setCurrentUserId(user);
    }
  }, []);
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:3001/users/${userId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUser(data.user);
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!currentUserId || !userId) return;

    fetch(
      `http://localhost:3001/follow/isFollowing?followerId=${currentUserId}&followingId=${userId}`
    )
      .then((res) => res.json())
      .then((data) => setIsFollowing(data.isFollowing))
      .catch((err) => console.error("Error checking follow status", err));
  }, [currentUserId, userId]);

  const handleToggleFollow = async () => {
    if (!currentUserId || !userId) return;
    const url = isFollowing
      ? "http://localhost:3001/follow/unfollow"
      : "http://localhost:3001/follow";

    const method = "POST";
    const body = JSON.stringify({
      followerId: currentUserId,
      followingId: userId,
    });

    try {
      console.log(body);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      } else {
        console.error("Failed to toggle follow:", await res.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading)
    return <div className="p-8 text-white">Loading the user profile</div>;
  if (!user) return <div className="p-8 text-white">User not found!</div>;

  return (
    <SidebarDemo>
      <div className="min-h-screen bg-neutral-900 text-white p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold">{user.username}</h2>
            <p className="text-sm text-neutral-400">
              {new Date().toDateString()}
            </p>
          </div>

          {currentUserId !== userId && (
            <button
              className={`px-4 py-2 rounded-md ${
                isFollowing
                  ? "bg-gray-300 text-black"
                  : "bg-blue-600 text-white"
              }`}
              onClick={handleToggleFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
        <div className="w-full max-w-4xl bg-neutral-800 rounded-2xl shadow-cl p-8 mx-auto ,b-1">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium">{user.username}</p>
              <p className="text-sm text-neutral-400">{user.email}</p>
              <div className="flex gap-4 mt-2 text-sm text-neutral-400">
                <span><strong>{user.followerCount}</strong> Followers</span>
                <span><strong>{user.followingCount}</strong> Followings</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField label="User ID" value={user.id}></ProfileField>
            <ProfileField label="Username" value={user.username}></ProfileField>
            <ProfileField label="Email" value={user.email}></ProfileField>
          </div>
        </div>
        <div className="h-[120vh] flex items-center justify-center mt-20">
          <MacbookScroll src="https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=1616&auto=format&fit=crop&ixlib=rb-4.1.0" />
        </div>
      </div>
    </SidebarDemo>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm mb-1 text-neutral-400">{label}</label>
      <input
        type="text"
        value={value}
        disabled
        className="bg-neutral-700 text-white rounded-md px-3 py-2 cursor-not-allowed"
      />
    </div>
  );
}
