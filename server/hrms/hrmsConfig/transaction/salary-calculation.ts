'use server';

import { api, getSearchParamsUrl, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { SalaryCalculationGenerateRequest, SalaryCalculationGenerateResponse } from '@/types/hrms/salary-calculation';
import type { IGroupTypeDropdown, IDepartmentDropdown, IDesignationDropdown } from '@/types/hrms/hrms-config/employee';

// Dropdown APIs - following salary-approval pattern
/**
 * Get Group Type List for dropdowns
 * GET /api/MasterDropDown/GroupType
 * Returns: ApiResponse with array of { key: number, value: string }
 */
export async function getGroupTypeDropdown(): Promise<ApiResponse<IGroupTypeDropdown[]>> {
    const url = '/api/MasterDropDown/GroupType';
    return await api.get<IGroupTypeDropdown[]>('hrms', url);
}

/**
 * Get Department List for dropdowns based on selected Group Type IDs
 * GET /api/MasterDropDown/get_departments?GroupTypeIds=33&GroupTypeIds=44
 * Returns: ApiResponse with array of { key: number, value: string }
 * @param groupTypeIds - Array of Group Type IDs to filter departments
 */
export async function getDepartmentDropdown(groupTypeIds?: number[]): Promise<ApiResponse<IDepartmentDropdown[]>> {
    let url = '/api/MasterDropDown/get_departments';
    if (groupTypeIds && groupTypeIds.length > 0) {
        // Build query string with multiple GroupTypeIds parameters
        const queryParams = groupTypeIds.map((id) => `GroupTypeIds=${id}`).join('&');
        url = `${url}?${queryParams}`;
    }
    return await api.get<IDepartmentDropdown[]>('hrms', url);
}

/**
 * Get Designation List for dropdowns based on selected Department IDs
 * GET /api/MasterDropDown/get_designation?DepartmentIds=33&DepartmentIds=44
 * Returns: ApiResponse with array of { key: number, value: string }
 * @param departmentIds - Array of Department IDs to filter designations
 */
export async function getDesignationDropdown(departmentIds?: number[]): Promise<ApiResponse<IDesignationDropdown[]>> {
    let url = '/api/MasterDropDown/get_designation';
    if (departmentIds && departmentIds.length > 0) {
        // Build query string with multiple DepartmentIds parameters
        const queryParams = departmentIds.map((id) => `DepartmentIds=${id}`).join('&');
        url = `${url}?${queryParams}`;
    }
    return await api.get<IDesignationDropdown[]>('hrms', url);
}

export async function getMonthDropdown() {
    const url = '/api/MasterDropDown/GetMonths';
    return await api.get<any[]>('hrms', url);
}

export async function getLeaveYearDropdown() {
    const url = '/api/MasterLeaveYearFacade/onloadgetdetails';
    return await api.get<any[]>('hrms', url);
}

// Search employees by selection (without year/month - those are for generate pay)
export async function getSalaryCalculationList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'HRME_EmployeeCode,HRME_EmployeeFirstName');
    const url = `/api/employeeSalaryCalculationFacade/getEmployeedetailsBySelectionNew?${urlParams}`;
    return await api.post<any[]>('hrms', url, {});
}

// Generate salary for selected employees
export async function generateSalaryForSelectedEmployees(data: SalaryCalculationGenerateRequest) {
    const url = '/api/employeeSalaryCalculationFacade/calculateSelectedEmployeeSalaryNew';
    return await api.post<SalaryCalculationGenerateResponse>('hrms', url, data);
}
