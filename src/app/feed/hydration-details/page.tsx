"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Droplets } from "lucide-react";
import HydrationDetailsContent from "./HydrationDetailsContent";

export default function FeedHydrationDetailsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const feedId = params.get("feedId") || "";
  const userName = params.get("userName") || "";
  const userUsername = params.get("userUsername") || "";
  const date = params.get("date") || "";
  const initialLikeCount = parseInt(params.get("likeCount") || "0", 10);
  const initialLiked = params.get("isLiked") === "true";
  const initialTitle = params.get("title") || "Hydration Log";
  const initialOz = params.get("oz") || "";

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center hover:bg-teal-600 transition"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
          <Droplets size={16} className="text-teal-600" />
        </div>
        <h1 className="font-bold text-[16px] text-gray-900 truncate flex-1">Hydration Details</h1>
      </div>

      <div className="px-4 py-5">
        <HydrationDetailsContent
          feedId={feedId}
          userName={userName}
          userUsername={userUsername}
          date={date}
          initialLikeCount={initialLikeCount}
          initialLiked={initialLiked}
          initialTitle={initialTitle}
          initialOz={initialOz}
        />
      </div>
    </div>
  );
}
