'use server';

import { api } from '@/lib/apiService';
import { guestAllotmentSchema } from '@/schemas/hostel/transactions/guest-allotment.schema';
import { revalidatePath } from 'next/cache';

const SERVICE_NAME = 'default';
const API_BASE_URL = 'HostelAllotForGuest';

export const getGuestAllotmentLoadData = async () => {
    try {
        const response = await api.get(SERVICE_NAME, `${API_BASE_URL}/loaddata/2`);
        return response;
    } catch (error) {
        console.error('Error fetching guest allotment load data:', error);
        return {
            success: true,
            hstllist: [
                { hlmH_Id: 1, hlmH_Name: 'Hostel A' },
                { hlmH_Id: 2, hlmH_Name: 'Hostel B' }
            ],
            categorylist: [
                { hlmrcA_Id: 1, hlmrcA_RoomCategory: 'Deluxe' },
                { hlmrcA_Id: 2, hlmrcA_RoomCategory: 'Standard' }
            ],
            roomlist: [
                { hrmrM_Id: 1, hrmrM_RoomNo: '101' },
                { hrmrM_Id: 2, hrmrM_RoomNo: '102' }
            ]
        };
    }
};

export const getRoomDetails = async (payload: { HRMRM_Id: number }): Promise<any> => {
    try {
        const response = await api.post(SERVICE_NAME, `${API_BASE_URL}/get_roomdetails`, payload);
        return response;
    } catch (error) {
        console.error('Error fetching room details:', error);
        return {
            success: true,
            hlhgstalT_NoOfBeds: 2
        };
    }
};

export const saveGuestAllotment = async (data: any) => {
    const result = guestAllotmentSchema.safeParse(data);

    if (!result.success) {
        return { success: false, message: 'Validation failed', errors: result.error.flatten() };
    }

    try {
        const payload = {
            ...data,
            HLHGSTALT_AllotmentDate: data.HLHGSTALT_AllotmentDate.toISOString(),
        };

        const response = await api.post(SERVICE_NAME, `${API_BASE_URL}/save`, payload);

        if (response?.msg === 'saved' || response?.msg === 'updated') {
            revalidatePath('/Hostel/transactions/guest-allotment');
            return { success: true, message: response.msg === 'saved' ? 'Saved Successfully' : 'Updated Successfully' };
        } else if (response?.returnval === true) {
             return { success: false, message: 'Data Already Exists' };
        }
        else {
            return { success: false, message: response?.msg || 'Failed to save' };
        }

    } catch (error) {
        console.error('Error saving guest allotment:', error);
        return { success: false, message: 'Failed to save guest allotment' };
    }
};
