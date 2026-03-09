'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Dumbbell, Zap, Flame, Mountain, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';

function NumberInput({
  value, onChange, placeholder, min = 0, max = 7, step = 1,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  min?: number; max?: number; step?: number;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    if (v === '') { onChange(''); return; }
    if (/^\d+$/.test(v)) {
      const n = Number(v);
      if (!isNaN(n) && n >= min && n <= max) onChange(v);
    }
  };
  const inc = () => onChange(String(Math.min((value ? Number(value) : min) + step, max)));
  const dec = () => onChange(String(Math.max((value ? Number(value) : min) - step, min)));
  return (
    <div className="relative">
      <input
        type="text" inputMode="numeric" pattern="[0-9]*"
        value={value} placeholder={placeholder}
        onChange={handleInputChange}
        className="w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-gray-900 placeholder:text-gray-400 text-sm"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
        <button type="button" onClick={inc} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC] p-0.5"><ChevronUp size={16} strokeWidth={2.5} /></button>
        <button type="button" onClick={dec} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC] p-0.5"><ChevronDown size={16} strokeWidth={2.5} /></button>
      </div>
    </div>
  );
}

export default function YourSchedulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workoutCount, setWorkoutCount]         = useState('');
  const [supplementalCount, setSupplementalCount] = useState('');
  const [cardioCount, setCardioCount]           = useState('');
  const [conditioningCount, setConditioningCount] = useState('');

  const isFormValid = workoutCount !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Simulate a small delay to show the loader (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existing = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
    sessionStorage.setItem('accountSetup', JSON.stringify({
      ...existing,
      // Store as counts directly — route.ts reads .length so we store arrays of that size
      // But route.ts uses workoutDays.length, so we store dummy arrays of the right length
      workoutDays:      Array(Number(workoutCount      || 0)).fill(''),
      supplementalDays: Array(Number(supplementalCount || 0)).fill(''),
      cardioDays:       Array(Number(cardioCount       || 0)).fill(''),
      conditioningDays: Array(Number(conditioningCount || 0)).fill(''),
      // Also store raw counts for convenience
      workoutCount:      workoutCount      || '0',
      supplementalCount: supplementalCount || '0',
      cardioCount:       cardioCount       || '0',
      conditioningCount: conditioningCount || '0',
    }));
    
    setIsSubmitting(false);
    router.push('/account-setup/repMax');
  };

  const totalActive = Number(workoutCount || 0) + Number(supplementalCount || 0)
    + Number(cardioCount || 0) + Number(conditioningCount || 0);

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Your Schedule',
          description: 'Structure your week to build consistency and momentum.',
        }}
        showProgress
        progressData={{ currentStep: 6, totalSteps: 9, nextStep: 'Strength Baselines' }}
      />

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Plan your training week</h1>
        <p className="text-gray-500 text-sm">Select your workout, supplemental, and cardio days to shape your routine.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Workouts Per Week */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <Dumbbell size={15} className="text-[#6202AC]" />Number of Workouts Per Week*
          </label>
          <NumberInput value={workoutCount} onChange={setWorkoutCount} placeholder="e.g., 4" min={0} max={7} />
          <p className="text-xs text-gray-400 mt-1">Main strength training sessions (4-5 workouts recommended)</p>
        </div>

        {/* Supplemental Per Week */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <Zap size={15} className="text-cyan-500" />Number of Supplemental Workouts Per Week
          </label>
          <NumberInput value={supplementalCount} onChange={setSupplementalCount} placeholder="e.g., 3" min={0} max={7} />
          <p className="text-xs text-gray-400 mt-1">Accessory work, mobility, or active recovery (3-4 workouts recommended)</p>
        </div>

        {/* Cardio Per Week */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <Flame size={15} className="text-orange-500" />Number of Cardio Workouts Per Week
          </label>
          <NumberInput value={cardioCount} onChange={setCardioCount} placeholder="e.g., 2" min={0} max={7} />
          <p className="text-xs text-gray-400 mt-1">Running, cycling, swimming, or other cardio activities (2-3 workouts recommended)</p>
        </div>

        {/* Field / Conditioning Per Week */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <Mountain size={15} className="text-amber-500" />Number of Field Workouts Per Week
          </label>
          <NumberInput value={conditioningCount} onChange={setConditioningCount} placeholder="e.g., 1" min={0} max={7} />
          <p className="text-xs text-gray-400 mt-1">Outdoor training, sports practice, or functional fitness (1-2 workouts recommended)</p>
        </div>

        {totalActive > 0 && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 flex items-center gap-3">
            <Calendar size={16} className="text-[#6202AC] flex-shrink-0" />
            <p className="text-xs text-purple-900">
              <span className="font-semibold">{totalActive} sessions/week</span> — {workoutCount || 0} workout · {supplementalCount || 0} supplemental · {cardioCount || 0} cardio · {conditioningCount || 0} field
            </p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
          <p className="text-xs text-yellow-900">
            <span className="font-semibold">· Tip:</span> You can schedule multiple types of workouts on the same day. For example, strength training in the morning and cardio in the evening.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={!isFormValid || isSubmitting}
          className={`w-full font-semibold text-base py-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2
            ${isFormValid && !isSubmitting
              ? 'bg-[#6202AC] hover:bg-[#4e0288] text-white shadow-md' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>
    </>
  );
}