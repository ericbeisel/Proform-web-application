'use client';

import React, { useState } from 'react';
import { Target, Dumbbell, Heart, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';

export default function GoalsPreferencesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    primaryGoal: '',
    trainingGoals: [] as string[],
    preferredActivities: [] as string[],
  });

  const trainingGoalsOptions = ['Build Muscle', 'Lose Fat', 'Increase Strength', 'Improve Cardio', 'Better Mobility', 'Sport Performance', 'Injury Recovery', 'General Health'];
  const preferredActivitiesOptions = ['Running', 'Weightlifting', 'Yoga', 'Swimming', 'Cycling', 'Boxing', 'Crossfit', 'Pilates', 'Dance', 'Martial Arts', 'Rock Climbing', 'Sports'];

  const toggle = (key: 'trainingGoals' | 'preferredActivities', val: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ── Save this step's data to sessionStorage ──
    const existing = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
    sessionStorage.setItem('accountSetup', JSON.stringify({
      ...existing,
      primaryGoal: formData.primaryGoal,
      trainingGoals: formData.trainingGoals,
      preferredActivities: formData.preferredActivities,
    }));
    router.push('/account-setup/coreMetrics');
  };

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Goal & Preferences',
          description: 'Tell us what you want to achieve so we can create the perfect training plan for you.',
        }}
        showProgress
        progressData={{ currentStep: 2, totalSteps: 9, nextStep: 'Core Metrics' }}
      />

      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">What brings you to the gym</h1>
        <p className="text-gray-500 text-sm sm:text-base">Select your primary goal and any additional preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
        {/* Primary Goal */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
            <Target size={16} className="text-[#6202AC]" />
            Primary Goal*
          </label>
          <div className="relative">
            <select
              value={formData.primaryGoal}
              onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-gray-700 appearance-none cursor-pointer text-sm"
              required
            >
              <option value=""></option>
              <option value="build-muscle">Build Muscle</option>
              <option value="lose-weight">Lose Weight</option>
              <option value="increase-strength">Increase Strength</option>
              <option value="improve-cardio">Improve Cardio</option>
              <option value="better-mobility">Better Mobility</option>
              <option value="sport-performance">Sport Performance</option>
              <option value="general-fitness">General Fitness</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Training Goals */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
            <Dumbbell size={16} className="text-[#6202AC]" />
            Training Goals (optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {trainingGoalsOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggle('trainingGoals', goal)}
                className={`py-2 px-3 sm:py-2.5 sm:px-4 rounded-full border-2 font-medium transition-all flex items-center gap-1.5 text-xs sm:text-sm
                  ${formData.trainingGoals.includes(goal)
                    ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
              >
                {formData.trainingGoals.includes(goal) && <Check size={13} strokeWidth={3} />}
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Activities */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
            <Heart size={16} className="text-[#6202AC]" />
            Preferred Activities (optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">What do you enjoy doing?</p>
          <div className="flex flex-wrap gap-2">
            {preferredActivitiesOptions.map((activity) => (
              <button
                key={activity}
                type="button"
                onClick={() => toggle('preferredActivities', activity)}
                className={`py-2 px-3 sm:py-2.5 sm:px-4 rounded-full border-2 font-medium transition-all flex items-center gap-1.5 text-xs sm:text-sm
                  ${formData.preferredActivities.includes(activity)
                    ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
              >
                {formData.preferredActivities.includes(activity) && <Check size={13} strokeWidth={3} />}
                {activity}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!formData.primaryGoal}
          className={`w-full font-semibold text-base py-4 rounded-full transition-all duration-200
            ${formData.primaryGoal
              ? 'bg-[#6202AC] hover:bg-[#50018C] text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          Continue
        </button>
      </form>
    </>
  );
}