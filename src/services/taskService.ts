import axiosInstance from "../utils/axios";

// GET /task/list/:list_id/user/:user_id
export const getTasksByListAndUserApi = (listId: string, userId: string, page = 1, limit = 20, sortBy?: string) => {
  return axiosInstance.get(`/task/list/${listId}/user/${userId}`, { params: { page, limit, sortBy } });
};

// POST /task/create
export const createTaskApi = (data: any) => {
  return axiosInstance.post("/task/create", data);
};

// PUT /task/:id
export const updateTaskApi = (id: string, data: any) => {
  return axiosInstance.put(`/task/${id}`, data);
};

// DELETE /task/:id
export const deleteTaskApi = (id: string) => {
  return axiosInstance.delete(`/task/${id}`);
};

// POST /task/:id/upload
export const uploadTaskFilesApi = (id: string, formData: FormData) => {
  return axiosInstance.post(`/task/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

// PUT /task/:id/attachment/remove
export const removeTaskAttachmentApi = (id: string, filename: string) => {
  return axiosInstance.put(`/task/${id}/attachment/remove`, { filename });
};

