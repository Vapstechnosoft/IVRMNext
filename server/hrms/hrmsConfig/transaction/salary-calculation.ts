'use server';
import { api } from '@/lib/apiService';
import type {
    NewSalaryCalculationGenerateRequest,
    NewSalaryCalculationSearchRequest,
    SalaryCalculationGenerateRequest,
    SalaryCalculationGenerateResponse,
    SalaryCalculationOnloadRequest,
    SalaryCalculationOnloadResponse,
    SalaryCalculationSearchRequest,
    SelectionEmployee
} from '@/types/hrms/salary-calculation';
/**
 * Get onload details for salary calculation (dropdowns, config, etc.)
 * POST /api/employeeSalaryCalculationFacade/onloadgetdetailsNew
 */
export async function getSalaryCalculationOnload(payload: SalaryCalculationOnloadRequest) {
    const url = '/api/employeeSalaryCalculationFacade/onloadgetdetailsNew';
    // Prepare request body
    const requestBody = {
        MI_Id: payload.MI_Id || 30,
        LogInUserId: payload.LogInUserId || 0
    };
    try {
        const response = await api.post<SalaryCalculationOnloadResponse>('hrms', url, requestBody);
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            return response;
        }
        // Wrap raw response data
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: response as unknown as SalaryCalculationOnloadResponse
        };
        return wrappedResponse;
    } catch (error) {
        console.error('💥 [SALARY CALCULATION - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
/**
 * Save salary calculation
 * POST /api/SalaryCalculation/
 */
export async function saveSalaryCalculation(data: any) {
    const url = '/api/SalaryCalculation/';
    return await api.post<SalaryCalculationOnloadResponse>('hrms', url, data);
}
/**
 * Search salary calculation by selection criteria
 * POST /api/employeeSalaryCalculationFacade/getEmployeedetailsBySelectionNew
 */
export async function searchSalaryCalculationBySelection(payload: SalaryCalculationSearchRequest) {
    const url = '/api/employeeSalaryCalculationFacade/getEmployeedetailsBySelectionNew';
    // Prepare request body - ensure arrays are [0] when empty, as API expects
    // Use empty strings for Year and Month when not provided
    const trimmedYear = payload.HRES_Year ? payload.HRES_Year.trim() : '';
    const trimmedMonth = payload.HRES_Month ? payload.HRES_Month.trim() : '';
    const requestBody = {
        MI_Id: payload.MI_Id || 30,
        LogInUserId: payload.LogInUserId || 0,
        hrmdeS_IdList: payload.hrmdeS_IdList && payload.hrmdeS_IdList.length > 0 ? payload.hrmdeS_IdList : [0],
        hrmD_IdList: payload.hrmD_IdList && payload.hrmD_IdList.length > 0 ? payload.hrmD_IdList : [0],
        hrmgT_IdList: payload.groupTypeIdList && payload.groupTypeIdList.length > 0 ? payload.groupTypeIdList : [0],
        HRES_Year: trimmedYear,
        HRES_Month: trimmedMonth
    };
    try {
        const response = await api.post<SalaryCalculationOnloadResponse>('hrms', url, requestBody);
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const _employeeCount = (response.data as any)?.ReportData?.length || (response.data as any)?.employeeDetails?.length || 0;
            return response;
        }
        // Wrap raw response data
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: response as unknown as SalaryCalculationOnloadResponse
        };
        const employeeCount =
            (wrappedResponse.data as any)?.ReportData?.length || (wrappedResponse.data as any)?.employeeDetails?.length || 0;
        if (employeeCount > 0) {
            const reportData = (wrappedResponse.data as any)?.ReportData || (wrappedResponse.data as any)?.employeeDetails;
            if (reportData && Array.isArray(reportData) && reportData.length > 0) {
            }
        }
        return wrappedResponse;
    } catch (error) {
        console.error('💥 [SALARY CALCULATION - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
/**
 * Generate salary for selected employees
 * POST /api/employeeSalaryCalculationFacade/calculateSelectedEmployeeSalaryNew
 */
export async function generateSalaryForSelectedEmployees(data: SalaryCalculationGenerateRequest) {
    const url = '/api/employeeSalaryCalculationFacade/calculateSelectedEmployeeSalaryNew';
    // Prepare request body with proper structure
    const requestBody = {
        MI_Id: data.MI_Id || 30,
        HRES_Year: data.HRES_Year || '',
        HRES_Month: data.HRES_Month || '',
        employeeIdList: data.employeeIdList && data.employeeIdList.length > 0 ? data.employeeIdList : [0],
        LogInUserId: data.LogInUserId || 0
    };
    const response = await api.post<SalaryCalculationGenerateResponse>('hrms', url, requestBody);
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    // Wrap raw response data
    return {
        success: true,
        message: 'Salary calculation completed',
        data: response as unknown as SalaryCalculationGenerateResponse
    };
}

/**
 * Search employees by selection criteria (New API)
 * POST /api/TransEmployeeSalaryCalculation/employee_details_by_selection
 */
export async function searchEmployeesBySelection(payload: NewSalaryCalculationSearchRequest) {
    const url = '/api/TransEmployeeSalaryCalculation/employee_details_by_selection';
    try {
        const response = await api.post<SelectionEmployee[]>('hrms', url, payload);
        // Ensure success: true is returned in the response
        if (response && typeof response === 'object' && 'success' in response) {
            return response;
        }
        return {
            success: true,
            data: response as unknown as SelectionEmployee[],
            message: 'Employee details fetched successfully'
        };
    } catch (error) {
        console.error('Error searching employees:', error);
        throw error;
    }
}

/**
 * Calculate selected employee salary (New API)
 * POST /api/TransEmployeeSalaryCalculation/calculate_selected_employee_salary
 */
export async function calculateEmployeeSalary(payload: NewSalaryCalculationGenerateRequest) {
    const url = '/api/TransEmployeeSalaryCalculation/calculate_selected_employee_salary';
    try {
        const response = await api.post<any>('hrms', url, payload);
        if (response && typeof response === 'object' && 'success' in response) {
            return response;
        }
        return {
            success: true,
            data: response,
            message: 'Salary calculated successfully'
        };
    } catch (error) {
        console.error('Error calculating salary:', error);
        throw error;
    }
}
