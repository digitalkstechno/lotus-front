"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import { loginApi } from "../../services/authService";
import { toast } from "sonner";
import { Lock, User, Eye, EyeOff, CheckSquare, MessageSquare } from "lucide-react";
import { requestAndSaveFCMToken } from "../../hooks/useFCM";

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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 px-8 py-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-3 p-2 shadow-sm overflow-hidden">
            <img src="/splash_logo.png" alt="Lotus Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-white text-xl font-semibold">Lotus</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Log in to continue to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          {/* Email / Phone */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-sm rounded-lg pl-10 pr-4 py-3 border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-sm rounded-lg pl-10 pr-10 py-3 border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-lg py-3 transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}