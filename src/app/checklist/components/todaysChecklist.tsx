"use client";

import { useState } from "react";
import { Calendar, Settings, X, Plus, Clock, AlertCircle } from "lucide-react";
import AddActivityModal from "./addActivityModal";
import { useRouter } from "next/navigation";

const ACTIVITIES = [
  {
    id: 1,
    name: "LOWER BODY",
    type: "Workout",
    time: "Before 8:30 am",
    category: "workout",
    overdue: true,
    color: "text-blue-500",
    ring: "border-blue-400",
  },
  {
    id: 2,
    name: "Drink 2L Water",
    type: "Hydration",
    time: "Throughout day",
    category: "hydration",
    overdue: false,
    color: "text-cyan-500",
    ring: "border-cyan-400",
  },
  {
    id: 3,
    name: "Stretch Session",
    type: "Recovery",
    time: "6:00 pm",
    category: "recovery",
    overdue: false,
    color: "text-purple-500",
    ring: "border-purple-400",
  },
  {
    id: 4,
    name: "Morning Run",
    type: "Cardio",
    time: "7:00 am",
    category: "cardio",
    overdue: false,
    color: "text-orange-500",
    ring: "border-orange-400",
  },
];

const TYPE_COLORS: Record<string, string> = {
  Workout: "text-blue-500 bg-blue-50",
  Hydration: "text-cyan-500 bg-cyan-50",
  Recovery: "text-purple-500 bg-purple-50",
  Cardio: "text-orange-500 bg-orange-50",
};

export default function TodaysChecklist() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [hideSuggested, setHideSuggested] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const toggle = (id: number) =>
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const progress = Math.round((completed.length / ACTIVITIES.length) * 100);

  return (
    <div
      className="min-h-screen bg-gray-100 w-full"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="bg-white w-full overflow-hidden">
        {/* ── Top bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 gap-4 sm:gap-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 bg-purple-700 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calendar size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Daily Progress</p>
              <p className="text-2xl sm:text-[22px] font-extrabold text-gray-900 leading-tight">
                {progress}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => router.push("/checklist/missed-activity")}
              className="flex items-center gap-1.5 border border-red-200 bg-red-50 text-red-600 text-xs sm:text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
            >
              <AlertCircle size={13} />
              1 Missed Activity
            </button>

            <button className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors flex-shrink-0">
              <Settings size={18} className="sm:size-16" />
            </button>

            <button
              onClick={() => router.back()}
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <X size={18} className="sm:size-16" />
            </button>
          </div>
        </div>

        {/* ── Title + Hide Suggested ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 pt-5 pb-3 gap-4 sm:gap-0">
          <h1 className="text-3xl sm:text-[28px] font-extrabold text-gray-900">
            Today's Checklist
          </h1>

          <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-[13px]">
            <input
              type="checkbox"
              checked={hideSuggested}
              onChange={() => setHideSuggested(!hideSuggested)}
              className="w-4 h-4 rounded border-gray-300 accent-purple-600"
            />
            <span className="text-gray-600">Hide Suggested</span>
          </label>
        </div>

        {/* ── Progress bar ── */}
        <div className="px-4 sm:px-6 pb-4">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {completed.length} of {ACTIVITIES.length} completed
          </p>
        </div>

        <div className="px-4 sm:px-6 pb-6">
          {/* ── Day header ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
            <h2 className="text-2xl sm:text-[22px] font-extrabold text-gray-900">
              Monday
            </h2>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-sm sm:text-[13px] font-bold px-5 py-3 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={16} />
              Add Activity
            </button>
          </div>

          {/* ── Activity grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACTIVITIES.map((a) => {
              const done = completed.includes(a.id);

              return (
                <div
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                    a.overdue
                      ? "border-red-400 bg-red-50/40"
                      : done
                      ? "border-gray-300 bg-gray-50"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Type + Overdue badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[a.type]}`}
                    >
                      {a.type}
                    </span>

                    {a.overdue && (
                      <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full text-red-600 bg-red-50">
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    {/* Circle toggle */}
                    <div
                      className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        done ? `${a.ring} bg-opacity-10` : a.ring
                      }`}
                    >
                      {done && (
                        <div
                          className={`w-4 h-4 rounded-full ${a.color.replace("text-", "bg-")}`}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-base sm:text-[14px] font-bold truncate ${
                          done ? "line-through text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {a.name}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={12} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">
                          {a.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── View Week ── */}
          <button
            onClick={() => router.push("/checklist/weekly-agenda")}
            className="mt-6 w-full border-2 border-purple-600 text-purple-700 hover:bg-purple-50 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base sm:text-[14px]"
          >
            <Calendar size={18} />
            View Week
          </button>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAdd && (
        <AddActivityModal onClose={() => setShowAdd(false)} day="Monday" />
      )}
    </div>
  );
}