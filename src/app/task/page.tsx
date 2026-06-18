"use client";

import React, { Suspense, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTasks } from "./hooks/useTasks";
import { TaskList } from "./components/TaskList";
import { CalendarPicker, TimePickerModal, RepeatModal } from "./components/Modals";
import { ReactSortable } from "react-sortablejs";
import { fetchListsByUser, resetLists } from "../../redux/slices/listSlice";

function AppContent() {
  const dispatch = useDispatch();
  const authUser = useSelector((state: any) => state.auth.user);

  let userId = authUser?._id;
  if (!userId && typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token) userId = JSON.parse(atob(token.split(".")[1]))?.id;
    } catch (e) { }
  }

  const {
    lists, addingList, setAddingList, newListName, setNewListName, addList, closeEditing,
    calendarFor, setCalendarFor, calTask, setTimeFor, setRepeatFor, setDueDate, setDueDateAndTime, setTomorrowClickCount,
    editDeadlineFor, setEditDeadlineFor, editTask, clearDue, timeFor, getTask, setDueTime, repeatFor, setRepeat,
    loadMoreLists, hasMore, loadingLists, setDate,
    handleListGroupChange, onListSortEnd, makeMutable, unmakeMutable
  } = useTasks() as any;

  console.log("AppContent Rendered - lists from useTasks:", lists);

  useEffect(() => {
    if (userId) {
      dispatch(resetLists());
      dispatch(fetchListsByUser({ userId, page: 1, limit: 10, isChecked: true }) as any);
    }
  }, [userId, dispatch]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastListElementRef = useCallback((node: any) => {
    if (loadingLists) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreLists();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loadingLists, hasMore, loadMoreLists]);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc]" onClick={closeEditing}>
      {/* Header */}
      <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-20">
        <div>
          <h1 className="text-sm font-semibold">Tasks</h1>
          <p className="text-[11px] opacity-80 mt-0.5">Manage your lists, tasks and subtasks</p>
        </div>
      </div>

      <div className="p-5 flex gap-4 overflow-x-auto items-start min-h-[calc(100vh-72px)]">
        <ReactSortable
          list={makeMutable(lists)}
          setList={(newLists) => handleListGroupChange(unmakeMutable(newLists))}
          onEnd={onListSortEnd}
          handle=".list-drag-handle"
          animation={150}
          className="flex gap-4 items-start"
        >
          {lists.map((list: any, index: number) => {
            if (lists.length === index + 1) {
              return (
                <div ref={lastListElementRef} key={list.id} data-list-id={list.id} className="flex-shrink-0 h-full">
                  <TaskList list={list} />
                </div>
              );
            } else {
              return (
                <div key={list.id} data-list-id={list.id} className="flex-shrink-0 h-full">
                  <TaskList list={list} />
                </div>
              );
            }
          })}
        </ReactSortable>
        {loadingLists && (
          <div className="w-[300px] flex-shrink-0 flex items-center justify-center">
            <span className="text-emerald-500 text-sm font-medium">Loading lists...</span>
          </div>
        )}
      </div>

      {/* New list modal */}
      {addingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setAddingList(false); setNewListName(""); }}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-80 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800">Create new list</h3>
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addList()}
              placeholder="List name"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setAddingList(false); setNewListName(""); }} className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={addList} className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-500 text-white hover:bg-[#008f72] transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODALS ============ */}

      {/* Add deadline calendar */}
      {calendarFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCalendarFor(null)}>
          <div onClick={e => e.stopPropagation()}>
            <CalendarPicker
              value={getTask(calendarFor)?.date || null}
              showTimeRepeat={false}
              onChange={(dateStr: string) => {
                setDate(calendarFor, dateStr);
                setTomorrowClickCount((p: any) => ({ ...p, [calendarFor]: 0 }));
              }}
              onClose={() => setCalendarFor(null)}
            />
          </div>
        </div>
      )}

      {/* Edit deadline calendar */}
      {editDeadlineFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditDeadlineFor(null)}>
          <div onClick={e => e.stopPropagation()}>
            <CalendarPicker
              value={getTask(editDeadlineFor)?.dueDate || null}
              showTimeRepeat={false}
              onChange={(dateStr: string, timeStr?: string | null) => {
                setDueDateAndTime(editDeadlineFor, dateStr, timeStr);
              }}
              onDelete={() => { clearDue(editDeadlineFor); setEditDeadlineFor(null); }}
              onClose={() => setEditDeadlineFor(null)}
            />
          </div>
        </div>
      )}

      {/* Time picker modal */}
      {timeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setTimeFor(null)}>
          <div onClick={e => e.stopPropagation()}>
            <TimePickerModal
              value={getTask(timeFor)?.dueTime}
              onChange={(t: string) => setDueTime(timeFor, t)}
              onClose={() => setTimeFor(null)}
            />
          </div>
        </div>
      )}

      {/* Repeat modal */}
      {repeatFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRepeatFor(null)}>
          <div onClick={e => e.stopPropagation()}>
            <RepeatModal
              value={getTask(repeatFor)?.repeat}
              onChange={(repeatData: any, timeStr?: string | null) => {
                setRepeat(repeatFor, { enabled: true, ...repeatData });
              }}
              onClose={() => setRepeatFor(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaskPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#1E2228] text-white">Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}