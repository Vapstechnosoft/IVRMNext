'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterEmployeeShiftMappingList } from '@/types/hrms/attendance-management/masters';

/**
 * Get Employee Shift Mapping list with search, sort, and pagination
 * GET /api/EmployeeShiftMappingFacade/getdata
 * Note: User mentioned /api/MasterHolidayFacade/delete but that seems incorrect.
 * Using /api/EmployeeShiftMappingFacade/getdata based on context.
 */
export async function getEmployeeShiftMapping(searchParams?: ApiSearchparams) {
    const searchableColumns = 'EmployeeName,ShiftName,DayType';
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/EmployeeShiftMappingFacade/getdata?${urlParams}`;
    return await api.get<IMasterEmployeeShiftMappingList[]>('hrmsfrontoffice', url);
}

/**
 * Save or Update Employee Shift Mapping record
 * POST /api/EmployeeShiftMappingFacade/SaveDetail
 */
export async function addOrUpdateEmployeeShiftMapping(data: any) {
    const url = '/api/EmployeeShiftMappingFacade/SaveDetail';
    return await api.post<any>('hrmsfrontoffice', url, data);
}

/**
 * Delete Employee Shift Mapping record
 * DELETE /api/EmployeeShiftMappingFacade/deletedetails/{id}
 */
export async function deleteEmployeeShiftMapping(id: number) {
    const url = `/api/EmployeeShiftMappingFacade/deletedetails/${id}`;
    return await api.delete<IMasterEmployeeShiftMappingList>('hrmsfrontoffice', url);
}

// Helper function: Get dropdown data
export async function getEmployeeShiftMappingDropdowns(data?: any) {
    const url = '/api/EmployeeShiftMappingFacade/getdetails';
    return await api.post<any>('hrmsfrontoffice', url, data || {});
}

// Helper function: Get shift names
export async function getEmployeeShiftMappingShiftNames(data?: any) {
    const url = '/api/EmployeeShiftMappingFacade/Shiftname';
    return await api.post<any>('hrmsfrontoffice', url, data || {});
}

// Helper function: Get employees
export async function getEmployeeShiftMappingEmployees(data?: any) {
    const url = '/api/EmployeeShiftMappingFacade/get_employee';
    return await api.post<any>('hrmsfrontoffice', url, data || {});
}
