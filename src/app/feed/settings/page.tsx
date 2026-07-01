"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Check, Loader2 } from "lucide-react";
import { feedApi } from "@/api/feed/route";

const ACTIVITY_TYPES = [
  { key: "Workouts",         label: "Workouts",         color: "bg-blue-500",   text: "text-blue-600",   light: "bg-blue-50 border-blue-200" },
  { key: "CardioSessions",   label: "Cardio Sessions",  color: "bg-red-400",    text: "text-red-600",    light: "bg-red-50 border-red-200"   },
  { key: "Recovery",         label: "Recovery",         color: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50 border-purple-200" },
  { key: "Hydration",        label: "Hydration",        color: "bg-teal-500",   text: "text-teal-600",   light: "bg-teal-50 border-teal-200" },
  { key: "Nutrition",        label: "Nutrition",        color: "bg-green-600",  text: "text-green-700",  light: "bg-green-50 border-green-200" },
] as const;

type ActivityKey = typeof ACTIVITY_TYPES[number]["key"];
type NotifValue = "Email" | "Push" | "None";

type Filters = Record<ActivityKey, boolean>;
type NotifPrefs = Record<ActivityKey, NotifValue>;

const LS_FILTERS_KEY = "feedActivityFilters";
const LS_NOTIF_KEY   = "feedNotifPrefs";

const defaultFilters = (): Filters =>
  Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, true])) as Filters;

const defaultNotifs = (): NotifPrefs =>
  Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, "Push" as NotifValue])) as NotifPrefs;

export default function FeedSettingsPage() {
  const router = useRouter();
  const [filters, setFilters]   = useState<Filters>(defaultFilters());
  const [notifs, setNotifs]     = useState<NotifPrefs>(defaultNotifs());
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    // Load from localStorage first for instant render
    try {
      const f = localStorage.getItem(LS_FILTERS_KEY);
      if (f) setFilters(prev => ({ ...prev, ...JSON.parse(f) }));
      const n = localStorage.getItem(LS_NOTIF_KEY);
      if (n) setNotifs(prev => ({ ...prev, ...JSON.parse(n) }));
    } catch {}
    // Then sync from backend (overrides local if available)
    feedApi.getFeedSettings().then(remote => {
      if (!remote) return;
      if (remote.filters) setFilters(prev => ({ ...prev, ...remote.filters }));
      if (remote.notifs) setNotifs(prev => ({ ...prev, ...remote.notifs as Record<string, NotifValue> }));
    }).catch(() => {});
  }, []);

  const toggleFilter = (key: ActivityKey) =>
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const enableAll  = () => setFilters(Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, true]))  as Filters);
  const disableAll = () => setFilters(Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, false])) as Filters);

  const setNotif = (key: ActivityKey, val: NotifValue) =>
    setNotifs(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true);
    localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filters));
    localStorage.setItem(LS_NOTIF_KEY,   JSON.stringify(notifs));
    await feedApi.saveFeedSettings({ filters, notifs });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-[#6c3fef] rounded-xl flex items-center justify-center hover:bg-purple-700 transition"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <Settings size={16} className="text-purple-600" />
        </div>
        <h1 className="font-bold text-[16px] text-gray-900 flex-1">Feed Settings</h1>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-xl mx-auto">

        {/* Section 1 — Activity filters */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-extrabold text-gray-900">Activity Type Filters</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Toggle what appears in your feed</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={enableAll}
                className="text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-xl hover:bg-purple-100 transition"
              >
                Enable All
              </button>
              <button
                onClick={disableAll}
                className="text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                Disable All
              </button>
            </div>
          </div>

          <div className="px-5 pb-5 space-y-2.5">
            {ACTIVITY_TYPES.map(({ key, label, color, text, light }) => {
              const on = filters[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition ${on ? light : "bg-gray-50 border-gray-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${on ? color : "bg-gray-300"}`} />
                    <span className={`text-[14px] font-semibold ${on ? text : "text-gray-400"}`}>{label}</span>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${on ? "bg-[#6c3fef]" : "bg-gray-200"}`}>
                    <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all ${on ? "left-[22px]" : "left-[3px]"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2 — Notification preferences */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <p className="text-[15px] font-extrabold text-gray-900">Notification Preferences</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Per activity type notification channel</p>
          </div>

          <div className="px-5 pb-5 space-y-3">
            {ACTIVITY_TYPES.map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[13px] font-semibold text-gray-700">{label}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {(["Email", "Push", "None"] as NotifValue[]).map(val => (
                    <button
                      key={val}
                      onClick={() => setNotif(key, val)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                        notifs[key] === val
                          ? "bg-[#6c3fef] text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-70 transition"
        >
          {saving ? (
            <><Loader2 size={17} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check size={17} /> Saved!</>
          ) : (
            "Save Settings"
          )}
        </button>

      </div>
    </div>
  );
}
