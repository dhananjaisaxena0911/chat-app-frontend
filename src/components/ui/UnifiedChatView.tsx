"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Socket, io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { formatMessageTime } from "@/lib/messageUtils";
import api, { getBackendUrl } from "../../../utils/api";

interface Message {
  id: string;
  content: string;
  senderId?: string;
  senderName?: string;
  sender?: {
    id: string;
    username: string;
  };
  createdAt?: string;
  status?: string;
}

interface UnifiedChatViewProps {
  type: "dm" | "group";
  conversationId: string;
  currentUserId: string;
  otherParticipant?: {
    id: string;
    username: string;
    avatar?: string;
    isOnline?: boolean;
  };
  groupInfo?: {
    id: string;
    name: string;
    members?: any[];
  };
}

type DecodedToken = {
  sub: string;
  username: string;
};

// Status icon component (normal seen/delivered style)
function StatusIcon({ status }: { status?: string }) {
  if (status === "seen") {
    return (
      <div className="flex items-end">
        <svg className="w-3.5 h-3.5 text-blue-400 -mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (status === "delivered") {
    return (
      <div className="flex items-end">
        <svg className="w-3.5 h-3.5 text-gray-400 -mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  // sent or default - single check
  return (
    <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function UnifiedChatView({
  type,
  conversationId,
  currentUserId,
  otherParticipant,
  groupInfo,
}: UnifiedChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState("");
  const [isOtherOnline, setIsOtherOnline] = useState(otherParticipant?.isOnline || false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(getBackendUrl(), {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Get username from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUsername(decoded.username || "User");
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages based on type
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let url = "";
        if (type === "dm") {
          url = `/message/${conversationId}`;
        } else {
          url = `/group/${conversationId}/messages`;
        }

        const data = await api.get<any[]>(url);
        const messageList = Array.isArray(data) ? data : [];
        setMessages(messageList);

        // Mark messages as seen when opening conversation
        if (type === "dm" && messageList.length > 0 && socket) {
          messageList.forEach((msg: Message) => {
            if (msg.sender?.id !== currentUserId && msg.status !== "seen") {
              socket.emit("markMessageAsSeen", {
                messageId: msg.id,
                conversationId,
              });
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, type, socket, currentUserId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation/group
    if (type === "dm") {
      socket.emit("joinConversation", conversationId);
    } else {
      socket.emit("joinGroup", conversationId);
    }

    // Handle incoming messages
    const handleNewMessage = (message: Message) => {
      // Add message to state
      setMessages((prev) => [...prev, message]);
      
      // Immediately mark as seen if it's from someone else
      if (message.sender?.id !== currentUserId && message.senderId !== currentUserId) {
        if (type === "dm") {
          socket.emit("markMessageAsSeen", {
            messageId: message.id,
            conversationId,
          });
        } else {
          // For groups, emit Group-message-recieved to update delivery status
          socket.emit("Group-message-recieved", {
            messageId: message.id,
            groupId: conversationId,
            userId: currentUserId,
          });
        }
      }
    };

    // Handle typing indicators
    const handleShowTyping = ({
      userId,
      username: typingUsername,
    }: {
      userId: string;
      username: string;
    }) => {
      if (userId === currentUserId) return;
      setTypingUsers((prev) => new Set([...prev, typingUsername]));

      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(typingUsername);
          return updated;
        });
      }, 3000);
    };

    // Handle message status updates (for DM)
    const handleStatusUpdate = ({
      messageId,
      status,
    }: {
      messageId: string;
      status: string;
    }) => {
      console.log(`[DM] Status update: messageId=${messageId}, status=${status}`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status } : msg
        )
      );
    };

    // Handle group message status updates
    const handleGroupStatusUpdate = ({
      messageId,
      status,
    }: {
      messageId: string;
      status: string;
    }) => {
      console.log(`[Group] Status update: messageId=${messageId}, status=${status}`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status } : msg
        )
      );
    };

    // Handle online status updates
    const handleOnlineStatus = ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      if (type === "dm" && otherParticipant?.id === userId) {
        setIsOtherOnline(isOnline);
      }
    };

    // Register event listeners
    if (type === "dm") {
      socket.on("newMessage", handleNewMessage);
      socket.on("message-status-update", handleStatusUpdate);
      socket.on("user-online-status", handleOnlineStatus);
    } else {
      socket.on("newGroupMessage", handleNewMessage);
      socket.on("GroupId-message-status-update", handleGroupStatusUpdate);
    }
    socket.on("show-typing", handleShowTyping);

    return () => {
      if (type === "dm") {
        socket.off("newMessage", handleNewMessage);
        socket.off("message-status-update", handleStatusUpdate);
        socket.off("user-online-status", handleOnlineStatus);
      } else {
        socket.off("newGroupMessage", handleNewMessage);
        socket.off("GroupId-message-status-update", handleGroupStatusUpdate);
      }
      socket.off("show-typing", handleShowTyping);
    };
  }, [socket, conversationId, type, currentUserId, otherParticipant]);

  // Handle typing
  const handleTyping = useCallback(() => {
    if (!socket || !conversationId) return;

    socket.emit("user-typing", {
      conversationId: type === "dm" ? conversationId : undefined,
      groupId: type === "group" ? conversationId : undefined,
      userId: currentUserId,
      username,
      type,
    });
  }, [socket, conversationId, type, currentUserId, username]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !socket) return;

    const messageContent = newMessage.trim();

    if (type === "dm") {
      socket.emit("sendMessage", {
        senderId: currentUserId,
        recipientId: otherParticipant?.id,
        conversationId,
        content: messageContent,
      });
    } else {
      socket.emit("sendGroupMessage", {
        senderId: currentUserId,
        senderName: username,
        groupId: conversationId,
        content: messageContent,
      });
    }

    setNewMessage("");

    // Save to backend
    try {
      if (type === "dm") {
        await api.post("/message", {
          senderId: currentUserId,
          recipientId: otherParticipant?.id,
          content: messageContent,
        });
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 bg-[#121212] flex items-center gap-3">
        {type === "dm" && otherParticipant ? (
          <>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center overflow-hidden">
                  {otherParticipant.avatar ? (
                    <img
                      src={otherParticipant.avatar}
                      alt={otherParticipant.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {otherParticipant.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121212] ${
                  isOtherOnline ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {otherParticipant.username}
              </h2>
              <p className={`text-xs ${isOtherOnline ? "text-green-400" : "text-gray-400"}`}>
                {isOtherOnline ? "Active now" : "Offline"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {groupInfo?.name || "Group Chat"}
              </h2>
              <p className="text-xs text-gray-400">
                {groupInfo?.members?.length || 0} members
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            // Handle both DM format (sender.id) and group format (senderId)
            const isMe = (msg.sender?.id === currentUserId) || (msg.senderId === currentUserId);
            const senderName = msg.sender?.username || msg.senderName || "Unknown";
            
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2.5 max-w-[70%] text-sm shadow-lg ${
                    isMe
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-br-none"
                      : "bg-[#2a2a2a] text-gray-200 rounded-bl-none"
                  }`}
                >
                  {!isMe && type === "group" && (
                    <p className="text-xs font-medium text-purple-400 mb-1">
                      {senderName}
                    </p>
                  )}
                  <p className="break-words whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span
                      className="text-[10px] opacity-70 hover:opacity-100 cursor-help"
                      title={msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </span>
                    {isMe && (
                      msg.status ? (
                        <StatusIcon status={msg.status} />
                      ) : (
                        // Show single checkmark for sent messages without status
                        <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="bg-[#2a2a2a] rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {[...typingUsers].join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-[#121212]">
        <div className="flex items-end gap-3">
          {/* Attachment button */}
          <button className="p-3 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              onInput={(e) => {
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 150)}px`;
                handleTyping();
              }}
              placeholder="Message..."
              className="w-full resize-none rounded-2xl px-4 py-3 bg-[#1f1f1f] border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all max-h-[150px]"
              rows={1}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
export function UnifiedChatViewSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c]">
      <div className="px-6 py-4 border-b border-gray-800 bg-[#121212] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
        <div className="space-y-2">
          <div className="w-32 h-5 bg-gray-700 rounded animate-pulse" />
          <div className="w-20 h-3 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[60%] ${
                i % 2 === 0
                  ? "bg-gray-700"
                  : "bg-[#2a2a2a]"
              } animate-pulse`}
            >
              <div className="w-24 h-4 bg-gray-600 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-800 bg-[#121212]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
          <div className="flex-1 h-12 rounded-2xl bg-gray-700 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-purple-600 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

