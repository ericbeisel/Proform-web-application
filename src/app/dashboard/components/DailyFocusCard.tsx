"use client";

import { useRouter } from "next/navigation";
import { Map, HeartPulse, Moon, Apple, Droplet } from "lucide-react";

export default function DailyFocusCard() {
  const router = useRouter();

  const items = [
    {
      icon: Map,
      title: "Itinerary",
      desc: "Plan your day",
      color: "bg-[#6c5ce7]/10 text-[#6c5ce7]",
    },
    {
      icon: HeartPulse,
      title: "Cardio",
      desc: "20 mins pending",
      color: "bg-[#00b894]/10 text-[#00b894]",
    },
    {
      icon: Moon,
      title: "Recovery",
      desc: "Stretch & rest",
      color: "bg-[#0984e3]/10 text-[#0984e3]",
      route: "/recovery/suggestedRecovery",
    },
    {
      icon: Apple,
      title: "Macros",
      desc: "Track nutrition",
      color: "bg-[#fd7b4d]/10 text-[#fd7b4d]",
    },
    {
      icon: Droplet,
      title: "Hydrate",
      desc: "3/8 glasses",
      color: "bg-[#00cec9]/10 text-[#00cec9]",
      route: "/hydration/submitHydration", // 👈 add route
    },
  ];

  const handleClick = (item: any) => {
    if (item.route) {
      router.push(item.route);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-[#e8e6f0] p-4 mt-4">
      <h3 className="font-bold text-sm mb-3">Today's Focus</h3>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => handleClick(item)}
            className={`flex items-center gap-3 p-3 rounded-xl bg-[#f8f7fc] transition
              ${item.route ? "cursor-pointer hover:shadow-md" : ""}
            `}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}
            >
              <item.icon size={18} />
            </div>

            <div>
              <div className="text-sm font-semibold">{item.title}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}