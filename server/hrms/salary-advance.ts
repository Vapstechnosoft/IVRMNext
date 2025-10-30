// Salary Advance API Integration - Complete Implementation

import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type { SalaryAdvanceInput, SalaryAdvanceRequest, SalaryAdvanceResponse } from '@/types/hrms/salary-advance';
import axios from 'axios';

// Helper function to create a complete request body matching the exact API structure
function createSalaryAdvanceRequestBody(baseFields: Partial<SalaryAdvanceRequest>): SalaryAdvanceRequest {
    const now = new Date().toISOString();

    // Create a sample employee object for empadvaList
    const sampleEmployee = {
        CreatedDate: now,
        UpdatedDate: now,
        HRME_Id: 0,
        MI_Id: 0,
        HRMET_Id: 0,
        HRMGT_Id: 0,
        HRMD_Id: 0,
        HRMDES_Id: 0,
        HRMG_Id: 0,
        HRME_EmployeeFirstName: 'string',
        HRME_EmployeeMiddleName: 'string',
        HRME_EmployeeLastName: 'string',
        HRME_EmployeeCode: 'string',
        HRME_BiometricCode: 'string',
        HRME_RFCardId: 'string',
        HRME_PerStreet: 'string',
        HRME_PerArea: 'string',
        HRME_PerCity: 'string',
        HRME_PerAdd4: 'string',
        HRME_PerStateId: 0,
        HRME_PerCountryId: 0,
        HRME_PerPincode: 0,
        HRME_LocStreet: 'string',
        HRME_LocArea: 'string',
        HRME_LocCity: 'string',
        HRME_LocAdd4: 'string',
        HRME_LocStateId: 0,
        HRME_LocCountryId: 0,
        HRME_LocPincode: 0,
        IVRMMMS_Id: 0,
        IVRMMG_Id: 0,
        CasteCategoryId: 0,
        CasteId: 0,
        ReligionId: 0,
        HRME_FatherName: 'string',
        HRME_MotherName: 'string',
        HRME_SpouseName: 'string',
        HRME_SpouseOccupation: 'string',
        HRME_SpouseMobileNo: 0,
        HRME_SpouseEmailId: 'string',
        HRME_SpouseAddress: 'string',
        HRME_DOB: now,
        HRME_DOJ: now,
        HRME_ExpectedRetirementDate: now,
        HRME_PFDate: now,
        HRME_ESIDate: now,
        HRME_MobileNo: 0,
        HRME_EmailId: 'string',
        HRME_BloodGroup: 'string',
        HRME_PaymentType: 'string',
        HRME_BankAccountNo: 'string',
        HRME_PFApplicableFlag: true,
        HRME_PFMaxFlag: true,
        HRME_PFFixedFlag: true,
        HRME_PFAccNo: 'string',
        HRME_ESIAccNo: 'string',
        HRME_GratuityAccNo: 'string',
        HRME_ESIApplicableFlag: true,
        HRME_Photo: 'string',
        HRME_LeftFlag: true,
        HRME_DOL: now,
        HRME_LeavingReason: 'string',
        HRME_Height: 'string',
        HRME_HeightUOM: 'string',
        HRME_Weight: 0,
        HRME_WeightUOM: 'string',
        HRME_IdentificationMark: 'string',
        HRME_ApprovalNo: 'string',
        HRME_PANCardNo: 'string',
        HRME_AadharCardNo: 0,
        HRME_SubstituteFlag: true,
        HRME_NationalSSN: 'string',
        HRME_SalaryType: 'string',
        HRME_EmployeeOrder: 0,
        HRME_ActiveFlag: true,
        HRME_UINumber: 'string',
        HRME_DOC: now,
        HRME_SubjectsTaught: 'string',
        HRME_AppDownloadedDeviceId: 'string',
        HRME_PHDResearchGuideFlg: true,
        HRME_TechNonTeachingFlg: 'string',
        HRME_RGRecognitionYear: 0,
        HRME_AnyHealthIssue: 'string',
        HRME_EyeSightIssue: 'string',
        HRME_TransfferedTo: 0,
        HRME_RecordTransferredFlg: true,
        HRME_MSTeamsUserId: 'string',
        HRME_MSTeamsEmailId: 'string',
        HRME_MSTeamsPassword: 'string',
        HRME_ExcPunch: true,
        HRME_RetiredFlg: true,
        HRME_PensionStoppedDate: now,
        HRME_FPFNotApplicableFlg: true,
        HRME_EPFNotApplicableFlg: true,
        HRME_AllowSoftwareAccessFlg: true
    };

    // Create empadvaList item with actual form data
    const empadvaItem = {
        CreatedDate: now,
        UpdatedDate: now,
        HRESA_Id: baseFields.HRESA_Id || 0,
        MI_Id: baseFields.MI_Id || 30,
        HRME_Id: baseFields.HRME_Id || 0,
        HRESA_EntryDate: baseFields.HRESA_EntryDate || now,
        HRESA_AdvYear: baseFields.HRESA_AdvYear || 0,
        HRESA_AdvMonth: baseFields.HRESA_AdvMonth || 'string',
        HRESA_Remarks: baseFields.HRESA_Remarks || 'string',
        HRESA_AdvStatus: baseFields.HRESA_AdvStatus || 'string',
        HRESA_ActiveFlag: baseFields.HRESA_ActiveFlag !== undefined ? baseFields.HRESA_ActiveFlag : true,
        HRESA_AppliedAmount: baseFields.HRESA_AppliedAmount || 0,
        HRESA_SanctinedAmount: baseFields.HRESA_SanctinedAmount || 0,
        HRESA_ModeOfPayment: baseFields.HRESA_ModeOfPayment || 'string',
        HRESA_ReferenceNo: baseFields.HRESA_ReferenceNo || 0,
        MasterEmployee: sampleEmployee
    };

    // Create sample dropdown items
    const sampleEmployeeDropdown = {
        CreatedDate: now,
        UpdatedDate: now,
        HRME_Id: 0,
        MI_Id: 0,
        HRMET_Id: 0,
        HRMGT_Id: 0,
        HRMD_Id: 0,
        HRMDES_Id: 0,
        HRMG_Id: 0,
        HRME_EmployeeFirstName: 'string',
        HRME_EmployeeMiddleName: 'string',
        HRME_EmployeeLastName: 'string',
        HRME_EmployeeCode: 'string',
        HRME_BiometricCode: 'string',
        HRME_RFCardId: 'string',
        HRME_PerStreet: 'string',
        HRME_PerArea: 'string',
        HRME_PerCity: 'string',
        HRME_PerAdd4: 'string',
        HRME_PerStateId: 0,
        HRME_PerCountryId: 0,
        HRME_PerPincode: 0,
        HRME_LocStreet: 'string',
        HRME_LocArea: 'string',
        HRME_LocCity: 'string',
        HRME_LocAdd4: 'string',
        HRME_LocStateId: 0,
        HRME_LocCountryId: 0,
        HRME_LocPincode: 0,
        IVRMMMS_Id: 0,
        IVRMMG_Id: 0,
        CasteCategoryId: 0,
        CasteId: 0,
        ReligionId: 0,
        HRME_FatherName: 'string',
        HRME_MotherName: 'string',
        HRME_SpouseName: 'string',
        HRME_SpouseOccupation: 'string',
        HRME_SpouseMobileNo: 0,
        HRME_SpouseEmailId: 'string',
        HRME_SpouseAddress: 'string',
        HRME_DOB: now,
        HRME_DOJ: now,
        HRME_ExpectedRetirementDate: now,
        HRME_PFDate: now,
        HRME_ESIDate: now,
        HRME_MobileNo: 0,
        HRME_EmailId: 'string',
        HRME_BloodGroup: 'string',
        HRME_PaymentType: 'string',
        HRME_BankAccountNo: 'string',
        HRME_PFApplicableFlag: true,
        HRME_PFMaxFlag: true,
        HRME_PFFixedFlag: true,
        HRME_PFAccNo: 'string',
        HRME_ESIAccNo: 'string',
        HRME_GratuityAccNo: 'string',
        HRME_ESIApplicableFlag: true,
        HRME_Photo: 'string',
        HRME_LeftFlag: true,
        HRME_DOL: now,
        HRME_LeavingReason: 'string',
        HRME_Height: 'string',
        HRME_HeightUOM: 'string',
        HRME_Weight: 0,
        HRME_WeightUOM: 'string',
        HRME_IdentificationMark: 'string',
        HRME_ApprovalNo: 'string',
        HRME_PANCardNo: 'string',
        HRME_AadharCardNo: 0,
        HRME_SubstituteFlag: true,
        HRME_NationalSSN: 'string',
        HRME_SalaryType: 'string',
        HRME_EmployeeOrder: 0,
        HRME_ActiveFlag: true,
        HRME_UINumber: 'string',
        HRME_DOC: now,
        HRME_SubjectsTaught: 'string',
        HRME_AppDownloadedDeviceId: 'string',
        HRME_PHDResearchGuideFlg: true,
        HRME_TechNonTeachingFlg: 'string',
        HRME_RGRecognitionYear: 0,
        HRME_AnyHealthIssue: 'string',
        HRME_EyeSightIssue: 'string',
        HRME_TransfferedTo: 0,
        HRME_RecordTransferredFlg: true,
        HRME_MSTeamsUserId: 'string',
        HRME_MSTeamsEmailId: 'string',
        HRME_MSTeamsPassword: 'string',
        HRME_ExcPunch: true,
        HRME_RetiredFlg: true,
        HRME_PensionStoppedDate: now,
        HRME_FPFNotApplicableFlg: true,
        HRME_EPFNotApplicableFlg: true,
        HRME_AllowSoftwareAccessFlg: true
    };

    const sampleLeaveYearDropdown = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMLY_Id: 0,
        MI_Id: 0,
        HRMLY_LeaveYear: 'string',
        HRMLY_FromDate: now,
        HRMLY_ToDate: now,
        HRMLY_ActiveFlag: true,
        HRMLY_LeaveYearOrder: 0
    };

    const sampleMonthDropdown = {
        IVRM_Month_Id: 0,
        IVRM_Month_Name: 'string',
        Is_Active: true,
        IVRM_Month_Max_Days: 0
    };

    const sampleModeOfPaymentDropdown = {
        CreatedDate: now,
        UpdatedDate: now,
        IVRMMOD_Id: 0,
        MI_Id: 0,
        IVRMMOD_ModeOfPayment: 'string',
        IVRMMOD_ActiveFlag: true,
        IVRMMOD_Flag: 'string',
        IVRMMOD_ModeOfPayment_Code: 'string',
        IVRMMOD_CreatedBy: 0,
        IVRMMOD_UpdatedBy: 0
    };

    const sampleConfigurationDetails = {
        HRC_Id: 0,
        MI_Id: 0,
        HRC_PFMaxAmt: 0,
        HRC_FPFPer: 0,
        HRC_EPFPer: 0,
        HRC_AsPerEmpFlag: true,
        HRC_PFAccNoPrefix: 'string',
        HRC_AccNo2: 0,
        HRC_AccNo21: 0,
        HRC_AccNo22: 0,
        HRC_RetirementYrs: 0,
        HRC_ECodePrefix: 'string',
        HRC_ESIMax: 0,
        HRC_ESIEmplrCont: 0,
        HRC_PayMethodFlg: 'string',
        HRC_ArrSalaryFlag: true,
        HRC_CummArrFlag: true,
        HRC_SalaryFromDay: 0,
        HRC_SalaryToDay: 0,
        HRC_ARTFPFPer: 0,
        HRC_ARTEPFPer: 0,
        HRC_ESIMaxAmount: 0,
        HRC_AC2MinAmount: 0,
        HRC_AC21MinAmount: 0,
        HRC_AC22MinAmount: 0,
        HRC_SalAdvApprovalFlg: true,
        HRC_LoanApprovalFlg: true,
        HRC_LeaveApprovalFlg: true,
        HRC_IncrementApprovalFlg: true,
        HRC_ProbationApprovalFlg: true,
        HRC_SalApprovalFlg: true,
        HRC_EducationCess: 0,
        roleId: 0,
        retrunMsg: 'string',
        hrStandardList: [
            {
                HRC_Id: 0,
                MI_Id: 0,
                HRC_PFMaxAmt: 0,
                HRC_FPFPer: 0,
                HRC_EPFPer: 0,
                HRC_AsPerEmpFlag: true,
                HRC_PFAccNoPrefix: 'string',
                HRC_AccNo2: 0,
                HRC_AccNo21: 0,
                HRC_AccNo22: 0,
                HRC_RetirementYrs: 0,
                HRC_ECodePrefix: 'string',
                HRC_ESIMax: 0,
                HRC_ESIEmplrCont: 0,
                HRC_PayMethodFlg: 'string',
                HRC_ArrSalaryFlag: true,
                HRC_CummArrFlag: true,
                HRC_SalaryFromDay: 0,
                HRC_SalaryToDay: 0,
                HRC_ARTFPFPer: 0,
                HRC_ARTEPFPer: 0,
                HRC_ESIMaxAmount: 0,
                HRC_AC2MinAmount: 0,
                HRC_AC21MinAmount: 0,
                HRC_AC22MinAmount: 0,
                HRC_SalAdvApprovalFlg: true,
                HRC_LoanApprovalFlg: true,
                HRC_LeaveApprovalFlg: true,
                HRC_IncrementApprovalFlg: true,
                HRC_ProbationApprovalFlg: true,
                HRC_SalApprovalFlg: true,
                HRC_EducationCess: 0,
                HRC_partAmaxflag: 0,
                HRC_partBmaxflag: 0,
                HRC_IncrementOnFlag: 'string',
                HRC_IncrementMonth: 'string',
                HRC_IncrementPercentage: 0,
                HRC_SplIncrementOnceInYr: 0,
                HRC_MinimumWorkingPeriod: 0,
                HRC_FixedIncrmentFlg: true,
                HRC_NoOfOptionalHolidays: 0,
                HRC_IncrementOnceInMonths: 0,
                HRC_AlertDay: 0
            }
        ],
        monthdropdown: [
            {
                IVRM_Month_Id: 0,
                IVRM_Month_Name: 'string',
                Is_Active: true,
                IVRM_Month_Max_Days: 0
            }
        ],
        HRC_partAmaxflag: 0,
        HRC_partBmaxflag: 0,
        HRC_IncrementMonth: 'string',
        HRC_MinimumWorkingPeriod: 0,
        HRC_FixedIncrmentFlg: true,
        HRC_NoOfOptionalHolidays: 0,
        HRC_IncrementOnceInMonths: 0,
        HRC_AlertDay: 0
    };

    return {
        CreatedDate: baseFields.CreatedDate || now,
        UpdatedDate: baseFields.UpdatedDate || now,
        HRESA_Id: baseFields.HRESA_Id || 0,
        MI_Id: baseFields.MI_Id || 30,
        HRME_Id: baseFields.HRME_Id || 0,
        HRESA_EntryDate: baseFields.HRESA_EntryDate || now,
        HRESA_AdvYear: baseFields.HRESA_AdvYear || 0,
        HRESA_AdvMonth: baseFields.HRESA_AdvMonth || 'string',
        HRESA_AppliedAmount: baseFields.HRESA_AppliedAmount || 0,
        HRESA_Remarks: baseFields.HRESA_Remarks || 'string',
        HRESA_ActiveFlag: baseFields.HRESA_ActiveFlag !== undefined ? baseFields.HRESA_ActiveFlag : true,
        HRESA_AdvStatus: baseFields.HRESA_AdvStatus || 'string',
        HRESA_SanctinedAmount: baseFields.HRESA_SanctinedAmount || 0,
        HRESA_ModeOfPayment: baseFields.HRESA_ModeOfPayment || 'string',
        HRESA_ReferenceNo: baseFields.HRESA_ReferenceNo || 0,
        empadvaList: baseFields.empadvaList || [empadvaItem],
        retrunMsg: baseFields.retrunMsg || 'string',
        roleId: baseFields.roleId || 0,
        HRME_EmployeeFirstName: baseFields.HRME_EmployeeFirstName || 'string',
        HRME_EmployeeMiddleName: baseFields.HRME_EmployeeMiddleName || 'string',
        HRME_EmployeeLastName: baseFields.HRME_EmployeeLastName || 'string',
        employeedropdown: baseFields.employeedropdown || [sampleEmployeeDropdown],
        leaveyeardropdown: baseFields.leaveyeardropdown || [sampleLeaveYearDropdown],
        monthdropdown: baseFields.monthdropdown || [sampleMonthDropdown],
        modeOfPaymentdropdown: baseFields.modeOfPaymentdropdown || [sampleModeOfPaymentDropdown],
        configurationDetails: baseFields.configurationDetails || sampleConfigurationDetails,
        empGrossSal: baseFields.empGrossSal || 0,
        totalAppliedAmount: baseFields.totalAppliedAmount || 0,
        searchfilter: baseFields.searchfilter || 'string'
    };
}

