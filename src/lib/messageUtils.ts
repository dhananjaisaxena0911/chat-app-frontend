/**
 * Format a date into a relative time string (e.g., "2m ago", "Yesterday", "Mon")
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Less than 1 minute
  if (diffSeconds < 60) {
    return "now";
  }

  // Less than 1 hour
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Yesterday
  if (diffDays === 1) {
    return "Yesterday";
  }

  // Less than 7 days
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  // Less than 1 year
  if (diffDays < 365) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  // More than 1 year
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Format time for message timestamps (e.g., "10:30 AM")
 */
export function formatMessageTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Get single checkmark SVG string
 */
export function getSingleCheckIcon(colorClass: string = "text-gray-300"): string {
  return `<svg class="w-4 h-4 ${colorClass}" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>`;
}

/**
 * Get double checkmark SVG string for seen/delivered status
 */
export function getDoubleCheckIcon(colorClass: string = "text-blue-400"): string {
  return `<svg class="w-4 h-4 ${colorClass}" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    <path d="M18.5 7.5l1.5 1.5l-3 3l-1.5-1.5l3-3z" />
    <path d="M15 5.5l3 3l-1.5 1.5l-3-3z" />
  </svg>`;
}

/**
 * Get status icon HTML string based on message status
 */
export function getStatusIcon(status?: string, isOwnMessage: boolean = true): string {
  if (!isOwnMessage) return "";
  
  if (status === "seen") {
    return getDoubleCheckIcon("text-blue-400");
  }
  
  if (status === "delivered") {
    return getDoubleCheckIcon("text-gray-400");
  }
  
  // sent or default
  return getSingleCheckIcon("text-gray-300");
}

/**
 * Get status text for group messages
 */
export function getStatusText(status?: string): string {
  switch (status) {
    case "seen":
      return "Seen";
    case "delivered":
      return "Delivered";
    default:
      return "Sent";
  }
}

/**
 * Online status indicator SVG
 */
export function getOnlineIndicator(isOnline: boolean = true): string {
  const colorClass = isOnline ? "bg-green-500" : "bg-gray-500";
  return `<span class="absolute bottom-0 right-0 w-3 h-3 rounded-full ${colorClass} border-2 border-white dark:border-neutral-800"></span>`;
}

/**
 * Typing indicator HTML string
 */
export function getTypingIndicator(): string {
  return `<div class="flex items-center gap-2">
    <div class="bg-[#2a2a2a] rounded-2xl rounded-bl-none px-4 py-3">
      <div class="flex gap-1">
        <motion.div class="w-2 h-2 rounded-full bg-gray-400" animate="{{ y: [0, -6, 0] }}" transition="{{ duration: 0.6, repeat: Infinity, delay: 0 }}" />
        <motion.div class="w-2 h-2 rounded-full bg-gray-400" animate="{{ y: [0, -6, 0] }}" transition="{{ duration: 0.6, repeat: Infinity, delay: 0.15 }}" />
        <motion.div class="w-2 h-2 rounded-full bg-gray-400" animate="{{ y: [0, -6, 0] }}" transition="{{ duration: 0.6, repeat: Infinity, delay: 0.3 }}" />
      </div>
    </div>
  </div>`;
}

