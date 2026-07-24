"use client";

import { useEffect, useState } from "react";
import { Heart, CalendarDays, User, CheckCircle2 } from "lucide-react";
import FeedComments from "@/components/FeedComments";
import { feedApi } from "@/api/feed/route";
import { useFeedLike } from "@/hooks/useFeedLike";

export interface RecoveryDetailsContentProps {
  feedId: string;
  userName: string;
  userUsername: string;
  date: string;
  initialLikeCount: number;
  initialLiked: boolean;
  initialTitle?: string;
  initialDuration?: string;
  compact?: boolean;
}

export default function RecoveryDetailsContent({
  feedId,
  userName,
  userUsername,
  date,
  initialLikeCount,
  initialLiked,
  initialTitle = "Recovery Session",
  initialDuration = "",
  compact = false,
}: RecoveryDetailsContentProps) {
  const [title, setTitle] = useState(initialTitle);
  const [duration, setDuration] = useState(initialDuration);

  const { liked, count: likeCount, toggle: toggleLike } = useFeedLike(feedId, initialLiked, initialLikeCount);

  useEffect(() => {
    if (!feedId) return;
    feedApi.getFeedDetails(feedId).then((res) => {
      const record = res?.recoveryDetails?.record;
      if (record) {
        if (record.recovery_title) setTitle(record.recovery_title);
        if (record.time_spent != null) setDuration(String(record.time_spent));
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
      <div className={`bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl text-white flex flex-col items-center text-center ${compact ? "p-4" : "p-5"}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 block">Recovery Session</span>
        <h2 className={`font-extrabold leading-tight ${compact ? "text-[16px]" : "text-[20px]"}`}>{title}</h2>
      </div>

      {/* Info card */}
      <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3 ${compact ? "p-4" : "p-5"}`}>
        {(userName || userUsername) && (
          <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
              <User size={16} className="text-purple-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900">{userName}</p>
              {userUsername && <p className="text-[11px] text-purple-500">@{userUsername}</p>}
            </div>
          </div>
        )}

        {date && (
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarDays size={14} className="text-gray-400" />
            <span className="text-[13px]">{formatDate(date)}</span>
          </div>
        )}

        {duration && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-gray-400 font-medium">Duration</span>
            <span className="text-[14px] font-bold text-gray-800">{duration} min</span>
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
