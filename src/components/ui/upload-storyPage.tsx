"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FileUploadDemo } from "../FileUploadDemo";
import { IconArrowLeft } from "@tabler/icons-react";
interface UploadStoryPageProps {
  onClose: () => void;
}

export function UploadStoryPage({ onClose }: UploadStoryPageProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const currentUserId = localStorage.getItem("currentUserId");
    console.log("Current User ID:", currentUserId);
    setUserId(currentUserId);
  }, []);
  const handleFileUpload = async (file: File) => {
    if (!file || !userId) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("stories")
      .upload(filePath, file);

    if (error) {
      console.error("Error upload file:", error.message);
      setSuccessMsg("Upload Failed");
    } else {
      const { data } = supabase.storage.from("stories").getPublicUrl(filePath);
      const imageUrl = data.publicUrl;

      const response = await fetch("http://localhost:3001/story/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          imageUrl,
        }),
      });
      if(!response.ok){
        const {message}=await response.json();

        console.error("Error saving story to db",message);
        setSuccessMsg("Failed to save story to db");
      }
      else{
        console.log("story uploaded successfully");
        setPreview(imageUrl);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justfify-center text-white bg-black gap-6 px-4 py-8">
      <div
        onClick={onClose}
        className="cursor-pointer flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <IconArrowLeft />
        <span>Back</span>
      </div>

      <h1 className="text-3xl font-bold">Upload Your Story</h1>

      <FileUploadDemo onChange={handleFileUpload} />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full max-w-md h-64 object-cover rounded"
        />
      )}
      {loading && <p>Uploading...</p>}
      {successMsg && <p className="text-green-500">{successMsg}</p>}
    </div>
  );
}
