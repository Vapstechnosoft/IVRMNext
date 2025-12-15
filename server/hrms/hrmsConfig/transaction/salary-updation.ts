'use server';

import { api, getSearchParamsUrl, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    SalaryUpdationDepartmentRequest,
    SalaryUpdationDepartmentResponse,
    SalaryUpdationDesignationRequest,
    SalaryUpdationDesignationResponse,
    SalaryUpdationEmployeeDetailsRequest,
    SalaryUpdationEmployeeDetailsResponse,
    SalaryUpdationFilterRequest,
    SalaryUpdationOnloadResponse,
    SalaryUpdationSaveRequest,
    SalaryUpdationSaveResponse
} from '@/types/hrms/salary-updation';
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

/**
 * Get salary updation list with searchParams
 * POST /api/salaryUpdationFacade/onloadgetdetails
 */
export async function getSalaryUpdationList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'EmployeeName,HRMD_DepartmentName');
    const url = `/api/salaryUpdationFacade/onloadgetdetails?${urlParams}`;
    return await api.post<SalaryUpdationOnloadResponse>('hrms', url, {});
}

export async function saveSalaryUpdation(data: SalaryUpdationSaveRequest) {
    const url = '/api/salaryUpdation/';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<SalaryUpdationSaveResponse>('hrms', url, restData);
}

export async function deleteSalaryUpdation(id: number) {
    const url = `/api/salaryUpdation/${id}`;
    return await api.delete<any>('hrms', url);
}

/**
 * Filter employee data by selection criteria
 * POST /api/salaryUpdationFacade/FilterEmployeeData
 */
export async function filterSalaryUpdationEmployees(data: SalaryUpdationFilterRequest) {
    const url = '/api/salaryUpdationFacade/FilterEmployeeData';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<SalaryUpdationOnloadResponse>('hrms', url, restData);
}

/**
 * Get employee details by selection (earnings and deductions)
 * POST /api/salaryUpdationFacade/getEmployeedetailsBySelection
 */
export async function getSalaryUpdationEmployeeDetailsBySelection(data: SalaryUpdationEmployeeDetailsRequest) {
    const url = '/api/salaryUpdationFacade/getEmployeedetailsBySelection';
    return await api.post<SalaryUpdationEmployeeDetailsResponse>('hrms', url, data);
}

/**
 * Get departments by group type selection
 * POST /api/salaryUpdationFacade/get_depts
 */
export async function getSalaryUpdationDepartments(data: SalaryUpdationDepartmentRequest) {
    const url = '/api/salaryUpdationFacade/get_depts';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<SalaryUpdationDepartmentResponse>('hrms', url, restData);
}

/**
 * Get designations by group type and department selection
 * POST /api/salaryUpdationFacade/get_desig
 */
export async function getSalaryUpdationDesignations(data: SalaryUpdationDesignationRequest) {
    const url = '/api/salaryUpdationFacade/get_desig';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<SalaryUpdationDesignationResponse>('hrms', url, restData);
}
