"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Dumbbell,
  Loader2,
  Trophy,
  Share2,
  Check,
  UserPlus,
  AlertCircle,
  X,
} from "lucide-react";
import { profileApi, PublicProfileData, ProfileData } from "@/api/profile/route";
import { getPowerSetLogsByUsername, PowerSetAccomplishment } from "@/api/workouts/route";
import { hasAuthSession } from "@/lib/auth/session";

const getUnit = (diffStr?: string) => {
  if (!diffStr) return "lbs";
  return diffStr.toLowerCase().includes("kg") ? "kg" : "lbs";
};

// Unified shape this page renders from, regardless of which endpoint
// supplied it — id/followtype are only ever present when fetched via the
// authenticated path (see DisplayProfile fetch below), which is what makes
// following possible.
type DisplayProfile = {
  id?: number;
  followtype?: string;
  image: string | null;
  name: string;
  username: string;
  bench_cmp: string | number | null;
  squat_cmp: string | number | null;
  clean_cmp: string | number | null;
  deadlift_cmp: string | number | null;
  strength: number;
  followersCount: number;
};

const fromPublicProfile = (p: PublicProfileData): DisplayProfile => ({
  image: p.image,
  name: p.name,
  username: p.username,
  bench_cmp: p.bench_cmp,
  squat_cmp: p.squat_cmp,
  clean_cmp: p.clean_cmp,
  deadlift_cmp: p.deadlift_cmp,
  strength: p.strength,
  followersCount: p.followersCount,
});

const fromAuthProfile = (p: ProfileData): DisplayProfile => ({
  id: p.id,
  followtype: p.followtype,
  image: p.image,
  name: p.name,
  username: p.username,
  bench_cmp: p.Bench_CMP,
  squat_cmp: p.Squat_CMP,
  clean_cmp: p.Clean_CMP,
  deadlift_cmp: p.Deadlift_CMP,
  strength: p.Strength,
  followersCount: p.followersCount,
});

// /public-profile doesn't return a workout count at all (unlike /my-profile),
// so this is Followers/Strength only — not the 3-stat row the authenticated
// /profile/[username] page shows.
const STAT_LABELS: { key: keyof DisplayProfile; label: string }[] = [
  { key: "followersCount", label: "Followers" },
  { key: "strength",       label: "Strength" },
];

const LIFTS: { key: keyof DisplayProfile; label: string }[] = [
  { key: "bench_cmp",    label: "Bench" },
  { key: "squat_cmp",    label: "Squat" },
  { key: "clean_cmp",    label: "Clean" },
  { key: "deadlift_cmp", label: "Deadlift" },
];

// Public duplicate of /profile/[username] — used for the shared profile link
// (see ProfilePage.tsx's Share Profile modal). Anonymous visitors are served
// by GET /public-profile (no id/followtype, so Follow Me! just prompts
// login/signup). Once logged in, this page instead calls the same
// authenticated /my-profile endpoint the original page uses, which does
// return id/followtype — that's what makes actually following possible here
// after login, without duplicating a whole separate authenticated page.
export default function PublicProfileViewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const username = decodeURIComponent(params.username as string);
  const isLoggedIn = hasAuthSession();

  const [profile, setProfile] = useState<DisplayProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [followPending, setFollowPending] = useState(false);
  const [accomplishments, setAccomplishments] = useState<PowerSetAccomplishment[]>([]);
  const [accLoading, setAccLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const loginUrl = `/auth/login?next=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    if (!isLoggedIn) return;
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setCurrentUsername(JSON.parse(stored)?.username || null);
      } catch {}
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    const fetchProfile = isLoggedIn
      ? profileApi.getProfileByUsername(username).then(fromAuthProfile)
      : profileApi.getPublicProfile(username).then(fromPublicProfile);
    fetchProfile
      .then(setProfile)
      .catch(() => setError("Profile not found."))
      .finally(() => setLoading(false));

    setAccLoading(true);
    getPowerSetLogsByUsername(username)
      .then(setAccomplishments)
      .catch(() => setAccomplishments([]))
      .finally(() => setAccLoading(false));
  }, [username, isLoggedIn]);

  // Mirrors mobile's PublicProfileScreen: followtype === 'Follow Me!' means
  // you're not yet following them — anything else means you are.
  const isFollowing = profile?.followtype !== "Follow Me!";

  const handleFollowToggle = async () => {
    if (!profile?.id || !currentUsername || followPending) return;
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
    const shareUrl = `https://paxlete.com/profile/view/${encodeURIComponent(username)}`;
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

  const hasLifts = LIFTS.some(l => profile[l.key]);

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

        {/* LEFT COLUMN — identity, stats, lifts */}
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
            </div>

            {/* Stats row — Followers | Strength */}
            <div className="w-full flex items-stretch bg-[#FAF9FC] border border-[#F1EFF5] rounded-2xl py-3 mt-1">
              {STAT_LABELS.map(({ key, label }, idx) => {
                const val = profile[key] as number | null | undefined;
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

            {/* Follow / Unfollow — real toggle once logged in (and not your
                own profile); prompts login/signup otherwise */}
            {isLoggedIn && profile.id != null ? (
              currentUsername && profile.username !== currentUsername && (
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
                    <>Unfollow</>
                  ) : (
                    <><UserPlus size={16} /> Follow Me!</>
                  )}
                </button>
              )
            ) : (
              !isLoggedIn && (
                <button
                  onClick={() => setAuthPrompt(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-bold bg-[#6202AC] text-white hover:bg-purple-800 transition"
                >
                  <UserPlus size={16} /> Follow Me!
                </button>
              )
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
                  const val = profile[key] as number | null;
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

      {/* AUTH PROMPT — same purple-gradient login/signup modal used across
          the app's anonymous-preview flows (WorkoutDetail.tsx,
          viewWorkoutSession/page.tsx, feed's SessionDetailsContent.tsx). */}
      {authPrompt && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setAuthPrompt(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl px-6 py-10 md:px-12 md:py-14 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #6202AC)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthPrompt(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
            >
              <X size={15} className="text-white" />
            </button>

            <div className="relative z-10 max-w-xs md:max-w-sm">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-4">
                <AlertCircle size={20} className="text-white" />
              </div>
              <h3 className="text-white font-medium text-3xl md:text-4xl mb-2">Follow on Proform</h3>
              <p className="text-white/80 text-sm md:text-base mb-6">Log in or sign up to follow this user</p>
              <button
                onClick={() => router.push(loginUrl)}
                className="bg-white text-purple-700 font-bold text-sm px-5 py-3 rounded-full hover:bg-gray-50 transition"
              >
                Log in or Sign up
              </button>
            </div>

            <img
              src="/images/Visual.png"
              alt=""
              className="hidden sm:block absolute right-2 md:right-6 bottom-0 w-64 md:w-80 pointer-events-none select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
