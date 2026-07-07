// app/dashboard/components/ForYouCard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Utensils, AlertCircle, BarChart2 } from "lucide-react";

export default function ForYouCard() {
  const router = useRouter();

  const carouselItems = [
    {
      icon: Flame,
      title: "Complete Cardio",
      description: "Stay on track to meet your Cardio Goals",
      color: "from-[#6c5ce7] to-[#a29bfe]",
      route: "/todays-focus-cardio/cardio-entry",
    },
    {
      icon: Utensils,
      title: "Log a Meal!",
      description: "Track your meals with Macro-Tracker",
      color: "from-[#00cfff] to-[#00cfff]",
      route: "/micros",
    },
    {
      icon: AlertCircle,
      title: "Missed Activity",
      description: "See what you missed today/this week",
      color: "from-[#ffa726] to-[#ffa726]",
      route: "/checklist/missed-activity",
    },
    {
      icon: BarChart2,
      title: "Track your Progress",
      description: "View your results from this week",
      color: "from-[#8b7cf6] to-[#8b7cf6]",
      route: "/admin-player-progress",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = carouselItems[currentIndex];

  const handleCardClick = () => {
    if (currentItem.route) router.push(currentItem.route);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselItems.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === carouselItems.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-[#e8e6f0] overflow-hidden">
      <div className="px-5 pt-4 pb-0">
        <h3 className="font-bold text-sm">For You</h3>
      </div>

      <div className="m-3 mb-4 bg-[#1c1929] rounded-xl p-7 text-center relative">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 rounded-full text-white flex items-center justify-center hover:bg-white/20"
        >
          ‹
        </button>

        {/* Content */}
        <div
          onClick={handleCardClick}
          className={currentItem.route ? "cursor-pointer" : ""}
        >
          <div
            className={`w-14 h-14 mx-auto mb-3 bg-gradient-to-br ${currentItem.color} rounded-full flex items-center justify-center`}
          >
            <currentItem.icon size={24} className="text-white" />
          </div>

          <div className="text-white font-bold text-base">
            {currentItem.title}
          </div>

          <div className="text-white/50 text-xs mt-1.5">
            {currentItem.description}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3.5">
          {carouselItems.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? "w-5 bg-[#a29bfe]" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 rounded-full text-white flex items-center justify-center hover:bg-white/20"
        >
          ›
        </button>
      </div>
    </div>
  );
}