import axiosInstance from '../../utils/axiosConfig';
import { API } from '../api/apiEndpoints';

const AuthService = {
  register: async (userData) => {
    const response = await axiosInstance.post(API.USER_MANAGEMENT.USERS.CREATE, userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post(API.USER_MANAGEMENT.AUTH.LOGIN, credentials);
    console.log('Login API Response:', response.data); 
    return response.data;
  },
  
  getAuthenticatedUser: async () => {
    try {
      const response = await axiosInstance.get(API.USER_MANAGEMENT.USERS.DETAIL);
      console.log("Authenticated user response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching authenticated user:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken'); 
      }
      throw error;
    }
  },
};

export default AuthService;
