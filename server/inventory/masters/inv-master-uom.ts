'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IInvMasterUOM } from '@/types/inventory/masters/inv-master-uom';

const DUMMY_UOMS: IInvMasterUOM[] = [
    { invmuoM_Id: 1, invmuoM_UOMName: 'Kilogram', invmuoM_UOMAliasName: 'KG', invmuoM_Qty: '1', invmuoM_ActiveFlg: true },
    { invmuoM_Id: 2, invmuoM_UOMName: 'Gram', invmuoM_UOMAliasName: 'GM', invmuoM_Qty: '1000', invmuoM_ActiveFlg: true },
    { invmuoM_Id: 3, invmuoM_UOMName: 'Liter', invmuoM_UOMAliasName: 'LTR', invmuoM_Qty: '1', invmuoM_ActiveFlg: true },
    { invmuoM_Id: 4, invmuoM_UOMName: 'Meter', invmuoM_UOMAliasName: 'M', invmuoM_Qty: '1', invmuoM_ActiveFlg: true },
    { invmuoM_Id: 5, invmuoM_UOMName: 'Number', invmuoM_UOMAliasName: 'NOS', invmuoM_Qty: '1', invmuoM_ActiveFlg: true },
    { invmuoM_Id: 6, invmuoM_UOMName: 'Milliliter', invmuoM_UOMAliasName: 'ML', invmuoM_Qty: '1000', invmuoM_ActiveFlg: true },
    { invmuoM_Id: 7, invmuoM_UOMName: 'Centimeter', invmuoM_UOMAliasName: 'CM', invmuoM_Qty: '100', invmuoM_ActiveFlg: true },
    { invmuoM_Id: 8, invmuoM_UOMName: 'Inch', invmuoM_UOMAliasName: 'IN', invmuoM_Qty: '1', invmuoM_ActiveFlg: true },
    { invmuoM_Id: 9, invmuoM_UOMName: 'Dozen', invmuoM_UOMAliasName: 'DZ', invmuoM_Qty: '12', invmuoM_ActiveFlg: true },
    { invmuoM_Id: 10, invmuoM_UOMName: 'Box', invmuoM_UOMAliasName: 'BX', invmuoM_Qty: '1', invmuoM_ActiveFlg: true },
];

export async function fetchInvMasterUOMData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterUOM/getloaddata?${urlParams}`;

    try {
        const response = await api.get<any>('inventory', url);
        if (response.success) {
            return response;
        }

        // Dummy Data Fallback
        return {
            success: true,
            message: 'Data fetched successfully (Dummy)',
            data: {
                get_uom: DUMMY_UOMS,
                total: DUMMY_UOMS.length
            }
        };
    } catch (error) {
        console.error('Error fetching Master UOM data:', error);
        return {
            success: true,
            message: 'Data fetched successfully (Dummy Fallback)',
            data: {
                get_uom: DUMMY_UOMS,
                total: DUMMY_UOMS.length
            }
        };
    }
}

export async function saveInvMasterUOM(data: any) {
    const url = `/INV_MasterUOM/savedetails`;
    // const response = await api.post<any>('inventory', url, data);
    // return response;

    // Simulated response
    return {
        returnval: true,
        invmuoM_Id: data.invmuoM_Id || 100,
        returnduplicatestatus: ''
    };
}

export async function deactivateInvMasterUOM(data: any) {
    const url = `/INV_MasterUOM/deactive`;
    // const response = await api.post<any>('inventory', url, data);
    // return response;

    // Simulated response
    return { returnval: true };
}
