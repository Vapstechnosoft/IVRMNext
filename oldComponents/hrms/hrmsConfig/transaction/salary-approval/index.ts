import axios from "axios";
import { env } from "@/env";
import type {
  SalaryApprovalOnloadResponse,
  SalaryApprovalApiResponse,
} from "@/types/hrms/salary-approval";
import type { SalaryApprovalSearchInput, SalaryApprovalSearchResponse } from "@/types/hrms/salary-approval-search";

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Get salary approval process onload data
 * @param miId - Module ID (default: 30)
 * @returns Promise<SalaryApprovalApiResponse>
 */
export async function getSalaryApprovalProcess(
  miId: number = 30
): Promise<SalaryApprovalApiResponse> {
  try {
    const response = await axios.post<SalaryApprovalOnloadResponse>(
      `${API_BASE_URL}/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${miId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error fetching salary approval process data:", error);
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "Failed to fetch salary approval process data",
    };
  }
}

/**
 * Test API connection for salary approval process
 * @param miId - Module ID (default: 30)
 * @returns Promise<SalaryApprovalApiResponse>
 */
export async function testSalaryApprovalProcessAPI(
  miId: number = 30
): Promise<SalaryApprovalApiResponse> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${miId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return {
      success: response.status === 200,
      data: response.data,
      message: response.status === 200 ? "API connection successful" : "API connection failed",
    };
  } catch (error: any) {
    console.error("API test error:", error);
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "API connection failed",
    };
  }
}

/**
 * Search employees by selection for salary approval
 */
export async function searchSalaryApprovalBySelection(
  payload: SalaryApprovalSearchInput
): Promise<{ success: boolean; data: SalaryApprovalSearchResponse | null; message?: string }>{
  try {
    const response = await axios.post<SalaryApprovalSearchResponse>(
      `${API_BASE_URL}/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error searching salary approval employees:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "Search failed",
    };
  }
}
