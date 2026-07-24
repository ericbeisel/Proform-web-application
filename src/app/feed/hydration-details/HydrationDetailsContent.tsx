"use client";

import { useEffect, useState } from "react";
import { CalendarDays, User, Heart, CheckCircle2 } from "lucide-react";
import FeedComments from "@/components/FeedComments";
import { feedApi } from "@/api/feed/route";
import { useFeedLike } from "@/hooks/useFeedLike";

export interface HydrationDetailsContentProps {
  feedId: string;
  userName: string;
  userUsername: string;
  date: string;
  initialLikeCount: number;
  initialLiked: boolean;
  initialTitle?: string;
  initialOz?: string;
  compact?: boolean;
}

export default function HydrationDetailsContent({
  feedId,
  userName,
  userUsername,
  date,
  initialLikeCount,
  initialLiked,
  initialTitle = "Hydration Log",
  initialOz = "",
  compact = false,
}: HydrationDetailsContentProps) {
  const [title, setTitle] = useState(initialTitle);
  const [oz, setOz] = useState(initialOz);

  const { liked, count: likeCount, toggle: toggleLike } = useFeedLike(feedId, initialLiked, initialLikeCount);

  useEffect(() => {
    if (!feedId) return;
    feedApi.getFeedDetails(feedId).then((res) => {
      const record = res?.hydrationDetails?.record;
      if (record) {
        if (record.title) setTitle(record.title);
        if (record.oz_number != null) setOz(String(record.oz_number));
      }
    });
  }, [feedId]);

  const formatDate = (d: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch {
      return d;
    }
  };

  const ozNum = oz ? parseFloat(oz) : null;

  return (
    <div className={`space-y-4 ${compact ? "" : "max-w-xl mx-auto"}`}>
      {/* Completion + likes */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
          <CheckCircle2 size={12} /> Completed
        </span>
        <button
          onClick={toggleLike}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#8b5cf6]"
        >
          <Heart size={15} className={liked ? "fill-[#8b5cf6]" : ""} />
          {likeCount}
        </button>
      </div>

      {/* Banner */}
      <div className={`bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl text-white flex flex-col items-center text-center ${compact ? "p-4" : "p-5"}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 block">Hydration Log</span>
        <h2 className={`font-extrabold leading-tight mb-3 ${compact ? "text-[16px]" : "text-[20px]"}`}>{title}</h2>
        {ozNum && (
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className={`font-extrabold ${compact ? "text-[20px]" : "text-[26px]"}`}>{ozNum}</p>
            <p className="text-[10px] opacity-80 font-semibold">oz</p>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3 ${compact ? "p-4" : "p-5"}`}>
        {(userName || userUsername) && (
          <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
              <User size={16} className="text-teal-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900">{userName}</p>
              {userUsername && <p className="text-[11px] text-teal-500">@{userUsername}</p>}
            </div>
          </div>
        )}

        {date && (
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarDays size={14} className="text-gray-400" />
            <span className="text-[13px]">{formatDate(date)}</span>
          </div>
        )}

        {ozNum && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-gray-400 font-medium">Water intake</span>
            <span className="text-[14px] font-bold text-teal-600">{ozNum} oz</span>
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
