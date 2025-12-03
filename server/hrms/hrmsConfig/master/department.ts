'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterDepartmentList, IMasterDepartmentSetOrderList } from '@/types/hrms/hrms-config/master';

export async function getMasterDepartment(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmD_DepartmentName');
    const url = `/api/MasterDepartmentFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterDepartmentList[]>('hrms', url);
}

export async function addOrUpdateMasterDepartment(data: any) {
    const url = '/api/MasterDepartmentFacade';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterDepartment(id: number) {
    const url = `/api/MasterDepartmentFacade/deactivateRecordById/${id}`;
    return await api.put('hrms', url);
}

export async function deleteMasterDepartment(id: number) {
    const url = `/api/MasterDepartmentFacade/delete/${id}`;
    return await api.delete<any>('hrms', url);
}

export async function getDepartmentSetOrder() {
    const url = '/api/MasterDepartmentFacade/set_order_list';
    return await api.get<IMasterDepartmentSetOrderList[]>('hrms', url);
}

export async function updateDepartmentSetorder(data: any) {
    const url = '/api/MasterDepartmentFacade/set_order';
    return await api.put<any>('hrms', url, data);
}

// Legacy functions - keeping for backward compatibility if needed
export async function saveMasterDepartment(data: any) {
    const isEdit = data.HRMD_Id && data.HRMD_Id > 0;
    const url = '/api/MasterDepartmentFacade';
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    const now = new Date().toISOString();
    const requestBody: any = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMD_Id: data.HRMD_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMD_DepartmentName: data.HRMD_DepartmentName,
        HRMD_Order: data.HRMD_Order ?? 0,
        HRMD_ActiveFlag: data.HRMD_ActiveFlag,
        departmentList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMD_Id: data.HRMD_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMD_DepartmentName: data.HRMD_DepartmentName,
                HRMD_Order: data.HRMD_Order ?? 0,
                HRMD_ActiveFlag: data.HRMD_ActiveFlag,
                HRMD_InternalTrainingMinimumHrs: data.HRMD_InternalTrainingMinimumHrs
            }
        ],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: data.MI_Id || 30,
        HRMD_InternalTrainingMinimumHrs: data.HRMD_InternalTrainingMinimumHrs,
        DeraptmentDTO: []
    };
    try {
        const response = await api.post<any>('hrms', url, requestBody);
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        const responseData = response as any;
        // Check for response structure: { success: true, message: "Add", data: { retrunMsg: "Add", ... } }
        // or direct structure: { retrunMsg: "Add", HRMD_Id: ..., ... }
        const topLevelSuccess = responseData?.success === true;
        const topLevelMessage = responseData?.message || '';
        const nestedData = responseData?.data || responseData;
        const retrunMsg = nestedData?.retrunMsg || responseData?.retrunMsg || topLevelMessage || '';
        const savedId = nestedData?.HRMD_Id || responseData?.HRMD_Id || 0;
        const hasDepartmentList = !!(nestedData?.departmentList?.length > 0 || responseData?.departmentList?.length > 0);
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        // If top level success is true, trust it; otherwise check other indicators
        const isSuccess = topLevelSuccess || ((savedId > 0 || isUpdateSuccess || hasDepartmentList) && !isDuplicateError);
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Department already exists'
                : isSuccess 
                    ? (topLevelMessage || (isEdit ? 'Department updated successfully' : 'Department added successfully'))
                    : (retrunMsg || 'Failed to save department'),
            data: nestedData || responseData
        };
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        return formattedResponse as any;
    } catch (error: any) {
        throw error;
    }
}
export async function activateDeactivateMasterDepartment(data: {
    HRMD_Id: number;
    HRMD_ActiveFlag: boolean;
    roleId?: number;
}) {
    const url = '/api/MasterDepartmentFacade/deactivateRecordById';
    const targetState = data.HRMD_ActiveFlag ? 'activate' : 'deactivate';
    // Request body matches Swagger: HRMD_Id, MI_Id, UserId
    const requestBody = {
        HRMD_Id: data.HRMD_Id,
        MI_Id: data.roleId || 30,
        UserId: 0
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<any>('hrms', url, requestBody);
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        // Handle the response format - extract data from response.data
        const responseData = response as any;
        const mainData = responseData?.data || responseData;
        // Extract retrunMsg and message from the correct location
        const retrunMsg = mainData?.retrunMsg || 
                         responseData?.retrunMsg || 
                         response?.message || 
                         '';
        const responseMessage = response?.message || '';
        // Extract HRMD_Id and HRMD_ActiveFlag from response
        const returnedId = mainData?.HRMD_Id || responseData?.HRMD_Id || 0;
        const returnedActiveFlag = mainData?.HRMD_ActiveFlag;
        // Check if departmentList contains the record with the correct active flag
        const departmentList = mainData?.departmentList || responseData?.departmentList || [];
        const recordInList = departmentList.find((item: any) => item.HRMD_Id === data.HRMD_Id);
        const flagMatchesInList = recordInList ? recordInList.HRMD_ActiveFlag === data.HRMD_ActiveFlag : false;
        // Check for success messages - "Deactivated" or "Activated" indicate success
        const retrunMsgLower = retrunMsg ? String(retrunMsg).toLowerCase().trim() : '';
        const responseMessageLower = responseMessage ? String(responseMessage).toLowerCase().trim() : '';
        const isSuccessMessage = retrunMsgLower === 'deactivated' || 
                                retrunMsgLower === 'activated' ||
                                responseMessageLower === 'deactivated' ||
                                responseMessageLower === 'activated';
        // Check for error messages
        const hasErrorInRetrunMsg = retrunMsgLower && (
            retrunMsgLower.includes('error') ||
            retrunMsgLower.includes('failed')
        );
        const hasErrorInMessage = responseMessageLower && (
            responseMessageLower.includes('error') ||
            responseMessageLower.includes('failed')
        );
        const isError = hasErrorInRetrunMsg || hasErrorInMessage;
        // Success indicators:
        // 1. Success message ("Deactivated" or "Activated")
        // 2. No error message
        // 3. returnedId matches the requested ID (or > 0)
        // 4. Flag matches in the list (if record found in list)
        const idMatches = returnedId === data.HRMD_Id || returnedId > 0;
        const flagMatches = returnedActiveFlag !== undefined ? returnedActiveFlag === data.HRMD_ActiveFlag : flagMatchesInList;
        // CRITICAL: If there's an error message, it's ALWAYS a failure
        // If there's a success message ("Deactivated"/"Activated"), it's a success
        const finalIsSuccess = !isError && (isSuccessMessage || (idMatches && flagMatches));
        // Determine the message to return
        let message = '';
        if (finalIsSuccess) {
            // Use the actual message from the backend
            message = retrunMsg || responseMessage || (data.HRMD_ActiveFlag ? 'Department activated successfully' : 'Department deactivated successfully');
        } else if (retrunMsg && retrunMsg.trim()) {
            // Use the actual error message from the backend
            message = retrunMsg.trim();
        } else if (responseMessage && responseMessage.trim()) {
            message = responseMessage.trim();
        } else {
            message = `Failed to ${targetState} department`;
        }
        const formattedResponse = {
            success: finalIsSuccess,
            message: message,
            data: responseData
        };
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        return formattedResponse as any;
    } catch (error: any) {
        throw error;
    }
}
export async function getOnloadDepartmentDetails(roleId: number) {
    const url = '/api/MasterDepartmentFacade/onloadgetdetails';
    const requestBody: any = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    };
    return await api.post<any>('hrms', url, requestBody);
}
export async function getDepartmentById(id: number) {
    const url = `/api/MasterDepartmentFacade/getRecordById/${id}`;
    return await api.get<any>('hrms', url);
}
export async function saveMasterDepartmentOrder(departments: any[]) {
    const url = '/api/MasterDepartmentFacade';
    const now = new Date().toISOString();
    // Use departmentList array (same as save endpoint)
    const requestBody: any = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: departments.map((dept) => ({
            CreatedDate: dept.createdDate || now,
            UpdatedDate: now,
            HRMD_Id: dept.hrmD_Id,
            MI_Id: dept.mI_Id || 30,
            HRMD_DepartmentName: dept.hrmD_DepartmentName,
            HRMD_Order: dept.hrmD_Order ?? 0,
            HRMD_ActiveFlag: dept.hrmD_ActiveFlag,
            HRMD_InternalTrainingMinimumHrs: dept.hrmD_InternalTrainingMinimumHrs
        })),
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: 30,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    };
    try {
        const response = await api.post<any>('hrms', url, requestBody);
        console.log('🟢 [API] saveMasterDepartmentOrder response:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.departmentList count:', (response as any)?.departmentList?.length);
        return response;
    } catch (error: any) {
        throw error;
    }
}
// Legacy updateDepartmentSetorder removed - use updateDepartmentSetorder directly
