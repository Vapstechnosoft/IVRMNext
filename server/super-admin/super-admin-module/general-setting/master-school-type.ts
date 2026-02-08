'use server';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

const FACADE_URL = '/MasterSchoolTypeFacade';

export async function getOnLoadData() {
    const url = `${FACADE_URL}/getdetails`;
    try {
        const response = await api.get<any>('sadmin', url);
        return response;
    } catch (error) {
        console.error("Error fetching onload data:", error);
        return {
            success: false,
            message: "Failed to fetch data",
            data: {},
        };
    }
}

export async function saveMasterSchoolType(data: any) {
    const url = `${FACADE_URL}/savedata`;
    try {
        const response = await api.post('sadmin', url, data);
        if (response.success) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-school-type');
        }
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to save data",
            error: error
        };
    }
}

export async function deleteMasterSchoolType(data: any) {
    const url = `${FACADE_URL}/delete_record`;
    try {
        const response = await api.post('sadmin', url, data);
        if (response.success) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-school-type');
        }
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete data",
        };
    }
}
