"use client";

import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Heart,
  Waves,
  Flame,
  Shield,
  Sun,
  Zap,
  Circle,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* DATA */
const suggested = [
  { title: "Hottub", time: "10-15m", icon: Waves, color: "bg-teal-500" },
  { title: "Infrared Sauna", time: "10-20m", icon: Flame, color: "bg-orange-500" },
  { title: "Compression", time: "15-10m", icon: Shield, color: "bg-purple-500" },
];

const favorites = [
  { title: "Red-Light Mask", time: "10-20m", icon: Sun, color: "bg-pink-500" },
  { title: "Massage Gun", time: "1-4m", icon: Zap, color: "bg-indigo-500" },
  { title: "Foam Rolling", time: "5-10m", icon: Circle, color: "bg-teal-600" },
];

export default function RecoveryPage() {
  const router = useRouter();

  const handleNavigate = (title: string) => {
    const slug = title.toLowerCase().replace(/\s+/g, "-");
    router.push(`/recovery/selectedRecovery/${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">

      {/* HEADER */}
      <div className="w-full bg-purple-600 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
        <div className="w-full flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <ArrowLeft size={18} color="white" />
            </button>

            <div>
              <div className="text-white font-extrabold text-base sm:text-lg md:text-xl">
                Submit Recovery
              </div>
              <div className="text-white/80 text-[10px] sm:text-xs md:text-sm mt-0.5">
                Track your recovery activities
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white/20 rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 flex items-center gap-2 backdrop-blur-sm border border-white/30">
            <Calendar size={14} className="sm:w-4 sm:h-4" color="white" />
            <div className="text-right">
              <div className="text-white/80 text-[9px] sm:text-[10px] font-semibold uppercase">
                TIME LEFT
              </div>
              <div className="text-white text-sm sm:text-base md:text-lg font-extrabold">
                60m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 md:px-8 py-6 space-y-8">

        {/* SUGGESTED */}
        <div>
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-800 text-sm sm:text-base">
            <Sparkles size={16} className="text-green-500" />
            Suggested:
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {suggested.map((item, i) => (
              <Card
                key={i}
                {...item}
                onClick={() => handleNavigate(item.title)}
              />
            ))}
          </div>
        </div>

        {/* FAVORITES */}
        <div>
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-800 text-sm sm:text-base">
            <Heart size={16} className="text-red-500" />
            Favorites:
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favorites.map((item, i) => (
              <Card
                key={i}
                {...item}
                onClick={() => handleNavigate(item.title)}
              />
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center pt-6 space-y-4 flex flex-col items-center">
          <button className="text-purple-700 text-sm font-medium">
            All Recovery Options
          </button>

          <button className="bg-purple-700 hover:bg-purple-800 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md text-sm sm:text-base">
            View Recovery Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

/* CARD */
function Card({
  title,
  time,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  time: string;
  icon: any;
  color: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-[#dfeceb] rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
    >
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl ${color} flex items-center justify-center shadow-md mb-3 sm:mb-4`}>
        <Icon size={22} className="sm:w-6 sm:h-6" color="white" />
      </div>

      <p className="font-medium text-gray-800 text-sm sm:text-base">{title}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  );
}