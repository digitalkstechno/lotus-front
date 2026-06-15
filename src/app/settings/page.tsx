"use client";

import { useRouter } from "next/navigation";
import { Database, Layers } from "lucide-react";

const MASTERS = [
  { id: "master1", label: "Master 1", icon: Database, href: "/settings/masters/master1" },
  { id: "master2", label: "Master 2", icon: Layers,   href: "/settings/masters/master2" },
];

export default function Settings() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-emerald-700 text-white px-4 py-3 sticky top-0 z-20 shadow-md">
        <p className="font-semibold text-sm leading-tight">Settings</p>
        <p className="text-[11px] opacity-80 mt-0.5">Configure your enterprise workspace and manage access controls</p>
      </div>

      <div className="px-2.5 py-3">
        <div className="bg-white rounded-xl overflow-hidden shadow-md">
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Masters</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Manage master data used across the platform.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
            {MASTERS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => router.push(m.href)}
                  className="group bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all p-4 text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-300 group-hover:text-emerald-500 transition-colors text-lg">›</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{m.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
