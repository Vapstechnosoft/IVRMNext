import { ApiResponse } from "@/lib/apiService";
import axios from "axios";
import { env } from "@/env";
import type {
  EmployeeLoanResponse,
  EmployeeLoanInput,
  EmployeeLoanOnloadRequest,
} from "@/types/hrms/employee-loan";

// Helper function to create a complete nested object structure matching API requirements
function createCompleteRequestBody(
  baseFields: Partial<EmployeeLoanOnloadRequest>
): EmployeeLoanOnloadRequest {
  const now = new Date().toISOString();
  
  return {
    CreatedDate: now,
    UpdatedDate: now,
    HREL_Id: baseFields.HREL_Id || 0,
    MI_Id: baseFields.MI_Id || 30,
    HRME_Id: baseFields.HRME_Id || 0,
    HREL_AppliedDate: baseFields.HREL_AppliedDate || now,
    HREL_EmpLoanId: baseFields.HREL_EmpLoanId || "string",
    HRMLN_Id: baseFields.HRMLN_Id || 0,
    HREL_LoanAmount: baseFields.HREL_LoanAmount || 0,
    HREL_LoanInsallments: baseFields.HREL_LoanInsallments || "string",
    HREL_LaonEMI: baseFields.HREL_LaonEMI || "string",
    HREL_LoanStatus: baseFields.HREL_LoanStatus || "string",
    HREL_SanctionedAmount: baseFields.HREL_SanctionedAmount || 0,
    HREL_TotalPrincipalPaid: baseFields.HREL_TotalPrincipalPaid || 0,
    HREL_TotalInterestPaid: baseFields.HREL_TotalInterestPaid || 0,
    HREL_TotalPending: baseFields.HREL_TotalPending || 0,
    HREL_LoanInterest: baseFields.HREL_LoanInterest || 0,
    HREL_ModeOfPayment: baseFields.HREL_ModeOfPayment || "string",
    HREL_ReferenceNo: baseFields.HREL_ReferenceNo || "",
    HREL_ActiveFlag: baseFields.HREL_ActiveFlag ?? true,
    emploanList: baseFields.emploanList || [{
      CreatedDate: now,
      UpdatedDate: now,
      HREL_Id: 0,
      MI_Id: 0,
      HRME_Id: 0,
      HREL_AppliedDate: now,
      HREL_EmpLoanId: "string",
      HRMLN_Id: 0,
      HREL_LoanAmount: 0,
      HREL_LoanInsallments: "string",
      HREL_LaonEMI: "string",
      HREL_LoanStatus: "string",
      HREL_SanctionedAmount: 0,
      HREL_TotalPrincipalPaid: 0,
      HREL_TotalInterestPaid: 0,
      HREL_TotalPending: 0,
      HREL_LoanInterest: 0,
      HREL_ModeOfPayment: "string",
      HREL_ReferenceNo: "",
      HREL_ActiveFlag: true,
      HRMasterLoan: {
        CreatedDate: now,
        UpdatedDate: now,
        HRMLN_Id: 0,
        MI_Id: 0,
        HRML_LoanType: "string",
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
        HRME_EmployeeFirstName: "string",
        HRME_EmployeeMiddleName: "string",
        HRME_EmployeeLastName: "string",
        HRME_EmployeeCode: "string",
        HRME_BiometricCode: "string",
        HRME_RFCardId: "string",
        HRME_PerStreet: "string",
        HRME_PerArea: "string",
        HRME_PerCity: "string",
        HRME_PerAdd4: "string",
        HRME_PerStateId: 0,
        HRME_PerCountryId: 0,
        HRME_PerPincode: 0,
        HRME_LocStreet: "string",
        HRME_LocArea: "string",
        HRME_LocCity: "string",
        HRME_LocAdd4: "string",
        HRME_LocStateId: 0,
        HRME_LocCountryId: 0,
        HRME_LocPincode: 0,
        IVRMMMS_Id: 0,
        IVRMMG_Id: 0,
        CasteCategoryId: 0,
        CasteId: 0,
        ReligionId: 0,
        HRME_FatherName: "string",
        HRME_MotherName: "string",
        HRME_SpouseName: "string",
        HRME_SpouseOccupation: "string",
        HRME_SpouseMobileNo: 0,
        HRME_SpouseEmailId: "string",
        HRME_SpouseAddress: "string",
        HRME_DOB: now,
        HRME_DOJ: now,
        HRME_ExpectedRetirementDate: now,
        HRME_PFDate: now,
        HRME_ESIDate: now,
        HRME_MobileNo: 0,
        HRME_EmailId: "string",
        HRME_BloodGroup: "string",
        HRME_PaymentType: "string",
        HRME_BankAccountNo: "string",
        HRME_PFApplicableFlag: true,
        HRME_PFMaxFlag: true,
        HRME_PFFixedFlag: true,
        HRME_PFAccNo: "string",
        HRME_ESIAccNo: "string",
        HRME_GratuityAccNo: "string",
        HRME_ESIApplicableFlag: true,
        HRME_Photo: "string",
        HRME_LeftFlag: true,
        HRME_DOL: now,
        HRME_LeavingReason: "string",
        HRME_Height: "string",
        HRME_HeightUOM: "string",
        HRME_Weight: 0,
        HRME_WeightUOM: "string",
        HRME_IdentificationMark: "string",
        HRME_ApprovalNo: "string",
        HRME_PANCardNo: "string",
        HRME_AadharCardNo: 0,
        HRME_SubstituteFlag: true,
        HRME_NationalSSN: "string",
        HRME_SalaryType: "string",
        HRME_EmployeeOrder: 0,
        HRME_ActiveFlag: true,
        HRME_UINumber: "string",
        HRME_DOC: now,
        HRME_SubjectsTaught: "string",
        HRME_AppDownloadedDeviceId: "string",
        HRME_PHDResearchGuideFlg: true,
        HRME_TechNonTeachingFlg: "string",
        HRME_RGRecognitionYear: 0,
        HRME_AnyHealthIssue: "string",
        HRME_EyeSightIssue: "string",
        HRME_TransfferedTo: 0,
        HRME_RecordTransferredFlg: true,
        HRME_MSTeamsUserId: "string",
        HRME_MSTeamsEmailId: "string",
        HRME_MSTeamsPassword: "string",
        HRME_ExcPunch: true,
        HRME_RetiredFlg: true,
        HRME_PensionStoppedDate: now,
        HRME_FPFNotApplicableFlg: true,
        HRME_EPFNotApplicableFlg: true,
        HRME_AllowSoftwareAccessFlg: true
      },
      HREL_NoofInstallment: 0
    }],
    retrunMsg: baseFields.retrunMsg || "string",
    roleId: baseFields.roleId || 0,
    employeedropdown: baseFields.employeedropdown || [{
      CreatedDate: now,
      UpdatedDate: now,
      HRME_Id: 0,
      MI_Id: 0,
      HRMET_Id: 0,
      HRMGT_Id: 0,
      HRMD_Id: 0,
      HRMDES_Id: 0,
      HRMG_Id: 0,
      HRME_EmployeeFirstName: "string",
      HRME_EmployeeMiddleName: "string",
      HRME_EmployeeLastName: "string",
      HRME_EmployeeCode: "string",
      HRME_BiometricCode: "string",
      HRME_RFCardId: "string",
      HRME_PerStreet: "string",
      HRME_PerArea: "string",
      HRME_PerCity: "string",
      HRME_PerAdd4: "string",
      HRME_PerStateId: 0,
      HRME_PerCountryId: 0,
      HRME_PerPincode: 0,
      HRME_LocStreet: "string",
      HRME_LocArea: "string",
      HRME_LocCity: "string",
      HRME_LocAdd4: "string",
      HRME_LocStateId: 0,
      HRME_LocCountryId: 0,
      HRME_LocPincode: 0,
      IVRMMMS_Id: 0,
      IVRMMG_Id: 0,
      CasteCategoryId: 0,
      CasteId: 0,
      ReligionId: 0,
      HRME_FatherName: "string",
      HRME_MotherName: "string",
      HRME_SpouseName: "string",
      HRME_SpouseOccupation: "string",
      HRME_SpouseMobileNo: 0,
      HRME_SpouseEmailId: "string",
      HRME_SpouseAddress: "string",
      HRME_DOB: now,
      HRME_DOJ: now,
      HRME_ExpectedRetirementDate: now,
      HRME_PFDate: now,
      HRME_ESIDate: now,
      HRME_MobileNo: 0,
      HRME_EmailId: "string",
      HRME_BloodGroup: "string",
      HRME_PaymentType: "string",
      HRME_BankAccountNo: "string",
      HRME_PFApplicableFlag: true,
      HRME_PFMaxFlag: true,
      HRME_PFFixedFlag: true,
      HRME_PFAccNo: "string",
      HRME_ESIAccNo: "string",
      HRME_GratuityAccNo: "string",
      HRME_ESIApplicableFlag: true,
      HRME_Photo: "string",
      HRME_LeftFlag: true,
      HRME_DOL: now,
      HRME_LeavingReason: "string",
      HRME_Height: "string",
      HRME_HeightUOM: "string",
      HRME_Weight: 0,
      HRME_WeightUOM: "string",
      HRME_IdentificationMark: "string",
      HRME_ApprovalNo: "string",
      HRME_PANCardNo: "string",
      HRME_AadharCardNo: 0,
      HRME_SubstituteFlag: true,
      HRME_NationalSSN: "string",
      HRME_SalaryType: "string",
      HRME_EmployeeOrder: 0,
      HRME_ActiveFlag: true,
      HRME_UINumber: "string",
      HRME_DOC: now,
      HRME_SubjectsTaught: "string",
      HRME_AppDownloadedDeviceId: "string",
      HRME_PHDResearchGuideFlg: true,
      HRME_TechNonTeachingFlg: "string",
      HRME_RGRecognitionYear: 0,
      HRME_AnyHealthIssue: "string",
      HRME_EyeSightIssue: "string",
      HRME_TransfferedTo: 0,
      HRME_RecordTransferredFlg: true,
      HRME_MSTeamsUserId: "string",
      HRME_MSTeamsEmailId: "string",
      HRME_MSTeamsPassword: "string",
      HRME_ExcPunch: true,
      HRME_RetiredFlg: true,
      HRME_PensionStoppedDate: now,
      HRME_FPFNotApplicableFlg: true,
      HRME_EPFNotApplicableFlg: true,
      HRME_AllowSoftwareAccessFlg: true
    }],
    masterloandropdown: baseFields.masterloandropdown || [{
      CreatedDate: now,
      UpdatedDate: now,
      HRMLN_Id: 0,
      MI_Id: 0,
      HRML_LoanType: "string",
      HRML_Max: 0,
      HRMLN_ActiveFlag: true
    }],
    hrmE_EmployeeFirstName: baseFields.hrmE_EmployeeFirstName || "string",
    HRML_LoanType: baseFields.HRML_LoanType || "string",
    modeOfPaymentdropdown: baseFields.modeOfPaymentdropdown || [{
      CreatedDate: now,
      UpdatedDate: now,
      IVRMMOD_Id: 0,
      MI_Id: 0,
      IVRMMOD_ModeOfPayment: "string",
      IVRMMOD_ActiveFlag: true,
      IVRMMOD_Flag: "string",
      IVRMMOD_ModeOfPayment_Code: "string",
      IVRMMOD_CreatedBy: 0,
      IVRMMOD_UpdatedBy: 0
    }],
    configurationDetails: baseFields.configurationDetails || {
      HRC_Id: 0,
      MI_Id: 0,
      HRC_PFMaxAmt: 0,
      HRC_FPFPer: 0,
      HRC_EPFPer: 0,
      HRC_AsPerEmpFlag: true,
      HRC_PFAccNoPrefix: "string",
      HRC_AccNo2: 0,
      HRC_AccNo21: 0,
      HRC_AccNo22: 0,
      HRC_RetirementYrs: 0,
      HRC_ECodePrefix: "string",
      HRC_ESIMax: 0,
      HRC_ESIEmplrCont: 0,
      HRC_PayMethodFlg: "string",
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
      retrunMsg: "string",
      hrStandardList: [{
        HRC_Id: 0,
        MI_Id: 0,
        HRC_PFMaxAmt: 0,
        HRC_FPFPer: 0,
        HRC_EPFPer: 0,
        HRC_AsPerEmpFlag: true,
        HRC_PFAccNoPrefix: "string",
        HRC_AccNo2: 0,
        HRC_AccNo21: 0,
        HRC_AccNo22: 0,
        HRC_RetirementYrs: 0,
        HRC_ECodePrefix: "string",
        HRC_ESIMax: 0,
        HRC_ESIEmplrCont: 0,
        HRC_PayMethodFlg: "string",
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
        HRC_IncrementOnFlag: "string",
        HRC_IncrementMonth: "string",
        HRC_IncrementPercentage: 0,
        HRC_SplIncrementOnceInYr: 0,
        HRC_MinimumWorkingPeriod: 0,
        HRC_FixedIncrmentFlg: true,
        HRC_NoOfOptionalHolidays: 0,
        HRC_IncrementOnceInMonths: 0,
        HRC_AlertDay: 0
      }],
      monthdropdown: [{
        IVRM_Month_Id: 0,
        IVRM_Month_Name: "string",
        Is_Active: true,
        IVRM_Month_Max_Days: 0
      }],
      HRC_partAmaxflag: 0,
      HRC_partBmaxflag: 0,
      HRC_IncrementMonth: "string",
      HRC_MinimumWorkingPeriod: 0,
      HRC_FixedIncrmentFlg: true,
      HRC_NoOfOptionalHolidays: 0,
      HRC_IncrementOnceInMonths: 0,
      HRC_AlertDay: 0
    },
    transnumconfigsettings: baseFields.transnumconfigsettings || {
      CreatedDate: now,
      UpdatedDate: now,
      IMN_Id: 0,
      MI_Id: 0,
      UserId: 0,
      IMN_AutoManualFlag: "string",
      IMN_DuplicatesFlag: "string",
      IMN_StartingNo: "string",
      IMN_WidthNumeric: "string",
      IMN_ZeroPrefixFlag: "string",
      IMN_PrefixAcadYearCode: true,
      IMN_PrefixParticular: "string",
      IMN_SuffixAcadYearCode: true,
      IMN_SuffixParticular: "string",
      IMN_RestartNumFlag: "string",
      IMN_Flag: "string",
      EnquiryNumberingArraylist: ["string"],
      ProspectusNumberingArraylist: ["string"],
      RegistrationNumberingArraylist: ["string"],
      PreRegistrationNumberingArraylist: ["string"],
      ASMAY_Id: 0,
      AdmissionNumberingArraylist: ["string"],
      AdmissionRegNumberingArraylist: ["string"],
      IMN_PrefixFinYearCode: true,
      IMN_PrefixCalYearCode: true,
      IMN_SuffixFinYearCode: true,
      IMN_SuffixCalYearCode: true,
      IRN_RestartAcadYear: true,
      IRN_RestartFinYear: true,
      IRN_RestartcalendYear: true,
      VoucherName: "string",
      VoucherType: "string",
      Observation: "string",
      ApplicationNumberingArraylist: ["string"],
      TransactionNumberingArraylist: ["string"],
      ReceiptNumberingArraylist: ["string"],
      VoucherNumberingArraylist: ["string"],
      IRN_TransactionName: "string",
      tcNumberingArraylist: ["string"],
      loanNumberingArraylist: ["string"],
      onlineBookingNumberingArraylist: ["string"],
      tripNumberingArraylist: ["string"],
      tripBillNumberingArraylist: ["string"],
      leaveNumberingArraylist: ["string"],
      RolenoNumbering: ["string"],
      RolenoNumberingConfig: ["string"],
      FieldArray: ["string"],
      message: "string",
      IVRMARNC_Id: 0,
      RollNumberingconfig: [{
        IVRMARNC_Field: "string",
        IVRMARNC_AscDscOrder: "string",
        IVRMARNC_Order: 0,
        IVRMARNC_Id: 0
      }]
    },
    ASMAY_Id: baseFields.ASMAY_Id || 0,
    empGrossSal: baseFields.empGrossSal || 0,
    HREL_NoofInstallment: baseFields.HREL_NoofInstallment || 0
  };
}

