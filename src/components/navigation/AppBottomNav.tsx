'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Dumbbell, Home, User, Users } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/itinerary/itinerary-page', label: 'Itinerary', icon: Calendar },
  { href: '/itinerary/all-activity', label: 'Workout', icon: Dumbbell },
  { href: '/team/teams', label: 'Teams', icon: Users },
  { href: '/account', label: 'Account', icon: User },
];

function isItemActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = isItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[64px] flex-col items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition ${
                active ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon size={18} />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
