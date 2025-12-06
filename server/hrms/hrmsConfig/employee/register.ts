'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IBankDropdown,
    ICasteCategoryDropdown,
    ICasteDropdown,
    ICountryDropdown,
    ICourseDropdown,
    IDesignationDropdown,
    IDepartmentDropdown,
    IEmployeeDetailResponse,
    IEmployeeList,
    IEmployeeSaveRequest,
    IEmployeeSaveResponse,
    IEmployeeTypeDropdown,
    IGenderDropdown,
    IGradeDropdown,
    IGroupTypeDropdown,
    IInstitutionDropdown,
    IMaritalStatusDropdown,
    IPaymentModeDropdown,
    IReligionDropdown,
    ISpecializationDropdown,
    IStateDropdown,
    ILeaveReasonDropdown
} from '@/types/hrms/hrms-config/employee';

// ==================== Dropdown Endpoints ====================

/**
 * Get Grade List for dropdowns
 * GET /api/MasterDropDown/GetGradeList
 */
export async function getGradeDropdown() {
    const url = '/api/MasterDropDown/GetGradeList';
    return await api.get<IGradeDropdown[]>('hrms', url);
}

/**
 * Get Employee Type List for dropdowns
 * GET /api/MasterDropDown/GetEmployeeType
 */
export async function getEmployeeTypeDropdown() {
    const url = '/api/MasterDropDown/GetEmployeeType';
    return await api.get<IEmployeeTypeDropdown[]>('hrms', url);
}

/**
 * Get Group Type List for dropdowns
 * GET /api/MasterDropDown/GroupType
 */
export async function getGroupTypeDropdown() {
    const url = '/api/MasterDropDown/GroupType';
    return await api.get<IGroupTypeDropdown[]>('hrms', url);
}

/**
 * Get Department List for dropdowns
 * GET /api/MasterDropDown/GetDepartments
 */
export async function getDepartmentDropdown() {
    const url = '/api/MasterDropDown/GetDepartments';
    return await api.get<IDepartmentDropdown[]>('hrms', url);
}

/**
 * Get Designation List for dropdowns
 * GET /api/MasterDropDown/GetDesignation
 */
export async function getDesignationDropdown() {
    const url = '/api/MasterDropDown/GetDesignation';
    return await api.get<IDesignationDropdown[]>('hrms', url);
}

/**
 * Get Gender List for dropdowns
 * GET /api/MasterDropDown/GetGenderList
 */
export async function getGenderDropdown() {
    const url = '/api/MasterDropDown/GetGenderList';
    return await api.get<IGenderDropdown[]>('hrms', url);
}

/**
 * Get Marital Status List for dropdowns
 * GET /api/MasterDropDown/GetMaritalStateList
 */
export async function getMaritalStatusDropdown() {
    const url = '/api/MasterDropDown/GetMaritalStateList';
    return await api.get<IMaritalStatusDropdown[]>('hrms', url);
}

/**
 * Get Religion List for dropdowns
 * GET /api/MasterDropDown/GeAllReligionList
 */
export async function getReligionDropdown() {
    const url = '/api/MasterDropDown/GeAllReligionList';
    return await api.get<IReligionDropdown[]>('hrms', url);
}

/**
 * Get Caste Category List for dropdowns
 * GET /api/MasterDropDown/GeAllCasteCategoriesList
 */
export async function getCasteCategoryDropdown() {
    const url = '/api/MasterDropDown/GeAllCasteCategoriesList';
    return await api.get<ICasteCategoryDropdown[]>('hrms', url);
}

/**
 * Get Caste List for dropdowns
 * GET /api/MasterDropDown/GetAllCasteList
 */
export async function getCasteDropdown() {
    const url = '/api/MasterDropDown/GetAllCasteList';
    return await api.get<ICasteDropdown[]>('hrms', url);
}

/**
 * Get Bank List for dropdowns
 * GET /api/MasterDropDown/GetBankList
 */
export async function getBankDropdown() {
    const url = '/api/MasterDropDown/GetBankList';
    return await api.get<IBankDropdown[]>('hrms', url);
}

