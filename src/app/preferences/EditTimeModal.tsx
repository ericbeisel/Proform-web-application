"use client";

import React, { useState, useEffect, memo } from "react";
import { ArrowLeft, Plus, Trash2, ChevronDown } from "lucide-react";

const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Default times in 24-hour format (for <input type="time">)
const DEFAULT_TIMES_BY_SECTION: Record<string, string> = {
  workout: "08:30",
  cardio: "19:30",
  supplemental: "13:30",
  conditioning: "16:30",
};

export interface TimeSlot {
  startTime: string; // stored as "HH:MM AM/PM" or "HH:MM"
}

interface EditTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (times: Record<string, TimeSlot[]>) => void;
  title: string;
  initialTimes?: Record<string, TimeSlot[]>;
}

const EditTimeModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  initialTimes = {},
}: EditTimeModalProps) => {
  const [selectedTimes, setSelectedTimes] = useState<Record<string, TimeSlot[]>>(initialTimes);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (isOpen) {
      setSelectedTimes(initialTimes);
      setExpandedDay(null);
    }
  }, [isOpen, initialTimes]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    if (expandedDay === day) {
      setExpandedDay(null);
    } else {
      const newTimes = { ...selectedTimes };
      if (!newTimes[day]) {
        newTimes[day] = [];
      }
      setSelectedTimes(newTimes);
      setExpandedDay(day);
    }
  };

  const addTimeSlot = (day: string) => {
    if ((selectedTimes[day]?.length || 0) < 3) {
      const newTimes = { ...selectedTimes };

      // Determine section based on modal title
      const sectionKey = title.toLowerCase().includes("workout")
        ? "workout"
        : title.toLowerCase().includes("cardio")
        ? "cardio"
        : title.toLowerCase().includes("supplemental")
        ? "supplemental"
        : title.toLowerCase().includes("conditioning")
        ? "conditioning"
        : null;

      const defaultTime = sectionKey && DEFAULT_TIMES_BY_SECTION[sectionKey]
        ? DEFAULT_TIMES_BY_SECTION[sectionKey]
        : "09:00";

      newTimes[day] = [...(newTimes[day] || []), { startTime: defaultTime }];
      setSelectedTimes(newTimes);
    }
  };

  const removeTimeSlot = (day: string, index: number) => {
    const newTimes = { ...selectedTimes };
    newTimes[day] = newTimes[day].filter((_, i) => i !== index);
    setSelectedTimes(newTimes);
  };

