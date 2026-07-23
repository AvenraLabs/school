import api from "../../api/axios";

export const getLostFoundItems = (status = "OPEN", type = "", search = "", limit = 10, offset = 0) => {
  return api.get("/lost-found", {
    params: { status, type, search, limit, offset }
  });
};

export const getMyLostFoundItems = (limit = 10, offset = 0) => {
  return api.get("/lost-found/my", { params: { limit, offset } });
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
