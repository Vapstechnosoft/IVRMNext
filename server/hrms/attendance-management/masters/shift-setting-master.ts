'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ShiftSettingMasterGetDataResponse,
    ShiftSettingMasterGetDataResponseData
} from '@/types/hrms/attendance-management/shift-setting-master';

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
 * Get shift setting master data from API
 * Following the preadmission module pattern - returns API response directly
 */
export async function getShiftSettingMaster(searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    const requestBody = {
        page: normalizedParams.page || 1,
        page_size: normalizedParams.page_size || 10,
        search_query: normalizedParams.search_query || '',
        search_column: normalizedParams.search_column || '',
        sort_column: normalizedParams.sort_column || '',
        sort_direction: normalizedParams.sort_direction || '',
        is_export: false,
        miid: 30,
        loginUserId: 0,
        userRole: ''
    };

    const url = '/api/ShiftSettingMasterFacade/getdata';
    
    try {
        const response = await api.post<ShiftSettingMasterGetDataResponseData>('hrmsfrontoffice', url, requestBody);
        
        // API response structure:
        // {
        //   "success": true,
        //   "message": "OK",
        //   "data": {
        //     "types": [...],
        //     "report_list": [...]
        //   },
        //   "total": 0,
        //   "page": 1,
        //   "page_size": 10
        // }
        
        // Extract the data structure
        const actualData: ShiftSettingMasterGetDataResponseData = response?.data || {
            types: [],
            report_list: []
        };
        
        // Extract pagination info from response
        const responseTotal = typeof response?.total === 'number' ? response.total : (actualData?.report_list?.length || 0);
        const responsePage = typeof response?.page === 'number' ? response.page : (normalizedParams.page || 1);
        const responsePageSize = typeof response?.page_size === 'number' 
            ? response.page_size 
            : (typeof response?.page_Size === 'number' 
                ? response.page_Size 
                : (normalizedParams.page_size || 10));
        
        const responseData: ShiftSettingMasterGetDataResponse = {
            success: response?.success ?? true,
            message: response?.message || 'Shift setting master data retrieved successfully',
            data: actualData,
            total: responseTotal,
            page: responsePage,
            page_size: responsePageSize
        };
        
        return responseData;
    } catch (error: any) {
        console.error('Failed to fetch shift setting master data:', error);
        
        // Return error response in expected format
        return {
            success: false,
            message: error?.response?.data?.msg || error?.message || 'Failed to fetch shift setting master data',
            data: {
                types: [],
                report_list: []
            },
            total: 0,
            page: normalizedParams.page || 1,
            page_size: normalizedParams.page_size || 10
        };
    }
}

/**
 * Save or update shift setting master
 */
export async function addOrUpdateShiftSettingMaster(data: {
    id?: number;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    lunchStartTime: string;
    lunchEndTime: string;
    totalWorkingHours: string;
    halfDayWorkingHours: string;
    lunchHours: string;
    delayPerShift: string;
    earlyPerShift: string;
    isActive: boolean;
}) {
    const isEdit = data.id && data.id > 0;
    
    const requestBody = {
        fomS_Id: data.id || 0,
        mI_Id: 30,
        fomS_ShiftName: data.shiftName || '',
        fomS_ActiveFlg: data.isActive ?? true,
        fomsT_Id: 0, // Shift timing ID (0 for new, or existing ID for update - not available in form data)
        fohwdT_Id: 0, // Holiday/weekend type ID (not in form data)
        fomsT_FDWHrMin: data.totalWorkingHours || '', // Full Day Working Hours
        fomsT_HDWHrMin: data.halfDayWorkingHours || '', // Half Day Working Hours
        fomsT_IHalfLoginTime: data.shiftStartTime || '', // First Half Login Time
        fomsT_IHalfLogoutTime: data.lunchStartTime || '', // First Half Logout Time
        fomsT_IIHalfLoginTime: data.lunchEndTime || '', // Second Half Login Time
        fomsT_IIHalfLogoutTime: data.shiftEndTime || '', // Second Half Logout Time
        fomsT_DelayPerShiftHrMin: data.delayPerShift || '',
        fomsT_EarlyPerShiftHrMin: data.earlyPerShift || '',
        fomsT_LunchHoursDuration: data.lunchHours || '',
        fomsT_BlockAttendance: '',
        fomsT_FixTimings: '',
        returnvalue: '',
        filldata: [],
        filltype: [],
        fohtwD_HolidayWDType: ''
    };

    const url = '/api/ShiftSettingMasterFacade/savedetail';
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        // Transform response to match expected format
        const responseData = response as any;
        
        // Check for success indicators
        const returnval = responseData?.returnval;
        const returnvalBool = returnval === true || returnval === 'true' || returnval === 1 || returnval === '1';
        const hasSuccessField = 'success' in responseData && responseData.success === true;
        const savedId = responseData?.fomS_Id || responseData?.fomsT_Id || 0;
        
        // Multiple ways to determine success
        const isSuccess = returnvalBool || hasSuccessField || responseData?.success === true || savedId > 0;
        
        // Extract error message from response if available
        const apiErrorMessage = responseData?.msg || 
                               responseData?.errorMessage || 
                               responseData?.error ||
                               (responseData?.errors && Array.isArray(responseData.errors) 
                                   ? responseData.errors.map((e: any) => e.message || e).join(', ')
                                   : null);
        
        // Determine message
        const message = isSuccess 
            ? (isEdit ? 'Shift setting updated successfully' : 'Shift setting created successfully')
            : (apiErrorMessage || 'Failed to save shift setting');
        
        return {
            success: isSuccess,
            message: message,
            data: responseData
        };
    } catch (error: any) {
        console.error('Failed to save shift setting master:', error);
        
        return {
            success: false,
            message: error?.response?.data?.msg || error?.message || 'Failed to save shift setting',
            data: error?.response?.data
        };
    }
}

// TODO: Implement delete API endpoint when available
export async function deleteShiftSettingMaster(id: number) {
    // Placeholder - to be implemented when delete API endpoint is available
    return {
        success: false,
        message: 'Delete functionality not yet implemented - API endpoint required'
    };
}

