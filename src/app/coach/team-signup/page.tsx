"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type FormErrors = Partial<Record<string, string>>;

export default function CoachOnboardingFormPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    contactPreference: "",
    schoolName: "",
    sport: "",
    address: "",
    groupSize: "",
    groupsPerWeek: "",
    emailMarketing: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Your name is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    if (!form.email.trim()) e.email = "Contact email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.contactPreference) e.contactPreference = "Please select a contact preference.";
    if (!form.schoolName.trim()) e.schoolName = "School or institution name is required.";
    if (!form.address.trim()) e.address = "Address is required.";
    if (!form.groupSize) e.groupSize = "Average group size is required.";
    if (!form.groupsPerWeek) e.groupsPerWeek = "Number of groups per week is required.";
    return e;
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // TODO: submit form
  }

  const inputClass = (field: string) =>
    `w-full h-12 rounded-xl border px-4 outline-none focus:border-[#6202AC] transition text-base ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-base sm:text-xl font-bold text-[#111827] truncate">
              Coach Onboarding
            </h1>
          </div>

          <button
            onClick={() => router.push("/auth/login")}
            className="ml-3 flex-shrink-0 px-3 sm:px-4 h-9 sm:h-10 rounded-xl bg-[#6202AC] text-white text-xs sm:text-sm font-semibold hover:bg-[#4d0187] transition"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-10">
        {/* Intro */}
        <div className="mb-5 sm:mb-8">
          <p className="text-xs sm:text-sm font-semibold text-[#6202AC] uppercase tracking-wide mb-1 sm:mb-2">
            You're on the right track!
          </p>

          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">
            PF Teams Form
          </h2>

          <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-lg leading-relaxed">
            Give us as much information about you and your team so that we can
            better assist you. We'll follow up with you shortly after submitting.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} noValidate>
            <div className="p-4 sm:p-8">
              {/* Information */}
              <div className="mb-7 sm:mb-10">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5 sm:mb-2">
                      YOUR NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name here"
                      className={inputClass("name")}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5 sm:mb-2">
                      PHONE NUMBER <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="xxx-xxx-xxxx"
                      className={inputClass("phone")}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5 sm:mb-2">
                      CONTACT EMAIL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="How can we reach you?"
                      className={inputClass("email")}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5 sm:mb-2">
                      CONTACT PREFERENCE <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="contactPreference"
                      value={form.contactPreference}
                      onChange={handleChange}
                      className={`${inputClass("contactPreference")} bg-white`}
                    >
                      <option value="">Choose an option</option>
                      <option>Email</option>
                      <option>Phone</option>
                      <option>Text Message</option>
                    </select>
                    {errors.contactPreference && <p className="mt-1 text-xs text-red-500">{errors.contactPreference}</p>}
                  </div>
                </div>
              </div>

              {/* Team Details */}
              <div className="mb-7 sm:mb-10">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Team Details
                </h3>

                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5 sm:mb-2">
                      School or Institution Name: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="schoolName"
                      value={form.schoolName}
                      onChange={handleChange}
                      placeholder="Required"
                      className={inputClass("schoolName")}
                    />
                    {errors.schoolName && <p className="mt-1 text-xs text-red-500">{errors.schoolName}</p>}
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5 sm:mb-2">
                      Sport (or Sports):
                    </label>
                    <input
                      type="text"
                      name="sport"
                      value={form.sport}
                      onChange={handleChange}
                      placeholder="Separate multiple sports with a comma"
                      className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#6202AC] text-base"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5 sm:mb-2">
                      School/Institution Address: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      className={inputClass("address")}
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                  </div>
                </div>
              </div>

              {/* Other Details */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Other Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5 sm:mb-2">
                      Average size of your groups? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="groupSize"
                      value={form.groupSize}
                      onChange={handleChange}
                      min={1}
                      placeholder="e.g. 15"
                      className={inputClass("groupSize")}
                    />
                    {errors.groupSize && <p className="mt-1 text-xs text-red-500">{errors.groupSize}</p>}
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5 sm:mb-2">
                      Groups coached per week? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="groupsPerWeek"
                      value={form.groupsPerWeek}
                      onChange={handleChange}
                      min={1}
                      placeholder="e.g. 5"
                      className={inputClass("groupsPerWeek")}
                    />
                    {errors.groupsPerWeek && <p className="mt-1 text-xs text-red-500">{errors.groupsPerWeek}</p>}
                  </div>
                </div>
              </div>

              {/* Email Marketing */}
              <div className="flex items-start gap-3 mb-6 sm:mb-8">
                <input
                  type="checkbox"
                  id="emailMarketing"
                  name="emailMarketing"
                  checked={form.emailMarketing}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 flex-shrink-0 text-[#6202AC] border-gray-300 rounded focus:ring-[#6202AC]"
                />
                <label htmlFor="emailMarketing" className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed cursor-pointer">
                  <Image
                    src="/proformapp-logo.png"
                    alt="ProformApp"
                    width={20}
                    height={20}
                    className="object-contain flex-shrink-0 mt-0.5"
                  />
                  Accept email marketing with important product updates and new features.
                </label>
              </div>

              {/* Disclaimer */}
              <div className="bg-[#f8f5ff] border border-[#e5dbff] rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  By clicking{" "}
                  <span className="font-semibold">"Submit Application,"</span>{" "}
                  you confirm that the information you've provided is true, to the
                  best of your knowledge, and that you are interested in receiving
                  a follow up about our Teams software and Pricing.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-[#6202AC] text-white font-semibold hover:bg-[#4d0187] transition text-sm sm:text-base"
                >
                  Submit Application
                </button>

                <button
                  type="button"
                  className="flex-1 h-12 rounded-xl border border-[#6202AC] text-[#6202AC] font-semibold hover:bg-[#f7f2ff] transition text-sm sm:text-base"
                >
                  View Team Prices
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 h-12 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Go Back
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
