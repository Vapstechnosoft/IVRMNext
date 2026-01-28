'use server';

import { revalidatePath } from 'next/cache';

// --- Interfaces ---

export interface IBed {
    hlmB_Id: number;
    hlmH_Id: number;
    hlmF_Id: number;
    hrmrM_Id: number;
    hlmB_BedName: string;
    hlmB_MattressFlg: boolean;
    hlmB_BedSheetFlg: boolean;
    hlmB_PillowFlg: boolean;
    hlmB_StudyTableFlg: boolean;
    hlmB_LampFlg: boolean;
    hlmB_ActiveFlag: boolean;
}

export interface IBedDisplay extends IBed {
    hlmH_Name: string;
    hrmF_FloorName: string;
    hrmrM_RoomNo: string;
}

export interface IHostel {
    hlmH_Id: number;
    hlmH_Name: string;
}

export interface IFloor {
    hlmF_Id: number;
    hrmF_FloorName: string;
    hlmH_Id: number;
}

export interface IRoom {
    hrmrM_Id: number;
    hrmrM_RoomNo: string;
    hlmF_Id: number;
}

// --- Mock Data ---

const MOCK_HOSTELS: IHostel[] = [
    { hlmH_Id: 1, hlmH_Name: 'Main Hostel - Boys' },
    { hlmH_Id: 2, hlmH_Name: 'Main Hostel - Girls' },
];

const MOCK_FLOORS: IFloor[] = [
    { hlmF_Id: 1, hrmF_FloorName: 'Ground Floor', hlmH_Id: 1 },
    { hlmF_Id: 2, hrmF_FloorName: 'First Floor', hlmH_Id: 1 },
    { hlmF_Id: 3, hrmF_FloorName: 'Ground Floor', hlmH_Id: 2 },
];

const MOCK_ROOMS: IRoom[] = [
    { hrmrM_Id: 1, hrmrM_RoomNo: '101', hlmF_Id: 1 },
    { hrmrM_Id: 2, hrmrM_RoomNo: '102', hlmF_Id: 1 },
    { hrmrM_Id: 3, hrmrM_RoomNo: '201', hlmF_Id: 2 },
    { hrmrM_Id: 4, hrmrM_RoomNo: 'G-01', hlmF_Id: 3 },
];

let MOCK_BEDS: IBed[] = [
    {
        hlmB_Id: 1,
        hlmH_Id: 1,
        hlmF_Id: 1,
        hrmrM_Id: 1,
        hlmB_BedName: 'B1',
        hlmB_MattressFlg: true,
        hlmB_BedSheetFlg: true,
        hlmB_PillowFlg: true,
        hlmB_StudyTableFlg: false,
        hlmB_LampFlg: false,
        hlmB_ActiveFlag: true
    },
     {
        hlmB_Id: 2,
        hlmH_Id: 1,
        hlmF_Id: 1,
        hrmrM_Id: 1,
        hlmB_BedName: 'B2',
        hlmB_MattressFlg: true,
        hlmB_BedSheetFlg: true,
        hlmB_PillowFlg: true,
        hlmB_StudyTableFlg: true,
        hlmB_LampFlg: true,
        hlmB_ActiveFlag: true
    }
];

// --- Actions ---

export async function fetchBedData() {
    await new Promise(resolve => setTimeout(resolve, 500));

    const gridData: IBedDisplay[] = MOCK_BEDS.map(bed => ({
        ...bed,
        hlmH_Name: MOCK_HOSTELS.find(h => h.hlmH_Id === bed.hlmH_Id)?.hlmH_Name || 'Unknown',
        hrmF_FloorName: MOCK_FLOORS.find(f => f.hlmF_Id === bed.hlmF_Id)?.hrmF_FloorName || 'Unknown',
        hrmrM_RoomNo: MOCK_ROOMS.find(r => r.hrmrM_Id === bed.hrmrM_Id)?.hrmrM_RoomNo || 'Unknown'
    }));

    return {
        success: true,
        data: {
            hostels: MOCK_HOSTELS,
            bedList: gridData
        }
    };
}

export async function fetchFloors(hostelId: number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const floors = MOCK_FLOORS.filter(f => f.hlmH_Id === hostelId);
    return { floors };
}

export async function fetchRooms(floorId: number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const rooms = MOCK_ROOMS.filter(r => r.hlmF_Id === floorId);
    return { rooms };
}

export async function saveBed(data: any) {
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const isUpdate = !!data.HLMB_Id;
        
        const newBed: IBed = {
            hlmB_Id: data.HLMB_Id || Math.floor(Math.random() * 100000),
            hlmH_Id: Number(data.HLMH_Id),
            hlmF_Id: Number(data.HLMF_Id),
            hrmrM_Id: Number(data.HRMRM_Id),
            hlmB_BedName: data.HLMB_BedName,
            hlmB_MattressFlg: data.HLMB_MattressFlg,
            hlmB_BedSheetFlg: data.HLMB_BedSheetFlg,
            hlmB_PillowFlg: data.HLMB_PillowFlg,
            hlmB_StudyTableFlg: data.HLMB_StudyTableFlg,
            hlmB_LampFlg: data.HLMB_LampFlg,
            hlmB_ActiveFlag: true
        };

        if (isUpdate) {
            const index = MOCK_BEDS.findIndex(b => b.hlmB_Id === Number(data.HLMB_Id));
            if (index !== -1) {
                MOCK_BEDS[index] = { ...MOCK_BEDS[index], ...newBed };
                revalidatePath('/hostel/masters/master-bed');
                return { success: true, message: 'Bed updated successfully' };
            }
            return { success: false, message: 'Bed not found' };
        } else {
            MOCK_BEDS.push(newBed);
            revalidatePath('/hostel/masters/master-bed');
            return { success: true, message: 'Bed saved successfully' };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to save bed' };
    }
}

export async function deleteBed(id: number) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_BEDS.findIndex(b => b.hlmB_Id === id);
    if (index !== -1) {
        const bed = MOCK_BEDS[index];
        bed.hlmB_ActiveFlag = !bed.hlmB_ActiveFlag;
        revalidatePath('/hostel/masters/master-bed');
        return { success: true, message: `Bed ${bed.hlmB_ActiveFlag ? 'activated' : 'deactivated'} successfully` };
    }
    return { success: false, message: 'Bed not found' };
}
