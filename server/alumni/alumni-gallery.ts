'use server';

import { api } from '@/lib/apiService';
import type { IAlumniGallery } from '@/types/alumni/alumni-gallery';

export async function getAlumniGalleryData() {
    const url = '/Alumni_Gallery/getloaddata';
    return await api.get<{ get_galleryimg: IAlumniGallery[] }>('alumni', url);
}

export async function saveAlumniGallery(data: any) {
    const url = '/Alumni_Gallery';
    return await api.post('alumni', url, data);
}

export async function getCoverModelDetails(alga_Id: number) {
    const url = '/Alumni_Gallery/getcovermodel';
    return await api.post<{ view_galleryimg: any[] }>('alumni', url, { algA_Id: alga_Id, mI_Id: 30 });
}

export async function saveCoverPhoto(data: any) {
    const url = '/Alumni_Gallery/savecover';
    const payload = {
        ...data,
        mI_Id: 30
    };
    return await api.post('alumni', url, payload);
}

export async function toggleAlumniGalleryItem(alga_Id: number, algap_Id: number, algav_Id: number) {
    const url = `/Alumni_Gallery/toggle?ALGA_Id=${alga_Id}&ALGAP_Id=${algap_Id}&ALGAV_Id=${algav_Id}`;
    return await api.get('alumni', url);
}
