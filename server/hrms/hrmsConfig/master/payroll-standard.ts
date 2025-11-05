'use server';

import { api } from '@/lib/apiService';
import type {
    MasterPayrollStandardInput,
    MasterPayrollStandardResponse
} from '@/types/hrms/master-payroll-standard';

/**
 * Get onload details for master payroll standard
 * POST /api/MasterPayrollStandardFacade/onloadgetdetails
 */
export async function getMasterPayrollStandardList(roleId: number) {
    console.log('🟠 ========== PAYROLL STANDARD ONLOAD API ==========');
    console.log('🟠 [API] getMasterPayrollStandardList called');
    console.log('🟠 [API] roleId:', roleId);
    
    const url = '/api/MasterPayrollStandardFacade/onloadgetdetails';
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

    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await api.post<MasterPayrollStandardResponse>('hrms', url, requestBody);

    console.log('🟢 ========== PAYROLL STANDARD ONLOAD RESPONSE ==========');
    console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
    console.log('🟢 [API] Response hrStandardList:', response?.hrStandardList);
    const hrStandardList = (response?.hrStandardList || []) as any[];
    console.log('🟢 [API] Response hrStandardList length:', hrStandardList.length || 0);
    console.log('🟢 [API] First record:', JSON.stringify(hrStandardList[0], null, 2));
    console.log('🟢 ========== PAYROLL STANDARD ONLOAD END ==========');

    return response;
}

/**
 * Save or Update master payroll standard record
 * POST /api/MasterPayrollStandardFacade
 */
export async function saveMasterPayrollStandard(data: MasterPayrollStandardInput) {
    console.log('🟠 ========== PAYROLL STANDARD SAVE API ==========');
    console.log('🟠 [API] saveMasterPayrollStandard called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));

    const url = '/api/MasterPayrollStandardFacade';
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
        HRC_IncrementMonth: data.HRC_IncrementMonth || '',
        HRC_MinimumWorkingPeriod: data.HRC_MinimumWorkingPeriod || 0,
        HRC_FixedIncrmentFlg: data.HRC_FixedIncrmentFlg ?? false,
        HRC_NoOfOptionalHolidays: data.HRC_NoOfOptionalHolidays || 0,
        HRC_IncrementOnceInMonths: data.HRC_IncrementOnceInMonths || 0,
        HRC_AlertDay: data.HRC_AlertDay || 0
    };

    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] HRC_IncrementMonth being sent:', requestBody.HRC_IncrementMonth);
    console.log('🟠 [API] HRC_SalaryFromDay being sent:', requestBody.HRC_SalaryFromDay);
    console.log('🟠 [API] HRC_SalaryToDay being sent:', requestBody.HRC_SalaryToDay);

    const response = await api.post<MasterPayrollStandardResponse>('hrms', url, requestBody);

    console.log('🟢 ========== PAYROLL STANDARD SAVE RESPONSE ==========');
    console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
    console.log('🟢 [API] Response retrunMsg:', response?.retrunMsg);
    console.log('🟢 [API] Response hrStandardList:', response?.hrStandardList);
    console.log('🟢 [API] Response HRC_IncrementMonth:', response?.HRC_IncrementMonth);
    console.log('🟢 [API] Response HRC_SalaryFromDay:', response?.HRC_SalaryFromDay);
    console.log('🟢 [API] Response HRC_SalaryToDay:', response?.HRC_SalaryToDay);

    // Parse response and normalize
    const retrunMsg: string = (response?.retrunMsg || '') as string;
    const hrcId: number = (response?.HRC_Id || 0) as number;

    // Check for success
    const isSuccess =
        retrunMsg === 'Update' ||
        retrunMsg === 'Saved' ||
        retrunMsg === 'Add' ||
        hrcId > 0;

    // Check for duplicate
    const isDuplicate = retrunMsg === 'Duplicate' || (retrunMsg && retrunMsg.toLowerCase().includes('duplicate'));

    console.log('🟢 [API] Parsed - isSuccess:', isSuccess, 'isDuplicate:', isDuplicate);

    let message = 'Operation failed';
    if (isDuplicate) {
        message = 'Payroll standard already exists';
    } else if (isSuccess) {
        message = retrunMsg === 'Update' ? 'Payroll standard updated successfully' : 'Payroll standard saved successfully';
    } else {
        message = retrunMsg || 'Failed to save payroll standard';
    }

    console.log('🟢 [API] Final message:', message);
    console.log('🟢 ========== PAYROLL STANDARD SAVE END ==========');

    return {
        success: isSuccess && !isDuplicate,
        message,
        data: response
    };
}

/**
 * Get details of a specific master payroll standard by ID
 * GET /api/MasterPayrollStandardFacade/getRecordById/{id}
 */
export async function getMasterPayrollStandardDetails(id: number) {
    const url = `/api/MasterPayrollStandardFacade/getRecordById/${id}`;
    return await api.get<MasterPayrollStandardResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master payroll standard record
 * POST /api/MasterPayrollStandardFacade/deactivateRecordById
 */
export async function activateDeactivateMasterPayrollStandard(data: {
    HRC_Id: number;
    HRC_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterPayrollStandardFacade/deactivateRecordById';
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
    return await api.post<MasterPayrollStandardResponse>('hrms', url, requestBody);
}
