"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Plus, Zap, Users, Star } from "lucide-react";
import { createTeam } from '@/api/create-team/route';

function CreateTeamContent() {
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');

  const handleSubmit = async () => {
    if (!teamName.trim()) {
      setError("Please enter a team name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await createTeam(teamName);
      console.log('Team created successfully:', response);
      
      if (source === 'checklist') {
        router.push("/dashboard"); 
      } else {
        router.push("/team-dashboard");
      }
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div className="min-h-screen bg-gray-50 flex justify-center px-4 pt-10 relative">
    <div className="w-full max-w-xl flex flex-col items-center">
      
      {/* CLOSE BUTTON */}
      <button
        onClick={() => router.push('/team/teams')} // Change '/team' to your actual teams list route
className="absolute top-0 right-8 md:right-0 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:shadow-md transition-all group z-20"      >
        <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
      </button>

        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#6202AC] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-violet-300 mb-7">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 21v-2a4 4 0 0 0-3-3.87"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 3.13a4 4 0 0 1 0 7.75"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
          Create Team
        </h1>

        {/* Divider */}
        <hr className="w-[60%] border-t-2 border-gray-200 mb-5" />

        {/* Description */}
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-8 max-w-md">
          Create a team for you and 15 of your closest friends, colleagues and
          family members to share stats, compete with challenges and so much
          more!
        </p>

        {/* Form */}
        <div className="w-full mb-4">
          <label
            htmlFor="teamName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-4 py-3.5 text-sm text-gray-700 border border-gray-200 rounded-lg outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200 transition-all duration-200 placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !teamName.trim()}
          className={`w-full py-4 bg-[#6202AC] hover:bg-violet-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 ${
            isLoading || !teamName.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Team...
            </>
          ) : 'Create Team'}
        </button>

      </div>
    </div>
  );
}

export default function CreateTeamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    }>
      <CreateTeamContent />
    </Suspense>
  );
}