'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BackgroundLines } from "../../../../components/ui/background-lines"
import { Input } from "../../../../components/ui/input"


let deBounceTimeout: NodeJS.Timeout;
export default function FindFriendsPage() {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
            return;
        }
        clearTimeout(deBounceTimeout);
        deBounceTimeout = setTimeout(() => {
            handleSearch();
        }, 300);
    }, [search])

    const handleSearch = async () => {
        if (!search.trim() || !token) return

        try {
            const res = await fetch(`http://localhost:3001/users/search?query=${search}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (Array.isArray(data.result)) {
                setResults(data.result);
                setShowDropdown(true);
            } else {
                setResults([]);
                console.error("Unexpected response format", data);
            }

        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        }

    };

    const openProfile = (userId: string) => {
        setShowDropdown(false);
        setSearch("");
        router.push(`/profile/${userId}`);
    };
    return (
        <BackgroundLines>
            <div className="relative z-10 flex flex-col items-center justify-start p-4 text-white w-full">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Find Friends</h2>

                <div className="relative w-full max-w-md">
                    <Input
                        type="text"
                        placeholder="Search by email or username"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full z-20 relative text-black"
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />

                    {showDropdown && results.length > 0 && (
                        <ul className="absolute z-10 w-full bg-neutral-700 shadow-lg rounded-md mt-1 max-h-64 overflow-y-auto">
                            {results.map((user: any) => (
                                <li
                                    key={user.id}
                                    onClick={() => openProfile(user.id)}
                                    className="px-4 py-2 hover:bg-gray-300 cursor-pointer text-black"
                                >
                                    {user.username} ({user.email})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

        </BackgroundLines>
    )
}
