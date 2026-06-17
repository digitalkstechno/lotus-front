import axiosInstance from "../utils/axios";

// GET /task/list/:list_id/user/:user_id
export const getTasksByListAndUserApi = (listId: string, userId: string, page = 1, limit = 20) => {
  return axiosInstance.get(`/task/list/${listId}/user/${userId}`, { params: { page, limit } });
};
