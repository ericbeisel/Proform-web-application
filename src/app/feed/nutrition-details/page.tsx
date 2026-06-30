"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Utensils, CalendarDays, User, Heart, CheckCircle2 } from "lucide-react";
import FeedComments from "@/components/FeedComments";

export default function FeedNutritionDetailsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const feedId      = params.get("feedId") || "";
  const title       = params.get("title") || "Nutrition Log";
  const userName    = params.get("userName") || "";
  const userUsername = params.get("userUsername") || "";
  const date        = params.get("date") || "";
  const calories    = params.get("calories") || "";
  const protein     = params.get("protein") || "";
  const likeCount   = parseInt(params.get("likeCount") || "0", 10);

  const formatDate = (d: string) => {
    if (!d) return "";
    try { return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center hover:bg-green-700 transition"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Utensils size={16} className="text-green-600" />
        </div>
        <h1 className="font-bold text-[16px] text-gray-900 truncate flex-1">Nutrition Details</h1>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-xl mx-auto">

        {/* Completion + likes */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
            <CheckCircle2 size={12} /> Completed
          </span>
          {likeCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400">
              <Heart size={13} className="text-red-400 fill-red-400" /> {likeCount}
            </span>
          )}
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-5 text-white">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 block">Nutrition Log</span>
          <h2 className="text-[20px] font-extrabold leading-tight mb-3">{title}</h2>
          {(calories || protein) && (
            <div className="flex items-center gap-3">
              {calories && (
                <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
                  <p className="text-[22px] font-extrabold">{calories}</p>
                  <p className="text-[10px] opacity-80 font-semibold">kcal</p>
                </div>
              )}
              {protein && (
                <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
                  <p className="text-[22px] font-extrabold">{protein}g</p>
                  <p className="text-[10px] opacity-80 font-semibold">protein</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
          {(userName || userUsername) && (
            <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <User size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">{userName}</p>
                {userUsername && <p className="text-[11px] text-green-600">@{userUsername}</p>}
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
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <FeedComments feedId={feedId} />
          </div>
        )}
      </div>
    </div>
  );
}
