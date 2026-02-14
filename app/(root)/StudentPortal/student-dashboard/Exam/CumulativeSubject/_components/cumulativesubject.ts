'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import { CumulativeSubjectLoadData, SubjectListResponse, ExamDetailsResponse } from '@/app/(root)/StudentPortal/student-dashboard/Exam/CumulativeSubject/types';

// Mock data as fallback
const mockLoadData: CumulativeSubjectLoadData = {
    stuyearlist: [],
};

const mockSubjectData: SubjectListResponse = {
    subjectlist: [],
    stuyearlist: [],
};

const mockExamDetails: ExamDetailsResponse = {
    examgradelist: [],
};


export async function getCumulativeSubjectLoadData() {
    const url = `/fee_class_category/academicyearlist`;
    try {
        const response = await api.get<any>('fees', url);

        if (response && response.data) {
            const responseData = response.data;
            const yearList = responseData?.data?.studentYearList ||
                responseData?.studentYearList ||
                responseData?.data ||
                (Array.isArray(responseData) ? responseData : []) ||
                [];

            return {
                stuyearlist: yearList
            };
        }
        return { stuyearlist: [] };
    } catch (e) {
        console.warn("API Failed, using mock data for getCumulativeSubjectLoadData", e);
        return mockLoadData;
    }
}











export async function getSubjectDataforCumulatiSubject(asmay_Id: number) {
    const session = await auth();
    const amst_Id = session?.amst_id;
    const url = `/CumulativeSubject/get_getSubjectsdata?ASMAY_Id=${asmay_Id}&AMST_Id=17064`;

    try {
        const response = await api.get<any>('portal', url);
        console.log(response);

        if (response && response.data) {
            let subjects = response.data.subjectlist || response.data.data || (Array.isArray(response.data) ? response.data : []) || [];

            // Filter duplicates based on ismS_Id
            subjects = subjects.filter((val: any, id: any, array: any[]) => {
                return array.findIndex((item: any) => item.ismS_Id === val.ismS_Id) === id;
            });

            return {
                subjectlist: subjects,
                stuyearlist: []
            };
        }
        return {
            subjectlist: [],
            stuyearlist: []
        };

    } catch (error) {
        console.error("Error in getSubjectDataforCumulatiSubject:", error);
        return {
            subjectlist: [],
            stuyearlist: []
        };
    }
}













export async function getExamDetails(asmaY_Id: number, ismS_Id: number) {
    const session = await auth();
    const amsT_Id = session?.amst_id;
    const url = `/CumulativeSubject/get_getSubjectsdata`;
    const payload = { amsT_Id, asmaY_Id, ismS_Id };
    try {
        const response = await api.post<ExamDetailsResponse>('portal', url, payload);
        if (response && response.data) return response.data;
        return response as unknown as ExamDetailsResponse;
    } catch (e) {
        console.warn("API Failed, using mock data for getExamDetails", e);
        return mockExamDetails;
    }
}
