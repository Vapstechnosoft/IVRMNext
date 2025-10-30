import axios from "axios";
import { env } from "@/env";
import { ApiResponse } from '@/lib/apiService';
import type {
  MassUpdationResponse,
  MassUpdationInput,
  MassUpdationOnloadRequest
} from '@/types/hrms/mass-updation';

// Helper function to create a complete nested object structure matching API requirements
function createCompleteRequestBody(
  baseFields: Partial<MassUpdationOnloadRequest>
): MassUpdationOnloadRequest {
  const now = new Date().toISOString();
  
  return {
    MI_Id: baseFields.MI_Id || 30,
    retrunMsg: baseFields.retrunMsg || "string",
    roleId: baseFields.roleId || 0,
    Type: baseFields.Type || "string",
    HRME_Id: baseFields.HRME_Id || 0,
    employeedropdown: baseFields.employeedropdown || [],
    departmentdropdown: baseFields.departmentdropdown || [],
    designationdropdown: baseFields.designationdropdown || [],
    groupTypedropdown: baseFields.groupTypedropdown || [],
    headdropdown: baseFields.headdropdown || [],
    eardettypelist: baseFields.eardettypelist || [],
    groupTypeselected: baseFields.groupTypeselected || [0],
    departmentselected: baseFields.departmentselected || [0],
    designationselected: baseFields.designationselected || [0],
    EmployeeCode: baseFields.EmployeeCode || "string",
    HRME_EmployeeFirstName: baseFields.HRME_EmployeeFirstName || "string",
    HRME_EmployeeMiddleName: baseFields.HRME_EmployeeMiddleName || "string",
    HRME_EmployeeLastName: baseFields.HRME_EmployeeLastName || "string",
    employeeselected: baseFields.employeeselected || [0],
    EarningDeduction: baseFields.EarningDeduction || "string",
    AmountPercentage: baseFields.AmountPercentage || "string",
    HREED_Amount: baseFields.HREED_Amount || 0,
    HREED_Percentage: baseFields.HREED_Percentage || "string",
    HRMED_Id: baseFields.HRMED_Id || 0,
    AddRemove: baseFields.AddRemove || "string",
    groupTypedropdownlist: baseFields.groupTypedropdownlist || [],
    departmentdropdownlist: baseFields.departmentdropdownlist || [],
    designationdropdownlist: baseFields.designationdropdownlist || [],
    employeeDetails: baseFields.employeeDetails || [],
    LogInUserId: baseFields.LogInUserId || 0,
    hrmgT_IdList: baseFields.hrmgT_IdList || [0],
    employeeTypeIdList: baseFields.employeeTypeIdList || [0],
    hrmD_IdList: baseFields.hrmD_IdList || [0],
    hrmdeS_IdList: baseFields.hrmdeS_IdList || [0],
    groupTypeIdList: baseFields.groupTypeIdList || [0]
  };
}

/**
 * Get onload details for mass updation
 * POST /api/massUpdationFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getMassUpdationList(
  roleId: number
): Promise<ApiResponse<MassUpdationResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/massUpdationFacade/onloadgetdetails";
    const url = `${baseURL}${apiPath}`;

    const requestBody = createCompleteRequestBody({
      MI_Id: 30,
      roleId: roleId,
    });

    console.log("=== Mass Updation Onload API Request ===");
    console.log("URL:", url);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MassUpdationResponse>(
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

    console.log("=== Mass Updation Onload API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    const response: ApiResponse<MassUpdationResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        axiosResponse.data.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Mass updation data loaded successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Mass Updation Onload API Error ===");
    console.error("Error:", error);

    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MassUpdationResponse> = {
        success: false,
        message:
          error.response?.data?.retrunMsg ||
          error.response?.data?.message ||
          error.message ||
          "Failed to load mass updation data",
        data: null,
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Save/Update mass updation (Facade)
 * POST /api/massUpdationFacade
 * Using axios directly with proxy
 */
