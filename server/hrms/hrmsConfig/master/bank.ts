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
    console.log('🔵 [DEBUG] Raw searchParams:', JSON.stringify(searchParams, null, 2));
    console.log('🔵 [DEBUG] Normalized searchParams:', JSON.stringify(normalizedParams, null, 2));
    console.log('🔵 [DEBUG] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<MasterBankResponse>('hrms', url, requestBody);
        // Debug the response structure
        console.log('🟢 [DEBUG] getMasterBankList - Full Response:', JSON.stringify(response, null, 2));
        console.log('🟢 [DEBUG] getMasterBankList - Response Keys:', Object.keys(response || {}));
        console.log('🟢 [DEBUG] getMasterBankList - bankdetailList:', Array.isArray((response as any)?.bankdetailList) ? (response as any).bankdetailList.length : 'Not an array');
        console.log('🟢 [DEBUG] getMasterBankList - Response Data:', Array.isArray(response?.data) ? response.data.length : 'Not an array');
        // Transform response to match expected structure (like preadmission)
        // The API returns bankdetailList directly, not wrapped in data
        const bankList = (response as any)?.bankdetailList || response?.data || [];
        // Debug: Check what the API actually returned
        console.log('🟢 [DEBUG]   * search_query:', search_query || '(empty)');
        console.log('🟢 [DEBUG]   * search_column:', search_column || '(empty)');
        console.log('🟢 [DEBUG]   * sort_column:', sort_column || '(empty)');
        console.log('🟢 [DEBUG]   * sort_direction:', sort_direction || '(empty)');
        // Check if API is filtering/searching correctly
        if (search_query && bankList.length === 33) {
        }
        // Check if API is paginating correctly
        if (bankList.length > page_size && response?.total === undefined) {
        }
        // Use API's total if provided, otherwise use array length
        // Note: If API is paginating correctly, it should return total count of ALL records, not just this page
        const total = response?.total ?? (Array.isArray(bankList) ? bankList.length : 0);
        console.log('🟢 [DEBUG] - data (bankList) length:', bankList.length);
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
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
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
        console.log('🟠 [SERVER] Full data:', JSON.stringify(data, null, 2));
    } else {
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
        console.log('🔵 [DEBUG] Input Data (from form):');
        console.log('🔵 [DEBUG] Request Body (being sent to API):');
        console.log('🔵 [DEBUG]', JSON.stringify(requestBody, null, 2));
        console.log('🔵 [DEBUG]', JSON.stringify(bankDetail, null, 2));
    }
    try {
        if (isEditMode) {
        }
        const response = await api.post<MasterBankResponse>('hrms', url, requestBody);
        if (isEditMode) {
            console.log('🔵 [DEBUG]', JSON.stringify(response, null, 2));
            console.log('🔵 [DEBUG] - response.retrunMsg:', (response as any)?.retrunMsg);
            console.log('🔵 [DEBUG] - response.HRMBD_Id (top-level):', (response as any)?.HRMBD_Id);
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
            console.log('🔵 [DEBUG] Error Message (retrunMsg):', errorMsg);
            console.log('🔵 [DEBUG] Bank ID from top-level:', (response as any)?.HRMBD_Id);
            console.log('🔵 [DEBUG] Bank ID from data:', (response.data as any)?.HRMBD_Id);
            console.log('🔵 [DEBUG] Expected bankId (from input):', data.HRMBD_Id);
        }
        // For edit mode, check top-level response first (it contains the updated record)
        // For add mode, check the last item in bankdetailList (newly added item)
        const bankList = response.data?.bankdetailList || (response as any).bankdetailList || [];
        if (isEditMode) {
            console.log('🔵 [DEBUG] - bankList source: (response as any).bankdetailList =', !!(response as any).bankdetailList);
            console.log('🔵 [DEBUG] - bankList items:', JSON.stringify(bankList, null, 2));
        }
        let updatedBankItem = null;
        let lastBankId = 0;
        if (isEditMode && data.HRMBD_Id) {
            // For edit: Find the specific bank in the list by ID, or use top-level response
            updatedBankItem = bankList.find((bank: any) => bank.HRMBD_Id === data.HRMBD_Id);
            if (isEditMode) {
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
                    console.log('🔵 [DEBUG] Top-level bank item:', JSON.stringify(updatedBankItem, null, 2));
                }
            }
            lastBankId = updatedBankItem?.HRMBD_Id || bankId;
        } else {
            // For add: Use last item in list
            updatedBankItem = bankList.length > 0 ? bankList[bankList.length - 1] : null;
            lastBankId = updatedBankItem?.HRMBD_Id || 0;
        }
        if (isEditMode) {
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
            } else {
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
            return {
                success: false,
                message: 'IFSC code validation failed or already exists. Please check the IFSC code.',
                data: null
            };
        }
        // Check for other error messages (but ignore 'string', 'Update', 'Saved', 'Add' which are success/placeholder messages)
        if (errorMsg && errorMsg !== 'string' && errorMsg !== '' && errorMsg !== 'Update' && errorMsg !== 'Saved' && errorMsg !== 'Add') {
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
            console.log('🔵 [DEBUG]   * bankId > 0:', bankId > 0, '(value:', bankId, ')');
            console.log('🔵 [DEBUG]   * lastBankId > 0:', lastBankId > 0, '(value:', lastBankId, ')');
            console.log('🔵 [DEBUG] - bankList.length > 0:', bankList.length > 0, '(length:', bankList.length, ')');
            console.log('🔵 [DEBUG] - response.data?.success:', (response.data as any)?.success);
        } else {
        }
        if (isSuccess) {
            const successMsg = data.HRMBD_Id ? 'Bank updated successfully' : 'Bank added successfully';
            if (isEditMode) {
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
        } else {
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
        }
        if (error?.response) {
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
    console.log('🔵 [DEBUG]', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<MasterBankResponse>('hrms', url, requestBody);
        console.log('🔵 [DEBUG]', JSON.stringify(response, null, 2));
        console.log('🔵 [DEBUG] - response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🔵 [DEBUG] - response.HRMBD_Id (top-level):', (response as any)?.HRMBD_Id);
        console.log('🔵 [DEBUG] - response.HRMBD_ActiveFlag (top-level):', (response as any)?.HRMBD_ActiveFlag);
        if (response?.data) {
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
        console.log('🔵 [DEBUG] - toggleBankList items:', JSON.stringify(toggleBankList, null, 2));
        // Also check for the ID in the list
        const toggledBankInList = toggleBankList.find((bank: any) => bank.HRMBD_Id === data.HRMBD_Id);
        const hasIdInList = !!toggledBankInList;
        if (toggledBankInList) {
            console.log('🔵 [DEBUG] - Found bank item:', JSON.stringify(toggledBankInList, null, 2));
        }
        // Success if we get an ID back, have bankdetailList, or find the toggled bank in the list
        const isSuccess = returnedId > 0 || hasBankList || hasIdInList || responseData?.retrunMsg === 'Update';
        console.log('🔵 [DEBUG] - returnedId > 0:', returnedId > 0, '(value:', returnedId, ')');
        console.log('🔵 [DEBUG] - hasBankList:', hasBankList, '(length:', toggleBankList.length, ')');
        console.log('🔵 [DEBUG] - responseData?.retrunMsg === "Update":', responseData?.retrunMsg === 'Update', '(value:', responseData?.retrunMsg, ')');
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess 
                ? `Bank ${data.HRMBD_ActiveFlag ? 'activated' : 'deactivated'} successfully`
                : 'Failed to toggle bank status',
            data: responseData
        };
        console.log('🔵 [DEBUG]', JSON.stringify(formattedResponse, null, 2));
        if (!isSuccess) {
            console.log('🔵 [DEBUG] - returnedId:', returnedId, '(expected > 0)');
            console.log('🔵 [DEBUG] - hasBankList:', hasBankList, '(expected true)');
            console.log('🔵 [DEBUG] - hasIdInList:', hasIdInList, '(expected true)');
            console.log('🔵 [DEBUG] - retrunMsg:', responseData?.retrunMsg, '(expected "Update")');
        } else {
        }
        return formattedResponse as any;
    } catch (error: any) {
        if (error?.response) {
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
