"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, CalendarDays, User, CheckCircle2 } from "lucide-react";
import FeedComments from "@/components/FeedComments";
import { feedApi } from "@/api/feed/route";
import { useFeedLike } from "@/hooks/useFeedLike";

export default function FeedRecoveryDetailsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const feedId = params.get("feedId") || "";
  const userName = params.get("userName") || "";
  const userUsername = params.get("userUsername") || "";
  const date = params.get("date") || "";
  const initialLikeCount = parseInt(params.get("likeCount") || "0", 10);
  const initialLiked = params.get("isLiked") === "true";

  const [title, setTitle] = useState(params.get("title") || "Recovery Session");
  const [duration, setDuration] = useState(params.get("duration") || "");

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
    <div className="min-h-screen bg-[#f4f4f8] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-700 transition"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <Heart size={16} className="text-purple-600" />
        </div>
        <h1 className="font-bold text-[16px] text-gray-900 truncate flex-1">Recovery Details</h1>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-xl mx-auto">

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
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-5 text-white">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 block">Recovery Session</span>
          <h2 className="text-[20px] font-extrabold leading-tight mb-3">{title}</h2>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
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
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <FeedComments feedId={feedId} />
          </div>
        )}

      </div>
    </div>
  );
}
