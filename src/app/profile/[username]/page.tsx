"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Dumbbell,
  Users,
  ExternalLink,
  Loader2,
  UserCheck,
} from "lucide-react";
import { profileApi, ProfileData, DetailedSocialMedia } from "@/api/profile/route";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-50 text-pink-600 border-pink-200",
  youtube:   "bg-red-50 text-red-600 border-red-200",
  twitter:   "bg-sky-50 text-sky-600 border-sky-200",
  x:         "bg-gray-50 text-gray-700 border-gray-200",
  tiktok:    "bg-black/5 text-gray-900 border-gray-200",
  facebook:  "bg-blue-50 text-blue-700 border-blue-200",
  linkedin:  "bg-blue-50 text-blue-800 border-blue-200",
};

const STAT_LABELS: { key: string; label: string }[] = [
  { key: "workoutCount",  label: "Workouts" },
  { key: "followersCount", label: "Followers" },
  { key: "Strength",     label: "Strength" },
  { key: "optimalWellnessScore", label: "Wellness" },
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
  const [socials, setSocials] = useState<DetailedSocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    profileApi.getProfileByUsername(username)
      .then(async (data) => {
        setProfile(data);
        try {
          const s = await profileApi.getSocialMedia(data.id);
          setSocials(s.filter(l => l.hide !== "1" && l.url));
        } catch {}
      })
      .catch(() => setError("Profile not found."))
      .finally(() => setLoading(false));
  }, [username]);

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

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-[#6c3fef] rounded-xl flex items-center justify-center hover:bg-purple-700 transition"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="font-bold text-[16px] text-gray-900 flex-1 truncate">@{profile.username}</h1>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-xl mx-auto">

        {/* Avatar + name card */}
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

          {/* Follow type */}
          {profile.followtype && (
            <span className="text-[11px] font-semibold text-gray-400 capitalize">
              {profile.followtype === "public" ? "Public profile" : "Private profile"}
            </span>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {STAT_LABELS.map(({ key, label }) => {
            const val = (profile as any)[key] as number | null | undefined;
            if (val === null || val === undefined) return null;
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-1">
                <p className="text-[22px] font-extrabold text-[#6c3fef]">{Number(val).toLocaleString()}</p>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Competition lifts */}
        {LIFTS.some(l => (profile as any)[l.key]) && (
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

        {/* Social links */}
        {socials.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} className="text-purple-500" />
              <p className="text-[14px] font-extrabold text-gray-900">Social Links</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => {
                const colorClass = PLATFORM_COLORS[s.type?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
                return (
                  <a
                    key={s.id}
                    href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 border text-[12px] font-bold px-3 py-1.5 rounded-xl transition hover:opacity-80 ${colorClass}`}
                  >
                    {s.type}
                    <ExternalLink size={11} />
                  </a>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
