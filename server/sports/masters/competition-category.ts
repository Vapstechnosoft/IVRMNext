'use server';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

const MOCK_DATA = [
    {
        SPCCMCC_Id: 1,
        SPCCMCC_CompitionCategory: 'Under 14 Boys',
        SPCCMCC_CCDesc: 'Under 14 Boys Criteria',
        SPCCMCC_CCAgeFlag: true,
        SPCCMCC_CCWeightFlag: false,
        SPCCMCC_FromCCAgeYear: 12,
        SPCCMCC_ToCCAgeYear: 14,
        SPCCMCC_FromCCAgeMonth: 0,
        SPCCMCC_ToCCAgeMonth: 0,
        SPCCMCC_FromCCAgeDays: 0,
        SPCCMCC_ToCCAgeDays: 0,
        SPCCMCC_ActiveFlag: true,
    },
    {
        SPCCMCC_Id: 2,
        SPCCMCC_CompitionCategory: 'Under 16 Girls',
        SPCCMCC_CCDesc: 'Under 16 Girls Criteria',
        SPCCMCC_CCAgeFlag: true,
        SPCCMCC_CCWeightFlag: true,
        SPCCMCC_CCWeight: 45,
        SPCCMCC_FromCCAgeYear: 14,
        SPCCMCC_ToCCAgeYear: 16,
        SPCCMCC_FromCCAgeMonth: 0,
        SPCCMCC_ToCCAgeMonth: 0,
        SPCCMCC_FromCCAgeDays: 0,
        SPCCMCC_ToCCAgeDays: 0,
        SPCCMCC_ActiveFlag: true,
    },
    {
        SPCCMCC_Id: 3,
        SPCCMCC_CompitionCategory: 'Open Category',
        SPCCMCC_CCDesc: 'Open for all',
        SPCCMCC_CCAgeFlag: false,
        SPCCMCC_CCWeightFlag: true,
        SPCCMCC_CCWeight: 60,
        SPCCMCC_ActiveFlag: false,
    }
];

export async function getMasterCompetitionCategories() {
    // In a real scenario, this would be an API call
    // const url = `/MasterCompetitionCategory/loadgrid/1`;
    // return await api.get('sports', url);

    return {
        success: true,
        message: 'Data fetched successfully',
        data: MOCK_DATA
    };
}

export async function getMasterCompetitionCategoryDetails(id: number) {
    // const url = `/MasterCompetitionCategory/Edit/${id}`;
    // return await api.get('sports', url);

    const item = MOCK_DATA.find(x => x.SPCCMCC_Id === id);
    return {
        success: true,
        data: {
            editDetails: [item]
        }
    };
}

export async function saveMasterCompetitionCategory(data: any) {
    const url = '/MasterCompetitionCategory/saveRecord';
    const res = await api.post('sports', url, data);
    revalidatePath('/Sports/Masters/CompetitionCategory');
    return res;
}

export async function deactivateMasterCompetitionCategory(data: any) {
    const url = '/MasterCompetitionCategory/deactivate';
    const res = await api.post('sports', url, data);
    revalidatePath('/Sports/Masters/CompetitionCategory');
    return res;
}
