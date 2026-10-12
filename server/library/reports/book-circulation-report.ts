'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IBookCirculationReportInitialData, IBookCirculationReportRequest } from '@/types/library/reports/book-circulation-report';

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
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const url = `${FACADE}/circulation-getdetails`;

    let response: any;
    let getError = null;
    try {
        response = await api.get<any>('library', url, {
            params: {
                MI_Id: session.mi_id
            }
        });
    } catch (e: any) {
        getError = e?.message || String(e);
        console.warn('[circulation-getdetails] GET failed, attempting POST fallback:', getError);
    }

    let finalData = response?.data?.data || response?.data || response || {};

    try {
        const fs = await import('fs');
        let mappedClasses: any = null;
        try {
            const mappedRes = await api.get<any>('library', `/MasterLibrary/get-mapped-class-list?mI_Id=${session.mi_id}`);
            mappedClasses = mappedRes?.data || mappedRes;
        } catch (e) {
            mappedClasses = { err: String(e) };
        }

        const debugPath = 'C:\\Users\\sumas\\.gemini\\antigravity-ide\\brain\\7965c868-2d42-45ea-8fde-f82e555152d5\\scratch\\api_debug2.json';
        fs.writeFileSync(debugPath, JSON.stringify({
            circulationGetdetailsKeys: Object.keys(finalData || {}),
            mappedClassesKeys: mappedClasses ? Object.keys(mappedClasses) : [],
            mappedClassesSample: mappedClasses,
            classList: finalData?.classList,
            sectionList: finalData?.sectionList
        }, null, 2), 'utf-8');
    } catch (err) {
        console.error('Failed to write debug file 2:', err);
    }

    if (!response || getError) {
        try {
            const postResponse = await api.post<any>('library', url, {
                MI_Id: session.mi_id
            });
            const postData = postResponse?.data?.data || postResponse?.data || postResponse;
            if (postData) {
                finalData = postData;
            }
        } catch (postErr: any) {
            console.warn('[circulation-getdetails] POST fallback failed:', postErr?.message || String(postErr));
        }
    }

    // Extract lists from circulation-getdetails response
    let finalLibList = extractList(finalData.lib_list || finalData.msterliblist1 || finalData.libraryList || finalData.library_list || []);
    let finalClassList = extractList(
        finalData.classList || finalData.classlist || finalData.msterclasslist || finalData.fillclass || finalData.classlist1 || []
    );
    const finalSectionList = extractList(
        finalData.sectionList ||
            finalData.sectionlist ||
            finalData.mstersectionlist ||
            finalData.fillsection ||
            finalData.sectionlist1 ||
            []
    );

    // Merge or fallback to get-master-library-list if libraries or classes are empty
    if (finalLibList.length === 0 || finalClassList.length === 0) {
        try {
            const masterLibUrl = `/MasterLibrary/get-master-library-list?page=1&page_size=100&sort_column=lmaL_LibraryName&sort_direction=asc&mI_Id=${session.mi_id}`;
            const masterLibRes = await api.get<any>('library', masterLibUrl);
            const mData = masterLibRes?.data || masterLibRes;
            if (mData) {
                if (finalLibList.length === 0) {
                    finalLibList = extractList(mData.list || mData.librylist || mData.liballdata || mData.msterliblist1 || []);
                }
                if (finalClassList.length === 0) {
                    finalClassList = extractList(mData.classlist || mData.classList || mData.msterclasslist || []);
                }
            }
        } catch (e: any) {
            console.warn('Failed to fetch master libraries/classes fallback:', e?.message || String(e));
        }
    }

    return {
        lib_list: finalLibList,
        classList: finalClassList,
        sectionList: finalSectionList,
        parentsubjectlist: extractList(finalData.parentsubjectlist || []),
        subsubjectlist: extractList(finalData.subsubjectlist || []),
        booktype: extractList(finalData.booktype || []),
        booktitle: extractList(finalData.booktitle || [])
    } as IBookCirculationReportInitialData;
}

