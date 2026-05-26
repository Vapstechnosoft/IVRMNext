'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import type {
    NewSalaryIncrementSaveRequest,
    NewSalaryIncrementSaveResponse,
    SalaryIncrementDeleteResponse,
    SalaryIncrementOnloadRequest,
    SalaryIncrementOnloadResponse,
    SalaryIncrementSaveRequest,
    SalaryIncrementSaveResponse
} from '@/types/hrms/salary-increment';
/**
 * Get salary increment onload details
 * POST /api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails
 */
export async function getSalaryIncrementOnload(
    payload: SalaryIncrementOnloadRequest
): Promise<ApiResponse<SalaryIncrementOnloadResponse> & { total?: number | null; page?: number | null; page_size?: number | null }> {
    const url = '/api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails';
    // Prepare request body - support both new and legacy formats
    const requestBody = {
        page: payload.page ?? 1,
        page_size: payload.page_size ?? 10,
        search_query: payload.search_query ?? '',
        search_column: payload.search_column ?? '',
        sort_column: payload.sort_column ?? '',
        sort_direction: payload.sort_direction ?? '',
        is_export: payload.is_export ?? false,
        MIID: payload.MIID ?? payload.MI_Id ?? 30,
        LoginUserId: payload.LoginUserId ?? payload.roleId ?? 0,
        UserRole: payload.UserRole ?? ''
    };
    try {
        const response = await api.post<{
            success: boolean;
            message?: string;
            data?: SalaryIncrementOnloadResponse;
            total?: number | null;
            page?: number | null;
            page_size?: number | null;
        }>('hrms', url, requestBody);
        // The backend returns data wrapped in ApiResponse format
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as any;
            // Map monthlydata to leaveyeardropdown if monthlydata exists
            if (responseData?.monthlydata && !responseData?.leaveyeardropdown) {
                responseData.leaveyeardropdown = responseData.monthlydata.map((item: any) => ({
                    HRMLY_Id: item.HRMLY_Id,
                    HRMLY_LeaveYear: item.HRMLY_LeaveYear,
                    HRMLY_FromDate: item.HRMLY_FromDate,
                    HRMLY_ToDate: item.HRMLY_ToDate
                }));
            }
            const mappedData = responseData as SalaryIncrementOnloadResponse;
            return {
                ...response,
                data: mappedData
            } as ApiResponse<SalaryIncrementOnloadResponse> & { total?: number | null; page?: number | null; page_size?: number | null };
        }
        // Wrap raw response data (fallback for unexpected format)
        const rawData = response as any;
        // Map monthlydata to leaveyeardropdown if monthlydata exists
        if (rawData?.monthlydata && !rawData?.leaveyeardropdown) {
            rawData.leaveyeardropdown = rawData.monthlydata.map((item: any) => ({
                HRMLY_Id: item.HRMLY_Id,
                HRMLY_LeaveYear: item.HRMLY_LeaveYear,
                HRMLY_FromDate: item.HRMLY_FromDate,
                HRMLY_ToDate: item.HRMLY_ToDate
            }));
        }
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: rawData as SalaryIncrementOnloadResponse,
            total: undefined,
            page: undefined,
            page_size: undefined
        };
        return wrappedResponse as unknown as ApiResponse<SalaryIncrementOnloadResponse> & {
            total?: number | null;
            page?: number | null;
            page_size?: number | null;
        };
    } catch (error) {
        console.error('💥 [SALARY INCREMENT - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
export async function saveSalaryIncrement(payload: SalaryIncrementSaveRequest) {
    const url = '/api/EmployeeSalaryIncreementProcessFacade';
    return await api.post<SalaryIncrementSaveResponse>('hrms', url, payload);
}
/**
 * Deactivate salary increment record by ID
 * POST /api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById?id={id}
 */
export async function deleteSalaryIncrement(id: number): Promise<ApiResponse<SalaryIncrementDeleteResponse>> {
    const url = '/api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById';
    try {
        const response = await api.post<SalaryIncrementDeleteResponse>('hrms', url, undefined, {
            params: { id }
        });
        return response;
    } catch (error) {
        console.error('💥 [SALARY INCREMENT - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
/**
 * Get employee increment grid details
 * GET /api/TransEmployeeSalaryIncreementProcess/get_employee_increment_grid
 */
export async function getEmployeeIncrementGrid(): Promise<ApiResponse<any[]>> {
    const url = '/api/TransEmployeeSalaryIncreementProcess/get_employee_increment_grid';
    try {
        const response = await api.get<any[]>('hrms', url);
        return response;
    } catch (error) {
        console.error('Error fetching increment grid:', error);
        throw error;
    }
}

/**
 * Delete employee increment record
 * POST /api/TransEmployeeSalaryIncreementProcess/delete_master_holiday/{id}
 */
export async function deleteEmployeeIncrementMaster(id: number): Promise<ApiResponse<any>> {
    const url = `/api/TransEmployeeSalaryIncreementProcess/delete_master_holiday/${id}`;
    try {
        const response = await api.delete<any>('hrms', url);
        return response;
    } catch (error) {
        console.error('Error deleting increment:', error);
        throw error;
    }
}

/**
 * Add or update employee salary increment (Bulk)
 * POST /api/TransEmployeeSalaryIncreementProcess/add_or_update_employee_salary_increment
 */
export async function addOrUpdateEmployeeSalaryIncrement(
    payload: NewSalaryIncrementSaveRequest
): Promise<ApiResponse<NewSalaryIncrementSaveResponse>> {
    const url = '/api/TransEmployeeSalaryIncreementProcess/add_or_update_employee_salary_increment';
    try {
        const response = await api.post<NewSalaryIncrementSaveResponse>('hrms', url, payload);
        return response as any;
    } catch (error) {
        console.error('Error in addOrUpdateEmployeeSalaryIncrement:', error);
        throw error;
    }
}
