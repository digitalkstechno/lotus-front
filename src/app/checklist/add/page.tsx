"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChecklist } from "../context";
import { ArrowLeft } from "lucide-react";


function InlineField({ label, value, onChange, type = "text", placeholder = "Click to edit..." }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  function startEdit() { setDraft(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); }
  function commit() { onChange(draft); setEditing(false); }
  function onKey(e) { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }

  return (
    <div className="px-4 py-3 border-b border-gray-100 last:border-b-0">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {editing ? (
        <input ref={inputRef} type={type} value={draft}
          onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={onKey}
          className="w-full text-sm font-semibold text-gray-800 border-b-2 border-emerald-500 outline-none bg-transparent pb-0.5"
          placeholder={placeholder} />
      ) : (
        <p onClick={startEdit}
          className={`text-sm font-semibold cursor-pointer transition-colors flex items-center gap-1 ${value ? "text-gray-800" : "text-gray-300 italic"}`}>
          {value || placeholder}
        </p>
      )}
    </div>
  );
}

function YnCell({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handleOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div className="relative flex justify-center" ref={ref}>
      <button onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer transition-all hover:opacity-80 ${value === "Yes" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
        {value}<span className="text-[8px] opacity-60">▾</span>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden min-w-[90px]">
          {["Yes", "No"].map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors ${opt === value ? "text-emerald-600 bg-emerald-50" : "text-gray-700"}`}>
              {opt === "Yes" ? "✓ Yes" : "✗ No"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreCell({ value, max, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  function startEdit() { setDraft(value); setEditing(true); setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0); }
  function commit() {
    let s = parseInt(draft); if (isNaN(s)) s = value;
    s = Math.max(0, Math.min(max, s)); onChange(s); setEditing(false);
  }
  function onKey(e) { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }

  return editing ? (
    <input ref={inputRef} type="number" min={0} max={max} value={draft}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={onKey}
      className="w-12 text-center text-xs font-semibold text-emerald-700 border-b-2 border-emerald-500 outline-none bg-transparent mx-auto block" />
  ) : (
    <span onClick={startEdit}
      className="inline-block bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md text-[11px] cursor-pointer hover:bg-emerald-100 transition-colors"
      title="Click to edit">
      {value}
    </span>
  );
}

function RemarksCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);

  function startEdit() { setDraft(value); setEditing(true); setTimeout(() => ref.current?.focus(), 0); }
  function commit() { onChange(draft.trim()); setEditing(false); }

  return editing ? (
    <textarea ref={ref} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} rows={2}
      className="w-full text-[10px] text-gray-700 border-b-2 border-emerald-500 outline-none bg-transparent resize-none leading-snug"
      placeholder="Add remarks..." />
  ) : (
    <span onClick={startEdit}
      className={`text-[10px] cursor-pointer hover:text-emerald-600 transition-colors flex items-start gap-0.5 leading-snug ${value ? "text-gray-500 italic" : "text-gray-300 italic"}`}
      title={value || "Click to add remarks"}>
      <span className="line-clamp-2">{value || "—"}</span>
    </span>
  );
}

export default function AddChecklist() {
  const router = useRouter();
  const { items, info, loaded, updateItem, setInfoField, saveRecord } = useChecklist();
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;
  }

  const totalScore = items.reduce((s, it) => s + it.score, 0);
  const maxScore   = items.reduce((s, it) => s + it.max,   0);
  const yesCount   = items.filter((it) => it.yn === "Yes").length;

  const displayVal = (val, fallback = "—") => val?.trim() || fallback;
  const formatDate = (d) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}-${m}-${y.slice(2)}`;
  };
  const periodStr =
    info.periodFrom && info.periodTo
      ? `${formatDate(info.periodFrom)} to ${formatDate(info.periodTo)}`
      : "—";

  function handleSave() {
    setSaving(true);
    saveRecord();
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      router.push("/checklist/records");
    }, 600);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-emerald-700 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-md">
        <button onClick={() => router.push("/checklist/records")}
          className="p-1.5 rounded-full bg-white/20 text-white flex items-center justify-center text-lg flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="font-semibold text-sm leading-tight">New Checklist Record</p>
          <p className="text-xs opacity-80 mt-0.5">
            {displayVal(info.nameOf3PL, "Lotus Marketing")} · {displayVal(info.location, "NIYOL")} · {displayVal(info.month, "Apr-26")}
          </p>
        </div>
      </div>

      <div className="px-2.5 py-3 pb-10">
        <div className="bg-white rounded-tr-xl rounded-b-xl overflow-hidden shadow-md">

          <div className="bg-emerald-50 text-white px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold text-emerald-50 text-emerald-700 text-sm">Secondary Warehouse – Self Assessment Checklist</p>
              <p className="text-xs opacity-80 text-emerald-700 mt-1">Assessment Period: {periodStr}</p>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="text-white bg-emerald-600 text-xs font-semibold px-4 py-1.5 rounded-lg shadow transition-colors disabled:opacity-60 flex-shrink-0">
              {savedMsg ? "✓ Saved" : "💾 Save"}
            </button>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
            <InlineField label="Name of 3PL"  value={info.nameOf3PL}   onChange={setInfoField("nameOf3PL")}   placeholder="e.g. Lotus Marketing" />
            <InlineField label="Location"      value={info.location}    onChange={setInfoField("location")}    placeholder="e.g. NIYOL" />
            <InlineField label="Person Met"    value={info.personMet}   onChange={setInfoField("personMet")}   placeholder="e.g. Viresh Modi" />
            <InlineField label="Designation"   value={info.designation} onChange={setInfoField("designation")} placeholder="e.g. Manager" />
            <InlineField label="Assessed By"   value={info.assessedBy}  onChange={setInfoField("assessedBy")}  placeholder="e.g. Self" />
            <InlineField label="Date"          value={info.date}        onChange={setInfoField("date")}        type="date" placeholder="Select date" />
            <InlineField label="Month"         value={info.month}       onChange={setInfoField("month")}       placeholder="e.g. Apr-26" />
            <div className="px-4 py-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Assessment Period</p>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <p className="text-[9px] text-gray-400 mb-0.5">From</p>
                  <input type="date" value={info.periodFrom} onChange={(e) => setInfoField("periodFrom")(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 border-b border-gray-200 outline-none focus:border-emerald-500 bg-transparent pb-0.5" />
                </div>
                <span className="text-gray-300 text-xs">→</span>
                <div className="flex-1">
                  <p className="text-[9px] text-gray-400 mb-0.5">To</p>
                  <input type="date" value={info.periodTo} onChange={(e) => setInfoField("periodTo")(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 border-b border-gray-200 outline-none focus:border-emerald-500 bg-transparent pb-0.5" />
                </div>
              </div>
            </div>
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
                    <td className="px-2 py-2 text-gray-300 text-[10px]">{it.id}</td>
                    <td className="px-2 py-2 text-gray-700 leading-snug max-w-[220px]">{it.text}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${it.cat === "Vital" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                        {it.cat}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-gray-500">{it.max}</td>
                    <td className="px-2 py-2">
                      <YnCell value={it.yn} onChange={(val) => updateItem(it.id, "yn", val)} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <ScoreCell value={it.score} max={it.max} onChange={(val) => updateItem(it.id, "score", val)} />
                    </td>
                    <td className="px-2 py-2 max-w-[140px]">
                      <RemarksCell value={it.remarks} onChange={(val) => updateItem(it.id, "remarks", val)} />
                    </td>
                  </tr>
                ))}
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
