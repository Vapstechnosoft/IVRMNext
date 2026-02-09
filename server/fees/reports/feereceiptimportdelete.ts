'use server';
import { api } from '@/lib/apiService';

export async function getFeeReceiptimportCommon(asmay_Id: number, date: string) {
    const url = `/FeesCommon/FeeReceiptImportDelete/${asmay_Id}/${date}`;
    return await api.get<any[]>('fees', url);
}
