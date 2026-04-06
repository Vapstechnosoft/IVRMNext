'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterActivity, IMasterActivityList } from '@/schemas/admission/preadmission/master_activity';

/**
 * Get all master activities
 */
export const getMasterActivitiesDetails = async (searchParams?: ApiSearchparams) => {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'amA_Activity');
    const url = `/MasterActivity/Getdetails?${urlParams}`;
    return await api.get('admission', url);
};

/**
 * Get specific row details for editing
 */
export const getSelectedMasterActivityRow = async (id: number) => {
    const url = `/MasterActivity/GetSelectedRowDetails/${id}`;
    return await api.get('admission', url);
};

/**
 * Save or Update Master Activity
 */
export const saveMasterActivityData = async (data: IMasterActivity) => {
    const url = '/MasterActivity/';
    return await api.post('admission', url, {
        amA_Id: data.amA_Id ?? 0,
        AMA_Activity: data.amA_Activity,
        AMA_Activity_Desc: data.amA_Activity_Desc
    });
};

/**
 * Delete Master Activity
 */
export const deleteMasterActivityData = async (id: number) => {
    const url = `/MasterActivity/MasterDeleteModulesDTO/${id}`;
    return await api.get('admission', url);
};
