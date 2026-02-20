'use client';

import React, { useState } from 'react';
import { Dumbbell, Zap, Flame, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type DayKey = typeof DAY_KEYS[number];

function DaySelector({ label, sublabel, icon, selectedDays, onToggle, iconColor }: {
  label: string; sublabel: string; icon: React.ReactNode;
  selectedDays: DayKey[]; onToggle: (d: DayKey) => void; iconColor: string;
}) {
  return (
    <div>
      <div className={`flex items-center gap-2 text-sm font-semibold mb-3 ${iconColor}`}>
        {icon}
        <span className="text-gray-800">{label}</span>
        <span className="text-gray-500 font-normal">({selectedDays.length}/7)</span>
      </div>
      <div className="flex gap-1.5 sm:gap-2">
        {DAY_KEYS.map((day, index) => (
          <button
            key={day}
            type="button"
            onClick={() => onToggle(day)}
            className={`flex-1 aspect-square flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border-2
              ${selectedDays.includes(day)
                ? 'bg-[#6202AC] border-[#6202AC] text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
          >
            {DAYS[index]}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">{sublabel}</p>
    </div>
  );
}

export default function YourSchedulePage() {
  const router = useRouter();
  const [workoutDays, setWorkoutDays] = useState<DayKey[]>(['Mon', 'Wed']);
  const [supplementalDays, setSupplementalDays] = useState<DayKey[]>(['Tue', 'Thu']);
  const [cardioDays, setCardioDays] = useState<DayKey[]>(['Fri', 'Sat']);

  const toggle = (day: DayKey, set: React.Dispatch<React.SetStateAction<DayKey[]>>) =>
    set(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const totalActiveDays = new Set([...workoutDays, ...supplementalDays, ...cardioDays]).size;

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Your Schedule',
          description: 'Structure your week to build consistency and momentum.',
        }}
        showProgress
        progressData={{ currentStep: 6, totalSteps: 9, nextStep: 'Lifestyle Metrics' }}
      />

      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">Plan your training week</h1>
        <p className="text-gray-500 text-sm sm:text-base">Select your workout, supplemental, and cardio days to shape your routine.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); router.push('/account-setup/repMax'); }} className="space-y-6 sm:space-y-7">
        <DaySelector label="Training Days*" sublabel="Choose up to four (4) core-workout training days. Typically spaced one day apart to allow for rest." icon={<Dumbbell size={15} />} iconColor="text-[#6202AC]" selectedDays={workoutDays} onToggle={(d) => toggle(d, setWorkoutDays)} />
        <DaySelector label="Supplemental Days" sublabel="Choose up to seven (7) supplemental workout days. May be completed before/after core-training or on cardio days." icon={<Zap size={15} />} iconColor="text-cyan-500" selectedDays={supplementalDays} onToggle={(d) => toggle(d, setSupplementalDays)} />
        <DaySelector label="Cardio Days" sublabel="Choose between one (1) and five (5) cardio days to split your cardio goals throughout the week." icon={<Flame size={15} />} iconColor="text-orange-500" selectedDays={cardioDays} onToggle={(d) => toggle(d, setCardioDays)} />

        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar size={18} className="text-[#6202AC]" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm sm:text-base">{totalActiveDays} Active Days Per Week</p>
            <p className="text-xs text-gray-500 mt-0.5">{workoutDays.length} workout · {supplementalDays.length} supplemental · {cardioDays.length} cardio</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-yellow-900">
            <span className="font-semibold">💡 Tip:</span> You can select overlapping days. For example, you might do cardio after your main workout.
          </p>
        </div>

        <button type="submit" disabled={workoutDays.length === 0}
          className={`w-full font-semibold text-base sm:text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md
            ${workoutDays.length > 0 ? 'bg-[#6202AC] hover:bg-[#4e0288] text-white hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >Continue</button>
      </form>
    </>
  );
}