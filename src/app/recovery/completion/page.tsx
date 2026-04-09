"use client";

import { Calendar, Check } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* 👇 YOUR ORIGINAL CODE (UNCHANGED) */
function RecoveryCompletionInner() {
  const [selected, setSelected] = useState(0);

  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "Hottub";
  const time = searchParams.get("time") || "10";

  const sessions = [
    {
      title: "Monday, April 7th - Recovery Session",
      subtitle: "Scheduled at 6:00 PM • Hot Tub",
    },
    {
      title: "Wednesday, April 9th - Recovery Session",
      subtitle: "Scheduled at 8:00 PM • Infrared Sauna",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">

      <div className="w-full max-w-2xl text-center">

        {/* TOP ICON */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
            <Calendar size={22} color="white" />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Recovery Completion
        </h1>

        <p className="text-sm text-gray-500 mt-1 mb-6 max-w-md mx-auto">
          Choose how you want to save your completed Recovery Session on your itinerary page
        </p>

        {/* MAIN CARD */}
        <div className="bg-[#f1f3f5] rounded-2xl p-6 border border-gray-200">

          <p className="text-sm text-center font-medium text-gray-700">
            Get credit towards one of your scheduled recovery sessions
          </p>

          <p className="text-xs text-center text-gray-400 mb-4">
            (Choose One):
          </p>

          <div className="space-y-3">
            {sessions.map((item, i) => {
              const isSelected = selected === i;

              return (
                <div
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border
                    ${
                      isSelected
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-3">

                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${
                          isSelected
                            ? "border-white"
                            : "border-gray-300"
                        }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-medium">
                        {item.title}
                      </p>
                      <p
                        className={`text-xs ${
                          isSelected ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected && <Check size={18} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* NEW OPTION */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-3 max-w-md mx-auto">
            Save as a new recovery session, which will not affect your Recovery Completion this week
          </p>

          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto shadow-sm">
            <Calendar size={18} />
            Create a New One
          </button>
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-center gap-12 text-xs text-gray-500">

          <div className="text-center">
            <p className="text-gray-400">Recovery Type</p>
            <p className="font-medium text-gray-700">{type}</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400">Time Spent</p>
            <p className="font-medium text-gray-700">{time} minutes</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400">Date</p>
            <p className="font-medium text-gray-700">Today</p>
          </div>

        </div>
      </div>
    </div>
  );
}

/* 👇 ONLY ADD THIS WRAPPER */
export default function RecoveryCompletionPage() {
  return (
    <Suspense fallback={<div />}>
      <RecoveryCompletionInner />
    </Suspense>
  );
}