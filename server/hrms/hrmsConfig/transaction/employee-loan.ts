'use server';

import { api } from '@/lib/apiService';
import type { ApiResponse } from '@/lib/apiService';
import type {
    EmployeeLoanOnloadRequest,
    EmployeeLoanOnloadResponse,
    EmployeeLoanSaveRequest,
    EmployeeLoanSaveResponse,
    EmployeeLoanDeleteRequest
} from '@/types/hrms/employee-loan';

// Helper function to create a complete nested object structure matching API requirements
function createCompleteRequestBody(baseFields: any): any {
    const now = new Date().toISOString();
    const fields = baseFields as any;

    return {
        CreatedDate: now,
        UpdatedDate: now,
        HREL_Id: fields.HREL_Id || 0,
        MI_Id: fields.MI_Id || 30,
        HRME_Id: fields.HRME_Id || 0,
        HREL_AppliedDate: fields.HREL_AppliedDate || now,
        HREL_EmpLoanId: fields.HREL_EmpLoanId || 'string',
        HRMLN_Id: fields.HRMLN_Id || 0,
        HREL_LoanAmount: fields.HREL_LoanAmount || 0,
        HREL_LoanInsallments: fields.HREL_LoanInsallments || 'string',
        HREL_LaonEMI: fields.HREL_LaonEMI || 'string',
        HREL_LoanStatus: fields.HREL_LoanStatus || 'string',
        HREL_SanctionedAmount: fields.HREL_SanctionedAmount || 0,
        HREL_TotalPrincipalPaid: fields.HREL_TotalPrincipalPaid || 0,
        HREL_TotalInterestPaid: fields.HREL_TotalInterestPaid || 0,
        HREL_TotalPending: fields.HREL_TotalPending || 0,
        HREL_LoanInterest: fields.HREL_LoanInterest || 0,
        HREL_ModeOfPayment: fields.HREL_ModeOfPayment || 'string',
        HREL_ReferenceNo: fields.HREL_ReferenceNo || '',
        HREL_ActiveFlag: fields.HREL_ActiveFlag ?? true,
        emploanList: fields.emploanList || [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HREL_Id: 0,
                MI_Id: 0,
                HRME_Id: 0,
                HREL_AppliedDate: now,
                HREL_EmpLoanId: 'string',
                HRMLN_Id: 0,
                HREL_LoanAmount: 0,
                HREL_LoanInsallments: 'string',
                HREL_LaonEMI: 'string',
                HREL_LoanStatus: 'string',
                HREL_SanctionedAmount: 0,
                HREL_TotalPrincipalPaid: 0,
                HREL_TotalInterestPaid: 0,
                HREL_TotalPending: 0,
                HREL_LoanInterest: 0,
                HREL_ModeOfPayment: 'string',
                HREL_ReferenceNo: '',
                HREL_ActiveFlag: true,
                HRMasterLoan: {
                    CreatedDate: now,
                    UpdatedDate: now,
                    HRMLN_Id: 0,
                    MI_Id: 0,
                    HRML_LoanType: 'string',
                    HRML_Max: 0,
                    HRMLN_ActiveFlag: true
                },
                MasterEmployee: {
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
                },
                HREL_NoofInstallment: 0
            }
        ],
        retrunMsg: (baseFields as any).retrunMsg || 'string',
        roleId: baseFields.roleId || 0,
        employeedropdown: (baseFields as any).employeedropdown || [
            {
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
            }
        ],
        masterloandropdown: (baseFields as any).masterloandropdown || [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMLN_Id: 0,
                MI_Id: 0,
                HRML_LoanType: 'string',
                HRML_Max: 0,
                HRMLN_ActiveFlag: true
            }
        ],
        hrmE_EmployeeFirstName: (baseFields as any).hrmE_EmployeeFirstName || 'string',
        HRML_LoanType: (baseFields as any).HRML_LoanType || 'string',
        modeOfPaymentdropdown: (baseFields as any).modeOfPaymentdropdown || [
            {
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
            }
        ],
        configurationDetails: (baseFields as any).configurationDetails || {
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
        },
        transnumconfigsettings: (baseFields as any).transnumconfigsettings || {
            CreatedDate: now,
            UpdatedDate: now,
            IMN_Id: 0,
            MI_Id: 0,
            UserId: 0,
            IMN_AutoManualFlag: 'string',
            IMN_DuplicatesFlag: 'string',
            IMN_StartingNo: 'string',
            IMN_WidthNumeric: 'string',
            IMN_ZeroPrefixFlag: 'string',
            IMN_PrefixAcadYearCode: true,
            IMN_PrefixParticular: 'string',
            IMN_SuffixAcadYearCode: true,
            IMN_SuffixParticular: 'string',
            IMN_RestartNumFlag: 'string',
            IMN_Flag: 'string',
            EnquiryNumberingArraylist: ['string'],
            ProspectusNumberingArraylist: ['string'],
            RegistrationNumberingArraylist: ['string'],
            PreRegistrationNumberingArraylist: ['string'],
            ASMAY_Id: 0,
            AdmissionNumberingArraylist: ['string'],
            AdmissionRegNumberingArraylist: ['string'],
            IMN_PrefixFinYearCode: true,
            IMN_PrefixCalYearCode: true,
            IMN_SuffixFinYearCode: true,
            IMN_SuffixCalYearCode: true,
            IRN_RestartAcadYear: true,
            IRN_RestartFinYear: true,
            IRN_RestartcalendYear: true,
            VoucherName: 'string',
            VoucherType: 'string',
            Observation: 'string',
            ApplicationNumberingArraylist: ['string'],
            TransactionNumberingArraylist: ['string'],
            ReceiptNumberingArraylist: ['string'],
            VoucherNumberingArraylist: ['string'],
            IRN_TransactionName: 'string',
            tcNumberingArraylist: ['string'],
            loanNumberingArraylist: ['string'],
            onlineBookingNumberingArraylist: ['string'],
            tripNumberingArraylist: ['string'],
            tripBillNumberingArraylist: ['string'],
            leaveNumberingArraylist: ['string'],
            RolenoNumbering: ['string'],
            RolenoNumberingConfig: ['string'],
            FieldArray: ['string'],
            message: 'string',
            IVRMARNC_Id: 0,
            RollNumberingconfig: [
                {
                    IVRMARNC_Field: 'string',
                    IVRMARNC_AscDscOrder: 'string',
                    IVRMARNC_Order: 0,
                    IVRMARNC_Id: 0
                }
            ]
        },
        ASMAY_Id: (baseFields as any).ASMAY_Id || 0,
        empGrossSal: (baseFields as any).empGrossSal || 0,
        HREL_NoofInstallment: (baseFields as any).HREL_NoofInstallment || 0
    };
}

