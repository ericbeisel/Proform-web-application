'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Footprints, Flame, Camera, Upload, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';
import { useToast } from '@/components/ui/toast-provider';

function NumberInput({ value, onChange, placeholder, min = 0, max = 999999, step = 1, required = false }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  min?: number; max?: number; step?: number; required?: boolean;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    if (inputValue === '') { onChange(''); return; }
    // FIX: only allow whole integers, no decimals
    if (/^\d+$/.test(inputValue)) {
      const asNumber = Number(inputValue);
      if (!isNaN(asNumber) && asNumber >= min && asNumber <= max) {
        onChange(inputValue);
      }
    }
  };
  const inc = () => onChange(String(Math.min((value ? Number(value) : min) + step, max)));
  const dec = () => onChange(String(Math.max((value ? Number(value) : min) - step, min)));
  return (
    <div className="relative">
      <input
        type="text" inputMode="numeric" pattern="[0-9]*" value={value} placeholder={placeholder}
        onChange={handleInputChange}
        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-gray-900 placeholder:text-gray-400 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
        <button type="button" onClick={inc} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC] p-0.5"><ChevronUp size={16} strokeWidth={2.5} /></button>
        <button type="button" onClick={dec} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC] p-0.5"><ChevronDown size={16} strokeWidth={2.5} /></button>
      </div>
    </div>
  );
}

export default function LifestyleMetricsPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({ dailySteps: '', cardioCalorieGoal: '', progressPhoto: null as File | null });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/heic'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG or HEIC file');
      return;
    }
    setFormData({ ...formData, progressPhoto: file });
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    toast.success('Progress photo selected');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
    sessionStorage.setItem('accountSetup', JSON.stringify({
      ...existing,
      dailySteps: formData.dailySteps || '0',
      cardioCalorieGoal: formData.cardioCalorieGoal,
    }));
    router.push('/account-setup/progressMetrics');
  };

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Lifestyle Metrics',
          description: "Let's understand your activity level.",
        }}
        showProgress
        progressData={{ currentStep: 4, totalSteps: 9, nextStep: 'Progress Metrics' }}
      />

      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">Let&apos;s understand your activity level</h1>
        <p className="text-gray-500 text-sm sm:text-base">Enter your average daily steps and weekly cardio goal to personalize your experience.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
              <Footprints size={15} className="text-[#6202AC]" />Average Daily Steps (optional)
            </label>
            <NumberInput value={formData.dailySteps} onChange={(v) => setFormData({ ...formData, dailySteps: v })} placeholder="e.g. 10000" min={0} max={50000} step={1} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
              <Flame size={15} className="text-[#6202AC]" />Cardio Calorie Goal / Week*
            </label>
            <NumberInput value={formData.cardioCalorieGoal} onChange={(v) => setFormData({ ...formData, cardioCalorieGoal: v })} placeholder="e.g. 1500" min={0} max={10000} step={1} required />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-xs text-orange-900">
            <span className="font-semibold">🔥 For weight loss:</span> Aim for 1,500–2,500 calories per week through cardio to effectively burn fat and create a calorie deficit.
          </p>
        </div>

        {/* Progress Photo */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
            <Camera size={15} className="text-[#6202AC]" />Progress Photo (optional)
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-[#6202AC] transition-colors">
            <input type="file" id="progress-photo" accept="image/jpeg,image/png,image/heic" onChange={handlePhotoChange} className="hidden" />
            {photoPreview ? (
              <div className="flex flex-col items-center gap-3 p-6">
                <img src={photoPreview} alt="Preview" className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl mx-auto" />
                <button type="button" onClick={() => { setPhotoPreview(null); setFormData({ ...formData, progressPhoto: null }); }} className="text-sm text-red-600 hover:text-red-700">Remove Photo</button>
              </div>
            ) : (
              <label htmlFor="progress-photo" className="cursor-pointer flex flex-col items-center gap-3 py-10 sm:py-12 px-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Upload size={22} className="text-[#6202AC]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Upload a photo</p>
                  <p className="text-xs text-gray-500">JPG, PNG or HEIC (max 10MB)</p>
                </div>
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Take a starting photo to track your transformation journey</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-purple-900">
            <span className="font-semibold inline-flex items-center gap-1.5"><BarChart3 size={14} />Progress Tracking:</span>{' '}
            Regular photos and metrics help you see real changes that the scale might not show.
          </p>
        </div>

        <button type="submit" disabled={!formData.cardioCalorieGoal}
          className={`w-full font-semibold text-base py-4 rounded-full transition-all duration-200
            ${formData.cardioCalorieGoal ? 'bg-[#6202AC] hover:bg-[#50018C] text-white shadow-md hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >Continue</button>
      </form>
    </>
  );
}
