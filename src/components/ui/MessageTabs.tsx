"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MessageTabsProps {
  activeTab: "messages" | "groups";
  onTabChange: (tab: "messages" | "groups") => void;
}

export function MessageTabs({ activeTab, onTabChange }: MessageTabsProps) {
  return (
    <div className="flex items-center justify-center p-2">
      <div className="relative bg-gray-100 dark:bg-neutral-800 rounded-full p-1">
        <motion.div
          className="absolute bg-white dark:bg-neutral-700 rounded-full shadow-sm"
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: "50%",
            height: "calc(100% - 8px)",
            top: 4,
            left: activeTab === "messages" ? 4 : "calc(50% - 2px)",
          }}
        />
        <div className="relative flex relative z-10">
          <button
            onClick={() => onTabChange("messages")}
            className={cn(
              "px-8 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200",
              activeTab === "messages"
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            Messages
          </button>
          <button
            onClick={() => onTabChange("groups")}
            className={cn(
              "px-8 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200",
              activeTab === "groups"
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            Groups
          </button>
        </div>
      </div>
    </div>
  );
}

