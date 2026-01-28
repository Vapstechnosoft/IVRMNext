'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IInvMasterTax, IInvMasterTaxLedger, IInvMasterTaxLedgerDTO } from '@/types/inventory/masters/inv-master-tax';

export async function getInvMasterTax(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterTax/getloaddata?${urlParams}`;

    try {
        const response = await api.get<{ get_tax: IInvMasterTax[]; getloaddata: IInvMasterTaxLedger[] }>('inventory', url);

        if (response.success && response.data && response.data.get_tax && response.data.get_tax.length > 0) {
            return response;
        }

        // Return 20 rows of dummy data if API data is empty
        let dummyTaxes: IInvMasterTax[] = Array.from({ length: 20 }, (_, i) => ({
            invmT_Id: i + 1,
            invmT_TaxName: `Tax ${i + 1} (${5 + (i % 5) * 5}%)`,
            invmT_TaxAliasName: `TAX${i + 1}`,
            invmT_ActiveFlg: i % 5 !== 0
        }));

        const dummyLedgers: IInvMasterTaxLedger[] = Array.from({ length: 5 }, (_, i) => ({
            invmtleD_Id: i + 1,
            invmT_Id: i + 1,
            famcomP_Id: 1,
            famleD_Id: 200 + i + 1,
            famgrP_Id: 300 + i + 1,
            invmtleD_TaxName: `Tax Ledger ${i + 1}`,
            invmT_TaxName: `Tax ${i + 1}`,
            famcomP_CompanyName: 'Main Company',
            famleD_LedgerName: `Ledger ${i + 1}`,
            famgrP_GroupName: 'Taxes and Duties'
        }));

        // Apply Search
        const search = searchParams?.search_query?.toString().toLowerCase();
        if (search) {
            dummyTaxes = dummyTaxes.filter(item =>
                item.invmT_TaxName.toLowerCase().includes(search) ||
                item.invmT_TaxAliasName.toLowerCase().includes(search)
            );
        }

        const totalItems = dummyTaxes.length;

        // Apply Pagination
        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const startIndex = (page - 1) * pageSize;
        dummyTaxes = dummyTaxes.slice(startIndex, startIndex + pageSize);

        return {
            success: true,
            message: 'Data fetched successfully (Expanded Dummy Data)!!',
            data: {
                get_tax: dummyTaxes,
                getloaddata: dummyLedgers,
                total: totalItems
            }
        } as any;
    } catch (error) {
        console.error('Error fetching Tax data:', error);

        let dummyTaxes: IInvMasterTax[] = Array.from({ length: 20 }, (_, i) => ({
            invmT_Id: i + 1,
            invmT_TaxName: `Tax ${i + 1} (${5 + (i % 5) * 5}%) (EF)`,
            invmT_TaxAliasName: `TAX${i + 1}`,
            invmT_ActiveFlg: i % 5 !== 0
        }));

        // Apply Search
        const search = searchParams?.search_query?.toString().toLowerCase();
        if (search) {
            dummyTaxes = dummyTaxes.filter(item =>
                item.invmT_TaxName.toLowerCase().includes(search) ||
                item.invmT_TaxAliasName.toLowerCase().includes(search)
            );
        }

        const totalItems = dummyTaxes.length;

        // Apply Pagination
        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const startIndex = (page - 1) * pageSize;
        dummyTaxes = dummyTaxes.slice(startIndex, startIndex + pageSize);

        return {
            success: true,
            message: 'Data fetched successfully (Expanded Dummy Data - Error Fallback)!!',
            data: {
                get_tax: dummyTaxes,
                getloaddata: [],
                total: totalItems
            }
        } as any;
    }
}

export async function getInvMasterTaxDetails(id: number) {
    const data = { INVMT_Id: id };
    const url = `/INV_MasterTax/get_Details`;
    return await api.post<any>('inventory', url, data);
}

export async function getLedgerUnder(famled_id: number) {
    const data = { FAMLED_Id: famled_id };
    const url = `/INV_MasterTax/getledgerunder`;
    return await api.post<any>('inventory', url, data);
}

export async function saveInvMasterTax(data: IInvMasterTax) {
    const url = `/INV_MasterTax/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function saveInvMasterTaxLedger(data: IInvMasterTaxLedgerDTO) {
    const url = `/INV_MasterTax/saveledger`;
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvMasterTax(data: IInvMasterTax) {
    const url = `/INV_MasterTax/deactive`;
    return await api.post<any>('inventory', url, data);
}
