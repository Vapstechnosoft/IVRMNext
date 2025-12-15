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
import { auth, signOut } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

// Define available API base URLs
export type ApiBaseUrlKey = 'default' | 'preadmission' | 'admission' | 'fees' | 'exam' | 'hrms' | 'hrmsfrontoffice' | 'hmslms';

class ApiService {
    private instances: Map<string, AxiosInstance>;
    private baseUrls: Record<ApiBaseUrlKey, string>;

    constructor() {
        this.instances = new Map();

        // Map your environment variables to base URLs
        this.baseUrls = {
            default: process.env.NEXT_PUBLIC_API_BASE_URL || '',
            preadmission: process.env.NEXT_PUBLIC_PREADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            admission: process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            fees: process.env.NEXT_PUBLIC_FEES_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            exam: process.env.NEXT_PUBLIC_EXAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hrms: process.env.NEXT_PUBLIC_HRMS_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hrmsfrontoffice: process.env.NEXT_PUBLIC_HRMS_FRONTOFFICE_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hmslms: process.env.NEXT_PUBLIC_HRMS_LMS_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ''
        };

        // Debug: Log base URLs in development
        if (process.env.NODE_ENV === 'development') {
            console.log('🔵 [API SERVICE] Base URLs initialized:');
            console.log('🔵 [API SERVICE] hmslms:', this.baseUrls.hmslms || 'NOT SET');
            console.log('🔵 [API SERVICE] NEXT_PUBLIC_HRMS_LMS_BASE_URL:', process.env.NEXT_PUBLIC_HRMS_LMS_BASE_URL || 'NOT SET');
        }

        // Initialize default instance
        this.getOrCreateInstance('default');
    }

    private getOrCreateInstance(key: ApiBaseUrlKey | string): AxiosInstance {
        if (!this.instances.has(key)) {
            const baseURL = typeof key === 'string' && key in this.baseUrls ? this.baseUrls[key as ApiBaseUrlKey] : this.baseUrls.default;

            const instance = axios.create({
                baseURL,
                timeout: 60000,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*'
                }
            });

            this.setupInterceptors(instance);
            this.instances.set(key, instance);
        }

