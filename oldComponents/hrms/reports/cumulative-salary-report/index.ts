import axios from "axios";
import { env } from "@/env";
import type {
  CumulativeSalaryReportOnloadResponse,
  CumulativeSalaryReportSearchRequest,
  CumulativeSalaryReportSearchResponse,
  ApiResponse,
} from "@/types/hrms/cumulative-salary-report";

export async function getCumulativeSalaryReportOnload(
  MI_Id: number = 30
): Promise<ApiResponse<CumulativeSalaryReportOnloadResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = `/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${MI_Id}`;
    const url = `${baseURL}${apiPath}`;

    console.log("=== Cumulative Salary Report Onload API Request ===");
    console.log("URL:", url);
    console.log("MI_Id:", MI_Id);

    const axiosResponse = await axios.post<CumulativeSalaryReportOnloadResponse>(
      url,
      {}, // Empty body for POST request
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        validateStatus: function (status) {
          return status < 500;
        },
      }
    );

    console.log("=== Cumulative Salary Report Onload API Response ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response data keys:", axiosResponse.data ? Object.keys(axiosResponse.data) : []);
    
    // Log individual dropdown arrays
    if (axiosResponse.data) {
      console.log("groupTypedropdownlist length:", axiosResponse.data.groupTypedropdownlist?.length || 0);
      console.log("departmentdropdownlist length:", axiosResponse.data.departmentdropdownlist?.length || 0);
      console.log("designationdropdownlist length:", axiosResponse.data.designationdropdownlist?.length || 0);
      console.log("monthdropdown length:", axiosResponse.data.monthdropdown?.length || 0);
      console.log("leaveyeardropdown length:", axiosResponse.data.leaveyeardropdown?.length || 0);
    }

    // Manually wrap the response in ApiResponse format
    const response: ApiResponse<CumulativeSalaryReportOnloadResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Data loaded successfully"
          : `HTTP ${axiosResponse.status}`,
      data: axiosResponse.data,
    };

    console.log("Wrapped response:", {
      success: response.success,
      message: response.message,
      groupTypeCount: response.data?.groupTypedropdownlist?.length || 0,
      departmentCount: response.data?.departmentdropdownlist?.length || 0,
      designationCount: response.data?.designationdropdownlist?.length || 0,
      monthCount: response.data?.monthdropdown?.length || 0,
      yearCount: response.data?.leaveyeardropdown?.length || 0,
    });

    return response;
  } catch (error: any) {
    console.error("=== Error fetching cumulative salary report onload data ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }

    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to load cumulative salary report data",
      data: undefined,
    };
  }
}

export async function searchCumulativeSalaryReport(
  data: CumulativeSalaryReportSearchRequest
): Promise<ApiResponse<CumulativeSalaryReportSearchResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = "/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew";
    const url = `${baseURL}${apiPath}`;

    console.log("=== Cumulative Salary Report Search API Request (GetEmployeedetailsBySelectionNew) ===");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(data, null, 2));

    const axiosResponse = await axios.post<CumulativeSalaryReportSearchResponse>(
      url,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        validateStatus: function (status) {
          return status < 500;
        },
      }
    );

    console.log("=== Cumulative Salary Report Search API Response (GetEmployeedetailsBySelectionNew) ===");
    console.log("Status:", axiosResponse.status);
    console.log("Response:", axiosResponse.data);

    const response: ApiResponse<CumulativeSalaryReportSearchResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message:
        axiosResponse.data?.retrunMsg ||
        (axiosResponse.status >= 200 && axiosResponse.status < 300
          ? "Search completed successfully"
          : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data,
    };

    return response;
  } catch (error: any) {
    console.error("=== Error searching cumulative salary report ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);

    return {
      success: false,
      message: error.message || "Failed to search cumulative salary report",
      data: undefined,
    };
  }
}

export async function testCumulativeSalaryReportAPI(
  MI_Id: number = 30
): Promise<ApiResponse<CumulativeSalaryReportOnloadResponse>> {
  try {
    console.log("Testing Cumulative Salary Report API connectivity...");
    const response = await getCumulativeSalaryReportOnload(MI_Id);
    console.log("API Test Result:", response);
    return response;
  } catch (error) {
    console.error("API Test Failed:", error);
    throw error;
  }
}
