'use server';
import { api, type ApiResponse } from '@/lib/apiService';
import type {
    SalarySlipFilterRequest,
    SalarySlipFilterResponse,
    SalarySlipGenerateRequest,
    SalarySlipGenerateResponse,
    SalarySlipOnloadRequest,
    SalarySlipOnloadResponse,
    SalarySlipResponse
} from '@/types/hrms/reports/salary-slip-report';
/**
 * Get onload details for salary slip report
 * POST /api/EmployeeSalarySlipGenerationFacade/GetAllDropdownAndDatatableDetailsNew
 * Request: { MI_Id: number, LogInUserId: number }
 */
export async function getSalarySlipOnload(
    MI_Id = 30,
    LogInUserId = 0
): Promise<ApiResponse<SalarySlipResponse>> {
    const requestBody: SalarySlipOnloadRequest = {
        MI_Id,
        LogInUserId
    };
    const response = await api.post<SalarySlipResponse>(
        'hrms',
        '/api/EmployeeSalarySlipGenerationFacade/GetAllDropdownAndDatatableDetailsNew',
        requestBody
    );
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<SalarySlipResponse>;
    }
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as SalarySlipResponse
    };
}
/**
 * Filter employees by year and month
 * POST /api/EmployeeSalarySlipGenerationFacade/GetEmployeeDetailsByLeaveYearAndMonthNew
 * Request: { MI_Id: number, LogInUserId: number, HRES_Year: string, HRES_Month: string }
 * Response: Returns employees in employeedropdown field
 */
export async function filterEmployeesByYearMonth(
    requestBody: SalarySlipFilterRequest
): Promise<ApiResponse<SalarySlipResponse>> {
    const response = await api.post<SalarySlipResponse>(
        'hrms',
        '/api/EmployeeSalarySlipGenerationFacade/GetEmployeeDetailsByLeaveYearAndMonthNew',
        requestBody
    );
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<SalarySlipResponse>;
    }
    // Wrap raw response data
    const rawResponse = response as unknown as SalarySlipResponse;
    return {
        success: true,
        message: rawResponse?.retrunMsg || 'Filter completed successfully',
        data: rawResponse
    };
}
/**
 * Generate employee salary slip
 * POST /api/EmployeeSalarySlipGenerationFacade/GenerateEmployeeSalarySlipNew
 * Request: { MI_Id: number, HRES_Year: string, HRES_Month: string, empid: number[], hrmdeS_IdList: number[], hrmD_IdList: number[], groupTypeIdList: number[] }
 * Note: Arrays should be empty [] when no values are selected, not [0]
 */
export async function generateSalarySlip(
    requestBody: SalarySlipGenerateRequest
): Promise<ApiResponse<SalarySlipResponse>> {
    const response = await api.post<SalarySlipResponse>(
        'hrms',
        '/api/EmployeeSalarySlipGenerationFacade/GenerateEmployeeSalarySlipNew',
        requestBody
    );
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<SalarySlipResponse>;
    }
    // Wrap raw response data
    const rawResponse = response as unknown as SalarySlipResponse;
    return {
        success: true,
        message: rawResponse?.retrunMsg || 'Salary slip generated successfully',
        data: rawResponse
    };
}
