import React, { useState } from "react";
import { Check, ListPlus, User as UserIcon, X } from "lucide-react";
import { ASSIGN_PALETTE, ASSIGN_COLORS } from "../lib/constants";

export const Overlay = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-40" onClick={onClose} />
);

export const MenuItem = ({
  icon: Icon,
  children,
  onClick,
  danger,
  disabled,
  sub
}: {
  icon?: any;
  children: React.ReactNode;
  onClick?: (e: any) => void;
  danger?: boolean;
  disabled?: boolean;
  sub?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-start gap-3 px-3 py-2 text-sm text-left transition-colors ${disabled ? "text-gray-300 cursor-not-allowed" : danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}`}
  >
    {Icon && <Icon size={16} className="mt-0.5 flex-shrink-0" />}
    <span className="flex-1">
      {children}
      {sub && <span className="block text-[11px] text-gray-300 mt-0.5">{sub}</span>}
    </span>
  </button>
);

export const ListPicker = ({ lists, currentListId, onPick, onNewList }: any) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  return (
    <div className="py-1">
      {lists.map((l: any) => (
        <button key={l.id} onClick={() => onPick(l.id)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 text-left text-gray-700">
          <span className="w-4 flex-shrink-0">{l.id === currentListId && <Check size={14} className="text-emerald-500" />}</span>
          <span className="truncate">{l.name}</span>
        </button>
      ))}
      <div className="border-t border-gray-100 mt-1 pt-1">
        {creating ? (
          <div className="px-3 py-1.5">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) { onNewList(name.trim()); setName(""); setCreating(false); } }} placeholder="List name" className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
        ) : (
          <button onClick={() => setCreating(true)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 text-left text-gray-600">
            <ListPlus size={15} /> New list
          </button>
        )}
      </div>
    </div>
  );
};

export const AssignChip = ({ assign, onRemove }: any) => {
  if (!assign) return null;
  const cfg = ASSIGN_PALETTE.find((a) => a.type === assign.type);
  const Icon = cfg?.icon || UserIcon;
  return (
    <span className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-xs font-medium border ${ASSIGN_COLORS[assign.type]}`}>
      <Icon size={12} />
      {assign.name}
      {onRemove && <button onClick={onRemove} className="ml-0.5 rounded-full hover:bg-black/10 p-0.5"><X size={11} /></button>}
    </span>
  );
};
