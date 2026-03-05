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

export interface TimeSlot {
  startTime: string;
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
  const [selectedTimes, setSelectedTimes] =
    useState<Record<string, TimeSlot[]>>(initialTimes);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

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
      newTimes[day] = [...(newTimes[day] || []), { startTime: "09:00 AM" }];
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
    newTimes[day] = [...(newTimes[day] || [])];
    newTimes[day][index] = { startTime: value };
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
                          // Converting "09:00 AM" to "09:00" format for the input
                          (() => {
                            const match =
                              slot.startTime.match(/(\d+):(\d+)\s(AM|PM)/i);
                            if (match) {
                              let h = parseInt(match[1], 10);
                              const m = match[2];
                              const isPM = match[3].toUpperCase() === "PM";
                              if (isPM && h !== 12) h += 12;
                              if (!isPM && h === 12) h = 0;
                              return `${h.toString().padStart(2, "0")}:${m}`;
                            }
                            return "09:00";
                          })()
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const [h, m] = val.split(":");
                            let hour = parseInt(h, 10);
                            const ampm = hour >= 12 ? "PM" : "AM";
                            hour = hour % 12 || 12;
                            updateTimeSlot(
                              expandedDay,
                              index,
                              `${hour.toString().padStart(2, "0")}:${m} ${ampm}`,
                            );
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
