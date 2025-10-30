import { api, ApiResponse } from '@/lib/apiService';
import type {
  CumulativeSalaryReportResponse,
  CumulativeSalaryReportInput
} from '@/types/hrms/cumulative-salary-report';

export async function getCumulativeSalaryReportList(roleId: number): Promise<ApiResponse<CumulativeSalaryReportResponse>> {
  try {
    const url = `/api/CumulativeSalaryReport/getalldetails/${roleId}`;
    console.log('Fetching cumulative salary report list from:', url);
    const response = await api.get<CumulativeSalaryReportResponse>(url);
    console.log('Cumulative salary report list response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching cumulative salary report list:', error);
    throw error;
  }
}

export async function saveCumulativeSalaryReport(data: CumulativeSalaryReportInput): Promise<ApiResponse<CumulativeSalaryReportResponse>> {
  try {
    const url = `/api/CumulativeSalaryReport/`;
    console.log('Saving cumulative salary report:', url, data);
    const response = await api.post<CumulativeSalaryReportResponse>(url, data);
    console.log('Save cumulative salary report response:', response);
    return response;
  } catch (error) {
    console.error('Error saving cumulative salary report:', error);
    throw error;
  }
}

export async function testCumulativeSalaryReportAPI(roleId: number = 2): Promise<ApiResponse<CumulativeSalaryReportResponse>> {
  try {
    console.log('Testing Cumulative Salary Report API connectivity...');
    const response = await getCumulativeSalaryReportList(roleId);
    console.log('API Test Result:', response);
    return response;
  } catch (error) {
    console.error('API Test Failed:', error);
    throw error;
  }
}