export async function saveMassUpdation(
  data: MassUpdationInput
): Promise<ApiResponse<MassUpdationResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/massUpdationFacade";
    const url = `${baseURL}${apiPath}`;

    const requestBody = createCompleteRequestBody({
      MI_Id: data.MI_Id || 30,
      roleId: data.roleId,
      Type: data.Type || "string",
      HRME_Id: data.HRME_Id || 0,
      groupTypeselected: data.groupTypeselected || [0],
      departmentselected: data.departmentselected || [0],
      designationselected: data.designationselected || [0],
      employeeselected: data.employeeselected || [0],
      EarningDeduction: data.EarningDeduction || "string",
      AmountPercentage: data.AmountPercentage || "string",
      HREED_Amount: data.HREED_Amount || 0,
      HREED_Percentage: data.HREED_Percentage || "string",
      HRMED_Id: data.HRMED_Id || 0,
      AddRemove: data.AddRemove || "string",
      LogInUserId: data.LogInUserId || 0,
      hrmgT_IdList: data.hrmgT_IdList || [0],
      employeeTypeIdList: data.employeeTypeIdList || [0],
      hrmD_IdList: data.hrmD_IdList || [0],
      hrmdeS_IdList: data.hrmdeS_IdList || [0],
      groupTypeIdList: data.groupTypeIdList || [0],
    });

    console.log("=== Save Mass Updation API Request ===");
    console.log("URL:", url);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MassUpdationResponse>(
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

    console.log("=== Save Mass Updation API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Data:", axiosResponse.data);

    const isSuccess =
      axiosResponse.status >= 200 &&
      axiosResponse.status < 300 &&
      (!axiosResponse.data.retrunMsg ||
        !axiosResponse.data.retrunMsg.toLowerCase().includes("error"));

    const response: ApiResponse<MassUpdationResponse> = {
      success: isSuccess,
      message:
        axiosResponse.data.retrunMsg ||
        (isSuccess
          ? "Mass updation saved successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Save Mass Updation API Error ===");
    console.error("Error:", error);

    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MassUpdationResponse> = {
        success: false,
        message:
          error.response?.data?.retrunMsg ||
          error.response?.data?.message ||
          error.message ||
          "Failed to save mass updation",
        data: null,
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Search employees by selection criteria
 * POST /api/massUpdationFacade/FilterEmployeeData
 * Using axios directly with proxy
 */
export async function searchMassUpdationEmployees(
  data: MassUpdationInput
): Promise<ApiResponse<MassUpdationResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/massUpdationFacade/FilterEmployeeData";
    const url = `${baseURL}${apiPath}`;

    const requestBody = createCompleteRequestBody({
      MI_Id: data.MI_Id || 30,
      roleId: data.roleId,
      Type: data.Type || "string",
      HRME_Id: data.HRME_Id || 0,
      groupTypeselected: data.groupTypeselected || [0],
      departmentselected: data.departmentselected || [0],
      designationselected: data.designationselected || [0],
      employeeselected: data.employeeselected || [0],
      EarningDeduction: data.EarningDeduction || "string",
      AmountPercentage: data.AmountPercentage || "string",
      HREED_Amount: data.HREED_Amount || 0,
      HREED_Percentage: data.HREED_Percentage || "string",
      HRMED_Id: data.HRMED_Id || 0,
      AddRemove: data.AddRemove || "string",
      LogInUserId: data.LogInUserId || 0,
      hrmgT_IdList: data.hrmgT_IdList || [0],
      employeeTypeIdList: data.employeeTypeIdList || [0],
      hrmD_IdList: data.hrmD_IdList || [0],
      hrmdeS_IdList: data.hrmdeS_IdList || [0],
      groupTypeIdList: data.groupTypeIdList || [0],
    });

    console.log("=== Search Mass Updation Employees API Request ===");
    console.log("URL:", url);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MassUpdationResponse>(
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

    console.log("=== Search Mass Updation Employees API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Data:", axiosResponse.data);

    const isSuccess =
      axiosResponse.status >= 200 &&
      axiosResponse.status < 300 &&
      (!axiosResponse.data.retrunMsg ||
        !axiosResponse.data.retrunMsg.toLowerCase().includes("error"));

    const response: ApiResponse<MassUpdationResponse> = {
      success: isSuccess,
      message:
        axiosResponse.data.retrunMsg ||
        (isSuccess
          ? "Employee search completed successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Search Mass Updation Employees API Error ===");
    console.error("Error:", error);

    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MassUpdationResponse> = {
        success: false,
        message:
          error.response?.data?.retrunMsg ||
          error.response?.data?.message ||
          error.message ||
          "Failed to search employees",
        data: null,
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Get employee details by selection criteria (for save operation)
 * POST /api/massUpdationFacade/getEmployeedetailsBySelection
 * Using axios directly with proxy
 */
export async function getEmployeeDetailsBySelection(
  data: MassUpdationInput
): Promise<ApiResponse<MassUpdationResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/massUpdationFacade/getEmployeedetailsBySelection";
    const url = `${baseURL}${apiPath}`;

    const requestBody = createCompleteRequestBody({
      MI_Id: data.MI_Id || 30,
      roleId: data.roleId,
      Type: data.Type || "string",
      HRME_Id: data.HRME_Id || 0,
      groupTypeselected: data.groupTypeselected || [0],
      departmentselected: data.departmentselected || [0],
      designationselected: data.designationselected || [0],
      employeeselected: data.employeeselected || [0],
      EarningDeduction: data.EarningDeduction || "string",
      AmountPercentage: data.AmountPercentage || "string",
      HREED_Amount: data.HREED_Amount || 0,
      HREED_Percentage: data.HREED_Percentage || "string",
      HRMED_Id: data.HRMED_Id || 0,
      AddRemove: data.AddRemove || "string",
      LogInUserId: data.LogInUserId || 0,
      hrmgT_IdList: data.hrmgT_IdList || [0],
      employeeTypeIdList: data.employeeTypeIdList || [0],
      hrmD_IdList: data.hrmD_IdList || [0],
      hrmdeS_IdList: data.hrmdeS_IdList || [0],
      groupTypeIdList: data.groupTypeIdList || [0],
    });

    console.log("=== Get Employee Details By Selection API Request ===");
    console.log("URL:", url);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MassUpdationResponse>(
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

    console.log("=== Get Employee Details By Selection API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Data:", axiosResponse.data);

    const isSuccess =
      axiosResponse.status >= 200 &&
      axiosResponse.status < 300 &&
      (!axiosResponse.data.retrunMsg ||
        !axiosResponse.data.retrunMsg.toLowerCase().includes("error"));

    const response: ApiResponse<MassUpdationResponse> = {
      success: isSuccess,
      message:
        axiosResponse.data.retrunMsg ||
        (isSuccess
          ? "Employee details retrieved successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Get Employee Details By Selection API Error ===");
    console.error("Error:", error);

    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MassUpdationResponse> = {
        success: false,
        message:
          error.response?.data?.retrunMsg ||
          error.response?.data?.message ||
          error.message ||
          "Failed to get employee details",
        data: null,
      };
      return errorResponse;
    }

    throw error;
  }
}

export async function testMassUpdationAPI(
  roleId: number = 2
): Promise<ApiResponse<MassUpdationResponse>> {
  try {
    console.log("Testing Mass Updation API connectivity...");
    const response = await getMassUpdationList(roleId);
    console.log("API Test Result:", response);
    return response;
  } catch (error) {
    console.error("API Test Failed:", error);
    throw error;
  }
}
