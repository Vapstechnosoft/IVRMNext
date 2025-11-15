'use server';

import { api } from '@/lib/apiService';
import type {
    MasterProfessionalTaxInput,
    MasterProfessionalTaxResponse
} from '@/types/hrms/master-professional-tax';

/**
 * Get onload details for master professional tax
 * POST /api/MasterProfessionalTaxFacade/onloadgetdetails
 */
export async function getMasterProfessionalTaxList(roleId: number) {
    const url = '/api/MasterProfessionalTaxFacade/onloadgetdetails';
    const requestBody = {
        HRMPT_Id: 0,
        MI_Id: 30,
        HRMPT_SalaryFrom: 0,
        HRMPT_SalaryTo: 0,
        HRMPT_PTax: 0,
        HRMPT_ActiveFlag: true,
        pTaxrList: [],
        retrunMsg: 'string',
        roleId: roleId,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    return await api.post<MasterProfessionalTaxResponse>('hrms', url, requestBody);
}

/**
 * Save or Update master professional tax record
 * POST /api/MasterProfessionalTaxFacade
 */
export async function saveMasterProfessionalTax(data: MasterProfessionalTaxInput) {
    const isEdit = data.HRMPT_Id && data.HRMPT_Id > 0;
    const url = '/api/MasterProfessionalTaxFacade';
    
    console.log('🟠 [API] saveMasterProfessionalTax called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMPT_Id: data.HRMPT_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMPT_SalaryFrom: Number(data.HRMPT_SalaryFrom) || 0,
        HRMPT_SalaryTo: Number(data.HRMPT_SalaryTo) || 0,
        HRMPT_PTax: Number(data.HRMPT_PTax) || 0,
        HRMPT_ActiveFlag: data.HRMPT_ActiveFlag ?? true,
        pTaxrList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                HRMPT_Id: data.HRMPT_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMPT_SalaryFrom: Number(data.HRMPT_SalaryFrom) || 0,
                HRMPT_SalaryTo: Number(data.HRMPT_SalaryTo) || 0,
                HRMPT_PTax: Number(data.HRMPT_PTax) || 0,
                HRMPT_ActiveFlag: data.HRMPT_ActiveFlag ?? true
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterProfessionalTaxResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMPT_Id:', (response as any)?.HRMPT_Id);
        
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMPT_Id || (responseData?.data as any)?.HRMPT_Id || 0;
        const hasPTaxrList = !!(responseData?.pTaxrList || responseData?.data?.pTaxrList);
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasPTaxrList:', hasPTaxrList);
        
        // Check for success indicators
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || hasPTaxrList || isUpdateSuccess) && !isDuplicateError;
        
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Professional tax slab already exists'
                : isSuccess 
                    ? (isEdit ? 'Professional tax updated successfully' : 'Professional tax added successfully')
                    : (retrunMsg || 'Failed to save professional tax'),
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
 * Get details of a specific master professional tax by ID
 * GET /api/MasterProfessionalTaxFacade/getRecordById/{id}
 */
export async function getMasterProfessionalTaxDetails(id: number) {
    const url = `/api/MasterProfessionalTaxFacade/getRecordById/${id}`;
    return await api.get<MasterProfessionalTaxResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master professional tax record
 * POST /api/MasterProfessionalTaxFacade/deactivateRecordById
 */
export async function activateDeactivateMasterProfessionalTax(data: {
    HRMPT_Id: number;
    HRMPT_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterProfessionalTaxFacade/deactivateRecordById';
    const requestBody = {
        HRMPT_Id: data.HRMPT_Id,
        MI_Id: 30,
        HRMPT_SalaryFrom: 0,
        HRMPT_SalaryTo: 0,
        HRMPT_PTax: 0,
        HRMPT_ActiveFlag: data.HRMPT_ActiveFlag,
        pTaxrList: [],
        retrunMsg: 'string',
        roleId: 0,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    return await api.post<MasterProfessionalTaxResponse>('hrms', url, requestBody);
}
