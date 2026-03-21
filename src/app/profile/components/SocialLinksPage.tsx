"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Loader2, Check, Globe } from "lucide-react";
import { profileApi, DetailedSocialMedia } from "@/api/profile/route";
const SOCIAL_PLATFORMS = [
  {
    key: "discord",
    label: "Discord",
    placeholder: "Enter your Discord URL",
    iconBg: "bg-indigo-500",
  },
  { key: "x", label: "X", placeholder: "Enter your X URL", iconBg: "bg-black" },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "Enter your YouTube URL",
    iconBg: "bg-red-500",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "Enter your LinkedIn URL",
    iconBg: "bg-blue-600",
  },
  {
    key: "github",
    label: "GitHub",
    placeholder: "Enter your GitHub URL",
    iconBg: "bg-gray-900",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "Enter your Instagram URL",
    iconBg: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400",
  },
  {
    key: "proform",
    label: "Proform",
    placeholder: "Enter your Proform URL",
    iconBg: "bg-orange-500",
  },
];

interface SocialLinksPageProps {
  userId: number | string;
  onClose?: () => void;
}

export default function SocialLinksPage({
  userId,
  onClose,
}: SocialLinksPageProps) {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [links, setLinks] = useState<
    Record<string, { url: string; hide: string }>
  >(
    Object.fromEntries(
      SOCIAL_PLATFORMS.map((p) => [p.key, { url: "", hide: "0" }]),
    ),
  );

  // 1. Fetch existing social media on mount
  useEffect(() => {
    const fetchSocials = async () => {
      try {
        setLoading(true);
        const data: DetailedSocialMedia[] =
          await profileApi.getSocialMedia(userId);
console.log("Fetched social media:", data); 
        const newLinks = { ...links };
        data.forEach((item) => {
          if (newLinks[item.type]) {
            newLinks[item.type] = { url: item.url, hide: item.hide };
          }
        });
        setLinks(newLinks);
      } catch (err) {
        console.error("Failed to load socials", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSocials();
  }, [userId]);

  // 2. Save individual platform
  const handleSavePlatform = async (key: string) => {
    try {
      setSavingKey(key);
      await profileApi.editSocialMedia({
        user_id: userId,
        type: key,
        url: links[key].url,
        hide: links[key].hide,
      });
      // Optional: Show a brief success toast/state
    } catch (err) {
      alert(`Failed to save ${key}`);
    } finally {
      setSavingKey(null);
    }
  };

  const toggleHide = (key: string) => {
    const newHide = links[key].hide === "0" ? "1" : "0";
    setLinks((prev) => ({
      ...prev,
      [key]: { ...prev[key], hide: newHide },
    }));
    // Auto-save toggle change
    setTimeout(() => handleSavePlatform(key), 100);
  };

  if (loading)
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );

  return (
    <div
      className="min-h-[400px] bg-white flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div>
            <h1 className="text-[20px] font-extrabold text-gray-900">
              Social Links
            </h1>
            <p className="text-[12px] text-gray-400">
              Manage your connected profiles
            </p>
          </div>
        </div>
        {/* <button
          onClick={onClose}
          className="bg-purple-700 hover:bg-purple-800 text-white text-[13px] font-bold px-6 py-2 rounded-xl transition-colors "
        >
          Done
        </button> */}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 overflow-y-auto max-h-[70vh]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div
              key={platform.key}
              className="bg-gray-50 rounded-2xl border border-gray-100 p-4 transition-all hover:border-purple-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${platform.iconBg} flex items-center justify-center text-white`}
                  >
                    <Globe size={16} /> {/* Replace with your SVGs */}
                  </div>
                  <p className="text-[13px] font-bold text-gray-900">
                    {platform.label}
                  </p>
                </div>

                {links[platform.key].url && (
                  <button
                    onClick={() => handleSavePlatform(platform.key)}
                    disabled={savingKey === platform.key}
                    className="text-purple-600 text-[11px] font-bold hover:underline"
                  >
                    {savingKey === platform.key ? "Saving..." : "Save"}
                  </button>
                )}
              </div>

              <input
                type="url"
                value={links[platform.key].url}
                onChange={(e) =>
                  setLinks((prev) => ({
                    ...prev,
                    [platform.key]: {
                      ...prev[platform.key],
                      url: e.target.value,
                    },
                  }))
                }
                placeholder={platform.placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition"
              />

              <button
                onClick={() => toggleHide(platform.key)}
                className={`mt-2 text-[10px] font-bold transition-colors ${links[platform.key].hide === "1" ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
              >
                {links[platform.key].hide === "1"
                  ? "Hidden from profile"
                  : "Visible on profile"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
