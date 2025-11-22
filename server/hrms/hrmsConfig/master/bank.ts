'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { MasterBankInput, MasterBankResponse } from '@/types/hrms/master-bank';

/**
 * Helper function to convert searchParams from URL (strings) to proper types
 */
function normalizeSearchParams(searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>): ApiSearchparams {
    if (!searchParams) return {};
    
    // Helper to get first value if array, or the value itself
    const getValue = (value: string | string[] | number | undefined, defaultValue: string | number): string | number => {
        if (value === undefined) return defaultValue;
        if (typeof value === 'number') return value;
        if (Array.isArray(value)) return value[0] || defaultValue;
        return value;
    };
    
    return {
        page: typeof getValue(searchParams.page, 1) === 'string' ? parseInt(getValue(searchParams.page, 1) as string, 10) || 1 : (getValue(searchParams.page, 1) as number) || 1,
        page_size: typeof getValue(searchParams.page_size, 10) === 'string' ? parseInt(getValue(searchParams.page_size, 10) as string, 10) || 10 : (getValue(searchParams.page_size, 10) as number) || 10,
        search_query: (getValue(searchParams.search_query, '') as string) || '',
        search_column: (getValue(searchParams.search_column, '') as string) || '',
        sort_column: (getValue(searchParams.sort_column, '') as string) || '',
        sort_direction: (getValue(searchParams.sort_direction, '') as string) || ''
    };
}

/**
 * Get onload details for master bank with search, sort, and pagination
 * POST /api/MasterBankFacade/onloadgetdetails
 */
