'use server';

import { api, getSearchParamsUrl, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { EmployeeDetail } from '@/types/hrms/hrms-config/transaction';
import type { IGroupTypeDropdown, IDepartmentDropdown, IDesignationDropdown, IMonthDropdown, IYearDropdown } from '@/types/hrms/hrms-config/employee';

// Dropdown APIs - following preadmission pattern
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

/**
 * Get Month List for dropdowns
 * GET /api/MasterDropDown/GetMonths
 * Returns: ApiResponse with array of { key: number, value: string }
 */
export async function getMonthDropdown(): Promise<ApiResponse<IMonthDropdown[]>> {
    const url = '/api/MasterDropDown/GetMonths';
    return await api.get<IMonthDropdown[]>('hrms', url);
}

/**
 * Get Year List for dropdowns
 * GET /api/MasterDropDown/GetYear
 * Returns: ApiResponse with array of { key: string, value: string }
 */
export async function getYearDropdown(): Promise<ApiResponse<IYearDropdown[]>> {
    const url = '/api/MasterDropDown/GetYear';
    return await api.get<IYearDropdown[]>('hrms', url);
}

// Main list API
export async function getSalaryApprovalList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'HRME_EmployeeCode,HRME_EmployeeFirstName');
    const url = `/api/HRMS_Trans_SalaryApprovalProcess/getEmployeedetailsBySelection?${urlParams}`;
    return await api.post<EmployeeDetail[]>('hrms', url, {});
}

