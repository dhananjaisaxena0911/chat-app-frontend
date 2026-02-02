"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MessageTabsProps {
  activeTab: "messages" | "groups";
  onTabChange: (tab: "messages" | "groups") => void;
}

export function MessageTabs({ activeTab, onTabChange }: MessageTabsProps) {
  return (
    <div className="flex items-center justify-center p-1">
      <div className="relative bg-gray-100/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-full p-1.5 shadow-inner">
        <motion.div
          className="absolute bg-white dark:bg-neutral-700 rounded-full shadow-md"
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: "calc(50% - 6px)",
            height: "calc(100% - 12px)",
            top: 6,
            left: activeTab === "messages" ? 6 : "calc(50% + 2px)",
          }}
        />
        <div className="relative flex relative z-10">
          <button
            onClick={() => onTabChange("messages")}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
              activeTab === "messages"
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <span className="relative">
              Messages
              {activeTab === "messages" && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </span>
          </button>
          <button
            onClick={() => onTabChange("groups")}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
              activeTab === "groups"
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <span className="relative">
              Groups
              {activeTab === "groups" && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

