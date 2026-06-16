"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  CheckCircle2,
  Plus,
  Star,
  ChevronDown,
  CheckSquare,
  ListChecks,
  Users,
  ClipboardList,
  MessageSquare,
  LayoutDashboard,
  Bell,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const PRIMARY_NAV = [
  { id: "task",      label: "Task",       icon: ClipboardList,   path: "/task" },
  { id: "starred",   label: "Starred",    icon: Star,            path: "/" },
  { id: "checklist", label: "Checklist",  icon: ListChecks,      path: "/checklist" },
  { id: "staff",     label: "Staff",      icon: Users,           path: "/staff" },
  { id: "settings", label: "Settings",   icon: Settings,        path: "/settings" },
];

export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [listsOpen, setListsOpen] = useState(true);

  const isActive = (path: string) => path === "/checklist/records"
    ? pathname.startsWith("/checklist")
    : pathname === path;
  const handleCreateNewList = () => router.push("/task?newList=1");

  if (pathname === "/login") return null;

  return (
    <aside className="w-56 h-screen flex flex-col select-none shrink-0 bg-white border-r border-gray-100">

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-bold text-[15px] leading-tight">Lotus</p>
          <p className="text-gray-400 text-[11px] leading-tight">Reminder Suite</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
      </div>

      {/* ── Nav items ── */}
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="px-3 space-y-0.5">
          {PRIMARY_NAV.map((item) => {
            const Icon   = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[#E7F8F1] text-[#00A884]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon className={`w-[17px] h-[17px] shrink-0 ${active ? "text-[#00A884]" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Lists section ── */}
        <div className="px-3 mt-2">
          <button
            onClick={() => setListsOpen((p) => !p)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="w-[17px] h-[17px] text-gray-400" />
              <span className="text-sm font-medium">Lists</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${listsOpen ? "rotate-180" : ""}`} />
          </button>

          {listsOpen && (
            <div className="mt-0.5 ml-3 pl-3 border-l border-gray-100 space-y-0.5">
              <button
                onClick={() => router.push("/task")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  pathname === "/task"
                    ? "text-[#00A884] bg-[#E7F8F1]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#00A884] shrink-0" />
                <span>My Tasks</span>
              </button>
              <button
                onClick={handleCreateNewList}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-[#00A884] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Create new list</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-[#E7F8F1] flex items-center justify-center text-[#00A884] text-xs font-bold shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-xs font-semibold truncate">Admin</p>
            <p className="text-gray-400 text-[10px] truncate">Admin@gmail.com</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
          <LogOut className="w-[17px] h-[17px]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}