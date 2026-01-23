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
// Helper to map Group Type
// Helper to map Group Type
function mapGroupType(item: any) {
    if (item.key && item.value) {
        return {
            HRMGT_Id: item.key,
            MI_Id: 0,
            HRMGT_EmployeeGroupType: item.value,
            HRMGT_Code: '',
            HRMGT_Order: 0,
            HRMGT_ActiveFlag: true
        };
    }
    return {
        HRMGT_Id: item.hrmgT_Id || item.HRMGT_Id,
        MI_Id: item.mI_Id || item.MI_Id,
        HRMGT_EmployeeGroupType: item.hrmgT_EmployeeGroupType || item.HRMGT_EmployeeGroupType,
        HRMGT_Code: item.hrmgT_Code || item.HRMGT_Code,
        HRMGT_Order: item.hrmgT_Order || item.HRMGT_Order,
        HRMGT_ActiveFlag: item.hrmgT_ActiveFlag || item.HRMGT_ActiveFlag
    };
}

// Helper to map Department
function mapDepartment(item: any) {
    return {
        HRMD_Id: item.hrmD_Id || item.HRMD_Id,
        MI_Id: item.mI_Id || item.MI_Id,
        HRMD_DepartmentName: item.hrmD_DepartmentName || item.HRMD_DepartmentName,
        HRMD_Order: item.hrmD_Order || item.HRMD_Order,
        HRMD_ActiveFlag: item.hrmD_ActiveFlag || item.HRMD_ActiveFlag,
        HRMDC_ID: item.hrmdC_ID || item.HRMDC_ID
    };
}

// Helper to map Designation
function mapDesignation(item: any) {
    return {
        HRMDES_Id: item.hrmdeS_Id || item.HRMDES_Id,
        MI_Id: item.mI_Id || item.MI_Id,
        HRMDES_DesignationName: item.hrmdeS_DesignationName || item.HRMDES_DesignationName,
        HRMDES_BasicAmount: item.hrmdeS_BasicAmount || item.HRMDES_BasicAmount,
        HRMDES_SanctionedSeats: item.hrmdeS_SanctionedSeats || item.HRMDES_SanctionedSeats,
        HRMDES_DisplaySanctionedSeatsFlag: item.hrmdeS_DisplaySanctionedSeatsFlag || item.HRMDES_DisplaySanctionedSeatsFlag,
        HRMDES_Order: item.hrmdeS_Order || item.HRMDES_Order,
        HRMDES_ActiveFlag: item.hrmdeS_ActiveFlag || item.HRMDES_ActiveFlag,
        HRMDC_ID: item.hrmdC_ID || item.HRMDC_ID
    };
}

// Helper to map Head
function mapHead(item: any) {
    return {
        HRMED_Id: item.hrmeD_Id || item.HRMED_Id,
        HRMED_Name: item.hrmeD_Name || item.HRMED_Name,
        HRMED_EDTypeFlag: item.hrmeD_EDTypeFlag || item.HRMED_EDTypeFlag,
        HRMED_EarnDedFlag: item.hrmeD_EarnDedFlag || item.HRMED_EarnDedFlag,
        HRMED_AmountPercentFlag: item.hrmeD_AmountPercentFlag || item.HRMED_AmountPercentFlag
    };
}

