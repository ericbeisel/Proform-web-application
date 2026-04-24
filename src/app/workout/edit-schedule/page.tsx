// src/app/workout/edit-schedule/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditTimeModal from "@/app/preferences/EditTimeModal";
import { preferenceApi } from "@/api/preferences/route";

interface TimeSlot {
  startTime: string;
}

interface ActivityDay {
  day: string;
  time: string[];
}

export default function EditSchedulePage() {
  const router = useRouter();
  const [scheduleTimes, setScheduleTimes] = useState<Record<string, TimeSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workoutType, setWorkoutType] = useState("Workout");

  // Fetch existing schedule times from API
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        // Get the workout type from URL param or default to "Workout"
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || "Workout";
        setWorkoutType(type);
        
        const activityDays = await preferenceApi.getActivityDays(type);
        
        // Convert activityDays to the format expected by EditTimeModal
        const timesByDay: Record<string, TimeSlot[]> = {};
        
        activityDays.forEach((activity: ActivityDay) => {
          const day = activity.day;
          const times = activity.time;
          
          if (times && times.length > 0) {
            timesByDay[day] = times.map(time => ({
              startTime: formatTimeForDisplay(time)
            }));
          }
        });
        
        setScheduleTimes(timesByDay);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, []);

  // Helper function to format time for display (08:30:00 -> 08:30 AM)
  const formatTimeForDisplay = (time: string): string => {
    if (!time) return "08:30 AM";
    
    // If already formatted with AM/PM, return as is
    if (time.includes("AM") || time.includes("PM")) {
      return time;
    }
    
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour.toString().padStart(2, "0")}:${minute} ${period}`;
  };

  // Helper function to format time for API (08:30 AM -> 08:30:00)
  const formatTimeForAPI = (time: string): string => {
    if (!time) return "08:30:00";
    
    // If already in HH:MM:SS format, return as is
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return time;
    }
    
    const [timePart, period] = time.split(" ");
    let [hour, minute] = timePart.split(":");
    let hourNum = parseInt(hour);
    
    if (period === "PM" && hourNum !== 12) {
      hourNum += 12;
    } else if (period === "AM" && hourNum === 12) {
      hourNum = 0;
    }
    
    return `${hourNum.toString().padStart(2, "0")}:${minute}:00`;
  };

  const handleSaveSchedule = async (times: Record<string, TimeSlot[]>) => {
    try {
      setSaving(true);
      
      // Convert the times to the format expected by the API
      const activityDays: ActivityDay[] = Object.entries(times).map(([day, slots]) => ({
        day: day,
        time: slots.map(slot => formatTimeForAPI(slot.startTime))
      }));
      
      // Save to API
      await preferenceApi.addActivityDays(workoutType, activityDays);
      
      console.log("Schedule saved successfully:", activityDays);
      
      // Redirect back to workout page with success message
      router.push("/workout/main?scheduleUpdated=true");
    } catch (error) {
      console.error("Failed to save schedule:", error);
      // You can show an error toast here
      alert("Failed to save schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    router.back(); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <EditTimeModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSaveSchedule}
        title={`Edit ${workoutType} Times`}
        initialTimes={scheduleTimes}
      />
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-700">Saving schedule...</p>
          </div>
        </div>
      )}
    </>
  );
}