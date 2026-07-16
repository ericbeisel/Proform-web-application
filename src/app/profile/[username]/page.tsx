"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Dumbbell,
  Loader2,
  UserCheck,
  UserPlus,
  Trophy,
  Share2,
  Check,
} from "lucide-react";
import { profileApi, ProfileData } from "@/api/profile/route";
import { getPowerSetLogsByUsername, PowerSetAccomplishment } from "@/api/workouts/route";

const getUnit = (diffStr?: string) => {
  if (!diffStr) return "lbs";
  return diffStr.toLowerCase().includes("kg") ? "kg" : "lbs";
};

// Matches mobile's PublicProfileScreen stats row exactly: Workouts, Followers,
// Strength — all three in a single row, side by side.
const STAT_LABELS: { key: string; label: string }[] = [
  { key: "workoutCount",   label: "Workouts" },
  { key: "followersCount", label: "Followers" },
  { key: "Strength",       label: "Strength" },
];

const LIFTS: { key: string; label: string }[] = [
  { key: "Bench_CMP",    label: "Bench" },
  { key: "Squat_CMP",   label: "Squat" },
  { key: "Clean_CMP",   label: "Clean" },
  { key: "Deadlift_CMP", label: "Deadlift" },
];

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = decodeURIComponent(params.username as string);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [followPending, setFollowPending] = useState(false);
  const [accomplishments, setAccomplishments] = useState<PowerSetAccomplishment[]>([]);
  const [accLoading, setAccLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setCurrentUsername(JSON.parse(stored)?.username || null);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    profileApi.getProfileByUsername(username)
      .then(setProfile)
      .catch(() => setError("Profile not found."))
      .finally(() => setLoading(false));

    setAccLoading(true);
    getPowerSetLogsByUsername(username)
      .then(setAccomplishments)
      .catch(() => setAccomplishments([]))
      .finally(() => setAccLoading(false));
  }, [username]);

  // Mirrors mobile's PublicProfileScreen: followtype === 'Follow Me!' means
  // you're not yet following them — anything else means you are.
  const isFollowing = profile?.followtype !== "Follow Me!";

  const handleFollowToggle = async () => {
    if (!profile || !currentUsername || followPending) return;
    setFollowPending(true);
    const payload = { user_id: profile.id, follower_username: currentUsername };
    try {
      if (isFollowing) {
        await profileApi.unfollowUser(payload);
        setProfile((prev) => prev && {
          ...prev,
          followtype: "Follow Me!",
          followersCount: Math.max(0, (prev.followersCount || 0) - 1),
        });
      } else {
        await profileApi.followUser(payload);
        setProfile((prev) => prev && {
          ...prev,
          followtype: "Following",
          followersCount: (prev.followersCount || 0) + 1,
        });
      }
    } catch {
    } finally {
      setFollowPending(false);
    }
  };

  // Mirrors mobile's PublicProfileScreen.handleShare (Share.share) — falls
  // back to copying the link since not every browser supports navigator.share.
  const handleShare = async () => {
    const shareUrl = `https://paxlete.com/profile/${encodeURIComponent(username)}`;
    const shareText = `Check out ${profile?.name || "this profile"} on Proform!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url: shareUrl });
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <User size={28} className="text-gray-400" />
        </div>
        <p className="text-[15px] font-semibold text-gray-500">{error || "Profile not found."}</p>
        <button onClick={() => router.back()} className="text-purple-600 text-[13px] font-bold hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const hasLifts = LIFTS.some(l => (profile as any)[l.key]);

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-[#6c3fef] rounded-xl flex items-center justify-center hover:bg-purple-700 transition shrink-0"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="font-bold text-[16px] text-gray-900 flex-1 truncate">@{profile.username}</h1>
        <button
          onClick={handleShare}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition shrink-0"
          aria-label="Share profile"
        >
          {shareCopied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} className="text-gray-700" />}
        </button>
      </div>

      <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

        {/* LEFT COLUMN — identity, stats, follow, lifts, socials */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center overflow-hidden ring-4 ring-purple-100">
              {profile.image ? (
                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-[28px] font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="text-[18px] font-extrabold text-gray-900">{profile.name}</p>
              <p className="text-[13px] text-purple-600 font-semibold mt-0.5">@{profile.username}</p>
              {profile.role_id && (
                <span className="inline-flex items-center gap-1 mt-2 bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-bold px-3 py-1 rounded-full">
                  <UserCheck size={11} /> {profile.role_id}
                </span>
              )}
            </div>

            {/* Stats row — Workouts | Followers | Strength, side by side */}
            <div className="w-full flex items-stretch bg-[#FAF9FC] border border-[#F1EFF5] rounded-2xl py-3 mt-1">
              {STAT_LABELS.map(({ key, label }, idx) => {
                const val = (profile as any)[key] as number | null | undefined;
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-0.5 relative">
                    {idx > 0 && <div className="absolute left-0 top-1 bottom-1 w-px bg-[#E6E3ED]" />}
                    <p className="text-[18px] font-extrabold text-[#6c3fef] leading-tight">
                      {val === null || val === undefined ? "—" : Number(val).toLocaleString()}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                  </div>
                );
              })}
            </div>

            {/* Follow / Unfollow — hidden on your own profile */}
            {currentUsername && profile.username !== currentUsername && (
              <button
                onClick={handleFollowToggle}
                disabled={followPending}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-bold transition disabled:opacity-60 ${
                  isFollowing
                    ? "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                    : "bg-[#6202AC] text-white hover:bg-purple-800"
                }`}
              >
                {followPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isFollowing ? (
                  <><UserCheck size={16} /> Unfollow</>
                ) : (
                  <><UserPlus size={16} /> Follow Me!</>
                )}
              </button>
            )}
          </div>

          {/* Competition lifts */}
          {hasLifts && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                <Dumbbell size={15} className="text-purple-500" />
                <p className="text-[14px] font-extrabold text-gray-900">Competition Lifts</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-gray-100">
                {LIFTS.map(({ key, label }) => {
                  const val = (profile as any)[key] as string | null;
                  if (!val) return null;
                  return (
                    <div key={key} className="bg-white px-4 py-3 flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-gray-500">{label}</span>
                      <span className="text-[14px] font-extrabold text-gray-900">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Accomplishments (the tallest section, gets the wide side) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <p className="text-[16px] font-extrabold text-gray-900 mb-4">Accomplishments</p>

          {accLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={22} className="animate-spin text-purple-400" />
            </div>
          ) : accomplishments.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Trophy size={40} className="text-gray-300 mb-3" />
              <p className="text-[14px] font-bold text-gray-500">No accomplishments yet</p>
              <p className="text-[12px] text-gray-400 mt-1">PowerSet logs and MoneySets will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {accomplishments.map((item) => {
                const isTrophy = item.type === "TrophySet";
                const exerciseTitle = item.exerciseInfo?.name
                  ? `${item.exerciseInfo.supplemental ? `${item.exerciseInfo.supplemental} ` : ""}${item.exerciseInfo.name}`.toUpperCase()
                  : (item.exercise || item.title || "EXERCISE").toUpperCase();
                const unit = getUnit(item.diff);
                const isPositive = item.diff?.includes("+");
                const isNegative = item.diff?.includes("-");
                const diffClass = isPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : isNegative
                    ? "bg-red-50 text-red-500"
                    : "bg-gray-100 text-gray-600";

                return (
                  <div key={item.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 ${isTrophy ? "bg-purple-100" : "bg-emerald-100"}`}>
                      {isTrophy ? (
                        <Trophy size={12} className="text-purple-600" />
                      ) : (
                        <span className="text-[12px] font-black text-emerald-600">$</span>
                      )}
                    </div>
                    <p className="text-[11px] font-extrabold text-gray-800 leading-tight mb-2 line-clamp-2 h-7">
                      {exerciseTitle}
                    </p>
                    <p className="text-[20px] font-black text-gray-900">
                      {item.new_weight || 0} {unit}
                    </p>
                    <p className="text-[11px] font-bold text-gray-500 mt-0.5">{item.reps || 0} REPS</p>
                    <p className="text-[10px] font-semibold text-purple-500 mt-2">
                      AMP: {item.amp || 0} | RMP: {item.member_weight_rmp || 0}
                    </p>
                    {item.diff && (
                      <span className={`mt-2.5 text-[11px] font-bold px-2.5 py-1 rounded-lg ${diffClass}`}>
                        {item.diff}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
