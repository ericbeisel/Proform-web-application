"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Plus,
  Calendar,
  List,
  Trash2,
  Pencil,
  Camera,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Target,
  Play,
  ArrowRight,
  Activity,
  ArrowLeft
} from "lucide-react";
import {
  getCardioMenu,
  CardioMenuItem,
  addCardioSession,
  completeCardioSession,
  setCardioGoal,
  completeCardioActivity,
  getCardioActivities,
  CardioActivity,
  quickLogCardio,
  QuickLogPayload,
  getCardioDashboard,
  getCardioHistory,
  getCardioSchedules, CardioSchedule
} from "@/api/cardio/route";
import { useRouter, useSearchParams } from "next/navigation";
import { preferenceApi } from "@/api/preferences/route";
import { useToast } from "@/components/ui/toast-provider";

interface Session {
  id: number;
  cardioId: string;
  name: string;
  calories: number | null;
  minutes: number | null;
  suggestion?: string | null;
  mets?: number | null;
  demo_url?: string | null;
  distance?: number | null;
  avgWatts?: number | null;
  rpms?: number | null;
  peakHr?: number | null;
  avgHr?: number | null;
  submitted?: boolean;
  submitting?: boolean;
  isEditing?: boolean;
  uploadedImage?: string | null;
  type?: string;
  submittedData?: any;
}

export default function SubmitCardio() {
  const toast = useToast();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardioMenu, setCardioMenu] = useState<CardioMenuItem[]>([]);
  const [expandedCards, setExpandedCards] = useState<{
    [key: number]: boolean;
  }>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<"quick" | "start">("quick");
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [isGoalSectionOpen, setIsGoalSectionOpen] = useState(false);
  const [scheduledActivities, setScheduledActivities] = useState<CardioSchedule[]>([]);
  // Add this state at the top with your other states
