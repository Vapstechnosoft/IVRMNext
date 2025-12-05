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
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    const response = await api.post<MasterEarningsDeductionsOnloadResponse>('hrms', url, requestBody);
    console.log('🟢 [API] Response keys:', response ? Object.keys(response) : []);
    console.log('🟢 [API] Response.data keys:', response?.data ? Object.keys(response.data) : []);
    // The api.post returns ApiResponse<T>, where response is { success, message, data: T, total, page, page_size }
    // Based on logs, response.data contains the data object directly with earningList, detectionList, etc.
    // We need to wrap it properly to match MasterEarningsDeductionsOnloadResponse structure
    const rawData = response?.data as any;
    console.log('🟢 [API] rawData keys:', rawData ? Object.keys(rawData) : []);
    console.log('🟢 [API] rawData has earningList:', 'earningList' in (rawData || {}));
    console.log('🟢 [API] rawData has detectionList:', 'detectionList' in (rawData || {}));
    // Response structure: { success, message, data: { earningdetectionList: [...], ... }, total, page, page_size }
    // Extract data from response.data
    const responseData = response as any;
    const data = responseData?.data || rawData;
    console.log('🟢 [API] - data keys:', data ? Object.keys(data) : []);
    if (data) {
        // Extract earningdetectionList - this is the main array for the table
        const earningdetectionList = Array.isArray(data.earningdetectionList) ? data.earningdetectionList : [];
        const eardettypeDropdown = Array.isArray(data.eardettypeDropdown) ? data.eardettypeDropdown : [];
        // Normalize arrays to ensure they're always arrays
        if (!Array.isArray(data.earningList)) {
            data.earningList = [];
        }
        if (!Array.isArray(data.detectionList)) {
            data.detectionList = [];
        }
        if (!Array.isArray(data.earningdetectionList)) {
            data.earningdetectionList = [];
        }
        if (!Array.isArray(data.eardettypeDropdown)) {
            data.eardettypeDropdown = [];
        }
        // Debug: Check active/inactive records in the list
        if (earningdetectionList.length > 0) {
            const activeRecords = earningdetectionList.filter((item: any) => item.HRMED_ActiveFlag === true);
            const inactiveRecords = earningdetectionList.filter((item: any) => item.HRMED_ActiveFlag === false);
            if (inactiveRecords.length > 0) {
                console.log('🟢 [API] Inactive record IDs:', inactiveRecords.map((r: any) => r.HRMED_Id).join(', '));
            } else {
            }
            // Show sample of record IDs and their active status
            console.log('🟢 [API] Sample records (first 10):');
            earningdetectionList.slice(0, 10).forEach((item: any, index: number) => {
            });
        } else {
        }
        // Also check earningList and detectionList
        const earningList = Array.isArray(data.earningList) ? data.earningList : [];
        const detectionList = Array.isArray(data.detectionList) ? data.detectionList : [];
        if (earningList.length > 0) {
            const activeEarnings = earningList.filter((item: any) => item.HRMED_ActiveFlag === true);
            const inactiveEarnings = earningList.filter((item: any) => item.HRMED_ActiveFlag === false);
        }
        if (detectionList.length > 0) {
            const activeDeductions = detectionList.filter((item: any) => item.HRMED_ActiveFlag === true);
            const inactiveDeductions = detectionList.filter((item: any) => item.HRMED_ActiveFlag === false);
        }
        // Log final structure to verify earningList is included
        // Wrap in MasterEarningsDeductionsOnloadResponse structure
        const responseData: MasterEarningsDeductionsOnloadResponse = {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: data,
            total: response?.total ?? earningdetectionList.length ?? null,
            page: (response?.page ?? page) as number,
            page_size: (response?.page_size ?? page_size) as number
        };
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
            earningdetectionList: [],
            retrunMsg: '',
            roleId: 0,
            HRMED_ReviseFlg: false,
            earningList: [],
            detectionList: [],
            eardettypelist: null,
            eardettypeDropdown: [],
            perc_OfDTO: null,
            selectedearningdetectionList: null,
            percentOff: null,
            HREED_Amount: null,
            arrearlist: [],
            grosslist: [],
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
    const timestamp = new Date().toISOString();
    const isUpdate = !!(data.HRMED_Id && data.HRMED_Id > 0);
    console.log('🟠 [TERMINAL] Input Data:', JSON.stringify(data, null, 2));
    const url = '/api/MasterEarningsDeductionsFacadeV2';
    // Build the request body matching the new API format
    const requestBody: any = {
        HRMED_Id: data.HRMED_Id || 0,
        MI_Id: data.MI_Id,
        HRMED_Name: data.HRMED_Name,
        HRMED_EDTypeFlag: data.HRMED_EDTypeFlag,
        HRMED_EarnDedFlag: data.HRMED_EarnDedFlag,
        HRMED_AmountPercentFlag: data.HRMED_AmountPercentFlag,
        HRMED_AmountPercent: data.HRMED_AmountPercent,
        HRMED_RoundOffFlag: data.HRMED_RoundOffFlag,
        HRMED_ReviseFlg: data.HRMED_ReviseFlg ?? true,
        HRMED_Order: data.HRMED_Order || 0,
        perc_OfDTO: data.perc_OfDTO || [
            {
                HRMEDP_Id: 0,
                MI_Id: 0,
                HRMED_Id: 0,
                HRMEDP_HRMED_Id: 0
            }
        ]
    };
    console.log('🟠 [TERMINAL] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const requestStartTime = Date.now();
        const response = await api.post<any>('hrms', url, requestBody);
        const requestDuration = Date.now() - requestStartTime;
        console.log('🟢 [TERMINAL] Raw Response:', JSON.stringify(response, null, 2));
        // Response structure from Swagger:
        // {
        //   "success": true,
        //   "message": "Add",
        //   "data": { ... },
        //   "total": null,
        //   "page": null,
        //   "page_size": null
        // }
        // Extract response data
        const responseData = response?.data || response;
        const success = response?.success ?? false;
        const message = response?.message || responseData?.retrunMsg || '';
        // Check for error messages (even if success is true, error message means failure)
        const messageLower = message.toLowerCase();
        const hasError = messageLower.includes('error') || 
                        messageLower.includes('failed') ||
                        messageLower.includes('exception') ||
                        messageLower.includes('duplicate');
        // Check if the operation was successful
        // Success indicators:
        // 1. No error message
        // 2. response.success === true
        // 3. response.message is "Add" or "Update" or response.data.retrunMsg is "Add" or "Update"
        // 4. response.data.HRMED_Id > 0 (for new records)
        const savedId = responseData?.HRMED_Id || 0;
        const retrunMsg = responseData?.retrunMsg || '';
        const hasSuccessMessage = (message === 'Add' || message === 'Update' || retrunMsg === 'Add' || retrunMsg === 'Update') && !hasError;
        const hasValidId = savedId > 0;
        // Success only if no error AND (success flag OR has success message OR has valid ID)
        const isSuccess = !hasError && (success || hasSuccessMessage || hasValidId);
        // Determine operation type from API message
        const isUpdateOperation = message === 'Update' || retrunMsg === 'Update' || (data.HRMED_Id && data.HRMED_Id > 0);
        // Format the success message - prioritize API message
        let successMessage = message || retrunMsg;
        if (!successMessage) {
            if (hasError) {
                successMessage = 'Failed to save earning/deduction';
            } else if (isSuccess) {
                successMessage = isUpdateOperation ? 'Earning/Deduction updated successfully' : 'Earning/Deduction added successfully';
            } else {
                successMessage = 'Failed to save earning/deduction';
            }
        }
        // Check earningdetectionList in response
        const earningdetectionList = Array.isArray(responseData?.earningdetectionList) 
            ? responseData.earningdetectionList 
            : [];
        // Return response matching Swagger structure
        return {
            success: isSuccess,
            message: successMessage,
            data: responseData,
            total: response?.total ?? null,
            page: response?.page ?? null,
            page_size: response?.page_size ?? null
        };
    } catch (error: any) {
        if (error?.response) {
            console.error('🔴 [TERMINAL] Error Response Data:', JSON.stringify(error.response?.data, null, 2));
        }
        // Extract error message from response if available
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg ||
                           error?.message || 
                           'Failed to save earning/deduction';
        return {
            success: false,
            message: errorMessage,
            data: null,
            total: null,
            page: null,
            page_size: null
        };
    }
}
/**
 * Get details of a specific master earnings deductions by ID
 * POST /api/MasterEarningsDeductionsFacadeV2/getRecordById
 */
