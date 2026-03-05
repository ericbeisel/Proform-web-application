'use client';

import { useEffect } from 'react';
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
  leftContent: LeftContent;
  progressData?: ProgressData;
  showProgress?: boolean;
  hideBackButton?: boolean;
  onBack?: () => void;
}

export default function SplitLayout({
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
  }, []);

  return null;
}