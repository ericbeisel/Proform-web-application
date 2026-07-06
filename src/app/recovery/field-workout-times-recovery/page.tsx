"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, X, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { preferenceApi, ActivityDay } from "@/api/preferences/route";

// Matches the mobile app's SECTION_TO_TYPE['recovery'] — this screen only ever
// edits the Recovery weekly schedule (previously hardcoded to "Field Workout",
// which silently read/wrote the wrong schedule entirely).
const ACTIVITY_TYPE = "Recovery";
const DEFAULT_TIME = "8:00 PM";

interface TimeSlot {
  id: number;
  time: string;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  timeSlots: TimeSlot[];
}

const daysOfWeek = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

// Generate time slots (15-minute intervals)
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? "AM" : "PM";
      const minuteStr = minute === 0 ? "00" : minute.toString();
      slots.push(`${displayHour}:${minuteStr} ${ampm}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const convertTo24Hour = (timeStr: string): string => {
  const [time, period] = timeStr.split(" ");
  const [hour, minute] = time.split(":");
  let hourNum = parseInt(hour);

  if (period === "PM" && hourNum !== 12) {
    hourNum += 12;
  } else if (period === "AM" && hourNum === 12) {
    hourNum = 0;
  }

  return `${hourNum.toString().padStart(2, "0")}:${minute}`;
};

const convertToDisplayTime = (time24: string): string => {
  if (!time24) return DEFAULT_TIME;
  const [hour, minute] = time24.split(":");
  const hourNum = parseInt(hour);
  const period = hourNum >= 12 ? "PM" : "AM";
  const displayHour = hourNum % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
};

function emptySchedules(): DaySchedule[] {
  return daysOfWeek.map((day) => ({ day, enabled: false, timeSlots: [] }));
}

// For comparing schedules ignoring slot `id` / ordering — same shape mobile uses
// to decide between "Save Schedule" and "Repeat Schedule" button text.
function significantShape(schedules: DaySchedule[]): Record<string, string[]> {
  const shape: Record<string, string[]> = {};
  schedules.forEach((s) => {
    if (s.enabled && s.timeSlots.length > 0) {
      shape[s.day] = s.timeSlots.map((slot) => convertTo24Hour(slot.time)).sort();
    }
  });
  return shape;
}

export default function EditRecoveryTimes() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<DaySchedule[]>(emptySchedules());
  const [originalSchedules, setOriginalSchedules] = useState<DaySchedule[]>(emptySchedules());

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Fetch existing Recovery schedule on mount
  useEffect(() => {
    const fetchActivityDays = async () => {
      try {
        setLoading(true);
        const activityDays = await preferenceApi.getActivityDays(ACTIVITY_TYPE);

        const dayTimesMap: Record<string, string[]> = {};
        activityDays.forEach((activity: ActivityDay) => {
          dayTimesMap[activity.day] = activity.time;
        });

        const loaded = emptySchedules().map((schedule) => {
          const times = dayTimesMap[schedule.day];
          if (times && times.length > 0) {
            return {
              ...schedule,
              enabled: true,
              timeSlots: times.map((time, idx) => ({
                id: Date.now() + idx,
                time: convertToDisplayTime(time),
              })),
            };
          }
          return schedule;
        });

        setSchedules(loaded);
        setOriginalSchedules(loaded);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching recovery schedule:", err);
        setError(err.message || "Failed to load recovery schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDays();
  }, []);

  // Expand/collapse a day — auto-add a default slot the first time it's opened, like mobile's toggleDay
  const toggleDay = (index: number) => {
    const day = schedules[index].day;
    if (expandedDay === day) {
      setExpandedDay(null);
      return;
    }

    setSchedules((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        if (s.timeSlots.length === 0) {
          return { ...s, enabled: true, timeSlots: [{ id: Date.now(), time: DEFAULT_TIME }] };
        }
        return { ...s, enabled: true };
      })
    );
    setExpandedDay(day);
  };

  const addTimeSlot = (dayIndex: number) => {
    setSchedules((prev) =>
      prev.map((s, i) => {
        if (i === dayIndex && s.timeSlots.length < 3) {
          return {
            ...s,
            timeSlots: [...s.timeSlots, { id: Date.now(), time: DEFAULT_TIME }],
          };
        }
        return s;
      })
    );
  };

  const updateTimeSlot = (dayIndex: number, slotId: number, value: string) => {
    setSchedules((prev) =>
      prev.map((s, i) => {
        if (i === dayIndex) {
          return {
            ...s,
            timeSlots: s.timeSlots.map((slot) =>
              slot.id === slotId ? { ...slot, time: value } : slot
            ),
          };
        }
        return s;
      })
    );
  };

  const removeTimeSlot = (dayIndex: number, slotId: number) => {
    setSchedules((prev) =>
      prev.map((s, i) => {
        if (i === dayIndex) {
          const timeSlots = s.timeSlots.filter((slot) => slot.id !== slotId);
          return { ...s, timeSlots, enabled: timeSlots.length > 0 };
        }
        return s;
      })
    );
  };

  const handleReset = () => {
    setSchedules(emptySchedules());
    setExpandedDay(null);
  };

  const handleSave = async () => {
    const daysWithDuplicates = schedules
      .filter((s) => s.enabled && s.timeSlots.length > 0)
      .filter((s) => {
        const times = s.timeSlots.map((slot) => convertTo24Hour(slot.time));
        return new Set(times).size !== times.length;
      })
      .map((s) => s.day);

    if (daysWithDuplicates.length > 0) {
      setError(`Duplicate time slots on: ${daysWithDuplicates.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      const activities = schedules
        .filter((s) => s.enabled && s.timeSlots.length > 0)
        .map((schedule) => ({
          day: schedule.day,
          time: schedule.timeSlots.map((slot) => convertTo24Hour(slot.time)),
        }));

      await preferenceApi.addActivityDays(ACTIVITY_TYPE, activities);

      setOriginalSchedules(schedules);
      setSuccess(`${ACTIVITY_TYPE} schedule saved successfully!`);
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      console.error("Error saving:", err);
      setError(err.message || "Failed to save recovery schedule");
    } finally {
      setSaving(false);
    }
  };

  const totalSelectedDays = schedules.filter((s) => s.enabled && s.timeSlots.length > 0).length;
  const totalSlots = schedules.reduce((acc, s) => acc + (s.enabled ? s.timeSlots.length : 0), 0);

  const hasTimes = schedules.some((s) => s.enabled && s.timeSlots.length > 0);
  const hasOriginalTimes = originalSchedules.some((s) => s.enabled && s.timeSlots.length > 0);
  const isSameAsOriginal =
    JSON.stringify(significantShape(schedules)) === JSON.stringify(significantShape(originalSchedules));

  const saveButtonText =
    hasTimes && hasOriginalTimes && isSameAsOriginal ? "Repeat Schedule" : "Save Schedule";

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8]">

      {/* HEADER */}
      <div className="w-full bg-purple-600 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <div className="text-white font-bold text-lg">Edit Time</div>
            <div className="text-white/80 text-sm">Recovery sessions</div>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
        >
          <X size={18} color="white" />
        </button>
      </div>

      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <X size={20} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6">

          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            <span className="font-bold text-purple-600">{totalSlots} Recovery sessions</span> per week.
            This helps us schedule your preferred recovery session times.
          </p>

          {/* Day Cards */}
          <div className="space-y-3">
            {schedules.map((schedule, index) => {
              const isExpanded = expandedDay === schedule.day;
              const isSelected = schedule.enabled && schedule.timeSlots.length > 0;

              return (
                <div
                  key={schedule.day}
                  className={`rounded-2xl border overflow-hidden transition-colors ${
                    isExpanded ? "border-2 border-purple-600" : "border border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => toggleDay(index)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-purple-600 bg-purple-600" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="font-bold text-[#1a1a1a] flex-1">{schedule.day}</span>
                    {isSelected && (
                      <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {schedule.timeSlots.length} {schedule.timeSlots.length === 1 ? "TIME" : "TIMES"}
                      </span>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-4 border-t border-gray-100 space-y-3">
                      {schedule.timeSlots.map((slot) => (
                        <div key={slot.id} className="flex items-end gap-2">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-gray-400 mb-1.5">START TIME</p>
                            <select
                              value={slot.time}
                              onChange={(e) => updateTimeSlot(index, slot.id, e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-[#f9f9f9] focus:outline-none focus:border-purple-500"
                            >
                              {timeSlots.map((time) => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => removeTimeSlot(index, slot.id)}
                            className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}

                      {schedule.timeSlots.length < 3 ? (
                        <button
                          onClick={() => addTimeSlot(index)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-purple-600 font-semibold text-sm hover:bg-purple-50 transition"
                        >
                          <Plus size={16} /> Add Time Slot
                        </button>
                      ) : (
                        <p className="text-xs text-gray-400 italic text-center">
                          Maximum 3 time slots per day
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-2xl font-bold shadow transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? "Saving..." : saveButtonText}
            </button>

            <button
              onClick={handleReset}
              className="w-full border-[1.5px] border-purple-600 text-purple-600 py-3.5 rounded-2xl font-bold hover:bg-purple-50 transition"
            >
              Reset Recovery
            </button>

            <p className="text-xs text-gray-400">
              {totalSelectedDays} day(s) selected • {totalSlots} total time slots
            </p>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
