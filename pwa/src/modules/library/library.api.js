import api from "../../api/axios";

export const getMyLibraryApi = async (params = {}) => {
  const response = await api.get("/library/my-library", { params });
  return response.data;
};
