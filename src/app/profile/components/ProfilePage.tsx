"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Calendar,
  Search,
  Share2,
  ChevronLeft,
  Link as LinkIcon,
  Settings,
  Zap,
  Users,
  Star,
  X,
  Loader2,
  Activity,
  Dumbbell,
  TrendingUp,
  Target,
} from "lucide-react";
import EditProfilePage from "./EditProfilePage";
import SocialLinksPage from "./SocialLinksPage";
import { profileApi, ProfileData, DetailedSocialMedia } from "@/api/profile/route";

type Modal = "edit" | "social" | null;

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [socials, setSocials] = useState<DetailedSocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    name: string;
  } | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setUserLoaded(true);
  }, []);

  const fetchProfileData = async (username: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch Basic Profile
      const profileData = await profileApi.getProfileByUsername(username);
      setProfile(profileData);
      
      // 2. Fetch Social Media for the icons
      const socialMediaLinks = await profileApi.getSocialMedia(profileData.id);
      setSocials(socialMediaLinks);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoaded) return;

    const urlUsername = searchParams.get("username");
    const storedUser = localStorage.getItem("user");
    const parsed = storedUser ? JSON.parse(storedUser) : null;
    const resolvedUsername = urlUsername || parsed?.username || "";

    if (!resolvedUsername) {
      setLoading(false);
      setError("No user found. Please log in.");
      return;
    }

    fetchProfileData(resolvedUsername);
  }, [userLoaded, searchParams]);

  const handleFollowToggle = async () => {
    if (!profile || !currentUser) return;

    const isFollowing = profile.followtype === "Following";
    const payload = {
      user_id: profile.id,
      follower_username: currentUser.username,
    };

    try {
      if (isFollowing) {
        await profileApi.unfollowUser(payload);
        setProfile({
          ...profile,
          followtype: "Follow Me!",
          FollowsCount: profile.FollowsCount - 1,
        });
      } else {
        await profileApi.followUser(payload);
        setProfile({
          ...profile,
          followtype: "Following",
          FollowsCount: profile.FollowsCount + 1,
        });
      }
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <X size={32} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Profile Not Found</h2>
        <p className="text-gray-500 mt-2 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold">
          Try Again
        </button>
      </div>
    );
  }

  const isOwnProfile = profile.username === currentUser?.username;
  
  // Filter for visible social icons (hide === "0" and has a URL)
  const visibleSocials = socials.filter(s => s.hide === "0" && s.url);

  const STATS = [
    { icon: <Zap size={20} className="text-orange-500" />, bg: "bg-yellow-50", value: profile.workoutCount, label: "Total Workouts", valueCls: "text-gray-900" },
    { icon: <Users size={20} className="text-blue-500" />, bg: "bg-blue-50", value: profile.FollowsCount, label: "Followers", valueCls: "text-blue-500" },
    { icon: <Star size={20} className="text-purple-500" />, bg: "bg-purple-50", value: profile.Strength, label: "Strength Score", valueCls: "text-purple-500" },
  ];

  const HIGHLIGHTS = [
    { icon: <Dumbbell size={18} className="text-orange-500" />, bg: "bg-orange-50", title: "Bench Press", sub: profile.Bench_CMP || "No record set" },
    { icon: <TrendingUp size={18} className="text-blue-500" />, bg: "bg-blue-50", title: "Squat", sub: profile.Squat_CMP || "No record set" },
    { icon: <Target size={18} className="text-purple-500" />, bg: "bg-purple-50", title: "Deadlift", sub: profile.Deadlift_CMP || "No record set" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <div className="relative">
  {/* Left - Back Button */}
  <div className="absolute top-4 left-4 z-10">
    <button onClick={() => router.back()} className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
      <ChevronLeft size={18} />
    </button>
  </div>

  {/* Right - Share Button (Added This) */}
  <div className="absolute top-4 right-4 z-10">
    <button 
      onClick={() => {
        if (navigator.share) {
          navigator.share({
            title: profile.name,
            url: window.location.href,
          });
        } else {
          // Fallback: Copy to clipboard
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
        }
      }} 
      className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
    >
      <Share2 size={18} />
    </button>
  </div>

  <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 relative overflow-hidden">
    <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${profile.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"})` }} />
    <div className="absolute bottom-4 left-44 sm:left-52 flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <h1 className="text-white text-[18px] sm:text-[20px] font-extrabold drop-shadow">{profile.name}</h1>
      <div className="flex gap-2">
        <button onClick={() => setModal("social")} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/30 transition-all">
          <LinkIcon size={11} /> Social Links
        </button>
        {isOwnProfile && (
          <button onClick={() => setModal("edit")} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg transition-all">
            <Settings size={11} /> Edit Profile
          </button>
        )}
      </div>
    </div>
  </div>

  <div className="absolute left-4 sm:left-6 bottom-[-52px]">
    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-purple-700 flex items-center justify-center text-white text-[32px] sm:text-[38px] font-extrabold border-[5px] border-white shadow-xl overflow-hidden">
      {profile.image ? <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" /> : profile.name.substring(0, 2).toUpperCase()}
    </div>
    <span className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
  </div>
</div>

      <div className="pt-16 px-4 sm:px-6 pb-2 bg-white">
        <p className="text-[13px] text-gray-400 font-medium mb-1">@{profile.username}</p>

        {/* Social Media Icons Row */}
        <div className="flex items-center gap-3 mt-3 mb-4">
          {visibleSocials.length > 0 ? (
            visibleSocials.map((social) => (
              <a
                key={social.type}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center bg-white shadow-sm hover:scale-110 transition-transform overflow-hidden"
              >
                <img 
                  src={social.logo} 
                  alt={social.type} 
                  className="w-6 h-6 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://paxlete.com/public/logo/socialmedia.jpg' }}
                />
              </a>
            ))
          ) : (
            <p className="text-[11px] text-gray-300 italic">No public social links</p>
          )}
        </div>
      </div>

   <div className="flex justify-center mt-4">
  <button
    onClick={handleFollowToggle}
    disabled={isOwnProfile}
    className={`w-[90%] sm:w-[320px] py-3 rounded-full text-sm font-bold transition-all ${
      isOwnProfile 
        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-80" // Style for Self
        : profile.followtype === "Following"
          ? "bg-gray-100 text-gray-700 border border-gray-200"
          : "bg-purple-600 text-white shadow-md hover:bg-purple-700"
    }`}
  >
    {isOwnProfile ? "Follow Me!" : (profile.followtype === "Following" ? "Following" : "Follow Me!")}
  </button>
</div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 sm:px-6 py-4">
        {STATS.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4 transition-transform hover:scale-[1.02]`}>
            <div className="mb-2">{s.icon}</div>
            <p className={`text-[22px] font-extrabold ${s.valueCls}`}>{s.value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 sm:px-6 pb-8">
        <div className="flex flex-col gap-3">
          <h3 className="text-[14px] font-bold text-gray-800 px-1">Personal Records</h3>
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl ${h.bg} flex items-center justify-center flex-shrink-0`}>{h.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900">{h.title}</p>
                <p className="text-[11px] text-gray-400 truncate">{h.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[14px] font-bold text-gray-800 px-1">Recent Activity</h3>
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Activity size={18} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900">Workout tracked</p>
              <p className="text-[11px] text-gray-400">Successfully synced data</p>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(null)} className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <X size={14} />
            </button>
            {modal === "edit" && <EditProfilePage profileData={profile} onClose={() => setModal(null)} onUpdateSuccess={() => fetchProfileData(profile.username)} />}
            {modal === "social" && <SocialLinksPage userId={profile.id} onClose={() => setModal(null)} />}
          </div>
        </div>
      )}
    </div>
  );
}