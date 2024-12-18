'use client';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout as adminLogout } from "@/store/slices/adminSlice";
import { logout as userLogout } from "@/store/slices/userSlice";
import { logout as employeeLogout } from "@/store/slices/employeeSlice";
import { infoToast, errorToast, successToast } from "@/utils/toasts/toats";

interface RequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: Record<string, any>;
  params?: Record<string, any>;
}

interface UseAxiosReturn<T> {
  response: T | null;
  error: string | null;
  loading: boolean;
  handleRequest: (options: RequestOptions) => Promise<{ data?: T; error?: string }>;
}

const useAxios = <T = any>(): UseAxiosReturn<T> => {
  const [response, setResponse] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const controllerRef = useRef<AbortController | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  // Access role and authentication status from Redux
  const userRole = useSelector((state: RootState) => state.user.isAuthenticated ? state.user.userInfo?.role : null);
  const employeeRole = useSelector((state: RootState) => state.employee.isAuthenticated ? state.employee.employeeInfo?.role : null);
  const adminRole = useSelector((state: RootState) => state.admin.isAuthenticated ? state.admin.adminInfo?.role : null);

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
  });

  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => config,
    (error) => Promise.reject(error)
  );

  // Response Interceptor with Status Handling
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Handle specific status codes for successful responses
      if (response.status === 200) {
       // successToast("Request completed successfully");
      }
      return response;
    },
    (error) => {
      // Handle error responses based on status codes
      if (error.response) {
        const { status } = error.response;

        switch (status) {
          case 400:
            errorToast("Bad Request: Please check your input.");
            break;
          case 401:
            errorToast("Unauthorized: Please log in again.");
            if (adminRole) {
              dispatch(adminLogout());
              router.push('/admin/login');
            } else if (employeeRole) {
              dispatch(employeeLogout());
              router.push('/employee/login');
            } else if (userRole) {
              dispatch(userLogout());
              router.push('/user/login');
            }
            break;
          case 403:
            errorToast("Forbidden: You do not have access.");
            break;
          case 404:
            errorToast("Resource not found.");
            break;
          case 500:
            errorToast("Internal Server Error: Please try again later.");
            break;
          default:
            errorToast("An unexpected error occurred.");
        }
      } 
      // else {
      //   // Handle network or other errors
      //   errorToast("Network Error: Unable to reach the server.");
      // }

      return Promise.reject(error);
    }
  );

  let controller = new AbortController();

  useEffect(() => {
    return () => controller.abort();
  }, []);

  const handleRequest = async ({ url, method, headers = {}, data = {}, params = {} }: RequestOptions): Promise<{ data?: T; error?: string }> => {
    setLoading(true);

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();
    const controller = controllerRef.current;

    try {
      const result = await axiosInstance({
        url,
        method,
        headers,
        data,
        params,
        signal: controller.signal,
        withCredentials: true,
      });
      setResponse(result.data);
      setError(null);
      return { data: result.data };
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.warn("Request was cancelled", error.message);
      } else {
        const errorMessage = error.response ? error.response.data.message : error.message;
        setError(errorMessage);
        return { error: errorMessage };
      }
    } finally {
      setLoading(false);
    }
    return {};
  };

  return { response, error, loading, handleRequest };
};

export default useAxios;
