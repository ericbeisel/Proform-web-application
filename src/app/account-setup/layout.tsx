'use client';

import React, { useRef, useEffect, useState, createContext, useContext, useCallback } from 'react';
import BackButton from '@/components/account-setup/ui/BackButton';

const VIDEO_URL = '/videos/proform-vid.mp4';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeftContent {
  title: string;
  description: string;
  stats?: { label: string; value: string }[];
}

interface ProgressData {
  currentStep: number;
  totalSteps: number;
  nextStep: string;
}

interface LayoutConfig {
  leftContent?: LeftContent;
  progressData?: ProgressData;
  showProgress?: boolean;
  hideBackButton?: boolean;
  onBack?: () => void;
}

interface LayoutContextValue {
  configure: (config: LayoutConfig) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LayoutContext = createContext<LayoutContextValue>({ configure: () => {} });
export const useLayout = () => useContext(LayoutContext);

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AccountSetupLayout({ children }: { children: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [leftContent, setLeftContent] = useState<LeftContent>({ title: '', description: '' });
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [hideBackButton, setHideBackButton] = useState(true); // default true — no flash on first page
  const [onBack, setOnBack] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const configure = useCallback(({ leftContent, progressData, showProgress, hideBackButton, onBack }: LayoutConfig) => {
    if (leftContent)    setLeftContent(leftContent);
    setProgressData(progressData ?? null);
    setShowProgress(showProgress ?? false);
    setHideBackButton(hideBackButton ?? false);
    setOnBack(onBack ? () => onBack : undefined);
  }, []);

  const progressPercentage = progressData
    ? (progressData.currentStep / progressData.totalSteps) * 100
    : 0;

  return (
    <LayoutContext.Provider value={{ configure }}>
      <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">

        {/* ── Mobile Header ── */}
        <div className="lg:hidden relative w-full h-40 flex-shrink-0 overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60">
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#030005]/65" />
          <div className="relative z-10 flex flex-col justify-end px-6 pb-5 h-full text-white">
            <h1 className="text-2xl font-bold leading-tight">{leftContent.title}</h1>
            {showProgress && progressData && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 bg-white/20 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>
                <p className="text-xs text-white/80 whitespace-nowrap font-medium">
                  {progressData.currentStep}/{progressData.totalSteps}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Left Panel — fixed, centered, NO scroll ── */}
        <div className="hidden lg:flex lg:w-2/5 h-full relative overflow-hidden flex-shrink-0">
          <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60">
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#030005]/65" />
          <div className="relative z-10 flex flex-col justify-center px-16 py-16 text-white w-full gap-8">
            <div>
              <h1 className="text-5xl font-bold mb-4 leading-tight transition-all duration-300">
                {leftContent.title}
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed max-w-md transition-all duration-300">
                {leftContent.description}
              </p>
              {leftContent.stats && (
                <div className="flex gap-6 w-full mt-12">
                  {leftContent.stats.map((stat, i) => (
                    <div key={i} className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-xs text-white/70 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showProgress && progressData && (
              <div className="max-w-md">
                <div className="flex items-center justify-between gap-6 mb-3">
                  <div className="flex-1 bg-white/20 h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <p className="text-white font-semibold text-base whitespace-nowrap">
                    Step {progressData.currentStep} of {progressData.totalSteps}
                  </p>
                </div>
                <p className="text-gray-400 text-sm">Next: {progressData.nextStep}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel — only this scrolls ── */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-y-auto">
          {!hideBackButton && (
            <div className="px-4 sm:px-8 pt-4 sm:pt-8 flex-shrink-0">
              <BackButton onClick={onBack} />
            </div>
          )}
          <div className="flex-1 flex justify-center py-2 px-4 sm:px-8">
            <div className="w-full max-w-2xl lg:max-w-full lg:px-20 py-2">
              {children}
            </div>
          </div>
        </div>

      </div>
    </LayoutContext.Provider>
  );
}