'use server';

import { api } from '@/lib/apiService';
import type {
    DepartmentDetail,
    MasterDepartmentInput,
    MasterDepartmentResponse,
    OnloadGetDepartmentDetailsRequest,
    SaveDepartmentRequest
} from '@/types/hrms/master-department';

export async function getMasterDepartmentList(roleId: number) {
    const url = '/api/MasterDepartmentFacade/onloadgetdetails';
    const requestBody: OnloadGetDepartmentDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: roleId,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    };
    return await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
}

export async function saveMasterDepartment(data: MasterDepartmentInput) {
    const isEdit = data.HRMD_Id && data.HRMD_Id > 0;
    const url = '/api/MasterDepartmentFacade';
    
    console.log('🟠 [API] saveMasterDepartment called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const now = new Date().toISOString();
    const requestBody: SaveDepartmentRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMD_Id: data.HRMD_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMD_DepartmentName: data.HRMD_DepartmentName,
        HRMD_Order: data.HRMD_Order ?? 0,
        HRMD_ActiveFlag: data.HRMD_ActiveFlag,
        departmentList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMD_Id: data.HRMD_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMD_DepartmentName: data.HRMD_DepartmentName,
                HRMD_Order: data.HRMD_Order ?? 0,
                HRMD_ActiveFlag: data.HRMD_ActiveFlag,
                HRMD_InternalTrainingMinimumHrs: data.HRMD_InternalTrainingMinimumHrs
            }
        ],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: data.MI_Id || 30,
        HRMD_InternalTrainingMinimumHrs: data.HRMD_InternalTrainingMinimumHrs,
        DeraptmentDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMD_Id || 0;
        const hasDepartmentList = !!(responseData?.departmentList?.length > 0);
        
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || isUpdateSuccess || hasDepartmentList) && !isDuplicateError;
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasDepartmentList:', hasDepartmentList);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Department already exists'
                : isSuccess 
                    ? (isEdit ? 'Department updated successfully' : 'Department added successfully')
                    : (retrunMsg || 'Failed to save department'),
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
        throw error;
    }
}

export async function activateDeactivateMasterDepartment(data: {
    HRMD_Id: number;
    HRMD_ActiveFlag: boolean;
    roleId?: number;
}) {
    const url = '/api/MasterDepartmentFacade/deactivateRecordById';
    
    console.log('🟠 [API] activateDeactivateMasterDepartment called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Action:', data.HRMD_ActiveFlag ? 'Activate' : 'Deactivate');
    
    const now = new Date().toISOString();
    const requestBody: SaveDepartmentRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMD_Id: data.HRMD_Id,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: data.HRMD_ActiveFlag,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: data.roleId || 30,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
        console.log('🟢 [API] Toggle response:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        return response;
    } catch (error: any) {
        console.log('🔴 [API] Toggle error:', error);
        throw error;
    }
}

export async function getOnloadDepartmentDetails(roleId: number) {
    const url = '/api/MasterDepartmentFacade/onloadgetdetails';
    const requestBody: OnloadGetDepartmentDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    } as unknown as OnloadGetDepartmentDetailsRequest;
    return await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
}

export async function getDepartmentById(id: number) {
    const url = `/api/MasterDepartmentFacade/getRecordById/${id}`;
    return await api.get<MasterDepartmentResponse>('hrms', url);
}

export async function saveMasterDepartmentOrder(departments: DepartmentDetail[]) {
    console.log('🟠 [API] saveMasterDepartmentOrder called');
    console.log('🟠 [API] Number of departments to update:', departments.length);
    
    const url = '/api/MasterDepartmentFacade';
    const now = new Date().toISOString();
    
    // Use departmentList array (same as save endpoint)
    const requestBody: SaveDepartmentRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: departments.map((dept) => ({
            CreatedDate: dept.CreatedDate || now,
            UpdatedDate: now,
            HRMD_Id: dept.HRMD_Id,
            MI_Id: dept.MI_Id || 30,
            HRMD_DepartmentName: dept.HRMD_DepartmentName,
            HRMD_Order: dept.HRMD_Order ?? 0,
            HRMD_ActiveFlag: dept.HRMD_ActiveFlag,
            HRMD_InternalTrainingMinimumHrs: dept.HRMD_InternalTrainingMinimumHrs
        })),
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: 30,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] departmentList count:', requestBody.departmentList.length);
    
    try {
        const response = await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
        console.log('🟢 [API] saveMasterDepartmentOrder response:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.departmentList count:', (response as any)?.departmentList?.length);
        return response;
    } catch (error: any) {
        console.log('🔴 [API] saveMasterDepartmentOrder error:', error);
        throw error;
    }
}
