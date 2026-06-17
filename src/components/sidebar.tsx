"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  Star,
  ChevronDown,
  CheckSquare,
  ListChecks,
  Users,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Loader2,
} from "lucide-react";
import { getListsByUserApi, createListApi, updateListApi } from "../services/listService";

const PRIMARY_NAV = [
  { id: "task",      label: "Task",       icon: ClipboardList, path: "/task" },
  { id: "starred",   label: "Starred",    icon: Star,          path: "/" },
  { id: "checklist", label: "Checklist",  icon: ListChecks,    path: "/checklist" },
  { id: "staff",     label: "Staff",      icon: Users,         path: "/staff" },
  { id: "settings",  label: "Settings",   icon: Settings,      path: "/settings" },
];

type ListItem = {
  _id: string;
  name: string;
  order?: number;
};

type UserInfo = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
};

const ADMIN_ONLY_IDS = ["staff", "checklist", "settings"];

const getVisibleNav = (role?: string) => {
  if (role?.toLowerCase() === "admin") return PRIMARY_NAV;
  return PRIMARY_NAV.filter((item) => !ADMIN_ONLY_IDS.includes(item.id));
};

const getTokenPayload = (): UserInfo | null => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    return { ...tokenData, ...userData };
  } catch {
    return null;
  }
};

