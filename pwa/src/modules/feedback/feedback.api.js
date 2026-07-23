import api from "../../api/axios";

export const submitFeedbackApi = (data) => {
  return api.post("/feedback", data);
};
