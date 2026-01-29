'use server';

import { revalidatePath } from 'next/cache';

// Mock Data Interfaces
export interface IFloor {
  hlmF_Id: number;
  hlmH_Id: number;
  hrmF_FloorName: string;
  hrmF_TotalRooms?: number;
  hrmF_FloorDesc?: string;
  hrmF_ActiveFlag?: boolean;
  facilities?: number[]; // Array of Facility IDs
}

export interface IHostel {
  hlmH_Id: number;
  hlmH_Name: string;
}

export interface IFacility {
  hlmftY_Id: number;
  hlmftY_FacilityName: string;
}

// Mock Data
let MOCK_FLOORS: IFloor[] = [
  {
    hlmF_Id: 1,
    hlmH_Id: 1, // Matches 'Hostel A' in master-hostel mock
    hrmF_FloorName: 'Ground Floor',
    hrmF_TotalRooms: 10,
    hrmF_FloorDesc: 'Main entrance floor',
    hrmF_ActiveFlag: true,
    facilities: [1, 2] // Wifi, Laundry
  },
  {
    hlmF_Id: 2,
    hlmH_Id: 1,
    hrmF_FloorName: 'First Floor',
    hrmF_TotalRooms: 12,
    hrmF_FloorDesc: 'Student rooms',
    hrmF_ActiveFlag: true,
    facilities: [1] // Wifi only
  }
];

// Reusing Mocks from master-hostel logically, but defining simple arrays here for independence
const MOCK_HOSTELS: IHostel[] = [
  { hlmH_Id: 1, hlmH_Name: 'Hostel A' },
  { hlmH_Id: 2, hlmH_Name: 'Hostel B' },
  { hlmH_Id: 3, hlmH_Name: 'Hostel C' },
];

const MOCK_FACILITIES: IFacility[] = [
  { hlmftY_Id: 1, hlmftY_FacilityName: 'Wifi' },
  { hlmftY_Id: 2, hlmftY_FacilityName: '24/7 Water' },
  { hlmftY_Id: 3, hlmftY_FacilityName: 'Hot Water' },
  { hlmftY_Id: 4, hlmftY_FacilityName: 'Laundry' },
  { hlmftY_Id: 5, hlmftY_FacilityName: 'Generator' },
];

export interface IFloorDisplay extends IFloor {
  hlmH_Name: string;
}

export async function fetchFloorData() {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const floorList: IFloorDisplay[] = MOCK_FLOORS.map(floor => {
    const hostel = MOCK_HOSTELS.find(h => h.hlmH_Id === floor.hlmH_Id);
    return {
      ...floor,
      hlmH_Name: hostel ? hostel.hlmH_Name : 'Unknown Hostel'
    };
  });

  return {
    floorList,
    hostelList: MOCK_HOSTELS,
    facilityList: MOCK_FACILITIES
  };
}

export async function fetchMappedFacilities(floorId: number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const floor = MOCK_FLOORS.find(f => f.hlmF_Id === floorId);
    if (!floor) return [];

    const mapped = (floor.facilities || []).map(fid => MOCK_FACILITIES.find(f => f.hlmftY_Id === fid)).filter(Boolean) as IFacility[];
    return mapped;
}

export async function saveFloor(data: any) {
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const isUpdate = data.hlmF_Id && data.hlmF_Id > 0;
    
    // Validate duplicates (Mock logic: Check name within same hostel)
    const duplicate = MOCK_FLOORS.find(
      f => f.hrmF_FloorName.toLowerCase() === data.hrmF_FloorName.toLowerCase() 
           && f.hlmH_Id === Number(data.hlmH_Id)
           && f.hlmF_Id !== (data.hlmF_Id || 0)
    );

    if (duplicate) {
      return { success: false, message: 'Floor Name already exists in this Hostel' };
    }

    if (isUpdate) {
      MOCK_FLOORS = MOCK_FLOORS.map(f =>
        f.hlmF_Id === data.hlmF_Id ? { ...f, ...data, hlmH_Id: Number(data.hlmH_Id), hrmF_TotalRooms: Number(data.hrmF_TotalRooms) } : f
      );
    } else {
      const newId = Math.max(...MOCK_FLOORS.map(f => f.hlmF_Id), 0) + 1;
      MOCK_FLOORS.push({
        ...data,
        hlmF_Id: newId,
        hlmH_Id: Number(data.hlmH_Id),
        hrmF_TotalRooms: Number(data.hrmF_TotalRooms),
        hrmF_ActiveFlag: true
      });
    }

    revalidatePath('/hostel/master-floor');
    return { success: true, message: isUpdate ? 'Floor updated successfully' : 'Floor saved successfully' };
  } catch (error) {
    console.error('Save Error:', error);
    return { success: false, message: 'Failed to save floor' };
  }
}

export async function deleteFloor(id: number) {
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    MOCK_FLOORS = MOCK_FLOORS.map(f =>
      f.hlmF_Id === id ? { ...f, hrmF_ActiveFlag: !f.hrmF_ActiveFlag } : f
    );
    revalidatePath('/hostel/master-floor');
    return { success: true, message: 'Floor status updated successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to update status' };
  }
}
