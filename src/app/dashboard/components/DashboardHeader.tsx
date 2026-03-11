"use client"

import { BarChart2, User, LogOut, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { clearAuthSession } from "@/lib/auth/session"
import Link from "next/link"
import { useState } from "react"

type Props = {
  activeNav: string
  setActiveNav: (value: string) => void
  userName?: string
}

export default function DashboardHeader({ activeNav, setActiveNav, userName }: Props) {

  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    clearAuthSession()
    router.replace("/auth/login")
  }

  const navItems = ["Home", "Teams", "Search Workouts", "Programs"]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e8e6f0]">

      <div className="h-16 flex items-center px-4 sm:px-6 lg:px-8 gap-4">

        {/* Logo */}
        <span className="font-black text-lg sm:text-xl whitespace-nowrap">
          My Dashboard
        </span>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-1 bg-[#f7f6fb] rounded-[10px] p-1">
          {navItems.map(item => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`
                px-3 lg:px-4 py-1.5 text-[12px] lg:text-[13px] font-medium rounded-[7px]
                transition-all duration-150
                ${activeNav === item
                  ? "bg-white text-[#1a1825] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                  : "text-[#8b879e] hover:text-[#6c5ce7]"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">

          {/* Analytics */}
          <button className="hidden sm:flex w-9 h-9 rounded-[10px] border border-[#e8e6f0] bg-white items-center justify-center text-[#8b879e] hover:border-[#a29bfe] hover:text-[#6c5ce7] transition-all">
            <BarChart2 size={18} />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1 px-3 h-9 rounded-[10px] border border-[#e8e6f0] text-[#8b879e] hover:border-red-300 hover:text-red-500 transition-all text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>

          {/* Avatar */}
          <Link href="/account">
            <div
              title="Go to Account"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fd7b4d] to-[#fdcb6e] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform active:scale-95"
            >
              {userName ? userName.charAt(0).toUpperCase() : <User size={18} />}
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e8e6f0] bg-white px-4 py-3 space-y-2">

          {navItems.map(item => (
            <button
              key={item}
              onClick={() => {
                setActiveNav(item)
                setMobileMenuOpen(false)
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm
                ${activeNav === item
                  ? "bg-purple-50 text-[#6c5ce7]"
                  : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              {item}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>
      )}

    </header>
  )
}