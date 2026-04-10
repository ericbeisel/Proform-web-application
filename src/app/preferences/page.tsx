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
  X,
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

function normalizeSectionTimes(
  times: Record<string, TimeSlot[]>,
): Record<string, TimeSlot[]> {
  return Object.fromEntries(
    Object.entries(times).filter(
      ([, slots]) => Array.isArray(slots) && slots.length > 0,
    ),
  );
}

const fetchPreferences = async (): Promise<PreferencesQueryData> => {
  const [
    prefData,
    targetData,
    cardioData,
    stepData,
    workoutDays,
    cardioDays,
    supplementalDays,
    conditioningDays,
  ] = await Promise.all([
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

  const toSectionTimes = (items: any) => {
    const sectionTimes: Record<string, TimeSlot[]> = {};

    const itemsArray = Array.isArray(items) ? items : items ? [items] : [];

    for (let i = 0; i < itemsArray.length; i++) {
      const entry = itemsArray[i];

      if (!entry?.day) continue;

      let timeSlots: TimeSlot[] = [];

      if (Array.isArray(entry.time)) {
        timeSlots = entry.time.map((item: string) => ({
          startTime: formatFromApiTime(item),
        }));
      } else if (typeof entry.time === "string" && entry.time) {
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
      conditioning: String(
        targetData?.conditioning ?? prefData?.conditioning ?? 0,
      ),
    },
    calories: String(cardioData?.calories_goal ?? prefData?.calories_goal ?? 0),
    steps: String(
      stepData?.avarage_daily_steps ?? prefData?.avarage_daily_steps ?? 0,
    ),
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

function DayGrid({
  selected,
  timesCount = {},
  sectionTimes = {},
}: DayGridProps) {
  return (
    <>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {DAYS.map((day) => {
          const active = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              className={`h-9 sm:h-10 min-w-[44px] sm:min-w-[52px] rounded-lg sm:rounded-xl border text-xs sm:text-sm font-semibold transition cursor-default ${
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

      {selected.length > 0 && (
        <div className="mt-2 text-[11px] sm:text-[12px] font-medium text-[#6202AC]">
          {selected
            .map((day) => {
              const fullDay = DAY_MAP[day];
              const times = sectionTimes[fullDay] || [];
              if (times.length === 0) return null;
              return `${day}:${times[0].startTime}`;
            })
            .filter(Boolean)
            .join(" • ")}
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
  sectionTimes = {},
}: {
  title: string;
  subtitle: string;
  hint: string;
  timeLabel: string;
  selected: string[];
  onEditTimes: () => void;
  timesCount?: Record<string, number>;
  sectionTimes?: Record<string, TimeSlot[]>;
}) {
  return (
    <div>
      <h4 className="text-[13px] sm:text-[14px] font-bold text-[#1a1a1a] mb-1">{title}</h4>
      <p className="text-[11px] sm:text-[12px] text-[#666] leading-relaxed mb-3">{subtitle}</p>

      <p className="text-[10px] sm:text-[11px] font-semibold text-[#6202AC] mb-3">{hint}</p>

      <p className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-[#1a1a1a] mb-3">
        <Clock3 size={14} className="sm:size-[16px] text-[#666]" />
        {timeLabel}
      </p>

      <div className="mb-3">
        <MemoizedDayGrid
          selected={selected}
          timesCount={timesCount}
          sectionTimes={sectionTimes}
        />
      </div>

      <button
        onClick={onEditTimes}
        className="text-[12px] sm:text-[13px] font-semibold text-[#6202AC] underline decoration-[#6202AC] underline-offset-2"
      >
        Edit Times
      </button>
    </div>
  );
}

const MemoizedScheduleBlock = React.memo(ScheduleBlock);

export default function PreferencesPage() {
  const router = useRouter();

  const {
    data: preferencesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
  
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [cardioDays, setCardioDays] = useState<string[]>([]);
  const [supplementalDays, setSupplementalDays] = useState<string[]>([]);
  const [conditioningDays, setConditioningDays] = useState<string[]>([]);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [newSteps, setNewSteps] = useState("");
  const [activeEditSection, setActiveEditSection] =
    useState<ScheduleSection | null>(null);
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

  useEffect(() => {
    if (preferencesData) {
      setCalories(preferencesData.calories);
      setSteps(preferencesData.steps);
      setWeeklyTargets(preferencesData.weeklyTargets);
      setScheduleData(preferencesData.schedule);
      setWorkoutDays(getSelectedDays(preferencesData.schedule.workout));
      setCardioDays(getSelectedDays(preferencesData.schedule.cardio));
      setSupplementalDays(
        getSelectedDays(preferencesData.schedule.supplemental),
      );
      setConditioningDays(
        getSelectedDays(preferencesData.schedule.conditioning),
      );
      setNewCardioGoal(preferencesData.calories);
      console.log("Preferences data schedule:", preferencesData.schedule);
    }
  }, [preferencesData]);

  useEffect(() => {
    if (isError) {
      showToast(
        "error",
        (error as Error)?.message || "Failed to load preferences.",
      );
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
      const activity: ActivityDay[] = Object.entries(times).map(
        ([day, slots]) => ({
          day,
          time: slots.map((slot) => formatToApiTime(slot.startTime)),
        }),
      );

      await preferenceApi.addActivityDays(type, activity);
      if (showSuccess) {
        showToast("success", `${type} schedule updated successfully.`);
      }
    },
    [showToast],
  );

  const DEFAULT_TIMES: Record<ScheduleSection, string> = {
    workout: "08:30 AM",
    cardio: "07:30 PM",
    supplemental: "01:30 PM",
    conditioning: "04:30 PM",
  };

  const handleSectionDayChange = useCallback(
    async (section: ScheduleSection, nextSelectedDays: string[]) => {
      const currentSection = scheduleData[section] || {};
      const nextSectionTimes: Record<string, TimeSlot[]> = {};

      nextSelectedDays.forEach((shortDay) => {
        const fullDay = DAY_MAP[shortDay];
        if (!fullDay) return;

        nextSectionTimes[fullDay] = currentSection[fullDay]?.length
          ? currentSection[fullDay]
          : [{ startTime: DEFAULT_TIMES[section] }];
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
        (saveError as Error)?.message ||
          "Failed to update average daily steps.",
      );
    } finally {
      setIsSavingSteps(false);
    }
  }, [isSavingSteps, showToast, steps]);

  const handleSaveStepsFromModal = useCallback(async () => {
    const parsed = Number.parseInt(newSteps, 10);

    if (Number.isNaN(parsed)) {
      showToast("error", "Please enter a valid step count.");
      return;
    }

    try {
      await preferenceApi.updateAvgSteps(parsed);
      const value = String(parsed);

      setSteps(value);
      setNewSteps(value);
      setShowStepsModal(false);

      showToast("success", "Average daily steps updated successfully.");
    } catch (err: any) {
      showToast("error", err.message || "Failed to update steps.");
    }
  }, [newSteps, showToast]);

  const formatNumber = (value: string) => {
    const n = Number(value || "0");
    if (Number.isNaN(n)) return "0";
    return n.toString();
  };

  if (activeEditSection) {
    const sectionTimes = scheduleData[activeEditSection] || {};

    console.log("Active section:", activeEditSection);
    console.log("Section times:", sectionTimes);

    return (
      <EditTimeModal
        isOpen={true}
        onClose={() => setActiveEditSection(null)}
        onSave={handleSaveTimes}
        title={
          activeEditSection === "workout"
            ? "Edit Workout Times"
            : activeEditSection === "cardio"
              ? "Edit Cardio Times"
              : activeEditSection === "supplemental"
                ? "Edit Supplemental Times"
                : "Edit Conditioning Times"
        }
        initialTimes={sectionTimes}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9]">
      <div className="w-full">
        {/* HEADER - Reduced size with minimal padding */}
        <header className="flex items-center gap-3 border-b border-[#d4d9e0] px-3 sm:px-5 py-3 sm:py-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#eceff3] text-[#1e2024] transition hover:bg-[#e2e6eb]"
            aria-label="Back to account"
          >
            <ArrowLeft size={18} className="sm:size-[20px]" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight text-[#1a1a1a]">
            My Preferences
          </h1>
        </header>

        {/* BODY - Minimal side padding for mobile */}
        <div className="space-y-4 sm:space-y-5 px-3 sm:px-5 py-4 sm:py-6">
          <section className="grid gap-4 sm:gap-5 xl:grid-cols-2">
            <div className="rounded-2xl sm:rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                  Weekly Targets:
                </h2>

                <button
                  type="button"
                  onClick={() => setShowWeeklyTargetModal(true)}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#eadcff] text-[#6b17c6] transition hover:bg-[#decaff]"
                  aria-label="Edit weekly targets"
                >
                  <Pencil size={14} className="sm:size-[16px]" />
                </button>
              </div>

              <p className="mt-2 text-[13px] sm:text-[14px] text-[#737d8a]">
                Select an amount of each type when you open your app regularly
              </p>

              <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-3">
                {[
                  ["A. Primary Workout", weeklyTargets.resistance],
                  ["B. Cardio Workout", weeklyTargets.cardio],
                  ["C. Supplemental Workout", weeklyTargets.supplemental],
                  ["D. Conditioning Workout", weeklyTargets.conditioning],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl border border-[#EEEEEE] bg-[#F9F9F9] px-3 sm:px-4 py-3 sm:py-4"
                  >
                    <span className="text-[13px] sm:text-[14px] font-medium text-[#333]">
                      {label}
                    </span>

                    <span className="text-[15px] sm:text-[16px] font-bold text-[#6202AC]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="rounded-2xl sm:rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                    Edit Cardio Goal:
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCardioGoal("");
                      setShowCardioGoalModal(true);
                    }}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#eadcff] text-[#6b17c6] transition hover:bg-[#decaff]"
                    aria-label="Edit cardio goal"
                  >
                    <Pencil size={14} className="sm:size-[16px]" />
                  </button>
                </div>
                <p className="mt-2 text-[13px] sm:text-[14px] text-[#737d8a]">
                  Set the calories you would like to burn when your weekly goal
                </p>
                <input
                  value={calories}
                  readOnly
                  placeholder="Calories"
                  className="mt-3 sm:mt-4 h-11 sm:h-12 w-full cursor-pointer rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-3 sm:px-4 text-[16px] sm:text-[18px] text-[#1a1a1a] outline-none"
                />
              </div>

              <div className="rounded-2xl sm:rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                    Avg. Daily Steps
                  </h3>

                  <button
                    onClick={() => {
                      setNewSteps("");
                      setShowStepsModal(true);
                    }}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#eadcff] text-[#6b17c6] transition hover:bg-[#decaff]"
                  >
                    <Pencil size={14} className="sm:size-[16px]" />
                  </button>
                </div>

                <p className="mt-2 text-[13px] sm:text-[14px] text-[#737d8a]">
                  Set a daily step goal for most accurate cardio goal
                </p>

                <input
                  value={steps}
                  readOnly
                  className="mt-3 sm:mt-4 h-11 sm:h-12 w-full cursor-pointer rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-3 sm:px-4 text-[16px] sm:text-[18px] text-[#1a1a1a] outline-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl sm:rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
              Set Training Days:
            </h2>
            <div className="mt-4 sm:mt-5 grid gap-6 sm:gap-8 xl:grid-cols-2">
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
                sectionTimes={scheduleData.workout}
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
                sectionTimes={scheduleData.cardio}
              />

              <MemoizedScheduleBlock
                title="Preferred Supplemental Days:"
                subtitle="Choose which days you like to use your supplemental workout days, based on your weekly target"
                hint="*For Suggested: 2-4 Supplemental workouts, based on your weekly target"
                timeLabel={
                  getTimesCount("supplemental") &&
                  Object.values(getTimesCount("supplemental")).some(
                    (t) => t > 0,
                  )
                    ? "Times Selected"
                    : "Default Time 01:30 pm"
                }
                selected={supplementalDays}
                onEditTimes={() => setActiveEditSection("supplemental")}
                timesCount={getTimesCount("supplemental")}
                sectionTimes={scheduleData.supplemental}
              />

              <MemoizedScheduleBlock
                title="Preferred Conditioning Days:"
                subtitle="Choose which days you like to use your conditioning workout days, based on your weekly target"
                hint="*For Suggested: 2-3 Supplemental workouts (less cardio must...)"
                timeLabel={
                  getTimesCount("conditioning") &&
                  Object.values(getTimesCount("conditioning")).some(
                    (t) => t > 0,
                  )
                    ? "Times Selected"
                    : "Default Time 04:30 pm"
                }
                selected={conditioningDays}
                onEditTimes={() => setActiveEditSection("conditioning")}
                timesCount={getTimesCount("conditioning")}
                sectionTimes={scheduleData.conditioning}
              />
            </div>
          </section>

          <section className="grid gap-4 sm:gap-5 xl:grid-cols-3">
            <div className="relative rounded-2xl sm:rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                Measurement Units:
              </h3>
              <p className="mt-2 text-[13px] sm:text-[14px] text-[#737d8a]">
                Choose the weight units you&apos;d like for your workouts,
                overall settings and weekly targets
              </p>
              <button
                onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                className="mt-4 sm:mt-5 flex h-11 sm:h-12 w-full items-center justify-between rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-3 sm:px-4 text-[16px] sm:text-[18px] text-[#1a1a1a]"
              >
                <span>{weightUnit}</span>
                <ChevronDown
                  size={16}
                  className={`sm:size-[18px] transition-transform ${showUnitDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {showUnitDropdown && (
                <div className="absolute left-4 sm:left-6 right-4 sm:right-6 top-[calc(100%-24px)] z-10 mt-1 overflow-hidden rounded-xl border border-[#d1d7df] bg-white shadow-lg">
                  {["KG", "LBS"].map((unit) => (
                    <button
                      key={unit}
                      onClick={() => {
                        setWeightUnit(unit);
                        setShowUnitDropdown(false);
                      }}
                      className={`flex h-11 sm:h-12 w-full items-center px-3 sm:px-4 text-[16px] sm:text-[18px] hover:bg-[#f0f4f8] ${weightUnit === unit ? "bg-[#f0f4f8] font-bold text-[#6202AC]" : "text-[#1a1a1a]"}`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl sm:rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                  Account Visibility
                </h3>
                <Info size={14} className="text-[#1fb6ff]" />
              </div>
              <button className="mt-4 sm:mt-5 flex h-11 sm:h-12 w-full items-center justify-center rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-3 sm:px-4 text-[15px] sm:text-[17px] text-[#30343c]">
                Your profile group email value
              </button>
            </div>

            <div className="rounded-2xl sm:rounded-3xl border border-[#efc6c1] bg-[#f8fafc] p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                Account Deletion
              </h3>
              <p className="mt-2 text-[13px] sm:text-[14px] text-[#737d8a]">
                Permanently delete your account and remove all data
              </p>
              <button className="mt-4 sm:mt-5 flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ef4444] text-[16px] sm:text-[20px] font-semibold text-white shadow hover:bg-[#dc2626]">
                <Trash2 size={14} className="sm:size-[16px]" />
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

      <div className="fixed right-3 sm:right-4 top-3 sm:top-4 z-[60] flex w-full max-w-[calc(100%-24px)] sm:max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold shadow ${
              toast.type === "success"
                ? "border-[#b7e9d7] bg-[#e8f8f2] text-[#0f7f5c]"
                : "border-[#f1c8c1] bg-[#fff2f0] text-[#c0392b]"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Weekly Target Modal */}
      {showWeeklyTargetModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-4" onClick={() => setShowWeeklyTargetModal(false)}>
          <div 
            className="relative w-full max-w-[620px] max-h-[92vh] overflow-y-auto rounded-[24px] sm:rounded-[28px] bg-white px-5 pb-6 pt-10 shadow-2xl md:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWeeklyTargetModal(false)}
              className="absolute right-4 top-4 z-20 rounded-full bg-gray-100 p-2 text-[#1a1a1a] shadow-sm hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#6b17c6] text-white shadow-lg">
                <Crosshair size={30} className="sm:size-[34px]" />
              </div>
            </div>

            <h3 className="mt-5 text-center text-xl sm:text-2xl font-bold text-[#1a1a1a]">Set Weekly Targets</h3>
            <div className="mx-auto mt-2 h-[3px] w-32 bg-[#6202AC]" />
            <p className="mt-3 text-center text-xs sm:text-sm text-[#666] px-2">Set weekly targets to stay on track to meet your goals</p>

            <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
              {[
                { label: "Primary Workouts", key: "resistance" },
                { label: "Cardio Workouts", key: "cardio" },
                { label: "Supplemental", key: "supplemental" },
                { label: "Field Workouts", key: "conditioning" }
              ].map((item) => (
                <label key={item.key} className="block">
                  <span className="text-xs font-bold text-[#6202AC] uppercase tracking-wide">{item.label} *</span>
                  <input
                    type="number"
                    value={weeklyTargets[item.key as keyof typeof weeklyTargets]}
                    onChange={(e) => setWeeklyTargets(prev => ({ ...prev, [item.key]: e.target.value.replace(/\D/g, "") }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#d1d7df] px-4 text-lg outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#6202AC] transition-all"
                  />
                  {item.key === "cardio" && (
                    <div className="mt-2 rounded-lg border-l-4 border-[#11b988] bg-[#e8f8f2] p-2 text-[11px] text-[#14916f]">
                      Based on <a href="/cardio" className="font-bold underline">Cardio Schedule</a>
                    </div>
                  )}
                </label>
              ))}
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-center gap-3">
              <button onClick={() => setShowWeeklyTargetModal(false)} className="h-11 w-full sm:w-auto rounded-full border border-gray-200 px-8 font-semibold text-[#566071]">
                Cancel
              </button>
              <button onClick={() => void handleSaveWeeklyTargets()} className="h-11 w-full sm:min-w-[180px] rounded-full bg-[#6202AC] px-8 font-semibold text-white shadow-md hover:bg-[#500ba6]">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cardio Goal Modal */}
      {showCardioGoalModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-4" onClick={() => setShowCardioGoalModal(false)}>
          <div 
            className="relative w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[22px] bg-white px-5 sm:px-8 pb-8 pt-12 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowCardioGoalModal(false)} className="absolute right-4 top-4 z-20 rounded-full bg-gray-100 p-2 text-[#1a1a1a]">
              <X size={20} />
            </button>

            <p className="text-center text-sm font-semibold text-[#6b7384] uppercase tracking-widest">Adjusting</p>
            <h3 className="mt-1 text-center text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Cardio Goal</h3>
            <div className="mx-auto mt-3 h-[4px] w-20 bg-gradient-to-r from-[#12a9db] to-[#6202AC] rounded-full" />

            <div className="mt-8 grid items-center gap-3 grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-[18px] border bg-gray-50/50 px-3 py-5 sm:py-7 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#697286]">{formatNumber(calories)}</p>
                <p className="mt-1 text-sm font-semibold text-gray-500">Current</p>
                <p className="text-[10px] text-[#a3acb9]">kcal / week</p>
              </div>

              <div className="flex justify-center rotate-90 md:rotate-0 text-[#11a9d5]">
                <ArrowRight size={24} strokeWidth={3} />
              </div>

              <div className="rounded-[18px] border-[3px] border-[#10aad3] bg-white px-3 py-5 sm:py-7 text-center shadow-sm">
                <input
                  type="number"
                  value={newCardioGoal}
                  onChange={(e) => setNewCardioGoal(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="w-full bg-transparent text-center text-2xl sm:text-3xl font-bold text-[#6202AC] outline-none"
                />
                <p className="mt-1 text-sm font-semibold text-[#10aad3]">New Goal</p>
                <p className="text-[10px] text-[#a3acb9]">kcal / week</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button onClick={() => void handleSaveCardioGoal()} className="h-[52px] w-full rounded-full bg-[#6202AC] text-lg font-semibold text-white shadow-lg shadow-purple-100 hover:bg-[#500ba6]">
                Save Cardio Goal
              </button>

              <div className="pt-2">
                <p className="text-center text-xs font-medium text-[#a3acb9] mb-3">Quick suggestions:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["3000", "4000", "5000", "6000"].map((val) => (
                    <button key={val} onClick={() => setNewCardioGoal(val)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-[#6202AC] hover:bg-purple-50 hover:border-purple-200 transition-all">
                      {formatNumber(val)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Steps Modal */}
      {showStepsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-4" onClick={() => setShowStepsModal(false)}>
          <div 
            className="relative w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[22px] bg-white px-5 sm:px-8 pb-8 pt-12 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowStepsModal(false)} className="absolute right-4 top-4 z-20 rounded-full bg-gray-100 p-2 text-[#1a1a1a]">
              <X size={20} />
            </button>

            <p className="text-center text-sm font-semibold text-[#6b7384] uppercase tracking-widest">Adjusting</p>
            <h3 className="mt-1 text-center text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Daily Steps</h3>
            <div className="mx-auto mt-3 h-[4px] w-20 bg-gradient-to-r from-[#12a9db] to-[#6202AC] rounded-full" />

            <div className="mt-8 grid items-center gap-3 grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-[18px] border bg-gray-50/50 px-3 py-5 sm:py-7 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#697286]">{steps}</p>
                <p className="mt-1 text-sm font-semibold text-gray-500">Current</p>
                <p className="text-[10px] text-[#a3acb9]">steps / day</p>
              </div>

              <div className="flex justify-center rotate-90 md:rotate-0 text-[#11a9d5]">
                <ArrowRight size={24} strokeWidth={3} />
              </div>

              <div className="rounded-[18px] border-[3px] border-[#10aad3] bg-white px-3 py-5 sm:py-7 text-center shadow-sm">
                <input
                  type="number"
                  value={newSteps}
                  onChange={(e) => setNewSteps(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="w-full bg-transparent text-center text-2xl sm:text-3xl font-bold text-[#6202AC] outline-none"
                />
                <p className="mt-1 text-sm font-semibold text-[#10aad3]">New Goal</p>
                <p className="text-[10px] text-[#a3acb9]">steps / day</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button onClick={() => handleSaveStepsFromModal()} className="h-[52px] w-full rounded-full bg-[#6202AC] text-lg font-semibold text-white shadow-lg shadow-purple-100 hover:bg-[#500ba6]">
                Save Steps
              </button>

              <div className="pt-2">
                <p className="text-center text-xs font-medium text-[#a3acb9] mb-3">Quick suggestions:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["5000", "8000", "10000", "12000"].map((val) => (
                    <button key={val} onClick={() => setNewSteps(val)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-[#6202AC] hover:bg-purple-50 hover:border-purple-200 transition-all">
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}