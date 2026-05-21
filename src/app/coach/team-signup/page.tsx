"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CoachOnboardingFormPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              <Image
                src="/proformapp-logo.png"
                alt="ProformApp"
                width={42}
                height={42}
                className="object-contain"
              />
              <h1 className="text-lg sm:text-xl font-bold text-[#111827]">
                Coach Onboarding
              </h1>
            </div>
          </div>

          <button
            onClick={() => router.push("/auth/login")}
            className="px-4 h-10 rounded-xl bg-[#6202AC] text-white text-sm font-semibold hover:bg-[#4d0187] transition"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Intro */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#6202AC] uppercase tracking-wide mb-2">
            You're on the right track!
          </p>

          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            PF Teams Form
          </h2>

          <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl">
            Give us as much information about you and your team so that we can
            better assist you. We'll follow up with you shortly after
            submitting.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Information */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name here"
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="xxx-xxx-xxxx"
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    CONTACT EMAIL
                  </label>
                  <input
                    type="email"
                    placeholder="How can we reach you?"
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    CONTACT PREFERENCE
                  </label>

                  <select className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC] bg-white">
                    <option>Choose an option</option>
                    <option>Email</option>
                    <option>Phone</option>
                    <option>Text Message</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Team Details */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Team Details
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    School or Institution Name:
                  </label>

                  <input
                    type="text"
                    placeholder="Required"
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Sport (or Sports):
                  </label>

                  <input
                    type="text"
                    placeholder="Separate multiple sports with a comma"
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    School/Institution Address:
                  </label>

                  <input
                    type="text"
                    placeholder="Select an Address"
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC]"
                  />
                </div>
              </div>
            </div>

            {/* Other Details */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Other Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    What is the average size of your groups?
                  </label>

                  <input
                    type="number"
                    min={1}
                    placeholder="Enter a number greater than or equal to 1"
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    How many groups do you coach in a week?
                  </label>

                  <input
                    type="number"
                    min={1}
                    placeholder="Enter a number greater than or equal to 1"
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC]"
                  />
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-[#f8f5ff] border border-[#e5dbff] rounded-2xl p-5 mb-8">
              <p className="text-sm text-gray-700 leading-relaxed">
                By clicking{" "}
                <span className="font-semibold">
                  "Submit Application,"
                </span>{" "}
                you confirm that the information you've provided is true, to the
                best of your knowledge, and that you are interested in receiving
                a follow up about our Teams software and Pricing.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 h-12 rounded-xl bg-[#6202AC] text-white font-semibold hover:bg-[#4d0187] transition">
                Submit Application
              </button>

              <button className="flex-1 h-12 rounded-xl border border-[#6202AC] text-[#6202AC] font-semibold hover:bg-[#f7f2ff] transition">
                View Team Prices
              </button>

              <button
                onClick={() => router.back()}
                className="flex-1 h-12 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}