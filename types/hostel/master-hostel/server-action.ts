'use server';

import { revalidatePath } from 'next/cache';

// --- Types ---

export interface IHostel {
    hlmH_Id: number;
    hlmH_Name: string;
    hlmH_ContactNo: string;
    hlmH_TotalCapacity: number;
    hlmH_BoysGirlsFlg: 'Boys' | 'Girls';
    hlmH_Address: string;
    ivrmmC_Id: number;
    ivrmmS_Id: number;
    hlmH_City: string;
    hlmH_Pincode: number;
    hlmH_TotalFloor: number;
    hlmH_TotalRoom: number;
    hlmH_Desc?: string;
    hlmhW_WardenType?: string;
    hlmH_ActiveFlag: boolean;
    // Mapped IDs
    facilities: number[];
    wardens: number[];
    messes: number[];
    // Documents
    documents: IHostelDocument[];
    
    // Display properties (optional)
    mappedFacilities?: IFacility[];
    mappedWardens?: IEmployee[];
}

export interface IHostelDocument {
    hlmhP_Id?: number;
    hlmhP_FileName: string;
    hlmhP_FilePath: string;
    filetype?: string;
}

export interface IFacility {
    hlmftY_Id: number;
    hlmftY_FacilityName: string;
}

export interface IMess {
    hlmM_Id: number;
    hlmM_Name: string;
}

export interface IEmployee {
    hrmE_Id: number;
    hrmE_EmployeeFirstName: string;
    hrmE_EmployeeCode: string;
}

export interface ICountry {
    ivrmmC_Id: number;
    ivrmmC_CountryName: string;
}

export interface IState {
    ivrmmS_Id: number;
    ivrmmS_Name: string;
    ivrmmC_Id: number; // Linked to Country
}

// --- Mock Data ---

const MOCK_COUNTRIES: ICountry[] = [
    { ivrmmC_Id: 1, ivrmmC_CountryName: 'India' },
    { ivrmmC_Id: 2, ivrmmC_CountryName: 'USA' }
];

const MOCK_STATES: IState[] = [
    { ivrmmS_Id: 1, ivrmmS_Name: 'Karnataka', ivrmmC_Id: 1 },
    { ivrmmS_Id: 2, ivrmmS_Name: 'Maharashtra', ivrmmC_Id: 1 },
    { ivrmmS_Id: 3, ivrmmS_Name: 'California', ivrmmC_Id: 2 }
];

const MOCK_FACILITIES: IFacility[] = [
    { hlmftY_Id: 1, hlmftY_FacilityName: 'Library' },
    { hlmftY_Id: 2, hlmftY_FacilityName: 'Gym' },
    { hlmftY_Id: 3, hlmftY_FacilityName: 'WiFi' }
];

const MOCK_MESSES: IMess[] = [
    { hlmM_Id: 1, hlmM_Name: 'Veg Mess' },
    { hlmM_Id: 2, hlmM_Name: 'Non-Veg Mess' }
];

const MOCK_EMPLOYEES: IEmployee[] = [
    { hrmE_Id: 101, hrmE_EmployeeFirstName: 'John Doe', hrmE_EmployeeCode: 'EMP101' },
    { hrmE_Id: 102, hrmE_EmployeeFirstName: 'Jane Smith', hrmE_EmployeeCode: 'EMP102' }
];

const MOCK_HOSTELS: IHostel[] = [
    {
        hlmH_Id: 1,
        hlmH_Name: 'Main Hostel',
        hlmH_ContactNo: '9876543210',
        hlmH_TotalCapacity: 500,
        hlmH_BoysGirlsFlg: 'Boys',
        hlmH_Address: '123 Campus Road',
        ivrmmC_Id: 1,
        ivrmmS_Id: 1,
        hlmH_City: 'Bangalore',
        hlmH_Pincode: 560001,
        hlmH_TotalFloor: 5,
        hlmH_TotalRoom: 200,
        hlmH_Desc: 'New Block',
        hlmhW_WardenType: 'Resident',
        hlmH_ActiveFlag: true,
        facilities: [1, 3],
        wardens: [101],
        messes: [1],
        documents: []
    }
];

