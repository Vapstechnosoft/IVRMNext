'use server';

import { api } from '@/lib/apiService';
import type { IFeeInstallmentDropdownList } from '@/types/fees/reports/reports';

export async function getFeesInstallmentDropDown() {
    const url = '/FeesCommon/installment-dropdown';
    return await api.get<IFeeInstallmentDropdownList[]>('fees', url);
}