export async function getMasterBankList(roleId: number, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterBankFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns (like preadmission does)
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMBD_BankName,HRMBD_BranchName,HRMBD_BankAccountNo,HRMBD_IFSCCode,HRMBD_BankAddress';
    const search_column = normalizedParams.search_column || (search_query ? searchableColumns : '');
    
    // If sort_column is provided but sort_direction is empty, default to 'asc'
    // The API requires sort_direction to be 'asc' or 'desc' when sort_column is provided
    const sort_column = normalizedParams.sort_column || '';
    const sort_direction = sort_column && !normalizedParams.sort_direction 
        ? 'asc' 
        : (normalizedParams.sort_direction || '');
    
    const requestBody = {
        page,
        page_size,
        search_query,
        search_column,
        sort_column,
        sort_direction,
        is_export: false,
        MIID: 30,
        LoginUserId: 0,
        UserRole: '',
        // Required fields by API model (even for list operations)
        retrunMsg: '',
        bankdetailList: [],
        HRMBD_BankName: '',
        HRMBD_IFSCCode: '',
        HRMBD_BranchName: '',
        HRMBD_BankAddress: '',
        HRMBD_BankAccountNo: '',
        HRMBD_Id: 0,
        MI_Id: 30,
        HRMBD_ActiveFlag: true,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    
    // Debug logging
    console.log('🔵 [DEBUG] getMasterBankList - Request Details:');
    console.log('🔵 [DEBUG] Method: POST');
    console.log('🔵 [DEBUG] URL:', url);
    console.log('🔵 [DEBUG] Base URL Key: hrms');
    console.log('🔵 [DEBUG] roleId:', roleId);
    console.log('🔵 [DEBUG] Raw searchParams:', JSON.stringify(searchParams, null, 2));
    console.log('🔵 [DEBUG] Normalized searchParams:', JSON.stringify(normalizedParams, null, 2));
    console.log('🔵 [DEBUG] Search Configuration:');
    console.log('🔵 [DEBUG] - search_query:', search_query);
    console.log('🔵 [DEBUG] - search_column:', search_column);
    console.log('🔵 [DEBUG] - searchableColumns:', searchableColumns);
    console.log('🔵 [DEBUG] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🔵 [DEBUG] Request Body Types:', {
        page: typeof page,
        page_size: typeof page_size,
        search_query: typeof search_query,
        search_column: typeof search_column,
        sort_column: typeof sort_column,
        sort_direction: typeof sort_direction,
        is_export: typeof false,
        MIID: typeof 30,
        LoginUserId: typeof 0,
        UserRole: typeof ''
    });
    
    try {
        console.log('🔵 [DEBUG] Calling api.post with:', { baseUrlKey: 'hrms', url, requestBody });
        const response = await api.post<MasterBankResponse>('hrms', url, requestBody);
        
        // Debug the response structure
        console.log('🟢 [DEBUG] getMasterBankList - Full Response:', JSON.stringify(response, null, 2));
        console.log('🟢 [DEBUG] getMasterBankList - Response Success:', response?.success);
        console.log('🟢 [DEBUG] getMasterBankList - Response Keys:', Object.keys(response || {}));
        console.log('🟢 [DEBUG] getMasterBankList - bankdetailList:', Array.isArray((response as any)?.bankdetailList) ? (response as any).bankdetailList.length : 'Not an array');
        console.log('🟢 [DEBUG] getMasterBankList - Response Data:', Array.isArray(response?.data) ? response.data.length : 'Not an array');
        console.log('🟢 [DEBUG] getMasterBankList - Response Total:', response?.total);
        
        // Transform response to match expected structure (like preadmission)
        // The API returns bankdetailList directly, not wrapped in data
        const bankList = (response as any)?.bankdetailList || response?.data || [];
        
        // Debug: Check what the API actually returned
        console.log('🟢 [DEBUG] getMasterBankList - API Response Analysis:');
        console.log('🟢 [DEBUG] - Request sent with:');
        console.log('🟢 [DEBUG]   * page:', page);
        console.log('🟢 [DEBUG]   * page_size:', page_size);
        console.log('🟢 [DEBUG]   * search_query:', search_query || '(empty)');
        console.log('🟢 [DEBUG]   * search_column:', search_column || '(empty)');
        console.log('🟢 [DEBUG]   * sort_column:', sort_column || '(empty)');
        console.log('🟢 [DEBUG]   * sort_direction:', sort_direction || '(empty)');
        console.log('🟢 [DEBUG] - Items returned by API:', bankList.length);
        console.log('🟢 [DEBUG] - Response has total?', response?.total !== undefined, 'value:', response?.total);
        console.log('🟢 [DEBUG] - Response has page?', response?.page !== undefined, 'value:', response?.page);
        console.log('🟢 [DEBUG] - Response has page_size?', response?.page_size !== undefined, 'value:', response?.page_size);
        
        // Check if API is filtering/searching correctly
        if (search_query && bankList.length === 33) {
            console.warn('⚠️ [DEBUG] WARNING: Search query provided but API returned all items');
            console.warn('⚠️ [DEBUG] - Search query:', search_query);
            console.warn('⚠️ [DEBUG] - Items returned:', bankList.length);
            console.warn('⚠️ [DEBUG] - API does not appear to be filtering by search_query');
        }
        
        // Check if API is paginating correctly
        if (bankList.length > page_size && response?.total === undefined) {
            console.warn('⚠️ [DEBUG] WARNING: API returned', bankList.length, 'items but requested page_size was', page_size);
            console.warn('⚠️ [DEBUG] API does not appear to be paginating server-side');
            console.warn('⚠️ [DEBUG] Expected:', page_size, 'items, Got:', bankList.length, 'items');
        }
        
        // Use API's total if provided, otherwise use array length
        // Note: If API is paginating correctly, it should return total count of ALL records, not just this page
        const total = response?.total ?? (Array.isArray(bankList) ? bankList.length : 0);
        
        console.log('🟢 [DEBUG] getMasterBankList - Transformed Response:');
        console.log('🟢 [DEBUG] - data (bankList) length:', bankList.length);
        console.log('🟢 [DEBUG] - total:', total);
        console.log('🟢 [DEBUG] - page:', response?.page ?? page);
        console.log('🟢 [DEBUG] - page_size:', response?.page_size ?? page_size);
        
        // Return in the expected format - spread response first, then override with transformed values
        // IMPORTANT: Return exactly what API sent - no client-side manipulation
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: bankList, // Return all items from API - let API handle pagination
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterBankResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterBankList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        console.error('🔴 [DEBUG] Error Response Headers:', error?.response?.headers);
        console.error('🔴 [DEBUG] Full Error:', error);
        throw error;
    }
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
    
    // Enhanced debug logging for edit mode
    if (isEditMode) {
        console.log('🔵 [DEBUG] ========== EDIT BANK REQUEST ==========');
        console.log('🔵 [DEBUG] Request URL:', url);
        console.log('🔵 [DEBUG] Base URL Key: hrms');
        console.log('🔵 [DEBUG] Role ID:', roleId);
        console.log('🔵 [DEBUG] Input Data (from form):');
        console.log('🔵 [DEBUG] - HRMBD_Id:', data.HRMBD_Id);
        console.log('🔵 [DEBUG] - MI_Id:', data.MI_Id);
        console.log('🔵 [DEBUG] - HRMBD_BankName:', data.HRMBD_BankName);
        console.log('🔵 [DEBUG] - HRMBD_BranchName:', data.HRMBD_BranchName);
        console.log('🔵 [DEBUG] - HRMBD_BankAccountNo:', data.HRMBD_BankAccountNo);
        console.log('🔵 [DEBUG] - HRMBD_IFSCCode:', data.HRMBD_IFSCCode);
        console.log('🔵 [DEBUG] - HRMBD_BankAddress:', data.HRMBD_BankAddress);
        console.log('🔵 [DEBUG] - HRMBD_ActiveFlag:', data.HRMBD_ActiveFlag);
        console.log('🔵 [DEBUG] Request Body (being sent to API):');
        console.log('🔵 [DEBUG]', JSON.stringify(requestBody, null, 2));
        console.log('🔵 [DEBUG] Bank Detail Object:');
        console.log('🔵 [DEBUG]', JSON.stringify(bankDetail, null, 2));
    }
    
    try {
        if (isEditMode) {
            console.log('🔵 [DEBUG] Calling api.post for EDIT...');
        }
        const response = await api.post<MasterBankResponse>('hrms', url, requestBody);
        
        if (isEditMode) {
            console.log('🔵 [DEBUG] ========== EDIT BANK RESPONSE ==========');
            console.log('🔵 [DEBUG] Full Response Object:');
            console.log('🔵 [DEBUG]', JSON.stringify(response, null, 2));
            console.log('🔵 [DEBUG] Response Structure Analysis:');
            console.log('🔵 [DEBUG] - response.success:', response?.success);
            console.log('🔵 [DEBUG] - response.message:', response?.message);
            console.log('🔵 [DEBUG] - response.retrunMsg:', (response as any)?.retrunMsg);
            console.log('🔵 [DEBUG] - response.HRMBD_Id (top-level):', (response as any)?.HRMBD_Id);
            console.log('🔵 [DEBUG] - response.data type:', typeof response?.data);
            console.log('🔵 [DEBUG] - response.data:', response?.data);
            if (response?.data) {
                console.log('🔵 [DEBUG] - response.data.HRMBD_Id:', (response.data as any)?.HRMBD_Id);
                console.log('🔵 [DEBUG] - response.data.bankdetailList exists:', !!(response.data as any)?.bankdetailList);
                console.log('🔵 [DEBUG] - response.data.bankdetailList length:', Array.isArray((response.data as any)?.bankdetailList) ? (response.data as any).bankdetailList.length : 'Not an array');
            }
            console.log('🔵 [DEBUG] - response.bankdetailList (top-level):', (response as any)?.bankdetailList);
            console.log('🔵 [DEBUG] - response.bankdetailList length:', Array.isArray((response as any)?.bankdetailList) ? (response as any).bankdetailList.length : 'Not an array');
        }
        
        // Check for error messages in retrunMsg
        const errorMsg: string = (response.retrunMsg || response.data?.retrunMsg || '') as string;
        const bankId = (response as any)?.HRMBD_Id || (response.data as any)?.HRMBD_Id || 0;
        
        if (isEditMode) {
            console.log('🔵 [DEBUG] ========== RESPONSE PARSING ==========');
            console.log('🔵 [DEBUG] Error Message (retrunMsg):', errorMsg);
            console.log('🔵 [DEBUG] Bank ID from top-level:', (response as any)?.HRMBD_Id);
            console.log('🔵 [DEBUG] Bank ID from data:', (response.data as any)?.HRMBD_Id);
            console.log('🔵 [DEBUG] Combined bankId:', bankId);
            console.log('🔵 [DEBUG] Expected bankId (from input):', data.HRMBD_Id);
            console.log('🔵 [DEBUG] Bank ID Match:', bankId === data.HRMBD_Id);
        }
        
        // For edit mode, check top-level response first (it contains the updated record)
        // For add mode, check the last item in bankdetailList (newly added item)
        const bankList = response.data?.bankdetailList || (response as any).bankdetailList || [];
        
        if (isEditMode) {
            console.log('🔵 [DEBUG] Bank List Analysis:');
            console.log('🔵 [DEBUG] - bankList source: response.data?.bankdetailList =', !!response.data?.bankdetailList);
            console.log('🔵 [DEBUG] - bankList source: (response as any).bankdetailList =', !!(response as any).bankdetailList);
            console.log('🔵 [DEBUG] - bankList length:', bankList.length);
            console.log('🔵 [DEBUG] - bankList items:', JSON.stringify(bankList, null, 2));
        }
        
        let updatedBankItem = null;
        let lastBankId = 0;
        
        if (isEditMode && data.HRMBD_Id) {
            // For edit: Find the specific bank in the list by ID, or use top-level response
            updatedBankItem = bankList.find((bank: any) => bank.HRMBD_Id === data.HRMBD_Id);
            
            if (isEditMode) {
                console.log('🔵 [DEBUG] Searching for bank with ID:', data.HRMBD_Id);
                console.log('🔵 [DEBUG] - Found in bankList:', !!updatedBankItem);
                if (updatedBankItem) {
                    console.log('🔵 [DEBUG] - Found bank item:', JSON.stringify(updatedBankItem, null, 2));
                }
            }
            
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
                
                if (isEditMode) {
                    console.log('🔵 [DEBUG] Using top-level response data as updatedBankItem');
                    console.log('🔵 [DEBUG] Top-level bank item:', JSON.stringify(updatedBankItem, null, 2));
                }
            }
            lastBankId = updatedBankItem?.HRMBD_Id || bankId;
        } else {
            // For add: Use last item in list
            updatedBankItem = bankList.length > 0 ? bankList[bankList.length - 1] : null;
            lastBankId = updatedBankItem?.HRMBD_Id || 0;
        }
        
        console.log('🟢 [SERVER] Response - retrunMsg:', errorMsg, 'HRMBD_Id:', bankId || lastBankId);
        
        if (isEditMode) {
            console.log('🔵 [DEBUG] ========== FIELD COMPARISON ==========');
            console.log('🔵 [DEBUG] Submitted Data:');
            console.log('🔵 [DEBUG] - HRMBD_Id:', data.HRMBD_Id);
            console.log('🔵 [DEBUG] - HRMBD_BankName:', data.HRMBD_BankName);
            console.log('🔵 [DEBUG] - HRMBD_BranchName:', data.HRMBD_BranchName);
            console.log('🔵 [DEBUG] - HRMBD_BankAccountNo:', data.HRMBD_BankAccountNo);
            console.log('🔵 [DEBUG] - HRMBD_IFSCCode:', data.HRMBD_IFSCCode);
            console.log('🔵 [DEBUG] - HRMBD_BankAddress:', data.HRMBD_BankAddress);
            console.log('🔵 [DEBUG] - HRMBD_ActiveFlag:', data.HRMBD_ActiveFlag);
            console.log('🔵 [DEBUG] Response Data (Top-level):');
            console.log('🔵 [DEBUG] - HRMBD_Id:', (response as any)?.HRMBD_Id);
            console.log('🔵 [DEBUG] - HRMBD_BankName:', (response as any)?.HRMBD_BankName);
            console.log('🔵 [DEBUG] - HRMBD_BranchName:', (response as any)?.HRMBD_BranchName);
            console.log('🔵 [DEBUG] - HRMBD_BankAccountNo:', (response as any)?.HRMBD_BankAccountNo);
            console.log('🔵 [DEBUG] - HRMBD_IFSCCode:', (response as any)?.HRMBD_IFSCCode);
            console.log('🔵 [DEBUG] - HRMBD_BankAddress:', (response as any)?.HRMBD_BankAddress);
            console.log('🔵 [DEBUG] - HRMBD_ActiveFlag:', (response as any)?.HRMBD_ActiveFlag);
            console.log('🔵 [DEBUG] Updated Bank Item (from list or top-level):');
            if (updatedBankItem) {
                console.log('🔵 [DEBUG]', JSON.stringify(updatedBankItem, null, 2));
                console.log('🔵 [DEBUG] Field Matches:');
                console.log('🔵 [DEBUG] - BankName Match:', data.HRMBD_BankName === updatedBankItem.HRMBD_BankName);
                console.log('🔵 [DEBUG] - BranchName Match:', data.HRMBD_BranchName === updatedBankItem.HRMBD_BranchName);
                console.log('🔵 [DEBUG] - AccountNo Match:', data.HRMBD_BankAccountNo === updatedBankItem.HRMBD_BankAccountNo);
                console.log('🔵 [DEBUG] - IFSC Match:', data.HRMBD_IFSCCode === updatedBankItem.HRMBD_IFSCCode);
                console.log('🔵 [DEBUG] - Address Match:', data.HRMBD_BankAddress === updatedBankItem.HRMBD_BankAddress);
                console.log('🔵 [DEBUG] - ActiveFlag Match:', data.HRMBD_ActiveFlag === updatedBankItem.HRMBD_ActiveFlag);
            } else {
                console.log('🔵 [DEBUG] - Updated bank item not found in response');
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
            console.log('🔵 [DEBUG] ========== SUCCESS DETECTION ==========');
            console.log('🔵 [DEBUG] Success Criteria:');
            console.log('🔵 [DEBUG] - hasValidId:', hasValidId);
            console.log('🔵 [DEBUG]   * bankId > 0:', bankId > 0, '(value:', bankId, ')');
            console.log('🔵 [DEBUG]   * lastBankId > 0:', lastBankId > 0, '(value:', lastBankId, ')');
            console.log('🔵 [DEBUG] - isUpdateSuccess:', isUpdateSuccess);
            console.log('🔵 [DEBUG]   * errorMsg === "Update":', errorMsg === 'Update');
            console.log('🔵 [DEBUG]   * errorMsg === "Saved":', errorMsg === 'Saved');
            console.log('🔵 [DEBUG]   * errorMsg === "Add":', errorMsg === 'Add');
            console.log('🔵 [DEBUG]   * errorMsg value:', errorMsg);
            console.log('🔵 [DEBUG] - bankList.length > 0:', bankList.length > 0, '(length:', bankList.length, ')');
            console.log('🔵 [DEBUG] - Final isSuccess:', isSuccess);
            console.log('🔵 [DEBUG] - response.success:', response?.success);
            console.log('🔵 [DEBUG] - response.data?.success:', (response.data as any)?.success);
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
            console.log('🔵 [DEBUG] ========== EDIT FAILED ==========');
            console.log('🔵 [DEBUG] Failure Reasons:');
            console.log('🔵 [DEBUG] - hasValidId:', hasValidId);
            console.log('🔵 [DEBUG] - isUpdateSuccess:', isUpdateSuccess);
            console.log('🔵 [DEBUG] - bankList.length:', bankList.length);
            console.log('🔵 [DEBUG] - errorMsg:', errorMsg);
            console.log('🔵 [DEBUG] - bankId:', bankId);
            console.log('🔵 [DEBUG] - lastBankId:', lastBankId);
            console.log('🔵 [DEBUG] - response.success:', response?.success);
            console.log('🔵 [DEBUG] - response.message:', response?.message);
            console.log('❌ [SERVER] Edit failed - retrunMsg:', errorMsg, 'HRMBD_Id:', bankId || lastBankId);
            console.log('❌ [SERVER] ============================');
        } else {
            console.log('❌ [SERVER] Save failed - retrunMsg:', errorMsg, 'HRMBD_Id:', bankId || lastBankId);
        }
        
        const errorResponse = {
            success: false,
            message: response.message || errorMsg || 'Failed to save bank. Please check the data and try again.',
            data: null
        };
        
        if (isEditMode) {
            console.log('🔵 [DEBUG] Returning error response:', JSON.stringify(errorResponse, null, 2));
        }
        
        return errorResponse;
    } catch (error: any) {
        if (isEditMode) {
            console.error('🔴 [DEBUG] ========== EDIT EXCEPTION ==========');
            console.error('🔴 [DEBUG] Exception during edit operation');
        }
        console.error('🔴 [SERVER] API Error:', error?.message || error);
        console.error('🔴 [SERVER] Error stack:', error?.stack);
        if (error?.response) {
            console.error('🔴 [SERVER] Error response status:', error.response.status);
            console.error('🔴 [SERVER] Error response data:', JSON.stringify(error.response.data, null, 2));
        }
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
    console.log('🔵 [DEBUG] ========== ACTIVATE/DEACTIVATE BANK ==========');
    console.log('🔵 [DEBUG] Input Data:');
    console.log('🔵 [DEBUG] - HRMBD_Id:', data.HRMBD_Id);
    console.log('🔵 [DEBUG] - HRMBD_ActiveFlag:', data.HRMBD_ActiveFlag, `(${data.HRMBD_ActiveFlag ? 'ACTIVATE' : 'DEACTIVATE'})`);
    console.log('🔵 [DEBUG] - MI_Id:', data.MI_Id || 30, '(using:', data.MI_Id || 30, ')');
    console.log('🔵 [DEBUG] Full input data:', JSON.stringify(data, null, 2));
    
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
    
    console.log('🔵 [DEBUG] Request Details:');
    console.log('🔵 [DEBUG] - URL:', url);
    console.log('🔵 [DEBUG] - Base URL Key: hrms');
    console.log('🔵 [DEBUG] - Method: POST');
    console.log('🔵 [DEBUG] - Current Date:', currentDate);
    console.log('🔵 [DEBUG] Request Body:');
    console.log('🔵 [DEBUG]', JSON.stringify(requestBody, null, 2));
    console.log('🔵 [DEBUG] Request Body Analysis:');
    console.log('🔵 [DEBUG] - HRMBD_Id in request:', requestBody.HRMBD_Id);
    console.log('🔵 [DEBUG] - HRMBD_ActiveFlag in request:', requestBody.HRMBD_ActiveFlag);
    console.log('🔵 [DEBUG] - HRMBD_ActiveFlag in bankdetailList[0]:', requestBody.bankdetailList[0]?.HRMBD_ActiveFlag);
    console.log('🔵 [DEBUG] - Flags match:', requestBody.HRMBD_ActiveFlag === requestBody.bankdetailList[0]?.HRMBD_ActiveFlag);
    
    try {
        console.log('🔵 [DEBUG] Calling api.post...');
        const response = await api.post<MasterBankResponse>('hrms', url, requestBody);
        
        console.log('🔵 [DEBUG] ========== TOGGLE RESPONSE ==========');
        console.log('🔵 [DEBUG] Full Response Object:');
        console.log('🔵 [DEBUG]', JSON.stringify(response, null, 2));
        console.log('🔵 [DEBUG] Response Structure Analysis:');
        console.log('🔵 [DEBUG] - response.success:', response?.success);
        console.log('🔵 [DEBUG] - response.message:', response?.message);
        console.log('🔵 [DEBUG] - response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🔵 [DEBUG] - response.HRMBD_Id (top-level):', (response as any)?.HRMBD_Id);
        console.log('🔵 [DEBUG] - response.HRMBD_ActiveFlag (top-level):', (response as any)?.HRMBD_ActiveFlag);
        console.log('🔵 [DEBUG] - response.data type:', typeof response?.data);
        if (response?.data) {
            console.log('🔵 [DEBUG] - response.data:', response.data);
            console.log('🔵 [DEBUG] - response.data.HRMBD_Id:', (response.data as any)?.HRMBD_Id);
            console.log('🔵 [DEBUG] - response.data.HRMBD_ActiveFlag:', (response.data as any)?.HRMBD_ActiveFlag);
            console.log('🔵 [DEBUG] - response.data.bankdetailList exists:', !!(response.data as any)?.bankdetailList);
            console.log('🔵 [DEBUG] - response.data.bankdetailList length:', Array.isArray((response.data as any)?.bankdetailList) ? (response.data as any).bankdetailList.length : 'Not an array');
        }
        console.log('🔵 [DEBUG] - response.bankdetailList (top-level):', (response as any)?.bankdetailList);
        console.log('🔵 [DEBUG] - response.bankdetailList length:', Array.isArray((response as any)?.bankdetailList) ? (response as any).bankdetailList.length : 'Not an array');
        
        // Check success based on response
        const responseData = response as any;
        const returnedId = responseData?.HRMBD_Id || 0;
        const returnedFlag = responseData?.HRMBD_ActiveFlag;
        const toggleBankList = responseData?.bankdetailList || responseData?.data?.bankdetailList || [];
        const hasBankList = toggleBankList.length > 0;
        
        console.log('🔵 [DEBUG] ========== RESPONSE PARSING ==========');
        console.log('🔵 [DEBUG] Extracted Values:');
        console.log('🔵 [DEBUG] - returnedId:', returnedId);
        console.log('🔵 [DEBUG] - returnedFlag:', returnedFlag);
        console.log('🔵 [DEBUG] - Expected ID:', data.HRMBD_Id);
        console.log('🔵 [DEBUG] - Expected Flag:', data.HRMBD_ActiveFlag);
        console.log('🔵 [DEBUG] - ID Match:', returnedId === data.HRMBD_Id);
        console.log('🔵 [DEBUG] - Flag Match:', returnedFlag === data.HRMBD_ActiveFlag);
        console.log('🔵 [DEBUG] - toggleBankList source: responseData?.bankdetailList =', !!responseData?.bankdetailList);
        console.log('🔵 [DEBUG] - toggleBankList source: responseData?.data?.bankdetailList =', !!responseData?.data?.bankdetailList);
        console.log('🔵 [DEBUG] - toggleBankList length:', toggleBankList.length);
        console.log('🔵 [DEBUG] - toggleBankList items:', JSON.stringify(toggleBankList, null, 2));
        
        // Also check for the ID in the list
        const toggledBankInList = toggleBankList.find((bank: any) => bank.HRMBD_Id === data.HRMBD_Id);
        const hasIdInList = !!toggledBankInList;
        
        console.log('🔵 [DEBUG] Bank List Search:');
        console.log('🔵 [DEBUG] - Searching for HRMBD_Id:', data.HRMBD_Id);
        console.log('🔵 [DEBUG] - Found in list:', hasIdInList);
        if (toggledBankInList) {
            console.log('🔵 [DEBUG] - Found bank item:', JSON.stringify(toggledBankInList, null, 2));
            console.log('🔵 [DEBUG] - Found bank HRMBD_ActiveFlag:', toggledBankInList.HRMBD_ActiveFlag);
            console.log('🔵 [DEBUG] - Flag matches expected:', toggledBankInList.HRMBD_ActiveFlag === data.HRMBD_ActiveFlag);
        }
        
        // Success if we get an ID back, have bankdetailList, or find the toggled bank in the list
        const isSuccess = returnedId > 0 || hasBankList || hasIdInList || responseData?.retrunMsg === 'Update';
        
        console.log('🔵 [DEBUG] ========== SUCCESS DETECTION ==========');
        console.log('🔵 [DEBUG] Success Criteria:');
        console.log('🔵 [DEBUG] - returnedId > 0:', returnedId > 0, '(value:', returnedId, ')');
        console.log('🔵 [DEBUG] - hasBankList:', hasBankList, '(length:', toggleBankList.length, ')');
        console.log('🔵 [DEBUG] - hasIdInList:', hasIdInList);
        console.log('🔵 [DEBUG] - responseData?.retrunMsg === "Update":', responseData?.retrunMsg === 'Update', '(value:', responseData?.retrunMsg, ')');
        console.log('🔵 [DEBUG] - Final isSuccess:', isSuccess);
        console.log('🔵 [DEBUG] - response.success:', response?.success);
        
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess 
                ? `Bank ${data.HRMBD_ActiveFlag ? 'activated' : 'deactivated'} successfully`
                : 'Failed to toggle bank status',
            data: responseData
        };
        
        console.log('🔵 [DEBUG] ========== FORMATTED RESPONSE ==========');
        console.log('🔵 [DEBUG]', JSON.stringify(formattedResponse, null, 2));
        
        if (!isSuccess) {
            console.log('🔵 [DEBUG] ========== TOGGLE FAILED ==========');
            console.log('🔵 [DEBUG] Failure Analysis:');
            console.log('🔵 [DEBUG] - returnedId:', returnedId, '(expected > 0)');
            console.log('🔵 [DEBUG] - hasBankList:', hasBankList, '(expected true)');
            console.log('🔵 [DEBUG] - hasIdInList:', hasIdInList, '(expected true)');
            console.log('🔵 [DEBUG] - retrunMsg:', responseData?.retrunMsg, '(expected "Update")');
            console.log('🔵 [DEBUG] - response.success:', response?.success);
        } else {
            console.log('✅ [DEBUG] Toggle operation successful!');
        }
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [DEBUG] ========== TOGGLE EXCEPTION ==========');
        console.log('🔴 [DEBUG] Exception during toggle operation');
        console.error('🔴 [DEBUG] Error:', error);
        console.error('🔴 [DEBUG] Error message:', error?.message);
        console.error('🔴 [DEBUG] Error stack:', error?.stack);
        if (error?.response) {
            console.error('🔴 [DEBUG] Error response status:', error.response.status);
            console.error('🔴 [DEBUG] Error response headers:', error.response.headers);
            console.error('🔴 [DEBUG] Error response data:', JSON.stringify(error.response.data, null, 2));
        }
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
