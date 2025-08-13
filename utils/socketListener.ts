// SocketListener.tsx
import socket from "./socket"; // instead of creating new one
import toast from "react-hot-toast";
import { useEffect } from "react";

export function SocketListener({ currentUserId }: { currentUserId: string }) {
  useEffect(() => {
  if (!currentUserId) return;

  socket.emit("joinConversation", currentUserId);
  
  socket.off("new_notification"); // <-- prevent duplicate listeners
  socket.on("new_notification", (data) => {
    console.log("New notification received:", data);
    toast(`${data.from} sent you a message: ${data.message}`);
  });

  return () => {
    socket.off("new_notification");
  };
}, [currentUserId]);


  return null;
}
