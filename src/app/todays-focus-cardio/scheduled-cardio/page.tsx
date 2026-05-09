// app/todays-focus-cardio/scheduled-cardio/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  ArrowLeft,
  Calendar,
  Loader2,
  Plus,
  Settings,
  List,
  Target,
  Clock,
  X,
  CheckCircle2,
  Trash2,
  Pencil,
  BarChart2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  getCardioSchedules,
  CardioSchedule,
  deleteCardioActivity,
} from "@/api/cardio/route";

import { useToast } from "@/components/ui/toast-provider";

export default function ScheduledCardioPage() {
  const router = useRouter();

  const toast = useToast();

  const [loading, setLoading] = useState(true);

  const [activities, setActivities] = useState<CardioSchedule[]>([]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedActivity, setSelectedActivity] =
    useState<CardioSchedule | null>(null);

  const [showPopup, setShowPopup] = useState(false);

  const [showEditGoal, setShowEditGoal] = useState(false);

  const [goalValue, setGoalValue] = useState(5000);

  const [newGoalValue, setNewGoalValue] = useState("");

  // ===========================================
  // FETCH
  // ===========================================

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);

      const response = await getCardioSchedules();

      setActivities(response.schedules || []);
    } catch (error) {
      console.error("Error fetching cardio schedules:", error);

      toast.error("Failed to load cardio schedule");
    } finally {
      setLoading(false);
    }
  };

  // ===========================================
  // DELETE
  // ===========================================

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this cardio activity?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteCardioActivity(id);

      toast.success("Cardio activity deleted");

      setActivities((prev) =>
        prev.filter((activity) => activity.id !== id)
      );

      if (selectedActivity?.id === id) {
        setShowPopup(false);
      }
    } catch (error) {
      console.error("Delete activity error:", error);

      toast.error("Failed to delete activity");
    } finally {
      setDeletingId(null);
    }
  };

  // ===========================================
  // FORMAT TIME
  // ===========================================

  const formatTime = (time: string) => {
    if (!time) return "";

    const [hour, minute] = time.split(":");

    const hourNum = parseInt(hour);

    const period = hourNum >= 12 ? "PM" : "AM";

    const displayHour = hourNum % 12 || 12;

    return `${displayHour}:${minute} ${period}`;
  };

  // ===========================================
  // CARD CLICK
  // ===========================================

  const handleCardClick = (activity: CardioSchedule) => {
    setSelectedActivity(activity);

    setShowPopup(true);
  };

  // ===========================================
  // COUNTS
  // ===========================================

  const completedCount = activities.filter(
    (a) => a.completed_session
  ).length;

  const pendingCount = activities.filter(
    (a) => !a.completed_session
  ).length;

  const progressPct = activities.length
    ? Math.min(
        (completedCount / activities.length) * 100,
        100
      )
    : 0;

  // ===========================================
  // UPDATE GOAL
  // ===========================================

  const handleGoalUpdate = () => {
    const parsed = parseInt(newGoalValue);

    if (!isNaN(parsed) && parsed > 0) {
      setGoalValue(parsed);
    }

    setShowEditGoal(false);

    setNewGoalValue("");
  };

  // ===========================================
  // LOADING
  // ===========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // ===========================================
  // UI
  // ===========================================

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">

      {/* TOP BAR */}

      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-40">

        {/* LEFT */}

        <div className="flex items-center gap-3">

          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="w-10 h-10 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-full flex items-center justify-center text-white">
            <Flame size={18} />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed]">
              Scheduled Cardio
            </h1>

            <p className="text-[11px] text-[#999]">
              {completedCount}/{activities.length} completed • Weekly cardio progress
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2">

          <button
            onClick={() =>
              router.push(
                "/todays-focus-cardio/manifest-cardio"
              )
            }
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
          >
            <List size={18} />
          </button>

          <button
            onClick={() =>
              router.push(
                "/todays-focus-cardio/cardio-edit-times"
              )
            }
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
          >
            <Settings size={18} />
          </button>

          <button
            onClick={() =>
              router.push(
                "/todays-focus-cardio/cardio-entry"
              )
            }
            className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-4 sm:p-5 lg:p-7 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 lg:gap-7 max-w-6xl mx-auto">

        {/* LEFT PANEL */}

        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 order-2 lg:order-1">

          <div className="flex justify-between items-center mb-4">

            <h2 className="font-bold text-base">
              Progress Overview
            </h2>

            <button
              onClick={() => setShowEditGoal(true)}
              className="bg-transparent border-none cursor-pointer text-[#bbb] p-2 rounded-lg flex items-center"
            >
              <Pencil size={15} />
            </button>
          </div>

          {/* BIG STATS */}

          <div className="flex items-baseline gap-2 flex-wrap mb-2">

            <span className="text-5xl font-extrabold text-green-500">
              {completedCount}
            </span>

            <span className="text-4xl text-gray-300">
              /
            </span>

            <span className="text-5xl font-extrabold text-[#7c3aed]">
              {activities.length}
            </span>
          </div>

          <div className="flex mb-4 text-xs">

            <span className="text-green-500 font-semibold min-w-[90px]">
              Completed
            </span>

            <span className="text-[#7c3aed] font-semibold ml-[30px]">
              Total
            </span>
          </div>

          {/* PROGRESS */}

          <div className="mb-2">

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between text-xs text-[#aaa] mb-5">

            <span>
              <span className="text-orange-500 font-semibold">
                {pendingCount}
              </span>{" "}
              pending
            </span>

            <span>
              <span className="text-green-500 font-semibold">
                {Math.round(progressPct)}%
              </span>{" "}
              complete
            </span>
          </div>

          {/* INFO BOXES */}

          <div className="grid grid-cols-2 gap-3">

            <div className="bg-indigo-50 rounded-xl p-4">

              <p className="text-xs text-[#888] font-medium mb-1.5">
                Sessions Left
              </p>

              <p className="text-4xl font-extrabold">
                {pendingCount}
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">

              <p className="text-xs text-[#888] font-medium mb-1.5">
                Goal
              </p>

              <p className="text-4xl font-extrabold text-orange-500">
                {goalValue}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="order-1 lg:order-2">

          <h2 className="font-bold text-base text-[#1a1a2e] mb-4">
            Cardio Sessions
          </h2>

          <div className="flex flex-col gap-3">

            {activities.map((activity, index) => (

              <div
                key={activity.id}
                onClick={() => handleCardClick(activity)}
                className={`rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all ${
                  activity.completed_session
                    ? "bg-[#1e3a2e] border border-green-500/20"
                    : "bg-[#1e1e2e]"
                }`}
              >

                {/* LEFT */}

                <div className="flex items-center gap-4">

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      activity.completed_session
                        ? "border-green-500 bg-green-500/10"
                        : "border-[#7c3aed] bg-[#3b3b88]/20"
                    }`}
                  >
                    {activity.completed_session ? (
                      <CheckCircle2
                        size={18}
                        className="text-green-500"
                      />
                    ) : null}
                  </div>

                  <div>

                    <p className="font-bold text-white text-base">
                      Cardio #{index + 1}
                    </p>

                    <p className="text-xs text-[#888] mt-1 mb-2">
                      By {activity.day_name} @{" "}
                      {formatTime(activity.title)}
                    </p>

                    <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      {activity.completed_session
                        ? `${activity.completed_session.calories_burned} cal`
                        : "Pending"}
                    </span>
                  </div>
                </div>

                {/* DELETE */}

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    handleDelete(activity.id);
                  }}
                  disabled={deletingId === activity.id}
                  className="bg-[#2a2a3e] border-none rounded-lg text-[#888] cursor-pointer p-2.5 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
                >
                  {deletingId === activity.id ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SESSION MODAL */}

      {showPopup && selectedActivity && (

        <div
          onClick={() => setShowPopup(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-7 w-full max-w-[480px] shadow-2xl max-h-[90vh] overflow-y-auto"
          >

            {/* TOP */}

            <div className="flex justify-between mb-3">

              <button
                onClick={() => {
                  setShowPopup(false);

                  router.push(
                    `/todays-focus-cardio/cardio-entry?id=${selectedActivity.custom_activity_id}`
                  );
                }}
                className="w-11 h-11 rounded-full bg-indigo-50 border-none cursor-pointer flex items-center justify-center text-[#7c3aed]"
              >
                <Pencil size={17} />
              </button>

              <button
                onClick={() => handleDelete(selectedActivity.id)}
                className="w-11 h-11 rounded-full bg-red-50 border-none cursor-pointer flex items-center justify-center text-red-500"
              >
                <Trash2 size={17} />
              </button>
            </div>

            <h2 className="text-center text-3xl font-extrabold text-[#1a1a2e] mb-6">
              Scheduled Cardio
            </h2>

            {/* CARDS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">

              {/* TIME */}

              <div className="bg-indigo-50 rounded-xl p-5">

                <p className="text-xs font-semibold text-[#7c3aed] mb-3">
                  Scheduled Time
                </p>

                <div className="flex items-center gap-2 mb-3">

                  <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center">

                    <Clock
                      size={18}
                      className="text-[#7c3aed]"
                    />
                  </div>

                  <div>

                    <p className="text-sm font-extrabold text-[#7c3aed]">
                      By {selectedActivity.day_name}
                    </p>

                    <p className="text-sm font-extrabold text-[#7c3aed]">
                      @ {formatTime(selectedActivity.title)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">

                  <Calendar
                    size={12}
                    className="text-[#aaa]"
                  />

                  <span className="text-xs text-[#aaa]">
                    This week
                  </span>
                </div>
              </div>

              {/* STATUS */}

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5">

                <div className="flex items-center gap-2 mb-3">

                  <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center">

                    <Flame
                      size={18}
                      className="text-white"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-white/85 font-medium">
                      Activity
                    </p>

                    <p className="text-xs text-white/85 font-medium">
                      Status
                    </p>
                  </div>
                </div>

                <p className="text-3xl font-extrabold text-white leading-none">
                  {selectedActivity.completed_session
                    ? "Done"
                    : "Pending"}
                </p>

                <div className="h-0.5 bg-white/35 rounded-full mt-3" />
              </div>
            </div>

            {/* BUTTONS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

              <button
                onClick={() => {
                  setShowPopup(false);

                  router.push(
                    `/todays-focus-cardio/cardio-entry?id=${selectedActivity.custom_activity_id}`
                  );
                }}
                className={`border-none rounded-xl text-white p-4 font-bold text-sm flex items-center justify-center gap-2 ${
                  selectedActivity.completed_session
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-[#7c3aed] to-[#6d28d9]"
                }`}
              >
                <CheckCircle2 size={17} />

                {selectedActivity.completed_session
                  ? "View Completed"
                  : "Complete Activity"}
              </button>

              <button
                onClick={() => {
                  setShowPopup(false);

                  router.push(
                    "/todays-focus-cardio/cardio-edit-times"
                  );
                }}
                className="bg-transparent border-2 border-[#7c3aed] rounded-xl text-[#7c3aed] p-4 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Calendar size={17} />
                Cardio Schedule
              </button>
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-transparent border-none text-[#aaa] cursor-pointer text-sm font-medium text-center p-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* EDIT GOAL MODAL */}

      {showEditGoal && (

        <div
          onClick={() => setShowEditGoal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[540px] shadow-2xl"
          >

            <div className="flex justify-end mb-2">

              <button
                onClick={() => setShowEditGoal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-2xl font-extrabold text-[#1a1a2e] mb-2">
              Update Weekly Goal
            </h2>

            <p className="text-sm text-[#999] mb-6 leading-relaxed">
              Enter your new weekly cardio goal to personalize your experience.
            </p>

            {/* INPUTS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

              {/* CURRENT */}

              <div>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#555] mb-2">

                  <Flame
                    size={14}
                    className="text-orange-500"
                  />

                  Current Goal
                </label>

                <input
                  type="number"
                  value={goalValue}
                  readOnly
                  className="w-full p-4 border border-gray-200 rounded-xl text-xl font-bold bg-gray-50 outline-none"
                />
              </div>

              {/* NEW */}

              <div>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#555] mb-2">

                  <Flame
                    size={14}
                    className="text-orange-500"
                  />

                  New Goal
                </label>

                <input
                  type="number"
                  value={newGoalValue}
                  onChange={(e) =>
                    setNewGoalValue(e.target.value)
                  }
                  placeholder="e.g. 6000"
                  className="w-full p-4 border border-gray-200 rounded-xl text-xl font-bold bg-white outline-none focus:border-[#7c3aed]"
                />
              </div>
            </div>

            {/* INFO */}

            <div className="bg-indigo-50 rounded-xl p-4 mb-6 flex items-start gap-3">

              <BarChart2
                size={18}
                className="text-[#7c3aed] flex-shrink-0 mt-0.5"
              />

              <p className="text-sm text-[#555] leading-relaxed">
                <span className="font-semibold">
                  Progress Tracking:
                </span>{" "}
                Regular cardio sessions help improve endurance,
                recovery, and weekly activity consistency.
              </p>
            </div>

            {/* BUTTON */}

            <button
              onClick={handleGoalUpdate}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-full text-white py-4 font-bold text-sm sm:text-base cursor-pointer hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}