import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type {
  MasterPayrollStandardResponse,
  MasterPayrollStandardInput,
  OnloadGetPayrollStandardDetailsRequest
} from '@/types/hrms/master-payroll-standard';

/**
 * Get master payroll standard configuration
 */

/**
 * Save/Update master payroll standard configuration
 */
export async function saveMasterPayrollStandard(data: MasterPayrollStandardInput): Promise<ApiResponse<MasterPayrollStandardResponse>> {
  try {
    const url = `/api/MasterPayrollStandard/`;
    console.log('Saving master payroll standard:', url, data);
    const response = await api.post<MasterPayrollStandardResponse>(url, data);
    console.log('Save master payroll standard response:', response);
    return response;
  } catch (error) {
    console.error('Error saving master payroll standard:', error);
    throw error;
  }
}

/**
 * Get onload details for master payroll standard
 * POST /api/MasterPayrollStandardFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadPayrollStandardDetails(roleId: number, signal?: AbortSignal): Promise<ApiResponse<MasterPayrollStandardResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/MasterPayrollStandardFacade/onloadgetdetails';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody: OnloadGetPayrollStandardDetailsRequest = {
      HRC_Id: 0,
      MI_Id: 30,
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
      roleId: roleId,
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
    };
    
    console.log('=== Onload Payroll Standard Details API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MasterPayrollStandardResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000,
      signal: signal,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('=== Onload Payroll Standard Details API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Data:', axiosResponse.data);

    const response: ApiResponse<MasterPayrollStandardResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Payroll standard loaded successfully' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Onload Payroll Standard Details API Error ===');
    console.error('Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MasterPayrollStandardResponse> = {
        success: false,
        message: error.response?.data?.retrunMsg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to load payroll standard',
        data: null
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Save/Update master payroll standard configuration (Facade)
 * POST /api/MasterPayrollStandardFacade
 * Using axios directly with proxy
 */
