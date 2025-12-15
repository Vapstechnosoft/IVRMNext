'use server';

import { api, getSearchParamsUrl, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { SalaryAdvanceOnloadResponse, SalaryAdvanceSaveRequest } from '@/types/hrms/salary-advance';
import type { IEmployeeDropdown, IModeOfPaymentDropdown, IMonthDropdown, IYearDropdown } from '@/types/hrms/hrms-config/employee';

// Dropdown APIs - following salary-approval pattern
/**
 * Get Employee List for dropdowns
 * GET /api/MasterDropDown/GetEmployees
 * Returns: ApiResponse with array of { key: number, value: string }
 */
export async function getEmployeeDropdown(): Promise<ApiResponse<IEmployeeDropdown[]>> {
    const url = '/api/MasterDropDown/GetEmployees';
    return await api.get<IEmployeeDropdown[]>('hrms', url);
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

/**
 * Get Mode Of Payment List for dropdowns
 * GET /api/MasterDropDown/GetPaymentModeList
 * Returns: ApiResponse with array of { key: string, value: string }
 */
export async function getModeOfPaymentDropdown(): Promise<ApiResponse<IModeOfPaymentDropdown[]>> {
    const url = '/api/MasterDropDown/GetPaymentModeList';
    return await api.get<IModeOfPaymentDropdown[]>('hrms', url);
}

/**
 * Get salary advance list with searchParams
 * POST /api/HREmpSalaryAdvanceFacade/onloadgetdetails
 */
export async function getSalaryAdvanceList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'EmployeeName,HRME_EmployeeCode');
    const url = `/api/HREmpSalaryAdvanceFacade/onloadgetdetails?${urlParams}`;
    return await api.post<SalaryAdvanceOnloadResponse>('hrms', url, {});
}

/**
 * Save/Update salary advance
 * POST /api/HREmpSalaryAdvanceFacade
 */
export async function saveSalaryAdvance(data: SalaryAdvanceSaveRequest) {
    const url = '/api/HREmpSalaryAdvanceFacade';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<SalaryAdvanceOnloadResponse>('hrms', url, restData);
}

/**
 * Get salary advance record by ID
 * GET /api/HREmpSalaryAdvanceFacade/getRecordById/{id}
 */
export async function getSalaryAdvanceById(id: number) {
    const url = `/api/HREmpSalaryAdvanceFacade/getRecordById/${id}`;
    return await api.get<SalaryAdvanceOnloadResponse>('hrms', url);
}

/**
 * Get salary advance details by employee ID
 * POST /api/HREmpSalaryAdvanceFacade/getDetailsByEmployee
 */
export async function getSalaryAdvanceDetailsByEmployee(employeeId: number) {
    const url = '/api/HREmpSalaryAdvanceFacade/getDetailsByEmployee';
    return await api.post<SalaryAdvanceOnloadResponse>('hrms', url, { HRME_Id: employeeId });
}

/**
 * Search salary advance by filter
 * POST /api/HREmpSalaryAdvanceFacade/searchSalaryAdvanceFilter
 */
export async function searchSalaryAdvanceFilter(searchFilter: string) {
    const url = '/api/HREmpSalaryAdvanceFacade/searchSalaryAdvanceFilter';
    return await api.post<SalaryAdvanceOnloadResponse>('hrms', url, { searchfilter: searchFilter });
}

/**
 * Delete salary advance
 * DELETE /api/HREmpSalaryAdvanceFacade/{id}
 */
export async function deleteSalaryAdvance(id: number) {
    const url = `/api/HREmpSalaryAdvanceFacade/${id}`;
    return await api.delete<any>('hrms', url);
}

/**
 * Toggle salary advance status
 * PUT /api/HREmpSalaryAdvanceFacade/toggle/{id}?activeFlag={activeFlag}
 */
export async function toggleSalaryAdvanceStatus(id: number, activeFlag: boolean) {
    const url = `/api/HREmpSalaryAdvanceFacade/toggle/${id}`;
    return await api.put<any>('hrms', url, undefined, {
        params: { activeFlag }
    });
}