export async function getMasterEarningsDeductionsDetails(id: number): Promise<EarningsDeductionDetail | null> {
    const url = '/api/MasterEarningsDeductionsFacadeV2/getRecordById';
    const requestBody = {
        HRMED_Id: id
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
        // The api.post returns ApiResponse<T>, so response.data is MasterEarningsDeductionsResponse | null
        const responseData = response?.data as MasterEarningsDeductionsResponse | null;
        if (responseData?.data) {
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
        return null;
    } catch (error: any) {
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
    const timestamp = new Date().toISOString();
    const targetState = data.HRMED_ActiveFlag ? 'ACTIVE' : 'INACTIVE';
    console.log('🟠 [TERMINAL] Input Data:', JSON.stringify(data, null, 2));
    console.log('   - HRMED_ActiveFlag:', data.HRMED_ActiveFlag, `(${targetState})`);
    console.log('   - MI_Id:', data.MI_Id || 'not provided (will use default: 30)');
    const url = '/api/MasterEarningsDeductionsFacadeV2/deactivateRecordById';
    // Simplified request body matching the new API format
    const requestBody = {
        HRMED_Id: data.HRMED_Id,
        MI_Id: data.MI_Id || 30
    };
    console.log('🟠 [TERMINAL] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const requestStartTime = Date.now();
        const response = await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
        const requestDuration = Date.now() - requestStartTime;
        console.log('🟢 [TERMINAL] Raw Response:', JSON.stringify(response, null, 2));
        console.log('🟢 [TERMINAL] Response.success (top level):', response?.success);
        console.log('🟢 [TERMINAL] Response.message (top level):', response?.message);
        // The api.post returns ApiResponse<T>, but the actual response structure shows
        // response.data is directly the data object, not wrapped in MasterEarningsDeductionsResponse
        // So we need to check both structures
        const responseData = response?.data as MasterEarningsDeductionsResponse | any;
        // Try to get the main data object - it could be responseData.data or responseData directly
        let mainData: any = null;
        if (responseData) {
            // Check if responseData has a nested data property (MasterEarningsDeductionsResponse structure)
            if (responseData.data && typeof responseData.data === 'object' && 'HRMED_Id' in responseData.data) {
                mainData = responseData.data;
            } 
            // Otherwise, responseData itself might be the data object
            else if ('HRMED_Id' in responseData) {
                mainData = responseData;
            }
        }
        // Get the ID and flag from the main data object
        const returnedId = mainData?.HRMED_Id || 0;
        const returnedFlag = mainData?.HRMED_ActiveFlag;
        // Extract message from response - priority: response.message > responseData.message > mainData.retrunMsg
        const apiMessage = response?.message || responseData?.message || mainData?.retrunMsg || '';
        // Success if we get a successful response and an ID back
        // Also check if the message indicates success (Deactivated/Activated)
        const isSuccess = (response?.success || responseData?.success) && 
                          (returnedId > 0 || apiMessage === 'Deactivated' || apiMessage === 'Activated');
        console.log('   - responseData has data property:', !!(responseData?.data));
        console.log('   - responseData has HRMED_Id:', !!('HRMED_Id' in (responseData || {})));
        console.log('   - returnedFlag:', returnedFlag, `(${returnedFlag !== undefined ? (returnedFlag ? 'ACTIVE' : 'INACTIVE') : 'UNDEFINED'})`);
        console.log('   - response.success (top level):', response?.success);
        console.log('   - response.message (top level):', response?.message);
        console.log('   - apiMessage (extracted):', apiMessage);
        if (returnedFlag !== undefined) {
            console.log('   - Expected Flag:', data.HRMED_ActiveFlag, `(${targetState})`);
            console.log('   - Returned Flag:', returnedFlag, `(${returnedFlag ? 'ACTIVE' : 'INACTIVE'})`);
        } else {
        }
        if (mainData) {
            // Check if the toggled record is in the earningdetectionList
            const earningdetectionList = Array.isArray(mainData.earningdetectionList) 
                ? mainData.earningdetectionList 
                : [];
            const toggledRecordInList = earningdetectionList.find(
                (item: any) => item.HRMED_Id === data.HRMED_Id
            );
            console.log('   - Toggled record (HRMED_Id:', data.HRMED_Id, ') in list:', toggledRecordInList ? '✅ YES' : '❌ NO');
            if (toggledRecordInList) {
            } else {
                // Show active/inactive breakdown
                const activeInList = earningdetectionList.filter((item: any) => item.HRMED_ActiveFlag === true).length;
                const inactiveInList = earningdetectionList.filter((item: any) => item.HRMED_ActiveFlag === false).length;
            }
        }
        // Format the success message based on API response
        // If the API message is "Deactivated" or "Activated", consider it successful
        const isApiSuccess = apiMessage === 'Deactivated' || apiMessage === 'Activated' || 
                            (response?.success && (returnedId > 0 || returnedFlag !== undefined));
        let successMessage = '';
        if (isApiSuccess) {
            successMessage = `Earning/Deduction ${data.HRMED_ActiveFlag ? 'activated' : 'deactivated'} successfully`;
        } else {
            successMessage = apiMessage || responseData?.message || 'Failed to toggle earning/deduction status';
        }
        // Return the main data object which contains HRMED_Id, HRMED_ActiveFlag, and the lists
        // If mainData is null, try to return responseData or create a minimal response
        const formattedResponse = {
            success: isApiSuccess,
            message: successMessage,
            data: mainData || responseData || null
        };
        console.log('🟢 [TERMINAL] Formatted Response:', JSON.stringify(formattedResponse, null, 2));
        return formattedResponse as any;
        // Fallback if responseData is null
        const fallbackMessage = response?.message || 'Failed to toggle earning/deduction status';
        return {
            success: response?.success || false,
            message: fallbackMessage,
            data: null
        };
    } catch (error: any) {
        console.error('🔴 [TERMINAL] Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        if (error?.response) {
            console.error('🔴 [TERMINAL] Error Response Data:', JSON.stringify(error.response?.data, null, 2));
        }
        if (error?.request) {
        }
        throw error;
    }
}
export async function getEarningsDeductionsSetOrder(roleId: number) {
    const url = '/api/MasterEarningsDeductionsFacadeV2/onloadgetdetails';
    const requestBody = {
        page: 1,
        page_size: 1000,
        search_query: '',
        search_column: '',
        sort_column: 'HRMED_Order',
        sort_direction: 'asc',
        is_export: false,
        MIID: roleId,
        LoginUserId: 0,
        UserRole: ''
    };
    try {
        const response = await api.post<MasterEarningsDeductionsOnloadResponse>('hrms', url, requestBody);
        const earningdetectionList = (response as any)?.earningdetectionList || [];
        return {
            success: true,
            data: earningdetectionList.map((ed: EarningsDeductionDetail) => ({
                HRMED_Id: ed.HRMED_Id,
                HRMED_Name: ed.HRMED_Name,
                HRMED_Order: ed.HRMED_Order ?? 0
            }))
        };
    } catch (error: any) {
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
export async function updateEarningsDeductionsSetorder(data: Array<{ id: number; order: number }>) {
    const edListResponse = await getMasterEarningsDeductionsList(30, { page: 1, page_size: 1000 });
    const allEarningsDeductions = edListResponse?.data?.earningdetectionList || [];
    const updatedEarningsDeductions = allEarningsDeductions.map((ed) => {
        const orderUpdate = data.find((item) => item.id === ed.HRMED_Id);
        return {
            ...ed,
            HRMED_Order: orderUpdate ? orderUpdate.order : ed.HRMED_Order ?? 0
        };
    });
    return await saveMasterEarningsDeductionsOrder(updatedEarningsDeductions);
}
