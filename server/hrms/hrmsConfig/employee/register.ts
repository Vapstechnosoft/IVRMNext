'use server';

import { api } from '@/lib/apiService';
import { HRMS_MI_ID } from '@/constants/hrms-config';
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
    
    try {
        const response = await api.post<EmployeeRegisterOnloadResponse>('hrms', url, payload);
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
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
        console.error('🔍 [SERVER] getEmployeeRegisterOnload ERROR:', error?.message);
        throw error;
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
    
    console.log('🔍 [EDIT] Fetching employee from API:', id);
    
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
                console.log('🔍 [EDIT] Employee found in list:', employeeData?.HRME_EmployeeCode, employeeData?.HRME_EmployeeFirstName);
                
            }
            
            // If not found in list, try root level (fallback)
            if (!employeeData && response.HRME_Id === id) {
                employeeData = response;
                console.log('🔍 [EDIT] Employee found at root level');
            }
        }
        
        if (!employeeData) {
            console.error('🔍 [EDIT] Employee not found in response');
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
        
        // Copy medical fields from root level if they exist AND are not null/empty
        // Only copy if the employee object doesn't already have a value OR if root has a non-null value
        if ((response as any).HRME_Height !== undefined && (response as any).HRME_Height !== null && (response as any).HRME_Height !== '') {
            (employeeData as any).HRME_Height = (response as any).HRME_Height;
        }
        if ((response as any).HRME_HeightUOM !== undefined && (response as any).HRME_HeightUOM !== null && (response as any).HRME_HeightUOM !== '') {
            (employeeData as any).HRME_HeightUOM = (response as any).HRME_HeightUOM;
        }
        if ((response as any).HRME_Weight !== undefined && (response as any).HRME_Weight !== null && (response as any).HRME_Weight !== '') {
            (employeeData as any).HRME_Weight = (response as any).HRME_Weight;
        }
        if ((response as any).HRME_WeightUOM !== undefined && (response as any).HRME_WeightUOM !== null && (response as any).HRME_WeightUOM !== '') {
            (employeeData as any).HRME_WeightUOM = (response as any).HRME_WeightUOM;
        }
        if ((response as any).HRME_EyeSightIssue !== undefined && (response as any).HRME_EyeSightIssue !== null && (response as any).HRME_EyeSightIssue !== '') {
            (employeeData as any).HRME_EyeSightIssue = (response as any).HRME_EyeSightIssue;
        }
        if ((response as any).HRME_AnyHealthIssue !== undefined && (response as any).HRME_AnyHealthIssue !== null && (response as any).HRME_AnyHealthIssue !== '') {
            (employeeData as any).HRME_AnyHealthIssue = (response as any).HRME_AnyHealthIssue;
        }
        if ((response as any).HRME_IdentificationMark !== undefined && (response as any).HRME_IdentificationMark !== null && (response as any).HRME_IdentificationMark !== '') {
            (employeeData as any).HRME_IdentificationMark = (response as any).HRME_IdentificationMark;
        }
        
        // Copy other details fields from root level if they exist
        // For strings: copy if not null and not empty string
        // For booleans: copy if not null (false is a valid value)
        // For dates: copy if not null and not empty string
        if ((response as any).HRME_BiometricCode !== undefined && (response as any).HRME_BiometricCode !== null && (response as any).HRME_BiometricCode !== '') {
            (employeeData as any).HRME_BiometricCode = (response as any).HRME_BiometricCode;
        }
        if ((response as any).HRME_RFCardId !== undefined && (response as any).HRME_RFCardId !== null && (response as any).HRME_RFCardId !== '') {
            (employeeData as any).HRME_RFCardId = (response as any).HRME_RFCardId;
        }
        // For booleans, copy even if false (false is a valid value)
        if ((response as any).HRME_ExcPunch !== undefined && (response as any).HRME_ExcPunch !== null) {
            (employeeData as any).HRME_ExcPunch = (response as any).HRME_ExcPunch;
        }
        if ((response as any).HRME_RetiredFlg !== undefined && (response as any).HRME_RetiredFlg !== null) {
            (employeeData as any).HRME_RetiredFlg = (response as any).HRME_RetiredFlg;
        }
        if ((response as any).HRME_PensionStoppedDate !== undefined && (response as any).HRME_PensionStoppedDate !== null && (response as any).HRME_PensionStoppedDate !== '') {
            (employeeData as any).HRME_PensionStoppedDate = (response as any).HRME_PensionStoppedDate;
        }
        if ((response as any).HRME_MSTeamsUserId !== undefined && (response as any).HRME_MSTeamsUserId !== null && (response as any).HRME_MSTeamsUserId !== '') {
            (employeeData as any).HRME_MSTeamsUserId = (response as any).HRME_MSTeamsUserId;
        }
        if ((response as any).HRME_MSTeamsPassword !== undefined && (response as any).HRME_MSTeamsPassword !== null && (response as any).HRME_MSTeamsPassword !== '') {
            (employeeData as any).HRME_MSTeamsPassword = (response as any).HRME_MSTeamsPassword;
        }
        // For booleans, copy even if false
        if ((response as any).HRME_LeftFlag !== undefined && (response as any).HRME_LeftFlag !== null) {
            (employeeData as any).HRME_LeftFlag = (response as any).HRME_LeftFlag;
        }
        if ((response as any).HRME_DOL !== undefined && (response as any).HRME_DOL !== null && (response as any).HRME_DOL !== '') {
            (employeeData as any).HRME_DOL = (response as any).HRME_DOL;
        }
        if ((response as any).HRME_LeavingReason !== undefined && (response as any).HRME_LeavingReason !== null && (response as any).HRME_LeavingReason !== '') {
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
        console.error('🔍 [EDIT] ERROR:', error?.message);
        throw error;
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
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            return response;
        }
        
        // Wrap raw response data
        return {
            success: true,
            message: 'Qualification details saved successfully',
            data: response as unknown as SaveQualificationResponse
        };
    } catch (error: any) {
        throw error;
    }
}

