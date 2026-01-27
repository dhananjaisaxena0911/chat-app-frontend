// src/components/ui/GroupPageClient.tsx
'use client';
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import GroupChat from "./GroupChat";

type DecodedToken = {
  sub: string;
  userId: string;
  username: string;
};

export default function GroupPageClient({ groupId }: { groupId: string }) {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
     try {
        const decoded: DecodedToken = jwtDecode(token);
        console.log("Decoded token:", decoded);
        
        // Try both sub and userId
        const extractedUserId = decoded.sub || decoded.userId || "";
        console.log("Extracted userId:", extractedUserId);
        
        setUserId(extractedUserId);
        setUsername(decoded.username || "User");
     } catch (error) {
        console.error("Invalid Token", error);
     }
    }
  }, []);

  if (!userId) return <p className="text-white p-4">Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white">Group Chat</h2>
      <GroupChat groupId={groupId} currentUserId={userId} />
    </div>
  );
}

