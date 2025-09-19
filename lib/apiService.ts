export interface PaginationData {
    total: number;
    page: number;
    page_Size: number;
}

export interface ApiResponse<T> extends Partial<PaginationData> {
    success: boolean;
    message: string;
    data: T | null;
    [key: string]: unknown;
}

export interface ApiArrayResponse<T> extends Partial<PaginationData> {
    success: boolean;
    message: string;
    data: {
        $type: string;
        $values: T[];
    } | null;
    [key: string]: unknown;
}

import { env } from '@/env';
import { auth, signOut } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

class ApiService {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: env.API_BASE_URL,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*'
            }
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request Interceptor
        this.instance.interceptors.request.use(
            async (config) => {
                try {
                    const session = await auth();
                    if (session?.token) {
                        config.headers.Authorization = `Bearer ${session.token}`;
                    }
                    return config;
                } catch (error) {
                    console.error('Error in request interceptor:', error);
                    return config;
                }
            },
            (error) => Promise.reject(this.handleError(error))
        );

        // Response Interceptor
        this.instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    try {
                        await signOut();
                        window.location.href = '/sign-in';
                    } catch (refreshError) {
                        console.error('Error refreshing session:', refreshError);
                    }
                }
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private handleError(error: any): string {
        return error || 'An unknown error occurred.';
    }

    public async request<T>(method: string, url: string, config?: AxiosRequestConfig, data?: unknown): Promise<ApiResponse<T>> {
        try {
            const response = await this.instance.request<ApiResponse<T>>({
                method,
                url,
                data,
                ...config
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('GET', url, config);
    }

    public async getArray<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T[]>> {
        try {
            const response = await this.instance.request<ApiArrayResponse<T>>({
                method: 'GET',
                url,
                ...config
            });

            // Transform the response to extract $values and maintain the same structure
            const transformedResponse: ApiResponse<T[]> = {
                success: response.data.success,
                message: response.data.message,
                data: response.data.data?.$values || null,
                total: response.data.total,
                page: response.data.page,
                page_Size: response.data.page_Size
            };

            return transformedResponse;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('POST', url, config, data);
    }

    public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', url, config, data);
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', url, config);
    }

    public setBaseUrl(baseUrl: string): void {
        this.instance.defaults.baseURL = baseUrl;
    }
}

// Create a singleton instance
/**
 * Creates a new instance of the ApiService class.
 * @returns An instance of the ApiService class with the base URL set to the API_BASE_URL environment variable.
 * Methods avaiable on the instance are:
 * //n request<T>(method: string, url: string, config?: AxiosRequestConfig, data?: unknown): Promise<ApiResponse<T>>
 * //n get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 * //n getArray<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T[]>>
 * //n post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 * //n put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 * //n delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 */
export const api = new ApiService();

/**
 * Generates a URL string from the provided searchParams object.
 * @param searchParams - The searchParams object to generate the URL from.
 * @returns A string representing the URL.
 */
export function getSearchParamsUrl(searchParams: ApiSearchparams | undefined): string {
    if (!searchParams) return '';

    const page = searchParams?.page || 1;
    const page_size = searchParams?.page_size || 10;
    const sort_column = searchParams?.sort_column || '';
    const sort_direction = searchParams?.sort_direction || 'asc';
    const search_query = searchParams?.search_query || '';

    return `page=${page}&page_size=${page_size}&sort_column=${sort_column}&sort_direction=${sort_direction}&search_query=${search_query}`;
}
