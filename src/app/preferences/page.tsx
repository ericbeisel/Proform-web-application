"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Clock3,
  Crosshair,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EditTimeModal, { TimeSlot } from "./EditTimeModal";
import {
  ActivityDay,
  preferenceApi,
  WeeklyTarget as ApiWeeklyTarget,
} from "@/api/preferences/route";

const DAYS = ["M", "T", "W", "Th", "F", "Sa", "Su"];
const DAY_MAP: Record<string, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  Th: "Thursday",
  F: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};
const REVERSE_DAY_MAP: Record<string, string> = Object.entries(DAY_MAP).reduce(
  (acc, [short, full]) => ({ ...acc, [full]: short }),
  {},
);
const SECTION_TO_API_TYPE: Record<ScheduleSection, string> = {
  workout: "Workout",
  cardio: "Cardio",
  supplemental: "Supplemental",
  conditioning: "Conditioning",
};

type ScheduleSection = "workout" | "cardio" | "supplemental" | "conditioning";

type WeeklyTargetsState = {
  resistance: string;
  cardio: string;
  supplemental: string;
  conditioning: string;
};

type ToastType = "success" | "error";
type ToastMessage = {
  id: number;
  type: ToastType;
  message: string;
};

type PreferencesQueryData = {
  weeklyTargets: WeeklyTargetsState;
  calories: string;
  steps: string;
  schedule: Record<ScheduleSection, Record<string, TimeSlot[]>>;
};

function formatFromApiTime(time: string): string {
  const [h = "0", m = "00"] = time.split(":");
  let hours = Number(h);
  if (Number.isNaN(hours)) hours = 0;
  const ap = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours.toString().padStart(2, "0")}:${m} ${ap}`;
}

function formatToApiTime(time: string): string {
  const [h_m, ap] = time.split(" ");
  const [h = "0", m = "00"] = h_m.split(":");
  let hours = Number(h);
  if (Number.isNaN(hours)) hours = 0;
  const upperAp = (ap || "AM").toUpperCase();
  if (upperAp === "PM" && hours < 12) hours += 12;
  if (upperAp === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${m.padStart(2, "0")}:00`;
}

function getSelectedDays(sectionTimes: Record<string, TimeSlot[]>): string[] {
  return Object.keys(sectionTimes)
    .map((fullDay) => REVERSE_DAY_MAP[fullDay])
    .filter(Boolean);
}

function toInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeSectionTimes(times: Record<string, TimeSlot[]>): Record<string, TimeSlot[]> {
  return Object.fromEntries(
    Object.entries(times).filter(([, slots]) => Array.isArray(slots) && slots.length > 0),
  );
}

