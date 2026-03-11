"use client";

import { useState, useEffect } from "react";
import { Trash2, ChevronDown, ChevronUp, Calendar, CalendarCheck, ArrowLeft } from "lucide-react";

const SCHEDULE_DAYS = [
  { day: "Mo", time: "08:30" },
  { day: "We", time: "08:30" },
  { day: "Fr", time: "08:30" },
  { day: "Sa", time: "08:30" },
  { day: "Sa", time: "07:30" },
  { day: "Su", time: "09:00" },
];

const INITIAL_ITEMS = [
  {
    id: 1,
    group: "Group 1 | Day 2",
    name: "Reconditioning",
    subtitle: "UPPER BODY",
    tags: ["5-SS", "5-1S", "3RYS"],
    scheduleDay: "on Monday @ 08:30",
    progress: "2/9",
    imageBg: "bg-yellow-400",
    imageUrl: "",
  },
  {
    id: 2,
    group: "Group 1 | Day 1",
    name: "Reconditioning",
    subtitle: "LOWER BODY",
    tags: ["5-SS", "5-1S"],
    scheduleDay: "on Wednesday @ 08:30",
    progress: "1/9",
    imageBg: "bg-gray-300",
    imageUrl: "",
  },
  {
    id: 3,
    group: "Group 1 | Day 3",
    name: "Reconditioning",
    subtitle: "FULL BODY",
    tags: ["Supplement", "5-1S"],
    scheduleDay: "on Friday @ 08:30",
    progress: "3/9",
    imageBg: "bg-blue-300",
    imageUrl: "",
  },
];

// Mobile breakpoint hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
}

