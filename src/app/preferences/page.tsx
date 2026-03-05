"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Mock API functions for React Query demonstration
const fetchPreferences = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        weeklyTargets: {
          resistance: "4",
          cardio: "4",
          supplemental: "4",
          conditioning: "3",
        },
        calories: "4000",
        steps: "8000",
        schedule: {
          workout: { Monday: [{ startTime: "03:30 PM" }] },
          cardio: { Tuesday: [{ startTime: "04:30 PM" }] },
          supplemental: { Wednesday: [{ startTime: "01:30 PM" }] },
          conditioning: { Thursday: [{ startTime: "04:30 PM" }] },
        },
      });
    }, 500);
  });
};

const updatePreferencesAPI = async (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, 500);
  });
};

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

type DayGridProps = {
  selected: string[];
  onChange: (days: string[]) => void;
  timesCount?: Record<string, number>;
};

function DayGrid({ selected, onChange, timesCount = {} }: DayGridProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const active = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((d) => d !== day)
                    : [...selected, day],
                )
              }
              className={`h-10 min-w-[52px] rounded-xl border text-sm font-semibold transition ${
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
      <div className="mt-2 flex flex-wrap gap-2 text-center text-[12px] font-semibold text-[#888]">
        {DAYS.map((day) => {
          const count = timesCount[day] || 0;
          return (
            <div key={day} className="min-w-[52px]">
              {selected.includes(day) && count > 1 ? `+${count - 1}` : ""}
            </div>
          );
        })}
      </div>
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
  onChange,
  onEditTimes,
  timesCount = {},
}: {
  title: string;
  subtitle: string;
  hint: string;
  timeLabel: string;
  selected: string[];
  onChange: (days: string[]) => void;
  onEditTimes: () => void;
  timesCount?: Record<string, number>;
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
          onChange={onChange}
          timesCount={timesCount}
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
  const queryClient = useQueryClient();

  const { data: preferencesData, isLoading } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
  });

  const mutation = useMutation({
    mutationFn: updatePreferencesAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });

  const [workoutDays, setWorkoutDays] = useState(["M", "W", "Th", "F"]);
  const [cardioDays, setCardioDays] = useState(["T", "Sa"]);
  const [supplementalDays, setSupplementalDays] = useState(["W", "Su"]);
  const [conditioningDays, setConditioningDays] = useState(["M", "Th"]);

  const [activeEditSection, setActiveEditSection] = useState<string | null>(
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

  const [calories, setCalories] = useState("4000");
  const [steps, setSteps] = useState("8000");
  const [showWeeklyTargetModal, setShowWeeklyTargetModal] = useState(false);
  const [showCardioGoalModal, setShowCardioGoalModal] = useState(false);
  const [weeklyTargets, setWeeklyTargets] = useState({
    resistance: "4",
    cardio: "4",
    supplemental: "4",
    conditioning: "3",
  });
  const [newCardioGoal, setNewCardioGoal] = useState("0");
  const [goalEntry, setGoalEntry] = useState("");
  const [weightUnit, setWeightUnit] = useState("KG");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  // Sync loaded data
  useEffect(() => {
    if (preferencesData) {
      const data = preferencesData as any;
      setCalories(data.calories);
      setSteps(data.steps);
      setWeeklyTargets(data.weeklyTargets);
      setScheduleData(data.schedule);
      if (data.weightUnit) setWeightUnit(data.weightUnit);
    }
  }, [preferencesData]);

  // Ensure that all selected days across all sections have at least one time slot populated.
  // This powers the radio selection indicator inside the EditTimeModal.
  useEffect(() => {
    setScheduleData((prev) => {
      let changed = false;
      const newSchedule = { ...prev };

      const syncSection = (
        section: "workout" | "cardio" | "supplemental" | "conditioning",
        days: string[],
      ) => {
        days.forEach((shortDay) => {
          const fullDay = DAY_MAP[shortDay];
          if (fullDay) {
            if (!newSchedule[section]) {
              newSchedule[section] = {};
            }
            if (
              !newSchedule[section][fullDay] ||
              newSchedule[section][fullDay].length === 0
            ) {
              newSchedule[section] = {
                ...newSchedule[section],
                [fullDay]: [{ startTime: "09:00 AM" }],
              };
              changed = true;
            }
          }
        });
      };

      syncSection("workout", workoutDays);
      syncSection("cardio", cardioDays);
      syncSection("supplemental", supplementalDays);
      syncSection("conditioning", conditioningDays);

      return changed ? newSchedule : prev;
    });
  }, [workoutDays, cardioDays, supplementalDays, conditioningDays]);

  const handleSaveTimes = useCallback(
    (times: Record<string, TimeSlot[]>) => {
      if (activeEditSection) {
        const newSchedule = {
          ...scheduleData,
          [activeEditSection]: times,
        };
        setScheduleData(newSchedule);
        mutation.mutate({ schedule: newSchedule });
      }
    },
    [activeEditSection, scheduleData, mutation],
  );

  const getTimesCount = useCallback(
    (section: "workout" | "cardio" | "supplemental" | "conditioning") => {
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

  const currentCardioGoal = calories.trim() || "4000";
  const formatNumber = (value: string) => {
    const n = Number(value || "0");
    if (Number.isNaN(n)) return "0";
    return n.toLocaleString();
  };

  if (activeEditSection) {
    return (
      <EditTimeModal
        isOpen={true}
        onClose={() => setActiveEditSection(null)}
        onSave={handleSaveTimes}
        title={"Edit Time"}
        initialTimes={
          activeEditSection ? scheduleData[activeEditSection] || {} : {}
        }
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
                  ["A. Resistance Workout", weeklyTargets.resistance],
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
                      setGoalEntry("");
                      setNewCardioGoal("0");
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
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Calories"
                  className="mt-4 h-12 w-full rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[18px] text-[#1a1a1a] outline-none"
                />
                <div className="mt-3 rounded-xl border border-[#bfe4fa] bg-[#eaf6ff] px-4 py-3 text-[16px]">
                  <span className="font-semibold text-[#01a1e8]">*e.g.:</span>{" "}
                  Suggest 150 Total will equal on avg 750 for Goals
                </div>
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
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="Steps"
                  className="mt-4 h-12 w-full rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[18px] text-[#1a1a1a] outline-none"
                />
                <div className="mt-3 rounded-xl border border-[#f1c8c1] bg-[#fff2f0] px-4 py-3 text-[16px]">
                  <span className="font-semibold text-[#ff5328]">
                    *Must enter
                  </span>{" "}
                  at least 3,000 Steps make walk-miles on top 10,000
                </div>
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
                    : "Default Time 3:30 pm"
                }
                selected={workoutDays}
                onChange={setWorkoutDays}
                onEditTimes={() => setActiveEditSection("workout")}
                timesCount={getTimesCount("workout")}
              />
              <MemoizedScheduleBlock
                title="Default Cardio Days:"
                subtitle="Choose which days you like to use your cardio workouts"
                hint="*For Suggested: 3-5 Cardio workouts per week"
                timeLabel={
                  getTimesCount("cardio") &&
                  Object.values(getTimesCount("cardio")).some((t) => t > 0)
                    ? "Times Selected"
                    : "Default Time 4:30 pm"
                }
                selected={cardioDays}
                onChange={setCardioDays}
                onEditTimes={() => setActiveEditSection("cardio")}
                timesCount={getTimesCount("cardio")}
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
                    : "Default Time 1:30 pm"
                }
                selected={supplementalDays}
                onChange={setSupplementalDays}
                onEditTimes={() => setActiveEditSection("supplemental")}
                timesCount={getTimesCount("supplemental")}
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
                    : "Default Time 4:30 pm"
                }
                selected={conditioningDays}
                onChange={setConditioningDays}
                onEditTimes={() => setActiveEditSection("conditioning")}
                timesCount={getTimesCount("conditioning")}
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
                        mutation.mutate({ weightUnit: unit });
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

      {showWeeklyTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-[820px] rounded-[32px] bg-white px-8 pb-8 pt-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:px-12">
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#6b17c6] text-white shadow-[0_14px_22px_rgba(0,0,0,0.22)]">
                <Crosshair size={40} />
              </div>
            </div>

            <h3 className="mt-6 text-center text-3xl font-bold leading-none text-[#1a1a1a]">
              Set Weekly Targets
            </h3>
            <div className="mx-auto mt-4 h-[3px] w-full max-w-[200px] bg-[#6202AC]" />
            <p className="mt-3 text-center text-sm text-[#666]">
              Set weekly targets to stay on track to meet your goals
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
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
                  className="mt-2 h-12 w-full rounded-xl border border-[#d1d7df] px-4 text-lg text-[#1a1a1a] outline-none"
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
                  className="mt-2 h-12 w-full rounded-xl border border-[#d1d7df] px-4 text-lg text-[#1a1a1a] outline-none"
                />
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
                  className="mt-2 h-12 w-full rounded-xl border border-[#d1d7df] px-4 text-lg text-[#1a1a1a] outline-none"
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
                  className="mt-2 h-12 w-full rounded-xl border border-[#d1d7df] px-4 text-lg text-[#1a1a1a] outline-none"
                />
              </label>
            </div>

            <div className="mt-6 rounded-xl border-l-4 border-[#11b988] bg-[#e8f8f2] px-4 py-3 text-sm text-[#14916f]">
              *Cardio workouts are set based on your Cardio Schedule/Itinerary.
              To make changes go to your{" "}
              <a href="/itinerary/schedule" className="font-semibold underline">
                Cardio Schedule
              </a>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowWeeklyTargetModal(false)}
                className="h-12 rounded-full border border-[#d1d7df] px-8 text-base font-semibold text-[#566071]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  mutation.mutate({ weeklyTargets });
                  setShowWeeklyTargetModal(false);
                }}
                className="h-12 min-w-[200px] rounded-full bg-[#6202AC] px-10 text-base font-semibold text-white shadow-md hover:bg-[#500ba6]"
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
            className="w-full max-w-[600px] rounded-[24px] bg-white px-6 md:px-8 pb-10 pt-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-xl font-semibold text-[#6b7384]">
              You&apos;re adjusting:
            </p>
            <h3 className="mt-2 text-center text-4xl font-bold leading-none text-[#1a1a1a]">
              Cardio Goal
            </h3>
            <div className="mx-auto mt-4 h-[4px] w-[120px] bg-gradient-to-r from-[#12a9db] to-[#6202AC]" />

            <div className="mt-8 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-[20px] border border-[#cfd5dd] px-4 py-8 text-center">
                <p className="text-4xl font-bold leading-none text-[#697286]">
                  {formatNumber(currentCardioGoal)}
                </p>
                <p className="mt-3 text-lg font-semibold text-[#1f2229]">
                  Current
                </p>
                <p className="mt-1 text-sm text-[#a3acb9]">kcal per week</p>
              </div>

              <div className="flex items-center justify-center text-[#11a9d5]">
                <ArrowRight
                  size={32}
                  strokeWidth={3}
                  className="rotate-90 md:rotate-0"
                />
              </div>

              <div className="rounded-[20px] border-[3px] border-[#10aad3] px-4 py-8 text-center">
                <input
                  value={newCardioGoal}
                  onChange={(e) => {
                    const next = e.target.value.replace(/[^\d]/g, "") || "0";
                    setNewCardioGoal(next);
                    setCalories(next);
                  }}
                  className="w-full bg-transparent text-center text-4xl font-bold leading-none text-[#6202AC] outline-none"
                />
                <p className="mt-3 text-lg font-semibold text-[#1f2229]">New</p>
                <p className="mt-1 text-sm text-[#a3acb9]">kcal per week</p>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-[400px] text-center text-sm text-[#6d7688]">
              Set a weekly cardio calorie goal that aligns with your fitness
              objectives
            </p>

            <div className="mx-auto mt-6 w-full max-w-[300px]">
              <button
                type="button"
                onClick={() => {
                  mutation.mutate({ calories });
                  setShowCardioGoalModal(false);
                }}
                className="mt-6 h-[54px] w-[90%] mx-auto block rounded-full bg-[#6202AC] px-6 text-center text-[22px] font-semibold text-white shadow-md hover:bg-[#500ba6]"
              >
                Save Cardio Goal
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-[#a3acb9]">
              Quick suggestions:
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {["3000", "4000", "5000", "6000"].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setGoalEntry(suggestion);
                    setNewCardioGoal(suggestion);
                    setCalories(suggestion);
                  }}
                  className="rounded-[16px] border border-[#d1d7df] bg-white px-5 py-2.5 text-[15px] font-bold text-[#6202AC] hover:bg-gray-50"
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
