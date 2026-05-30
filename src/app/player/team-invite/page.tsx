"use client";

import { Suspense, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { coachApi } from "@/api/coach/route";

function TeamInviteContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code") ?? "";
  const teamId = Number(searchParams.get("team_id") ?? "0");
  const teamName = searchParams.get("team_name") ?? "Your Team";
  const orgName = searchParams.get("org_name") ?? "";
  const ownerName = searchParams.get("owner_name") ?? "";
  const logo: string | null = null;

  const handleAccept = async () => {
    if (!code || !teamId) return;
    setIsLoading(true);
    setError(null);

    // Start progress animation
    const progressSteps = [20, 45, 70, 88];
    progressSteps.forEach((val, i) => {
      setTimeout(() => setProgress(val), i * 350);
    });

    try {
      await coachApi.joinTeam({ team_id: teamId, unique_code: code });
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setJoined(true);
        setTimeout(() => router.push("/coach/coach-dashboard"), 800);
      }, 400);
    } catch (err: any) {
      setProgress(0);
      setIsLoading(false);
      setError(err.message || "Failed to join team. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-white to-[#ede9fe] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-72 h-72 bg-[#8B5CF6]/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5CF6]/8 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <button
        onClick={() => router.back()}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-gray-700 shadow-sm transition"
      >
        <X size={18} />
      </button>

      <div className="relative w-full max-w-sm flex flex-col items-center gap-6">

        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-lg shadow-[#8B5CF6]/20 flex items-center justify-center p-1.5 border border-white">
            <img src="/images/proform-logo.jpg" alt="Proform" className="w-full h-full object-contain rounded-xl" />
          </div>
          <p className="text-[#8B5CF6] font-extrabold text-lg text-center leading-snug tracking-tight">
            You&apos;ve been invited to join a team!
          </p>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-xl shadow-[#8B5CF6]/10 border border-[#f0ebff] overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#a78bfa]" />

          <div className="px-6 py-7 flex flex-col items-center gap-5">

            {/* Team avatar */}
            {logo ? (
              <img src={logo} alt={teamName} className="w-20 h-20 rounded-full object-cover ring-4 ring-[#ede9fe]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white text-3xl font-extrabold ring-4 ring-[#ede9fe]">
                {teamName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-center">
              {orgName && (
                <p className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider mb-0.5">{orgName}</p>
              )}
              <p className="text-[18px] font-extrabold text-[#111] leading-tight">{teamName}</p>
              {ownerName && (
                <p className="text-[13px] font-semibold text-gray-500 mt-1">{ownerName}</p>
              )}
            </div>

            <div className="w-full h-px bg-gray-100" />

            <p className="text-[13px] text-gray-400 text-center">
              sent you a request to <span className="text-[#8B5CF6] font-semibold">join</span> their team.
            </p>

            <div className="bg-[#faf7ff] rounded-2xl px-4 py-3 w-full">
              <p className="text-[14px] font-bold text-[#111] text-center leading-snug">
                Your profile, metrics and progress would be shared with the coach of this team.
              </p>
            </div>

            <p className="text-[11px] text-gray-400 text-center">
              Click &ldquo;Accept&rdquo; to join this team:
            </p>

            {error && (
              <p className="text-sm text-red-500 text-center w-full bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}

            {/* Progress bar */}
            {(isLoading || joined) && (
              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#a78bfa] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {joined ? (
                  <div className="flex items-center gap-1.5 text-[#8B5CF6]">
                    <CheckCircle2 size={15} />
                    <span className="text-xs font-semibold">Joined! Redirecting…</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">{progress}% — Joining team…</p>
                )}
              </div>
            )}

            {!joined && (
              <button
                onClick={handleAccept}
                disabled={isLoading || !code || !teamId}
                className="w-full h-12 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-[#8B5CF6]/40 hover:shadow-[#8B5CF6]/60 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Joining…
                  </>
                ) : "Accept"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-white to-[#ede9fe] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TeamInviteContent />
    </Suspense>
  );
}
