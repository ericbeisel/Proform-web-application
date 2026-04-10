"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Settings, Pencil, Clock, Droplet, Calendar, Plus, X, GlassWater, Camera, Check, Bell, BellOff, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

const timelineItems = [
  { time: "8 PM",  oz: "14 oz", target: "Target: 98 oz total", done: false, active: false },
  { time: "5 PM",  oz: "20 oz", target: "Target: 84 oz total", done: false, active: true },
  { time: "2 PM",  oz: "24 oz", target: "Target: 64 oz total", done: true,  active: false },
  { time: "11 AM", oz: "24 oz", target: "Target: 40 oz total", done: true,  active: false },
  { time: "8 AM",  oz: "16 oz", target: "Target: 16 oz total", done: true,  active: false },
];

const hydrateOptions = [
  { label: "8 oz",  sublabel: "Small Glass",      color: "#4f8ef7", bg: "#e8f0fe" },
  { label: "16 oz", sublabel: "Standard Bottle",  color: "#2ecf8a", bg: "#e0f9f0" },
  { label: "24 oz", sublabel: "Large Bottle",     color: "#a855f7", bg: "#f3e8ff" },

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
  const [customOz, setCustomOz] = useState("");
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
      tags: [{ name: "25g Protein", value: "25" }, { name: "5g Creatine", value: "5" }]
    },
    {
      id: 2,
      amount: "16 oz",
      timestamp: "11:00 AM",
      time: "5 hours ago",
      tags: [{ name: "100mg Electrolytes", value: "100" }]
    },
    {
      id: 3,
      amount: "8 oz",
      timestamp: "8:00 AM",
      time: "8 hours ago",
      tags: []
    },
  ]);




useEffect(() => {
  const showMessage = localStorage.getItem('showItineraryMessage');
  if (showMessage === 'true') {
    setShowItineraryMessage(true);
    // Clear the flag immediately after setting it
    localStorage.removeItem('showItineraryMessage');
  }
}, []);

    // Handle itinerary icon click
 // Handle itinerary icon click
