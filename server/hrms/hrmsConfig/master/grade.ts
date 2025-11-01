'use server';

import { api } from '@/lib/apiService';
import type { GradeDetail, MasterGradeInput, MasterGradeResponse, OnchangeGradeDetailsRequest } from '@/types/hrms/master-grade';

export async function getMasterGradeList(roleId: number) {
    const url = '/api/MasterGradeFacade/onloadgetdetails';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMG_Id: 0,
        MI_Id: 30,
        HRMG_GradeName: 'string',
        HRMG_GradeDisplayName: 'string',
        HRMG_PayScaleRange: 'string',
        HRMG_PayScaleFrom: 0,
        HRMG_IncrementOf: 0,
        HRMG_PayScaleTo: 0,
        HRMG_Order: 0,
        HRMG_ActiveFlag: true,
        gradelList: [],
        retrunMsg: 'string',
        roleId: roleId,
        GradeDTO: []
    };
    return await api.post<MasterGradeResponse>('hrms', url, requestBody);
}

export async function saveMasterGrade(data: MasterGradeInput) {
    const url = '/api/MasterGradeFacade';
    const requestBody: OnchangeGradeDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMG_Id: data.HRMG_Id || 0,
        MI_Id: 30,
        HRMG_GradeName: data.HRMG_GradeName,
        HRMG_GradeDisplayName: data.HRMG_GradeDisplayName,
        HRMG_PayScaleRange: `${data.HRMG_PayScaleFrom}-${data.HRMG_IncrementOf}-${data.HRMG_PayScaleTo}`,
        HRMG_PayScaleFrom: data.HRMG_PayScaleFrom,
        HRMG_IncrementOf: data.HRMG_IncrementOf,
        HRMG_PayScaleTo: data.HRMG_PayScaleTo,
        HRMG_Order: data.HRMG_Order || 0,
        HRMG_ActiveFlag: data.HRMG_ActiveFlag,
        gradelList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0,
        GradeDTO: []
    };
    return await api.post<MasterGradeResponse>('hrms', url, requestBody);
}

/**
 * Activate or Deactivate a master grade record
 * POST /api/MasterGradeFacade/deactivateRecordById
 */
export async function activateDeactivateMasterGrade(data: {
    HRMG_Id: number;
    HRMG_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterGradeFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMG_Id: data.HRMG_Id,
        MI_Id: 30,
        HRMG_GradeName: 'string',
        HRMG_GradeDisplayName: 'string',
        HRMG_PayScaleRange: 'string',
        HRMG_PayScaleFrom: 0,
        HRMG_IncrementOf: 0,
        HRMG_PayScaleTo: 0,
        HRMG_Order: 0,
        HRMG_ActiveFlag: data.HRMG_ActiveFlag,
        gradelList: [],
        retrunMsg: 'string',
        roleId: 0,
        GradeDTO: []
    };
    return await api.post<MasterGradeResponse>('hrms', url, requestBody);
}

export async function saveMasterGradeOrder(grades: GradeDetail[]) {
    const url = '/api/MasterGradeFacade';
    const requestBody: OnchangeGradeDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMG_Id: 0,
        MI_Id: 30,
        HRMG_GradeName: 'string',
        HRMG_GradeDisplayName: 'string',
        HRMG_PayScaleRange: 'string',
        HRMG_PayScaleFrom: 0,
        HRMG_IncrementOf: 0,
        HRMG_PayScaleTo: 0,
        HRMG_Order: 0,
        HRMG_ActiveFlag: true,
        gradelList: [],
        retrunMsg: 'string',
        roleId: 0,
        GradeDTO: grades.map((grade) => ({
            HRMG_Id: grade.HRMG_Id,
            MI_Id: 30,
            HRMG_GradeName: grade.HRMG_GradeName,
            HRMG_GradeDisplayName: grade.HRMG_GradeDisplayName,
            HRMG_PayScaleRange: grade.HRMG_PayScaleRange,
            HRMG_PayScaleFrom: grade.HRMG_PayScaleFrom,
            HRMG_IncrementOf: grade.HRMG_IncrementOf,
            HRMG_PayScaleTo: grade.HRMG_PayScaleTo,
            HRMG_Order: grade.HRMG_Order,
            HRMG_ActiveFlag: grade.HRMG_ActiveFlag
        }))
    };
    return await api.post<MasterGradeResponse>('hrms', url, requestBody);
}
