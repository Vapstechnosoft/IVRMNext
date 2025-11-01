'use server';

import { api } from '@/lib/apiService';
import type { MasterLoanInput, MasterLoanResponse } from '@/types/hrms/master-loan';

/**
 * Get onload details for master loan
 * POST /api/HRMasterLoanFacade/onloadgetdetails
 */
export async function getMasterLoanList(roleId: number) {
    const url = '/api/HRMasterLoanFacade/onloadgetdetails';
    const requestBody = {
        HRMLN_Id: 0,
        MI_Id: 30,
        HRML_LoanType: 'string',
        HRML_Max: 0,
        HRMLN_ActiveFlag: true,
        gmasterloanList: [],
        retrunMsg: 'string',
        roleId: roleId,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    return await api.post<MasterLoanResponse>('hrms', url, requestBody);
}

/**
 * Save or Update master loan record
 * POST /api/HRMasterLoanFacade
 */
export async function saveMasterLoan(data: MasterLoanInput) {
    const url = '/api/HRMasterLoanFacade';
    const requestBody = {
        HRMLN_Id: data.HRMLN_Id || 0,
        MI_Id: 30,
        HRML_LoanType: data.HRML_LoanType,
        HRML_Max: Number(data.HRML_Max) || 0,
        HRMLN_ActiveFlag: data.HRMLN_ActiveFlag,
        gmasterloanList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    return await api.post<MasterLoanResponse>('hrms', url, requestBody);
}

/**
 * Get details of a specific master loan by ID
 * GET /api/MasterLoanFacade/getRecordById/{id}
 */
export async function getMasterLoanDetails(id: number) {
    const url = `/api/MasterLoanFacade/getRecordById/${id}`;
    return await api.get<MasterLoanResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master loan record
 * POST /api/HRMasterLoanFacade/deactivateRecordById
 */
export async function activateDeactivateMasterLoan(data: {
    HRMLN_Id: number;
    HRMLN_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/HRMasterLoanFacade/deactivateRecordById';
    const requestBody = {
        HRMLN_Id: data.HRMLN_Id,
        MI_Id: 30,
        HRML_LoanType: 'string',
        HRML_Max: 0,
        HRMLN_ActiveFlag: data.HRMLN_ActiveFlag,
        gmasterloanList: [],
        retrunMsg: 'string',
        roleId: 0,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    return await api.post<MasterLoanResponse>('hrms', url, requestBody);
}
