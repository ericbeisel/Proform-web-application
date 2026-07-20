"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { sendOtp, verifyOtp } from "@/api/auth/signup/route";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (!email) {
      router.replace("/auth/signup");
    }
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    setVerifying(true);
    setError("");
    try {
      await verifyOtp(email, code);
      router.push("/auth/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please check the code.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    try {
      await sendOtp(email);
      setResendTimer(30);
      setCode("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4 px-2">
        <span className="text-sm font-semibold text-gray-600">2 of 3</span>
      </div>

      <div className="flex justify-center mb-16 px-2">
        <div className="w-full max-w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-400 h-full transition-all duration-300 rounded-full"
            style={{ width: "66.66%" }}
          />
        </div>
      </div>

      <div className="w-full max-w-[520px] mx-auto">
        <button
          onClick={() => router.push("/auth/signup")}
          className="w-10 h-10 flex items-center justify-center -ml-2 mb-2 text-black hover:opacity-70 transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="mb-12 px-4">
          <h1 className="text-4xl font-bold text-black mb-3">Verify Email</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            We&apos;ve sent a 6-digit verification code to {email}
          </p>
        </div>

        {error && (
          <div className="mx-4 mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5 px-4">
          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-black mb-2">
              Verification Code*
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="code"
              name="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6));
                if (error) setError("");
              }}
              placeholder="123456"
              maxLength={6}
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50 tracking-[0.3em] text-center"
              autoCapitalize="none"
              disabled={verifying}
            />

            <div className="flex items-center gap-1 mt-3">
              <span className="text-sm text-gray-500">Didn&apos;t receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || resending}
                className="text-sm font-semibold text-[#00C2FF] disabled:text-gray-400 disabled:opacity-60"
              >
                {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : resending ? "Resending..." : "Resend Code"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full bg-[#6202AC] hover:bg-[#4e0288] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg mt-8"
          >
            {verifying ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
