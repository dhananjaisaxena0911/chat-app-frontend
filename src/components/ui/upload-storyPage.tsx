"use client";

import React, { useEffect, useState } from "react";
import { FileUploadDemo } from "../FileUploadDemo";
import { IconArrowLeft } from "@tabler/icons-react";
import api from "../../../utils/api";
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
    if (!file || !userId) {
      console.error("Missing file or userId");
      setSuccessMsg("Upload Failed: Missing data");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      console.log("Uploading story to backend...");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const data = await api.uploadFormData<any>("/story/upload", formData);
      console.log("Story uploaded successfully:", data);
      setSuccessMsg("Story uploaded successfully!");
      setPreview(data.imageUrl || URL.createObjectURL(file));
    } catch (err) {
      console.error("Error uploading story:", err);
      setSuccessMsg("Upload Failed: Network error");
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
