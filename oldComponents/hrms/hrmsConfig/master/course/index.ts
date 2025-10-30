// Master Course API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterCourseResponse,
    CourseDetail,
    MasterCourseInputOld
} from '@/types/hrms/master-course';

// Master Course Input interface (defined locally to avoid circular dependency)
export interface MasterCourseInput {
    HRMC_Id?: number;
    MI_Id?: number;
    HRMC_QulaificationName: string;
    HRMC_QualificationDesc: string;
    HRMC_Order?: number;
    HRMC_ActiveFlag: boolean;
    HRMC_DefaultQualFag: boolean;
    HRMC_SpecialisationFlag: boolean;
    roleId?: number;
}

/**
 * Get all master course records by role ID
 * GET /api/MasterCourse/getalldetails/{roleId}
 */
export async function getMasterCourseList(roleId: number): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const url = `/api/MasterCourse/getalldetails/${roleId}`;
        console.log('Fetching master course list from:', url);
        
        const response = await api.get<MasterCourseResponse>(url);
        console.log('Master course list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master course list:', error);
        throw error;
    }
}

/**
 * Create or Update master course item
 * POST /api/MasterCourseFacade
 * Using axios directly with proxy
 */
export async function saveMasterCourse(data: MasterCourseInput): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterCourseFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody = {
            HRMC_Id: data.HRMC_Id || 0,
            MI_Id: 30,
            HRMC_QulaificationName: data.HRMC_QulaificationName,
            HRMC_QualificationDesc: data.HRMC_QualificationDesc,
            HRMC_Order: data.HRMC_Order || 0,
            HRMC_ActiveFlag: data.HRMC_ActiveFlag,
            HRMC_DefaultQualFag: data.HRMC_DefaultQualFag,
            HRMC_SpecialisationFlag: data.HRMC_SpecialisationFlag,
            CourseList: [],
            retrunMsg: "",
            roleId: data.roleId || 0,
            CourseDTO: []
        };

        console.log('=== Save Course API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        console.log('Field types check:', {
            HRMC_DefaultQualFag: { value: requestBody.HRMC_DefaultQualFag, type: typeof requestBody.HRMC_DefaultQualFag },
            HRMC_SpecialisationFlag: { value: requestBody.HRMC_SpecialisationFlag, type: typeof requestBody.HRMC_SpecialisationFlag },
            HRMC_ActiveFlag: { value: requestBody.HRMC_ActiveFlag, type: typeof requestBody.HRMC_ActiveFlag }
        });

        const axiosResponse = await axios.post<MasterCourseResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Course API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));
        
        const response: ApiResponse<MasterCourseResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Course saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Course API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterCourseResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save course',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Edit/Update an existing master course record
 * POST /api/MasterCourseFacade
 * Using axios directly with proxy
 */
export async function editMasterCourse(data: MasterCourseInput): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterCourseFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody = {
            HRMC_Id: data.HRMC_Id || 0,
            MI_Id: 30,
            HRMC_QulaificationName: data.HRMC_QulaificationName,
            HRMC_QualificationDesc: data.HRMC_QualificationDesc,
            HRMC_Order: data.HRMC_Order || 0,
            HRMC_ActiveFlag: data.HRMC_ActiveFlag,
            HRMC_DefaultQualFag: data.HRMC_DefaultQualFag,
            HRMC_SpecialisationFlag: data.HRMC_SpecialisationFlag,
            CourseList: [],
            retrunMsg: "",
            roleId: data.roleId || 0,
            CourseDTO: []
        };

        console.log('=== Edit Course API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterCourseResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Edit Course API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));
        
        const response: ApiResponse<MasterCourseResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Course updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Edit Course API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterCourseResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update course',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Activate or Deactivate a master course record
 * POST /api/MasterCourseFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterCourse(data: { HRMC_Id: number; HRMC_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterCourseFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody = {
            HRMC_Id: data.HRMC_Id,
            MI_Id: 30,
            HRMC_QulaificationName: "string",
            HRMC_QualificationDesc: "string",
            HRMC_Order: 0,
            HRMC_ActiveFlag: data.HRMC_ActiveFlag,
            HRMC_DefaultQualFag: false,
            HRMC_SpecialisationFlag: false,
            CourseList: [],
            retrunMsg: "",
            roleId: data.roleId || 0,
            CourseDTO: []
        };

        console.log('=== Activate/Deactivate Course API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterCourseResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Course API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));
        
        const response: ApiResponse<MasterCourseResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Course status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Course API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterCourseResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update course status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get onload details for master course
 * POST /api/MasterCourseFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadCourseDetails(roleId: number): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterCourseFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody = {
            HRMC_Id: 0,
            MI_Id: 30,
            HRMC_QulaificationName: "string",
            HRMC_QualificationDesc: "string",
            HRMC_Order: 0,
            HRMC_ActiveFlag: true,
            HRMC_DefaultQualFag: false,
            HRMC_SpecialisationFlag: false,
            CourseList: [],
            retrunMsg: "",
            roleId: roleId,
            CourseDTO: []
        };
        
        console.log('=== Onload Course Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterCourseResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onload Course Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));
        
        const response: ApiResponse<MasterCourseResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Courses loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onload Course Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterCourseResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to load courses',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get course record by ID
 * GET /api/MasterCourseFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getCourseById(id: number): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterCourseFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Course By ID API Request ===');
        console.log('URL:', url);
        console.log('Course ID:', id);

        const axiosResponse = await axios.get<MasterCourseResponse>(url, {
            headers: {
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Get Course By ID API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));
        
        const response: ApiResponse<MasterCourseResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Course fetched successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Get Course By ID API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterCourseResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch course',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Test function to verify API connectivity
 */
export async function testMasterCourseAPI(roleId: number = 2): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        console.log('Testing Master Course API connectivity...');
        const response = await getMasterCourseList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}
