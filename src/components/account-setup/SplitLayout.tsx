'use client';

import { useEffect, ReactNode } from 'react'; // Added ReactNode
import { useLayout } from '@/app/account-setup/layout';

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

interface SplitLayoutProps {
  children?: ReactNode; // 1. Add children to the interface
  leftContent: LeftContent;
  progressData?: ProgressData;
  showProgress?: boolean;
  hideBackButton?: boolean;
  onBack?: () => void;
}

export default function SplitLayout({
  children, // 2. Destructure children here
  leftContent,
  progressData,
  showProgress = false,
  hideBackButton = false,
  onBack,
}: SplitLayoutProps) {
  const { configure } = useLayout();

  useEffect(() => {
    configure({ leftContent, progressData, showProgress, hideBackButton, onBack });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftContent, progressData, showProgress, hideBackButton]); // Added dependencies for safety

  // 3. Return the children instead of null
  return (
    <div className="w-full">
      {children}
    </div>
  );
}