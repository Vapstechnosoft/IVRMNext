'use server';

import { api } from '@/lib/apiService';
import { IModuleDropdownItem, IMainMenuDropdownItem, ISubMenuDropdownItem, IMasterMenuPageMappingDTO, IMasterPageItem } from '@/types/super-admin/super-admin-module/general-setting/master-menu-page-mapping';
import { revalidatePath } from 'next/cache';

const FACADE_URL = '/MasterMenuPageMappingFacade';

export async function getOnLoadData() {
    const url = `${FACADE_URL}/get_onload_data`;
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

export async function getMainMenuDropdown(moduleId: number) {
    const url = `${FACADE_URL}/get_main_menu_drop_down/${moduleId}`;
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

export async function getSubMenuDropdown(mainMenuId: number) {
    const url = `${FACADE_URL}/get_sub_menu_drop_down/${mainMenuId}`;
    try {
        const response = await api.get<ISubMenuDropdownItem[]>('sadmin', url);
        return response;
    } catch (error) {
        console.error("Error fetching Sub Menu Dropdown:", error);
        return {
            success: false,
            message: "Failed to fetch sub menu dropdown",
            data: [],
        };
    }
}

export async function saveMasterMenuPageMapping(data: any) {
    const url = `${FACADE_URL}/savedata`;
    try {
        const response = await api.post('sadmin', url, data);
        if (response.success) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-menu-page-mapping');
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

export async function deleteMasterMenuPageMapping(id: number) {
    const url = `${FACADE_URL}/delete_record/${id}`;
    try {
        const response = await api.post('sadmin', url, {});
        if (response.success) {
            revalidatePath('/SuperAdmin/super-admin-module/general-setting/master-menu-page-mapping');
        }
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete data",
        };
    }
}
