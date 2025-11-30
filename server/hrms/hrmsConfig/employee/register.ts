'use server';
import { type ApiResponse, api } from '@/lib/apiService';
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
    GetEmployeeSalaryDetailsByHeadRequest,
    GetEmployeeSalaryDetailsByHeadResponse,
    GetEmployeeSalaryDetailsRequest,
    GetEmployeeSalaryDetailsResponse,
    SaveArrearDetailsRequest,
    SaveArrearDetailsResponse,
    SaveDeductionDetailsRequest,
    SaveDeductionDetailsResponse,
    SaveDocumentDetailsRequest,
    SaveDocumentDetailsResponse,
    SaveEarningDetailsRequest,
    SaveEarningDetailsResponse,
    SaveExperienceDetailsRequest,
    SaveExperienceDetailsResponse,
    SaveIncrementDetailsRequest,
    SaveIncrementDetailsResponse,
    SaveMedicalDetailsRequest,
    SaveMedicalDetailsResponse,
    SaveOtherDetailsRequest,
    SaveOtherDetailsResponse,
    SavePersonalDetailsRequest,
    SavePersonalDetailsResponse,
    SaveQualificationRequest,
    SaveQualificationResponse,
    SaveBankDetailsRequest,
    SaveBankDetailsResponse,
    SalaryCalculationRequest,
    SalaryCalculationResponse
} from '@/types/hrms/employee-register';
/**
 * Helper function to extract string response from error message
 * Used when API returns string responses like "Update", "Add", "Duplicate"
 * but apiService throws TypeError due to 'in' operator check
 */
