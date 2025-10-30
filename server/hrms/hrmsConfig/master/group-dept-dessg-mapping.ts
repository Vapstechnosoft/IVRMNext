// Group Department Designation Mapping API Integration

import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type { GroupDeptDessgMappingInput, GroupDeptDessgMappingResponse, LoadDataRequest } from '@/types/hrms/group-dept-dessg-mapping';
import axios from 'axios';

/**
 * Get onload details for group department designation mapping
 * POST /api/GroupDeptDessgFacade/loaddata
 */
export async function getGroupDeptDessgMappingList(_roleId = 0): Promise<ApiResponse<GroupDeptDessgMappingResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/GroupDeptDessgFacade/loaddata';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRGTDDS_Id: 0,
            MI_Id: 30,
            HRMGT_Id: 0,
            HRMD_Id: 0,
            HRMDES_Id: 0,
            HRGTDDS_ActiveFlg: true,
            HRGTDDS_CreatedBy: 0,
            HRGTDDS_UpdatedBy: 0,
            HRGTDDS_CreatedDate: new Date().toISOString(),
            HRGTDDS_UpdatedDate: new Date().toISOString(),
            groupTypedropdown: [],
            departmentdropdown: [],
            designationdropdown: [],
            gridviewdata: [],
            designationids: [],
            LogInUserId: 5,
            HRMGT_EmployeeGroupType: '',
            HRMD_DepartmentName: '',
            HRMDES_DesignationName: '',
            returnval: false,
            msg: ''
        };

        const axiosResponse = await axios.post<GroupDeptDessgMappingResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<GroupDeptDessgMappingResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Data loaded successfully' : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error loading group dept dessg mapping data ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        const errorResponse: ApiResponse<GroupDeptDessgMappingResponse> = {
            success: false,
            message: error.message || 'Failed to load group dept dessg mapping data',
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
 * Save/Update group department designation mapping
 * POST /api/GroupDeptDessgFacade/savedata
 */
export async function saveGroupDeptDessgMapping(data: GroupDeptDessgMappingInput): Promise<ApiResponse<GroupDeptDessgMappingResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/GroupDeptDessgFacade/savedata';
        const url = `${baseURL}${apiPath}`;

        const requestBody: LoadDataRequest = {
            HRGTDDS_Id: data.hrgtddS_Id || 0,
            MI_Id: 30,
            HRMGT_Id: data.hrmgT_Id,
            HRMD_Id: data.hrmD_Id,
            HRMDES_Id: data.hrmdeS_Id,
            HRGTDDS_ActiveFlg: data.hrgtddS_ActiveFlg,
            HRGTDDS_CreatedBy: data.hrgtddS_CreatedBy || 5,
            HRGTDDS_UpdatedBy: data.hrgtddS_UpdatedBy || 5,
            HRGTDDS_CreatedDate: data.hrgtddS_CreatedDate || new Date().toISOString(),
            HRGTDDS_UpdatedDate: new Date().toISOString(),
            groupTypedropdown: [],
            departmentdropdown: [],
            designationdropdown: [],
            gridviewdata: [],
            designationids: data.designationids || [],
            LogInUserId: data.logInUserId || 5,
            HRMGT_EmployeeGroupType: data.hrmgT_EmployeeGroupType || '',
            HRMD_DepartmentName: data.hrmD_DepartmentName || '',
            HRMDES_DesignationName: data.hrmdeS_DesignationName || '',
            returnval: false,
            msg: ''
        };

        const axiosResponse = await axios.post<GroupDeptDessgMappingResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<GroupDeptDessgMappingResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300 && axiosResponse.data.returnval,
            message: axiosResponse.data.msg || (data.hrgtddS_Id === 0 ? 'Mapping created successfully' : 'Mapping updated successfully'),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving group dept dessg mapping ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save group dept dessg mapping',
            data: null
        };
    }
}

/**
 * Activate/Deactivate group department designation mapping
 * POST /api/GroupDeptDessgFacade/masterDecative
 */
export async function activateDeactivateGroupDeptDessgMapping(data: { HRGTDDS_Id: number; HRGTDDS_ActiveFlg: boolean }): Promise<
    ApiResponse<GroupDeptDessgMappingResponse>
> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/GroupDeptDessgFacade/masterDecative';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRGTDDS_Id: data.HRGTDDS_Id,
            MI_Id: 30,
            HRMGT_Id: 0,
            HRMD_Id: 0,
            HRMDES_Id: 0,
            HRGTDDS_ActiveFlg: data.HRGTDDS_ActiveFlg,
            HRGTDDS_CreatedBy: 0,
            HRGTDDS_UpdatedBy: 0,
            HRGTDDS_CreatedDate: new Date().toISOString(),
            HRGTDDS_UpdatedDate: new Date().toISOString(),
            groupTypedropdown: [],
            departmentdropdown: [],
            designationdropdown: [],
            gridviewdata: [],
            designationids: [],
            LogInUserId: 5,
            HRMGT_EmployeeGroupType: '',
            HRMD_DepartmentName: '',
            HRMDES_DesignationName: '',
            returnval: false,
            msg: ''
        };

        const axiosResponse = await axios.post<GroupDeptDessgMappingResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<GroupDeptDessgMappingResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300 && (axiosResponse.data.returnval !== false),
            message:
                axiosResponse.data.msg || (data.HRGTDDS_ActiveFlg ? 'Mapping activated successfully' : 'Mapping deactivated successfully'),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error activating/deactivating group dept dessg mapping ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to activate/deactivate mapping',
            data: null
        };
    }
}
