'use server';

import { api } from '@/lib/apiService';

export async function saveBankCopyData(data: any) {
    const url = '/FeeReceiptImportStthomas/fee-import-Savedata';
    return await api.post<any>('fees', url, data);
}