function extractStringFromError(error: any): string | null {
    const errorMessageText = typeof error === 'string' ? error : error?.message || '';
    if (errorMessageText.includes("Cannot use 'in' operator")) {
        // Try multiple regex patterns to extract the string value from error message
        const patterns = [
            /in\s+['"]?([A-Za-z]+)['"]?/i, // "in 'Update'" or "in Update"
            /in\s+([A-Za-z]+)/i, // "in Update"
            /'([A-Za-z]+)'/ // 'Update' in quotes
        ];
        for (const pattern of patterns) {
            const match = errorMessageText.match(pattern);
            if (match?.[1]) {
                const extractedString = match[1];
                // Check if it's one of the expected values
                if (['Update', 'Add', 'Duplicate'].includes(extractedString)) {
                    return extractedString;
                }
            }
        }
    }
    return null;
}
/**
 * Helper function to handle API response that might be a string
 * Wraps string responses into ApiResponse format
 */
function handleStringResponse<T>(response: any, _defaultMessage = 'Operation completed successfully'): ApiResponse<T> | null {
    // Check if response.data is a string (like "Add", "Update", "Duplicate")
    const responseData = (response as any)?.data;
    if (typeof responseData === 'string') {
        return {
            success: responseData !== 'Duplicate',
            message: responseData,
            data: responseData as unknown as T
        };
    }
    // Check if response itself is a string (like "Add", "Update", "Duplicate")
    if (typeof response === 'string') {
        return {
            success: response !== 'Duplicate',
            message: response,
            data: response as unknown as T
        };
    }
    return null;
}
/**
 * Helper function to properly serialize errors for Next.js server actions
 * This ensures errors are properly serialized and can be sent to the client
 */
function serializeError(error: any, defaultMessage = 'An error occurred'): Error {
    let errorMessage = defaultMessage;
    // Handle string errors first (from apiService.handleError or other sources)
    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error?.message) {
        // Check if this is an error from using 'in' operator on a string
        // The message format is: "Cannot use 'in' operator to search for 'success' in [string]"
        if (error.message.includes("Cannot use 'in' operator")) {
            // Try to extract the actual error message from the TypeError message
            // Example: "Cannot use 'in' operator to search for 'success' in Error occured"
            // We want to extract "Error occured"
            const match = error.message.match(/in\s+['"]?([^'"]+)['"]?/i);
            if (match?.[1]) {
                const extractedMessage = match[1].trim();
                // If it's a known success response, use it; otherwise use it as error message
                if (['Update', 'Add', 'Duplicate'].includes(extractedMessage)) {
                    errorMessage = extractedMessage;
                } else {
                    errorMessage = extractedMessage;
                }
            } else {
                // Preserve original message if we can't extract
                errorMessage = error.message;
            }
        } else {
            errorMessage = error.message;
        }
    }
    // Try to extract error message from error.response.data if available
    // But only if we haven't already set a specific error message
    if (error && typeof error === 'object' && error?.response?.data && errorMessage === defaultMessage) {
        const apiError = error.response.data;
        // Check if apiError is a string first (before using 'in' operator)
        if (typeof apiError === 'string') {
            errorMessage = apiError;
        } else if (typeof apiError === 'object' && apiError !== null) {
            // Only use 'in' operator if apiError is an object
            if (apiError?.message) {
                errorMessage = apiError.message;
            } else if (apiError?.error) {
                errorMessage = apiError.error;
            } else if (apiError?.errors && Array.isArray(apiError.errors)) {
                errorMessage = apiError.errors.map((e: any) => e.message || e).join(', ');
            } else if (error.response.status) {
                errorMessage = `Request failed with status ${error.response.status}`;
            }
        } else if (error.response.status) {
            errorMessage = `Request failed with status ${error.response.status}`;
        }
    }
    // Create a new Error object that is serializable
    const serializableError = new Error(errorMessage);
    // Preserve status code if available
    if (error && typeof error === 'object' && error?.response?.status) {
        (serializableError as any).status = error.response.status;
    }
    return serializableError;
}
export async function getEmployeeRegisterOnload(payload: EmployeeRegisterOnloadRequest) {
    const url = '/api/EmployeeRegistrationNew/onloadgetdetails';
    try {
        const response = await api.post<EmployeeRegisterOnloadResponse>('hrms', url, payload);
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            // Already wrapped
            return response;
        }
        // Wrap raw response data
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: response as unknown as EmployeeRegisterOnloadResponse
        };
        return wrappedResponse;
    } catch (error: any) {
        throw serializeError(error, 'Failed to load employee registration data');
    }
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
    try {
        const response = await api.get<any>('hrms', url);
        // The API returns an onload-like structure with employeedetailList
        // Extract the specific employee from the list
        let employeeData = null;
        if (response && typeof response === 'object') {
            // Log full response structure for debugging
            console.log('🔍 [EDIT] API Response structure:', {
                hasEmployeedetailList: !!response.employeedetailList,
                employeedetailListLength: Array.isArray(response.employeedetailList) ? response.employeedetailList.length : 0,
                rootLevelKeys: Object.keys(response),
                hasQualificationDetails: !!(response as any).qualificationDetails,
                rootQualificationDetails: (response as any).qualificationDetails
            });
            // Check if employee data is in employeedetailList
            if (response.employeedetailList && Array.isArray(response.employeedetailList)) {
                // Find the employee with matching ID
                employeeData = response.employeedetailList.find((emp: any) => emp.HRME_Id === id);
            }
            // If not found in list, try root level (fallback)
            if (!employeeData && response.HRME_Id === id) {
                employeeData = response;
            }
        }
        if (!employeeData) {
            throw new Error('Employee not found');
        }
        // Log medical fields in employee object BEFORE copying from root
        console.log('🔍 [EDIT] Medical fields in employee object (before copy):', {
            HRME_Height: (employeeData as any).HRME_Height,
            HRME_HeightUOM: (employeeData as any).HRME_HeightUOM,
            HRME_Weight: (employeeData as any).HRME_Weight,
            HRME_WeightUOM: (employeeData as any).HRME_WeightUOM,
            HRME_EyeSightIssue: (employeeData as any).HRME_EyeSightIssue,
            HRME_AnyHealthIssue: (employeeData as any).HRME_AnyHealthIssue,
            HRME_IdentificationMark: (employeeData as any).HRME_IdentificationMark
        });
        // Log medical fields in root response
        console.log('🔍 [EDIT] Medical fields in root response:', {
            HRME_Height: (response as any).HRME_Height,
            HRME_HeightUOM: (response as any).HRME_HeightUOM,
            HRME_Weight: (response as any).HRME_Weight,
            HRME_WeightUOM: (response as any).HRME_WeightUOM,
            HRME_EyeSightIssue: (response as any).HRME_EyeSightIssue,
            HRME_AnyHealthIssue: (response as any).HRME_AnyHealthIssue,
            HRME_IdentificationMark: (response as any).HRME_IdentificationMark
        });
        // Log other details fields in employee object BEFORE copying from root
        console.log('🔍 [EDIT] Other details fields in employee object (before copy):', {
            HRME_BiometricCode: (employeeData as any).HRME_BiometricCode,
            HRME_RFCardId: (employeeData as any).HRME_RFCardId,
            HRME_ExcPunch: (employeeData as any).HRME_ExcPunch,
            HRME_RetiredFlg: (employeeData as any).HRME_RetiredFlg,
            HRME_PensionStoppedDate: (employeeData as any).HRME_PensionStoppedDate,
            HRME_MSTeamsUserId: (employeeData as any).HRME_MSTeamsUserId,
            HRME_MSTeamsPassword: (employeeData as any).HRME_MSTeamsPassword,
            HRME_LeftFlag: (employeeData as any).HRME_LeftFlag,
            HRME_DOL: (employeeData as any).HRME_DOL,
            HRME_LeavingReason: (employeeData as any).HRME_LeavingReason
        });
        // Log other details fields in root response
        console.log('🔍 [EDIT] Other details fields in root response:', {
            HRME_BiometricCode: (response as any).HRME_BiometricCode,
            HRME_RFCardId: (response as any).HRME_RFCardId,
            HRME_ExcPunch: (response as any).HRME_ExcPunch,
            HRME_RetiredFlg: (response as any).HRME_RetiredFlg,
            HRME_PensionStoppedDate: (response as any).HRME_PensionStoppedDate,
            HRME_MSTeamsUserId: (response as any).HRME_MSTeamsUserId,
            HRME_MSTeamsPassword: (response as any).HRME_MSTeamsPassword,
            HRME_LeftFlag: (response as any).HRME_LeftFlag,
            HRME_DOL: (response as any).HRME_DOL,
            HRME_LeavingReason: (response as any).HRME_LeavingReason
        });
        // Log the full employee object keys to see what's actually there
        console.log('🔍 [EDIT] Employee object keys (sample):', Object.keys(employeeData as any).slice(0, 50));
        console.log('🔍 [EDIT] Full employee object (other details check):', {
            hasBiometricCode: 'HRME_BiometricCode' in (employeeData as any),
            biometricCodeValue: (employeeData as any).HRME_BiometricCode,
            hasRFCardId: 'HRME_RFCardId' in (employeeData as any),
            rfCardIdValue: (employeeData as any).HRME_RFCardId,
            hasExcPunch: 'HRME_ExcPunch' in (employeeData as any),
            excPunchValue: (employeeData as any).HRME_ExcPunch,
            hasRetiredFlg: 'HRME_RetiredFlg' in (employeeData as any),
            retiredFlgValue: (employeeData as any).HRME_RetiredFlg,
            hasPensionStoppedDate: 'HRME_PensionStoppedDate' in (employeeData as any),
            pensionStoppedDateValue: (employeeData as any).HRME_PensionStoppedDate,
            hasMSTeamsUserId: 'HRME_MSTeamsUserId' in (employeeData as any),
            msTeamsUserIdValue: (employeeData as any).HRME_MSTeamsUserId,
            hasMSTeamsPassword: 'HRME_MSTeamsPassword' in (employeeData as any),
            msTeamsPasswordValue: (employeeData as any).HRME_MSTeamsPassword ? '***' : '',
            hasLeftFlag: 'HRME_LeftFlag' in (employeeData as any),
            leftFlagValue: (employeeData as any).HRME_LeftFlag,
            hasDOL: 'HRME_DOL' in (employeeData as any),
            dolValue: (employeeData as any).HRME_DOL,
            hasLeavingReason: 'HRME_LeavingReason' in (employeeData as any),
            leavingReasonValue: (employeeData as any).HRME_LeavingReason
        });
        // Attach qualificationDetails, experienceDetails, and documentList from root level if they exist
        // These are not included in the employeedetailList items
        if ((response as any).qualificationDetails && Array.isArray((response as any).qualificationDetails)) {
            (employeeData as any).qualificationDetails = (response as any).qualificationDetails;
        }
        if ((response as any).experienceDetails && Array.isArray((response as any).experienceDetails)) {
            (employeeData as any).experienceDetails = (response as any).experienceDetails;
            console.log('🔍 [EDIT] Attached experienceDetails to employee:', (employeeData as any).experienceDetails.length, 'experiences');
        }
        if ((response as any).documentList && Array.isArray((response as any).documentList)) {
            (employeeData as any).documentList = (response as any).documentList;
            console.log('🔍 [EDIT] Attached documentList to employee:', (employeeData as any).documentList.length, 'documents');
        }
        // Attach employeebankDetails from root level if they exist
        if ((response as any).employeebankDetails && Array.isArray((response as any).employeebankDetails)) {
            (employeeData as any).employeebankDetails = (response as any).employeebankDetails;
            console.log('🔍 [EDIT] Attached employeebankDetails to employee:', (employeeData as any).employeebankDetails.length, 'bank accounts');
        }
        // Copy medical fields from root level if they exist AND are not null/empty
        // Only copy if the employee object doesn't already have a value OR if root has a non-null value
        if ((response as any).HRME_Height !== undefined && (response as any).HRME_Height !== null && (response as any).HRME_Height !== '') {
            (employeeData as any).HRME_Height = (response as any).HRME_Height;
        }
        if (
            (response as any).HRME_HeightUOM !== undefined &&
            (response as any).HRME_HeightUOM !== null &&
            (response as any).HRME_HeightUOM !== ''
        ) {
            (employeeData as any).HRME_HeightUOM = (response as any).HRME_HeightUOM;
        }
        if ((response as any).HRME_Weight !== undefined && (response as any).HRME_Weight !== null && (response as any).HRME_Weight !== '') {
            (employeeData as any).HRME_Weight = (response as any).HRME_Weight;
        }
        if (
            (response as any).HRME_WeightUOM !== undefined &&
            (response as any).HRME_WeightUOM !== null &&
            (response as any).HRME_WeightUOM !== ''
        ) {
            (employeeData as any).HRME_WeightUOM = (response as any).HRME_WeightUOM;
        }
        if (
            (response as any).HRME_EyeSightIssue !== undefined &&
            (response as any).HRME_EyeSightIssue !== null &&
            (response as any).HRME_EyeSightIssue !== ''
        ) {
            (employeeData as any).HRME_EyeSightIssue = (response as any).HRME_EyeSightIssue;
        }
        if (
            (response as any).HRME_AnyHealthIssue !== undefined &&
            (response as any).HRME_AnyHealthIssue !== null &&
            (response as any).HRME_AnyHealthIssue !== ''
        ) {
            (employeeData as any).HRME_AnyHealthIssue = (response as any).HRME_AnyHealthIssue;
        }
        if (
            (response as any).HRME_IdentificationMark !== undefined &&
            (response as any).HRME_IdentificationMark !== null &&
            (response as any).HRME_IdentificationMark !== ''
        ) {
            (employeeData as any).HRME_IdentificationMark = (response as any).HRME_IdentificationMark;
        }
        // Copy other details fields from root level if they exist
        // For strings: copy if not null and not empty string
        // For booleans: copy if not null (false is a valid value)
        // For dates: copy if not null and not empty string
        if (
            (response as any).HRME_BiometricCode !== undefined &&
            (response as any).HRME_BiometricCode !== null &&
            (response as any).HRME_BiometricCode !== ''
        ) {
            (employeeData as any).HRME_BiometricCode = (response as any).HRME_BiometricCode;
        }
        if (
            (response as any).HRME_RFCardId !== undefined &&
            (response as any).HRME_RFCardId !== null &&
            (response as any).HRME_RFCardId !== ''
        ) {
            (employeeData as any).HRME_RFCardId = (response as any).HRME_RFCardId;
        }
        // For booleans, copy even if false (false is a valid value)
        if ((response as any).HRME_ExcPunch !== undefined && (response as any).HRME_ExcPunch !== null) {
            (employeeData as any).HRME_ExcPunch = (response as any).HRME_ExcPunch;
        }
        if ((response as any).HRME_RetiredFlg !== undefined && (response as any).HRME_RetiredFlg !== null) {
            (employeeData as any).HRME_RetiredFlg = (response as any).HRME_RetiredFlg;
        }
        if (
            (response as any).HRME_PensionStoppedDate !== undefined &&
            (response as any).HRME_PensionStoppedDate !== null &&
            (response as any).HRME_PensionStoppedDate !== ''
        ) {
            (employeeData as any).HRME_PensionStoppedDate = (response as any).HRME_PensionStoppedDate;
        }
        if (
            (response as any).HRME_MSTeamsUserId !== undefined &&
            (response as any).HRME_MSTeamsUserId !== null &&
            (response as any).HRME_MSTeamsUserId !== ''
        ) {
            (employeeData as any).HRME_MSTeamsUserId = (response as any).HRME_MSTeamsUserId;
        }
        if (
            (response as any).HRME_MSTeamsPassword !== undefined &&
            (response as any).HRME_MSTeamsPassword !== null &&
            (response as any).HRME_MSTeamsPassword !== ''
        ) {
            (employeeData as any).HRME_MSTeamsPassword = (response as any).HRME_MSTeamsPassword;
        }
        // For booleans, copy even if false
        if ((response as any).HRME_LeftFlag !== undefined && (response as any).HRME_LeftFlag !== null) {
            (employeeData as any).HRME_LeftFlag = (response as any).HRME_LeftFlag;
        }
        if ((response as any).HRME_DOL !== undefined && (response as any).HRME_DOL !== null && (response as any).HRME_DOL !== '') {
            (employeeData as any).HRME_DOL = (response as any).HRME_DOL;
        }
        if (
            (response as any).HRME_LeavingReason !== undefined &&
            (response as any).HRME_LeavingReason !== null &&
            (response as any).HRME_LeavingReason !== ''
        ) {
            (employeeData as any).HRME_LeavingReason = (response as any).HRME_LeavingReason;
        }
        // Also check if employee object has these fields but they're empty - if root has them, prefer root
        // But if root is null and employee has empty string, keep empty string (don't overwrite with null)
        // Actually, the above logic already handles this - we only copy if root is not null
        console.log('🔍 [EDIT] Medical fields attached:', {
            HRME_Height: (employeeData as any).HRME_Height,
            HRME_HeightUOM: (employeeData as any).HRME_HeightUOM,
            HRME_Weight: (employeeData as any).HRME_Weight,
            HRME_WeightUOM: (employeeData as any).HRME_WeightUOM,
            HRME_EyeSightIssue: (employeeData as any).HRME_EyeSightIssue,
            HRME_AnyHealthIssue: (employeeData as any).HRME_AnyHealthIssue,
            HRME_IdentificationMark: (employeeData as any).HRME_IdentificationMark
        });
        console.log('🔍 [EDIT] Other details fields attached:', {
            HRME_BiometricCode: (employeeData as any).HRME_BiometricCode,
            HRME_RFCardId: (employeeData as any).HRME_RFCardId,
            HRME_ExcPunch: (employeeData as any).HRME_ExcPunch,
            HRME_RetiredFlg: (employeeData as any).HRME_RetiredFlg,
            HRME_PensionStoppedDate: (employeeData as any).HRME_PensionStoppedDate,
            HRME_MSTeamsUserId: (employeeData as any).HRME_MSTeamsUserId,
            HRME_MSTeamsPassword: (employeeData as any).HRME_MSTeamsPassword ? '***' : '',
            HRME_LeftFlag: (employeeData as any).HRME_LeftFlag,
            HRME_DOL: (employeeData as any).HRME_DOL,
            HRME_LeavingReason: (employeeData as any).HRME_LeavingReason
        });
        // Wrap response in success format
        return {
            success: true,
            message: 'Employee details fetched successfully',
            data: employeeData as GetEmployeeByIdResponse
        };
    } catch (error: any) {
        throw serializeError(error, 'Failed to fetch employee details');
    }
}
/**
 * Save Qualification (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveQulaification
 * This endpoint takes an array of qualification objects
 */
