import api from "../../api/axios";

export const getLostFoundItems = (status = "OPEN", type = "", search = "") => {
  return api.get("/lost-found", {
    params: { status, type, search }
  });
};

export const getMyLostFoundItems = () => {
  return api.get("/lost-found/my");
};

export const createLostFoundItem = (data) => {
  return api.post("/lost-found", data);
};

export const closeLostFoundItem = (id) => {
  return api.patch(`/lost-found/${id}/status`, { status: "CLOSED" });
};

export const deleteLostFoundItem = (id) => {
  return api.delete(`/lost-found/${id}`);
};
