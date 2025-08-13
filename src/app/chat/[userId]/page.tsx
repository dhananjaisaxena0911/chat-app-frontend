"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "../../../../components/ui/input";
import { SidebarDemo } from "../../../../components/sideBarDemo";
import { Socket, io } from "socket.io-client";
import { useRef } from "react";
type Message = {
    content: string;
    sender: {
        id: string;
        username: string;
    };
};

export default function ChatPage() {
    const { userId } = useParams();
    const [currentUserId, setCurrentUserId] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversation, setConversation] = useState<any[]>([]);
    const socketRef = useRef<Socket | null>(null);
    useEffect(() => {
        const storedUserId = localStorage.getItem("currentUserId");
        console.log(storedUserId);
        if (storedUserId) {
            setCurrentUserId(storedUserId);
        }
    }, []);
    useEffect(() => {
        socketRef.current = io("http://localhost:3001");
        socketRef.current.on("connect", () => {
            console.log("Connected to WebSocket");
        });
        return () => {
            socketRef.current?.disconnect();
        };

    }, [])

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on("receiveMessage", (message: Message) => {
            console.log("Received via socket:", message); // <--- Add this for debug
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socketRef.current?.off("receiveMessage");
        };
    }, []);

    useEffect(() => {
        const fetchConversation = async () => {
            if (!currentUserId) {
                return;
            }
            try {
                const res = await fetch(
                    `http://localhost:3001/conversation/${currentUserId}`
                );
                const data = await res.json();
                const convoList = Array.isArray(data) ? data : data.conversations;
                setConversation(convoList || []);
            } catch (err) {
                console.error("Failed to fetch conversation", err);
            }
        };
        fetchConversation();
    }, [currentUserId]);
    
    useEffect(() => {
  if (!currentUserId || !userId) return;

  const getConversationId = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/conversation/conversationId/${currentUserId}`
      );
      const data = await res.json();
      const conversations = Array.isArray(data) ? data : data.conversations;

      const convo = conversations.find((c: any) =>
        c.participants.some((p: any) => p.id === userId)
      );

      if (convo) {
        setConversationId(convo.id);
      } else {
        const res = await fetch("http://localhost:3001/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantsIDs: [currentUserId, userId],
          }),
        });
        const newConvo = await res.json();
        setConversationId(newConvo.id);
      }
    } catch (err) {
      console.error("Error fetching/creating conversation", err);
    }
  };

  getConversationId();
}, [currentUserId, userId]);


    useEffect(() => {
        const socket = socketRef.current;

        if (conversationId) {
            socket?.emit("joinConversation", conversationId);
        }

        const handleNewMessage = (message: Message) => {
            setMessages((prev) => [...prev, message]);
        };

        socket?.on("newMessage", handleNewMessage);

        return () => {
            socket?.off("newMessage", handleNewMessage);
        };
    }, [conversationId]);


    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async () => {
            const res = await fetch(
                `http://localhost:3001/message/${conversationId}`
            );
            const data = await res.json();
            setMessages(data);
        };
        fetchMessages();
    }, [conversationId]);

    const handleSend = async () => {
        if (!newMsg.trim() || !conversationId) return;

        // const newMessage: Message = {
        //     content: newMsg,
        //     sender: {
        //         id: currentUserId,
        //         username: "You",
        //     },
        // };

        socketRef.current?.emit("sendMessage", {
            senderId: currentUserId,
            recipientId: userId,
            conversationId,
            content: newMsg,
        });

        setNewMsg("");

        try {
            await fetch("http://localhost:3001/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    senderId: currentUserId,
                    recipientId: userId,
                    content: newMsg,
                }),
            });

        } catch (error) {
            console.error("Failed to send Message", error);
        }
    };

    return (
        <div className="flex h-screen w-full">
            {/* Inbox Panel */}
            <aside className="w-[320px] border-r border-gray-200 bg-white dark:bg-neutral-900 p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-6 text-neutral-800 dark:text-white">Chats</h2>
                <div className="overflow-y-auto flex-1 space-y-3">
                    {conversation.map((c) => {
                        const otherUser = c.participants.find((p: any) => p.id !== currentUserId);
                        return (
                            <div
                                key={c.id}
                                onClick={() => (window.location.href = `/chat/${otherUser.id}`)}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer transition-all"
                            >
                                <img src="/avatar1.png" alt={otherUser.username} className="w-11 h-11 rounded-full" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-md font-medium truncate text-neutral-900 dark:text-white">
                                        {otherUser.username}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {c.lastMessage || "Start chatting"}
                                    </p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Chat Panel */}
            <main className="flex-1 bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white flex flex-col">
                {userId ? (
                    <>
                    {/**Header with UserName */}
                    <div className="px-6 py-4 border-b border-gray-800 bg-[#121212]">
                        <h2 className="text-lg font-semibold">
                           {
                        conversation.find(c =>
                            c.participants.some((p: { id: string | string[]; }) => p.id === userId)
                        )?.participants.find((p: { id: string | string[]; }) => p.id === userId)?.username || "Chat"
                    }
                        </h2>
                    </div>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender?.id === currentUserId;
                                return (
                                    <div
                                        key={idx}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`rounded-xl px-4 py-2 max-w-[70%] text-sm shadow ${isMe
                                                    ? 'bg-purple-600 text-white rounded-br-none'
                                                    : 'bg-[#2a2a2a] text-gray-200 rounded-bl-none'
                                                }`}
                                        >
                                            {!isMe && (
                                                <p className="text-xs font-medium text-purple-400 mb-1">
                                                    {msg.sender?.username}
                                                </p>
                                            )}
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Box */}
                        <div className="p-4 border-t border-gray-800 bg-[#121212]">
                            <div className="flex items-end gap-3">
                                <textarea
                                    value={newMsg}
                                    onChange={(e) => setNewMsg(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 resize-none rounded-2xl p-3 bg-[#1f1f1f] border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 transition-all"
                                    rows={1}
                                    onInput={(e) => {
                                        e.currentTarget.style.height = "auto";
                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-2xl font-medium transition-all"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-lg font-medium">
                        Select a conversation to start chatting
                    </div>
                )}
            </main>
        </div>
    );


}
