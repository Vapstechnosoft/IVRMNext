'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

export async function getDashboardCounts() {
    try {
        const url = '/configuration/dashboard';
        return await api.get('preadmission', url);
    } catch (err) {
        console.error('getDashboardCounts Error', err);
        return { success: false, data: [] };
    }
}

export async function GetChairmanDashBoardFeesdata(ASMAY_ID?: number) {
    try {
        let activeAsmayId = ASMAY_ID;
        if (!activeAsmayId || activeAsmayId === 0) {
            const session = await auth();
            activeAsmayId = session?.asmay_id || (session as any)?.user?.asmay_id || 231;
        }
        const url = `/FeesCommon/GetChairmanDashBoardFeesdata?ASMAY_ID=${activeAsmayId}`;
        // Try with standard path, if it fails backend will be logged
        return await api.get('fees', url);
    } catch (err) {
        console.error('GetChairmanDashBoardFeesdata Error', err);
        return { success: false, data: [] };
    }
}

export async function GetTeacherCount(mi_id?: number) {
    try {
        let activeMiId = mi_id;
        if (!activeMiId || activeMiId === 0) {
            const session = await auth();
            activeMiId = session?.mi_id || (session as any)?.user?.mi_id || 2;
        }
        const url = `/api/MasterDropDown/get_today_employee_punch_counts?MI_Id=${activeMiId}`;
        return await api.get('hmslms', url);
    } catch (err) {
        console.error('GetTeacherCount Error', err);
        return { success: false, data: [] };
    }
}
