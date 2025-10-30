import { clientEnv } from '@/env';
import { type ApiResponse, api } from '@/lib/apiService';
import type {
    MasterPayrollStandardInput,
    MasterPayrollStandardResponse,
    PayrollStandardDetail
} from '@/types/hrms/master-payroll-standard';
import axios from 'axios';

/**
 * Get onload details for master payroll standard
 * POST /api/MasterPayrollStandardFacade/onloadgetdetails
 */
export async function getMasterPayrollStandardList(roleId: number): Promise<ApiResponse<MasterPayrollStandardResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterPayrollStandardFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRC_Id: 0,
            MI_Id: 30,
            HRC_PFMaxAmt: 0,
            HRC_FPFPer: 0,
            HRC_EPFPer: 0,
            HRC_AsPerEmpFlag: false,
            HRC_PFAccNoPrefix: 'string',
            HRC_AccNo2: 0,
            HRC_AccNo21: 0,
            HRC_AccNo22: 0,
            HRC_RetirementYrs: 0,
            HRC_ECodePrefix: 'string',
            HRC_ESIMax: 0,
            HRC_ESIEmplrCont: 0,
            HRC_PayMethodFlg: 'string',
            HRC_ArrSalaryFlag: false,
            HRC_CummArrFlag: false,
            HRC_SalaryFromDay: 1,
            HRC_SalaryToDay: 31,
            HRC_ARTFPFPer: 0,
            HRC_ARTEPFPer: 0,
            HRC_ESIMaxAmount: 0,
            HRC_AC2MinAmount: 0,
            HRC_AC21MinAmount: 0,
            HRC_AC22MinAmount: 0,
            HRC_SalAdvApprovalFlg: false,
            HRC_LoanApprovalFlg: false,
            HRC_LeaveApprovalFlg: false,
            HRC_IncrementApprovalFlg: false,
            HRC_ProbationApprovalFlg: false,
            HRC_SalApprovalFlg: false,
            HRC_EducationCess: 0,
            roleId: roleId,
            retrunMsg: 'string',
            hrStandardList: [],
            monthdropdown: [],
            HRC_partAmaxflag: 0,
            HRC_partBmaxflag: 0,
            HRC_IncrementMonth: 'string',
            HRC_MinimumWorkingPeriod: 0,
            HRC_FixedIncrmentFlg: false,
            HRC_NoOfOptionalHolidays: 0,
            HRC_IncrementOnceInMonths: 0,
            HRC_AlertDay: 0
        };

        const axiosResponse = await axios.post<MasterPayrollStandardResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterPayrollStandardResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Data fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master payroll standard list:', error);
        throw error;
    }
}

/**
 * Save or Update master payroll standard record
 * POST /api/MasterPayrollStandardFacade
 */
export async function saveMasterPayrollStandard(data: MasterPayrollStandardInput): Promise<ApiResponse<MasterPayrollStandardResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterPayrollStandardFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRC_Id: data.HRC_Id || 0,
            MI_Id: 30,
            HRC_PFMaxAmt: data.HRC_PFMaxAmt || 0,
            HRC_FPFPer: data.HRC_FPFPer || 0,
            HRC_EPFPer: data.HRC_EPFPer || 0,
            HRC_AsPerEmpFlag: data.HRC_AsPerEmpFlag ?? false,
            HRC_PFAccNoPrefix: data.HRC_PFAccNoPrefix || 'string',
            HRC_AccNo2: data.HRC_AccNo2 || 0,
            HRC_AccNo21: data.HRC_AccNo21 || 0,
            HRC_AccNo22: data.HRC_AccNo22 || 0,
            HRC_RetirementYrs: data.HRC_RetirementYrs || 0,
            HRC_ECodePrefix: data.HRC_ECodePrefix || 'string',
            HRC_ESIMax: data.HRC_ESIMax || 0,
            HRC_ESIEmplrCont: data.HRC_ESIEmplrCont || 0,
            HRC_PayMethodFlg: data.HRC_PayMethodFlg || 'string',
            HRC_ArrSalaryFlag: data.HRC_ArrSalaryFlag ?? false,
            HRC_CummArrFlag: data.HRC_CummArrFlag ?? false,
            HRC_SalaryFromDay: data.HRC_SalaryFromDay || 1,
            HRC_SalaryToDay: data.HRC_SalaryToDay || 31,
            HRC_ARTFPFPer: data.HRC_ARTFPFPer || 0,
            HRC_ARTEPFPer: data.HRC_ARTEPFPer || 0,
            HRC_ESIMaxAmount: data.HRC_ESIMaxAmount || 0,
            HRC_AC2MinAmount: data.HRC_AC2MinAmount || 0,
            HRC_AC21MinAmount: data.HRC_AC21MinAmount || 0,
            HRC_AC22MinAmount: data.HRC_AC22MinAmount || 0,
            HRC_SalAdvApprovalFlg: data.HRC_SalAdvApprovalFlg ?? false,
            HRC_LoanApprovalFlg: data.HRC_LoanApprovalFlg ?? false,
            HRC_LeaveApprovalFlg: data.HRC_LeaveApprovalFlg ?? false,
            HRC_IncrementApprovalFlg: data.HRC_IncrementApprovalFlg ?? false,
            HRC_ProbationApprovalFlg: data.HRC_ProbationApprovalFlg ?? false,
            HRC_SalApprovalFlg: data.HRC_SalApprovalFlg ?? false,
            HRC_EducationCess: data.HRC_EducationCess || 0,
            roleId: data.MI_Id || 0,
            retrunMsg: 'string',
            hrStandardList: [],
            monthdropdown: [],
            HRC_partAmaxflag: data.HRC_partAmaxflag || 0,
            HRC_partBmaxflag: data.HRC_partBmaxflag || 0,
            HRC_IncrementMonth: data.HRC_IncrementMonth || 'string',
            HRC_MinimumWorkingPeriod: data.HRC_MinimumWorkingPeriod || 0,
            HRC_FixedIncrmentFlg: data.HRC_FixedIncrmentFlg ?? false,
            HRC_NoOfOptionalHolidays: data.HRC_NoOfOptionalHolidays || 0,
            HRC_IncrementOnceInMonths: data.HRC_IncrementOnceInMonths || 0,
            HRC_AlertDay: data.HRC_AlertDay || 0
        };

        const axiosResponse = await axios.post<MasterPayrollStandardResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterPayrollStandardResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || 'Operation completed',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving master payroll standard:', error);
        throw error;
    }
}

