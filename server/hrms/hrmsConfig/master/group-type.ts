'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { GroupTypeDetail, MasterGroupTypeInput, MasterGroupTypeResponse } from '@/types/hrms/master-group-type';

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
 * Get all master group type records with search, sort, and pagination
 * POST /api/MasterGroupTypeFacade/onloadgetdetails
 */
export async function getMasterGroupTypeList(roleId = 0, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterGroupTypeFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMGT_EmployeeGroupType,HRMGT_Code';
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
        HRMGT_Id: 0,
        MI_Id: 30,
        HRMGT_EmployeeGroupType: 'string',
        HRMGT_Code: 'string',
        HRMGT_Order: 0,
        HRMGT_ActiveFlag: true,
        grouptypeList: [],
        retrunMsg: 'string',
        roleId: roleId,
        GroupTypeDTO: []
    };
    
    try {
        const response = await api.post<MasterGroupTypeResponse>('hrms', url, requestBody);
        
        // Extract data from response - support both new structure (data) and old structure (grouptypeList)
        const grouptypeList = Array.isArray(response?.data) 
            ? response.data 
            : (response as any)?.grouptypeList || (response as any)?.data?.grouptypeList || [];
        
        const total = response?.total ?? (Array.isArray(grouptypeList) ? grouptypeList.length : 0);
        
        // Transform response to match expected structure
        const transformedResponse = {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: grouptypeList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterGroupTypeResponse;
        
        return transformedResponse;
    } catch (error: any) {
        console.error('🔴 [ERROR] getMasterGroupTypeList - Error Details:', error);
        throw error;
    }
}

/**
 * Create or Update a master group type record
 * POST /api/MasterGroupTypeFacade
 */
export async function saveMasterGroupType(data: MasterGroupTypeInput) {
    const isEdit = data.HRMGT_Id && data.HRMGT_Id > 0;
    const url = '/api/MasterGroupTypeFacade';
    
    console.log('🟠 [API] saveMasterGroupType called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const now = new Date().toISOString();
    const requestBody = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMGT_Id: data.HRMGT_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMGT_EmployeeGroupType: data.HRMGT_EmployeeGroupType,
        HRMGT_Code: data.HRMGT_Code,
        HRMGT_Order: data.HRMGT_Order ?? 0,
        HRMGT_ActiveFlag: data.HRMGT_ActiveFlag,
        grouptypeList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMGT_Id: data.HRMGT_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMGT_EmployeeGroupType: data.HRMGT_EmployeeGroupType,
                HRMGT_Code: data.HRMGT_Code,
                HRMGT_Order: data.HRMGT_Order ?? 0,
                HRMGT_ActiveFlag: data.HRMGT_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        GroupTypeDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterGroupTypeResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMGT_Id:', (response as any)?.HRMGT_Id);
        console.log('🟢 [API] Response.HRMGT_Order (returned):', (response as any)?.HRMGT_Order);
        console.log('🟢 [API] Response.grouptypeList:', (response as any)?.grouptypeList);
        
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMGT_Id || 0;
        const hasGroupTypeList = !!(responseData?.grouptypeList?.length > 0);
        
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isAllDuplicate = retrunMsg === 'AllDuplicate';
        const isSuccess = (savedId > 0 || isUpdateSuccess || hasGroupTypeList) && !isDuplicateError;
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasGroupTypeList:', hasGroupTypeList);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError, 'isAllDuplicate:', isAllDuplicate);
        
        // Special case: AllDuplicate means backend didn't save because it thinks nothing changed
        if (isAllDuplicate && isEdit) {
            console.log('⚠️ [API] Backend returned AllDuplicate for edit - order change not persisted!');
        }
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Group type already exists'
                : isSuccess 
                    ? (isEdit ? 'Group type updated successfully' : 'Group type added successfully')
                    : (retrunMsg || 'Failed to save group type'),
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
        throw error;
    }
}

/**
 * Activate/Deactivate a master group type record
 * POST /api/MasterGroupTypeFacade/deactivateRecordById
 */
export async function activateDeactivateMasterGroupType(data: {
    HRMGT_Id: number;
    HRMGT_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterGroupTypeFacade/deactivateRecordById';
    
    console.log('🟠 [API] activateDeactivateMasterGroupType called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Action:', data.HRMGT_ActiveFlag ? 'Activate' : 'Deactivate');
    
    const now = new Date().toISOString();
    const requestBody = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMGT_Id: data.HRMGT_Id,
        MI_Id: data.MI_Id || 30,
        HRMGT_EmployeeGroupType: 'string',
        HRMGT_Code: 'string',
        HRMGT_Order: 0,
        HRMGT_ActiveFlag: data.HRMGT_ActiveFlag,
        grouptypeList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMGT_Id: 0,
                MI_Id: 0,
                HRMGT_EmployeeGroupType: 'string',
                HRMGT_Code: 'string',
                HRMGT_Order: 0,
                HRMGT_ActiveFlag: true
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        GroupTypeDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterGroupTypeResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Toggle response:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMGT_ActiveFlag:', (response as any)?.HRMGT_ActiveFlag);
        console.log('🟢 [API] Response.grouptypeList:', (response as any)?.grouptypeList);
        
        // Check if there's a message indicating the record is in use
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const isInUse = retrunMsg.includes('in use') || retrunMsg.includes('cannot') || retrunMsg.includes('assigned');
        
        if (isInUse) {
            console.log('⚠️ [API] Record is in use - cannot deactivate');
        }
        
        return response;
    } catch (error: any) {
        console.log('🔴 [API] Toggle error:', error);
        throw error;
    }
}

/**
 * Get details of a specific master group type by ID
 * GET /api/MasterGroupTypeFacade/getRecordById/{id}
 */
export async function getMasterGroupTypeDetails(id: number) {
    const url = `/api/MasterGroupTypeFacade/getRecordById/${id}`;
    return await api.get<MasterGroupTypeResponse>('hrms', url);
}

export async function saveMasterGroupTypeOrder(groupTypes: GroupTypeDetail[]) {
    console.log('🟠 [API] saveMasterGroupTypeOrder called');
    console.log('🟠 [API] Number of group types to update:', groupTypes.length);
    
    const url = '/api/MasterGroupTypeFacade';
    const now = new Date().toISOString();
    
    // Use grouptypeList array (same as save endpoint)
    const requestBody = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMGT_Id: 0,
        MI_Id: 30,
        HRMGT_EmployeeGroupType: 'string',
        HRMGT_Code: 'string',
        HRMGT_Order: 0,
        HRMGT_ActiveFlag: true,
        grouptypeList: groupTypes.map((gt) => ({
            CreatedDate: gt.CreatedDate || now,
            UpdatedDate: now,
            HRMGT_Id: gt.HRMGT_Id,
            MI_Id: gt.MI_Id || 30,
            HRMGT_EmployeeGroupType: gt.HRMGT_EmployeeGroupType,
            HRMGT_Code: gt.HRMGT_Code,
            HRMGT_Order: gt.HRMGT_Order ?? 0,
            HRMGT_ActiveFlag: gt.HRMGT_ActiveFlag
        })),
        retrunMsg: 'string',
        roleId: 30,
        GroupTypeDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] grouptypeList count:', requestBody.grouptypeList.length);
    
    try {
        const response = await api.post<MasterGroupTypeResponse>('hrms', url, requestBody);
        console.log('🟢 [API] saveMasterGroupTypeOrder success');
        return response;
    } catch (error: any) {
        console.log('🔴 [API] saveMasterGroupTypeOrder error:', error);
        throw error;
    }
}
