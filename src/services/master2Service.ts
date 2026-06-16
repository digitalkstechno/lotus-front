import axiosInstance from "../utils/axios";

export const getMaster2AllApi = (search: string) => {
  return axiosInstance.get(`/master2`, {
    params: { search }
  });
};

export const addMaster2Api = (data: any) => {
  return axiosInstance.post("/master2/create", data);
};

export const updateMaster2Api = (id: string, data: any) => {
  return axiosInstance.patch(`/master2/${id}`, data);
};

export const deleteMaster2Api = (id: string) => {
  return axiosInstance.delete(`/master2/${id}`);
};
