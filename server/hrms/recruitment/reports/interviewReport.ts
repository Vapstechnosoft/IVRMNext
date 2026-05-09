'use server';

import { api , type ApiResponse } from '@/lib/apiService';

export interface InterviewReportResponse {
    type: string;
    round: string;
    hrcmG_Id: string;
    fromdate: string;
    todate: string;
}

export async function generateInterviewReport(payload: InterviewReportResponse) : Promise<ApiResponse<any>> {
    try{
        const url = '/api/AddCandidateInterviewVMS/candidate_interview_report';
            const response = await api.post('hrmsrecruitment', url, payload);
            if(response.success){
                return {
                    success: response?.success ,
                    message: response?.message || 'Data fetched successfully',
                    data: response?.data || response,
                }
            }else{
                return {
                    success: response?.success ,
                    message: response?.message || 'Data fetched successfully',
                    data: response?.data || response,
                }
            }
            
    }catch (error: any) {
        console.error('Error fetching master job grid data:', error);
        throw error;
    }
}