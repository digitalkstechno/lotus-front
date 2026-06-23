import React, { useState } from "react";
import { ChevronRight, Clock, RefreshCw, Trash2 } from "lucide-react";
import { MONTHS, DAYS } from "../lib/constants";

export const CalendarPicker = ({
  value,
  onChange,
  onClose,
  showTimeOption = true,
  onDelete
}: {
  value: any;
  onChange: any;
  onClose: any;
  showTimeRepeat?: boolean;
  onSetTime?: any;
  onSetRepeat?: any;
  onDelete?: any;
  showTimeOption?: boolean;
}) => {
  const today = new Date();
  let initDate = today;
  if (value) {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      initDate = parsed;
    }
  }
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [selected, setSelected] = useState(value || null);
  const [showTime, setShowTime] = useState(false);
  const [time, setTime] = useState(() => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; });
  const [showYearSelect, setShowYearSelect] = useState(false);
  
  const years = Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i);

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
    <div className="bg-white rounded-2xl p-4 w-72 shadow-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setShowYearSelect(!showYearSelect)} className="text-gray-800 text-sm font-medium hover:text-emerald-600 transition-colors">{MONTHS[viewMonth]} {viewYear}</button>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="text-gray-500 hover:text-gray-800 p-1"><ChevronRight size={16} className="rotate-180" /></button>
          <button onClick={nextMonth} className="text-gray-500 hover:text-gray-800 p-1"><ChevronRight size={16} /></button>
        </div>
      </div>
      {showYearSelect ? (
        <div className="grid grid-cols-4 gap-2 py-4 h-[180px] overflow-y-auto">
          {years.map(y => (
            <button key={y} onClick={() => { setViewYear(y); setShowYearSelect(false); }} className={`text-xs py-2 rounded-lg transition-colors ${y === viewYear ? "bg-emerald-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>{y}</button>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d, i) => <div key={i} className="text-center text-xs text-gray-400 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {getDays().map((item, i) => {
              const sel = isSelected(item.date);
              const tod = isToday(item.date);
              return (
                <button key={i} onClick={() => { if (!item.current) return; setSelected(fmt(item.date)); }}
                  className={`text-xs py-1.5 rounded-full transition-colors mx-auto w-8 h-8 flex items-center justify-center ${!item.current ? 'text-gray-300 cursor-default' : 'cursor-pointer'} ${sel ? 'bg-emerald-500 text-white shadow-sm' : ''} ${tod && !sel ? 'ring-1 ring-emerald-500 text-emerald-600' : ''} ${item.current && !sel && !tod ? 'text-gray-700 hover:bg-gray-100' : ''}`}
                >
                  {item.date.getDate()}
                </button>
              );
            })}
          </div>
        </>
      )}
      {showTimeOption && (
        <div className="mt-4 space-y-0.5 border-t border-gray-100 pt-3">
          {showTime ? (
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-50 text-gray-800 text-center rounded-lg py-2 focus:outline-none border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
          ) : (
            <button onClick={() => setShowTime(true)} className="w-full flex items-center gap-3 px-1 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"><Clock size={16} className="text-gray-400" />Set time</button>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
        {onDelete ? <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button> : <div />}
        <div className="flex gap-3">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (selected) onChange(selected, showTime ? time : null); onClose(); }} className="text-sm text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-full font-medium shadow-sm">Done</button>
        </div>
      </div>
    </div>
  );
};

export const TimePickerModal = ({ value, onChange, onClose }: any) => {
  const [time, setTime] = useState(value || (() => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; })());
  return (
    <div className="bg-white rounded-2xl p-5 w-64 shadow-2xl border border-gray-100">
      <h3 className="text-gray-800 text-sm font-medium mb-4">Set time</h3>
      <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-50 text-gray-800 text-center text-xl rounded-lg py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-gray-200" />
      <div className="flex gap-3 mt-4 justify-end">
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50">Cancel</button>
        <button onClick={() => { onChange(time); onClose(); }} className="text-sm text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-full font-medium shadow-sm">Done</button>
      </div>
    </div>
  );
};

export const RepeatModal = ({ value, onClose, onChange }: any) => {
  const [interval, setInterval] = useState(value?.interval || 1);
  const [unit, setUnit] = useState(value?.frequency || value?.unit || "day");
  const todayStr = new Date().toISOString().split('T')[0];
  const [endsType, setEndsType] = useState(value?.ends || value?.endsType || "never");
  const [endsOnDate, setEndsOnDate] = useState(value?.endDate ? new Date(value.endDate).toISOString().split('T')[0] : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; })());
  const [startDate, setStartDate] = useState(value?.startDate ? new Date(value.startDate).toISOString().split('T')[0] : todayStr);
  const [endsAfter, setEndsAfter] = useState(value?.afterCount || value?.endsAfter || 30);
  const [showEndCal, setShowEndCal] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [time, setTime] = useState(() => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; });

  return (
    <div className="bg-white rounded-2xl p-5 w-72 shadow-2xl border border-gray-100">
      <h3 className="text-gray-800 text-sm font-semibold mb-4">Repeats every</h3>
      <div className="flex gap-2 mb-4">
        <input type="number" min={1} value={interval} onChange={e => setInterval(Number(e.target.value))} className="w-16 bg-gray-50 text-gray-800 text-center rounded-lg py-2 text-sm focus:outline-none border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
        <select value={unit} onChange={e => setUnit(e.target.value)} className="flex-1 bg-gray-50 text-gray-800 rounded-lg py-2 px-3 text-sm focus:outline-none border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none">
          <option value="day" className="bg-white">day</option>
          <option value="week" className="bg-white">week</option>
          <option value="month" className="bg-white">month</option>
          <option value="year" className="bg-white">year</option>
        </select>
      </div>
      {showTime ? (
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-50 text-gray-800 text-center rounded-lg py-2.5 mb-4 focus:outline-none border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
      ) : (
        <button onClick={() => setShowTime(true)} className="w-full bg-gray-50 text-gray-600 text-sm rounded-lg py-2.5 px-3 text-left mb-4 hover:bg-gray-100 border border-gray-200">Set time</button>
      )}
      <div className="mb-1">
        <p className="text-gray-500 text-xs mb-2 font-medium">Starts</p>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 text-gray-800 text-sm rounded-lg py-2.5 px-3 border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
      </div>
      <div className="mt-4">
        <p className="text-gray-500 text-xs mb-2 font-medium">Ends</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEndsType("never")} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${endsType === "never" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>{endsType === "never" && <div className="w-2 h-2 rounded-full bg-white" />}</div>
            <span className="text-gray-700 text-sm font-medium">Never</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEndsType("on")} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${endsType === "on" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>{endsType === "on" && <div className="w-2 h-2 rounded-full bg-white" />}</div>
            <span className="text-gray-700 text-sm font-medium">On</span>
            {endsType === "on" && <input type="date" value={endsOnDate} onChange={e => setEndsOnDate(e.target.value)} className="ml-auto bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg py-1 px-2 hover:bg-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />}
            {endsType !== "on" && <span className="ml-auto text-gray-400 text-sm">Select Date</span>}
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEndsType("after")} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${endsType === "after" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>{endsType === "after" && <div className="w-2 h-2 rounded-full bg-white" />}</div>
            <span className="text-gray-700 text-sm font-medium">After</span>
            {endsType === "after" ? (
              <><input type="number" min={1} value={endsAfter} onChange={e => setEndsAfter(Number(e.target.value))} className="w-16 bg-gray-50 text-gray-800 text-center rounded-lg py-1 text-sm focus:outline-none border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ml-auto" /><span className="text-gray-500 text-sm">occurrences</span></>
            ) : <span className="ml-auto text-gray-400 text-sm">30 occurrences</span>}
          </label>
        </div>
      </div>
      <div className="flex gap-3 mt-5 justify-end">
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50">Cancel</button>
        <button onClick={() => { 
          let startD = new Date(startDate);
          if (showTime && time) {
            const [h, m] = time.split(':');
            startD.setHours(Number(h), Number(m), 0, 0);
          }
          let endDate = null;
          if (endsType === "on") {
             endDate = new Date(endsOnDate);
          }
          onChange({ 
            interval, 
            frequency: unit, 
            ends: endsType, 
            startDate: startD.toISOString(),
            endDate: endDate ? endDate.toISOString() : null, 
            afterCount: endsType === "after" ? endsAfter : null 
          }, showTime ? time : null); 
          onClose(); 
        }} className="text-sm text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-full font-medium shadow-sm">Done</button>
      </div>
    </div>
  );
};
