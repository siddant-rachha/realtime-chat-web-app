/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./axios";
import { AxiosRequestConfig } from "axios";

async function request<T>(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await axiosInstance.request<T>({
    method,
    url,
    data,
    ...config,
  });
  return response.data;
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>("GET", url, undefined, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>("POST", url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>("PUT", url, data, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>("PATCH", url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>("DELETE", url, undefined, config),
};
