"use client";

import { Calendar, Check, Loader2 } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createRecoveryRecord } from "@/api/recovery/route";

// Mock data for scheduled recovery sessions (would come from API in production)
const getScheduledRecoverySessions = () => {
  return [
    {
      id: "1",
      title: "Monday, April 7th - Recovery Session",
      subtitle: "Scheduled at 6:00 PM • Hot Tub",
      recovery_id: "7bb49dbb-223b-4825-bc2e-1dc817e430df",
    },
    {
      id: "2",
      title: "Wednesday, April 9th - Recovery Session",
      subtitle: "Scheduled at 8:00 PM • Infrared Sauna",
      recovery_id: "66cd8eb4-3909-4942-9629-e7681a6d7eac",
    },
  ];
};

function RecoveryCompletionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "Hottub";
  const time = searchParams.get("time") || "10";
  const recoveryId = searchParams.get("id") || "";
  
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string; subtitle: string; recovery_id: string }[]>([]);

  useEffect(() => {
    // Fetch scheduled recovery sessions (in production, this would be an API call)
    setSessions(getScheduledRecoverySessions());
  }, []);

  const handleSaveRecovery = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      let recoveryRecordId: string;
      let recordTitle: string;

      if (selected !== null && sessions[selected]) {
        // Replace existing scheduled session
        recoveryRecordId = sessions[selected].recovery_id;
        recordTitle = sessions[selected].title;
      } else {
        // Create new recovery record
        recoveryRecordId = recoveryId;
        recordTitle = type;
      }

      const payload = {
        title: recordTitle,
        time_spent: parseInt(time),
        recovery_id: recoveryRecordId,
        date: new Date().toISOString(),
        upload_image: null,
      };

      await createRecoveryRecord(payload);
      
      // Navigate back to recovery dashboard or show success
      router.push("/recovery/recovery-dashboard");
    } catch (err: any) {
      console.error("Error saving recovery:", err);
      setError(err.message || "Failed to save recovery session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNew = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: type,
        time_spent: parseInt(time),
        recovery_id: recoveryId,
        date: new Date().toISOString(),
        upload_image: null,
      };

      await createRecoveryRecord(payload);
      router.push("/recovery/recovery-dashboard");
    } catch (err: any) {
      console.error("Error creating new recovery:", err);
      setError(err.message || "Failed to create recovery session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-2xl text-center">

        {/* TOP ICON */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
            <Calendar size={22} color="white" />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Recovery Completion
        </h1>

        <p className="text-sm text-gray-500 mt-1 mb-6 max-w-md mx-auto">
          Choose how you want to save your completed Recovery Session on your itinerary page
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* MAIN CARD */}
        <div className="bg-[#f1f3f5] rounded-2xl p-6 border border-gray-200">

          <p className="text-sm text-center font-medium text-gray-700">
            Get credit towards one of your scheduled recovery sessions
          </p>

          <p className="text-xs text-center text-gray-400 mb-4">
            (Choose One):
          </p>

          <div className="space-y-3">
            {sessions.map((item, i) => {
              const isSelected = selected === i;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelected(i)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border
                    ${
                      isSelected
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white border-gray-200 hover:border-emerald-300"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${
                          isSelected
                            ? "border-white"
                            : "border-gray-300"
                        }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-medium">
                        {item.title}
                      </p>
                      <p
                        className={`text-xs ${
                          isSelected ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected && <Check size={18} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* NEW OPTION */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-3 max-w-md mx-auto">
            Save as a new recovery session, which will not affect your Recovery Completion this week
          </p>

          <button
            onClick={handleCreateNew}
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto shadow-sm transition disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
            Create a New One
          </button>
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-5 border-t border-gray-200 flex flex-wrap justify-center gap-8 text-xs text-gray-500">

          <div className="text-center">
            <p className="text-gray-400">Recovery Type</p>
            <p className="font-medium text-gray-700">{type}</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400">Time Spent</p>
            <p className="font-medium text-gray-700">{time} minutes</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400">Date</p>
            <p className="font-medium text-gray-700">{new Date().toLocaleDateString()}</p>
          </div>

        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSaveRecovery}
            disabled={isSubmitting}
            className={`w-full max-w-md mx-auto py-3 rounded-xl font-semibold transition ${
              selected !== null
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Save Recovery"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* WRAPPER for Suspense */
export default function RecoveryCompletionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <RecoveryCompletionInner />
    </Suspense>
  );
}