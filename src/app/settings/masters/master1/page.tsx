"use client";

import { useRouter } from "next/navigation";
import { Database, Layers } from "lucide-react";

const MASTERS = [
  { id: "master1", label: "Master 1", icon: Database, href: "/settings/masters/master1" },
  { id: "master2", label: "Master 2", icon: Layers,   href: "/settings/masters/master2" },
];

export default function Master1Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-emerald-700 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-md">
        <button onClick={() => router.push("/settings")}
          className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-lg flex-shrink-0">
          ←
        </button>
        <div className="flex-1">
          <p className="font-semibold text-sm leading-tight">Master 1</p>
          <p className="text-[11px] opacity-80 mt-0.5">Settings › Masters › Master 1</p>
        </div>
      </div>

      <div className="px-2.5 py-3">
        <div className="bg-white rounded-xl overflow-hidden shadow-md">
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Master 1</p>
          </div>
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            Master 1 content coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
