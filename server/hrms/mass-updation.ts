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
    const requestBody = createCompleteRequestBody({
        MI_Id: payload.MI_Id || 30,
        roleId: payload.roleId
    });
    return await api.post<MassUpdationOnloadResponse>('hrms', url, requestBody);
}

/**
 * Save/Update mass updation (Facade)
 * POST /api/massUpdationFacade
 */
export async function saveMassUpdation(data: MassUpdationSaveRequest) {
    const url = '/api/massUpdationFacade';
    const requestBody = createCompleteRequestBody({
        ...(data as any),
        MI_Id: data.MI_Id || 30,
        roleId: data.roleId,
        Type: (data as any).Type || 'string',
        HRME_Id: (data as any).HRME_Id || 0,
        groupTypeselected: (data as any).groupTypeselected || [0],
        departmentselected: (data as any).departmentselected || [0],
        designationselected: (data as any).designationselected || [0],
        employeeselected: (data as any).employeeselected || [0],
        EarningDeduction: (data as any).EarningDeduction || 'string',
        AmountPercentage: (data as any).AmountPercentage || 'string',
        HREED_Amount: (data as any).HREED_Amount || 0,
        HREED_Percentage: (data as any).HREED_Percentage || 'string',
        HRMED_Id: (data as any).HRMED_Id || 0,
        AddRemove: (data as any).AddRemove || 'string',
        LogInUserId: data.LogInUserId || 0,
        hrmgT_IdList: (data as any).hrmgT_IdList || data.groupTypeIdList || [0],
        employeeTypeIdList: (data as any).employeeTypeIdList || [0],
        hrmD_IdList: data.hrmD_IdList || [0],
        hrmdeS_IdList: data.hrmdeS_IdList || [0],
        groupTypeIdList: data.groupTypeIdList || [0]
    });
    return await api.post<MassUpdationOnloadResponse>('hrms', url, requestBody);
}

/**
 * Search employees by selection criteria
 * POST /api/massUpdationFacade/FilterEmployeeData
 */
export async function searchMassUpdationEmployees(data: MassUpdationSearchRequest) {
    const url = '/api/massUpdationFacade/FilterEmployeeData';
    const requestBody = createCompleteRequestBody({
        ...(data as any),
        MI_Id: data.MI_Id || 30,
        roleId: data.roleId,
        Type: (data as any).Type || 'string',
        HRME_Id: (data as any).HRME_Id || 0,
        groupTypeselected: (data as any).groupTypeselected || [0],
        departmentselected: (data as any).departmentselected || [0],
        designationselected: (data as any).designationselected || [0],
        employeeselected: (data as any).employeeselected || [0],
        EarningDeduction: (data as any).EarningDeduction || 'string',
        AmountPercentage: (data as any).AmountPercentage || 'string',
        HREED_Amount: (data as any).HREED_Amount || 0,
        HREED_Percentage: (data as any).HREED_Percentage || 'string',
        HRMED_Id: (data as any).HRMED_Id || 0,
        AddRemove: (data as any).AddRemove || 'string',
        LogInUserId: data.LogInUserId || 0,
        hrmgT_IdList: (data as any).hrmgT_IdList || data.groupTypeIdList || [0],
        employeeTypeIdList: (data as any).employeeTypeIdList || [0],
        hrmD_IdList: data.hrmD_IdList || [0],
        hrmdeS_IdList: data.hrmdeS_IdList || [0],
        groupTypeIdList: data.groupTypeIdList || [0]
    });
    return await api.post<MassUpdationOnloadResponse>('hrms', url, requestBody);
}

/**
 * Get employee details by selection criteria (for save operation)
 * POST /api/massUpdationFacade/getEmployeedetailsBySelection
 */
export async function getEmployeeDetailsBySelection(data: MassUpdationSearchRequest) {
    const url = '/api/massUpdationFacade/getEmployeedetailsBySelection';
    const requestBody = createCompleteRequestBody({
        ...(data as any),
        MI_Id: data.MI_Id || 30,
        roleId: data.roleId,
        Type: (data as any).Type || 'string',
        HRME_Id: (data as any).HRME_Id || 0,
        groupTypeselected: (data as any).groupTypeselected || [0],
        departmentselected: (data as any).departmentselected || [0],
        designationselected: (data as any).designationselected || [0],
        employeeselected: (data as any).employeeselected || [0],
        EarningDeduction: (data as any).EarningDeduction || 'string',
        AmountPercentage: (data as any).AmountPercentage || 'string',
        HREED_Amount: (data as any).HREED_Amount || 0,
        HREED_Percentage: (data as any).HREED_Percentage || 'string',
        HRMED_Id: (data as any).HRMED_Id || 0,
        AddRemove: (data as any).AddRemove || 'string',
        LogInUserId: data.LogInUserId || 0,
        hrmgT_IdList: (data as any).hrmgT_IdList || data.groupTypeIdList || [0],
        employeeTypeIdList: (data as any).employeeTypeIdList || [0],
        hrmD_IdList: data.hrmD_IdList || [0],
        hrmdeS_IdList: data.hrmdeS_IdList || [0],
        groupTypeIdList: data.groupTypeIdList || [0]
    });
    return await api.post<MassUpdationOnloadResponse>('hrms', url, requestBody);
}
