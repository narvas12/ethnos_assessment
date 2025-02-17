import axiosInstance from '../../utils/axiosConfig';
import { API } from '../api/apiEndpoints';


const QrCodeService = {

    getQRCode: async () => {
    try {
      const response = await axiosInstance.get(API.QR_CODE.GET);
      return response.data; 
      
    } catch (error) {
      console.error("Error fetching QR code:", error);
      throw error;
      
    }
  },

 
  
  scanQRCode: async (scanData) => {
    try {
      const response = await axiosInstance.post(API.QR_CODE.SCAN, scanData);
      return response.data; 
    } catch (error) {
      console.error("Error scanning QR code:", error);
      throw error;
    }
  },

  sendMoneyViaQRCode: async (transactionData) => {
    try {
      const response = await axiosInstance.post(API.QR_CODE.SEND_MONEY, transactionData);
      return response.data; 
    } catch (error) {
      console.error("Error sending money via QR code:", error);
      throw error;
    }
  },
};

export default QrCodeService;
