import axiosInstance from "../utils/axios";

export const getUnitsApi = () => {
  return axiosInstance.get("/unit");
};

export const addUnitApi = (data: any) => {
  return axiosInstance.post("/unit/create", data);
};

export const updateUnitApi = (id: string, data: any) => {
  return axiosInstance.put(`/unit/${id}`, data);
};

export const deleteUnitApi = (id: string) => {
  return axiosInstance.delete(`/unit/${id}`);
};
