import axiosInstance from "../utils/axios";

export interface ChecklistDataItem {
  master2: string;
  score: number;
  isRequired: boolean;
  remarks: string;
}

export interface ChecklistSection {
  master1: string;
  data: ChecklistDataItem[];
}

export interface CreateChecklistPayload {
  name_of_3pl?: string;
  person_met?: string;
  assessed_by?: string;
  month?: string;
  location?: string;
  designation?: string;
  date?: string;
  assessment_period?: string;
  is_checked?: boolean;
  data: ChecklistSection[];
}

export interface UpdateChecklistPayload {
  name_of_3pl?: string;
  person_met?: string;
  assessed_by?: string;
  month?: string;
  location?: string;
  designation?: string;
  date?: string;
  assessment_period?: string;
  is_checked?: boolean;
  data?: ChecklistSection[];
}

// POST /checklist/create
export const createChecklistApi = (data: CreateChecklistPayload) => {
  return axiosInstance.post("/checklist/create", data);
};

// GET /checklist
export const getChecklistsApi = (page = 1, limit = 10) => {
  return axiosInstance.get("/checklist", { params: { page, limit } });
};

// GET /checklist/:id
export const getChecklistByIdApi = (id: string) => {
  return axiosInstance.get(`/checklist/${id}`);
};

// PATCH /checklist/:id
export const updateChecklistApi = (id: string, data: UpdateChecklistPayload) => {
  return axiosInstance.patch(`/checklist/${id}`, data);
};

// DELETE /checklist/:id
export const deleteChecklistApi = (id: string) => {
  return axiosInstance.delete(`/checklist/${id}`);
};