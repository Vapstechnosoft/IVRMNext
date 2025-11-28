'use server';

import { api } from '@/lib/apiService';
import type {
    ApiResponse,
    SalaryUpdationDepartmentRequest,
    SalaryUpdationDepartmentResponse,
    SalaryUpdationDesignationRequest,
    SalaryUpdationDesignationResponse,
    SalaryUpdationEmployeeDetailsRequest,
    SalaryUpdationEmployeeDetailsResponse,
    SalaryUpdationFilterRequest,
    SalaryUpdationOnloadRequest,
    SalaryUpdationOnloadResponse,
    SalaryUpdationSaveRequest,
    SalaryUpdationSaveResponse
} from '@/types/hrms/salary-updation';

export async function getSalaryUpdationOnload(
    payload: SalaryUpdationOnloadRequest
): Promise<ApiResponse<SalaryUpdationOnloadResponse> & { total?: number | null; page?: number | null; page_size?: number | null }> {
    console.log('🔵 [SALARY UPDATION - BACKEND] getSalaryUpdationOnload - START');
    console.log('📥 [SALARY UPDATION - BACKEND] Request payload:', JSON.stringify(payload, null, 2));
    
    const url = '/api/salaryUpdationFacade/onloadgetdetails';
    console.log('🌐 [SALARY UPDATION - BACKEND] API URL:', url);
    console.log('🌐 [SALARY UPDATION - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY UPDATION - BACKEND] Method: POST');
    
    // Prepare request body
    const requestBody = {
        page: payload.page ?? 1,
        page_size: payload.page_size ?? 10,
        search_query: payload.search_query ?? '',
        search_column: payload.search_column ?? '',
        sort_column: payload.sort_column ?? '',
        sort_direction: payload.sort_direction ?? '',
        is_export: payload.is_export ?? false,
        MIID: payload.MIID ?? 30,
        LoginUserId: payload.LoginUserId ?? 0,
        UserRole: payload.UserRole ?? ''
    };
    
    console.log('📤 [SALARY UPDATION - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY UPDATION - BACKEND] Request body summary:', {
        page: requestBody.page,
        page_size: requestBody.page_size,
        MIID: requestBody.MIID,
        LoginUserId: requestBody.LoginUserId,
        UserRole: requestBody.UserRole,
        hasSearchQuery: !!requestBody.search_query,
        searchQuery: requestBody.search_query
    });
    
    try {
        const response = await api.post<{ success: boolean; message?: string; data?: SalaryUpdationOnloadResponse; total?: number | null; page?: number | null; page_size?: number | null }>('hrms', url, requestBody);
        
        console.log('✅ [SALARY UPDATION - BACKEND] API Response received');
        console.log('📤 [SALARY UPDATION - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            hasTotal: 'total' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns data wrapped in ApiResponse format
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryUpdationOnloadResponse;
            console.log('✅ [SALARY UPDATION - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY UPDATION - BACKEND] Response data summary:', {
                hasMI_Id: !!responseData?.MI_Id,
                hasRoleId: !!responseData?.roleId,
                hasEmployeeDropdown: !!responseData?.employeedropdown,
                employeeCount: Array.isArray(responseData?.employeedropdown) ? responseData.employeedropdown.length : 0,
                hasDepartmentDropdown: !!responseData?.departmentdropdown,
                departmentCount: Array.isArray(responseData?.departmentdropdown) ? responseData.departmentdropdown.length : 0,
                hasDesignationDropdown: !!responseData?.designationdropdown,
                designationCount: Array.isArray(responseData?.designationdropdown) ? responseData.designationdropdown.length : 0,
                hasGroupTypeDropdown: !!responseData?.groupTypedropdown,
                groupTypeCount: Array.isArray(responseData?.groupTypedropdown) ? responseData.groupTypedropdown.length : 0,
                hasHeadDropdown: !!responseData?.headdropdown,
                headCount: Array.isArray(responseData?.headdropdown) ? responseData.headdropdown.length : 0,
                hasEarningDropdown: !!responseData?.earningdropdown,
                earningCount: Array.isArray(responseData?.earningdropdown) ? responseData.earningdropdown.length : 0,
                hasDeductionDropdown: !!responseData?.detectiondropdown,
                deductionCount: Array.isArray(responseData?.detectiondropdown) ? responseData.detectiondropdown.length : 0
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Data found',
                data: responseData,
                total: typeof response.total === 'number' ? response.total : undefined,
                page: typeof response.page === 'number' ? response.page : undefined,
                page_size: typeof response.page_size === 'number' ? response.page_size : undefined
            };
        } else {
            // Not wrapped, wrap it
            console.log('⚠️ [SALARY UPDATION - BACKEND] Response not wrapped, wrapping it');
            return {
                success: true,
                message: 'Data found',
                data: response as unknown as SalaryUpdationOnloadResponse,
                total: undefined,
                page: undefined,
                page_size: undefined
            };
        }
    } catch (error: any) {
        console.error('❌ [SALARY UPDATION - BACKEND] Error in getSalaryUpdationOnload:', error);
        console.error('❌ [SALARY UPDATION - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to fetch salary updation onload data',
            data: undefined,
            total: undefined,
            page: undefined,
            page_size: undefined
        };
    }
}

// Legacy function for backwards compatibility
export async function getSalaryUpdationList(roleId: number) {
    return await getSalaryUpdationOnload({
        page: 1,
        page_size: 10,
        search_query: '',
        search_column: '',
        sort_column: '',
        sort_direction: '',
        is_export: false,
        MIID: 30,
        LoginUserId: roleId,
        UserRole: ''
    });
}

export async function saveSalaryUpdation(data: SalaryUpdationSaveRequest) {
    const url = '/api/salaryUpdation/';
    return await api.post<SalaryUpdationSaveResponse>('hrms', url, data);
}

export async function deleteSalaryUpdation(data: { HRESU_Id: number; roleId: number }) {
    const url = `/api/salaryUpdation/${data.HRESU_Id}`;
    return await api.delete<any>('hrms', url);
}

/**
 * Filter employee data by selection criteria
 * POST /api/salaryUpdationFacade/FilterEmployeeData
 */
export async function filterSalaryUpdationEmployees(data: SalaryUpdationFilterRequest) {
    console.log('🔵 [SALARY UPDATION - BACKEND] filterSalaryUpdationEmployees - START');
    console.log('📥 [SALARY UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));
    
    const url = '/api/salaryUpdationFacade/FilterEmployeeData';
    console.log('🌐 [SALARY UPDATION - BACKEND] API URL:', url);
    console.log('🌐 [SALARY UPDATION - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY UPDATION - BACKEND] Method: POST');
    
    // Prepare request body with proper defaults - empty arrays for empty selections
    const requestBody = {
        MI_Id: data.MI_Id ?? 30,
        LogInUserId: data.LogInUserId ?? 0,
        designationselected: data.designationselected && data.designationselected.length > 0 ? data.designationselected : [],
        departmentselected: data.departmentselected && data.departmentselected.length > 0 ? data.departmentselected : [],
        groupTypeselected: data.groupTypeselected && data.groupTypeselected.length > 0 ? data.groupTypeselected : [],
        headselected: data.headselected && data.headselected.length > 0 ? data.headselected : []
    };
    
    console.log('📤 [SALARY UPDATION - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY UPDATION - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        LogInUserId: requestBody.LogInUserId,
        designationCount: requestBody.designationselected.length,
        departmentCount: requestBody.departmentselected.length,
        groupTypeCount: requestBody.groupTypeselected.length,
        headCount: requestBody.headselected.length
    });
    
    try {
        const response = await api.post<SalaryUpdationOnloadResponse>('hrms', url, requestBody);
        
        console.log('✅ [SALARY UPDATION - BACKEND] API Response received');
        console.log('📤 [SALARY UPDATION - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns data wrapped in ApiResponse format
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryUpdationOnloadResponse;
            console.log('✅ [SALARY UPDATION - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY UPDATION - BACKEND] Response data summary:', {
                hasMI_Id: !!responseData?.MI_Id,
                hasEmployeeDropdown: !!responseData?.employeedropdown,
                employeeCount: Array.isArray(responseData?.employeedropdown) ? responseData.employeedropdown.length : 0
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Data found',
                data: responseData
            };
        } else {
            // Not wrapped, wrap it
            console.log('⚠️ [SALARY UPDATION - BACKEND] Response not wrapped, wrapping it');
            return {
                success: true,
                message: 'Data found',
                data: response as unknown as SalaryUpdationOnloadResponse
            };
        }
    } catch (error: any) {
        console.error('❌ [SALARY UPDATION - BACKEND] Error in filterSalaryUpdationEmployees:', error);
        console.error('❌ [SALARY UPDATION - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to filter salary updation employees',
            data: undefined
        };
    }
}

/**
 * Get employee details by selection (earnings and deductions)
 * POST /api/salaryUpdationFacade/getEmployeedetailsBySelection
 */
export async function getSalaryUpdationEmployeeDetailsBySelection(data: SalaryUpdationEmployeeDetailsRequest) {
    console.log('🔵 [SALARY UPDATION - BACKEND] getSalaryUpdationEmployeeDetailsBySelection - START');
    console.log('📥 [SALARY UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));
    
    const url = '/api/salaryUpdationFacade/getEmployeedetailsBySelection';
    console.log('🌐 [SALARY UPDATION - BACKEND] API URL:', url);
    console.log('🌐 [SALARY UPDATION - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY UPDATION - BACKEND] Method: POST');
    
    // Prepare request body
    const requestBody = {
        earningresult: data.earningresult || [],
        deductionresult: data.deductionresult || [],
        LogInUserId: data.LogInUserId ?? 0
    };
    
    console.log('📤 [SALARY UPDATION - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY UPDATION - BACKEND] Request body summary:', {
        earningCount: requestBody.earningresult.length,
        deductionCount: requestBody.deductionresult.length,
        LogInUserId: requestBody.LogInUserId
    });
    
    try {
        const response = await api.post<SalaryUpdationEmployeeDetailsResponse>('hrms', url, requestBody);
        
        console.log('✅ [SALARY UPDATION - BACKEND] API Response received');
        console.log('📤 [SALARY UPDATION - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns data wrapped in ApiResponse format
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryUpdationEmployeeDetailsResponse;
            console.log('✅ [SALARY UPDATION - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY UPDATION - BACKEND] Response data summary:', {
                hasEmployeeDropdown: !!responseData?.employeedropdown,
                employeeCount: Array.isArray(responseData?.employeedropdown) ? responseData.employeedropdown.length : 0
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Data found',
                data: responseData
            };
        } else {
            // Not wrapped, wrap it
            console.log('⚠️ [SALARY UPDATION - BACKEND] Response not wrapped, wrapping it');
            return {
                success: true,
                message: 'Data found',
                data: response as unknown as SalaryUpdationEmployeeDetailsResponse
            };
        }
    } catch (error: any) {
        console.error('❌ [SALARY UPDATION - BACKEND] Error in getSalaryUpdationEmployeeDetailsBySelection:', error);
        console.error('❌ [SALARY UPDATION - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to get employee details by selection',
            data: undefined
        };
    }
}

/**
 * Get departments by group type selection
 * POST /api/salaryUpdationFacade/get_depts
 */
export async function getSalaryUpdationDepartments(data: SalaryUpdationDepartmentRequest) {
    console.log('🔵 [SALARY UPDATION - BACKEND] getSalaryUpdationDepartments - START');
    console.log('📥 [SALARY UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));
    
    const url = '/api/salaryUpdationFacade/get_depts';
    console.log('🌐 [SALARY UPDATION - BACKEND] API URL:', url);
    console.log('🌐 [SALARY UPDATION - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY UPDATION - BACKEND] Method: POST');
    
    // Prepare request body
    const requestBody = {
        MI_Id: data.MI_Id ?? 30,
        hrmgT_IdList: data.hrmgT_IdList && data.hrmgT_IdList.length > 0 ? data.hrmgT_IdList : []
    };
    
    console.log('📤 [SALARY UPDATION - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY UPDATION - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        groupTypeCount: requestBody.hrmgT_IdList.length
    });
    
    try {
        const response = await api.post<SalaryUpdationDepartmentResponse>('hrms', url, requestBody);
        
        console.log('✅ [SALARY UPDATION - BACKEND] API Response received');
        console.log('📤 [SALARY UPDATION - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns data wrapped in ApiResponse format
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryUpdationDepartmentResponse;
            console.log('✅ [SALARY UPDATION - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY UPDATION - BACKEND] Response data summary:', {
                hasDepartmentDropdown: !!responseData?.departmentdropdown,
                departmentCount: Array.isArray(responseData?.departmentdropdown) ? responseData.departmentdropdown.length : 0
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Data found',
                data: responseData
            };
        } else {
            // Not wrapped, wrap it
            console.log('⚠️ [SALARY UPDATION - BACKEND] Response not wrapped, wrapping it');
            return {
                success: true,
                message: 'Data found',
                data: response as unknown as SalaryUpdationDepartmentResponse
            };
        }
    } catch (error: any) {
        console.error('❌ [SALARY UPDATION - BACKEND] Error in getSalaryUpdationDepartments:', error);
        console.error('❌ [SALARY UPDATION - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to get departments',
            data: undefined
        };
    }
}

/**
 * Get designations by group type and department selection
 * POST /api/salaryUpdationFacade/get_desig
 */
export async function getSalaryUpdationDesignations(data: SalaryUpdationDesignationRequest) {
    console.log('🔵 [SALARY UPDATION - BACKEND] getSalaryUpdationDesignations - START');
    console.log('📥 [SALARY UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));
    
    const url = '/api/salaryUpdationFacade/get_desig';
    console.log('🌐 [SALARY UPDATION - BACKEND] API URL:', url);
    console.log('🌐 [SALARY UPDATION - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY UPDATION - BACKEND] Method: POST');
    
    // Prepare request body
    const requestBody = {
        MI_Id: data.MI_Id ?? 30,
        hrmgT_IdList: data.hrmgT_IdList && data.hrmgT_IdList.length > 0 ? data.hrmgT_IdList : [],
        hrmD_IdList: data.hrmD_IdList && data.hrmD_IdList.length > 0 ? data.hrmD_IdList : []
    };
    
    console.log('📤 [SALARY UPDATION - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY UPDATION - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        groupTypeCount: requestBody.hrmgT_IdList.length,
        departmentCount: requestBody.hrmD_IdList.length
    });
    
    try {
        const response = await api.post<SalaryUpdationDesignationResponse>('hrms', url, requestBody);
        
        console.log('✅ [SALARY UPDATION - BACKEND] API Response received');
        console.log('📤 [SALARY UPDATION - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns data wrapped in ApiResponse format
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryUpdationDesignationResponse;
            console.log('✅ [SALARY UPDATION - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY UPDATION - BACKEND] Response data summary:', {
                hasDesignationDropdown: !!responseData?.designationdropdown,
                designationCount: Array.isArray(responseData?.designationdropdown) ? responseData.designationdropdown.length : 0
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Data found',
                data: responseData
            };
        } else {
            // Not wrapped, wrap it
            console.log('⚠️ [SALARY UPDATION - BACKEND] Response not wrapped, wrapping it');
            return {
                success: true,
                message: 'Data found',
                data: response as unknown as SalaryUpdationDesignationResponse
            };
        }
    } catch (error: any) {
        console.error('❌ [SALARY UPDATION - BACKEND] Error in getSalaryUpdationDesignations:', error);
        console.error('❌ [SALARY UPDATION - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to get designations',
            data: undefined
        };
    }
}

export async function testSalaryUpdationAPI(roleId = 2) {
    return await getSalaryUpdationOnload({
        page: 1,
        page_size: 10,
        search_query: '',
        search_column: '',
        sort_column: '',
        sort_direction: '',
        is_export: false,
        MIID: 30,
        LoginUserId: roleId,
        UserRole: ''
    });
}
