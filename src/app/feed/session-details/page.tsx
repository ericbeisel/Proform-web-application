"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { hasAuthSession } from "@/lib/auth/session";
import SessionDetailsContent from "./SessionDetailsContent";

export default function SessionDetailsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const isLoggedIn = hasAuthSession();
  const loginUrl = `/auth/login?next=${encodeURIComponent(`${pathname}?${params.toString()}`)}`;

  const feedId = params.get("feedId") || "";
  const activityId = params.get("activityId") || "";
  const type = params.get("type") || "";
  const memberId = params.get("memberId") || "";
  const userName = params.get("userName") || "";
  const userUsername = params.get("userUsername") || "";
  const userImage = params.get("userImage") || "";
  const feedTitle = params.get("title") || "";
  const title2 = params.get("title2") || "";
  const date = params.get("date") || "";
  const initialLikeCount = parseInt(params.get("likeCount") || "0", 10);
  const initialLiked = params.get("isLiked") === "true";
  const joinedCountParam = parseInt(params.get("joinedCount") || "0", 10);
  const programCode = params.get("programCode") || "";

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-16">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 md:px-8 py-4 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-700 transition shrink-0"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="font-bold text-[16px] md:text-[18px] text-gray-900 truncate flex-1">Session Details</h1>
      </div>

      <div className="px-4 py-6 md:py-10 max-w-2xl mx-auto">
        <SessionDetailsContent
          feedId={feedId}
          activityId={activityId}
          type={type}
          memberId={memberId}
          userName={userName}
          userUsername={userUsername}
          userImage={userImage}
          feedTitle={feedTitle}
          title2={title2}
          date={date}
          initialLikeCount={initialLikeCount}
          initialLiked={initialLiked}
          joinedCountParam={joinedCountParam}
          isLoggedIn={isLoggedIn}
          loginUrl={loginUrl}
          programCode={programCode}
        />
      </div>
    </div>
  );
}
