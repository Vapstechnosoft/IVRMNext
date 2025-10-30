import { api, ApiResponse } from '@/lib/apiService';
import type {
  SalaryUpdationResponse,
  SalaryUpdationInput
} from '@/types/hrms/salary-updation';

export async function getSalaryUpdationList(roleId: number): Promise<ApiResponse<SalaryUpdationResponse>> {
  try {
    const url = `/api/salaryUpdation/getalldetails/${roleId}`;
    console.log('Fetching salary updation list from:', url);
    const response = await api.get<SalaryUpdationResponse>(url);
    console.log('Salary updation list response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching salary updation list:', error);
    throw error;
  }
}

export async function saveSalaryUpdation(data: SalaryUpdationInput): Promise<ApiResponse<SalaryUpdationResponse>> {
  try {
    const url = `/api/salaryUpdation/`;
    console.log('Saving salary updation:', url, data);
    const response = await api.post<SalaryUpdationResponse>(url, data);
    console.log('Save salary updation response:', response);
    return response;
  } catch (error) {
    console.error('Error saving salary updation:', error);
    throw error;
  }
}

export async function testSalaryUpdationAPI(roleId: number = 2): Promise<ApiResponse<SalaryUpdationResponse>> {
  try {
    console.log('Testing Salary Updation API connectivity...');
    const response = await getSalaryUpdationList(roleId);
    console.log('API Test Result:', response);
    return response;
  } catch (error) {
    console.error('API Test Failed:', error);
    throw error;
  }
}

