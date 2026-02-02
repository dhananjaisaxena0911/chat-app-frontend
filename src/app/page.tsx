"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarDemo } from "../../components/sideBarDemo";
import UploadStoryModal from "@/components/ui/UploadStoryModal";
import StorySlider from "@/components/ui/storySlider";
import StoryCircleList from "@/components/ui/StoryCircleList";
import { AnimatedModalDemo } from "@/components/ui/animatedModelDemo";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { FollowButton } from "@/components/ui/followButton";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

type Blog = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category?: string;
  author?: {
    id: string;
    email: string;
  };
  createdAt?: string;
};

// Helper to get signed URL for images
async function getSignedImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return imageUrl;
  
  if (imageUrl.includes('X-Amz-Signature') || imageUrl.includes('Signature=')) {
    return imageUrl;
  }
  
  try {
    const encodedUrl = encodeURIComponent(imageUrl);
    const data = await api.get<{ signedUrl: string }>("/blogs/signed-url", { url: encodedUrl });
    return data.signedUrl || imageUrl;
  } catch (error) {
    console.error('Error fetching signed URL:', error);
    return imageUrl;
  }
}

export default function Page() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStoryUSerId, setSelectedStoryUserId] = useState<string | null>(
    null
  );
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  const openSliderForUser = (userId: string) => {
    setSelectedStoryUserId(userId);
    setIsSliderOpen(true);
  };

  useEffect(() => {
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      setUserId(currentUserId);
      setCurrentUserId(currentUserId);
    } else {
      router.replace("/auth");
    }
  }, [router]);

  useEffect(() => {
    api.get<Blog[]>("/blogs")
      .then(async (data) => {
        const blogsWithSignedUrls = await Promise.all(
          data.map(async (blog: Blog) => ({
            ...blog,
            imageUrl: blog.imageUrl ? await getSignedImageUrl(blog.imageUrl) : undefined,
          }))
        );
        setBlogs(blogsWithSignedUrls);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Loading skeleton component
  const BlogSkeleton = () => (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden animate-pulse">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-gray-700" />
      <div className="px-4 py-3 space-y-3">
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="space-y-2">
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 p-12 text-center"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
        <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No blogs yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        Be the first to share something amazing with the community!
      </p>
      <Link
        href="/blog/create"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Your First Blog
      </Link>
    </motion.div>
  );

  return (
    <SidebarDemo>
      <div className="max-w-2xl mx-auto">
        {/* Stories Section - Modern Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Stories
              </h2>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Live</span>
          </div>
          
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
            {/* Add Story Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-[3px]">
                  <div className="w-full h-full rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-neutral-800 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <p className="text-xs mt-2 text-gray-600 dark:text-gray-400 text-center font-medium">Add</p>
            </motion.div>

            {/* Story List */}
            <StoryCircleList
              userId={userId}
              onStoryClick={(uid) => openSliderForUser(uid)}
            />
          </div>
        </motion.div>

        {/* Blog Feed */}
        <div className="space-y-6">
          {/* Feed Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Feed</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Latest updates from your network</p>
                </div>
              </div>
              <Link
                href="/blog/create"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Blog
              </Link>
            </div>
          </motion.div>

          {loading ? (
            <div className="space-y-6">
              <BlogSkeleton />
              <BlogSkeleton />
            </div>
          ) : blogs.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {blogs.map((blog, index) => {
                const profileUserId = blog.author?.id;
                const authorInitial =
                  blog.author?.email?.charAt(0).toUpperCase() || "?";
                const authorName = blog.author?.email?.split("@")[0] || "Anonymous";

                return (
                  <motion.article
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-neutral-800 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Header - Author info */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-neutral-700/50">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/profile/${blog.author?.id}`}
                          className="relative group/avatar"
                        >
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                              <span className="text-sm font-bold bg-gradient-to-br from-violet-600 to-pink-600 bg-clip-text text-transparent">
                                {authorInitial}
                              </span>
                            </div>
                          </div>
                          <div className="absolute inset-0 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-violet-500/30 to-pink-500/30 blur-md" />
                        </Link>
                        <div>
                          <Link
                            href={`/profile/${blog.author?.id}`}
                            className="text-sm font-bold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                          >
                            {authorName}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            {blog.category && (
                              <span className="text-xs px-2.5 py-0.5 bg-gradient-to-r from-violet-100 to-pink-100 dark:from-violet-900/40 dark:to-pink-900/40 text-violet-600 dark:text-violet-400 rounded-full font-medium">
                                {blog.category}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              }) : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                    </div>

                    {/* Image with hover effect */}
                    <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-700 dark:to-neutral-800 overflow-hidden">
                      <img
                        src={
                          blog.imageUrl ||
                          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Category badge */}
                      {blog.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-gray-800 dark:text-white text-xs font-semibold rounded-full shadow-lg">
                            {blog.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="px-5 py-3 flex items-center justify-between border-b border-gray-50 dark:border-neutral-700/50">
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </motion.button>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="px-5 py-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                        {blog.content}
                      </p>
                      
                      {/* Tags */}
                      {blog.category && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">#{blog.category}</span>
                        </div>
                      )}
                      
                      {profileUserId && profileUserId !== currentUserId && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-700">
                          <FollowButton
                            currentUserId={currentUserId}
                            profileUserId={profileUserId}
                          />
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Find Friends Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <h2 className="text-xl font-bold mb-2">
                Connect with Friends
              </h2>
              <p className="text-white/80 mb-4 text-sm">
                Discover and connect with people who share your interests!
              </p>
              <button
                onClick={() => router.push("/FindFriends")}
                className="px-5 py-2.5 bg-white text-purple-600 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg"
              >
                Find Friends
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 py-6 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            © 2026 SocialDev. All rights reserved.
          </p>
        </div>
      </div>

      {/* Modals */}
      <UploadStoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {isSliderOpen && selectedStoryUSerId && (
        <StorySlider
          userId={selectedStoryUSerId}
          onClose={() => {
            setIsSliderOpen(false);
            setSelectedStoryUserId(null);
          }}
        />
      )}
    </SidebarDemo>
  );
}

