'use server';

import { auth } from '@/lib/auth';
import { api } from '@/lib/apiService';
import type {
    IBookCirculationReportInitialData,
    IBookCirculationReportRequest,
    IBookCirculationReportResponse
} from '@/types/library/reports/book-circulation-report';

const FACADE = 'BookCirculationReport';

const extractList = (list: any) => {
    if (!list) return [];
    const actualList = list.data || list;
    if (actualList && typeof actualList === 'object' && '$values' in actualList) {
        return actualList.$values;
    }
    return Array.isArray(actualList) ? actualList : [];
};

export async function getBookCirculationReportInitialData() {
    const url = `${FACADE}/circulation-getdetails`;
    // No payload or MI_Id in GET method as requested
    const response = await api.get<any>('library', url);
    
    // Support for both direct response and nested data object
    const data = response?.data?.data || response?.data || response;

    return {
        lib_list: extractList(data.lib_list || data.msterliblist1 || []),
        classList: extractList(data.classList || data.classlist || data.msterclasslist || data.fillclass || data.classlist1 || []),
        sectionList: extractList(data.sectionList || data.sectionlist || data.mstersectionlist || data.fillsection || data.sectionlist1 || []),
        parentsubjectlist: extractList(data.parentsubjectlist || []),
        subsubjectlist: extractList(data.subsubjectlist || []),
        booktype: extractList(data.booktype || []),
        booktitle: extractList(data.booktitle || [])
    } as IBookCirculationReportInitialData;
}

export async function getBookCirculationReportData(data: IBookCirculationReportRequest) {
    const url = `${FACADE}/get_report`;
    const response = await api.post<any>('library', url, data);
    const responseData = response.data || response;

    const rawList = extractList(responseData.data || responseData.reportlist || responseData.alldata || (Array.isArray(responseData) ? responseData : []));

    // Normalize keys to uppercase and handle common variations
    return rawList.map((item: any) => {
        const normalizedItem: any = {};
        for (const key in item) {
            normalizedItem[key.toUpperCase()] = item[key];
        }
        
        // Handle common variations for Class
        if (!normalizedItem.ASMCL_CLASSNAME) {
            normalizedItem.ASMCL_CLASSNAME = normalizedItem.ASMCL_CLASS_NAME || normalizedItem.CLASSNAME || normalizedItem.CLASS_NAME;
        }

        // Handle common variations for Section
        if (!normalizedItem.ASMC_SECTIONNAME) {
            normalizedItem.ASMC_SECTIONNAME = normalizedItem.ASMS_SECTIONNAME || normalizedItem.SECTIONNAME || normalizedItem.SECTION_NAME;
        }

        // Handle common variations for Subject
        if (!normalizedItem.ISMS_SUBJECTNAME) {
            normalizedItem.ISMS_SUBJECTNAME = normalizedItem.SUBJECTNAME || normalizedItem.SUBJECT_NAME || normalizedItem.ISM_SUBJECTNAME;
        }

        // Handle common variations for Sub-Subject
        if (!normalizedItem.LMS_SUBJECTNAME) {
            normalizedItem.LMS_SUBJECTNAME = normalizedItem.SUBSUBJECTNAME || normalizedItem.SUB_SUBJECT_NAME || normalizedItem.LMS_SUBJECT_NAME;
        }

        return normalizedItem;
    });
}