export default function QueuePage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [filter, setFilter] = useState("All");

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setItems(next);
  };

  const moveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setItems(next);
  };

  const removeItem = (id: number) => setItems(items.filter((i) => i.id !== id));

  // Filter items based on selection
  const filteredItems = filter === "All" 
    ? items 
    : items.filter(item => item.tags.some(tag => tag.includes(filter)));

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3 border-b border-gray-100">
        {/* <button className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-gray-700 transition-colors p-2">
          <ArrowLeft size={isMobile ? 18 : 16} />
          {!isMobile && <span className="text-sm">Back</span>}
        </button> */}

        <span className="bg-red-500 text-white text-[10px] sm:text-[11px] font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
          {isMobile ? "0" : "0 Completed"}
        </span>

        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-[11px] sm:text-[12px] text-gray-500 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 bg-white focus:outline-none focus:border-gray-300"
        >
          <option>All</option>
          <option>Primary</option>
          <option>Cardio</option>
        </select>
      </div>

      {/* ── Hero title ── */}
      <div className="text-center pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-6">
        <h1 className="text-[24px] sm:text-[28px] font-extrabold text-purple-700 tracking-tight">
          {isMobile ? "Queue" : "Workout Queue"}
        </h1>
        <div className="flex items-center justify-center gap-1 mt-2 flex-wrap px-2">
          {SCHEDULE_DAYS.map((s, i) => (
            <span key={i} className="text-[10px] sm:text-[12]">
              <span className="font-bold text-blue-500">{s.day}</span>
              <span className="text-gray-400"> : </span>
              <span className="font-semibold text-gray-700">{s.time}</span>
              {i < SCHEDULE_DAYS.length - 1 && <span className="text-gray-300 mx-0.5">·</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 sm:gap-6 px-4 sm:px-6 pb-10 items-start`}>

        {/* Left: workout list */}
        <div className={`${isMobile ? 'w-full' : 'flex-1'} flex flex-col gap-0`}>
          {filteredItems.map((item, idx) => (
            <div key={item.id}>
              {/* Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm">
                <div className="flex gap-2 sm:gap-3">
                  {/* Image */}
                  <div className={`w-[70px] sm:w-[90px] h-[60px] sm:h-[80px] rounded-lg sm:rounded-xl ${item.imageBg} flex-shrink-0 overflow-hidden`}>
                    <div className="w-full h-full bg-gradient-to-br from-white/20 to-black/10" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] sm:text-[11px] text-gray-400 font-medium mb-0.5 truncate">{item.group}</p>
                    <p className="text-[13px] sm:text-[15px] font-bold text-cyan-500 leading-tight">{item.name}</p>
                    <p className="text-[10px] sm:text-[12px] font-bold text-gray-800 mt-0.5 uppercase tracking-wide truncate">{item.subtitle}</p>
                    <div className="flex gap-1 sm:gap-1.5 mt-1 sm:mt-2 flex-wrap">
                      {item.tags.slice(0, isMobile ? 2 : 3).map((tag, ti) => (
                        <span key={ti} className="bg-orange-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full">
                          {isMobile && tag.length > 5 ? tag.slice(0, 4) + "..." : tag}
                        </span>
                      ))}
                      {isMobile && item.tags.length > 2 && (
                        <span className="bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                  <span className="text-[10px] sm:text-[12px] text-cyan-500 font-semibold truncate max-w-[140px] sm:max-w-none">
                    {isMobile && item.scheduleDay.length > 20 
                      ? item.scheduleDay.slice(0, 15) + "..." 
                      : item.scheduleDay}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[10px] sm:text-[12px] text-gray-400 font-medium">{item.progress}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
                      aria-label="Remove workout"
                    >
                      <Trash2 size={isMobile ? 14 : 15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reorder buttons between cards */}
              {idx < filteredItems.length - 1 && (
                <div className="flex items-center justify-center gap-2 py-1 sm:py-2">
                  <button
                    onClick={() => moveDown(idx)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
                    aria-label="Move down"
                  >
                    <ChevronDown size={isMobile ? 12 : 14} />
                  </button>
                  <button
                    onClick={() => moveUp(idx + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
                    aria-label="Move up"
                  >
                    <ChevronUp size={isMobile ? 12 : 14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-400 text-sm">No workouts in queue</p>
            </div>
          )}
        </div>

        {/* Right: Ready to Schedule panel */}
        <div className={`${isMobile ? 'w-full' : 'w-[280px] lg:w-[340px]'} flex-shrink-0 bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 ${isMobile ? 'mt-4' : ''}`}>
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-gray-900 leading-tight mb-2">
            Ready to Schedule?
          </h2>
          <p className="text-[12px] sm:text-[13px] text-gray-400 leading-relaxed mb-4 sm:mb-5">
            {isMobile 
              ? "Organize your queue and add to your schedule when ready."
              : "Organize your workout queue and add them to your schedule or itinerary when you're ready."}
          </p>

          <button className="w-full bg-purple-700 hover:bg-purple-800 text-white text-[12px] sm:text-[13px] font-bold py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors mb-2 sm:mb-3">
            <CalendarCheck size={isMobile ? 14 : 16} />
            {isMobile ? "Schedule" : "Go to Schedule"}
          </button>

          <button className="w-full bg-white hover:bg-gray-50 text-cyan-500 border border-gray-200 text-[12px] sm:text-[13px] font-bold py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Calendar size={isMobile ? 14 : 16} />
            {isMobile ? "Itinerary" : "Go to Itinerary"}
          </button>

          {/* Stats */}
          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5">
            <div className="flex-1 bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
              <p className="text-[9px] sm:text-[11px] text-gray-400 mb-1">Total</p>
              <p className="text-[18px] sm:text-[22px] font-extrabold text-gray-900">{filteredItems.length}</p>
            </div>
            <div className="flex-1 bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
              <p className="text-[9px] sm:text-[11px] text-gray-400 mb-1">Done</p>
              <p className="text-[18px] sm:text-[22px] font-extrabold text-cyan-500">0</p>
            </div>
          </div>

          {/* Quick tips for mobile */}
        
        </div>

      </div>
    </div>
  );
}