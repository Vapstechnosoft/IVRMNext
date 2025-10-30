import { clientEnv } from '@/env';
import type {
    ApiResponse,
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
import axios from 'axios';

export async function getEmployeeRegisterOnload(
    payload: EmployeeRegisterOnloadRequest
): Promise<ApiResponse<EmployeeRegisterOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeRegisterOnloadResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        // Manually wrap the response in ApiResponse format
        const response: ApiResponse<EmployeeRegisterOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                (axiosResponse.data as any)?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error fetching employee register onload ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to load employee registration data',
            data: null
        };
    }
}

export async function saveEmployeeRegister(payload: EmployeeRegisterSaveRequest): Promise<ApiResponse<EmployeeRegisterSaveResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationFacade';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeRegisterSaveResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        // Manually wrap the response in ApiResponse format
        const response: ApiResponse<EmployeeRegisterSaveResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                (axiosResponse.data as any)?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? payload.HRME_Id === 0
                        ? 'Employee created successfully'
                        : 'Employee updated successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving/updating employee ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee registration data',
            data: null
        };
    }
}

/**
 * Add/Update Employee Personal Details (Employee Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeePersonalDetailsNew
 */
export async function addUpdateEmployeePersonalDetails(
    payload: EmployeePersonalDetailsRequest
): Promise<ApiResponse<EmployeePersonalDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeePersonalDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeePersonalDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeePersonalDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee personal details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee personal details',
            data: null
        };
    }
}

/**
 * Add/Update Employee Address Details (Address Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeAddressDetailsNew
 */
export async function addUpdateEmployeeAddressDetails(
    payload: EmployeeAddressDetailsRequest
): Promise<ApiResponse<EmployeeAddressDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeeAddressDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeAddressDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeAddressDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee address details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee address details',
            data: null
        };
    }
}

/**
 * Add/Update Employee Qualification Details (Qualification Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeQualificationDetailsNew
 */
export async function addUpdateEmployeeQualificationDetails(
    payload: EmployeeQualificationDetailsRequest
): Promise<ApiResponse<EmployeeQualificationDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeeQualificationDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeQualificationDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeQualificationDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee qualification details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee qualification details',
            data: null
        };
    }
}

/**
 * Add/Update Employee Experience Details (Experience Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeExperienceDetailsNew
 */
export async function addUpdateEmployeeExperienceDetails(
    payload: EmployeeExperienceDetailsRequest
): Promise<ApiResponse<EmployeeExperienceDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeeExperienceDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeExperienceDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeExperienceDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee experience details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee experience details',
            data: null
        };
    }
}

/**
 * Add/Update Employee Document Details (Document Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeDocumentDetailsNew
 */
export async function addUpdateEmployeeDocumentDetails(
    payload: EmployeeDocumentDetailsRequest
): Promise<ApiResponse<EmployeeDocumentDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeeDocumentDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeDocumentDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeDocumentDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee document details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee document details',
            data: null
        };
    }
}

/**
 * Add/Update Employee Medical Details (Medical Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeMedicalDetailsNew
 */
export async function addUpdateEmployeeMedicalDetails(
    payload: EmployeeMedicalDetailsRequest
): Promise<ApiResponse<EmployeeMedicalDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeeMedicalDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeMedicalDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeMedicalDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee medical details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee medical details',
            data: null
        };
    }
}

/**
 * Add/Update Employee Other Details (Other Details Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeOtherDetailsNew
 */
export async function addUpdateEmployeeOtherDetails(
    payload: EmployeeOtherDetailsRequest
): Promise<ApiResponse<EmployeeOtherDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeeOtherDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeOtherDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeOtherDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee other details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee other details',
            data: null
        };
    }
}

/**
 * Add/Update Employee Earning Details (Payroll - Earning Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeEarningDetailsNew
 */
export async function addUpdateEmployeeEarningDetails(
    payload: EmployeeEarningDetailsRequest
): Promise<ApiResponse<EmployeeEarningDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeeEarningDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeEarningDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeEarningDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee earning details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee earning details',
            data: null
        };
    }
}

/**
 * Add/Update Employee Deduction Details (Payroll - Deduction Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeDeductionDetailsNew
 */
export async function addUpdateEmployeeDeductionDetails(
    payload: EmployeeDeductionDetailsRequest
): Promise<ApiResponse<EmployeeDeductionDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeeDeductionDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeDeductionDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeDeductionDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee deduction details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee deduction details',
            data: null
        };
    }
}

/**
 * Add/Update Employee Arrear Details (Payroll - Arrear Tab)
 * POST /api/EmployeeRegistrationNew/AddUpdateEmployeeArrearDetailsNew
 */
export async function addUpdateEmployeeArrearDetails(
    payload: EmployeeArrearDetailsRequest
): Promise<ApiResponse<EmployeeArrearDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/AddUpdateEmployeeArrearDetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeArrearDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeArrearDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee arrear details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save employee arrear details',
            data: null
        };
    }
}

/**
 * Get Employee by ID
 * GET /api/EmployeeRegistrationNew/getRecordById/{id}
 */
