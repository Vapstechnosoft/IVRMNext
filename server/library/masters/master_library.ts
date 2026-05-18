'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterLibraryList } from '@/types/library/masters/masters';

import { auth } from '@/lib/auth';

export async function getMasterLibraryList(searchParams?: ApiSearchparams) {
    try {
        const session = await auth();
        const urlParams = getSearchParamsUrl({ ...searchParams, mI_Id: session?.mi_id }, 'lmaL_LibraryName');
        const url = `/MasterLibrary/get-master-library-list?${urlParams}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch library list', data: [] };
    }
}

export async function getMasterLibraryMappedClassList() {
    try {
        const session = await auth();
        const url = `/MasterLibrary/get-mapped-class-list?mI_Id=${session?.mi_id}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch mapping lists', data: [] };
    }
}

export async function getMasterLibraryById(id1: number, id2: number) {
    try {
        const url = `/MasterLibrary/master-library-by-id/${id1}/${id2}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch record details' };
    }
}

export async function addOrUpdateMasterLibrary(data: any) {
    try {
        const session = await auth();
        const payload = {
            ...data,
            MI_Id: session?.mi_id
        };
        const url = '/MasterLibrary/add-or-update/';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to save mapping' };
    }
}

export async function toggleMasterLibrary(LMAL_Id: number) {
    try {
        // Updated to use the specific endpoint requested by the user
        const url = `/MasterLibrary/toggle-master-library/${LMAL_Id}`;
        // Using PUT as it's common for status updates, but POST is also a possibility in VAPS. 
        // We'll keep it as PUT for now as it matches the previous implementation and follows REST standards.
        return await api.put('library', url, {});
    } catch (error: any) {
        console.error('Error in toggleMasterLibrary:', error);
        return { success: false, message: error?.message || 'Failed to toggle status' };
    }
}

export async function deleteMasterLibrary(id: number) {
    try {
        const url = `/MasterLibrary/toggle-master-library?id=${id}`;
        return await api.delete('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete record' };
    }
}

export async function getMasterLibraryEditClass(id: number) {
    try {
        const session = await auth();
        const url = `/MasterLibrary/EditClass?id=${id}&MI_Id=${session?.mi_id}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        console.error('Error in getMasterLibraryEditClass:', error);
        return { success: false, message: error?.message || 'Failed to fetch mapping details' };
    }
}

export async function getMasterLibraryEditStaff(id: number) {
    try {
        const session = await auth();
        const url = `/MasterLibrary/EditStaff?id=${id}&MI_Id=${session?.mi_id}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        console.error('Error in getMasterLibraryEditStaff:', error);
        return { success: false, message: error?.message || 'Failed to fetch mapping details' };
    }
}
