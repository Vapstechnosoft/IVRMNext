'use server';

import { api } from '@/lib/apiService';
import type { MasterMaritalStatusInput, MasterMaritalStatusResponse } from '@/types/hrms/master-marital-status';

export async function getMasterMaritalStatusList(roleId: number) {
    const url = '/api/MasterMaritalStatusFacade/onloadgetdetails';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMMS_Id: 0,
        MI_Id: 30,
        IVRMMMS_MaritalStatus: 'string',
        IVRMMMS_ActiveFlag: true,
        maritalstatusList: [],
        retrunMsg: 'string',
        roleId: roleId
    };
    return await api.post<MasterMaritalStatusResponse>('hrms', url, requestBody);
}

export async function saveMasterMaritalStatus(data: MasterMaritalStatusInput) {
    const isEdit = data.IVRMMMS_Id && data.IVRMMMS_Id > 0;
    const url = '/api/MasterMaritalStatusFacade';
    
    console.log('🟠 [API] saveMasterMaritalStatus called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        IVRMMMS_Id: data.IVRMMMS_Id || 0,
        MI_Id: data.MI_Id || 30,
        IVRMMMS_MaritalStatus: data.IVRMMMS_MaritalStatus,
        IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag,
        maritalstatusList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                IVRMMMS_Id: data.IVRMMMS_Id || 0,
                MI_Id: data.MI_Id || 30,
                IVRMMMS_MaritalStatus: data.IVRMMMS_MaritalStatus,
                IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterMaritalStatusResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.IVRMMMS_Id:', (response as any)?.IVRMMMS_Id);
        
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.IVRMMMS_Id || (responseData?.data as any)?.IVRMMMS_Id || 0;
        const hasMaritalStatusList = !!(responseData?.maritalstatusList || responseData?.data?.maritalstatusList);
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasMaritalStatusList:', hasMaritalStatusList);
        
        // Check for success indicators
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || hasMaritalStatusList || isUpdateSuccess) && !isDuplicateError;
        
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Marital status already exists'
                : isSuccess 
                    ? (isEdit ? 'Marital status updated successfully' : 'Marital status added successfully')
                    : (retrunMsg || 'Failed to save marital status'),
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred in api.post');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        throw error;
    }
}

/**
 * Activate or Deactivate a master marital status record
 * POST /api/MasterMaritalStatusFacade/deactivateRecordById
 */
export async function activateDeactivateMasterMaritalStatus(data: {
    IVRMMMS_Id: number;
    IVRMMMS_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterMaritalStatusFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMMS_Id: data.IVRMMMS_Id,
        MI_Id: 30,
        IVRMMMS_MaritalStatus: 'string',
        IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag,
        maritalstatusList: [],
        retrunMsg: 'string',
        roleId: 0
    };
    return await api.post<MasterMaritalStatusResponse>('hrms', url, requestBody);
}
