'use server';

import { api } from '@/lib/apiService';
import type { MasterSpecializationInput, MasterSpecializationResponse } from '@/types/hrms/master-specialization';

/**
 * Get all master specialization records (onload)
 * POST /api/masterSpecialisationFacade/loaddata
 */
export async function getMasterSpecializationList(roleId: number) {
    const url = '/api/masterSpecialisationFacade/loaddata';
    const requestBody = {
        HRMSPL_Id: 0,
        MI_Id: 30,
        UserId: roleId,
        HRMSPL_SpecialisationName: 'string',
        HRMSPL_ActiveFlg: true,
        HRMSPL_CreatedBy: 0,
        HRMSPL_UpdatedBy: 0,
        HRMSPL_CreatedDate: new Date().toISOString(),
        HRMSPL_UpdatedDate: new Date().toISOString(),
        alldata: [],
        editlist: [],
        duplicate: false,
        msg: 'string',
        returnval: true
    };
    return await api.post<MasterSpecializationResponse>('hrms', url, requestBody);
}

/**
 * Create or Update master specialization item
 * POST /api/masterSpecialisationFacade/savedata (create)
 * POST /api/masterSpecialisationFacade/EditData (update)
 */
export async function saveMasterSpecialization(data: MasterSpecializationInput) {
    const isEdit = data.HRMSPL_Id && data.HRMSPL_Id > 0;
    const url = isEdit ? '/api/masterSpecialisationFacade/EditData' : '/api/masterSpecialisationFacade/savedata';
    
    console.log('🟠 [API] saveMasterSpecialization called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const now = new Date().toISOString();
    
    // For edit mode, construct the request body according to the specification
    if (isEdit) {
        const editItem = {
            HRMSPL_Id: data.HRMSPL_Id || 0,
            MI_Id: data.MI_Id || 30,
            HRMSPL_SpecialisationName: data.HRMSPL_SpecialisationName,
            HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
            HRMSPL_CreatedBy: 0,
            HRMSPL_UpdatedBy: 0,
            HRMSPL_CreatedDate: now,
            HRMSPL_UpdatedDate: now
        };
        
        const requestBody = {
            HRMSPL_Id: data.HRMSPL_Id || 0,
            MI_Id: data.MI_Id || 30,
            UserId: 0,
            HRMSPL_SpecialisationName: data.HRMSPL_SpecialisationName,
            HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
            HRMSPL_CreatedBy: 0,
            HRMSPL_UpdatedBy: 0,
            HRMSPL_CreatedDate: now,
            HRMSPL_UpdatedDate: now,
            alldata: [editItem],
            editlist: [editItem],
            duplicate: false,
            msg: '',
            returnval: true
        };
        
        console.log('🟠 [API] Request URL:', url);
        console.log('🟠 [API] Request Body (Edit):', JSON.stringify(requestBody, null, 2));
        console.log('🟠 [API] Calling api.post...');
        
        try {
            const response = await api.post<MasterSpecializationResponse>('hrms', url, requestBody);
            
            console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
            
            const responseData = response as any;
            
            // Check for response structure: { success: true, message: "Add", data: { ... } }
            // or direct structure: { returnval: true, msg: "Add", duplicate: false, ... }
            const topLevelSuccess = responseData?.success === true;
            const topLevelMessage = responseData?.message || '';
            const nestedData = responseData?.data || responseData;
            
            // Check for returnval (boolean) and msg (string) fields
            const returnval = nestedData?.returnval ?? responseData?.returnval ?? false;
            const msg = nestedData?.msg || responseData?.msg || topLevelMessage || '';
            const duplicate = nestedData?.duplicate ?? responseData?.duplicate ?? false;
            const savedId = nestedData?.HRMSPL_Id || responseData?.HRMSPL_Id || 0;
            const hasAlldata = !!(nestedData?.alldata?.length > 0 || responseData?.alldata?.length > 0);
            
            // Success indicators: topLevelSuccess, returnval === true, or has alldata, and not duplicate
            const isSuccess = topLevelSuccess || (returnval === true && !duplicate) || (hasAlldata && !duplicate);
            const isDuplicateError = duplicate === true;
            
            console.log('🟢 [API] Parsed - topLevelSuccess:', topLevelSuccess, 'topLevelMessage:', topLevelMessage);
            console.log('🟢 [API] Parsed - returnval:', returnval, 'msg:', msg, 'duplicate:', duplicate);
            console.log('🟢 [API] Parsed - savedId:', savedId, 'hasAlldata:', hasAlldata);
            console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
            
            const formattedResponse = {
                success: isSuccess,
                message: isDuplicateError
                    ? 'Specialization already exists'
                    : isSuccess
                        ? (topLevelMessage || msg || 'Specialization updated successfully')
                        : (msg || 'Failed to save specialization'),
                data: nestedData || responseData
            };
            
            console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
            
            return formattedResponse as any;
        } catch (error: any) {
            console.log('🔴 [API] Error occurred');
            console.error('🔴 [API] Error:', error);
            
            // Return a formatted error response
            const errorMessage = error?.message || error?.response?.data?.message || 'Failed to save specialization';
            return {
                success: false,
                message: errorMessage,
                data: null
            } as any;
        }
    }
    
    // For create mode, use the original structure
    const requestBody = {
        HRMSPL_Id: data.HRMSPL_Id || 0,
        MI_Id: data.MI_Id || 30,
        UserId: 0,
        HRMSPL_SpecialisationName: data.HRMSPL_SpecialisationName,
        HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
        HRMSPL_CreatedBy: 0,
        HRMSPL_UpdatedBy: 0,
        HRMSPL_CreatedDate: now,
        HRMSPL_UpdatedDate: now,
        alldata: [],
        editlist: [],
        duplicate: false,
        msg: '',
        returnval: true
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterSpecializationResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        
        // Check for response structure: { success: true, message: "Add", data: { ... } }
        // or direct structure: { returnval: true, msg: "Add", duplicate: false, ... }
        const topLevelSuccess = responseData?.success === true;
        const topLevelMessage = responseData?.message || '';
        const nestedData = responseData?.data || responseData;
        
        // Check for returnval (boolean) and msg (string) fields
        const returnval = nestedData?.returnval ?? responseData?.returnval ?? false;
        const msg = nestedData?.msg || responseData?.msg || topLevelMessage || '';
        const duplicate = nestedData?.duplicate ?? responseData?.duplicate ?? false;
        const savedId = nestedData?.HRMSPL_Id || responseData?.HRMSPL_Id || 0;
        const hasAlldata = !!(nestedData?.alldata?.length > 0 || responseData?.alldata?.length > 0);
        
        // Success indicators: topLevelSuccess, returnval === true, or has alldata, and not duplicate
        const isSuccess = topLevelSuccess || (returnval === true && !duplicate) || (hasAlldata && !duplicate);
        const isDuplicateError = duplicate === true;
        
        console.log('🟢 [API] Parsed - topLevelSuccess:', topLevelSuccess, 'topLevelMessage:', topLevelMessage);
        console.log('🟢 [API] Parsed - returnval:', returnval, 'msg:', msg, 'duplicate:', duplicate);
        console.log('🟢 [API] Parsed - savedId:', savedId, 'hasAlldata:', hasAlldata);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError
                ? 'Specialization already exists'
                : isSuccess
                    ? (topLevelMessage || msg || 'Specialization added successfully')
                    : (msg || 'Failed to save specialization'),
            data: nestedData || responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
        
        // Return a formatted error response
        const errorMessage = error?.message || error?.response?.data?.message || 'Failed to save specialization';
        return {
            success: false,
            message: errorMessage,
            data: null
        } as any;
    }
}

/**
 * Get details of a specific master specialization by ID
 * GET /api/MasterSpecialisationFacade/getRecordById/{id}
 */
export async function getMasterSpecializationDetails(id: number) {
    const url = `/api/MasterSpecialisationFacade/getRecordById/${id}`;
    return await api.get<MasterSpecializationResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master specialization record
 * POST /api/masterSpecialisationFacade/masterDecative
 */
export async function activateDeactivateMasterSpecialization(data: {
    HRMSPL_Id: number;
    HRMSPL_ActiveFlg: boolean;
    MI_Id?: number;
}) {
    const url = '/api/masterSpecialisationFacade/masterDecative';
    
    console.log('🟠 [API] activateDeactivateMasterSpecialization called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Action:', data.HRMSPL_ActiveFlg ? 'Activate' : 'Deactivate');
    
    const requestBody = {
        HRMSPL_Id: data.HRMSPL_Id,
        MI_Id: 30,
        UserId: 0,
        HRMSPL_SpecialisationName: 'string',
        HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
        HRMSPL_CreatedBy: 0,
        HRMSPL_UpdatedBy: 0,
        HRMSPL_CreatedDate: new Date().toISOString(),
        HRMSPL_UpdatedDate: new Date().toISOString(),
        alldata: [],
        editlist: [],
        duplicate: false,
        msg: 'string',
        returnval: true
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterSpecializationResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        
        // Check for response structure: { success: true, message: "...", data: { ... } }
        // or direct structure: { returnval: true, msg: "...", duplicate: false, ... }
        const topLevelSuccess = responseData?.success === true;
        const topLevelMessage = responseData?.message || '';
        const nestedData = responseData?.data || responseData;
        
        // Check for returnval (boolean) and msg (string) fields
        const returnval = nestedData?.returnval ?? responseData?.returnval ?? false;
        const msg = nestedData?.msg || responseData?.msg || topLevelMessage || '';
        const duplicate = nestedData?.duplicate ?? responseData?.duplicate ?? false;
        
        // Success indicators: topLevelSuccess or returnval === true, and not duplicate
        const isSuccess = topLevelSuccess || (returnval === true && !duplicate);
        
        console.log('🟢 [API] Parsed - topLevelSuccess:', topLevelSuccess, 'topLevelMessage:', topLevelMessage);
        console.log('🟢 [API] Parsed - returnval:', returnval, 'msg:', msg, 'duplicate:', duplicate);
        console.log('🟢 [API] isSuccess:', isSuccess);
        
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess
                ? (topLevelMessage || msg || `Specialization ${data.HRMSPL_ActiveFlg ? 'activated' : 'deactivated'} successfully`)
                : (msg || `Failed to ${data.HRMSPL_ActiveFlg ? 'activate' : 'deactivate'} specialization`),
            data: nestedData || responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
        
        // Return a formatted error response
        const errorMessage = error?.message || error?.response?.data?.message || `Failed to ${data.HRMSPL_ActiveFlg ? 'activate' : 'deactivate'} specialization`;
        return {
            success: false,
            message: errorMessage,
            data: null
        } as any;
    }
}
