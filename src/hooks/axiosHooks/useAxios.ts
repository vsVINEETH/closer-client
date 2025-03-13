'use client';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout as adminLogout } from "@/store/slices/adminSlice";
import { logout as userLogout } from "@/store/slices/userSlice";
import { logout as employeeLogout } from "@/store/slices/employeeSlice";
import {  errorToast, successToast } from "@/utils/toasts/toast";

interface RequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: Record<string, any>;
  params?: Record<string, any>;
  withCredentials?: boolean,
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
      }
      return response;
    },
    (error) => {
      // Handle error responses based on status codes
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
         //   errorToast(data.message);
            break;
          case 401:
            errorToast(data.message);
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
         //   errorToast(data.message);
            break;
          case 404:
         //   errorToast(data.message);
            break;
          case 500:
           // errorToast(data.message);
            break;
          default:
           // errorToast("An unexpected error occurred.");
        }
      } 
      // else {
      //   // Handle network or other errors
      //   errorToast("Network Error: Unable to reach the server.");
      // }

      return Promise.reject(error);
    }
  );

  const controller = new AbortController();

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






// "use client";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "@/store";
// import { logout as adminLogout } from "@/store/slices/adminSlice";
// import { logout as userLogout } from "@/store/slices/userSlice";
// import { logout as employeeLogout } from "@/store/slices/employeeSlice";
// import { errorToast } from "@/utils/toasts/toast";
// import api from "@/services/axiosInstance";
// import { useMemo } from "react";
// import axios from "axios";

// interface RequestOptions {
//   url: string;
//   method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
//   headers?: Record<string, string>;
//   data?: Record<string, any>;
//   params?: Record<string, any>;
// }

// interface UseAxiosReturn<T> {
//   response: T | null;
//   error: string | null;
//   loading: boolean;
//   handleRequest: (options: RequestOptions) => Promise<{ data?: T; error?: string }>;
// }

// const useAxios = <T = any>(): UseAxiosReturn<T> => {
//   const [response, setResponse] = useState<T | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const controllerRef = useRef<AbortController | null>(null);
//   const dispatch = useDispatch();
//   const router = useRouter();

//   // // Access role and authentication status from Redux
//   // const roles = useSelector((state: RootState) => ({
//   //   user: state.user.isAuthenticated ? state.user.userInfo?.role : null,
//   //   employee: state.employee.isAuthenticated ? state.employee.employeeInfo?.role : null,
//   //   admin: state.admin.isAuthenticated ? state.admin.adminInfo?.role : null,
//   // }));



//   const userRole = useSelector((state: RootState) => state.user.isAuthenticated ? state.user.userInfo?.role : null);
//   const employeeRole = useSelector((state: RootState) => state.employee.isAuthenticated ? state.employee.employeeInfo?.role : null);
//   const adminRole = useSelector((state: RootState) => state.admin.isAuthenticated ? state.admin.adminInfo?.role : null);
  
//   const roles = useMemo(() => ({ userRole, employeeRole, adminRole }), [userRole, employeeRole, adminRole]);
  

//   const handleLogout = () => {
//     if (roles.adminRole) {
//       dispatch(adminLogout());
//       router.push("/admin/login");
//     } else if (roles.employeeRole) {
//       dispatch(employeeLogout());
//       router.push("/employee/login");
//     } else if (roles.userRole ) {
//       dispatch(userLogout());
//       router.push("/user/login");
//     }
//   };

//   const handleLogoutRef = useRef(handleLogout); // Keep reference to function
//   handleLogoutRef.current = handleLogout;

//   // Response Interceptor with Error Handling
//   useEffect(() => {
//     const interceptor = api.interceptors.response.use(
//       (response) => response,
//       (error) => {
//         if (error.response) {
//           const { status } = error.response;
  
//           switch (status) {
//             case 400:
//               errorToast("Bad Request: Please check your input.");
//               break;
//             case 401:
//               console.log("locked");
//               errorToast("Unauthorized: Please log in again.");
//               handleLogoutRef.current(); 
//               break;
//             case 403:
//               errorToast("Forbidden: You do not have access.");
//               break;
//             case 404:
//               errorToast("Resource not found.");
//               break;
//             case 500:
//               errorToast("Internal Server Error: Please try again later.");
//               break;
//             default:
//               errorToast("An unexpected error occurred.");
//           }
//         }
//         return Promise.reject(error);
//       }
//     );
  
//     // Cleanup interceptor on unmount to prevent duplicates
//     return () => {
//       api.interceptors.response.eject(interceptor);
//     };
//   }, []);
  

//   useEffect(() => {
//     return () => {
//       if (controllerRef.current) {
//         controllerRef.current.abort();
//       }
//     };
//   }, []);

//   const handleRequest = useCallback( async ({ url, method, headers = {}, data = {}, params = {} }: RequestOptions): Promise<{ data?: T; error?: string }> => {
//     setLoading(true);

//     if (controllerRef.current) {
//       controllerRef.current.abort();
//     }

//     const controller = new AbortController();
//     controllerRef.current = controller;

//     try {
//       const result = await api({
//         url,
//         method,
//         headers,
//         data,
//         params,
//         signal: controller.signal,
//       });

//       setResponse(result.data);
//       setError(null);
//       return { data: result.data };
//     } catch (error: any) {
//       if (axios.isCancel(error)) {
//         console.warn("Request was cancelled", error.message);
//       } else {
//         const errorMessage = error.response?.data?.message || error.message;
//         setError(errorMessage);
//         return { error: errorMessage };
//       }
//     } finally {
//       setLoading(false);
//     }
//     return {};
//   },[]);

//   return { response, error, loading, handleRequest };
// };

// export default useAxios;



