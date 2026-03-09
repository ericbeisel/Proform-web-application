'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Weight, Target, Ruler, Percent, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';
import { useToast } from '@/components/ui/toast-provider';

function NumberInput({
  value, onChange, placeholder, min = 0, max = 9999, step = 1, required = false,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  min?: number; max?: number; step?: number; required?: boolean;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    
    // Allow empty string
    if (v === '') {
      onChange('');
      return;
    }
    
    // Allow decimal numbers (positive only)
    if (/^\d*\.?\d*$/.test(v)) {
      const n = Number(v);
      if (!isNaN(n)) {
        // Enforce max constraint
        if (n <= max) {
          onChange(v);
        }
      }
    }
  };
  
  const inc = () => {
    const current = value ? Number(value) : min;
    const newValue = Math.min(current + step, max);
    onChange(String(newValue));
  };
  
  const dec = () => {
    const current = value ? Number(value) : min;
    const newValue = Math.max(current - step, min);
    onChange(String(newValue));
  };
  
  return (
    <div className="relative">
      <input
        type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
        value={value} placeholder={placeholder}
        onChange={handleInputChange}
        className="w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-gray-900 placeholder:text-gray-400 text-sm"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
        <button type="button" onClick={inc} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC] p-0.5">
          <ChevronUp size={16} strokeWidth={2.5} />
        </button>
        <button type="button" onClick={dec} tabIndex={-1} className="text-gray-400 hover:text-[#6202AC] p-0.5">
          <ChevronDown size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export default function CoreMetricsPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unitPreference, setUnitPreference] = useState<'metric' | 'imperial'>('metric');
  
  const [formData, setFormData] = useState({
    currentWeight: '', goalWeight: '', heightFeet: '', heightInches: '', bodyFatPercentage: '',
  });
  const [bcaFile, setBcaFile] = useState<File | null>(null);

  // Load unit preference from sessionStorage
  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
    if (savedData.unitPreference) {
      setUnitPreference(savedData.unitPreference);
    }
    
    // Load saved metrics if they exist
    if (savedData.currentWeight || savedData.goalWeight || savedData.heightFeet || savedData.heightInches || savedData.bodyFatPercentage) {
      setFormData({
        currentWeight: savedData.currentWeight || '',
        goalWeight: savedData.goalWeight || '',
        heightFeet: savedData.heightFeet || '',
        heightInches: savedData.heightInches || '',
        bodyFatPercentage: savedData.bodyFatPercentage || '',
      });
    }
  }, []);

  const isFormValid = () => {
    if (!formData.currentWeight || !formData.goalWeight || !formData.heightFeet) return false;
    
    // Additional validation for inches (if entered, must be <= 11)
    if (formData.heightInches && Number(formData.heightInches) > 11) return false;
    
    return true;
  };

  const handleBcaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be less than 20MB');
      return;
    }
    setBcaFile(file);
    toast.success('BCA report selected');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Simulate a small delay to show the loader (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log("Form Values:", formData);
    console.log("BCA File:", bcaFile);

    const existing = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');

    sessionStorage.setItem(
      'accountSetup',
      JSON.stringify({
        ...existing,
        currentWeight: formData.currentWeight,
        goalWeight: formData.goalWeight,
        heightFeet: formData.heightFeet,
        heightInches: formData.heightInches || '0',
        bodyFatPercentage: formData.bodyFatPercentage || '0',
      })
    );

    setIsSubmitting(false);
    router.push('/account-setup/lifestyleMetrics');
  };

  const weightUnit = unitPreference === 'metric' ? 'kg' : 'lbs';

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Core Metrics',
          description: `Let's establish your baseline measurements to track progress and personalize your plan.`,
        }}
        showProgress
        progressData={{ currentStep: 3, totalSteps: 9, nextStep: 'Lifestyle Metrics' }}
      />

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Let&apos;s track your starting point</h1>
        <p className="text-gray-500 text-sm">
          Using <span className="font-semibold text-[#6202AC]">{unitPreference === 'metric' ? 'Metric' : 'Imperial'}</span> units ({weightUnit})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* BCA Report Upload */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
            <Upload size={13} className="text-[#6202AC]" />Upload BCA Report (Optional)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Upload your Body Composition Analysis report from InBody or similar machines
          </p>
          <label
            htmlFor="bca-upload"
            className="flex flex-col items-center justify-center gap-1.5 py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#6202AC] transition-colors bg-gray-50"
          >
            <Upload size={20} className="text-gray-400" />
            {bcaFile ? (
              <span className="text-sm text-[#6202AC] font-medium">{bcaFile.name}</span>
            ) : (
              <>
                <span className="text-sm font-medium text-gray-700">Click to upload PDF</span>
                <span className="text-xs text-gray-400">PDF files only</span>
              </>
            )}
            <input id="bca-upload" type="file" accept="application/pdf" onChange={handleBcaChange} className="hidden" />
          </label>
        </div>

        {/* Current Weight + Goal Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
              <Weight size={13} className="text-[#6202AC]" />Current Weight ({weightUnit})*
            </label>
            <NumberInput 
              value={formData.currentWeight} 
              onChange={(v) => setFormData({ ...formData, currentWeight: v })} 
              placeholder={`Enter current weight (${weightUnit})`} 
              min={0} 
              max={unitPreference === 'metric' ? 250 : 500} 
              step={0.1} 
              required 
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
              <Target size={13} className="text-[#6202AC]" />Goal Weight ({weightUnit})*
            </label>
            <NumberInput 
              value={formData.goalWeight} 
              onChange={(v) => setFormData({ ...formData, goalWeight: v })} 
              placeholder={`Enter goal weight (${weightUnit})`} 
              min={0} 
              max={unitPreference === 'metric' ? 250 : 500} 
              step={0.1} 
              required 
            />
          </div>
        </div>

        {/* Height - Always Feet & Inches */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
            <Ruler size={13} className="text-[#6202AC]" />Height (feet & inches)*
          </label>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput 
              value={formData.heightFeet} 
              onChange={(v) => setFormData({ ...formData, heightFeet: v })} 
              placeholder="Feet" 
              min={0} max={9} step={1} required 
            />
            <NumberInput 
              value={formData.heightInches} 
              onChange={(v) => setFormData({ ...formData, heightInches: v })} 
              placeholder="Inches" 
              min={0} max={11} step={1} 
            />
          </div>
          {formData.heightInches && Number(formData.heightInches) > 11 && (
            <p className="text-xs text-red-500 mt-1">Inches cannot exceed 11</p>
          )}
        </div>

        {/* Body Fat Percentage */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
            <Percent size={13} className="text-[#6202AC]" />Body Fat Percentage (optional)
          </label>
          <NumberInput 
            value={formData.bodyFatPercentage} 
            onChange={(v) => setFormData({ ...formData, bodyFatPercentage: v })} 
            placeholder="Enter body fat %" 
            min={0} max={60} step={0.1} 
          />
          <p className="text-xs text-gray-400 mt-1">If you know your current body fat percentage</p>
        </div>

        {/* Weight difference summary */}
        {formData.currentWeight && formData.goalWeight && (
          <div className="bg-purple-50 p-3 rounded-xl">
            <p className="text-xs text-[#6202AC]">
              Goal: {Number(formData.goalWeight) > Number(formData.currentWeight) ? 'Gain' : 'Lose'}{' '}
              {Math.abs(Number(formData.goalWeight) - Number(formData.currentWeight)).toFixed(1)} {weightUnit}
            </p>
          </div>
        )}

        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3">
          <p className="text-xs text-purple-900">
            <span className="font-semibold">· Tip:</span> These metrics help us create a personalized workout and nutrition plan tailored to your goals.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={!isFormValid() || isSubmitting}
          className={`w-full font-semibold text-base py-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2
            ${isFormValid() && !isSubmitting
              ? 'bg-[#6202AC] hover:bg-[#50018C] text-white shadow-md' 
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