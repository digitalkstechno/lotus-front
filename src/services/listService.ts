import axiosInstance from "../utils/axios";

export interface ListItem {
  _id: string;
  name: string;
  order?: number;
  user_id?: string | null;
  is_active?: boolean;
  isChecked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateListPayload {
  name: string;
  order?: number;
  user_id?: string;
}

export interface UpdateListPayload {
  name?: string;
  order?: number;
  is_active?: boolean;
  isChecked?: boolean;
  sortBy?: string;
}

// POST /list/create
export const createListApi = (data: CreateListPayload) => {
  return axiosInstance.post("/list/create", data);
};

// GET /list  → all active lists (no user filter, no pagination)
export const getListsApi = () => {
  return axiosInstance.get("/list");
};

// GET /list/:id  → a single list by its own id
export const getListByIdApi = (id: string) => {
  return axiosInstance.get(`/list/${id}`);
};

// GET /list/user/:user_id  → paginated lists belonging to one user
export const getListsByUserApi = (user_id: string, page = 1, limit = 10, isChecked?: boolean, sortBy?: string) => {
  const params: any = { page, limit };
  if (isChecked !== undefined) params.isChecked = isChecked;
  if (sortBy) params.sortBy = sortBy;
  return axiosInstance.get(`/list/user/${user_id}`, { params });
};

// PUT /list/:id
export const updateListApi = (id: string, data: UpdateListPayload) => {
  return axiosInstance.put(`/list/${id}`, data);
};

// DELETE /list/:id  → soft delete (is_active: false on the backend)
export const deleteListApi = (id: string) => {
  return axiosInstance.delete(`/list/${id}`);
};

// PATCH /list/reorder  → bulk update all list orders in a single call
export const reorderListsApi = (lists: { id: string; order: number }[]) => {
  return axiosInstance.patch("/list/reorder", lists);
};