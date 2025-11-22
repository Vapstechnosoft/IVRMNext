'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    EarningsDeductionDetail,
    MasterEarningsDeductionsInput,
    MasterEarningsDeductionsOnloadRequest,
    MasterEarningsDeductionsOnloadResponse,
    MasterEarningsDeductionsResponse,
    MasterEarningsDeductionsSaveRequest
} from '@/types/hrms/master-earnings-deductions';

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
 * Get onload details for master earnings deductions with search, sort, and pagination
 * POST /api/MasterEarningsDeductionsFacadeV2/onloadgetdetails
 */
export async function getMasterEarningsDeductionsList(
    roleId: number,
    searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>,
    options?: {
        LoginUserId?: number;
        UserRole?: string;
    }
) {
    console.log('🟠 [API] getMasterEarningsDeductionsList called with roleId:', roleId);
    
    const url = '/api/MasterEarningsDeductionsFacadeV2/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    const search_column = normalizedParams.search_column || '';
    const sort_column = normalizedParams.sort_column || '';
    const sort_direction = normalizedParams.sort_direction || '';
    
    const requestBody: MasterEarningsDeductionsOnloadRequest = {
        page,
        page_size,
        search_query,
        search_column,
        sort_column,
        sort_direction,
        is_export: false,
        MIID: roleId,
        LoginUserId: options?.LoginUserId || 0,
        UserRole: options?.UserRole || ''
    };
    
    console.log('🟠 [API] Calling onloadgetdetails API...');
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    
    const response = await api.post<MasterEarningsDeductionsOnloadResponse>('hrms', url, requestBody);
    
    console.log('🟢 [API] Onload response received');
    console.log('🟢 [API] Response success:', response?.success);
    console.log('🟢 [API] Response message:', response?.message);
    
    // The api.post returns ApiResponse<T>, so response.data is MasterEarningsDeductionsOnloadResponse | null
    const responseData = response?.data as MasterEarningsDeductionsOnloadResponse | null;
    if (responseData?.data) {
        const data = responseData.data;
        const eardettypeDropdown = Array.isArray(data.eardettypeDropdown) ? data.eardettypeDropdown : [];
        const earningdetectionList = Array.isArray(data.earningdetectionList) ? data.earningdetectionList : [];
        console.log('🟢 [API] eardettypeDropdown count:', eardettypeDropdown.length || 0);
        console.log('🟢 [API] earningdetectionList count:', earningdetectionList.length || 0);
    }
    console.log('🟢 [API] Total:', responseData?.total);
    console.log('🟢 [API] Page:', responseData?.page);
    console.log('🟢 [API] Page size:', responseData?.page_size);
    
    // Return the response data directly (unwrap from ApiResponse wrapper)
    // If responseData is null, return a default structure
    if (responseData) {
        return responseData;
    }
    
    // Fallback: return a default structure if responseData is null
    return {
        success: response?.success || false,
        message: response?.message || 'No data received',
        data: {
            HRMED_Id: 0,
            MI_Id: roleId,
            HRMED_Name: null,
            HRMED_EDTypeFlag: null,
            HRMED_EarnDedFlag: null,
            HRMED_AmountPercentFlag: null,
            HRMED_AmountPercent: null,
            HRMED_ActiveFlag: false,
            HRMED_RoundOffFlag: null,
            earningdetectionList: null,
            retrunMsg: '',
            roleId: 0,
            HRMED_ReviseFlg: false,
            earningList: null,
            detectionList: null,
            eardettypelist: null,
            eardettypeDropdown: null,
            perc_OfDTO: null,
            selectedearningdetectionList: null,
            percentOff: null,
            HREED_Amount: null,
            arrearlist: null,
            grosslist: null,
            EarningsDeductionsDTO: null,
            HRMED_Order: null
        },
        total: null,
        page: page,
        page_size: page_size
    };
}

/**
 * Save or Update master earnings deductions record
 * POST /api/MasterEarningsDeductionsFacadeV2
 */
