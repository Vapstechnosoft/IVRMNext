// Master Designation API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterDesignationResponse,
    DesignationDetail,
    MasterDesignationInput,
    OnloadGetDesignationDetailsRequest,
    SaveDesignationRequest
} from '@/types/hrms/master-designation';

/**
 * Get all master designation records by role ID
 * GET /api/MasterDesignation/getalldetails/{roleId}
 */
export async function getMasterDesignationList(roleId: number): Promise<ApiResponse<MasterDesignationResponse>> {
    try {
        const url = `/api/MasterDesignation/getalldetails/${roleId}`;
        console.log('Fetching master designation list from:', url);
        
        const response = await api.get<MasterDesignationResponse>(url);
        console.log('Master designation list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master designation list:', error);
        throw error;
    }
}

/**
 * Create a new master designation record
 * POST /api/MasterDesignationFacade
 * Using axios directly with proxy
 */
export async function saveMasterDesignation(data: MasterDesignationInput): Promise<ApiResponse<MasterDesignationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterDesignationFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: SaveDesignationRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMDES_Id: data.HRMDES_Id || 0,
            MI_Id: 30,
            HRMDES_DesignationName: data.HRMDES_DesignationName,
            HRMDES_BasicAmount: data.HRMDES_BasicAmount,
            HRMDES_SanctionedSeats: data.HRMDES_SanctionedSeats,
            HRMDES_DisplaySanctionedSeatsFlag: data.HRMDES_DisplaySanctionedSeatsFlag,
            HRMDES_Order: data.HRMDES_Order || 0,
            HRMDES_ActiveFlag: data.HRMDES_ActiveFlag,
            designationlList: [],
            retrunMsg: "string",
            roleId: data.MI_Id,
            DesignationDTO: []
        };

        console.log('=== Save Designation API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Designation API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterDesignationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Designation saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Designation API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterDesignationResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save designation',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}


/**
 * Activate or Deactivate a master designation record
 * POST /api/MasterDesignationFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterDesignation(data: { HRMDES_Id: number; HRMDES_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterDesignationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterDesignationFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: SaveDesignationRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMDES_Id: data.HRMDES_Id,
            MI_Id: 30,
            HRMDES_DesignationName: "string",
            HRMDES_BasicAmount: 0,
            HRMDES_SanctionedSeats: 0,
            HRMDES_DisplaySanctionedSeatsFlag: true,
            HRMDES_Order: 0,
            HRMDES_ActiveFlag: data.HRMDES_ActiveFlag,
            designationlList: [],
            retrunMsg: "string",
            roleId: data.roleId || 0,
            DesignationDTO: []
        };

        console.log('=== Activate/Deactivate Designation API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Designation API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterDesignationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Designation status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Designation API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterDesignationResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update designation status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get onload details for master designation
 * POST /api/MasterDesignationFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadDesignationDetails(roleId: number): Promise<ApiResponse<MasterDesignationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterDesignationFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetDesignationDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMDES_Id: 0,
            MI_Id: 30,
            HRMDES_DesignationName: "string",
            HRMDES_BasicAmount: 0,
            HRMDES_SanctionedSeats: 0,
            HRMDES_DisplaySanctionedSeatsFlag: true,
            HRMDES_Order: 0,
            HRMDES_ActiveFlag: true,
            designationlList: [],
            retrunMsg: "string",
            roleId: roleId,
            DesignationDTO: []
        };
        
        console.log('=== Onload Designation Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onload Designation Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterDesignationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Designations loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onload Designation Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterDesignationResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to load designations',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get designation record by ID
 * GET /api/MasterDesignationFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getDesignationById(id: number): Promise<ApiResponse<MasterDesignationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterDesignationFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Designation By ID API Request ===');
        console.log('URL:', url);
        console.log('Designation ID:', id);

        const axiosResponse = await axios.get<MasterDesignationResponse>(url, {
            headers: {
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Get Designation By ID API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterDesignationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Designation fetched successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Get Designation By ID API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterDesignationResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch designation',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get onchange details for master designation
 * POST /api/MasterDesignationFacade/Onchangedetails
 * Using axios directly with proxy
 */
export async function getOnchangeDesignationDetails(designationId: number, roleId: number): Promise<ApiResponse<MasterDesignationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterDesignationFacade/Onchangedetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetDesignationDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMDES_Id: designationId,
            MI_Id: 30,
            HRMDES_DesignationName: "string",
            HRMDES_BasicAmount: 0,
            HRMDES_SanctionedSeats: 0,
            HRMDES_DisplaySanctionedSeatsFlag: true,
            HRMDES_Order: 0,
            HRMDES_ActiveFlag: true,
            designationlList: [],
            retrunMsg: "string",
            roleId: roleId,
            DesignationDTO: []
        };
        
        console.log('=== Onchange Designation Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onchange Designation Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterDesignationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Designation details fetched successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onchange Designation Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterDesignationResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch designation details',
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
export async function testMasterDesignationAPI(roleId: number = 2): Promise<ApiResponse<MasterDesignationResponse>> {
    try {
        console.log('Testing Master Designation API connectivity...');
        const response = await getMasterDesignationList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}