export async function saveQualification(qualifications: SaveQualificationRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveQulaification';
    try {
        const response = await api.post<SaveQualificationResponse>('hrms', url, qualifications);
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveQualificationResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            return response;
        }
        // Wrap raw response data
        return {
            success: true,
            message: 'Qualification details saved successfully',
            data: response as unknown as SaveQualificationResponse
        };
    } catch (error: any) {
        // Try to extract string response from error
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveQualificationResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: error.response.data !== 'Duplicate',
                message: error.response.data,
                data: error.response.data as unknown as SaveQualificationResponse
            };
        }
        throw serializeError(error, 'Failed to save qualification details');
    }
}
/**
 * Sanitize payload: Convert empty strings to null for API compatibility
 */
function sanitizePayloadForApi<T extends Record<string, any>>(payload: T): T {
    const sanitized = { ...payload };
    for (const key in sanitized) {
        if (sanitized.hasOwnProperty(key)) {
            const value = sanitized[key];
            // Convert empty strings to null
            if (typeof value === 'string' && value.trim() === '') {
                (sanitized as any)[key] = null;
            }
            // Handle nested objects (like dmoObj) - skip Date objects and arrays
            else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Check if it's a Date object
                const isDate = Object.prototype.toString.call(value) === '[object Date]';
                if (!isDate) {
                    (sanitized as any)[key] = sanitizePayloadForApi(value);
                }
            }
        }
    }
    return sanitized;
}
export async function savePersonalDetails(payload: SavePersonalDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SavePersonalDetails';
    console.log('🟠 [TERMINAL] Timestamp:', new Date().toISOString());
    try {
        // Sanitize payload: Convert empty strings to null for API compatibility
        const sanitizedPayload = sanitizePayloadForApi(payload);
        // Log complete payload structure (before sanitization)
        console.log('🟠 [TERMINAL] Payload keys:', Object.keys(payload));
        console.log('🟠 [TERMINAL] Original payload size:', JSON.stringify(payload).length, 'bytes');
        // Log critical required fields (from sanitized payload)
        console.log('   - HRMET_Id (Employee Type):', sanitizedPayload.HRMET_Id || 'MISSING');
        console.log('   - HRMGT_Id (Employee Group):', sanitizedPayload.HRMGT_Id || 'MISSING');
        console.log('   - HRMD_Id (Department):', sanitizedPayload.HRMD_Id || 'MISSING');
        console.log('   - HRMDES_Id (Designation):', sanitizedPayload.HRMDES_Id || 'MISSING');
        console.log('   - HRMG_Id (Grade):', sanitizedPayload.HRMG_Id || 'MISSING');
        console.log('   - IVRMMMS_Id (Marital Status):', sanitizedPayload.IVRMMMS_Id || 'MISSING');
        console.log('   - IVRMMG_Id (Gender):', sanitizedPayload.IVRMMG_Id || 'MISSING');
        // Check for missing required fields (from sanitized payload)
        const missingFields: string[] = [];
        if (!sanitizedPayload.HRME_EmployeeFirstName) missingFields.push('HRME_EmployeeFirstName');
        if (!sanitizedPayload.HRMET_Id || sanitizedPayload.HRMET_Id === 0) missingFields.push('HRMET_Id');
        if (!sanitizedPayload.HRMGT_Id || sanitizedPayload.HRMGT_Id === 0) missingFields.push('HRMGT_Id');
        if (!sanitizedPayload.HRMD_Id || sanitizedPayload.HRMD_Id === 0) missingFields.push('HRMD_Id');
        if (!sanitizedPayload.HRMDES_Id || sanitizedPayload.HRMDES_Id === 0) missingFields.push('HRMDES_Id');
        if (!sanitizedPayload.HRMG_Id || sanitizedPayload.HRMG_Id === 0) missingFields.push('HRMG_Id');
        if (!sanitizedPayload.HRME_MobileNo || sanitizedPayload.HRME_MobileNo === 0) missingFields.push('HRME_MobileNo');
        if (!sanitizedPayload.HRME_PerStateId || sanitizedPayload.HRME_PerStateId === 0) missingFields.push('HRME_PerStateId');
        if (!sanitizedPayload.HRME_PerCountryId || sanitizedPayload.HRME_PerCountryId === 0) missingFields.push('HRME_PerCountryId');
        if (!sanitizedPayload.HRME_PerPincode || sanitizedPayload.HRME_PerPincode === 0) missingFields.push('HRME_PerPincode');
        if (!sanitizedPayload.HRME_LocStateId || sanitizedPayload.HRME_LocStateId === 0) missingFields.push('HRME_LocStateId');
        if (!sanitizedPayload.HRME_LocCountryId || sanitizedPayload.HRME_LocCountryId === 0) missingFields.push('HRME_LocCountryId');
        if (!sanitizedPayload.HRME_LocPincode || sanitizedPayload.HRME_LocPincode === 0) missingFields.push('HRME_LocPincode');
        if (missingFields.length > 0) {
        } else {
        }
        // Create a sanitized payload for logging (exclude large image data)
        const logPayload = { ...sanitizedPayload };
        let photoSize = 0;
        let photoFormat = 'N/A';
        if (sanitizedPayload.HRME_Photo) {
            photoSize = sanitizedPayload.HRME_Photo.length;
            // Handle both base64 strings and data URLs (data:image/jpeg;base64,...)
            if (sanitizedPayload.HRME_Photo.startsWith('data:')) {
                const base64Part = sanitizedPayload.HRME_Photo.split(',')[1] || '';
                photoSize = base64Part.length;
                const mimeMatch = sanitizedPayload.HRME_Photo.match(/data:([^;]+)/);
                photoFormat = mimeMatch ? mimeMatch[1] : 'image';
                logPayload.HRME_Photo = `[DATA_URL_IMAGE - ${photoFormat} - ${(photoSize / 1024).toFixed(2)}KB - TRUNCATED FOR LOGGING]`;
            } else {
                photoFormat = 'base64';
                logPayload.HRME_Photo = `[BASE64_IMAGE_DATA - ${(photoSize / 1024).toFixed(2)}KB - TRUNCATED FOR LOGGING]`;
            }
        }
        console.log('🟠 [TERMINAL] REQUEST BODY (Empty strings converted to null, Image Data Excluded):');
        console.log(JSON.stringify(logPayload, null, 2));
        console.log('🟠 [TERMINAL] Sanitized payload size:', JSON.stringify(sanitizedPayload).length, 'bytes');
        console.log('🟠 [TERMINAL] Photo Info:', {
            present: !!sanitizedPayload.HRME_Photo,
            format: photoFormat,
            size: photoSize > 0 ? `${(photoSize / 1024).toFixed(2)}KB` : 'N/A'
        });
        // Log the actual payload values for "Other Details" fields to verify they're being sent
        console.log('🔍 [OTHER DETAILS SAVE] Server-side - Payload values (other details):', {
            HRME_BiometricCode: sanitizedPayload.HRME_BiometricCode,
            HRME_RFCardId: sanitizedPayload.HRME_RFCardId,
            HRME_ExcPunch: sanitizedPayload.HRME_ExcPunch,
            HRME_RetiredFlg: sanitizedPayload.HRME_RetiredFlg,
            HRME_PensionStoppedDate: sanitizedPayload.HRME_PensionStoppedDate,
            HRME_MSTeamsUserId: sanitizedPayload.HRME_MSTeamsUserId,
            HRME_MSTeamsPassword: sanitizedPayload.HRME_MSTeamsPassword ? '***' : '',
            HRME_LeftFlag: sanitizedPayload.HRME_LeftFlag,
            HRME_DOL: sanitizedPayload.HRME_DOL,
            HRME_LeavingReason: sanitizedPayload.HRME_LeavingReason
        });
        console.log('🔍 [SAVE] savePersonalDetails:', {
            HRME_Id: sanitizedPayload.HRME_Id,
            Code: sanitizedPayload.HRME_EmployeeCode,
            Name: `${sanitizedPayload.HRME_EmployeeFirstName} ${sanitizedPayload.HRME_EmployeeLastName}`,
            Photo: sanitizedPayload.HRME_Photo ? `${(sanitizedPayload.HRME_Photo.length / 1024).toFixed(0)}KB` : 'No photo'
        });
        // Use api.post like other modules (preadmission, etc.)
        // Note: This endpoint returns string responses like "Update", "Add", "Duplicate"
        // The apiService will throw an error when response is a string due to 'in' operator check
        // We handle this in the outer catch block
        const startTime = Date.now();
        const response = await api.post<SavePersonalDetailsResponse>('hrms', url, sanitizedPayload);
        const duration = Date.now() - startTime;
        console.log('🟢 [TERMINAL] Raw Response:', JSON.stringify(response, null, 2));
        // Log response structure
        if (typeof response === 'object' && response !== null) {
            console.log('🟢 [TERMINAL] Response Keys:', Object.keys(response));
            if ('success' in response) {
                console.log('🟢 [TERMINAL] Response.success:', (response as any).success);
            }
            if ('message' in response) {
                console.log('🟢 [TERMINAL] Response.message:', (response as any).message);
            }
            if ('data' in response) {
                console.log('🟢 [TERMINAL] Response.data exists:', !!(response as any).data);
            }
        } else if (typeof response === 'string') {
        }
        console.log('🔍 [OTHER DETAILS SAVE] Server-side - Response received:', {
            success:
                typeof response === 'object' && response !== null && 'success' in response
                    ? (response as any).success
                    : typeof response === 'string',
            message:
                typeof response === 'object' && response !== null && 'message' in response
                    ? (response as any).message
                    : typeof response === 'string'
                      ? response
                      : 'No message',
            dataType: typeof response,
            responseKeys: typeof response === 'object' && response !== null ? Object.keys(response) : []
        });
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SavePersonalDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // Check if response has success property and handle accordingly
        if (typeof response === 'object' && response !== null && 'success' in response) {
            return response as ApiResponse<SavePersonalDetailsResponse>;
        }
        // Wrap response if needed
        return {
            success: true,
            message: 'Personal details saved successfully',
            data: response as unknown as SavePersonalDetailsResponse
        };
    } catch (error: any) {
        console.log('🔴 [TERMINAL] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        console.log('🔴 [TERMINAL] Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        // Check if error is a validation error
        if (error?.response?.data) {
            const errorData = error.response.data;
            console.log(
                '🔴 [TERMINAL] Error Data Keys:',
                typeof errorData === 'object' && errorData !== null ? Object.keys(errorData) : []
            );
            // Check for validation errors
            if (errorData?.errors) {
                console.log('🔴 [TERMINAL] Validation Errors:', JSON.stringify(errorData.errors, null, 2));
            }
            // Check if error data is a string (like "Required", "Duplicate", etc.)
            if (typeof errorData === 'string') {
                console.log('🔴 [TERMINAL] String contains "Required":', errorData.includes('Required') || errorData.includes('required'));
            }
        }
        // Check if error message contains "Required"
        const errorMsgForCheck = typeof error === 'string' ? error : error?.message || '';
        const errorDataString = typeof error?.response?.data === 'string' ? error.response.data : '';
        const hasRequiredError =
            errorMsgForCheck.includes('Required') ||
            errorMsgForCheck.includes('required') ||
            errorDataString.includes('Required') ||
            errorDataString.includes('required');
        if (hasRequiredError) {
        }
        console.error('🔍 [OTHER DETAILS SAVE] Server-side - Error:', {
            message: typeof error === 'string' ? error : error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            validationErrors: error?.response?.data?.errors,
            fullError: error,
            errorType: typeof error,
            errorKeys: typeof error === 'object' && error !== null ? Object.keys(error) : []
        });
        if (error?.response?.data) {
        }
        // Create a proper error message for production
        let errorMessage = 'Failed to save employee details';
        // Try to extract string response from error
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SavePersonalDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: error.response.data !== 'Duplicate',
                message: error.response.data,
                data: error.response.data as unknown as SavePersonalDetailsResponse
            };
        }
        // Handle case where error is a string (from apiService.handleError)
        if (typeof error === 'string') {
            if (error.includes("Cannot use 'in' operator")) {
                errorMessage = 'API returned an unexpected response format. The operation may have succeeded.';
            } else {
                errorMessage = error;
            }
        } else if (error?.response?.data) {
            // Try to extract meaningful error message from API response
            const apiError = error.response.data;
            if (apiError?.message) {
                errorMessage = apiError.message;
            } else if (apiError?.error) {
                errorMessage = apiError.error;
            } else if (apiError?.errors && Array.isArray(apiError.errors)) {
                errorMessage = apiError.errors.map((e: any) => e.message || e).join(', ');
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        // Throw a serialized error (convert string to Error object if needed)
        if (typeof error === 'string') {
            throw serializeError(new Error(error), errorMessage);
        }
        throw serializeError(error, errorMessage);
    }
}
/**
 * Save Experience Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveExperienceDetails
 * This endpoint takes an array of experience objects
 */
export async function saveExperienceDetails(experiences: SaveExperienceDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveExperienceDetails';
    try {
        const response = await api.post<SaveExperienceDetailsResponse>('hrms', url, experiences);
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveExperienceDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            // Already wrapped
            return response;
        }
        // Wrap raw response data
        return {
            success: true,
            message: 'Experience details saved successfully',
            data: response as unknown as SaveExperienceDetailsResponse
        };
    } catch (error: any) {
        // Try to extract string response from error
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveExperienceDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: error.response.data !== 'Duplicate',
                message: error.response.data,
                data: error.response.data as unknown as SaveExperienceDetailsResponse
            };
        }
        throw serializeError(error, 'Failed to save experience details');
    }
}
/**
 * Save Document Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveDocumentDetails
 * This endpoint takes an array of document objects
 */
