'use server';

import { api } from '@/lib/apiService';
import type {
    MasterProfessionalTaxInput,
    MasterProfessionalTaxResponse
} from '@/types/hrms/master-professional-tax';

/**
 * Get onload details for master professional tax
 * POST /api/MasterProfessionalTaxFacade/onloadgetdetails
 */
export async function getMasterProfessionalTaxList(roleId: number) {
    const url = '/api/MasterProfessionalTaxFacade/onloadgetdetails';
    const requestBody = {
        HRMPT_Id: 0,
        MI_Id: 30,
        HRMPT_SalaryFrom: 0,
        HRMPT_SalaryTo: 0,
        HRMPT_PTax: 0,
        HRMPT_ActiveFlag: true,
        pTaxrList: [],
        retrunMsg: 'string',
        roleId: roleId,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    return await api.post<MasterProfessionalTaxResponse>('hrms', url, requestBody);
}

/**
 * Save or Update master professional tax record
 * POST /api/MasterProfessionalTaxFacade
 */
export async function saveMasterProfessionalTax(data: MasterProfessionalTaxInput) {
    const url = '/api/MasterProfessionalTaxFacade';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMPT_Id: data.HRMPT_Id || 0,
        MI_Id: 30,
        HRMPT_SalaryFrom: Number(data.HRMPT_SalaryFrom) || 0,
        HRMPT_SalaryTo: Number(data.HRMPT_SalaryTo) || 0,
        HRMPT_PTax: Number(data.HRMPT_PTax) || 0,
        HRMPT_ActiveFlag: data.HRMPT_ActiveFlag ?? true,
        pTaxrList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30
    };
    return await api.post<MasterProfessionalTaxResponse>('hrms', url, requestBody);
}

/**
 * Get details of a specific master professional tax by ID
 * GET /api/MasterProfessionalTaxFacade/getRecordById/{id}
 */
export async function getMasterProfessionalTaxDetails(id: number) {
    const url = `/api/MasterProfessionalTaxFacade/getRecordById/${id}`;
    return await api.get<MasterProfessionalTaxResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master professional tax record
 * POST /api/MasterProfessionalTaxFacade/deactivateRecordById
 */
export async function activateDeactivateMasterProfessionalTax(data: {
    HRMPT_Id: number;
    HRMPT_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterProfessionalTaxFacade/deactivateRecordById';
    const requestBody = {
        HRMPT_Id: data.HRMPT_Id,
        MI_Id: 30,
        HRMPT_SalaryFrom: 0,
        HRMPT_SalaryTo: 0,
        HRMPT_PTax: 0,
        HRMPT_ActiveFlag: data.HRMPT_ActiveFlag,
        pTaxrList: [],
        retrunMsg: 'string',
        roleId: 0,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
    };
    return await api.post<MasterProfessionalTaxResponse>('hrms', url, requestBody);
}
