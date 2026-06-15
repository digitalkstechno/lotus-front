"use client";
import { createContext, useContext, useState, useEffect } from "react";

const INITIAL_ITEMS = [
  { id: 1, text: "Physical stock (Grade / Batch / BIN) is matching with SAP Counting done daily basis & record available", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 2, text: "Empty Pellet stock Physical vs System is matching (Wherever applicable)", cat: "Essential", max: 2, yn: "Yes", score: 2, remarks: "" },
  { id: 3, text: "Monitoring the Goods in transit and escalate for not receipt of vehicle on time", cat: "Essential", max: 2, yn: "Yes", score: 2, remarks: "" },
  { id: 4, text: "Check for MGX process (System Vs Physical)", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 5, text: "Stock is maintained as per the Stacking Norms / BIN Capacity – For Polymer/Elastomer (considering Infrastructure Constraints)", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 6, text: "In case Of High stock escalate to Regional business / Zonal coordinator", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 7, text: "Designated area for keep CTTN / WET / Block BIN and damage bags", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 8, text: "Timely circulation of daily MIS with correct data and authenticity", cat: "Essential", max: 2, yn: "Yes", score: 2, remarks: "" },
  { id: 9, text: "Awareness of Logging Incident in SAP (ref SOP 2.18)", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 10, text: "FIFO process is followed for Polymer / Elastomer / Polyester", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 11, text: "Accounting of Wet and Shortage is done properly", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 12, text: "There is no unattended stock discrepancy", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 13, text: "Vehicles for Loading/Unloading is taken on FIFO Basis (Check for System report)", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 14, text: "Follow-up done with regional team for unaccounted Stock, Pallets, Promotional Items, Empty bag, Samples in WH", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 15, text: "Gap is maintained between wall and Stack", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 16, text: "Check for Additional bins created and material available in same bins (Physical Check)", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 17, text: "Loading and Unloading Charges Collected as per approved rates", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 18, text: "Employees are wearing the ID Cards and Uniform", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 19, text: "Aisles are clear of stocks for free movement of Labour and MHE's", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
  { id: 20, text: "Overnight stay of truckers inside w/h compound not allowed", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "Drivers parked their vehicle on village road if we not allow him in premises, therefore we have to allow vehicles if any reported in night" },
  { id: 21, text: "Proper locking and sealing process is followed", cat: "Vital", max: 3, yn: "Yes", score: 3, remarks: "" },
];

const INITIAL_INFO = {
  nameOf3PL: "",
  location: "",
  personMet: "",
  designation: "",
  assessedBy: "",
  date: "",
  month: "",
  periodFrom: "",
  periodTo: "",
};

const DATA_KEY = "warehouse-checklist-data";
const RECORDS_KEY = "warehouse-checklist-records";

const ChecklistContext = createContext(null);

export function ChecklistProvider({ children }) {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [info, setInfo] = useState(INITIAL_INFO);
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.items) setItems(parsed.items);
        if (parsed.info) setInfo(parsed.info);
      }
      const rawRecords = localStorage.getItem(RECORDS_KEY);
      if (rawRecords) setRecords(JSON.parse(rawRecords));
    } catch (e) {
      console.error("Failed to load checklist data", e);
    }
    setLoaded(true);
  }, []);

  // Persist current working draft
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify({ items, info }));
    } catch (e) {
      console.error("Failed to save checklist data", e);
    }
  }, [items, info, loaded]);

  // Persist saved records
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (e) {
      console.error("Failed to save records", e);
    }
  }, [records, loaded]);

  function updateItem(id, field, val) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: val } : it));
  }

  function setInfoField(key) {
    return (val) => setInfo((p) => ({ ...p, [key]: val }));
  }

  // Save current info+items as a new record
  function saveRecord() {
    const totalScore = items.reduce((s, it) => s + it.score, 0);
    const maxScore = items.reduce((s, it) => s + it.max, 0);

    const record = {
      id: Date.now(),
      slipNo: records.length + 1,
      info: { ...info },
      items: items.map((it) => ({ ...it })),
      totalScore,
      maxScore,
      savedAt: new Date().toISOString(),
    };

    setRecords((prev) => [record, ...prev]);
    return record;
  }

  function updateRecord(id, patch) {
    setRecords((prev) =>
      prev.map((r) => (String(r.id) === String(id) ? { ...r, ...patch } : r))
    );
  }
  function deleteRecord(id) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function getRecord(id) {
    return records.find((r) => String(r.id) === String(id));
  }

  return (
    <ChecklistContext.Provider
      value={{
        items, info, records, loaded,
        updateItem, setInfoField, setInfo,
        saveRecord, deleteRecord, getRecord, updateRecord,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const ctx = useContext(ChecklistContext);
  if (!ctx) throw new Error("useChecklist must be used within ChecklistProvider");
  return ctx;
}