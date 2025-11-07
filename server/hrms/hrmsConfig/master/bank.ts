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
    const isEditMode = !!data.HRMBD_Id;
    if (isEditMode) {
        console.log('🟠 [SERVER] ========== EDIT BANK ==========');
        console.log('🟠 [SERVER] HRMBD_Id:', data.HRMBD_Id);
        console.log('🟠 [SERVER] IFSC Code:', data.HRMBD_IFSCCode);
        console.log('🟠 [SERVER] Bank Name:', data.HRMBD_BankName);
        console.log('🟠 [SERVER] Full data:', JSON.stringify(data, null, 2));
    } else {
        console.log('🟠 [SERVER] saveMasterBank - Mode: ADD, IFSC:', data.HRMBD_IFSCCode);
    }
    
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
    
    try {
        const response = await api.post<MasterBankResponse>('hrms', url, requestBody);
        
        // Check for error messages in retrunMsg
        const errorMsg: string = (response.retrunMsg || response.data?.retrunMsg || '') as string;
        const bankId = (response as any)?.HRMBD_Id || (response.data as any)?.HRMBD_Id || 0;
        
        // For edit mode, check top-level response first (it contains the updated record)
        // For add mode, check the last item in bankdetailList (newly added item)
        const bankList = response.data?.bankdetailList || (response as any).bankdetailList || [];
        let updatedBankItem = null;
        let lastBankId = 0;
        
        if (isEditMode && data.HRMBD_Id) {
            // For edit: Find the specific bank in the list by ID, or use top-level response
            updatedBankItem = bankList.find((bank: any) => bank.HRMBD_Id === data.HRMBD_Id);
            // If not found in list, use top-level response data
            if (!updatedBankItem && bankId === data.HRMBD_Id) {
                updatedBankItem = {
                    HRMBD_Id: (response as any)?.HRMBD_Id || 0,
                    HRMBD_IFSCCode: (response as any)?.HRMBD_IFSCCode || '',
                    HRMBD_BankName: (response as any)?.HRMBD_BankName || '',
                    HRMBD_BranchName: (response as any)?.HRMBD_BranchName || '',
                    HRMBD_BankAccountNo: (response as any)?.HRMBD_BankAccountNo || '',
                    HRMBD_BankAddress: (response as any)?.HRMBD_BankAddress || '',
                    HRMBD_ActiveFlag: (response as any)?.HRMBD_ActiveFlag || false
                };
            }
            lastBankId = updatedBankItem?.HRMBD_Id || bankId;
        } else {
            // For add: Use last item in list
            updatedBankItem = bankList.length > 0 ? bankList[bankList.length - 1] : null;
            lastBankId = updatedBankItem?.HRMBD_Id || 0;
        }
        
        console.log('🟢 [SERVER] Response - retrunMsg:', errorMsg, 'HRMBD_Id:', bankId || lastBankId);
        
        if (isEditMode) {
            console.log('🟢 [SERVER] Edit Response Details:');
            console.log('🟢 [SERVER] - Submitted IFSC:', data.HRMBD_IFSCCode);
            console.log('🟢 [SERVER] - Response HRMBD_Id:', bankId || lastBankId);
            console.log('🟢 [SERVER] - Top-level IFSC:', (response as any)?.HRMBD_IFSCCode);
            if (updatedBankItem) {
                console.log('🟢 [SERVER] - Updated Bank Item IFSC:', updatedBankItem.HRMBD_IFSCCode);
                console.log('🟢 [SERVER] - IFSC Match:', data.HRMBD_IFSCCode === updatedBankItem.HRMBD_IFSCCode);
            } else {
                console.log('🟢 [SERVER] - Updated bank item not found in response');
            }
        }
        
        // Check for duplicate entries
        const isDuplicate = 
            errorMsg === 'Duplicate' || 
            errorMsg === 'AllDuplicate' || 
            errorMsg.toLowerCase().includes('duplicate');
        
        if (isDuplicate) {
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
        
        // Check for error messages - "ifsc" means IFSC validation failed or duplicate
        if (errorMsg === 'ifsc') {
            console.log('❌ [SERVER] IFSC validation error or duplicate IFSC code');
            return {
                success: false,
                message: 'IFSC code validation failed or already exists. Please check the IFSC code.',
                data: null
            };
        }
        
        // Check for other error messages (but ignore 'string', 'Update', 'Saved', 'Add' which are success/placeholder messages)
        if (errorMsg && errorMsg !== 'string' && errorMsg !== '' && errorMsg !== 'Update' && errorMsg !== 'Saved' && errorMsg !== 'Add') {
            console.log('⚠️ [SERVER] Error in retrunMsg:', errorMsg);
            return {
                success: false,
                message: errorMsg,
                data: null
            };
        }
        
        // Success detection: MUST have valid bank ID (top-level or in list) AND success message
        // If HRMBD_Id is 0, the record was NOT saved
        const hasValidId = bankId > 0 || lastBankId > 0;
        const isSuccess = hasValidId && (isUpdateSuccess || bankList.length > 0);
        
        if (isEditMode) {
            console.log('🟢 [SERVER] Edit Success Check:');
            console.log('🟢 [SERVER] - hasValidId:', hasValidId, '(bankId:', bankId, 'lastBankId:', lastBankId, ')');
            console.log('🟢 [SERVER] - isUpdateSuccess:', isUpdateSuccess, '(retrunMsg:', errorMsg, ')');
            console.log('🟢 [SERVER] - isSuccess:', isSuccess);
        } else {
            console.log('🟢 [SERVER] Success check - hasValidId:', hasValidId, 'isUpdateSuccess:', isUpdateSuccess, 'isSuccess:', isSuccess);
        }
        
        if (isSuccess) {
            const successMsg = data.HRMBD_Id ? 'Bank updated successfully' : 'Bank added successfully';
            console.log('✅ [SERVER] Success!', successMsg);
            if (isEditMode) {
                console.log('✅ [SERVER] Edit completed - IFSC should be updated');
            }
            return {
                success: true,
                message: successMsg,
                data: response.data || response
            };
        }
        
        // Handle explicit success flag
        if (response.success === true || response.data?.success === true) {
            return {
                success: true,
                message: response.message || response.data?.message || 'Bank saved successfully',
                data: response.data || response
            };
        }
        
        // Otherwise return generic error
        if (isEditMode) {
            console.log('❌ [SERVER] Edit failed - retrunMsg:', errorMsg, 'HRMBD_Id:', bankId || lastBankId);
            console.log('❌ [SERVER] ============================');
        } else {
            console.log('❌ [SERVER] Save failed - retrunMsg:', errorMsg, 'HRMBD_Id:', bankId || lastBankId);
        }
        return {
            success: false,
            message: response.message || errorMsg || 'Failed to save bank. Please check the data and try again.',
            data: null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] API Error:', error?.message || error);
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