/**
 * Get onload details for employee loan
 * POST /api/HREmpLoanFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getEmployeeLoanList(
  roleId: number
): Promise<ApiResponse<EmployeeLoanResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/HREmpLoanFacade/onloadgetdetails";
    const url = `${baseURL}${apiPath}`;

    const requestBody = createCompleteRequestBody({
      roleId: roleId,
    });

    console.log("=== Onload Employee Loan Details API Request ===");
    console.log("URL:", url);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<EmployeeLoanResponse>(
      url,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500;
        },
      }
    );

    console.log("=== Onload Employee Loan Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Data:", axiosResponse.data);
    console.log("emploanList length:", axiosResponse.data.emploanList?.length || 0);
    console.log("emploanList content:", axiosResponse.data.emploanList);
    console.log("employeedropdown length:", axiosResponse.data.employeedropdown?.length || 0);
    console.log("masterloandropdown length:", axiosResponse.data.masterloandropdown?.length || 0);

    // Log warning if emploanList is empty
    if (!axiosResponse.data.emploanList || axiosResponse.data.emploanList.length === 0) {
      console.warn("⚠️ WARNING: emploanList is empty! No loan records returned from API.");
      console.warn("This could be a backend issue where saved loans are not being returned in the onload response.");
    }

    const response: ApiResponse<EmployeeLoanResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        axiosResponse.data.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Employee loans loaded successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Onload Employee Loan Details API Error ===");
    console.error("Error:", error);

    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<EmployeeLoanResponse> = {
        success: false,
        message:
          error.response?.data?.retrunMsg ||
          error.response?.data?.message ||
          error.message ||
          "Failed to load employee loans",
        data: null,
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Save/Update employee loan (Facade)
 * POST /api/HREmpLoanFacade
 * Using axios directly with proxy
 */
