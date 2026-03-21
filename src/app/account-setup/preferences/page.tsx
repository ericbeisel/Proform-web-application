"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  CalendarDays,
  MapPin,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import SplitLayout from "@/components/account-setup/SplitLayout";
import {
  submitAccountSetup,
  fetchTimezones,
  fetchCountries,
  fetchStates,
  fetchCities,
  type TimezoneOption,
  type CountryOption,
  type StateOption,
  type CityOption,
} from "@/api/account-setup/route";
import { removeMemberChecklist } from "@/api/auth/remove-member-checklist/route";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const DAY_KEYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
type DayKey = (typeof DAY_KEYS)[number];

function SelectField({
  label,
  icon,
  value,
  onChange,
  children,
  required,
  disabled,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] text-gray-700 appearance-none cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder ?? "Select..."}</option>
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown size={15} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  const router = useRouter();

  const [timezones, setTimezones] = useState<TimezoneOption[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);

  const [loadingTimezones, setLoadingTimezones] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    timeZoneId: "",
    weeklyResetDay: "Monday" as DayKey,
    countryId: "",
    stateId: "",
    cityId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid =
    formData.timeZoneId && formData.countryId && formData.cityId;

  useEffect(() => {
    fetchTimezones()
      .then(setTimezones)
      .catch(() => setTimezones([]))
      .finally(() => setLoadingTimezones(false));

    fetchCountries()
      .then(setCountries)
      .catch(() => setCountries([]))
      .finally(() => setLoadingCountries(false));
  }, []);

  useEffect(() => {
    if (!formData.countryId) {
      setStates([]);
      setCities([]);
      return;
    }
    setFormData((prev) => ({ ...prev, stateId: "", cityId: "" }));
    setStates([]);
    setCities([]);
    setLoadingStates(true);
    fetchStates(formData.countryId)
      .then(setStates)
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, [formData.countryId]);

  useEffect(() => {
    if (!formData.stateId) {
      setCities([]);
      return;
    }
    setFormData((prev) => ({ ...prev, cityId: "" }));
    setCities([]);
    setLoadingCities(true);
    fetchCities(formData.stateId)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [formData.stateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const saved = JSON.parse(sessionStorage.getItem("accountSetup") || "{}");

      console.log("[PreferencesPage] sessionStorage data:", saved);

      await submitAccountSetup({
        // Step 1
        gender: saved.gender || "",
        birthday: saved.birthday || "",
        activityLevel: saved.activityLevel || "",
        unitPreference: saved.unitPreference || "metric",
        // Step 2
        primaryGoal: saved.primaryGoal || "",
        trainingGoals: saved.trainingGoals || [],
        preferredActivities: saved.preferredActivities || [],
        // Step 3
        currentWeight: saved.currentWeight || "",
        goalWeight: saved.goalWeight || "",
        heightFeet: saved.heightFeet || "",
        heightInches: saved.heightInches || "",
        bodyFatPercentage: saved.bodyFatPercentage || "",
        // Step 4
        dailySteps: saved.dailySteps || "",
        cardioCalorieGoal: saved.cardioCalorieGoal || "",
        // Step 6 — arrays of the correct length built by yourSchedule.tsx
        workoutDays: saved.workoutDays || [],
        supplementalDays: saved.supplementalDays || [],
        cardioDays: saved.cardioDays || [],
        conditioningDays: saved.conditioningDays || [],
        // Step 7
        selected1RMMethod: saved.selected1RMMethod || null,
        // Step 8
        benchPress: saved.benchPress || "",
        squat: saved.squat || "",
        deadlift: saved.deadlift || "",
        powerClean: saved.powerClean || "",
        autoCalculateFuture: saved.autoCalculateFuture || false,
        // Step 9
        timeZoneId: String(parseInt(formData.timeZoneId, 10)),
        weeklyResetDay: formData.weeklyResetDay,
        countryId: formData.countryId,
        stateId: formData.stateId,
        cityId: formData.cityId,
      });

      // Don't remove sessionStorage yet
      // Don't call removeMemberChecklist yet

      // Redirect to the new member checklist page with a query param to show success
      router.push("/account-setup/newMember?setup=completed");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SplitLayout
        leftContent={{
          title: "Preferences",
          description:
            "Set your time and location to keep your plan aligned with your routine.",
        }}
        showProgress={true}
        progressData={{ currentStep: 9, totalSteps: 9, nextStep: "Complete" }}
      />

      <div className="w-full">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">
            Configure your Schedule and Time
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Choose your time zone, weekly reset day, and location.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Time Zone */}
          <SelectField
            label="Time Zone*"
            icon={<Globe size={15} className="text-[#6202AC]" />}
            value={formData.timeZoneId}
            onChange={(v) => {
              const id = String(parseInt(v, 10));
              console.log("[Preferences] timezone selected id:", id);
              setFormData((prev) => ({ ...prev, timeZoneId: id }));
            }}
            required
            disabled={loadingTimezones}
            placeholder={
              loadingTimezones ? "Loading timezones..." : "Select timezone"
            }
          >
            {timezones.map((tz) => (
              <option key={tz.id} value={String(tz.id)}>
                {tz.name}
              </option>
            ))}
          </SelectField>

          {/* Weekly Reset Day */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
              <CalendarDays size={15} className="text-[#6202AC]" />
              Weekly Reset Day*
            </label>
            <div className="bg-[#F3EFFF] rounded-2xl p-4 mb-4 border border-purple-100">
              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                Resets your daily metrics each week at{" "}
                <span className="font-semibold">11:59 pm</span> on the selected
                day.
              </p>
              <p className="text-xs text-gray-500">
                Calories reset at 11:59 pm the night before your start date.
              </p>
            </div>
            <div className="flex gap-1.5 mb-3">
              {["Monday", "Sunday"].map((day, index) => {
                const dayKey = day as "Monday" | "Sunday";
                const displayChar = day === "Monday" ? "M" : "S";
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        weeklyResetDay: dayKey,
                      }))
                    }
                    className={`flex-1 py-3 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150
                      ${formData.weeklyResetDay === dayKey ? "bg-[#6202AC] text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {displayChar}
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-medium text-[#6202AC]">
              📅 Weekly reset: Every {formData.weeklyResetDay}
            </p>
          </div>

          {/* Location */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPin size={15} className="text-[#6202AC]" />
              Location
            </label>

            <SelectField
              label="Country*"
              icon={<span />}
              value={formData.countryId}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, countryId: v }))
              }
              required
              disabled={loadingCountries}
              placeholder={
                loadingCountries ? "Loading countries..." : "Select country"
              }
            >
              {countries.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="State"
              icon={<span />}
              value={formData.stateId}
              onChange={(v) => setFormData((prev) => ({ ...prev, stateId: v }))}
              disabled={!formData.countryId || loadingStates}
              placeholder={
                !formData.countryId
                  ? "Select country first"
                  : loadingStates
                    ? "Loading states..."
                    : "Select state"
              }
            >
              {states.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="City*"
              icon={<span />}
              value={formData.cityId}
              onChange={(v) => setFormData((prev) => ({ ...prev, cityId: v }))}
              required
              disabled={!formData.stateId || loadingCities}
              placeholder={
                !formData.stateId
                  ? "Select state first"
                  : loadingCities
                    ? "Loading cities..."
                    : "Select city"
              }
            >
              {cities.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4">
            <p className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold">🌍 Why we ask:</span> Your
              location helps us show local gym events and connect you with
              nearby fitness communities.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 font-medium">⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full font-semibold text-base py-4 rounded-full transition-all duration-200 mt-6 flex items-center justify-center gap-2
              ${
                isFormValid && !isSubmitting
                  ? "bg-[#6202AC] hover:bg-[#50018C] text-white shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Completing Setup...
              </>
            ) : (
              "Complete Setup"
            )}
          </button>
        </form>
      </div>
    </>
  );
}
