'use server';

import { api } from '@/lib/apiService';
import type {
    EmployeeAddressDetailsRequest,
    EmployeeAddressDetailsResponse,
    EmployeeArrearDetailsRequest,
    EmployeeArrearDetailsResponse,
    EmployeeDeductionDetailsRequest,
    EmployeeDeductionDetailsResponse,
    EmployeeDocumentDetailsRequest,
    EmployeeDocumentDetailsResponse,
    EmployeeEarningDetailsRequest,
    EmployeeEarningDetailsResponse,
    EmployeeExperienceDetailsRequest,
    EmployeeExperienceDetailsResponse,
    EmployeeMedicalDetailsRequest,
    EmployeeMedicalDetailsResponse,
    EmployeeOtherDetailsRequest,
    EmployeeOtherDetailsResponse,
    EmployeePersonalDetailsRequest,
    EmployeePersonalDetailsResponse,
    EmployeeQualificationDetailsRequest,
    EmployeeQualificationDetailsResponse,
    EmployeeRegisterOnloadRequest,
    EmployeeRegisterOnloadResponse,
    EmployeeRegisterSaveRequest,
    EmployeeRegisterSaveResponse,
    GetEmployeeByIdResponse,
    SaveQualificationRequest,
    SaveQualificationResponse,
    SaveExperienceDetailsRequest,
    SaveExperienceDetailsResponse,
    SaveDocumentDetailsRequest,
    SaveDocumentDetailsResponse,
    SaveMedicalDetailsRequest,
    SaveMedicalDetailsResponse,
    SaveOtherDetailsRequest,
    SaveOtherDetailsResponse,
    GetEmployeeSalaryDetailsRequest,
    GetEmployeeSalaryDetailsResponse,
    GetEmployeeSalaryDetailsByHeadRequest,
    GetEmployeeSalaryDetailsByHeadResponse,
    SaveIncrementDetailsRequest,
    SaveIncrementDetailsResponse,
    SaveEarningDetailsRequest,
    SaveEarningDetailsResponse,
    SaveArrearDetailsRequest,
    SaveArrearDetailsResponse,
    SaveDeductionDetailsRequest,
    SaveDeductionDetailsResponse
} from '@/types/hrms/employee-register';

export async function getEmployeeRegisterOnload(payload: EmployeeRegisterOnloadRequest) {
    const url = '/api/EmployeeRegistrationNew/onloadgetdetails';
    return await api.post<EmployeeRegisterOnloadResponse>('hrms', url, payload);
}

