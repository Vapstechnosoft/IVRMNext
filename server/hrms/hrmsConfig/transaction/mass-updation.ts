'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type { MassUpdationOnloadRequest, MassUpdationOnloadResponse, MassUpdationSaveRequest, MassUpdationSearchRequest } from '@/types/hrms/mass-updation';
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
 * Get onload details for mass updation
 * POST /api/massUpdationFacade/onloadgetdetails
 */
export async function getMassUpdationOnload(data: MassUpdationOnloadRequest) {
    const url = '/api/massUpdationFacade/onloadgetdetails';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<MassUpdationOnloadResponse>('hrms', url, restData);
}

/**
 * Save/Update mass updation (Facade)
 * POST /api/massUpdationFacade
 */
export async function saveMassUpdation(data: MassUpdationSaveRequest) {
    const url = '/api/massUpdationFacade';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<MassUpdationOnloadResponse>('hrms', url, restData);
}

/**
 * Search employees by selection criteria
 * POST /api/massUpdationFacade/FilterEmployeeData
 */
export async function searchMassUpdationEmployees(data: MassUpdationSearchRequest) {
    const url = '/api/massUpdationFacade/FilterEmployeeData';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<MassUpdationOnloadResponse>('hrms', url, restData);
}

/**
 * Get employee details by selection criteria (for save operation)
 * POST /api/massUpdationFacade/getEmployeedetailsBySelection
 */
export async function getEmployeeDetailsBySelection(data: MassUpdationSearchRequest) {
    const url = '/api/massUpdationFacade/getEmployeedetailsBySelection';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<MassUpdationOnloadResponse>('hrms', url, restData);
}
