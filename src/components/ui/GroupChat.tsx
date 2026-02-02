"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import socket from "../../../utils/socket";
import { jwtDecode } from "jwt-decode";
import { SocketListener } from "../../../utils/socketListener";
import MessageItem from "./MessageItem";
import { motion, AnimatePresence } from "framer-motion";
import { formatMessageTime } from "@/lib/messageUtils";
import api from "../../../utils/api";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  groupId: string;
  content: string;
  createdAt: string;
  status?: string;
  reaction?: { userId: string; emoji: string }[];
}

interface Props {
  groupId: string;
  currentUserId: string;
}

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  socket: Socket;
}

type DecodedToken = {
  sub: string;
  userId: string;
  username: string;
};

function getStatusText(status?: string): string {
  switch (status) {
    case "seen": return "Seen";
    case "delivered": return "Delivered";
    default: return "Sent";
  }
}

function isOwnMessageCheck(senderId: string | undefined, myUserId: string): boolean {
  if (!myUserId || !senderId) {
    console.log("isOwnMessageCheck: returning false - myUserId:", myUserId, "senderId:", senderId);
    return false;
  }
  const result = String(senderId).trim() === String(myUserId).trim();
  console.log("isOwnMessageCheck:", senderId, "vs", myUserId, "=", result);
  return result;
}

