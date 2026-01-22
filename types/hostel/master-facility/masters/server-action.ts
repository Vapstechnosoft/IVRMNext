'use server';

import { type ApiResponse } from '@/lib/apiService';
import { IMasterFacility } from '@/schemas/hostel/masters';
import { revalidatePath } from 'next/cache';

// Mock data store
const masterFacilities: IMasterFacility[] = [
    {
        hlmftY_Id: 1,
        hlmftY_FacilityName: 'Library',
        hlmftY_FacilityDesc: '24/7 Access',
        hlmftY_ActiveFlag: true
    },
    {
        hlmftY_Id: 2,
        hlmftY_FacilityName: 'Gym',
        hlmftY_FacilityDesc: 'Equipped with modern machines',
        hlmftY_ActiveFlag: true
    }
];

export async function fetchMasterFacilityData(searchParams: { [key: string]: string | string[] | undefined }) {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        success: true,
        message: 'Data fetched successfully',
        data: masterFacilities,
        total: masterFacilities.length
    };
}

export async function saveMasterFacility(data: IMasterFacility) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
        if (data.hlmftY_Id) {
            // Update
            const index = masterFacilities.findIndex((f) => f.hlmftY_Id === data.hlmftY_Id);
            if (index !== -1) {
                masterFacilities[index] = { ...data };
                revalidatePath('/hostel/master-facility');
                return { success: true, message: 'Facility updated successfully' };
            }
            return { success: false, message: 'Facility not found' };
        } else {
            // Create
            const newId = (masterFacilities.length > 0 ? Math.max(...masterFacilities.map(f => f.hlmftY_Id || 0)) : 0) + 1;
            masterFacilities.push({ ...data, hlmftY_Id: newId });
            revalidatePath('/hostel/master-facility');
            return { success: true, message: 'Facility saved successfully' };
        }
    } catch (error) {
        return { success: false, message: 'Failed to save facility' };
    }
}

export async function deleteMasterFacility(id: number) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = masterFacilities.findIndex((f) => f.hlmftY_Id === id);
    if (index !== -1) {
        // Toggle Active/Inactive
        masterFacilities[index].hlmftY_ActiveFlag = !masterFacilities[index].hlmftY_ActiveFlag;
        revalidatePath('/hostel/master-facility');
        const status = masterFacilities[index].hlmftY_ActiveFlag ? 'activated' : 'deactivated';
        return { success: true, message: `Facility ${status} successfully` };
    }
    return { success: false, message: 'Facility not found' };
}
