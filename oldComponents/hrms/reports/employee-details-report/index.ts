import axios from "axios";
import {
  EmployeeDetailsReportOnloadRequest,
  EmployeeDetailsReportOnloadResponse,
  EmployeeDetailsReportFilterRequest,
  EmployeeDetailsReportFilterResponse,
  EmployeeDetailsReportSearchRequest,
  EmployeeDetailsReportSearchResponse,
  ApiResponse,
} from "@/types/hrms/employee-details-report";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hrmsservicehub-bwfuevcrhyeaccgv.canadacentral-01.azurewebsites.net";

export async function getEmployeeDetailsReportOnload(
  MI_Id: number = 30,
  LogInUserId: number = 2
): Promise<ApiResponse<EmployeeDetailsReportOnloadResponse>> {
  try {
    console.log("=== Employee Details Report Onload API Call ===");
    console.log("MI_Id:", MI_Id);
    console.log("LogInUserId:", LogInUserId);

    const requestBody: EmployeeDetailsReportOnloadRequest = {
      MI_Id,
      LogInUserId,
    };

    console.log("Request body:", requestBody);

    const response = await axios.post(
      `${API_BASE_URL}/api/EmployeeDetailsReportFacade/onloadgetdetailsNew`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response Status:", response.status);
    console.log("API Response Data:", response.data);

    return {
      success: true,
      message: "Data loaded successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error in getEmployeeDetailsReportOnload:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function filterEmployeeDetailsReport(
  requestBody: EmployeeDetailsReportFilterRequest
): Promise<ApiResponse<EmployeeDetailsReportFilterResponse>> {
  try {
    console.log("=== Employee Details Report Filter API Call ===");
    console.log("Request body:", requestBody);

    const response = await axios.post(
      `${API_BASE_URL}/api/EmployeeDetailsReportFacade/FilterEmployeeDataNew`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response Status:", response.status);
    console.log("API Response Data:", response.data);

    return {
      success: true,
      message: "Data filtered successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error in filterEmployeeDetailsReport:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function searchEmployeeDetailsReport(
  requestBody: EmployeeDetailsReportSearchRequest
): Promise<ApiResponse<EmployeeDetailsReportSearchResponse>> {
  try {
    console.log("=== Employee Details Report Search API Call ===");
    console.log("Request body:", requestBody);

    const response = await axios.post(
      `${API_BASE_URL}/api/EmployeeDetailsReportFacade/getEmployeedetailsBySelectionNew`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response Status:", response.status);
    console.log("API Response Data:", response.data);

    return {
      success: true,
      message: "Search completed successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error in searchEmployeeDetailsReport:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
