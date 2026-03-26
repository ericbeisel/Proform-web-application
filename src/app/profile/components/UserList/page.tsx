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
  "#6C63FF", "#7C3AED", "#F97316", "#10B981",
  "#3B82F6", "#EC4899", "#06B6D4", "#8B5CF6",
  "#F59E0B", "#14B8A6",
];

const getAvatarColor = (id: number): string =>
  AVATAR_COLORS[id % AVATAR_COLORS.length];

// ── Types ──────────────────────────────────────────────────────────────────

interface CurrentUser {
  username: string;
}

interface UserCardProps {
  user: SearchUser;
  onFollowToggle: (userId: number, currentFollowType: string) => void;
}

// ── Page ───────────────────────────────────────────────────────────────────

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

  const fetchUsers = useCallback(async (page: number, search?: string): Promise<void> => {
    try {
      const response = await profileApi.searchUsers(page, search);
      if (response.data && Array.isArray(response.data)) {
        if (page === 1) {
          setUsers(response.data);
        } else {
          setUsers((prev: SearchUser[]) => [...prev, ...response.data]);
        }
        setHasMore(response.data.length === 20);
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setCurrentPage(1);
      fetchUsers(1, searchTerm || undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsers]);

  const loadMore = useCallback((): void => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(nextPage, searchTerm || undefined);
  }, [hasMore, loadingMore, loading, currentPage, searchTerm, fetchUsers]);

  useEffect(() => {
    const handleScroll = (): void => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  const handleFollowToggle = async (userId: number, currentFollowType: string): Promise<void> => {
    if (!currentUser) return;
    const payload = { user_id: userId, follower_username: currentUser.username };
    try {
      if (currentFollowType === "Following") {
        await profileApi.unfollowUser(payload);
        setUsers((prev: SearchUser[]) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, followtype: "Follow Me!", followersCount: Math.max(0, u.followersCount - 1) }
              : u
          )
        );
      } else {
        await profileApi.followUser(payload);
        setUsers((prev: SearchUser[]) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, followtype: "Following", followersCount: u.followersCount + 1 }
              : u
          )
        );
      }
    } catch (err) {
      const error = err as Error;
      console.error("Follow action failed:", error);
      alert(error.message || "Action failed");
    }
  };

  return (
    <div className="fu-page">
      {/* ── Header ── */}
      <div className="fu-header">
        <div className="fu-header-bg-grid" />

        <div className="fu-header-inner">
          {/* Title row */}
          <div className="fu-title-row">
            <button className="fu-back-btn" onClick={() => router.back()}>
              <ArrowLeft size={18} color="#fff" />
            </button>
            <h1 className="fu-title">Find Users</h1>
          </div>

          {/* Search bar */}
          <div className="fu-search-wrap">
            <Search size={17} className="fu-search-icon" />
            <input
              type="text"
              className="fu-search-input"
              placeholder="Search users by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="fu-content">

        {/* Loading */}
        {loading && users.length === 0 && (
          <div className="fu-center-state">
            <Loader2 size={32} color="#7C3AED" className="fu-spinner" />
            <p className="fu-state-text">Loading users...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="fu-center-state">
            <div className="fu-error-icon-wrap">
              <Users size={24} color="#EF4444" />
            </div>
            <p style={{ color: "#EF4444", fontSize: 14 }}>{error}</p>
            <button className="fu-retry-btn" onClick={() => fetchUsers(1, searchTerm || undefined)}>
              Try Again
            </button>
          </div>
        )}

        {/* Grid */}
        {!error && (
          <>
            {!loading && users.length === 0 ? (
              <div className="fu-center-state">
                <Users size={48} color="#D1D5DB" style={{ marginBottom: 12 }} />
                <p className="fu-state-text">No users found</p>
                <p className="fu-state-subtext">
                  {searchTerm ? "Try searching with a different name" : "No users available"}
                </p>
              </div>
            ) : (
              <div className="fu-grid">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} onFollowToggle={handleFollowToggle} />
                ))}
              </div>
            )}

            {loadingMore && (
              <div className="fu-center-state" style={{ paddingTop: 24, paddingBottom: 0 }}>
                <Loader2 size={24} color="#7C3AED" className="fu-spinner" />
              </div>
            )}

            {!hasMore && users.length > 0 && (
              <p className="fu-end-text">No more users to load</p>
            )}
          </>
        )}
      </div>

      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Page */
        .fu-page {
          min-height: 100vh;
          background: #F3F4F8;
          font-family: 'Sora', 'DM Sans', sans-serif;
        }

        /* Header */
        .fu-header {
          position: relative;
          overflow: hidden;
          background: linear-gradient(120deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          padding: 16px 24px 20px;
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .fu-header-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px);
          pointer-events: none;
        }
        .fu-header-inner {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          margin: 0 auto;
        }
        .fu-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .fu-back-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .fu-back-btn:hover { background: rgba(255,255,255,0.25); }
        .fu-title {
          color: #fff;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.3px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .fu-search-wrap {
          position: relative;
        }
        .fu-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          pointer-events: none;
        }
        .fu-search-input {
          width: 100%;
          padding: 13px 16px 13px 44px;
          background: #fff;
          border: 1.5px solid transparent;
          border-radius: 12px;
          font-size: 14px;
          color: #111827;
          outline: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .fu-search-input:focus { border-color: #7C3AED; }

        /* Content */
        .fu-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px 20px 60px;
        }

        /* Grid — mobile first: 1 col by default */
        .fu-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        /* States */
        .fu-center-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-top: 60px;
          text-align: center;
        }
        .fu-state-text { color: #6B7280; font-size: 15px; margin-top: 12px; }
        .fu-state-subtext { color: #9CA3AF; font-size: 13px; margin-top: 4px; }
        .fu-spinner { animation: spin 1s linear infinite; }
        .fu-error-icon-wrap {
          width: 64px; height: 64px;
          background: #FEF2F2;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
        }
        .fu-retry-btn {
          margin-top: 12px; color: #7C3AED; font-size: 13px; font-weight: 500;
          background: none; border: none; cursor: pointer;
          text-decoration: underline; font-family: inherit;
        }
        .fu-end-text {
          text-align: center; padding-top: 24px;
          color: #9CA3AF; font-size: 13px;
        }

        /* Card */
        .fu-card {
          background: #fff;
          border-radius: 18px;
          padding: 20px 22px;
          border: 1.5px solid #F0F0F5;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .fu-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.10);
          transform: translateY(-1px);
        }
        .fu-card-inner { display: flex; align-items: flex-start; gap: 16px; }
        .fu-avatar {
          width: 58px; height: 58px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 18px;
          flex-shrink: 0;
        }
        .fu-avatar img {
          width: 58px; height: 58px;
          border-radius: 50%; object-fit: cover;
        }
        .fu-card-info { flex: 1; min-width: 0; }
        .fu-card-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .fu-card-name { font-size: 16px; font-weight: 700; color: #111827; }
        .fu-admin-badge {
          background: #EDE9FE; color: #7C3AED;
          font-size: 10px; font-weight: 600;
          padding: 2px 7px; border-radius: 99px;
        }
        .fu-card-username { margin-top: 3px; font-size: 13px; color: #7C3AED; font-weight: 500; }
        .fu-card-followers { margin-top: 6px; font-size: 12px; color: #9CA3AF; font-weight: 500; }
        .fu-follow-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%; margin-top: 14px; padding: 10px 0;
          border-radius: 10px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .fu-follow-btn.follow {
          background: #5B21B6; color: #fff; border: none;
          box-shadow: 0 2px 8px rgba(91,33,182,0.3);
        }
        .fu-follow-btn.follow:hover { background: #4C1D95; }
        .fu-follow-btn.following {
          background: #F9FAFB; color: #374151;
          border: 1.5px solid #E5E7EB;
        }
        .fu-follow-btn.following:hover { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }

        /* ── Responsive — mobile-first ── */

        /* Small mobile adjustments */
        @media (max-width: 400px) {
          .fu-header { padding: 12px 12px 14px; }
          .fu-content { padding: 12px 12px 60px; }
          .fu-title { font-size: 17px; }
          .fu-title-row { margin-bottom: 10px; }
          .fu-search-input { font-size: 13px; padding-top: 11px; padding-bottom: 11px; }
          .fu-card { padding: 14px; border-radius: 14px; }
          .fu-card-inner { gap: 12px; }
          .fu-avatar { width: 46px; height: 46px; font-size: 14px; }
          .fu-avatar img { width: 46px; height: 46px; }
          .fu-card-name { font-size: 14px; }
          .fu-card-username { font-size: 12px; }
          .fu-follow-btn { font-size: 13px; padding: 9px 0; margin-top: 10px; }
        }

        /* Phablet — 2 col */
        @media (min-width: 540px) {
          .fu-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .fu-content { padding: 16px 16px 60px; }
        }

        /* Tablet */
        @media (min-width: 768px) {
          .fu-header { padding: 16px 24px 20px; }
          .fu-content { padding: 20px 24px 60px; }
          .fu-grid { gap: 16px; }
          .fu-title { font-size: 22px; }
        }

        /* Desktop — 2 col with wider cards */
        @media (min-width: 1024px) {
          .fu-content { padding: 24px 32px 60px; }
          .fu-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }
      `}</style>
    </div>
  );
}

// ── UserCard ───────────────────────────────────────────────────────────────

function UserCard({ user, onFollowToggle }: UserCardProps) {
  const isFollowing = user.followtype === "Following";

  return (
    <div className="fu-card">
      <div className="fu-card-inner">

        {/* Avatar */}
        {user.image ? (
          <div className="fu-avatar"><img src={user.image} alt={user.name} /></div>
        ) : (
          <div className="fu-avatar" style={{ background: getAvatarColor(user.id) }}>
            {getInitials(user.name)}
          </div>
        )}

        {/* Info */}
        <div className="fu-card-info">
          <div className="fu-card-name-row">
            <span className="fu-card-name">{user.name}</span>
            {user.role_id === "3" && <span className="fu-admin-badge">Admin</span>}
          </div>

          <p className="fu-card-username">@{user.username}</p>
          <p className="fu-card-followers">{formatFollowers(user.followersCount)} followers</p>

          <button
            className={`fu-follow-btn ${isFollowing ? "following" : "follow"}`}
            onClick={() => onFollowToggle(user.id, user.followtype)}
          >
            {isFollowing ? <><UserCheck size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
          </button>
        </div>
      </div>
    </div>
  );
}