import React, { useEffect, useRef, useCallback, useState } from "react";
import { GripVertical, MoreVertical, CirclePlus, ChevronRight, ChevronDown, Check, Pencil, Loader2 } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { SORT_LABELS } from "../lib/constants";
import { Overlay, MenuItem } from "./Shared";
import { TaskRow } from "./TaskRow";

export const TaskList = ({ list }: any) => {
  const {
    closeEditing, dragData, setDragOverTarget, dropOnList, dropOnListHeader,
    renamingListId, renameValue, setRenameValue, commitRename, openListMenu, setOpenListMenu,
    setSortBy, startRename, addTaskToList, collapsedCompleted, toggleCompletedSection,
    dragOverTarget, onDragStartList, onDragEnd, fetchTasksForCurrentList
  } = useTasks();

  const pagination = list.taskPagination || { currentPage: 1, hasMore: true, loading: false };
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Once visible, we can fetch and keep it loaded
        }
      },
      { rootMargin: "200px" } // Pre-fetch slightly before it comes into view
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch initial tasks when list mounts and is visible
  useEffect(() => {
    if (isVisible && list.tasks.length === 0 && pagination.currentPage === 1 && !pagination.loading) {
      fetchTasksForCurrentList(list.id, 1);
    }
  }, [isVisible, list.id]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastTaskElementRef = useCallback((node: any) => {
    if (pagination.loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasMore && list.tasks.length > 0) {
        fetchTasksForCurrentList(list.id, pagination.currentPage + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [pagination.loading, pagination.hasMore, pagination.currentPage, list.id, list.tasks.length, fetchTasksForCurrentList]);

  const getActiveGroups = (list: any) => {
    const active = list.tasks.filter((t: any) => !t.completed);
    if (list.sortBy === "title") {
      return [{ label: null, tasks: [...active].sort((a: any, b: any) => a.title.localeCompare(b.title)) }];
    }
    if (list.sortBy === "date") {
      return [{ label: null, tasks: [...active].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) }];
    }
    if (list.sortBy === "starred") {
      return [{ label: null, tasks: [...active].sort((a: any, b: any) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0)) }];
    }
    if (list.sortBy === "my-order") {
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

  const completedTasks = (list: any) => list.tasks.filter((t: any) => t.completed);

  return (
    <div
      ref={containerRef}
      onClick={closeEditing}
      onDragOver={(e) => {
        e.preventDefault();
        if (dragData.current?.kind === "task") setDragOverTarget({ kind: "list-target", id: list.id });
      }}
      onDrop={(e) => dropOnList(e, list.id)}
      className={`w-[300px] max-h-[calc(100vh-112px)] flex-shrink-0 rounded-xl flex flex-col shadow-sm transition-all ${dragOverTarget?.kind === "list-target" && dragOverTarget.id === list.id ? "ring-2 ring-emerald-500 bg-emerald-50" : "bg-white"}`}
    >
      <div
        draggable
        onDragStart={(e) => onDragStartList(e, list.id)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => dropOnListHeader(e, list.id)}
        className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-t-xl cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={15} className="text-white/50" />
        {renamingListId === list.id ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => commitRename(list.id)}
            onKeyDown={(e) => e.key === "Enter" && commitRename(list.id)}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-sm font-semibold text-emerald-700 bg-transparent border-b border-white/50 focus:outline-none placeholder-white/50"
          />
        ) : (
          <h2 className="text-sm font-semibold  text-emerald-700 flex-1 truncate">{list.name}</h2>
        )}
        <span className="text-xs text-emerald-700 px-1.5 py-0.5 rounded-full">{list.tasks.filter((t: any) => !t.completed).length}</span>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setOpenListMenu(openListMenu === list.id ? null : list.id); }} className=" text-emerald-700 hover:text-white p-0.5 transition-colors">
            <MoreVertical size={16} />
          </button>
          {openListMenu === list.id && (
            <>
              <Overlay onClose={() => setOpenListMenu(null)} />
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Sort by</p>
                {Object.entries(SORT_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => setSortBy(list.id, key)} className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-[#F0F2F5] text-left text-gray-700">
                    <span className="w-4">{list.sortBy === key && <Check size={13} className="text-emerald-500" />}</span>{label}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <MenuItem icon={Pencil} onClick={() => startRename(list)}>Rename list</MenuItem>
                <div className="border-t border-gray-100 my-1" />
              </div>
            </>
          )}
        </div>
      </div>

      <button onClick={(e) => { e.stopPropagation(); addTaskToList(list.id); }} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-500 hover:bg-[#F0F2F5] transition-colors border-b border-gray-100">
        <CirclePlus size={17} /> Add a task
      </button>

      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <div className="px-2 pb-2 pt-1 space-y-1">
          {getActiveGroups(list).map((group, gi) => (group.tasks.length > 0 || group.label) && (
            <div key={gi}>
              {group.label && <p className="px-2 pt-2 pb-1 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">{group.label}</p>}
              <div className="space-y-1">
                {group.tasks.map((task: any) => <TaskRow key={task.id} list={list} task={task} parentId={null} />)}
              </div>
            </div>
          ))}
        </div>

        {completedTasks(list).length > 0 && (
          <div className="px-2 pb-3 border-t border-gray-100 pt-1">
            <button onClick={(e) => { e.stopPropagation(); toggleCompletedSection(list.id); }} className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-400 w-full hover:text-emerald-600 transition-colors">
              {collapsedCompleted[list.id] ? <ChevronRight size={13} /> : <ChevronDown size={13} />} Completed ({completedTasks(list).length})
            </button>
            {!collapsedCompleted[list.id] && (
              <div className="space-y-1">
                {completedTasks(list).map((task: any) => <TaskRow key={task.id} list={list} task={task} parentId={null} />)}
              </div>
            )}
          </div>
        )}

        {/* Intersection Observer target for pagination */}
        <div ref={lastTaskElementRef} className="h-4 w-full flex items-center justify-center my-2">
          {pagination.loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
        </div>
      </div>
    </div>
  );
};
