// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { dashboardApi, DashboardSummary } from "@/api/dashboard/route"
import { getAuthToken } from "@/lib/auth/session"
import { useRouter } from "next/navigation"

import DashboardHeader from "./components/DashboardHeader"
import Banner from "./components/Banner"
import ItineraryCard from "./components/ItineraryCard"
import ForYouCard from "./components/ForYouCard"
import AccountabilityTools from "./components/AccountabilityTools"
import StandardsCard from "./components/StandardsCard"
import LiveSessionsCard from "./components/LiveSessionsCard"
import DailyTodoCard from "./components/DailyTodoCard"
import ChallengesCard from "./components/ChallengesCard"
import WeeklyTargets from "./components/WeeklyTargets"
import QuickActions from "./components/QuickActions"

export default function DashboardPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState("Home")
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Guard: if no token exists yet, redirect immediately instead of
      // firing requests that will all fail with "invalid credentials"
      const token = getAuthToken()
      if (!token) {
        router.replace("/login")
        return
      }

      try {
        setLoading(true)

        // Single call — getDashboardSummary now includes accountSetupComplete
        // so we don't need a separate getDashboardData() call anymore
        const summary = await dashboardApi.getDashboardSummary()
        setDashboardData(summary)
        setError(null)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load dashboard data"
        console.error("❌ Dashboard error:", message)

        // Auth errors → redirect to login rather than showing a dead error screen
        const isAuthError =
          message.toLowerCase().includes("credential") ||
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("no auth token")

        if (isAuthError) {
          router.replace("/login")
          return
        }

        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void fetchDashboardData()
  }, [router])

  const handleCompleteSetup = () => {
    router.push("/account-setup/newMember")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0eff4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0eff4] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0eff4] text-[#1a1825] antialiased">
      <DashboardHeader
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        userName={dashboardData?.userName}
      />

      <main className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

        {/* Account Setup Reminder Banner — now driven by summary.accountSetupComplete */}
        {dashboardData && !dashboardData.accountSetupComplete && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-3 sm:p-4 shadow-lg animate-warning-bounce">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                <div className="bg-white/20 rounded-full p-2 sm:p-2.5 animate-pulse">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-sm sm:text-base">
                    Complete Your Account Setup
                  </h3>
                  <p className="text-amber-100 text-[11px] sm:text-xs leading-relaxed">
                    Finish setting up your account to unlock personalized features and track your progress
                  </p>
                </div>
              </div>

              <button
                onClick={handleCompleteSetup}
                className="
                  sm:ml-auto
                  bg-white text-amber-600 hover:bg-amber-50
                  font-semibold px-4 py-2 rounded-lg
                  transition-all duration-200
                  flex items-center gap-2 shadow-md
                  text-xs sm:text-sm
                "
              >
                Complete Setup
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

            </div>
          </div>
        )}

        <Banner />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[280px_1fr_280px] gap-5">

          <ItineraryCard />

          <div className="space-y-5">
            <ForYouCard
              currentWeight={dashboardData?.currentWeight}
              goalWeight={dashboardData?.goalWeight}
              measurementUnit={dashboardData?.measurementUnit}
              trainingGoals={dashboardData?.trainingGoals}
            />
            <AccountabilityTools />
            <StandardsCard />
          </div>

          <div className="space-y-5">
            <LiveSessionsCard />
            <DailyTodoCard />
            <ChallengesCard />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <WeeklyTargets targets={dashboardData?.weeklyTargets} />
          <QuickActions />
        </div>

      </main>
    </div>
  )
}