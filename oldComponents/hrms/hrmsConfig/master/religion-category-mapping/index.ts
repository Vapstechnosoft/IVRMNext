// Religion Category Mapping API Integration

import axios from 'axios';
import { env } from '@/env';
import { ApiResponse } from '@/lib/apiService';
import type {
  ReligionCategoryMappingResponse,
  ReligionCategoryMappingInput,
  ReligionCategoryMappingRequest
} from '@/types/hrms/religion-category-mapping';

/**
 * Get onload details for religion category mapping
 * POST /api/ReligionCategory_MappingFacade/loaddata
 */
export async function getReligionCategoryMappingList(
  roleId: number = 0,
  userId: number = 2
): Promise<ApiResponse<ReligionCategoryMappingResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/ReligionCategory_MappingFacade/loaddata';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody = {
      IRCC_Id: 0,
      MI_Id: 30,
      UserId: userId,
      IVRMMR_Id: 0,
      IMCC_Id: 0,
      IRCC_ActiveFlg: true,
      IRCC_CreatedBy: 0,
      IRCC_UpdatedBy: 0,
      IRCC_CreatedDate: new Date().toISOString(),
      IRCC_UpdatedDate: new Date().toISOString(),
      religion_list: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
          IVRMMR_Id: 0,
          IVRMMR_Name: "string",
          Is_Active: true
        }
      ],
      get_masterlist: [],
      caste_list: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
          IMCC_Id: 0,
          IMCC_CategoryName: "string",
          IMCC_CategoryCode: "string",
          IMCC_CategoryDesc: "string"
        }
      ],
      editlist: [],
      returnval: true,
      castid: [],
      duplicate: true,
      IVRMMR_Name: "string",
      IMCC_CategoryName: "string",
      msg: "string"
    };
    
    console.log('=== Religion Category Mapping Load Data API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<ReligionCategoryMappingResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('=== Religion Category Mapping Load Data API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

    const response: ApiResponse<ReligionCategoryMappingResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data?.msg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Religion Category Mapping Load Data API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      const errorResponse: ApiResponse<ReligionCategoryMappingResponse> = {
        success: false,
        message: error.response?.data?.msg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to fetch religion category mapping list',
        data: null
      };
      return errorResponse;
    }
    
    throw error;
  }
}

/**
 * Save or Update religion category mapping record
 * POST /api/ReligionCategory_MappingFacade/savedata
 */
export async function saveReligionCategoryMapping(
  data: ReligionCategoryMappingInput
): Promise<ApiResponse<ReligionCategoryMappingResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/ReligionCategory_MappingFacade/savedata';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody = {
      IRCC_Id: data.IRCC_Id || 0,
      MI_Id: data.MI_Id || 30,
      UserId: data.UserId || 0,
      IVRMMR_Id: 0,  // API expects 0 in main payload
      IMCC_Id: 0,    // API expects 0 in main payload
      IRCC_ActiveFlg: data.IRCC_ActiveFlg ?? true,
      IRCC_CreatedBy: data.IRCC_CreatedBy || 0,
      IRCC_UpdatedBy: data.IRCC_UpdatedBy || 0,
      IRCC_CreatedDate: new Date().toISOString(),
      IRCC_UpdatedDate: new Date().toISOString(),
      religion_list: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
          IVRMMR_Id: data.IVRMMR_Id || 0,  // Actual selected religion ID goes here
          IVRMMR_Name: "string",
          Is_Active: true
        }
      ],
      get_masterlist: [],
      caste_list: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
          IMCC_Id: data.IMCC_Id || 0,  // Actual selected caste ID goes here
          IMCC_CategoryName: "string",
          IMCC_CategoryCode: "string",
          IMCC_CategoryDesc: "string"
        }
      ],
      editlist: [],
      returnval: true,
      castid: [],  // API expects empty array
      duplicate: true,
      IVRMMR_Name: "string",
      IMCC_CategoryName: "string",
      msg: "string"
    };
    
    console.log('=== Religion Category Mapping Save API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<ReligionCategoryMappingResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('=== Religion Category Mapping Save API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

    const response: ApiResponse<ReligionCategoryMappingResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data?.msg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Religion category mapping saved successfully' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Religion Category Mapping Save API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      const errorResponse: ApiResponse<ReligionCategoryMappingResponse> = {
        success: false,
        message: error.response?.data?.msg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to save religion category mapping',
        data: null
      };
      return errorResponse;
    }
    
    throw error;
  }
}

/**
 * Get religion category mapping record for edit
 * POST /api/ReligionCategory_MappingFacade/Editdata
 */
