'use server';

import { api } from '@/lib/apiService';
import type { MassUpdationOnloadRequest, MassUpdationOnloadResponse, MassUpdationSaveRequest, MassUpdationSearchRequest } from '@/types/hrms/mass-updation';

// Helper function to create a complete nested object structure matching API requirements
function createCompleteRequestBody(baseFields: any): any {
    const now = new Date().toISOString();

    return {
        MI_Id: baseFields.MI_Id || 30,
        retrunMsg: baseFields.retrunMsg || 'string',
        roleId: baseFields.roleId || 0,
        Type: baseFields.Type || 'string',
        HRME_Id: baseFields.HRME_Id || 0,
        employeedropdown: baseFields.employeedropdown || [],
        departmentdropdown: baseFields.departmentdropdown || [],
        designationdropdown: baseFields.designationdropdown || [],
        groupTypedropdown: baseFields.groupTypedropdown || [],
        headdropdown: baseFields.headdropdown || [],
        eardettypelist: baseFields.eardettypelist || [],
        groupTypeselected: baseFields.groupTypeselected || [0],
        departmentselected: baseFields.departmentselected || [0],
        designationselected: baseFields.designationselected || [0],
        EmployeeCode: baseFields.EmployeeCode || 'string',
        HRME_EmployeeFirstName: baseFields.HRME_EmployeeFirstName || 'string',
        HRME_EmployeeMiddleName: baseFields.HRME_EmployeeMiddleName || 'string',
        HRME_EmployeeLastName: baseFields.HRME_EmployeeLastName || 'string',
        employeeselected: baseFields.employeeselected || [0],
        EarningDeduction: baseFields.EarningDeduction || 'string',
        AmountPercentage: baseFields.AmountPercentage || 'string',
        HREED_Amount: baseFields.HREED_Amount || 0,
        HREED_Percentage: baseFields.HREED_Percentage || 'string',
        HRMED_Id: baseFields.HRMED_Id || 0,
        AddRemove: baseFields.AddRemove || 'string',
        groupTypedropdownlist: baseFields.groupTypedropdownlist || [],
        departmentdropdownlist: baseFields.departmentdropdownlist || [],
        designationdropdownlist: baseFields.designationdropdownlist || [],
        employeeDetails: baseFields.employeeDetails || [],
        LogInUserId: baseFields.LogInUserId || 0,
        hrmgT_IdList: baseFields.hrmgT_IdList || [0],
        employeeTypeIdList: baseFields.employeeTypeIdList || [0],
        hrmD_IdList: baseFields.hrmD_IdList || [0],
        hrmdeS_IdList: baseFields.hrmdeS_IdList || [0],
        groupTypeIdList: baseFields.groupTypeIdList || [0]
    };
}

/**
 * Get onload details for mass updation
 * POST /api/massUpdationFacade/onloadgetdetails
 */
export async function getMassUpdationOnload(payload: MassUpdationOnloadRequest) {
    const url = '/api/massUpdationFacade/onloadgetdetails';
    
    // Prepare request body matching the exact API structure
    const requestBody = {
        MI_Id: payload.MI_Id || 30,
        retrunMsg: '',
        roleId: payload.roleId || 0,
        Type: '',
        HRME_Id: 0,
        employeedropdown: [],
        departmentdropdown: [],
        designationdropdown: [],
        groupTypedropdown: [],
        headdropdown: [],
        eardettypelist: [],
        groupTypeselected: [0],
        departmentselected: [0],
        designationselected: [0],
        EmployeeCode: '',
        HRME_EmployeeFirstName: '',
        HRME_EmployeeMiddleName: '',
        HRME_EmployeeLastName: '',
        employeeselected: [0],
        EarningDeduction: '',
        AmountPercentage: '',
        HREED_Amount: 0,
        HREED_Percentage: '',
        HRMED_Id: 0,
        AddRemove: '',
        groupTypedropdownlist: [],
        departmentdropdownlist: [],
        designationdropdownlist: [],
        employeeDetails: [],
        LogInUserId: 0,
        hrmgT_IdList: [0],
        employeeTypeIdList: [0],
        hrmD_IdList: [0],
        hrmdeS_IdList: [0],
        groupTypeIdList: [0]
    };
    
    const response = await api.post<MassUpdationOnloadResponse>('hrms', url, requestBody);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as MassUpdationOnloadResponse
    };
}

/**
 * Save/Update mass updation (Facade)
 * POST /api/massUpdationFacade
 */