/**
 * Get details of a specific master payroll standard by ID
 * GET /api/MasterPayrollStandardFacade/getRecordById/{id}
 */
export async function getMasterPayrollStandardDetails(id: number): Promise<ApiResponse<MasterPayrollStandardResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterPayrollStandardFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.get<MasterPayrollStandardResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterPayrollStandardResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Payroll standard details fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master payroll standard details:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master payroll standard record
 * POST /api/MasterPayrollStandardFacade/deactivateRecordById
 */
export async function activateDeactivateMasterPayrollStandard(data: {
    HRC_Id: number;
    HRC_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterPayrollStandardResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterPayrollStandardFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRC_Id: data.HRC_Id,
            MI_Id: 30,
            HRC_PFMaxAmt: 0,
            HRC_FPFPer: 0,
            HRC_EPFPer: 0,
            HRC_AsPerEmpFlag: false,
            HRC_PFAccNoPrefix: 'string',
            HRC_AccNo2: 0,
            HRC_AccNo21: 0,
            HRC_AccNo22: 0,
            HRC_RetirementYrs: 0,
            HRC_ECodePrefix: 'string',
            HRC_ESIMax: 0,
            HRC_ESIEmplrCont: 0,
            HRC_PayMethodFlg: 'string',
            HRC_ArrSalaryFlag: false,
            HRC_CummArrFlag: false,
            HRC_SalaryFromDay: 1,
            HRC_SalaryToDay: 31,
            HRC_ARTFPFPer: 0,
            HRC_ARTEPFPer: 0,
            HRC_ESIMaxAmount: 0,
            HRC_AC2MinAmount: 0,
            HRC_AC21MinAmount: 0,
            HRC_AC22MinAmount: 0,
            HRC_SalAdvApprovalFlg: false,
            HRC_LoanApprovalFlg: false,
            HRC_LeaveApprovalFlg: false,
            HRC_IncrementApprovalFlg: false,
            HRC_ProbationApprovalFlg: false,
            HRC_SalApprovalFlg: false,
            HRC_EducationCess: 0,
            roleId: 0,
            retrunMsg: 'string',
            hrStandardList: [],
            monthdropdown: [],
            HRC_partAmaxflag: 0,
            HRC_partBmaxflag: 0,
            HRC_IncrementMonth: 'string',
            HRC_MinimumWorkingPeriod: 0,
            HRC_FixedIncrmentFlg: false,
            HRC_NoOfOptionalHolidays: 0,
            HRC_IncrementOnceInMonths: 0,
            HRC_AlertDay: 0
        };

        const axiosResponse = await axios.post<MasterPayrollStandardResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterPayrollStandardResponse> = {
            success: isSuccess,
            message:
                axiosResponse.data.retrunMsg ||
                (isSuccess ? 'Payroll standard status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error activating/deactivating master payroll standard:', error);
        throw error;
    }
}
