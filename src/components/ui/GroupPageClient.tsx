// src/components/ui/GroupPageClient.tsx
'use client';
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import GroupChat from "./GroupChat";
type DecodedToken={
    sub:string;
    
}
export default function GroupPageClient({ groupId }: { groupId: string }) {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
     try {
        const decoded:DecodedToken=jwtDecode(token);
        console.log(decoded);
        setUserId(decoded.sub);
     } catch (error) {
        console.error("Invalid Token",error);
     }
    }
  }, []);

  if (!userId) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Group Chat: {groupId}</h2>
      <GroupChat groupId={groupId} currentUserId={userId} />
    </div>
  );
}
