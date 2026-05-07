// app/todays-focus-cardio/cardio-edit-times/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { preferenceApi, ActivityDay } from "@/api/preferences/route";
import { useToast } from "@/components/ui/toast-provider";

const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface TimeSlot {
  startTime: string;
}

function parseTimeToComponents(timeStr: string): {
  hour: string;
  minute: string;
  period: "AM" | "PM";
} {
  if (timeStr.includes(" ")) {
    const [hm, period] = timeStr.split(" ");
    const [h, m] = hm.split(":");
    return {
      hour: h.padStart(2, "0"),
      minute: m.padStart(2, "0"),
      period: period.toUpperCase() as "AM" | "PM",
    };
  }
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return {
    hour: hour.toString().padStart(2, "0"),
    minute: m.padStart(2, "0"),
    period,
  };
}

function componentsToTimeString(
  hour: string,
  minute: string,
  period: "AM" | "PM"
): string {
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")} ${period}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

function TimePicker({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
}) {
  const { hour, minute, period } = parseTimeToComponents(value);

  const handleHour = (h: string) =>
    onChange(componentsToTimeString(h, minute, period));
  const handleMinute = (m: string) =>
    onChange(componentsToTimeString(hour, m, period));
  const handlePeriod = (p: "AM" | "PM") =>
    onChange(componentsToTimeString(hour, minute, p));

  const selectClass = `border rounded-lg px-2 py-2.5 text-[14px] font-semibold text-[#1a1a1a] outline-none transition-colors cursor-pointer appearance-none text-center w-full ${
    hasError
      ? "border-red-400 bg-[#fff5f5] focus:border-red-500"
      : "border-[#EEEEEE] bg-[#F9F9F9] focus:border-[#6202AC]"
  }`;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex flex-col flex-1">
        <label className="block text-[10px] font-bold text-[#888] mb-1">HR</label>
        <select value={hour} onChange={(e) => handleHour(e.target.value)} className={selectClass}>
          {HOURS.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>

      <span className="text-[18px] font-bold text-[#6202AC] mt-4">:</span>

      <div className="flex flex-col flex-1">
        <label className="block text-[10px] font-bold text-[#888] mb-1">MIN</label>
        <select value={minute} onChange={(e) => handleMinute(e.target.value)} className={selectClass}>
          {MINUTES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col mt-4">
        <div className={`flex rounded-lg overflow-hidden border ${hasError ? "border-red-400" : "border-[#EEEEEE]"}`}>
          {(["AM", "PM"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePeriod(p)}
              className={`px-3 py-2.5 text-[13px] font-bold transition-colors ${
                period === p
                  ? "bg-[#6202AC] text-white"
                  : "bg-[#F9F9F9] text-[#888] hover:bg-[#f0f0f0]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DayTimesPopup({
  day,
  slots,
  error,
  onClose,
  onAdd,
  onRemove,
  onUpdate,
}: {
  day: string;
  slots: TimeSlot[];
  error?: string;
  onClose: () => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[450px] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 bg-[#f8f5fd] border-b border-[#ede8f7] shrink-0">
          <div>
            <p className="text-[10px] font-bold text-[#6202AC] uppercase tracking-wide">Time Slots</p>
            <h3 className="text-[16px] font-bold text-[#1a1a1a]">{day}</h3>
          </div>
          <button onClick={onClose} className="rounded-full bg-white p-1 shadow-sm hover:bg-gray-50 transition-colors">
            <X size={18} className="text-[#555]" />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 bg-[#fff2f2] border border-[#fcc] rounded-xl px-3 py-2 mb-4">
              <span className="text-sm">⚠️</span>
              <p className="text-[11px] font-bold text-red-600 leading-tight">{error}</p>
            </div>
          )}

          {slots.length === 0 && (
            <p className="text-center text-[13px] text-[#aaa] py-6">No time slots yet. Add one below.</p>
          )}

          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold text-[#888] uppercase tracking-wide ml-1">Slot {index + 1}</p>
                  <button
                    onClick={() => onRemove(index)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#FFF5F5] rounded-md hover:bg-[#ffebeb] transition-colors text-[10px] font-bold text-[#FF4D4D]"
                  >
                    <Trash2 size={10} /> Remove
                  </button>
                </div>
                <div className={`rounded-xl p-2.5 border transition-colors ${error ? "border-red-200 bg-[#fff8f8]" : "border-[#f0f0f0] bg-[#fafafa]"}`}>
                  <TimePicker value={slot.startTime} onChange={(val) => onUpdate(index, val)} hasError={!!error} />
                </div>
              </div>
            ))}
          </div>

          {slots.length < 3 ? (
            <button
              onClick={onAdd}
              className="flex items-center justify-center gap-2 w-full py-2.5 border-[1.5px] border-dashed border-[#d1d1d1] rounded-xl hover:bg-gray-50 transition-colors mt-4"
            >
              <Plus size={14} className="text-[#6202AC]" />
              <span className="text-[12px] font-bold text-[#6202AC]">Add Time Slot</span>
            </button>
          ) : (
            <p className="text-center text-[11px] font-medium text-[#aaa] italic mt-4">Maximum 3 time slots per day</p>
          )}
        </div>

        <div className="p-5 border-t border-gray-50 shrink-0 bg-white">
          <button
            onClick={onClose}
            disabled={!!error}
            className={`w-full h-11 rounded-xl text-[14px] font-bold transition-all ${
              error ? "bg-[#e0c3f5] cursor-not-allowed text-white" : "bg-[#6202AC] hover:bg-[#500ba6] text-white shadow-md active:scale-[0.98]"
            }`}
          >
            {error ? "Fix duplicate to continue" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CardioEditTimes() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedTimes, setSelectedTimes] = useState<Record<string, TimeSlot[]>>({});
  const [popupDay, setPopupDay] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing cardio times using getActivityDays API
  useEffect(() => {
    const fetchCardioTimes = async () => {
      try {
        setLoading(true);
        const activityDays = await preferenceApi.getActivityDays("Cardio");
        
        const timesMap: Record<string, TimeSlot[]> = {};
        activityDays.forEach((activity: ActivityDay) => {
          timesMap[activity.day] = activity.time.map(t => ({
            startTime: convertToDisplayTime(t)
          }));
        });
        setSelectedTimes(timesMap);
      } catch (error) {
        console.error("Error fetching cardio times:", error);
        toast.error("Failed to load cardio schedule");
      } finally {
        setLoading(false);
      }
    };
    fetchCardioTimes();
  }, []);

  const convertToDisplayTime = (time24: string): string => {
    const [hour, minute] = time24.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const convertTo24Hour = (timeStr: string): string => {
    const [time, period] = timeStr.split(" ");
    let [hour, minute] = time.split(":");
    let hourNum = parseInt(hour);
    if (period === "PM" && hourNum !== 12) hourNum += 12;
    if (period === "AM" && hourNum === 12) hourNum = 0;
    return `${hourNum.toString().padStart(2, "0")}:${minute}`;
  };

  const openPopup = (day: string) => {
    if (!selectedTimes[day] || selectedTimes[day].length === 0) {
      setSelectedTimes(prev => ({
        ...prev,
        [day]: [{ startTime: "08:00 AM" }]
      }));
    }
    setPopupDay(day);
  };

  const addTimeSlot = (day: string) => {
    if ((selectedTimes[day]?.length || 0) < 3) {
      setSelectedTimes(prev => ({
        ...prev,
        [day]: [...(prev[day] || []), { startTime: "08:00 AM" }]
      }));
    }
  };

  const removeTimeSlot = (day: string, index: number) => {
    const newTimes = { ...selectedTimes };
    const updated = newTimes[day].filter((_, i) => i !== index);
    if (updated.length === 0) {
      delete newTimes[day];
    } else {
      newTimes[day] = updated;
    }
    setErrors(prev => ({ ...prev, [day]: "" }));
    setSelectedTimes(newTimes);
  };

  const updateTimeSlot = (day: string, index: number, value: string) => {
    const daySlots = [...(selectedTimes[day] || [])];
    const isDuplicate = daySlots.some((slot, i) => slot.startTime === value && i !== index);

    if (isDuplicate) {
      setErrors(prev => ({
        ...prev,
        [day]: `"${value}" is already added for ${day}. Please choose a different time.`
      }));
      return;
    }

    setErrors(prev => ({ ...prev, [day]: "" }));
    daySlots[index] = { startTime: value };
    setSelectedTimes(prev => ({ ...prev, [day]: daySlots }));
  };

  const handleSave = async () => {
    const hasErrors = Object.values(errors).some(e => e !== "");
    if (hasErrors) return;

    try {
      const activities = Object.entries(selectedTimes)
        .filter(([, slots]) => slots.length > 0)
        .map(([day, slots]) => ({
          day,
          time: slots.map(slot => convertTo24Hour(slot.startTime))
        }));

      await preferenceApi.addActivityDays("Cardio", activities);
      toast.success("Cardio schedule saved successfully!");
      router.push("/todays-focus-cardio/scheduled-cardio");
    } catch (error) {
      console.error("Error saving cardio schedule:", error);
      toast.error("Failed to save cardio schedule");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white w-full">
      {/* Header */}
      <div className="flex items-center border-b border-[#f0f0f0] px-4 py-5 md:px-8 lg:px-10 shrink-0">
        <button onClick={() => router.back()} className="mr-3 md:mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-[#333]" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">Edit Cardio Times</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 lg:px-10 mx-auto w-full max-w-[1400px]">
        <p className="text-[20px] font-bold text-black mb-2">Cardio</p>
        <p className="text-[14px] text-[#666] font-medium leading-relaxed mb-6">
          Select days and add up to 3 cardio workout times per day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {DAYS_FULL.map((day) => {
            const slots = selectedTimes[day] || [];
            const isSelected = slots.length > 0;
            const dayHasError = !!errors[day];

            return (
              <button
                key={day}
                onClick={() => openPopup(day)}
                className={`flex items-center gap-3 w-full border rounded-xl py-3 px-4 transition-all text-left hover:border-[#6202AC] hover:bg-[#faf6ff] ${
                  dayHasError
                    ? "border-red-400 bg-[#fff5f5]"
                    : isSelected
                    ? "border-[#6202AC] bg-[#faf6ff]"
                    : "border-[#E0E0E0]"
                }`}
              >
                <div
                  className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 shrink-0 ${
                    dayHasError
                      ? "border-red-400 bg-red-400"
                      : isSelected
                      ? "border-[#6202AC] bg-[#6202AC]"
                      : "border-[#E0E0E0]"
                  }`}
                >
                  {(isSelected || dayHasError) && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                </div>
                <span className="flex-1 text-[15px] font-bold text-[#1a1a1a]">{day}</span>
                {dayHasError ? (
                  <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">⚠️ duplicate</span>
                ) : isSelected ? (
                  <span className="text-[10px] font-bold text-[#6202AC] bg-[#eaddfa] px-2 py-0.5 rounded-full">
                    {slots.length} time{slots.length > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#aaa]">Tap to set</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#f0f0f0] bg-white shrink-0 flex justify-center">
        <button
          onClick={handleSave}
          className="w-full max-w-[340px] h-12 bg-[#6202AC] text-white rounded-full text-[16px] font-bold transition-all shadow-md hover:bg-[#500ba6] active:scale-[0.98]"
        >
          Save Schedule
        </button>
      </div>

      {/* Day Popup */}
      {popupDay && (
        <DayTimesPopup
          day={popupDay}
          slots={selectedTimes[popupDay] || []}
          error={errors[popupDay]}
          onClose={() => setPopupDay(null)}
          onAdd={() => addTimeSlot(popupDay)}
          onRemove={(i) => removeTimeSlot(popupDay, i)}
          onUpdate={(i, val) => updateTimeSlot(popupDay, i, val)}
        />
      )}
    </div>
  );
}