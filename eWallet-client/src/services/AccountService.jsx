import axiosConfig from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const AccountService = {
  getAccountDetails: async () => {
    try {
      const response = await axiosConfig.get(API.ACCOUNT_MANAGEMENT.DETAIL);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
};

export default AccountService;
