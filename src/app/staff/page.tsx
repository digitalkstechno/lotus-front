"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Users,
  Edit2,
  Trash2,
  Crown,
  ArrowRightLeft,
  Download,
  Upload,
  UserPlus,
  X,
  Sparkles,
  RefreshCw,
  FolderPlus,
  Check,
  AlertTriangle,
  UserMinus,
  Building2,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  unitId: string | null;
  teamId: string | null;
}

interface Team {
  id: string;
  name: string;
  unitId: string;
  headId: string | null;
}

interface Unit {
  id: string;
  name: string;
  headId: string | null;
}

const INITIAL_UNITS: Unit[] = [
  { id: "u-1", name: "Sales & Account Support", headId: "s-1" },
  { id: "u-2", name: "Core Product Development", headId: "s-2" },
  { id: "u-3", name: "Marketing & Growth Creative", headId: "s-3" },
];

const INITIAL_TEAMS: Team[] = [
  { id: "t-1", name: "Enterprise Sales", unitId: "u-1", headId: "s-4" },
  { id: "t-2", name: "Strategic Account Growth", unitId: "u-1", headId: "s-5" },
  { id: "t-3", name: "Client Architecture", unitId: "u-2", headId: "s-6" },
  { id: "t-4", name: "QA automation & Pipelines", unitId: "u-2", headId: "s-7" },
  { id: "t-5", name: "Acquisition & Brand", unitId: "u-3", headId: "s-8" },
];

const DESIGNATIONS = [
  "Admin",
  "Unit Head",
  "Team Head",
  "Staff",
];

const INITIAL_STAFF: Staff[] = [
  { id: "s-1", name: "Rahul Patel", email: "rahul.patel@corp.acme.com", phone: "+1 (555) 124-5678", designation: "VP of Sales & Revenue", unitId: "u-1", teamId: null },
  { id: "s-2", name: "Nisha Kulkarni", email: "nisha.k@corp.acme.com", phone: "+1 (555) 234-5678", designation: "VP of Product Development", unitId: "u-2", teamId: null },
  { id: "s-3", name: "Priya Sharma", email: "priya.sh@corp.acme.com", phone: "+1 (555) 345-6789", designation: "Growth Creative Lead", unitId: "u-3", teamId: null },
  { id: "s-4", name: "Amit Shah", email: "amit.shah@corp.acme.com", phone: "+1 (555) 456-7890", designation: "Sr. Representative Enterprise Sales", unitId: "u-1", teamId: "t-1" },
  { id: "s-5", name: "Rakesh Gupta", email: "rakesh.g@corp.acme.com", phone: "+1 (555) 567-8901", designation: "Partner Growth Manager", unitId: "u-1", teamId: "t-2" },
  { id: "s-6", name: "Manav Shah", email: "manav.shah@corp.acme.com", phone: "+1 (555) 678-9012", designation: "Principal Systems Engineer", unitId: "u-2", teamId: "t-3" },
  { id: "s-7", name: "Jay Mehta", email: "jay.mehta@corp.acme.com", phone: "+1 (555) 789-0123", designation: "Core QA Architect", unitId: "u-2", teamId: "t-4" },
  { id: "s-8", name: "Neha Joshi", email: "neha.j@corp.acme.com", phone: "+1 (555) 890-1234", designation: "Principal Brand Designer", unitId: "u-3", teamId: "t-5" },
  { id: "s-9", name: "Saurabh Deshmukh", email: "saurabh.d@corp.acme.com", phone: "+1 (555) 901-2345", designation: "Account Executive Middle-market", unitId: "u-1", teamId: "t-1" },
  { id: "s-10", name: "Kiran Kumar", email: "kiran.k@corp.acme.com", phone: "+1 (555) 012-3456", designation: "React Platform Engineer", unitId: "u-2", teamId: "t-3" },
  { id: "s-11", name: "Ananya Roy", email: "ananya.roy@corp.acme.com", phone: "+1 (555) 123-0987", designation: "Manual QA Specialist", unitId: "u-2", teamId: "t-4" },
  { id: "s-12", name: "Siddharth Sen", email: "freelancer@corp.acme.com", phone: "+1 (555) 987-6543", designation: "Internal Operations Consultant", unitId: null, teamId: null },
];