const updateTimeSlot = (day: string, index: number, value: string) => {
  const newTimes = { ...selectedTimes };
  const daySlots = [...(newTimes[day] || [])];

  // Check duplicate
  const isDuplicate = daySlots.some(
    (slot, i) => slot.startTime === value && i !== index
  );

  if (isDuplicate) {
  setErrors((prev) => ({
  ...prev,
  [day]: `You have duplicate time slot for ${day}`,
}));
    return;
  }

  // Clear error
  setErrors((prev) => ({ ...prev, [day]: "" }));

  daySlots[index] = { startTime: value };
  newTimes[day] = daySlots;

  setSelectedTimes(newTimes);
};

  const totalSelectedDays = Object.keys(selectedTimes).filter(
    (d) => selectedTimes[d]?.length > 0,
  ).length;
  const totalSlots = Object.values(selectedTimes).reduce(
    (acc, curr) => acc + (curr?.length || 0),
    0,
  );

  return (
    <div className="flex flex-col min-h-screen bg-white w-full">
      {/* Header */}
      <div className="flex items-center border-b border-[#f0f0f0] px-4 py-5 md:px-8 lg:px-10 shrink-0">
        <button
          onClick={onClose}
          className="mr-3 md:mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-[#333]" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">
          {title || "Edit Time"}
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 lg:px-10 mx-auto w-full max-w-[1400px]">
        <p className="text-[14px] text-[#666] font-medium leading-relaxed mb-6">
          Select days and add up to 3 workout times per day. This helps us
          schedule your preferred workout times.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {DAYS_FULL.map((day) => {
            const slots = selectedTimes[day] || [];
            const isSelected = slots.length > 0;
            const isExpanded = expandedDay === day;

            return (
              <div key={day} className="flex flex-col">
                <button
                  onClick={() => toggleDay(day)}
                  className={`flex items-center gap-3 w-full border rounded-xl py-3 px-4 transition-all ${
                    isExpanded
                      ? "border-[#6202AC]"
                      : "border-[#E0E0E0] hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-[#6202AC] bg-[#6202AC]"
                        : "border-[#E0E0E0]"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="flex-1 text-left text-[15px] font-bold text-[#1a1a1a]">
                    {day}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Expanded Area for Selected Day */}
        {expandedDay && (
          <div className="border border-[#6202AC] rounded-[16px] overflow-hidden bg-white mb-6">
            <div className="flex items-center px-5 py-4 bg-[#f8f5fd]">
              <span className="text-[16px] font-bold text-[#1a1a1a]">
                {expandedDay}
              </span>
              {selectedTimes[expandedDay]?.length > 0 && (
                <div className="ml-auto bg-[#eaddfa] px-3 py-1 rounded-full text-[10px] font-bold text-[#6202AC]">
                  {selectedTimes[expandedDay].length} TIMES
                </div>
              )}
            </div>
            <div className="p-5 border-t border-[#f0f0f0]">
              {selectedTimes[expandedDay]?.map((slot, index) => (
                <div key={index} className="flex items-end gap-3 mb-5">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#888] mb-1.5">
                      START TIME
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={
                          // Convert stored format (HH:MM AM/PM or HH:MM) → HH:mm for input
                          (() => {
                            const timeStr = slot.startTime;
                            if (timeStr.includes(" ")) {
                              const [time, period] = timeStr.split(" ");
                              const [h, m] = time.split(":");
                              let hour = parseInt(h, 10);
                              const isPM = period?.toUpperCase() === "PM";
                              if (isPM && hour !== 12) hour += 12;
                              if (!isPM && hour === 12) hour = 0;
                              return `${hour.toString().padStart(2, "0")}:${m}`;
                            }
                            return timeStr.padStart(5, "0"); // already HH:mm
                          })()
                        }
                        onChange={(e) => {
                          const val = e.target.value; // "HH:mm"
                          if (val) {
                            const [h, m] = val.split(":");
                            let hour = parseInt(h, 10);
                            const ampm = hour >= 12 ? "PM" : "AM";
                            hour = hour % 12 || 12;
                            const displayTime = `${hour.toString().padStart(2, "0")}:${m} ${ampm}`;
                            updateTimeSlot(expandedDay, index, displayTime);
                          }
                        }}
                        className="w-full flex items-center justify-between text-[14px] bg-[#F9F9F9] text-black border border-[#EEEEEE] rounded-xl px-4 py-3 outline-none focus:border-[#6202AC] transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeTimeSlot(expandedDay, index)}
                    className="p-3 bg-[#FFF5F5] rounded-xl hover:bg-[#ffebeb] transition-colors mb-0.5"
                  >
                    <Trash2 size={20} className="text-[#FF4D4D]" />
                  </button>
                </div>
              ))}
{errors[expandedDay] && (
  <p className="text-[12px] text-red-500 font-medium mb-3">
    {errors[expandedDay]}
  </p>
)}
              {(selectedTimes[expandedDay]?.length || 0) < 3 ? (
                <button
                  onClick={() => addTimeSlot(expandedDay)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 border-[1.5px] border-dashed border-[#d1d1d1] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Plus size={18} className="text-[#6202AC]" />
                  <span className="text-[14px] font-bold text-[#6202AC]">
                    Add Time Slot
                  </span>
                </button>
              ) : (
                <p className="text-center text-[12px] font-medium text-[#888] italic">
                  Maximum 3 time slots per day
                </p>
              )}
            </div>
          </div>
        )}
        
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center border-t border-[#f0f0f0] px-4 py-6 md:px-8 lg:px-10 shrink-0">
        <button
          onClick={() => {
            onSave(selectedTimes);
            onClose();
          }}
          className="w-full md:max-w-md h-14 bg-[#6202AC] hover:bg-[#500ba6] text-white rounded-full text-[18px] font-bold transition-colors mb-3 shadow-md mx-auto"
        >
          Save Schedule
        </button>
        <p className="text-[13px] font-medium text-[#888]">
          {totalSelectedDays} day(s) selected • {totalSlots} total time slots
        </p>
      </div>
    </div>
  );
};

export default memo(EditTimeModal);