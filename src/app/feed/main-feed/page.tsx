"use client";

import { useEffect, useState } from "react";
import { Heart, Plus, Search, MoreVertical, Medal, ArrowUp, Award, TrendingUp } from "lucide-react";
import { feedApi, CurrentUser, Feed } from "@/api/feed/route";

function groupByDate(feeds: Feed[]): { label: string; feeds: Feed[] }[] {
  const map: Record<string, Feed[]> = {};
  const order: string[] = [];
  feeds.forEach((f) => {
    const d = new Date(f.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    let label: string;
    if (d.toDateString() === today.toDateString()) label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    else label = d.toLocaleDateString("en-US", { weekday: "long" });
    if (!map[label]) { map[label] = []; order.push(label); }
    map[label].push(f);
  });
  return order.map((label) => ({ label, feeds: map[label] }));
}

export default function FeedMainPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await feedApi.getFeed(1);
      setFeeds(res.feeds || []);
      setCurrentUser(res.currectUser);
      console.log("Current User:", res.currectUser);
      console.log("Feed Response:", res);
      if (res.currectUser?.id) {
        const highlightRes = await feedApi.getHighlights(res.currectUser.id);
        setHighlights(highlightRes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (!value.trim()) { setSearchResults([]); return; }
    try {
      const res = await feedApi.searchUsers(value);
      console.log("Search Response:", res);
      setSearchResults(res);
    } catch (err) { console.error(err); }
  };

  const handleLike = async (feed: Feed) => {
    if (!currentUser) return;
    const isLiked = feed.likes.includes(String(currentUser.id));
    try {
      if (isLiked) await feedApi.unlikeFeed(feed.id);
      else await feedApi.likeFeed(feed.id);
      console.log(isLiked ? "Unliked feed ID:" : "Liked feed ID:", feed.id);
      setFeeds((prev) =>
        prev.map((f) =>
          f.id === feed.id
            ? {
                ...f,
                likeCount: isLiked ? f.likeCount - 1 : f.likeCount + 1,
                likes: isLiked
                  ? f.likes.filter((id) => id !== String(currentUser.id))
                  : [...f.likes, String(currentUser.id)],
              }
            : f
        )
      );
    } catch (err) { console.error(err); }
  };

  const handleCreateHighlight = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      await feedApi.createHighlight(formData);
      loadData();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa", fontSize: 14 }}>
          Loading feed...
        </div>
      </div>
    );
  }

  const grouped = groupByDate(feeds);

  return (
    <div style={styles.page}>
      <div style={styles.inner}>

        {/* PAGE TITLE */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={styles.pageTitle}>Activity Feed</h1>
          <p style={styles.pageSub}>See what your friends are up to</p>
        </div>

        {/* TOP ROW: Search + Buttons */}
        <div style={styles.topRow}>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={styles.searchBox}>
              <Search size={16} color="#bbb" />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users by name or username..."
                style={styles.searchInput}
              />
            </div>
            {searchResults.length > 0 && (
              <div style={styles.searchDrop}>
                {searchResults.map((user) => (
                  <div key={user.id} style={styles.searchItem}>
                    <img src={user.image} style={styles.searchAvatar} alt={user.username} />
                    <span style={{ fontSize: 14, color: "#222" }}>{user.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={styles.iconBtn}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={styles.badge}>3</span>
          </div>
          <div style={styles.iconBtn}>
            <Plus size={17} color="#555" />
          </div>
        </div>

        {/* HIGHLIGHTS */}
        {highlights.length > 0 && (
          <div style={styles.highlightsRow}>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <div style={styles.addHighlight}><Plus size={20} color="#6c3fef" /></div>
              <span style={styles.hlName}>Add</span>
              <input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCreateHighlight(f); }} />
            </label>
            {highlights.map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <div style={styles.hlRing}>
                  <img src={item.image} style={styles.hlImg} alt={item.username} />
                </div>
                <span style={styles.hlName}>{item.username}</span>
              </div>
            ))}
          </div>
        )}

        {/* FEED GROUPS */}
        {grouped.map((group, gi) => {
          const totalLikes = group.feeds.reduce((a, f) => a + f.likeCount, 0);
          return (
            <div key={group.label}>

              {/* Date Header */}
              <div style={styles.dateRow}>
                <div style={styles.dateLabel}>
                  <div style={styles.dateBar} />
                  {group.label}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={styles.metaPill}>
                    <Award size={12} color="#ffb347" />
                    <span>{group.feeds.length}</span>
                  </div>
                  <div style={{ ...styles.metaPill, color: "#e8365d" }}>
                    <Heart size={12} fill="#e8365d" stroke="#e8365d" />
                    <span>{totalLikes}</span>
                    <TrendingUp size={10} stroke="#e8365d" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Feed Cards */}
              {group.feeds.map((feed) => {
                const isLiked = !!(currentUser && feed.likes.includes(String(currentUser.id)));
                return (
                  <div key={feed.id} style={styles.card}>
                    <div style={styles.cardFade} />

                    {/* Header */}
                    <div style={styles.cardHeader}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div style={styles.avRing}>
                            <img
                              src={currentUser?.image || ""}
                              style={styles.avImg}
                              alt={feed.username}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>
                          <div style={styles.onlineDot} />
                        </div>
                        <div>
                          <div style={styles.cardUname}>@{feed.username}</div>
                          <div style={styles.cardAction}>started a session:</div>
                        </div>
                      </div>
                      <button style={styles.ghostBtn}>
                        <MoreVertical size={16} color="#ccc" />
                      </button>
                    </div>

                    {/* Title */}
                    <div style={styles.cardTitle}>{feed.title}</div>

                    {/* View Session */}
                    <button style={styles.viewBtn}>View Session &rarr;</button>

                    {/* Footer */}
                    <div style={styles.cardFooter}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={styles.medalCount}>
                          <Award size={13} color="#ffb347" />
                          <span>0</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLike(feed)}
                        style={{ ...styles.likeBtn, color: isLiked ? "#e8365d" : "#ccc" }}
                      >
                        <Heart size={16} fill={isLiked ? "#e8365d" : "none"} stroke={isLiked ? "#e8365d" : "#ccc"} />
                        <span>{feed.likeCount}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Sponsored card after first group */}
              {gi === 0 && (
                <div style={styles.sponsoredCard}>
                  <div style={styles.adInner}>
                    <div style={styles.adBgText}>NEVER STOP EXPLORING</div>
                    <div style={styles.adTag}>Ad</div>
                    <div style={styles.sponsoredBadge}>Sponsored</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { 
    width: "100%", 
    minHeight: "100vh", 
    background: "#f6f6fc",
    padding: 0,
    margin: 0,
  },
  inner: { 
    maxWidth: "100%", 
    margin: 0, 
    padding: "24px 28px 60px",
    width: "100%",
  },
  pageTitle: { fontSize: 26, fontWeight: 800, color: "#6c3fef", margin: 0, letterSpacing: -0.5 },
  pageSub: { fontSize: 13, color: "#aaa", marginTop: 2 },
  topRow: { display: "flex", gap: 10, alignItems: "center", marginBottom: 20 },
  searchBox: {
    display: "flex", alignItems: "center", gap: 9,
    background: "#fff", border: "1px solid #e5e5ef", borderRadius: 10, padding: "10px 14px",
  },
  searchInput: {
    border: "none", outline: "none", fontSize: 14, color: "#222",
    background: "transparent", width: "100%", fontFamily: "inherit",
  },
  searchDrop: {
    position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0,
    background: "#fff", border: "1px solid #e5e5ef", borderRadius: 10,
    boxShadow: "0 6px 20px rgba(0,0,0,.09)", zIndex: 50,
  },
  searchItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer" },
  searchAvatar: { width: 30, height: 30, borderRadius: "50%", objectFit: "cover" },
  iconBtn: {
    width: 42, height: 42, background: "#fff", border: "1px solid #e5e5ef",
    borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0, position: "relative",
  },
  badge: {
    position: "absolute", top: -5, right: -5, background: "#e8365d", color: "#fff",
    fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "1px 5px",
    border: "2px solid #f6f6fc", minWidth: 18, textAlign: "center",
  },
  highlightsRow: {
    display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8,
    marginBottom: 18, scrollbarWidth: "none",
  },
  addHighlight: {
    width: 56, height: 56, borderRadius: "50%", background: "#f0eeff",
    border: "2px dashed #c4b5fd", display: "flex", alignItems: "center", justifyContent: "center",
  },
  hlRing: { padding: 2.5, borderRadius: "50%", background: "linear-gradient(135deg,#f9a825,#f04e6b,#6c3fef)", display: "inline-block" },
  hlImg: { width: 56, height: 56, borderRadius: "50%", border: "2px solid #fff", objectFit: "cover", display: "block" },
  hlName: { fontSize: 11, color: "#888", fontWeight: 500, maxWidth: 62, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" },
  dateRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" },
  dateLabel: { fontSize: 15, fontWeight: 700, color: "#1a1a2e", display: "flex", alignItems: "center", gap: 8 },
  dateBar: { width: 3, height: 17, background: "#6c3fef", borderRadius: 2, flexShrink: 0 },
  metaPill: {
    display: "flex", alignItems: "center", gap: 4, background: "#fff",
    border: "1px solid #e5e5ef", borderRadius: 20, padding: "4px 11px", fontSize: 12, color: "#999",
  },
  card: {
    background: "#fff", border: "1px solid #ebebf0", borderRadius: 14,
    padding: "16px 18px 14px", marginBottom: 10, position: "relative", overflow: "hidden",
  },
  cardFade: {
    position: "absolute", right: 0, top: 0, bottom: 0, width: "38%", pointerEvents: "none",
    background: "linear-gradient(to left, rgba(235,230,255,.5), transparent)",
    borderRadius: "0 14px 14px 0",
  },
  cardHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  avRing: { padding: 2, borderRadius: "50%", background: "linear-gradient(135deg,#f9a825,#f04e6b,#6c3fef)", display: "inline-block" },
  avImg: { width: 40, height: 40, borderRadius: "50%", border: "2px solid #fff", objectFit: "cover", display: "block" },
  onlineDot: { position: "absolute", bottom: 1, right: 1, width: 10, height: 10, background: "#22c55e", borderRadius: "50%", border: "2px solid #fff" },
  cardUname: { fontSize: 14, fontWeight: 700, color: "#5b2be8" },
  cardAction: { fontSize: 12, color: "#bbb", marginTop: 1 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 12 },
  viewBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, background: "#0ecfcf",
    color: "#fff", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 8,
    padding: "7px 16px", cursor: "pointer", fontFamily: "inherit", marginBottom: 14,
  },
  cardFooter: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    borderTop: "1px solid #f0f0f6", 
    paddingTop: 10 
  },
  likeBtn: { 
    display: "flex", 
    alignItems: "center", 
    gap: 5, 
    background: "none", 
    border: "none", 
    cursor: "pointer", 
    fontSize: 13, 
    fontWeight: 600, 
    fontFamily: "inherit", 
    padding: 0 
  },
  medalCount: { 
    display: "flex", 
    alignItems: "center", 
    gap: 4, 
    fontSize: 13, 
    color: "#ffb347", 
    fontWeight: 500 
  },
  ghostBtn: { background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1 },
  sponsoredCard: { background: "#fff", border: "1px solid #ebebf0", borderRadius: 14, overflow: "hidden", marginBottom: 10, position: "relative" },
  adInner: { height: 88, background: "#1c1c38", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  adBgText: { position: "absolute", fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,.07)", letterSpacing: 6, textTransform: "uppercase", whiteSpace: "nowrap", userSelect: "none" },
  adTag: { position: "absolute", top: 9, left: 12, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.4)", fontSize: 10, padding: "2px 8px", borderRadius: 4 },
  sponsoredBadge: { position: "absolute", bottom: 10, left: 12, background: "#6c3fef", color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "3px 10px" },
};