export async function saveDocumentDetails(documents: SaveDocumentDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveDocumentDetails';
    try {
        const response = await api.post<SaveDocumentDetailsResponse>('hrms', url, documents);
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveDocumentDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            return response;
        }
        // Wrap raw response data
        return {
            success: true,
            message: 'Document details saved successfully',
            data: response as unknown as SaveDocumentDetailsResponse
        };
    } catch (error: any) {
        // Try to extract string response from error
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveDocumentDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: error.response.data !== 'Duplicate',
                message: error.response.data,
                data: error.response.data as unknown as SaveDocumentDetailsResponse
            };
        }
        throw serializeError(error, 'Failed to save document details');
    }
}
/**
 * Save Medical Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveMedicalDetails
 * This endpoint takes a single employee object with medical details
 */
export async function saveMedicalDetails(payload: SaveMedicalDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveMedicalDetails';
    console.log('🟠 [TERMINAL] Timestamp:', new Date().toISOString());
    try {
        // Sanitize payload: Convert empty strings to null for API compatibility
        const sanitizedPayload = sanitizePayloadForApi(payload);
        console.log('🟠 [TERMINAL] Payload keys:', Object.keys(payload));
        console.log('🟠 [TERMINAL] Original payload size:', JSON.stringify(payload).length, 'bytes');
        // Log medical-specific fields
        // Create a sanitized payload for logging (exclude large image data)
        const logPayload = { ...sanitizedPayload };
        let photoSize = 0;
        let photoFormat = 'N/A';
        if (sanitizedPayload.HRME_Photo) {
            photoSize = sanitizedPayload.HRME_Photo.length;
            // Handle both base64 strings and data URLs (data:image/jpeg;base64,...)
            if (sanitizedPayload.HRME_Photo.startsWith('data:')) {
                const base64Part = sanitizedPayload.HRME_Photo.split(',')[1] || '';
                photoSize = base64Part.length;
                const mimeMatch = sanitizedPayload.HRME_Photo.match(/data:([^;]+)/);
                photoFormat = mimeMatch ? mimeMatch[1] : 'image';
                logPayload.HRME_Photo = `[DATA_URL_IMAGE - ${photoFormat} - ${(photoSize / 1024).toFixed(2)}KB - TRUNCATED FOR LOGGING]`;
            } else {
                photoFormat = 'base64';
                logPayload.HRME_Photo = `[BASE64_IMAGE_DATA - ${(photoSize / 1024).toFixed(2)}KB - TRUNCATED FOR LOGGING]`;
            }
        }
        console.log('🟠 [TERMINAL] REQUEST BODY (Empty strings converted to null, Image Data Excluded):');
        console.log(JSON.stringify(logPayload, null, 2));
        console.log('🟠 [TERMINAL] Sanitized payload size:', JSON.stringify(sanitizedPayload).length, 'bytes');
        console.log('🟠 [TERMINAL] Photo Info:', {
            present: !!sanitizedPayload.HRME_Photo,
            format: photoFormat,
            size: photoSize > 0 ? `${(photoSize / 1024).toFixed(2)}KB` : 'N/A'
        });
        const startTime = Date.now();
        const response = await api.post<SaveMedicalDetailsResponse>('hrms', url, sanitizedPayload);
        const duration = Date.now() - startTime;
        console.log('🟢 [TERMINAL] Raw Response:', JSON.stringify(response, null, 2));
        // Log response structure
        if (typeof response === 'object' && response !== null) {
            console.log('🟢 [TERMINAL] Response Keys:', Object.keys(response));
            if ('success' in response) {
                console.log('🟢 [TERMINAL] Response.success:', (response as any).success);
            }
            if ('message' in response) {
                console.log('🟢 [TERMINAL] Response.message:', (response as any).message);
            }
            if ('data' in response) {
                console.log('🟢 [TERMINAL] Response.data exists:', !!(response as any).data);
            }
        } else if (typeof response === 'string') {
        }
        console.log('🔍 [MEDICAL SAVE] Server-side - Response received:', {
            success: (response as any)?.success || typeof response === 'object',
            message: (response as any)?.message || 'No message',
            dataType: typeof response,
            responseKeys: typeof response === 'object' && response !== null ? Object.keys(response) : [],
            fullResponse: response
        });
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveMedicalDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            return response;
        }
        // Wrap raw response data
        return {
            success: true,
            message: 'Medical details saved successfully',
            data: response as unknown as SaveMedicalDetailsResponse
        };
    } catch (error: any) {
        console.log('🔴 [TERMINAL] Error Response Data:', JSON.stringify(error?.response?.data || {}, null, 2));
        console.log('🔴 [TERMINAL] Error Data Keys:', error?.response?.data ? Object.keys(error.response.data) : []);
        if (error?.response?.data?.errors) {
            console.log('🔴 [TERMINAL] Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
        // Try to extract string response from error
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveMedicalDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: error.response.data !== 'Duplicate',
                message: error.response.data,
                data: error.response.data as unknown as SaveMedicalDetailsResponse
            };
        }
        // Extract validation error messages
        if (error?.response?.data?.errors) {
            const validationErrors = error.response.data.errors;
            console.error('🔍 [MEDICAL SAVE] Server-side - Validation Errors:', JSON.stringify(validationErrors, null, 2));
        }
        throw serializeError(error, 'Failed to save medical details');
    }
}
/**
 * Save Other Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveOtherDetails
 * This endpoint takes a single employee object with other details
 */
