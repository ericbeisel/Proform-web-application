"use client";

import { useState } from "react";
import { X, Droplet, GlassWater, Plus, ArrowLeft, Calendar, TrendingUp, Clock, Camera, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const hydrationOptions = [
  { label: "8 oz", sublabel: "Small Glass", color: "#4f8ef7", bg: "#e8f0fe" },
  { label: "16 oz", sublabel: "Standard Bottle", color: "#2ecf8a", bg: "#e0f9f0" },
  { label: "24 oz", sublabel: "Large Bottle", color: "#a855f7", bg: "#f3e8ff" },
];

const tags = [
  "25g Protein",
  "5g Creatine",
  "5g Glutamine",
  "100mg Electrolytes",
  "10g BCAA's",
  "Pre-Workout",
];

export default function HydrationPage() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [selectedOz, setSelectedOz] = useState<string>("");
  const [customOz, setCustomOz] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [selectedTags, setSelectedTags] = useState<{ name: string; value: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleClick = (label: string) => {
    setSelectedOz(label);
    setIsCustom(label === "0 oz");
    setSubmitted(false);
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
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedTags([]);
      setCustomOz("");
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8]">
      {/* HEADER - full width */}
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
        <div className="text-white font-extrabold text-lg sm:text-xl leading-tight">Stay Hydrated</div>
        <div className="text-white/80 text-xs sm:text-sm mt-0.5">Track your daily water intake</div>
      </div>
    </div>

    <div className="bg-white/20 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 backdrop-blur-sm border border-white/30">
      <Calendar size={16} color="white" />
      <div className="text-right">
        <div className="text-white/80 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide">TODAY</div>
        <div className="text-white text-sm sm:text-lg font-extrabold leading-tight">64 oz</div>
      </div>
    </div>
  </div>
</div>

      {/* BODY - full width */}
      <div className="w-full py-4 sm:py-5 md:py-6">

        {/* QUICK ADD SECTION */}
        <div className="w-full bg-white rounded-none px-4 sm:px-5 md:px-6 py-5 sm:py-6 shadow-sm mb-5">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Droplet size={18} color="#2bb5c8" />
            <h2 className="m-0 text-base sm:text-lg font-extrabold text-[#1a1a2e]">Quick Add</h2>
          </div>

          {/* GRID — responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
            {hydrationOptions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleClick(item.label)}
                className="border-2 border-[#f0f0f5] rounded-xl p-4 sm:p-5 flex flex-col items-center cursor-pointer transition-all duration-200 bg-white hover:shadow-lg hover:-translate-y-0.5"
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 sm:mb-3"
                  style={{ background: item.bg }}
                >
                  <Droplet size={20} color={item.color} fill={item.color} />
                </div>
                <div className="text-base sm:text-lg font-extrabold text-[#1a1a2e] mb-0.5">{item.label}</div>
                <div className="text-[10px] sm:text-xs text-gray-400 font-medium text-center">{item.sublabel}</div>
              </div>
            ))}
          </div>

          {/* SELECT AMOUNT BAR */}
          <button
            onClick={() => handleClick("0 oz")}
            className="w-full mt-4 bg-[#f4f4f8] border-none rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-gray-500 cursor-pointer transition-all hover:bg-[#eceef5] hover:-translate-y-0.5"
          >
            Select a custom amount
          </button>
        </div>

        {/* BOTTOM CARDS - full width */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-5 md:px-6">
  {/* Dashboard */}
  <button
    onClick={() => router.push('/hydration/hydrationDashboard')}
    className="bg-gradient-to-r from-[#7c3aed] to-[#9333ea] border-none rounded-2xl p-5 sm:p-6 flex items-center gap-3 sm:gap-4 cursor-pointer text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
      <TrendingUp size={20} color="white" />
    </div>
    <div>
      <div className="text-white font-extrabold text-sm sm:text-base">Hydration Dashboard</div>
      <div className="text-white/70 text-xs sm:text-sm mt-1">View your progress & stats</div>
    </div>
  </button>

  {/* History */}
  <button
    onClick={() => router.push('/hydration/hydrationDashboard')}
    className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] border-none rounded-2xl p-5 sm:p-6 flex items-center gap-3 sm:gap-4 cursor-pointer text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
      <Clock size={20} color="white" />
    </div>
    <div>
      <div className="text-white font-extrabold text-sm sm:text-base">Hydration History</div>
      <div className="text-white/70 text-xs sm:text-sm mt-1">Track past performance</div>
    </div>
  </button>
</div>
      </div>

      {/* ================= MODAL - Fixed height with scrolling ================= */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-3xl relative shadow-2xl animate-slideUp overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header with gradient - Fixed */}
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

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                
                {/* Upload Button */}
                <div className="flex justify-center mb-5">
                  <button className="bg-[#f0f4f8] text-gray-700 text-xs sm:text-sm py-2.5 px-6 rounded-full border border-gray-200 flex items-center gap-2 cursor-pointer font-semibold transition-all hover:bg-[#e8ecf2] hover:-translate-y-0.5">
                    <Camera size={16} />
                    Upload Photo <Plus size={14} />
                  </button>
                </div>

                <div className="w-full h-px bg-gray-200 my-4" />

                {/* Tags Section */}
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

                {/* Selected Tag Inputs - Scrollable if many */}
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

            {/* Submit Button - Fixed at bottom */}
         <div className="p-6 pt-0 flex-shrink-0">
  <button 
    onClick={() => {
      if (!submitted) {
        router.push('/hydration/hydrationCompletion');
      }
    }}
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

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}