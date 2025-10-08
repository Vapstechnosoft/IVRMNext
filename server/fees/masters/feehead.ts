'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeHeadsList } from '@/types/fees/masters';

export async function getfeehead(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeheadFacade/30?${urlParams}`;
    return await api.getArray<IFeeHeadsList>(url);
}

export async function addOrUpdateMasterfeehead(data: any) {
    const url = '/FeeheadFacade';
    return await api.post<any>(url, data);
}

export async function toggleMasterfeehead(mi_id: number, id: number) {
    const url = `/FeeheadFacade/deactivate/${id}`;
    return await api.put(url);
}

// export async function getfeehead(searchParams?: ApiSearchparams): Promise<ApiResponse<IFeeHeadsList[]>> {
//   const urlParams = getSearchParamsUrl(searchParams ?? {});
//   const url = `/FeeheadFacade/30?${urlParams}`;

//   // Fallback plain array (30 items)
//   const fallbackFeeHeads: IFeeHeadsList[] = Array.from({ length: 30 }, (_, i) => ({
//     fmH_Id: i + 1,
//     mI_Id: 100 + (i % 5),
//     fmH_FeeName: `Fee Head ${i + 1}`,
//     fmH_ActiveFlag: i % 2,
//   }));

//   try {
//     // api.getArray returns ApiResponse<{ $type: string, $values: IFeeHeadsList[] }>
//     const response = await api.getArray<IFeeHeadsList>(url);

//     if (response.data && Array.isArray(response.data)) {
//       // Unwrap $values and return as plain array in data
//       return {
//         ...response,
//         data: response.data,
//       };
//     } else {
//       console.warn("API returned invalid data, returning fallback");
//       return {
//         success: true,
//         message: "Fallback data returned due to invalid API response.",
//         data: fallbackFeeHeads,
//       };
//     }
//   } catch (error) {
//     console.error("API error, returning fallback", error);
//     return {
//       success: true,
//       message: "Fallback data returned due to API error.",
//       data: fallbackFeeHeads,
//     };
//   }
// }

// export async function addOrUpdateMasterCategory(data: any) {
//     const url = '/v1/master_category';
//     return await api.post<any>(url, data);
// }

// export async function toggleMasterCategory(mi_id: number, id: number) {
//     const url = `/v1/master_category/toggle/${mi_id}/${id}`;
//     return await api.put(url);
// }
