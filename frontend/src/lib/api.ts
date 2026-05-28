import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL + "/api" || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global response interceptor to toast error messages
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Extract user-friendly error message
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Show the error toast only
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default api;

