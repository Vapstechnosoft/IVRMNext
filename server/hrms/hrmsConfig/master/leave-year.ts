'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { LeaveYearDetail, MasterLeaveYearInput, MasterLeaveYearResponse } from '@/types/hrms/master-leave-year';

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
 * Get onload details for master leave year with search, sort, and pagination
 * POST /api/MasterLeaveYearFacade/onloadgetdetails
 */
export async function getMasterLeaveYearList(roleId: number, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterLeaveYearFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMLY_LeaveYear';
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
        UserRole: ''
    };
    
    try {
        const response = await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
        
        // Transform response to match expected structure
        // The API returns data array directly, or in leaveYearList for backward compatibility
        const leaveYearList = Array.isArray(response?.data) 
            ? response.data 
            : (response?.leaveYearList || (response as any)?.data?.leaveYearList || []);
        
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(leaveYearList) ? leaveYearList.length : 0);
        
        // Return in the expected format
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: leaveYearList,
            leaveYearList: leaveYearList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterLeaveYearResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterLeaveYearList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

/**
 * Create or Update a master leave year record
 * POST /api/MasterLeaveYearFacade (for both create and update)
 */
export async function saveMasterLeaveYear(data: MasterLeaveYearInput) {
    const isEdit = data.HRMLY_Id && data.HRMLY_Id > 0;
    const url = '/api/MasterLeaveYearFacade'; // Use same endpoint for both add and edit
    
    console.log('🟠 [API] saveMasterLeaveYear called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Input order value:', data.HRMLY_LeaveYearOrder);
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    console.log('🟠 [API] URL:', url);
    
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMLY_Id: data.HRMLY_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMLY_LeaveYear: data.HRMLY_LeaveYear,
        HRMLY_FromDate: data.HRMLY_FromDate,
        HRMLY_ToDate: data.HRMLY_ToDate,
        HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
        HRMLY_LeaveYearOrder: data.HRMLY_LeaveYearOrder ?? 1,  // Use ?? instead of || to allow 0
        leaveYearList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                HRMLY_Id: data.HRMLY_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMLY_LeaveYear: data.HRMLY_LeaveYear,
                HRMLY_FromDate: data.HRMLY_FromDate,
                HRMLY_ToDate: data.HRMLY_ToDate,
                HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
                HRMLY_LeaveYearOrder: data.HRMLY_LeaveYearOrder ?? 1  // Use ?? instead of || to allow 0
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Order in request body:', requestBody.HRMLY_LeaveYearOrder);
    console.log('🟠 [API] Order in leaveYearList[0]:', requestBody.leaveYearList[0].HRMLY_LeaveYearOrder);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMLY_Id:', (response as any)?.HRMLY_Id);
        
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const leaveYearId = responseData?.HRMLY_Id || (responseData?.data as any)?.HRMLY_Id || 0;
        const hasLeaveYearList = !!(responseData?.leaveYearList || responseData?.data?.leaveYearList);
        
        console.log('🟢 [API] Parsed - leaveYearId:', leaveYearId, 'retrunMsg:', retrunMsg, 'hasLeaveYearList:', hasLeaveYearList);
        
        // Check if "Update", "Saved", "Add", or "Order" message indicates success
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        
        // Success if we have a leave year ID, leaveYearList, or success message
        const isSuccess = leaveYearId > 0 || hasLeaveYearList || isUpdateSuccess;
        
        console.log('🟢 [API] isSuccess:', isSuccess);
        
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess 
                ? (isEdit ? 'Leave Year updated successfully' : 'Leave Year added successfully')
                : (retrunMsg || 'Failed to save leave year'),
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
 * Get details of a specific master leave year by ID
 * GET /api/MasterLeaveYearFacade/getRecordById/{id}
 */
export async function getMasterLeaveYearDetails(id: number) {
    const url = `/api/MasterLeaveYearFacade/getRecordById/${id}`;
    return await api.get<MasterLeaveYearResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master leave year record
 * POST /api/MasterLeaveYearFacade/deactivateRecordById
 */
export async function activateDeactivateMasterLeaveYear(data: {
    HRMLY_Id: number;
    HRMLY_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterLeaveYearFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMLY_Id: data.HRMLY_Id,
        MI_Id: 30,
        HRMLY_LeaveYear: 'string',
        HRMLY_FromDate: new Date().toISOString(),
        HRMLY_ToDate: new Date().toISOString(),
        HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
        leaveYearList: [],
        retrunMsg: 'string',
        roleId: 0,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: 1,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    return await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
}

export async function saveMasterLeaveYearOrder(leaveYears: LeaveYearDetail[]) {
    console.log('🟠 [API] saveMasterLeaveYearOrder called');
    console.log('🟠 [API] Number of leave years to update:', leaveYears.length);
    
    const url = '/api/MasterLeaveYearFacade';
    const currentDate = new Date().toISOString();
    
    // Populate leaveYearList with all leave years and their updated orders
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMLY_Id: 0,
        MI_Id: 30,
        HRMLY_LeaveYear: 'string',
        HRMLY_FromDate: currentDate,
        HRMLY_ToDate: currentDate,
        HRMLY_ActiveFlag: true,
        leaveYearList: leaveYears.map((ly) => ({
            CreatedDate: ly.CreatedDate || currentDate,
            UpdatedDate: currentDate,  // Always update the UpdatedDate
            HRMLY_Id: ly.HRMLY_Id,
            MI_Id: ly.MI_Id || 30,
            HRMLY_LeaveYear: ly.HRMLY_LeaveYear,
            HRMLY_FromDate: ly.HRMLY_FromDate,
            HRMLY_ToDate: ly.HRMLY_ToDate,
            HRMLY_ActiveFlag: ly.HRMLY_ActiveFlag,
            HRMLY_LeaveYearOrder: ly.HRMLY_LeaveYearOrder ?? 0
        })),
        retrunMsg: 'string',
        roleId: 30,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: 0,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] leaveYearList count:', requestBody.leaveYearList.length);
    console.log('🟠 [API] Sample orders:', requestBody.leaveYearList.slice(0, 3).map(ly => `ID=${ly.HRMLY_Id}, Order=${ly.HRMLY_LeaveYearOrder}`));
    
    try {
        const response = await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
        console.log('🟢 [API] saveMasterLeaveYearOrder success');
        return response;
    } catch (error: any) {
        console.log('🔴 [API] saveMasterLeaveYearOrder error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        throw error;
    }
}
