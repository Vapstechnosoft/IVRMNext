import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type {
  MasterLoanResponse,
  MasterLoanInput,
  OnloadGetLoanDetailsRequest
} from '@/types/hrms/master-loan';


/**
 * Get onload details for master loan
 * POST /api/HRMasterLoanFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadLoanDetails(roleId: number): Promise<ApiResponse<MasterLoanResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/HRMasterLoanFacade/onloadgetdetails';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody: OnloadGetLoanDetailsRequest = {
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString(),
      HRMLN_Id: 0,
      MI_Id: 30,
      HRML_LoanType: "string",
      HRML_Max: 0,
      HRMLN_ActiveFlag: true,
      gmasterloanList: [],
      retrunMsg: "string",
      roleId: roleId
    };
    
    console.log('=== Onload Loan Details API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MasterLoanResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('=== Onload Loan Details API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Data:', axiosResponse.data);

    const response: ApiResponse<MasterLoanResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Loans loaded successfully' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Onload Loan Details API Error ===');
    console.error('Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MasterLoanResponse> = {
        success: false,
        message: error.response?.data?.retrunMsg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to load loans',
        data: null
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Save/Update master loan type (Facade)
 * POST /api/HRMasterLoanFacade
 * Using axios directly with proxy
 */
export async function saveMasterLoan(data: MasterLoanInput): Promise<ApiResponse<MasterLoanResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/HRMasterLoanFacade';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody: OnloadGetLoanDetailsRequest = {
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString(),
      HRMLN_Id: data.hrmlN_Id || 0,
      MI_Id: 30,
      HRML_LoanType: data.hrmL_LoanType,
      HRML_Max: data.hrmL_Max,
      HRMLN_ActiveFlag: data.hrmlN_ActiveFlag,
      gmasterloanList: [],
      retrunMsg: "string",
      roleId: data.mI_Id || 0
    };

    console.log('=== Save Loan API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MasterLoanResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('=== Save Loan API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Data:', axiosResponse.data);

    // Check if retrunMsg indicates an error
    const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                     (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

    const response: ApiResponse<MasterLoanResponse> = {
      success: isSuccess,
      message: axiosResponse.data.retrunMsg || (isSuccess ? 'Loan saved successfully' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Save Loan API Error ===');
    console.error('Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MasterLoanResponse> = {
        success: false,
        message: error.response?.data?.retrunMsg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to save loan',
        data: null
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Edit/Update master loan type
 * For this API, create and update share the same Facade endpoint
 */
export async function editMasterLoan(data: MasterLoanInput): Promise<ApiResponse<MasterLoanResponse>> {
  // Reuse save implementation; passing HRMLN_Id (>0) will update
  return await saveMasterLoan(data);
}

/**
 * Get loan record by ID
 * GET /api/HRMasterLoanFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getLoanById(id: number): Promise<ApiResponse<MasterLoanResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = `/api/HRMasterLoanFacade/getRecordById/${id}`;
    const url = `${baseURL}${apiPath}`;
    
    console.log('=== Get Loan By ID API Request ===');
    console.log('URL:', url);
    console.log('Loan ID:', id);

    const axiosResponse = await axios.get<MasterLoanResponse>(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('=== Get Loan By ID API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

    const response: ApiResponse<MasterLoanResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Get Loan By ID API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      const errorResponse: ApiResponse<MasterLoanResponse> = {
        success: false,
        message: error.response?.data?.retrunMsg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to fetch loan by ID',
        data: null
      };
      return errorResponse;
    }
    
    throw error;
  }
}

/**
 * Activate/Deactivate master loan type
 * POST /api/HRMasterLoanFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterLoan(
  data: { HRMLN_Id: number; HRMLN_ActiveFlag: boolean; roleId?: number }
): Promise<ApiResponse<MasterLoanResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/HRMasterLoanFacade/deactivateRecordById';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody: OnloadGetLoanDetailsRequest = {
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString(),
      HRMLN_Id: data.HRMLN_Id,
      MI_Id: 30,
      HRML_LoanType: "string",
      HRML_Max: 0,
      HRMLN_ActiveFlag: data.HRMLN_ActiveFlag,
      gmasterloanList: [],
      retrunMsg: "string",
      roleId: data.roleId || 0
    };

    console.log('=== Activate/Deactivate Loan API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<MasterLoanResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('=== Activate/Deactivate Loan API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Data:', axiosResponse.data);

    const response: ApiResponse<MasterLoanResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Loan ${data.HRMLN_ActiveFlag ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Activate/Deactivate Loan API Error ===');
    console.error('Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<MasterLoanResponse> = {
        success: false,
        message: error.response?.data?.retrunMsg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to update loan status',
        data: null
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Test master loan API connection
 */
export async function testMasterLoanAPI(roleId: number = 4): Promise<ApiResponse<MasterLoanResponse>> {
  try {
    console.log('Testing Master Loan API connectivity...');
    const response = await getOnloadLoanDetails(roleId);
    console.log('API Test Result:', response);
    return response;
  } catch (error) {
    console.error('API Test Failed:', error);
    throw error;
  }
}
