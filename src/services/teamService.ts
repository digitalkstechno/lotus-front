import axiosInstance from "../utils/axios";

export const getTeamsApi = () => {
  return axiosInstance.get("/team");
};

export const getTeamsByDepartmentApi = (unitId: string) => {
  return axiosInstance.get(`/team/unit/${unitId}`);
};

export const addTeamApi = (data: any) => {
  return axiosInstance.post("/team/create", data);
};

export const updateTeamApi = (id: string, data: any) => {
  return axiosInstance.put(`/team/${id}`, data);
};

export const deleteTeamApi = (id: string) => {
  return axiosInstance.delete(`/team/${id}`);
};