export async function saveOtherDetails(payload: SaveOtherDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveOtherDetails';
    console.log('🟠 [TERMINAL] Timestamp:', new Date().toISOString());
    try {
        // Sanitize payload: Convert empty strings to null for API compatibility
        const sanitizedPayload = sanitizePayloadForApi(payload);
        console.log('🟠 [TERMINAL] Payload keys:', Object.keys(payload));
        console.log('🟠 [TERMINAL] Original payload size:', JSON.stringify(payload).length, 'bytes');
        // Log other details-specific fields
        // Create a sanitized payload for logging (exclude large image data)
        const logPayload = { ...sanitizedPayload };
        let photoSize = 0;
        let photoFormat = 'N/A';
        if (sanitizedPayload.HRME_Photo) {
            photoSize = sanitizedPayload.HRME_Photo.length;
            // Handle both base64 strings and data URLs (data:image/jpeg;base64,...)
            if (sanitizedPayload.HRME_Photo.startsWith('data:')) {
                const base64Part = sanitizedPayload.HRME_Photo.split(',')[1] || '';
                photoSize = base64Part.length;
                const mimeMatch = sanitizedPayload.HRME_Photo.match(/data:([^;]+)/);
                photoFormat = mimeMatch ? mimeMatch[1] : 'image';
                logPayload.HRME_Photo = `[DATA_URL_IMAGE - ${photoFormat} - ${(photoSize / 1024).toFixed(2)}KB - TRUNCATED FOR LOGGING]`;
            } else {
                photoFormat = 'base64';
                logPayload.HRME_Photo = `[BASE64_IMAGE_DATA - ${(photoSize / 1024).toFixed(2)}KB - TRUNCATED FOR LOGGING]`;
            }
        }
        console.log('🟠 [TERMINAL] REQUEST BODY (Empty strings converted to null, Image Data Excluded):');
        console.log(JSON.stringify(logPayload, null, 2));
        console.log('🟠 [TERMINAL] Sanitized payload size:', JSON.stringify(sanitizedPayload).length, 'bytes');
        console.log('🟠 [TERMINAL] Photo Info:', {
            present: !!sanitizedPayload.HRME_Photo,
            format: photoFormat,
            size: photoSize > 0 ? `${(photoSize / 1024).toFixed(2)}KB` : 'N/A'
        });
        const startTime = Date.now();
        const response = await api.post<SaveOtherDetailsResponse>('hrms', url, sanitizedPayload);
        const duration = Date.now() - startTime;
        console.log('🟢 [TERMINAL] Raw Response:', JSON.stringify(response, null, 2));
        // Log response structure
        if (typeof response === 'object' && response !== null) {
            console.log('🟢 [TERMINAL] Response Keys:', Object.keys(response));
            if ('success' in response) {
                console.log('🟢 [TERMINAL] Response.success:', (response as any).success);
            }
            if ('message' in response) {
                console.log('🟢 [TERMINAL] Response.message:', (response as any).message);
            }
            if ('data' in response) {
                console.log('🟢 [TERMINAL] Response.data exists:', !!(response as any).data);
            }
        } else if (typeof response === 'string') {
        }
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveOtherDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            // Already wrapped
            return response;
        }
        // Wrap raw response data
        return {
            success: true,
            message: 'Other details saved successfully',
            data: response as unknown as SaveOtherDetailsResponse
        };
    } catch (error: any) {
        console.log('🔴 [TERMINAL] Error Response Data:', JSON.stringify(error?.response?.data || {}, null, 2));
        console.log('🔴 [TERMINAL] Error Data Keys:', error?.response?.data ? Object.keys(error.response.data) : []);
        if (error?.response?.data?.errors) {
            console.log('🔴 [TERMINAL] Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
        // Try to extract string response from error
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveOtherDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: error.response.data !== 'Duplicate',
                message: error.response.data,
                data: error.response.data as unknown as SaveOtherDetailsResponse
            };
        }
        throw serializeError(error, 'Failed to save other details');
    }
}
/**
 * Save Bank Details
 * POST /api/EmployeeRegistrationNew/SaveBankDetails
 */
