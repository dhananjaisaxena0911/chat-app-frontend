"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const filteredConversations = conversations.filter((conv) => {
    if (filter === "all") return true;
    if (filter === "messages") return conv.type === "dm";
    if (filter === "groups") return conv.type === "group";
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
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-4">
        <svg
          className="w-16 h-16 mb-4 opacity-50"
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
        <p className="text-center">
          {filter === "messages"
            ? "No messages yet"
            : filter === "groups"
            ? "No groups yet"
            : "No conversations"}
        </p>
        <p className="text-sm text-gray-400 mt-2 text-center">
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
      {filteredConversations.map((conv, index) => (
        <motion.div
          key={conv.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(conv)}
          className={`
            flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
            ${
              activeId === conv.id
                ? "bg-purple-100 dark:bg-purple-900/30"
                : "hover:bg-gray-50 dark:hover:bg-neutral-800"
            }
          `}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {conv.type === "dm" ? (
              <>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {conv.avatar ? (
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {conv.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                {conv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-neutral-800" />
                )}
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-blue-500 dark:text-blue-400"
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
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                  {conv.memberCount || 0}
                </span>
              </>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p
                className={`font-semibold truncate ${
                  activeId === conv.id
                    ? "text-purple-700 dark:text-purple-300"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {conv.name}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Status icon for last message (DM only) */}
                {conv.type === "dm" && conv.lastMessageStatus && getStatusIcon(conv.lastMessageStatus)}
                
                {/* Time */}
                {(conv.lastMessageTime || conv.updatedAt) && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTime(conv.lastMessageTime || conv.updatedAt)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <p className={`text-sm truncate flex-1 ${
                conv.unreadCount && conv.unreadCount > 0
                  ? "text-gray-900 dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}>
                {conv.type === "group" && "👤 "}
                {conv.lastMessage || (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    Start chatting
                  </span>
                )}
              </p>
              
              {/* Unread count badge */}
              {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">
                  {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Skeleton loader for conversation list
export function ConversationListSkeleton() {
  return (
    <div className="space-y-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-2/3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

