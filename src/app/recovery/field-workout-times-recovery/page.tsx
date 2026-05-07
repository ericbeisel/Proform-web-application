"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, X, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { preferenceApi, ActivityDay } from "@/api/preferences/route";

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
  let [hour, minute] = time.split(":");
  let hourNum = parseInt(hour);

  if (period === "PM" && hourNum !== 12) {
    hourNum += 12;
  } else if (period === "AM" && hourNum === 12) {
    hourNum = 0;
  }

  return `${hourNum.toString().padStart(2, "0")}:${minute}`;
};

const convertToDisplayTime = (time24: string): string => {
  if (!time24) return "8:00 AM";
  const [hour, minute] = time24.split(":");
  const hourNum = parseInt(hour);
  const period = hourNum >= 12 ? "PM" : "AM";
  const displayHour = hourNum % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
};

export default function FieldWorkoutTimes() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<DaySchedule[]>(
    daysOfWeek.map((day) => ({
      day,
      enabled: false,
      timeSlots: [],
    }))
  );

  // FIX 3: Auto-dismiss error and success banners after 4 seconds
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

  // Fetch existing activity days on mount
  useEffect(() => {
    const fetchActivityDays = async () => {
      try {
        setLoading(true);
        const activityDays = await preferenceApi.getActivityDays("Field Workout");

        const dayTimesMap: Record<string, string[]> = {};
        activityDays.forEach((activity: ActivityDay) => {
          dayTimesMap[activity.day] = activity.time;
        });

        setSchedules((prev) =>
          prev.map((schedule) => {
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
          })
        );

        setError(null);
      } catch (err: any) {
        console.error("Error fetching activity days:", err);
        setError(err.message || "Failed to load field workout times");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDays();
  }, []);

  // FIX 1: Auto-add a default time slot when enabling a day
  const toggleDay = (index: number) => {
    setSchedules((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const willEnable = !s.enabled;
        return {
          ...s,
          enabled: willEnable,
          timeSlots:
            willEnable && s.timeSlots.length === 0
              ? [{ id: Date.now(), time: "8:00 AM" }]
              : s.timeSlots,
        };
      })
    );
  };

  const addTimeSlot = (dayIndex: number) => {
    setSchedules((prev) =>
      prev.map((s, i) => {
        if (i === dayIndex && s.timeSlots.length < 3) {
          return {
            ...s,
            timeSlots: [...s.timeSlots, { id: Date.now(), time: "8:00 AM" }],
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
        if (i === dayIndex && s.timeSlots.length > 1) {
          return {
            ...s,
            timeSlots: s.timeSlots.filter((slot) => slot.id !== slotId),
          };
        }
        return s;
      })
    );
  };

  const handleSave = async () => {
    // FIX 2: Validate duplicate time slots before saving
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

      await preferenceApi.addActivityDays("Field Workout", activities);

      // FIX 4: Use success banner instead of alert()
      setSuccess("Field workout times saved successfully!");
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      console.error("Error saving:", err);
      setError(err.message || "Failed to save field workout times");
    } finally {
      setSaving(false);
    }
  };

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
            <div className="text-white font-bold text-lg">Field Workout Times</div>
            <div className="text-white/80 text-sm">Select times for each day</div>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
        >
          <X size={18} color="white" />
        </button>
      </div>

      {/* FIX 3: Error banner — auto-dismisses after 4s */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <X size={20} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* FIX 4: Success banner — replaces alert() */}
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

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Field Workout Times</h2>
            <p className="text-sm text-gray-500">
              Select days and times for your field workouts
            </p>
          </div>

          {/* Day Checkboxes */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {schedules.map((schedule, index) => (
              <label key={schedule.day} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={() => toggleDay(index)}
                  className="accent-purple-600 w-4 h-4"
                />
                <span className="text-sm font-medium">{schedule.day}</span>
              </label>
            ))}
          </div>

          {/* Selected Days Sections */}
          <div className="space-y-6">
            {schedules
              .filter((s) => s.enabled)
              // FIX 5: Removed unused `idx` — use findIndex directly
              .map((schedule) => {
                const actualIndex = schedules.findIndex((d) => d.day === schedule.day);

                return (
                  <div key={schedule.day} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-purple-600 font-semibold">{schedule.day}</h3>

                      {schedule.timeSlots.length < 3 && (
                        <button
                          onClick={() => addTimeSlot(actualIndex)}
                          className="w-8 h-8 rounded-full border border-purple-300 flex items-center justify-center text-purple-600 hover:bg-purple-50 transition"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>

                    {schedule.timeSlots.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No time slots added. Click + to add.
                      </p>
                    ) : (
                      schedule.timeSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-2 mb-2">
                          <select
                            value={slot.time}
                            onChange={(e) =>
                              updateTimeSlot(actualIndex, slot.id, e.target.value)
                            }
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>

                          {schedule.timeSlots.length > 1 && (
                            <button
                              onClick={() => removeTimeSlot(actualIndex, slot.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-3 rounded-xl font-semibold shadow hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {saving ? "Saving..." : "Save"}
            </button>
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