// --- Server Actions ---

export async function fetchHostelData() {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate latency

    // Format data for display if needed (e.g. resolving names)
    // For now we just return the raw mock data and let UI handle display or mapping
    // But typically the grid needs Country Name, State Name etc.
    
    const gridData = MOCK_HOSTELS.map(hostel => ({
        ...hostel,
        ivrmmC_CountryName: MOCK_COUNTRIES.find(c => c.ivrmmC_Id === hostel.ivrmmC_Id)?.ivrmmC_CountryName || '',
        ivrmmS_Name: MOCK_STATES.find(s => s.ivrmmS_Id === hostel.ivrmmS_Id)?.ivrmmS_Name || '',
        // Resolve joined lists for "View" modals
        mappedFacilities: hostel.facilities.map(fid => MOCK_FACILITIES.find(f => f.hlmftY_Id === fid)).filter(Boolean),
        mappedWardens: hostel.wardens.map(wid => MOCK_EMPLOYEES.find(e => e.hrmE_Id === wid)).filter(Boolean)
    }));

    return {
        success: true,
        message: 'Data fetched successfully',
        data: {
            hostelList: gridData,
            countries: MOCK_COUNTRIES,
            states: MOCK_STATES,
            facilities: MOCK_FACILITIES,
            messes: MOCK_MESSES,
            employees: MOCK_EMPLOYEES
        }
    };
}

export async function saveHostel(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    try {
        const isUpdate = !!data.hlmH_Id;
        
        const newHostel: IHostel = {
            hlmH_Id: data.hlmH_Id || Math.floor(Math.random() * 10000),
            hlmH_Name: data.hlmH_Name,
            hlmH_ContactNo: data.hlmH_ContactNo,
            hlmH_TotalCapacity: Number(data.hlmH_TotalCapacity),
            hlmH_BoysGirlsFlg: data.hlmH_BoysGirlsFlg,
            hlmH_Address: data.hlmH_Address,
            ivrmmC_Id: Number(data.ivrmmC_Id),
            ivrmmS_Id: Number(data.ivrmmS_Id),
            hlmH_City: data.hlmH_City,
            hlmH_Pincode: Number(data.hlmH_Pincode),
            hlmH_TotalFloor: Number(data.hlmH_TotalFloor),
            hlmH_TotalRoom: Number(data.hlmH_TotalRoom),
            hlmH_Desc: data.hlmH_Desc,
            hlmhW_WardenType: data.hlmhW_WardenType,
            hlmH_ActiveFlag: true, // Default to true on create
            facilities: data.facilities,
            wardens: data.wardens,
            messes: data.messes,
            documents: data.documents || []
        };

        if (isUpdate) {
            const index = MOCK_HOSTELS.findIndex(h => h.hlmH_Id === Number(data.hlmH_Id));
            if (index > -1) {
                MOCK_HOSTELS[index] = { ...MOCK_HOSTELS[index], ...newHostel };
                revalidatePath('/hostel/master-hostel');
                return { success: true, message: 'Hostel updated successfully' };
            }
            return { success: false, message: 'Hostel not found' };
        } else {
            MOCK_HOSTELS.push(newHostel);
            revalidatePath('/hostel/master-hostel');
            return { success: true, message: 'Hostel created successfully' };
        }
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to save hostel' };
    }
}

export async function deleteHostel(id: number) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = MOCK_HOSTELS.findIndex(h => h.hlmH_Id === id);
    if (index > -1) {
        MOCK_HOSTELS[index].hlmH_ActiveFlag = !MOCK_HOSTELS[index].hlmH_ActiveFlag;
        revalidatePath('/hostel/master-hostel');
        const status = MOCK_HOSTELS[index].hlmH_ActiveFlag ? 'activated' : 'deactivated';
        return { success: true, message: `Hostel ${status} successfully` };
    }
    return { success: false, message: 'Hostel not found' };
}
