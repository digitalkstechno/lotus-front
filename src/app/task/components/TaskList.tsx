import React, { useCallback, useRef } from "react";
import { CirclePlus, ChevronRight, ChevronDown, Loader2, MoreVertical, Check } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { TaskRow } from "./TaskRow";
import { ReactSortable } from "react-sortablejs";
import { SORT_LABELS } from "../lib/constants";
import { Overlay } from "./Shared";
import { useState } from "react";

export const TaskList = ({ sortBy, onSortChange }: { sortBy: string, onSortChange?: (val: string) => void }) => {
  const [openSortMenu, setOpenSortMenu] = useState(false);
  const {
    tasks, loadingTasks, hasMore, loadMoreTasks,
    closeEditing, collapsedCompleted, toggleCompletedSection,
    addTask, handleTaskGroupChange, onSortEnd, makeMutable, unmakeMutable
  } = useTasks();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastTaskElementRef = useCallback((node: any) => {
    if (loadingTasks) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && tasks.length > 0) {
        loadMoreTasks();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loadingTasks, hasMore, tasks.length, loadMoreTasks]);

  const getActiveGroups = () => {
    let active = tasks.filter((t: any) => !t.completed);
    
    if (sortBy === "title") {
      return [{ label: null, tasks: [...active].sort((a: any, b: any) => a.title.localeCompare(b.title)) }];
    }
    if (sortBy === "date") {
      return [{ label: null, tasks: [...active].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) }];
    }
    if (sortBy === "starred") {
      return [{ label: null, tasks: [...active].sort((a: any, b: any) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0)) }];
    }
    if (sortBy === "my-order") {
      return [{ label: null, tasks: active }];
    }
    const today = active.filter((t: any) => t.due === "today");
    const tomorrow = active.filter((t: any) => t.due === "tomorrow");
    const later = active.filter((t: any) => t.dueDate && t.due !== "today" && t.due !== "tomorrow");
    const none = active.filter((t: any) => !t.due && !t.dueDate);
    const groups = [];
    if (today.length) groups.push({ label: "Today", tasks: today });
    if (tomorrow.length) groups.push({ label: "Tomorrow", tasks: tomorrow });
    if (later.length) groups.push({ label: "Later", tasks: later });
    if (none.length || groups.length === 0) groups.push({ tasks: none });
    return groups;
  };

  let completedTasks = tasks.filter((t: any) => t.completed);

  return (
    <div onClick={closeEditing} className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-t-xl border-b border-gray-100">
        <h2 className="text-sm font-semibold text-emerald-700 flex-1 truncate">My Tasks</h2>
        {onSortChange && (
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setOpenSortMenu(!openSortMenu); }} className="text-emerald-700 hover:text-emerald-500 p-0.5 transition-colors">
              <MoreVertical size={16} />
            </button>
            {openSortMenu && (
              <>
                <Overlay onClose={() => setOpenSortMenu(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Sort by</p>
                  {Object.entries(SORT_LABELS).map(([key, label]) => (
                    <button key={key} onClick={() => onSortChange(key)} className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-[#F0F2F5] text-left text-gray-700">
                      <span className="w-4">{sortBy === key && <Check size={13} className="text-emerald-500" />}</span>{label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <button onClick={(e) => { e.stopPropagation(); addTask(); }} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-500 hover:bg-[#F0F2F5] transition-colors border-b border-gray-100">
        <CirclePlus size={17} /> Add a task
      </button>

      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <div className="px-2 pb-2 pt-1 space-y-1">
          {getActiveGroups().map((group, gi, arr) => (group.tasks.length > 0 || group.label || arr.length === 1) && (
            <div key={gi}>
              {group.label && <p className="px-2 pt-2 pb-1 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">{group.label}</p>}
              <div data-parent-id="">
                <ReactSortable
                  list={makeMutable(group.tasks)}
                  setList={(newTasks) => {
                     const plainTasks = unmakeMutable(newTasks);
                     const otherTasks = tasks.filter((t: any) => !group.tasks.some((gt: any) => gt.id === t.id));
                     handleTaskGroupChange(null, [...plainTasks, ...otherTasks]);
                  }}
                  group="shared"
                  onEnd={onSortEnd}
                  handle=".task-drag-handle"
                  animation={150}
                  className="space-y-1 min-h-[50px] w-full"
                >
                  {group.tasks.map((task: any) => <TaskRow key={task.id} task={task} parentId={null} />)}
                </ReactSortable>
              </div>
            </div>
          ))}
        </div>

        {completedTasks.length > 0 && (
          <div className="px-2 pb-3 border-t border-gray-100 pt-1">
            <button onClick={(e) => { e.stopPropagation(); toggleCompletedSection(); }} className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-400 w-full hover:text-emerald-600 transition-colors">
              {collapsedCompleted["default"] ? <ChevronRight size={13} /> : <ChevronDown size={13} />} Completed ({completedTasks.length})
            </button>
            {!collapsedCompleted["default"] && (
              <div className="space-y-1">
                {completedTasks.map((task: any) => <TaskRow key={task.id} task={task} parentId={null} />)}
              </div>
            )}
          </div>
        )}

        <div ref={lastTaskElementRef} className="h-4 w-full flex items-center justify-center my-2">
          {loadingTasks && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
        </div>
      </div>
    </div>
  );
};
