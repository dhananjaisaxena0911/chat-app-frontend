"use client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { FollowButton } from "@/components/ui/followButton";
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

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("currentUserId");
    if (user) {
      setCurrentUserId(user);
    }
  }, []);

  useEffect(() => {
    api.get<Blog[]>("/blogs")
      .then((data) => {
        setBlogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Blogs</h1>
          <Link
            href="/blog/create"
            className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Create
          </Link>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-xl mx-auto py-4 space-y-4 px-4">
        {blogs.map((blog) => {
          const profileUserId = blog.author?.id;
          const authorInitial = blog.author?.email?.charAt(0).toUpperCase() || "?";

          return (
            <article
              key={blog.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Header - Author info */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                    {authorInitial}
                  </div>
                  <div>
                    <Link
                      href={`/profile/${blog.author?.id}`}
                      className="text-sm font-semibold hover:opacity-70 transition-opacity"
                    >
                      {blog.author?.email?.split("@")[0] || "Anonymous"}
                    </Link>
                    {blog.category && (
                      <p className="text-xs text-gray-500">{blog.category}</p>
                    )}
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
              </div>

              {/* Image */}
              <div className="relative aspect-[4/3] w-full bg-gray-100">
                <img
                  src={
                    blog.imageUrl ||
                    "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action buttons */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="hover:opacity-70 transition-opacity">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <button className="hover:opacity-70 transition-opacity">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </button>
                  <button className="hover:opacity-70 transition-opacity">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
                <button className="hover:opacity-70 transition-opacity">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="px-4 pb-4">
                <div className="font-semibold text-sm mb-2">
                  {Math.floor(Math.random() * 1000) + 1} likes
                </div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <Link
                      href={`/profile/${blog.author?.id}`}
                      className="font-semibold mr-2 hover:opacity-70 transition-opacity"
                    >
                      {blog.author?.email?.split("@")[0] || "Anonymous"}
                    </Link>
                    <span className="text-gray-800">{blog.title}</span>
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {blog.content}
                  </p>
                </div>
                {blog.createdAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {profileUserId && profileUserId !== currentUserId && (
                  <div className="mt-3">
                    <FollowButton
                      currentUserId={currentUserId}
                      profileUserId={profileUserId}
                    />
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