const fetchPreferences = async (): Promise<PreferencesQueryData> => {
  const [prefData, targetData, cardioData, stepData, workoutDays, cardioDays, supplementalDays, conditioningDays] =
    await Promise.all([
      preferenceApi.getPreferencesData(),
      preferenceApi.getWeeklyTarget(),
      preferenceApi.getCardioGoal(),
      preferenceApi.getAvgSteps(),
      preferenceApi.getActivityDays(SECTION_TO_API_TYPE.workout),
      preferenceApi.getActivityDays(SECTION_TO_API_TYPE.cardio),
      preferenceApi.getActivityDays(SECTION_TO_API_TYPE.supplemental),
      preferenceApi.getActivityDays(SECTION_TO_API_TYPE.conditioning),
    ]);

  console.log("workoutDays (raw):", workoutDays);
  console.log("cardioDays (raw):", cardioDays);
  console.log("supplementalDays (raw):", supplementalDays);
  console.log("conditioningDays (raw):", conditioningDays);

  // This matches the old code's functionality but without the forEach error
  const toSectionTimes = (items: any) => {
    const sectionTimes: Record<string, TimeSlot[]> = {};
    
    // Ensure items is an array (handle case when it's a single object)
    const itemsArray = Array.isArray(items) ? items : (items ? [items] : []);
    
    // Use for loop instead of forEach to avoid any potential issues
    for (let i = 0; i < itemsArray.length; i++) {
      const entry = itemsArray[i];
      
      // Skip if no day
      if (!entry?.day) continue;
      
      // Handle time which might be a string or array
      let timeSlots: TimeSlot[] = [];
      
      if (Array.isArray(entry.time)) {
        // If it's an array, map each time
        timeSlots = entry.time.map((item: string) => ({ 
          startTime: formatFromApiTime(item) 
        }));
      } else if (typeof entry.time === 'string' && entry.time) {
        // If it's a string, create a single slot (this is what the old code effectively did)
        timeSlots = [{ startTime: formatFromApiTime(entry.time) }];
      }
      
      if (timeSlots.length > 0) {
        sectionTimes[entry.day] = timeSlots;
      }
    }
    
    return normalizeSectionTimes(sectionTimes);
  };

  return {
    weeklyTargets: {
      resistance: String(targetData?.workout ?? prefData?.workout ?? 0),
      cardio: String(targetData?.cardio ?? prefData?.cardio ?? 0),
      supplemental: String(targetData?.supplement ?? prefData?.supplement ?? 0),
      conditioning: String(targetData?.conditioning ?? prefData?.conditioning ?? 0),
    },
    calories: String(cardioData?.calories_goal ?? prefData?.calories_goal ?? 0),
    steps: String(stepData?.avarage_daily_steps ?? prefData?.avarage_daily_steps ?? 0),
    schedule: {
      workout: toSectionTimes(workoutDays),
      cardio: toSectionTimes(cardioDays),
      supplemental: toSectionTimes(supplementalDays),
      conditioning: toSectionTimes(conditioningDays),
    },
  };
};

type DayGridProps = {
  selected: string[];
  timesCount?: Record<string, number>;
  sectionTimes?: Record<string, TimeSlot[]>;
};

