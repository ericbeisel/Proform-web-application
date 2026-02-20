'use client';

import React, { useState } from 'react';
import { Globe, CalendarDays, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const DAY_KEYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayKey = typeof DAY_KEYS[number];

const TIME_ZONES = ['UTC-12:00 Baker Island','UTC-11:00 American Samoa','UTC-10:00 Hawaii','UTC-09:00 Alaska','UTC-08:00 Pacific Time (US)','UTC-07:00 Mountain Time (US)','UTC-06:00 Central Time (US)','UTC-05:00 Eastern Time (US)','UTC-04:00 Atlantic Time','UTC-03:00 Brazil','UTC+00:00 London (GMT)','UTC+01:00 Paris, Berlin','UTC+02:00 Cairo, Athens','UTC+03:00 Moscow, Riyadh','UTC+04:00 Dubai','UTC+05:00 Karachi','UTC+05:30 Mumbai, Delhi','UTC+06:00 Dhaka','UTC+07:00 Bangkok','UTC+08:00 Singapore, Beijing','UTC+09:00 Tokyo, Seoul','UTC+10:00 Sydney','UTC+11:00 Solomon Islands','UTC+12:00 Auckland'];

export default function PreferencesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ timeZone: '', weeklyResetDay: 'Thursday' as DayKey, country: '', state: '', city: '' });
  const isFormValid = formData.timeZone && formData.country && formData.city;

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Preferences',
          description: 'Set your time and location to keep your plan aligned with your routine.',
        }}
        showProgress
        progressData={{ currentStep: 9, totalSteps: 9, nextStep: 'Dashboard' }}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">Configure your Schedule and Time</h1>
        <p className="text-gray-500 text-sm sm:text-base">Choose your time zone, weekly reset day, and location for accurate tracking and updates.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); router.push('/dashboard'); }} className="space-y-5 sm:space-y-6">
        {/* Time Zone */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
            <Globe size={15} className="text-[#6202AC]" />Time Zone*
          </label>
          <div className="relative">
            <select value={formData.timeZone} onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
              className="w-full px-4 py-3.5 sm:py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-gray-700 appearance-none cursor-pointer text-sm" required>
              <option value=""></option>
              {TIME_ZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="11" height="7" viewBox="0 0 11 7" fill="none"><path d="M1 1L5.5 5.5L10 1" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        {/* Weekly Reset Day */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
            <CalendarDays size={15} className="text-[#6202AC]" />Weekly Reset Day*
          </label>
          <div className="bg-[#F3EFFF] rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 border border-[#6202AC33]">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-1">
              Resets your daily metrics and records your progress each week at <span className="font-semibold">11:59 pm</span>, based on the date selected below:
            </p>
            <p className="text-xs text-gray-500">Calories will reset at 11:59 pm on the night before your start date.</p>
          </div>
          <div className="flex gap-1 sm:gap-1.5 mb-3">
            {DAY_KEYS.map((day, index) => (
              <button key={day} type="button" onClick={() => setFormData({ ...formData, weeklyResetDay: day })}
                className={`flex-1 py-2.5 sm:py-3 flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border-2
                  ${formData.weeklyResetDay === day ? 'bg-[#6202AC] text-white border-[#6202AC] shadow-sm' : 'bg-white text-gray-500 border-[#E7E5EB] hover:bg-gray-50'}`}
              >{DAYS[index]}</button>
            ))}
          </div>
          <p className="text-xs font-medium text-[#6202AC]">📅 Weekly reset: Every {formData.weeklyResetDay}</p>
        </div>

        {/* Location */}
        <div className="bg-gradient-to-b from-white to-[#F5F3FF] border border-[#6202AC33] rounded-2xl p-3 sm:p-4">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">
            <MapPin size={15} className="text-[#6202AC]" />Location
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {[
              { key: 'country', label: 'Country*', required: true },
              { key: 'state', label: 'State', required: false },
              { key: 'city', label: 'City*', required: true },
            ].map(({ key, label, required }) => (
              <div key={key}>
                <p className="text-xs font-medium text-gray-600 mb-1.5">{label}</p>
                <input type="text" value={formData[key as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-gray-900 text-sm"
                  required={required}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#FFFBEB] rounded-2xl p-3 sm:p-4 border border-[#FBBF2433]">
          <p className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">🌍 Why we ask:</span> Your location helps us show local gym events, provide accurate time tracking, and connect you with nearby fitness communities.
          </p>
        </div>

        <button type="submit" disabled={!isFormValid}
          className={`w-full font-semibold text-base sm:text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md
            ${isFormValid ? 'bg-[#6202AC] hover:bg-[#4e0288] text-white hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >Continue</button>
      </form>
    </>
  );
}