export default function GroupChat({ groupId, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize myUserId synchronously from localStorage to avoid render issues
  // Use currentUserId prop if available, otherwise fall back to localStorage
  const [myUserId, setMyUserId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      // First try the prop if it's already available (during SSR or re-renders)
      if (currentUserId) {
        return currentUserId;
      }
      // Then try localStorage
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          return decoded.sub || decoded.userId || "";
        } catch (err) {
          console.error("Invalid token:", err);
        }
      }
      // Also check currentUserId in localStorage (used by other components)
      const storedUserId = localStorage.getItem("currentUserId");
      if (storedUserId) {
        return storedUserId;
      }
    }
    return "";
  });

  useEffect(() => {
    // Set loading to false after we have a valid myUserId
    if (myUserId) {
      setIsLoading(false);
    }
  }, [myUserId]);

  // Initialize username synchronously from localStorage
  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          return decoded.username || "User";
        } catch (err) {
          console.error("Invalid token:", err);
        }
      }
    }
    return "";
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const extractedId = decoded.sub || decoded.userId || "";
        setMyUserId(extractedId);
        setUsername(decoded.username || "User");
        console.log("GroupChat - Token decoded, myUserId:", extractedId);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUserId && currentUserId !== myUserId) {
      setMyUserId(currentUserId);
    }
  }, [currentUserId, myUserId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.get<Message[]>(`/group/${groupId}/messages`);
        console.log("Fetched messages:", data?.length || 0);
        
        if (Array.isArray(data)) {
          const sortedMessages = data.sort((a: Message, b: Message) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sortedMessages);
          
          sortedMessages.forEach((msg, idx) => {
            const isOwnMsg = isOwnMessageCheck(msg.senderId, myUserId);
            console.log(`  [${idx}] senderId="${msg.senderId}", myUserId="${myUserId}", isOwn="${isOwnMsg}"`);
          });
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Failed to fetch group messages", error);
        setMessages([]);
      }
    };

    if (groupId) {
      fetchMessages();
    }
  }, [groupId, myUserId]);

  useEffect(() => {
    const handleStatusUpdate = ({ messageId, status }: { messageId: string; status: string }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
      );
    };
    socket.on("GroupId-message-status-update", handleStatusUpdate);
    return () => { socket.off("GroupId-message-status-update", handleStatusUpdate); };
  }, []);

  useEffect(() => {
    const handleReaction = ({ messageId, userId, emoji }: { messageId: string; userId: string; emoji: string }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? { ...msg, reaction: [...(msg.reaction || []).filter((r) => r.userId !== userId), { userId, emoji }] }
            : msg
        )
      );
    };
    socket.on("messageReacted", handleReaction);
    return () => { socket.off("messageReacted", handleReaction); };
  }, []);

  useEffect(() => {
    if (messages.length === 0 || !myUserId) return;
    messages.forEach((msg) => {
      if (!isOwnMessageCheck(msg.senderId, myUserId) && msg.status !== "seen") {
        socket.emit("Group-message-seen", { messageId: msg.id, groupId, userId: myUserId });
      }
    });
  }, [messages, myUserId, groupId]);

  useEffect(() => {
    const handleShowTyping = ({ userId, username: typingUsername, groupId: incomingGroupId }: { userId: string; username: string; groupId: string }) => {
      if (incomingGroupId !== groupId || isOwnMessageCheck(userId, myUserId)) return;
      setTypingUsers((prev) => new Set(prev).add(typingUsername));
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(typingUsername);
          return updated;
        });
      }, 3000);
    };
    socket.on("show-typing", handleShowTyping);
    return () => { socket.off("show-typing", handleShowTyping); };
  }, [groupId, myUserId]);

  useEffect(() => {
    if (!groupId || !myUserId) return;
    socket.emit("joinGroup", groupId);
    
    const handleNewGroupMessage = (message: Message) => {
      const isOwnMsg = isOwnMessageCheck(message.senderId, myUserId);
      console.log("New message from:", message.senderId, "My ID:", myUserId, "Is mine?", isOwnMsg);
      socket.emit("Group-message-recieved", { messageId: message.id, groupId: message.groupId, userId: myUserId });
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        const updated = [...prev, message];
        return updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
    };
    socket.on("newGroupMessage", handleNewGroupMessage);
    return () => { socket.off("newGroupMessage", handleNewGroupMessage); };
  }, [groupId, myUserId]);

  const handleTyping = useCallback(() => {
    if (!groupId || !myUserId) return;
    socket.emit("user-typing", { groupId, userId: myUserId, username, type: "group" });
  }, [groupId, myUserId, username]);

  const handleSend = () => {
    if (!newMessage.trim() || !groupId || !myUserId) return;
    const content = newMessage.trim();
    console.log("Sending message, myUserId:", myUserId);
    socket.emit("sendGroupMessage", { senderId: myUserId, senderName: username, groupId, content });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen w-[99.99%] bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
      {/* Show loading or user ID banner */}
      {!myUserId ? (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-xs text-yellow-800 dark:text-yellow-200">
          Loading user info...
        </div>
      ) : (
        <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs text-purple-800 dark:text-purple-200">
          My User ID: {myUserId}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isOwn = isOwnMessageCheck(msg.senderId, myUserId);
            const showAvatar = !isOwn && (idx === 0 || messages[idx - 1]?.senderId !== msg.senderId);
            
            // Debug: Log first few messages' sender IDs
            if (idx < 3) {
              console.log(`Message[${idx}] senderId="${msg.senderId}", myUserId="${myUserId}", isOwn=${isOwn}`);
            }
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`max-w-[75%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm ${
                  isOwn
                    ? "ml-auto bg-purple-600 text-white rounded-br-none"
                    : "mr-auto bg-gray-200 dark:bg-neutral-700 text-black dark:text-white rounded-bl-none"
                }`}
              >
                {!isOwn && showAvatar && (
                  <p className="text-xs font-semibold text-purple-400 mb-1">{msg.senderName}</p>
                )}
                <span className="break-words whitespace-pre-wrap">{msg.content}</span>
                
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className={`text-[10px] ${isOwn ? "text-gray-300" : "text-gray-400"}`}>
                    {formatMessageTime(msg.createdAt)}
                  </span>
                  {isOwn && msg.status && (
                    <span className={`text-[10px] ${
                      msg.status === "seen" ? "text-blue-300 font-medium" 
                      : msg.status === "delivered" ? "text-gray-300" : "text-gray-400"}`}>
                      {getStatusText(msg.status)}
                    </span>
                  )}
                </div>
                
                <div className="mt-1">
                  <MessageItem message={msg} currentUserId={myUserId} socket={socket} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {typingUsers.size > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
            <div className="bg-gray-200 dark:bg-neutral-700 rounded-full px-3 py-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 italic">
              {[...typingUsers].join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
            </span>
          </motion.div>
        )}
        
        <div ref={messageEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input type="file" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) console.log("Selected file:", file); }} />
            <div className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
          </label>

          <input value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type your message..."
            className="flex-1 rounded-full px-4 py-2 border border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-neutral-900 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />

          <button onClick={handleSend} disabled={!newMessage.trim() || !myUserId}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-semibold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
      <SocketListener currentUserId={myUserId} />
    </div>
  );
}
