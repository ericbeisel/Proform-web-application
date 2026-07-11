"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/api/auth/forgot-password/route";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const isLengthValid = password.length >= 8;
      if (!isLengthValid || !hasUpperCase || !hasNumber) {
        newErrors.password = "Password must be at least 8 characters, include 1 uppercase letter and 1 number.";
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await resetPassword(email, password);
      setSuccess(true);
      router.push("/auth/login");
    } catch (err) {
      setErrors({ password: err instanceof Error ? err.message : "Failed to reset password. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div className="mt-8 mb-12 px-4">
        <h1 className="text-4xl font-bold text-black mb-3">Reset Password</h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Create a new strong password for your account.
        </p>
      </div>

      {success && (
        <div className="mx-4 mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-emerald-600">Password reset successfully! Please log in.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 px-4">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
            New Password*
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter new password"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50 pr-12"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={submitting}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[#6202AC] focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-600 mt-1.5">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-black mb-2">
            Confirm Password*
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Confirm new password"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50 pr-12"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              disabled={submitting}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[#6202AC] focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-600 mt-1.5">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting || !password || !confirmPassword}
          className="w-full bg-[#6202AC] hover:bg-[#4e0288] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg mt-8"
        >
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
