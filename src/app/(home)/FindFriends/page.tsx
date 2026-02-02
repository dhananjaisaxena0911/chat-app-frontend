'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "../../../../components/ui/input"
import { motion } from "framer-motion"
import { cn } from "../../../../lib/utils"
import { api } from "../../../../utils/api"

let deBounceTimeout: NodeJS.Timeout;

interface User {
  id: string;
  username: string;
  email: string;
}

export default function FindFriendsPage() {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<User[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [loadingFollow, setLoadingFollow] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUserId = localStorage.getItem("currentUserId");
        setCurrentUserId(storedUserId || "");
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        clearTimeout(deBounceTimeout);
        deBounceTimeout = setTimeout(() => {
            handleSearch();
        }, 300);
    }, [search])

    const handleSearch = async () => {
        if (!search.trim()) return

        try {
            const data = await api.get<{ result: User[] }>("/users/search", { query: search });
            if (Array.isArray(data.result)) {
                const users = data.result.filter((u: User) => u.id !== currentUserId);
                setResults(users);
                setShowDropdown(true);
                checkFollowingStatus(users);
            } else {
                setResults([]);
                console.error("Unexpected response format", data);
            }
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        }
    };

    const checkFollowingStatus = async (users: User[]) => {
        const following = new Set<string>();
        for (const user of users) {
            try {
                const data = await api.get<{ isFollowing: boolean }>(
                    "/follow/isFollowing",
                    { followerId: currentUserId, followingId: user.id }
                );
                if (data.isFollowing) {
                    following.add(user.id);
                }
            } catch (error) {
                console.error("Error checking follow status:", error);
            }
        }
        setFollowingIds(following);
    };

    const toggleFollow = async (userId: string) => {
        if (!currentUserId || !userId || loadingFollow) return;
        
        setLoadingFollow(userId);
        const isFollowing = followingIds.has(userId);
        const endpoint = isFollowing ? "/follow/unfollow" : "/follow";

        try {
            await api.post(endpoint, {
                followerId: currentUserId,
                followingId: userId,
            });

            setFollowingIds(prev => {
                const newSet = new Set(prev);
                if (isFollowing) {
                    newSet.delete(userId);
                } else {
                    newSet.add(userId);
                }
                return newSet;
            });
        } catch (error) {
            console.error("Follow error:", error);
        } finally {
            setLoadingFollow(null);
        }
    };

    const openProfile = (userId: string) => {
        setShowDropdown(false);
        setSearch("");
        router.push(`/profile/${userId}`);
    };

    return (
            <div className="relative z-10 flex flex-col items-center justify-start p-4 text-white w-full max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Find Friends
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Search for users and follow them to see their posts and stories
                    </p>
                </motion.div>

                <div className="relative w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Input
                            type="text"
                            placeholder="Search by email or username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full z-20 relative text-black bg-white/90 backdrop-blur-sm border-2 border-transparent focus:border-purple-500 rounded-2xl py-6 pl-12 pr-4 shadow-xl"
                            onFocus={() => results.length > 0 && setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        />
                        <svg 
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </motion.div>

                    {showDropdown && results.length > 0 && (
                        <motion.ul
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 w-full bg-white dark:bg-neutral-800 shadow-2xl rounded-2xl mt-2 max-h-80 overflow-y-auto border border-gray-100 dark:border-neutral-700"
                        >
                            {results.map((user: User, index: number) => (
                                <motion.li
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-700 border-b border-gray-100 dark:border-neutral-700 last:border-0 cursor-pointer group"
                                >
                                    <div 
                                        className="flex items-center gap-3 flex-1"
                                        onClick={() => openProfile(user.id)}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                                {user.username}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFollow(user.id);
                                        }}
                                        disabled={loadingFollow === user.id}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                                            "flex items-center gap-1",
                                            followingIds.has(user.id)
                                                ? "bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600"
                                                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-purple-500/25",
                                            loadingFollow === user.id && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {loadingFollow === user.id ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : followingIds.has(user.id) ? (
                                            <>
                                                <span>Following</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Follow</span>
                                            </>
                                        )}
                                    </button>
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}

                    {search && results.length === 0 && showDropdown && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute z-10 w-full bg-white dark:bg-neutral-800 shadow-2xl rounded-2xl mt-2 p-6 text-center border border-gray-100 dark:border-neutral-700"
                        >
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                No users found matching "{search}"
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Quick Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 w-full"
                >
                    <p className="text-gray-500 dark:text-gray-400 text-xs text-center mb-4 uppercase tracking-wider">
                        Why follow friends?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { icon: "📝", title: "See Posts", desc: "View their blogs & updates" },
                            { icon: "📖", title: "See Stories", desc: "Watch their daily stories" },
                            { icon: "💬", title: "Connect", desc: "Message and interact" },
                        ].map((tip, i) => (
                            <div 
                                key={i}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-colors"
                            >
                                <div className="text-2xl mb-2">{tip.icon}</div>
                                <p className="text-sm font-semibold">{tip.title}</p>
                                <p className="text-xs text-gray-400">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
    )
}

