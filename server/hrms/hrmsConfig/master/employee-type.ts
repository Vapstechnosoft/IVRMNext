'use server';

import { api } from '@/lib/apiService';
import type {
    MasterEmployeeTypeInput,
    MasterEmployeeTypeResponse,
    OnloadGetEmployeeTypeDetailsRequest,
    SaveEmployeeTypeRequest
} from '@/types/hrms/master-employee-type';

/**
 * Get all master employee type records
 * POST /api/MasterEmployeeTypeFacade/onloadgetdetails
 */
export async function getMasterEmployeeTypeList(roleId = 0) {
    const url = '/api/MasterEmployeeTypeFacade/onloadgetdetails';
    const requestBody: OnloadGetEmployeeTypeDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMET_Id: 0,
        MI_Id: 30,
        HRMET_EmployeeType: 'string',
        HRMET_ActiveFlag: true,
        employeeTypeList: [],
        retrunMsg: 'string',
        roleId
    };
    return await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
}

export async function saveMasterEmployeeType(data: MasterEmployeeTypeInput) {
    const isEdit = data.HRMET_Id && data.HRMET_Id > 0;
    const url = '/api/MasterEmployeeTypeFacade';
    
    console.log('🟠 [API] saveMasterEmployeeType called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const now = new Date().toISOString();
    const requestBody: SaveEmployeeTypeRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMET_Id: data.HRMET_Id || 0,
        MI_Id: data.MI_Id ?? 30,
        HRMET_EmployeeType: data.HRMET_EmployeeType,
        HRMET_ActiveFlag: data.HRMET_ActiveFlag,
        employeeTypeList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMET_Id: data.HRMET_Id || 0,
                MI_Id: data.MI_Id ?? 30,
                HRMET_EmployeeType: data.HRMET_EmployeeType,
                HRMET_ActiveFlag: data.HRMET_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id ?? 30
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMET_Id:', (response as any)?.HRMET_Id);
        
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMET_Id || 0;
        const hasEmployeeTypeList = !!(responseData?.employeeTypeList?.length > 0);
        
        // Check for success indicators - "Add", "Order" are also success messages!
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || isUpdateSuccess || hasEmployeeTypeList) && !isDuplicateError;
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasEmployeeTypeList:', hasEmployeeTypeList);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Employee type already exists'
                : isSuccess 
                    ? (isEdit ? 'Employee type updated successfully' : 'Employee type added successfully')
                    : (retrunMsg || 'Failed to save employee type'),
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
        throw error;
    }
}

export async function activateDeactivateMasterEmployeeType(data: {
    HRMET_Id: number;
    HRMET_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterEmployeeTypeFacade/deactivateRecordById';
    const now = new Date().toISOString();
    const requestBody: SaveEmployeeTypeRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMET_Id: data.HRMET_Id,
        MI_Id: data.MI_Id ?? 30,
        HRMET_EmployeeType: 'string',
        HRMET_ActiveFlag: data.HRMET_ActiveFlag,
        employeeTypeList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMET_Id: data.HRMET_Id,
                MI_Id: data.MI_Id ?? 30,
                HRMET_EmployeeType: 'string',
                HRMET_ActiveFlag: data.HRMET_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id ?? 30
    };
    return await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
}
