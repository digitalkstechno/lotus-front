import React, { useState } from "react";
import { ChevronRight, Clock, RefreshCw, Trash2 } from "lucide-react";
import { MONTHS, DAYS } from "../lib/constants";

export const CalendarPicker = ({
  value,
  onChange,
  onClose,
  showTimeRepeat = false,
  onSetTime,
  onSetRepeat,
  onDelete
}: {
  value: any;
  onChange: any;
  onClose: any;
  showTimeRepeat?: boolean;
  onSetTime?: any;
  onSetRepeat?: any;
  onDelete?: any;
}) => {
  const today = new Date();
  const initDate = value ? new Date(value) : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [selected, setSelected] = useState(value || null);

  const getDays = () => {
    const first = new Date(viewYear, viewMonth, 1);
    const last = new Date(viewYear, viewMonth + 1, 0);
    const startDay = (first.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startDay; i++) {
      const d = new Date(viewYear, viewMonth, -startDay + i + 1);
      days.push({ date: d, current: false });
    }
    for (let i = 1; i <= last.getDate(); i++) {
      days.push({ date: new Date(viewYear, viewMonth, i), current: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(viewYear, viewMonth + 1, i), current: false });
    }
    return days;
  };

  const isToday = (d: Date) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  const isSelected = (d: Date) => {
    if (!selected) return false;
    const s = new Date(selected);
    return d.getDate() === s.getDate() && d.getMonth() === s.getMonth() && d.getFullYear() === s.getFullYear();
  };
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  return (
    <div className="bg-[#1E2228] rounded-2xl p-4 w-72 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</span>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white p-1"><ChevronRight size={16} className="rotate-180" /></button>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white p-1"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d, i) => <div key={i} className="text-center text-xs text-gray-500 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {getDays().map((item, i) => {
          const sel = isSelected(item.date);
          const tod = isToday(item.date);
          return (
            <button key={i} onClick={() => { if (!item.current) return; setSelected(fmt(item.date)); }}
              className={`text-xs py-1.5 rounded-full transition-colors mx-auto w-8 h-8 flex items-center justify-center ${!item.current ? 'text-gray-600 cursor-default' : 'cursor-pointer'} ${sel ? 'bg-white/20 text-white ring-1 ring-white/40' : ''} ${tod && !sel ? 'ring-1 ring-blue-400 text-blue-300' : ''} ${item.current && !sel && !tod ? 'text-gray-200 hover:bg-white/10' : ''}`}
            >
              {item.date.getDate()}
            </button>
          );
        })}
      </div>
      {showTimeRepeat && (
        <div className="mt-4 space-y-0.5 border-t border-white/10 pt-3">
          <button onClick={onSetTime} className="w-full flex items-center gap-3 px-1 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5"><Clock size={16} className="text-gray-500" />Set time</button>
          <button onClick={onSetRepeat} className="w-full flex items-center gap-3 px-1 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5"><RefreshCw size={16} className="text-gray-500" />Repeat</button>
        </div>
      )}
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-white/10">
        {onDelete ? <button onClick={onDelete} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={16} /></button> : <div />}
        <div className="flex gap-3">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">Cancel</button>
          <button onClick={() => { if (selected) onChange(selected); onClose(); }} className="text-sm text-[#1E2228] bg-blue-300 hover:bg-blue-200 px-4 py-1.5 rounded-full font-medium">Done</button>
        </div>
      </div>
    </div>
  );
};

export const TimePickerModal = ({ value, onChange, onClose }: any) => {
  const [time, setTime] = useState(value || "09:00");
  return (
    <div className="bg-[#1E2228] rounded-2xl p-5 w-64 shadow-2xl">
      <h3 className="text-white text-sm font-medium mb-4">Set time</h3>
      <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-white/10 text-white text-center text-xl rounded-lg py-3 focus:outline-none focus:ring-1 focus:ring-blue-400 border border-white/10" />
      <div className="flex gap-3 mt-4 justify-end">
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">Cancel</button>
        <button onClick={() => { onChange(time); onClose(); }} className="text-sm text-[#1E2228] bg-blue-300 hover:bg-blue-200 px-4 py-1.5 rounded-full font-medium">Done</button>
      </div>
    </div>
  );
};

