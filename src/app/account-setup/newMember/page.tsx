'use client';

import React, { useState } from 'react';
import { User, Settings, Users, Lock, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';
import { removeMemberChecklist } from '@/api/auth/remove-member-checklist/route';

export default function NewMemberChecklist() {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const router = useRouter();

  const steps = [
    { id: 1, title: 'Create Profile', description: 'Completed at sign-up', icon: User, status: 'completed' },
    { id: 2, title: 'Account Setup', description: 'Build your experience', icon: Settings, status: 'current' },
    { id: 3, title: 'Create Team', description: 'Earn points and challenge friends', icon: Users, status: 'locked' },
  ];

  const handleClose = async () => {
    if (isClosing) return;
    setIsClosing(true);

    router.replace('/dashboard');
  };

  const handleDontShowAgain = async (checked: boolean) => {
    if (!checked || isSkipping) return;
    setDontShowAgain(true);
    setIsSkipping(true);

    try {
      await removeMemberChecklist();
    } catch (error) {
      console.error('Failed to update checklist preference:', error);
    } finally {
      router.replace('/dashboard');
    }
  };

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Welcome Aboard!',
          description: "You're now part of an amazing fitness community. Let's complete your setup to unlock all features.",
          stats: [
            { value: '1000+', label: 'Active Members' },
            { value: '50k+', label: 'Workouts Logged' },
          ],
        }}
        hideBackButton
      />

      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={handleClose}
          disabled={isClosing}
          className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Close checklist"
          title="Close"
        >
          <X className="mx-auto h-5 w-5" />
        </button>
      </div>

      <div className="mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">New Member Checklist</h2>
        <p className="text-gray-500 text-xs sm:text-sm">Complete these tasks to get the most out of your membership</p>
      </div>

      <div className="mb-8 sm:mb-10">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isLocked = step.status === 'locked';

          return (
            <div key={step.id}>
              <div className={`relative flex items-center gap-4 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 rounded-2xl transition-all
                ${isCurrent ? 'border-2 border-cyan-400 bg-white shadow-sm' : isCompleted ? 'bg-purple-50 border border-purple-100' : 'bg-gray-50 border border-gray-100 opacity-60'}`}
              >
                <div className="flex-shrink-0">
                  {isCompleted
                    ? <div className="w-6 h-6 rounded-full bg-[#6202AC] flex items-center justify-center"><Check size={13} color="white" strokeWidth={3} /></div>
                    : <div className={`w-6 h-6 rounded-full border-2 bg-white ${isCurrent ? 'border-gray-400' : 'border-gray-300'}`} />
                  }
                </div>
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <Icon size={18} className={isCompleted ? 'text-[#6202AC]' : isCurrent ? 'text-gray-500' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{step.id}. {step.title}</p>
                  <p className={`text-xs mt-0.5 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>{step.description}</p>
                </div>
                {isLocked && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Lock size={14} className="text-gray-400" />
                  </div>
                )}
              </div>
              {!isLast && (
                <div className="flex justify-start pl-7 sm:pl-9">
                  <div className="w-0.5 h-6 sm:h-7 bg-gray-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <button onClick={() => router.push('/account-setup/personalBasics')}
          className="w-full bg-[#6202AC] hover:bg-[#4e0288] text-white font-semibold text-sm sm:text-base py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg">
          Go to Account Setup
        </button>
<button onClick={() => router.push('/programs/all-programs')}
  className="w-full bg-white hover:bg-purple-50 text-[#6202AC] font-semibold text-sm sm:text-base py-4 rounded-full border-2 border-[#6202AC] transition-all duration-200">
  View Program Suggestions
</button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <input type="checkbox" id="dontShow" checked={dontShowAgain} onChange={(e) => { void handleDontShowAgain(e.target.checked); }}
          className="w-4 h-4 accent-[#6202AC] cursor-pointer rounded" />
        <label htmlFor="dontShow" className="text-xs sm:text-sm text-gray-500 cursor-pointer select-none">
          Don&apos;t show me this again
        </label>
      </div>
    </>
  );
}
