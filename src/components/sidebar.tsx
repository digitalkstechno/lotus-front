"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  Star,
  ChevronDown,
  CheckSquare,
  ListChecks,
  Users,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Loader2,
} from "lucide-react";
import { logoutApi } from "../services/userService";

const PRIMARY_NAV = [
  { id: "task", label: "Task", icon: ClipboardList, path: "/task" },
  { id: "starred", label: "Starred", icon: Star, path: "/starred" },
  { id: "checklist", label: "Checklist", icon: ListChecks, path: "/checklist" },
  { id: "staff", label: "Staff", icon: Users, path: "/staff" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

type UserInfo = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
};

const ADMIN_ONLY_IDS: string[] = [];

const getVisibleNav = (role?: string) => {
  const r = role?.toLowerCase();
  if (r === "admin") return PRIMARY_NAV;
  if (r === "unit_head" || r === "team_head") {
    return PRIMARY_NAV.filter((item) => !ADMIN_ONLY_IDS.includes(item.id));
  }
  return PRIMARY_NAV.filter(
    (item) => !ADMIN_ONLY_IDS.includes(item.id) && item.id !== "staff",
  );
};

const getTokenPayload = (): UserInfo | null => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    return { ...tokenData, ...userData };
  } catch {
    return null;
  }
};

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((p: boolean) => boolean)) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [visibleNav, setVisibleNav] = useState<typeof PRIMARY_NAV>(PRIMARY_NAV);

  useEffect(() => {
    if (pathname === "/") {
      router.replace("/task");
      return;
    }

    const payload = getTokenPayload();
    if (!payload?.id) return;
    setUserInfo(payload);
    setVisibleNav(getVisibleNav(payload?.role));
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      const fcmToken = localStorage.getItem("fcm_token");
      if (fcmToken) {
        await logoutApi(fcmToken);
      }
    } catch (e) {
      console.error("Failed to call logout API", e);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("fcm_token");
    router.push("/login");
  };

  const isActive = (path: string) =>
    path === "/checklist/records"
      ? pathname.startsWith("/checklist")
      : pathname === path;

  // User display info
  const displayName = userInfo?.fullName || userInfo?.name || "User";
  const displayEmail = userInfo?.email || "";
  const firstLetter = displayName.charAt(0).toUpperCase();

  if (pathname === "/login") return null;

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-56"} h-screen flex flex-col select-none shrink-0 bg-white border-r border-gray-100 transition-all duration-200`}
    >
      {/* ── Header ── */}
      <div
        className={`px-3 pt-5 pb-4 flex border-b border-gray-100 ${collapsed ? "flex-col items-center  gap-2" : "flex-row items-center justify-between gap-3"}`}
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-bold text-[15px] leading-tight">
              Lotus
            </p>
            <p className="text-gray-400 text-[11px] leading-tight">
              Reminder Suite
            </p>
          </div>
        )}

        {/* Hamburger  */}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
          title={collapsed ? "Expand sidebar" : "Hide sidebar"}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* ── Nav ── */}
      <div className="py-3 flex-1 flex flex-col">
        <nav className="px-3 space-y-0.5">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[#E7F8F1] text-[#00A884]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon
                  className={`w-[17px] h-[17px] shrink-0 ${active ? "text-[#00A884]" : "text-gray-400"}`}
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-[#E7F8F1] flex items-center justify-center text-[#00A884] text-xs font-bold shrink-0">
            {firstLetter}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-xs font-semibold truncate">
                {displayName}
              </p>
              <p className="text-gray-400 text-[10px] truncate">
                {displayEmail}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-[17px] h-[17px]" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
