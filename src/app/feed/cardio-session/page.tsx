"use client";

import { useState, useEffect } from "react";
import { X, Heart, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import FeedComments from "@/components/FeedComments";
import { feedApi } from "@/api/feed/route";
import { useFeedLike } from "@/hooks/useFeedLike";

export default function FeedCardioSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const feedId = searchParams.get("feedId") || "";
  const userUsername = searchParams.get("userUsername") || "user";
  const userImage = searchParams.get("userImage") || "";
  const title = searchParams.get("title") || "Completed a cardio workout";
  const feedDate = searchParams.get("date") || "";
  const initialLikeCount = parseInt(searchParams.get("likeCount") || "0", 10);
  const initialLiked = searchParams.get("isLiked") === "true";
  const { liked, count: likeCount, toggle: toggleLike } = useFeedLike(feedId, initialLiked, initialLikeCount);

  const [loading, setLoading] = useState(true);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [calories, setCalories] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const feedDetails = feedId ? await feedApi.getFeedDetails(feedId) : null;
        const session = feedDetails?.cardioDetails?.session;
        setMinutes(session?.minutes ?? null);
        setCalories(session?.calories_burned ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [feedId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }) +
      " " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-gray-900 transition-colors"
        >
          <X size={22} />
        </button>
        <span className="text-xs text-gray-400">{formatDate(feedDate)}</span>
      </div>

      <div className="px-4">
        {/* Avatar / completed / title / like row */}
        <div className="flex gap-3 mb-6">
          <div className="flex flex-col items-center flex-shrink-0 w-11">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
              {userImage ? (
                <img src={userImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">{userUsername.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-center truncate w-full" title={`@${userUsername}`}>
              @{userUsername}
            </p>
          </div>

          <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">completed</p>
              <p className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2">{title}</p>
            </div>
            <button
              onClick={toggleLike}
              className="flex flex-col items-center text-red-400 flex-shrink-0 pt-0.5"
            >
              <Heart size={18} className={liked ? "fill-red-400" : ""} />
              <span className="text-[11px] text-gray-400 mt-0.5">{likeCount}</span>
            </button>
          </div>
        </div>

        {/* Results */}
        <p className="font-bold text-gray-900 mb-3">Results:</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="border border-gray-200 rounded-2xl py-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{minutes ?? "—"}</p>
            <p className="text-xs text-gray-400 mt-1">Minutes</p>
          </div>
          <div className="border border-gray-200 rounded-2xl py-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{calories ?? "—"}</p>
            <p className="text-xs text-gray-400 mt-1">Calories</p>
          </div>
        </div>

        {/* Comments */}
        {feedId && <FeedComments feedId={feedId} />}
      </div>
    </div>
  );
}