/**
 * Get onload details for employee loan
 * POST /api/HREmpLoanFacade/onloadgetdetails
 */
export async function getEmployeeLoanList(roleId: number) {
    const url = '/api/HREmpLoanFacade/onloadgetdetails';
    // For onload, we only need basic fields
    const requestBody = {
        roleId: roleId,
        MI_Id: 30
    };
    const response = await api.post<EmployeeLoanOnloadResponse>('hrms', url, requestBody);
    
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
        data: response as unknown as EmployeeLoanOnloadResponse
    };
}

/**
 * Save/Update employee loan (Facade)
 * POST /api/HREmpLoanFacade
 */
export async function saveEmployeeLoan(data: EmployeeLoanSaveRequest) {
    const url = '/api/HREmpLoanFacade';
    const requestBody = createCompleteRequestBody({
        HREL_Id: data.HREL_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRME_Id: data.HRME_Id,
        HREL_AppliedDate: data.HREL_AppliedDate,
        HRMLN_Id: data.HRMLN_Id,
        HREL_LoanAmount: data.HREL_LoanAmount,
        HREL_LoanInsallments: data.HREL_LoanInsallments,
        HREL_LaonEMI: data.HREL_LaonEMI,
        HREL_LoanStatus: data.HREL_LoanStatus,
        HREL_SanctionedAmount: data.HREL_SanctionedAmount || 0,
        HREL_TotalPrincipalPaid: data.HREL_TotalPrincipalPaid || 0,
        HREL_TotalInterestPaid: data.HREL_TotalInterestPaid || 0,
        HREL_TotalPending: data.HREL_TotalPending || 0,
        HREL_LoanInterest: data.HREL_LoanInterest || 0,
        HREL_ModeOfPayment: data.HREL_ModeOfPayment || 'string',
        HREL_ReferenceNo: data.HREL_ReferenceNo || '',
        HREL_ActiveFlag: data.HREL_ActiveFlag ?? true,
        HREL_NoofInstallment: data.HREL_NoofInstallment || 0,
        roleId: data.roleId
    });
    return await api.post<EmployeeLoanSaveResponse>('hrms', url, requestBody);
}

/**
 * Get employee loan record by ID
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
    const requestBody = createCompleteRequestBody({
        HREL_Id: (data as any).HREL_Id,
        HREL_ActiveFlag: data.HREL_ActiveFlag,
        roleId: data.roleId || 0
    });
    return await api.post<EmployeeLoanOnloadResponse>('hrms', url, requestBody);
}

/**
 * Get employee loan details by employee
 * POST /api/HREmpLoanFacade/getDetailsByEmployee
 */
export async function getEmployeeLoanByEmployee(employeeId: number, roleId: number) {
    const url = '/api/HREmpLoanFacade/getDetailsByEmployee';
    const requestBody = createCompleteRequestBody({
        HRME_Id: employeeId as any,
        roleId: roleId
    });
    return await api.post<EmployeeLoanOnloadResponse>('hrms', url, requestBody);
}
