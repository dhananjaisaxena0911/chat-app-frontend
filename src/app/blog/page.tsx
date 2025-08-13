"use client";
import { use, useEffect, useState } from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { FollowButton } from "@/components/ui/followButton";

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
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId,setCurrentUserId]=useState("");

  useEffect(()=>{
    const user= localStorage.getItem("currentUserId");
    if(user){
      setCurrentUserId(user);
    }
  },[])
  useEffect(() => {
    fetch("http://localhost:3001/blogs")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log(blogs);
  });

  if (loading) {
    return (
      <div className="p-10">
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const blogsCard = blogs.map((blog, index) => {
  console.log("Author ID:", blog.author?.id); 
    const profileUserId=blog.author?.id;
  return (
    <Card
      key={blog.id}
      index={index}
      layout
      card={{
        src:
          blog.imageUrl ??
          "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80",
        title: blog.title,
        category: blog.category ?? "General",
        content: (
          <div>
            <p className="mb-2 text-gray-600">
              by{" "}
              {blog.author?.email ? (
                <span>
                <Link
                  href={`/profile/${blog.author.id}`}
                  className="text-blue-600 hover:underline mr-2"
                >
                  {blog.author.email}
                </Link>
                {profileUserId && (
                  <FollowButton
                  currentUserId={currentUserId}
                  profileUserId={profileUserId}
                  />
                )}
                </span>
              ) : (
                "Anonymous"
              )}
              
            </p>
            <p className="text-lg">{blog.content}</p>
          </div>
        ),
      }}
    />
  );
});

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Latest Blogs</h1>
      <a
        href="/blog/create"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        + Create Blog
      </a>
      <Carousel items={blogsCard} />
    </div>
  );
}
