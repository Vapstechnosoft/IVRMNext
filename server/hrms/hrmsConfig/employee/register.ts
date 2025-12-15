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
    ILeaveReasonDropdown,
    IBloodGroupDropdown,
    ISalaryTypeDropdown,
    ITeachingTypeDropdown,
    IScoreTypeDropdown,
    IContactTypeDropdown
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

/**
 * Get Blood Group List for dropdowns
 * GET /api/MasterDropDown/GetBloodGroupList
 */
export async function getBloodGroupDropdown() {
    const url = '/api/MasterDropDown/GetBloodGroupList';
    return await api.get<IBloodGroupDropdown[]>('hrms', url);
}

/**
 * Get Salary Type List for dropdowns
 * GET /api/MasterDropDown/GetSalaryTypeList
 */
export async function getSalaryTypeDropdown() {
    const url = '/api/MasterDropDown/GetSalaryTypeList';
    return await api.get<ISalaryTypeDropdown[]>('hrms', url);
}

/**
 * Get Teaching Type List for dropdowns
 * GET /api/MasterDropDown/GetTeachingTypeList
 */
export async function getTeachingTypeDropdown() {
    const url = '/api/MasterDropDown/GetTeachingTypeList';
    return await api.get<ITeachingTypeDropdown[]>('hrms', url);
}

/**
 * Get Score Type List for dropdowns (CGPA Or Percentage)
 * GET /api/MasterDropDown/ScoreTypeList
 */
export async function getScoreTypeDropdown() {
    const url = '/api/MasterDropDown/ScoreTypeList';
    return await api.get<IScoreTypeDropdown[]>('hrms', url);
}

/**
 * Get Contact Type List for dropdowns (Default/Alternate for mobile, email, bank)
 * GET /api/MasterDropDown/GetContactType
 */
export async function getContactTypeDropdown() {
    const url = '/api/MasterDropDown/GetContactType';
    return await api.get<IContactTypeDropdown[]>('hrms', url);
}

// ==================== Employee CRUD Endpoints ====================

/**
 * Get Employee List with search, sort, and pagination
 * GET /api/EmployeeRegistration/GetEmployeeDetails
 */
export async function getEmployeeList(searchParams?: ApiSearchparams) {
    const searchableColumns = 'hrmE_EmployeeCode,hrmE_EmployeeFirstName,hrmE_EmployeeLastName,hrmE_EmailId,hrmE_MobileNo';
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/EmployeeRegistration/GetEmployeeDetails?${urlParams}`;
    return await api.get<IEmployeeList[]>('hrms', url);
}

/**
 * Get Employee by ID
 * GET /api/EmployeeRegistration/GetEmployeeDetailsById/{id}
 */
export async function getEmployeeById(id: number) {
    const url = `/api/EmployeeRegistration/GetEmployeeDetailsById/${id}`;
    return await api.get<IEmployeeDetailResponse>('hrms', url);
}

/**
 * Save or Update Employee Personal Details
 * POST /api/EmployeeRegistration/SavePersonalDetails
 * Note: This endpoint is used for both Employee Information and Address tabs
 */
export async function saveEmployee(data: IEmployeeSaveRequest) {
    const url = '/api/EmployeeRegistration/SavePersonalDetails';
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

/**
 * Save Employee Qualification Details
 * POST /api/EmployeeRegistration/SaveQualificationDetails
 */
export async function saveEmployeeQualification(data: any[]) {
    const url = '/api/EmployeeRegistration/SaveQulaification';
    return await api.post<any>('hrms', url, data);
}

/**
 * Save Employee Experience Details
 * POST /api/EmployeeRegistration/SaveExperienceDetails
 */
export async function saveEmployeeExperience(data: any[]) {
    const url = '/api/EmployeeRegistration/SaveExperienceDetails';
    return await api.post<any>('hrms', url, data);
}

/**
 * Save Employee Document Details
 * POST /api/EmployeeRegistration/SaveDocumentDetails
 */
export async function saveEmployeeDocument(data: any[]) {
    const url = '/api/EmployeeRegistration/SaveDocumentDetails';
    return await api.post<any>('hrms', url, data);
}

/**
 * Save Employee Medical Details
 * POST /api/EmployeeRegistration/SaveMedicalDetails
 */
export async function saveEmployeeMedical(data: any) {
    const url = '/api/EmployeeRegistration/SaveMedicalDetails';
    return await api.post<any>('hrms', url, data);
}

/**
 * Save Employee Other Details
 * POST /api/EmployeeRegistration/SaveOtherDetails
 */
export async function saveEmployeeOtherDetails(data: any) {
    const url = '/api/EmployeeRegistration/SaveOtherDetails';
    return await api.post<any>('hrms', url, data);
}