export default function Sidebar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const activeListId = searchParams.get("list_id");

  const [listsOpen, setListsOpen]               = useState(true);
  const [checkedLists, setCheckedLists]         = useState<Record<string, boolean>>({});
  const [userLists, setUserLists]               = useState<ListItem[]>([]);
  const [loadingLists, setLoadingLists]         = useState(false);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListName, setNewListName]           = useState("");
  const [creating, setCreating]                 = useState(false);
  const [createError, setCreateError]           = useState<string | null>(null);
  const [userInfo, setUserInfo]                 = useState<UserInfo | null>(null);
  const [visibleNav, setVisibleNav]             = useState<typeof PRIMARY_NAV>(PRIMARY_NAV);
  const [collapsed, setCollapsed]               = useState(false);

  useEffect(() => {
    const payload = getTokenPayload();
    if (!payload?.id) return;
    setUserInfo(payload);
    setVisibleNav(getVisibleNav(payload?.role));

    let cancelled = false;
    setLoadingLists(true);
    getListsByUserApi(payload.id, 1, 100)
      .then((res) => {
        if (!cancelled) {
          const lists = res.data.data || [];
          setUserLists(lists);
          const initialChecks: Record<string, boolean> = {};
          lists.forEach((l: any) => {
            initialChecks[l._id] = l.isChecked !== false; // Default to true if missing
          });
          setCheckedLists(initialChecks);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user lists:", err);
        if (!cancelled) setUserLists([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingLists(false);
      });

    return () => { cancelled = true; };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleCreateList = async () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;

    const payload = getTokenPayload();
    const userId  = payload?.id || null;

    setCreating(true);
    setCreateError(null);
    try {
      const res = await createListApi({
        name: trimmed,
        ...(userId ? { user_id: userId } : {}),
      });
      const created: ListItem = res.data?.data || res.data;
      setUserLists((prev) => [...prev, created]);
      setShowNewListInput(false);
      setNewListName("");
      router.push(`/task?list_id=${created._id}`);
    } catch (err: any) {
      console.error("Failed to create list:", err);
      setCreateError(err?.response?.data?.message || "Could not create list.");
    } finally {
      setCreating(false);
    }
  };

  const handleNewListKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCreateList();
    if (e.key === "Escape") {
      setShowNewListInput(false);
      setNewListName("");
      setCreateError(null);
    }
  };

  const isActive = (path: string) =>
    path === "/checklist/records"
      ? pathname.startsWith("/checklist")
      : pathname === path;

  const toggleListChecked = async (id: string) => {
    const isCurrentlyChecked = !!checkedLists[id];
    const newCheckedState = !isCurrentlyChecked;
    setCheckedLists((p) => ({ ...p, [id]: newCheckedState }));
    
    if (id === "my-tasks") return; // Bypass backend call for the virtual "My Tasks" list

    try {
      await updateListApi(id, { isChecked: newCheckedState });
    } catch (err) {
      console.error("Failed to update isChecked for list", err);
      // Revert on failure
      setCheckedLists((p) => ({ ...p, [id]: isCurrentlyChecked }));
    }
  };

  // User display info
  const displayName  = userInfo?.fullName || userInfo?.name || "User";
  const displayEmail = userInfo?.email || "";
  const firstLetter  = displayName.charAt(0).toUpperCase();

  if (pathname === "/login") return null;

  return (
    <aside className={`${collapsed ? "w-14" : "w-56"} h-screen flex flex-col select-none shrink-0 bg-white border-r border-gray-100 transition-all duration-200`}>

      {/* ── Header ── */}
      <div className={`px-3 pt-5 pb-4 flex border-b border-gray-100 ${collapsed ? "flex-col items-center gap-2" : "flex-row items-center gap-3"}`}>
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-bold text-[15px] leading-tight">Lotus</p>
            <p className="text-gray-400 text-[11px] leading-tight">Reminder Suite</p>
          </div>
        )}
        <button onClick={() => setCollapsed(p => !p)} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "-rotate-90" : "rotate-90"}`} />
        </button>
      </div>

      {/* ── Nav ── */}
      <div className="py-3 shrink-0">
        <nav className="px-3 space-y-0.5">
          {visibleNav.map((item) => {
            const Icon   = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[#E7F8F1] text-[#00A884]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon className={`w-[17px] h-[17px] shrink-0 ${active ? "text-[#00A884]" : "text-gray-400"}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Lists section ── */}
      <div className="flex-1 flex flex-col px-3 mt-2 min-h-0">
        <button
            onClick={() => setListsOpen((p) => !p)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer shrink-0"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="w-[17px] h-[17px] text-gray-400" />
              {!collapsed && <span className="text-sm font-medium">Lists</span>}
            </div>
            {!collapsed && <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${listsOpen ? "rotate-180" : ""}`} />}
          </button>

          {listsOpen && (
            <div className="mt-0.5 ml-3 pl-3 border-l border-gray-100 space-y-0.5 flex-1 overflow-y-auto">

              {/* User na lists */}
              {loadingLists ? (
                <p className="px-3 py-2 text-[11px] text-gray-300 italic">Loading lists…</p>
              ) : (
                userLists.map((list) => (
                  <button
                    key={list._id}
                    onClick={() => router.push(`/task?list_id=${list._id}`)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      activeListId === list._id
                        ? "text-[#00A884] bg-[#E7F8F1]"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedLists[list._id]}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleListChecked(list._id)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#00A884] focus:ring-[#00A884] cursor-pointer shrink-0"
                    />
                    <span className="truncate">{list.name}</span>
                  </button>
                ))
              )}

              {/* Create new list */}
              {showNewListInput ? (
                <div className="px-3 pt-1.5 pb-1 space-y-1">
                  <input
                    autoFocus
                    type="text"
                    value={newListName}
                    onChange={(e) => { setNewListName(e.target.value); setCreateError(null); }}
                    onKeyDown={handleNewListKeyDown}
                    placeholder="List name…"
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A884] focus:border-[#00A884]"
                  />
                  {createError && (
                    <p className="text-[11px] text-red-400">{createError}</p>
                  )}
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleCreateList}
                      disabled={creating || !newListName.trim()}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md bg-[#00A884] text-white disabled:opacity-50 hover:bg-[#009070] transition-colors"
                    >
                      {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                    </button>
                    <button
                      onClick={() => { setShowNewListInput(false); setNewListName(""); setCreateError(null); }}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewListInput(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-[#00A884] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Create new list</span>
                </button>
              )}
            </div>
          )}
        </div>

      {/* ── Footer ── */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-[#E7F8F1] flex items-center justify-center text-[#00A884] text-xs font-bold shrink-0">
            {firstLetter}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-xs font-semibold truncate">{displayName}</p>
              <p className="text-gray-400 text-[10px] truncate">{displayEmail}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-[17px] h-[17px]" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}