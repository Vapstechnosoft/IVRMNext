'use server';

import { api } from '@/lib/apiService';
import { getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSchoolTopicResponse } from '@/types/lesson-planner/master/school-topic';

// Fetch initial data
export async function getSchoolTopicData(searchParams?: ApiSearchparams) {
    try {
        const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lpmmT_TopicName');
        const url = `/MasterSchoolTopic/Get_details?${urlParams}`;
        const result = await api.get<IMasterSchoolTopicResponse>('lessonplanner', url);
        return result;
    } catch (error) {
        console.error('[getSchoolTopicData] Error:', error);
        throw error;
    }
}

// Save topic
export async function saveSchoolTopic(data: any) {
    try {
        const url = '/MasterSchoolTopic/savedetails';
        const result = await api.post('lessonplanner', url, data);
        return result;
    } catch (error) {
        console.error('[saveSchoolTopic] Error:', error);
        throw error;
    }
}

// Edit details
export async function editSchoolTopic(id: number) {
    try {
        const url = `/MasterSchoolTopic/editdeatils/${id}`;

        try {
            const result = await api.get<IMasterSchoolTopicResponse>('lessonplanner', url);
            return result;
        } catch (getError: any) {
            console.warn('[editSchoolTopic] GET failed, trying POST...', getError.message);
            // Fallback to POST with body as some legacy APIs require it even with path params
            const postResult = await api.post<IMasterSchoolTopicResponse>('lessonplanner', url, { LPMMT_Id: id });
            return postResult;
        }
    } catch (error: any) {
        console.error('[editSchoolTopic] All attempts failed:', error);
        throw error;
    }
}

// Deactivate/Activate
export async function deactivateSchoolTopic(id: number, activeFlag: boolean) {
    const url = `/MasterSchoolTopic/Deactivate?LPMMT_Id=${id}`;
    return await api.post<IMasterSchoolTopicResponse>('lessonplanner', url, { lpmmT_Id: id, lpmmT_ActiveFlag: activeFlag });
}

// Get classes by year
export async function getClassesByYear(asmaY_Id: number) {
    const url = `/MasterSchoolTopic/onchange_year?ASMAY_Id=${asmaY_Id}`;
    return await api.post<IMasterSchoolTopicResponse>('lessonplanner', url, { ASMAY_Id: asmaY_Id });
}

// Get subjects by class
export async function getSubjectsByClass(asmaY_Id: number, asmcL_Id: number) {
    const url = `/MasterSchoolTopic/onchange_class?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}`;
    return await api.post<IMasterSchoolTopicResponse>('lessonplanner', url, { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id });
}

// Get topics for ordering
export async function getTopicsForOrder(data: { ISMS_Id: number; ASMAY_Id: number; ASMCL_Id: number }) {
    const url = `/MasterSchoolTopic/gettopicdetails?ISMS_Id=${data.ISMS_Id}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}`;
    return await api.post<IMasterSchoolTopicResponse>('lessonplanner', url, data);
}

// Save order
export async function saveTopicOrder(orderArray: any[]) {
    const url = '/MasterSchoolTopic/validateordernumber';
    return await api.post<IMasterSchoolTopicResponse>('lessonplanner', url, { masterSchoolTopicOrderDTO: orderArray });
}