export async function saveBankDetails(payload: SaveBankDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveBankDetails';
    console.log('🟠 [TERMINAL] Timestamp:', new Date().toISOString());
    try {
        // Sanitize payload: Convert empty strings to null for API compatibility
        const sanitizedPayload = sanitizePayloadForApi(payload);
        // Log bank details
        if (sanitizedPayload.BankDetails && sanitizedPayload.BankDetails.length > 0) {
            sanitizedPayload.BankDetails.forEach((bank, index) => {
            });
        } else {
        }
        // Use api.post
        const startTime = Date.now();
        const response = await api.post<SaveBankDetailsResponse>('hrms', url, sanitizedPayload);
        const duration = Date.now() - startTime;
        console.log('🟢 [TERMINAL] Raw Response:', JSON.stringify(response, null, 2));
        // Log response structure
        if (typeof response === 'object' && response !== null) {
            console.log('🟢 [TERMINAL] Response Keys:', Object.keys(response));
            if ('success' in response) {
                console.log('🟢 [TERMINAL] Response.success:', (response as any).success);
            }
            if ('message' in response) {
                console.log('🟢 [TERMINAL] Response.message:', (response as any).message);
            }
            if ('data' in response) {
                console.log('🟢 [TERMINAL] Response.data exists:', !!(response as any).data);
            }
        } else if (typeof response === 'string') {
        }
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveBankDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            // Already wrapped
            return response;
        }
        // Wrap raw response data
        return {
            success: true,
            message: 'Bank details saved successfully',
            data: response as unknown as SaveBankDetailsResponse
        };
    } catch (error: any) {
        console.log('🔴 [TERMINAL] Error Response Data:', JSON.stringify(error?.response?.data || {}, null, 2));
        console.log('🔴 [TERMINAL] Error Data Keys:', error?.response?.data ? Object.keys(error.response.data) : []);
        if (error?.response?.data?.errors) {
            console.log('🔴 [TERMINAL] Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
        // Try to extract string response from error
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveBankDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: error.response.data !== 'Duplicate',
                message: error.response.data,
                data: error.response.data as unknown as SaveBankDetailsResponse
            };
        }
        throw serializeError(error, 'Failed to save bank details');
    }
}
/**
 * Calculate Salary
 * POST /api/EmployeeRegistrationNew/SalaryCalculation
 */
