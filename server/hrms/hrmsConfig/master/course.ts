import { clientEnv } from '@/env';
import { type ApiResponse, api } from '@/lib/apiService';
import type { CourseDetail, MasterCourseInput, MasterCourseResponse } from '@/types/hrms/master-course';
import axios from 'axios';

/**
 * Get all master course records (onload)
 * POST /api/MasterCourseFacade/onloadgetdetails
 */
export async function getMasterCourseList(roleId: number): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterCourseFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMC_Id: 0,
            MI_Id: 30,
            HRMC_QulaificationName: 'string',
            HRMC_QualificationDesc: 'string',
            HRMC_Order: 0,
            HRMC_ActiveFlag: true,
            HRMC_DefaultQualFag: false,
            HRMC_SpecialisationFlag: false,
            CourseList: [],
            retrunMsg: '',
            roleId: roleId,
            CourseDTO: []
        };

        const axiosResponse = await axios.post<MasterCourseResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterCourseResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Courses loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master course list:', error);
        throw error;
    }
}

/**
 * Create or Update master course item
 * POST /api/MasterCourseFacade
 */
export async function saveMasterCourse(data: MasterCourseInput): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
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
            retrunMsg: '',
            roleId: data.MI_Id || 0,
            CourseDTO: []
        };

        const axiosResponse = await axios.post<MasterCourseResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterCourseResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || 'Operation completed',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving master course:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master course record
 * POST /api/MasterCourseFacade/deactivateRecordById
 */
export async function activateDeactivateMasterCourse(data: {
    HRMC_Id: number;
    HRMC_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterCourseFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMC_Id: data.HRMC_Id,
            MI_Id: 30,
            HRMC_QulaificationName: 'string',
            HRMC_QualificationDesc: 'string',
            HRMC_Order: 0,
            HRMC_ActiveFlag: data.HRMC_ActiveFlag,
            HRMC_DefaultQualFag: false,
            HRMC_SpecialisationFlag: false,
            CourseList: [],
            retrunMsg: '',
            roleId: 0,
            CourseDTO: []
        };

        const axiosResponse = await axios.post<MasterCourseResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterCourseResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Course status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error activating/deactivating master course:', error);
        throw error;
    }
}

/**
 * Get details of a specific master course by ID
 * GET /api/MasterCourseFacade/getRecordById/{id}
 */
export async function getMasterCourseDetails(id: number): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterCourseFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.get<MasterCourseResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterCourseResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Course details fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master course details:', error);
        throw error;
    }
}

/**
 * Save order for multiple courses
 * POST /api/MasterCourseFacade
 */
export async function saveMasterCourseOrder(courses: CourseDetail[]): Promise<ApiResponse<MasterCourseResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterCourseFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMC_Id: 0,
            MI_Id: 30,
            HRMC_QulaificationName: 'string',
            HRMC_QualificationDesc: 'string',
            HRMC_Order: 0,
            HRMC_ActiveFlag: true,
            HRMC_DefaultQualFag: false,
            HRMC_SpecialisationFlag: false,
            CourseList: [],
            retrunMsg: '',
            roleId: 0,
            CourseDTO: courses.map((course) => ({
                HRMC_Id: course.HRMC_Id,
                MI_Id: 30,
                HRMC_QulaificationName: course.HRMC_QulaificationName,
                HRMC_QualificationDesc: course.HRMC_QualificationDesc,
                HRMC_Order: course.HRMC_Order,
                HRMC_ActiveFlag: course.HRMC_ActiveFlag,
                HRMC_DefaultQualFag: course.HRMC_DefaultQualFag,
                HRMC_SpecialisationFlag: course.HRMC_SpecialisationFlag
            }))
        };

        const axiosResponse = await axios.post<MasterCourseResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterCourseResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Order saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving course order:', error);
        throw error;
    }
}
