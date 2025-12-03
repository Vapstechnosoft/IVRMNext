'use server';

import { api } from '@/lib/apiService';
import type { FeeConcessionTermDropdown, IFeeConcessionAcademicyearDropDownList } from '@/types/fees/transactions/transactions';

export async function getConcessionTermDropdownData(mi_id: number) {
    const url = `FeeConcessionFacade/getterms/${mi_id}`;
    return await api.get<FeeConcessionTermDropdown[]>('fees', url);
}

export async function getConcessionAcademicDropdownData(miid: number) {
    const url = `/FeeConcessionFacade/getacademicyears/${miid}`;
    return await api.get<IFeeConcessionAcademicyearDropDownList[]>('fees', url);
}
