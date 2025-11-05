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
    SaveDeductionDetailsResponse,
    SavePersonalDetailsRequest,
    SavePersonalDetailsResponse
} from '@/types/hrms/employee-register';

export async function getEmployeeRegisterOnload(payload: EmployeeRegisterOnloadRequest) {
    const url = '/api/EmployeeRegistrationNew/onloadgetdetails';
    
    const response = await api.post<EmployeeRegisterOnloadResponse>('hrms', url, payload);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as EmployeeRegisterOnloadResponse
    };
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
    
    const response = await api.post<SaveQualificationResponse>('hrms', url, qualifications);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Qualification details saved successfully',
        data: response as unknown as SaveQualificationResponse
    };
}

/**
 * Save Personal Details (combined Employee + Address) on Address tab save
 * POST /api/EmployeeRegistrationNew/SavePersonalDetails
 */
export async function savePersonalDetails(payload: SavePersonalDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SavePersonalDetails';
    
    try {
        console.log('=== Server: savePersonalDetails Request Debug ===');
        console.log('Payload HRME_Id:', payload.HRME_Id);
        console.log('URL:', url);
        console.log('=================================================');
        
        const response = await api.post<SavePersonalDetailsResponse>('hrms', url, payload);
        
        // Debug logging
        console.log('=== Server: savePersonalDetails Response Debug ===');
        console.log('Raw response:', JSON.stringify(response, null, 2));
        console.log('Response type:', typeof response);
        console.log('Is response an object?', response && typeof response === 'object');
        
        if (response && typeof response === 'object') {
            console.log('Response keys:', Object.keys(response));
            console.log('Has success property:', 'success' in response);
            console.log('Has data property:', 'data' in response);
            
            if ('HRME_Id' in response) {
                console.log('Direct HRME_Id found:', (response as any).HRME_Id);
            }
            
            if ('data' in response && (response as any).data) {
                const dataObj = (response as any).data;
                console.log('Response.data type:', typeof dataObj);
                if (typeof dataObj === 'string') {
                    console.log('Response.data is a string:', dataObj);
                } else if (typeof dataObj === 'object') {
                    console.log('Response.data keys:', Object.keys(dataObj));
                    if ('HRME_Id' in dataObj) {
                        console.log('Response.data.HRME_Id:', dataObj.HRME_Id);
                    }
                }
            }
            
            // Check if response is an array
            if (Array.isArray(response)) {
                console.log('Response is an array, length:', response.length);
                if (response.length > 0 && 'HRME_Id' in response[0]) {
                    console.log('HRME_Id in array[0]:', (response[0] as any).HRME_Id);
                }
            }
        }
        console.log('==================================================');
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            console.log('Response already wrapped, returning as-is');
            
            // Check if data is a string (like "Duplicate") - this is an error case
            if (typeof response.data === 'string') {
                console.warn('API returned string in data field:', response.data);
                // Return as-is, let client handle it
            }
            return response;
        }
        
        // Check if response is directly a string (like "Duplicate")
        if (typeof response === 'string') {
            console.warn('API returned direct string response:', response);
            return {
                success: false,
                message: response,
                data: response as unknown as SavePersonalDetailsResponse
            };
        }
        
        // Wrap raw response data
        const wrappedResponse = {
            success: true,
            message: 'Personal details saved successfully',
            data: response as unknown as SavePersonalDetailsResponse
        };
        console.log('Wrapped response:', JSON.stringify(wrappedResponse, null, 2));
        console.log('Wrapped response.data.HRME_Id:', wrappedResponse.data?.HRME_Id);
        return wrappedResponse;
    } catch (error: any) {
        console.error('=== Server: savePersonalDetails ERROR ===');
        console.error('Error type:', error?.constructor?.name);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        console.error('Error response:', error?.response);
        console.error('Error response data:', error?.response?.data);
        console.error('Full error:', JSON.stringify(error, null, 2));
        console.error('==========================================');
        
        // Re-throw to let the caller handle it
        throw error;
    }
}

/**
 * Save Experience Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveExperienceDetails
 * This endpoint takes an array of experience objects
 */
export async function saveExperienceDetails(experiences: SaveExperienceDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveExperienceDetails';
    
    const response = await api.post<SaveExperienceDetailsResponse>('hrms', url, experiences);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Experience details saved successfully',
        data: response as unknown as SaveExperienceDetailsResponse
    };
}

