"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinTeam } from "@/api/coach/route";

export default function JoiningCodePage() {
  const [code, setCode] = useState("");
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const codeParam = searchParams.get("code");
    const teamIdParam = searchParams.get("team_id");
    if (codeParam) setCode(codeParam);
    if (teamIdParam) setTeamId(Number(teamIdParam));
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!code.trim() || teamId === null) return;

    setIsLoading(true);
    setError(null);

    try {
      await joinTeam({ team_id: teamId, unique_code: code.trim() });
      router.push("/team-dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to join team. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
   <div className="min-h-screen bg-gray-50 flex justify-center px-4 pt-10 relative">
    <div className="w-full max-w-xl flex flex-col items-center">

      {/* CLOSE BUTTON */}
      <button
        onClick={() => router.push('/team/teams')}
        className="absolute top-0 right-8 md:right-0 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:shadow-md transition-all group z-20"
      >
        <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00B8DB] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-violet-200 mb-7">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7.5" cy="15.5" r="4.5" stroke="white" strokeWidth="2" />
          <path d="M10.5 12.5L16 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 8l2-2 1.5 1.5-2 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.5 10.5l1-1 1.5 1.5-1 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
        Joining Code
      </h1>

      {/* Description */}
      <p className="text-sm text-gray-500 text-center leading-relaxed mb-8 max-w-md">
        Please submit the code that your coach shared to you to join the team
      </p>

      {/* Form */}
      <div className="w-full mb-6">
        <label htmlFor="joiningCode" className="block text-sm font-medium text-gray-700 mb-2">
          Team Joining Code
        </label>
        <input
          id="joiningCode"
          type="text"
          placeholder="ENTER JOINING CODE"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(null); }}
          className="w-full px-4 py-3.5 text-sm text-gray-700 border border-gray-200 rounded-lg outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 placeholder:text-gray-400 placeholder:uppercase placeholder:tracking-wide"
          disabled={isLoading}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !code.trim()}
        className={`w-full py-4 bg-[#6202AC] hover:bg-violet-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 ${
          isLoading || !code.trim() ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </button>

    </div>
  </div>
  );
}
