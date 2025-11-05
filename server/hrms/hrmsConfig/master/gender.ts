'use server';

import { api } from '@/lib/apiService';
import type { MasterGenderInput, MasterGenderResponse } from '@/types/hrms/master-gender';

export async function getMasterGenderList(roleId: number) {
    const url = '/api/MasterGenderFacade/onloadgetdetails';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMG_Id: 0,
        MI_Id: 30,
        IVRMMG_GenderName: 'string',
        IVRMMG_ActiveFlag: true,
        genderList: [],
        retrunMsg: 'string',
        roleId: roleId
    };
    return await api.post<MasterGenderResponse>('hrms', url, requestBody);
}

export async function saveMasterGender(data: MasterGenderInput) {
    const isEdit = data.IVRMMG_Id && data.IVRMMG_Id > 0;
    const url = '/api/MasterGenderFacade'; // Use same endpoint for both add and edit
    
    console.log('🟠 [API] saveMasterGender called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    console.log('🟠 [API] URL:', url);
    
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        IVRMMG_Id: data.IVRMMG_Id || 0,
        MI_Id: data.MI_Id || 30,
        IVRMMG_GenderName: data.IVRMMG_GenderName,
        IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag,
        genderList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                IVRMMG_Id: data.IVRMMG_Id || 0,
                MI_Id: data.MI_Id || 30,
                IVRMMG_GenderName: data.IVRMMG_GenderName,
                IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30
    };
    
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterGenderResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.IVRMMG_Id:', (response as any)?.IVRMMG_Id);
        
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const genderId = responseData?.IVRMMG_Id || (responseData?.data as any)?.IVRMMG_Id || 0;
        const hasGenderList = !!(responseData?.genderList || responseData?.data?.genderList);
        
        console.log('🟢 [API] Parsed - genderId:', genderId, 'retrunMsg:', retrunMsg, 'hasGenderList:', hasGenderList);
        
        // Check if "Update" or "Saved" message indicates success
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved';
        
        // Success if we have a gender ID, genderList, or success message
        const isSuccess = genderId > 0 || hasGenderList || isUpdateSuccess;
        
        console.log('🟢 [API] isSuccess:', isSuccess);
        
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess 
                ? (isEdit ? 'Gender updated successfully' : 'Gender added successfully')
                : (retrunMsg || 'Failed to save gender'),
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
 * Activate or Deactivate a master gender record
 * POST /api/MasterGenderFacade/deactivateRecordById
 */
export async function activateDeactivateMasterGender(data: {
    IVRMMG_Id: number;
    IVRMMG_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterGenderFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMG_Id: data.IVRMMG_Id,
        MI_Id: 30,
        IVRMMG_GenderName: 'string',
        IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag,
        genderList: [],
        retrunMsg: 'string',
        roleId: 0
    };
    return await api.post<MasterGenderResponse>('hrms', url, requestBody);
}
