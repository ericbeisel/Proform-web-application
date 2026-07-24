"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, User, Heart, CheckCircle2, Loader2 } from "lucide-react";
import FeedComments from "@/components/FeedComments";
import { feedApi } from "@/api/feed/route";
import { useFeedLike } from "@/hooks/useFeedLike";

export interface CardioSessionContentProps {
  feedId: string;
  userName: string;
  userUsername: string;
  title: string;
  date: string;
  initialLikeCount: number;
  initialLiked: boolean;
  compact?: boolean;
}

export default function CardioSessionContent({
  feedId,
  userName,
  userUsername,
  title,
  date,
  initialLikeCount,
  initialLiked,
  compact = false,
}: CardioSessionContentProps) {
  const router = useRouter();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? "" : "max-w-xl mx-auto"}`}>
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
      <div className={`bg-gradient-to-br from-red-400 to-orange-500 rounded-3xl text-white flex flex-col items-center text-center ${compact ? "p-4" : "p-5"}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 block">Cardio Workout</span>
        <h2 className={`font-extrabold leading-tight mb-3 ${compact ? "text-[16px]" : "text-[20px]"}`}>{title}</h2>
        {(minutes != null || calories != null) && (
          <div className="flex items-center justify-center gap-3">
            {minutes != null && (
              <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
                <p className={`font-extrabold ${compact ? "text-[18px]" : "text-[22px]"}`}>{minutes}</p>
                <p className="text-[10px] opacity-80 font-semibold">minutes</p>
              </div>
            )}
            {calories != null && (
              <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
                <p className={`font-extrabold ${compact ? "text-[18px]" : "text-[22px]"}`}>{calories}</p>
                <p className="text-[10px] opacity-80 font-semibold">calories</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3 ${compact ? "p-4" : "p-5"}`}>
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

        {date && (
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarDays size={14} className="text-gray-400" />
            <span className="text-[13px]">{formatDate(date)}</span>
          </div>
        )}
      </div>

      {/* Comments */}
      {feedId && (
        <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm ${compact ? "p-4" : "p-5"}`}>
          <FeedComments feedId={feedId} />
        </div>
      )}
    </div>
  );
}
