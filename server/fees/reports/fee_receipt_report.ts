'use server';

import { api } from '@/lib/apiService';
import type { IFeeReceiptReportHeadDropdownList } from '@/types/fees/reports/reports';

export async function getFeeReceiptReportHeadDropdown() {
    const url = 'FeeSpecialHead/fee-special-head-dropdown';
    return await api.get<IFeeReceiptReportHeadDropdownList[]>('fees', url);
}
