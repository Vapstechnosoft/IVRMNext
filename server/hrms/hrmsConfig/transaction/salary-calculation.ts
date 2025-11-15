'use server';

import { api } from '@/lib/apiService';
import type {
    SalaryCalculationGenerateRequest,
    SalaryCalculationGenerateResponse,
    SalaryCalculationOnloadRequest,
    SalaryCalculationOnloadResponse,
    SalaryCalculationSearchRequest
} from '@/types/hrms/salary-calculation';

/**
 * Get onload details for salary calculation (dropdowns, config, etc.)
 * POST /api/employeeSalaryCalculationFacade/onloadgetdetailsNew
 */
export async function getSalaryCalculationOnload(payload: SalaryCalculationOnloadRequest) {
    const url = '/api/employeeSalaryCalculationFacade/onloadgetdetailsNew';
    const response = await api.post<SalaryCalculationOnloadResponse>('hrms', url, payload);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as SalaryCalculationOnloadResponse
    };
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
    const requestBody = {
        MI_Id: payload.MI_Id || 30,
        LogInUserId: payload.LogInUserId || 0,
        hrmdeS_IdList: payload.hrmdeS_IdList && payload.hrmdeS_IdList.length > 0 ? payload.hrmdeS_IdList : [0],
        hrmD_IdList: payload.hrmD_IdList && payload.hrmD_IdList.length > 0 ? payload.hrmD_IdList : [0],
        hrmgT_IdList: payload.groupTypeIdList && payload.groupTypeIdList.length > 0 ? payload.groupTypeIdList : [0],
        HRES_Year: payload.HRES_Year || '',
        HRES_Month: payload.HRES_Month || ''
    };
    
    const response = await api.post<SalaryCalculationOnloadResponse>('hrms', url, requestBody);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as SalaryCalculationOnloadResponse
    };
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
