"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Clock, X } from "lucide-react";
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

// Generate time slots from 1 AM to 12 PM with 15 minute intervals
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 1; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const ampm = hour < 12 ? "AM" : "PM";
      const hour12 = hour === 12 ? 12 : hour % 12;
      const minuteStr = minute === 0 ? "00" : minute.toString();
      slots.push(`${hour12}:${minuteStr} ${ampm}`);
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
      enabled: false,
      timeSlots: [{ id: Date.now() + index, time: "9:00 AM" }]
    }))
  );

  const handleDayToggle = (index: number) => {
    setSchedules(prev => 
      prev.map((schedule, i) => 
        i === index ? { ...schedule, enabled: !schedule.enabled } : schedule
      )
    );
  };

  const addTimeSlot = (dayIndex: number) => {
    setSchedules(prev => 
      prev.map((schedule, i) => {
        if (i === dayIndex && schedule.timeSlots.length < 3) {
          return {
            ...schedule,
            timeSlots: [...schedule.timeSlots, { id: Date.now(), time: "9:00 AM" }]
          };
        }
        return schedule;
      })
    );
  };

  const removeTimeSlot = (dayIndex: number, slotId: number) => {
    setSchedules(prev => 
      prev.map((schedule, i) => {
        if (i === dayIndex && schedule.timeSlots.length > 1) {
          return {
            ...schedule,
            timeSlots: schedule.timeSlots.filter(slot => slot.id !== slotId)
          };
        }
        return schedule;
      })
    );
  };

  const updateTimeSlot = (dayIndex: number, slotId: number, newTime: string) => {
    setSchedules(prev => 
      prev.map((schedule, i) => {
        if (i === dayIndex) {
          return {
            ...schedule,
            timeSlots: schedule.timeSlots.map(slot => 
              slot.id === slotId ? { ...slot, time: newTime } : slot
            )
          };
        }
        return schedule;
      })
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8]">
      
      {/* HEADER - Matching existing screen */}
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
              <div className="text-white font-extrabold text-lg sm:text-xl leading-tight">Field Workout Times</div>
              <div className="text-white/80 text-xs sm:text-sm mt-0.5">Select times for each day:</div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 border-none rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all"
          >
            <X size={18} color="white" />
          </button>
        </div>
      </div>

      {/* BODY - Matching existing screen layout */}
      <div className="w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        
        {/* Days List */}
        <div className="space-y-3">
          {schedules.map((schedule, index) => (
            <div key={schedule.day} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Day Checkbox */}
              <div 
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleDayToggle(index)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    schedule.enabled 
                      ? "bg-purple-600 border-purple-600" 
                      : "border-gray-300 bg-white"
                  }`}>
                    {schedule.enabled && (
                      <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="font-semibold text-gray-800 text-base">{schedule.day}</span>
                </div>
                <Clock size={18} className="text-gray-400" />
              </div>

              {/* Time Slots - Shown when enabled */}
              {schedule.enabled && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <div className="space-y-4">
                    {schedule.timeSlots.map((slot, slotIndex) => (
                      <div key={slot.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 mb-2">
                            Time {slotIndex + 1}
                          </label>
                          <select
                            value={slot.time}
                            onChange={(e) => updateTimeSlot(index, slot.id, e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-700"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Remove button - only show if more than 1 time slot */}
                        {schedule.timeSlots.length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(index, slot.id)}
                            className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add Time Slot Button - Show if less than 3 slots */}
                    {schedule.timeSlots.length < 3 && (
                      <button
                        onClick={() => addTimeSlot(index)}
                        className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm mt-3 transition-all hover:bg-purple-50 px-4 py-2.5 rounded-xl w-full border border-dashed border-purple-300"
                      >
                        <Plus size={16} />
                        Add another time
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={() => {
              const enabledDays = schedules.filter(s => s.enabled);
              console.log("Saved schedules:", schedules);
              alert(`Saved ${enabledDays.length} days with workout times!`);
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            Save Workout Times
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You can add up to 3 time slots per day
          </p>
        </div>
      </div>
    </div>
  );
}