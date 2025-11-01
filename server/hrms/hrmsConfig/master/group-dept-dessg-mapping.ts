'use server';

import { api } from '@/lib/apiService';
import type { GroupDeptDessgMappingInput, GroupDeptDessgMappingResponse, LoadDataRequest } from '@/types/hrms/group-dept-dessg-mapping';

/**
 * Get onload details for group department designation mapping
 * POST /api/GroupDeptDessgFacade/loaddata
 */
export async function getGroupDeptDessgMappingList(_roleId = 0) {
    const url = '/api/GroupDeptDessgFacade/loaddata';
    const requestBody = {
        HRGTDDS_Id: 0,
        MI_Id: 30,
        HRMGT_Id: 0,
        HRMD_Id: 0,
        HRMDES_Id: 0,
        HRGTDDS_ActiveFlg: true,
        HRGTDDS_CreatedBy: 0,
        HRGTDDS_UpdatedBy: 0,
        HRGTDDS_CreatedDate: new Date().toISOString(),
        HRGTDDS_UpdatedDate: new Date().toISOString(),
        groupTypedropdown: [],
        departmentdropdown: [],
        designationdropdown: [],
        gridviewdata: [],
        designationids: [],
        LogInUserId: 5,
        HRMGT_EmployeeGroupType: '',
        HRMD_DepartmentName: '',
        HRMDES_DesignationName: '',
        returnval: false,
        msg: ''
    };
    return await api.post<GroupDeptDessgMappingResponse>('hrms', url, requestBody);
}

/**
 * Save/Update group department designation mapping
 * POST /api/GroupDeptDessgFacade/savedata
 */
export async function saveGroupDeptDessgMapping(data: GroupDeptDessgMappingInput) {
    const url = '/api/GroupDeptDessgFacade/savedata';
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
        HRMGT_EmployeeGroupType: data.hrmgT_EmployeeGroupType || '',
        HRMD_DepartmentName: data.hrmD_DepartmentName || '',
        HRMDES_DesignationName: data.hrmdeS_DesignationName || '',
        returnval: false,
        msg: ''
    };
    return await api.post<GroupDeptDessgMappingResponse>('hrms', url, requestBody);
}

/**
 * Activate/Deactivate group department designation mapping
 * POST /api/GroupDeptDessgFacade/masterDecative
 */
export async function activateDeactivateGroupDeptDessgMapping(data: { HRGTDDS_Id: number; HRGTDDS_ActiveFlg: boolean }) {
    const url = '/api/GroupDeptDessgFacade/masterDecative';
    const requestBody = {
        HRGTDDS_Id: data.HRGTDDS_Id,
        MI_Id: 30,
        HRMGT_Id: 0,
        HRMD_Id: 0,
        HRMDES_Id: 0,
        HRGTDDS_ActiveFlg: data.HRGTDDS_ActiveFlg,
        HRGTDDS_CreatedBy: 0,
        HRGTDDS_UpdatedBy: 0,
        HRGTDDS_CreatedDate: new Date().toISOString(),
        HRGTDDS_UpdatedDate: new Date().toISOString(),
        groupTypedropdown: [],
        departmentdropdown: [],
        designationdropdown: [],
        gridviewdata: [],
        designationids: [],
        LogInUserId: 5,
        HRMGT_EmployeeGroupType: '',
        HRMD_DepartmentName: '',
        HRMDES_DesignationName: '',
        returnval: false,
        msg: ''
    };
    return await api.post<GroupDeptDessgMappingResponse>('hrms', url, requestBody);
}
