"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChecklist } from "./context";

export default function ChecklistRecords() {
  const router = useRouter();
  const { records, loaded } = useChecklist();
  const [search, setSearch] = useState("");

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;
  }

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      String(r.slipNo).includes(q) ||
      (r.info.nameOf3PL || "").toLowerCase().includes(q) ||
      (r.info.location || "").toLowerCase().includes(q)
    );
  });

  function formatDate(iso) {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-emerald-700 text-white px-6 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-md">
        <div className="flex-1">
          <p className="font-semibold text-sm leading-tight">Saved Checklist Records</p>
          <p className="text-[11px] opacity-80 mt-0.5">{records.length} record{records.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => router.push("/checklist/add")}
          className="w-20 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[15px] flex-shrink-0"
          title="Add new record"
        >
         + Add
        </button>
      </div>

      <div className="px-2.5 py-3 pb-10">
        <div className="bg-white rounded-xl overflow-hidden shadow-md p-4">
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Quick search records..."
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 bg-gray-50"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: 600 }}>
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-2 text-left text-gray-500 font-semibold w-10">SR.</th>
                  <th className="px-2 py-2 text-left text-gray-500 font-semibold">Slip No</th>
                  <th className="px-2 py-2 text-left text-gray-500 font-semibold">3PL / Location</th>
                  <th className="px-2 py-2 text-left text-gray-500 font-semibold">Date</th>
                  <th className="px-2 py-2 text-center text-gray-500 font-semibold">Score</th>
                  <th className="px-2 py-2 text-center text-gray-500 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <td className="px-2 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-2 py-3 font-semibold text-blue-600">#{r.slipNo}</td>
                    <td className="px-2 py-3">
                      <p className="font-semibold text-gray-800">{r.info.nameOf3PL || "—"}</p>
                      <p className="text-[10px] text-gray-400">{r.info.location || "—"}</p>
                    </td>
                    <td className="px-2 py-3 text-gray-600">{formatDate(r.savedAt)}</td>
                    <td className="px-2 py-3 text-center">
                      <span className="inline-block bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                        {r.totalScore} / {r.maxScore}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex gap-1.5 justify-center">
                        <button
                          onClick={() => router.push(`/checklist/view/${r.id}`)}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => router.push(`/checklist/edit/${r.id}`)}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-8">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
