// app/dashboard/components/ForYouCard.tsx
import { useState } from "react";
import { Flame, Target, TrendingUp, Award } from "lucide-react";

interface ForYouCardProps {
  currentWeight?: number;
  goalWeight?: number;
  measurementUnit?: string;
  trainingGoals?: string[];
}

export default function ForYouCard({
  currentWeight,
  goalWeight,
  measurementUnit = "lbs",
  trainingGoals = [],
}: ForYouCardProps) {
  // Carousel items based on user data
  const carouselItems = [
    {
      icon: Flame,
      title: "Complete Cardio",
      description: "Stay on track to meet your Cardio Goals",
      color: "from-[#6c5ce7] to-[#a29bfe]",
    },
    {
      icon: Target,
      title: currentWeight
        ? `Current: ${currentWeight} ${measurementUnit}`
        : "Track Weight",
      description: goalWeight
        ? `Goal: ${goalWeight} ${measurementUnit}`
        : "Set your weight goals",
      color: "from-[#fd7b4d] to-[#fdcb6e]",
    },
    {
      icon: TrendingUp,
      title: trainingGoals[0] || "Build Strength",
      description: "Continue your fitness journey",
      color: "from-[#00b894] to-[#55efc4]",
    },
    {
      icon: Award,
      title: "Weekly Challenge",
      description: "Complete 5 workouts this week",
      color: "from-[#e17055] to-[#fab1a0]",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = carouselItems[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselItems.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === carouselItems.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-[#e8e6f0] overflow-hidden">
      <div className="px-5 pt-4 pb-0">
        <h3 className="font-bold text-sm">For You</h3>
      </div>
      <div className="m-3 mb-4 bg-[#1c1929] rounded-xl p-7 text-center relative">
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 rounded-full text-white text-sm flex items-center justify-center hover:bg-white/20 transition"
        >
          ‹
        </button>

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

        <div className="flex justify-center gap-1.5 mt-3.5">
          {carouselItems.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? "w-4.5 bg-[#a29bfe]" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 rounded-full text-white text-sm flex items-center justify-center hover:bg-white/20 transition"
        >
          ›
        </button>
      </div>
    </div>
  );
}
