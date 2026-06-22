"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import { loginApi } from "../../services/authService";
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff, MessageCircle } from "lucide-react";
import { requestAndSaveFCMToken } from "../../hooks/useFCM";

// WhatsApp theme tokens
// Primary green:   #00A884
// Deep teal:       #075E54
// Panel dark:      #202C33
// App background:  #111B21
// Light text/icon: #8696A0
// Soft border:     #2A3942

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      if (response.data?.status === "Success" && response.data?.token) {
        toast.success("Logged in successfully");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        dispatch(setCredentials({ user: response.data.data, token: response.data.token }));
        
        // Immediately request FCM token and save to backend
        requestAndSaveFCMToken();

        const role = response.data.data?.role;
        // router.push(role?.toLowerCase() === "admin" ? "/staff" : "/task");
        router.push("/task");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to log in. Check your credentials.");
    } finally {
      setLoading(false);
    }
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
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#E9EDEF] mb-2"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696A0]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
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
          
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00A884] hover:bg-[#06CF9C] text-white font-medium text-sm rounded-lg py-3 transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* Footer */}
         
        </form>
      </div>
    </div>
  );
}