"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState("");
    const router = useRouter();
    
  const handleSubmit = () => {
    router.push("/team-dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 mt-4">
      <div className="w-full max-w-xl flex flex-col items-center">

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
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-[#6202AC] hover:bg-violet-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
        >
          Create Team
        </button>

      </div>
    </div>
  );
}