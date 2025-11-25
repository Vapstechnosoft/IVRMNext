'use server';

import { api } from '@/lib/apiService';
import type { SalaryAdvanceOnloadResponse, SalaryAdvanceSaveRequest } from '@/types/hrms/salary-advance';

// Helper function to create a complete request body matching the exact API structure
function createSalaryAdvanceRequestBody(baseFields: any): any {
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
export async function getSalaryAdvanceList(roleId: number = 2) {
    console.log('🔵 [SALARY ADVANCE - BACKEND] getSalaryAdvanceList - START');
    console.log('📥 [SALARY ADVANCE - BACKEND] Request payload:', { roleId });
    
    const url = '/api/HREmpSalaryAdvanceFacade/onloadgetdetails';
    console.log('🌐 [SALARY ADVANCE - BACKEND] API URL:', url);
    console.log('🌐 [SALARY ADVANCE - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY ADVANCE - BACKEND] Method: POST');
    
    // Prepare request body matching the exact API structure
    const now = new Date().toISOString();
    const requestBody = {
        CreatedDate: now,
        UpdatedDate: now,
        HRESA_Id: 0,
        MI_Id: 30,
        HRME_Id: 0,
        HRESA_EntryDate: now,
        HRESA_AdvYear: 0,
        HRESA_AdvMonth: 'string',
        HRESA_AppliedAmount: 0,
        HRESA_Remarks: 'string',
        HRESA_ActiveFlag: true,
        HRESA_AdvStatus: 'string',
        HRESA_SanctinedAmount: 0,
        HRESA_ModeOfPayment: 'string',
        HRESA_ReferenceNo: 0,
        empadvaList: [],
        retrunMsg: 'string',
        Status: 'string',
        roleId: roleId || 0,
        HRME_EmployeeFirstName: 'string',
        HRME_EmployeeMiddleName: 'string',
        HRME_EmployeeLastName: 'string',
        employeedropdown: [],
        leaveyeardropdown: [],
        monthdropdown: [],
        modeOfPaymentdropdown: [],
        configurationDetails: {
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
            hrStandardList: [],
            monthdropdown: [],
            HRC_partAmaxflag: 0,
            HRC_partBmaxflag: 0,
            HRC_IncrementMonth: 'string',
            HRC_MinimumWorkingPeriod: 0,
            HRC_FixedIncrmentFlg: true,
            HRC_NoOfOptionalHolidays: 0,
            HRC_IncrementOnceInMonths: 0,
            HRC_AlertDay: 0
        },
        empGrossSal: 0,
        totalAppliedAmount: 0,
        searchfilter: 'string'
    };
    
    console.log('📤 [SALARY ADVANCE - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY ADVANCE - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        roleId: requestBody.roleId,
        HRESA_Id: requestBody.HRESA_Id,
        HRME_Id: requestBody.HRME_Id
    });
    
    try {
        const response = await api.post<SalaryAdvanceOnloadResponse>('hrms', url, requestBody);
        
        console.log('✅ [SALARY ADVANCE - BACKEND] API Response received');
        console.log('📤 [SALARY ADVANCE - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryAdvanceOnloadResponse;
            console.log('✅ [SALARY ADVANCE - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY ADVANCE - BACKEND] Response data summary:', {
                hasEmpadvaList: !!responseData?.empadvaList,
                empadvaListCount: Array.isArray(responseData?.empadvaList) ? responseData.empadvaList.length : 0,
                hasEmployeeDropdown: !!responseData?.employeedropdown,
                employeeCount: Array.isArray(responseData?.employeedropdown) ? responseData.employeedropdown.length : 0,
                hasLeaveYearDropdown: !!responseData?.leaveyeardropdown,
                leaveYearCount: Array.isArray(responseData?.leaveyeardropdown) ? responseData.leaveyeardropdown.length : 0,
                hasMonthDropdown: !!responseData?.monthdropdown,
                monthCount: Array.isArray(responseData?.monthdropdown) ? responseData.monthdropdown.length : 0,
                hasModeOfPaymentDropdown: !!responseData?.modeOfPaymentdropdown,
                modeOfPaymentCount: Array.isArray(responseData?.modeOfPaymentdropdown) ? responseData.modeOfPaymentdropdown.length : 0,
                hasConfigurationDetails: !!responseData?.configurationDetails,
                retrunMsg: responseData?.retrunMsg
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Data loaded successfully',
                data: responseData
            };
        }
        
        // Wrap raw response data
        console.log('⚠️ [SALARY ADVANCE - BACKEND] Response not wrapped, wrapping it');
        return {
            success: true,
            message: 'Data loaded successfully',
            data: response as unknown as SalaryAdvanceOnloadResponse
        };
    } catch (error: any) {
        console.error('❌ [SALARY ADVANCE - BACKEND] Error in getSalaryAdvanceList:', error);
        console.error('❌ [SALARY ADVANCE - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to load salary advance data',
            data: undefined
        };
    }
}

/**
 * Save/Update salary advance
 * POST /api/HREmpSalaryAdvanceFacade
 */
export async function saveSalaryAdvance(data: SalaryAdvanceSaveRequest) {
    console.log('🔵 [SALARY ADVANCE - BACKEND] saveSalaryAdvance - START');
    console.log('📥 [SALARY ADVANCE - BACKEND] Request payload:', JSON.stringify(data, null, 2));
    
    const url = '/api/HREmpSalaryAdvanceFacade';
    console.log('🌐 [SALARY ADVANCE - BACKEND] API URL:', url);
    console.log('🌐 [SALARY ADVANCE - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY ADVANCE - BACKEND] Method: POST');
    
    // Prepare request body matching the exact API structure
    const now = new Date().toISOString();
    
    // Create MasterEmployee object - using HRME_Id from data, with 'string' defaults
    const masterEmployee = {
        CreatedDate: now,
        UpdatedDate: now,
        HRME_Id: data.HRME_Id || 0,
        MI_Id: data.MI_Id || 30,
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
        HRME_doc: now,
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
        HRESA_Id: data.HRESA_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRME_Id: data.HRME_Id || 0,
        HRESA_EntryDate: data.HRESA_EntryDate || now,
        HRESA_AdvYear: data.HRESA_AdvYear || 0,
        HRESA_AdvMonth: data.HRESA_AdvMonth || 'string',
        HRESA_Remarks: data.HRESA_Remarks || 'string',
        HRESA_AdvStatus: data.HRESA_AdvStatus || 'string',
        HRESA_ActiveFlag: data.HRESA_ActiveFlag !== undefined ? data.HRESA_ActiveFlag : true,
        HRESA_AppliedAmount: data.HRESA_AppliedAmount || 0,
        HRESA_SanctinedAmount: data.HRESA_SanctinedAmount || 0,
        HRESA_ModeOfPayment: data.HRESA_ModeOfPayment || 'string',
        HRESA_ReferenceNo: data.HRESA_ReferenceNo || 0,
        MasterEmployee: masterEmployee
    };

    // Build configurationDetails structure with 'string' defaults
    const configurationDetails = {
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
        roleId: data.roleId || 0,
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

    // Create sample dropdown items with 'string' defaults
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
        HRME_doc: now,
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

    const requestBody = {
        CreatedDate: now,
        UpdatedDate: now,
        HRESA_Id: data.HRESA_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRME_Id: data.HRME_Id || 0,
        HRESA_EntryDate: data.HRESA_EntryDate || now,
        HRESA_AdvYear: data.HRESA_AdvYear || 0,
        HRESA_AdvMonth: data.HRESA_AdvMonth || 'string',
        HRESA_AppliedAmount: data.HRESA_AppliedAmount || 0,
        HRESA_Remarks: data.HRESA_Remarks || 'string',
        HRESA_ActiveFlag: data.HRESA_ActiveFlag !== undefined ? data.HRESA_ActiveFlag : true,
        HRESA_AdvStatus: data.HRESA_AdvStatus || 'string',
        HRESA_SanctinedAmount: data.HRESA_SanctinedAmount || 0,
        HRESA_ModeOfPayment: data.HRESA_ModeOfPayment || 'string',
        HRESA_ReferenceNo: data.HRESA_ReferenceNo || 0,
        empadvaList: [empadvaItem],
        retrunMsg: 'string',
        Status: 'string',
        roleId: data.roleId || 0,
        HRME_EmployeeFirstName: 'string',
        HRME_EmployeeMiddleName: 'string',
        HRME_EmployeeLastName: 'string',
        employeedropdown: [sampleEmployeeDropdown],
        leaveyeardropdown: [sampleLeaveYearDropdown],
        monthdropdown: [sampleMonthDropdown],
        modeOfPaymentdropdown: [sampleModeOfPaymentDropdown],
        configurationDetails: configurationDetails,
        empGrossSal: 0,
        totalAppliedAmount: 0,
        searchfilter: 'string'
    };
    
    console.log('📤 [SALARY ADVANCE - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY ADVANCE - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        HRESA_Id: requestBody.HRESA_Id,
        HRME_Id: requestBody.HRME_Id,
        HRESA_AppliedAmount: requestBody.HRESA_AppliedAmount,
        HRESA_AdvStatus: requestBody.HRESA_AdvStatus,
        roleId: requestBody.roleId,
        empadvaListCount: requestBody.empadvaList.length
    });
    
    try {
        const response = await api.post<SalaryAdvanceOnloadResponse>('hrms', url, requestBody);
        
        console.log('✅ [SALARY ADVANCE - BACKEND] API Response received');
        console.log('📤 [SALARY ADVANCE - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryAdvanceOnloadResponse;
            console.log('✅ [SALARY ADVANCE - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY ADVANCE - BACKEND] Response data summary:', {
                hasEmpadvaList: !!responseData?.empadvaList,
                empadvaListCount: Array.isArray(responseData?.empadvaList) ? responseData.empadvaList.length : 0,
                retrunMsg: responseData?.retrunMsg,
                Status: responseData?.Status
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Salary advance saved successfully',
                data: responseData
            };
        }
        
        // Wrap raw response data
        console.log('⚠️ [SALARY ADVANCE - BACKEND] Response not wrapped, wrapping it');
        return {
            success: true,
            message: 'Salary advance saved successfully',
            data: response as unknown as SalaryAdvanceOnloadResponse
        };
    } catch (error: any) {
        console.error('❌ [SALARY ADVANCE - BACKEND] Error in saveSalaryAdvance:', error);
        console.error('❌ [SALARY ADVANCE - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to save salary advance',
            data: undefined
        };
    }
}

/**
 * Get salary advance record by ID
 * GET /api/HREmpSalaryAdvanceFacade/getRecordById/{id}
 */
export async function getSalaryAdvanceById(id: number) {
    console.log('🔵 [SALARY ADVANCE - BACKEND] getSalaryAdvanceById - START');
    console.log('📥 [SALARY ADVANCE - BACKEND] Request ID:', id);
    
    const url = `/api/HREmpSalaryAdvanceFacade/getRecordById/${id}`;
    console.log('🌐 [SALARY ADVANCE - BACKEND] API URL:', url);
    console.log('🌐 [SALARY ADVANCE - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY ADVANCE - BACKEND] Method: GET');
    
    try {
        const response = await api.get<SalaryAdvanceOnloadResponse>('hrms', url);
        
        console.log('✅ [SALARY ADVANCE - BACKEND] API Response received');
        console.log('📤 [SALARY ADVANCE - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryAdvanceOnloadResponse;
            console.log('✅ [SALARY ADVANCE - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY ADVANCE - BACKEND] Response data summary:', {
                hasEmpadvaList: !!responseData?.empadvaList,
                empadvaListCount: Array.isArray(responseData?.empadvaList) ? responseData.empadvaList.length : 0,
                HRESA_Id: responseData?.HRESA_Id,
                retrunMsg: responseData?.retrunMsg
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Salary advance record retrieved successfully',
                data: responseData
            };
        }
        
        // Wrap raw response data
        console.log('⚠️ [SALARY ADVANCE - BACKEND] Response not wrapped, wrapping it');
        return {
            success: true,
            message: 'Salary advance record retrieved successfully',
            data: response as unknown as SalaryAdvanceOnloadResponse
        };
    } catch (error: any) {
        console.error('❌ [SALARY ADVANCE - BACKEND] Error in getSalaryAdvanceById:', error);
        console.error('❌ [SALARY ADVANCE - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to retrieve salary advance record',
            data: undefined
        };
    }
}

/**
 * Get salary advance details by employee ID
 * POST /api/HREmpSalaryAdvanceFacade/getDetailsByEmployee
 */
export async function getSalaryAdvanceDetailsByEmployee(employeeId: number) {
    console.log('🔵 [SALARY ADVANCE - BACKEND] getSalaryAdvanceDetailsByEmployee - START');
    console.log('📥 [SALARY ADVANCE - BACKEND] Request payload:', { employeeId });
    
    const url = '/api/HREmpSalaryAdvanceFacade/getDetailsByEmployee';
    console.log('🌐 [SALARY ADVANCE - BACKEND] API URL:', url);
    console.log('🌐 [SALARY ADVANCE - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY ADVANCE - BACKEND] Method: POST');
    
    // Prepare request body matching the exact API structure
    const now = new Date().toISOString();
    
    // Create MasterEmployee object with 'string' defaults
    const masterEmployee = {
        CreatedDate: now,
        UpdatedDate: now,
        HRME_Id: employeeId || 0,
        MI_Id: 30,
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
        HRME_doc: now,
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

    // Create empadvaList item
    const empadvaItem = {
        CreatedDate: now,
        UpdatedDate: now,
        HRESA_Id: 0,
        MI_Id: 30,
        HRME_Id: employeeId || 0,
        HRESA_EntryDate: now,
        HRESA_AdvYear: 0,
        HRESA_AdvMonth: 'string',
        HRESA_Remarks: 'string',
        HRESA_AdvStatus: 'string',
        HRESA_ActiveFlag: true,
        HRESA_AppliedAmount: 0,
        HRESA_SanctinedAmount: 0,
        HRESA_ModeOfPayment: 'string',
        HRESA_ReferenceNo: 0,
        MasterEmployee: masterEmployee
    };

    // Create sample dropdown items with 'string' defaults
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
        HRME_doc: now,
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

    // Build configurationDetails structure with 'string' defaults
    const configurationDetails = {
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
        monthdropdown: [sampleMonthDropdown],
        HRC_partAmaxflag: 0,
        HRC_partBmaxflag: 0,
        HRC_IncrementMonth: 'string',
        HRC_MinimumWorkingPeriod: 0,
        HRC_FixedIncrmentFlg: true,
        HRC_NoOfOptionalHolidays: 0,
        HRC_IncrementOnceInMonths: 0,
        HRC_AlertDay: 0
    };

    const requestBody = {
        CreatedDate: now,
        UpdatedDate: now,
        HRESA_Id: 0,
        MI_Id: 30,
        HRME_Id: employeeId || 0,
        HRESA_EntryDate: now,
        HRESA_AdvYear: 0,
        HRESA_AdvMonth: 'string',
        HRESA_AppliedAmount: 0,
        HRESA_Remarks: 'string',
        HRESA_ActiveFlag: true,
        HRESA_AdvStatus: 'string',
        HRESA_SanctinedAmount: 0,
        HRESA_ModeOfPayment: 'string',
        HRESA_ReferenceNo: 0,
        empadvaList: [empadvaItem],
        retrunMsg: 'string',
        Status: 'string',
        roleId: 0,
        HRME_EmployeeFirstName: 'string',
        HRME_EmployeeMiddleName: 'string',
        HRME_EmployeeLastName: 'string',
        employeedropdown: [sampleEmployeeDropdown],
        leaveyeardropdown: [sampleLeaveYearDropdown],
        monthdropdown: [sampleMonthDropdown],
        modeOfPaymentdropdown: [sampleModeOfPaymentDropdown],
        configurationDetails: configurationDetails,
        empGrossSal: 0,
        totalAppliedAmount: 0,
        searchfilter: 'string'
    };
    
    console.log('📤 [SALARY ADVANCE - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY ADVANCE - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        HRME_Id: requestBody.HRME_Id,
        HRESA_Id: requestBody.HRESA_Id,
        empadvaListCount: requestBody.empadvaList.length
    });
    
    try {
        const response = await api.post<SalaryAdvanceOnloadResponse>('hrms', url, requestBody);
        
        console.log('✅ [SALARY ADVANCE - BACKEND] API Response received');
        console.log('📤 [SALARY ADVANCE - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryAdvanceOnloadResponse;
            console.log('✅ [SALARY ADVANCE - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY ADVANCE - BACKEND] Response data summary:', {
                hasEmpadvaList: !!responseData?.empadvaList,
                empadvaListCount: Array.isArray(responseData?.empadvaList) ? responseData.empadvaList.length : 0,
                retrunMsg: responseData?.retrunMsg,
                Status: responseData?.Status
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Salary advance details retrieved successfully',
                data: responseData
            };
        }
        
        // Wrap raw response data
        console.log('⚠️ [SALARY ADVANCE - BACKEND] Response not wrapped, wrapping it');
        return {
            success: true,
            message: 'Salary advance details retrieved successfully',
            data: response as unknown as SalaryAdvanceOnloadResponse
        };
    } catch (error: any) {
        console.error('❌ [SALARY ADVANCE - BACKEND] Error in getSalaryAdvanceDetailsByEmployee:', error);
        console.error('❌ [SALARY ADVANCE - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to retrieve salary advance details by employee',
            data: undefined
        };
    }
}

/**
 * Search filter salary advance
 * POST /api/HREmpSalaryAdvanceFacade/searchfilter
 */
export async function searchSalaryAdvanceFilter(miId: number, searchFilter: string) {
    console.log('🔵 [SALARY ADVANCE - BACKEND] searchSalaryAdvanceFilter - START');
    console.log('📥 [SALARY ADVANCE - BACKEND] Request payload:', { miId, searchFilter });
    
    const url = '/api/HREmpSalaryAdvanceFacade/searchfilter';
    console.log('🌐 [SALARY ADVANCE - BACKEND] API URL:', url);
    console.log('🌐 [SALARY ADVANCE - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY ADVANCE - BACKEND] Method: POST');
    
    // Prepare request body matching the exact API structure
    const requestBody = {
        MI_Id: miId || 30,
        searchfilter: searchFilter || ''
    };
    
    console.log('📤 [SALARY ADVANCE - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY ADVANCE - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        searchfilter: requestBody.searchfilter
    });
    
    try {
        const response = await api.post<SalaryAdvanceOnloadResponse>('hrms', url, requestBody);
        
        console.log('✅ [SALARY ADVANCE - BACKEND] API Response received');
        console.log('📤 [SALARY ADVANCE - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryAdvanceOnloadResponse;
            console.log('✅ [SALARY ADVANCE - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY ADVANCE - BACKEND] Response data summary:', {
                hasEmpadvaList: !!responseData?.empadvaList,
                empadvaListCount: Array.isArray(responseData?.empadvaList) ? responseData.empadvaList.length : 0,
                retrunMsg: responseData?.retrunMsg,
                Status: responseData?.Status
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Salary advance search completed successfully',
                data: responseData
            };
        }
        
        // Wrap raw response data
        console.log('⚠️ [SALARY ADVANCE - BACKEND] Response not wrapped, wrapping it');
        return {
            success: true,
            message: 'Salary advance search completed successfully',
            data: response as unknown as SalaryAdvanceOnloadResponse
        };
    } catch (error: any) {
        console.error('❌ [SALARY ADVANCE - BACKEND] Error in searchSalaryAdvanceFilter:', error);
        console.error('❌ [SALARY ADVANCE - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to search salary advance',
            data: undefined
        };
    }
}

/**
 * Delete salary advance
 * POST /api/HREmpSalaryAdvanceFacade/delete
 */
export async function deleteSalaryAdvance(hresaId: number) {
    const url = '/api/HREmpSalaryAdvanceFacade/delete';
    const requestBody = createSalaryAdvanceRequestBody({
        HRESA_Id: hresaId,
        MI_Id: 30
    });
    return await api.post<SalaryAdvanceOnloadResponse>('hrms', url, requestBody);
}

/**
 * Activate/Deactivate salary advance record by ID
 * POST /api/HREmpSalaryAdvanceFacade/deactivateRecordById
 */
export async function toggleSalaryAdvanceStatus(hresaId: number, activeFlag: boolean) {
    console.log('🔵 [SALARY ADVANCE - BACKEND] toggleSalaryAdvanceStatus - START');
    console.log('📥 [SALARY ADVANCE - BACKEND] Request payload:', { hresaId, activeFlag });
    
    const url = '/api/HREmpSalaryAdvanceFacade/deactivateRecordById';
    console.log('🌐 [SALARY ADVANCE - BACKEND] API URL:', url);
    console.log('🌐 [SALARY ADVANCE - BACKEND] API Base: hrms');
    console.log('🌐 [SALARY ADVANCE - BACKEND] Method: POST');
    
    // Prepare request body matching the exact API structure
    const now = new Date().toISOString();
    
    // Create MasterEmployee object with 'string' defaults
    const masterEmployee = {
        CreatedDate: now,
        UpdatedDate: now,
        HRME_Id: 0,
        MI_Id: 30,
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
        HRME_doc: now,
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

    // Create empadvaList item
    const empadvaItem = {
        CreatedDate: now,
        UpdatedDate: now,
        HRESA_Id: hresaId,
        MI_Id: 30,
        HRME_Id: 0,
        HRESA_EntryDate: now,
        HRESA_AdvYear: 0,
        HRESA_AdvMonth: 'string',
        HRESA_Remarks: 'string',
        HRESA_AdvStatus: 'string',
        HRESA_ActiveFlag: activeFlag,
        HRESA_AppliedAmount: 0,
        HRESA_SanctinedAmount: 0,
        HRESA_ModeOfPayment: 'string',
        HRESA_ReferenceNo: 0,
        MasterEmployee: masterEmployee
    };

    // Create sample dropdown items with 'string' defaults
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
        HRME_doc: now,
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

    // Build configurationDetails structure with 'string' defaults
    const configurationDetails = {
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
        monthdropdown: [sampleMonthDropdown],
        HRC_partAmaxflag: 0,
        HRC_partBmaxflag: 0,
        HRC_IncrementMonth: 'string',
        HRC_MinimumWorkingPeriod: 0,
        HRC_FixedIncrmentFlg: true,
        HRC_NoOfOptionalHolidays: 0,
        HRC_IncrementOnceInMonths: 0,
        HRC_AlertDay: 0
    };

    const requestBody = {
        CreatedDate: now,
        UpdatedDate: now,
        HRESA_Id: hresaId,
        MI_Id: 30,
        HRME_Id: 0,
        HRESA_EntryDate: now,
        HRESA_AdvYear: 0,
        HRESA_AdvMonth: 'string',
        HRESA_AppliedAmount: 0,
        HRESA_Remarks: 'string',
        HRESA_ActiveFlag: activeFlag,
        HRESA_AdvStatus: 'string',
        HRESA_SanctinedAmount: 0,
        HRESA_ModeOfPayment: 'string',
        HRESA_ReferenceNo: 0,
        empadvaList: [empadvaItem],
        retrunMsg: 'string',
        Status: 'string',
        roleId: 0,
        HRME_EmployeeFirstName: 'string',
        HRME_EmployeeMiddleName: 'string',
        HRME_EmployeeLastName: 'string',
        employeedropdown: [sampleEmployeeDropdown],
        leaveyeardropdown: [sampleLeaveYearDropdown],
        monthdropdown: [sampleMonthDropdown],
        modeOfPaymentdropdown: [sampleModeOfPaymentDropdown],
        configurationDetails: configurationDetails,
        empGrossSal: 0,
        totalAppliedAmount: 0,
        searchfilter: 'string'
    };
    
    console.log('📤 [SALARY ADVANCE - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [SALARY ADVANCE - BACKEND] Request body summary:', {
        HRESA_Id: requestBody.HRESA_Id,
        HRESA_ActiveFlag: requestBody.HRESA_ActiveFlag,
        MI_Id: requestBody.MI_Id,
        empadvaListCount: requestBody.empadvaList.length
    });
    
    try {
        const response = await api.post<SalaryAdvanceOnloadResponse>('hrms', url, requestBody);
        
        console.log('✅ [SALARY ADVANCE - BACKEND] API Response received');
        console.log('📤 [SALARY ADVANCE - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as SalaryAdvanceOnloadResponse;
            console.log('✅ [SALARY ADVANCE - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [SALARY ADVANCE - BACKEND] Response data summary:', {
                hasEmpadvaList: !!responseData?.empadvaList,
                empadvaListCount: Array.isArray(responseData?.empadvaList) ? responseData.empadvaList.length : 0,
                retrunMsg: responseData?.retrunMsg,
                Status: responseData?.Status
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Salary advance status updated successfully',
                data: responseData
            };
        }
        
        // Wrap raw response data
        console.log('⚠️ [SALARY ADVANCE - BACKEND] Response not wrapped, wrapping it');
        return {
            success: true,
            message: 'Salary advance status updated successfully',
            data: response as unknown as SalaryAdvanceOnloadResponse
        };
    } catch (error: any) {
        console.error('❌ [SALARY ADVANCE - BACKEND] Error in toggleSalaryAdvanceStatus:', error);
        console.error('❌ [SALARY ADVANCE - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to update salary advance status',
            data: undefined
        };
    }
}
