'use server';

import { api, getSearchParamsUrl, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    SalaryIncrementDeleteResponse,
    SalaryIncrementOnloadResponse,
    SalaryIncrementSaveRequest,
    SalaryIncrementSaveResponse
} from '@/types/hrms/salary-increment';
import type { IEmployeeDropdown } from '@/types/hrms/hrms-config/employee';
import type { IEarningsDeductionsTypeDropdown } from '@/types/hrms/hrms-config/master';

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
 * Get Earnings Deductions Type List for dropdowns (Head dropdown)
 * GET /api/MasterDropDown/GetEarningsDeductionsType
 * Returns: ApiResponse with array of { key: number, value: string }
 */
export async function getEarningsDeductionsTypeDropdown(): Promise<ApiResponse<IEarningsDeductionsTypeDropdown[]>> {
    const url = '/api/MasterDropDown/GetEarningsDeductionsType';
    return await api.get<IEarningsDeductionsTypeDropdown[]>('hrms', url);
}

/**
 * Get salary increment list with searchParams
 * POST /api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails
 */
export async function getSalaryIncrementList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'EmployeeName,HRMD_DepartmentName');
    const url = `/api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails?${urlParams}`;
    return await api.post<SalaryIncrementOnloadResponse>('hrms', url, {});
}

export async function saveSalaryIncrement(data: SalaryIncrementSaveRequest) {
    const url = '/api/EmployeeSalaryIncreementProcessFacade';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<SalaryIncrementSaveResponse>('hrms', url, restData);
}

/**
 * Deactivate salary increment record by ID
 * POST /api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById?id={id}
 */
export async function deleteSalaryIncrement(id: number) {
    const url = '/api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById';
    return await api.post<SalaryIncrementDeleteResponse>('hrms', url, undefined, {
        params: { id }
    });
}