export async function calculateSalary(payload: SalaryCalculationRequest) {
    const url = '/api/EmployeeRegistrationNew/SalaryCalculation';
    console.log('🟡 [TERMINAL] Timestamp:', new Date().toISOString());
    try {
        const startTime = Date.now();
        const response = await api.post<SalaryCalculationResponse>('hrms', url, payload);
        const duration = Date.now() - startTime;
        console.log('🟢 [TERMINAL] Raw Response:', JSON.stringify(response, null, 2));
        const stringResponse = handleStringResponse<SalaryCalculationResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            return response;
        }
        return {
            success: true,
            message: 'Salary calculated successfully',
            data: response as unknown as SalaryCalculationResponse
        };
    } catch (error: any) {
        console.log('🔴 [TERMINAL] Error Response Data:', JSON.stringify(error?.response?.data || {}, null, 2));
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: false,
                message: stringResponse,
                data: stringResponse as unknown as SalaryCalculationResponse
            };
        }
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: false,
                message: error.response.data,
                data: error.response.data as unknown as SalaryCalculationResponse
            };
        }
        throw serializeError(error, 'Failed to calculate salary');
    }
}
/**
 * Get Employee Salary Details (Load Payroll Data)
 * POST /api/EmployeeRegistrationNew/getEmployeeSalaryDetails
 */
export async function getEmployeeSalaryDetails(payload: GetEmployeeSalaryDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/getEmployeeSalaryDetails';
    const response = await api.post<GetEmployeeSalaryDetailsResponse>('hrms', url, payload);
    // Check if response is already wrapped
    if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
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
    if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
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
    try {
        const response = await api.post<SaveIncrementDetailsResponse>('hrms', url, payload);
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveIncrementDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // Check if response is already wrapped
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            return response;
        }
        // Wrap raw response data
        return {
            success: true,
            message: 'Increment details saved successfully',
            data: response as unknown as SaveIncrementDetailsResponse
        };
    } catch (error: any) {
        // Try to extract string response from error
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveIncrementDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: error.response.data !== 'Duplicate',
                message: error.response.data,
                data: error.response.data as unknown as SaveIncrementDetailsResponse
            };
        }
        throw serializeError(error, 'Failed to save increment details');
    }
}
/**
 * Save Earning Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveEarningDetails
 */
export async function saveEarningDetails(payload: SaveEarningDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveEarningDetails';
    console.log('🔍 [PAYROLL SAVE] Server - SaveEarningDetails called', {
        url,
        employeeId: payload.Employee.HRME_Id,
        miId: payload.Employee.MI_Id,
        earningsCount: payload.EmployeeEarningDeductionArrear.length,
        earnings: payload.EmployeeEarningDeductionArrear.map((item) => ({
            HREED_Id: item.HREED_Id,
            HRMED_Id: item.HRMED_Id,
            HREED_Amount: item.HREED_Amount,
            HREED_Percentage: item.HREED_Percentage,
            HREED_ActiveFlag: item.HREED_ActiveFlag
        }))
    });
    try {
        let response: any;
        try {
            response = await api.post<SaveEarningDetailsResponse>('hrms', url, payload);
        } catch (apiError: any) {
            // Try to extract the actual response data from the error
            // The apiService might have the response in error.response or error.data
            const actualResponseData = apiError?.response?.data || apiError?.data || apiError?.message;
            console.log('🔍 [PAYROLL SAVE] Server - SaveEarningDetails - API Error caught:', {
                errorType: typeof apiError,
                hasResponse: !!apiError?.response,
                responseData:
                    typeof actualResponseData === 'string'
                        ? actualResponseData
                        : typeof actualResponseData === 'object'
                          ? JSON.stringify(actualResponseData).substring(0, 200)
                          : actualResponseData,
                errorMessage: apiError?.message?.substring(0, 100)
            });
            // Re-throw to be caught by outer catch block
            throw apiError;
        }
        console.log('🔍 [PAYROLL SAVE] Server - SaveEarningDetails - Raw API response', {
            responseType: typeof response,
            isString: typeof response === 'string',
            isObject: typeof response === 'object',
            responseValue:
                typeof response === 'string'
                    ? response
                    : typeof response === 'object'
                      ? JSON.stringify(response).substring(0, 200)
                      : response
        });
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveEarningDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // Check if response is already wrapped
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            return response;
        }
        // Wrap the response
        return {
            success: true,
            message: 'Earning details saved successfully',
            data: response as unknown as SaveEarningDetailsResponse
        };
    } catch (error: any) {
        // Try to get the original axios response before apiService processed it
        const originalResponse = error?.response || error?.config?.__originalResponse;
        const rawResponseData = originalResponse?.data || error?.response?.data;
        console.log('🔍 [PAYROLL SAVE] Server - SaveEarningDetails catch:', {
            errorType: typeof error,
            hasMessage: !!error?.message,
            messagePreview: error?.message?.substring(0, 50),
            hasResponseData: !!error?.response?.data,
            responseDataType: typeof error?.response?.data,
            rawResponseDataType: typeof rawResponseData,
            rawResponseDataValue:
                typeof rawResponseData === 'string'
                    ? rawResponseData
                    : typeof rawResponseData === 'object'
                      ? JSON.stringify(rawResponseData).substring(0, 200)
                      : rawResponseData,
            axiosResponseStatus: originalResponse?.status,
            axiosResponseStatusText: originalResponse?.statusText
        });
        // Handle case where error is a string (from apiService.handleError)
        if (typeof error === 'string') {
            console.log('🔍 [PAYROLL SAVE] Server - Error is string:', error.substring(0, 50));
            if (error.toLowerCase().includes('error') || error.toLowerCase().includes('failed')) {
                return {
                    success: false,
                    message: error,
                    data: null as unknown as SaveEarningDetailsResponse
                };
            }
            const stringResponse = extractStringFromError({ message: error });
            if (stringResponse) {
                return {
                    success: stringResponse !== 'Duplicate',
                    message: stringResponse,
                    data: stringResponse as unknown as SaveEarningDetailsResponse
                };
            }
        }
        // Try to extract string response from error message
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveEarningDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            const dataString = error.response.data;
            if (['Update', 'Add', 'Duplicate'].includes(dataString)) {
                return {
                    success: dataString !== 'Duplicate',
                    message: dataString,
                    data: dataString as unknown as SaveEarningDetailsResponse
                };
            }
            return {
                success: false,
                message: dataString,
                data: null as unknown as SaveEarningDetailsResponse
            };
        }
        // If error is a TypeError with 'in' operator message, extract the actual error
        if (error?.message?.includes("Cannot use 'in' operator")) {
            const match = error.message.match(/in\s+['"]?([^'"]+)['"]?/i);
            if (match?.[1]) {
                const extractedMessage = match[1].trim();
                if (['Update', 'Add', 'Duplicate'].includes(extractedMessage)) {
                    return {
                        success: extractedMessage !== 'Duplicate',
                        message: extractedMessage,
                        data: extractedMessage as unknown as SaveEarningDetailsResponse
                    };
                }
                return {
                    success: false,
                    message: extractedMessage,
                    data: null as unknown as SaveEarningDetailsResponse
                };
            }
        }
        // Return error response instead of throwing
        const errorMessage = error?.message || 'Failed to save earning details';
        console.log('🔍 [PAYROLL SAVE] Server - Returning default error:', errorMessage.substring(0, 50));
        return {
            success: false,
            message: errorMessage,
            data: null as unknown as SaveEarningDetailsResponse
        };
    }
}
/**
 * Save Arrear Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveArrearDetails
 */