export default function StaffPage() {
  const [units, setUnits] = useState<Unit[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("org_units");
      return saved ? JSON.parse(saved) : INITIAL_UNITS;
    }
    return INITIAL_UNITS;
  });
  const [teams, setTeams] = useState<Team[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("org_teams");
      return saved ? JSON.parse(saved) : INITIAL_TEAMS;
    }
    return INITIAL_TEAMS;
  });
  const [staff, setStaff] = useState<Staff[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("org_staff");
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    }
    return INITIAL_STAFF;
  });

  useEffect(() => { localStorage.setItem("org_units", JSON.stringify(units)); }, [units]);
  useEffect(() => { localStorage.setItem("org_teams", JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem("org_staff", JSON.stringify(staff)); }, [staff]);

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>("u-1");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({ "u-1": true, "u-2": true, "u-3": true });
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warn" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warn" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const [drawer, setDrawer] = useState<{
    type: "add-unit" | "edit-unit" | "add-team" | "edit-team" | "add-staff" | "edit-staff" | "user-picker" | "transfer-staff" | "promote-unit" | "promote-team" | null;
    title: string; targetId?: string; payload?: any;
  }>({ type: null, title: "" });

  const closeDrawer = () => setDrawer({ type: null, title: "" });

  const [pickerSearch, setPickerSearch] = useState("");
  const [isCreatingUserPicker, setIsCreatingUserPicker] = useState(false);
  const [pickerForm, setPickerForm] = useState({ name: "", email: "", phone: "", designation: "" });
  const [unitForm, setUnitForm] = useState({ name: "", headId: "" });
  const [teamForm, setTeamForm] = useState({ name: "", unitId: "", headId: "" });
  const [staffForm, setStaffForm] = useState({ name: "", email: "", phone: "", designation: "", unitId: "", teamId: "" });
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);

  const staffMap = useMemo(() => { const m = new Map<string, Staff>(); staff.forEach(s => m.set(s.id, s)); return m; }, [staff]);
  const unitMap = useMemo(() => { const m = new Map<string, Unit>(); units.forEach(u => m.set(u.id, u)); return m; }, [units]);
  const teamMap = useMemo(() => { const m = new Map<string, Team>(); teams.forEach(t => m.set(t.id, t)); return m; }, [teams]);

  const handleCreateUserInsidePicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickerForm.name.trim()) return;
    const newStaffId = `s-${Date.now()}`;
    const newStaffItem: Staff = { id: newStaffId, name: pickerForm.name, email: pickerForm.email || `${pickerForm.name.toLowerCase().replace(/\s+/g, ".")}@corp.acme.com`, phone: pickerForm.phone || "+1 (555) 000-0000", designation: pickerForm.designation || "Associate Specialist", unitId: null, teamId: null };
    setStaff(prev => [...prev, newStaffItem]);
    showToast(`Staff member "${pickerForm.name}" created and auto-selected!`);
    setPickerForm({ name: "", email: "", phone: "", designation: "" });
    setIsCreatingUserPicker(false);
    if (drawer.payload?.onSelect) drawer.payload.onSelect(newStaffId);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.name.trim()) return;
    if (drawer.type === "add-unit") {
      const newId = `u-${Date.now()}`;
      setUnits(prev => [...prev, { id: newId, name: unitForm.name, headId: unitForm.headId || null }]);
      if (unitForm.headId) setStaff(prev => prev.map(s => s.id === unitForm.headId ? { ...s, unitId: newId } : s));
      showToast(`Successfully created "${unitForm.name}" unit.`);
    } else if (drawer.type === "edit-unit" && drawer.targetId) {
      const oldUnit = units.find(u => u.id === drawer.targetId);
      setUnits(prev => prev.map(u => u.id === drawer.targetId ? { ...u, name: unitForm.name, headId: unitForm.headId || null } : u));
      if (unitForm.headId && unitForm.headId !== oldUnit?.headId) setStaff(prev => prev.map(s => s.id === unitForm.headId ? { ...s, unitId: drawer.targetId! } : s));
      showToast(`Updated Unit details for "${unitForm.name}".`);
    }
    closeDrawer();
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name.trim() || !teamForm.unitId) return;
    if (drawer.type === "add-team") {
      const newId = `t-${Date.now()}`;
      setTeams(prev => [...prev, { id: newId, name: teamForm.name, unitId: teamForm.unitId, headId: teamForm.headId || null }]);
      if (teamForm.headId) setStaff(prev => prev.map(s => s.id === teamForm.headId ? { ...s, unitId: teamForm.unitId, teamId: newId } : s));
      showToast(`Team "${teamForm.name}" successfully established.`);
    } else if (drawer.type === "edit-team" && drawer.targetId) {
      const oldTeam = teams.find(t => t.id === drawer.targetId);
      setTeams(prev => prev.map(t => t.id === drawer.targetId ? { ...t, name: teamForm.name, unitId: teamForm.unitId, headId: teamForm.headId || null } : t));
      if (teamForm.headId && teamForm.headId !== oldTeam?.headId) setStaff(prev => prev.map(s => s.id === teamForm.headId ? { ...s, unitId: teamForm.unitId, teamId: drawer.targetId! } : s));
      showToast(`Team "${teamForm.name}" information updated.`);
    }
    closeDrawer();
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim()) return;
    if (drawer.type === "add-staff") {
      const newId = `s-${Date.now()}`;
      setStaff(prev => [...prev, { id: newId, name: staffForm.name, email: staffForm.email || `${staffForm.name.toLowerCase().replace(/\s+/g, ".")}@corp.acme.com`, phone: staffForm.phone || "+1 (555) 000-0000", designation: staffForm.designation || "Staff Specialist", unitId: staffForm.unitId || null, teamId: staffForm.teamId || null }]);
      showToast(`Staff profile for "${staffForm.name}" added successfully.`);
    } else if (drawer.type === "edit-staff" && drawer.targetId) {
      setStaff(prev => prev.map(s => s.id === drawer.targetId ? { ...s, name: staffForm.name, email: staffForm.email, phone: staffForm.phone, designation: staffForm.designation, unitId: staffForm.unitId || null, teamId: staffForm.teamId || null } : s));
      showToast(`Staff information saved.`);
    }
    closeDrawer();
  };

  const staffFormTeams = useMemo(() => { if (!staffForm.unitId) return []; return teams.filter(t => t.unitId === staffForm.unitId); }, [teams, staffForm.unitId]);

  const handleDeleteUnit = (id: string, name: string) => {
    setConfirmDialog({ title: "Delete Organizational Unit?", message: `Are you absolute certain you wish to delete "${name}"? All nested teams and personnel will be orphaned.`, onConfirm: () => { setUnits(prev => prev.filter(u => u.id !== id)); setStaff(prev => prev.map(s => s.unitId === id ? { ...s, unitId: null, teamId: null } : s)); setTeams(prev => prev.filter(t => t.unitId !== id)); if (selectedUnitId === id) { setSelectedUnitId(null); setSelectedTeamId(null); } showToast(`Unit "${name}" deleted.`); setConfirmDialog(null); } });
  };

  const handleDeleteTeam = (id: string, name: string) => {
    setConfirmDialog({ title: "Disband Team?", message: `Ensure you want to remove the team "${name}"?`, onConfirm: () => { setTeams(prev => prev.filter(t => t.id !== id)); setStaff(prev => prev.map(s => s.teamId === id ? { ...s, teamId: null } : s)); if (selectedTeamId === id) setSelectedTeamId(null); showToast(`Team "${name}" disbanded.`); setConfirmDialog(null); } });
  };

  const handleDeleteStaff = (id: string, name: string) => {
    setConfirmDialog({ title: "Remove Staff Profile?", message: `This will fully clear "${name}" from your active directory database. This cannot be undone.`, onConfirm: () => { setStaff(prev => prev.filter(s => s.id !== id)); setUnits(prev => prev.map(u => u.headId === id ? { ...u, headId: null } : u)); setTeams(prev => prev.map(t => t.headId === id ? { ...t, headId: null } : t)); showToast(`Staff record for "${name}" deleted successfully.`); setConfirmDialog(null); } });
  };

  const handleExecuteUnitPromotion = (staffId: string, unitId: string) => {
    const candidate = staffMap.get(staffId); const targetUnit = unitMap.get(unitId);
    if (!candidate || !targetUnit) return;
    const oldHeadId = targetUnit.headId; const oldHeadName = oldHeadId ? staffMap.get(oldHeadId)?.name : null;
    const executePromote = () => { setUnits(prev => prev.map(u => u.id === unitId ? { ...u, headId: staffId } : u)); setStaff(prev => prev.map(s => s.id === staffId ? { ...s, unitId: unitId, teamId: s.unitId === unitId ? s.teamId : null } : s)); showToast(`Smart Promotion Successful! Head of "${targetUnit.name}" is now ${candidate.name}.`); setConfirmDialog(null); closeDrawer(); };
    if (oldHeadId && oldHeadId !== staffId) { setConfirmDialog({ title: "Confirm Smart Replacement", message: `Currently, ${oldHeadName} is the head of ${targetUnit.name}. Smart Promotion will replace existing head with ${candidate.name}. Proceed?`, onConfirm: executePromote }); } else { executePromote(); }
  };

  const handleExecuteTeamPromotion = (staffId: string, teamId: string) => {
    const candidate = staffMap.get(staffId); const targetTeam = teamMap.get(teamId);
    if (!candidate || !targetTeam) return;
    const oldHeadId = targetTeam.headId; const oldHeadName = oldHeadId ? staffMap.get(oldHeadId)?.name : null;
    const executePromote = () => { setTeams(prev => prev.map(t => t.id === teamId ? { ...t, headId: staffId } : t)); setStaff(prev => prev.map(s => s.id === staffId ? { ...s, unitId: targetTeam.unitId, teamId: teamId } : s)); showToast(`Smart Promotion Successful! Team Lead of "${targetTeam.name}" is now ${candidate.name}.`); setConfirmDialog(null); closeDrawer(); };
    if (oldHeadId && oldHeadId !== staffId) { setConfirmDialog({ title: "Confirm Lead Replacement", message: `Currently, ${oldHeadName} is the Lead of ${targetTeam.name}. Smart Promotion will replace existing lead with ${candidate.name}. Proceed?`, onConfirm: executePromote }); } else { executePromote(); }
  };

  const handleExecuteTransfer = (staffId: string, destUnitId: string | null, destTeamId: string | null) => {
    const candidate = staffMap.get(staffId); if (!candidate) return;
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, unitId: destUnitId, teamId: destTeamId } : s));
    if (destUnitId && candidate.unitId !== destUnitId) setUnits(prev => prev.map(u => u.id === candidate.unitId && u.headId === staffId ? { ...u, headId: null } : u));
    if (destTeamId && candidate.teamId !== destTeamId) setTeams(prev => prev.map(t => t.id === candidate.teamId && t.headId === staffId ? { ...t, headId: null } : t));
    showToast(`Transferred "${candidate.name}" to ${destUnitId ? unitMap.get(destUnitId)?.name : "Unassigned"}.`);
    closeDrawer();
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ units, teams, staff, exportVersion: "1.0", timestamp: new Date().toISOString() }, null, 2));
    const a = document.createElement("a"); a.setAttribute("href", dataStr); a.setAttribute("download", `org_hierarchy_${Date.now()}.json`); document.body.appendChild(a); a.click(); a.remove();
    showToast("Data exported as JSON file successfully.", "success");
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fr = new FileReader(); fr.onload = (ev) => { try { const d = JSON.parse(ev.target?.result as string); if (Array.isArray(d.units) && Array.isArray(d.teams) && Array.isArray(d.staff)) { setUnits(d.units); setTeams(d.teams); setStaff(d.staff); showToast("Successfully imported!", "success"); } else { showToast("Invalid JSON structure.", "warn"); } } catch { showToast("Error reading file.", "warn"); } }; fr.readAsText(file); e.target.value = "";
  };

  const handleResetToSeeds = () => {
    setConfirmDialog({ title: "Reset to Default Seed Data?", message: "Are you sure you want to restore the original Demo Org structure?", onConfirm: () => { setUnits(INITIAL_UNITS); setTeams(INITIAL_TEAMS); setStaff(INITIAL_STAFF); setExpandedUnits({ "u-1": true, "u-2": true, "u-3": true }); setSelectedUnitId("u-1"); setSelectedTeamId(null); showToast("Restored original directory seed templates.", "info"); setConfirmDialog(null); } });
  };

  const triggerAddUnit = () => { setUnitForm({ name: "", headId: "" }); setDrawer({ type: "add-unit", title: "Establish New Unit" }); };
  const triggerEditUnit = (unit: Unit) => { setUnitForm({ name: unit.name, headId: unit.headId || "" }); setDrawer({ type: "edit-unit", title: `Modify ${unit.name} Unit`, targetId: unit.id }); };
  const triggerAddTeam = (prefillUnitId?: string) => { setTeamForm({ name: "", unitId: prefillUnitId || units[0]?.id || "", headId: "" }); setDrawer({ type: "add-team", title: "Establish New Squad Team" }); };
  const triggerEditTeam = (team: Team) => { setTeamForm({ name: team.name, unitId: team.unitId, headId: team.headId || "" }); setDrawer({ type: "edit-team", title: `Modify ${team.name} Squad`, targetId: team.id }); };
  const triggerAddStaff = (prefillUnitId?: string | null, prefillTeamId?: string | null) => { setStaffForm({ name: "", email: "", phone: "", designation: "", unitId: prefillUnitId || "", teamId: prefillTeamId || "" }); setDrawer({ type: "add-staff", title: "Add New Staff Member" }); };
  const triggerEditStaff = (personnel: Staff) => { setStaffForm({ name: personnel.name, email: personnel.email, phone: personnel.phone, designation: personnel.designation, unitId: personnel.unitId || "", teamId: personnel.teamId || "" }); setDrawer({ type: "edit-staff", title: `Edit ${personnel.name}'s Profile`, targetId: personnel.id }); };
  const triggerTransferStaff = (personnel: Staff) => { setDrawer({ type: "transfer-staff", title: `Transfer ${personnel.name}`, targetId: personnel.id, payload: { unitId: personnel.unitId || "", teamId: personnel.teamId || "" } }); };
  const triggerPromoteToTeam = (personnel: Staff) => { setDrawer({ type: "promote-team", title: `Promote ${personnel.name} to Team Lead`, targetId: personnel.id, payload: { selectedTeamId: personnel.teamId || teams[0]?.id || "" } }); };
  const triggerUserPicker = (currentSelectionId: string | null, onSelect: (staffId: string) => void) => { setPickerSearch(""); setIsCreatingUserPicker(false); setPickerForm({ name: "", email: "", phone: "", designation: "" }); setDrawer({ type: "user-picker", title: "Select Active Directory Staff", payload: { currentSelectionId, onSelect } }); };

  const pickerFilteredStaff = useMemo(() => { const term = pickerSearch.toLowerCase().trim(); if (!term) return staff; return staff.filter(s => s.name.toLowerCase().includes(term) || s.designation.toLowerCase().includes(term) || s.email.toLowerCase().includes(term)); }, [staff, pickerSearch]);

  const selectedUnit = selectedUnitId && selectedUnitId !== "unassigned" ? unitMap.get(selectedUnitId) || null : null;
  const selectedTeam = selectedTeamId ? teamMap.get(selectedTeamId) || null : null;
  const unassignedStaff = useMemo(() => staff.filter(s => !s.unitId && !s.teamId), [staff]);

  const getRoleLabel = (person: Staff): string => {
    if (units.some(u => u.headId === person.id)) return "Department Head";
    if (teams.some(t => t.headId === person.id)) return "Team Leader";
    if (!person.unitId && !person.teamId) return "Unassigned";
    return "Team Member";
  };

  const roleBadgeClasses = (role: string) => {
    switch (role) {
      case "Department Head": return "bg-emerald-50 text-emerald-600 border border-indigo-100";
      case "Team Leader": return "bg-amber-50 text-amber-700 border border-amber-100";
      case "Unassigned": return "bg-slate-100 text-slate-500 border border-slate-200";
      default: return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const displayedStaff = useMemo(() => {
    let result = staff;
    if (selectedTeamId) result = result.filter(s => s.teamId === selectedTeamId);
    else if (selectedUnitId === "unassigned") result = result.filter(s => !s.unitId && !s.teamId);
    else if (selectedUnitId) result = result.filter(s => s.unitId === selectedUnitId);
    const term = searchQuery.toLowerCase().trim();
    if (term) result = result.filter(s => s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || s.designation.toLowerCase().includes(term));
    return result;
  }, [staff, selectedUnitId, selectedTeamId, searchQuery]);

  let pageTitle = "Entire Organization";
  if (selectedTeam) pageTitle = `Team: ${selectedTeam.name}`;
  else if (selectedUnitId === "unassigned") pageTitle = "Unassigned Staff";
  else if (selectedUnit) pageTitle = `Department: ${selectedUnit.name}`;

  const handleSelectUnit = (unitId: string) => { setSelectedUnitId(unitId); setSelectedTeamId(null); setMobileSidebarOpen(false); };
  const handleSelectTeam = (unitId: string, teamId: string) => { setSelectedUnitId(unitId); setSelectedTeamId(teamId); setMobileSidebarOpen(false); };
  const handleSelectEntireOrg = () => { setSelectedUnitId(null); setSelectedTeamId(null); setMobileSidebarOpen(false); };
  const handleSelectUnassigned = () => { setSelectedUnitId("unassigned"); setSelectedTeamId(null); setMobileSidebarOpen(false); };

  const renderSidebarContent = () => (
    <>
      {/* Sidebar Header — screenshot jevo */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={handleSelectEntireOrg} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-800 text-[15px]">Organization</span>
        </div>
        <button onClick={triggerAddUnit} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors border border-slate-200">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Entire Organization */}
        <div
          onClick={handleSelectEntireOrg}
          className={`flex items-center gap-2 mx-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-[13px] font-semibold mb-1 ${selectedUnitId === null ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:bg-slate-50"}`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Entire Organization</span>
        </div>

        {/* Units */}
        {units.map((unit) => {
          const unitTeams = teams.filter(t => t.unitId === unit.id);
          const head = unit.headId ? staffMap.get(unit.headId) : null;
          const isExpanded = !!expandedUnits[unit.id];
          const isUnitActive = selectedUnitId === unit.id && !selectedTeamId;

          return (
            <div key={unit.id} className="mb-0.5">
              <div
                onClick={() => handleSelectUnit(unit.id)}
                className={`group flex items-center justify-between gap-1 mx-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${isUnitActive ? "bg-emerald-50 text-emerald-600" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <button type="button" onClick={(e) => { e.stopPropagation(); setExpandedUnits(p => ({ ...p, [unit.id]: !p[unit.id] })); }} className="p-0.5 rounded text-slate-400 hover:text-slate-700 shrink-0">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span className="font-semibold text-[13px] truncate">{unit.name}</span>
                </div>
                {head && <span className="text-[10px] text-slate-400 font-medium shrink-0 truncate max-w-[80px]">Head: {head.name.split(" ")[0]}</span>}
              </div>

              {isExpanded && (
                <div className="ml-8 mr-2 space-y-0.5 mb-1">
                  {unitTeams.map((team) => {
                    const lead = team.headId ? staffMap.get(team.headId) : null;
                    const isTeamActive = selectedTeamId === team.id;
                    return (
                      <div
                        key={team.id}
                        onClick={() => handleSelectTeam(unit.id, team.id)}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-[12px] ${isTeamActive ? "bg-emerald-50 text-emerald-600 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Users className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="font-medium truncate">{team.name}</span>
                        </div>
                        {lead && <span className="text-[10px] text-slate-400 font-medium shrink-0">Lead: {lead.name.split(" ")[0]}</span>}
                      </div>
                    );
                  })}
                  <div onClick={() => triggerAddTeam(unit.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer text-[12px] text-emerald-500 hover:bg-emerald-50 font-medium transition-colors">
                    <Plus className="w-3 h-3" /><span>Add team</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Unassigned section — screenshot jevo */}
        <div className="mx-2 mt-2 border-t border-slate-100 pt-2">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Unassigned Teams</div>
          <div
            onClick={handleSelectUnassigned}
            className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-[12px] ${selectedUnitId === "unassigned" ? "bg-amber-50 text-amber-700 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <div className="flex items-center gap-1.5">
              <UserMinus className="w-3.5 h-3.5 shrink-0" />
              <span>{unassignedStaff.length === 0 ? "No teams" : `${unassignedStaff.length} staff`}</span>
            </div>
          </div>
          {unassignedStaff.length === 0 && (
            <p className="px-2.5 py-1 text-[11px] text-slate-300 italic">No teams</p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white font-sans text-xs">

        {/* FULL WIDTH HEADER */}
        <div className="bg-emerald-700 text-white px-6 py-4 shadow-md shrink-0">
          <h1 className="text-sm font-semibold">Staff</h1>
          <p className="text-[11px] opacity-80 mt-0.5">Manage your organization staff</p>
        </div>

        <div className="flex flex-1 overflow-hidden">

        {/* TOAST */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -45, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl max-w-md ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : toast.type === "info" ? "bg-white text-slate-800 border-slate-200" : "bg-orange-50 text-orange-800 border-orange-200"}`}>
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
              <span className="font-medium text-[11px]">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONFIRM DIALOG */}
        <AnimatePresence>
          {confirmDialog && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="space-y-1"><h3 className="font-bold text-sm text-slate-800">{confirmDialog.title}</h3><p className="text-slate-500 leading-relaxed text-[11px]">{confirmDialog.message}</p></div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setConfirmDialog(null)} className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold cursor-pointer transition-colors">Cancel</button>
                  <button type="button" onClick={confirmDialog.onConfirm} className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer transition-colors">Proceed</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── LEFT ORG SIDEBAR — screenshot jevi white sidebar ── */}
        <aside className="w-72 h-full border-r border-slate-200 bg-white shrink-0 hidden lg:flex lg:flex-col select-none">
          {renderSidebarContent()}
        </aside>

        {/* MOBILE SIDEBAR */}
        <AnimatePresence>
          {mobileSidebarOpen && <div onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" />}
        </AnimatePresence>
        <div className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform lg:hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {renderSidebarContent()}
        </div>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 h-full overflow-y-auto bg-white flex flex-col">

          {/* PAGE HEADER — screenshot jevo: title + Add User button */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className="p-1.5 rounded-lg border border-slate-200 bg-white block lg:hidden hover:bg-slate-50 text-slate-500 shrink-0">
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-[18px] font-bold text-slate-800 leading-tight">{pageTitle}</h1>
                <p className="text-slate-400 text-[13px] mt-0.5">
                  {displayedStaff.length} member{displayedStaff.length === 1 ? "" : "s"} found
                  {selectedUnit && <> · Head: <span className="font-semibold text-slate-600">{selectedUnit.headId ? staffMap.get(selectedUnit.headId)?.name : "None"}</span></>}
                  {selectedTeam && <> · Lead: <span className="font-semibold text-slate-600">{selectedTeam.headId ? staffMap.get(selectedTeam.headId)?.name : "None"}</span></>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedUnit && !selectedTeam && (
                <>
                  <button onClick={() => triggerEditUnit(selectedUnit)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 font-semibold text-slate-700 cursor-pointer transition-colors text-[12px]">
                    <Edit2 className="w-3.5 h-3.5" /><span>Edit Unit</span>
                  </button>
                  <button onClick={() => handleDeleteUnit(selectedUnit.id, selectedUnit.name)} className="p-2 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-400 cursor-pointer transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              {selectedTeam && (
                <>
                  <button onClick={() => triggerEditTeam(selectedTeam)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 font-semibold text-slate-700 cursor-pointer transition-colors text-[12px]">
                    <Edit2 className="w-3.5 h-3.5" /><span>Edit Team</span>
                  </button>
                  <button onClick={() => handleDeleteTeam(selectedTeam.id, selectedTeam.name)} className="p-2 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-400 cursor-pointer transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => triggerAddStaff(selectedUnitId === "unassigned" || selectedUnitId === null ? null : selectedUnitId, selectedTeamId)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold text-white cursor-pointer transition-colors text-[13px]"
              >
                <UserPlus className="w-4 h-4" /><span>Add User</span>
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-1 overflow-auto px-6 pt-4 ">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 pr-4">User</th>
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 pr-4">Role</th>
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 pr-4">Department</th>
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 pr-4">Team</th>
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 pr-4">Status</th>
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedStaff.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-slate-300 italic text-[13px]">No staff members found for this view.</td></tr>
                ) : (
                  displayedStaff.map((person) => {
                    const role = getRoleLabel(person);
                    const unit = person.unitId ? unitMap.get(person.unitId) : null;
                    const team = person.teamId ? teamMap.get(person.teamId) : null;
                    return (
                      <tr key={person.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[12px] uppercase shrink-0">{person.name.charAt(0)}</div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 text-[13px] leading-tight truncate">{person.name}</div>
                              <div className="text-slate-400 text-[11px] truncate">{person.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${roleBadgeClasses(role)}`}>{role}</span>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-600 text-[13px]">{unit ? unit.name : <span className="text-slate-300 italic">Unassigned</span>}</td>
                        <td className="py-3.5 pr-4 text-slate-600 text-[13px]">{team ? team.name : <span className="text-slate-300 italic">None</span>}</td>
                        <td className="py-3.5 pr-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => triggerEditStaff(person)} className="p-1.5 rounded-lg text-slate-600 bg-slate-100 cursor-pointer transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => triggerTransferStaff(person)} className="p-1.5 rounded-lg text-emerald-500 bg-indigo-50 cursor-pointer transition-colors"><ArrowRightLeft className="w-3.5 h-3.5" /></button>
                            <button onClick={() => triggerPromoteToTeam(person)} className="p-1.5 rounded-lg text-amber-500 bg-amber-50 cursor-pointer transition-colors"><Crown className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteStaff(person.id, person.name)} className="p-1.5 rounded-lg text-red-500 bg-red-50 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* DRAWER */}
        <AnimatePresence>
          {drawer.type !== null && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm cursor-pointer" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[400px] bg-white flex flex-col shadow-2xl font-sans">

                {/* Drawer Header */}
                <div className="bg-emerald-500 px-5 py-4 flex items-center justify-between shrink-0">
                  <h3 className="font-semibold text-[15px] text-white tracking-tight">{drawer.title}</h3>
                  <button type="button" onClick={closeDrawer} className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white cursor-pointer transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-100">

                  {/* Unit Form */}
                  {(drawer.type === "add-unit" || drawer.type === "edit-unit") && (
                    <form onSubmit={handleSaveUnit}>
                      <div className="bg-white mx-0 mt-3 mx-4 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-4 pt-4 pb-2 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Unit Name *</label>
                            <input type="text" required placeholder="e.g. Sales Division" value={unitForm.name} onChange={(e) => setUnitForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Unit Head</label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5 text-sm text-slate-700 flex items-center justify-between min-w-0">
                                <span className="truncate">{unitForm.headId ? staffMap.get(unitForm.headId)?.name : <span className="text-slate-400">Not assigned</span>}</span>
                                {unitForm.headId && <button type="button" onClick={() => setUnitForm(p => ({ ...p, headId: "" }))} className="text-slate-400 hover:text-slate-600 ml-2 shrink-0"><X className="w-3.5 h-3.5" /></button>}
                              </div>
                              <button type="button" onClick={() => triggerUserPicker(unitForm.headId, (sId) => { setUnitForm(p => ({ ...p, headId: sId })); closeDrawer(); setDrawer(prev => ({ ...prev, type: drawer.type })); })} className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-colors">Choose</button>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 pb-4 pt-2">
                          <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer transition-colors text-sm">Save Unit</button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Team Form */}
                  {(drawer.type === "add-team" || drawer.type === "edit-team") && (
                    <form onSubmit={handleSaveTeam}>
                      <div className="bg-white mt-3 mx-4 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-4 pt-4 pb-2 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Team Name *</label>
                            <input type="text" required placeholder="e.g. Enterprise Sales" value={teamForm.name} onChange={(e) => setTeamForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Parent Unit *</label>
                            <select required value={teamForm.unitId} onChange={(e) => setTeamForm(p => ({ ...p, unitId: e.target.value }))} className="w-full bg-gray-100 text-slate-800 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                              <option value="">— Choose Unit —</option>
                              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Team Lead</label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5 text-sm text-slate-700 flex items-center justify-between min-w-0">
                                <span className="truncate">{teamForm.headId ? staffMap.get(teamForm.headId)?.name : <span className="text-slate-400">Not assigned</span>}</span>
                                {teamForm.headId && <button type="button" onClick={() => setTeamForm(p => ({ ...p, headId: "" }))} className="text-slate-400 hover:text-slate-600 ml-2 shrink-0"><X className="w-3.5 h-3.5" /></button>}
                              </div>
                              <button type="button" onClick={() => triggerUserPicker(teamForm.headId, (sId) => { setTeamForm(p => ({ ...p, headId: sId })); closeDrawer(); setDrawer(prev => ({ ...prev, type: drawer.type })); })} className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-colors">Choose</button>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 pb-4 pt-2">
                          <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer transition-colors text-sm">Save Team</button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Staff Form */}
                  {(drawer.type === "add-staff" || drawer.type === "edit-staff") && (
                    <form onSubmit={handleSaveStaff}>
                      {/* Avatar preview */}
                      <div className="flex justify-center pt-5 pb-2">
                        
                      </div>
                      <div className="bg-white mt-2 mx-4 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 pt-4 pb-2 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Full Name *</label>
                            <input type="text" required placeholder="e.g. Manav Shah" value={staffForm.name} onChange={(e) => setStaffForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Designation *</label>
                            <select required value={staffForm.designation} onChange={(e) => setStaffForm(p => ({ ...p, designation: e.target.value }))} className="w-full bg-gray-100 text-slate-800 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                              <option value="">Select Designation</option>
                              {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Email</label>
                            <input type="email" placeholder="name@acme.com" value={staffForm.email} onChange={(e) => setStaffForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Phone</label>
                            <input type="text" placeholder="+1 (555) 000-0000" value={staffForm.phone} onChange={(e) => setStaffForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-white mt-3 mx-4 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 pt-4 pb-2 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Business Unit</label>
                            <select value={staffForm.unitId} onChange={(e) => setStaffForm(p => ({ ...p, unitId: e.target.value, teamId: "" }))} className="w-full bg-gray-100 text-slate-800 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                              <option value="">Unassigned</option>
                              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Squad Team</label>
                            <select value={staffForm.teamId} disabled={!staffForm.unitId} onChange={(e) => setStaffForm(p => ({ ...p, teamId: e.target.value }))} className="w-full bg-gray-100 text-slate-800 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-40">
                              <option value="">None</option>
                              {staffFormTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="px-4 pb-4 pt-2">
                          <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer transition-colors text-sm">Save Profile</button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* User Picker */}
                  {drawer.type === "user-picker" && (
                    <div className="p-4 space-y-3">
                      {!isCreatingUserPicker ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Select Staff</span>
                            <button onClick={() => setIsCreatingUserPicker(true)} className="flex items-center gap-1 text-[12px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer">
                              <Plus className="w-3.5 h-3.5" /> Create New
                            </button>
                          </div>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search by name or role..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} className="w-full bg-white text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm" />
                          </div>
                          <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
                            {pickerFilteredStaff.map((person) => {
                              const isChecked = drawer.payload?.currentSelectionId === person.id;
                              return (
                                <div key={person.id} onClick={() => { if (drawer.payload?.onSelect) drawer.payload.onSelect(person.id); }}
                                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isChecked ? "bg-emerald-50 border border-emerald-500" : "bg-white border border-transparent hover:bg-slate-50 hover:border-slate-200"}`}>
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold uppercase shrink-0 ${isChecked ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                                    {person.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${isChecked ? "text-emerald-700" : "text-slate-800"}`}>{person.name}</p>
                                    <p className="text-[11px] text-slate-400 truncate">{person.designation}</p>
                                  </div>
                                  {isChecked && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <form onSubmit={handleCreateUserInsidePicker} className="space-y-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">New User</span>
                            <button type="button" onClick={() => setIsCreatingUserPicker(false)} className="text-[12px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer">← Back</button>
                          </div>
                          <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
                            <div className="space-y-1"><label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Full Name *</label><input type="text" required placeholder="e.g. Manav Shah" value={pickerForm.name} onChange={(e) => setPickerForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" /></div>
                            <div className="space-y-1"><label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Designation</label><input type="text" placeholder="e.g. Associate" value={pickerForm.designation} onChange={(e) => setPickerForm(p => ({ ...p, designation: e.target.value }))} className="w-full bg-gray-100 text-slate-800 placeholder-slate-400 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" /></div>
                            <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer transition-colors text-sm">Create & Select</button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Transfer Staff */}
                  {drawer.type === "transfer-staff" && drawer.targetId && (() => {
                    const person = staffMap.get(drawer.targetId!);
                    return (
                      <div className="p-4 space-y-3">
                        {person && (
                          <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg font-bold uppercase shrink-0">{person.name.charAt(0)}</div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-sm truncate">{person.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{person.designation}</p>
                            </div>
                          </div>
                        )}
                        <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Transfer to Unit</label>
                            <select value={drawer.payload?.unitId || ""} onChange={(e) => setDrawer(p => ({ ...p, payload: { ...p.payload, unitId: e.target.value, teamId: "" } }))} className="w-full bg-gray-100 text-slate-800 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                              <option value="">Unassigned</option>
                              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Transfer to Team</label>
                            <select value={drawer.payload?.teamId || ""} disabled={!drawer.payload?.unitId} onChange={(e) => setDrawer(p => ({ ...p, payload: { ...p.payload, teamId: e.target.value } }))} className="w-full bg-gray-100 text-slate-800 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-40">
                              <option value="">None</option>
                              {drawer.payload?.unitId && teams.filter(t => t.unitId === drawer.payload.unitId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          </div>
                          <button type="button" onClick={() => handleExecuteTransfer(drawer.targetId!, drawer.payload?.unitId || null, drawer.payload?.teamId || null)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer transition-colors text-sm">Confirm Transfer</button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Promote to Team Lead */}
                  {drawer.type === "promote-team" && drawer.targetId && (() => {
                    const person = staffMap.get(drawer.targetId!);
                    return (
                      <div className="p-4 space-y-3">
                        {person && (
                          <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg font-bold uppercase shrink-0">{person.name.charAt(0)}</div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-sm truncate">{person.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{person.designation}</p>
                              <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-amber-600"><Crown className="w-3 h-3" /> Promoting to Lead</span>
                            </div>
                          </div>
                        )}
                        <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Select Team</label>
                            <select value={drawer.payload?.selectedTeamId || ""} onChange={(e) => setDrawer(p => ({ ...p, payload: { ...p.payload, selectedTeamId: e.target.value } }))} className="w-full bg-gray-100 text-slate-800 border-0 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                              {teams.map(t => <option key={t.id} value={t.id}>{t.name} · {unitMap.get(t.unitId)?.name}</option>)}
                            </select>
                          </div>
                          <button type="button" onClick={() => handleExecuteTeamPromotion(drawer.targetId!, drawer.payload?.selectedTeamId)} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold cursor-pointer transition-colors text-sm">Confirm Promotion</button>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        </div>
      </div>
    </>
  );
}