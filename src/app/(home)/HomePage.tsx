"use client";
import { useState } from "react";
import { Carousel } from "../../../components/ui/carousel";
import ProtectedRoute from "../ProtectedRoute";

const Features = [
  {
    title: "Connect with friend",
    button: "Join Now",
    src: "https://images.unsplash.com/photo-1494806812796-244fe51b774d?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Build meaningful conversations",
    button: "Explore Chats",
    src: "https://images.unsplash.com/photo-1494806812796-244fe51b774d?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Discover communities",
    button: "Browse Groups",
    src: "https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Chat securely and freely",
    button: "Get Started",
    src: "https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
        <div className="relative overflow-hidden w-full h-full py-20">
          <Carousel slides={Features} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
