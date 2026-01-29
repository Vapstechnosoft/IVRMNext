'use server';

import { api } from '@/lib/apiService';
import { masterSubMenuSchema } from '@/schemas/super-admin/super-admin-module/general-setting/master-sub-menu';
import { IMasterSubMenu, IModuleDropdownItem, IMainMenuDropdownItem } from '@/types/super-admin/super-admin-module/general-setting/master-sub-menu';
import { revalidatePath } from 'next/cache';

const FACADE_URL = '/MasterSubMenuFacade'; // Assumed FACADE URL based on convention

export async function getMasterSubMenuData() {
    const url = `${FACADE_URL}/get_onload_grid_master_sub_menu`; // Assumed endpoint
    try {
        const response = await api.get<IMasterSubMenu[]>('sadmin', url);
        return response;
    } catch (error) {
        console.error("Error fetching Master Sub Menu data:", error);
        return {
            success: false,
            message: "Failed to fetch data",
            data: [],
        };
    }
}

export async function saveMasterSubMenu(data: any) {
    const validation = masterSubMenuSchema.safeParse(data);

    if (!validation.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validation.error.flatten().fieldErrors,
        };
    }

    const url = `${FACADE_URL}/savedata`;

    try {
        const response = await api.post('sadmin', url, data);
        if (response.success) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-sub-menu');
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

export async function deleteMasterSubMenu(id: number) {
    try {
        const response = await api.post('sadmin', `${FACADE_URL}/delete_master_sub_menu/${id}`, {});
        if (response.success) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-sub-menu');
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

export async function getMainMenuDropdown(moduleId: number) {
    const url = `${FACADE_URL}/get_main_menu_drop_down/${moduleId}`; // Assumed endpoint pattern
    try {
        const response = await api.get<IMainMenuDropdownItem[]>('sadmin', url);
        return response;
    } catch (error) {
        console.error("Error fetching Main Menu Dropdown:", error);
        return {
            success: false,
            message: "Failed to fetch main menu dropdown",
            data: [],
        };
    }
}

export async function getMasterSubMenuDetails(id: number) {
    const url = `${FACADE_URL}/get_edit_detailsby_id/${id}`;
    try {
        const response = await api.get<any>('sadmin', url);
        return response;
    } catch (error) {
        console.error("Error fetching Master Sub Menu details:", error);
        return {
            success: false,
            message: "Failed to fetch details",
        };
    }
}