export async function saveEmployeeRegister(payload: EmployeeRegisterSaveRequest) {
    const url = '/api/EmployeeRegistrationFacade';
    return await api.post<EmployeeRegisterSaveResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Personal Details (Employee Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeePersonalDetailsNew
 */
export async function addUpdateEmployeePersonalDetails(payload: EmployeePersonalDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeePersonalDetailsNew';
    return await api.post<EmployeePersonalDetailsResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Address Details (Address Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeAddressDetailsNew
 */
export async function addUpdateEmployeeAddressDetails(payload: EmployeeAddressDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeeAddressDetailsNew';
    return await api.post<EmployeeAddressDetailsResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Qualification Details (Qualification Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeQualificationDetailsNew
 */
export async function addUpdateEmployeeQualificationDetails(payload: EmployeeQualificationDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeeQualificationDetailsNew';
    return await api.post<EmployeeQualificationDetailsResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Experience Details (Experience Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeExperienceDetailsNew
 */
export async function addUpdateEmployeeExperienceDetails(payload: EmployeeExperienceDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeeExperienceDetailsNew';
    return await api.post<EmployeeExperienceDetailsResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Document Details (Document Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeDocumentDetailsNew
 */
export async function addUpdateEmployeeDocumentDetails(payload: EmployeeDocumentDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeeDocumentDetailsNew';
    return await api.post<EmployeeDocumentDetailsResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Medical Details (Medical Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeMedicalDetailsNew
 */
export async function addUpdateEmployeeMedicalDetails(payload: EmployeeMedicalDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeeMedicalDetailsNew';
    return await api.post<EmployeeMedicalDetailsResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Other Details (Other Details Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeOtherDetailsNew
 */
export async function addUpdateEmployeeOtherDetails(payload: EmployeeOtherDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeeOtherDetailsNew';
    return await api.post<EmployeeOtherDetailsResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Earning Details (Payroll - Earning Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeEarningDetailsNew
 */
export async function addUpdateEmployeeEarningDetails(payload: EmployeeEarningDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeeEarningDetailsNew';
    return await api.post<EmployeeEarningDetailsResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Deduction Details (Payroll - Deduction Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeDeductionDetailsNew
 */
export async function addUpdateEmployeeDeductionDetails(payload: EmployeeDeductionDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeeDeductionDetailsNew';
    return await api.post<EmployeeDeductionDetailsResponse>('hrms', url, payload);
}

/**
 * Add/Update Employee Arrear Details (Payroll - Arrear Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeArrearDetailsNew
 */
export async function addUpdateEmployeeArrearDetails(payload: EmployeeArrearDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/AddUpdateEmployeeArrearDetailsNew';
    return await api.post<EmployeeArrearDetailsResponse>('hrms', url, payload);
}

/**
 * Get Employee by ID
 * GET /api/EmployeeRegistrationNew/getRecordById/{id}
 */
export async function getEmployeeById(id: number) {
    const url = `/api/EmployeeRegistrationNew/getRecordById/${id}`;
    return await api.get<GetEmployeeByIdResponse>('hrms', url);
}

/**
 * Save Qualification (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveQulaification
 * This endpoint takes an array of qualification objects
 */
export async function saveQualification(qualifications: SaveQualificationRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveQulaification';
    return await api.post<SaveQualificationResponse>('hrms', url, qualifications);
}

/**
 * Save Personal Details (combined Employee + Address) on Address tab save
 * POST /api/EmployeeRegistrationNew/SavePersonalDetails
 */
export async function savePersonalDetails(payload: any) {
    const url = '/api/EmployeeRegistrationNew/SavePersonalDetails';
    return await api.post<any>('hrms', url, payload);
}

/**
 * Save Experience Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveExperienceDetails
 * This endpoint takes an array of experience objects
 */
export async function saveExperienceDetails(experiences: SaveExperienceDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveExperienceDetails';
    return await api.post<SaveExperienceDetailsResponse>('hrms', url, experiences);
}

/**
 * Save Document Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveDocumentDetails
 * This endpoint takes an array of document objects
 */
export async function saveDocumentDetails(documents: SaveDocumentDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveDocumentDetails';
    return await api.post<SaveDocumentDetailsResponse>('hrms', url, documents);
}

/**
 * Save Medical Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveMedicalDetails
 * This endpoint takes a single employee object with medical details
 */
export async function saveMedicalDetails(payload: SaveMedicalDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveMedicalDetails';
    return await api.post<SaveMedicalDetailsResponse>('hrms', url, payload);
}

/**
 * Save Other Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveOtherDetails
 * This endpoint takes a single employee object with other details
 */
export async function saveOtherDetails(payload: SaveOtherDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveOtherDetails';
    return await api.post<SaveOtherDetailsResponse>('hrms', url, payload);
}

/**
 * Get Employee Salary Details (Load Payroll Data)
 * POST /api/EmployeeRegistrationNew/getEmployeeSalaryDetails
 */
export async function getEmployeeSalaryDetails(payload: GetEmployeeSalaryDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/getEmployeeSalaryDetails';
    return await api.post<GetEmployeeSalaryDetailsResponse>('hrms', url, payload);
}

/**
 * Get Employee Salary Details By Head (Calculate Salary)
 * POST /api/EmployeeRegistrationNew/getEmployeeSalaryDetailsByHead
 */
export async function getEmployeeSalaryDetailsByHead(payload: GetEmployeeSalaryDetailsByHeadRequest) {
    const url = '/api/EmployeeRegistrationNew/getEmployeeSalaryDetailsByHead';
    return await api.post<GetEmployeeSalaryDetailsByHeadResponse>('hrms', url, payload);
}

/**
 * Save Increment Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveIncreamentDetails
 */
export async function saveIncrementDetails(payload: SaveIncrementDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveIncreamentDetails';
    return await api.post<SaveIncrementDetailsResponse>('hrms', url, payload);
}

/**
 * Save Earning Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveEarningDetails
 */
export async function saveEarningDetails(earnings: SaveEarningDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveEarningDetails';
    return await api.post<SaveEarningDetailsResponse>('hrms', url, earnings);
}

/**
 * Save Arrear Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveArrearDetails
 */
export async function saveArrearDetails(arrears: SaveArrearDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveArrearDetails';
    return await api.post<SaveArrearDetailsResponse>('hrms', url, arrears);
}

/**
 * Save Deduction Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveDeductionDetails
 */
export async function saveDeductionDetails(deductions: SaveDeductionDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveDeductionDetails';
    return await api.post<SaveDeductionDetailsResponse>('hrms', url, deductions);
}