        return this.instances.get(key)!;
    }

    private setupInterceptors(instance: AxiosInstance): void {
        // Request Interceptorr
        instance.interceptors.request.use(
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
        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    try {
                        await signOut();
                        // Only redirect in browser environment
                        if (typeof window !== 'undefined') {
                            window.location.href = '/sign-in';
                        }
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

    public async request<T>(
        baseUrlKey: ApiBaseUrlKey,
        method: string,
        url: string,
        config?: AxiosRequestConfig,
        data?: unknown
    ): Promise<ApiResponse<T>> {
        try {
            const instance = this.getOrCreateInstance(baseUrlKey);
            const baseURL = instance.defaults.baseURL;
            const fullUrl = `${baseURL}${url}`;

            console.log('🌐 [API SERVICE] Request initiated');
            console.log('📤 [API SERVICE] Request details:', {
                method,
                baseUrlKey,
                baseURL: baseURL || 'NOT SET - Check environment variable',
                url,
                fullUrl,
                hasData: !!data,
                dataSize: data ? JSON.stringify(data).length : 0
            });

            // Warn if base URL is not set
            if (!baseURL && baseUrlKey === 'hmslms') {
                console.warn('⚠️ [API SERVICE] WARNING: hmslms base URL is not set!');
                console.warn('⚠️ [API SERVICE] Check NEXT_PUBLIC_HRMS_LMS_BASE_URL environment variable');
            }

            if (data && method === 'POST') {
                console.log('📦 [API SERVICE] Request payload:', JSON.stringify(data, null, 2));
            }

            const startTime = Date.now();
            const response = await instance.request<ApiResponse<T>>({
                method,
                url,
                data,
                ...config
            });
            const duration = Date.now() - startTime;

            console.log('✅ [API SERVICE] Response received');
            console.log('📥 [API SERVICE] Response details:', {
                status: response.status,
                statusText: response.statusText,
                duration: `${duration}ms`,
                hasData: !!response.data,
                success: response.data?.success,
                message: response.data?.message
            });

            if (response.data) {
                console.log('📊 [API SERVICE] Response data structure:', {
                    hasSuccess: 'success' in response.data,
                    hasMessage: 'message' in response.data,
                    hasData: 'data' in response.data,
                    keys: Object.keys(response.data || {})
                });
            }

            return response.data;
        } catch (error: any) {
            console.error('❌ [API SERVICE] Request failed');
            console.error('💥 [API SERVICE] Error details:', {
                message: error?.message,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                data: error?.response?.data,
                url: error?.config?.url
            });
            throw this.handleError(error);
        }
    }

    public async get<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(baseUrlKey, 'GET', url, config, undefined);
    }

    public async getArray<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T[]>> {
        try {
            const instance = this.getOrCreateInstance(baseUrlKey);
            const response = await instance.request<ApiArrayResponse<T>>({
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

    public async post<T>(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(baseUrlKey, 'POST', url, config, data);
    }

    public async put<T>(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(baseUrlKey, 'PUT', url, config, data);
    }

    public async delete<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(baseUrlKey, 'DELETE', url, config, undefined);
    }

    public setBaseUrl(baseUrl: string, key: ApiBaseUrlKey = 'default'): void {
        const instance = this.getOrCreateInstance(key);
        instance.defaults.baseURL = baseUrl;
    }

    // Helper method to add custom base URLs at runtime
    public addBaseUrl(key: string, baseUrl: string): void {
        this.baseUrls[key as ApiBaseUrlKey] = baseUrl;
    }

    /**
     * Get the base URL for a given key (useful for debugging)
     */
    public getBaseUrl(key: ApiBaseUrlKey): string {
        return this.baseUrls[key] || '';
    }

    public async postMultipart<T>(
        baseUrlKey: ApiBaseUrlKey,
        url: string,
        formData: FormData,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        try {
            const instance = this.getOrCreateInstance(baseUrlKey);

            // Override Content-Type so axios sets it properly for FormData
            const finalConfig: AxiosRequestConfig = {
                ...config,
                headers: {
                    ...(config?.headers || {}),
                    'Content-Type': undefined // Let axios auto-set boundary
                }
            };

            const response = await instance.post<ApiResponse<T>>(url, formData, finalConfig);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

// Create a singleton instance
/**
 * Creates a new instance of the ApiService class supporting multiple base URLs.
 * @returns An instance of the ApiService class with support for multiple API base URLs.
 * Methods available on the instance are:
 * - request<T>(baseUrlKey: ApiBaseUrlKey, method: string, url: string, config?: AxiosRequestConfig, data?: unknown): Promise<ApiResponse<T>>
 * - get<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 * - getArray<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T[]>>
 * - post<T>(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 * - put<T>(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 * - delete<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 *
 * Usage examples:
 * - api.get('default', '/users')
 * - api.get('preadmission', '/applications')
 * - api.post('admission', '/students', data)
 */
export const api = new ApiService();

/**
 * Generates a URL string from the provided searchParams object.
 * @param searchParams - The searchParams object to generate the URL from.
 * @returns A string representing the URL.
 */
// export function getSearchParamsUrl(searchParams: ApiSearchparams | undefined, searchColumns?: string): string {
//     if (!searchParams) return '';

//     const page = searchParams?.page || 1;
//     const page_size = searchParams?.page_size || 10;
//     const sort_column = searchParams?.sort_column || '';
//     const sort_direction = searchParams?.sort_direction || 'asc';
//     const search_query = searchParams?.search_query || '';
//     const search_columns = searchParams?.search_columns || '';

//     if (!search_query) {
//         return `page=${page}&page_size=${page_size}&sort_column=${sort_column}&sort_direction=${sort_direction}`;
//     }

//     return `page=${page}&page_size=${page_size}&sort_column=${sort_column}&sort_direction=${sort_direction}&search_query=${search_query}&search_column=${searchColumns}`;
// }

export function getSearchParamsUrl(searchParams: ApiSearchparams | undefined, searchColumns?: string): string {
    if (!searchParams) return '';

    const page = searchParams?.page || 1;
    const page_size = searchParams?.page_size || 10;
    const sort_column = searchParams?.sort_column || '';
    const sort_direction = searchParams?.sort_direction || 'asc';
    const search_query = searchParams?.search_query || '';
    const search_columns = searchParams?.search_columns || '';

    let url = `page=${page}&page_size=${page_size}&sort_column=${sort_column}&sort_direction=${sort_direction}`;

    if (search_query) {
        url += `&search_query=${encodeURIComponent(search_query)}`;
        if (searchColumns) {
            url += `&search_column=${encodeURIComponent(searchColumns)}`;
        } else if (search_columns && search_columns !== '') {
            url += `&search_column=${encodeURIComponent(search_columns)}`;
        }
    }

    return url;
}
