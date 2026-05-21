"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Heart,
  Plus,
  Search,
  MoreVertical,
  TrendingUp,
  Flame,
  Activity,
  Bell,
  Users,
  X,
  CalendarDays,
  FolderPlus,
  ChevronDown,
  Home,
  MessageCircle,
  Dumbbell,
} from "lucide-react";
import { feedApi, CurrentUser, Feed, HighlightGroup, HighlightItem } from "@/api/feed/route";
import { useRouter } from "next/navigation";

interface ExtendedFeed extends Feed {
  date?: string;
  activity_id?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    email: string;
    image: string;
  } | null;
  member_id?: string;
  type: string;
  description?: string | null;
  mediaUrl?: string | null;
  media_url?: string | null;
  title2?: string | null;
}

function groupByDate(
  feeds: ExtendedFeed[]
): { label: string; feeds: ExtendedFeed[] }[] {
  const map: Record<string, ExtendedFeed[]> = {};
  const order: string[] = [];

  feeds.forEach((f) => {
    const d = new Date(f.date || f.created_at || Date.now());

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label: string;

    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    if (!map[label]) {
      map[label] = [];
      order.push(label);
    }

    map[label].push(f);
  });

  return order.map((label) => ({
    label,
    feeds: map[label],
  }));
}

export default function FeedMainPage() {
  const router = useRouter();

  const [feeds, setFeeds] = useState<ExtendedFeed[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCardioPopup, setShowCardioPopup] = useState(false);
  const [showHighlightPopup, setShowHighlightPopup] =
  useState(false);
const [highlights, setHighlights] = useState<HighlightGroup[]>([]);

const [selectedGroup, setSelectedGroup] = useState<HighlightGroup | null>(null);
const [activeIndex, setActiveIndex] = useState(0);
const [showHighlightViewer, setShowHighlightViewer] = useState(false);
const [fillActive, setFillActive] = useState(false);

const SLIDE_DURATION = 5000;

useEffect(() => {
  if (!showHighlightViewer || !selectedGroup) return;

  setFillActive(false);
  const fillTimer = setTimeout(() => setFillActive(true), 50);

  const advanceTimer = setTimeout(() => {
    setActiveIndex((i) => {
      const next = i + 1;
      if (next >= selectedGroup.highlights.length) {
        setShowHighlightViewer(false);
        setSelectedGroup(null);
        return 0;
      }
      return next;
    });
  }, SLIDE_DURATION);

  return () => {
    clearTimeout(fillTimer);
    clearTimeout(advanceTimer);
  };
}, [showHighlightViewer, activeIndex, selectedGroup]);
const [highlightDescription, setHighlightDescription] =
  useState("");

const [highlightFile, setHighlightFile] =
  useState<File | null>(null);

const [creatingHighlight, setCreatingHighlight] =
  useState(false);
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [likingFeedId, setLikingFeedId] =
    useState<string | null>(null);

  const [showMyWorkoutsOnly, setShowMyWorkoutsOnly] =
    useState(false);

  const [selectedSessionFeed, setSelectedSessionFeed] =
    useState<ExtendedFeed | null>(null);

  const getSessionTypeLabel = (type: string): string => {
    switch (type) {
      case "CompleteWorkout": return "Primary Training";
      case "CompleteCardio": return "Cardio Training";
      case "CompleteSupplemental": return "Supplemental";
      case "CompleteConditioning": return "Conditioning";
      default: return type.replace("Complete", "");
    }
  };

  const formatSessionDate = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }) +
      " @ " +
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).toLowerCase()
    );
  };

  useEffect(() => {
    loadData();
  }, []);

 const mapFeeds = (rawFeeds: any[]): ExtendedFeed[] =>
  rawFeeds.map((feed) => {
    const raw = feed as any;
    return {
      ...feed,
      date: raw.date || feed.created_at,
      activity_id: raw.activity_id,
      user: raw.user,
      member_id: raw.member_id,
      type: raw.type || "activity",
      description: raw.description,
      mediaUrl: raw.mediaUrl || raw.media_url,
      media_url: raw.media_url,
      title2: raw.title2,
    };
  });

 const loadData = async () => {
  try {
    const res = await feedApi.getFeed(1);
    const rawFeeds = res.feeds || [];
    const mapped = mapFeeds(rawFeeds);
    const user = res.currectUser || (res as any).currentUser || null;

    setFeeds(mapped);
    setHasMore(rawFeeds.length === 20);
    setPage(1);
    setCurrentUser(user);
    const highlightsData = await feedApi.listHighlights(1);
    setHighlights(highlightsData);
  } catch (err) {
    console.error("Failed to load feed:", err);
  } finally {
    setLoading(false);
  }
};

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await feedApi.getFeed(nextPage);
      const rawFeeds = res.feeds || [];
      setFeeds((prev) => [...prev, ...mapFeeds(rawFeeds)]);
      setHasMore(rawFeeds.length === 20);
      setPage(nextPage);
    } catch (err) {
      console.error("Failed to load more feeds:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLike = async (feed: ExtendedFeed) => {
    if (!currentUser || !feed.id || likingFeedId === feed.id) return;

    const userId = currentUser.id;
    const isLiked = !!(feed.likes?.some((l) => Number(l) === Number(userId)));

    // Optimistic update
    setFeeds((prev) =>
      prev.map((f) =>
        f.id === feed.id
          ? {
              ...f,
              likeCount: isLiked ? f.likeCount - 1 : f.likeCount + 1,
              likes: isLiked
                ? (f.likes || []).filter((l) => Number(l) !== Number(userId))
                : [...(f.likes || []), userId],
            }
          : f
      )
    );

    setLikingFeedId(feed.id);

    try {
      if (isLiked) {
        await feedApi.unlikeFeed(feed.id);
      } else {
        await feedApi.likeFeed(feed.id);
      }
    } catch (err) {
      // Revert on failure
      setFeeds((prev) =>
        prev.map((f) =>
          f.id === feed.id
            ? {
                ...f,
                likeCount: isLiked ? f.likeCount + 1 : f.likeCount - 1,
                likes: isLiked
                  ? [...(f.likes || []), userId]
                  : (f.likes || []).filter((l) => Number(l) !== Number(userId)),
              }
            : f
        )
      );
      console.error("Failed to toggle like:", err);
    } finally {
      setLikingFeedId(null);
    }
  };

  const handleCreateHighlight = async () => {
  if (!highlightFile) {
    alert("Please upload a photo or video");
    return;
  }

  try {
    setCreatingHighlight(true);

    const formData = new FormData();

    formData.append("description", highlightDescription);
    formData.append("file", highlightFile);

    await feedApi.createHighlight(formData);

    alert("Highlight created successfully");

    setShowHighlightPopup(false);
    setHighlightDescription("");
    setHighlightFile(null);
  } catch (err) {
    console.error(err);
    alert("Failed to create highlight");
  } finally {
    setCreatingHighlight(false);
  }
};



  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">
          Loading feed...
        </div>
      </div>
    );
  }

  const q = searchQuery.toLowerCase().trim();

  const filteredFeeds = feeds.filter((feed) => {
    const matchesOwner = showMyWorkoutsOnly
      ? String(feed.member_id) === String(currentUser?.id)
      : true;

    const matchesSearch = q
      ? feed.title?.toLowerCase().includes(q) ||
        feed.user?.username?.toLowerCase().includes(q) ||
        feed.user?.name?.toLowerCase().includes(q) ||
        feed.type?.toLowerCase().includes(q)
      : true;

    return matchesOwner && matchesSearch;
  });

  const grouped = groupByDate(filteredFeeds);

  const trendingItems = [
    {
      name: "Reconditioning (Week 1) LOWER BODY",
      user: "@granada1959",
    },
    {
      name: "started a cardio session",
      user: "@ebesel",
    },
    {
      name: "Upper Body Strength Training",
      user: "@sarah_fitness",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] font-sans">
      {/* HEADER */}
   <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

    {/* HEADER ROW */}
    <div className="relative flex items-center justify-between gap-4">

      {/* CENTER LOGO */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center justify-center"
        >
          <img
            src="/images/proform-logo.jpg"
            alt="Proform Logo"
            className="w-10 h-10 object-contain rounded-xl shadow-sm"
          />
        </button>
      </div>

      {/* LEFT */}
      <div className="flex items-center gap-4 flex-1">

        {/* HOME */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Home size={18} className="text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">
            Feed
          </span>
        </div>

        {/* SEARCH */}
        <div className="relative hidden sm:block w-full max-w-sm">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feed..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        {/* TRENDING */}
        <button
          onClick={() => router.push("/feed/explore")}
          className="p-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-orange-50 hover:border-orange-200 transition-all group"
        >
          <TrendingUp
            size={18}
            className="text-orange-500 group-hover:scale-110 transition-transform"
          />
        </button>

        {/* FOLLOW PEOPLE */}
        <button
          onClick={() => router.push("/profile/components/UserList")}
          className="p-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-all group"
        >
          <Users
            size={18}
            className="text-blue-600 group-hover:scale-110 transition-transform"
          />
        </button>

        {/* NOTIFICATION */}
        <button className="relative p-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-purple-50 hover:border-purple-200 transition-all">
          <Bell
            size={18}
            className="text-purple-600"
          />

          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* CREATE */}
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
          <Plus size={16} />
        </button>
      </div>
    </div>

    {/* MOBILE SEARCH */}
    <div className="relative mt-4 sm:hidden">
      <Search
        size={17}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search feed..."
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all"
      />
    </div>
  </div>
</div>
{/* HIGHLIGHTS */}

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* FILTERS */}
    {/* HIGHLIGHTS + TOGGLE */}
<div className="mb-5 mt-4 flex items-center justify-between gap-4">

  {/* HIGHLIGHTS */}
  <div className="flex-1 overflow-x-auto scrollbar-hide">
    <div className="flex items-start gap-3 min-w-max px-1">

      {/* ADD HIGHLIGHT CIRCLE */}
      <button
        onClick={() => setShowHighlightPopup(true)}
        className="flex flex-col items-center gap-1.5 shrink-0"
      >
        <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 p-[2px] shadow-md">
          <div className="w-full h-full rounded-full bg-white p-[2px]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
              <Plus size={22} className="text-purple-600" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <p className="text-[10px] font-semibold text-gray-700 max-w-[58px] truncate text-center">
          Add
        </p>
      </button>

      {highlights.map((group) => (
        <button
          key={group.user.id}
          onClick={() => {
            setSelectedGroup(group);
            setActiveIndex(0);
            setShowHighlightViewer(true);
          }}
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div className={`w-[56px] h-[56px] rounded-full p-[2px] shadow-md ${
            !group.all_watched
              ? "bg-gradient-to-br from-pink-500 via-orange-400 to-purple-600"
              : "bg-gray-300"
          }`}>
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                {group.user.image ? (
                  <img
                    src={group.user.image}
                    alt={group.user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Flame size={16} className="text-purple-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-[10px] font-semibold text-gray-700 max-w-[58px] truncate text-center">
            {group.user.username}
          </p>
        </button>
      ))}
    </div>
  </div>

  {/* TOGGLE */}
  <div className="shrink-0 hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm">

    <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
      My Workouts
    </span>

    <button
      onClick={() =>
        setShowMyWorkoutsOnly(!showMyWorkoutsOnly)
      }
      className={`
        relative w-11 h-6 rounded-full transition-all duration-300
        ${
          showMyWorkoutsOnly
            ? "bg-gradient-to-r from-purple-600 to-indigo-600"
            : "bg-gray-300"
        }
      `}
    >
      <div
        className={`
          absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300
          ${
            showMyWorkoutsOnly
              ? "left-5"
              : "left-0.5"
          }
        `}
      />
    </button>
  </div>
</div>

        {/* FEED COUNT */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">
            {filteredFeeds.length}{hasMore ? "+" : ""} posts
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* MAIN FEED */}
          <div className="flex-1">
            {grouped.map((group) => (
              <div
                key={group.label}
                className="mb-8"
              >
                {/* DATE */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#6c3fef] rounded-full" />

                  <h3 className="text-base font-bold text-gray-800">
                    {group.label}
                  </h3>
                </div>

                {/* CARDS */}
                {group.feeds.map((feed) => {
                  const displayUser = feed.user;

                  const activityLabel =
                    feed.type === "CompleteWorkout" ? "PRIMARY" :
                    feed.type === "CompleteCardio" ? "CARDIO" :
                    feed.type === "CompleteSupplemental" ? "SUPPLEMENTAL" :
                    feed.type === "CompleteConditioning" ? "CONDITIONING" :
                    "WORKOUT";

                  const activityChipColor =
                    feed.type === "CompleteWorkout" ? "bg-blue-500" :
                    feed.type === "CompleteCardio" ? "bg-red-400" :
                    feed.type === "CompleteSupplemental" ? "bg-green-500" :
                    feed.type === "CompleteConditioning" ? "bg-yellow-400" :
                    "bg-blue-500";

                  return (
                    <div
                      key={String(feed.id)}
                      className="relative bg-white rounded-[26px] border border-[#ececf3] px-5 py-5 mb-4 overflow-hidden shadow-sm"
                    >
                      <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-[#f7f5fb] translate-x-[35%] -translate-y-[35%]" />

                      <div className="relative z-10 flex items-start gap-3">
                        {/* AVATAR */}
                        <div className="shrink-0">
                          <div className="w-[48px] h-[48px] rounded-full bg-[#8b5cf6] p-[3px] shadow-[0_4px_12px_rgba(139,92,246,0.30)]">
                            <div className="w-full h-full rounded-full bg-[#10b981] border-[2px] border-white overflow-hidden flex items-center justify-center">
                              {displayUser?.image ? (
                                <img
                                  src={displayUser.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white text-base font-bold">
                                  {(displayUser?.username || "U").charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-[14px] font-bold text-[#1da1f2] leading-none truncate">
                              @{displayUser?.username || "username"}
                            </h3>
                            <button
                              onClick={() => setShowCardioPopup(true)}
                              className="shrink-0 p-0.5"
                            >
                              <MoreVertical size={16} className="text-[#d1d5db]" />
                            </button>
                          </div>

                          <div className="mt-2">
                            <span className={`inline-flex items-center gap-1.5 ${activityChipColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}>
                              <span className="w-[4px] h-[4px] rounded-full bg-white" />
                              {activityLabel}
                            </span>
                          </div>

                          <h2 className="mt-1.5 text-[14px] font-bold text-[#111827] leading-snug break-words">
                            {feed.title || "Workout Session"}
                          </h2>

                          <button
                            onClick={() => {
                              if (feed.type === "CompleteCardio") {
                                const params = new URLSearchParams({
                                  feedId: feed.activity_id || String(feed.id),
                                  userName: feed.user?.name || "",
                                  userUsername: feed.user?.username || "",
                                  title: feed.title || "",
                                  date: feed.date || feed.created_at || "",
                                });
                                router.push(`/feed/cardio-session?${params.toString()}`);
                              } else {
                                setSelectedSessionFeed(feed);
                              }
                            }}
                            className="mt-4 h-[38px] px-4 rounded-2xl bg-[#eaf6ff] text-[#10b7f5] font-bold text-[13px] hover:opacity-90 transition flex items-center gap-1.5"
                          >
                            View/join session
                            <span>→</span>
                          </button>
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="relative z-10 mt-6">
                        <div className="inline-flex items-center overflow-hidden rounded-full border border-[#e5e7eb] bg-white shadow-sm">
                          {/* COMMENTS */}
                          <button className="flex items-center gap-2 px-5 h-[44px] text-[#374151]">
                            <span className="text-[15px] font-semibold">
                              {(feed as any)
                                .commentsCount || 0}
                            </span>
                          </button>

                          <div className="w-px h-5 bg-[#e5e7eb]" />

                          {/* LIKES */}
                          <button
                            onClick={() =>
                              handleLike(feed)
                            }
                            disabled={
                              likingFeedId ===
                              String(feed.id)
                            }
                            className="flex items-center gap-2 px-5 h-[44px] text-[#8b5cf6]"
                          >
                            <Heart
                              size={17}
                              className={
                                feed.likes?.some((l) => Number(l) === Number(currentUser?.id))
                                  ? "fill-[#8b5cf6]"
                                  : ""
                              }
                            />

                            <span className="text-[15px] font-semibold">
                              {feed.likeCount}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* EMPTY */}
            {filteredFeeds.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Activity
                  size={48}
                  className="text-gray-300 mx-auto mb-3"
                />

                <p className="text-gray-500">
                  No activities yet
                </p>

                <p className="text-sm text-gray-400">
                  Follow friends to see their workouts
                  here
                </p>
              </div>
            )}

            {/* LOAD MORE */}
            {hasMore && filteredFeeds.length > 0 && (
              <div className="flex justify-center mt-4 mb-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:w-80 space-y-6">
            {/* TRENDING */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Flame
                  size={18}
                  className="text-[#e8365d]"
                />

                <h3 className="font-bold text-gray-800">
                  Trending Today
                </h3>
              </div>

              <div className="space-y-3">
                {trendingItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl p-2 hover:bg-gray-50 transition-all"
                  >
                    {/* RANK */}
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 flex items-center justify-center shadow-[0_6px_14px_rgba(249,115,22,0.35)] border border-orange-200">
                      <span className="text-xs font-black text-white">
                        {idx + 1}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {item.user}
                      </p>
                    </div>

                    <button className="text-[#e8365d] hover:scale-110 transition-transform">
                      <Heart
                        size={16}
                        className="fill-[#e8365d]"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SUGGESTED */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 mb-3">
                Suggested Athletes
              </h3>

              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        athlete_{i}
                      </p>

                      <p className="text-xs text-gray-400">
                        1.2k followers
                      </p>
                    </div>

                    <button className="text-xs font-semibold text-white border border-[#6c3fef] px-3 py-1 rounded-full bg-[#6c3fef] transition-colors">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
{showCardioPopup && (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
    
    {/* CENTER WRAPPER */}
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
      
      {/* POPUP */}
      <div className="relative w-full max-w-[95vw] sm:max-w-2xl lg:max-w-3xl rounded-[24px] sm:rounded-[30px] bg-white border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* CLOSE */}
        <button
          onClick={() => setShowCardioPopup(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition"
        >
          <X size={15} className="text-gray-700" />
        </button>

        {/* CONTENT */}
        <div className="p-4 sm:p-6 md:p-7 pr-12 sm:pr-14">

          {/* TOP */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            {/* LEFT */}
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">

              {/* ADD */}
              <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg flex items-center justify-center shrink-0">
                <Plus size={18} className="text-white" />
              </button>

              {/* USER */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CalendarDays
                    size={14}
                    className="text-purple-500 shrink-0"
                  />

                  <p className="text-[13px] sm:text-[15px] text-gray-700 break-words">
                    <span className="font-bold">
                      Author:
                    </span>{" "}
                    komal rajpure
                  </p>
                </div>

                <p className="text-[11px] sm:text-xs text-gray-400 ml-5 sm:ml-6 truncate">
                  @komal123
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="sm:text-right">
              <div className="flex items-center gap-2 sm:justify-end">
                <Flame
                  size={17}
                  className="text-orange-500"
                />

                <p className="text-[13px] sm:text-sm font-bold text-gray-700">
                  Submit Cardio
                </p>
              </div>

              <p className="mt-1 text-[13px] sm:text-sm font-bold text-purple-600">
                Left this week: 7000
              </p>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-5 border-t border-gray-100" />

          {/* GOALS */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-black text-purple-600">
                400
              </p>

              <p className="mt-1 text-[11px] sm:text-sm font-semibold text-gray-500">
                Goal Calories
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-black text-orange-500">
                5
              </p>

              <p className="mt-1 text-[11px] sm:text-sm font-semibold text-gray-500">
                Goal Minutes
              </p>
            </div>
          </div>

          {/* SESSION BOX */}
          <div className="mt-5 rounded-[22px] sm:rounded-[24px] border border-gray-100 bg-[#fafafa] p-4 sm:p-5">

            {/* HEADER */}
            <div className="flex items-center justify-between gap-3 mb-5">

              <p className="text-[10px] sm:text-xs font-medium text-gray-400 leading-relaxed">
                Started: 5/10/2026 @ 2:23 am
              </p>

              <button className="shrink-0">
                <FolderPlus
                  size={18}
                  className="text-purple-600"
                />
              </button>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

              {/* SELECT */}
              <select
                className="h-11 sm:h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-500 outline-none focus:border-purple-500"
              >
                <option>Choose Activity</option>
              </select>

              {/* CALORIES */}
              <input
                type="number"
                placeholder="Calories"
                className="h-11 sm:h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold outline-none focus:border-purple-500"
              />

              {/* MINUTES */}
              <input
                type="number"
                placeholder="Minutes"
                className="h-11 sm:h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold outline-none focus:border-purple-500"
              />
            </div>

            {/* MESSAGE */}
            <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-[10px] sm:text-xs font-medium text-red-400 leading-relaxed">
                It should take you about 94 minutes to burn 300 calories
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* LEFT */}
            <div>
              <p className="text-sm text-gray-400">
                Remaining
              </p>

              <h3 className="text-2xl font-black text-gray-800">
                100
              </h3>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

              <button className="rounded-2xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-600 hover:bg-purple-100 transition w-full sm:w-auto">
                Duplicate
              </button>

              <button className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition w-full sm:w-auto">
                Start Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
{showHighlightPopup && (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

    <div className="relative w-full max-w-lg rounded-[30px] bg-white shadow-2xl border border-gray-100 overflow-hidden">

      {/* CLOSE */}
      <button
        onClick={() => setShowHighlightPopup(false)}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
      >
        <X size={18} className="text-gray-700" />
      </button>

      {/* HEADER */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-100">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Plus size={20} className="text-white" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900">
              Create Highlight
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Upload a photo or video highlight
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">

        {/* FILE */}
        <label className="block">

          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setHighlightFile(e.target.files[0]);
              }
            }}
          />

          <div className="border-2 border-dashed border-purple-200 bg-purple-50 rounded-3xl p-8 text-center cursor-pointer hover:bg-purple-100 transition">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
              <FolderPlus
                size={28}
                className="text-purple-600"
              />
            </div>

            <p className="text-sm font-bold text-gray-700">
              {highlightFile
                ? highlightFile.name
                : "Upload Photo or Video"}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, MP4 supported
            </p>
          </div>
        </label>

        {/* DESCRIPTION */}
        <div className="mt-5">

          <p className="text-sm font-bold text-gray-700 mb-2">
            Description
          </p>

          <textarea
            value={highlightDescription}
            onChange={(e) =>
              setHighlightDescription(e.target.value)
            }
            placeholder="Write something about your highlight..."
            rows={4}
            className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm outline-none resize-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
          />
        </div>

        {/* BUTTONS */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">

          <button
            onClick={() => setShowHighlightPopup(false)}
            className="flex-1 h-12 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateHighlight}
            disabled={creatingHighlight}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-bold text-white shadow-lg hover:scale-[1.01] transition disabled:opacity-50"
          >
            {creatingHighlight
              ? "Uploading..."
              : "Save Highlight"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
{showHighlightViewer && selectedGroup && (
  <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

    <div className="relative w-full max-w-md rounded-[32px] overflow-hidden bg-white shadow-2xl">

      {/* CLOSE */}
      <button
        onClick={() => {
          setShowHighlightViewer(false);
          setSelectedGroup(null);
          setActiveIndex(0);
        }}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
      >
        <X size={18} className="text-white" />
      </button>

      {/* PROGRESS BARS */}
      <div className="absolute top-3 left-4 right-14 z-10 flex gap-1">
        {selectedGroup.highlights.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-white/40">
            <div
              className={`h-full rounded-full bg-white transition-[width] ease-linear ${
                i < activeIndex
                  ? "w-full"
                  : i === activeIndex && fillActive
                  ? "w-full"
                  : "w-0"
              }`}
              style={i === activeIndex ? { transitionDuration: `${SLIDE_DURATION}ms` } : undefined}
            />
          </div>
        ))}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-10 p-5 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3 mt-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                {selectedGroup.user.image ? (
                  <img
                    src={selectedGroup.user.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-200" />
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              {selectedGroup.user.username}
            </p>
            <p className="text-xs text-white/70">
              {selectedGroup.highlights[activeIndex]?.created_at
                ? new Date(selectedGroup.highlights[activeIndex].created_at).toLocaleDateString()
                : ""}
            </p>
          </div>
        </div>
      </div>

      {/* MEDIA */}
      <div className="bg-black">
        {selectedGroup.highlights[activeIndex]?.uploadVideo ||
        selectedGroup.highlights[activeIndex]?.upload_video ? (
          <video
            src={
              selectedGroup.highlights[activeIndex].uploadVideo ||
              selectedGroup.highlights[activeIndex].upload_video ||
              ""
            }
            controls
            autoPlay
            className="w-full max-h-[75vh] object-cover"
          />
        ) : selectedGroup.highlights[activeIndex]?.uploadedImage ||
          selectedGroup.highlights[activeIndex]?.uploaded_image ? (
          <img
            src={
              selectedGroup.highlights[activeIndex].uploadedImage ||
              selectedGroup.highlights[activeIndex].uploaded_image ||
              ""
            }
            alt="highlight"
            className="w-full max-h-[75vh] object-cover"
          />
        ) : (
          <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
            <Flame size={60} className="text-white" />
          </div>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="p-5 bg-white">
        <p className="text-sm text-gray-700 leading-relaxed">
          {selectedGroup.highlights[activeIndex]?.description || "No description"}
        </p>
      </div>

      {/* PREV / NEXT tap zones */}
      {selectedGroup.highlights.length > 1 && (
        <div className="absolute inset-0 flex pointer-events-none" style={{ top: "60px", bottom: "80px" }}>
          <button
            className="flex-1 pointer-events-auto"
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          />
          <button
            className="flex-1 pointer-events-auto"
            onClick={() =>
              setActiveIndex((i) =>
                Math.min(selectedGroup.highlights.length - 1, i + 1)
              )
            }
          />
        </div>
      )}
    </div>
  </div>
)}
      {/* SESSION DETAIL POPUP */}
      {selectedSessionFeed && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedSessionFeed(null)}
        >
          <div
            className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP — blue banner */}
            <div className="relative h-52 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
              {selectedSessionFeed.mediaUrl || selectedSessionFeed.media_url ? (
                <img
                  src={(selectedSessionFeed.mediaUrl || selectedSessionFeed.media_url)!}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
              ) : null}

              {/* Category pill — top left */}
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-full">
                  {getSessionTypeLabel(selectedSessionFeed.type)}
                </span>
              </div>

              {/* Close — top right */}
              <button
                onClick={() => setSelectedSessionFeed(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-100 transition"
              >
                <X size={16} className="text-gray-600" />
              </button>

              {/* Watermark icon */}
              <Dumbbell size={96} className="text-white/20 rotate-[-20deg]" />
            </div>

            {/* BOTTOM — white content */}
            <div className="p-5">
              {/* User row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                  {selectedSessionFeed.user?.image ? (
                    <img
                      src={selectedSessionFeed.user.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-base">
                      {(selectedSessionFeed.user?.name || selectedSessionFeed.user?.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">
                    {selectedSessionFeed.user?.name || selectedSessionFeed.user?.username || "User"}
                  </p>
                  <p className="text-purple-500 text-xs">
                    @{selectedSessionFeed.user?.username || "user"}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 text-lg mb-3 leading-tight">
                {selectedSessionFeed.title || selectedSessionFeed.description || "Workout Session"}
              </h3>

              {/* Stats row */}
              <div className="flex items-center gap-3 text-gray-500 text-[12px] mb-5 flex-wrap">
                <div className="flex items-center gap-1">
                  <Heart size={13} className="text-gray-400" />
                  <span>0 likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={13} className="text-gray-400" />
                  <span>0 comments</span>
                </div>
                <div className="flex items-center gap-1 text-blue-500">
                  <CalendarDays size={13} />
                  <span>Week 1/ Day 1</span>
                </div>
                <div className="flex items-center gap-1 text-purple-500">
                  <Dumbbell size={13} />
                  <span>{selectedSessionFeed.title2 || "Full Body"}</span>
                </div>
              </div>

              {/* View/Join button */}
              <button
                onClick={() => {
                  if (selectedSessionFeed.type === "CompleteCardio") {
                    const params = new URLSearchParams({
                      feedId: selectedSessionFeed.activity_id || String(selectedSessionFeed.id),
                      userName: selectedSessionFeed.user?.name || "",
                      userUsername: selectedSessionFeed.user?.username || "",
                      title: selectedSessionFeed.title || "",
                      date: selectedSessionFeed.date || selectedSessionFeed.created_at || "",
                    });
                    router.push(`/feed/cardio-session?${params.toString()}`);
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl text-[15px] transition mb-3"
              >
                View/ Join session
              </button>

              {/* Workout Preview */}
              <button className="w-full text-purple-600 font-semibold text-sm text-center hover:text-purple-700 transition">
                Workout Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}