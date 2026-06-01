"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { getAuthToken } from "@/lib/auth/session";

export default function CoachOnBoardingPage() {
  const router = useRouter();

  function handleSignInClick() {
    if (getAuthToken()) {
      router.push("/coach/coach-dashboard");
    } else {
      router.push("/auth/login");
    }
  }

  const features = [
    "Save time on programming that you could spend coaching",
    "Increase participation within your teams",
    "Make training fun and exciting for your players",
  ];

  const included = [
    "Initial facility and coaching consultation",
    "Software installation and team onboarding",
    "Free coaching seminar and workout demo with team",
  ];

  const advisoryBoard = [
    {
      name: "Tom Condon",
      role: "CAA President (Football Division), IMG Academy",
      year: "Board Member since 2022",
      image: "/0x0.webp",
    },
    {
      name: "Sojung Park",
      role: "PhD, Associate Professor (Washington University in St. Louis)",
      year: "Board Member since 2021",
      image: "/Sojung-Park.jpg",
    },
    {
      name: "Dr. Pat Ivey",
      role: "CSCCa President, University of Louisville Associate AD/Director of Performance",
      year: "Board Member since 2023",
      image: "/1524244034305.jpeg",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/proformapp logo blue_edited_edited.png"
              alt="ProformApp"
              width={160}
              height={40}
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSignInClick}
              className="px-4 py-2 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
            >
              Sign in
            </button>

            <Link
              href="/coach/team-signup"
              className="px-5 py-2 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition"
            >
              Get Started
            </Link>
            <Link 
            href="/coach/coach-dashboard"
            className="px-5 py-2 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition"
            >coach dashboard (will remove later)</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#2563eb] mb-6">
              Coach On Boarding
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              The GREATEST coaching assistant ever created just got BETTER!
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Get your teams set up in just a few minutes so you can start
              building your teams, managing workouts, tracking athletes, and
              creating an elite training experience.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="px-7 py-4 rounded-2xl bg-[#2563eb] text-white font-bold shadow-lg shadow-blue-200 hover:bg-[#1d4ed8] transition">
                Book a Demo
              </button>

              <button className="px-7 py-4 rounded-2xl border border-gray-200 bg-white font-semibold hover:border-[#2563eb] hover:text-[#2563eb] transition">
                View Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <CheckCircle
                  size={28}
                  className="text-green-500 flex-shrink-0 mt-0.5"
                />

                <p className="text-lg font-medium text-gray-800">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMAGE GRID */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "/th (7).jpeg",
              "/3c677efd858b1d6d7203a9e4ef9bc839_edited.png",
              "/Untitled (6).png",
              "/chaminade 2.jpeg",
            ].map((img) => (
              <div
                key={img}
                className="relative h-56 rounded-3xl overflow-hidden"
              >
                <Image
                  src={img}
                  alt="sports"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black">
              It's not just for pro athletes!
            </h2>

            <p className="mt-4 text-gray-600 text-lg">
              Tried and tested by some of the top strength coaches in the
              industry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                image: "/pat ivey.jpeg",
                name: "Dr. Pat Ivey",
                role: "Louisville Associate AD - Mizzou Performance Director, 2011-2015",
                title: "Backed by Science",
              },
              {
                image: "/AndrewPaul.jpg",
                name: "Andrew Paul",
                role: "Senior Athletic Performance Head Coach, OKC Thunder",
                title: "Powered by Results",
              },
              {
                image: "/Screen Shot 2022-04-23 at 10.57_edited.jpg",
                name: "Ryan Sorensen",
                role: "Ryan Sorensen Inc., Personal Trainer",
                title: "Made for All Sports",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-sm"
              >
                <div className="relative h-72">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black">{item.title}</h3>

                  <p className="mt-4 font-bold">{item.name}</p>

                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDED */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black">What's included?</h2>

            <p className="mt-4 text-lg text-gray-600">
              Everything you need to get your organization running efficiently.
            </p>
          </div>

          <div className="grid gap-5">
            {included.map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#fafafa] p-5"
              >
                <Image
                  src="/trophy_generated_edited.jpg"
                  alt="trophy"
                  width={52}
                  height={52}
                  className="rounded-xl object-cover"
                />

                <p className="font-semibold text-gray-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPATIBILITY */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black">
              Compatible with modern solutions.
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              Over 100 data-points tracked every session.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                image: "/stat sport bra_edited.png",
                title: "GPS Tracker",
              },
              {
                image: "/force plate.jpeg",
                title: "Force Plates",
              },
              {
                image: "/gym aware.png",
                title: "Bar-Speed Tracking",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-sm"
              >
                <div className="relative h-64">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-5 text-center">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD IMAGES */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {[
            {
              image: "/Screenshot 2023-02-14 at 10.39.40 PM.png",
              text: "Pertinent weight room display and over 30 different views.",
            },
            {
              image: "/Screenshot 2023-02-14 at 10.40.41 PM.png",
              text: "Advanced player metrics and tracking for instant training feedback",
            },
            {
              image: "/Screenshot 2023-02-14 at 10.41.35 PM.png",
              text: "Weekly reports and team leaderboard to see the progress and results",
            },
          ].map((item) => (
            <div
              key={item.image}
              className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm"
            >
              <div className="relative h-[420px]">
                <Image
                  src={item.image}
                  alt="dashboard"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6 bg-white">
                <p className="text-lg font-semibold">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADVISORY BOARD */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black">
              Meet our World-Class Advisory Board
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {advisoryBoard.map((member) => (
              <div
                key={member.name}
                className="rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-sm"
              >
                <div className="relative h-72">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-black">{member.name}</h3>

                  <p className="mt-4 text-gray-700 leading-relaxed">
                    {member.role}
                  </p>

                  <p className="mt-4 text-sm font-semibold text-[#2563eb]">
                    {member.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] p-10 text-white overflow-hidden relative">
            <div className="grid lg:grid-cols-[260px_1fr] gap-10 items-center">
              <div className="relative h-64 w-64 rounded-3xl overflow-hidden mx-auto lg:mx-0">
                <Image
                  src="/eric editted.png"
                  alt="Eric Beisel"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h2 className="text-4xl font-black">Built by the PRO's</h2>

                <h3 className="mt-6 text-2xl font-bold">Eric Beisel</h3>

                <p className="mt-4 text-blue-100 text-lg leading-relaxed">
                  Has spent the last DECADE working with the top coaches and
                  players in the industry to build an advanced tracking and
                  management tool that can be utilized by all sports and
                  athletes.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/auth/login"
                    className="px-6 py-3 rounded-2xl bg-white text-[#2563eb] font-bold hover:bg-gray-100 transition"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/auth/signup"
                    className="px-6 py-3 rounded-2xl border border-white/30 text-white font-bold hover:bg-white/10 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}