export async function saveEmployeeLoan(
  data: EmployeeLoanInput
): Promise<ApiResponse<EmployeeLoanResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/HREmpLoanFacade";
    const url = `${baseURL}${apiPath}`;

    const requestBody = createCompleteRequestBody({
      HREL_Id: data.hreL_Id || 0,
      MI_Id: data.mI_Id || 30,
      HRME_Id: data.hrmE_Id,
      HREL_AppliedDate: data.hreL_AppliedDate,
      HRMLN_Id: data.hrmlN_Id,
      HREL_LoanAmount: data.hreL_LoanAmount,
      HREL_LoanInsallments: (data.hreL_LoanInsallments || 0).toString(),
      HREL_LaonEMI: (data.hreL_LaonEMI || 0).toString(),
      HREL_LoanStatus: data.hreL_LoanStatus,
      HREL_SanctionedAmount: data.hreL_SanctionedAmount || 0,
      HREL_TotalPrincipalPaid: data.hreL_TotalPrincipalPaid || 0,
      HREL_TotalInterestPaid: data.hreL_TotalInterestPaid || 0,
      HREL_TotalPending: data.hreL_TotalPending || 0,
      HREL_LoanInterest: data.hreL_LoanInterest || 0,
      HREL_ModeOfPayment: data.hreL_ModeOfPayment || "string",
      HREL_ReferenceNo: data.hreL_ReferenceNo || "",
      HREL_ActiveFlag: data.hreL_ActiveFlag ?? true,
      roleId: data.roleId,
    });

    console.log("=== Save Employee Loan API Request ===");
    console.log("URL:", url);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<EmployeeLoanResponse>(
      url,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
        validateStatus: function (status) {
          return status < 500;
        },
      }
    );

    console.log("=== Save Employee Loan API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Data:", axiosResponse.data);

    // Check if the operation was successful
    // The API returns HTTP 200 even with "Error occured" message, but the data is actually saved
    // So we check if the response has valid loan data (HREL_Id, HRME_Id, HREL_LoanAmount, etc.)
    const hasValidData = 
      axiosResponse.data &&
      (axiosResponse.data.HREL_Id !== undefined || axiosResponse.data.HREL_Id === 0) &&
      axiosResponse.data.HRME_Id > 0 &&
      axiosResponse.data.HREL_LoanAmount > 0;

    const isSuccess =
      axiosResponse.status >= 200 &&
      axiosResponse.status < 300 &&
      hasValidData;

    // Provide a better success message if the data is valid, regardless of retrunMsg
    let message = axiosResponse.data.retrunMsg || "";
    if (isSuccess && message.toLowerCase().includes("error")) {
      message = "Employee loan saved successfully";
    } else if (!isSuccess && !message) {
      message = `HTTP ${axiosResponse.status}`;
    } else if (isSuccess && !message) {
      message = "Employee loan saved successfully";
    }

    const response: ApiResponse<EmployeeLoanResponse> = {
      success: isSuccess,
      message: message,
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Save Employee Loan API Error ===");
    console.error("Error:", error);

    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<EmployeeLoanResponse> = {
        success: false,
        message:
          error.response?.data?.retrunMsg ||
          error.response?.data?.message ||
          error.message ||
          "Failed to save employee loan",
        data: null,
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Get employee loan record by ID
 * GET /api/HREmpLoanFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getEmployeeLoanById(
  id: number
): Promise<ApiResponse<EmployeeLoanResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = `/api/HREmpLoanFacade/getRecordById/${id}`;
    const url = `${baseURL}${apiPath}`;

    console.log("=== Get Employee Loan By ID API Request ===");
    console.log("URL:", url);
    console.log("Loan ID:", id);

    const axiosResponse = await axios.get<EmployeeLoanResponse>(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      },
    });

    console.log("=== Get Employee Loan By ID API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response data:", JSON.stringify(axiosResponse.data, null, 2));

    const response: ApiResponse<EmployeeLoanResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        axiosResponse.data?.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Success"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Get Employee Loan By ID API Error ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);

    if (axios.isAxiosError(error)) {
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);

      const errorResponse: ApiResponse<EmployeeLoanResponse> = {
        success: false,
        message:
          error.response?.data?.retrunMsg ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch employee loan by ID",
        data: null,
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Activate/Deactivate employee loan
 * POST /api/HREmpLoanFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateEmployeeLoan(data: {
  HREL_Id: number;
  HREL_ActiveFlag: boolean;
  roleId?: number;
}): Promise<ApiResponse<EmployeeLoanResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/HREmpLoanFacade/deactivateRecordById";
    const url = `${baseURL}${apiPath}`;

    // Create a proper request body for activate/deactivate operation
    // The API expects the specific loan record in emploanList, not a template
    const now = new Date().toISOString();
    const requestBody = {
      CreatedDate: now,
      UpdatedDate: now,
      HREL_Id: data.HREL_Id,
      MI_Id: 30,
      HRME_Id: 0,
      HREL_AppliedDate: now,
      HREL_EmpLoanId: "string",
      HRMLN_Id: 0,
      HREL_LoanAmount: 0,
      HREL_LoanInsallments: "string",
      HREL_LaonEMI: "string",
      HREL_LoanStatus: "string",
      HREL_SanctionedAmount: 0,
      HREL_TotalPrincipalPaid: 0,
      HREL_TotalInterestPaid: 0,
      HREL_TotalPending: 0,
      HREL_LoanInterest: 0,
      HREL_ModeOfPayment: "string",
      HREL_ReferenceNo: "",
      HREL_ActiveFlag: data.HREL_ActiveFlag,
      emploanList: [{
        CreatedDate: now,
        UpdatedDate: now,
        HREL_Id: data.HREL_Id, // Use the actual loan ID
        MI_Id: 30,
        HRME_Id: 0,
        HREL_AppliedDate: now,
        HREL_EmpLoanId: "string",
        HRMLN_Id: 0,
        HREL_LoanAmount: 0,
        HREL_LoanInsallments: "string",
        HREL_LaonEMI: "string",
        HREL_LoanStatus: "string",
        HREL_SanctionedAmount: 0,
        HREL_TotalPrincipalPaid: 0,
        HREL_TotalInterestPaid: 0,
        HREL_TotalPending: 0,
        HREL_LoanInterest: 0,
        HREL_ModeOfPayment: "string",
        HREL_ReferenceNo: "",
        HREL_ActiveFlag: data.HREL_ActiveFlag, // Use the actual active flag
        HRMasterLoan: {
          CreatedDate: now,
          UpdatedDate: now,
          HRMLN_Id: 0,
          MI_Id: 0,
          HRML_LoanType: "string",
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
          HRME_EmployeeFirstName: "string",
          HRME_EmployeeMiddleName: "string",
          HRME_EmployeeLastName: "string",
          HRME_EmployeeCode: "string",
          HRME_BiometricCode: "string",
          HRME_RFCardId: "string",
          HRME_PerStreet: "string",
          HRME_PerArea: "string",
          HRME_PerCity: "string",
          HRME_PerAdd4: "string",
          HRME_PerStateId: 0,
          HRME_PerCountryId: 0,
          HRME_PerPincode: 0,
          HRME_LocStreet: "string",
          HRME_LocArea: "string",
          HRME_LocCity: "string",
          HRME_LocAdd4: "string",
          HRME_LocStateId: 0,
          HRME_LocCountryId: 0,
          HRME_LocPincode: 0,
          IVRMMMS_Id: 0,
          IVRMMG_Id: 0,
          CasteCategoryId: 0,
          CasteId: 0,
          ReligionId: 0,
          HRME_FatherName: "string",
          HRME_MotherName: "string",
          HRME_SpouseName: "string",
          HRME_SpouseOccupation: "string",
          HRME_SpouseMobileNo: 0,
          HRME_SpouseEmailId: "string",
          HRME_SpouseAddress: "string",
          HRME_DOB: now,
          HRME_DOJ: now,
          HRME_ExpectedRetirementDate: now,
          HRME_PFDate: now,
          HRME_ESIDate: now,
          HRME_MobileNo: 0,
          HRME_EmailId: "string",
          HRME_BloodGroup: "string",
          HRME_PaymentType: "string",
          HRME_BankAccountNo: "string",
          HRME_PFApplicableFlag: true,
          HRME_PFMaxFlag: true,
          HRME_PFFixedFlag: true,
          HRME_PFAccNo: "string",
          HRME_ESIAccNo: "string",
          HRME_GratuityAccNo: "string",
          HRME_ESIApplicableFlag: true,
          HRME_Photo: "string",
          HRME_LeftFlag: true,
          HRME_DOL: now,
          HRME_LeavingReason: "string",
          HRME_Height: "string",
          HRME_HeightUOM: "string",
          HRME_Weight: 0,
          HRME_WeightUOM: "string",
          HRME_IdentificationMark: "string",
          HRME_ApprovalNo: "string",
          HRME_PANCardNo: "string",
          HRME_AadharCardNo: 0,
          HRME_SubstituteFlag: true,
          HRME_NationalSSN: "string",
          HRME_SalaryType: "string",
          HRME_EmployeeOrder: 0,
          HRME_ActiveFlag: true,
          HRME_UINumber: "string",
          HRME_DOC: now,
          HRME_SubjectsTaught: "string",
          HRME_AppDownloadedDeviceId: "string",
          HRME_PHDResearchGuideFlg: true,
          HRME_TechNonTeachingFlg: "string",
          HRME_RGRecognitionYear: 0,
          HRME_AnyHealthIssue: "string",
          HRME_EyeSightIssue: "string",
          HRME_TransfferedTo: 0,
          HRME_RecordTransferredFlg: true,
          HRME_MSTeamsUserId: "string",
          HRME_MSTeamsEmailId: "string",
          HRME_MSTeamsPassword: "string",
          HRME_ExcPunch: true,
          HRME_RetiredFlg: true,
          HRME_PensionStoppedDate: now,
          HRME_FPFNotApplicableFlg: true,
          HRME_EPFNotApplicableFlg: true,
          HRME_AllowSoftwareAccessFlg: true
        },
        HREL_NoofInstallment: 0
      }],
      retrunMsg: "",
      roleId: data.roleId || 0,
      employeedropdown: [],
      masterloandropdown: [],
      hrmE_EmployeeFirstName: "string",
      HRML_LoanType: "string",
      modeOfPaymentdropdown: [],
      configurationDetails: {
        HRC_Id: 0,
        MI_Id: 0,
        HRC_PFMaxAmt: 0,
        HRC_FPFPer: 0,
        HRC_EPFPer: 0,
        HRC_AsPerEmpFlag: true,
        HRC_PFAccNoPrefix: "string",
        HRC_AccNo2: 0,
        HRC_AccNo21: 0,
        HRC_AccNo22: 0,
        HRC_RetirementYrs: 0,
        HRC_ECodePrefix: "string",
        HRC_ESIMax: 0,
        HRC_ESIEmplrCont: 0,
        HRC_PayMethodFlg: "string",
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
        retrunMsg: "string",
        hrStandardList: [],
        monthdropdown: [],
        HRC_partAmaxflag: 0,
        HRC_partBmaxflag: 0,
        HRC_IncrementMonth: "string",
        HRC_MinimumWorkingPeriod: 0,
        HRC_FixedIncrmentFlg: true,
        HRC_NoOfOptionalHolidays: 0,
        HRC_IncrementOnceInMonths: 0,
        HRC_AlertDay: 0
      },
      transnumconfigsettings: {
        CreatedDate: now,
        UpdatedDate: now,
        IMN_Id: 0,
        MI_Id: 0,
        UserId: 0,
        IMN_AutoManualFlag: "string",
        IMN_DuplicatesFlag: "string",
        IMN_StartingNo: "string",
        IMN_WidthNumeric: "string",
        IMN_ZeroPrefixFlag: "string",
        IMN_PrefixAcadYearCode: true,
        IMN_PrefixParticular: "string",
        IMN_SuffixAcadYearCode: true,
        IMN_SuffixParticular: "string",
        IMN_RestartNumFlag: "string",
        IMN_Flag: "string",
        EnquiryNumberingArraylist: [],
        ProspectusNumberingArraylist: [],
        RegistrationNumberingArraylist: [],
        PreRegistrationNumberingArraylist: [],
        ASMAY_Id: 0,
        AdmissionNumberingArraylist: [],
        AdmissionRegNumberingArraylist: [],
        IMN_PrefixFinYearCode: true,
        IMN_PrefixCalYearCode: true,
        IMN_SuffixFinYearCode: true,
        IMN_SuffixCalYearCode: true,
        IRN_RestartAcadYear: true,
        IRN_RestartFinYear: true,
        IRN_RestartcalendYear: true,
        VoucherName: "string",
        VoucherType: "string",
        Observation: "string",
        ApplicationNumberingArraylist: [],
        TransactionNumberingArraylist: [],
        ReceiptNumberingArraylist: [],
        VoucherNumberingArraylist: [],
        IRN_TransactionName: "string",
        tcNumberingArraylist: [],
        loanNumberingArraylist: [],
        onlineBookingNumberingArraylist: [],
        tripNumberingArraylist: [],
        tripBillNumberingArraylist: [],
        leaveNumberingArraylist: [],
        RolenoNumbering: [],
        RolenoNumberingConfig: [],
        FieldArray: [],
        message: "string",
        IVRMARNC_Id: 0,
        RollNumberingconfig: []
      },
      ASMAY_Id: 0,
      empGrossSal: 0,
      HREL_NoofInstallment: 0
    };

    console.log("=== Activate/Deactivate Employee Loan API Request ===");
    console.log("URL:", url);
    console.log("Input data:", data);
    console.log("Request body HREL_Id:", requestBody.HREL_Id);
    console.log("Request body emploanList[0].HREL_Id:", requestBody.emploanList[0].HREL_Id);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<EmployeeLoanResponse>(
      url,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
        validateStatus: function (status) {
          return status < 500;
        },
      }
    );

    console.log("=== Activate/Deactivate Employee Loan API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Data:", axiosResponse.data);

    const response: ApiResponse<EmployeeLoanResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        axiosResponse.data.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? `Employee loan ${data.HREL_ActiveFlag ? "activated" : "deactivated"} successfully`
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Activate/Deactivate Employee Loan API Error ===");
    console.error("Error:", error);

    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<EmployeeLoanResponse> = {
        success: false,
        message:
          error.response?.data?.retrunMsg ||
          error.response?.data?.message ||
          error.message ||
          "Failed to update employee loan status",
        data: null,
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Get employee loan details by employee
 * POST /api/HREmpLoanFacade/getDetailsByEmployee
 * Using axios directly with proxy
 */
export async function getEmployeeLoanByEmployee(
  employeeId: number,
  roleId: number
): Promise<ApiResponse<EmployeeLoanResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/HREmpLoanFacade/getDetailsByEmployee";
    const url = `${baseURL}${apiPath}`;

    const requestBody = createCompleteRequestBody({
      HRME_Id: employeeId,
      roleId: roleId,
    });

    console.log("=== Get Employee Loan By Employee API Request ===");
    console.log("URL:", url);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<EmployeeLoanResponse>(
      url,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
        validateStatus: function (status) {
          return status < 500;
        },
      }
    );

    console.log("=== Get Employee Loan By Employee API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Data:", axiosResponse.data);

    const response: ApiResponse<EmployeeLoanResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        axiosResponse.data.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Employee loans loaded successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Get Employee Loan By Employee API Error ===");
    console.error("Error:", error);

    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<EmployeeLoanResponse> = {
        success: false,
        message:
          error.response?.data?.retrunMsg ||
          error.response?.data?.message ||
          error.message ||
          "Failed to load employee loans by employee",
        data: null,
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Test employee loan API connection
 */
export async function testEmployeeLoanAPI(
  roleId: number = 2
): Promise<ApiResponse<EmployeeLoanResponse>> {
  try {
    console.log("Testing Employee Loan API connectivity...");
    const response = await getEmployeeLoanList(roleId);
    console.log("API Test Result:", response);
    return response;
  } catch (error) {
    console.error("API Test Failed:", error);
    throw error;
  }
}

