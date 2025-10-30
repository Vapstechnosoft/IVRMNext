import axios from "axios";
import { env } from "@/env";
import type {
  EmployeeRegisterOnloadRequest,
  EmployeeRegisterOnloadResponse,
  EmployeeRegisterSaveRequest,
  EmployeeRegisterSaveResponse,
  EmployeePersonalDetailsRequest,
  EmployeePersonalDetailsResponse,
  EmployeeAddressDetailsRequest,
  EmployeeAddressDetailsResponse,
  EmployeeQualificationDetailsRequest,
  EmployeeQualificationDetailsResponse,
  EmployeeExperienceDetailsRequest,
  EmployeeExperienceDetailsResponse,
  EmployeeDocumentDetailsRequest,
  EmployeeDocumentDetailsResponse,
  EmployeeMedicalDetailsRequest,
  EmployeeMedicalDetailsResponse,
  EmployeeOtherDetailsRequest,
  EmployeeOtherDetailsResponse,
  EmployeeEarningDetailsRequest,
  EmployeeEarningDetailsResponse,
  EmployeeDeductionDetailsRequest,
  EmployeeDeductionDetailsResponse,
  EmployeeArrearDetailsRequest,
  EmployeeArrearDetailsResponse,
  GetEmployeeByIdRequest,
  GetEmployeeByIdResponse,
  SaveQualificationRequest,
  SaveQualificationResponse,
  ApiResponse,
} from "@/types/hrms/employee-register";

export async function getEmployeeRegisterOnload(
  payload: EmployeeRegisterOnloadRequest
): Promise<ApiResponse<EmployeeRegisterOnloadResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/onloadgetdetails";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Register Onload API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeRegisterOnloadResponse>(
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
    
    console.log("=== Employee Register Onload API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response keys:", Object.keys(axiosResponse.data || {}));
    
    // Manually wrap the response in ApiResponse format
    const response: ApiResponse<EmployeeRegisterOnloadResponse> = {
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
      dataKeys: response.data ? Object.keys(response.data) : [],
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error fetching employee register onload ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to load employee registration data",
      data: null,
    };
  }
}

export async function saveEmployeeRegister(
  payload: EmployeeRegisterSaveRequest
): Promise<ApiResponse<EmployeeRegisterSaveResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationFacade";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Register Save/Update API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeRegisterSaveResponse>(
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
    
    console.log("=== Employee Register Save/Update API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    // Manually wrap the response in ApiResponse format
    const response: ApiResponse<EmployeeRegisterSaveResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        (axiosResponse.data as any)?.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? payload.HRME_Id === 0 ? "Employee created successfully" : "Employee updated successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving/updating employee ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee registration data",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeePersonalDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Personal Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeePersonalDetailsResponse>(
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
    
    console.log("=== Employee Personal Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeePersonalDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee personal details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee personal details",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeeAddressDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Address Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeAddressDetailsResponse>(
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
    
    console.log("=== Employee Address Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeeAddressDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee address details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee address details",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeeQualificationDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Qualification Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeQualificationDetailsResponse>(
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
    
    console.log("=== Employee Qualification Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeeQualificationDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee qualification details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee qualification details",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeeExperienceDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Experience Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeExperienceDetailsResponse>(
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
    
    console.log("=== Employee Experience Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeeExperienceDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee experience details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee experience details",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeeDocumentDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Document Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeDocumentDetailsResponse>(
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
    
    console.log("=== Employee Document Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeeDocumentDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee document details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee document details",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeeMedicalDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Medical Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeMedicalDetailsResponse>(
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
    
    console.log("=== Employee Medical Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeeMedicalDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee medical details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee medical details",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeeOtherDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Other Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeOtherDetailsResponse>(
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
    
    console.log("=== Employee Other Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeeOtherDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee other details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee other details",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeeEarningDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Earning Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeEarningDetailsResponse>(
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
    
    console.log("=== Employee Earning Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeeEarningDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee earning details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee earning details",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeeDeductionDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Deduction Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeDeductionDetailsResponse>(
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
    
    console.log("=== Employee Deduction Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeeDeductionDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee deduction details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee deduction details",
      data: null,
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
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/AddUpdateEmployeeArrearDetailsNew";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Employee Arrear Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const axiosResponse = await axios.post<EmployeeArrearDetailsResponse>(
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
    
    console.log("=== Employee Arrear Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<EmployeeArrearDetailsResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving employee arrear details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save employee arrear details",
      data: null,
    };
  }
}

/**
 * Get Employee by ID
 * GET /api/EmployeeRegistrationNew/getRecordById/{id}
 */
export async function getEmployeeById(
  id: number
): Promise<ApiResponse<GetEmployeeByIdResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = `/api/EmployeeRegistrationNew/getRecordById/${id}`;
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Get Employee by ID API Request ===");
    console.log("URL:", url);
    console.log("Employee ID:", id);
    
    const axiosResponse = await axios.get<GetEmployeeByIdResponse>(
      url,
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
    
    console.log("=== Get Employee by ID API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response keys:", Object.keys(axiosResponse.data || {}));
    
    const response: ApiResponse<GetEmployeeByIdResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      HRME_Id: response.data?.HRME_Id,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error fetching employee by ID ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to fetch employee data",
      data: null,
    };
  }
}

/**
 * Save Qualification (New Endpoint)
 * POST /api/EmployeeRegistrationNew/SaveQulaification
 * This endpoint takes an array of qualification objects
 */
export async function saveQualification(
  qualifications: SaveQualificationRequest[]
): Promise<ApiResponse<SaveQualificationResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/SaveQulaification";
    const url = `${baseURL}${apiPath}`;
    
    console.log("=== Save Qualification API Request ===");
    console.log("URL:", url);
    console.log("Qualifications:", JSON.stringify(qualifications, null, 2));
    
    const axiosResponse = await axios.post<SaveQualificationResponse>(
      url,
      qualifications,
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
    
    console.log("=== Save Qualification API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);
    
    const response: ApiResponse<SaveQualificationResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: "Success",
      data: axiosResponse.data,
    };
    
    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
    });
    
    return response;
  } catch (error: any) {
    console.error("=== Error saving qualification ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to save qualification",
      data: null,
    };
  }
}

/**
 * Save Personal Details (combined Employee + Address) on Address tab save
 * POST /api/EmployeeRegistrationNew/SavePersonalDetails
 */
export async function savePersonalDetails(
  payload: any
): Promise<ApiResponse<any>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/EmployeeRegistrationNew/SavePersonalDetails";
    const url = `${baseURL}${apiPath}`;

    console.log("=== Save Personal Details API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const axiosResponse = await axios.post<any>(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      },
    });

    console.log("=== Save Personal Details API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    const response: ApiResponse<any> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: (axiosResponse.data as any)?.retrunMsg || "Success",
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Error saving personal details ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to save personal details",
      data: null,
    };
  }
}

