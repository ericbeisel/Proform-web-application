"use client";

import { ArrowLeft, Flame } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CardioSessionContent from "./CardioSessionContent";

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

      <div className="px-4 py-5">
        <CardioSessionContent
          feedId={feedId}
          userName={userName}
          userUsername={userUsername}
          title={title}
          date={feedDate}
          initialLikeCount={initialLikeCount}
          initialLiked={initialLiked}
        />
      </div>
    </div>
  );
}