/**
 * Get salary advance onload details
 * POST /api/HREmpSalaryAdvanceFacade/onloadgetdetails
 */
export async function getSalaryAdvanceList(roleId: number = 2): Promise<ApiResponse<SalaryAdvanceResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpSalaryAdvanceFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody = createSalaryAdvanceRequestBody({
            MI_Id: 30,
            roleId: roleId
        });

        const axiosResponse = await axios.post<SalaryAdvanceResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        const response: ApiResponse<SalaryAdvanceResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Salary advance data loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Salary Advance Onload API Error ===');
        console.error('Error:', error);

        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<SalaryAdvanceResponse> = {
                success: false,
                message:
                    error.response?.data?.retrunMsg || error.response?.data?.message || error.message || 'Failed to load salary advance data',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Save/Update salary advance
 * POST /api/HREmpSalaryAdvanceFacade
 */
export async function saveSalaryAdvance(data: SalaryAdvanceInput): Promise<ApiResponse<SalaryAdvanceResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpSalaryAdvanceFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = createSalaryAdvanceRequestBody({
            HRESA_Id: data.HRESA_Id || 0,
            MI_Id: data.MI_Id || 30,
            HRME_Id: data.HRME_Id || 0,
            HRESA_EntryDate: data.HRESA_EntryDate,
            HRESA_AdvYear: data.HRESA_AdvYear || 0,
            HRESA_AdvMonth: data.HRESA_AdvMonth || 'string',
            HRESA_AppliedAmount: data.HRESA_AppliedAmount || 0,
            HRESA_Remarks: data.HRESA_Remarks || 'string',
            HRESA_ActiveFlag: data.HRESA_ActiveFlag !== undefined ? data.HRESA_ActiveFlag : true,
            HRESA_AdvStatus: data.HRESA_AdvStatus || 'string',
            HRESA_SanctinedAmount: data.HRESA_SanctinedAmount || 0,
            HRESA_ModeOfPayment: data.HRESA_ModeOfPayment || 'string',
            HRESA_ReferenceNo: data.HRESA_ReferenceNo || 0,
            roleId: data.roleId || 0,
            searchfilter: data.searchfilter || 'string'
        });

        const axiosResponse = await axios.post<SalaryAdvanceResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<SalaryAdvanceResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Salary advance saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Salary Advance API Error ===');
        console.error('Error:', error);

        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<SalaryAdvanceResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || error.response?.data?.message || error.message || 'Failed to save salary advance',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Delete salary advance
 * POST /api/HREmpSalaryAdvanceFacade/delete
 */
export async function deleteSalaryAdvance(hresaId: number): Promise<ApiResponse<SalaryAdvanceResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpSalaryAdvanceFacade/delete';
        const url = `${baseURL}${apiPath}`;

        const requestBody = createSalaryAdvanceRequestBody({
            HRESA_Id: hresaId,
            MI_Id: 30
        });

        const axiosResponse = await axios.post<SalaryAdvanceResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<SalaryAdvanceResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Salary advance deleted successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Delete Salary Advance API Error ===');
        console.error('Error:', error);

        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<SalaryAdvanceResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || error.response?.data?.message || error.message || 'Failed to delete salary advance',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Activate/Deactivate salary advance record by ID
 * POST /api/HREmpSalaryAdvanceFacade/deactivateRecordById
 */
export async function toggleSalaryAdvanceStatus(hresaId: number): Promise<ApiResponse<SalaryAdvanceResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpSalaryAdvanceFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = createSalaryAdvanceRequestBody({
            HRESA_Id: hresaId,
            MI_Id: 30
        });

        const axiosResponse = await axios.post<SalaryAdvanceResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<SalaryAdvanceResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Toggle Salary Advance Status API Error ===');
        console.error('Error:', error);

        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<SalaryAdvanceResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || error.response?.data?.message || error.message || 'Failed to update status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}
