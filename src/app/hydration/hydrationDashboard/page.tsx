"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft, Settings, Pencil, Clock, Droplet, Calendar, Plus, X,
  GlassWater, Camera, Check, Bell, BellOff, CalendarDays, Upload, Minus
} from "lucide-react";
import { useRouter } from "next/navigation";

const WaterBottle = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21h6a2 2 0 0 0 2-2V9.17a2 2 0 0 0-.59-1.42L14.5 5.83A2 2 0 0 1 14 4.41V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1.41c0 .54-.21 1.05-.59 1.42L7.59 7.75A2 2 0 0 0 7 9.17V19a2 2 0 0 0 2 2Z" />
    <path d="M7 13h10" />
    <path d="M9 2v2" />
    <path d="M15 2v2" />
  </svg>
);

const timelineItems = [
  { time: "8 PM",  oz: "14 oz", target: "Target: 98 oz total", done: false, active: false },
  { time: "5 PM",  oz: "20 oz", target: "Target: 84 oz total", done: false, active: true },
  { time: "2 PM",  oz: "24 oz", target: "Target: 64 oz total", done: true,  active: false },
  { time: "11 AM", oz: "24 oz", target: "Target: 40 oz total", done: true,  active: false },
  { time: "8 AM",  oz: "16 oz", target: "Target: 16 oz total", done: true,  active: false },
];

const hydrateOptions = [
  { label: "8 oz",  sublabel: "Small Glass",     color: "#4f8ef7", bg: "#e8f0fe" },
  { label: "16 oz", sublabel: "Standard Bottle", color: "#2ecf8a", bg: "#e0f9f0" },
  { label: "24 oz", sublabel: "Large Bottle",    color: "#a855f7", bg: "#f3e8ff" },
];

const tags = [
  "25g Protein",
  "5g Creatine",
  "5g Glutamine",
  "100mg Electrolytes",
  "10g BCAA's",
  "Pre-Workout",
];

interface HydrationEntry {
  id: number;
  amount: string;
  timestamp: string;
  time: string;
  tags: { name: string; value: string }[];
}

