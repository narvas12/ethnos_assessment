import axiosInstance from '../../utils/axiosConfig';
import { API } from '../api/apiEndpoints';


const CardService = {
 
  getCards: async () => {
    try {
      const response = await axiosInstance.get(API.CARDS.GET_USER_CARD);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch cards" };
    }
  },
};

export default CardService;