/**
 * Save Personal Details (combined Employee + Address) on Address tab save
 * POST /api/EmployeeRegistrationNew/SavePersonalDetails
 */
export async function savePersonalDetails(payload: SavePersonalDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SavePersonalDetails';
    
    try {
        console.log('🔍 [OTHER DETAILS SAVE] Server-side - Starting save:', {
            employeeId: payload.HRME_Id || 'N/A',
            otherDetailsFields: {
                biometricCode: payload.HRME_BiometricCode || 'N/A',
                rfCardId: payload.HRME_RFCardId || 'N/A',
                punchRelaxation: payload.HRME_ExcPunch || false,
                stopPension: payload.HRME_RetiredFlg || false,
                dateOfStopPension: payload.HRME_PensionStoppedDate || 'N/A',
                msTeamsUserName: payload.HRME_MSTeamsUserId || 'N/A',
                msTeamsPassword: payload.HRME_MSTeamsPassword ? '***' : 'N/A',
                employeeLeft: payload.HRME_LeftFlag || false,
                lastWorkingDay: payload.HRME_DOL || 'N/A',
                reasonForLeaving: payload.HRME_LeavingReason || 'N/A'
            },
            payloadKeys: Object.keys(payload)
        });
        
        // Log the actual payload values for "Other Details" fields to verify they're being sent
        console.log('🔍 [OTHER DETAILS SAVE] Server-side - Payload values (other details):', {
            HRME_BiometricCode: payload.HRME_BiometricCode,
            HRME_RFCardId: payload.HRME_RFCardId,
            HRME_ExcPunch: payload.HRME_ExcPunch,
            HRME_RetiredFlg: payload.HRME_RetiredFlg,
            HRME_PensionStoppedDate: payload.HRME_PensionStoppedDate,
            HRME_MSTeamsUserId: payload.HRME_MSTeamsUserId,
            HRME_MSTeamsPassword: payload.HRME_MSTeamsPassword ? '***' : '',
            HRME_LeftFlag: payload.HRME_LeftFlag,
            HRME_DOL: payload.HRME_DOL,
            HRME_LeavingReason: payload.HRME_LeavingReason
        });
        
        console.log('🔍 [SAVE] savePersonalDetails:', {
            HRME_Id: payload.HRME_Id,
            Code: payload.HRME_EmployeeCode,
            Name: `${payload.HRME_EmployeeFirstName} ${payload.HRME_EmployeeLastName}`,
            Photo: payload.HRME_Photo ? `${(payload.HRME_Photo.length / 1024).toFixed(0)}KB` : 'No photo'
        });
        
        const response = await api.post<SavePersonalDetailsResponse>('hrms', url, payload);
        
        console.log('🔍 [OTHER DETAILS SAVE] Server-side - Response received:', {
            success: typeof response === 'object' && 'success' in response ? (response as any).success : typeof response === 'string',
            message: typeof response === 'object' && 'message' in response ? (response as any).message : typeof response === 'string' ? response : 'No message',
            dataType: typeof response,
            responseKeys: typeof response === 'object' ? Object.keys(response) : []
        });
        
        // Check if response is directly a string (like "Add", "Update", "Duplicate")
        if (typeof response === 'string') {
            console.log('🔍 [SAVE] String response:', response);
            return {
                success: response !== 'Duplicate',
                message: response,
                data: response as unknown as SavePersonalDetailsResponse
            };
        }
        
        // Wrap response if needed
        return {
            success: true,
            message: 'Personal details saved successfully',
            data: response as unknown as SavePersonalDetailsResponse
        };
    } catch (error: any) {
        console.error('🔍 [OTHER DETAILS SAVE] Server-side - Error:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            validationErrors: error?.response?.data?.errors,
            fullError: error
        });
        console.error('🔍 [SAVE] ERROR:', error?.message);
        console.error('🔍 [SAVE] Status:', error?.response?.status);
        if (error?.response?.data) {
            console.error('🔍 [SAVE] API Error:', error.response.data);
        }
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
    
    try {
        const response = await api.post<SaveDocumentDetailsResponse>('hrms', url, documents);
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Handle string responses like 'Add' or 'Update' as success
        if (typeof response === 'string') {
            return {
                success: true,
                message: 'Document details saved successfully',
                data: response as unknown as SaveDocumentDetailsResponse
            };
        }
        
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            return response;
        }
        
        // Wrap raw response data
        return {
            success: true,
            message: 'Document details saved successfully',
            data: response as unknown as SaveDocumentDetailsResponse
        };
    } catch (error: any) {
        throw error;
    }
}

