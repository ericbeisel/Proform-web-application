'use client';

import React, { useState } from 'react';
import { Sparkles, Pencil, Check, Calculator, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';

type Method = 'auto' | 'manual';

export default function OneRepMaxPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    
    setIsSubmitting(true);
    
    // Simulate a small delay to show the loader (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ── Save this step's data to sessionStorage ──
    const existing = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
    sessionStorage.setItem('accountSetup', JSON.stringify({
      ...existing,
      selected1RMMethod: selectedMethod,
    }));
    
    setIsSubmitting(false);
    router.push('/account-setup/strengthProfile');
  };

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Strength Baselines',
          description: 'Set your lifting benchmarks to personalize your training intensity.',
        }}
        showProgress
        progressData={{ currentStep: 7, totalSteps: 9, nextStep: 'Strength Profile' }}
      />

      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">Choose how to set your 1 Rep Max</h1>
        <p className="text-gray-500 text-sm sm:text-base">Auto-calculate based on your performance or enter your maxes manually.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(['auto', 'manual'] as Method[]).map((method) => (
          <button key={method} type="button" onClick={() => setSelectedMethod(method)}
            className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 relative
              ${selectedMethod === method ? 'border-[#6202AC] bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
          >
            {selectedMethod === method && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[#6202AC] rounded-full flex items-center justify-center">
                <Check size={14} color="white" strokeWidth={3} />
              </div>
            )}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedMethod === method ? 'bg-purple-200' : 'bg-purple-100'}`}>
                {method === 'auto' ? <Sparkles size={20} className="text-[#6202AC]" /> : <Pencil size={18} className="text-[#6202AC]" />}
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                  {method === 'auto' ? 'Auto-Calculate' : 'Enter Manually'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-3">
                  {method === 'auto'
                    ? "We'll calculate your 1RM based on your recent training performance and progress over time."
                    : "Input your known 1 rep max values for each main lift. Great if you've recently tested your maxes."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {method === 'auto' ? (
                    <><span className="text-xs font-medium text-rose-500">🎯 Most Accurate</span><span className="text-xs font-medium text-amber-500">⚡ Quick Setup</span></>
                  ) : (
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${selectedMethod === 'manual' ? 'bg-purple-100 border-purple-200 text-[#6202AC]' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                      💪 For Experienced Lifters
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 sm:p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Calculator size={15} className="text-[#6202AC]" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">What is 1RM?</p>
            <p className="text-xs text-gray-500 leading-relaxed">Your one-rep max (1RM) is the maximum weight you can lift for a single repetition. We use this to personalize your training intensity.</p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!selectedMethod || isSubmitting}
          className={`w-full font-semibold text-base sm:text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md flex items-center justify-center gap-2
            ${selectedMethod && !isSubmitting
              ? 'bg-[#6202AC] hover:bg-[#4e0288] text-white hover:shadow-lg' 
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