/**
 * Get Country List for dropdowns
 * GET /api/MasterDropDown/GetCountryList
 */
export async function getCountryDropdown() {
    const url = '/api/MasterDropDown/GetCountryList';
    return await api.get<ICountryDropdown[]>('hrms', url);
}

/**
 * Get State List for dropdowns by country ID
 * GET /api/MasterDropDown/GetStateList?CountryId={country_id}
 */
export async function getStateDropdown(country_id: number) {
    const url = `/api/MasterDropDown/GetStateList?CountryId=${country_id}`;
    return await api.get<IStateDropdown[]>('hrms', url);
}

/**
 * Get Course List for dropdowns
 * GET /api/MasterDropDown/GetCourseList
 */
export async function getCourseDropdown() {
    const url = '/api/MasterDropDown/GetCourseList';
    return await api.get<ICourseDropdown[]>('hrms', url);
}

/**
 * Get Specialisation List for dropdowns
 * GET /api/MasterDropDown/GetSpecialisationList
 */
export async function getSpecializationDropdown() {
    const url = '/api/MasterDropDown/GetSpecialisationList';
    return await api.get<ISpecializationDropdown[]>('hrms', url);
}

/**
 * Get Institution List for dropdowns
 * GET /api/MasterDropDown/GetInstitutionList
 */
export async function getInstitutionDropdown() {
    const url = '/api/MasterDropDown/GetInstitutionList';
    return await api.get<IInstitutionDropdown[]>('hrms', url);
}

/**
 * Get Payment Mode List for dropdowns
 * GET /api/MasterDropDown/GetPaymentModeList
 */
export async function getPaymentModeDropdown() {
    const url = '/api/MasterDropDown/GetPaymentModeList';
    return await api.get<IPaymentModeDropdown[]>('hrms', url);
}

/**
 * Get Leave Reason List for dropdowns
 * GET /api/MasterDropDown/GetLeaveReasonList
 */
export async function getLeaveReasonDropdown() {
    const url = '/api/MasterDropDown/GetLeaveReasonList';
    return await api.get<ILeaveReasonDropdown[]>('hrms', url);
}

// ==================== Employee CRUD Endpoints ====================

/**
 * Get Employee List with search, sort, and pagination
 * GET /api/EmployeeRegistrationNew/employee_list
 */
export async function getEmployeeList(roleId: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'HRME_EmployeeCode,HRME_EmployeeFirstName,HRME_EmployeeLastName,HRME_EmailId,HRME_MobileNo'
    );
    const url = `/api/EmployeeRegistrationNew/employee_list?MI_Id=${roleId}&${urlParams}`;
    return await api.get<IEmployeeList[]>('hrms', url);
}

/**
 * Get Employee by ID
 * GET /api/EmployeeRegistrationNew/getRecordById/{id}
 */
export async function getEmployeeById(id: number) {
    const url = `/api/EmployeeRegistrationNew/getRecordById/${id}`;
    return await api.get<IEmployeeDetailResponse>('hrms', url);
}

/**
 * Save or Update Employee
 * POST /api/EmployeeRegistrationNew/SavePersonalDetails
 * Note: Payload will be defined in the form component
 */
export async function saveEmployee(data: IEmployeeSaveRequest) {
    const url = '/api/EmployeeRegistrationNew/SavePersonalDetails';
    return await api.post<IEmployeeSaveResponse>('hrms', url, data);
}

/**
 * Toggle Employee (Activate/Deactivate)
 * PUT /api/EmployeeRegistrationNew/deactivateRecordById/{id}
 */
export async function toggleEmployee(id: number) {
    const url = `/api/EmployeeRegistrationNew/deactivateRecordById/${id}`;
    return await api.put('hrms', url);
}

/**
 * Delete Employee
 * DELETE /api/EmployeeRegistrationNew/delete/{id}
 */
export async function deleteEmployee(id: number) {
    const url = `/api/EmployeeRegistrationNew/delete/${id}`;
    return await api.delete<any>('hrms', url);
}