/**
 * Save Medical Details (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveMedicalDetails
 * This endpoint takes a single employee object with medical details
 */
export async function saveMedicalDetails(payload: SaveMedicalDetailsRequest) {
    const url = '/api/EmployeeRegistrationNew/SaveMedicalDetails';
    
    console.log('🔍 [MEDICAL SAVE] Server-side - Starting save:', {
        employeeId: payload.HRME_Id || 'N/A',
        medicalFields: {
            height: payload.HRME_Height || 'N/A',
            heightUnit: payload.HRME_HeightUOM || 'N/A',
            weight: payload.HRME_Weight || 'N/A',
            weightUnit: payload.HRME_WeightUOM || 'N/A',
            eyeSightIssue: payload.HRME_EyeSightIssue || 'N/A',
            anyHealthIssue: payload.HRME_AnyHealthIssue || 'N/A',
            identificationMark: payload.HRME_IdentificationMark || 'N/A'
        },
        payloadKeys: Object.keys(payload)
    });
    
    try {
        const response = await api.post<SaveMedicalDetailsResponse>('hrms', url, payload);
        
        console.log('🔍 [MEDICAL SAVE] Server-side - Response received:', {
            success: (response as any)?.success || typeof response === 'object',
            message: (response as any)?.message || 'No message',
            dataType: typeof response,
            responseKeys: typeof response === 'object' ? Object.keys(response) : [],
            fullResponse: response
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Handle string responses like 'Add' or 'Update' as success
        if (typeof response === 'string') {
            const wrappedResponse = {
                success: true,
                message: 'Medical details saved successfully',
                data: response as unknown as SaveMedicalDetailsResponse
            };
            console.log('🔍 [MEDICAL SAVE] Server-side - String response wrapped:', wrappedResponse);
            return wrappedResponse;
        }
        
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            return response;
        }
        
        // Wrap raw response data
        return {
            success: true,
            message: 'Medical details saved successfully',
            data: response as unknown as SaveMedicalDetailsResponse
        };
    } catch (error: any) {
        console.error('🔍 [MEDICAL SAVE] Server-side - Error:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            validationErrors: error?.response?.data?.errors,
            fullError: error
        });
        
        // Extract validation error messages
        if (error?.response?.data?.errors) {
            const validationErrors = error.response.data.errors;
            console.error('🔍 [MEDICAL SAVE] Server-side - Validation Errors:', JSON.stringify(validationErrors, null, 2));
        }
        
        throw error;
    }
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
    
    console.log('🔍 [PAYROLL SAVE] Server - SaveEarningDetails called', {
        url,
        earningsCount: earnings.length,
        earnings: earnings.map((item) => ({
            HREED_Id: item.HREED_Id,
            HRME_Id: item.HRME_Id,
            HRMED_Id: item.HRMED_Id,
            HRMED_Name: item.HRMED_Name,
            HREED_Amount: item.HREED_Amount,
            HREED_Percentage: item.HREED_Percentage,
            HREED_ActiveFlag: item.HREED_ActiveFlag
        }))
    });
    
    try {
        const response = await api.post<SaveEarningDetailsResponse>('hrms', url, earnings);
        
        console.log('🔍 [PAYROLL SAVE] Server - SaveEarningDetails API response', {
            success: response?.success,
            message: response?.message,
            data: response?.data,
            fullResponse: response
        });
        
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
    } catch (error: any) {
        console.error('🔍 [PAYROLL SAVE] Server - SaveEarningDetails error', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            fullError: error
        });
        throw error;
    }
}