export async function getMassUpdationOnload(payload: MassUpdationOnloadRequest) {
    const facadeUrl = '/api/massUpdationFacade/onloadgetdetails';
    const groupTypeUrl = '/api/MasterDropDown/GroupType';

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

    try {
        console.log('🔄 [MASS UPDATION - BACKEND] Fetching onload data...');
        // Fetch both in parallel
        const [facadeResponse, groupTypeResponse] = await Promise.all([
            api.post<any>('hrms', facadeUrl, requestBody),
            api.get<any[]>('hrms', groupTypeUrl)
        ]);

        console.log('✅ [MASS UPDATION - BACKEND] Responses received.');

        const rawData = facadeResponse && facadeResponse.data ? facadeResponse.data : (facadeResponse || {});

        // Use Group Types from MasterDropDown if available
        let groupTypes: any[] = [];
        if (groupTypeResponse && groupTypeResponse.success && Array.isArray(groupTypeResponse.data)) {
            console.log(`✅ [MASS UPDATION] Using MasterDropDown GroupTypes (${groupTypeResponse.data.length} items)`);
            groupTypes = groupTypeResponse.data;
        } else if (rawData.groupTypedropdown && rawData.groupTypedropdown.length > 0) {
            groupTypes = rawData.groupTypedropdown;
        } else if (rawData.groupTypedropdownlist && rawData.groupTypedropdownlist.length > 0) {
            groupTypes = rawData.groupTypedropdownlist;
        } else {
            console.warn('⚠️ [MASS UPDATION] No Group Types found from any source.');
        }

        const mappedData: MassUpdationOnloadResponse = {
            ...rawData,
            groupTypedropdown: groupTypes.map(mapGroupType),
            departmentdropdown: (rawData.departmentdropdown || rawData.departmentdropdownlist || []).map(mapDepartment),
            designationdropdown: (rawData.designationdropdown || rawData.designationdropdownlist || []).map(mapDesignation),
            headdropdown: (rawData.headdropdown || []).map(mapHead),

            // Also populate the list variants to be safe
            groupTypedropdownlist: groupTypes.map(mapGroupType),
            departmentdropdownlist: (rawData.departmentdropdown || rawData.departmentdropdownlist || []).map(mapDepartment),
            designationdropdownlist: (rawData.designationdropdown || rawData.designationdropdownlist || []).map(mapDesignation),
        };

        return {
            success: true,
            message: 'Data loaded successfully',
            data: mappedData
        };
    } catch (error: any) {
        console.error('❌ [MASS UPDATION - BACKEND] Error in onload:', error);
        return {
            success: false,
            message: error?.message || 'Failed to load data',
            data: undefined
        };
    }
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
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as MassUpdationOnloadResponse;
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
        return {
            success: true,
            message: 'Mass updation completed successfully',
            data: response as unknown as MassUpdationOnloadResponse
        };
    } catch (error: any) {
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
    console.log('📥 [MASS UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));
    const url = '/api/massUpdationFacade/FilterEmployeeData';
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
    console.log('📥 [MASS UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));
    const url = '/api/massUpdationFacade/getEmployeedetailsBySelection';
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
    try {
        const response = await api.post<MassUpdationOnloadResponse>('hrms', url, requestBody);
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as MassUpdationOnloadResponse;
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
        return {
            success: true,
            message: 'Employee details loaded successfully',
            data: response as unknown as MassUpdationOnloadResponse
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to get employee details by selection',
            data: undefined
        };
    }
}

/**
 * Get departments by group type selection
 * GET /api/MasterDropDown/department_drop_down_by_group_Type/{hrmgt_ids}
 */
export async function getMassUpdationDepartments(data: { MI_Id?: number; hrmgT_IdList?: number[] }) {
    console.log('📥 [MASS UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));

    const ids = data.hrmgT_IdList?.join(',') || '0';
    const url = `/api/MasterDropDown/department_drop_down_by_group_Type/${ids}`;

    try {
        const response = await api.get<any>('hrms', url);

        if (response && response.success) {
            // Map camelCase to PascalCase
            const mappedData = (response.data || []).map((item: any) => ({
                HRMD_Id: item.hrmD_Id,
                MI_Id: item.mI_Id || 30,
                HRMD_DepartmentName: item.hrmD_DepartmentName,
                HRMD_Order: item.hrmD_Order || 0,
                HRMD_ActiveFlag: item.hrmD_ActiveFlag || true,
                HRMDC_ID: item.hrmdC_ID || null
            }));

            console.log(`📊 [MASS UPDATION - BACKEND] Mapped ${mappedData.length} departments`);

            return {
                success: true,
                message: response.message || 'Departments fetched successfully',
                data: {
                    departmentdropdown: mappedData
                }
            };
        }

        return {
            success: false,
            message: response.message || 'Failed to fetch departments',
            data: { departmentdropdown: [] }
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to get departments',
            data: { departmentdropdown: [] }
        };
    }
}

/**
 * Get designations by group type and department selection
 * GET /api/MasterDropDown/designations_drop_down_by_group_Type_and_Dept/{hrmgt_ids}/{hrmd_ids}
 */
export async function getMassUpdationDesignations(data: { MI_Id?: number; hrmgT_IdList?: number[]; hrmD_IdList?: number[] }) {
    console.log('📥 [MASS UPDATION - BACKEND] Request payload:', JSON.stringify(data, null, 2));

    const groupTypeIds = data.hrmgT_IdList?.join(',') || '0';
    const deptIds = data.hrmD_IdList?.join(',') || '0';
    const url = `/api/MasterDropDown/designations_drop_down_by_group_Type_and_Dept/${groupTypeIds}/${deptIds}`;

    try {
        const response = await api.get<any>('hrms', url);

        if (response && response.success) {
            // Map camelCase to PascalCase
            const mappedData = (response.data || []).map((item: any) => ({
                HRMDES_Id: item.hrmdeS_Id,
                MI_Id: item.mI_Id || 30,
                HRMDES_DesignationName: item.hrmdeS_DesignationName,
                HRMDES_BasicAmount: item.hrmdeS_BasicAmount,
                HRMDES_SanctionedSeats: item.hrmdeS_SanctionedSeats,
                HRMDES_DisplaySanctionedSeatsFlag: item.hrmdeS_DisplaySanctionedSeatsFlag,
                HRMDES_Order: item.hrmdeS_Order,
                HRMDES_ActiveFlag: item.hrmdeS_ActiveFlag,
                HRMDC_ID: item.hrmdC_ID
            }));

            console.log(`📊 [MASS UPDATION - BACKEND] Mapped ${mappedData.length} designations`);

            return {
                success: true,
                message: response.message || 'Designations fetched successfully',
                data: {
                    designationdropdown: mappedData
                }
            };
        }

        return {
            success: false,
            message: response.message || 'Failed to fetching designations',
            data: { designationdropdown: [] }
        };

    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to get designations',
            data: { designationdropdown: [] }
        };
    }
}
