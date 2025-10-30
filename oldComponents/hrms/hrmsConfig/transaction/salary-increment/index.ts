import axios from "axios";
import { env } from "@/env";
import type {
  SalaryIncrementOnloadRequest,
  SalaryIncrementOnloadResponse,
  SalaryIncrementSaveRequest,
  SalaryIncrementSaveResponse,
  SalaryIncrementDeleteRequest,
  SalaryIncrementDeleteResponse,
  ApiResponse,
} from "@/types/hrms/salary-increment";

export async function getSalaryIncrementOnload(
  payload: Partial<SalaryIncrementOnloadRequest>
): Promise<ApiResponse<SalaryIncrementOnloadResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails";
    const url = `${baseURL}${apiPath}`;

    // Provide complete payload structure as expected by API
    const defaultPayload = {
      MI_Id: 30,
      roleId: 0,
      HREIC_Id: 0,
      HRME_Id: 0,
      HREIC_LastIncrementDate: new Date().toISOString(),
      HREIC_IncrementDueDate: new Date().toISOString(),
      HREIC_IncrementDate: new Date().toISOString(),
      Fromdate: new Date().toISOString(),
      Todate: new Date().toISOString(),
      HREIC_ArrearApplicableFlg: true,
      HREIC_ArrearGivenFlg: true,
      HREIC_ArrearMonths: 0,
      UserId: 0,
      HREIC_ActiveFlag: true,
      HREICED_Id: true,
      HRMED_Id: 0,
      HREICED_Amount: 0,
      HREICED_Percentage: "string",
      HREICED_ActiveFlag: true,
      retrunMsg: "string",
      Status: "string",
      monthdropdown: [
        {
          IVRM_Month_Id: 0,
          IVRM_Month_Name: "string",
          Is_Active: true,
          IVRM_Month_Max_Days: 0,
        },
      ],
      griddata: [
        {
          HRMED_Name: "string",
          HREIC_Id: 0,
          EmployeeName: "string",
          HRMD_DepartmentName: "string",
          Amount: 0,
          Flag: "string",
        },
      ],
      Reportdata: [
        {
          Data: {
            additionalProp1: "string",
            additionalProp2: "string",
            additionalProp3: "string",
          },
        },
      ],
      employeelist: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
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
          HRME_DOB: new Date().toISOString(),
          HRME_DOJ: new Date().toISOString(),
          HRME_ExpectedRetirementDate: new Date().toISOString(),
          HRME_PFDate: new Date().toISOString(),
          HRME_ESIDate: new Date().toISOString(),
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
          HRME_DOL: new Date().toISOString(),
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
          HRME_DOC: new Date().toISOString(),
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
          HRME_PensionStoppedDate: new Date().toISOString(),
          HRME_FPFNotApplicableFlg: true,
          HRME_EPFNotApplicableFlg: true,
          HRME_AllowSoftwareAccessFlg: true,
        },
      ],
      earningdeductiontype: [
        {
          HRMED_Id: 0,
          MI_Id: 0,
          HRMED_Name: "string",
          HRMED_EDTypeFlag: "string",
          HRMED_EarnDedFlag: "string",
          HRMED_AmountPercentFlag: "string",
          HRMED_AmountPercent: "string",
          HRMED_ActiveFlag: true,
          HRMED_RoundOffFlag: "string",
          HRMED_Order: 0,
          HRMED_ReviseFlg: true,
        },
      ],
      getempsdetails: [
        {
          Fields: {
            additionalProp1: "string",
            additionalProp2: "string",
            additionalProp3: "string",
          },
        },
      ],
      leaveyeardropdown: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
          HRMLY_Id: 0,
          MI_Id: 0,
          HRMLY_LeaveYear: "string",
          HRMLY_FromDate: new Date().toISOString(),
          HRMLY_ToDate: new Date().toISOString(),
          HRMLY_ActiveFlag: true,
          HRMLY_LeaveYearOrder: 0,
        },
      ],
      Type: "string",
      Option: "string",
      Month: 0,
      Year: 0,
      selected_hrmeID: 0,
      employee: [],
      ...payload,
    };

    console.log("=== Salary Increment Onload API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(defaultPayload, null, 2));

    const axiosResponse = await axios.post<SalaryIncrementOnloadResponse>(
      url,
      defaultPayload,
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

    console.log("=== Salary Increment Onload API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    const response: ApiResponse<SalaryIncrementOnloadResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        (axiosResponse.data as any)?.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Success"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      employeeCount: response.data?.employeelist?.length || 0,
      earningHeadCount: response.data?.earningdeductiontype?.length || 0,
    });

    return response;
  } catch (error: any) {
    console.error("=== Error fetching salary increment onload data ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to load salary increment data",
      data: undefined,
    };
  }
}

export async function saveSalaryIncrement(
  payload: SalaryIncrementSaveRequest
): Promise<ApiResponse<SalaryIncrementSaveResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeSalaryIncreementProcessFacade";
    const url = `${baseURL}${apiPath}`;

    console.log("=== Salary Increment Save/Update API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log(
      "Operation:",
      payload.HREIC_Id === 0 ? "CREATE" : "UPDATE"
    );

    const axiosResponse = await axios.post<SalaryIncrementSaveResponse>(
      url,
      payload,
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

    console.log("=== Salary Increment Save/Update API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    const response: ApiResponse<SalaryIncrementSaveResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        (axiosResponse.data as any)?.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? payload.HREIC_Id === 0
            ? "Salary increment created successfully"
            : "Salary increment updated successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HREIC_Id: response.data?.HREIC_Id,
    });

    return response;
  } catch (error: any) {
    console.error("=== Error saving/updating salary increment ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to save salary increment",
      data: undefined,
    };
  }
}

export async function deleteSalaryIncrement(
  payload: SalaryIncrementDeleteRequest
): Promise<ApiResponse<SalaryIncrementDeleteResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById";
    const url = `${baseURL}${apiPath}`;

    console.log("=== Salary Increment Delete API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const axiosResponse = await axios.post<SalaryIncrementDeleteResponse>(
      url,
      payload,
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

    console.log("=== Salary Increment Delete API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    const response: ApiResponse<SalaryIncrementDeleteResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        (axiosResponse.data as any)?.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Salary increment record deleted successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
    });

    return response;
  } catch (error: any) {
    console.error("=== Error deleting salary increment ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to delete salary increment",
      data: undefined,
    };
  }
}

