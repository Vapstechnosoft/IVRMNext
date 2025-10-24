'use server';

import type { IYearlyCategoryDatesMapping } from '@/app/(root)/Exam/exam-module/exam-mapping/yearly-category-dates-mapping/_components/columns';
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getYearlyCategoryDatesMapping(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `yearly_category_dates_mapping/30?${urlParams}`;
    const response = await api.get<IYearlyCategoryDatesMapping>('exam', url);

    return {
        ...response
    };
}

export async function addOrUpdateYearlyCategoryDatesMapping(data: any) {
    const url = '/yearly_category_dates_mapping';
    return await api.post<any>('exam', url, data);
}
