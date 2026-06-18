"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { createChecklistApi, getChecklistsApi, updateChecklistApi } from "../../services/checklistService";
import axiosInstance from "../../utils/axios";

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

const ChecklistContext = createContext(null);

export function ChecklistProvider({ children }) {
  const [items, setItems] = useState([]);       
  const [info, setInfo] = useState(INITIAL_INFO);
  const [records, setRecords] = useState([]);
  const [master1List, setMaster1List] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingRecords, setFetchingRecords] = useState(false);

  async function getRecord(id) {
    try {
      if(typeof window !== "undefined" && localStorage.getItem("token")){
        const res = await axiosInstance.get(`/checklist/${id}`);
        return res.data?.data || res.data;
      }
    } catch (e) {
      console.error("Failed to fetch record", e);
      return null;
    }
  }

  async function updateRecord(id, body) {
    try {
      if(typeof window !== "undefined" && localStorage.getItem("token")){
        const res = await updateChecklistApi(id, body);
        await fetchRecordsList(); // list refresh
        return { success: true, data: res.data?.data || res.data };
      }
    } catch (e) {
      console.error("Failed to update record", e);
      return { success: false, error: e.message };
    }
  }

  async function fetchMasterItems() {
      try {
        if(typeof window !== "undefined" && localStorage.getItem("token")){
          const master1Res = await axiosInstance.get("/master1");
          const master1Data = master1Res.data?.data || [];
          setMaster1List(master1Data);
          const sortedMaster1 = [...master1Data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const master2Results = await Promise.all(
            sortedMaster1.map((m1) => axiosInstance.get(`/master2/master1/${m1._id}`))
          );
          const allMapped = [];
          sortedMaster1.forEach((m1, idx) => {
            const data = master2Results[idx]?.data?.data || [];
            const mapped = data.map((item) => ({
              id: item._id,
              master2: item._id,
              master1: item.master1_id?._id || m1._id,
              master1Type: item.master1_id?.type || m1.type,
              master1Order: m1.order,
              text: item.particulars,
              cat: item.category,
              max: item.max_score,
              yn: "Yes",
              score: null,
              remarks: "",
              order: item.order,
            }));
            allMapped.push(...mapped);
          });
          setItems(allMapped);
        }
      } catch (e) {
        console.error("Failed to fetch master1/master2 items", e);
      } finally {
        setLoaded(true);
      }
  }

  // Master1 (sections) + Master2 (checklist items, fetched per section) on mount
  useEffect(() => {
    fetchMasterItems();
    fetchRecordsList();
  }, []);

  // Records list fetch
  async function fetchRecordsList(page = 1, limit = 10) {
    setFetchingRecords(true);
    try {
      if(typeof window !== "undefined" && localStorage.getItem("token")){
        const res = await getChecklistsApi(page, limit);
        const data = res.data?.data || [];
        setRecords(data);
      }
    } catch (e) {
      console.error("Failed to fetch records", e);
    } finally {
      setFetchingRecords(false);
    }
  }

  function updateItem(id, field, val) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  }

  function setInfoField(key) {
    return (val) => setInfo((p) => ({ ...p, [key]: val }));
  }

  function buildPayload() {
    // master1 wise group
    const sectionMap = {};
    items.forEach((it) => {
      if (!it.master1) return; // placeholder items skip
      if (!sectionMap[it.master1]) {
        sectionMap[it.master1] = [];
      }
      sectionMap[it.master1].push({
        master2: it.master2,
        score: it.score ?? 0,
        isRequired: it.yn === "Yes",
        yn: it.yn,
        remarks: it.remarks,
      });
    });

    const sections = Object.entries(sectionMap).map(([master1, data]) => ({
      master1,
      data,
    }));

    const periodStr =
      info.periodFrom && info.periodTo
        ? `${info.periodFrom} to ${info.periodTo}`
        : "";

    return {
      name_of_3pl: info.nameOf3PL,
      person_met: info.personMet,
      assessed_by: info.assessedBy,
      month: info.month,
      location: info.location,
      designation: info.designation,
      date: info.date || null,
      assessment_period: periodStr,
      is_checked: false,
      data: sections,
    };
  }

  // Save — API call
 async function saveRecord() {
  setSaving(true);
  try {
    const payload = buildPayload();
    console.log("Payload being sent:", JSON.stringify(payload, null, 2)); // debug
    const res = await createChecklistApi(payload);
    const newRecord = res.data?.data || res.data;
    await fetchRecordsList();
    setInfo(INITIAL_INFO);
    resetItems(); // clear previous yn/score/remarks back to defaults
    return { success: true, data: newRecord };
  } catch (e) {
    console.error("Save error:", e);
    console.error("Error response:", e.response?.data); // actual backend error
    return { success: false, error: e.message };
  } finally {
    setSaving(false);
  }
}

  // Reset items to default scores
  function resetItems() {
    setItems((prev) =>
      prev.map((it) => ({ ...it, yn: "Yes", score: null, remarks: "" }))
    );
  }

  return (
    <ChecklistContext.Provider
      value={{
        items,
        info,
        records,
        master1List,
        loaded,
        saving,
        fetchingRecords,
        updateItem,
        setInfoField,
        setInfo,
        saveRecord,
        fetchRecordsList,
        fetchMasterItems,
        resetItems, getRecord, updateRecord,
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