"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Flame, CalendarDays, User, Heart, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import FeedComments from "@/components/FeedComments";
import { feedApi } from "@/api/feed/route";
import { useFeedLike } from "@/hooks/useFeedLike";

export default function FeedCardioSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const feedId = searchParams.get("feedId") || "";
  const userName = searchParams.get("userName") || "";
  const userUsername = searchParams.get("userUsername") || "user";
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

  const formatDate = (d: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 transition"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
          <Flame size={16} className="text-red-500" />
        </div>
        <h1 className="font-bold text-[16px] text-gray-900 truncate flex-1">Cardio Details</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-red-400" />
        </div>
      ) : (
        <div className="px-4 py-5 space-y-4 max-w-xl mx-auto">

          {/* Completion + likes */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
              <CheckCircle2 size={12} /> Completed
            </span>
            <button
              onClick={toggleLike}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-500"
            >
              <Heart size={15} className={liked ? "fill-red-500" : ""} />
              {likeCount}
            </button>
          </div>

          {/* Banner */}
          <div className="bg-gradient-to-br from-red-400 to-orange-500 rounded-3xl p-5 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 block">Cardio Workout</span>
            <h2 className="text-[20px] font-extrabold leading-tight mb-3">{title}</h2>
            {(minutes != null || calories != null) && (
              <div className="flex items-center gap-3">
                {minutes != null && (
                  <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
                    <p className="text-[22px] font-extrabold">{minutes}</p>
                    <p className="text-[10px] opacity-80 font-semibold">minutes</p>
                  </div>
                )}
                {calories != null && (
                  <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
                    <p className="text-[22px] font-extrabold">{calories}</p>
                    <p className="text-[10px] opacity-80 font-semibold">calories</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
            {(userName || userUsername) && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                <button
                  onClick={() => userUsername && router.push(`/profile/${encodeURIComponent(userUsername)}`)}
                  className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0"
                >
                  <User size={16} className="text-red-500" />
                </button>
                <div>
                  <p className="text-[13px] font-bold text-gray-900">{userName}</p>
                  {userUsername && (
                    <button
                      onClick={() => router.push(`/profile/${encodeURIComponent(userUsername)}`)}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      @{userUsername}
                    </button>
                  )}
                </div>
              </div>
            )}

            {feedDate && (
              <div className="flex items-center gap-2 text-gray-500">
                <CalendarDays size={14} className="text-gray-400" />
                <span className="text-[13px]">{formatDate(feedDate)}</span>
              </div>
            )}
          </div>

          {/* Comments */}
          {feedId && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <FeedComments feedId={feedId} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}
