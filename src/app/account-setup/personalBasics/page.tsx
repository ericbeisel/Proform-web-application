'use client';

import React, { useState } from 'react';
import { User, Cake, Activity, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';

export default function PersonalBasicsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gender: '',
    birthday: '',
    activityLevel: '',
    unitPreference: 'metric',
  });

  const isFormValid = formData.gender && formData.birthday && formData.activityLevel;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/account-setup/goalPreferences');
  };

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Personal Basics',
          description: 'Help us personalize your gym experience by sharing a few details about yourself.',
        }}
        showProgress
        progressData={{ currentStep: 1, totalSteps: 9, nextStep: 'Goals & Preferences' }}
      />

      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">Tell us about yourself</h1>
        <p className="text-gray-500 text-sm sm:text-base">This information helps us create a customized training plan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Gender */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
            <User size={16} className="text-[#6202AC]" />
            Gender*
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormData({ ...formData, gender: option.toLowerCase().replace(/ /g, '-') })}
                className={`py-3 px-2 rounded-xl border-2 font-medium transition-all text-xs
                  ${formData.gender === option.toLowerCase().replace(/ /g, '-')
                    ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Birthday & Activity Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
              <Cake size={16} className="text-[#6202AC]" />
              Birthday*
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-sm text-gray-700"
              required
            />
            <p className="text-xs text-gray-500 mt-2">Must be 13 years or older</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
              <Activity size={16} className="text-[#6202AC]" />
              Activity Level*
            </label>
            <div className="relative">
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-sm text-gray-700 appearance-none cursor-pointer"
                required
              >
                <option value=""></option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very-active">Very Active</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
                  <path d="M1 1L5.5 5.5L10 1" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Preference */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
            <Ruler size={16} className="text-[#6202AC]" />
            Unit Preference
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: 'metric', label: 'Metric (kg/cm)' }, { value: 'imperial', label: 'Imperial (lbs/ft)' }].map((u) => (
              <button
                key={u.value}
                type="button"
                onClick={() => setFormData({ ...formData, unitPreference: u.value })}
                className={`py-3.5 px-4 rounded-xl font-semibold transition-all text-sm
                  ${formData.unitPreference === u.value
                    ? 'bg-[#6202AC] text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full font-semibold text-base py-4 rounded-full transition-all duration-200
            ${isFormValid
              ? 'bg-[#6202AC] hover:bg-[#50018C] text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          Continue to Next Step
        </button>
      </form>
    </>
  );
}