/**
 * Save Arrear Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveArrearDetails
 */
export async function saveArrearDetails(arrears: SaveArrearDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveArrearDetails';
    
    console.log('🔍 [PAYROLL SAVE] Server - SaveArrearDetails called', {
        url,
        arrearsCount: arrears.length,
        arrears: arrears.map((item) => ({
            HREED_Id: item.HREED_Id,
            HRME_Id: item.HRME_Id,
            HRMED_Id: item.HRMED_Id,
            HRMED_Name: item.HRMED_Name,
            HREED_Amount: item.HREED_Amount,
            HREED_Percentage: item.HREED_Percentage,
            HREED_ActiveFlag: item.HREED_ActiveFlag
        }))
    });
    
    try {
        const response = await api.post<SaveArrearDetailsResponse>('hrms', url, arrears);
        
        console.log('🔍 [PAYROLL SAVE] Server - SaveArrearDetails API response', {
            success: response?.success,
            message: response?.message,
            data: response?.data,
            fullResponse: response
        });
        
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
    } catch (error: any) {
        console.error('🔍 [PAYROLL SAVE] Server - SaveArrearDetails error', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            fullError: error
        });
        throw error;
    }
}

/**
 * Save Deduction Details (Payroll Tab)
 * POST /api/EmployeeRegistrationNew/SaveDeductionDetails
 */
export async function saveDeductionDetails(deductions: SaveDeductionDetailsRequest[]) {
    const url = '/api/EmployeeRegistrationNew/SaveDeductionDetails';
    
    console.log('🔍 [PAYROLL SAVE] Server - SaveDeductionDetails called', {
        url,
        deductionsCount: deductions.length,
        deductions: deductions.map((item) => ({
            HREED_Id: item.HREED_Id,
            HRME_Id: item.HRME_Id,
            HRMED_Id: item.HRMED_Id,
            HRMED_Name: item.HRMED_Name,
            HREED_Amount: item.HREED_Amount,
            HREED_Percentage: item.HREED_Percentage,
            HREED_ActiveFlag: item.HREED_ActiveFlag
        }))
    });
    
    try {
        const response = await api.post<SaveDeductionDetailsResponse>('hrms', url, deductions);
        
        console.log('🔍 [PAYROLL SAVE] Server - SaveDeductionDetails API response', {
            success: response?.success,
            message: response?.message,
            data: response?.data,
            fullResponse: response
        });
        
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
    } catch (error: any) {
        console.error('🔍 [PAYROLL SAVE] Server - SaveDeductionDetails error', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            fullError: error
        });
        throw error;
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

