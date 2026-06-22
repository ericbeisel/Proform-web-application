"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { addCustomActivity } from "@/api/checklist/route";

const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Props {
  onClose: () => void;
  onAdded?: () => void;
  day?: string;
}

function timeTo24(hour: number, minute: number, ampm: "AM" | "PM"): string {
  let h = hour;
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

export default function AddActivityModal({ onClose, onAdded, day = "Monday" }: Props) {
  const [repeatType, setRepeatType] = useState<"week" | "repeat">("week");
  const [activityType, setActivityType] = useState("");
  const [name, setName] = useState("");
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [multiDay, setMultiDay] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([day]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incHour   = () => setHour(h => h === 12 ? 1 : h + 1);
  const decHour   = () => setHour(h => h === 1 ? 12 : h - 1);
  const incMinute = () => setMinute(m => (m + 5) % 60);
  const decMinute = () => setMinute(m => m === 0 ? 55 : m - 5);

  const prevHour = hour === 1 ? 12 : hour - 1;
  const nextHour = hour === 12 ? 1 : hour + 1;
  const prevMin  = minute === 0 ? 55 : minute - 5;
  const nextMin  = (minute + 5) % 60;

  const toggleDay = (d: string) =>
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Please enter an activity name."); return; }
    if (!activityType) { setError("Please choose an activity type."); return; }
    if (selectedDays.length === 0) { setError("Please select at least one day."); return; }

    setError(null);
    setSaving(true);
    try {
      await addCustomActivity({
        name: name.trim(),
        type: activityType,
        days: selectedDays,
        time: timeTo24(hour, minute, ampm),
        recurring: repeatType === "repeat" ? "Every Week" : "This Week",
      });
      console.log("[addActivity] saved successfully, refreshing checklist...");
      onAdded ? onAdded() : onClose();
    } catch {
      setError("Failed to add activity. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[460px] rounded-3xl shadow-2xl overflow-y-auto max-h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3">
          <h2 className="text-[22px] font-extrabold text-gray-900">{day}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-6 pb-4 space-y-3">
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

          {multiDay && (
            <div className="grid grid-cols-4 gap-2">
              {DAYS_FULL.map(d => (
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
            <div className="relative mb-2">
              <select
                value={activityType}
                onChange={e => setActivityType(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-500 bg-white focus:outline-none focus:border-purple-400 pr-10"
              >
                <option value="">Choose activity type</option>
                <option value="Workout">Workout</option>
                <option value="Cardio">Cardio</option>
                <option value="Hydration">Hydration</option>
                <option value="Recovery">Recovery</option>
                <option value="Conditioning">Conditioning</option>
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Activity name..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400 bg-white"
            />
          </div>

          {/* Recurring toggle */}
          <div className="flex gap-2">
            {(["week", "repeat"] as const).map(type => (
              <button
                key={type}
                onClick={() => setRepeatType(type)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                  repeatType === type
                    ? "border-purple-600 text-purple-700 bg-purple-50"
                    : "border-gray-200 text-gray-500 bg-white"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  repeatType === type ? "border-purple-600" : "border-gray-300"
                }`}>
                  {repeatType === type && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                </div>
                {type === "week" ? "This Week" : "Repeat Weekly"}
              </button>
            ))}
          </div>

          {/* ── Time Picker ── */}
          <div>
            <p className="text-[13px] font-bold text-gray-900 mb-3">Set Time:</p>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-3">
              {/* Big time display */}
              <p className="text-center text-[26px] font-extrabold text-purple-700 tracking-tight mb-2">
                {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}{" "}
                <span className="text-[18px] font-bold text-purple-400">{ampm}</span>
              </p>

              <div className="flex items-center justify-center gap-4">
                {/* Hour wheel */}
                <div className="flex flex-col items-center">
                  <button onClick={incHour} className="p-1 rounded-full hover:bg-purple-100 transition-colors">
                    <ChevronUp size={18} className="text-purple-500" />
                  </button>
                  <div className="w-14 h-[72px] flex flex-col items-center justify-center overflow-hidden relative">
                    <span className="text-[13px] font-semibold text-gray-300 leading-none mb-0.5">
                      {String(prevHour).padStart(2, "0")}
                    </span>
                    <span className="text-[24px] font-extrabold text-gray-900 leading-none bg-white rounded-xl px-3 py-0.5 shadow-sm border border-purple-100">
                      {String(hour).padStart(2, "0")}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-300 leading-none mt-0.5">
                      {String(nextHour).padStart(2, "0")}
                    </span>
                  </div>
                  <button onClick={decHour} className="p-1 rounded-full hover:bg-purple-100 transition-colors">
                    <ChevronDown size={18} className="text-purple-500" />
                  </button>
                </div>

                <span className="text-[28px] font-extrabold text-purple-300 mb-1">:</span>

                {/* Minute wheel */}
                <div className="flex flex-col items-center">
                  <button onClick={incMinute} className="p-1 rounded-full hover:bg-purple-100 transition-colors">
                    <ChevronUp size={18} className="text-purple-500" />
                  </button>
                  <div className="w-14 h-[72px] flex flex-col items-center justify-center overflow-hidden relative">
                    <span className="text-[13px] font-semibold text-gray-300 leading-none mb-0.5">
                      {String(prevMin).padStart(2, "0")}
                    </span>
                    <span className="text-[24px] font-extrabold text-gray-900 leading-none bg-white rounded-xl px-3 py-0.5 shadow-sm border border-purple-100">
                      {String(minute).padStart(2, "0")}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-300 leading-none mt-0.5">
                      {String(nextMin).padStart(2, "0")}
                    </span>
                  </div>
                  <button onClick={decMinute} className="p-1 rounded-full hover:bg-purple-100 transition-colors">
                    <ChevronDown size={18} className="text-purple-500" />
                  </button>
                </div>

                {/* AM / PM */}
                <div className="flex flex-col gap-2 ml-2">
                  {(["AM", "PM"] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setAmpm(p)}
                      className={`w-12 py-2 rounded-xl text-[13px] font-bold transition-all ${
                        ampm === p
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-white text-gray-400 border border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-[14px] transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Saving..." : "Add and Update Itinerary"}
          </button>

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
