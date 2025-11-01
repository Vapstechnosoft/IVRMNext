'use server';

import { api } from '@/lib/apiService';
import type { LeaveYearDetail, MasterLeaveYearInput, MasterLeaveYearResponse } from '@/types/hrms/master-leave-year';

/**
 * Get onload details for master leave year
 * POST /api/MasterLeaveYearFacade/onloadgetdetails
 */
export async function getMasterLeaveYearList(roleId: number) {
    const url = '/api/MasterLeaveYearFacade/onloadgetdetails';
    const requestBody = {
        HRMLY_Id: 1,
        MI_Id: 30,
        HRMLY_LeaveYear: '2025-2026',
        HRMLY_FromDate: '2025-04-01T00:00:00',
        HRMLY_ToDate: '2026-03-31T00:00:00',
        HRMLY_ActiveFlag: true,
        leaveYearList: [],
        retrunMsg: '',
        roleId: roleId,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: 1,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    return await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
}

/**
 * Create or Update a master leave year record
 * POST /api/MasterLeaveYearFacade (create)
 * POST /api/MasterLeaveYear/editRecord (update)
 */
export async function saveMasterLeaveYear(data: MasterLeaveYearInput) {
    const isEdit = data.HRMLY_Id && data.HRMLY_Id > 0;
    const url = isEdit ? '/api/MasterLeaveYear/editRecord' : '/api/MasterLeaveYearFacade';
    const requestBody = {
        HRMLY_Id: data.HRMLY_Id || 0,
        MI_Id: 30,
        HRMLY_LeaveYear: data.HRMLY_LeaveYear,
        HRMLY_FromDate: data.HRMLY_FromDate,
        HRMLY_ToDate: data.HRMLY_ToDate,
        HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
        leaveYearList: [],
        retrunMsg: '',
        roleId: data.MI_Id || 1,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: data.HRMLY_LeaveYearOrder || 1,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    return await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
}

/**
 * Get details of a specific master leave year by ID
 * GET /api/MasterLeaveYearFacade/getRecordById/{id}
 */
export async function getMasterLeaveYearDetails(id: number) {
    const url = `/api/MasterLeaveYearFacade/getRecordById/${id}`;
    return await api.get<MasterLeaveYearResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master leave year record
 * POST /api/MasterLeaveYearFacade/deactivateRecordById
 */
export async function activateDeactivateMasterLeaveYear(data: {
    HRMLY_Id: number;
    HRMLY_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterLeaveYearFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMLY_Id: data.HRMLY_Id,
        MI_Id: 30,
        HRMLY_LeaveYear: 'string',
        HRMLY_FromDate: new Date().toISOString(),
        HRMLY_ToDate: new Date().toISOString(),
        HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
        leaveYearList: [],
        retrunMsg: 'string',
        roleId: 0,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: 1,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    return await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
}

export async function saveMasterLeaveYearOrder(leaveYears: LeaveYearDetail[]) {
    const url = '/api/MasterLeaveYearFacade';
    const requestBody = {
        HRMLY_Id: 0,
        MI_Id: 30,
        HRMLY_LeaveYear: 'string',
        HRMLY_FromDate: '',
        HRMLY_ToDate: '',
        HRMLY_ActiveFlag: true,
        leaveYearList: [],
        retrunMsg: '',
        roleId: 0,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: 0,
        yeardetailList: [],
        LeaveorderDTO: leaveYears.map((ly) => ({
            HRMLY_Id: ly.HRMLY_Id,
            MI_Id: 30,
            HRMLY_LeaveYear: ly.HRMLY_LeaveYear,
            HRMLY_FromDate: ly.HRMLY_FromDate,
            HRMLY_ToDate: ly.HRMLY_ToDate,
            HRMLY_ActiveFlag: ly.HRMLY_ActiveFlag,
            HRMLY_LeaveYearOrder: ly.HRMLY_LeaveYearOrder
        }))
    };
    return await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
}
