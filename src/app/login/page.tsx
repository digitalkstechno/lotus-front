"use client";

import { useState } from "react";
import { Lock, Phone, Eye, EyeOff, MessageCircle } from "lucide-react";

// WhatsApp theme tokens
// Primary green:   #00A884
// Deep teal:       #075E54
// Panel dark:      #202C33
// App background:  #111B21
// Light text/icon: #8696A0
// Soft border:     #2A3942

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
     console.log({ phone, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111B21] px-4">
      <div className="w-full max-w-md bg-[#202C33] rounded-2xl shadow-2xl border border-[#2A3942] overflow-hidden">
        {/* Header */}
        <div className="bg-[#075E54] px-8 py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#00A884] flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-semibold">Welcome back</h1>
          <p className="text-[#CFE9E5] text-sm mt-1">
            Log in to continue to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-[#E9EDEF] mb-2"
            >
              Phone number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696A0]" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#2A3942] text-[#E9EDEF] placeholder-[#8696A0] text-sm rounded-lg pl-10 pr-4 py-3 border border-transparent focus:border-[#00A884] focus:outline-none focus:ring-1 focus:ring-[#00A884] transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#E9EDEF] mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696A0]" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#2A3942] text-[#E9EDEF] placeholder-[#8696A0] text-sm rounded-lg pl-10 pr-10 py-3 border border-transparent focus:border-[#00A884] focus:outline-none focus:ring-1 focus:ring-[#00A884] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8696A0] hover:text-[#E9EDEF] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[#8696A0] cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-[#00A884] bg-[#2A3942] border-[#2A3942]"
              />
              Remember me
            </label>
            <a href="#" className="text-[#00A884] hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#00A884] hover:bg-[#06CF9C] text-white font-medium text-sm rounded-lg py-3 transition-colors"
          >
            Log in
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-[#8696A0]">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-[#00A884] hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}