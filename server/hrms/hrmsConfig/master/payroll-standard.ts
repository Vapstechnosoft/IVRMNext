'use server';

import { api } from '@/lib/apiService';
import type { IMasterPayrollStandardList, IMonthDropdown } from '@/types/hrms/hrms-config/master';

/**
 * Get basic data for master payroll standard
 * GET /api/MasterPayrollStandardFacade/GetBasicData
 */
export async function getMasterPayrollStandardList() {
    const url = '/api/MasterPayrollStandardFacade/GetBasicData';
    return await api.get<IMasterPayrollStandardList>('hrms', url);
}

/**
 * Save or Update master payroll standard record
 * POST /api/MasterPayrollStandardFacade/SaveUpdate
 */
export async function saveMasterPayrollStandard(data: any) {
    const url = '/api/MasterPayrollStandardFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

/**
 * Get Month List for dropdowns
 * GET /api/MasterDropDown/GetMonths
 */
export async function getMonthDropdown() {
    const url = '/api/MasterDropDown/GetMonths';
    return await api.get<IMonthDropdown[]>('hrms', url);
}
