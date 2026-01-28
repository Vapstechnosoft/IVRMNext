'use server';

import { revalidatePath } from 'next/cache';

// --- Interfaces ---

export interface IMess {
    hlmM_Id: number;
    hlmM_Name: string;
    hlmM_VegFlg: boolean;
    hlmM_NonVegFlg: boolean;
    hlmM_BFSStartTime: string | null;
    hlmM_BFSEndTime: string | null;
    hlmM_LNStartTime: string | null;
    hlmM_LNEndTime: string | null;
    hlmM_LNTSStartTime: string | null;
    hlmM_LNTSEndTime: string | null;
    hlmM_DNSStartTime: string | null;
    hlmM_DNSEndTime: string | null;
    hlmM_ActiveFlag: boolean;
}

// --- Mock Data ---

const MOCK_MESSES: IMess[] = [
    {
        hlmM_Id: 1,
        hlmM_Name: 'Central Mess',
        hlmM_VegFlg: true,
        hlmM_NonVegFlg: true,
        hlmM_BFSStartTime: '08:00',
        hlmM_BFSEndTime: '09:30',
        hlmM_LNStartTime: '12:30',
        hlmM_LNEndTime: '14:00',
        hlmM_LNTSStartTime: '16:30',
        hlmM_LNTSEndTime: '17:30',
        hlmM_DNSStartTime: '19:30',
        hlmM_DNSEndTime: '21:00',
        hlmM_ActiveFlag: true
    }
];

// --- Actions ---

export async function fetchMessData() {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        success: true,
        data: {
            messList: MOCK_MESSES
        }
    };
}

export async function saveMess(data: any) {
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const isUpdate = !!data.hlmM_Id;
        
        const newMess: IMess = {
            hlmM_Id: data.hlmM_Id || Math.floor(Math.random() * 100000),
            hlmM_Name: data.hlmM_Name,
            hlmM_VegFlg: !!data.hlmM_VegFlg,
            hlmM_NonVegFlg: !!data.hlmM_NonVegFlg,
            hlmM_BFSStartTime: data.hlmM_BFSStartTime || null,
            hlmM_BFSEndTime: data.hlmM_BFSEndTime || null,
            hlmM_LNStartTime: data.hlmM_LNStartTime || null,
            hlmM_LNEndTime: data.hlmM_LNEndTime || null,
            hlmM_LNTSStartTime: data.hlmM_LNTSStartTime || null,
            hlmM_LNTSEndTime: data.hlmM_LNTSEndTime || null,
            hlmM_DNSStartTime: data.hlmM_DNSStartTime || null,
            hlmM_DNSEndTime: data.hlmM_DNSEndTime || null,
            hlmM_ActiveFlag: true
        };

        if (isUpdate) {
            const index = MOCK_MESSES.findIndex(m => m.hlmM_Id === Number(data.hlmM_Id));
            if (index !== -1) {
                MOCK_MESSES[index] = { ...MOCK_MESSES[index], ...newMess };
                revalidatePath('/hostel/masters/master-mess');
                return { success: true, message: 'Mess updated successfully' };
            }
            return { success: false, message: 'Mess not found' };
        } else {
            MOCK_MESSES.push(newMess);
            revalidatePath('/hostel/masters/master-mess');
            return { success: true, message: 'Mess saved successfully' };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to save mess' };
    }
}

export async function deleteMess(id: number) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_MESSES.findIndex(m => m.hlmM_Id === id);
    if (index !== -1) {
        const mess = MOCK_MESSES[index];
        mess.hlmM_ActiveFlag = !mess.hlmM_ActiveFlag;
        revalidatePath('/hostel/masters/master-mess');
        return { success: true, message: `Mess ${mess.hlmM_ActiveFlag ? 'activated' : 'deactivated'} successfully` };
    }
    return { success: false, message: 'Mess not found' };
}