export async function saveMassUpdation(data: MassUpdationSaveRequest) {
    const url = '/api/massUpdationFacade';
    
    // Prepare request body with proper structure - use actual values from data or defaults
    const requestBody = {
        MI_Id: data.MI_Id || 30,
        retrunMsg: '',
        roleId: data.roleId || 0,
        Type: (data as any).Type || '',
        HRME_Id: 0,
        employeedropdown: [],
        departmentdropdown: [],
        designationdropdown: [],
        groupTypedropdown: [],
        headdropdown: [],
        eardettypelist: [],
        groupTypeselected: data.groupTypeIdList && data.groupTypeIdList.length > 0 ? data.groupTypeIdList : [0],
        departmentselected: data.hrmD_IdList && data.hrmD_IdList.length > 0 ? data.hrmD_IdList : [0],
        designationselected: data.hrmdeS_IdList && data.hrmdeS_IdList.length > 0 ? data.hrmdeS_IdList : [0],
        EmployeeCode: '',
        HRME_EmployeeFirstName: '',
        HRME_EmployeeMiddleName: '',
        HRME_EmployeeLastName: '',
        employeeselected: data.employeeselected && data.employeeselected.length > 0 ? data.employeeselected : [0],
        EarningDeduction: data.EarningDeduction || data.Type || '',
        AmountPercentage: data.AmountPercentage || '',
        HREED_Amount: data.HREED_Amount || 0,
        HREED_Percentage: (data as any).HREED_Percentage || '',
        HRMED_Id: data.HRMED_Id || 0,
        AddRemove: data.AddRemove || '',
        groupTypedropdownlist: [],
        departmentdropdownlist: [],
        designationdropdownlist: [],
        employeeDetails: [],
        LogInUserId: data.LogInUserId || 0,
        hrmgT_IdList: data.groupTypeIdList && data.groupTypeIdList.length > 0 ? data.groupTypeIdList : [0],
        employeeTypeIdList: [0],
        hrmD_IdList: data.hrmD_IdList && data.hrmD_IdList.length > 0 ? data.hrmD_IdList : [0],
        hrmdeS_IdList: data.hrmdeS_IdList && data.hrmdeS_IdList.length > 0 ? data.hrmdeS_IdList : [0],
        groupTypeIdList: data.groupTypeIdList && data.groupTypeIdList.length > 0 ? data.groupTypeIdList : [0]
    };
    
    try {
        const response = await api.post<MassUpdationOnloadResponse>('hrms', url, requestBody);
        
        console.log('✅ [MASS UPDATION - BACKEND] API Response received');
        console.log('📤 [MASS UPDATION - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as MassUpdationOnloadResponse;
            console.log('✅ [MASS UPDATION - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [MASS UPDATION - BACKEND] Response data summary:', {
                hasEmployeeDropdown: !!responseData?.employeedropdown,
                employeeCount: Array.isArray(responseData?.employeedropdown) ? responseData.employeedropdown.length : 0,
                hasDepartmentDropdown: !!responseData?.departmentdropdown,
                departmentCount: Array.isArray(responseData?.departmentdropdown) ? responseData.departmentdropdown.length : 0,
                hasDesignationDropdown: !!responseData?.designationdropdown,
                designationCount: Array.isArray(responseData?.designationdropdown) ? responseData.designationdropdown.length : 0,
                retrunMsg: responseData?.retrunMsg
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Mass updation completed successfully',
                data: responseData
            };
        }
        
        // Wrap raw response data
        console.log('⚠️ [MASS UPDATION - BACKEND] Response not wrapped, wrapping it');
        return {
            success: true,
            message: 'Mass updation completed successfully',
            data: response as unknown as MassUpdationOnloadResponse
        };
    } catch (error: any) {
        console.error('❌ [MASS UPDATION - BACKEND] Error in getEmployeeDetailsBySelection:', error);
        console.error('❌ [MASS UPDATION - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to get employee details by selection',
            data: undefined
        };
    }
}

/**
 * Search employees by selection criteria
 * POST /api/massUpdationFacade/FilterEmployeeData
 */
export async function searchMassUpdationEmployees(data: MassUpdationSearchRequest) {
    console.log('🔵 [MASS UPDATION - BACKEND] searchMassUpdationEmployees - START');
    console.log('📥 [MASS UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));
    
    const url = '/api/massUpdationFacade/FilterEmployeeData';
    console.log('🌐 [MASS UPDATION - BACKEND] API URL:', url);
    console.log('🌐 [MASS UPDATION - BACKEND] API Base: hrms');
    console.log('🌐 [MASS UPDATION - BACKEND] Method: POST');
    
    // Prepare request body matching the API specification exactly
    const requestBody = {
        MI_Id: data.MI_Id || 30,
        retrunMsg: 'string',
        roleId: data.roleId || 0,
        Type: 'string',
        HRME_Id: 0,
        employeedropdown: [],
        departmentdropdown: [],
        designationdropdown: [],
        groupTypedropdown: [],
        headdropdown: [],
        eardettypelist: [],
        groupTypeselected: data.groupTypeIdList && data.groupTypeIdList.length > 0 ? data.groupTypeIdList : [0],
        departmentselected: data.hrmD_IdList && data.hrmD_IdList.length > 0 ? data.hrmD_IdList : [0],
        designationselected: data.hrmdeS_IdList && data.hrmdeS_IdList.length > 0 ? data.hrmdeS_IdList : [0],
        EmployeeCode: 'string',
        HRME_EmployeeFirstName: 'string',
        HRME_EmployeeMiddleName: 'string',
        HRME_EmployeeLastName: 'string',
        employeeselected: [0],
        EarningDeduction: 'string',
        AmountPercentage: 'string',
        HREED_Amount: 0,
        HREED_Percentage: 'string',
        HRMED_Id: 0,
        AddRemove: 'string',
        groupTypedropdownlist: [],
        departmentdropdownlist: [],
        designationdropdownlist: [],
        employeeDetails: [],
        LogInUserId: data.LogInUserId || 0,
        hrmgT_IdList: data.groupTypeIdList && data.groupTypeIdList.length > 0 ? data.groupTypeIdList : [0],
        employeeTypeIdList: [0],
        hrmD_IdList: data.hrmD_IdList && data.hrmD_IdList.length > 0 ? data.hrmD_IdList : [0],
        hrmdeS_IdList: data.hrmdeS_IdList && data.hrmdeS_IdList.length > 0 ? data.hrmdeS_IdList : [0],
        groupTypeIdList: data.groupTypeIdList && data.groupTypeIdList.length > 0 ? data.groupTypeIdList : [0]
    };
    
    console.log('📤 [MASS UPDATION - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [MASS UPDATION - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        roleId: requestBody.roleId,
        groupTypeCount: requestBody.groupTypeselected.length,
        departmentCount: requestBody.departmentselected.length,
        designationCount: requestBody.designationselected.length,
        LogInUserId: requestBody.LogInUserId
    });
    
    const response = await api.post<MassUpdationOnloadResponse>('hrms', url, requestBody);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as MassUpdationOnloadResponse
    };
}

