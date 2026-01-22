'use server';

import { api } from '@/lib/apiService';
import { masterMainMenuSchema } from '@/schemas/super-admin/super-admin-module/general-setting/master-main-menu';
import { IMasterMainMenu, IModuleDropdownItem } from '@/types/super-admin/super-admin-module/general-setting/master-main-menu';
import { revalidatePath } from 'next/cache';

const FACADE_URL = '/MasterMainMenuFacade';

export async function getMasterMainMenuData() {
    // URL provided by user
    const url = `${FACADE_URL}/get_onload_grid_master_main_menu`;
    try {
        const response = await api.get<IMasterMainMenu[]>('sadmin', url);
        return response;
    } catch (error) {
        console.error("Error fetching Master Main Menu data:", error);
        return {
            success: false,
            message: "Failed to fetch data",
            data: [],
        };
    }
}

export async function saveMasterMainMenu(data: any) {
    const validation = masterMainMenuSchema.safeParse(data);

    if (!validation.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validation.error.flatten().fieldErrors,
        };
    }

    // URL provided by user
    const url = `${FACADE_URL}/savedata`;

    try {
        const response = await api.post('sadmin', url, data);
        if (response.success) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-main-menu');
        }
        return response;
    } catch (error) {
        return {
            success: false,
            message: 'Failed to save data',
            error: error
        };
    }
}

export async function deleteMasterMainMenu(id: number) {
    try {
        const response = await api.post('sadmin', `${FACADE_URL}/delete_master_main_menu/${id}`, {});
        if (response.success) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-main-menu');
        }
        return response;
    } catch (error) {
        return {
            success: false,
            message: 'Failed to delete data',
        };
    }
}

export async function getModuleDropdown() {
    const url = `${FACADE_URL}/get_module_drop_down`;
    try {
        const response = await api.get<IModuleDropdownItem[]>('sadmin', url);
        return response;
    } catch (error) {
        console.error("Error fetching Module Dropdown:", error);
        return {
            success: false,
            message: "Failed to fetch module dropdown",
            data: [],
        };
    }
}

export async function getMasterMainMenuDetails(id: number) {
    const url = `${FACADE_URL}/get_edit_detailsby_id/${id}`;
    try {
        const response = await api.get<any>('sadmin', url);
        return response;
    } catch (error) {
        console.error("Error fetching Master Main Menu details:", error);
        return {
            success: false,
            message: "Failed to fetch details",
        };
    }
}
