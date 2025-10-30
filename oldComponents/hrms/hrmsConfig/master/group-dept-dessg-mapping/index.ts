import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import axios from 'axios';
import { env } from '@/env';
import type {
  GroupDeptDessgMappingResponse,
  GroupDeptDessgMappingInput,
  LoadDataRequest
} from '@/types/hrms/group-dept-dessg-mapping';

/**
 * Get all group department designation mappings with dropdown data
 * POST /api/GroupDeptDessgFacade/loaddata
 * Using axios directly with proxy
 */
export async function getGroupDeptDessgMappingList(
  roleId: number
): Promise<ApiResponse<GroupDeptDessgMappingResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/GroupDeptDessgFacade/loaddata';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody: LoadDataRequest = {
      HRGTDDS_Id: 0,
      MI_Id: 30,
      HRMGT_Id: 2,
      HRMD_Id: 3,
      HRMDES_Id: 4,
      HRGTDDS_ActiveFlg: true,
      HRGTDDS_CreatedBy: 5,
      HRGTDDS_UpdatedBy: 5,
      HRGTDDS_CreatedDate: new Date().toISOString(),
      HRGTDDS_UpdatedDate: new Date().toISOString(),
      groupTypedropdown: [],
      departmentdropdown: [],
      designationdropdown: [],
      gridviewdata: [],
      designationids: [],
      LogInUserId: 5,
      HRMGT_EmployeeGroupType: "",
      HRMD_DepartmentName: "",
      HRMDES_DesignationName: "",
      returnval: false,
      msg: ""
    };
    
    console.log('=== Load Group Dept Dessg Mapping API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<GroupDeptDessgMappingResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('=== Load Group Dept Dessg Mapping API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Data:', axiosResponse.data);

    const response: ApiResponse<GroupDeptDessgMappingResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data.msg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Mappings loaded successfully' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Load Group Dept Dessg Mapping API Error ===');
    console.error('Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<GroupDeptDessgMappingResponse> = {
        success: false,
        message: error.response?.data?.msg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to load mappings',
        data: null
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Save/Update group department designation mapping
 * POST /api/GroupDeptDessgFacade/savedata
 * Using axios directly with proxy
 */
export async function saveGroupDeptDessgMapping(
  data: GroupDeptDessgMappingInput
): Promise<ApiResponse<GroupDeptDessgMappingResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/GroupDeptDessgFacade/savedata';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody: LoadDataRequest = {
      HRGTDDS_Id: data.hrgtddS_Id || 0,
      MI_Id: 30,
      HRMGT_Id: data.hrmgT_Id,
      HRMD_Id: data.hrmD_Id,
      HRMDES_Id: data.hrmdeS_Id,
      HRGTDDS_ActiveFlg: data.hrgtddS_ActiveFlg,
      HRGTDDS_CreatedBy: data.hrgtddS_CreatedBy || 5,
      HRGTDDS_UpdatedBy: data.hrgtddS_UpdatedBy || 5,
      HRGTDDS_CreatedDate: data.hrgtddS_CreatedDate || new Date().toISOString(),
      HRGTDDS_UpdatedDate: new Date().toISOString(),
      groupTypedropdown: [],
      departmentdropdown: [],
      designationdropdown: [],
      gridviewdata: [],
      designationids: data.designationids || [],
      LogInUserId: data.logInUserId || 5,
      HRMGT_EmployeeGroupType: data.hrmgT_EmployeeGroupType || "",
      HRMD_DepartmentName: data.hrmD_DepartmentName || "",
      HRMDES_DesignationName: data.hrmdeS_DesignationName || "",
      returnval: false,
      msg: ""
    };

    console.log('=== Save Group Dept Dessg Mapping API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<GroupDeptDessgMappingResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('=== Save Group Dept Dessg Mapping API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Data:', axiosResponse.data);

    const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                     (!axiosResponse.data.msg || !axiosResponse.data.msg.toLowerCase().includes('error'));

    const response: ApiResponse<GroupDeptDessgMappingResponse> = {
      success: isSuccess,
      message: axiosResponse.data.msg || (isSuccess ? 'Mapping saved successfully' : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Save Group Dept Dessg Mapping API Error ===');
    console.error('Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<GroupDeptDessgMappingResponse> = {
        success: false,
        message: error.response?.data?.msg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to save mapping',
        data: null
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Activate/Deactivate group department designation mapping
 * POST /api/GroupDeptDessgFacade/masterDecative
 * Using axios directly with proxy
 */
export async function activateDeactivateGroupDeptDessgMapping(
  data: { HRGTDDS_Id: number; HRGTDDS_ActiveFlg: boolean; LogInUserId?: number }
): Promise<ApiResponse<GroupDeptDessgMappingResponse>> {
  try {
    const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/GroupDeptDessgFacade/masterDecative';
    const url = `${baseURL}${apiPath}`;
    
    const requestBody: LoadDataRequest = {
      HRGTDDS_Id: data.HRGTDDS_Id,
      MI_Id: 30,
      HRMGT_Id: 2,
      HRMD_Id: 3,
      HRMDES_Id: 4,
      HRGTDDS_ActiveFlg: data.HRGTDDS_ActiveFlg,
      HRGTDDS_CreatedBy: 5,
      HRGTDDS_UpdatedBy: 5,
      HRGTDDS_CreatedDate: new Date().toISOString(),
      HRGTDDS_UpdatedDate: new Date().toISOString(),
      groupTypedropdown: [],
      departmentdropdown: [],
      designationdropdown: [],
      gridviewdata: [],
      designationids: [],
      LogInUserId: data.LogInUserId || 5,
      HRMGT_EmployeeGroupType: "",
      HRMD_DepartmentName: "",
      HRMDES_DesignationName: "",
      returnval: false,
      msg: ""
    };

    console.log('=== Activate/Deactivate Group Dept Dessg Mapping API Request ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const axiosResponse = await axios.post<GroupDeptDessgMappingResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('=== Activate/Deactivate Group Dept Dessg Mapping API Response ===');
    console.log('Status:', axiosResponse.status);
    console.log('Data:', axiosResponse.data);

    const response: ApiResponse<GroupDeptDessgMappingResponse> = {
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
      message: axiosResponse.data.msg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Mapping ${data.HRGTDDS_ActiveFlg ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
      data: axiosResponse.data
    };

    return response;
  } catch (error: any) {
    console.error('=== Activate/Deactivate Group Dept Dessg Mapping API Error ===');
    console.error('Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorResponse: ApiResponse<GroupDeptDessgMappingResponse> = {
        success: false,
        message: error.response?.data?.msg || 
                error.response?.data?.message || 
                error.message || 
                'Failed to update mapping status',
        data: null
      };
      return errorResponse;
    }

    throw error;
  }
}

/**
 * Test group department designation mapping API connection
 */
export async function testGroupDeptDessgMappingAPI(
  roleId: number
): Promise<ApiResponse<GroupDeptDessgMappingResponse>> {
  try {
    return await getGroupDeptDessgMappingList(roleId);
  } catch (error) {
    console.error('Error testing group dept dessg mapping API:', error);
    throw error;
  }
}