export const RepeatModal = ({ value, onClose, onChange }: any) => {
  const [interval, setInterval] = useState(value?.interval || 1);
  const [unit, setUnit] = useState(value?.unit || "day");
  const [endsType, setEndsType] = useState(value?.endsType || "never");
  const [endsOnDate, setEndsOnDate] = useState(value?.endsOnDate || "13 July");
  const [endsAfter, setEndsAfter] = useState(value?.endsAfter || 30);
  const [showEndCal, setShowEndCal] = useState(false);

  const today = new Date();
  const startLabel = `${today.getDate()} ${MONTHS[today.getMonth()]}`;

  return (
    <div className="bg-[#1E2228] rounded-2xl p-5 w-72 shadow-2xl">
      <h3 className="text-white text-sm font-semibold mb-4">Repeats every</h3>
      <div className="flex gap-2 mb-4">
        <input type="number" min={1} value={interval} onChange={e => setInterval(Number(e.target.value))} className="w-16 bg-white/10 text-white text-center rounded-lg py-2 text-sm focus:outline-none border border-white/10" />
        <select value={unit} onChange={e => setUnit(e.target.value)} className="flex-1 bg-white/10 text-white rounded-lg py-2 px-3 text-sm focus:outline-none border border-white/10 appearance-none">
          <option value="day" className="bg-[#1E2228]">day</option>
          <option value="week" className="bg-[#1E2228]">week</option>
          <option value="month" className="bg-[#1E2228]">month</option>
          <option value="year" className="bg-[#1E2228]">year</option>
        </select>
      </div>
      <button className="w-full bg-white/10 text-gray-300 text-sm rounded-lg py-2.5 px-3 text-left mb-4 hover:bg-white/15 border border-white/5">Set time</button>
      <div className="mb-1">
        <p className="text-gray-400 text-xs mb-2">Starts</p>
        <div className="bg-white/10 text-gray-200 text-sm rounded-lg py-2.5 px-3 border border-white/5">{startLabel}</div>
      </div>
      <div className="mt-4">
        <p className="text-gray-400 text-xs mb-2">Ends</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEndsType("never")} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${endsType === "never" ? "border-blue-400 bg-blue-400" : "border-gray-500"}`}>{endsType === "never" && <div className="w-2 h-2 rounded-full bg-white" />}</div>
            <span className="text-gray-200 text-sm">Never</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEndsType("on")} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${endsType === "on" ? "border-blue-400 bg-blue-400" : "border-gray-500"}`}>{endsType === "on" && <div className="w-2 h-2 rounded-full bg-white" />}</div>
            <span className="text-gray-200 text-sm">On</span>
            {endsType === "on" && <button onClick={() => setShowEndCal(!showEndCal)} className="ml-auto bg-white/10 text-gray-300 text-sm rounded-lg py-1 px-3 hover:bg-white/15">{endsOnDate}</button>}
            {endsType !== "on" && <span className="ml-auto text-gray-600 text-sm">13 July</span>}
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEndsType("after")} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${endsType === "after" ? "border-blue-400 bg-blue-400" : "border-gray-500"}`}>{endsType === "after" && <div className="w-2 h-2 rounded-full bg-white" />}</div>
            <span className="text-gray-200 text-sm">After</span>
            {endsType === "after" ? (
              <><input type="number" min={1} value={endsAfter} onChange={e => setEndsAfter(Number(e.target.value))} className="w-16 bg-white/10 text-white text-center rounded-lg py-1 text-sm focus:outline-none border border-white/10 ml-auto" /><span className="text-gray-400 text-sm">occurrences</span></>
            ) : <span className="ml-auto text-gray-600 text-sm">30 occurrences</span>}
          </label>
        </div>
      </div>
      <div className="flex gap-3 mt-5 justify-end">
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">Cancel</button>
        <button onClick={() => { onChange({ interval, unit, endsType, endsOnDate, endsAfter }); onClose(); }} className="text-sm text-[#1E2228] bg-blue-300 hover:bg-blue-200 px-4 py-1.5 rounded-full font-medium">Done</button>
      </div>
    </div>
  );
};