export async function getEmployeeById(id: number): Promise<ApiResponse<GetEmployeeByIdResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/EmployeeRegistrationNew/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.get<GetEmployeeByIdResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<GetEmployeeByIdResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error fetching employee by ID ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to fetch employee data',
            data: null
        };
    }
}

/**
 * Save Qualification (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveQulaification
 * This endpoint takes an array of qualification objects
 */
export async function saveQualification(qualifications: SaveQualificationRequest[]): Promise<ApiResponse<SaveQualificationResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SaveQulaification';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SaveQualificationResponse>(url, qualifications, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SaveQualificationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving qualification ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save qualification',
            data: null
        };
    }
}

/**
 * Save Personal Details (combined Employee + Address) on Address tab save
 * POST /api/EmployeeRegistrationNew/SavePersonalDetails
 */
export async function savePersonalDetails(payload: any): Promise<ApiResponse<any>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SavePersonalDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<any>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<any> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Success',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving personal details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save personal details',
            data: null
        };
    }
}

/**
 * Save Experience Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveExperienceDetails
 * This endpoint takes an array of experience objects
 */
export async function saveExperienceDetails(
    experiences: SaveExperienceDetailsRequest[]
): Promise<ApiResponse<SaveExperienceDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SaveExperienceDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SaveExperienceDetailsResponse>(url, experiences, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SaveExperienceDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Experience details saved successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving experience details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save experience details',
            data: null
        };
    }
}

/**
 * Save Document Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveDocumentDetails
 * This endpoint takes an array of document objects
 */
export async function saveDocumentDetails(
    documents: SaveDocumentDetailsRequest[]
): Promise<ApiResponse<SaveDocumentDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SaveDocumentDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SaveDocumentDetailsResponse>(url, documents, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SaveDocumentDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Document details saved successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving document details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save document details',
            data: null
        };
    }
}

/**
 * Save Medical Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveMedicalDetails
 * This endpoint takes a single employee object with medical details
 */
export async function saveMedicalDetails(
    payload: SaveMedicalDetailsRequest
): Promise<ApiResponse<SaveMedicalDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SaveMedicalDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SaveMedicalDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SaveMedicalDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Medical details saved successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving medical details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save medical details',
            data: null
        };
    }
}

/**
 * Save Other Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveOtherDetails
 * This endpoint takes a single employee object with other details
 */
export async function saveOtherDetails(
    payload: SaveOtherDetailsRequest
): Promise<ApiResponse<SaveOtherDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SaveOtherDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SaveOtherDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SaveOtherDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Other details saved successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving other details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save other details',
            data: null
        };
    }
}

/**
 * Get Employee Salary Details (Load Payroll Data)
 * POST /api/EmployeeRegistrationNew/getEmployeeSalaryDetails
 */
export async function getEmployeeSalaryDetails(
    payload: GetEmployeeSalaryDetailsRequest
): Promise<ApiResponse<GetEmployeeSalaryDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/getEmployeeSalaryDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<GetEmployeeSalaryDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<GetEmployeeSalaryDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Salary details fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error fetching salary details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to fetch salary details',
            data: null
        };
    }
}

/**
 * Get Employee Salary Details By Head (Calculate Salary)
 * POST /api/EmployeeRegistrationNew/getEmployeeSalaryDetailsByHead
 */
export async function getEmployeeSalaryDetailsByHead(
    payload: GetEmployeeSalaryDetailsByHeadRequest
): Promise<ApiResponse<GetEmployeeSalaryDetailsByHeadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/getEmployeeSalaryDetailsByHead';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<GetEmployeeSalaryDetailsByHeadResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<GetEmployeeSalaryDetailsByHeadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Salary calculated successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error calculating salary by head ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to calculate salary',
            data: null
        };
    }
}

/**
 * Save Increment Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveIncreamentDetails
 */
export async function saveIncrementDetails(
    payload: SaveIncrementDetailsRequest
): Promise<ApiResponse<SaveIncrementDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SaveIncreamentDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SaveIncrementDetailsResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SaveIncrementDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Increment details saved successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving increment details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save increment details',
            data: null
        };
    }
}

/**
 * Save Earning Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveEarningDetails
 */
export async function saveEarningDetails(
    earnings: SaveEarningDetailsRequest[]
): Promise<ApiResponse<SaveEarningDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SaveEarningDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SaveEarningDetailsResponse>(url, earnings, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SaveEarningDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Earning details saved successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving earning details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save earning details',
            data: null
        };
    }
}

/**
 * Save Arrear Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveArrearDetails
 */
export async function saveArrearDetails(
    arrears: SaveArrearDetailsRequest[]
): Promise<ApiResponse<SaveArrearDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SaveArrearDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SaveArrearDetailsResponse>(url, arrears, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SaveArrearDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Arrear details saved successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving arrear details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save arrear details',
            data: null
        };
    }
}

/**
 * Save Deduction Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveDeductionDetails
 */
export async function saveDeductionDetails(
    deductions: SaveDeductionDetailsRequest[]
): Promise<ApiResponse<SaveDeductionDetailsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/SaveDeductionDetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SaveDeductionDetailsResponse>(url, deductions, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SaveDeductionDetailsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: (axiosResponse.data as any)?.retrunMsg || 'Deduction details saved successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving deduction details ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: error.message || 'Failed to save deduction details',
            data: null
        };
    }
}
