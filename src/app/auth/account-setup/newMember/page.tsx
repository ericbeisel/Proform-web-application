'use client';

import React, { useState } from 'react';
import { X, User, Settings, Users, Lock, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function NewMemberChecklist() {
  const [showModal, setShowModal] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);
const router = useRouter();


  const steps = [
    {
      id: 1,
      title: 'Create Profile',
      description: 'Completed at sign-up',
      icon: User,
      status: 'completed',
      locked: false
    },
    {
      id: 2,
      title: 'Account Setup',
      description: 'Build your experience',
      icon: Settings,
      status: 'current',
      locked: false
    },
    {
      id: 3,
      title: 'Create Team',
      description: 'Earn points and challenge friends',
      icon: Users,
      status: 'locked',
      locked: true
    }
  ];

  const currentStep = steps.find(step => step.status === 'current');
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  if (!showModal) return null;

  

  return (
      <div className="w-full relative">
       {/* Step Counter */}
      <div className="flex justify-end mb-4 px-2">
        <span className="text-sm font-semibold text-gray-600">1 of 9</span>
      </div>

      {/* Progress Bar - Centered with equal spacing */}
      <div className="flex justify-center mb-10 px-2">
        <div className="w-full max-w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-cyan-400 h-full transition-all duration-300 rounded-full" 
            style={{ width: '11%' }} // 1 of 9 steps
          />
        </div>
      </div>

        {/* Content */}
        <div className="pb-8 w-full max-w-[520px] mx-auto">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-black mb-2">
              New Member Checklist
            </h2>
            <p className="text-gray-500 text-sm">
              Tasks to complete for new users!
            </p>
          </div>

          {/* Checklist Steps */}
          <div className="space-y-0 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="relative">
                  {/* Step Item */}
                  <div
                    className={`relative flex items-start gap-4 p-5 rounded-2xl transition-all
                      ${step.status === 'current' ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-400' : 'bg-transparent'}
                      ${step.status === 'completed' ? 'bg-purple-50' : ''}
                      ${step.status === 'locked' ? 'opacity-50' : ''}
                    `}
                  >
                    {/* Icon Container */}
                    <div className="flex-shrink-0 relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center
                          ${step.status === 'completed' ? 'bg-purple-100' : ''}
                          ${step.status === 'current' ? 'bg-white shadow-sm' : ''}
                          ${step.status === 'locked' ? 'bg-gray-100' : ''}
                        `}
                      >
                        <Icon
                          size={20}
                          className={`
                            ${step.status === 'completed' ? 'text-purple-600' : ''}
                            ${step.status === 'current' ? 'text-gray-600' : ''}
                            ${step.status === 'locked' ? 'text-gray-400' : ''}
                          `}
                        />
                      </div>

                      {/* Checkmark for completed */}
                      {step.status === 'completed' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <Check size={12} color="white" strokeWidth={3} />
                        </div>
                      )}

                      {/* Lock icon for locked */}
                      {step.status === 'locked' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                          <Lock size={10} color="white" />
                        </div>
                      )}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 pt-1">
                      <h3
                        className={`font-semibold mb-1
                          ${step.status === 'locked' ? 'text-gray-400' : 'text-black'}
                        `}
                      >
                        {step.id}. {step.title}
                      </h3>
                      <p
                        className={`text-sm
                          ${step.status === 'locked' ? 'text-gray-400' : 'text-gray-500'}
                        `}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="flex justify-start pl-6">
                      <div className="w-0.5 h-6 bg-gray-200 ml-5"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 flex flex-col items-center">
            <button
  onClick={() => {
    router.push('/auth/account-setup/personalBasics');
  }}
  className="w-96 bg-[#6202AC] hover:bg-[#4e0288] text-white font-semibold text-base py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
>
  Go to Account Setup
</button>


            <button
              onClick={() => {
                // View suggestions
                console.log('View Program Suggestions');
              }}
              className="w-96 bg-white hover:bg-gray-50 text-[#6202AC] font-semibold text-base py-4 rounded-full border-2 border-[#6202AC] transition-all duration-200"
            >
              View Program Suggestions
            </button>
          </div>

          {/* Don't show again checkbox */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <input
              type="checkbox"
              id="dontShow"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-[#6202AC] border-gray-300 rounded focus:ring-[#6202AC] cursor-pointer"
            />
            <label
              htmlFor="dontShow"
              className="text-sm text-gray-500 cursor-pointer select-none"
            >
              Don't show me this again
            </label>
          </div>
        </div>
      </div>
  );
}