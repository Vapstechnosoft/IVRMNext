'use server';

import { api } from '@/lib/apiService';
import type { EmployeeDetailResponse, EmployeeOnloadResponse, EmployeeSaveRequest, EmployeeSaveResponse } from '@/types/hrms/employee';

/**
 * Get onload details for employee register (dropdowns, etc.)
 * POST /api/EmployeeRegistrationNew/onloadgetdetails
 */
export async function getEmployeeOnload() {
    const url = '/api/EmployeeRegistrationNew/onloadgetdetails';
    const requestBody = {
        MI_Id: 30,
        LogInUserId: 5
    };
    return await api.post<EmployeeOnloadResponse>('hrms', url, requestBody);
}

/**
 * Save or update employee
 * POST /api/EmployeeRegistrationFacade
 */
export async function saveEmployee(data: EmployeeSaveRequest) {
    const url = '/api/EmployeeRegistrationFacade';
    return await api.post<EmployeeSaveResponse>('hrms', url, data);
}

/**
 * Get employee by ID
 * POST /api/EmployeeRegistrationNew/getEmployeedetailsBySelection
 */
export async function getEmployeeById(id: number) {
    const url = '/api/EmployeeRegistrationNew/getEmployeedetailsBySelection';
    const requestBody = {
        id: id
    };
    return await api.post<EmployeeDetailResponse>('hrms', url, requestBody);
}

/**
 * Delete/Deactivate employee
 * POST /api/EmployeeRegistrationNew/deleteEmployeedetails
 */
export async function deleteEmployee(id: number) {
    const url = '/api/EmployeeRegistrationNew/deleteEmployeedetails';
    const requestBody = {
        id: id
    };
    return await api.post<any>('hrms', url, requestBody);
}

