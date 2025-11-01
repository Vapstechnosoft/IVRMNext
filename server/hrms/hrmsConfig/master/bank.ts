'use server';

import { api } from '@/lib/apiService';
import type { MasterBankInput, MasterBankResponse } from '@/types/hrms/master-bank';

/**
 * Get onload details for master bank
 * POST /api/MasterBankFacade/onloadgetdetails
 */
export async function getMasterBankList(roleId: number) {
    const url = '/api/MasterBankFacade/onloadgetdetails';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMBD_Id: 0,
        MI_Id: 30,
        HRMBD_BankName: 'string',
        HRMBD_BankAccountNo: 'string',
        HRMBD_BankAddress: 'string',
        HRMBD_BranchName: 'string',
        HRMBD_IFSCCode: 'string',
        HRMBD_ActiveFlag: true,
        bankdetailList: [],
        retrunMsg: 'string',
        roleId: roleId
    };
    return await api.post<MasterBankResponse>('hrms', url, requestBody);
}

/**
 * Save or Update master bank record
 * POST /api/MasterBankFacade
 */
export async function saveMasterBank(data: MasterBankInput) {
    const url = '/api/MasterBankFacade';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMBD_Id: data.HRMBD_Id || 0,
        MI_Id: data.MI_Id,
        HRMBD_BankName: data.HRMBD_BankName,
        HRMBD_BankAccountNo: data.HRMBD_BankAccountNo,
        HRMBD_BankAddress: data.HRMBD_BankAddress,
        HRMBD_BranchName: data.HRMBD_BranchName,
        HRMBD_IFSCCode: data.HRMBD_IFSCCode,
        HRMBD_ActiveFlag: data.HRMBD_ActiveFlag,
        bankdetailList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id
    };
    return await api.post<MasterBankResponse>('hrms', url, requestBody);
}

/**
 * Activate/Deactivate a master bank record
 * POST /api/MasterBankFacade/deactivateRecordById
 */
export async function activateDeactivateMasterBank(data: {
    HRMBD_Id: number;
    HRMBD_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterBankFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMBD_Id: data.HRMBD_Id,
        MI_Id: data.MI_Id || 30,
        HRMBD_BankName: 'string',
        HRMBD_BankAccountNo: 'string',
        HRMBD_BankAddress: 'string',
        HRMBD_BranchName: 'string',
        HRMBD_IFSCCode: 'string',
        HRMBD_ActiveFlag: data.HRMBD_ActiveFlag,
        bankdetailList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0
    };
    return await api.post<MasterBankResponse>('hrms', url, requestBody);
}

/**
 * Get details of a specific master bank by ID
 * GET /api/MasterBankFacade/getRecordById/{id}
 */
export async function getMasterBankDetails(id: number) {
    const url = `/api/MasterBankFacade/getRecordById/${id}`;
    return await api.get<MasterBankResponse>('hrms', url);
}
