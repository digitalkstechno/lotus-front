"use client";

import React, { Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTasks } from "../task/hooks/useTasks";
import { TaskList } from "../task/components/TaskList";
import {
  CalendarPicker,
  TimePickerModal,
  RepeatModal,
} from "../task/components/Modals";
import { useSidebar } from "@/components/SidebarContext";
import { Star } from "lucide-react";
import { fetchTasksByUser } from "../../redux/slices/taskSlice";

function StarredContent() {
  const { collapsed, setCollapsed } = useSidebar();
  const dispatch = useDispatch();

  const {
    closeEditing,
    calendarFor,
    setCalendarFor,
    setTimeFor,
    setRepeatFor,
    setDueDateAndTime,
    setTomorrowClickCount,
    editDeadlineFor,
    setEditDeadlineFor,
    clearDue,
    timeFor,
    getTask,
    setDueTime,
    repeatFor,
    setRepeat,
    setDate,
    fetchTasks,
  } = useTasks();

  useEffect(() => {
    fetchTasks(1, "starred", true);
  }, [fetchTasks]);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc]" onClick={closeEditing}>
      {/* Header */}
      <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="text-white hover:text-emerald-200 p-1 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Star size={16} className="fill-amber-300 text-amber-300 flex-shrink-0" />
          <div>
            <h1 className="text-sm font-semibold">Starred Tasks</h1>
            <p className="text-[11px] opacity-80 mt-0.5">Prioritized tasks</p>
          </div>
        </div>
      </div>

      <div className="p-5 flex justify-center items-start min-h-[calc(100vh-72px)]">
        <div className="w-full max-w-4xl h-full bg-white rounded-xl shadow-sm p-4">
          <TaskList sortBy="starred" />
        </div>
      </div>

      {/* Modals */}
      {calendarFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCalendarFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CalendarPicker
              value={getTask(calendarFor)?.date || null}
              showTimeRepeat={false}
              onChange={(dateStr: string) => { setDate(calendarFor, dateStr); setTomorrowClickCount((p: any) => ({ ...p, [calendarFor]: 0 })); }}
              onClose={() => setCalendarFor(null)}
            />
          </div>
        </div>
      )}

      {editDeadlineFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditDeadlineFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CalendarPicker
              value={getTask(editDeadlineFor)?.dueDate || null}
              showTimeRepeat={false}
              onChange={(dateStr: string, timeStr?: string | null) => setDueDateAndTime(editDeadlineFor, dateStr, timeStr)}
              onDelete={() => { clearDue(editDeadlineFor); setEditDeadlineFor(null); }}
              onClose={() => setEditDeadlineFor(null)}
            />
          </div>
        </div>
      )}

      {timeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setTimeFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <TimePickerModal
              value={getTask(timeFor)?.dueTime}
              onChange={(t: string) => setDueTime(timeFor, t)}
              onClose={() => setTimeFor(null)}
            />
          </div>
        </div>
      )}

      {repeatFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRepeatFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <RepeatModal
              value={getTask(repeatFor)?.repeat}
              onChange={(repeatData: any) => setRepeat(repeatFor, { enabled: true, ...repeatData })}
              onClose={() => setRepeatFor(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StarredPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#1E2228] text-white">Loading...</div>}>
      <StarredContent />
    </Suspense>
  );
}
