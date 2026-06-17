"use client";

import { useRouter, useParams } from "next/navigation";
import { useChecklist } from "../../context";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function ViewRecord() {
  const router = useRouter();
  const params = useParams();
  const { getRecord } = useChecklist();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getRecord(params.id);
      setRecord(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-500">Record not found</p>
        <button onClick={() => router.push("/checklist")}
          className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          ← Back to Records
        </button>
      </div>
    );
  }

  // API data thi flat items banavo
  const items = [];
  record.data?.forEach((section) => {
    section.data?.forEach((item) => {
      items.push({
        id: item._id,
        text: item.master2?.particulars || "—",
        cat: item.master2?.category || "—",
        max: item.master2?.max_score || 0,
        yn: item.isRequired ? "Yes" : "No",
        score: item.score,
        remarks: item.remarks || "",
      });
    });
  });

  const totalScore = record.total ?? 0;
  const maxScore = items.reduce((s, it) => s + it.max, 0);
  const yesCount = items.filter((it) => it.yn === "Yes").length;

  // Period parse karo
  const periodParts = record.assessment_period?.split(" to ") || [];
  const periodStr = record.assessment_period || "—";

  const displayVal = (val, fallback = "—") => val?.trim() || fallback;
  const formatDate = (d) => {
    if (!d) return "—";
    try {
      const date = new Date(d);
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yy = String(date.getFullYear()).slice(2);
      return `${dd}-${mm}-${yy}`;
    } catch { return d; }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-emerald-700 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-md">
        <button onClick={() => router.push("/checklist")}
          className="p-1.5 rounded-full bg-white/20 text-white flex items-center justify-center text-lg flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="font-semibold text-sm leading-tight">Record #{record._id?.slice(-5)}</p>
          <p className="text-[11px] opacity-80 mt-0.5">
            {displayVal(record.name_of_3pl)} · {displayVal(record.location)}
          </p>
        </div>
      </div>

      <div className="px-2.5 py-3 pb-10">
        <div className="bg-white rounded-tr-xl rounded-b-xl overflow-hidden shadow-md">

          <div className="bg-emerald-50 text-emerald-700 px-4 py-3">
            <p className="font-semibold text-sm">Secondary Warehouse – Self Assessment Checklist</p>
            <p className="text-xs opacity-80 mt-1">Assessment Period: {periodStr}</p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
            {[
              ["Name of 3PL",  record.name_of_3pl],
              ["Location",     record.location],
              ["Person Met",   record.person_met],
              ["Designation",  record.designation],
              ["Assessed By",  record.assessed_by],
              ["Date",         record.date ? formatDate(record.date) : "—"],
              ["Month",        record.month],
              ["Period",       periodStr],
            ].map(([label, val]) => (
              <div key={label} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{val || "—"}</p>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border-y border-emerald-100 px-4 py-2">
            <p className="text-xs font-semibold text-emerald-700 tracking-wide">▶ Operations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: 680 }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 py-2 text-left text-gray-500 font-semibold w-8">#</th>
                  <th className="px-2 py-2 text-left text-gray-500 font-semibold">Particular</th>
                  <th className="px-2 py-2 text-center text-gray-500 font-semibold">Category</th>
                  <th className="px-2 py-2 text-center text-gray-500 font-semibold">Max</th>
                  <th className="px-2 py-2 text-center text-gray-500 font-semibold">Yes / No</th>
                  <th className="px-2 py-2 text-center text-gray-500 font-semibold">Score</th>
                  <th className="px-2 py-2 text-left text-gray-500 font-semibold w-36">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <td className="px-2 py-2 text-gray-300 text-[10px]">{i + 1}</td>
                    <td className="px-2 py-2 text-gray-700 leading-snug max-w-[220px]">{it.text}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${it.cat === "Vital" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                        {it.cat}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-gray-500">{it.max}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${it.yn === "Yes" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {it.yn}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="inline-block bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                        {it.score}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-[10px] text-gray-500 max-w-[140px]">{it.remarks || "—"}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs font-semibold text-gray-500">Weighted Average = 30</p>
            <div className="flex gap-5">
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-700">{maxScore}</p>
                <p className="text-[10px] text-gray-400">Max Score</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-500">{yesCount}</p>
                <p className="text-[10px] text-gray-400">Yes Count</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-700">{totalScore}</p>
                <p className="text-[10px] text-gray-400">Total Score</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}