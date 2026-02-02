"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { SidebarDemo } from "../../../components/sideBarDemo";
import { MessageTabs } from "@/components/ui/MessageTabs";
import { ConversationList, ConversationListSkeleton } from "@/components/ui/ConversationList";
import { UnifiedChatView, UnifiedChatViewSkeleton } from "@/components/ui/UnifiedChatView";
import { formatRelativeTime } from "@/lib/messageUtils";
import api from "../../../utils/api";

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

interface Group {
  id: string;
  name: string;
  memberCount?: number;
}

interface Follower {
  id: string;
  username: string;
  avatarUrl?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "groups">("messages");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Create group modal state
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Follower[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeList, setActiveList] = useState<"followers" | "following">("followers");
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [isExitingGroup, setIsExitingGroup] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get current user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserId(decoded.sub || decoded.userId);
      } catch (error) {
        console.error("Invalid token", error);
      }
    } else {
      router.replace("/auth");
    }
  }, [router]);

  // Fetch conversations (DMs)
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const data = await api.get<any>(`/conversation/${currentUserId}`);
      const convoList = Array.isArray(data) ? data : data.conversations || [];

      const formatted: Conversation[] = convoList.map((c: any) => {
        const otherUser = c.participants?.find((p: any) => p.id !== currentUserId);
        return {
          id: c.id,
          type: "dm",
          name: otherUser?.username || "Unknown",
          avatar: otherUser?.avatar,
          lastMessage: c.lastMessage,
          lastMessageTime: c.updatedAt
            ? formatRelativeTime(c.updatedAt)
            : undefined,
          unreadCount: c.unreadCount,
          participants: c.participants,
          isOnline: otherUser?.isOnline,
          lastMessageStatus: c.lastMessageStatus as "sent" | "delivered" | "seen",
        };
      });

      setConversations(formatted);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  }, [currentUserId]);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const data = await api.get<any[]>("/group");
      const groupList = Array.isArray(data) ? data : [];

      const formatted: Conversation[] = groupList.map((g: any) => ({
        id: g.id,
        type: "group",
        name: g.name,
        avatar: g.avatar,
        memberCount: g.members?.length || g.memberCount || 0,
        lastMessage: undefined,
        lastMessageTime: g.updatedAt ? formatRelativeTime(g.updatedAt) : undefined,
        participants: g.members,
      }));

      setGroups(groupList);
      setConversations((prev) => {
        const dms = prev.filter((c) => c.type === "dm");
        return [...dms, ...formatted];
      });
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  }, []);

  // Fetch group members
  const fetchGroupMembers = useCallback(async (groupId: string) => {
    try {
      const data = await api.get<any>(`/group/${groupId}/members`);
      setGroupMembers(data.members || []);
    } catch (error) {
      console.error("Failed to fetch group members", error);
      setGroupMembers([]);
    }
  }, []);

  // Exit group handler
  const handleExitGroup = async () => {
    if (!selectedConversation) return;
    
    const confirmExit = window.confirm("Are you sure you want to exit this group?");
    if (!confirmExit) return;

    setIsExitingGroup(true);
    try {
      await api.post("/group/leave", {
        groupId: selectedConversation.id,
        userId: currentUserId,
      });

      // Remove the group from conversations
      setConversations((prev) => prev.filter((c) => c.id !== selectedConversation.id));
      setSelectedConversation(null);
      alert("You have left the group successfully!");
    } catch (error) {
      console.error("Error exiting group:", error);
      alert("Failed to exit group. Please try again.");
    } finally {
      setIsExitingGroup(false);
    }
  };

  // Fetch followers and following for group creation
  const fetchFollowersAndFollowing = useCallback(async () => {
    setIsLoadingFollowers(true);
    try {
      const followersData = await api.get<any>("/users/followers");
      setFollowers(followersData.followers || []);

      const followingData = await api.get<any>("/users/following");
      setFollowing(followingData.following || []);
    } catch (error) {
      console.error("Failed to fetch followers/following", error);
      setFollowers([]);
      setFollowing([]);
    } finally {
      setIsLoadingFollowers(false);
    }
  }, []);

  // Load data
  useEffect(() => {
    if (currentUserId) {
      setLoading(true);
      fetchConversations();
      fetchGroups();
      setLoading(false);
    }
  }, [currentUserId, fetchConversations, fetchGroups]);

  // Get all items for list based on active tab
  const getFilteredItems = () => {
    if (activeTab === "messages") {
      return conversations.filter((c) => c.type === "dm");
    } else {
      return conversations.filter((c) => c.type === "group");
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    if (conv.type === "group") {
      fetchGroupMembers(conv.id);
    }
  };

  // Toggle member selection
  const toggleMemberSelection = (follower: Follower) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m.id === follower.id);
      if (isSelected) {
        return prev.filter((m) => m.id !== follower.id);
      } else {
        return [...prev, follower];
      }
    });
  };

  // Open create group modal
  const openCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true);
    fetchFollowersAndFollowing();
    setGroupName("");
    setSelectedMembers([]);
    setActiveList("followers");
  };

  // Create group handler
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    setIsCreatingGroup(true);
    try {
      const memberIds = selectedMembers.map((m) => m.id);
      const newGroup = await api.post<any>("/group", {
        name: groupName.trim(),
        adminId: currentUserId,
        memberIds: memberIds,
      });

      const newGroupConversation: Conversation = {
        id: newGroup.id,
        type: "group",
        name: newGroup.name,
        memberCount: memberIds.length + 1,
      };
      setConversations((prev) => [...prev, newGroupConversation]);
      setGroups((prev) => [...prev, { id: newGroup.id, name: newGroup.name }]);
      
      setIsCreateGroupModalOpen(false);
      setGroupName("");
      setSelectedMembers([]);
      
      setActiveTab("groups");
      setSelectedConversation(newGroupConversation);
      
      alert("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Mobile chat view
  if (isMobile && selectedConversation) {
    return (
      <div className="h-screen md:hidden">
        {selectedConversation.type === "dm" ? (
          <UnifiedChatView
            type="dm"
            conversationId={selectedConversation.id}
            currentUserId={currentUserId}
            otherParticipant={{
              id: selectedConversation.participants?.find((p: any) => p.id !== currentUserId)?.id || "",
              username: selectedConversation.name,
              avatar: selectedConversation.avatar,
              isOnline: selectedConversation.isOnline,
            }}
          />
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {selectedConversation.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{selectedConversation.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {groupMembers.length > 0 ? `${groupMembers.length} members` : `${selectedConversation.memberCount || 0} members`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleExitGroup}
                disabled={isExitingGroup}
                className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {isExitingGroup ? "Exiting..." : "Exit"}
              </button>
            </div>
            <UnifiedChatView
              type="group"
              conversationId={selectedConversation.id}
              currentUserId={currentUserId}
              groupInfo={{
                id: selectedConversation.id,
                name: selectedConversation.name,
                members: selectedConversation.participants,
              }}
            />
          </>
        )}
      </div>
    );
  }

  const currentList = activeList === "followers" ? followers : following;
  const otherListCount = activeList === "followers" ? following.length : followers.length;

  return (
    <SidebarDemo>
      <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]">
        <div className="flex h-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-neutral-800">
          {/* Left Panel - Conversation List */}
          <div className={`${selectedConversation && isMobile ? "hidden md:flex" : "flex"} w-full md:w-[380px] flex-col border-r border-gray-100 dark:border-neutral-800`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              <MessageTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Search */}
            <div className="px-4 py-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={`Search ${activeTab === "messages" ? "conversations" : "groups"}...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <ConversationListSkeleton />
              ) : (
                <ConversationList
                  conversations={getFilteredItems()}
                  activeId={selectedConversation?.id}
                  onSelect={handleSelectConversation}
                  filter={activeTab === "messages" ? "messages" : "groups"}
                />
              )}
            </div>

            {/* Create button */}
            <div className="p-4 border-t border-gray-100 dark:border-neutral-800">
              <button
                onClick={() => { if (activeTab === "groups") { openCreateGroupModal(); }}}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {activeTab === "messages" ? "New Message" : "New Group"}
              </button>
            </div>
          </div>

          {/* Right Panel - Chat View */}
          <div className={`${selectedConversation ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
            {selectedConversation ? (
              selectedConversation.type === "dm" ? (
                <UnifiedChatView
                  type="dm"
                  conversationId={selectedConversation.id}
                  currentUserId={currentUserId}
                  otherParticipant={{
                    id: selectedConversation.participants?.find((p: any) => p.id !== currentUserId)?.id || "",
                    username: selectedConversation.name,
                    avatar: selectedConversation.avatar,
                    isOnline: selectedConversation.isOnline,
                  }}
                />
              ) : (
                <>
                  <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {selectedConversation.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">{selectedConversation.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {groupMembers.length > 0 ? `${groupMembers.length} members` : `${selectedConversation.memberCount || 0} members`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleExitGroup}
                      disabled={isExitingGroup}
                      className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isExitingGroup ? "Exiting..." : "Exit Group"}
                    </button>
                  </div>
                  <UnifiedChatView
                    type="group"
                    conversationId={selectedConversation.id}
                    currentUserId={currentUserId}
                    groupInfo={{
                      id: selectedConversation.id,
                      name: selectedConversation.name,
                      members: selectedConversation.participants,
                    }}
                  />
                </>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Messages</h2>
                <p className="text-center max-w-sm">Send photos and messages to a friend or group</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Group Modal */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
              <button onClick={() => setIsCreateGroupModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Group</h2>
              <button onClick={handleCreateGroup} disabled={isCreatingGroup || !groupName.trim()} className="text-blue-500 font-semibold disabled:opacity-50 hover:text-blue-600">
                {isCreatingGroup ? "Creating..." : "Create"}
              </button>
            </div>
            
            {/* Group Name Input */}
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <input type="text" placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full p-3 text-lg border-none focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400 bg-transparent" />
            </div>
            
            {/* Selected Members Preview */}
            {selectedMembers.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{selectedMembers.length} {selectedMembers.length === 1 ? "person" : "people"} selected</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{member.username}</span>
                      <button onClick={() => toggleMemberSelection(member)} className="text-purple-500 hover:text-purple-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* List Tabs */}
            <div className="flex border-b border-gray-200 dark:border-neutral-700">
              <button onClick={() => setActiveList("followers")} className={`flex-1 py-3 text-sm font-semibold ${activeList === "followers" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-700"}`}>
                Followers ({followers.length})
              </button>
              <button onClick={() => setActiveList("following")} className={`flex-1 py-3 text-sm font-semibold ${activeList === "following" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-700"}`}>
                Following ({following.length})
              </button>
            </div>
            
            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Select people to add to the group</p>
              {isLoadingFollowers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : currentList.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {activeList === "followers" ? "No followers found." : "Not following anyone yet."}
                  {otherListCount > 0 && ` Try switching to ${activeList === "followers" ? "Following" : "Followers"} tab!`}
                </p>
              ) : (
                <div className="space-y-2">
                  {currentList.map((user) => {
                    const isSelected = selectedMembers.some((m) => m.id === user.id);
                    return (
                      <div key={user.id} onClick={() => toggleMemberSelection(user)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors">
                        <div className="relative">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-purple-500 bg-purple-500" : "border-gray-300 dark:border-gray-600"}`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SidebarDemo>
  );
}

