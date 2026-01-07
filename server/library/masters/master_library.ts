'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterLibraryList } from '@/types/library/masters/masters';

export async function getMasterLibraryList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lmaL_LibraryName');
    const url = `/MasterLibrary/get-master-library-list?${urlParams}`;
    return await api.get<IMasterLibraryList[]>('library', url);
}

export async function addOrUpdateMasterLibrary(data: any) {
    const url = '/MasterLibrary/add-or-update/';
    return await api.post<any>('library', url, data);
}

export async function toggleMasterLibrary(id: number) {
    const url = `/MasterLibrary/deactivate/${id}`;
    return await api.put('library', url);
}

export async function deleteMasterLibrary(id: number) {
    const url = `/MasterLibrary/toggle-master-library?id=${id}`;
    return await api.delete('fees', url);
}
