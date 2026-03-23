"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  Eye, 
  EyeOff,
  ArrowLeft
} from "lucide-react";
import { profileApi, DetailedSocialMedia } from "@/api/profile/route";

interface SocialLinksPageProps {
  userId: number | string;
  onClose?: () => void;
}

export default function SocialLinksPage({ userId, onClose }: SocialLinksPageProps) {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  
  // Store the list from API to handle dynamic logos and platforms
  const [platforms, setPlatforms] = useState<DetailedSocialMedia[]>([]);
  const [links, setLinks] = useState<Record<string, { url: string; hide: string }>>({});

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        setLoading(true);
        const data: DetailedSocialMedia[] = await profileApi.getSocialMedia(userId);
        console.log("Fetched socials:", data);
        
        // Map API data to our state
        const initialLinks: Record<string, { url: string; hide: string }> = {};
        data.forEach((item) => {
          initialLinks[item.type] = { 
            url: item.url || "", 
            hide: item.hide || "0" 
          };
        });

        setPlatforms(data);
        setLinks(initialLinks);
      } catch (err) {
        console.error("Failed to load socials", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSocials();
  }, [userId]);

  const handleSavePlatform = async (key: string) => {
    try {
      setSavingKey(key);
      await profileApi.editSocialMedia({
        user_id: userId,
        type: key,
        url: links[key].url,
        hide: links[key].hide,
      });
    } catch (err) {
      alert(`Failed to save ${key}`);
    } finally {
      setSavingKey(null);
    }
  };

  const toggleHide = async (key: string) => {
    const newHide = links[key].hide === "1" ? "0" : "1";
    
    setLinks(prev => ({
      ...prev,
      [key]: { ...prev[key], hide: newHide }
    }));

    try {
      await profileApi.editSocialMedia({
        user_id: userId,
        type: key,
        url: links[key].url,
        hide: newHide,
      });
    } catch (err) {
      console.error("Failed to sync visibility", err);
    }
  };

  if (loading) return (
    <div className="h-[400px] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#6202AC]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Links</h1>
            <p className="text-sm text-gray-500">Add your social media profiles to share with followers</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="bg-[#6202AC] hover:bg-[#4d018a] text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
        >
          Done
        </button>
      </div>

      {/* Grid Content */}
      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => (
            <div 
              key={platform.type} 
              className="bg-[#F9FAFB] rounded-[2rem] border border-gray-100 p-8 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card Header with Dynamic Logo */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border border-gray-100">
                  {platform.logo ? (
                    <img 
                      src={platform.logo} 
                      alt={platform.type} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center font-bold text-gray-400 uppercase text-[10px]">
                      {platform.type.substring(0, 2)}
                    </div>
                  )}
                </div>
                <span className="text-base font-bold text-gray-900 capitalize">
                  {platform.type === "247Sporys" ? "247 Sports" : platform.type}
                </span>
              </div>

              {/* Input Area */}
              <div className="space-y-4">
                <input
                  type="url"
                  value={links[platform.type]?.url || ""}
                  onChange={(e) => setLinks(prev => ({
                    ...prev,
                    [platform.type]: { ...prev[platform.type], url: e.target.value }
                  }))}
                  placeholder={`Enter your ${platform.type} URL`}
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#6202AC]/10 focus:border-[#6202AC] outline-none transition-all"
                />

                {/* Hide Toggle */}
                <button
                  onClick={() => toggleHide(platform.type)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors ml-1"
                >
                  {links[platform.type]?.hide === "1" ? (
                    <><EyeOff size={16} /> Hide from profile</>
                  ) : (
                    <><Eye size={16} /> Hide from profile</>
                  )}
                </button>

                {/* Save Button */}
                <button
                  onClick={() => handleSavePlatform(platform.type)}
                  disabled={savingKey === platform.type}
                  className="w-full bg-[#6202AC] hover:bg-[#4d018a] text-white font-bold py-4 rounded-2xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                >
                  {savingKey === platform.type ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}