'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Weight, Target, Ruler, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';

function NumberInput({ value, onChange, placeholder, min = 0, max = 999, step = 1, required = false }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  min?: number; max?: number; step?: number; required?: boolean;
}) {
  const inc = () => onChange(String(Math.min((value ? Number(value) : min) + step, max)));
  const dec = () => onChange(String(Math.max((value ? Number(value) : min) - step, min)));
  return (
    <div className="relative">
      <input
        type="number" value={value} placeholder={placeholder} min={min} max={max} step={step} required={required}
        onChange={(e) => { const v = e.target.value; if (v === '') { onChange(''); return; } const n = Number(v); if (!isNaN(n) && n >= min && n <= max) onChange(v); }}
        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
        <button type="button" onClick={inc} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC] p-0.5"><ChevronUp size={16} strokeWidth={2.5} /></button>
        <button type="button" onClick={dec} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC] p-0.5"><ChevronDown size={16} strokeWidth={2.5} /></button>
      </div>
    </div>
  );
}

export default function CoreMetricsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ currentWeight: '', goalWeight: '', heightFeet: '', heightInches: '', bodyFatPercentage: '' });
  const isFormValid = formData.currentWeight && formData.goalWeight && formData.heightFeet && formData.heightInches;

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Core Metrics',
          description: "Let's establish your baseline measurements to track progress and personalize your plan.",
        }}
        showProgress
        progressData={{ currentStep: 3, totalSteps: 9, nextStep: 'Lifestyle Metrics' }}
      />

      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">Let's track your starting point</h1>
        <p className="text-gray-500 text-sm sm:text-base">Enter your current metrics to help personalize your experience</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); router.push('/account-setup/lifestyleMetrics'); }} className="space-y-5 sm:space-y-6">
        {/* Weight row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
              <Weight size={15} className="text-[#6202AC]" />Current Weight*
            </label>
            <NumberInput value={formData.currentWeight} onChange={(v) => setFormData({ ...formData, currentWeight: v })} placeholder="e.g. 180" min={50} max={500} required />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
              <Target size={15} className="text-[#6202AC]" />Goal Weight*
            </label>
            <NumberInput value={formData.goalWeight} onChange={(v) => setFormData({ ...formData, goalWeight: v })} placeholder="e.g. 160" min={50} max={500} required />
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
            <Ruler size={15} className="text-[#6202AC]" />Height*
          </label>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput value={formData.heightFeet} onChange={(v) => setFormData({ ...formData, heightFeet: v })} placeholder="Feet" min={3} max={8} required />
            <NumberInput value={formData.heightInches} onChange={(v) => setFormData({ ...formData, heightInches: v })} placeholder="Inches" min={0} max={11} required />
          </div>
        </div>

        {/* Body Fat */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
            <Percent size={15} className="text-[#6202AC]" />Body Fat % (optional)
          </label>
          <NumberInput value={formData.bodyFatPercentage} onChange={(v) => setFormData({ ...formData, bodyFatPercentage: v })} placeholder="e.g. 20" min={5} max={50} step={0.5} />
          <p className="text-xs text-gray-500 mt-2">If you know your current body fat percentage</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-purple-900">
            <span className="font-semibold">💡 Tip:</span> These metrics help us create a personalized workout and nutrition plan tailored to your goals.
          </p>
        </div>

        <button type="submit" disabled={!isFormValid}
          className={`w-full font-semibold text-base py-4 rounded-full transition-all duration-200
            ${isFormValid ? 'bg-[#6202AC] hover:bg-[#50018C] text-white shadow-md hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >Continue</button>
      </form>
    </>
  );
}