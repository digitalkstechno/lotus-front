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
import Sidebar from "../components/sidebar";

// Interfaces
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

// Initial Seed Data
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

export default function OrgStructurePage() {
  // Application Dynamic State
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

  // Persists in localStorage
  useEffect(() => {
    localStorage.setItem("org_units", JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem("org_teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("org_staff", JSON.stringify(staff));
  }, [staff]);

  // UI Control States
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Navigation selection: which unit / team is being viewed in the main table
  // selectedUnitId can be: null (Entire Organization), "unassigned", or a unit id
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>("u-1");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Expanded Accordion nodes (sidebar tree)
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    "u-1": true,
    "u-2": true,
    "u-3": true,
  });

  // Toast Notification Message
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warn" } | null>(null);
  const showToast = (message: string, type: "success" | "info" | "warn" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Reusable Multi-purpose slide-over drawers State
  const [drawer, setDrawer] = useState<{
    type: "add-unit" | "edit-unit" | "add-team" | "edit-team" | "add-staff" | "edit-staff" | "user-picker" | "transfer-staff" | "promote-unit" | "promote-team" | null;
    title: string;
    targetId?: string; // used for updates
    payload?: any;     // arbitrary payload (eg. custom callback or intermediate selections)
  }>({ type: null, title: "" });

  const closeDrawer = () => {
    setDrawer({ type: null, title: "" });
  };

  // User Picker states inside its specialized drawer mode
  const [pickerSearch, setPickerSearch] = useState("");
  const [isCreatingUserPicker, setIsCreatingUserPicker] = useState(false);
  const [pickerForm, setPickerForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: ""
  });

  // Standard form fields
  const [unitForm, setUnitForm] = useState({ name: "", headId: "" });
  const [teamForm, setTeamForm] = useState({ name: "", unitId: "", headId: "" });
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    unitId: "",
    teamId: ""
  });

  // Confirmation Dialogue overlay
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Helper dictionary lookups
  const staffMap = useMemo(() => {
    const map = new Map<string, Staff>();
    staff.forEach(s => map.set(s.id, s));
    return map;
  }, [staff]);

  const unitMap = useMemo(() => {
    const map = new Map<string, Unit>();
    units.forEach(u => map.set(u.id, u));
    return map;
  }, [units]);

  const teamMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach(t => map.set(t.id, t));
    return map;
  }, [teams]);

  // Reusable helper to seed new user inside Picker Form
  const handleCreateUserInsidePicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickerForm.name.trim()) return;

    const newStaffId = `s-${Date.now()}`;
    const newStaffItem: Staff = {
      id: newStaffId,
      name: pickerForm.name,
      email: pickerForm.email || `${pickerForm.name.toLowerCase().replace(/\s+/g, ".")}@corp.acme.com`,
      phone: pickerForm.phone || "+1 (555) 000-0000",
      designation: pickerForm.designation || "Associate Specialist",
      unitId: null,
      teamId: null
    };

    setStaff(prev => [...prev, newStaffItem]);
    showToast(`Staff member "${pickerForm.name}" created and auto-selected!`);

    // Reset forms & invoke selection callback
    setPickerForm({ name: "", email: "", phone: "", designation: "" });
    setIsCreatingUserPicker(false);

    // Auto-select on the active form / callback
    if (drawer.payload?.onSelect) {
      drawer.payload.onSelect(newStaffId);
    }
  };

  // Save changes on ADD/EDIT interfaces
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.name.trim()) return;

    if (drawer.type === "add-unit") {
      const newId = `u-${Date.now()}`;
      const newUnit: Unit = {
        id: newId,
        name: unitForm.name,
        headId: unitForm.headId || null
      };

      setUnits(prev => [...prev, newUnit]);
      if (unitForm.headId) {
        setStaff(prev => prev.map(s => s.id === unitForm.headId ? { ...s, unitId: newId } : s));
      }
      showToast(`Successfully created "${unitForm.name}" unit.`);
    } else if (drawer.type === "edit-unit" && drawer.targetId) {
      const oldUnit = units.find(u => u.id === drawer.targetId);

      setUnits(prev => prev.map(u => u.id === drawer.targetId ? { ...u, name: unitForm.name, headId: unitForm.headId || null } : u));

      if (unitForm.headId && unitForm.headId !== oldUnit?.headId) {
        setStaff(prev => prev.map(s => s.id === unitForm.headId ? { ...s, unitId: drawer.targetId! } : s));
      }
      showToast(`Updated Unit details for "${unitForm.name}".`);
    }
    closeDrawer();
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name.trim() || !teamForm.unitId) return;

    if (drawer.type === "add-team") {
      const newId = `t-${Date.now()}`;
      const newTeam: Team = {
        id: newId,
        name: teamForm.name,
        unitId: teamForm.unitId,
        headId: teamForm.headId || null
      };

      setTeams(prev => [...prev, newTeam]);
      if (teamForm.headId) {
        setStaff(prev => prev.map(s => s.id === teamForm.headId ? { ...s, unitId: teamForm.unitId, teamId: newId } : s));
      }
      showToast(`Team "${teamForm.name}" successfully established.`);
    } else if (drawer.type === "edit-team" && drawer.targetId) {
      const oldTeam = teams.find(t => t.id === drawer.targetId);

      setTeams(prev => prev.map(t => t.id === drawer.targetId ? { ...t, name: teamForm.name, unitId: teamForm.unitId, headId: teamForm.headId || null } : t));

      if (teamForm.headId && teamForm.headId !== oldTeam?.headId) {
        setStaff(prev => prev.map(s => s.id === teamForm.headId ? { ...s, unitId: teamForm.unitId, teamId: drawer.targetId! } : s));
      }
      showToast(`Team "${teamForm.name}" information updated.`);
    }
    closeDrawer();
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim()) return;

    if (drawer.type === "add-staff") {
      const newId = `s-${Date.now()}`;
      const newStaff: Staff = {
        id: newId,
        name: staffForm.name,
        email: staffForm.email || `${staffForm.name.toLowerCase().replace(/\s+/g, ".")}@corp.acme.com`,
        phone: staffForm.phone || "+1 (555) 000-0000",
        designation: staffForm.designation || "Staff Specialist",
        unitId: staffForm.unitId || null,
        teamId: staffForm.teamId || null
      };

      setStaff(prev => [...prev, newStaff]);
      showToast(`Staff profile for "${staffForm.name}" added successfully.`);
    } else if (drawer.type === "edit-staff" && drawer.targetId) {
      setStaff(prev => prev.map(s => s.id === drawer.targetId ? {
        ...s,
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone,
        designation: staffForm.designation,
        unitId: staffForm.unitId || null,
        teamId: staffForm.teamId || null
      } : s));
      showToast(`Staff information saved.`);
    }
    closeDrawer();
  };

  // Helper trigger to auto filter team options when adding/editing staff
  const staffFormTeams = useMemo(() => {
    if (!staffForm.unitId) return [];
    return teams.filter(t => t.unitId === staffForm.unitId);
  }, [teams, staffForm.unitId]);

  // Cascade Deletes
  const handleDeleteUnit = (id: string, name: string) => {
    setConfirmDialog({
      title: "Delete Organizational Unit?",
      message: `Are you absolute certain you wish to delete "${name}"? All nested teams and personnel will be orphaned (unassigned).`,
      onConfirm: () => {
        setUnits(prev => prev.filter(u => u.id !== id));
        setStaff(prev => prev.map(s => s.unitId === id ? { ...s, unitId: null, teamId: null } : s));
        setTeams(prev => prev.filter(t => t.unitId !== id));
        if (selectedUnitId === id) {
          setSelectedUnitId(null);
          setSelectedTeamId(null);
        }
        showToast(`Unit "${name}" deleted.`);
        setConfirmDialog(null);
      }
    });
  };

  const handleDeleteTeam = (id: string, name: string) => {
    setConfirmDialog({
      title: "Disband Team?",
      message: `Ensure you want to remove the team "${name}"? Personnel in this team will become standard unit staff members.`,
      onConfirm: () => {
        setTeams(prev => prev.filter(t => t.id !== id));
        setStaff(prev => prev.map(s => s.teamId === id ? { ...s, teamId: null } : s));
        if (selectedTeamId === id) setSelectedTeamId(null);
        showToast(`Team "${name}" disbanded.`);
        setConfirmDialog(null);
      }
    });
  };

  const handleDeleteStaff = (id: string, name: string) => {
    setConfirmDialog({
      title: "Remove Staff Profile?",
      message: `This will fully clear "${name}" from your active directory database. This cannot be undone.`,
      onConfirm: () => {
        setStaff(prev => prev.filter(s => s.id !== id));
        setUnits(prev => prev.map(u => u.headId === id ? { ...u, headId: null } : u));
        setTeams(prev => prev.map(t => t.headId === id ? { ...t, headId: null } : t));
        showToast(`Staff record for "${name}" deleted successfully.`);
        setConfirmDialog(null);
      }
    });
  };

  // Smart Promotion Core Actions
  const handleExecuteUnitPromotion = (staffId: string, unitId: string) => {
    const candidate = staffMap.get(staffId);
    const targetUnit = unitMap.get(unitId);
    if (!candidate || !targetUnit) return;

    const oldHeadId = targetUnit.headId;
    const oldHeadName = oldHeadId ? staffMap.get(oldHeadId)?.name : null;

    const executePromote = () => {
      setUnits(prev => prev.map(u => u.id === unitId ? { ...u, headId: staffId } : u));
      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, unitId: unitId, teamId: s.unitId === unitId ? s.teamId : null } : s));

      showToast(`Smart Promotion Successful! Head of "${targetUnit.name}" is now ${candidate.name}.`);
      setConfirmDialog(null);
      closeDrawer();
    };

    if (oldHeadId && oldHeadId !== staffId) {
      setConfirmDialog({
        title: "Confirm Smart Replacement",
        message: `Currently, ${oldHeadName} is the head of ${targetUnit.name}. Smart Promotion will replace existing head with ${candidate.name}. Proceed?`,
        onConfirm: executePromote
      });
    } else {
      executePromote();
    }
  };

  const handleExecuteTeamPromotion = (staffId: string, teamId: string) => {
    const candidate = staffMap.get(staffId);
    const targetTeam = teamMap.get(teamId);
    if (!candidate || !targetTeam) return;

    const oldHeadId = targetTeam.headId;
    const oldHeadName = oldHeadId ? staffMap.get(oldHeadId)?.name : null;

    const executePromote = () => {
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, headId: staffId } : t));
      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, unitId: targetTeam.unitId, teamId: teamId } : s));

      showToast(`Smart Promotion Successful! Team Lead of "${targetTeam.name}" is now ${candidate.name}.`);
      setConfirmDialog(null);
      closeDrawer();
    };

    if (oldHeadId && oldHeadId !== staffId) {
      setConfirmDialog({
        title: "Confirm Lead Replacement",
        message: `Currently, ${oldHeadName} is the Lead of ${targetTeam.name}. Smart Promotion will replace existing lead with ${candidate.name}. Proceed?`,
        onConfirm: executePromote
      });
    } else {
      executePromote();
    }
  };

  // Fast staff Transfer action
  const handleExecuteTransfer = (staffId: string, destUnitId: string | null, destTeamId: string | null) => {
    const candidate = staffMap.get(staffId);
    if (!candidate) return;

    setStaff(prev => prev.map(s => s.id === staffId ? {
      ...s,
      unitId: destUnitId,
      teamId: destTeamId
    } : s));

    if (destUnitId && candidate.unitId !== destUnitId) {
      setUnits(prev => prev.map(u => u.id === candidate.unitId && u.headId === staffId ? { ...u, headId: null } : u));
    }
    if (destTeamId && candidate.teamId !== destTeamId) {
      setTeams(prev => prev.map(t => t.id === candidate.teamId && t.headId === staffId ? { ...t, headId: null } : t));
    }

    const unitName = destUnitId ? unitMap.get(destUnitId)?.name : "Unassigned";
    const teamName = destTeamId ? teamMap.get(destTeamId)?.name : "None";

    showToast(`Transferred "${candidate.name}" to ${unitName} (${teamName}).`);
    closeDrawer();
  };

  // Import / Export Operations
  const handleExportData = () => {
    const payload = {
      units,
      teams,
      staff,
      exportVersion: "1.0",
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `org_hierarchy_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Data exported as JSON file successfully.", "success");
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(loadedData.units) && Array.isArray(loadedData.teams) && Array.isArray(loadedData.staff)) {
          setUnits(loadedData.units);
          setTeams(loadedData.teams);
          setStaff(loadedData.staff);
          showToast("Successfully imported complete Org Structure configurations!", "success");
        } else {
          showToast("Error: Invalid JSON scheme structure. Must include fields 'units', 'teams', and 'staff'.", "warn");
        }
      } catch (err) {
        showToast("Error reading file. Ensure it is a valid JSON schema.", "warn");
      }
    };
    fileReader.readAsText(file);
    e.target.value = "";
  };

  // Clean Reset to Factory Org Seeds
  const handleResetToSeeds = () => {
    setConfirmDialog({
      title: "Reset to Default Seed Data?",
      message: "Are you sure you want to discard your current dashboard state and restore the original Demo Org structure?",
      onConfirm: () => {
        setUnits(INITIAL_UNITS);
        setTeams(INITIAL_TEAMS);
        setStaff(INITIAL_STAFF);
        setExpandedUnits({ "u-1": true, "u-2": true, "u-3": true });
        setSelectedUnitId("u-1");
        setSelectedTeamId(null);
        showToast("Restored original directory seed templates.", "info");
        setConfirmDialog(null);
      }
    });
  };

  // Inline forms helpers triggered by CTA buttons
  const triggerAddUnit = () => {
    setUnitForm({ name: "", headId: "" });
    setDrawer({ type: "add-unit", title: "Establish New Unit Drawer" });
  };

  const triggerEditUnit = (unit: Unit) => {
    setUnitForm({ name: unit.name, headId: unit.headId || "" });
    setDrawer({ type: "edit-unit", title: `Modify ${unit.name} Unit`, targetId: unit.id });
  };

  const triggerAddTeam = (prefillUnitId?: string) => {
    setTeamForm({ name: "", unitId: prefillUnitId || units[0]?.id || "", headId: "" });
    setDrawer({ type: "add-team", title: "Establish New Squad Team" });
  };

  const triggerEditTeam = (team: Team) => {
    setTeamForm({ name: team.name, unitId: team.unitId, headId: team.headId || "" });
    setDrawer({ type: "edit-team", title: `Modify ${team.name} Squad`, targetId: team.id });
  };

  const triggerAddStaff = (prefillUnitId?: string | null, prefillTeamId?: string | null) => {
    setStaffForm({
      name: "",
      email: "",
      phone: "",
      designation: "",
      unitId: prefillUnitId || "",
      teamId: prefillTeamId || ""
    });
    setDrawer({ type: "add-staff", title: "Add New Staff Member" });
  };

  const triggerEditStaff = (personnel: Staff) => {
    setStaffForm({
      name: personnel.name,
      email: personnel.email,
      phone: personnel.phone,
      designation: personnel.designation,
      unitId: personnel.unitId || "",
      teamId: personnel.teamId || ""
    });
    setDrawer({ type: "edit-staff", title: `Edit ${personnel.name}'s Profile`, targetId: personnel.id });
  };

  const triggerTransferStaff = (personnel: Staff) => {
    setDrawer({
      type: "transfer-staff",
      title: `Transfer ${personnel.name}`,
      targetId: personnel.id,
      payload: { unitId: personnel.unitId || "", teamId: personnel.teamId || "" }
    });
  };

  const triggerPromoteToUnit = (personnel: Staff) => {
    setDrawer({
      type: "promote-unit",
      title: `Promote ${personnel.name} to Unit Head`,
      targetId: personnel.id,
      payload: { selectedUnitId: personnel.unitId || units[0]?.id || "" }
    });
  };

  const triggerPromoteToTeam = (personnel: Staff) => {
    setDrawer({
      type: "promote-team",
      title: `Promote ${personnel.name} to Team Lead`,
      targetId: personnel.id,
      payload: { selectedTeamId: personnel.teamId || teams[0]?.id || "" }
    });
  };

  // Opens the general reusable selection drawer for picking employees
  const triggerUserPicker = (currentSelectionId: string | null, onSelect: (staffId: string) => void) => {
    setPickerSearch("");
    setIsCreatingUserPicker(false);
    setPickerForm({ name: "", email: "", phone: "", designation: "" });
    setDrawer({
      type: "user-picker",
      title: "Select Active Directory Staff",
      payload: { currentSelectionId, onSelect }
    });
  };

  // Dynamic filtered picker staff selection option
  const pickerFilteredStaff = useMemo(() => {
    const term = pickerSearch.toLowerCase().trim();
    if (!term) return staff;
    return staff.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.designation.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  }, [staff, pickerSearch]);

  // ----------------------------------------------------------------
  // NAVIGATION + TABLE DATA DERIVATION
  // ----------------------------------------------------------------
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
      case "Department Head":
        return "bg-indigo-50 text-indigo-700 border border-indigo-100";
      case "Team Leader":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "Unassigned":
        return "bg-slate-100 text-slate-500 border border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const displayedStaff = useMemo(() => {
    let result = staff;

    if (selectedTeamId) {
      result = result.filter(s => s.teamId === selectedTeamId);
    } else if (selectedUnitId === "unassigned") {
      result = result.filter(s => !s.unitId && !s.teamId);
    } else if (selectedUnitId) {
      result = result.filter(s => s.unitId === selectedUnitId);
    }

    const term = searchQuery.toLowerCase().trim();
    if (term) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.designation.toLowerCase().includes(term)
      );
    }

    return result;
  }, [staff, selectedUnitId, selectedTeamId, searchQuery]);

  let pageTitle = "Entire Organization";
  if (selectedTeam) {
    pageTitle = `Team: ${selectedTeam.name}`;
  } else if (selectedUnitId === "unassigned") {
    pageTitle = "Unassigned Staff";
  } else if (selectedUnit) {
    pageTitle = `Department: ${selectedUnit.name}`;
  }

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setSelectedTeamId(null);
    setMobileSidebarOpen(false);
  };

  const handleSelectTeam = (unitId: string, teamId: string) => {
    setSelectedUnitId(unitId);
    setSelectedTeamId(teamId);
    setMobileSidebarOpen(false);
  };

  const handleSelectEntireOrg = () => {
    setSelectedUnitId(null);
    setSelectedTeamId(null);
    setMobileSidebarOpen(false);
  };

  const handleSelectUnassigned = () => {
    setSelectedUnitId("unassigned");
    setSelectedTeamId(null);
    setMobileSidebarOpen(false);
  };

  // ----------------------------------------------------------------
  // SIDEBAR CONTENT (shared between desktop + mobile)
  // ----------------------------------------------------------------
  const renderSidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectEntireOrg}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Back to Entire Organization"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-slate-800 tracking-tight text-[14px]">Organization</span>
        </div>
        <button
          onClick={triggerAddUnit}
          title="Add new unit"
          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">

        {/* Entire Organization Row */}
        <div
          onClick={handleSelectEntireOrg}
          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors font-bold text-[12px] ${selectedUnitId === null
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-600 hover:bg-slate-50"
            }`}
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
            <div key={unit.id} className="space-y-0.5">
              <div
                onClick={() => handleSelectUnit(unit.id)}
                className={`group flex items-center justify-between gap-1 px-2 py-2 rounded-lg cursor-pointer transition-colors ${isUnitActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedUnits(p => ({ ...p, [unit.id]: !p[unit.id] }));
                    }}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 shrink-0"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                  <span className="font-bold text-[12px] truncate">{unit.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold shrink-0 truncate max-w-[90px]">
                  {head ? `Head: ${head.name}` : ""}
                </span>
              </div>

              {isExpanded && (
                <div className="pl-7 space-y-0.5">
                  {unitTeams.map((team) => {
                    const lead = team.headId ? staffMap.get(team.headId) : null;
                    const isTeamActive = selectedTeamId === team.id;
                    return (
                      <div
                        key={team.id}
                        onClick={() => handleSelectTeam(unit.id, team.id)}
                        className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-[11px] ${isTeamActive ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Users className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="font-semibold truncate">{team.name}</span>
                        </div>
                        {lead && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold shrink-0 truncate max-w-[80px]">
                            Lead: {lead.name.split(" ")[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  <div
                    onClick={() => triggerAddTeam(unit.id)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-[11px] text-indigo-500 hover:bg-indigo-50 font-bold transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add team</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unassigned Staff section */}
      <div className="p-2 border-t border-slate-100">
        <div
          onClick={handleSelectUnassigned}
          className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors font-bold text-[11px] uppercase tracking-wider ${selectedUnitId === "unassigned" ? "bg-amber-50 text-amber-700" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            }`}
        >
          <div className="flex items-center gap-2">
            <UserMinus className="w-3.5 h-3.5" />
            <span>Unassigned staff</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 normal-case font-extrabold">
            {unassignedStaff.length}
          </span>
        </div>
        {unassignedStaff.length === 0 && (
          <p className="px-2.5 pt-1 pb-1 text-[10px] text-slate-300 italic">No unassigned staff</p>
        )}
      </div>
    </>
  );

  return (
    <>
    </>
  );
}