export async function saveMasterPayrollStandardFacade(data: MasterPayrollStandardInput): Promise<ApiResponse<MasterPayrollStandardResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/MasterPayrollStandardFacade';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody: OnloadGetPayrollStandardDetailsRequest = {
      HRC_Id: data.HRC_Id || 0,
      MI_Id: 30,
      HRC_PFMaxAmt: data.HRC_PFMaxAmt,
      HRC_FPFPer: data.HRC_FPFPer,
      HRC_EPFPer: data.HRC_EPFPer,
      HRC_AsPerEmpFlag: data.HRC_AsPerEmpFlag,
      HRC_PFAccNoPrefix: data.HRC_PFAccNoPrefix,
      HRC_AccNo2: data.HRC_AccNo2,
      HRC_AccNo21: data.HRC_AccNo21,
      HRC_AccNo22: data.HRC_AccNo22,
      HRC_RetirementYrs: data.HRC_RetirementYrs,
      HRC_ECodePrefix: data.HRC_ECodePrefix,
      HRC_ESIMax: data.HRC_ESIMax,
      HRC_ESIEmplrCont: data.HRC_ESIEmplrCont,
      HRC_PayMethodFlg: data.HRC_PayMethodFlg,
      HRC_ArrSalaryFlag: data.HRC_ArrSalaryFlag,
      HRC_CummArrFlag: data.HRC_CummArrFlag,
      HRC_SalaryFromDay: data.HRC_SalaryFromDay,
      HRC_SalaryToDay: data.HRC_SalaryToDay,
      HRC_ARTFPFPer: data.HRC_ARTFPFPer,
      HRC_ARTEPFPer: data.HRC_ARTEPFPer,
      HRC_ESIMaxAmount: data.HRC_ESIMaxAmount,
      HRC_AC2MinAmount: data.HRC_AC2MinAmount,
      HRC_AC21MinAmount: data.HRC_AC21MinAmount,
      HRC_AC22MinAmount: data.HRC_AC22MinAmount,
      HRC_SalAdvApprovalFlg: data.HRC_SalAdvApprovalFlg,
      HRC_LoanApprovalFlg: data.HRC_LoanApprovalFlg,
      HRC_LeaveApprovalFlg: data.HRC_LeaveApprovalFlg,
      HRC_IncrementApprovalFlg: data.HRC_IncrementApprovalFlg,
      HRC_ProbationApprovalFlg: data.HRC_ProbationApprovalFlg,
      HRC_SalApprovalFlg: data.HRC_SalApprovalFlg,
      HRC_EducationCess: data.HRC_EducationCess,
      roleId: data.MI_Id,
      retrunMsg: "string",
      hrStandardList: [],
      monthdropdown: [],
      HRC_partAmaxflag: data.HRC_partAmaxflag,
      HRC_partBmaxflag: data.HRC_partBmaxflag,
      HRC_IncrementMonth: data.HRC_IncrementMonth,
      HRC_MinimumWorkingPeriod: data.HRC_MinimumWorkingPeriod,
      HRC_FixedIncrmentFlg: data.HRC_FixedIncrmentFlg,
      HRC_NoOfOptionalHolidays: data.HRC_NoOfOptionalHolidays,
      HRC_IncrementOnceInMonths: data.HRC_IncrementOnceInMonths,
      HRC_AlertDay: data.HRC_AlertDay
    };

    console.log('=== Save Payroll Standard API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MasterPayrollStandardResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('=== Save Payroll Standard API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Data:', axiosResponse.data);

    // Check if retrunMsg indicates an error
    const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                     (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

    const response: ApiResponse<MasterPayrollStandardResponse> = {
      success: isSuccess,
      message: axiosResponse.data.retrunMsg || (isSuccess ? 'Payroll standard saved successfully' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Save Payroll Standard API Error ===');
    console.error('Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MasterPayrollStandardResponse> = {
        success: false,
        message: error.response?.data?.retrunMsg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to save payroll standard',
        data: null
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Get payroll standard record by ID
 * GET /api/MasterPayrollStandardFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getPayrollStandardById(id: number): Promise<ApiResponse<MasterPayrollStandardResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = `/api/MasterPayrollStandardFacade/getRecordById/${id}`;
    const url = `${baseURL}${apiPath}`;
    
    console.log('=== Get Payroll Standard By ID API Request ===');
    console.log('URL:', url);
    console.log('Payroll Standard ID:', id);

    const axiosResponse = await axios.get<MasterPayrollStandardResponse>(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('=== Get Payroll Standard By ID API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

    const response: ApiResponse<MasterPayrollStandardResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Get Payroll Standard By ID API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      const errorResponse: ApiResponse<MasterPayrollStandardResponse> = {
        success: false,
        message: error.response?.data?.retrunMsg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to fetch payroll standard by ID',
        data: null
      };
      return errorResponse;
    }
    
    throw error;
  }
}

/**
 * Activate or Deactivate a master payroll standard record
 * POST /api/MasterPayrollStandardFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivatePayrollStandard(data: { HRC_Id: number; HRC_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterPayrollStandardResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/MasterPayrollStandardFacade/deactivateRecordById';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody: OnloadGetPayrollStandardDetailsRequest = {
      HRC_Id: data.HRC_Id,
      MI_Id: 30,
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
      roleId: data.roleId || 0,
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
    };

    console.log('=== Activate/Deactivate Payroll Standard API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MasterPayrollStandardResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('=== Activate/Deactivate Payroll Standard API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Data:', axiosResponse.data);

    const response: ApiResponse<MasterPayrollStandardResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Payroll standard ${data.HRC_ActiveFlag ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Activate/Deactivate Payroll Standard API Error ===');
    console.error('Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MasterPayrollStandardResponse> = {
        success: false,
        message: error.response?.data?.retrunMsg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to update payroll standard status',
        data: null
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Test master payroll standard API connection
 */
export async function testMasterPayrollStandardAPI(roleId: number = 2): Promise<ApiResponse<MasterPayrollStandardResponse>> {
  try {
    console.log('Testing Master Payroll Standard API connectivity...');
    const response = await getOnloadPayrollStandardDetails(roleId);
    console.log('API Test Result:', response);
    return response;
  } catch (error) {
    console.error('API Test Failed:', error);
    throw error;
  }
}
