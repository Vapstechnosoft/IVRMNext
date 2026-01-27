'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IInvMasterSupplier } from '@/types/inventory/masters/inv-master-supplier';

export async function getInvMasterSupplier(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterSupplier/getloaddata?${urlParams}`;

    try {
        const response = await api.get<{ get_supplier: IInvMasterSupplier[] }>('inventory', url);

        if (response.success && response.data && response.data.get_supplier && response.data.get_supplier.length > 0) {
            return response;
        }

        // Return 20 rows of dummy data if API data is empty
        let dummySuppliers: IInvMasterSupplier[] = Array.from({ length: 20 }, (_, i) => ({
            invmS_Id: i + 1,
            invmS_SupplierName: `Supplier ${String.fromCharCode(65 + (i % 26))} - ${i + 1}`,
            invmS_SupplierCode: `SUP${1000 + i}`,
            invmS_SupplierConatctPerson: `Contact Person ${i + 1}`,
            invmS_SupplierConatctNo: `98765432${(10 + i).toString().slice(-2)}`,
            invmS_EmailId: `supplier${i + 1}@example.com`,
            invmS_GSTNo: `GSTIN${1000 + i}Z${i % 9}`,
            invmS_SupplierAddress: `Address ${i + 1}, Commercial Zone, Street ${10 + i}`,
            invmS_ActiveFlg: i % 5 !== 0
        }));

        // Apply Search
        const search = searchParams?.search_query?.toString().toLowerCase();
        if (search) {
            dummySuppliers = dummySuppliers.filter(item =>
                item.invmS_SupplierName.toLowerCase().includes(search) ||
                item.invmS_SupplierCode?.toLowerCase().includes(search) ||
                item.invmS_SupplierConatctNo.toLowerCase().includes(search) ||
                item.invmS_EmailId.toLowerCase().includes(search)
            );
        }

        const totalItems = dummySuppliers.length;

        // Apply Pagination
        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const startIndex = (page - 1) * pageSize;
        dummySuppliers = dummySuppliers.slice(startIndex, startIndex + pageSize);

        return {
            success: true,
            message: 'Data fetched successfully (Expanded Dummy Data)!!',
            data: {
                get_supplier: dummySuppliers,
                total: totalItems
            }
        } as any;
    } catch (error) {
        console.error('Error fetching Supplier data:', error);

        // Error fallback with dummy data
        let dummySuppliers: IInvMasterSupplier[] = Array.from({ length: 20 }, (_, i) => ({
            invmS_Id: i + 1,
            invmS_SupplierName: `Supplier ${String.fromCharCode(65 + (i % 26))} - ${i + 1} (EF)`,
            invmS_SupplierCode: `SUP${1000 + i}`,
            invmS_SupplierConatctPerson: `Contact Person ${i + 1}`,
            invmS_SupplierConatctNo: `98765432${(10 + i).toString().slice(-2)}`,
            invmS_EmailId: `supplier${i + 1}@example.com`,
            invmS_GSTNo: `GSTIN${1000 + i}Z${i % 9}`,
            invmS_SupplierAddress: `Address ${i + 1}, Commercial Zone, Street ${10 + i}`,
            invmS_ActiveFlg: i % 5 !== 0
        }));

        const search = searchParams?.search_query?.toString().toLowerCase();
        if (search) {
            dummySuppliers = dummySuppliers.filter(item =>
                item.invmS_SupplierName.toLowerCase().includes(search) ||
                item.invmS_SupplierCode?.toLowerCase().includes(search)
            );
        }

        const totalItems = dummySuppliers.length;
        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const startIndex = (page - 1) * pageSize;
        dummySuppliers = dummySuppliers.slice(startIndex, startIndex + pageSize);

        return {
            success: true,
            message: 'Data fetched successfully (Expanded Dummy Data - Error Fallback)!!',
            data: {
                get_supplier: dummySuppliers,
                total: totalItems
            }
        } as any;
    }
}

export async function saveInvMasterSupplier(data: any) {
    const url = `/INV_MasterSupplier/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvMasterSupplier(data: IInvMasterSupplier) {
    const url = `/INV_MasterSupplier/deactive`;
    return await api.post<any>('inventory', url, data);
}
