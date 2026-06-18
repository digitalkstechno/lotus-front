import axiosInstance from "../utils/axios";

export const getUsersPaginatedApi = (page: number, limit: number, search: string, unitId?: string | null, teamId?: string | null) => {
  return axiosInstance.get(`/user`, {
    params: { page, limit, search, unitId, teamId }
  });
};

export const fetchUsersDropdownApi = () => {
  return axiosInstance.get(`/user/dropdown`);
};

export const addUserApi = (data: any) => {
  return axiosInstance.post("/user/create", data);
};

export const updateUserApi = (id: string, data: any) => {
  return axiosInstance.put(`/user/${id}`, data);
};

export const deleteUserApi = (id: string) => {
  return axiosInstance.delete(`/user/${id}`);
};

export const getUserByIdApi = (id: string) => {
  return axiosInstance.get(`/user/${id}`);
};

export const searchUsersApi = (query: string) => {
  return axiosInstance.get(`/user/search`, { params: { query } });
};

// POST /user/save-fcm
export const saveFcmTokenApi = (fcmToken: string, oldFcmToken?: string | null) => {
  return axiosInstance.post(`/user/save-fcm`, { fcmToken, oldFcmToken });
};
