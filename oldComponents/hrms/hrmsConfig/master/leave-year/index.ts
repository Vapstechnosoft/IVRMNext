// Master Leave Year API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterLeaveYearResponse,
    LeaveYearDetail,
    MasterLeaveYearInput,
    OnloadGetLeaveYearDetailsRequest
} from '@/types/hrms/master-leave-year';


/**
 * Create or Update a master leave year record
 * POST /api/MasterLeaveYearFacade
 * Using axios directly with proxy
 */
export async function saveMasterLeaveYear(data: MasterLeaveYearInput): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterLeaveYearFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetLeaveYearDetailsRequest = {
            HRMLY_Id: data.HRMLY_Id || 0,
            MI_Id: data.MI_Id,
            HRMLY_LeaveYear: data.HRMLY_LeaveYear,
            HRMLY_FromDate: data.HRMLY_FromDate,
            HRMLY_ToDate: data.HRMLY_ToDate,
            HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
            leaveYearList: [],
            retrunMsg: "",
            roleId: data.MI_Id || 1,
            ASMAY_From_Date: null,
            ASMAY_To_Date: null,
            HRMLY_LeaveYearOrder: data.HRMLY_LeaveYearOrder || 1,
            yeardetailList: [],
            LeaveorderDTO: []
        };

        console.log('=== Save Leave Year API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterLeaveYearResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Leave Year API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Leave year saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Leave Year API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterLeaveYearResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save leave year',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Edit/Update an existing master leave year record
 * POST /api/MasterLeaveYear/editRecord
 */
export async function editMasterLeaveYear(data: MasterLeaveYearInput): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const url = `/api/MasterLeaveYear/editRecord`;
        console.log('Editing master leave year:', url, data);

        const response = await api.post<MasterLeaveYearResponse>(url, data);
        console.log('Edit master leave year response:', response);

        return response;
    } catch (error) {
        console.error('Error editing master leave year:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master leave year record
 * POST /api/MasterLeaveYearFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterLeaveYear(data: { HRMLY_Id: number; HRMLY_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterLeaveYearFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const currentDate = new Date().toISOString();
        
        const requestBody: OnloadGetLeaveYearDetailsRequest = {
            HRMLY_Id: data.HRMLY_Id,
            MI_Id: 30,
            HRMLY_LeaveYear: "",
            HRMLY_FromDate: currentDate,
            HRMLY_ToDate: currentDate,
            HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
            leaveYearList: [],
            retrunMsg: "",
            roleId: data.roleId || 1,
            ASMAY_From_Date: null,
            ASMAY_To_Date: null,
            HRMLY_LeaveYearOrder: 1,
            yeardetailList: [],
            LeaveorderDTO: []
        };

        console.log('=== Activate/Deactivate Leave Year API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterLeaveYearResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Leave Year API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Leave year ${data.HRMLY_ActiveFlag ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Leave Year API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterLeaveYearResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update leave year status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get onload details for master leave year
 * POST /api/MasterLeaveYearFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadLeaveYearDetails(roleId: number): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterLeaveYearFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const currentDate = new Date().toISOString();
        
        const requestBody: OnloadGetLeaveYearDetailsRequest = {
            HRMLY_Id: 1,
            MI_Id: 30,
            HRMLY_LeaveYear: "2025-2026",
            HRMLY_FromDate: "2025-04-01T00:00:00",
            HRMLY_ToDate: "2026-03-31T00:00:00",
            HRMLY_ActiveFlag: true,
            leaveYearList: [],
            retrunMsg: "",
            roleId: roleId,
            ASMAY_From_Date: null,
            ASMAY_To_Date: null,
            HRMLY_LeaveYearOrder: 1,
            yeardetailList: [],
            LeaveorderDTO: []
        };
        
        console.log('=== Onload Leave Year Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterLeaveYearResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onload Leave Year Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Leave years loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onload Leave Year Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterLeaveYearResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to load leave years',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Validate and update leave year order
 * POST /api/MasterLeaveYearFacade/validateordernumber
 * Using axios directly with proxy
 */
export async function validateOrderNumber(data: { LeaveorderDTO: any[] }): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterLeaveYearFacade/validateordernumber';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody = {
            ...data,
            MI_Id: 30
        };

        console.log('=== Validate Order Number API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterLeaveYearResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Validate Order Number API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Order updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Validate Order Number API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterLeaveYearResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to validate order number',
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
export async function testMasterLeaveYearAPI(roleId: number = 2): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        console.log('Testing Master Leave Year API connectivity...');
        const response = await getOnloadLeaveYearDetails(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}

/**
 * Get a master leave year record by ID
 * GET /api/MasterLeaveYearFacade/getRecordById/{id}
 */
export async function getMasterLeaveYearById(id: number): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterLeaveYearFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Leave Year by ID API Request ===');
        console.log('URL:', url);

        const axiosResponse = await axios.get<MasterLeaveYearResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Get Leave Year by ID API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Leave year retrieved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('Error getting leave year by ID:', error);
        const errorResponse: ApiResponse<MasterLeaveYearResponse> = {
            success: false,
            message: error?.message || 'Failed to get leave year',
            data: null
        };
        return errorResponse;
    }
}
