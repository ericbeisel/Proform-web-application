'use client';

import React, { useState, useEffect } from 'react';
import { Target, Dumbbell, Heart, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';
import { fetchTrainingGoals, fetchSports, TrainingGoalOption, SportOption } from '@/api/account-setup/route';

export default function GoalsPreferencesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trainingGoalsOptions, setTrainingGoalsOptions] = useState<TrainingGoalOption[]>([]);
  const [sportsOptions, setSportsOptions] = useState<SportOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    primaryGoal: '',
    trainingGoals: [] as string[],
    preferredActivities: [] as string[],
  });

  // Fetch training goals and sports from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch both APIs in parallel for better performance
        const [goals, sports] = await Promise.all([
          fetchTrainingGoals(),
          fetchSports()
        ]);
        
        // Filter out any goals that are hidden (if Hide property is used)
        const visibleGoals = goals.filter(goal => goal.Hide !== "1");
        setTrainingGoalsOptions(visibleGoals);
        
        // Sort sports by order field
        const sortedSports = [...sports].sort((a, b) => {
          const orderA = parseInt(a.order || '999');
          const orderB = parseInt(b.order || '999');
          return orderA - orderB;
        });
        setSportsOptions(sortedSports);
        
        // Load saved data from sessionStorage if exists
        const savedData = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
        if (savedData.primaryGoal || savedData.trainingGoals || savedData.preferredActivities) {
          setFormData({
            primaryGoal: savedData.primaryGoal || '',
            trainingGoals: savedData.trainingGoals || [],
            preferredActivities: savedData.preferredActivities || [],
          });
        }
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load options');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      trainingGoals: formData.trainingGoals, // Stores the goal IDs
      preferredActivities: formData.preferredActivities, // Stores the sport IDs
    }));
    router.push('/account-setup/coreMetrics');
  };

  // Helper function to get goal name from ID for display
  const getGoalName = (id: string) => {
    const goal = trainingGoalsOptions.find(g => String(g.id) === id);
    return goal?.name.trim() || id;
  };

  // Helper function to get sport name from ID for display
  const getSportName = (id: string) => {
    const sport = sportsOptions.find(s => String(s.id) === id);
    return sport?.name || id;
  };

  if (isLoading) {
    return (
      <>
        <SplitLayout
          leftContent={{
            title: 'Goal & Preferences',
            description: 'Loading your options...',
          }}
          showProgress
          progressData={{ currentStep: 2, totalSteps: 9, nextStep: 'Core Metrics' }}
        />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6202AC]"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SplitLayout
          leftContent={{
            title: 'Goal & Preferences',
            description: 'Something went wrong',
          }}
          showProgress
          progressData={{ currentStep: 2, totalSteps: 9, nextStep: 'Core Metrics' }}
        />
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#6202AC] text-white px-6 py-3 rounded-full"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

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
      className={`w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] appearance-none cursor-pointer text-sm ${
        formData.primaryGoal ? 'text-gray-900' : 'text-gray-400'
      }`}
      required
    >
      <option value="" disabled hidden>Select your primary goal</option>
      <option value="lose-weight">Fat Loss</option>
      <option value="maintain">Maintain</option>
      <option value="gain">Gain</option>
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
            {trainingGoalsOptions.map((goal) => {
              const goalId = String(goal.id);
              const goalName = goal.name.trim();
              const isSelected = formData.trainingGoals.includes(goalId);
              
              return (
                <button
                  key={goalId}
                  type="button"
                  onClick={() => toggle('trainingGoals', goalId)}
                  className={`py-2 px-3 sm:py-2.5 sm:px-4 rounded-full border-2 font-medium transition-all flex items-center gap-1.5 text-xs sm:text-sm
                    ${isSelected
                      ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                >
                  {isSelected && <Check size={13} strokeWidth={3} />}
                  {goalName}
                </button>
              );
            })}
          </div>
          
          {/* Show selected count */}
          {formData.trainingGoals.length > 0 && (
            <p className="text-xs text-[#6202AC] mt-2">
              {formData.trainingGoals.length} goal{formData.trainingGoals.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Preferred Activities / Sports */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
            <Heart size={16} className="text-[#6202AC]" />
            Preferred Activities (optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">What sports or activities do you enjoy?</p>
          
          <div className="flex flex-wrap gap-2">
            {sportsOptions.map((sport) => {
              const sportId = String(sport.id);
              const isSelected = formData.preferredActivities.includes(sportId);
              
              return (
                <button
                  key={sportId}
                  type="button"
                  onClick={() => toggle('preferredActivities', sportId)}
                  className={`py-2 px-3 sm:py-2.5 sm:px-4 rounded-full border-2 font-medium transition-all flex items-center gap-1.5 text-xs sm:text-sm
                    ${isSelected
                      ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                >
                  {isSelected && <Check size={13} strokeWidth={3} />}
                  {sport.name}
                </button>
              );
            })}
          </div>
          
          {/* Show selected count */}
          {formData.preferredActivities.length > 0 && (
            <p className="text-xs text-[#6202AC] mt-2">
              {formData.preferredActivities.length} activit{formData.preferredActivities.length > 1 ? 'ies' : 'y'} selected
            </p>
          )}
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