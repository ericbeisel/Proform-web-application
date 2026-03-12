"use client";

import { useState } from "react";
import { X, Clock, ChevronDown } from "lucide-react";

const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Props {
  onClose: () => void;
  day?: string;
}

export default function AddActivityModal({ onClose, day = "Monday" }: Props) {
  const [repeatType, setRepeatType] = useState<"week" | "repeat">("week");
  const [activityType, setActivityType] = useState("");
  const [details, setDetails] = useState("");
  const [time, setTime] = useState("9:00 AM");
  const [multiDay, setMultiDay] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([day]);

  const toggleDay = (d: string) => {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[380px] rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-[22px] font-extrabold text-gray-900">{day}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Select Multiple Days */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={multiDay}
              onChange={() => setMultiDay(!multiDay)}
              className="w-4 h-4 rounded border-gray-300 accent-purple-600"
            />
            <span className="text-[13px] text-gray-500">Select Multiple days</span>
          </label>

          {/* Multi day selector */}
          {multiDay && (
            <div className="grid grid-cols-4 gap-2">
              {DAYS_FULL.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                    selectedDays.includes(d)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100" />

          {/* Details */}
          <div>
            <p className="text-[13px] font-bold text-gray-900 mb-2">Details:</p>

            {/* Activity type dropdown */}
            <div className="relative mb-2">
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-500 bg-white focus:outline-none focus:border-purple-400 pr-10"
              >
                <option value="">Choose activity type</option>
                <option value="workout">Workout</option>
                <option value="cardio">Cardio</option>
                <option value="hydration">Hydration</option>
                <option value="recovery">Recovery</option>
                <option value="conditioning">Conditioning</option>
                <option value="custom">Custom</option>
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Activity details */}
            <input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add activity details..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400 bg-white"
            />
          </div>

          {/* This Week / Repeat Weekly toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setRepeatType("week")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                repeatType === "week"
                  ? "border-purple-600 text-purple-700 bg-purple-50"
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                repeatType === "week" ? "border-purple-600" : "border-gray-300"
              }`}>
                {repeatType === "week" && <div className="w-2 h-2 rounded-full bg-purple-600" />}
              </div>
              This Week
            </button>
            <button
              onClick={() => setRepeatType("repeat")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                repeatType === "repeat"
                  ? "border-purple-600 text-purple-700 bg-purple-50"
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                repeatType === "repeat" ? "border-purple-600" : "border-gray-300"
              }`}>
                {repeatType === "repeat" && <div className="w-2 h-2 rounded-full bg-purple-600" />}
              </div>
              Repeat Weekly
            </button>
          </div>

          {/* Set Time */}
          <div>
            <p className="text-[13px] font-bold text-gray-900 mb-2">Set Time:</p>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5">
              <Clock size={15} className="text-gray-400" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 text-[13px] text-gray-700 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* CTA */}
          <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-2xl text-[14px] transition-colors">
            Add and Update Itinerary
          </button>

          {/* Close link */}
          <button
            onClick={onClose}
            className="w-full text-center text-[13px] text-cyan-500 hover:text-cyan-600 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}