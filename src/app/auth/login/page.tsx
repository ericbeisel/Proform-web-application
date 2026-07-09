"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/api/auth/login/route";
import { checkAccountStatus } from "@/api/auth/account-status/route";
import { setAuthUser } from "@/lib/auth/session";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(formData.email, formData.password);

      console.log("🔐 Login Response:", data);

      // Save token
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("✅ Token saved to localStorage");
      }

      // Extract role (support both role and role_id)
      const userRole = data.user?.role ?? data.user?.role_id ?? 1;
      console.log(
        "👤 User Role Detected:",
        userRole,
        "(type:",
        typeof userRole,
        ")",
      );

      // Save user data with role
      if (data.user) {
        setAuthUser({
          id: data.user.id,
          name: data.user.name,
          username: data.user.username,
          email: data.user.email || data.user.email_id,
          role: userRole, // ← Important: Saving role
        });
        console.log("✅ User data saved with role:", userRole);
      }

      // Check account status & redirect
      const redirectTo = await checkAccountStatus();
      const nextPath = searchParams.get("next");
      const safeNextPath =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/auth")
          ? nextPath
          : null;

      console.log("🔀 Redirecting to:", safeNextPath || redirectTo);

      window.location.href = safeNextPath ?? redirectTo;

    } catch (err: any) {
      const errorMsg = err.message || "Unable to login. Please try again.";
      setError(errorMsg);
      console.error("❌ Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img
          src="/images/proform-logo.jpg"
          alt="Proform"
          className="h-14 w-auto rounded-lg"
        />
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-12 px-4">
        <h1 className="text-4xl font-bold text-black mb-3">Welcome Back!</h1>
        <p className="text-gray-500 text-base">
          Log in to continue your journey
        </p>
      </div>

      {error && (
        <div className="mx-4 mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 px-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-black mb-2"
          >
            Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="abcd1234@email.com"
            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-black mb-2"
          >
            Password*
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50 pr-12"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={loading}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[#6202AC] focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6202AC] hover:bg-[#4e0288] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg mt-8 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </button>
      </form>

      <p className="text-center text-gray-600 text-sm mt-8">
        Don't have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-[#2233ee] hover:text-[#0015fb] font-semibold"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
