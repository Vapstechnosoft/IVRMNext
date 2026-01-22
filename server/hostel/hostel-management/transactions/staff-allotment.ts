'use server';

import { api } from '@/lib/apiService';
import { staffAllotmentSchema } from '@/schemas/hostel/transactions/staff-allotment.schema';
import { revalidatePath } from 'next/cache';

const SERVICE_NAME = 'default';
const API_BASE_URL = 'HostelAllotForStaff';

export const getStaffAllotmentLoadData = async () => {
  try {
    const response = await api.get(SERVICE_NAME, `${API_BASE_URL}/loaddata/2`);
    return response;
  } catch (error) {
    console.error('Error fetching staff allotment load data:', error);
    return { success: false, message: 'Failed to fetch load data' };
  }
};

export const getStaffInfo = async (payload: { HLMH_Id: number }) => {
  try {
    const response = await api.post(SERVICE_NAME, `${API_BASE_URL}/get_studInfo`, payload);
    return response;
  } catch (error) {
    console.error('Error fetching staff info:', error);
    return { success: false, message: 'Failed to fetch staff info' };
  }
};

export const getRoomDetails = async (payload: { HRMRM_Id: number }) => {
  try {
    const response = await api.post(SERVICE_NAME, `${API_BASE_URL}/get_roomdetails`, payload);
    return response;
  } catch (error) {
    console.error('Error fetching room details:', error);
    return { success: false, message: 'Failed to fetch room details' };
  }
};

export const saveStaffAllotment = async (data: any) => {
  const result = staffAllotmentSchema.safeParse(data);

  if (!result.success) {
    return { success: false, message: 'Validation failed', errors: result.error.flatten() };
  }

  try {
    const payload = {
      ...data,
      HLHSTALT_AllotmentDate: data.HLHSTALT_AllotmentDate.toISOString(),
      // Ensure other fields are formatted if needed
    };

    const response = await api.post(SERVICE_NAME, `${API_BASE_URL}/savedata`, payload);
    
    if (response?.returnval === true) {
       revalidatePath('/Hostel/transactions/staff-allotment');
       return { success: true, message: response.message || 'Saved Successfully' };
    } else {
        return { success: false, message: response.message || 'Failed to populate' };
    }

  } catch (error) {
    console.error('Error saving staff allotment:', error);
    return { success: false, message: 'Failed to save staff allotment' };
  }
};
