"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SidebarDemo } from "../../../../components/sideBarDemo";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "../../../../utils/api";

type UserProfile = {
  id: string;
  email: string;
  username: string;
  followerCount: number;
  followingCount: number;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  createdAt?: string;
};

type Blog = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category?: string;
  createdAt: string;
  author?: {
    id: string;
    email: string;
  };
};

export default function PublicProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes">("posts");

  useEffect(() => {
    const user = localStorage.getItem("currentUserId");
    if (user) {
      setCurrentUserId(user);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const [userData, postsData] = await Promise.all([
          api.get<{ user: UserProfile }>(`/users/${userId}`),
          api.get<Blog[]>("/blogs"),
        ]);

        setUser(userData.user);

        // Fetch posts by this user
        const userPosts = Array.isArray(postsData)
          ? postsData.filter((blog: Blog) => blog.author?.id === userId)
          : [];
        setPosts(userPosts);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (!currentUserId || !userId) return;

    api.get<{ isFollowing: boolean }>(`/follow/isFollowing?followerId=${currentUserId}&followingId=${userId}`)
      .then((data) => setIsFollowing(data.isFollowing))
      .catch((err) => console.error("Error checking follow status", err));
  }, [currentUserId, userId]);

  const handleToggleFollow = async () => {
    if (!currentUserId || !userId) return;
    const endpoint = isFollowing ? "/follow/unfollow" : "/follow";

    try {
      await api.post(endpoint, {
        followerId: currentUserId,
        followingId: userId,
      });

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <SidebarDemo>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mb-4"
            />
            <p className="text-white/60">Loading profile...</p>
          </div>
        </div>
      </SidebarDemo>
    );
  }

  if (!user) {
    return (
      <SidebarDemo>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
            <p className="text-white/60 mb-6">This user doesn't exist or has been removed</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl"
            >
              Go Home
            </Link>
          </motion.div>
        </div>
      </SidebarDemo>
    );
  }

  const userInitial = user.username?.charAt(0).toUpperCase() || "?";

  return (
    <SidebarDemo>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Hero Section with Cover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-72 md:h-80 overflow-hidden"
        >
          {/* Cover Image */}
          <div className="absolute inset-0">
            <img
              src={user.coverUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="text-white/60 text-sm hidden sm:block">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </motion.div>

        {/* Profile Info Section */}
        <div className="relative px-6 pb-6">
          <div className="max-w-5xl mx-auto">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 mb-6">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">{userInitial}</span>
                    )}
                  </div>
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-3xl font-bold text-white mb-1">{user.username}</h1>
                  <p className="text-white/60">{user.email}</p>
                </div>

                {currentUserId !== userId && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleToggleFollow}
                      className={`px-6 py-2.5 font-semibold rounded-xl shadow-lg transition-all ${
                        isFollowing
                          ? "bg-white/10 hover:bg-white/20 text-white"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push(`/messages`)}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-4 mb-6"
            >
              <StatCard label="Posts" value={posts.length} />
              <StatCard label="Followers" value={formatNumber(user.followerCount || 0)} />
              <StatCard label="Following" value={formatNumber(user.followingCount || 0)} />
            </motion.div>

            {/* Bio */}
            {user.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10"
              >
                <p className="text-white/90">{user.bio}</p>
              </motion.div>
            )}

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="flex gap-1 bg-white/5 rounded-2xl p-1.5 border border-white/10">
                {[
                  { id: "posts", label: "Posts", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                  { id: "media", label: "Media", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
                  { id: "likes", label: "Likes", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "posts" | "media" | "likes")}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Posts Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
                  <p className="text-white/60">This user hasn't shared any posts</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
                    >
                      <img
                        src={post.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <div className="flex items-center gap-4 text-white">
                          <div className="flex items-center gap-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span className="font-medium">{Math.floor(Math.random() * 500) + 50}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-medium">{Math.floor(Math.random() * 50) + 5}</span>
                          </div>
                        </div>
                      </div>
                      {post.category && (
                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <p className="text-white text-xs font-medium truncate max-w-[120px]">{post.category}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-8 text-center">
          <p className="text-white/40 text-sm">© 2026 SocialDev. All rights reserved.</p>
        </div>
      </div>
    </SidebarDemo>
  );
}

// Stat Card Component
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
    >
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/60 text-sm">{label}</p>
    </motion.div>
  );
}

// Format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

