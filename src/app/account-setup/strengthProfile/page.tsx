'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';

function NumberInput({ value, onChange, placeholder, min = 0, max = 9999, step = 2.5 }: {
  value: string; onChange: (v: string) => void; placeholder: string; min?: number; max?: number; step?: number;
}) {
  const inc = () => onChange(String(Math.min(+(((value ? Number(value) : min) + step)).toFixed(1), max)));
  const dec = () => onChange(String(Math.max(+(((value ? Number(value) : min) - step)).toFixed(1), min)));
  return (
    <div className="relative bg-white rounded-xl overflow-hidden border border-[#E7E5EB]">
      <input type="number" value={value} placeholder={placeholder}
        onChange={(e) => { const v = e.target.value; if (v === '') { onChange(''); return; } const n = Number(v); if (!isNaN(n) && n >= min && n <= max) onChange(v); }}
        className="w-full px-4 py-3 sm:py-3.5 pr-12 bg-white text-gray-700 placeholder:text-gray-400 text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
        <button type="button" onClick={inc} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC]"><ChevronUp size={15} strokeWidth={2.5} /></button>
        <button type="button" onClick={dec} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC]"><ChevronDown size={15} strokeWidth={2.5} /></button>
      </div>
    </div>
  );
}

const BenchPressIcon = () => (<svg viewBox="0 0 36 36" fill="none" className="w-6 h-6 sm:w-7 sm:h-7"><rect x="2" y="15" width="32" height="6" rx="3" fill="#7C3AED" opacity="0.2"/><rect x="0" y="11" width="5" height="14" rx="2.5" fill="#7C3AED"/><rect x="31" y="11" width="5" height="14" rx="2.5" fill="#7C3AED"/><rect x="5" y="14" width="26" height="8" rx="2" fill="#7C3AED" opacity="0.5"/><circle cx="18" cy="18" r="2.5" fill="#7C3AED"/></svg>);
const SquatIcon = () => (<svg viewBox="0 0 36 36" fill="none" className="w-6 h-6 sm:w-7 sm:h-7"><rect x="2" y="15" width="32" height="6" rx="3" fill="#7C3AED" opacity="0.2"/><rect x="0" y="11" width="5" height="14" rx="2.5" fill="#7C3AED"/><rect x="31" y="11" width="5" height="14" rx="2.5" fill="#7C3AED"/><rect x="5" y="14" width="26" height="8" rx="2" fill="#7C3AED" opacity="0.5"/><path d="M13 22 L18 29 L23 22" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="8" r="3" fill="#7C3AED" opacity="0.6"/></svg>);
const DeadliftIcon = () => (<svg viewBox="0 0 36 36" fill="none" className="w-6 h-6 sm:w-7 sm:h-7"><rect x="2" y="22" width="32" height="6" rx="3" fill="#7C3AED" opacity="0.2"/><rect x="0" y="18" width="5" height="14" rx="2.5" fill="#7C3AED"/><rect x="31" y="18" width="5" height="14" rx="2.5" fill="#7C3AED"/><rect x="5" y="21" width="26" height="8" rx="2" fill="#7C3AED" opacity="0.5"/><path d="M18 20 L18 8" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/><path d="M12 14 L18 8 L24 14" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const PowerCleanIcon = () => (<svg viewBox="0 0 36 36" fill="none" className="w-6 h-6 sm:w-7 sm:h-7"><rect x="2" y="17" width="32" height="6" rx="3" fill="#7C3AED" opacity="0.2"/><rect x="0" y="13" width="5" height="14" rx="2.5" fill="#7C3AED"/><rect x="31" y="13" width="5" height="14" rx="2.5" fill="#7C3AED"/><rect x="5" y="16" width="26" height="8" rx="2" fill="#7C3AED" opacity="0.5"/><path d="M13 16 C13 9 23 9 23 16" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>);

const LIFTS = [
  { id: 'benchPress', name: 'Bench Press', description: 'Upper body push strength', icon: <BenchPressIcon /> },
  { id: 'squat', name: 'Squat', description: 'Lower body strength & power', icon: <SquatIcon /> },
  { id: 'deadlift', name: 'Deadlift', description: 'Full body pulling power', icon: <DeadliftIcon /> },
  { id: 'powerClean', name: 'Power Clean', description: 'Explosive triple extension', icon: <PowerCleanIcon /> },
];

export default function StrengthProfilePage() {
  const router = useRouter();
  const [liftValues, setLiftValues] = useState<Record<string, string>>({ benchPress: '', squat: '', deadlift: '', powerClean: '' });
  const [autoCalculate, setAutoCalculate] = useState(false);

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Strength Profile',
          description: 'Define your key lifts to tailor your training intensity and progression.',
        }}
        showProgress
        progressData={{ currentStep: 8, totalSteps: 9, nextStep: 'Preferences' }}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">Enter your 1 Rep Max values</h1>
        <p className="text-gray-500 text-sm sm:text-base">Provide your max for each lift so we can personalize your program accurately.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); router.push('/account-setup/preferences'); }} className="space-y-4">
        {/* 2x2 grid on sm+, 1 col on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LIFTS.map((lift) => (
            <div key={lift.id} className="bg-gradient-to-b from-[#F5F3FF] to-white rounded-2xl p-3 sm:p-4 space-y-3 border border-[#6202AC33]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  {lift.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{lift.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lift.description}</p>
                </div>
              </div>
              <NumberInput value={liftValues[lift.id]} onChange={(v) => setLiftValues(prev => ({ ...prev, [lift.id]: v }))} placeholder="Enter 1RM" min={0} max={999} step={2.5} />
            </div>
          ))}
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={17} className="text-[#6202AC]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900">Auto-Calculate Future Lifts</p>
              <p className="text-xs text-gray-500 mt-0.5">Update 1RM based on training progress</p>
            </div>
          </div>
          <button type="button" onClick={() => setAutoCalculate(!autoCalculate)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${autoCalculate ? 'bg-[#6202AC]' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${autoCalculate ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <button type="submit" className="w-full bg-[#6202AC] hover:bg-[#4e0288] text-white font-semibold text-base sm:text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg">
          Complete Setup
        </button>
      </form>
    </>
  );
}