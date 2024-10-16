import { useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utilities/providers/AuthProvider';

// Create the axiosSecure instance outside the hook
const axiosSecure = axios.create({
  baseURL: 'http://localhost:5000',
});

const useAxiosSecure = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Request interceptor to add token to headers
    const requestInterceptor = axiosSecure.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Adding token to headers:', token); // Debug log
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle unauthorized access
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('Token expired or forbidden. Logging out...'); // Debug log
          await logout();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup function to eject interceptors on unmount
    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, navigate]); // Removed axiosSecure from dependencies

  return axiosSecure;
};

export default useAxiosSecure;
