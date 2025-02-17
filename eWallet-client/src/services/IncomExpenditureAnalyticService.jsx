import axiosInstance from '../../utils/axiosConfig';
import { API } from '../api/apiEndpoints';

const AnalyticsService = {

    async getIncomeExpenditureAnalysis() {
    try {
      const response = await axiosInstance.get(API.ANALYTICS.INCOME_EXPENDITURE_ANALYSIS);
      console.log(response.data)
      return response.data; 
      
    } catch (error) {
      console.error("Error fetching income and expenditure analysis:", error);
      throw error; 
    }
  },
};

export default AnalyticsService;
