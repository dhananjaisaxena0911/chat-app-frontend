"use client";
import { useState } from "react";
import axios from "axios";
import api from "../../../utils/api";
console.log("📦 UploadStoryPage component loaded");

export default function StoryUpload() {
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpload = async () => {
    if (!imageUrl) return;

    setLoading(true);
    try {
      await api.post("/story/upload", { imageUrl });
      setSuccessMsg("Story upload successfully!");
      setImageUrl("");
      setPreview("");
    } catch (error: any) {
      console.error("Upload failed:", error?.response?.data || error.message);
    }
    finally{
        setLoading(false);
    }
  };
  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Story</h2>

      <input
        type="text"
        placeholder="Paste image URL here"
        value={imageUrl}
        onChange={(e) => {
          setImageUrl(e.target.value);
          setPreview(e.target.value);
        }}
        className="w-full border p-2 mb-4 rounded"
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-64 object-cover mb-4 rounded"
        />
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !imageUrl}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Uploading..." : "Upload Story"}
      </button>

      {successMsg && (
        <p className="mt-2 text-green-600 font-medium">{successMsg}</p>
      )}
    </div>
  );
}