/**
 * Save Document Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveDocumentDetails
 * This endpoint takes an array of document objects
 */
export async function saveDocumentDetails(documents: SaveDocumentDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveDocumentDetails';
    
    const response = await api.post<SaveDocumentDetailsResponse>('hrms', url, documents);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Document details saved successfully',
        data: response as unknown as SaveDocumentDetailsResponse
    };
}

/**
 * Save Medical Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveMedicalDetails
 * This endpoint takes a single employee object with medical details
 */
export async function saveMedicalDetails(payload: SaveMedicalDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveMedicalDetails';
    
    const response = await api.post<SaveMedicalDetailsResponse>('hrms', url, payload);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Medical details saved successfully',
        data: response as unknown as SaveMedicalDetailsResponse
    };
}

/**
 * Save Other Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveOtherDetails
 * This endpoint takes a single employee object with other details
 */
export async function saveOtherDetails(payload: SaveOtherDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveOtherDetails';
    
    const response = await api.post<SaveOtherDetailsResponse>('hrms', url, payload);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Other details saved successfully',
        data: response as unknown as SaveOtherDetailsResponse
    };
}

/**
 * Get Employee Salary Details (Load Payroll Data)
 * POST /api/EmployeeRegistrationNew/getEmployeeSalaryDetails
 */
export async function getEmployeeSalaryDetails(payload: GetEmployeeSalaryDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/getEmployeeSalaryDetails';
    
    const response = await api.post<GetEmployeeSalaryDetailsResponse>('hrms', url, payload);
    
    // Check if response is already wrapped
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return response;
    }
    
    // Wrap the array response
    return {
        success: true,
        message: 'Payroll details loaded successfully',
        data: response as unknown as GetEmployeeSalaryDetailsResponse
    };
}

/**
 * Get Employee Salary Details By Head (Calculate Salary)
 * POST /api/EmployeeRegistrationNew/getEmployeeSalaryDetailsByHead
 */
export async function getEmployeeSalaryDetailsByHead(payload: GetEmployeeSalaryDetailsByHeadRequest) {
    const url = '/api/EmployeeRegistrationNew/getEmployeeSalaryDetailsByHead';
    
    const response = await api.post<GetEmployeeSalaryDetailsByHeadResponse>('hrms', url, payload);
    
    // Check if response is already wrapped
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return response;
    }
    
    // Wrap the array response
    return {
        success: true,
        message: 'Salary details calculated successfully',
        data: response as unknown as GetEmployeeSalaryDetailsByHeadResponse
    };
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
    
    const response = await api.post<SaveEarningDetailsResponse>('hrms', url, earnings);
    
    // Check if response is already wrapped
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return response;
    }
    
    // Wrap the response
    return {
        success: true,
        message: 'Earning details saved successfully',
        data: response as unknown as SaveEarningDetailsResponse
    };
}

/**
 * Save Arrear Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveArrearDetails
 */
export async function saveArrearDetails(arrears: SaveArrearDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveArrearDetails';
    
    const response = await api.post<SaveArrearDetailsResponse>('hrms', url, arrears);
    
    // Check if response is already wrapped
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return response;
    }
    
    // Wrap the response
    return {
        success: true,
        message: 'Arrear details saved successfully',
        data: response as unknown as SaveArrearDetailsResponse
    };
}

/**
 * Save Deduction Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveDeductionDetails
 */
export async function saveDeductionDetails(deductions: SaveDeductionDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveDeductionDetails';
    
    const response = await api.post<SaveDeductionDetailsResponse>('hrms', url, deductions);
    
    // Check if response is already wrapped
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return response;
    }
    
    // Wrap the response
    return {
        success: true,
        message: 'Deduction details saved successfully',
        data: response as unknown as SaveDeductionDetailsResponse
    };
}

/**
 * Activate/Deactivate Employee Registration
 * POST /api/EmployeeRegistrationNew/deactivateRecordById
 */
export async function activateDeactivateEmployee(data: {
    HRME_Id: number;
    HRME_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/EmployeeRegistrationNew/deactivateRecordById';
    
    const requestBody = {
        MI_Id: data.MI_Id ?? 30,
        HRME_Id: data.HRME_Id
    };
    
    return await api.post<EmployeeRegisterSaveResponse>('hrms', url, requestBody);
}

