'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardData, type DashboardResponse } from '@/api/auth/dashboard/route';
import { clearAuthSession } from '@/lib/auth/session';
import AppBottomNav from '@/components/navigation/AppBottomNav';

function toTitleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getField(data: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }
  return '-';
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const response = await getDashboardData();
        if (!cancelled) {
          setData(response);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard.';
        if (!cancelled) {
          const normalizedMessage = message.toLowerCase();
          const isAuthError =
            normalizedMessage.includes('invalid credential') ||
            normalizedMessage.includes('unauthorized') ||
            normalizedMessage.includes('token');

          if (isAuthError) {
            clearAuthSession();
            router.replace('/auth/login');
            return;
          }

          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const userData = useMemo(
    () => (isRecord(data?.user) ? data.user : {}),
    [data]
  );

  const details = useMemo(() => {
    const rootDetails = isRecord(data?.OtherDetail) ? data.OtherDetail : {};
    const userDetails = isRecord(userData.OtherDetail)
      ? (userData.OtherDetail as Record<string, unknown>)
      : {};

    return { ...rootDetails, ...userDetails };
  }, [data, userData]);

  const statusCards = [
    { label: 'Profile Setup', value: getField(details, ['profilesetup']) },
    { label: 'Account Setup', value: getField(details, ['accountsetup']) },
    { label: 'Skip Checklist', value: getField(details, ['skipaccount']) },
  ];

  const weeklyTargetCards = [
    { label: 'Workout / Week', value: getField(details, ['target_workout_week']) },
    {
      label: 'Supplement / Week',
      value: getField(details, ['target_supplement_week']),
    },
    { label: 'Cardio / Week', value: getField(details, ['target_cardio_week']) },
    {
      label: 'Conditioning / Week',
      value: getField(details, ['target_conditioning_week']),
    },
  ];

  const profileCards = [
    { label: 'Current Weight', value: getField(details, ['currentWeight', 'current_weight']) },
    { label: 'Goal Weight', value: getField(details, ['goalWeight', 'goal_weight']) },
    { label: 'Body Fat %', value: getField(details, ['bodyfat', 'body_fat']) },
    { label: 'Daily Steps', value: getField(details, ['avarage_daily_steps', 'average_daily_steps']) },
    { label: 'Cardio Goal', value: getField(details, ['calories_goal']) },
    { label: 'Weekly Reset', value: getField(details, ['weekly_reset']) },
  ];

  const visibleDetailEntries = Object.entries(details).filter(
    ([key]) =>
      ![
        'target_workout_week',
        'target_supplement_week',
        'target_cardio_week',
        'target_conditioning_week',
        'profilesetup',
        'accountsetup',
        'skipaccount',
        'currentWeight',
        'current_weight',
        'goalWeight',
        'goal_weight',
        'bodyfat',
        'body_fat',
        'avarage_daily_steps',
        'average_daily_steps',
        'calories_goal',
        'weekly_reset',
      ].includes(key)
  );

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-[#6202AC]" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Values below are loaded from the same <code>/dashboard</code> API used in your mobile app.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard label="Name" value={getField(userData, ['name'])} />
            <InfoCard label="Username" value={getField(userData, ['username'])} />
            <InfoCard label="Email" value={getField(userData, ['email', 'email_id'])} />
            <InfoCard label="Role" value={getField(userData, ['role', 'role_id'])} />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Account Status</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {statusCards.map((item) => (
              <InfoCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Targets</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {weeklyTargetCards.map((item) => (
              <InfoCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Profile Metrics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profileCards.map((item) => (
              <InfoCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </section>

        {visibleDetailEntries.length > 0 && (
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Other Detail</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDetailEntries.map(([key, value]) => (
                <InfoCard key={key} label={toTitleCase(key)} value={String(value)} />
              ))}
            </div>
          </section>
        )}
      </div>
      <AppBottomNav />
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-gray-900">{value || '-'}</p>
    </div>
  );
}