/**
 * Get employee details by selection criteria (for save operation)
 * POST /api/massUpdationFacade/getEmployeedetailsBySelection
 */
export async function getEmployeeDetailsBySelection(data: MassUpdationSearchRequest) {
    console.log('🔵 [MASS UPDATION - BACKEND] getEmployeeDetailsBySelection - START');
    console.log('📥 [MASS UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));
    
    const url = '/api/massUpdationFacade/getEmployeedetailsBySelection';
    console.log('🌐 [MASS UPDATION - BACKEND] API URL:', url);
    console.log('🌐 [MASS UPDATION - BACKEND] API Base: hrms');
    console.log('🌐 [MASS UPDATION - BACKEND] Method: POST');
    
    // Prepare request body matching the API specification exactly
    // This function is used for save operations, so it receives the full payload from the UI
    const requestBody = {
        MI_Id: data.MI_Id || 30,
        retrunMsg: 'string',
        roleId: data.roleId || 0,
        Type: (data as any).Type || 'string',
        HRME_Id: (data as any).HRME_Id || 0,
        employeedropdown: [],
        departmentdropdown: [],
        designationdropdown: [],
        groupTypedropdown: [],
        headdropdown: [],
        eardettypelist: [],
        groupTypeselected: (data as any).groupTypeselected || (data.groupTypeIdList && data.groupTypeIdList.length > 0 ? data.groupTypeIdList : [0]),
        departmentselected: (data as any).departmentselected || (data.hrmD_IdList && data.hrmD_IdList.length > 0 ? data.hrmD_IdList : [0]),
        designationselected: (data as any).designationselected || (data.hrmdeS_IdList && data.hrmdeS_IdList.length > 0 ? data.hrmdeS_IdList : [0]),
        EmployeeCode: 'string',
        HRME_EmployeeFirstName: 'string',
        HRME_EmployeeMiddleName: 'string',
        HRME_EmployeeLastName: 'string',
        employeeselected: (data as any).employeeselected && (data as any).employeeselected.length > 0 ? (data as any).employeeselected : [0],
        EarningDeduction: (data as any).EarningDeduction || 'string',
        AmountPercentage: (data as any).AmountPercentage || 'string',
        HREED_Amount: (data as any).HREED_Amount || 0,
        HREED_Percentage: (data as any).HREED_Percentage || 'string',
        HRMED_Id: (data as any).HRMED_Id || 0,
        AddRemove: (data as any).AddRemove || 'string',
        groupTypedropdownlist: [],
        departmentdropdownlist: [],
        designationdropdownlist: [],
        employeeDetails: [],
        LogInUserId: data.LogInUserId || 0,
        hrmgT_IdList: (data as any).hrmgT_IdList || (data.groupTypeIdList && data.groupTypeIdList.length > 0 ? data.groupTypeIdList : [0]),
        employeeTypeIdList: (data as any).employeeTypeIdList || [0],
        hrmD_IdList: data.hrmD_IdList && data.hrmD_IdList.length > 0 ? data.hrmD_IdList : [0],
        hrmdeS_IdList: data.hrmdeS_IdList && data.hrmdeS_IdList.length > 0 ? data.hrmdeS_IdList : [0],
        groupTypeIdList: data.groupTypeIdList && data.groupTypeIdList.length > 0 ? data.groupTypeIdList : [0]
    };
    
    console.log('📤 [MASS UPDATION - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    console.log('📊 [MASS UPDATION - BACKEND] Request body summary:', {
        MI_Id: requestBody.MI_Id,
        roleId: requestBody.roleId,
        groupTypeCount: requestBody.groupTypeselected.length,
        departmentCount: requestBody.departmentselected.length,
        designationCount: requestBody.designationselected.length,
        employeeSelectedCount: requestBody.employeeselected.length,
        EarningDeduction: requestBody.EarningDeduction,
        AmountPercentage: requestBody.AmountPercentage,
        HRMED_Id: requestBody.HRMED_Id,
        AddRemove: requestBody.AddRemove,
        LogInUserId: requestBody.LogInUserId
    });
    
    try {
        const response = await api.post<MassUpdationOnloadResponse>('hrms', url, requestBody);
        
        console.log('✅ [MASS UPDATION - BACKEND] API Response received');
        console.log('📤 [MASS UPDATION - BACKEND] Response structure:', {
            hasSuccess: 'success' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response || {})
        });
        
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as MassUpdationOnloadResponse;
            console.log('✅ [MASS UPDATION - BACKEND] Response already wrapped, returning as-is');
            console.log('📊 [MASS UPDATION - BACKEND] Response data summary:', {
                hasEmployeeDropdown: !!responseData?.employeedropdown,
                employeeCount: Array.isArray(responseData?.employeedropdown) ? responseData.employeedropdown.length : 0,
                hasDepartmentDropdown: !!responseData?.departmentdropdown,
                departmentCount: Array.isArray(responseData?.departmentdropdown) ? responseData.departmentdropdown.length : 0,
                hasDesignationDropdown: !!responseData?.designationdropdown,
                designationCount: Array.isArray(responseData?.designationdropdown) ? responseData.designationdropdown.length : 0,
                retrunMsg: responseData?.retrunMsg
            });
            
            return {
                success: response.success ?? true,
                message: response.message || 'Employee details loaded successfully',
                data: responseData
            };
        }
        
        // Wrap raw response data
        console.log('⚠️ [MASS UPDATION - BACKEND] Response not wrapped, wrapping it');
        return {
            success: true,
            message: 'Employee details loaded successfully',
            data: response as unknown as MassUpdationOnloadResponse
        };
    } catch (error: any) {
        console.error('❌ [MASS UPDATION - BACKEND] Error in getEmployeeDetailsBySelection:', error);
        console.error('❌ [MASS UPDATION - BACKEND] Error details:', {
            message: error?.message,
            stack: error?.stack,
            response: error?.response
        });
        
        return {
            success: false,
            message: error?.message || 'Failed to get employee details by selection',
            data: undefined
        };
    }
}
