import api from "../../api/axios";

export const getMyFeeLedgerApi = async () => {
  const response = await api.get("/fees/my-ledger");
  return response.data;
};
