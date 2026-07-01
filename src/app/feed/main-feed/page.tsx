"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Heart,
  Plus,
  Search,
  MoreVertical,
  TrendingUp,
  Flame,
  Bell,
  Users,
  X,
  CalendarDays,
  FolderPlus,
  Home,
  MessageCircle,
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  Settings,
} from "lucide-react";
import { feedApi, CurrentUser, Feed, HighlightGroup, Advertisement } from "@/api/feed/route";
import { getTodayActivities } from "@/api/checklist/route";
import { getWorkoutSessionById, getWorkoutStats, getPowerSetLogs, getTrackingLogs, generateSessionShareLink, WorkoutStats, PowerSetLog, TrackingLog } from "@/api/workouts/route";
import FeedComments from "@/components/FeedComments";
import { useRouter } from "next/navigation";
import UploadHighlightModal from "./UploadHighlightModal";

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

function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 21) return "2 weeks ago";
  if (diffDays < 28) return "3 weeks ago";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function groupByDate(
  feeds: ExtendedFeed[]
): { label: string; feeds: ExtendedFeed[] }[] {
  const map: Record<string, ExtendedFeed[]> = {};
  const order: string[] = [];

  feeds.forEach((f) => {
    const d = new Date(f.date || f.created_at || Date.now());
    const label = getDateLabel(d);

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

  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");

  const [feedFilters, setFeedFilters] = useState<Record<string, boolean>>({
    Workouts: true, CardioSessions: true, Recovery: true, Hydration: true, Nutrition: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("feedActivityFilters");
      if (saved) setFeedFilters(JSON.parse(saved));
    } catch {}
  }, []);

  // For You tab state
  const [feeds, setFeeds] = useState<ExtendedFeed[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Following tab state
  const [followingFeeds, setFollowingFeeds] = useState<ExtendedFeed[]>([]);
  const [followingPage, setFollowingPage] = useState(1);
  const [followingHasMore, setFollowingHasMore] = useState(true);
  const [followingLoaded, setFollowingLoaded] = useState(false);
  const [followingLoadingMore, setFollowingLoadingMore] = useState(false);
  const [showCardioPopup, setShowCardioPopup] = useState(false);
  const [showHighlightPopup, setShowHighlightPopup] =
  useState(false);
const [highlights, setHighlights] = useState<HighlightGroup[]>([]);

const [selectedGroup, setSelectedGroup] = useState<HighlightGroup | null>(null);
const [activeIndex, setActiveIndex] = useState(0);
const [showHighlightViewer, setShowHighlightViewer] = useState(false);
const [fillActive, setFillActive] = useState(false);
const [highlightPaused, setHighlightPaused] = useState(false);

const SLIDE_DURATION = 5000;

useEffect(() => {
  if (!showHighlightViewer || !selectedGroup || highlightPaused) return;

  const currentHighlight = selectedGroup.highlights[activeIndex];
  if (currentHighlight && !currentHighlight.is_viewed) {
    feedApi.markHighlightWatched(currentHighlight.id);
  }

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
}, [showHighlightViewer, activeIndex, selectedGroup, highlightPaused]);
const [highlightDescription, setHighlightDescription] =
  useState("");

const [highlightFile, setHighlightFile] =
  useState<File | null>(null);

const [creatingHighlight, setCreatingHighlight] =
  useState(false);
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const [likingFeedId, setLikingFeedId] =
    useState<string | null>(null);

  const [showMyWorkoutsOnly, setShowMyWorkoutsOnly] =
    useState(false);

  const [selectedSessionFeed, setSelectedSessionFeed] =
    useState<ExtendedFeed | null>(null);
  const [sessionProgramImage, setSessionProgramImage] = useState<string | null>(null);
  const [sessionWorkoutCategory, setSessionWorkoutCategory] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<import("@/api/workouts/route").WorkoutSession | null>(null);
  const [popupWorkoutStats, setPopupWorkoutStats] = useState<WorkoutStats | null>(null);
  const [popupPowerSetLogs, setPopupPowerSetLogs] = useState<PowerSetLog[]>([]);
  const [popupTrackingLogs, setPopupTrackingLogs] = useState<TrackingLog[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [shareSessionFeed, setShareSessionFeed] = useState<ExtendedFeed | null>(null);
  const [sessionLinkCopied, setSessionLinkCopied] = useState(false);
  const [shareLinkUrl, setShareLinkUrl] = useState<string | null>(null);
  const [shareLinkLoading, setShareLinkLoading] = useState(false);
  const [inProgressCardioFeed, setInProgressCardioFeed] = useState<ExtendedFeed | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!selectedSessionFeed) {
      setSessionProgramImage(null);
      setSessionWorkoutCategory(null);
      setSessionData(null);
      setPopupWorkoutStats(null);
      setPopupPowerSetLogs([]);
      setPopupTrackingLogs([]);
      return;
    }
    const activityId = selectedSessionFeed.activity_id;
    if (!activityId) return;
    getWorkoutSessionById(activityId)
      .then((session) => {
        setSessionProgramImage(session.workoutImage || null);
        setSessionWorkoutCategory(session.workoutCategory || null);
        setSessionData(session);
      })
      .catch(() => {
        setSessionProgramImage(null);
        setSessionWorkoutCategory(null);
        setSessionData(null);
      });

    const isCompleted = selectedSessionFeed.type?.includes("Complete");
    if (isCompleted) {
      getWorkoutStats(activityId).then(setPopupWorkoutStats).catch(() => setPopupWorkoutStats(null));
      getPowerSetLogs(activityId).then(setPopupPowerSetLogs).catch(() => setPopupPowerSetLogs([]));
      getTrackingLogs({ sessionId: activityId }).then(setPopupTrackingLogs).catch(() => setPopupTrackingLogs([]));
    }
  }, [selectedSessionFeed]);

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

  useEffect(() => {
    if (ads.length === 0) return;
    const timer = setInterval(() => {
      setAdIndex((i) => (i + 1) % ads.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [ads]);


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
    console.log("[Feed] raw types:", rawFeeds.map((f: any) => f.type));
    const mapped = mapFeeds(rawFeeds);
    const user = res.currectUser || (res as any).currentUser || null;

    setFeeds(mapped);
    setHasMore(rawFeeds.length === 20);
    setPage(1);
    setCurrentUser(user);
    const highlightsData = await feedApi.listHighlights(1);
    setHighlights(highlightsData);
    const allAds = await feedApi.getAdvertisements();
    const shuffled = [...allAds].sort(() => Math.random() - 0.5).slice(0, 4);
    setAds(shuffled);

    try {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const checklistRes = await getTodayActivities(today);
      const pending = (checklistRes.activities || []).filter((a) => !a.completed).length;
      setPendingCount(pending);
    } catch {
      // badge stays 0 if checklist fails
    }
  } catch (err) {
    console.error("Failed to load feed:", err);
  } finally {
    setLoading(false);
  }
};

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await feedApi.getFeed(nextPage, "forYou");
      const rawFeeds = res.feeds || [];
      setFeeds((prev) => [...prev, ...mapFeeds(rawFeeds)]);
      setHasMore(rawFeeds.length === 20);
      setPage(nextPage);
    } catch (err) {
      console.error("Failed to load more feeds:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page]);

  const loadFollowing = async () => {
    try {
      const res = await feedApi.getFeed(1, "following");
      const rawFeeds = res.feeds || [];
      setFollowingFeeds(mapFeeds(rawFeeds));
      setFollowingHasMore(rawFeeds.length === 20);
      setFollowingPage(1);
      setFollowingLoaded(true);
    } catch (err) {
      console.error("Failed to load following feed:", err);
      setFollowingLoaded(true);
    }
  };

  const loadMoreFollowing = useCallback(async () => {
    if (followingLoadingMore || !followingHasMore) return;
    setFollowingLoadingMore(true);
    try {
      const nextPage = followingPage + 1;
      const res = await feedApi.getFeed(nextPage, "following");
      const rawFeeds = res.feeds || [];
      setFollowingFeeds((prev) => [...prev, ...mapFeeds(rawFeeds)]);
      setFollowingHasMore(rawFeeds.length === 20);
      setFollowingPage(nextPage);
    } catch (err) {
      console.error("Failed to load more following feeds:", err);
    } finally {
      setFollowingLoadingMore(false);
    }
  }, [followingLoadingMore, followingHasMore, followingPage]);

  const handleTabSwitch = (tab: "forYou" | "following") => {
    setActiveTab(tab);
    if (tab === "following" && !followingLoaded) {
      loadFollowing();
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
    formData.append("image", highlightFile);

    await feedApi.createHighlight(formData);

    setShowHighlightPopup(false);
    setHighlightDescription("");
    setHighlightFile(null);

    const refreshed = await feedApi.listHighlights(1);
    setHighlights(refreshed);
  } catch (err) {
    console.error(err);
    alert("Failed to create highlight");
  } finally {
    setCreatingHighlight(false);
  }
};



  const activeLoadMore = useCallback(() => {
    if (activeTab === "following") loadMoreFollowing();
    else loadMore();
  }, [activeTab, loadMore, loadMoreFollowing]);

  useEffect(() => {
    if (loading) return;
    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled >= total - 500) activeLoadMore();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeLoadMore, loading]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">
          Loading feed...
        </div>
      </div>
    );
  }

  const activeFeedList = activeTab === "following" ? followingFeeds : feeds;
  const activeHasMore = activeTab === "following" ? followingHasMore : hasMore;
  const activeLoadingMore = activeTab === "following" ? followingLoadingMore : loadingMore;

  const typeToFilterKey = (type: string): string => {
    if (type.toLowerCase().includes("cardio")) return "CardioSessions";
    if (type.toLowerCase().includes("recovery")) return "Recovery";
    if (type.toLowerCase().includes("hydration")) return "Hydration";
    if (type.toLowerCase().includes("nutrition")) return "Nutrition";
    return "Workouts";
  };

  const filteredFeeds = activeFeedList.filter((feed) => {
    const matchesOwner = showMyWorkoutsOnly
      ? String(feed.member_id) === String(currentUser?.id)
      : true;

    const filterKey = typeToFilterKey(feed.type || "");
    const matchesFilter = feedFilters[filterKey] !== false;

    return matchesOwner && matchesFilter;
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
          onClick={() => router.push("/feed/main-feed")}
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

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        {/* CALENDAR / TODAY'S CHECKLIST */}
        <button
          onClick={() => router.push("/checklist")}
          className="relative p-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-green-50 hover:border-green-200 transition-all group"
          title="Today's Checklist"
        >
          <CalendarDays size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </button>

        {/* SEARCH */}
        <button
          onClick={() => router.push("/profile/components/UserList")}
          className="p-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-purple-50 hover:border-purple-200 transition-all group"
        >
          <Search size={18} className="text-gray-500 group-hover:scale-110 transition-transform" />
        </button>

        {/* TRENDING */}
        <button
          onClick={() => router.push("/feed/main-feed")}
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

        {/* SETTINGS */}
        <button
          onClick={() => router.push("/feed/settings")}
          className="p-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all group"
          title="Feed Settings"
        >
          <Settings size={18} className="text-gray-500 group-hover:scale-110 transition-transform" />
        </button>

        {/* NOTIFICATION */}
        <button className="relative p-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-purple-50 hover:border-purple-200 transition-all">
          <Bell size={18} className="text-purple-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* CREATE */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <Plus size={16} />
        </button>

        {/* USER AVATAR */}
        <button
          onClick={() => router.push("/profile")}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200 shadow-sm hover:border-purple-400 transition-all shrink-0"
          title="My Profile"
        >
          {currentUser?.image ? (
            <img src={currentUser.image} alt="profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {(currentUser?.username || currentUser?.name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </button>
      </div>
    </div>

  </div>
</div>
{/* HIGHLIGHTS */}

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* TAB BAR */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1 w-fit mb-5">
          {(["forYou", "following"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "forYou" ? "For You" : "Following"}
            </button>
          ))}
        </div>

        {/* HIGHLIGHTS + TOGGLE */}
<div className="mb-5 mt-4 flex items-center justify-between gap-4">

  {/* HIGHLIGHTS */}
  <div className="flex-1 overflow-x-auto scrollbar-hide">
    <div className="flex items-start gap-3 min-w-max px-1">

      {/* ADD HIGHLIGHT CIRCLE — current user avatar + badge */}
      <button
        onClick={() => setShowHighlightPopup(true)}
        className="flex flex-col items-center gap-1.5 shrink-0"
      >
        <div className="relative w-[56px] h-[56px]">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 p-[2px] shadow-md">
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                {currentUser?.image ? (
                  <img src={currentUser.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-purple-600 text-base font-bold">
                    {(currentUser?.username || currentUser?.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center">
            <Plus size={10} className="text-white" strokeWidth={3} />
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
                {group.feeds.map((feed, feedIdx) => {
                  const displayUser = feed.user;

                  const isCompleted = feed.type?.includes("Complete");

                  const isNutrition = feed.type?.toLowerCase().includes("nutrition");

                  const activityLabel =
                    feed.type === "CompleteWorkout" ? "PRIMARY" :
                    feed.type === "CompleteCardio" ? "CARDIO" :
                    feed.type === "CompleteSupplemental" ? "SUPPLEMENTAL" :
                    feed.type === "CompleteConditioning" ? "CONDITIONING" :
                    feed.type === "CompleteRecovery" ? "RECOVERY" :
                    feed.type === "CompleteHydration" ? "HYDRATION" :
                    isNutrition ? "NUTRITION" :
                    "SESSION";

                  const activityChipColor =
                    feed.type === "CompleteWorkout" ? "bg-blue-500" :
                    feed.type === "CompleteCardio" ? "bg-red-400" :
                    feed.type === "CompleteSupplemental" ? "bg-green-500" :
                    feed.type === "CompleteConditioning" ? "bg-yellow-400" :
                    feed.type === "CompleteRecovery" ? "bg-purple-500" :
                    feed.type === "CompleteHydration" ? "bg-teal-500" :
                    isNutrition ? "bg-green-600" :
                    "bg-blue-500";

                  const actionLabel =
                    feed.type === "CompleteWorkout" ? "View Result" :
                    (feed.type === "CompleteCardio" || feed.type === "CompleteHydration" || feed.type === "CompleteRecovery" || isNutrition) ? "View Details" :
                    "View Session";

                  const card = (
                    <div
                      key={String(feed.id)}
                      className="relative bg-white rounded-[26px] border border-[#ececf3] px-5 py-5 mb-4 overflow-hidden shadow-sm"
                    >
                      <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-[#f7f5fb] translate-x-[35%] -translate-y-[35%]" />

                      <div className="relative z-10">
                        {/* TOP ROW: avatar | username + chip | 3-dot */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => displayUser?.id && router.push(`/player-card/${displayUser.id}`)}
                            className="shrink-0 cursor-pointer"
                          >
                            <div className="w-[42px] h-[42px] rounded-full p-[2px] shadow-sm" style={{background: "linear-gradient(135deg,#8b5cf6,#6366f1)"}}>
                              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                {displayUser?.image ? (
                                  <img src={displayUser.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-white text-sm font-bold bg-gradient-to-br from-purple-500 to-indigo-500 w-full h-full flex items-center justify-center">
                                    {(displayUser?.username || "U").charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>

                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <button
                              onClick={() => displayUser?.username && router.push(`/profile/${encodeURIComponent(displayUser.username)}`)}
                              className="text-[13px] font-bold text-[#6c3fef] hover:underline truncate cursor-pointer"
                            >
                              @{displayUser?.username || "username"}
                            </button>
                            <span className={`shrink-0 inline-flex items-center gap-1.5 ${activityChipColor} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                              <span className="w-[4px] h-[4px] rounded-full bg-white/80" />
                              {activityLabel}
                            </span>
                          </div>

                          <button
                            onClick={() => setShareSessionFeed(feed)}
                            className="shrink-0 p-1 rounded-lg hover:bg-gray-100 transition"
                          >
                            <MoreVertical size={15} className="text-gray-300" />
                          </button>
                        </div>

                        {/* TITLE */}
                        <p className="mt-3 ml-[54px] text-[13.5px] font-semibold text-gray-800 leading-snug">
                          {feed.title || "Workout Session"}
                        </p>

                        {/* ACTION */}
                        <div className="mt-3 ml-[54px]">
                          <button
                            onClick={() => {
                              const p = new URLSearchParams({
                                feedId: feed.activity_id || String(feed.id),
                                userName: feed.user?.name || "",
                                userUsername: feed.user?.username || "",
                                title: feed.title || "",
                                date: feed.date || feed.created_at || "",
                                likeCount: String(feed.likeCount || 0),
                              });
                              if (feed.type === "CompleteCardio") {
                                router.push(`/feed/cardio-session?${p.toString()}`);
                              } else if (feed.type === "CompleteRecovery") {
                                router.push(`/feed/recovery-details?${p.toString()}`);
                              } else if (feed.type === "CompleteHydration") {
                                const oz = (feed as any).oz_number || "";
                                if (oz) p.set("oz", String(oz));
                                router.push(`/feed/hydration-details?${p.toString()}`);
                              } else if (isNutrition && feed.type?.includes("Complete")) {
                                const calories = (feed as any).calories || "";
                                const protein = (feed as any).protein || "";
                                if (calories) p.set("calories", String(calories));
                                if (protein) p.set("protein", String(protein));
                                router.push(`/feed/nutrition-details?${p.toString()}`);
                              } else if (!feed.type?.includes("Complete") && feed.type?.toLowerCase().includes("cardio")) {
                                setInProgressCardioFeed(feed);
                              } else {
                                setSelectedSessionFeed(feed);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#6c3fef] bg-purple-50 hover:bg-purple-100 border border-purple-100 px-4 py-2 rounded-xl transition"
                          >
                            {actionLabel} <span className="text-[11px]">→</span>
                          </button>
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="relative z-10 mt-6 flex items-center justify-between">
                        <div className="inline-flex items-center overflow-hidden rounded-full border border-[#e5e7eb] bg-white shadow-sm">
                          {/* COMMENTS — only for completed */}
                          {isCompleted && (
                            <>
                              <button className="flex items-center gap-2 px-5 h-[44px] text-[#374151]">
                                <span className="text-[15px] font-semibold">
                                  {feed.commentsCount ?? feed.commentCount ?? 0}
                                </span>
                              </button>
                              <div className="w-px h-5 bg-[#e5e7eb]" />
                            </>
                          )}

                          {/* LIKES */}
                          <button
                            onClick={() => handleLike(feed)}
                            disabled={likingFeedId === String(feed.id)}
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

                        {/* PEOPLE COUNT — hidden for Hydration and Recovery */}
                        {feed.type !== "CompleteHydration" && feed.type !== "CompleteRecovery" && (
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Users size={14} />
                            <span className="text-[13px] font-semibold">{feed.joined_count ?? 0}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  return (
                    <div key={String(feed.id)}>
                      {card}
                      {(feedIdx + 1) % 3 === 0 && ads.length > 0 && (
                        <button
                          onClick={() => setSelectedAd(ads[adIndex])}
                          className="block w-full relative rounded-[26px] overflow-hidden mb-4 shadow-sm border border-[#ececf3] bg-black text-left"
                        >
                          <img
                            src={ads[adIndex].image}
                            alt="advertisement"
                            className="w-full h-44 object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                            Sponsored
                          </span>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {ads.map((_, i) => (
                              <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${i === adIndex ? "bg-white w-3" : "bg-white/50 w-1.5"}`}
                              />
                            ))}
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* EMPTY */}
            {filteredFeeds.length === 0 && (() => {
              const rawCount = activeFeedList.length;
              const isFiltered = rawCount > 0;
              return (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <Dumbbell size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">
                    {isFiltered ? "All activity types hidden" : "No activities yet"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {isFiltered ? (
                      <>
                        Your filters are hiding everything.{" "}
                        <button
                          onClick={() => router.push("/feed/settings")}
                          className="text-purple-500 underline"
                        >
                          Go to settings
                        </button>{" "}
                        to re-enable.
                      </>
                    ) : (
                      "Follow friends to see their workouts here"
                    )}
                  </p>
                </div>
              );
            })()}

            {/* FOLLOWING TAB — loading skeleton */}
            {activeTab === "following" && !followingLoaded && (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            )}

            {/* INFINITE SCROLL INDICATOR */}
            {activeHasMore && activeLoadingMore && (
              <div className="flex justify-center py-6">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:w-80 space-y-6 mt-9 sticky top-[84px] self-start">
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
{/* showCardioPopup popup removed — dead code with hardcoded dummy data */}
{false && (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
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
            className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
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
          setHighlightPaused(false);
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
              className={`h-full rounded-full bg-white ${
                i === activeIndex
                  ? "transition-[width] ease-linear"
                  : "transition-none"
              } ${
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

      {/* MEDIA + OVERLAY */}
      <div
        className="relative bg-black cursor-pointer select-none"
        onClick={() => setHighlightPaused(p => !p)}
      >
        {selectedGroup.highlights[activeIndex]?.uploadVideo ||
        selectedGroup.highlights[activeIndex]?.upload_video ? (
          <video
            src={
              selectedGroup.highlights[activeIndex].uploadVideo ||
              selectedGroup.highlights[activeIndex].upload_video ||
              ""
            }
            autoPlay
            muted
            playsInline
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

        {/* Pause indicator */}
        {highlightPaused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-6 bg-white rounded-full" />
                <div className="w-1.5 h-6 bg-white rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Description overlay */}
        {selectedGroup.highlights[activeIndex]?.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 py-5 pointer-events-none">
            <p className="text-[13px] font-medium text-white leading-relaxed line-clamp-3">
              {selectedGroup.highlights[activeIndex].description}
            </p>
          </div>
        )}
      </div>

      {/* PREV / NEXT tap zones */}
      {selectedGroup.highlights.length > 1 && (
        <div className="absolute inset-0 flex pointer-events-none" style={{ top: "60px", bottom: "0px" }}>
          <button
            className="flex-1 pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); setHighlightPaused(false); setActiveIndex((i) => Math.max(0, i - 1)); }}
          />
          <button
            className="flex-1 pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); setHighlightPaused(false); setActiveIndex((i) => Math.min(selectedGroup.highlights.length - 1, i + 1)); }}
          />
        </div>
      )}
    </div>
  </div>
)}
      {/* AD DETAIL POPUP */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setSelectedAd(null); setLinkCopied(false); }}
        >
          <div
            className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => { setSelectedAd(null); setLinkCopied(false); }}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            >
              <X size={14} className="text-gray-600" />
            </button>

            <div className="p-5">
              <p className="font-bold text-gray-800 text-sm mb-3">Ad Details:</p>

              {/* Image */}
              <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100 h-44">
                <img src={selectedAd.image} alt="ad" className="w-full h-full object-cover" />
              </div>

              {/* Link row */}
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-yellow-300 text-gray-800 text-[11px] font-bold px-2 py-0.5 rounded">Link :</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAd.link);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="text-blue-500 text-[12px] underline truncate max-w-[180px] text-left"
                >
                  {selectedAd.link}
                </button>
                {linkCopied && (
                  <span className="text-[10px] text-green-600 font-semibold shrink-0">Copied!</span>
                )}
              </div>

              {/* Redirect */}
              <button
                onClick={() => window.open(selectedAd.link, "_blank", "noopener,noreferrer")}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl text-[14px] transition mb-3"
              >
                Redirect
              </button>

              {/* Go Ad-Free */}
              <p className="text-center text-[12px] font-semibold text-gray-700 mb-3">
                Go Ad-Free and Get 2x Points
              </p>

              <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 rounded-2xl text-[13px] transition flex items-center justify-center gap-1">
                Only $8.95/mo →
              </button>
            </div>
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
            {/* TOP — image banner */}
            <div className="relative h-52 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
              {(() => {
                const imgSrc = sessionProgramImage;
                return imgSrc ? (
                  <>
                    <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/30" />
                  </>
                ) : (
                  <Dumbbell size={96} className="text-white/20 rotate-[-20deg]" />
                );
              })()}

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
            {(() => {
              const isCompleted = selectedSessionFeed.type?.includes("Complete");
              const stripPrefix = (val: string | number | undefined, prefix: string) => {
                const s = String(val ?? "");
                return s.toLowerCase().startsWith(prefix.toLowerCase()) ? s : `${prefix} ${s}`;
              };
              const weekDay = sessionData?.week && sessionData?.day
                ? `${stripPrefix(sessionData.week, "Week")} / ${stripPrefix(sessionData.day, "Day")}`
                : "Single Session";
              return (
                <div className="p-5 overflow-y-auto max-h-[55vh]">
                  {/* Session Details header */}
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Session Details</p>

                  {/* User row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                      {selectedSessionFeed.user?.image ? (
                        <img src={selectedSessionFeed.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-base">
                          {(selectedSessionFeed.user?.name || selectedSessionFeed.user?.username || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">
                        {selectedSessionFeed.user?.name || selectedSessionFeed.user?.username || "User"}
                      </p>
                      <button
                        onClick={() => selectedSessionFeed.user?.username && router.push(`/profile/${encodeURIComponent(selectedSessionFeed.user.username)}`)}
                        className="text-purple-500 text-xs hover:underline cursor-pointer"
                      >
                        @{selectedSessionFeed.user?.username || "user"}
                      </button>
                    </div>
                    {isCompleted && (
                      <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={13} />
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-lg mb-3 leading-tight">
                    {selectedSessionFeed.title || selectedSessionFeed.description || "Workout Session"}
                  </h3>

                  {/* Participants */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {sessionData?.participants && sessionData.participants.length > 0 ? (
                        sessionData.participants.slice(0, 4).map((p, i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-purple-200 flex items-center justify-center -ml-2 first:ml-0 shadow-sm">
                            {p.image ? (
                              <img src={p.image} alt={p.name || ""} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] font-bold text-purple-700">{(p.name || p.username || "?").charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center shadow-sm">
                          <Users size={12} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <span className="text-[12px] font-semibold text-gray-500">{sessionData?.joinedCount ?? 0} joined</span>
                  </div>

                  {/* Info row: week/day pill + people count */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
                      {weekDay}
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Users size={14} />
                      <span className="text-[12px] font-semibold">{sessionData?.joinedCount ?? 0}</span>
                    </div>
                  </div>

                  {/* Date box */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-3 border border-gray-100">
                    <CalendarDays size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-[12px] text-gray-500 font-medium">
                      {formatSessionDate(selectedSessionFeed.date || selectedSessionFeed.created_at)}
                    </span>
                  </div>

                  {/* Category + type tags */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="flex items-center gap-1 text-purple-500 text-[11px] font-semibold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                      <Dumbbell size={11} />
                      {sessionWorkoutCategory || selectedSessionFeed.title2 || ""}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400 text-[11px] bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      <Heart size={11} />
                      {selectedSessionFeed.likeCount ?? 0} likes
                    </span>
                    <span className="flex items-center gap-1 text-gray-400 text-[11px] bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      <MessageCircle size={11} />
                      {selectedSessionFeed.commentsCount ?? selectedSessionFeed.commentCount ?? 0} comments
                    </span>
                  </div>

                  {/* Results section */}
                  {isCompleted && popupWorkoutStats?.thisWorkout && (
                    <div className="mb-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Results</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Load", value: popupWorkoutStats.thisWorkout.load },
                          { label: "Power", value: popupWorkoutStats.thisWorkout.power },
                          { label: "Kcal", value: popupWorkoutStats.thisWorkout.cals },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-gray-50 rounded-2xl py-3 text-center border border-gray-100">
                            <p className="text-[20px] font-extrabold text-gray-900">{value ?? "—"}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Load chart (simple CSS bars) */}
                  {isCompleted && popupWorkoutStats?.loadChart && popupWorkoutStats.loadChart.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Load Chart</p>
                      <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                        <div className="flex items-end gap-1.5 h-20">
                          {(() => {
                            const max = Math.max(...popupWorkoutStats.loadChart, 1);
                            return popupWorkoutStats.loadChart.map((val, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                  className="w-full rounded-t-md bg-cyan-400"
                                  style={{ height: `${Math.max(4, (val / max) * 72)}px` }}
                                />
                                <span className="text-[8px] text-gray-400">R{i + 1}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Power Set Logs */}
                  {isCompleted && popupPowerSetLogs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">$ Sets</p>
                      <div className="grid grid-cols-2 gap-2">
                        {popupPowerSetLogs.map((log, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mb-1.5">
                              <span className="text-[11px] font-extrabold text-purple-700">$</span>
                            </div>
                            <p className="text-[11px] font-bold text-gray-800 leading-tight mb-1 uppercase">{log.exercise || log.title}</p>
                            {log.weight != null && <p className="text-[12px] font-extrabold text-gray-900">{log.weight} kg</p>}
                            {log.reps != null && <p className="text-[10px] text-gray-400">{log.reps} reps</p>}
                            {log.opm && <p className="text-[10px] text-gray-400 mt-0.5">{log.opm}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rounds Breakdown */}
                  {isCompleted && popupTrackingLogs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Rounds Breakdown</p>
                      <div className="space-y-1.5">
                        {popupTrackingLogs.map((log, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                            <span className="text-[12px] font-semibold text-gray-700 flex-1 truncate pr-2">{log.title}</span>
                            <span className="text-[12px] font-bold text-gray-900 shrink-0">
                              {log.repetitions ?? "—"} × {log.weight ?? "—"} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {selectedSessionFeed && (
                    <div className="mb-4 border-t border-gray-100 pt-4">
                      <FeedComments
                        feedId={String(selectedSessionFeed.activity_id || selectedSessionFeed.id)}
                        onCommentAdded={() => {
                          setFeeds(prev => prev.map(f =>
                            String(f.id) === String(selectedSessionFeed.id)
                              ? { ...f, commentsCount: (f.commentsCount || 0) + 1 }
                              : f
                          ));
                          setFollowingFeeds(prev => prev.map(f =>
                            String(f.id) === String(selectedSessionFeed.id)
                              ? { ...f, commentsCount: (f.commentsCount || 0) + 1 }
                              : f
                          ));
                        }}
                      />
                    </div>
                  )}

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
                      } else {
                        const code = sessionData?.program_id || sessionData?.workout_code || "";
                        const activeId = selectedSessionFeed.activity_id || String(selectedSessionFeed.id);
                        localStorage.setItem("workoutProgramCode", code);
                        localStorage.setItem("workoutTitle", sessionData?.title || selectedSessionFeed.title || "");
                        localStorage.setItem("workoutName", sessionData?.programName || "");
                        localStorage.setItem("workoutIsFree", "true");
                        if (code) localStorage.setItem(`activeSessionId_${code.toUpperCase()}`, activeId);
                        localStorage.setItem("sessionActive", "true");
                        router.push("/workout/viewWorkoutSession");
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl text-[15px] transition mb-3"
                  >
                    View / Join session
                  </button>

                  {/* Workout Preview */}
                  <button
                    onClick={() => {
                      const code = sessionData?.program_id || sessionData?.workout_code || "";
                      localStorage.setItem("workoutProgramCode", code);
                      localStorage.setItem("workoutTitle", sessionData?.title || selectedSessionFeed.title || "");
                      localStorage.setItem("workoutName", sessionData?.programName || "");
                      localStorage.setItem("workoutIsFree", "true");
                      router.push("/workout/viewWorkoutSession");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-gray-500 font-semibold text-sm hover:text-gray-700 transition"
                  >
                    Workout Preview <ArrowRight size={15} />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SHARE SESSION MODAL */}
      {shareSessionFeed && (() => {
        const sessionId = shareSessionFeed.activity_id || String(shareSessionFeed.id);
        const fallbackUrl = typeof window !== "undefined"
          ? `${window.location.origin}/feed/main-feed?session=${sessionId}`
          : "";
        const displayUrl = shareLinkUrl || fallbackUrl;

        if (!shareLinkLoading && !shareLinkUrl) {
          setShareLinkLoading(true);
          generateSessionShareLink(sessionId).then(link => {
            setShareLinkUrl(link);
            setShareLinkLoading(false);
          });
        }

        return (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setShareSessionFeed(null); setSessionLinkCopied(false); setShareLinkUrl(null); }}
          >
            <div
              className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setShareSessionFeed(null); setSessionLinkCopied(false); setShareLinkUrl(null); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X size={14} className="text-gray-600" />
              </button>

              <div className="px-6 pt-6 pb-6">
                <h3 className="font-bold text-gray-900 text-[17px] mb-1">Share Session</h3>
                <p className="text-[13px] text-gray-400 mb-5 truncate">{shareSessionFeed.title || "Workout Session"}</p>

                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100 mb-5">
                  {shareLinkLoading ? (
                    <span className="text-[12px] text-gray-400 flex-1 flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin" /> Generating link…
                    </span>
                  ) : (
                    <span className="text-[12px] text-gray-500 truncate flex-1">{displayUrl}</span>
                  )}
                  <button
                    disabled={shareLinkLoading}
                    onClick={() => {
                      navigator.clipboard.writeText(displayUrl);
                      setSessionLinkCopied(true);
                      setTimeout(() => setSessionLinkCopied(false), 2000);
                    }}
                    className="shrink-0 text-[12px] font-bold text-purple-600 hover:text-purple-700 px-2 disabled:opacity-40"
                  >
                    {sessionLinkCopied ? "Copied!" : "Copy"}
                  </button>
                </div>

                <button
                  disabled={shareLinkLoading}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: shareSessionFeed.title || "Workout Session", url: displayUrl });
                    } else {
                      navigator.clipboard.writeText(displayUrl);
                      setSessionLinkCopied(true);
                      setTimeout(() => setSessionLinkCopied(false), 2000);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3.5 rounded-2xl text-[14px] transition hover:shadow-lg disabled:opacity-50"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CARDIO SESSION POPUP (in-progress) */}
      {inProgressCardioFeed && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setInProgressCardioFeed(null)}
        >
          <div
            className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Red banner */}
            <div className="bg-gradient-to-br from-red-500 to-orange-500 px-5 pt-5 pb-6 relative">
              <button
                onClick={() => setInProgressCardioFeed(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
              >
                <X size={15} className="text-white" />
              </button>
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide mb-3">
                <Flame size={10} /> Cardio · In Progress
              </span>
              <h2 className="text-white text-[18px] font-extrabold leading-tight pr-8">
                {inProgressCardioFeed.title || "Cardio Session"}
              </h2>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-3">
              {/* User row */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-red-100 flex items-center justify-center flex-shrink-0">
                  {inProgressCardioFeed.user?.image ? (
                    <img src={inProgressCardioFeed.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-red-500 font-bold text-sm">
                      {(inProgressCardioFeed.user?.username || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900">{inProgressCardioFeed.user?.name || inProgressCardioFeed.user?.username || "User"}</p>
                  <p className="text-[11px] text-red-500">@{inProgressCardioFeed.user?.username || "user"}</p>
                </div>
              </div>

              {/* Date */}
              {(inProgressCardioFeed.date || inProgressCardioFeed.created_at) && (
                <div className="flex items-center gap-2 text-gray-400">
                  <CalendarDays size={13} />
                  <span className="text-[12px]">
                    {new Date(inProgressCardioFeed.date || inProgressCardioFeed.created_at || "").toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric"
                    })}
                  </span>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-50 rounded-2xl py-3 text-center border border-red-100">
                  <p className="text-[18px] font-extrabold text-red-500">{(inProgressCardioFeed as any).calories ?? "—"}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Calories</p>
                </div>
                <div className="bg-orange-50 rounded-2xl py-3 text-center border border-orange-100">
                  <p className="text-[18px] font-extrabold text-orange-500">{(inProgressCardioFeed as any).minutes ?? "—"}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Minutes</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  const p = new URLSearchParams({
                    feedId: inProgressCardioFeed.activity_id || String(inProgressCardioFeed.id),
                    userName: inProgressCardioFeed.user?.name || "",
                    userUsername: inProgressCardioFeed.user?.username || "",
                    title: inProgressCardioFeed.title || "",
                    date: inProgressCardioFeed.date || inProgressCardioFeed.created_at || "",
                  });
                  setInProgressCardioFeed(null);
                  router.push(`/feed/cardio-session?${p.toString()}`);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3.5 rounded-2xl text-[14px] hover:shadow-lg transition"
              >
                View Session →
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <UploadHighlightModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}