// Religion Category Mapping API Integration

import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type { ReligionCategoryMappingInput, ReligionCategoryMappingResponse } from '@/types/hrms/religion-category-mapping';
import axios from 'axios';

/**
 * Get onload details for religion category mapping
 * POST /api/ReligionCategory_MappingFacade/loaddata
 */
export async function getReligionCategoryMappingList(_roleId = 0, userId = 2): Promise<ApiResponse<ReligionCategoryMappingResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/ReligionCategory_MappingFacade/loaddata';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            IRCC_Id: 0,
            MI_Id: 30,
            UserId: userId,
            IVRMMR_Id: 0,
            IMCC_Id: 0,
            IRCC_ActiveFlg: true,
            IRCC_CreatedBy: 0,
            IRCC_UpdatedBy: 0,
            IRCC_CreatedDate: new Date().toISOString(),
            IRCC_UpdatedDate: new Date().toISOString(),
            religion_list: [
                {
                    CreatedDate: new Date().toISOString(),
                    UpdatedDate: new Date().toISOString(),
                    IVRMMR_Id: 0,
                    IVRMMR_Name: 'string',
                    Is_Active: true
                }
            ],
            get_masterlist: [],
            caste_list: [
                {
                    CreatedDate: new Date().toISOString(),
                    UpdatedDate: new Date().toISOString(),
                    IMCC_Id: 0,
                    IMCC_CategoryName: 'string',
                    IMCC_CategoryCode: 'string',
                    IMCC_CategoryDesc: 'string'
                }
            ],
            editlist: [],
            returnval: true,
            castid: [],
            duplicate: true,
            IVRMMR_Name: 'string',
            IMCC_CategoryName: 'string',
            msg: 'string'
        };

        const axiosResponse = await axios.post<ReligionCategoryMappingResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<ReligionCategoryMappingResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Data loaded successfully' : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error loading religion category mapping data ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        const errorResponse: ApiResponse<ReligionCategoryMappingResponse> = {
            success: false,
            message: error.message || 'Failed to load religion category mapping data',
            data: null
        };

        if (error.response && error.response.status === 401) {
            errorResponse.message = 'Unauthorized. Please check your credentials.';
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Save or Update religion category mapping record
 * POST /api/ReligionCategory_MappingFacade/savedata (create)
 * POST /api/ReligionCategory_MappingFacade/Editdata (update)
 */
export async function saveReligionCategoryMapping(
    data: ReligionCategoryMappingInput
): Promise<ApiResponse<ReligionCategoryMappingResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const isEdit = data.IRCC_Id && data.IRCC_Id > 0;
        const apiPath = isEdit 
            ? '/api/ReligionCategory_MappingFacade/Editdata' 
            : '/api/ReligionCategory_MappingFacade/savedata';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            IRCC_Id: data.IRCC_Id || 0,
            MI_Id: data.MI_Id || 30,
            UserId: data.UserId || 0,
            IVRMMR_Id: 0, // API expects 0 in main payload
            IMCC_Id: 0, // API expects 0 in main payload
            IRCC_ActiveFlg: data.IRCC_ActiveFlg ?? true,
            IRCC_CreatedBy: data.IRCC_CreatedBy || 0,
            IRCC_UpdatedBy: data.IRCC_UpdatedBy || 0,
            IRCC_CreatedDate: new Date().toISOString(),
            IRCC_UpdatedDate: new Date().toISOString(),
            religion_list: [
                {
                    CreatedDate: new Date().toISOString(),
                    UpdatedDate: new Date().toISOString(),
                    IVRMMR_Id: data.IVRMMR_Id || 0, // Actual selected religion ID goes here
                    IVRMMR_Name: 'string',
                    Is_Active: true
                }
            ],
            get_masterlist: [],
            caste_list: [
                {
                    CreatedDate: new Date().toISOString(),
                    UpdatedDate: new Date().toISOString(),
                    IMCC_Id: data.IMCC_Id || 0, // Actual selected caste ID goes here
                    IMCC_CategoryName: 'string',
                    IMCC_CategoryCode: 'string',
                    IMCC_CategoryDesc: 'string'
                }
            ],
            editlist: [],
            returnval: true,
            castid: [], // API expects empty array
            duplicate: true,
            IVRMMR_Name: 'string',
            IMCC_CategoryName: 'string',
            msg: 'string'
        };

        const axiosResponse = await axios.post<ReligionCategoryMappingResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<ReligionCategoryMappingResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300 && axiosResponse.data.returnval,
            message: axiosResponse.data.msg || (data.IRCC_Id === 0 ? 'Mapping created successfully' : 'Mapping updated successfully'),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving religion category mapping ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save religion category mapping',
            data: null
        };
    }
}

/**
 * Activate/Deactivate religion category mapping
 * POST /api/ReligionCategory_MappingFacade/masterDecative
 */
export async function activateDeactivateReligionCategoryMapping(data: { IRCC_Id: number; IRCC_ActiveFlg: boolean }): Promise<
    ApiResponse<ReligionCategoryMappingResponse>
> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/ReligionCategory_MappingFacade/masterDecative';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            IRCC_Id: data.IRCC_Id,
            MI_Id: 30,
            UserId: 0,
            IVRMMR_Id: 0,
            IMCC_Id: 0,
            IRCC_ActiveFlg: data.IRCC_ActiveFlg,
            IRCC_CreatedBy: 0,
            IRCC_UpdatedBy: 0,
            IRCC_CreatedDate: new Date().toISOString(),
            IRCC_UpdatedDate: new Date().toISOString(),
            religion_list: [],
            get_masterlist: [],
            caste_list: [],
            editlist: [],
            returnval: true,
            castid: [],
            duplicate: true,
            IVRMMR_Name: 'string',
            IMCC_CategoryName: 'string',
            msg: 'string'
        };

        const axiosResponse = await axios.post<ReligionCategoryMappingResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<ReligionCategoryMappingResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300 && (axiosResponse.data.returnval !== false),
            message:
                axiosResponse.data.msg || (data.IRCC_ActiveFlg ? 'Mapping activated successfully' : 'Mapping deactivated successfully'),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error activating/deactivating religion category mapping ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to activate/deactivate mapping',
            data: null
        };
    }
}
