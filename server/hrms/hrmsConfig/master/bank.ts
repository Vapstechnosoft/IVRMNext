'use server';

import { api } from '@/lib/apiService';
import type { MasterBankInput, MasterBankResponse } from '@/types/hrms/master-bank';

/**
 * Get onload details for master bank
 * POST /api/MasterBankFacade/onloadgetdetails
 */
export async function getMasterBankList(roleId: number) {
    const url = '/api/MasterBankFacade/onloadgetdetails';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMBD_Id: 0,
        MI_Id: 30,
        HRMBD_BankName: 'string',
        HRMBD_BankAccountNo: 'string',
        HRMBD_BankAddress: 'string',
        HRMBD_BranchName: 'string',
        HRMBD_IFSCCode: 'string',
        HRMBD_ActiveFlag: true,
        bankdetailList: [],
        retrunMsg: 'string',
        roleId: roleId
    };
    return await api.post<MasterBankResponse>('hrms', url, requestBody);
}

/**
 * Save or Update master bank record
 * POST /api/MasterBankFacade
 */
export async function saveMasterBank(data: MasterBankInput, roleId: number): Promise<{ success: boolean; message: string; data: any }> {
    console.log('🟠 [API] saveMasterBank called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Role ID:', roleId);
    console.log('🟠 [API] Is Edit Mode:', !!data.HRMBD_Id);
    
    const url = '/api/MasterBankFacade';
    const currentDate = new Date().toISOString();
    
    // Bank detail object - needs to be in both top level and array
    const bankDetail = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMBD_Id: data.HRMBD_Id || 0,
        MI_Id: data.MI_Id,
        HRMBD_BankName: data.HRMBD_BankName,
        HRMBD_BankAccountNo: data.HRMBD_BankAccountNo,
        HRMBD_BankAddress: data.HRMBD_BankAddress,
        HRMBD_BranchName: data.HRMBD_BranchName,
        HRMBD_IFSCCode: data.HRMBD_IFSCCode,
        HRMBD_ActiveFlag: data.HRMBD_ActiveFlag
    };
    
    const requestBody = {
        ...bankDetail,
        bankdetailList: [bankDetail],
        retrunMsg: 'string',
        roleId: roleId
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterBankResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Check for error messages in retrunMsg
        const errorMsg: string = (response.retrunMsg || response.data?.retrunMsg || '') as string;
        const bankId = (response as any)?.HRMBD_Id || (response.data as any)?.HRMBD_Id || 0;
        
        // Also check for the ID in the last item of bankdetailList (newly added item)
        const bankList = response.data?.bankdetailList || (response as any).bankdetailList || [];
        const lastBankItem = bankList.length > 0 ? bankList[bankList.length - 1] : null;
        const lastBankId = lastBankItem?.HRMBD_Id || 0;
        
        console.log('🟢 [API] Response retrunMsg:', errorMsg);
        console.log('🟢 [API] Response HRMBD_Id (top-level):', bankId);
        console.log('🟢 [API] Response HRMBD_Id (last in list):', lastBankId);
        console.log('🟢 [API] Response bankdetailList length:', bankList.length);
        console.log('🟢 [API] Last bank item:', lastBankItem ? JSON.stringify(lastBankItem, null, 2) : 'null');
        
        // Check for duplicate entries
        const isDuplicate = 
            errorMsg === 'Duplicate' || 
            errorMsg === 'AllDuplicate' || 
            errorMsg.toLowerCase().includes('duplicate');
        
        console.log('🟢 [API] Duplicate check - retrunMsg:', errorMsg, 'isDuplicate:', isDuplicate);
        
        if (isDuplicate) {
            console.log('❌ [API] Duplicate detected');
            let duplicateMsg = 'Bank with this name already exists';
            
            if (errorMsg === 'AllDuplicate') {
                duplicateMsg = 'Bank already exists with the same details. Please check Bank Name, Account Number, or IFSC Code.';
            } else if (errorMsg.toLowerCase().includes('account')) {
                duplicateMsg = 'Bank with this account number already exists';
            } else if (errorMsg.toLowerCase().includes('ifsc')) {
                duplicateMsg = 'Bank with this IFSC code already exists';
            }
            
            return {
                success: false,
                message: duplicateMsg,
                data: null
            };
        }
        
        // "Update", "Saved", "Add" are success messages from backend
        const isUpdateSuccess = errorMsg === 'Update' || errorMsg === 'Saved' || errorMsg === 'Add';
        
        console.log('🟢 [API] Update success check - retrunMsg:', errorMsg, 'isUpdateSuccess:', isUpdateSuccess);
        
        // Check for other error messages (but ignore 'string', 'ifsc', 'Update', 'Saved', 'Add' which are success/placeholder messages)
        if (errorMsg && errorMsg !== 'string' && errorMsg !== '' && errorMsg !== 'ifsc' && errorMsg !== 'Update' && errorMsg !== 'Saved' && errorMsg !== 'Add') {
            console.log('⚠️ [API] Error in retrunMsg:', errorMsg);
            return {
                success: false,
                message: errorMsg,
                data: null
            };
        }
        
        // Success detection: If we have bankdetailList, valid bank ID (top-level or in list), or success message
        const hasBankList = bankList.length > 0;
        const hasValidId = bankId > 0 || lastBankId > 0;
        const isSuccess = hasBankList || hasValidId || isUpdateSuccess;
        
        console.log('🟢 [API] Success check - hasBankList:', hasBankList, 'hasValidId (top or list):', hasValidId, 'isUpdateSuccess:', isUpdateSuccess, 'isSuccess:', isSuccess);
        
        if (isSuccess) {
            const successMsg = data.HRMBD_Id ? 'Bank updated successfully' : 'Bank added successfully';
            console.log('✅ [API] Success!', successMsg);
            return {
                success: true,
                message: successMsg,
                data: response.data || response
            };
        }
        
        // Handle explicit success flag
        if (response.success === true || response.data?.success === true) {
            console.log('✅ [API] Success flag detected');
            return {
                success: true,
                message: response.message || response.data?.message || 'Bank saved successfully',
                data: response.data || response
            };
        }
        
        // Otherwise return generic error
        console.log('❌ [API] No success indicators found');
        return {
            success: false,
            message: response.message || 'Failed to save bank',
            data: null
        };
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
 * Activate/Deactivate a master bank record
 * POST /api/MasterBankFacade/deactivateRecordById
 */
export async function activateDeactivateMasterBank(data: {
    HRMBD_Id: number;
    HRMBD_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    console.log('🟠 [API] activateDeactivateMasterBank called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Toggling to:', data.HRMBD_ActiveFlag ? 'ACTIVE' : 'INACTIVE');
    
    const url = '/api/MasterBankFacade/deactivateRecordById';
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMBD_Id: data.HRMBD_Id,
        MI_Id: data.MI_Id || 30,
        HRMBD_BankName: 'string',
        HRMBD_BankAccountNo: 'string',
        HRMBD_BankAddress: 'string',
        HRMBD_BranchName: 'string',
        HRMBD_IFSCCode: 'string',
        HRMBD_ActiveFlag: data.HRMBD_ActiveFlag,
        bankdetailList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                HRMBD_Id: data.HRMBD_Id,
                MI_Id: data.MI_Id || 30,
                HRMBD_BankName: 'string',
                HRMBD_BankAccountNo: 'string',
                HRMBD_BankAddress: 'string',
                HRMBD_BranchName: 'string',
                HRMBD_IFSCCode: 'string',
                HRMBD_ActiveFlag: data.HRMBD_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterBankResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Toggle response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response HRMBD_Id:', (response as any)?.HRMBD_Id);
        console.log('🟢 [API] Response HRMBD_ActiveFlag:', (response as any)?.HRMBD_ActiveFlag);
        console.log('🟢 [API] Response retrunMsg:', (response as any)?.retrunMsg);
        
        // Check success based on response
        const responseData = response as any;
        const returnedId = responseData?.HRMBD_Id || 0;
        const toggleBankList = responseData?.bankdetailList || responseData?.data?.bankdetailList || [];
        const hasBankList = toggleBankList.length > 0;
        
        // Also check for the ID in the list
        const toggledBankInList = toggleBankList.find((bank: any) => bank.HRMBD_Id === data.HRMBD_Id);
        const hasIdInList = !!toggledBankInList;
        
        // Success if we get an ID back, have bankdetailList, or find the toggled bank in the list
        const isSuccess = returnedId > 0 || hasBankList || hasIdInList || responseData?.retrunMsg === 'Update';
        
        console.log('🟢 [API] Toggle success check - returnedId:', returnedId, 'hasBankList:', hasBankList, 'hasIdInList:', hasIdInList, 'isSuccess:', isSuccess);
        
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess 
                ? `Bank ${data.HRMBD_ActiveFlag ? 'activated' : 'deactivated'} successfully`
                : 'Failed to toggle bank status',
            data: responseData
        };
        
        console.log('🟢 [API] Formatted toggle response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Toggle error occurred');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        throw error;
    }
}

/**
 * Get details of a specific master bank by ID
 * GET /api/MasterBankFacade/getRecordById/{id}
 */
export async function getMasterBankDetails(id: number) {
    const url = `/api/MasterBankFacade/getRecordById/${id}`;
    return await api.get<MasterBankResponse>('hrms', url);
}
