'use server';

import { api, getSearchParamsUrl, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    EmployeeLoanOnloadResponse,
    EmployeeLoanSaveRequest,
    EmployeeLoanSaveResponse,
    EmployeeLoanDeleteRequest
} from '@/types/hrms/employee-loan';
import type { IEmployeeDropdown, IModeOfPaymentDropdown, ILoanTypeDropdown } from '@/types/hrms/hrms-config/employee';

// Dropdown APIs - following salary-advance pattern
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
 * Get Mode Of Payment List for dropdowns
 * GET /api/MasterDropDown/GetPaymentModeList
 * Returns: ApiResponse with array of { key: string, value: string }
 */
export async function getModeOfPaymentDropdown(): Promise<ApiResponse<IModeOfPaymentDropdown[]>> {
    const url = '/api/MasterDropDown/GetPaymentModeList';
    return await api.get<IModeOfPaymentDropdown[]>('hrms', url);
}

/**
 * Get Loan Type List for dropdowns
 * GET /api/MasterDropDown/GetLoanType
 * Returns: ApiResponse with array of { key: number, value: string }
 */
export async function getLoanTypeDropdown(): Promise<ApiResponse<ILoanTypeDropdown[]>> {
    const url = '/api/MasterDropDown/GetLoanType';
    return await api.get<ILoanTypeDropdown[]>('hrms', url);
}

/**
 * Get employee loan list with searchParams
 * POST /api/HREmpLoanFacade/onloadgetdetails
 */
export async function getEmployeeLoanList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'HRME_EmployeeFirstName,HRML_LoanType,HREL_LoanAmount');
    const url = `/api/HREmpLoanFacade/onloadgetdetails?${urlParams}`;
    return await api.post<EmployeeLoanOnloadResponse>('hrms', url, {});
}

/**
 * Save/Update employee loan (Facade)
 * POST /api/HREmpLoanFacade
 */
export async function saveEmployeeLoan(data: EmployeeLoanSaveRequest) {
    const url = '/api/HREmpLoanFacade';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<EmployeeLoanSaveResponse>('hrms', url, restData);
}

/**
 * Get employee loan by ID
 * GET /api/HREmpLoanFacade/getRecordById/{id}
 */
export async function getEmployeeLoanById(id: number) {
    const url = `/api/HREmpLoanFacade/getRecordById/${id}`;
    return await api.get<EmployeeLoanOnloadResponse>('hrms', url);
}

/**
 * Activate/Deactivate employee loan
 * POST /api/HREmpLoanFacade/deactivateRecordById
 */
export async function activateDeactivateEmployeeLoan(data: EmployeeLoanDeleteRequest) {
    const url = '/api/HREmpLoanFacade/deactivateRecordById';
    // Remove MI_Id - handled by JWT
    const { MI_Id, ...restData } = data;
    return await api.post<EmployeeLoanOnloadResponse>('hrms', url, restData);
}

/**
 * Get employee loan details by employee
 * POST /api/HREmpLoanFacade/getDetailsByEmployee
 */
export async function getEmployeeLoanByEmployee(employeeId: number) {
    const url = '/api/HREmpLoanFacade/getDetailsByEmployee';
    return await api.post<EmployeeLoanOnloadResponse>('hrms', url, { HRME_Id: employeeId });
}
