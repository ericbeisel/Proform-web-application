"use client";

import { useEffect, useState } from "react";
import { Heart, Plus, Search, MoreVertical,  Users, TrendingUp, Calendar, Share, Share2Icon,} from "lucide-react";
import { feedApi, CurrentUser, Feed } from "@/api/feed/route";
import { useRouter } from "next/navigation";

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
    if (!map[label]) {
      map[label] = [];
      order.push(label);
    }
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
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await feedApi.getFeed(1);
      setFeeds(res.feeds || []);
      setCurrentUser(res.currectUser);
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
      setSearchResults(res);
    } catch (err) { console.error(err); }
  };

  const handleLike = async (feed: Feed) => {
    if (!currentUser) return;
    const isLiked = feed.likes.includes(String(currentUser.id));
    try {
      if (isLiked) await feedApi.unlikeFeed(feed.id);
      else await feedApi.likeFeed(feed.id);
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
      <div className="w-full min-h-screen bg-[#f6f6fc] flex justify-center items-center">
        <div className="text-[#aaa] text-sm animate-pulse">Loading feed...</div>
      </div>
    );
  }

  const grouped = groupByDate(feeds);

  return (
    <div className="w-full min-h-screen bg-[#f6f6fc]">
      <div className="max-w-full mx-auto px-7 pt-6 pb-16 w-full">
        
        {/* PAGE TITLE */}
        <div className="mb-5">
          <h1 className="text-[26px] font-extrabold text-[#6c3fef] m-0 tracking-tight">Activity Feed</h1>
          <p className="text-[13px] text-[#aaa] mt-0.5">See what your friends are up to</p>
        </div>

        {/* TOP ROW: Search + Buttons */}
   {/* TOP ROW: Search Bar + Action Buttons + New Search Icon */}
<div className="flex items-center gap-2.5 mb-5">
  
  {/* EXISTING SEARCH BAR (Kept exactly as is) */}
  <div className="flex-1 relative">
    <div className="flex items-center gap-[9px] bg-white border border-[#e5e5ef] rounded-[10px] px-3.4 py-2.5">
      <Search size={16} className="text-[#bbb]" />
      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search users by name or username..."
        className="border-none outline-none text-sm text-[#222] bg-transparent w-full font-inherit"
      />
    </div>
    {searchResults.length > 0 && (
      <div className="absolute top-[calc(100%+5px)] left-0 right-0 bg-white border border-[#e5e5ef] rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,.09)] z-50">
        {searchResults.map((user) => (
          <div key={user.id} className="flex items-center gap-2.5 px-3.5 py-[9px] cursor-pointer hover:bg-gray-50">
            <img src={user.image} className="w-[30px] h-[30px] rounded-full object-cover" alt={user.username} />
            <span className="text-sm text-[#222]">{user.username}</span>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* CALENDAR BUTTON */}
  <div onClick={() => router.push("/checklist")} className="w-[42px] h-[42px] bg-white border border-[#e5e5ef] rounded-[10px] flex items-center justify-center cursor-pointer relative flex-shrink-0 hover:bg-gray-50 transition-colors">
    <svg  width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
    <span className="absolute -top-1.25 -right-1.25 bg-[#e8365d] text-white text-[9px] font-bold rounded-full px-1.25 py-0.25 border-2 border-[#f6f6fc] min-w-[18px] text-center">
      3
    </span>
  </div>

  {/* PLUS BUTTON */}
  <div className="w-[42px] h-[42px] bg-white border border-[#e5e5ef] rounded-[10px] flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-gray-50 transition-colors">
    <Plus  size={17} className="text-[#555]" />
  </div>

  {/* NEW STANDALONE SEARCH ICON (Most Right) */}
  <div className="w-[42px] h-[42px] bg-white border border-[#e5e5ef] rounded-[10px] flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-gray-50 transition-colors">
    <Search  onClick={() => router.push("/profile/components/UserList")} size={17} className="text-[#555]" />
  </div>

</div>

        {/* HIGHLIGHTS */}
        {highlights.length > 0 && (
          <div className="flex gap-3.5 overflow-x-auto pb-2 mb-4.5 no-scrollbar">
            <label className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-[#f0eeff] border-2 border-dashed border-[#c4b5fd] flex items-center justify-center">
                <Plus size={20} className="text-[#6c3fef]" />
              </div>
              <span className="text-[11px] text-[#888] font-medium">Add</span>
              <input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCreateHighlight(f); }} />
            </label>
            {highlights.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="p-[2.5px] rounded-full bg-gradient-to-br from-[#f9a825] via-[#f04e6b] to-[#6c3fef]">
                  <img src={item.image} className="w-14 h-14 rounded-full border-2 border-white object-cover block" alt={item.username} />
                </div>
                <span className="text-[11px] text-[#888] font-medium max-w-[62px] truncate">{item.username}</span>
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
              <div className="flex items-center justify-between py-2.5">
                <div className="text-[15px] font-bold text-[#1a1a2e] flex items-center gap-2">
                  <div className="w-[3px] h-[17px] bg-[#6c3fef] rounded-sm flex-shrink-0" />
                  {group.label}
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-1 bg-white border border-[#e5e5ef] rounded-full px-[11px] py-1 text-xs text-[#999]">
                    <Users size={12} className="text-[#ffb347]" />
                    <span>{group.feeds.length}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-[#e5e5ef] rounded-full px-[11px] py-1 text-xs text-[#e8365d]">
                    <Heart size={12} className="fill-[#e8365d] stroke-[#e8365d]" />
                    <span>{totalLikes}</span>
                    <TrendingUp size={10} strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Feed Cards */}
              {group.feeds.map((feed) => {
                const isLiked = !!(currentUser && feed.likes.includes(String(currentUser.id)));
                return (
                  <div key={feed.id} className="bg-white border border-[#ebebf0] rounded-[14px] p-[16px_18px_14px] mb-2.5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-[38%] pointer-events-none bg-gradient-to-l from-[rgba(235,230,255,0.5)] to-transparent rounded-r-[14px]" />

                    <div className="flex items-start justify-between mb-2.5 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex-shrink-0">
                          <div className="p-0.5 rounded-full bg-gradient-to-br from-[#f9a825] via-[#f04e6b] to-[#6c3fef]">
                            <img
                              src={currentUser?.image || ""}
                              className="w-10 h-10 rounded-full border-2 border-white object-cover"
                              alt={feed.username}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>
                          <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#5b2be8]">@{feed.username}</div>
                          <div className="text-[12px] text-[#bbb] mt-px">started a session:</div>
                        </div>
                      </div>
               <button className="cursor-pointer"
  onClick={() => {
    // We create a specific link for THIS session
    const sessionUrl = `${window.location.origin}/sessions/${feed.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${feed.username}'s Session`,
        text: `Check out this session: ${feed.title}`,
        url: sessionUrl, // Now shares the specific session link
      }).catch(() => {}); 
    } else {
      navigator.clipboard.writeText(sessionUrl);
      alert("Session link copied to clipboard!");
    }
  }} 
>
  <Share2Icon size={18} />
</button>
                    </div>

                    <div className="text-sm font-bold text-[#1a1a2e] mb-3 relative z-10">{feed.title}</div>

                    <button className="inline-flex items-center gap-1.5 bg-[#0ecfcf] text-white text-[13px] font-semibold rounded-lg px-4 py-[7px] mb-3.5 hover:opacity-90 transition-opacity relative z-10">
                      View Session &rarr;
                    </button>

                    <div className="flex items-center justify-between border-top border-[#f0f0f6] pt-2.5">
                      <div className="flex items-center gap-1 text-[13px] text-[#ffb347] font-medium">
                        <Users size={13} />
                        <span>0</span>
                      </div>
                      <button
                        onClick={() => handleLike(feed)}
                        className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${isLiked ? "text-[#e8365d]" : "text-[#ccc]"}`}
                      >
                        <Heart size={16} className={isLiked ? "fill-[#e8365d]" : ""} />
                        <span>{feed.likeCount}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Sponsored card after first group */}
              {gi === 0 && (
                <div className="bg-white border border-[#ebebf0] rounded-[14px] overflow-hidden mb-2.5 relative">
                  <div className="h-[88px] bg-[#1c1c38] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute text-sm font-black text-white/5 tracking-[6px] uppercase whitespace-nowrap select-none">
                      NEVER STOP EXPLORING
                    </div>
                    <div className="absolute top-[9px] left-3 bg-white/10 text-white/40 text-[10px] px-2 py-0.5 rounded">Ad</div>
                    <div className="absolute bottom-[10px] left-3 bg-[#6c3fef] text-white text-[11px] font-bold rounded-md px-2.5 py-0.5">
                      Sponsored
                    </div>
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