'use client';

import React, { useState } from 'react';
import { ChevronLeft, User, Cake, Activity, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PersonalBasicsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gender: '',
    birthday: '',
    activityLevel: '',
    unitPreference: 'metric'
  });

  const handleGenderSelect = (gender: string) => {
    setFormData({ ...formData, gender });
  };

  const handleUnitSelect = (unit: string) => {
    setFormData({ ...formData, unitPreference: unit });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Personal Basics:', formData);
    // Navigate to next step
  };

  const isFormValid = formData.gender && formData.birthday && formData.activityLevel;

  return (
    <div className="w-full relative">
      {/* Back Button and Step Counter */}
      <div className="flex items-center justify-between mb-6 px-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-sm font-semibold text-gray-600">1 of 7</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-12 px-4">
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-400 h-full transition-all duration-300 rounded-full"
            style={{ width: '14%' }} // 1 of 7 steps
          />
        </div>
      </div>

      {/* Content */}
      <div className="pb-8 w-full max-w-[520px] mx-auto">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            Personal Basics
          </h1>
          <p className="text-gray-500 text-base">
            Help us personalize your experience
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Gender Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#6202AC] mb-3">
              <User size={16} />
              Gender*
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGenderSelect('male')}
                className={`py-4 px-6 rounded-xl border-2 font-medium transition-all
                  ${formData.gender === 'male'
                    ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => handleGenderSelect('female')}
                className={`py-4 px-6 rounded-xl border-2 font-medium transition-all
                  ${formData.gender === 'female'
                    ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => handleGenderSelect('non-binary')}
                className={`py-4 px-6 rounded-xl border-2 font-medium transition-all
                  ${formData.gender === 'non-binary'
                    ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                Non-binary
              </button>
              <button
                type="button"
                onClick={() => handleGenderSelect('prefer-not-say')}
                className={`py-4 px-6 rounded-xl border-2 font-medium transition-all
                  ${formData.gender === 'prefer-not-say'
                    ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                Prefer Not Say
              </button>
            </div>
          </div>

          {/* Birthday */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#6202AC] mb-3">
              <Cake size={16} />
              Birthday*
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900"
              required
            />
            <p className="text-xs text-gray-500 mt-2">Must be 13 years or older</p>
          </div>

          {/* Activity Level */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#6202AC] mb-3">
              <Activity size={16} />
              Activity Level*
            </label>
            <div className="relative">
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-600 appearance-none cursor-pointer"
                required
              >
                <option value="">Select your activity</option>
                <option value="sedentary">Sedentary (Little or no exercise)</option>
                <option value="light">Light (Exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                <option value="active">Active (Exercise 6-7 days/week)</option>
                <option value="very-active">Very Active (Intense exercise daily)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Unit Preference */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#6202AC] mb-3">
              <Ruler size={16} />
              Unit Preference
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleUnitSelect('metric')}
                className={`py-4 px-6 rounded-xl border-2 font-medium transition-all
                  ${formData.unitPreference === 'metric'
                    ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                Metric (Kg/cm)
              </button>
              <button
                type="button"
                onClick={() => handleUnitSelect('imperial')}
                className={`py-4 px-6 rounded-xl border-2 font-medium transition-all
                  ${formData.unitPreference === 'imperial'
                    ? 'border-[#6202AC] bg-purple-50 text-[#6202AC]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                Imperial (lbs/ft)
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full font-semibold text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md mt-4
              ${isFormValid
                ? 'bg-[#6202AC] hover:bg-[#4e0288] text-white hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}