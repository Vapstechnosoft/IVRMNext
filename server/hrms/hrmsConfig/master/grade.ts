'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { GradeDetail, MasterGradeInput, MasterGradeResponse, OnchangeGradeDetailsRequest } from '@/types/hrms/master-grade';

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
 * Get all master grade records with search, sort, and pagination
 * POST /api/MasterGradeFacade/onloadgetdetails
 */
export async function getMasterGradeList(roleId = 0, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterGradeFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMG_GradeName,HRMG_GradeDisplayName';
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
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMG_Id: 0,
        MI_Id: 30,
        HRMG_GradeName: 'string',
        HRMG_GradeDisplayName: 'string',
        HRMG_PayScaleRange: 'string',
        HRMG_PayScaleFrom: 0,
        HRMG_IncrementOf: 0,
        HRMG_PayScaleTo: 0,
        HRMG_Order: 0,
        HRMG_ActiveFlag: true,
        gradelList: [],
        retrunMsg: 'string',
        roleId: roleId,
        GradeDTO: []
    };
    
    try {
        const response = await api.post<MasterGradeResponse>('hrms', url, requestBody);
        
        // Extract data from response - support both new structure (data) and old structure (gradelList)
        const gradelList = Array.isArray(response?.data) 
            ? response.data 
            : (response as any)?.gradelList || (response as any)?.data?.gradelList || [];
        
        const total = response?.total ?? (Array.isArray(gradelList) ? gradelList.length : 0);
        
        // Transform response to match expected structure
        const transformedResponse = {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: gradelList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterGradeResponse;
        
        return transformedResponse;
    } catch (error: any) {
        console.error('🔴 [ERROR] getMasterGradeList - Error Details:', error);
        throw error;
    }
}

