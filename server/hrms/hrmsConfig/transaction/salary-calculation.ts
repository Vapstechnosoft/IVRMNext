'use server';

import { api } from '@/lib/apiService';
import type {
    SalaryCalculationGenerateRequest,
    SalaryCalculationGenerateResponse,
    SalaryCalculationOnloadRequest,
    SalaryCalculationOnloadResponse
} from '@/types/hrms/salary-calculation';

/**
 * Get onload details for salary calculation (dropdowns, config, etc.)
 * POST /api/employeeSalaryCalculationFacade/onloadgetdetailsNew
 */
export async function getSalaryCalculationOnload(payload: SalaryCalculationOnloadRequest) {
    const url = '/api/employeeSalaryCalculationFacade/onloadgetdetailsNew';
    return await api.post<SalaryCalculationOnloadResponse>('hrms', url, payload);
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
export async function searchSalaryCalculationBySelection(payload: any) {
    const url = '/api/employeeSalaryCalculationFacade/getEmployeedetailsBySelectionNew';
    return await api.post<SalaryCalculationOnloadResponse>('hrms', url, payload);
}

/**
 * Generate salary for selected employees
 * POST /api/employeeSalaryCalculationFacade/calculateSelectedEmployeeSalaryNew
 */
export async function generateSalaryForSelectedEmployees(data: SalaryCalculationGenerateRequest) {
    const url = '/api/employeeSalaryCalculationFacade/calculateSelectedEmployeeSalaryNew';
    return await api.post<SalaryCalculationGenerateResponse>('hrms', url, data);
}
