'use server';

import { api } from '@/lib/apiService';

export async function getDashboardCounts() {
    try {
        const url = '/configuration/dashboard';
        return await api.get('preadmission', url);
    } catch(err) {
        console.error('getDashboardCounts Error', err);
        return { success: false, data: [] };
    }
}

export async function  GetChairmanDashBoardFeesdata(ASMAY_ID:number){
    try {
        const url = `/FeesCommon/GetChairmanDashBoardFeesdata?ASMAY_ID=${ASMAY_ID}`
        // Try with standard path, if it fails backend will be logged
        return await api.get('fees', url);
    } catch(err) {
        console.error('GetChairmanDashBoardFeesdata Error', err);
        return { success: false, data: [] };
    }
}