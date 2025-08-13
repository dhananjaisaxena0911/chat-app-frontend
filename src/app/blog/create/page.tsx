"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { delay, motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
export default function createBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const currentUserId = localStorage.getItem("currentUserId");
    const token = localStorage.getItem("token"); // ⬅️ grab token

    if (!currentUserId || !token) {
      alert("Please log in first.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/blogs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include JWT token here
        },
        body: JSON.stringify({
          authorId: currentUserId,
          dto: {
            title,
            content,
            imageUrl,
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create blog: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      console.log(data);
      router.push("/blog");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
        className="mb-6 bg-gradient-to-br from-slate-300 
        to-slate-500 py-4 bg-clip-text text-center text-4xl 
        font-medium tracking-tight text-transparent md:text-6xl"
      >
        Create a New Blog
      </motion.h1>
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6 w-full  max-w-xl p-6 bg-slate-800 rounded-lg shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-white font-medium mb-1">Title</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            className="w-full border border-gray-700 bg-slate-800 text-white rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-white font-medium mb-1">Content</label>
          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            className="w-full border border-gray-700 bg-slate-800 
            text-white rounded px-3 py-2 h-32"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.input
            whileFocus={{ scale: 1.02 }}
            className="w-full border border-gray-700 bg-slate-800
                text-white rounded px-3 py-2 h-32"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </motion.div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          type="submit"
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Blog"}
        </motion.button>
      </motion.form>
    </LampContainer>
  );
}