export async function editReligionCategoryMapping(
  data: ReligionCategoryMappingInput
): Promise<ApiResponse<ReligionCategoryMappingResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/ReligionCategory_MappingFacade/Editdata';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody = {
      IRCC_Id: data.IRCC_Id || 0,
      MI_Id: data.MI_Id || 30,
      UserId: data.UserId || 0,
      IVRMMR_Id: data.IVRMMR_Id || 0,
      IMCC_Id: data.IMCC_Id || 0,
      IRCC_ActiveFlg: data.IRCC_ActiveFlg ?? true,
      IRCC_CreatedBy: data.IRCC_CreatedBy || 0,
      IRCC_UpdatedBy: data.IRCC_UpdatedBy || 0,
      IRCC_CreatedDate: new Date().toISOString(),
      IRCC_UpdatedDate: new Date().toISOString(),
      religion_list: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
          IVRMMR_Id: data.IVRMMR_Id || 0,
          IVRMMR_Name: "string",
          Is_Active: true
        }
      ],
      get_masterlist: [],
      caste_list: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
          IMCC_Id: data.IMCC_Id || 0,
          IMCC_CategoryName: "string",
          IMCC_CategoryCode: "string",
          IMCC_CategoryDesc: "string"
        }
      ],
      editlist: [],
      returnval: true,
      castid: [],
      duplicate: true,
      IVRMMR_Name: "string",
      IMCC_CategoryName: "string",
      msg: "string"
    };
    
    console.log('=== Religion Category Mapping Edit API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<ReligionCategoryMappingResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('=== Religion Category Mapping Edit API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

    const response: ApiResponse<ReligionCategoryMappingResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data?.msg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Religion Category Mapping Edit API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      const errorResponse: ApiResponse<ReligionCategoryMappingResponse> = {
        success: false,
        message: error.response?.data?.msg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to fetch religion category mapping for edit',
        data: null
      };
      return errorResponse;
    }
    
    throw error;
  }
}

/**
 * Activate or Deactivate a religion category mapping record
 * POST /api/ReligionCategory_MappingFacade/masterDecative
 */
export async function activateDeactivateReligionCategoryMapping(
  data: { IRCC_Id: number; IRCC_ActiveFlg: boolean; UserId?: number }
): Promise<ApiResponse<ReligionCategoryMappingResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/ReligionCategory_MappingFacade/masterDecative';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody = {
      IRCC_Id: data.IRCC_Id,
      MI_Id: 30,
      UserId: data.UserId || 0,
      IVRMMR_Id: 0,
      IMCC_Id: 0,
      IRCC_ActiveFlg: data.IRCC_ActiveFlg,
      IRCC_CreatedBy: 0,
      IRCC_UpdatedBy: 0,
      IRCC_CreatedDate: new Date().toISOString(),
      IRCC_UpdatedDate: new Date().toISOString(),
      religion_list: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
          IVRMMR_Id: 0,
          IVRMMR_Name: "string",
          Is_Active: true
        }
      ],
      get_masterlist: [],
      caste_list: [
        {
          CreatedDate: new Date().toISOString(),
          UpdatedDate: new Date().toISOString(),
          IMCC_Id: 0,
          IMCC_CategoryName: "string",
          IMCC_CategoryCode: "string",
          IMCC_CategoryDesc: "string"
        }
      ],
      editlist: [],
      returnval: true,
      castid: [],
      duplicate: true,
      IVRMMR_Name: "string",
      IMCC_CategoryName: "string",
      msg: "string"
    };
    
    console.log('=== Religion Category Mapping Activate/Deactivate API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<ReligionCategoryMappingResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('=== Religion Category Mapping Activate/Deactivate API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

    const response: ApiResponse<ReligionCategoryMappingResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data?.msg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Religion category mapping ${data.IRCC_ActiveFlg ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Religion Category Mapping Activate/Deactivate API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      const errorResponse: ApiResponse<ReligionCategoryMappingResponse> = {
        success: false,
        message: error.response?.data?.msg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to update religion category mapping status',
        data: null
      };
      return errorResponse;
    }
    
    throw error;
  }
}

/**
 * Test religion category mapping API connection
 */
export async function testReligionCategoryMappingAPI(
  roleId: number = 0,
  userId: number = 2
): Promise<ApiResponse<ReligionCategoryMappingResponse>> {
  try {
    console.log('Testing Religion Category Mapping API connectivity...');
    const response = await getReligionCategoryMappingList(roleId, userId);
    console.log('API Test Result:', response);
    return response;
  } catch (error) {
    console.error('API Test Failed:', error);
    throw error;
  }
}