const [isQuickLogOpen, setIsQuickLogOpen] = useState(true);
const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  // const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
  //   null,
  // );
  // const [scheduledActivities, setScheduledActivities] = useState<
  //   CardioActivity[]
  // >([]);
  const [caloriesGoal, setCaloriesGoal] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [caloriesLeft, setCaloriesLeft] = useState(0);
  const [showCardioGoalModal, setShowCardioGoalModal] = useState(false);
  const [newCardioGoal, setNewCardioGoal] = useState("");
  const [currentGoal, setCurrentGoal] = useState(0);
  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");

  // Workout Goal State
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [goalCalories, setGoalCalories] = useState<number | null>(null);
  const [goalMinutes, setGoalMinutes] = useState<number | null>(null);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      cardioId: "",
      name: "BOXING BAG. HEAVY",
      calories: null,
      minutes: null,
      mets: null,
      submitted: false,
      submitting: false,
    },
  ]);

  const [memberId, setMemberId] = useState<string>("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const id = user.id || user.member_id || user.user_id || "";
    setMemberId(String(id));
  }, []);

  useEffect(() => {
    const fetchCardioMenu = async () => {
      try {
        setLoading(true);
        const menu = await getCardioMenu();
        setCardioMenu(menu);
      } catch (error) {
        console.error("Error fetching cardio menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCardioMenu();
  }, []);

  useEffect(() => {
    const fetchCurrentGoal = async () => {
      try {
        const prefData = await preferenceApi.getPreferencesData();
        setCurrentGoal(prefData.calories_goal || 0);
      } catch (error) {
        console.error("Error fetching current goal:", error);
      }
    };
    fetchCurrentGoal();
  }, []);

useEffect(() => {
  const fetchScheduledActivities = async () => {
    try {
      const response = await getCardioSchedules();
      console.log("Scheduled activities response:", response);
      
      // The response has schedules array
      if (response && response.schedules && Array.isArray(response.schedules)) {
        setScheduledActivities(response.schedules);
      } else {
        setScheduledActivities([]);
      }
    } catch (error) {
      console.error("Error fetching scheduled activities:", error);
    }
  };
  fetchScheduledActivities();
}, []);

  useEffect(() => {
    const fetchCaloriesData = async () => {
      try {
        // Fetch calories goal from preferences
        const preferences = await preferenceApi.getPreferencesData();
        const goal = preferences.calories_goal || 0;
        setCaloriesGoal(goal);

        // Fetch total calories burned from cardio history
        const history = await getCardioHistory("thisweek", 1, 100);
        const totalBurned = history.weeklyCaloriesSum || 0;
        setTotalCaloriesBurned(totalBurned);

        // Calculate calories left
        setCaloriesLeft(Math.max(0, goal - totalBurned));
      } catch (error) {
        console.error("Error fetching calories data:", error);
      }
    };

    fetchCaloriesData();
  }, []);

  const handleSaveToScheduled = async () => {
    if (!selectedActivityId) return;

    setShowCompletePopup(false);

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const totalCalories = sessions.reduce(
      (sum, s) => sum + (s.calories || 0),
      0,
    );

    const records = sessions.map((session) => ({
      has_upload_image: !!session.uploadedImage,
      avg_mets: session.mets || 0,
      distance_mi: session.distance || 0,
      calories_burned: session.calories || 0,
      peak_hr: session.peakHr || 0,
      rpm: session.rpms || 0,
      avg_hr: session.avgHr || 0,
      mets: session.mets || 0,
      image: session.uploadedImage || "",
      avg_watts: session.avgWatts || 0,
      cardio_option: session.name,
      minutes: session.minutes || 0,
    }));

    const payload = {
      member_id: memberId,
      customActivityId: selectedActivityId,
      records: records,
      totalMinutes: totalMinutes,
      totalCalories: totalCalories,
      title: "Cardio Workout",
      cardioType: "cardio",
    };

    setIsCompleting(true);

    try {
      await completeCardioActivity(payload);
      alert(
        `Cardio session completed successfully! Total: ${totalCalories} calories in ${totalMinutes} minutes`,
      );
      sessions.forEach((session) =>
        updateSession(session.id, "submitted", true),
      );
      router.push("/todays-focus-cardio/scheduled-cardio");
    } catch (error) {
      console.error("Error completing cardio session:", error);
      alert("Failed to complete cardio session. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCreateNew = async () => {
    setShowCompletePopup(false);
    setIsCompleting(true);

    try {
      const totalMinutes = sessions.reduce(
        (sum, s) => sum + (s.minutes || 0),
        0,
      );
      const totalCalories = sessions.reduce(
        (sum, s) => sum + (s.calories || 0),
        0,
      );

      for (const session of sessions) {
        const submitData = {
          title: session.name,
          minutes: Number(session.minutes || 0),
          calories_burned: Number(session.calories || 0),
          member_id: String(memberId),
        };
        await addCardioSession(submitData);
      }

      alert(
        `Cardio session completed successfully! Total: ${totalCalories} calories in ${totalMinutes} minutes`,
      );
      sessions.forEach((session) =>
        updateSession(session.id, "submitted", true),
      );
    } catch (error) {
      console.error("Error completing cardio session:", error);
      alert("Failed to complete cardio session. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  // Add Session
  const addSession = () => {
    const newId = Date.now();
    setSessions((prev) => [
      ...prev,
      {
        id: newId,
        cardioId: "",
        name: "BOXING BAG. HEAVY",
        calories: null,
        minutes: null,
        distance: null,
        mets: null,
        avgWatts: null,
        rpms: null,
        peakHr: null,
        avgHr: null,
        submitted: false,
        submitting: false,
        isEditing: false,
        uploadedImage: null,
      },
    ]);
    setExpandedCards((prev) => ({ ...prev, [newId]: false }));
  };

  // Delete Session
  const deleteSession = (id: number) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setExpandedCards((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  // Update Session
  const updateSession = (id: number, field: keyof Session, value: any) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, [field]: value === "" ? null : value } : s,
      ),
    );
  };

  // Toggle expand/collapse
  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle cardio selection from dropdown
  const handleCardioSelect = (id: number, selectedName: string) => {
    const selectedItem = cardioMenu.find((item) => item.name === selectedName);
    if (selectedItem) {
      updateSession(id, "cardioId", selectedItem.id);
      updateSession(id, "name", selectedItem.name);
      updateSession(id, "suggestion", selectedItem.suggestion);
      updateSession(id, "demo_url", selectedItem.demo_url);
    } else {
      updateSession(id, "name", selectedName);
    }
  };

  // Handle Submit for individual card
  const handleSubmitCard = async (session: Session) => {
    if (!session.calories || session.calories <= 0) {
      alert("Please enter calories burned");
      return;
    }
    if (!session.minutes || session.minutes <= 0) {
      alert("Please enter minutes");
      return;
    }
    if (!memberId) {
      alert("User not found. Please login again.");
      return;
    }

    updateSession(session.id, "submitting", true);

    try {
      let response;

      // If coming from scheduled activity (has activityId in URL), use complete-activity API
      if (activityId) {
        const payload = {
          member_id: memberId,
          customActivityId: Number(activityId),
          records: [
            {
              has_upload_image: !!session.uploadedImage,
              avg_mets: session.mets || 0,
              distance_mi: session.distance || 0,
              calories_burned: session.calories,
              peak_hr: session.peakHr || 0,
              rpm: session.rpms || 0,
              avg_hr: session.avgHr || 0,
              mets: session.mets || 0,
              image: session.uploadedImage || "",
              avg_watts: session.avgWatts || 0,
              cardio_option: session.name,
              minutes: session.minutes,
            },
          ],
          totalMinutes: session.minutes,
          totalCalories: session.calories,
          title: session.name,
          cardioType: session.type || "cardio",
        };
        response = await completeCardioActivity(payload);
      }
      // For Quick Log mode (sessionType === "quick"), use quick-log API
      else if (sessionType === "quick") {
        const payload: QuickLogPayload = {
          member_id: memberId,
          records: [
            {
              cardio_option: session.name,
              minutes: session.minutes,
              calories_burned: session.calories,
              image: session.uploadedImage || undefined,
            },
          ],
          totalMinutes: session.minutes,
          totalCalories: session.calories,
        };
        response = await quickLogCardio(payload);
      }
      // For Start Session mode without activityId (should not happen normally)
      else {
        const submitData = {
          title: session.name,
          minutes: Number(session.minutes),
          calories_burned: Number(session.calories),
          member_id: String(memberId),
        };
        response = await addCardioSession(submitData);
      }

      // Mark original card as submitted
      // Mark original card as submitted
      updateSession(session.id, "submitted", true);
      updateSession(session.id, "submitting", false);

          const isFirstCard = sessions.findIndex(s => s.id === session.id) === 0;
    const alreadyHasSecondCard = sessions.length > 1;
      // Only insert prefilled card in Start Session mode
     if (sessionType === "start" && workoutStarted && isFirstCard && !alreadyHasSecondCard) {
        const newId = Date.now();
        setSessions((prev) => {
          const index = prev.findIndex((s) => s.id === session.id);
          const newSession: Session = {
            id: newId,
            cardioId: session.cardioId,
            name: session.name,
            calories: session.calories,
            minutes: session.minutes,
            distance: session.distance ?? null,
            mets: session.mets ?? null,
            avgWatts: session.avgWatts ?? null,
            rpms: session.rpms ?? null,
            peakHr: session.peakHr ?? null,
            avgHr: session.avgHr ?? null,
            suggestion: session.suggestion ?? null,
            demo_url: session.demo_url ?? null,
            submitted: false,
            submitting: false,
            isEditing: false,
            uploadedImage: null,
            type: session.type,
          };
          const updated = [...prev];
          updated.splice(index + 1, 0, newSession);
          return updated;
        });
        setExpandedCards((prev) => ({ ...prev, [newId]: false }));
      }

      alert(`Cardio "${session.name}" submitted successfully!`);
    } catch (error) {
      console.error("Error submitting cardio:", error);
      updateSession(session.id, "submitting", false);
      alert("Failed to submit cardio session. Please try again.");
    }
  };

  const handleSaveCardioGoal = async () => {
  const parsed = Number.parseInt(newCardioGoal, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    alert("Please enter a valid cardio goal");
    return;
  }

  if (!memberId) {
    alert("User not found. Please login again.");
    return;
  }

  try {
    // Use setCardioGoal with the correct payload format
    await setCardioGoal({
      cardio_goal: parsed,
      member_id: memberId,
    });
    
    setCurrentGoal(parsed);
    setCaloriesGoal(parsed);
    setNewCardioGoal("");
    setShowCardioGoalModal(false);
    toast.success("Cardio goal updated successfully!");
  } catch (error) {
    console.error("Error updating goal:", error);
    toast.error("Failed to update cardio goal");
  }
};

  // const handleSaveCardioGoal = async () => {
  //   const parsed = Number.parseInt(newCardioGoal, 10);
  //   if (Number.isNaN(parsed) || parsed <= 0) {
  //     alert("Please enter a valid cardio goal");
  //     return;
  //   }

  //   try {
  //     // Using the same API as preferences page
  //     await preferenceApi.updateCardioGoal(parsed);
  //     setGoalCalories(parsed);
  //     setNewCardioGoal("");
  //     setShowCardioGoalModal(false);
  //     alert("Cardio goal updated successfully!");
  //   } catch (error) {
  //     console.error("Error updating goal:", error);
  //     alert("Failed to update cardio goal");
  //   }
  // };
  const formatTime = (time: string) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const handleCompleteAllSessions = async () => {
    const activityId = searchParams.get("id");

    if (activityId) {
      const records = sessions.map((session) => ({
        has_upload_image: !!session.uploadedImage,
        avg_mets: session.mets || 0,
        distance_mi: session.distance || 0,
        calories_burned: session.calories || 0,
        peak_hr: session.peakHr || 0,
        rpm: session.rpms || 0,
        avg_hr: session.avgHr || 0,
        mets: session.mets || 0,
        image: session.uploadedImage || "",
        avg_watts: session.avgWatts || 0,
        cardio_option: session.name,
        minutes: session.minutes || 0,
      }));

      const totalMinutes = records.reduce((sum, r) => sum + r.minutes, 0);
      const totalCalories = records.reduce(
        (sum, r) => sum + r.calories_burned,
        0,
      );

      const payload = {
        member_id: memberId,
        customActivityId: Number(activityId),
        records: records,
        totalMinutes: totalMinutes,
        totalCalories: totalCalories,
        title: "Cardio Workout",
        cardioType: "cardio",
      };

      setIsCompleting(true);

      try {
        const response = await completeCardioActivity(payload);
        console.log("Complete session response:", response);
        alert(
          `Cardio session completed successfully! Total: ${totalCalories} calories in ${totalMinutes} minutes`,
        );

        sessions.forEach((session) => {
          updateSession(session.id, "submitted", true);
        });

        router.push("/todays-focus-cardio/scheduled-cardio");
      } catch (error) {
        console.error("Error completing cardio session:", error);
        alert("Failed to complete cardio session. Please try again.");
      } finally {
        setIsCompleting(false);
      }
    } else {
      const totalMinutes = sessions.reduce(
        (sum, s) => sum + (s.minutes || 0),
        0,
      );
      const totalCalories = sessions.reduce(
        (sum, s) => sum + (s.calories || 0),
        0,
      );
      const totalDistance = sessions.reduce(
        (sum, s) => sum + (s.distance || 0),
        0,
      );
      const totalMets = sessions.reduce((sum, s) => sum + (s.mets || 0), 0);
      const totalAvgWatts = sessions.reduce(
        (sum, s) => sum + (s.avgWatts || 0),
        0,
      );
      const totalRpms = sessions.reduce((sum, s) => sum + (s.rpms || 0), 0);
      const totalPeakHr = sessions.reduce((sum, s) => sum + (s.peakHr || 0), 0);
      const totalAvgHr = sessions.reduce((sum, s) => sum + (s.avgHr || 0), 0);

      const avgMets = sessions.length > 0 ? totalMets / sessions.length : 0;
      const cardioOption = sessions.map((s) => s.name).join(", ");

      const payload = {
        id: "",
        cardio_option: cardioOption,
        minutes: totalMinutes,
        calories_burned: totalCalories,
        manifest_id: memberId,
        "distance mi": totalDistance,
        mets: totalMets,
        "avg watts": totalAvgWatts,
        гра: totalRpms,
        "peak hr": totalPeakHr,
        avg_hr: totalAvgHr,
        avg_mets: avgMets,
        image: "",
      };

      setIsCompleting(true);

      try {
        const response = await completeCardioSession(payload);
        console.log("Complete session response:", response);
        alert(
          `Cardio session completed successfully! Total: ${totalCalories} calories in ${totalMinutes} minutes`,
        );

        sessions.forEach((session) => {
          updateSession(session.id, "submitted", true);
        });
      } catch (error) {
        console.error("Error completing cardio session:", error);
        alert("Failed to complete cardio session. Please try again.");
      } finally {
        setIsCompleting(false);
      }
    }
  };

  const handleResetGoal = async () => {
  if (!memberId) return;

  try {
    await setCardioGoal({
      cardio_goal: 0,  // Changed from calories_goal to cardio_goal
      member_id: memberId,
    });
    toast.success("Goal reset successfully");
    // Refresh the data
    window.location.reload();
  } catch (error) {
    console.error("Error resetting goal:", error);
    toast.error("Failed to reset goal");
  }
};

  // const handleResetGoal = async () => {
  //   if (!memberId) return;

  //   try {
  //     await setCardioGoal({
  //       calories_goal: 0, // Reset to 0 or your default
  //       member_id: memberId,
  //     });
  //     toast.success("Goal reset successfully");
  //     // Refresh the data
  //     window.location.reload();
  //   } catch (error) {
  //     console.error("Error resetting goal:", error);
  //     toast.error("Failed to reset goal");
  //   }
  // };

 const handleUpdateGoal = async () => {
  if (!goalCalories || goalCalories <= 0) {
    alert("Calories goal is required");
    return;
  }

  if (!memberId) {
    alert("User not found. Please login again.");
    return;
  }

  setIsSavingGoal(true);
  try {
    await setCardioGoal({
      cardio_goal: Number(goalCalories),  // Changed from calories_goal to cardio_goal
      member_id: String(memberId),
    });
    alert("Goal updated successfully!");
    setIsEditingGoal(false);
  } catch (error) {
    console.error("Error updating goal:", error);
    alert("Failed to update goal. Please try again.");
  } finally {
    setIsSavingGoal(false);
  }
};

  // const handleUpdateGoal = async () => {
  //   if (!goalCalories || goalCalories <= 0) {
  //     alert("Calories goal is required");
  //     return;
  //   }

  //   if (!memberId) {
  //     alert("User not found. Please login again.");
  //     return;
  //   }

  //   setIsSavingGoal(true);
  //   try {
  //     await setCardioGoal({
  //       calories_goal: goalCalories,
  //       member_id: memberId,
  //     });
  //     alert("Goal updated successfully!");
  //     setIsEditingGoal(false);
  //   } catch (error) {
  //     console.error("Error updating goal:", error);
  //     alert("Failed to update goal. Please try again.");
  //   } finally {
  //     setIsSavingGoal(false);
  //   }
  // };

const handleStartWorkout = async () => {
  console.log("goalCalories value:", goalCalories);
  console.log("goalCalories type:", typeof goalCalories);
  console.log("memberId:", memberId);

  if (!goalCalories || goalCalories <= 0) {
    alert("Calories goal is required and must be greater than 0");
    return;
  }

  if (!memberId) {
    alert("User not found. Please login again.");
    return;
  }

  try {
    const payload = {
      cardio_goal: Number(goalCalories),  // Changed from calories_goal to cardio_goal
      member_id: String(memberId),
    };
    
    console.log("Sending payload to setCardioGoal:", payload);
    
    const response = await setCardioGoal(payload);
    console.log("Response from setCardioGoal:", response);
  } catch (error) {
    console.error("Error saving goal:", error);
    alert("Failed to save workout goal. Please try again.");
    return;
  }

  setWorkoutStarted(true);
};

  // const handleStartWorkout = async () => {
  //   if (!goalCalories || goalCalories <= 0) {
  //     alert("Calories goal is required");
  //     return;
  //   }

  //   if (!memberId) {
  //     alert("User not found. Please login again.");
  //     return;
  //   }

  //   try {
  //     await setCardioGoal({
  //       calories_goal: goalCalories,
  //       member_id: memberId,
  //     });
  //     console.log("Goal saved successfully");
  //   } catch (error) {
  //     console.error("Error saving goal:", error);
  //     alert("Failed to save workout goal. Please try again.");
  //     return;
  //   }

  //   setWorkoutStarted(true);
  // };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Calculate totals - exclude first card only for Start Session mode
// const totalCalories = sessions.reduce((sum, session, index) => {
//   if (sessionType === "start" && index === 0) return sum;
//   return sum + (session.calories || 0);
// }, 0);

// const totalMinutes = sessions.reduce((sum, session, index) => {
//   if (sessionType === "start" && index === 0) return sum;
//   return sum + (session.minutes || 0);
// }, 0);

// Calculate differences (goal - actual)
// const caloriesDifference = (goalCalories || 0) - totalCalories;
// const minutesDifference = (goalMinutes || 0) - totalMinutes;

// Calculate totals and differences between cards
// Calculate totals
const totalCalories = sessions.reduce((sum, session) => sum + (session.calories || 0), 0);
const totalMinutes = sessions.reduce((sum, session) => sum + (session.minutes || 0), 0);

// Calculate "plus" - difference between last card and the sum of previous cards
const shouldShowPlus = sessions.length >= 2;
const lastCard = shouldShowPlus ? sessions[sessions.length - 1] : null;
const previousTotalCalories = totalCalories - (lastCard?.calories || 0);
const previousTotalMinutes = totalMinutes - (lastCard?.minutes || 0);
const plusCalories = lastCard?.calories || 0;
const plusMinutes = lastCard?.minutes || 0;




  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f8] text-[#1a1a2e] pb-12">
      {/* HEADER */}
  {/* HEADER */}
<div className="bg-white px-3 sm:px-6 py-3 flex items-center justify-between border-b sticky top-0 z-40 gap-2">
  <div className="flex items-center gap-2 min-w-0">
    <button
      onClick={() => router.back()}
      className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-600/30 transition flex-shrink-0"
    >
      <ArrowLeft size={18} className="text-white" />
    </button>
    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
      <Flame size={16} className="text-white" />
    </div>
    <h1 className="font-bold text-base truncate">Submit Cardio</h1>
  </div>

  <div className="flex gap-2 flex-shrink-0">
    {/* Hide text on mobile, show icon only */}
    <button
      onClick={() => router.push("/todays-focus-cardio/cardio-dashboard")}
      className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-sm font-semibold transition shadow-md items-center gap-2"
    >
      Go to Cardio Dashboard
    </button>
    <button
      onClick={() => router.push("/todays-focus-cardio/cardio-dashboard")}
      className="sm:hidden w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center"
    >
      <Activity size={16} className="text-white" />
    </button>
    <button
      onClick={() => router.push("/todays-focus-cardio/manifest-cardio")}
      className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
    >
      <List size={18} />
    </button>
    <button
      onClick={addSession}
      className="w-9 h-9 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white rounded-full flex items-center justify-center"
    >
      <Plus size={18} />
    </button>
    <button
      onClick={() => router.push("/itinerary")}
      className="hidden sm:flex w-9 h-9 bg-gray-100 rounded-full items-center justify-center"
    >
      <Calendar size={18} />
    </button>
  </div>
</div>
         
    <div className="px-4 sm:px-6 py-6">
  <div className="border border-[#a78bfa] rounded-2xl p-5 bg-[#ede9fe]">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left this week */}
      <div className="text-center sm:text-left">
        <p className="text-xs text-[#7c3aed]">Left this week:</p>
        <p className="text-3xl font-bold text-[#7c3aed]">{caloriesGoal}</p>
      </div>
      
      {/* Right side buttons */}
      <div className="flex items-center gap-3">
      
        
        {/* Reset Goal Button */}
        <button
          onClick={() => setShowCardioGoalModal(true)}
          className="bg-white px-4 py-2 text-xs rounded-xl font-medium whitespace-nowrap"
        >
          Reset Goal
        </button>
          {/* Photo Upload */}
        {!proofImage ? (
          <label className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-purple-700 transition text-sm">
            <Camera size={16} />
            Upload Picture
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        ) : (
          <div className="flex items-center gap-2">
            <img src={proofImage} alt="Proof" className="w-8 h-8 object-cover rounded-lg border" />
            <label className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-200 transition text-xs">
              Change
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
      {/* TOGGLE */}
      <div className="flex justify-center mt-6 mb-8 px-4">
        <div className="w-full max-w-[420px] flex items-center gap-3">
          <p className="text-xs text-gray-500 whitespace-nowrap">
            Type of Session:
          </p>
          <div className="bg-gray-200 rounded-full p-1 flex flex-1">
            <button
              onClick={() => {
                setSessionType("quick");
                setWorkoutStarted(false);
                setGoalCalories(null);
                setGoalMinutes(null);
                setIsEditingGoal(false);
                setSessions([
                  {
                    id: Date.now(),
                    cardioId: "",
                    name: "BOXING BAG. HEAVY",
                    calories: null,
                    minutes: null,
                    mets: null,
                    submitted: false,
                    submitting: false,
                  },
                ]);
                setExpandedCards({});
              }}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition ${
                sessionType === "quick"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600"
              }`}
            >
              Quick Log
            </button>
            <button
              onClick={() => {
                setSessionType("start");
                setWorkoutStarted(false);
                setGoalCalories(null);
                setGoalMinutes(null);
                setIsEditingGoal(false);
                setSessions([
                  {
                    id: Date.now(),
                    cardioId: "",
                    name: "BOXING BAG. HEAVY",
                    calories: null,
                    minutes: null,
                    mets: null,
                    submitted: false,
                    submitting: false,
                  },
                ]);
                setExpandedCards({});
              }}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition ${
                sessionType === "start"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600"
              }`}
            >
              Start Session
            </button>
          </div>
        </div>
      </div>

      {/* SET WORKOUT GOAL */}
  <div className="px-4 sm:px-6 mb-6">
  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 shadow-sm overflow-hidden">
    {/* Header - Click to collapse/expand */}
    <button
      onClick={() => setIsGoalSectionOpen(!isGoalSectionOpen)}
      className="w-full flex items-center justify-between p-5 hover:bg-purple-100/30 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Target size={20} className="text-purple-600" />
        <p className="text-base font-bold text-purple-700">
          Set Workout Goal:
        </p>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-xs text-gray-500">
          {sessionType === "start"
            ? "Required - Calories, Minutes, or both"
            : "Optional - Track against the target"}
        </p>
        <ChevronDown
          size={18}
          className={`text-purple-600 transition-transform duration-200 ${
            isGoalSectionOpen ? "rotate-180" : ""
          }`}
        />
      </div>
    </button>

    {/* Collapsible Content */}
    {isGoalSectionOpen && (
      <div className="p-5 pt-0">
        {!workoutStarted ? (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 bg-white rounded-xl p-4 text-center border border-gray-200">
                <input
                  type="number"
                  value={goalCalories ?? ""}
                  onChange={(e) =>
                    setGoalCalories(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  placeholder="0"
                  className="w-full bg-transparent text-purple-600 font-bold text-2xl text-center outline-none placeholder:text-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1">Calories</p>
              </div>
              <div className="flex-1 bg-white rounded-xl p-4 text-center border border-gray-200">
                <input
                  type="number"
                  value={goalMinutes ?? ""}
                  onChange={(e) =>
                    setGoalMinutes(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  placeholder="0"
                  className="w-full bg-transparent text-purple-600 font-bold text-2xl text-center outline-none placeholder:text-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1">Minutes</p>
              </div>
            </div>

            <button
              onClick={handleStartWorkout}
              disabled={
                (!goalCalories || goalCalories <= 0) &&
                (!goalMinutes || goalMinutes <= 0)
              }
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={20} />
              Start Workout
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="p-2 hover:bg-white/50 rounded-full transition"
                title="Edit Goal"
              >
                <Pencil size={18} className="text-purple-600" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 bg-white rounded-xl p-4 text-center border border-gray-200">
                <input
                  type="number"
                  value={goalCalories ?? ""}
                  onChange={(e) =>
                    setGoalCalories(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  placeholder="0"
                  className="w-full bg-transparent text-purple-600 font-bold text-2xl text-center outline-none placeholder:text-gray-300"
                  disabled={!isEditingGoal}
                />
                <p className="text-xs text-gray-400 mt-1">Goal Calories</p>
              </div>
              <div className="flex-1 bg-white rounded-xl p-4 text-center border border-gray-200">
                <input
                  type="number"
                  value={goalMinutes ?? ""}
                  onChange={(e) =>
                    setGoalMinutes(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  placeholder="0"
                  className="w-full bg-transparent text-purple-600 font-bold text-2xl text-center outline-none placeholder:text-gray-300"
                  disabled={!isEditingGoal}
                />
                <p className="text-xs text-gray-400 mt-1">Goal Minutes</p>
              </div>
            </div>

            {isEditingGoal && (
              <button
                onClick={handleUpdateGoal}
                disabled={
                  isSavingGoal ||
                  ((!goalCalories || goalCalories <= 0) &&
                    (!goalMinutes || goalMinutes <= 0))
                }
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingGoal ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                {isSavingGoal ? "Saving..." : "Save Changes"}
              </button>
            )}

            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                <CheckCircle size={16} />
                Workout in progress! Track your session below.
              </p>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
</div>

      {/* QUICK LOG CONTENT */}
   {/* QUICK LOG CONTENT */}
{(sessionType === "quick" || workoutStarted) && (
  <>
    <div className="px-4 sm:px-6 mb-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsQuickLogOpen(!isQuickLogOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Activity size={18} className="text-purple-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-gray-800">
              Cardio Completion
            </p>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full whitespace-nowrap">
              {sessions.filter(s => s.submitted).length} {sessions.filter(s => s.submitted).length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${
              isQuickLogOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Collapsible Content */}
        {isQuickLogOpen && (
          <div className="p-4 pt-0 border-t border-gray-100">
            {/* TITLE */}
            <div className="mb-4 mt-2">
              <p className="text-green-600 font-semibold text-sm">
                Quick Cardio Log:
              </p>
              <p className="text-xs text-gray-400">
                Log and submit what you completed during your cardio workout.
              </p>
            </div>

            {/* SESSIONS */}
            <div className="space-y-5">
              {sessions.map((s, index) => (
                <div
                  key={s.id}
                  className="bg-white border rounded-2xl p-5 shadow-sm"
                >
                  {sessionType === "start" && workoutStarted && (
                    <>
                      {index === 0 && (
                        <div className="mb-3 pb-2">
                          <p className="text-purple-600 font-semibold text-sm">
                            Cardio Plan:
                          </p>
                          <p className="text-xs text-gray-500">
                            Create and share your plan to help you achieve your Cardio Goal.
                          </p>
                        </div>
                      )}
                      {index > 0 && (
                        <div className="mb-3 pb-2">
                          <p className="text-green-600 font-semibold text-sm">
                            Completed Cardio:
                          </p>
                          <p className="text-xs text-gray-500">
                            Log and submit what you completed during your cardio workout.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {s.submitted && (
                    <div className="mb-3 flex items-center gap-2 text-green-600">
                      <CheckCircle size={16} />
                      <span className="text-xs font-medium">
                        Successfully submitted - you can edit and resubmit
                      </span>
                    </div>
                  )}

                  {/* WEB LAYOUT - visible on sm and above */}
                  <div className="hidden sm:block">
                    <div className="flex flex-col gap-4">
                      {/* Main Row */}
                      <div className="flex flex-row items-start gap-4">
                        <div className="flex gap-2 self-start">
                          {s.submitted && (
                            <button
                              onClick={() => {
                                updateSession(s.id, "submitted", false);
                                updateSession(s.id, "isEditing", true);
                              }}
                              className="bg-gray-100 p-2.5 rounded-xl"
                              disabled={s.submitting}
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {s.submitted && (
                            <button
                              onClick={() => deleteSession(s.id)}
                              className="bg-red-100 p-2.5 rounded-xl text-red-500"
                              disabled={s.submitting}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="border rounded-xl px-4 py-3 bg-white border-gray-300">
                            <select
                              value={s.name}
                              onChange={(e) => handleCardioSelect(s.id, e.target.value)}
                              className="w-full text-sm outline-none bg-transparent"
                              disabled={s.submitting}
                            >
                              {cardioMenu.map((item) => (
                                <option key={item.id} value={item.name}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {s.suggestion && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                              <p className="text-xs text-blue-700">💡 {s.suggestion}</p>
                            </div>
                          )}
                          {s.demo_url && (
                            <div className="mt-3">
                              <img
                                src={s.demo_url}
                                alt={s.name}
                                className="w-full h-32 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                              />
                            </div>
                          )}

                          {s.uploadedImage && (
                            <div className="mt-3 relative">
                              <img
                                src={s.uploadedImage}
                                alt="Uploaded"
                                className="w-full h-32 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                              />
                              <button
                                onClick={() => updateSession(s.id, "uploadedImage", null)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Calories Input */}
                        <div className="bg-gray-50 px-5 py-3 rounded-2xl text-center min-w-[110px]">
                          <input
                            type="number"
                            value={s.calories ?? ""}
                            onChange={(e) =>
                              updateSession(
                                s.id,
                                "calories",
                                e.target.value === "" ? null : Number(e.target.value),
                              )
                            }
                            placeholder="0"
                            className="w-20 bg-transparent text-blue-600 font-bold text-2xl text-center outline-none placeholder:text-gray-300"
                            disabled={s.submitting}
                          />
                          <p className="text-[10px] text-gray-400 -mt-1">Calories*</p>
                        </div>

                        {/* Minutes Input */}
                        <div className="bg-gray-50 px-5 py-3 rounded-2xl text-center min-w-[110px]">
                          <input
                            type="number"
                            value={s.minutes ?? ""}
                            onChange={(e) =>
                              updateSession(
                                s.id,
                                "minutes",
                                e.target.value === "" ? null : Number(e.target.value),
                              )
                            }
                            placeholder="0"
                            className="w-20 bg-transparent text-blue-600 font-bold text-2xl text-center outline-none placeholder:text-gray-300"
                            disabled={s.submitting}
                          />
                          <p className="text-[10px] text-gray-400 -mt-1">Minutes</p>
                        </div>

                        {/* Camera Button */}
                        <div className="relative">
                          <input
                            type="file"
                            id={`camera-${s.id}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updateSession(s.id, "uploadedImage", reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button
                            onClick={() => document.getElementById(`camera-${s.id}`)?.click()}
                            className="bg-purple-600 text-white p-3.5 rounded-2xl self-start hover:bg-purple-700 transition"
                            disabled={s.submitting}
                          >
                            <Camera size={20} />
                          </button>
                        </div>

                        <button
                          onClick={() => toggleExpand(s.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition"
                          disabled={s.submitting}
                        >
                          {expandedCards[s.id] ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </div>

                      {/* Expanded Fields - Web */}
                      {expandedCards[s.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.distance ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "distance",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">Distance (mi)</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.mets ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "mets",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">METS</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.avgWatts ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "avgWatts",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">Avg. Watts</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.rpms ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "rpms",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">RPM's</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.peakHr ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "peakHr",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">Peak HR</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.avgHr ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "avgHr",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">Avg. HR</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Submit Button - Web */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleSubmitCard(s)}
                          disabled={s.submitting}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {s.submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                          {s.submitting
                            ? "Submitting..."
                            : s.submitted
                            ? `Resubmit ${s.name}`
                            : `Submit ${s.name}`}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MOBILE LAYOUT - visible on mobile only */}
                  <div className="block sm:hidden">
                    <div className="flex flex-col gap-4">
                      {/* Action Buttons Row */}
                      <div className="flex justify-end gap-2">
                        {s.submitted && (
                          <>
                            <button
                              onClick={() => {
                                updateSession(s.id, "submitted", false);
                                updateSession(s.id, "isEditing", true);
                              }}
                              className="bg-gray-100 p-2 rounded-xl"
                              disabled={s.submitting}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteSession(s.id)}
                              className="bg-red-100 p-2 rounded-xl text-red-500"
                              disabled={s.submitting}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Cardio Selection */}
                      <div className="w-full">
                        <div className="border rounded-xl px-4 py-3 bg-white border-gray-300">
                          <select
                            value={s.name}
                            onChange={(e) => handleCardioSelect(s.id, e.target.value)}
                            className="w-full text-sm outline-none bg-transparent"
                            disabled={s.submitting}
                          >
                            {cardioMenu.map((item) => (
                              <option key={item.id} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {s.suggestion && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-xs text-blue-700">💡 {s.suggestion}</p>
                          </div>
                        )}
                        {s.demo_url && (
                          <div className="mt-3">
                            <img
                              src={s.demo_url}
                              alt={s.name}
                              className="w-full h-32 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                            />
                          </div>
                        )}

                        {s.uploadedImage && (
                          <div className="mt-3 relative">
                            <img
                              src={s.uploadedImage}
                              alt="Uploaded"
                              className="w-full h-32 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                            />
                            <button
                              onClick={() => updateSession(s.id, "uploadedImage", null)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Inputs Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 px-4 py-3 rounded-2xl text-center">
                          <input
                            type="number"
                            value={s.calories ?? ""}
                            onChange={(e) =>
                              updateSession(
                                s.id,
                                "calories",
                                e.target.value === "" ? null : Number(e.target.value),
                              )
                            }
                            placeholder="0"
                            className="w-full bg-transparent text-blue-600 font-bold text-2xl text-center outline-none placeholder:text-gray-300"
                            disabled={s.submitting}
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Calories*</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 rounded-2xl text-center">
                          <input
                            type="number"
                            value={s.minutes ?? ""}
                            onChange={(e) =>
                              updateSession(
                                s.id,
                                "minutes",
                                e.target.value === "" ? null : Number(e.target.value),
                              )
                            }
                            placeholder="0"
                            className="w-full bg-transparent text-blue-600 font-bold text-2xl text-center outline-none placeholder:text-gray-300"
                            disabled={s.submitting}
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Minutes</p>
                        </div>
                      </div>

                      {/* Camera & Expand Buttons */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="relative flex-1">
                          <input
                            type="file"
                            id={`camera-mobile-${s.id}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updateSession(s.id, "uploadedImage", reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button
                            onClick={() => document.getElementById(`camera-mobile-${s.id}`)?.click()}
                            className="bg-purple-600 text-white p-3 rounded-2xl hover:bg-purple-700 transition flex items-center justify-center gap-2 w-full"
                            disabled={s.submitting}
                          >
                            <Camera size={18} />
                            <span className="text-sm">Upload</span>
                          </button>
                        </div>

                        <button
                          onClick={() => toggleExpand(s.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition flex items-center justify-center gap-1"
                          disabled={s.submitting}
                        >
                          {expandedCards[s.id] ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                          <span className="text-xs text-gray-500">
                            {expandedCards[s.id] ? "Less" : "More"}
                          </span>
                        </button>
                      </div>

                      {/* Expanded Fields - Mobile */}
                      {expandedCards[s.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.distance ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "distance",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">Distance (mi)</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.mets ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "mets",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">METS</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.avgWatts ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "avgWatts",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">Avg. Watts</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.rpms ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "rpms",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">RPM's</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.peakHr ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "peakHr",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">Peak HR</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <input
                                type="number"
                                value={s.avgHr ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    s.id,
                                    "avgHr",
                                    e.target.value === "" ? null : Number(e.target.value),
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-purple-600 font-bold text-xl text-center outline-none placeholder:text-gray-300"
                                disabled={s.submitting}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">Avg. HR</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Submit Button - Mobile */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleSubmitCard(s)}
                          disabled={s.submitting}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {s.submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                          {s.submitting
                            ? "Submitting..."
                            : s.submitted
                            ? `Resubmit ${s.name}`
                            : `Submit ${s.name}`}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Button */}
            <div className="flex justify-center my-8">
              <button
                onClick={addSession}
                className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
              >
                <Plus size={28} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* TOTALS & COMPLETE CARDIO SESSION BUTTON */}
    {sessions.some((s) => s.submitted) && (
      <>
        {/* Web Totals */}
        <div className="hidden sm:block mx-4 sm:mx-6 mb-10 border border-red-300 rounded-3xl bg-[#fdf2f2] p-6 text-center">
          <p className="text-purple-600 text-sm mb-5 font-medium">Totals:</p>
          <div className="flex justify-center gap-12 mb-8 flex-wrap">
            <div>
              <p className="text-xs text-gray-400">Total Calories</p>
              <p className="text-4xl font-bold text-gray-800">
                {totalCalories}
                {shouldShowPlus && plusCalories > 0 && (
                  <span className="text-sm ml-2 text-green-500">
                    (+{plusCalories})
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Minutes</p>
              <p className="text-4xl font-bold text-gray-800">
                {totalMinutes}
                {shouldShowPlus && plusMinutes > 0 && (
                  <span className="text-sm ml-2 text-red-500">
                    (+{plusMinutes})
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCompletePopup(true)}
            disabled={isCompleting || sessions.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Flame size={20} />
            )}
            {isCompleting ? "Completing..." : "Complete Cardio Session"}
          </button>
        </div>

        {/* Mobile Totals */}
        <div className="block sm:hidden mx-4 mb-10 border border-red-300 rounded-3xl bg-[#fdf2f2] p-5 text-center">
          <p className="text-purple-600 text-sm mb-4 font-medium">Totals:</p>
          <div className="flex justify-center gap-8 mb-6 flex-wrap">
            <div className="text-center">
              <p className="text-xs text-gray-400">Total Calories</p>
              <div className="flex items-baseline gap-1 justify-center">
                <p className="text-3xl font-bold text-gray-800">
                  {totalCalories}
                </p>
                {shouldShowPlus && plusCalories > 0 && (
                  <span className="text-xs text-green-500 whitespace-nowrap">
                    (+{plusCalories})
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Total Minutes</p>
              <div className="flex items-baseline gap-1 justify-center">
                <p className="text-3xl font-bold text-gray-800">
                  {totalMinutes}
                </p>
                {shouldShowPlus && plusMinutes > 0 && (
                  <span className="text-xs text-red-500 whitespace-nowrap">
                    (+{plusMinutes})
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCompletePopup(true)}
            disabled={isCompleting || sessions.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-2xl font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {isCompleting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Flame size={18} />
            )}
            {isCompleting ? "Completing..." : "Complete Cardio Session"}
          </button>
        </div>
      </>
    )}
  </>
)}
      {/* COMPLETE POPUP */}
      {showCompletePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setShowCompletePopup(false)
          }
        >
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 pt-6 pb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
              Cardio Completion
              </h2>
              <button
                onClick={() => setShowCompletePopup(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 px-6">
              <p className="text-sm text-gray-600 mb-4">
                Get credit towards one of your scheduled cardio sessions (Choose
                One):
              </p>

              <div className="space-y-3">
           {scheduledActivities.map((activity) => (
    <label
      key={activity.id}
      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
        selectedActivityId === activity.custom_activity_id
          ? "border-purple-500 bg-purple-50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <input
        type="radio"
        name="cardioOption"
        value={activity.custom_activity_id}
        checked={selectedActivityId === activity.custom_activity_id}
        onChange={() => setSelectedActivityId(activity.custom_activity_id)}
        className="w-4 h-4 text-purple-600 flex-shrink-0"
      />
      <span className="text-sm text-gray-700">
        Cardio due by {activity.day_name} at {formatTime(activity.title)}
      </span>
    </label>
  ))}
              </div>
            </div>

            <div className="px-6 pt-4 pb-6 flex-shrink-0">
              <button
                onClick={handleSaveToScheduled}
                disabled={!selectedActivityId}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                Save Cardio
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                onClick={handleCreateNew}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold transition"
              >
                Create a New One
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cardio Goal Modal */}
      {showCardioGoalModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-4"
          onClick={() => setShowCardioGoalModal(false)}
        >
          <div
            className="relative w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[22px] bg-white px-5 sm:px-8 pb-8 pt-12 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCardioGoalModal(false)}
              className="absolute right-4 top-4 z-20 rounded-full bg-gray-100 p-2 text-[#1a1a1a]"
            >
              <X size={20} />
            </button>

            <p className="text-center text-sm font-semibold text-[#6b7384] uppercase tracking-widest">
              Adjusting
            </p>
            <h3 className="mt-1 text-center text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Cardio Goal
            </h3>
            <div className="mx-auto mt-3 h-[4px] w-20 bg-gradient-to-r from-[#12a9db] to-[#6202AC] rounded-full" />

            <div className="mt-8 grid items-center gap-3 grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-[18px] border bg-gray-50/50 px-3 py-5 sm:py-7 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#697286]">
                  {currentGoal}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Current
                </p>
                <p className="text-[10px] text-[#a3acb9]">kcal / week</p>
              </div>

              <div className="flex justify-center rotate-90 md:rotate-0 text-[#11a9d5]">
                <ArrowRight size={24} strokeWidth={3} />
              </div>

              <div className="rounded-[18px] border-[3px] border-[#10aad3] bg-white px-3 py-5 sm:py-7 text-center shadow-sm">
                <input
                  type="number"
                  value={newCardioGoal}
                  onChange={(e) =>
                    setNewCardioGoal(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0"
                  className="w-full bg-transparent text-center text-2xl sm:text-3xl font-bold text-[#6202AC] outline-none"
                />
                <p className="mt-1 text-sm font-semibold text-[#10aad3]">
                  New Goal
                </p>
                <p className="text-[10px] text-[#a3acb9]">kcal / week</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => void handleSaveCardioGoal()}
                className="h-[52px] w-full rounded-full bg-[#6202AC] text-lg font-semibold text-white shadow-lg shadow-purple-100 hover:bg-[#500ba6]"
              >
                Save Cardio Goal
              </button>

              <div className="pt-2">
                <p className="text-center text-xs font-medium text-[#a3acb9] mb-3">
                  Quick suggestions:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["3000", "4000", "5000", "6000"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setNewCardioGoal(val)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-[#6202AC] hover:bg-purple-50 hover:border-purple-200 transition-all"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
