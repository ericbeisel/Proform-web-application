'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Calendar,
  ChevronRight,
  CreditCard,
  LayoutGrid,
  LogOut,
  Monitor,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { clearAuthSession } from '@/lib/auth/session';

type MenuItem = {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  href?: string;
  isHighlight?: boolean;
};

type ToolItem = {
  label: string;
  href?: string;
};

const MAIN_MENU: MenuItem[] = [
  { label: 'My Profile', icon: User },
  { label: 'My Dashboard', icon: LayoutGrid, href: '/dashboard' },
  { label: 'My Itinerary', icon: Calendar, href: '/itinerary/itinerary-page' },
  { label: 'My Metrics', icon: Activity, href: '/itinerary/all-activity' },
  { label: 'My Teams', icon: Users, href: '/team/teams' },
  { label: 'My Preferences', icon: Settings, href: '/preferences' },
  { label: 'Payments', icon: CreditCard },
  { label: 'Connect TV', icon: Monitor, isHighlight: true },
];

const TOOLS: ToolItem[] = [
  { label: 'Create Workout' },
  { label: 'Log an Exercise' },
  { label: 'Cardio' },
  { label: 'Macros' },
  { label: 'Hydration' },
  { label: 'Recovery' },
  { label: 'Player Cards', href: '/player-cards' }, // redirect page
  { label: 'Find Courses' },
  { label: 'Join Challenges' },
  { label: 'Weekly Reports' },
  { label: 'Search Programs' },
  { label: 'More Options' },
];

export default function AccountPage() {
  const router = useRouter();

  const accountName = useMemo(() => {
    if (typeof window === 'undefined') return 'Account';
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return 'Account';
      const parsed = JSON.parse(raw) as { name?: string };
      return parsed?.name?.trim() || 'Account';
    } catch {
      return 'Account';
    }
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.replace('/auth/login');
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] p-6 md:p-8">
      <div className="mx-auto max-w-[1400px]">

        {/* Header */}
        <header className="flex items-start border-b border-[#d8dce2] py-7">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6d28d9] text-white shadow-[0_8px_14px_rgba(0,0,0,0.20)]">
              <User size={28} />
            </div>

            <div>
              <h1 className="font-bold text-[#16181b] text-[44px] leading-none">
                {accountName}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-[36px] font-semibold text-[#5b11b9]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4be2a] text-[16px]">
                  🪙
                </span>
                : 25 Pts
              </p>
            </div>
          </div>
        </header>

        {/* Main Menu */}
        <section className="py-8">
          <h2 className="mb-5 text-[32px] font-bold text-[#141517]">
            Main Menu
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {MAIN_MENU.map((item) => {
              const Icon = item.icon;

              const card = (
                <div
                  className={`flex h-[82px] items-center justify-between rounded-[18px] border px-5 ${
                    item.isHighlight
                      ? 'border-[#6a1cd4] bg-gradient-to-r from-[#5f0ec4] to-[#7d34ef] text-white'
                      : 'border-[#d1d5dc] bg-[#f8f9fb] text-[#17191c]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${
                        item.isHighlight ? 'bg-white/15' : 'bg-[#eef0f3]'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={
                          item.isHighlight ? 'text-white' : 'text-[#667085]'
                        }
                      />
                    </div>

                    <span className="text-[26px] font-semibold">
                      {item.label}
                    </span>
                  </div>

                  <ChevronRight
                    size={22}
                    className={
                      item.isHighlight ? 'text-white' : 'text-[#667085]'
                    }
                  />
                </div>
              );

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href}>
                    {card}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  className="cursor-not-allowed opacity-80"
                >
                  {card}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tools Section */}
        <section className="pb-8">
          <h2 className="mb-5 text-[32px] font-bold text-[#141517]">
            Tools
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => {
              const card = (
                <div className="flex items-center h-[54px] rounded-[14px] border border-[#d2d6dc] bg-[#f8f9fb] px-4 text-[20px] font-medium text-[#1e2023] hover:bg-[#f1f3f6]">
                  {tool.label}
                </div>
              );

              if (tool.href) {
                return (
                  <Link key={tool.label} href={tool.href}>
                    {card}
                  </Link>
                );
              }

              return (
                <button key={tool.label} type="button">
                  {card}
                </button>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="grid grid-cols-1 gap-3 border-t border-[#d8dce2] py-6 md:grid-cols-3">

          <button className="h-[56px] rounded-[16px] bg-[#14a9c6] text-[20px] font-semibold text-white hover:bg-[#1298b2]">
            Coach Login
          </button>

          <button className="h-[56px] rounded-[16px] bg-[#5f0ec4] text-[20px] font-semibold text-white hover:bg-[#5009a7]">
            Creator
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 h-[56px] rounded-[16px] border border-[#d2d6dc] bg-[#f8f9fb] text-[20px] font-semibold text-[#667085] hover:bg-[#f1f3f6]"
          >
            <LogOut size={20} />
            Log Out
          </button>

        </footer>
      </div>
    </main>
  );
}