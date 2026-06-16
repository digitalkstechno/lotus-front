import axiosInstance from "../utils/axios";

export const loginApi = (data: { email: string; password: string }) => {
  return axiosInstance.post("/user/login", data);
};
