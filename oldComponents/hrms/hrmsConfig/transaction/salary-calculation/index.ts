import axios from "axios";
import { env } from "@/env";
import type {
  SalaryCalculationOnloadRequest,
  SalaryCalculationOnloadResponse,
  SalaryCalculationSearchRequest,
  SalaryCalculationInput,
  SalaryCalculationGenerateRequest,
  SalaryCalculationGenerateResponse,
  ApiResponse,
} from "@/types/hrms/salary-calculation";

export async function getSalaryCalculationOnload(
  payload: SalaryCalculationOnloadRequest
): Promise<ApiResponse<SalaryCalculationOnloadResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/employeeSalaryCalculationFacade/onloadgetdetailsNew";
    const url = `${baseURL}${apiPath}`;

    console.log("=== Salary Calculation Onload API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const axiosResponse = await axios.post<SalaryCalculationOnloadResponse>(
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

    console.log("=== Salary Calculation Onload API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    // Manually wrap the response in ApiResponse format
    const response: ApiResponse<SalaryCalculationOnloadResponse> = {
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
    console.error("=== Error fetching salary calculation onload data ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to load salary calculation data",
      data: undefined,
    };
  }
}

export async function saveSalaryCalculation(
  data: SalaryCalculationInput
): Promise<ApiResponse<SalaryCalculationOnloadResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/SalaryCalculation/";
    const url = `${baseURL}${apiPath}`;

    console.log("=== Salary Calculation Save API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(data, null, 2));

    const axiosResponse = await axios.post<SalaryCalculationOnloadResponse>(
      url,
      data,
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

    console.log("=== Salary Calculation Save API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    const response: ApiResponse<SalaryCalculationOnloadResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        (axiosResponse.data as any)?.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Salary calculation saved successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Error saving salary calculation ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to save salary calculation",
      data: undefined,
    };
  }
}

export async function searchSalaryCalculationBySelection(
  payload: SalaryCalculationSearchRequest
): Promise<ApiResponse<SalaryCalculationOnloadResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/employeeSalaryCalculationFacade/getEmployeedetailsBySelectionNew";
    const url = `${baseURL}${apiPath}`;

    console.log("=== Salary Calculation Search API Request ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const axiosResponse = await axios.post<SalaryCalculationOnloadResponse>(
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

    console.log("=== Salary Calculation Search API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    const response: ApiResponse<SalaryCalculationOnloadResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        (axiosResponse.data as any)?.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Search completed successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      employeeCount: response.data?.employeedropdown?.length || 0,
    });

    return response;
  } catch (error: any) {
    console.error("=== Error searching salary calculation data ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to search salary calculation data",
      data: undefined,
    };
  }
}

export async function testSalaryCalculationAPI(): Promise<
  ApiResponse<SalaryCalculationOnloadResponse>
> {
  try {
    console.log("Testing Salary Calculation API connectivity...");
    const payload = {
      MI_Id: 30,
      LogInUserId: 0,
    };
    const response = await getSalaryCalculationOnload(payload);
    console.log("API Test Result:", response);
    return response;
  } catch (error) {
    console.error("API Test Failed:", error);
    throw error;
  }
}

/**
 * Generate salary for selected employees
 * POST /api/employeeSalaryCalculationFacade/calculateSelectedEmployeeSalaryNew
 */
export async function generateSalaryForSelectedEmployees(
  data: SalaryCalculationGenerateRequest
): Promise<ApiResponse<SalaryCalculationGenerateResponse>> {
  try {
    console.log("=== generateSalaryForSelectedEmployees SERVER FUNCTION CALLED ===");
    console.log("Input data:", data);
    
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/employeeSalaryCalculationFacade/calculateSelectedEmployeeSalaryNew";
    const url = `${baseURL}${apiPath}`;

    console.log("=== Generate Salary for Selected Employees API Request ===");
    console.log("URL:", url);
    console.log("Request body:", JSON.stringify(data, null, 2));

    const axiosResponse = await axios.post<SalaryCalculationGenerateResponse>(
      url,
      data,
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

    console.log("=== Generate Salary for Selected Employees API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    const response: ApiResponse<SalaryCalculationGenerateResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        axiosResponse.data?.retrunMsg ||
        axiosResponse.data?.message ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Salary calculation completed successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      processedCount: response.data?.processedCount || 0,
      failedCount: response.data?.failedCount || 0,
    });

    return response;
  } catch (error: any) {
    console.error("=== Error generating salary for selected employees ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to generate salary for selected employees",
      data: undefined,
    };
  }
}




