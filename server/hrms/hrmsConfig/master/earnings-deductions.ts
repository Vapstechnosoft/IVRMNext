import { clientEnv } from '@/env';
import { type ApiResponse, api } from '@/lib/apiService';
import type {
    EarningsDeductionDetail,
    MasterEarningsDeductionsInput,
    MasterEarningsDeductionsResponse
} from '@/types/hrms/master-earnings-deductions';
import axios from 'axios';

/**
 * Get onload details for master earnings deductions
 * POST /api/MasterEarningsDeductionsFacade/onloadgetdetails
 */
export async function getMasterEarningsDeductionsList(roleId: number): Promise<ApiResponse<MasterEarningsDeductionsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterEarningsDeductionsFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

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

        const axiosResponse = await axios.post<MasterEarningsDeductionsResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterEarningsDeductionsResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Data fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master earnings deductions list:', error);
        throw error;
    }
}

/**
 * Save or Update master earnings deductions record
 * POST /api/MasterEarningsDeductionsFacade
 */
export async function saveMasterEarningsDeductions(
    data: MasterEarningsDeductionsInput
): Promise<ApiResponse<MasterEarningsDeductionsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterEarningsDeductionsFacade';
        const url = `${baseURL}${apiPath}`;

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

        const axiosResponse = await axios.post<MasterEarningsDeductionsResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterEarningsDeductionsResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || 'Operation completed',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving master earnings deductions:', error);
        throw error;
    }
}

/**
 * Get details of a specific master earnings deductions by ID
 * GET /api/MasterEarningsDeductions/details/{id}
 */
export async function getMasterEarningsDeductionsDetails(id: number): Promise<ApiResponse<EarningsDeductionDetail>> {
    try {
        const url = `/api/MasterEarningsDeductions/details/${id}`;
        const response = await api.get<EarningsDeductionDetail>('default', url);
        return response;
    } catch (error) {
        console.error('Error fetching master earnings deductions details:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master earnings deductions record
 * POST /api/MasterEarningsDeductionsFacade/deactivateRecordById
 */
export async function activateDeactivateMasterEarningsDeductions(data: {
    HRMED_Id: number;
    HRMED_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterEarningsDeductionsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterEarningsDeductionsFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

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

        const axiosResponse = await axios.post<MasterEarningsDeductionsResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterEarningsDeductionsResponse> = {
            success: isSuccess,
            message:
                axiosResponse.data.retrunMsg ||
                (isSuccess ? 'Earnings deductions status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error activating/deactivating master earnings deductions:', error);
        throw error;
    }
}

export async function saveMasterEarningsDeductionsOrder(
    earningsDeductions: EarningsDeductionDetail[]
): Promise<ApiResponse<MasterEarningsDeductionsResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterEarningsDeductionsFacade';
        const url = `${baseURL}${apiPath}`;

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

        const axiosResponse = await axios.post<MasterEarningsDeductionsResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterEarningsDeductionsResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Order saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving earnings deductions order:', error);
        throw error;
    }
}
