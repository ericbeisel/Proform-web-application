"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft, Users, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { profileApi, SearchUser } from "@/api/profile/route";

// ── Helpers ────────────────────────────────────────────────────────────────

const formatFollowers = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const getInitials = (name: string): string =>
  name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_COLORS: string[] = [
  "bg-indigo-500", "bg-purple-600", "bg-orange-500", "bg-emerald-500",
  "bg-blue-500", "bg-pink-500", "bg-cyan-500", "bg-violet-500",
];

const getAvatarBg = (id: number): string => AVATAR_COLORS[id % AVATAR_COLORS.length];

interface CurrentUser {
  username: string;
}

// ── Page Component ─────────────────────────────────────────────────────────

export default function FindUsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pendingActions, setPendingActions] = useState<Set<number>>(new Set());

  // Initialize User from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser({ username: parsed.username });
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, []);

  // Fetch Users Function
  const fetchUsers = useCallback(async (page: number, search?: string) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await profileApi.searchUsers(page, search);
console.log(
  "👥 Followers Count:",
  response.data?.map((u) => ({
    name: u.name,
    username: u.username,
    followers: u.followersCount,
  }))
);
      if (response.data && Array.isArray(response.data)) {
        const normalized = response.data.map((user) => {
          const stored = localStorage.getItem("userFollows");
          const follows = stored ? JSON.parse(stored) : {};
          if (follows[user.id] !== undefined) {
            return { ...user, followtype: follows[user.id] ? "Following" : "Follow Me!" };
          }
          return user;
        });

        setUsers((prev) => (page === 1 ? normalized : [...prev, ...normalized]));
        setHasMore(response.data.length === 20);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Search Debounce (Consolidated)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchTerm || undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsers]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (hasMore && !loadingMore && !loading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchUsers(nextPage, searchTerm || undefined);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage, hasMore, loadingMore, loading, searchTerm, fetchUsers]);

  // Follow Logic
  const handleFollowToggle = async (userId: number, currentFollowType: string) => {
    if (!currentUser || pendingActions.has(userId)) return;

    const isCurrentlyFollowing = currentFollowType === "Following" || currentFollowType === "Unfollow";
    const payload = { user_id: userId, follower_username: currentUser.username };

    setPendingActions(prev => new Set(prev).add(userId));

    try {
      if (isCurrentlyFollowing) {
        await profileApi.unfollowUser(payload);
        updateLocalState(userId, false);
      } else {
        await profileApi.followUser(payload);
        updateLocalState(userId, true);
      }
    } catch (err) {
      console.error("Follow action failed", err);
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const updateLocalState = (userId: number, isFollowing: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      followtype: isFollowing ? "Following" : "Follow Me!",
      followersCount: Math.max(0, (Number(u.followersCount) || 0) + (isFollowing ? 1 : -1))
    } : u));

    const stored = localStorage.getItem("userFollows");
    const follows = stored ? JSON.parse(stored) : {};
    follows[userId] = isFollowing;
    localStorage.setItem("userFollows", JSON.stringify(follows));
  };

  return (
    <div className="min-h-screen bg-[#F3F4F8]">
      {/* Header */}
   <header className="sticky top-0 z-20 bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 py-4 shadow-lg">
  <div className="max-w-5xl mx-auto">
    <div className="flex items-center gap-4 mb-4">
      <button
        onClick={() => router.back()}
        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
      >
        <ArrowLeft size={18} className="text-white" />
      </button>
      <h1 className="text-xl font-bold text-white tracking-tight">
        Find Users
      </h1>
    </div>

    <div className="relative mb-3">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        placeholder="Search users..."
        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-purple-500 shadow-xl text-sm text-gray-900"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* NEW TEXT OPTIONS */}
    <div className="flex gap-6 text-sm">
      <span className="text-white">
        Search{" "}
        <span onClick={() => router.push("/programs")} className="underline cursor-pointer hover:text-purple-300">
          Programs  and  Workouts
        </span>{" "}
      
      </span>

      <span className="text-white">
        Search{" "}
        <span className="underline cursor-pointer hover:text-purple-300">
          Exercises
        </span>
      </span>
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-5 pb-20">
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <Loader2 className="animate-spin text-purple-600 mb-2" size={32} />
            <p className="text-gray-500 text-sm">Searching athletes...</p>
          </div>
        ) : error && !loading ? (
          <div className="text-center pt-20">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button onClick={() => fetchUsers(1)} className="text-purple-600 underline text-sm">Try Again</button>
          </div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="flex flex-col items-center pt-20 text-center opacity-60">
                <Users size={48} className="text-gray-300 mb-3" />
                <p className="text-gray-600 font-semibold">No users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {users.map((user) => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    isPending={pendingActions.has(user.id)}
                    onToggle={handleFollowToggle}
                  />
                ))}
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-purple-600" size={24} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── Sub-Component ──────────────────────────────────────────────────────────

function UserCard({ user, isPending, onToggle }: { user: SearchUser, isPending: boolean, onToggle: any }) {
  const isFollowing = user.followtype === "Following" || user.followtype === "Unfollow";

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        {user.image ? (
          <img src={user.image} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-50" />
        ) : (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${getAvatarBg(user.id)}`}>
            {getInitials(user.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
            {user.role_id === "3" && (
              <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Admin</span>
            )}
          </div>
          <p className="text-purple-600 text-sm font-medium">@{user.username}</p>
          <p className="text-gray-400 text-xs mt-1">{formatFollowers(Number(user.followersCount))} followers</p>
          
          <button
            disabled={isPending}
            onClick={() => onToggle(user.id, user.followtype)}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              isFollowing 
                ? "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100" 
                : "bg-purple-700 text-white hover:bg-purple-800"
            } ${isPending ? "opacity-50" : ""}`}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isFollowing ? (
              <><UserCheck size={16} /> Following</>
            ) : (
              <><UserPlus size={16} /> Follow</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}