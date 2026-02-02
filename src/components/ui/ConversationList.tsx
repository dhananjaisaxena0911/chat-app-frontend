"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRelativeTime } from "@/lib/messageUtils";

interface Conversation {
  id: string;
  type: "dm" | "group";
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  updatedAt?: string;
  unreadCount?: number;
  participants?: any[];
  memberCount?: number;
  isOnline?: boolean;
  lastMessageStatus?: "sent" | "delivered" | "seen";
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conversation: Conversation) => void;
  filter: "all" | "messages" | "groups";
}

// Single checkmark icon (simple)
function SingleCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Double checkmark icon (WhatsApp style - two separate checkmarks)
function DoubleCheckIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-end ${className || "w-4 h-4"}`}>
      <svg className="w-3.5 h-3.5 -mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  filter,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredConversations = conversations.filter((conv) => {
    // First apply filter type
    if (filter === "messages" && conv.type !== "dm") return false;
    if (filter === "groups" && conv.type !== "group") return false;
    
    // Then apply search
    if (searchQuery) {
      return conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  // Helper to format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    try {
      return formatRelativeTime(timeString);
    } catch {
      return timeString;
    }
  };

  // Get status icon for last message
  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    
    if (status === "seen") {
      return <DoubleCheckIcon className="w-5 h-4 text-blue-400" />;
    }
    if (status === "delivered") {
      return <DoubleCheckIcon className="w-5 h-4 text-gray-400" />;
    }
    // sent
    return <SingleCheckIcon className="w-4 h-4 text-gray-300" />;
  };

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative mb-4"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.div>
        </motion.div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">
          {filter === "messages"
            ? "No messages yet"
            : filter === "groups"
            ? "No groups yet"
            : "No conversations"}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          {filter === "messages"
            ? "Start a conversation with someone!"
            : filter === "groups"
            ? "Create or join a group to get started!"
            : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <AnimatePresence mode="popLayout">
        {filteredConversations.map((conv, index) => (
          <motion.div
            key={conv.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            onClick={() => onSelect(conv)}
            className={`
              group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300
              ${
                activeId === conv.id
                  ? "bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/40 dark:to-pink-900/40 shadow-lg shadow-purple-500/10"
                  : "hover:bg-gray-50/80 dark:hover:bg-neutral-800/80 hover:shadow-md"
              }
            `}
          >
            {/* Active indicator */}
            {activeId === conv.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full bg-gradient-to-b from-purple-500 to-pink-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {conv.type === "dm" ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-[2px] shadow-lg shadow-purple-500/25">
                    <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
                      {conv.avatar ? (
                        <img
                          src={conv.avatar}
                          alt={conv.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-600">
                          {conv.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  {conv.isOnline && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-neutral-900 shadow-md"
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-blue-500/25">
                    <div className="w-full h-full rounded-[18px] bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-600/10 flex items-center justify-center relative">
                        <svg
                          className="w-8 h-8 text-blue-500 dark:text-blue-400"
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
                    </div>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[10px] font-bold rounded-full shadow-md"
                  >
                    {conv.memberCount || 0}
                  </motion.span>
                </>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <motion.p
                  className={`font-bold truncate text-sm ${
                    activeId === conv.id
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {conv.name}
                </motion.p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Status icon for last message (DM only) */}
                  {conv.type === "dm" && conv.lastMessageStatus && getStatusIcon(conv.lastMessageStatus)}
                  
                  {/* Time */}
                  {(conv.lastMessageTime || conv.updatedAt) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-400 dark:text-gray-500 font-medium"
                    >
                      {formatTime(conv.lastMessageTime || conv.updatedAt)}
                    </motion.span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <motion.p
                  className={`text-sm truncate flex-1 ${
                    conv.unreadCount && conv.unreadCount > 0
                      ? "text-gray-900 dark:text-white font-semibold"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {conv.type === "group" && (
                    <span className="inline-flex items-center justify-center w-4 h-4 mr-1 text-xs">👥</span>
                  )}
                  {conv.lastMessage || (
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      Start chatting
                    </span>
                  )}
                </motion.p>
                
                {/* Unread count badge */}
                {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-5.5 h-5.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-purple-500/30"
                  >
                    {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 transition-all duration-300 group-hover:from-purple-500/5 group-hover:to-pink-500/5 pointer-events-none" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Skeleton loader for conversation list
export function ConversationListSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-3"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-600 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="w-1/3 h-4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
            <div className="w-2/3 h-3 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

