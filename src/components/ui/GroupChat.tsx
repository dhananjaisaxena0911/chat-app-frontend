"use client";

import { useEffect, useRef, useState } from "react";
import socket from "../../../utils/socket";
import { jwtDecode } from "jwt-decode";
import { SocketListener } from "../../../utils/socketListener";
import MessageItem from "./MessageItem";
import { motion, AnimatePresence } from "framer-motion";
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
type DecodedToken = {
  username: string;
};
export default function GroupChat({ groupId, currentUserId }: Props) {
  const [messages, setMessage] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRed = useRef<HTMLDivElement | null>(null);
  const [username, setUsername] = useState("");
  const [TypingUser, setTypingUser] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (messageEndRed.current) {
      messageEndRed.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => {
    const handleStatusUpadte = ({
      messageId,
      status,
    }: {
      messageId: string;
      status: string;
    }) => {
      setMessage((prevMessage) =>
        prevMessage.map((msg) =>
          msg.id === messageId ? { ...msg, status } : msg
        )
      );
    };
    socket.on("GroupId-message-status-update", handleStatusUpadte);
    return () => {
      socket.off("GroupId-message-status-update", handleStatusUpadte);
    };
  }, []);
  useEffect(() => {
    const handleReaction = ({
      messageId,
      userId,
      emoji,
    }: {
      messageId: string;
      userId: string;
      emoji: string;
    }) => {
      setMessage((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? {
              ...msg,
              reaction: [
                ...(msg.reaction || []).filter((r) => r.userId !== userId),
                { userId, emoji },
              ],
            }
            : msg
        )
      );
    };
    socket.on("messageReacted", handleReaction);
    return () => {
      socket.off("messageReacted", handleReaction);
    };
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token"); // or from cookies
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUsername(decoded.username);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  useEffect(() => {
    //fetch older messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/group/${groupId}/messages`
        );
        const data = await res.json();
        console.log("Fetched messages:", data); // check this
        if (Array.isArray(data)) {
          setMessage(data);
        } else {
          console.error("Expected array but got:", data);
          setMessage([]); // fallback
        }
      } catch (error) {
        console.error("Failed to fetch group messages", error);
      }
    };

    fetchMessages();
  }, [groupId]);
  useEffect(() => {
    if (messages.length === 0) return;

    messages.forEach((msg) => {
      if (msg.senderId !== currentUserId && msg.status !== "seen") {
        socket.emit("Group-message-seen", {
          messageId: msg.id,
          groupId: groupId,
          userId: currentUserId,
        });
      }
    });
  }, [messages, currentUserId, groupId]);

  useEffect(() => {
    const handleShowTyping = ({
      userId,
      username,
      groupId: incomingGroupId,
    }: {
      userId: string;
      username: string;
      groupId: string;
    }) => {
      if (incomingGroupId !== groupId || userId === currentUserId) return;

      setTypingUser((prev) => new Set([...prev, username]));

      setTimeout(() => {
        setTypingUser((prev) => {
          const updated = new Set(prev);
          updated.delete(username);
          return updated;
        });
      }, 3000);
    };

    socket.on("show-typing", handleShowTyping);
    return () => {
      socket.off("show-typing", handleShowTyping);
    };
  }, [groupId, currentUserId]);

  const groupIdRef = useRef(groupId);
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => {
    groupIdRef.current = groupId;
    currentUserIdRef.current = currentUserId;
  }, [groupId, currentUserId]);
  useEffect(() => {
    socket.emit("joinGroup", groupId);
    const handleNewGroupMessage = (message: Message) => {
      socket.emit("Group-message-recieved", {
        messageId: message.id,
        groupId: message.groupId,
        userId: currentUserId,
      });
      setMessage((prev) => [...prev, message]);
    };

    socket.on("newGroupMessage", handleNewGroupMessage);
    return () => {
      socket.off("newGroupMessage", handleNewGroupMessage);
    };
  }, [groupId, currentUserId]);

  const handleTyping = () => {
    console.log("🟠 Emitting user-typing...");
    socket.emit("user-typing", {
      groupId,
      userId: currentUserId,
      username: username,
    });
  };
  const handleSend = () => {
    if (!newMessage.trim()) return;

    socket.emit("sendGroupMessage", {
      senderId: currentUserId,
      senderName: username,
      groupId,
      content: newMessage,
    });
    setNewMessage("");
  };
  return (
    <div className="flex flex-col h-screen w-[99.99%] bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transaprent">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`max-w-[30%] px-4 py-2 rounded-2xl text-sm ${isOwn
                  ? "ml-auto bg-purple-600 text-white rounded-br-none"
                  : "mr-auto bg-gray-200 dark:bg-neutral-700 text-black dark:text-white rounded-bl-none"
                  }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-200 dark:text-gray-300">
                    {isOwn ? "You" : msg.senderName}
                  </span>
                  <span className="break-words whitespace-pre-wrap">
                    {msg.content}
                  </span>
                </div>

                {isOwn && (
                  <span className="text-[10px] text-right text-gray-300 mt-1 block">
                    {msg.status === "seen"
                      ? "Seen"
                      : msg.status === "delivered"
                        ? "Delivered"
                        : "Sent"}
                  </span>
                )}
                <div>{msg.id}</div>
                <div className="mt-1">
                  <MessageItem
                    message={msg}
                    currentUserId={currentUserId}
                    socket={socket} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {TypingUser.size > 0 && (
          <div className="text-sm italic text-gray-500 dark:text-gray-300 mb-2">
            {[...TypingUser].join(", ")} {TypingUser.size === 1 ? "is" : "are"}{" "}
            typing...
          </div>
        )}
        <div ref={messageEndRed} />
      </div>
      <div className="p-4 border-t border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800">
        <div className="flex items-center gap-3">
          {/* Upload button */}
          <label className="cursor-pointer">
            <input
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // TODO: handle upload logic here
                  console.log("Selected file:", file);
                }
              }}
            />
            <div className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition">
              📎
            </div>
          </label>

          {/* Message input */}
          <input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            className="flex-1 rounded-full px-4 py-2 border border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-neutral-900 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-semibold transition shadow-sm"
          >
            Send
          </button>
        </div>
      </div>
      <SocketListener currentUserId={currentUserId}/>
    </div>
  );
}
