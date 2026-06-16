import axiosInstance from "../utils/axios";

export const getMaster1PaginatedApi = (search: string) => {
  return axiosInstance.get(`/master1`, {
    params: { search }
  });
};

export const getMaster1DropdownApi = () => {
  return axiosInstance.get(`/master1/dropdown`);
};

export const addMaster1Api = (data: any) => {
  return axiosInstance.post("/master1/create", data);
};

export const updateMaster1Api = (id: string, data: any) => {
  return axiosInstance.patch(`/master1/${id}`, data);
};

export const deleteMaster1Api = (id: string) => {
  return axiosInstance.delete(`/master1/${id}`);
};