export async function getBookCirculationReportData(data: IBookCirculationReportRequest) {
    try {
        const session = await auth();
        if (!session?.mi_id) {
            throw new Error('Authentication required');
        }

        const payload = {
            Type: data.Type || 'ALL',
            AGType: data.AGType || 'Student',
            TrnType: data.TrnType || 'ALL',
            IssueFromDate: data.IssueFromDate || '',
            IssueToDate: data.IssueToDate || '',
            DueFromdate: data.DueFromdate || '',
            DueTodate: data.DueTodate || '',
            LMAL_Id: Number(data.LMAL_Id),
            BookSummary: false,
            bookSummary: false,
            selectedClasslist: data.selectedClasslist || [],
            selectedSectionlist: data.selectedSectionlist || [],
            selectedSubjectlist: data.selectedSubjectlist || [],
            selectedSubSubjectlist: data.selectedSubSubjectlist || [],
            MI_Id: session.mi_id,
            IVRMUL_Id: session.roleId || 0
        };

        const url = `${FACADE}/circulation-get_report`;
        const response = await api.post<any>('library', url, payload);
        const responseData = response.data || response;

        const rawList = extractList(
            responseData.reportlist ||
                responseData.reportList ||
                responseData.gridList ||
                responseData.gridlist ||
                responseData.alldata ||
                responseData.data ||
                responseData
        );

        // Normalize keys to uppercase and handle common variations
        const normalizedList = rawList.map((item: any) => {
            const normalizedItem: any = {};
            for (const key in item) {
                normalizedItem[key.toUpperCase()] = item[key];
            }

            // Handle common variations for Class
            if (!normalizedItem.ASMCL_CLASSNAME) {
                normalizedItem.ASMCL_CLASSNAME =
                    normalizedItem.ASMCL_CLASS_NAME ||
                    normalizedItem.CLASSNAME ||
                    normalizedItem.CLASS_NAME ||
                    normalizedItem.ASMCL_CLASSNAME ||
                    normalizedItem.CLASS ||
                    item.asmcL_ClassName ||
                    item.asmcL_Classname ||
                    item.asmcl_classname ||
                    item.className ||
                    item.ClassName ||
                    item.class_name ||
                    item.CLASS_NAME;
            }

            // Handle common variations for Section
            if (!normalizedItem.ASMC_SECTIONNAME) {
                normalizedItem.ASMC_SECTIONNAME =
                    normalizedItem.ASMS_SECTIONNAME ||
                    normalizedItem.SECTIONNAME ||
                    normalizedItem.SECTION_NAME ||
                    normalizedItem.ASMC_SECTION_NAME ||
                    normalizedItem.ASMS_SECTION_NAME ||
                    normalizedItem.MC_SECTIONNAME ||
                    normalizedItem.SECTION ||
                    item.asmC_SectionName ||
                    item.asmC_Sectionname ||
                    item.asmc_sectionname ||
                    item.asmS_SectionName ||
                    item.asmS_Sectionname ||
                    item.asms_sectionname ||
                    item.sectionName ||
                    item.SectionName ||
                    item.section_name ||
                    item.SECTION_NAME;
            }

            // Handle common variations for Subject
            if (!normalizedItem.ISMS_SUBJECTNAME) {
                normalizedItem.ISMS_SUBJECTNAME =
                    normalizedItem.SUBJECTNAME || normalizedItem.SUBJECT_NAME || normalizedItem.ISM_SUBJECTNAME;
            }

            // Handle common variations for Sub-Subject
            if (!normalizedItem.LMS_SUBJECTNAME) {
                normalizedItem.LMS_SUBJECTNAME =
                    normalizedItem.SUBSUBJECTNAME || normalizedItem.SUB_SUBJECT_NAME || normalizedItem.LMS_SUBJECT_NAME;
            }

            return normalizedItem;
        });

        return {
            success: true,
            data: normalizedList
        };
    } catch (error: any) {
        console.error('🔴 [getBookCirculationReportData] Error:', error?.message || error);
        return {
            success: false,
            error: error?.message || String(error)
        };
    }
}
