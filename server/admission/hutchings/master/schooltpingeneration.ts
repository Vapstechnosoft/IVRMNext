'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches the initial details (Academic Year List) for the School Tpin Generation.
 */
export async function getSchoolTpinGenerationInitialDetails() {
    const url = '/SchoolTpinGenreation/loaddata/1';
    return await api.get<any>('admission', url);
}

/**
 * Searches for Tpin generated and not generated student lists.
 */
export async function searchSchoolTpinGeneration(data: {
    ASMAY_Id: number;
}) {
    const url = `/SchoolTpinGenreation/search`;
    return await api.post<any>('admission', url, data);
}

/**
 * Generates Tpin for the selected Academic Year.
 */
export async function generateSchoolTpin(data: {
    ASMAY_Id: number;
}) {
    const url = `/SchoolTpinGenreation/generatetpin`;
    return await api.post<any>('admission', url, data);
}
