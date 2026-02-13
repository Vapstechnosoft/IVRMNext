'use server';

import { api } from '@/lib/apiService';
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



export async function getSubjectsData(asmaY_Id: number) {
    const url = `CumulativeSubject/get_getSubjectsdata`;
    const payload = { amsT_Id: 18828, asmaY_Id };
    try {
        const response = await api.post<any>('portal', url, payload);
        console.log("DEBUG: Subject API Response:", JSON.stringify(response, null, 2));

        if (response && response.data) {
            const responseData = response.data;
            // The API response structure is: { success: true, message: "...", data: [...] }
            // So subjects are directly at responseData.data
            const subjects = responseData.data || [];

            console.log("DEBUG: Extracted Subjects Length:", subjects.length);
            console.log("DEBUG: First subject:", subjects[0]);

            return {
                subjectlist: subjects,
                stuyearlist: [] // Default empty if not present
            } as SubjectListResponse;
        }
        return { subjectlist: [], stuyearlist: [] };
    } catch (e) {
        console.warn("API Failed, using mock data for getSubjectsData", e);
        return mockSubjectData;
    }
}


export async function getExamDetails(asmaY_Id: number, ismS_Id: number) {
    const url = `CumulativeSubject/get_exam_details`;
    const payload = { amsT_Id: 18828, asmaY_Id, ismS_Id };
    try {
        const response = await api.post<ExamDetailsResponse>('portal', url, payload);
        if (response && response.data) return response.data;
        return response as unknown as ExamDetailsResponse;
    } catch (e) {
        console.warn("API Failed, using mock data for getExamDetails", e);
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockExamDetails;
    }
}
