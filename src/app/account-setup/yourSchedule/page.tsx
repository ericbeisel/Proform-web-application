'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Dumbbell, Zap, Flame, Mountain, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';

function NumberInput({
  value,
  onChange,
  placeholder,
  min = 0,
  max = 7,
  step = 1,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    if (v === '') {
      onChange('');
      return;
    }
    if (/^\d+$/.test(v)) {
      const n = Number(v);
      if (!isNaN(n) && n >= min && n <= max) onChange(v);
    }
  };

  const inc = () => {
    const current = value ? Number(value) : min;
    onChange(String(Math.min(current + step, max)));
  };

  const dec = () => {
    const current = value ? Number(value) : min;
    onChange(String(Math.max(current - step, min)));
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        className="w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-gray-900 placeholder:text-gray-400 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
        <button
          type="button"
          onClick={inc}
          tabIndex={-1}
          className="text-gray-400 hover:text-[#6202AC] p-0.5"
        >
          <ChevronUp size={16} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={dec}
          tabIndex={-1}
          className="text-gray-400 hover:text-[#6202AC] p-0.5"
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export default function YourSchedulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from sessionStorage
  const [workoutCount, setWorkoutCount] = useState('');
  const [supplementalCount, setSupplementalCount] = useState('');
  const [cardioCount, setCardioCount] = useState('');
  const [conditioningCount, setConditioningCount] = useState('');

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('accountSetup');
    console.log('Loading from sessionStorage:', saved);
    
    if (!saved) {
      setIsLoading(false);
      return;
    }

    try {
      const data = JSON.parse(saved);
      console.log('Parsed data:', data);
      
      // Set the values - make sure we're using the right property names
      setWorkoutCount(data.workoutCount || '');
      setSupplementalCount(data.supplementalCount || '');
      setCardioCount(data.cardioCount || '');
      setConditioningCount(data.conditioningCount || '');
    } catch (error) {
      console.error('Failed to parse sessionStorage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-save whenever any count changes
  useEffect(() => {
    // Don't save during initial load
    if (isLoading) return;
    
    const existing = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
    console.log('Auto-saving:', {
      workoutCount,
      supplementalCount,
      cardioCount,
      conditioningCount
    });

    const workoutNum = Number(workoutCount || 0);
    const supplementalNum = Number(supplementalCount || 0);
    const cardioNum = Number(cardioCount || 0);
    const conditioningNum = Number(conditioningCount || 0);

    const dataToSave = {
      ...existing,
      workoutDays: Array(workoutNum).fill(''),
      supplementalDays: Array(supplementalNum).fill(''),
      cardioDays: Array(cardioNum).fill(''),
      conditioningDays: Array(conditioningNum).fill(''),
      workoutCount,
      supplementalCount,
      cardioCount,
      conditioningCount,
    };
    
    sessionStorage.setItem('accountSetup', JSON.stringify(dataToSave));
    console.log('Saved to sessionStorage:', dataToSave);
  }, [workoutCount, supplementalCount, cardioCount, conditioningCount, isLoading]);

  const isFormValid = workoutCount !== '' && workoutCount !== '0'; // or just !== '' if 0 is allowed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);

    // Small fake delay (remove in production if not needed)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Final save (redundant since useEffect already saves, but ensures latest values)
    const existing = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
    const workoutNum = Number(workoutCount || 0);
    const supplementalNum = Number(supplementalCount || 0);
    const cardioNum = Number(cardioCount || 0);
    const conditioningNum = Number(conditioningCount || 0);

    const dataToSave = {
      ...existing,
      workoutDays: Array(workoutNum).fill(''),
      supplementalDays: Array(supplementalNum).fill(''),
      cardioDays: Array(cardioNum).fill(''),
      conditioningDays: Array(conditioningNum).fill(''),
      workoutCount,
      supplementalCount,
      cardioCount,
      conditioningCount,
    };
    
    sessionStorage.setItem('accountSetup', JSON.stringify(dataToSave));
    console.log('Final save before navigation:', dataToSave);

    setIsSubmitting(false);
    router.push('/account-setup/repMax');
  };

  const totalActive =
    Number(workoutCount || 0) +
    Number(supplementalCount || 0) +
    Number(cardioCount || 0) +
    Number(conditioningCount || 0);

  if (isLoading) {
    return (
      <SplitLayout
        leftContent={{
          title: 'Your Schedule',
          description: 'Structure your week to build consistency and momentum.',
        }}
        showProgress
        progressData={{ currentStep: 6, totalSteps: 9, nextStep: 'Strength Baselines' }}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#6202AC]" />
        </div>
      </SplitLayout>
    );
  }

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
            <Dumbbell size={15} className="text-[#6202AC]" />
            Number of Workouts Per Week*
          </label>
          <NumberInput
            value={workoutCount}
            onChange={setWorkoutCount}
            placeholder="e.g., 4"
            min={0}
            max={7}
          />
          <p className="text-xs text-gray-400 mt-1">Main strength training sessions (4-5 workouts recommended)</p>
        </div>

        {/* Supplemental Per Week */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <Zap size={15} className="text-cyan-500" />
            Number of Supplemental Workouts Per Week
          </label>
          <NumberInput
            value={supplementalCount}
            onChange={setSupplementalCount}
            placeholder="e.g., 3"
            min={0}
            max={7}
          />
          <p className="text-xs text-gray-400 mt-1">
            Accessory work, mobility, or active recovery (3-4 workouts recommended)
          </p>
        </div>

        {/* Cardio Per Week */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <Flame size={15} className="text-orange-500" />
            Number of Cardio Workouts Per Week
          </label>
          <NumberInput
            value={cardioCount}
            onChange={setCardioCount}
            placeholder="e.g., 2"
            min={0}
            max={7}
          />
          <p className="text-xs text-gray-400 mt-1">
            Running, cycling, swimming, or other cardio activities (2-3 workouts recommended)
          </p>
        </div>

        {/* Conditioning / Field Per Week */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <Mountain size={15} className="text-amber-500" />
            Number of Field Workouts Per Week
          </label>
          <NumberInput
            value={conditioningCount}
            onChange={setConditioningCount}
            placeholder="e.g., 1"
            min={0}
            max={7}
          />
          <p className="text-xs text-gray-400 mt-1">
            Outdoor training, sports practice, or functional fitness (1-2 workouts recommended)
          </p>
        </div>

        {/* Optional summary block - uncomment if you want it */}
        {/* {totalActive > 0 && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 flex items-center gap-3">
            <Calendar size={16} className="text-[#6202AC] flex-shrink-0" />
            <p className="text-xs text-purple-900">
              <span className="font-semibold">{totalActive} sessions/week</span> —{' '}
              {workoutCount || 0} workout · {supplementalCount || 0} supplemental ·{' '}
              {cardioCount || 0} cardio · {conditioningCount || 0} field
            </p>
          </div>
        )} */}

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
          <p className="text-xs text-yellow-900">
            <span className="font-semibold">· Tip:</span> You can schedule multiple types of workouts on the same day.
            For example, strength training in the morning and cardio in the evening.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full font-semibold text-base py-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2 ${
            isFormValid && !isSubmitting
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