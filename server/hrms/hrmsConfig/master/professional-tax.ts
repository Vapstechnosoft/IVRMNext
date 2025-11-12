'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    MasterProfessionalTaxInput,
    MasterProfessionalTaxResponse
} from '@/types/hrms/master-professional-tax';

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
 * Get onload details for master professional tax with search, sort, and pagination
 * POST /api/MasterProfessionalTaxFacade/onloadgetdetails
 */
export async function getMasterProfessionalTaxList(roleId: number, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterProfessionalTaxFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMPT_SalaryFrom,HRMPT_SalaryTo,HRMPT_PTax';
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
        HRMPT_Id: 0,
        MI_Id: 30,
        HRMPT_SalaryFrom: 0,
        HRMPT_SalaryTo: 0,
        HRMPT_PTax: 0,
        HRMPT_ActiveFlag: true,
        pTaxrList: [],
        retrunMsg: 'string',
        roleId: roleId,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    
    try {
        const response = await api.post<MasterProfessionalTaxResponse>('hrms', url, requestBody);
        
        // Transform response to match expected structure (like preadmission and bank)
        // The API returns data directly as an array in the response.data field, or nested in pTaxrList
        // Based on the API response structure: { success, message, data: [...], total, page, page_size }
        const professionalTaxList = Array.isArray(response?.data) 
            ? response.data 
            : (response as any)?.pTaxrList || (response as any)?.data?.pTaxrList || [];
        
        // Use API's total if provided, otherwise use array length
        // Note: If API is paginating correctly, it should return total count of ALL records, not just this page
        const total = response?.total ?? (Array.isArray(professionalTaxList) ? professionalTaxList.length : 0);
        
        // Return in the expected format - spread response first, then override with transformed values
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: professionalTaxList, // Return all items from API - let API handle pagination
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterProfessionalTaxResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterProfessionalTaxList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

/**
 * Save or Update master professional tax record
 * POST /api/MasterProfessionalTaxFacade
 */
export async function saveMasterProfessionalTax(data: MasterProfessionalTaxInput) {
    const isEdit = data.HRMPT_Id && data.HRMPT_Id > 0;
    const url = '/api/MasterProfessionalTaxFacade';
    
    console.log('🟠 [API] saveMasterProfessionalTax called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMPT_Id: data.HRMPT_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMPT_SalaryFrom: Number(data.HRMPT_SalaryFrom) || 0,
        HRMPT_SalaryTo: Number(data.HRMPT_SalaryTo) || 0,
        HRMPT_PTax: Number(data.HRMPT_PTax) || 0,
        HRMPT_ActiveFlag: data.HRMPT_ActiveFlag ?? true,
        pTaxrList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                HRMPT_Id: data.HRMPT_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMPT_SalaryFrom: Number(data.HRMPT_SalaryFrom) || 0,
                HRMPT_SalaryTo: Number(data.HRMPT_SalaryTo) || 0,
                HRMPT_PTax: Number(data.HRMPT_PTax) || 0,
                HRMPT_ActiveFlag: data.HRMPT_ActiveFlag ?? true
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterProfessionalTaxResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMPT_Id:', (response as any)?.HRMPT_Id);
        
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMPT_Id || (responseData?.data as any)?.HRMPT_Id || 0;
        const hasPTaxrList = !!(responseData?.pTaxrList || responseData?.data?.pTaxrList);
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasPTaxrList:', hasPTaxrList);
        
        // Check for success indicators
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || hasPTaxrList || isUpdateSuccess) && !isDuplicateError;
        
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Professional tax slab already exists'
                : isSuccess 
                    ? (isEdit ? 'Professional tax updated successfully' : 'Professional tax added successfully')
                    : (retrunMsg || 'Failed to save professional tax'),
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
 * Get details of a specific master professional tax by ID
 * GET /api/MasterProfessionalTaxFacade/getRecordById/{id}
 */
export async function getMasterProfessionalTaxDetails(id: number) {
    const url = `/api/MasterProfessionalTaxFacade/getRecordById/${id}`;
    return await api.get<MasterProfessionalTaxResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master professional tax record
 * POST /api/MasterProfessionalTaxFacade/deactivateRecordById
 */
export async function activateDeactivateMasterProfessionalTax(data: {
    HRMPT_Id: number;
    HRMPT_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterProfessionalTaxFacade/deactivateRecordById';
    const requestBody = {
        HRMPT_Id: data.HRMPT_Id,
        MI_Id: 30,
        HRMPT_SalaryFrom: 0,
        HRMPT_SalaryTo: 0,
        HRMPT_PTax: 0,
        HRMPT_ActiveFlag: data.HRMPT_ActiveFlag,
        pTaxrList: [],
        retrunMsg: 'string',
        roleId: 0,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    return await api.post<MasterProfessionalTaxResponse>('hrms', url, requestBody);
}
