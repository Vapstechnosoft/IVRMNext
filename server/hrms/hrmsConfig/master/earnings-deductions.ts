'use server';
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IMasterEarningsDeductionsList,
    IEarningsDeductionsTypeDropdown,
    IRoundingTypeDropdown,
    IAmountOrPercentageDropdown,
    ISalaryComponentTypeDropdown
} from '@/types/hrms/hrms-config/master';

/**
 * Get basic data for master earnings deductions with search, sort, and pagination
 * GET /api/MasterEarningsDeductionsFacade/GetBasicData
 */
export async function getMasterEarningsDeductionsList(searchParams?: ApiSearchparams) {
    const searchableColumns = 'hrmeD_Name,hrmeD_EDTypeFlag,hrmeD_EarnDedFlag,hrmeD_AmountPercentFlag,hrmeD_RoundOffFlag';
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/MasterEarningsDeductionsFacade/GetBasicData?${urlParams}`;
    return await api.get<IMasterEarningsDeductionsList[]>('hrms', url);
}
/**
 * Save or Update master earnings deductions record
 * POST /api/MasterEarningsDeductionsFacade/SaveUpdate
 */
export async function saveMasterEarningsDeductions(data: any) {
    const url = '/api/MasterEarningsDeductionsFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}
/**
 * Toggle master earnings deductions record (activate/deactivate)
 * PUT /api/MasterEarningsDeductionsFacade/Deactivate/{id}
 * Returns the updated earnings deduction object
 */
export async function activateDeactivateMasterEarningsDeductions(id: number) {
    const url = `/api/MasterEarningsDeductionsFacade/toggle/${id}`;
    return await api.put<IMasterEarningsDeductionsList>('hrms', url);
}

/**
 * Get Earnings Deductions Type List for dropdowns
 * GET /api/MasterDropDown/GetEarningsDeductionsType
 */
export async function getEarningsDeductionsTypeDropdown() {
    const url = '/api/MasterDropDown/GetEarningsDeductionsType';
    return await api.get<IEarningsDeductionsTypeDropdown[]>('hrms', url);
}

/**
 * Get Rounding Type List for dropdowns
 * GET /api/MasterDropDown/GetRoundingType
 */
export async function getRoundingTypeDropdown() {
    const url = '/api/MasterDropDown/GetRoundingType';
    return await api.get<IRoundingTypeDropdown[]>('hrms', url);
}

/**
 * Get Amount Or Percentage List for dropdowns
 * GET /api/MasterDropDown/GetAmountOrPercentage
 */
export async function getAmountOrPercentageDropdown() {
    const url = '/api/MasterDropDown/GetAmountOrPercentage';
    return await api.get<IAmountOrPercentageDropdown[]>('hrms', url);
}

/**
 * Get Salary Component Type List for dropdowns
 * GET /api/MasterDropDown/GetSalaryComponentType
 */
export async function getSalaryComponentTypeDropdown() {
    const url = '/api/MasterDropDown/GetSalaryComponentType';
    return await api.get<ISalaryComponentTypeDropdown[]>('hrms', url);
}
