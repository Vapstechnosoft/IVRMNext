'use server';

import { api } from '@/lib/apiService';
import type { MasterLoanInput, MasterLoanResponse } from '@/types/hrms/master-loan';

/**
 * Get onload details for master loan
 * POST /api/HRMasterLoanFacade/onloadgetdetails
 */
export async function getMasterLoanList(roleId: number) {
    const url = '/api/HRMasterLoanFacade/onloadgetdetails';
    const requestBody = {
        HRMLN_Id: 0,
        MI_Id: 30,
        HRML_LoanType: 'string',
        HRML_Max: 0,
        HRMLN_ActiveFlag: true,
        gmasterloanList: [],
        retrunMsg: 'string',
        roleId: roleId,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    return await api.post<MasterLoanResponse>('hrms', url, requestBody);
}

/**
 * Save or Update master loan record
 * POST /api/HRMasterLoanFacade
 */
export async function saveMasterLoan(data: MasterLoanInput) {
    const isEdit = data.HRMLN_Id && data.HRMLN_Id > 0;
    const url = '/api/HRMasterLoanFacade';
    
    console.log('🟠 [API] saveMasterLoan called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const now = new Date().toISOString();
    const requestBody = {
        HRMLN_Id: data.HRMLN_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRML_LoanType: data.HRML_LoanType,
        HRML_Max: Number(data.HRML_Max) || 0,
        HRMLN_ActiveFlag: data.HRMLN_ActiveFlag ?? true,
        gmasterloanList: [
            {
                HRMLN_Id: data.HRMLN_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRML_LoanType: data.HRML_LoanType,
                HRML_Max: Number(data.HRML_Max) || 0,
                HRMLN_ActiveFlag: data.HRMLN_ActiveFlag ?? true,
                CreatedDate: now,
                UpdatedDate: now
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        CreatedDate: now,
        UpdatedDate: now
    };
    
    console.log('🟠 ========== LOAN API REQUEST ==========');
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] gmasterloanList count:', requestBody.gmasterloanList.length);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterLoanResponse>('hrms', url, requestBody);
        
        console.log('🟢 ========== LOAN API RESPONSE ==========');
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMLN_Id || 0;
        const hasLoanList = !!(responseData?.gmasterloanList?.length > 0);
        
        console.log('🟢 [API] Response.HRMLN_Id:', savedId);
        console.log('🟢 [API] Response.retrunMsg:', retrunMsg);
        console.log('🟢 [API] Response.gmasterloanList exists:', !!responseData?.gmasterloanList);
        console.log('🟢 [API] Response.gmasterloanList.length:', responseData?.gmasterloanList?.length || 0);
        
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || isUpdateSuccess || hasLoanList) && !isDuplicateError;
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasLoanList:', hasLoanList);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Loan type already exists'
                : isSuccess 
                    ? (isEdit ? 'Loan type updated successfully' : 'Loan type added successfully')
                    : (retrunMsg || 'Failed to save loan type'),
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        console.log('🟢 ========== LOAN API END ==========');
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
        throw error;
    }
}

/**
 * Get details of a specific master loan by ID
 * GET /api/MasterLoanFacade/getRecordById/{id}
 */
export async function getMasterLoanDetails(id: number) {
    const url = `/api/MasterLoanFacade/getRecordById/${id}`;
    return await api.get<MasterLoanResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master loan record
 * POST /api/HRMasterLoanFacade/deactivateRecordById
 */
export async function activateDeactivateMasterLoan(data: {
    HRMLN_Id: number;
    HRMLN_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/HRMasterLoanFacade/deactivateRecordById';
    
    console.log('🟠 [API] activateDeactivateMasterLoan called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    
    const requestBody = {
        HRMLN_Id: data.HRMLN_Id,
        MI_Id: data.MI_Id || 30,
        HRML_LoanType: 'string',
        HRML_Max: 0,
        HRMLN_ActiveFlag: data.HRMLN_ActiveFlag,
        gmasterloanList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await api.post<MasterLoanResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Toggle response:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        
        console.log('🟢 [API] Response.retrunMsg:', retrunMsg);
        
        if (retrunMsg === 'Mapped') {
            console.log('⚠️ [API] Loan is mapped/in use - cannot deactivate');
        }
        
        return responseData;
    } catch (error: any) {
        console.log('🔴 [API] Toggle error:', error);
        throw error;
    }
}