export default function HydrationDashboard() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedOz, setSelectedOz] = useState<string>("");
  const [customOz, setCustomOz] = useState<number>(32);
  const [isCustom, setIsCustom] = useState(false);
  const [selectedTags, setSelectedTags] = useState<{ name: string; value: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showItineraryMessage, setShowItineraryMessage] = useState(false);
  const [hydrationHistory, setHydrationHistory] = useState<HydrationEntry[]>([
    {
      id: 1,
      amount: "24 oz",
      timestamp: "2:00 PM",
      time: "2 hours ago",
      tags: [{ name: "25g Protein", value: "25" }, { name: "5g Creatine", value: "5" }],
    },
    {
      id: 2,
      amount: "16 oz",
      timestamp: "11:00 AM",
      time: "5 hours ago",
      tags: [{ name: "100mg Electrolytes", value: "100" }],
    },
    {
      id: 3,
      amount: "8 oz",
      timestamp: "8:00 AM",
      time: "8 hours ago",
      tags: [],
    },
  ]);

  useEffect(() => {
    const showMessage = localStorage.getItem("showItineraryMessage");
    if (showMessage === "true") {
      setShowItineraryMessage(true);
      localStorage.removeItem("showItineraryMessage");
    }
  }, []);

  const handleItineraryClick = () => {
    setShowItineraryMessage(false);
    router.push("/itinerary");
  };

  const handleClick = (label: string) => {
    if (label === "0 oz") {
      setIsCustom(true);
      setCustomOz(32);
    } else {
      setIsCustom(false);
      setSelectedOz(label);
    }
    setSelectedTags([]);
    setSubmitted(false);
    setShowModal(true);
  };

  const handleTagClick = (tag: string) => {
    const exists = selectedTags.find((t) => t.name === tag);
    if (exists) {
      setSelectedTags(selectedTags.filter((t) => t.name !== tag));
    } else {
      setSelectedTags([...selectedTags, { name: tag, value: "0" }]);
    }
  };

  const handleTagValueChange = (tag: string, newValue: string) => {
    setSelectedTags((prev) =>
      prev.map((t) => (t.name === tag ? { ...t, value: newValue } : t))
    );
  };

  const handleSubmit = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newEntry: HydrationEntry = {
      id: Date.now(),
      amount: isCustom ? `${customOz} oz` : selectedOz,
      timestamp: timeString,
      time: "Just now",
      tags: [...selectedTags],
    };

    setHydrationHistory([newEntry, ...hydrationHistory]);
    setSubmitted(true);

    setTimeout(() => {
      setShowModal(false);
      setSelectedTags([]);
      setCustomOz(32);
      setSubmitted(false);
    }, 1500);
  };

  const getAmountColor = (amount: string) => {
    const oz = parseInt(amount);
    if (oz <= 8)  return "text-blue-500";
    if (oz <= 16) return "text-green-500";
    if (oz <= 24) return "text-purple-500";
    if (oz <= 32) return "text-orange-500";
    return "text-teal-500";
  };

  const renderModalIcon = () => {
    const colorClass = "text-[#00aeef]";
    const oz = parseInt(selectedOz);
    if (oz === 8)  return <GlassWater size={54} className={colorClass} strokeWidth={2} />;
    if (oz === 16) return <WaterBottle size={54} className={colorClass} />;
    if (oz === 24) return <WaterBottle size={68} className={colorClass} />;
    return <Droplet size={54} className={colorClass} />;
  };

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8]">

      {/* HEADER */}
      <div className="w-full bg-purple-600 px-6 sm:px-8 py-4 sm:py-5">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 border-none rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all"
            >
              <ArrowLeft size={18} color="white" />
            </button>
            <div>
              <div className="text-white font-extrabold text-lg sm:text-xl leading-tight">Hydration Dashboard</div>
              <div className="text-white/80 text-xs sm:text-sm mt-0.5">Track your hydration journey</div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-none rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all"
            >
              <Settings size={20} color="gray" />
            </button>
            <button
              onClick={() => router.push("/hydration/fieldWorkoutTimes")}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-none rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all"
            >
              <Pencil size={20} color="gray" />
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {showItineraryMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div
            onClick={handleItineraryClick}
            className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 cursor-pointer hover:bg-green-600 transition-all"
          >
            <CalendarDays size={20} />
            <span className="font-medium">Hydration saved to itinerary!</span>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">

        {/* MAIN CARD */}
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="text-center mb-8">
            <div className="font-extrabold text-xl sm:text-2xl text-[#1a1a2e]">Daily Hydration Target</div>
            <div className="text-sm text-gray-400 mt-2">Follow the timeline to stay on track</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            <div className="text-center lg:text-left">
              <div className="font-extrabold text-base sm:text-lg text-[#1a1a2e]">Hydration Timeline</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">Drink water throughout the day</div>
            </div>

            <div className="flex justify-center items-center">
              <svg width="260" height="228" viewBox="0 0 260 228" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="115" y="4" width="30" height="18" rx="6" fill="#333" />
                <rect x="118" y="18" width="24" height="16" rx="4" fill="#cce9f0" stroke="#b0d8e6" strokeWidth="1.5" />
                <rect x="95" y="32" width="70" height="172" rx="22" fill="#e8f6fb" stroke="#b0d8e6" strokeWidth="2" />
                <clipPath id="bottleClip">
                  <rect x="96" y="33" width="68" height="170" rx="21" />
                </clipPath>
                <rect x="96" y="104" width="68" height="101" fill="#2bb5c8" opacity="0.85" clipPath="url(#bottleClip)" />
                <rect x="104" y="50" width="10" height="60" rx="5" fill="white" opacity="0.35" />
                <rect x="103" y="110" width="54" height="36" rx="8" fill="white" opacity="0.93" />
                <text x="130" y="131" textAnchor="middle" fill="#2bb5c8" fontSize="14" fontWeight="800">65%</text>
                <text x="130" y="143" textAnchor="middle" fill="#888" fontSize="9">64 of 98 oz</text>
                <line x1="95" y1="76" x2="58" y2="76" stroke="#2bb5c8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="95" cy="76" r="3" fill="#2bb5c8" />
                <rect x="2" y="66" width="54" height="20" rx="6" fill="#2bb5c8" />
                <text x="29" y="80" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">5 PM</text>
                <line x1="95" y1="150" x2="58" y2="150" stroke="#2bb5c8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="95" cy="150" r="3" fill="#2bb5c8" />
                <rect x="0" y="140" width="56" height="20" rx="6" fill="#2bb5c8" />
                <text x="28" y="154" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">11 AM</text>
                <line x1="165" y1="46" x2="202" y2="46" stroke="#d0d0d8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="165" cy="46" r="3" fill="#d0d0d8" />
                <rect x="204" y="36" width="54" height="20" rx="6" fill="#f0f0f8" />
                <text x="231" y="50" textAnchor="middle" fill="#aaa" fontSize="9" fontWeight="700">8 PM</text>
                <line x1="165" y1="112" x2="202" y2="112" stroke="#2bb5c8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="165" cy="112" r="3" fill="#2bb5c8" />
                <rect x="204" y="102" width="54" height="20" rx="6" fill="#2bb5c8" />
                <text x="231" y="116" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">2 PM</text>
                <line x1="165" y1="188" x2="202" y2="188" stroke="#2bb5c8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="165" cy="188" r="3" fill="#2bb5c8" />
                <rect x="204" y="178" width="54" height="20" rx="6" fill="#2bb5c8" />
                <text x="231" y="192" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">8 AM</text>
              </svg>
            </div>

            <div className="flex flex-col justify-center gap-5">
              {timelineItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold min-w-[80px] ${
                    item.done || item.active ? "bg-[#2bb5c8] text-white" : "bg-[#f0f0f8] text-[#888]"
                  }`}>
                    <Clock size={11} />
                    {item.time}
                  </div>
                  {item.done ? (
                    <div className="w-6 h-6 bg-[#2bb5c8] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-extrabold text-[#1a1a2e]">{item.oz}</div>
                    <div className="text-xs text-gray-400">{item.target}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-100">
            {[
              { icon: <Droplet size={20} color="#4f8ef7" />, bg: "#e8f0fe", val: "64 oz", sub: "Consumed Today" },
              { icon: <Droplet size={20} color="#a855f7" />, bg: "#f3e8ff", val: "34 oz", sub: "Remaining" },
              { icon: <Clock size={20} color="#2bb5c8" />,   bg: "#e0f7fa", val: "5 PM",  sub: "Next Target" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: s.bg }}>
                  {s.icon}
                </div>
                <div className="font-extrabold text-xl sm:text-2xl text-[#1a1a2e]">{s.val}</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ADD YOUR HYDRATION SECTION */}
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="font-extrabold text-2xl sm:text-2xl text-[#1a1a2e]">Add Your Hydration</div>
              <div className="text-sm sm:text-base text-gray-400 mt-1">Quick add presets to track your intake</div>
            </div>
            <button
              onClick={() => handleClick("16 oz")}
              className="bg-gradient-to-r from-[#2bb5c8] to-[#1a9db5] text-white border-none rounded-xl px-6 py-3.5 text-base font-bold cursor-pointer hover:shadow-lg transition-all flex items-center gap-2 w-full sm:w-auto justify-center active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              Add Hydration
            </button>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4 sm:gap-6 w-full">
            {hydrateOptions.map((item, i) => (
              <div
                key={i}
                onClick={() => handleClick(item.label)}
                className="flex-1 min-w-[140px] border-2 border-gray-100 rounded-2xl p-5 flex flex-col items-center cursor-pointer hover:shadow-md hover:border-[#2bb5c8]/30 hover:-translate-y-1 transition-all active:scale-95 bg-white"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm"
                  style={{ background: item.bg }}
                >
                  <Droplet size={26} color={item.color} fill={item.color} />
                </div>
                <div className="font-black text-lg sm:text-base text-[#1a1a2e]">{item.label}</div>
                <div className="text-[13px] sm:text-xs text-gray-400 font-medium mt-1 text-center leading-tight">{item.sublabel}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleClick("0 oz")}
            className="w-full mt-4 bg-[#f4f4f8] rounded-xl py-3.5 text-base font-semibold text-gray-500 hover:bg-[#eceef5]"
          >
            Select a custom amount
          </button>
        </div>

        {/* HYDRATION HISTORY */}
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <div className="font-extrabold text-xl sm:text-2xl text-[#1a1a2e]">Hydration History</div>
            <div className="text-sm text-gray-400 mt-1">Track your past hydration entries</div>
          </div>

          {hydrationHistory.length === 0 ? (
            <div className="text-center py-12">
              <Droplet size={48} className="mx-auto text-gray-300 mb-3" />
              <div className="text-gray-400 font-medium">No hydration entries yet</div>
              <div className="text-sm text-gray-400 mt-1">Tap "Add Hydration" to log your first entry</div>
            </div>
          ) : (
            <div className="space-y-3">
              {hydrationHistory.map((entry) => (
                <div key={entry.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-white">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#e0f7fa] flex items-center justify-center">
                        <Droplet size={20} color="#2bb5c8" />
                      </div>
                      <div>
                        <div className={`font-extrabold text-lg ${getAmountColor(entry.amount)}`}>{entry.amount}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-400">{entry.timestamp}</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-400">{entry.time}</span>
                        </div>
                      </div>
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, idx) => (
                          <span key={idx} className="bg-[#f0f4f8] text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                            {tag.name} {tag.value && `(${tag.value})`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettingsModal(false); }}
        >
          <div className="w-full max-w-md bg-white rounded-[2rem] relative shadow-2xl animate-slideUp overflow-hidden">
            <div className="p-8 pb-4 flex justify-between items-center">
              <h3 className="text-[#1a1a1a] font-extrabold text-2xl">Hydration Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-all">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="px-8 pb-8">
              <div className="flex items-center gap-3 mb-6">
                <input
                  type="checkbox"
                  id="notif-toggle"
                  checked={!notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  className="w-5 h-5 accent-purple-600 cursor-pointer rounded border-gray-300"
                />
                <label htmlFor="notif-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Check to turn off hydration notifications
                </label>
              </div>

              {!notificationsEnabled && (
                <div className="mb-6 p-3 bg-emerald-50 border border-emerald-400 rounded-xl text-center">
                  <span className="text-emerald-600 font-bold text-sm">Settings Updated Successfully</span>
                </div>
              )}

              <div className="bg-[#fff1f1] border border-red-300 p-5 rounded-[1.5rem]">
                <h4 className="text-red-600 font-extrabold text-base mb-2">Important Note:</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  To adjust your hydration goal, you must change your personal metrics from your{" "}
                  <button onClick={() => router.push("/metrics")} className="text-blue-500 underline font-medium">Metrics Page</button>{" "}
                  or submit a new{" "}
                  <button onClick={() => router.push("/log")} className="text-blue-500 underline font-medium">Player Log</button>{" "}
                  to automatically adjust.
                </p>
              </div>
            </div>

            <div className="bg-gray-50/50 p-6 px-8 flex justify-center">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white py-3.5 rounded-xl font-bold text-base shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD HYDRATION MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-md bg-white rounded-3xl relative shadow-2xl animate-slideUp overflow-hidden flex flex-col max-h-[95vh]">

            <button
              onClick={() => setShowModal(false)}
              className="absolute right-5 top-5 p-1.5 hover:bg-gray-100 rounded-full transition-all z-20"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="flex-1 overflow-y-auto px-6 pt-10 pb-4">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Add Hydration:</p>
                <h2 className="text-3xl font-black text-gray-900">
                  {isCustom ? "Custom" : selectedOz}
                </h2>
              </div>

              <button className="w-full bg-[#0e99b6] hover:bg-[#0c88a3] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-6">
                <Upload size={18} /> Upload Photo
              </button>

              {/* ICON / CUSTOM STEPPER */}
              <div className={`flex flex-col items-center mb-8 transition-all ${isCustom ? "bg-[#ebf8ff] rounded-3xl p-8" : "p-4"}`}>
                {!isCustom ? (
                  <div className="py-4 animate-fadeIn">
                    {renderModalIcon()}
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center animate-fadeIn">
                    <div className="text-[#00aeef] mb-3">
                      <Droplet size={48} fill="currentColor" />
                    </div>
                    <div className="flex items-center justify-between w-full max-w-[220px]">
                      <button
                        onClick={() => setCustomOz(Math.max(0, customOz - 1))}
                        className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 text-2xl font-bold active:scale-90"
                      >−</button>
                      <div className="text-center">
                        <span className="text-6xl font-black text-gray-800 tracking-tighter leading-none">{customOz}</span>
                        <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">oz</p>
                      </div>
                      <button
                        onClick={() => setCustomOz(customOz + 1)}
                        className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 text-2xl font-bold active:scale-90"
                      >+</button>
                    </div>
                  </div>
                )}
              </div>

              {/* NUTRIENTS */}
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-gray-900 text-sm">Add Nutrients</h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 px-1">
                {tags.map((tag, i) => {
                  const isSelected = selectedTags.find((t) => t.name === tag);
                  return (
                    <button
                      key={i}
                      onClick={() => handleTagClick(tag)}
                      className={`py-2 px-4 rounded-full text-[10px] font-bold transition-all border ${
                        isSelected
                          ? "bg-[#7c3aed] text-white border-transparent"
                          : "bg-white text-gray-500 border-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {selectedTags.length > 0 && (
                <div className="bg-[#f8fafd] rounded-2xl p-4 space-y-3">
                  {selectedTags.map((tag, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{tag.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">g</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleTagValueChange(tag.name, String(Math.max(0, parseInt(tag.value || "0") - 1)))}
                          className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="font-black text-gray-800 w-6 text-center">{tag.value || "0"}</span>
                        <button
                          onClick={() => handleTagValueChange(tag.name, String(parseInt(tag.value || "0") + 1))}
                          className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUBMIT */}
            <div className="p-6 pt-2 text-center bg-white border-t border-gray-50">
              <p className="text-gray-400 text-[10px] font-medium mb-4">Tap to submit this hydration for today:</p>
              <button
                onClick={handleSubmit}
                disabled={submitted}
                className={`w-full py-3.5 rounded-xl font-black text-lg text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                  submitted ? "bg-green-500" : "bg-[#5d00b4] hover:bg-[#4a0091]"
                }`}
              >
                {submitted ? <><Check size={20} strokeWidth={3} /> Submitted!</> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
}