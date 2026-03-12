"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ACTIVITIES: Record<string, { name: string; type: string; typeCls: string }[]> = {
  Sunday:    [],
  Monday:    [{ name: "Cardio #1", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
  Tuesday:   [{ name: "Cardio #2", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
  Wednesday: [{ name: "Cardio #3", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
  Thursday:  [],
  Friday:    [{ name: "Cardio #5", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
  Saturday:  [{ name: "Cardio #6", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
};

const totalActivities = Object.values(ACTIVITIES).flat().length;
const completed = 0;
const progressPct = totalActivities > 0 ? Math.round((completed / totalActivities) * 100) : 0;

export default function WeeklyAgenda() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-[20px] font-extrabold text-gray-900">Weekly Agenda</h1>
      </div>

      <div className="px-4 py-5 max-w-[800px] mx-auto space-y-3">

        {/* Weekly Progress banner */}
        <div className="border border-gray-200 rounded-2xl px-5 py-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
                <Calendar size={14} className="text-white" />
              </div>
              <span className="text-[13px] font-semibold text-gray-700">Weekly Progress</span>
            </div>
            <span className="text-[13px] font-bold text-gray-700">{progressPct.toFixed(2)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {completed} of {totalActivities} activities completed this week
          </p>
        </div>

        {/* Day rows */}
        {DAYS.map((day) => {
          const acts = ACTIVITIES[day] || [];
          return (
            <div key={day} className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* Day header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-white">
                <p className="text-[14px] font-bold text-gray-900">{day}</p>
                {acts.length > 0 && (
                  <span className="text-[11px] font-semibold text-green-500">
                    • {acts.length} {acts.length === 1 ? "activity" : "activities"}
                  </span>
                )}
              </div>

              {/* Activities */}
              {acts.length === 0 ? (
                <div className="px-5 py-3 border-t border-gray-50">
                  <p className="text-[12px] text-gray-400 italic">No activities scheduled</p>
                </div>
              ) : (
                acts.map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                      <span className="text-[13px] font-medium text-gray-800">{a.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${a.typeCls}`}>
                      {a.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          );
        })}

        {/* View Today Only */}
        <button
          onClick={() => router.back()}
          className="w-full text-center text-[13px] text-blue-500 hover:text-blue-600 font-semibold py-3 transition-colors"
        >
          View Today Only
        </button>
      </div>
    </div>
  );
}