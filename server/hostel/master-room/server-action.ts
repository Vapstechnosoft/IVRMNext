'use server';

import { revalidatePath } from 'next/cache';

// --- Interfaces ---

export interface IRoom {
    hrmrM_Id: number;
    hlmH_Id: number;
    hlmF_Id: number;
    hlmrcA_Id: number;
    hrmrM_RoomNo: string;
    hrmrM_BedCapacity: number;
    hrmrM_RoomDesc?: string;
    hrmrM_ACFlg: boolean;
    hrmrM_SharingFlg: boolean;
    hrmrM_RoomForStudentFlg: boolean;
    hrmrM_RoomForStaffFlg: boolean;
    hrmrM_RoomForGuestFlg: boolean;
    hrmrM_ActiveFlag: boolean;
    facilities: number[];
}

export interface IRoomDisplay extends IRoom {
    hlmH_Name: string;
    hrmF_FloorName: string;
    hlmrcA_RoomCategory: string;
    mappedFacilities?: IFacility[];
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

export interface IRoomCategory {
    hlmrcA_Id: number;
    hlmrcA_RoomCategory: string;
    hlmF_Id: number; // Assuming linked to floor or hostel, but usually independent? User req says dependent on floor? 
    // Wait, the user code has `categorydetails` which suggests it might just be a list, but the user plan said dependent.
    // Looking at the AngularJS code: `Floor()` loads `room_catlist`. So Category is likely fetched based on Hostel/Floor.
    // Actually in `HS_Master/floor` it returns `room_catlist`.
}

export interface IFacility {
    hlmftY_Id: number;
    hlmftY_FacilityName: string;
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

const MOCK_ROOM_CATEGORIES: IRoomCategory[] = [
    { hlmrcA_Id: 1, hlmrcA_RoomCategory: 'Standard', hlmF_Id: 1 },
    { hlmrcA_Id: 2, hlmrcA_RoomCategory: 'Deluxe', hlmF_Id: 1 },
    { hlmrcA_Id: 3, hlmrcA_RoomCategory: 'Standard', hlmF_Id: 2 },
    { hlmrcA_Id: 4, hlmrcA_RoomCategory: 'Suite', hlmF_Id: 3 },
];

const MOCK_FACILITIES: IFacility[] = [
    { hlmftY_Id: 1, hlmftY_FacilityName: 'Table' },
    { hlmftY_Id: 2, hlmftY_FacilityName: 'Chair' },
    { hlmftY_Id: 3, hlmftY_FacilityName: 'Fan' },
    { hlmftY_Id: 4, hlmftY_FacilityName: 'Cupboard' },
];

let MOCK_ROOMS: IRoom[] = [
    {
        hrmrM_Id: 1,
        hlmH_Id: 1,
        hlmF_Id: 1,
        hlmrcA_Id: 1,
        hrmrM_RoomNo: '101',
        hrmrM_BedCapacity: 2,
        hrmrM_RoomDesc: 'Near entrance',
        hrmrM_ACFlg: false,
        hrmrM_SharingFlg: true,
        hrmrM_RoomForStudentFlg: true,
        hrmrM_RoomForStaffFlg: false,
        hrmrM_RoomForGuestFlg: false,
        hrmrM_ActiveFlag: true,
        facilities: [1, 2, 3]
    }
];

// --- Actions ---

export async function fetchRoomData() {
    await new Promise(resolve => setTimeout(resolve, 500));

    const gridData: IRoomDisplay[] = MOCK_ROOMS.map(room => ({
        ...room,
        hlmH_Name: MOCK_HOSTELS.find(h => h.hlmH_Id === room.hlmH_Id)?.hlmH_Name || 'Unknown',
        hrmF_FloorName: MOCK_FLOORS.find(f => f.hlmF_Id === room.hlmF_Id)?.hrmF_FloorName || 'Unknown',
        hlmrcA_RoomCategory: MOCK_ROOM_CATEGORIES.find(c => c.hlmrcA_Id === room.hlmrcA_Id)?.hlmrcA_RoomCategory || 'Unknown',
        mappedFacilities: room.facilities.map(fid => MOCK_FACILITIES.find(f => f.hlmftY_Id === fid)).filter((f): f is IFacility => !!f)
    }));

    return {
        success: true,
        data: {
            hostels: MOCK_HOSTELS,
            facilities: MOCK_FACILITIES,
            roomList: gridData
        }
    };
}

export async function fetchFloors(hostelId: number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const floors = MOCK_FLOORS.filter(f => f.hlmH_Id === hostelId);
    // In real app, might also fetch categories here if they depend on hostel?
    // But assume categories depend on floor or just general list filtered?
    // User code: `Floor()` calls `HS_Master/floor` which returns `floor_list` and `room_catlist`.
    // So I'll return categories too, assume they are filtered by hostel in backend or just all available for that hostel structure?
    // I'll return all categories for now or filter if I add hlmH_Id to categories.
    // Let's just return all mock categories for this demo or mock filter.
    const categories = MOCK_ROOM_CATEGORIES; 
    return { floors, categories };
}

export async function fetchRoomCategories(floorId: number) {
     await new Promise(resolve => setTimeout(resolve, 300));
    // Implementation for specificity if needed
    const categories = MOCK_ROOM_CATEGORIES.filter(c => c.hlmF_Id === floorId); 
    // Note: The user's angular code fetched categories on Floor change? No, `Floor()` fetched `room_catlist`.
    // Then `Floordetails()` (on floor change) fetched `facilities_list`.
    // So: Hostel Change -> Fetch Floors & Categories.
    // Floor Change -> Fetch Facilities (but facilities might be global or room specific? User code `HS_Master/floordetails` returns facilities).
    // I'll stick to passing facilities globally for simplicity unless requested otherwise, but the user code does `get_Roomloaddata` 
    // which gets `facilities_list` commented out? And `Floordetails` gets them.
    // I'll keep facilities global in `fetchRoomData` for now as it's easier for the multiselect.
    
    // Actually the user code:
    // `Floor()` -> `floor_list`, `room_catlist`.
    // `Floordetails()` -> `facilities_list`.
    
    // I will simulate this behavior.
    return { categories };
}

export async function saveRoom(data: any) {
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const isUpdate = !!data.hrmrM_Id;
        
        const newRoom: IRoom = {
            hrmrM_Id: data.hrmrM_Id || Math.floor(Math.random() * 100000),
            hlmH_Id: Number(data.hlmH_Id),
            hlmF_Id: Number(data.hlmF_Id),
            hlmrcA_Id: Number(data.hlmrcA_Id),
            hrmrM_RoomNo: data.hrmrM_RoomNo,
            hrmrM_BedCapacity: Number(data.hrmrM_BedCapacity),
            hrmrM_RoomDesc: data.hrmrM_RoomDesc,
            hrmrM_ACFlg: data.hrmrM_ACFlg,
            hrmrM_SharingFlg: data.hrmrM_SharingFlg,
            hrmrM_RoomForStudentFlg: data.hrmrM_RoomForStudentFlg,
            hrmrM_RoomForStaffFlg: data.hrmrM_RoomForStaffFlg,
            hrmrM_RoomForGuestFlg: data.hrmrM_RoomForGuestFlg,
            hrmrM_ActiveFlag: true,
            facilities: data.facilities
        };

        if (isUpdate) {
            const index = MOCK_ROOMS.findIndex(r => r.hrmrM_Id === Number(data.hrmrM_Id));
            if (index !== -1) {
                MOCK_ROOMS[index] = { ...MOCK_ROOMS[index], ...newRoom };
                revalidatePath('/hostel/master-room');
                return { success: true, message: 'Room updated successfully' };
            }
            return { success: false, message: 'Room not found' };
        } else {
            MOCK_ROOMS.push(newRoom);
            revalidatePath('/hostel/master-room');
            return { success: true, message: 'Room saved successfully' };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to save room' };
    }
}

export async function deleteRoom(id: number) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_ROOMS.findIndex(r => r.hrmrM_Id === id);
    if (index !== -1) {
        const room = MOCK_ROOMS[index];
        room.hrmrM_ActiveFlag = !room.hrmrM_ActiveFlag;
        revalidatePath('/hostel/master-room');
        return { success: true, message: `Room ${room.hrmrM_ActiveFlag ? 'activated' : 'deactivated'} successfully` };
    }
    return { success: false, message: 'Room not found' };
}
