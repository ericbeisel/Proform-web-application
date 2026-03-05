'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronDown, Clock3, Crosshair, Info, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DAYS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

type DayGridProps = {
  selected: string[];
  onChange: (days: string[]) => void;
};

function DayGrid({ selected, onChange }: DayGridProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const active = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() =>
                onChange(active ? selected.filter((d) => d !== day) : [...selected, day])
              }
              className={`h-10 min-w-[52px] rounded-xl border text-sm font-semibold transition ${
                active
                  ? 'border-[#5f0ec4] bg-[#5f0ec4] text-white shadow'
                  : 'border-[#d4d9e0] bg-[#f5f7fa] text-[#5f6b7a]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-center text-xs font-semibold text-[#7d7f86]">
        {DAYS.map((day) => (
          <div key={day} className="min-w-[52px]">
            {selected.includes(day) ? '+2' : ''}
          </div>
        ))}
      </div>
    </>
  );
}

function ScheduleBlock({
  title,
  subtitle,
  hint,
  timeLabel,
  selected,
  onChange,
}: {
  title: string;
  subtitle: string;
  hint: string;
  timeLabel: string;
  selected: string[];
  onChange: (days: string[]) => void;
}) {
  return (
    <div>
      <h4 className="text-xl font-semibold text-[#1b1e24]">{title}</h4>
      <p className="mt-1 text-[14px] text-[#707986]">{subtitle}</p>
      <p className="mt-1 text-[14px] font-semibold text-[#6b17c6]">{hint}</p>
      <p className="mt-3 flex items-center gap-2 text-[17px] font-semibold text-[#20242b]">
        <Clock3 size={14} className="text-[#778090]" />
        {timeLabel}
      </p>
      <div className="mt-3">
        <DayGrid selected={selected} onChange={onChange} />
      </div>
      <button className="mt-2 text-[14px] font-semibold text-[#5f0ec4] underline">Edit Times</button>
    </div>
  );
}

export default function PreferencesPage() {
  const router = useRouter();

  const [workoutDays, setWorkoutDays] = useState(['M', 'W', 'Th', 'F']);
  const [cardioDays, setCardioDays] = useState(['T', 'Sa']);
  const [supplementalDays, setSupplementalDays] = useState(['W', 'Su']);
  const [conditioningDays, setConditioningDays] = useState(['M', 'Th']);
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [showWeeklyTargetModal, setShowWeeklyTargetModal] = useState(false);
  const [weeklyTargets, setWeeklyTargets] = useState({
    resistance: '4',
    cardio: '4',
    supplemental: '4',
    conditioning: '3',
  });

  return (
    <main className="min-h-screen bg-[#f4f6f9] p-6 md:p-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex items-center gap-4 border-b border-[#d4d9e0] px-8 py-6 md:px-10">
          <button
            type="button"
            onClick={() => router.push('/account')}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eceff3] text-[#1e2024]"
            aria-label="Back to account"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[52px] font-bold leading-none text-[#171a20] md:text-[48px]">My Preferences</h1>
        </header>

        <div className="space-y-5 px-8 py-6 md:px-10 md:py-8">
          <section className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
              <h2 className="text-[34px] font-bold text-[#171a20] md:text-[30px]">Weekly Targets:</h2>
              <p className="mt-2 text-[14px] text-[#737d8a]">
                Select an amount of each type when you open your app regularly
              </p>

              <div className="mt-5 space-y-3">
                {[
                  ['A. Resistance Workout', weeklyTargets.resistance],
                  ['B. Cardio Workout', weeklyTargets.cardio],
                  ['C. Supplemental Workout', weeklyTargets.supplemental],
                  ['D. Conditioning Workout', weeklyTargets.conditioning],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-[#e1e5eb] bg-[#f5f7fa] px-5 py-4"
                  >
                    <span className="text-[28px] font-medium text-[#1d2026] md:text-[24px]">{label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[34px] font-bold text-[#5f0ec4] md:text-[30px]">{value}</span>
                      <button
                        type="button"
                        onClick={() => setShowWeeklyTargetModal(true)}
                        className="rounded-full p-1 text-[#7f8794] hover:bg-[#eceff4]"
                        aria-label="Edit weekly targets"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[34px] font-bold text-[#171a20] md:text-[30px]">Edit Cardio Goal:</h3>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eadcff] text-[#6b17c6]">
                    <Pencil size={14} />
                  </div>
                </div>
                <p className="mt-2 text-[14px] text-[#737d8a]">
                  Set the calories you would like to burn when your weekly goal
                </p>
                <input
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Calories"
                  className="mt-4 h-12 w-full rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[18px] outline-none"
                />
                <div className="mt-3 rounded-xl border border-[#bfe4fa] bg-[#eaf6ff] px-4 py-3 text-[16px]">
                  <span className="font-semibold text-[#01a1e8]">*e.g.:</span> Suggest 150 Total will equal on avg 750 for Goals
                </div>
              </div>

              <div className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
                <h3 className="text-[34px] font-bold text-[#171a20] md:text-[30px]">Avg. Daily Steps</h3>
                <p className="mt-2 text-[14px] text-[#737d8a]">
                  Set a daily step goal for most accurate cardio goal
                </p>
                <input
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="Steps"
                  className="mt-4 h-12 w-full rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[18px] outline-none"
                />
                <div className="mt-3 rounded-xl border border-[#f1c8c1] bg-[#fff2f0] px-4 py-3 text-[16px]">
                  <span className="font-semibold text-[#ff5328]">*Must enter</span> at least 3,000 Steps make walk-miles on top 10,000
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
            <h2 className="text-[40px] font-bold text-[#171a20] md:text-[36px]">Set Training Days:</h2>
            <div className="mt-5 grid gap-8 xl:grid-cols-2">
              <ScheduleBlock
                title="Preferred Workout Days:"
                subtitle="Select all days of the week you usually train on (can select more than one)"
                hint="*For Suggested: 5-6 Primary Workouts per week"
                timeLabel="Selected Time 3:30 pm"
                selected={workoutDays}
                onChange={setWorkoutDays}
              />
              <ScheduleBlock
                title="Default Cardio Days:"
                subtitle="Choose which days you like to use your cardio workouts"
                hint="*For Suggested: 3-5 Cardio workouts per week"
                timeLabel="Default Time 4:30 pm"
                selected={cardioDays}
                onChange={setCardioDays}
              />
              <ScheduleBlock
                title="Preferred Supplemental Days:"
                subtitle="Choose which days you like to use your supplemental workout days, based on your weekly target"
                hint="*For Suggested: 2-4 Supplemental workouts, based on your weekly target"
                timeLabel="Default Time 1:30 pm"
                selected={supplementalDays}
                onChange={setSupplementalDays}
              />
              <ScheduleBlock
                title="Preferred Conditioning Days:"
                subtitle="Choose which days you like to use your conditioning workout days, based on your weekly target"
                hint="*For Suggested: 2-3 Supplemental workouts (less cardio must...)"
                timeLabel="Default Time 4:30 pm"
                selected={conditioningDays}
                onChange={setConditioningDays}
              />
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
              <h3 className="text-[34px] font-bold text-[#171a20] md:text-[30px]">Measurement Units:</h3>
              <p className="mt-2 text-[14px] text-[#737d8a]">
                Choose the weight units you&apos;d like for your workouts, overall settings and weekly targets
              </p>
              <button className="mt-5 flex h-12 w-full items-center justify-between rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[18px] text-[#677282]">
                <span>Select unit</span>
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="rounded-3xl border border-[#cfd5dd] bg-[#f8fafc] p-6">
              <div className="flex items-center gap-2">
                <h3 className="text-[34px] font-bold text-[#171a20] md:text-[30px]">Account Visibility</h3>
                <Info size={14} className="text-[#1fb6ff]" />
              </div>
              <button className="mt-5 flex h-12 w-full items-center justify-center rounded-xl border border-[#d1d7df] bg-[#f8fafc] px-4 text-[17px] text-[#30343c]">
                Your profile group email value
              </button>
            </div>

            <div className="rounded-3xl border border-[#efc6c1] bg-[#f8fafc] p-6">
              <h3 className="text-[34px] font-bold text-[#171a20] md:text-[30px]">Account Deletion</h3>
              <p className="mt-2 text-[14px] text-[#737d8a]">
                Permanently delete your account and remove all data
              </p>
              <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ef4444] text-[20px] font-semibold text-white shadow hover:bg-[#dc2626]">
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>

      {showWeeklyTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-[820px] rounded-[32px] bg-white px-8 pb-8 pt-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:px-12">
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#6b17c6] text-white shadow-[0_14px_22px_rgba(0,0,0,0.22)]">
                <Crosshair size={40} />
              </div>
            </div>

            <h3 className="mt-6 text-center text-[56px] font-bold leading-none text-[#677084] md:text-[52px]">
              Set Weekly Targets
            </h3>
            <div className="mx-auto mt-4 h-[3px] w-full max-w-[650px] bg-[#6b17c6]" />
            <p className="mt-5 text-center text-[35px] text-[#6f7888] md:text-[30px]">
              Set weekly targets to stay on track to meet your goals
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-[30px] font-semibold text-[#5f0ec4] md:text-[26px]">Primary Workouts *</span>
                <input
                  value={weeklyTargets.resistance}
                  onChange={(e) =>
                    setWeeklyTargets((prev) => ({ ...prev, resistance: e.target.value.replace(/[^\d]/g, '') }))
                  }
                  className="mt-2 h-14 w-full rounded-xl border border-[#d1d7df] px-4 text-[30px] outline-none md:text-[26px]"
                />
              </label>
              <label className="block">
                <span className="text-[30px] font-semibold text-[#5f0ec4] md:text-[26px]">Cardio Workouts *</span>
                <input
                  value={weeklyTargets.cardio}
                  onChange={(e) =>
                    setWeeklyTargets((prev) => ({ ...prev, cardio: e.target.value.replace(/[^\d]/g, '') }))
                  }
                  className="mt-2 h-14 w-full rounded-xl border border-[#d1d7df] px-4 text-[30px] outline-none md:text-[26px]"
                />
              </label>
              <label className="block">
                <span className="text-[30px] font-semibold text-[#5f0ec4] md:text-[26px]">Supplemental Workouts *</span>
                <input
                  value={weeklyTargets.supplemental}
                  onChange={(e) =>
                    setWeeklyTargets((prev) => ({ ...prev, supplemental: e.target.value.replace(/[^\d]/g, '') }))
                  }
                  className="mt-2 h-14 w-full rounded-xl border border-[#d1d7df] px-4 text-[30px] outline-none md:text-[26px]"
                />
              </label>
              <label className="block">
                <span className="text-[30px] font-semibold text-[#5f0ec4] md:text-[26px]">Field Workouts *</span>
                <input
                  value={weeklyTargets.conditioning}
                  onChange={(e) =>
                    setWeeklyTargets((prev) => ({ ...prev, conditioning: e.target.value.replace(/[^\d]/g, '') }))
                  }
                  className="mt-2 h-14 w-full rounded-xl border border-[#d1d7df] px-4 text-[30px] outline-none md:text-[26px]"
                />
              </label>
            </div>

            <div className="mt-6 rounded-xl border-l-4 border-[#11b988] bg-[#e8f8f2] px-4 py-4 text-[23px] text-[#14916f] md:text-[20px]">
              *Cardio workouts are set based on your Cardio Schedule/Itinerary. To make changes go to your{' '}
              <a href="/itinerary/schedule" className="font-semibold underline">
                Cardio Schedule
              </a>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowWeeklyTargetModal(false)}
                className="h-14 rounded-full border border-[#d1d7df] px-8 text-[24px] font-semibold text-[#566071] md:text-[20px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowWeeklyTargetModal(false)}
                className="h-14 min-w-[260px] rounded-full bg-[#5f0ec4] px-10 text-[24px] font-semibold text-white shadow-[0_12px_18px_rgba(95,14,196,0.32)] hover:bg-[#500ba6] md:text-[20px]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