const handleItineraryClick = () => {
  // Clear the message
  setShowItineraryMessage(false);
  // Flag is already removed from localStorage in useEffect
  // Redirect to itinerary page
  router.push('/itinerary');
};

  const handleClick = (label: string) => {
    setSelectedOz(label);
    setIsCustom(label === "0 oz");
    setSubmitted(false);
    setSelectedTags([]);
    setShowModal(true);
  };

  const handleTagClick = (tag: string) => {
    const exists = selectedTags.find((t) => t.name === tag);
    if (exists) {
      setSelectedTags(selectedTags.filter((t) => t.name !== tag));
    } else {
      setSelectedTags([...selectedTags, { name: tag, value: "" }]);
    }
  };

  const handleTagValueChange = (tag: string, value: string) => {
    setSelectedTags((prev) =>
      prev.map((t) => (t.name === tag ? { ...t, value } : t))
    );
  };

  const handleSubmit = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeAgo = "Just now";
    
    const newEntry: HydrationEntry = {
      id: Date.now(),
      amount: isCustom ? `${customOz} oz` : selectedOz,
      timestamp: timeString,
      time: timeAgo,
      tags: [...selectedTags],
    };
    
    setHydrationHistory([newEntry, ...hydrationHistory]);
    setSubmitted(true);
    
    setTimeout(() => {
      setShowModal(false);
      setSelectedTags([]);
      setCustomOz("");
      setSubmitted(false);
    }, 1500);
  };

  const getAmountColor = (amount: string) => {
    const oz = parseInt(amount);
    if (oz <= 8) return "text-blue-500";
    if (oz <= 16) return "text-green-500";
    if (oz <= 24) return "text-purple-500";
    if (oz <= 32) return "text-orange-500";
    return "text-teal-500";
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
            <button onClick={() => router.push('/hydration/fieldWorkoutTimes')}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-none rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
              <Pencil size={20} color="gray" />
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER - Shows when hydration saved to itinerary */}
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

          {/* Title */}
          <div className="text-center mb-8">
            <div className="font-extrabold text-xl sm:text-2xl text-[#1a1a2e]">Daily Hydration Target</div>
            <div className="text-sm text-gray-400 mt-2">Follow the timeline to stay on track</div>
          </div>

          {/* Timeline section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            
            {/* LEFT: Label */}
            <div className="text-center lg:text-left">
              <div className="font-extrabold text-base sm:text-lg text-[#1a1a2e]">Hydration Timeline</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">Drink water throughout the day</div>
            </div>

            {/* CENTER: Bottle with time markers on both sides */}
            <div className="flex justify-center items-center">
              <svg width="260" height="228" viewBox="0 0 260 228" fill="none" xmlns="http://www.w3.org/2000/svg">

                {/* ── BOTTLE centred at x=130 ── */}
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

                {/* ── LEFT side markers: 5 PM, 11 AM ── */}
                {/* 5 PM */}
                <line x1="95" y1="76" x2="58" y2="76" stroke="#2bb5c8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="95" cy="76" r="3" fill="#2bb5c8" />
                <rect x="2" y="66" width="54" height="20" rx="6" fill="#2bb5c8" />
                <text x="29" y="80" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">5 PM</text>

                {/* 11 AM */}
                <line x1="95" y1="150" x2="58" y2="150" stroke="#2bb5c8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="95" cy="150" r="3" fill="#2bb5c8" />
                <rect x="0" y="140" width="56" height="20" rx="6" fill="#2bb5c8" />
                <text x="28" y="154" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">11 AM</text>

                {/* ── RIGHT side markers: 8 PM, 2 PM, 8 AM ── */}
                {/* 8 PM — above water, gray/inactive */}
                <line x1="165" y1="46" x2="202" y2="46" stroke="#d0d0d8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="165" cy="46" r="3" fill="#d0d0d8" />
                <rect x="204" y="36" width="54" height="20" rx="6" fill="#f0f0f8" />
                <text x="231" y="50" textAnchor="middle" fill="#aaa" fontSize="9" fontWeight="700">8 PM</text>

                {/* 2 PM — at water line, teal/active */}
                <line x1="165" y1="112" x2="202" y2="112" stroke="#2bb5c8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="165" cy="112" r="3" fill="#2bb5c8" />
                <rect x="204" y="102" width="54" height="20" rx="6" fill="#2bb5c8" />
                <text x="231" y="116" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">2 PM</text>

                {/* 8 AM — bottom, teal/done */}
                <line x1="165" y1="188" x2="202" y2="188" stroke="#2bb5c8" strokeWidth="1.2" strokeDasharray="4 3" />
                <circle cx="165" cy="188" r="3" fill="#2bb5c8" />
                <rect x="204" y="178" width="54" height="20" rx="6" fill="#2bb5c8" />
                <text x="231" y="192" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">8 AM</text>

              </svg>
            </div>

            {/* RIGHT: Timeline items */}
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
                      <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
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

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-100">
            {[
              { icon: <Droplet size={20} color="#4f8ef7" />, bg: "#e8f0fe", val: "64 oz", sub: "Consumed Today" },
              { icon: <Droplet size={20} color="#a855f7" />, bg: "#f3e8ff", val: "34 oz", sub: "Remaining" },
              { icon: <Clock size={20} color="#2bb5c8" />, bg: "#e0f7fa", val: "5 PM", sub: "Next Target" },
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
      {/* Increased mobile text size to text-2xl */}
      <div className="font-extrabold text-2xl sm:text-2xl text-[#1a1a2e]">
        Add Your Hydration
      </div>
      <div className="text-sm sm:text-base text-gray-400 mt-1">
        Quick add presets to track your intake
      </div>
    </div>
    <button
      onClick={() => handleClick("16 oz")}
      className="bg-gradient-to-r from-[#2bb5c8] to-[#1a9db5] text-white border-none rounded-xl px-6 py-3.5 text-base font-bold cursor-pointer hover:shadow-lg transition-all flex items-center gap-2 w-full sm:w-auto justify-center active:scale-95"
    >
      <Plus size={18} strokeWidth={3} />
      Add Hydration
    </button>
  </div>

  {/* Centering Fix: 
      1. Added 'justify-center' to align the grid tracks to the middle.
      2. Added 'w-full' to ensure the grid takes up the container space.
  */}
{/* Updated to Flexbox to ensure they stretch and cover all space */}
<div className="flex flex-wrap md:flex-nowrap gap-4 sm:gap-6 w-full">
  {hydrateOptions.map((item, i) => (
    <div
      key={i}
      onClick={() => handleClick(item.label)}
      /* Added 'flex-1' so each card grows to fill equal space */
      className="flex-1 min-w-[140px] border-2 border-gray-100 rounded-2xl p-5 flex flex-col items-center cursor-pointer hover:shadow-md hover:border-[#2bb5c8]/30 hover:-translate-y-1 transition-all active:scale-95 bg-white"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm"
        style={{ background: item.bg }}
      >
        <Droplet size={26} color={item.color} fill={item.color} />
      </div>
      <div className="font-black text-lg sm:text-base text-[#1a1a2e]">
        {item.label}
      </div>
      <div className="text-[13px] sm:text-xs text-gray-400 font-medium mt-1 text-center leading-tight">
        {item.sublabel}
      </div>
    </div>
  ))}
</div>
</div>

        {/* HYDRATION HISTORY CARDS */}
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
                <div
                  key={entry.id}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#e0f7fa] flex items-center justify-center">
                        <Droplet size={20} color="#2bb5c8" />
                      </div>
                      <div>
                        <div className={`font-extrabold text-lg ${getAmountColor(entry.amount)}`}>
                          {entry.amount}
                        </div>
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
                          <span
                            key={idx}
                            className="bg-[#f0f4f8] text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium"
                          >
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSettingsModal(false);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl relative shadow-2xl animate-slideUp overflow-hidden">
            
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-5 text-center relative">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute right-4 top-4 p-1.5 bg-white/20 border-none rounded-lg cursor-pointer hover:bg-white/30 transition-all flex items-center justify-center"
              >
                <X size={18} color="white" />
              </button>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Settings size={24} color="white" />
              </div>
              <h3 className="text-white font-extrabold text-xl">Hydration Settings</h3>
            </div>

            <div className="p-6">
              {/* Checkbox Section */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  {notificationsEnabled ? (
                    <Bell size={20} className="text-purple-600" />
                  ) : (
                    <BellOff size={20} className="text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-700">Check to turn off hydration notification</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(!e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Important Note */}
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold text-sm">⚠️</span>
                  <div>
                    <span className="font-bold text-red-600 text-sm">Important note:</span>
                    <p className="text-red-700 text-sm mt-1 leading-relaxed">
                      To adjust your hydration goal you must change your personal metrics{' '}
                      <u className="cursor-pointer hover:text-red-800 transition-colors">from metrics page</u>{' '}
                      or submit new{' '}
                      <u className="cursor-pointer hover:text-red-800 transition-colors">player log</u>{' '}
                      to automatically adjust.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD HYDRATION MODAL */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-3xl relative shadow-2xl animate-slideUp overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-gradient-to-r from-[#2bb5c8] to-[#1a9db5] p-6 text-center relative flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 p-1.5 bg-white/20 border-none rounded-lg cursor-pointer hover:bg-white/30 transition-all flex items-center justify-center"
              >
                <X size={18} color="white" />
              </button>
              
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <GlassWater size={32} color="white" />
              </div>
              
              <p className="text-white/90 text-xs sm:text-sm m-0 font-medium">Add Hydration</p>
              
              {isCustom ? (
                <div className="mt-2">
                  <input
                    type="number"
                    placeholder="Enter ounces"
                    value={customOz}
                    onChange={(e) => setCustomOz(e.target.value)}
                    className="w-auto min-w-[140px] text-center border-none rounded-xl py-2 px-4 text-2xl font-extrabold outline-none bg-white text-[#1a1a2e]"
                    autoFocus
                  />
                </div>
              ) : (
                <h2 className="text-3xl sm:text-4xl font-black mt-2 text-white">{selectedOz}</h2>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                
                <div className="flex justify-center mb-5">
                  <button className="bg-[#f0f4f8] text-gray-700 text-xs sm:text-sm py-2.5 px-6 rounded-full border border-gray-200 flex items-center gap-2 cursor-pointer font-semibold transition-all hover:bg-[#e8ecf2] hover:-translate-y-0.5">
                    <Camera size={16} />
                    Upload Photo <Plus size={14} />
                  </button>
                </div>

                <div className="w-full h-px bg-gray-200 my-4" />

                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-3">Add supplements (optional)</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => {
                      const selected = selectedTags.find((t) => t.name === tag);
                      return (
                        <button
                          key={i}
                          onClick={() => handleTagClick(tag)}
                          className={`text-xs sm:text-sm py-1.5 px-3.5 rounded-full font-semibold cursor-pointer transition-all ${
                            selected 
                              ? "bg-[#6c3fef] text-white border-none" 
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedTags.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-medium text-gray-500 mb-2">Enter values:</p>
                    <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {selectedTags.map((tag, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 flex-shrink-0">
                          <span className="text-xs sm:text-sm font-semibold text-gray-800">{tag.name}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="amount"
                              value={tag.value}
                              onChange={(e) => handleTagValueChange(tag.name, e.target.value)}
                              className="w-20 text-xs sm:text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-center outline-none focus:border-[#6c3fef]"
                            />
                            <span className="text-xs text-gray-500">g/mg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="w-full h-px bg-gray-200 my-5" />
              </div>
            </div>

            <div className="p-6 pt-0 flex-shrink-0">
              <button 
                onClick={() => router.push('/hydration/hydrationCompletion')}
                disabled={submitted}
                className={`w-full text-white py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 ${
                  submitted 
                    ? "bg-green-500 cursor-default" 
                    : "bg-[#1a1a2e] cursor-pointer hover:bg-[#2d2d44] hover:-translate-y-0.5"
                }`}
              >
                {submitted ? (
                  <>
                    <Check size={18} />
                    Submitted!
                  </>
                ) : (
                  "Submit Hydration"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

   
    </div>
  );
}