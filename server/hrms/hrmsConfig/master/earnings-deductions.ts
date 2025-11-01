'use server';

import { api } from '@/lib/apiService';
import type {
    EarningsDeductionDetail,
    MasterEarningsDeductionsInput,
    MasterEarningsDeductionsResponse
} from '@/types/hrms/master-earnings-deductions';

/**
 * Get onload details for master earnings deductions
 * POST /api/MasterEarningsDeductionsFacade/onloadgetdetails
 */
export async function getMasterEarningsDeductionsList(roleId: number) {
    const url = '/api/MasterEarningsDeductionsFacade/onloadgetdetails';
    const requestBody = {
        HRMED_Id: 0,
        MI_Id: 30,
        HRMED_Name: 'string',
        HRMED_EDTypeFlag: 'string',
        HRMED_EarnDedFlag: 'string',
        HRMED_AmountPercentFlag: 'string',
        HRMED_AmountPercent: 'string',
        HRMED_ActiveFlag: true,
        HRMED_RoundOffFlag: 'string',
        earningdetectionList: [],
        retrunMsg: 'string',
        roleId: roleId,
        HRMED_ReviseFlg: false,
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: 'string',
        HREED_Amount: 0,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: [],
        HRMED_Order: 0
    };
    return await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
}

/**
 * Save or Update master earnings deductions record
 * POST /api/MasterEarningsDeductionsFacade
 */
export async function saveMasterEarningsDeductions(data: MasterEarningsDeductionsInput) {
    const url = '/api/MasterEarningsDeductionsFacade';
    const requestBody = {
        HRMED_Id: data.HRMED_Id || 0,
        MI_Id: 30,
        HRMED_Name: data.HRMED_Name,
        HRMED_EDTypeFlag: data.HRMED_EDTypeFlag,
        HRMED_EarnDedFlag: data.HRMED_EarnDedFlag,
        HRMED_AmountPercentFlag: data.HRMED_AmountPercentFlag,
        HRMED_AmountPercent: data.HRMED_AmountPercent,
        HRMED_ActiveFlag: data.HRMED_ActiveFlag,
        HRMED_RoundOffFlag: data.HRMED_RoundOffFlag,
        earningdetectionList: [],
        retrunMsg: 'string',
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: 'string',
        HREED_Amount: 0,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: [],
        HRMED_Order: data.HRMED_Order || 0
    };
    return await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
}

/**
 * Get details of a specific master earnings deductions by ID
 * GET /api/MasterEarningsDeductions/details/{id}
 */
export async function getMasterEarningsDeductionsDetails(id: number) {
    const url = `/api/MasterEarningsDeductions/details/${id}`;
    return await api.get<EarningsDeductionDetail>('hrms', url);
}

/**
 * Activate or Deactivate a master earnings deductions record
 * POST /api/MasterEarningsDeductionsFacade/deactivateRecordById
 */
export async function activateDeactivateMasterEarningsDeductions(data: {
    HRMED_Id: number;
    HRMED_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterEarningsDeductionsFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMED_Id: data.HRMED_Id,
        MI_Id: 30,
        HRMED_Name: 'string',
        HRMED_EDTypeFlag: 'string',
        HRMED_EarnDedFlag: 'string',
        HRMED_AmountPercentFlag: 'string',
        HRMED_AmountPercent: 'string',
        HRMED_ActiveFlag: data.HRMED_ActiveFlag,
        HRMED_RoundOffFlag: 'string',
        earningdetectionList: [],
        retrunMsg: 'string',
        roleId: 0,
        HRMED_ReviseFlg: false,
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: 'string',
        HREED_Amount: 0,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: [],
        HRMED_Order: 0
    };
    return await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
}

export async function saveMasterEarningsDeductionsOrder(earningsDeductions: EarningsDeductionDetail[]) {
    const url = '/api/MasterEarningsDeductionsFacade';
    const requestBody = {
        HRMED_Id: 0,
        MI_Id: 30,
        HRMED_Name: 'string',
        HRMED_EDTypeFlag: 'string',
        HRMED_EarnDedFlag: 'string',
        HRMED_AmountPercentFlag: 'string',
        HRMED_AmountPercent: 'string',
        HRMED_ActiveFlag: true,
        HRMED_RoundOffFlag: 'string',
        earningdetectionList: [],
        retrunMsg: 'string',
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: 'string',
        HREED_Amount: 0,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: earningsDeductions.map((ed) => ({
            HRMED_Id: ed.HRMED_Id,
            MI_Id: 30,
            HRMED_Name: ed.HRMED_Name,
            HRMED_EDTypeFlag: ed.HRMED_EDTypeFlag,
            HRMED_EarnDedFlag: ed.HRMED_EarnDedFlag,
            HRMED_AmountPercentFlag: ed.HRMED_AmountPercentFlag,
            HRMED_AmountPercent: ed.HRMED_AmountPercent,
            HRMED_ActiveFlag: ed.HRMED_ActiveFlag,
            HRMED_RoundOffFlag: ed.HRMED_RoundOffFlag,
            HRMED_Order: ed.HRMED_Order
        })),
        HRMED_Order: 0
    };
    return await api.post<MasterEarningsDeductionsResponse>('hrms', url, requestBody);
}
