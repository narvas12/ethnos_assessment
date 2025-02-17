import axiosInstance from '../../utils/axiosConfig';
import { API } from '../api/apiEndpoints';

const TransactionService = {

    getTransactions: async () => {
    try {
      const response = await axiosInstance.get(API.TRANSACTIONS.LIST);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch transactions.";
    }
  },


  createDebitTransaction: async (payload) => {
    try {
      const response = await axiosInstance.post(API.TRANSACTIONS.DEBIT.CREATE, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to create debit transaction.";
    }
  },


  getDebitTransactionDetail: async (transactionId) => {
    try {
      const response = await axiosInstance.get(API.TRANSACTIONS.DEBIT.DETAIL(transactionId));
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch debit transaction details.";
    }
  },


  createCreditTransaction: async (payload) => {
    try {
      const response = await axiosInstance.post(API.TRANSACTIONS.CREDIT.CREATE, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to create credit transaction.";
    }
  },


  getCreditTransactionDetail: async (transactionId) => {
    try {
      const response = await axiosInstance.get(API.TRANSACTIONS.CREDIT.DETAIL(transactionId));
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch credit transaction details.";
    }
  },
};

export default TransactionService;
