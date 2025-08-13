"use client";

import { Socket } from "socket.io-client";
import { useState } from "react";

// Define the shape of a reaction
type Reaction = {
  userId: string;
  emoji: string;
};

// Define the shape of a message
type Message = {
  id: string;
  content: string;
  reaction?: Reaction[];
};

// Props for the component
type Props = {
  message: Message;
  currentUserId: string;
  socket: Socket;
};

// ONLY render reaction UI & picker — NOT the message content
export default function MessageItem({ message, currentUserId, socket }: Props) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    socket.emit("reactMessage", {
      messageId: message.id,
      userId: currentUserId,
      emoji,
    });
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      {/* Reactions display */}
      {message.reaction && message.reaction.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {message.reaction.map((reaction, index) => (
            <span
              key={index}
              className="text-sm bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 px-2 py-0.5 rounded-full"
            >
              {reaction.emoji}
            </span>
          ))}
        </div>
      )}

      {!message.reaction || message.reaction.length === 0 ? (
  <div className="text-xs text-gray-400">No reactions yet</div>
) : (
  <div className="flex flex-wrap gap-1">
    {message.reaction.map((reaction, index) => (
      <span
        key={index}
        className="text-sm bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 px-2 py-0.5 rounded-full"
      >
        {reaction.emoji}
      </span>
    ))}
  </div>
)}


      {/* Emoji picker toggle */}
      <button
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-300"
      >
        🙂 React
      </button>

      {/* Emoji picker itself */}
      {showEmojiPicker && (
        <div className="absolute z-10 mt-1 left-0 flex space-x-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 rounded shadow p-2">
          {["👍", "❤️", "😂", "😮", "😢", "🎉"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
