"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

const sessions = [
  {
    id: 1,
    date: "4/7/2026",
    title: "Foam Rolling",
    duration: "6 minutes",
  },
  {
    id: 2,
    date: "4/7/2026",
    title: "Massage",
    duration: "30 minutes",
  },
  {
    id: 3,
    date: "4/7/2026",
    title: "Massage",
    duration: "30 minutes",
  },
  {
    id: 4,
    date: "4/7/2026",
    title: "Foam Rolling",
    duration: "6 minutes",
  },
];

export default function RecoverySessions() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6 max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Recovery Sessions
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl mt-1">
            Choose from our list of proven and trusted recovery methods used by
            top athletes and health professionals in the industry
          </p>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200">
          <ChevronLeft size={18} />
        </button>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-10 py-3 rounded-full text-sm font-semibold shadow-xl">
          4/6/2026 - 4/12/2026
        </div>

        <button className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Session List - Premium 3D Cards */}
      <div className="space-y-5 max-w-5xl mx-auto">
        {sessions.map((item, index) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-2xl p-5 flex items-center justify-between 
              shadow-[0_20px_35px_-8px_rgba(0,0,0,0.2),0_5px_12px_-4px_rgba(0,0,0,0.1)]
              hover:shadow-[0_25px_40px_-12px_rgba(0,0,0,0.25)]
              hover:-translate-y-1.5 
              transition-all duration-300 cursor-pointer
              before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:hover:opacity-100 before:transition-opacity"
            onClick={() => router.push(`/recovery/${item.id}`)}
          >
            {/* Left */}
            <div className="flex items-center gap-5 relative z-10">
              {/* Icon with 3D effect */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 
                flex items-center justify-center shadow-lg group-hover:shadow-xl 
                transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <div className="w-7 h-7 bg-white/30 rounded-md backdrop-blur-sm" />
              </div>

              {/* Text */}
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{item.date}</p>
                <p className="font-bold text-gray-800 text-xl mt-1">{item.title}</p>
                <p className="text-sm text-purple-600 font-bold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                  {item.duration}
                </p>
              </div>
            </div>

            {/* Bookmark */}
            <button 
              className="p-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 relative z-10"
              onClick={(e) => {
                e.stopPropagation();
                // Handle bookmark
              }}
            >
              <Bookmark size={18} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}