export async function saveMasterEarningsDeductions(data: MasterEarningsDeductionsInput) {
    console.log('🟠 [API] saveMasterEarningsDeductions called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    
    const url = '/api/MasterEarningsDeductionsFacadeV2';
    
    // Build the simplified request body matching the new API format
    const requestBody: MasterEarningsDeductionsSaveRequest = {
        HRMED_Id: data.HRMED_Id || 0,
        MI_Id: data.MI_Id,
        HRMED_Name: data.HRMED_Name,
        HRMED_EDTypeFlag: data.HRMED_EDTypeFlag,
        HRMED_EarnDedFlag: data.HRMED_EarnDedFlag,
        HRMED_AmountPercentFlag: data.HRMED_AmountPercentFlag,
        HRMED_AmountPercent: data.HRMED_AmountPercent,
        HRMED_RoundOffFlag: data.HRMED_RoundOffFlag,
        HRMED_ReviseFlg: data.HRMED_ReviseFlg,
        perc_OfDTO: data.perc_OfDTO || []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        
        // The api.post returns ApiResponse<T>, so response.data is MasterEarningsDeductionsResponse | null
        const responseData = response?.data as MasterEarningsDeductionsResponse | null;
        
        if (responseData) {
            const savedId = responseData.data?.HRMED_Id || 0;
            const retrunMsg = responseData.data?.retrunMsg || responseData.message || '';
            
            // Check if save was successful
            // Success indicator: HRMED_Id > 0 means save was successful
            // Message "Add" or "Update" indicates success
            const isSuccess = responseData.success && (savedId > 0 || responseData.message === 'Add' || responseData.message === 'Update');
            
            console.log('🟢 [API] Parsed - isSuccess:', isSuccess, 'savedId:', savedId, 'message:', responseData.message);
            console.log('🟢 [API] Response data keys:', responseData.data ? Object.keys(responseData.data) : 'null');
            
            // Return formatted response
            const formattedResponse = {
                success: isSuccess,
                message: isSuccess 
                    ? (data.HRMED_Id ? 'Earning/Deduction updated successfully' : 'Earning/Deduction added successfully')
                    : (retrunMsg || 'Failed to save earning/deduction'),
                data: responseData.data
            };
            
            console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
            
            return formattedResponse as any;
        }
        
        // Fallback if responseData is null
        return {
            success: response?.success || false,
            message: response?.message || 'Failed to save earning/deduction',
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
 * Get details of a specific master earnings deductions by ID
 * POST /api/MasterEarningsDeductionsFacadeV2/getRecordById
 */
export async function getMasterEarningsDeductionsDetails(id: number): Promise<EarningsDeductionDetail | null> {
    console.log('🟠 [API] getMasterEarningsDeductionsDetails called with id:', id);
    
    const url = '/api/MasterEarningsDeductionsFacadeV2/getRecordById';
    
    const requestBody = {
        HRMED_Id: id
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Get details response received');
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        
        // The api.post returns ApiResponse<T>, so response.data is MasterEarningsDeductionsResponse | null
        const responseData = response?.data as MasterEarningsDeductionsResponse | null;
        
        if (responseData?.data) {
            console.log('🟢 [API] Response data HRMED_Id:', responseData.data.HRMED_Id);
            
            // Extract the EarningsDeductionDetail fields from the response data
            const detail: EarningsDeductionDetail = {
                HRMED_Id: responseData.data.HRMED_Id,
                MI_Id: responseData.data.MI_Id,
                HRMED_Name: responseData.data.HRMED_Name,
                HRMED_EDTypeFlag: responseData.data.HRMED_EDTypeFlag,
                HRMED_EarnDedFlag: responseData.data.HRMED_EarnDedFlag,
                HRMED_AmountPercentFlag: responseData.data.HRMED_AmountPercentFlag,
                HRMED_AmountPercent: responseData.data.HRMED_AmountPercent,
                HRMED_ActiveFlag: responseData.data.HRMED_ActiveFlag,
                HRMED_RoundOffFlag: responseData.data.HRMED_RoundOffFlag,
                HRMED_Order: responseData.data.HRMED_Order || 0,
                HRMED_ReviseFlg: responseData.data.HRMED_ReviseFlg,
                CreatedDate: '', // Not in response, will be empty
                UpdatedDate: '' // Not in response, will be empty
            };
            
            return detail;
        }
        
        // Fallback if responseData is null
        console.warn('⚠️ [API] No data in response');
        return null;
    } catch (error: any) {
        console.error('🔴 [API] Error getting earnings deduction details:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        throw error;
    }
}

/**
 * Activate or Deactivate a master earnings deductions record
 * POST /api/MasterEarningsDeductionsFacadeV2/deactivateRecordById
 */
export async function activateDeactivateMasterEarningsDeductions(data: {
    HRMED_Id: number;
    HRMED_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    console.log('🟠 [API] activateDeactivateMasterEarningsDeductions called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Toggling to:', data.HRMED_ActiveFlag ? 'ACTIVE' : 'INACTIVE');
    
    const url = '/api/MasterEarningsDeductionsFacadeV2/deactivateRecordById';
    
    // Simplified request body matching the new API format
    const requestBody = {
        HRMED_Id: data.HRMED_Id,
        MI_Id: data.MI_Id || 30
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Toggle response received');
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        
        // The api.post returns ApiResponse<T>, so response.data is MasterEarningsDeductionsResponse | null
        const responseData = response?.data as MasterEarningsDeductionsResponse | null;
        
        if (responseData) {
            const returnedId = responseData.data?.HRMED_Id || 0;
            const returnedFlag = responseData.data?.HRMED_ActiveFlag;
            
            // Success if we get a successful response and an ID back
            const isSuccess = responseData.success && returnedId > 0;
            
            console.log('🟢 [API] Toggle success:', isSuccess, 'returnedId:', returnedId, 'returnedFlag:', returnedFlag);
            
            const formattedResponse = {
                success: isSuccess,
                message: isSuccess 
                    ? `Earning/Deduction ${data.HRMED_ActiveFlag ? 'activated' : 'deactivated'} successfully`
                    : (responseData.message || 'Failed to toggle earning/deduction status'),
                data: responseData.data
            };
            
            console.log('🟢 [API] Formatted toggle response:', JSON.stringify(formattedResponse, null, 2));
            
            return formattedResponse as any;
        }
        
        // Fallback if responseData is null
        return {
            success: response?.success || false,
            message: response?.message || 'Failed to toggle earning/deduction status',
            data: null
        };
    } catch (error: any) {
        console.log('🔴 [API] Toggle error occurred');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        throw error;
    }
}

export async function saveMasterEarningsDeductionsOrder(earningsDeductions: EarningsDeductionDetail[]) {
    const url = '/api/MasterEarningsDeductionsFacade';
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMED_Id: 0,
        MI_Id: 30,
        HRMED_Name: 'string',
        HRMED_EDTypeFlag: 'string',
        HRMED_EarnDedFlag: 'string',
        HRMED_AmountPercentFlag: 'string',
        HRMED_AmountPercent: 'string',
        HRMED_ActiveFlag: true,
        HRMED_RoundOffFlag: 'string',
        HRMED_ReviseFlg: true,
        HRMED_Order: 0,
        earningdetectionList: earningsDeductions.map((ed) => ({
            CreatedDate: ed.CreatedDate || currentDate,
            UpdatedDate: currentDate,
            HRMED_Id: ed.HRMED_Id,
            MI_Id: ed.MI_Id,
            HRMED_Name: ed.HRMED_Name,
            HRMED_EDTypeFlag: ed.HRMED_EDTypeFlag,
            HRMED_EarnDedFlag: ed.HRMED_EarnDedFlag,
            HRMED_AmountPercentFlag: ed.HRMED_AmountPercentFlag,
            HRMED_AmountPercent: ed.HRMED_AmountPercent,
            HRMED_ActiveFlag: ed.HRMED_ActiveFlag,
            HRMED_RoundOffFlag: ed.HRMED_RoundOffFlag,
            HRMED_Order: ed.HRMED_Order,
            HRMED_ReviseFlg: ed.HRMED_ReviseFlg
        })),
        retrunMsg: 'string',
        roleId: 30,
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: 'string',
        HREED_Amount: 0,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: []
    };
    return await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
}
