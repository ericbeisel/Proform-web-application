"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { forgotPassword } from "@/api/auth/forgot-password/route";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      router.push(`/auth/forgot-password/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <button
        onClick={() => router.push("/auth/login")}
        className="w-10 h-10 flex items-center justify-center -ml-2 mb-2 text-black hover:opacity-70 transition"
        aria-label="Back"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="mb-12 px-4">
        <h1 className="text-4xl font-bold text-black mb-3">Forgot Password</h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Enter your registered email address to receive a 6-digit password reset code.
        </p>
      </div>

      {error && (
        <div className="mx-4 mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 px-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
            Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="abcd1234@email.com"
            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
            autoCapitalize="none"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-[#6202AC] hover:bg-[#4e0288] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg mt-8"
        >
          {loading ? "Sending..." : "Send Code"}
        </button>
      </form>
    </div>
  );
}