export async function saveArrearDetails(payload: SaveArrearDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveArrearDetails';
    console.log('🔍 [PAYROLL SAVE] Server - SaveArrearDetails called', {
        url,
        employeeId: payload.Employee.HRME_Id,
        miId: payload.Employee.MI_Id,
        arrearsCount: payload.EmployeeEarningDeductionArrear.length,
        arrears: payload.EmployeeEarningDeductionArrear.map((item) => ({
            HREED_Id: item.HREED_Id,
            HRMED_Id: item.HRMED_Id,
            HREED_Amount: item.HREED_Amount,
            HREED_Percentage: item.HREED_Percentage,
            HREED_ActiveFlag: item.HREED_ActiveFlag
        }))
    });
    try {
        const response = await api.post<SaveArrearDetailsResponse>('hrms', url, payload);
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveArrearDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // Check if response is already wrapped
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            return response;
        }
        // Wrap the response
        return {
            success: true,
            message: 'Arrear details saved successfully',
            data: response as unknown as SaveArrearDetailsResponse
        };
    } catch (error: any) {
        // Try to extract string response from error
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveArrearDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return {
                success: error.response.data !== 'Duplicate',
                message: error.response.data,
                data: error.response.data as unknown as SaveArrearDetailsResponse
            };
        }
        throw serializeError(error, 'Failed to save arrear details');
    }
}
/**
 * Save Deduction Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveDeductionDetails
 */
export async function saveDeductionDetails(payload: SaveDeductionDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveDeductionDetails';
    console.log('🔍 [PAYROLL SAVE] Server - SaveDeductionDetails called', {
        url,
        employeeId: payload.Employee.HRME_Id,
        miId: payload.Employee.MI_Id,
        deductionsCount: payload.EmployeeEarningDeductionArrear.length,
        deductions: payload.EmployeeEarningDeductionArrear.map((item) => ({
            HREED_Id: item.HREED_Id,
            HRMED_Id: item.HRMED_Id,
            HREED_Amount: item.HREED_Amount,
            HREED_Percentage: item.HREED_Percentage,
            HREED_ActiveFlag: item.HREED_ActiveFlag
        }))
    });
    try {
        let response: any;
        try {
            response = await api.post<SaveDeductionDetailsResponse>('hrms', url, payload);
        } catch (apiError: any) {
            // Try to extract the actual response data from the error
            // The apiService might have the response in error.response or error.data
            const actualResponseData = apiError?.response?.data || apiError?.data || apiError?.message;
            console.log('🔍 [PAYROLL SAVE] Server - SaveDeductionDetails - API Error caught:', {
                errorType: typeof apiError,
                hasResponse: !!apiError?.response,
                responseData:
                    typeof actualResponseData === 'string'
                        ? actualResponseData
                        : typeof actualResponseData === 'object'
                          ? JSON.stringify(actualResponseData).substring(0, 200)
                          : actualResponseData,
                errorMessage: apiError?.message?.substring(0, 100)
            });
            // Re-throw to be caught by outer catch block
            throw apiError;
        }
        console.log('🔍 [PAYROLL SAVE] Server - SaveDeductionDetails - Raw API response', {
            responseType: typeof response,
            isString: typeof response === 'string',
            isObject: typeof response === 'object',
            responseValue:
                typeof response === 'string'
                    ? response
                    : typeof response === 'object'
                      ? JSON.stringify(response).substring(0, 200)
                      : response
        });
        // Check if response is a string (like "Add", "Update", "Duplicate")
        const stringResponse = handleStringResponse<SaveDeductionDetailsResponse>(response);
        if (stringResponse) {
            return stringResponse;
        }
        // Check if response is already wrapped
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            return response;
        }
        // Wrap the response
        return {
            success: true,
            message: 'Deduction details saved successfully',
            data: response as unknown as SaveDeductionDetailsResponse
        };
    } catch (error: any) {
        // Try to get the original axios response before apiService processed it
        const originalResponse = error?.response || error?.config?.__originalResponse;
        const rawResponseData = originalResponse?.data || error?.response?.data;
        console.log('🔍 [PAYROLL SAVE] Server - SaveDeductionDetails catch:', {
            errorType: typeof error,
            hasMessage: !!error?.message,
            messagePreview: error?.message?.substring(0, 50),
            hasResponseData: !!error?.response?.data,
            responseDataType: typeof error?.response?.data,
            rawResponseDataType: typeof rawResponseData,
            rawResponseDataValue:
                typeof rawResponseData === 'string'
                    ? rawResponseData
                    : typeof rawResponseData === 'object'
                      ? JSON.stringify(rawResponseData).substring(0, 200)
                      : rawResponseData,
            axiosResponseStatus: originalResponse?.status,
            axiosResponseStatusText: originalResponse?.statusText
        });
        // Handle case where error is a string (from apiService.handleError)
        if (typeof error === 'string') {
            console.log('🔍 [PAYROLL SAVE] Server - Error is string:', error.substring(0, 50));
            if (error.toLowerCase().includes('error') || error.toLowerCase().includes('failed')) {
                return {
                    success: false,
                    message: error,
                    data: null as unknown as SaveDeductionDetailsResponse
                };
            }
            const stringResponse = extractStringFromError({ message: error });
            if (stringResponse) {
                return {
                    success: stringResponse !== 'Duplicate',
                    message: stringResponse,
                    data: stringResponse as unknown as SaveDeductionDetailsResponse
                };
            }
        }
        // Try to extract string response from error message
        const stringResponse = extractStringFromError(error);
        if (stringResponse) {
            return {
                success: stringResponse !== 'Duplicate',
                message: stringResponse,
                data: stringResponse as unknown as SaveDeductionDetailsResponse
            };
        }
        // Check if error.response.data is a string
        if (error?.response?.data && typeof error.response.data === 'string') {
            const dataString = error.response.data;
            if (['Update', 'Add', 'Duplicate'].includes(dataString)) {
                return {
                    success: dataString !== 'Duplicate',
                    message: dataString,
                    data: dataString as unknown as SaveDeductionDetailsResponse
                };
            }
            return {
                success: false,
                message: dataString,
                data: null as unknown as SaveDeductionDetailsResponse
            };
        }
        // If error is a TypeError with 'in' operator message, extract the actual error
        if (error?.message?.includes("Cannot use 'in' operator")) {
            const match = error.message.match(/in\s+['"]?([^'"]+)['"]?/i);
            if (match?.[1]) {
                const extractedMessage = match[1].trim();
                if (['Update', 'Add', 'Duplicate'].includes(extractedMessage)) {
                    return {
                        success: extractedMessage !== 'Duplicate',
                        message: extractedMessage,
                        data: extractedMessage as unknown as SaveDeductionDetailsResponse
                    };
                }
                return {
                    success: false,
                    message: extractedMessage,
                    data: null as unknown as SaveDeductionDetailsResponse
                };
            }
        }
        // Return error response instead of throwing
        const errorMessage = error?.message || 'Failed to save deduction details';
        console.log('🔍 [PAYROLL SAVE] Server - Returning default error:', errorMessage.substring(0, 50));
        return {
            success: false,
            message: errorMessage,
            data: null as unknown as SaveDeductionDetailsResponse
        };
    }
}
/**
 * Get States by Country ID
 * GET /api/EmployeeRegistrationNew/getstateDropdownByCountryId/{id}
 */
export async function getStatesByCountryId(countryId: number) {
    const url = `/api/EmployeeRegistrationNew/getstateDropdownByCountryId/${countryId}`;
    try {
        const response = await api.get<EmployeeRegisterOnloadResponse>('hrms', url);
        // The backend returns raw data with AllState array
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
            // Already wrapped - check if data has AllState or if response itself has AllState
            const responseData = (response as any).data;
            const allState = responseData?.AllState || (response as any)?.AllState || [];
            return {
                success: true,
                message: 'States loaded successfully',
                data: {
                    AllState: allState
                } as unknown as EmployeeRegisterOnloadResponse
            };
        }
        // Extract AllState from response (response might be the data object directly)
        const allState = (response as any)?.AllState || (response as any)?.data?.AllState || [];
        // Wrap raw response data
        return {
            success: true,
            message: 'States loaded successfully',
            data: {
                AllState: allState
            } as unknown as EmployeeRegisterOnloadResponse
        };
    } catch (error: any) {
        throw serializeError(error, 'Failed to load states');
    }
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