function DayGrid({ selected, timesCount = {}, sectionTimes = {} }: DayGridProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const active = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              className={`h-10 min-w-[52px] rounded-xl border text-sm font-semibold transition cursor-default ${
                active
                  ? "border-[#6202ac] bg-[#6202ac] text-white shadow"
                  : "border-[#E0E0E0] bg-[#f8fafc] text-[#666]"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      
      {/* Show times in format: Mo:3:30 PM, Fr:10:00 AM */}
      {selected.length > 0 && (
        <div className="mt-2 text-[12px] font-medium text-[#6202AC]">
          {selected
            .map(day => {
              const fullDay = DAY_MAP[day];
              const times = sectionTimes[fullDay] || [];
              if (times.length === 0) return null;
              // Use the first time for each day
              return `${day}:${times[0].startTime}`;
            })
            .filter(Boolean)
            .join(' • ')}
        </div>
      )}
    </>
  );
}

const MemoizedDayGrid = React.memo(DayGrid);

function ScheduleBlock({
  title,
  subtitle,
  hint,
  timeLabel,
  selected,
  onEditTimes,
  timesCount = {},
  sectionTimes = {},  // Add this line
}: {
  title: string;
  subtitle: string;
  hint: string;
  timeLabel: string;
  selected: string[];
  onEditTimes: () => void;
  timesCount?: Record<string, number>;
  sectionTimes?: Record<string, TimeSlot[]>;  // Add this line
}) {
  return (
    <div>
      <h4 className="text-[14px] font-bold text-[#1a1a1a] mb-1">{title}</h4>
      <p className="text-[12px] text-[#666] leading-relaxed mb-3">{subtitle}</p>

      <p className="text-[11px] font-semibold text-[#6202AC] mb-3">{hint}</p>

      <p className="flex items-center gap-2 text-[13px] font-bold text-[#1a1a1a] mb-3">
        <Clock3 size={16} className="text-[#666]" />
        {timeLabel}
      </p>

      <div className="mb-3">
        <MemoizedDayGrid
          selected={selected}
          timesCount={timesCount}
          sectionTimes={sectionTimes}  // Pass it down to DayGrid
        />
      </div>

      <button
        onClick={onEditTimes}
        className="text-[13px] font-semibold text-[#6202AC] underline decoration-[#6202AC] underline-offset-2"
      >
        Edit Times
      </button>
    </div>
  );
}

const MemoizedScheduleBlock = React.memo(ScheduleBlock);

export default function PreferencesPage() {
  const router = useRouter();

//   const { data: preferencesData, isLoading, isError, error } = useQuery({
//   queryKey: ["preferences"],
//   queryFn: fetchPreferences,
//   staleTime: 1000 * 60 * 5, // cache for 5 minutes
// })

const { data: preferencesData, isLoading, isError, error } = useQuery({
  queryKey: ["preferences"],
  queryFn: fetchPreferences,
  staleTime: 1000 * 60 * 5,  // don't refetch for 5 minutes
  gcTime: 1000 * 60 * 10,    // keep in cache for 10 minutes
});
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [cardioDays, setCardioDays] = useState<string[]>([]);
  const [supplementalDays, setSupplementalDays] = useState<string[]>([]);
  const [conditioningDays, setConditioningDays] = useState<string[]>([]);

  const [activeEditSection, setActiveEditSection] = useState<ScheduleSection | null>(
    null,
  );
  const [scheduleData, setScheduleData] = useState<
    Record<string, Record<string, TimeSlot[]>>
  >({
    workout: {},
    cardio: {},
    supplemental: {},
    conditioning: {},
  });

  const [calories, setCalories] = useState("0");
  const [steps, setSteps] = useState("0");
  const [showWeeklyTargetModal, setShowWeeklyTargetModal] = useState(false);
  const [showCardioGoalModal, setShowCardioGoalModal] = useState(false);
  const [weeklyTargets, setWeeklyTargets] = useState<WeeklyTargetsState>({
    resistance: "0",
    cardio: "0",
    supplemental: "0",
    conditioning: "0",
  });
  const [newCardioGoal, setNewCardioGoal] = useState("0");
  const [weightUnit, setWeightUnit] = useState("KG");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSavingSteps, setIsSavingSteps] = useState(false);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  // Sync loaded data
  useEffect(() => {
    if (preferencesData) {
      setCalories(preferencesData.calories);
      setSteps(preferencesData.steps);
      setWeeklyTargets(preferencesData.weeklyTargets);
      setScheduleData(preferencesData.schedule);
      setWorkoutDays(getSelectedDays(preferencesData.schedule.workout));
      setCardioDays(getSelectedDays(preferencesData.schedule.cardio));
      setSupplementalDays(getSelectedDays(preferencesData.schedule.supplemental));
      setConditioningDays(getSelectedDays(preferencesData.schedule.conditioning));
      setNewCardioGoal(preferencesData.calories);
       console.log('Preferences data schedule:', preferencesData.schedule);
    }
  }, [preferencesData]);

  useEffect(() => {
    if (isError) {
      showToast("error", (error as Error)?.message || "Failed to load preferences.");
    }
  }, [error, isError, showToast]);

  const setSelectedDaysForSection = useCallback(
    (section: ScheduleSection, days: string[]) => {
      switch (section) {
        case "workout":
          setWorkoutDays(days);
          break;
        case "cardio":
          setCardioDays(days);
          break;
        case "supplemental":
          setSupplementalDays(days);
          break;
        case "conditioning":
          setConditioningDays(days);
          break;
        default:
          break;
      }
    },
    [],
  );

  const saveActivityDays = useCallback(
    async (
      section: ScheduleSection,
      times: Record<string, TimeSlot[]>,
      showSuccess = false,
    ) => {
      const type = SECTION_TO_API_TYPE[section];
      const activity: ActivityDay[] = Object.entries(times).map(([day, slots]) => ({
        day,
        time: slots.map((slot) => formatToApiTime(slot.startTime)),
      }));

      await preferenceApi.addActivityDays(type, activity);
      if (showSuccess) {
        showToast("success", `${type} schedule updated successfully.`);
      }
    },
    [showToast],
  );

 // Add this constant near the top of your file (or inside the component)
// Update this constant to use the correct 12-hour format with AM/PM
const DEFAULT_TIMES: Record<ScheduleSection, string> = {
  workout: "08:30 AM",
  cardio: "07:30 PM",     // This is correct for 19:30
  supplemental: "01:30 PM", // This is correct for 13:30
  conditioning: "04:30 PM", // This is correct for 16:30
};

const handleSectionDayChange = useCallback(
  async (section: ScheduleSection, nextSelectedDays: string[]) => {
    const currentSection = scheduleData[section] || {};
    const nextSectionTimes: Record<string, TimeSlot[]> = {};

    nextSelectedDays.forEach((shortDay) => {
      const fullDay = DAY_MAP[shortDay];
      if (!fullDay) return;

      // Use existing times if they exist, otherwise use the section-specific default
      nextSectionTimes[fullDay] = currentSection[fullDay]?.length
        ? currentSection[fullDay]
        : [{ startTime: DEFAULT_TIMES[section] }]; // This is already in "HH:MM AM/PM" format
    });

    const normalized = normalizeSectionTimes(nextSectionTimes);
    setSelectedDaysForSection(section, nextSelectedDays);
    setScheduleData((prev) => ({
      ...prev,
      [section]: normalized,
    }));

    try {
      await saveActivityDays(section, normalized, true);
    } catch (saveError: unknown) {
      showToast(
        "error",
        (saveError as Error)?.message ||
          `Failed to update ${SECTION_TO_API_TYPE[section]} schedule.`,
      );
    }
  },
  [saveActivityDays, scheduleData, setSelectedDaysForSection, showToast],
);

  const handleSaveTimes = useCallback(
    (times: Record<string, TimeSlot[]>) => {
      if (activeEditSection) {
        const normalized = normalizeSectionTimes(times);
        const selectedDays = getSelectedDays(normalized);

        setSelectedDaysForSection(activeEditSection, selectedDays);
        setScheduleData((prev) => ({
          ...prev,
          [activeEditSection]: normalized,
        }));

        void saveActivityDays(activeEditSection, normalized, true).catch(
          (saveError: unknown) => {
            showToast(
              "error",
              (saveError as Error)?.message ||
                `Failed to update ${SECTION_TO_API_TYPE[activeEditSection]} schedule.`,
            );
          },
        );
      }
    },
    [activeEditSection, saveActivityDays, setSelectedDaysForSection, showToast],
  );

  const getTimesCount = useCallback(
    (section: ScheduleSection) => {
      const sectionData = scheduleData[section] || {};
      const countMap: Record<string, number> = {};
      Object.entries(sectionData).forEach(([fullDay, times]) => {
        const shortDay = Object.keys(DAY_MAP).find(
          (k) => DAY_MAP[k] === fullDay,
        );
        if (shortDay && Array.isArray(times)) {
          countMap[shortDay] = times.length;
        }
      });
      return countMap;
    },
    [scheduleData],
  );

  const handleSaveWeeklyTargets = useCallback(async () => {
    const payload: ApiWeeklyTarget = {
      workout: toInt(weeklyTargets.resistance),
      cardio: toInt(weeklyTargets.cardio),
      supplement: toInt(weeklyTargets.supplemental),
      conditioning: toInt(weeklyTargets.conditioning),
    };

    try {
      await preferenceApi.updateWeeklyTarget(payload);
      setShowWeeklyTargetModal(false);
      showToast("success", "Weekly targets updated successfully.");
    } catch (saveError: unknown) {
      showToast(
        "error",
        (saveError as Error)?.message || "Failed to update weekly targets.",
      );
    }
  }, [showToast, weeklyTargets]);

  const handleSaveCardioGoal = useCallback(async () => {
    const parsed = Number.parseInt(newCardioGoal, 10);
    if (Number.isNaN(parsed)) {
      showToast("error", "Please enter a valid cardio goal.");
      return;
    }

    try {
      await preferenceApi.updateCardioGoal(parsed);
      const nextGoal = String(parsed);
      setCalories(nextGoal);
      setNewCardioGoal(nextGoal);
      setShowCardioGoalModal(false);
      showToast("success", "Cardio goal updated successfully.");
    } catch (saveError: unknown) {
      showToast(
        "error",
        (saveError as Error)?.message || "Failed to update cardio goal.",
      );
    }
  }, [newCardioGoal, showToast]);

  const handleSaveAvgSteps = useCallback(async () => {
    if (isSavingSteps) return;
    const parsed = Number.parseInt(steps, 10);
    if (Number.isNaN(parsed)) {
      showToast("error", "Please enter a valid step count.");
      return;
    }

    try {
      setIsSavingSteps(true);
      await preferenceApi.updateAvgSteps(parsed);
      setSteps(String(parsed));
      showToast("success", "Average daily steps updated successfully.");
    } catch (saveError: unknown) {
      showToast(
        "error",
        (saveError as Error)?.message || "Failed to update average daily steps.",
      );
    } finally {
      setIsSavingSteps(false);
    }
  }, [isSavingSteps, showToast, steps]);

 const formatNumber = (value: string) => {
  const n = Number(value || "0");
  if (Number.isNaN(n)) return "0";
  return n.toString();
};

if (activeEditSection) {
  // Get the times for the active section
  const sectionTimes = scheduleData[activeEditSection] || {};
  
  // Log to debug (remove after fixing)
  console.log('Active section:', activeEditSection);
  console.log('Section times:', sectionTimes);
  
  return (
    <EditTimeModal
      isOpen={true}
      onClose={() => setActiveEditSection(null)}
      onSave={handleSaveTimes}
      title={activeEditSection === "workout" ? "Edit Workout Times" : 
             activeEditSection === "cardio" ? "Edit Cardio Times" :
             activeEditSection === "supplemental" ? "Edit Supplemental Times" :
             "Edit Conditioning Times"}
      initialTimes={sectionTimes}
    />
  );
}

  return (
    <main className="min-h-screen bg-[#f4f6f9] p-4 md:p-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex items-center gap-4 border-b border-[#d4d9e0] px-4 py-6 md:px-10">
          <button
            type="button"
            onClick={() => router.push("/account")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eceff3] text-[#1e2024]"
            aria-label="Back to account"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold leading-none text-[#1a1a1a]">
            My Preferences
          </h1>
        </header>

        <div className="space-y-5 px-4 py-6 md:px-10 md:py-8">
          <section className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">
                Weekly Targets:
              </h2>
              <p className="mt-2 text-[14px] text-[#737d8a]">
                Select an amount of each type when you open your app regularly
              </p>

              <div className="mt-5 space-y-3">
                {[
                  ["A. Primary Workout", weeklyTargets.resistance],
                  ["B. Cardio Workout", weeklyTargets.cardio],
                  ["C. Supplemental Workout", weeklyTargets.supplemental],
                  ["D. Conditioning Workout", weeklyTargets.conditioning],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl border border-[#EEEEEE] bg-[#F9F9F9] px-4 py-4"
                  >
                    <span className="text-[14px] font-medium text-[#333]">
                      {label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-bold text-[#6202AC]">
                        {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowWeeklyTargetModal(true)}
                        className="rounded-full text-[#888] hover:bg-[#eceff4]"
                        aria-label="Edit weekly targets"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#1a1a1a]">
                    Edit Cardio Goal:
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCardioGoal(calories.trim() || "0");
                      setShowCardioGoalModal(true);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eadcff] text-[#6b17c6]"
                    aria-label="Edit cardio goal"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <p className="mt-2 text-[14px] text-[#737d8a]">
                  Set the calories you would like to burn when your weekly goal
                </p>
                <input
                  value={calories}
                  readOnly
                  // onClick={() => {
                  //   setNewCardioGoal(calories.trim() || "0");
                  //   setShowCardioGoalModal(true);
                  // }}
                  placeholder="Calories"
                  className="mt-4 h-12 w-full cursor-pointer rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[18px] text-[#1a1a1a] outline-none"
                />
               
              </div>

              <div className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
                <h3 className="text-2xl font-bold text-[#1a1a1a]">
                  Avg. Daily Steps
                </h3>
                <p className="mt-2 text-[14px] text-[#737d8a]">
                  Set a daily step goal for most accurate cardio goal
                </p>
                <input
                  value={steps}
                  onChange={(e) => setSteps(e.target.value.replace(/[^\d]/g, ""))}
                  onBlur={() => {
                    void handleSaveAvgSteps();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                      void handleSaveAvgSteps();
                    }
                  }}
                  placeholder="Steps"
                  className="mt-4 h-12 w-full rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[18px] text-[#1a1a1a] outline-none"
                />
              
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">
              Set Training Days:
            </h2>
      <div className="mt-5 grid gap-8 xl:grid-cols-2">
  <MemoizedScheduleBlock
    title="Preferred Workout Days:"
    subtitle="Select all days of the week you usually train on (can select more than one)"
    hint="*For Suggested: 5-6 Primary Workouts per week"
    timeLabel={
      getTimesCount("workout") &&
      Object.values(getTimesCount("workout")).some((t) => t > 0)
        ? "Times Selected"
        : "Default Time 08:30 am"
    }
    selected={workoutDays}
    onEditTimes={() => setActiveEditSection("workout")}
    timesCount={getTimesCount("workout")}
    sectionTimes={scheduleData.workout}  // Add this line
  />
  
  <MemoizedScheduleBlock
    title="Default Cardio Days:"
    subtitle="Choose which days you like to use your cardio workouts"
    hint="*For Suggested: 3-5 Cardio workouts per week"
    timeLabel={
      getTimesCount("cardio") &&
      Object.values(getTimesCount("cardio")).some((t) => t > 0)
        ? "Times Selected"
        : "Default Time 07:30 pm"
    }
    selected={cardioDays}
    onEditTimes={() => setActiveEditSection("cardio")}
    timesCount={getTimesCount("cardio")}
    sectionTimes={scheduleData.cardio}  // Add this line
  />
  
  <MemoizedScheduleBlock
    title="Preferred Supplemental Days:"
    subtitle="Choose which days you like to use your supplemental workout days, based on your weekly target"
    hint="*For Suggested: 2-4 Supplemental workouts, based on your weekly target"
    timeLabel={
      getTimesCount("supplemental") &&
      Object.values(getTimesCount("supplemental")).some((t) => t > 0)
        ? "Times Selected"
        : "Default Time 01:30 pm"
    }
    selected={supplementalDays}
    onEditTimes={() => setActiveEditSection("supplemental")}
    timesCount={getTimesCount("supplemental")}
    sectionTimes={scheduleData.supplemental}  // Add this line
  />
  
  <MemoizedScheduleBlock
    title="Preferred Conditioning Days:"
    subtitle="Choose which days you like to use your conditioning workout days, based on your weekly target"
    hint="*For Suggested: 2-3 Supplemental workouts (less cardio must...)"
    timeLabel={
      getTimesCount("conditioning") &&
      Object.values(getTimesCount("conditioning")).some((t) => t > 0)
        ? "Times Selected"
        : "Default Time 04:30 pm"
    }
    selected={conditioningDays}
    onEditTimes={() => setActiveEditSection("conditioning")}
    timesCount={getTimesCount("conditioning")}
    sectionTimes={scheduleData.conditioning}  // Add this line
  />
</div>
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <div className="relative rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
              <h3 className="text-2xl font-bold text-[#1a1a1a]">
                Measurement Units:
              </h3>
              <p className="mt-2 text-[14px] text-[#737d8a]">
                Choose the weight units you&apos;d like for your workouts,
                overall settings and weekly targets
              </p>
              <button
                onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                className="mt-5 flex h-12 w-full items-center justify-between rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[18px] text-[#1a1a1a]"
              >
                <span>{weightUnit}</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${showUnitDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {showUnitDropdown && (
                <div className="absolute left-6 right-6 top-[calc(100%-24px)] z-10 mt-1 overflow-hidden rounded-xl border border-[#d1d7df] bg-white shadow-lg">
                  {["KG", "LBS"].map((unit) => (
                    <button
                      key={unit}
                      onClick={() => {
                        setWeightUnit(unit);
                        setShowUnitDropdown(false);
                      }}
                      className={`flex h-12 w-full items-center px-4 text-[18px] hover:bg-[#f0f4f8] ${weightUnit === unit ? "bg-[#f0f4f8] font-bold text-[#6202AC]" : "text-[#1a1a1a]"}`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-[#1a1a1a]">
                  Account Visibility
                </h3>
                <Info size={14} className="text-[#1fb6ff]" />
              </div>
              <button className="mt-5 flex h-12 w-full items-center justify-center rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[17px] text-[#30343c]">
                Your profile group email value
              </button>
            </div>

            <div className="rounded-3xl border border-[#efc6c1] bg-[#f8fafc] p-6">
              <h3 className="text-2xl font-bold text-[#1a1a1a]">
                Account Deletion
              </h3>
              <p className="mt-2 text-[14px] text-[#737d8a]">
                Permanently delete your account and remove all data
              </p>
              <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ef4444] text-[20px] font-semibold text-white shadow hover:bg-[#dc2626]">
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1a1a1a] shadow-md">
            Loading preferences...
          </div>
        </div>
      )}

      <div className="fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold shadow ${
              toast.type === "success"
                ? "border-[#b7e9d7] bg-[#e8f8f2] text-[#0f7f5c]"
                : "border-[#f1c8c1] bg-[#fff2f0] text-[#c0392b]"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

{showWeeklyTargetModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
    <div className="w-full max-w-[620px] rounded-[28px] bg-white px-6 pb-6 pt-8 shadow-[0_25px_60px_rgba(0,0,0,0.30)] md:px-8">
      
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#6b17c6] text-white shadow-[0_12px_20px_rgba(0,0,0,0.22)]">
          <Crosshair size={34} />
        </div>
      </div>

      <h3 className="mt-5 text-center text-2xl font-bold leading-none text-[#1a1a1a]">
        Set Weekly Targets
      </h3>

      <div className="mx-auto mt-3 h-[3px] w-full max-w-[160px] bg-[#6202AC]" />

      <p className="mt-3 text-center text-sm text-[#666]">
        Set weekly targets to stay on track to meet your goals
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-[#6202AC]">
            Primary Workouts *
          </span>
          <input
            value={weeklyTargets.resistance}
            onChange={(e) =>
              setWeeklyTargets((prev) => ({
                ...prev,
                resistance: e.target.value.replace(/[^\d]/g, ""),
              }))
            }
            className="mt-2 h-11 w-full rounded-xl border border-[#d1d7df] px-4 text-lg text-[#1a1a1a] outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#6202AC]">
            Cardio Workouts *
          </span>
          <input
            value={weeklyTargets.cardio}
            onChange={(e) =>
              setWeeklyTargets((prev) => ({
                ...prev,
                cardio: e.target.value.replace(/[^\d]/g, ""),
              }))
            }
            className="mt-2 h-11 w-full rounded-xl border border-[#d1d7df] px-4 text-lg text-[#1a1a1a] outline-none"
          />
          {/* Green message moved here */}
          <div className="mt-2 rounded-xl border-l-4 border-[#11b988] bg-[#e8f8f2] px-4 py-3 text-sm text-[#14916f]">
            *set based on your Cardio Schedule/Itinerary.
            To make changes go to your{" "}
            <a href="/cardio" className="font-semibold underline">
              Cardio Schedule
            </a>
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#6202AC]">
            Supplemental Workouts *
          </span>
          <input
            value={weeklyTargets.supplemental}
            onChange={(e) =>
              setWeeklyTargets((prev) => ({
                ...prev,
                supplemental: e.target.value.replace(/[^\d]/g, ""),
              }))
            }
            className="mt-2 h-11 w-full rounded-xl border border-[#d1d7df] px-4 text-lg text-[#1a1a1a] outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#6202AC]">
            Field Workouts *
          </span>
          <input
            value={weeklyTargets.conditioning}
            onChange={(e) =>
              setWeeklyTargets((prev) => ({
                ...prev,
                conditioning: e.target.value.replace(/[^\d]/g, ""),
              }))
            }
            className="mt-2 h-11 w-full rounded-xl border border-[#d1d7df] px-4 text-lg text-[#1a1a1a] outline-none"
          />
        </label>
      </div>

      <div className="mt-7 flex justify-center gap-4">
        <button
          type="button"
          onClick={() => setShowWeeklyTargetModal(false)}
          className="h-11 rounded-full border border-[#d1d7df] px-8 text-base font-semibold text-[#566071]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => {
            void handleSaveWeeklyTargets();
          }}
          className="h-11 min-w-[180px] rounded-full bg-[#6202AC] px-8 text-base font-semibold text-white shadow-md hover:bg-[#500ba6]"
        >
          Save Changes
        </button>
      </div>

    </div>
  </div>
)}

   {showCardioGoalModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
    onClick={() => setShowCardioGoalModal(false)}
  >
    <div
      className="w-full max-w-[520px] rounded-[22px] bg-white px-6 md:px-7 pb-8 pt-8 shadow-[0_25px_70px_rgba(0,0,0,0.35)]"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-center text-lg font-semibold text-[#6b7384]">
        You&apos;re adjusting:
      </p>

      <h3 className="mt-2 text-center text-3xl font-bold leading-none text-[#1a1a1a]">
        Cardio Goal
      </h3>

      <div className="mx-auto mt-4 h-[4px] w-[110px] bg-gradient-to-r from-[#12a9db] to-[#6202AC]" />

      <div className="mt-7 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">

        {/* Current */}
        <div className="rounded-[18px] border border-[#cfd5dd] px-4 py-7 text-center">
          <p className="text-3xl font-bold leading-none text-[#697286]">
            {formatNumber(calories)}
          </p>
          <p className="mt-2 text-base font-semibold text-[#1f2229]">
            Current
          </p>
          <p className="mt-1 text-xs text-[#a3acb9]">kcal per week</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-[#11a9d5]">
          <ArrowRight
            size={28}
            strokeWidth={3}
            className="rotate-90 md:rotate-0"
          />
        </div>

        {/* New */}
        <div className="rounded-[18px] border-[3px] border-[#10aad3] px-4 py-7 text-center">
          <input
            value={newCardioGoal}
            onChange={(e) => {
              const next = e.target.value.replace(/[^\d]/g, "") || "0";
              setNewCardioGoal(next);
            }}
            className="w-full bg-transparent text-center text-3xl font-bold leading-none text-[#6202AC] outline-none"
          />
          <p className="mt-2 text-base font-semibold text-[#1f2229]">New</p>
          <p className="mt-1 text-xs text-[#a3acb9]">kcal per week</p>
        </div>

      </div>

      <p className="mx-auto mt-6 max-w-[360px] text-center text-sm text-[#6d7688]">
        Set a weekly cardio calorie goal that aligns with your fitness
        objectives
      </p>

      {/* Save Button */}
      <div className="mx-auto mt-5 w-full max-w-[260px]">
        <button
          type="button"
          onClick={() => {
            void handleSaveCardioGoal();
          }}
          className="h-[50px] w-full rounded-full bg-[#6202AC] px-6 text-[20px] font-semibold text-white shadow-md hover:bg-[#500ba6]"
        >
          Save Cardio Goal
        </button>
      </div>

      {/* Suggestions */}
      <p className="mt-7 text-center text-sm text-[#a3acb9]">
        Quick suggestions:
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {["3000", "4000", "5000", "6000"].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setNewCardioGoal(suggestion);
            }}
            className="rounded-[14px] border border-[#d1d7df] bg-white px-4 py-2 text-[14px] font-bold text-[#6202AC] hover:bg-gray-50"
          >
            {formatNumber(suggestion)}
          </button>
        ))}
      </div>

    </div>
  </div>
)}
    </main>
  );
}