export async function saveMasterGrade(data: MasterGradeInput) {
    const isEdit = data.HRMG_Id && data.HRMG_Id > 0;
    const url = '/api/MasterGradeFacade';
    
    console.log('🟠 [API] saveMasterGrade called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const now = new Date().toISOString();
    const requestBody: OnchangeGradeDetailsRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMG_Id: data.HRMG_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMG_GradeName: data.HRMG_GradeName,
        HRMG_GradeDisplayName: data.HRMG_GradeDisplayName,
        HRMG_PayScaleRange: `${data.HRMG_PayScaleFrom}-${data.HRMG_IncrementOf}-${data.HRMG_PayScaleTo}`,
        HRMG_PayScaleFrom: data.HRMG_PayScaleFrom ?? 0,
        HRMG_IncrementOf: data.HRMG_IncrementOf ?? 0,
        HRMG_PayScaleTo: data.HRMG_PayScaleTo ?? 0,
        HRMG_Order: data.HRMG_Order ?? 0,
        HRMG_ActiveFlag: data.HRMG_ActiveFlag,
        gradelList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMG_Id: data.HRMG_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMG_GradeName: data.HRMG_GradeName,
                HRMG_GradeDisplayName: data.HRMG_GradeDisplayName,
                HRMG_PayScaleRange: `${data.HRMG_PayScaleFrom ?? 0}-${data.HRMG_IncrementOf ?? 0}-${data.HRMG_PayScaleTo ?? 0}`,
                HRMG_PayScaleFrom: data.HRMG_PayScaleFrom ?? 0,
                HRMG_IncrementOf: data.HRMG_IncrementOf ?? 0,
                HRMG_PayScaleTo: data.HRMG_PayScaleTo ?? 0,
                HRMG_Order: data.HRMG_Order ?? 0,
                HRMG_ActiveFlag: data.HRMG_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        GradeDTO: []
    };
    
    console.log('🟠 ========== GRADE API REQUEST ==========');
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] gradelList count:', requestBody.gradelList.length);
    console.log('🟠 [API] gradelList[0]:', JSON.stringify(requestBody.gradelList[0], null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterGradeResponse>('hrms', url, requestBody);
        
        console.log('🟢 ========== GRADE API RESPONSE ==========');
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMG_Id || 0;
        const hasGradeList = !!(responseData?.gradelList?.length > 0);
        
        console.log('🟢 [API] Response.HRMG_Id:', savedId);
        console.log('🟢 [API] Response.retrunMsg:', retrunMsg);
        console.log('🟢 [API] Response.gradelList exists:', !!responseData?.gradelList);
        console.log('🟢 [API] Response.gradelList.length:', responseData?.gradelList?.length || 0);
        if (responseData?.gradelList?.[0]) {
            console.log('🟢 [API] Response.gradelList[0].HRMG_Id:', responseData.gradelList[0].HRMG_Id);
        }
        
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || isUpdateSuccess || hasGradeList) && !isDuplicateError;
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasGradeList:', hasGradeList);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Grade already exists'
                : isSuccess 
                    ? (isEdit ? 'Grade updated successfully' : 'Grade added successfully')
                    : (retrunMsg || 'Failed to save grade'),
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        console.log('🟢 ========== GRADE API END ==========');
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master grade record
 * POST /api/MasterGradeFacade/deactivateRecordById
 */
export async function activateDeactivateMasterGrade(data: {
    HRMG_Id: number;
    HRMG_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterGradeFacade/deactivateRecordById';
    
    console.log('🟠 [API] activateDeactivateMasterGrade called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMG_Id: data.HRMG_Id,
        MI_Id: 30,
        HRMG_GradeName: 'string',
        HRMG_GradeDisplayName: 'string',
        HRMG_PayScaleRange: 'string',
        HRMG_PayScaleFrom: 0,
        HRMG_IncrementOf: 0,
        HRMG_PayScaleTo: 0,
        HRMG_Order: 0,
        HRMG_ActiveFlag: data.HRMG_ActiveFlag,
        gradelList: [],
        retrunMsg: 'string',
        roleId: 30,
        GradeDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await api.post<MasterGradeResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Toggle response:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        
        console.log('🟢 [API] Response.retrunMsg:', retrunMsg);
        
        if (retrunMsg === 'Mapped') {
            console.log('⚠️ [API] Grade is mapped/in use - cannot deactivate');
        }
        
        // Return the response with retrunMsg for UI to check
        return responseData;
    } catch (error: any) {
        console.log('🔴 [API] Toggle error:', error);
        throw error;
    }
}

export async function saveMasterGradeOrder(grades: GradeDetail[]) {
    console.log('🟠 [API] saveMasterGradeOrder called');
    console.log('🟠 [API] Number of grades to update:', grades.length);
    
    const url = '/api/MasterGradeFacade';
    const now = new Date().toISOString();
    
    // Use gradelList array (same as save endpoint)
    const requestBody: OnchangeGradeDetailsRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMG_Id: 0,
        MI_Id: 30,
        HRMG_GradeName: 'string',
        HRMG_GradeDisplayName: 'string',
        HRMG_PayScaleRange: 'string',
        HRMG_PayScaleFrom: 0,
        HRMG_IncrementOf: 0,
        HRMG_PayScaleTo: 0,
        HRMG_Order: 0,
        HRMG_ActiveFlag: true,
        gradelList: grades.map((grade) => ({
            CreatedDate: grade.CreatedDate || now,
            UpdatedDate: now,
            HRMG_Id: grade.HRMG_Id,
            MI_Id: grade.MI_Id || 30,
            HRMG_GradeName: grade.HRMG_GradeName,
            HRMG_GradeDisplayName: grade.HRMG_GradeDisplayName,
            HRMG_PayScaleRange: grade.HRMG_PayScaleRange,
            HRMG_PayScaleFrom: grade.HRMG_PayScaleFrom,
            HRMG_IncrementOf: grade.HRMG_IncrementOf,
            HRMG_PayScaleTo: grade.HRMG_PayScaleTo,
            HRMG_Order: grade.HRMG_Order ?? 0,
            HRMG_ActiveFlag: grade.HRMG_ActiveFlag
        })),
        retrunMsg: 'string',
        roleId: 30,
        GradeDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] gradelList count:', requestBody.gradelList.length);
    
    try {
        const response = await api.post<MasterGradeResponse>('hrms', url, requestBody);
        console.log('🟢 [API] saveMasterGradeOrder success');
        return response;
    } catch (error: any) {
        console.log('🔴 [API] saveMasterGradeOrder error:', error);
        throw error;
    }
}
