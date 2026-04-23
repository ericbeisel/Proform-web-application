"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

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

// Generate time slots
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 1; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const ampm = hour < 12 ? "AM" : "PM";
      const minuteStr = minute === 0 ? "00" : minute.toString();
      slots.push(`${hour}:${minuteStr} ${ampm}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export default function FieldWorkoutTimes() {
  const router = useRouter();

  const [schedules, setSchedules] = useState<DaySchedule[]>(
    daysOfWeek.map((day, index) => ({
      day,
      enabled: index === 0,
      timeSlots: [{ id: Date.now() + index, time: "1:30 AM" }]
    }))
  );

  // Toggle day
  const toggleDay = (index: number) => {
    setSchedules(prev =>
      prev.map((s, i) =>
        i === index ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  // Add time
  const addTimeSlot = (dayIndex: number) => {
    setSchedules(prev =>
      prev.map((s, i) => {
        if (i === dayIndex && s.timeSlots.length < 3) {
          return {
            ...s,
            timeSlots: [...s.timeSlots, { id: Date.now(), time: "1:30 AM" }]
          };
        }
        return s;
      })
    );
  };

  // Update time
  const updateTimeSlot = (dayIndex: number, slotId: number, value: string) => {
    setSchedules(prev =>
      prev.map((s, i) => {
        if (i === dayIndex) {
          return {
            ...s,
            timeSlots: s.timeSlots.map(slot =>
              slot.id === slotId ? { ...slot, time: value } : slot
            )
          };
        }
        return s;
      })
    );
  };

  // Remove time
  const removeTimeSlot = (dayIndex: number, slotId: number) => {
    setSchedules(prev =>
      prev.map((s, i) => {
        if (i === dayIndex && s.timeSlots.length > 1) {
          return {
            ...s,
            timeSlots: s.timeSlots.filter(slot => slot.id !== slotId)
          };
        }
        return s;
      })
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8]">

      {/* HEADER (UNCHANGED) */}
      <div className="w-full bg-purple-600 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center"
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <div className="text-white font-bold text-lg">
              Field Workout Times
            </div>
            <div className="text-white/80 text-sm">
              Select times for each day:
            </div>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center"
        >
          <X size={18} color="white" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6">

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Field Workout Times</h2>
            <p className="text-sm text-gray-500">
              Select times for each day:
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
                  className="accent-purple-600"
                />
                <span className="text-sm">{schedule.day}</span>
              </label>
            ))}
          </div>

          {/* Selected Days Sections */}
          <div className="space-y-6">
            {schedules
              .filter(s => s.enabled)
              .map((schedule, dayIndex) => {
                const actualIndex = schedules.findIndex(d => d.day === schedule.day);

                return (
                  <div key={schedule.day} className="bg-gray-50 rounded-xl p-4">

                    {/* Day Header */}
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-blue-600 font-semibold">
                        {schedule.day}
                      </h3>

                      {schedule.timeSlots.length < 3 && (
                        <button
                          onClick={() => addTimeSlot(actualIndex)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center text-blue-600 hover:bg-blue-50"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>

                    {/* Time Slots */}
                    {schedule.timeSlots.map(slot => (
                      <div key={slot.id} className="flex items-center gap-2 mb-2">
                        <select
                          value={slot.time}
                          onChange={(e) =>
                            updateTimeSlot(actualIndex, slot.id, e.target.value)
                          }
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                          {timeSlots.map(time => (
                            <option key={time}>{time}</option>
                          ))}
                        </select>

                        {schedule.timeSlots.length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(actualIndex, slot.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}

                  </div>
                );
              })}
          </div>

          {/* Save */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                const enabled = schedules.filter(s => s.enabled);
                console.log("Saved:", enabled);
                alert("Saved successfully!");
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-3 rounded-xl font-semibold shadow"
            >
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}