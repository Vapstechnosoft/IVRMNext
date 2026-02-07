'use server';

import { type ApiResponse } from '@/lib/apiService';
import { IMonthEndReportData, MonthEndReportFormSchema } from '@/types/sports/reports/month-end-report';

export async function getMonthEndReportDropdowns() {
    const response: ApiResponse<{
        academicYear: { asmaY_Id: number; asmaY_Year: string }[];
        monthList: { month: number; monthname: string }[];
    }> = {
        success: true,
        message: 'Dropdowns fetched successfully',
        data: {
            academicYear: [
                { asmaY_Id: 1, asmaY_Year: '2023-2024' },
                { asmaY_Id: 2, asmaY_Year: '2024-2025' },
            ],
            monthList: [
                { month: 1, monthname: 'January' },
                { month: 2, monthname: 'February' },
                { month: 3, monthname: 'March' },
                { month: 4, monthname: 'April' },
                { month: 5, monthname: 'May' },
                { month: 6, monthname: 'June' },
                { month: 7, monthname: 'July' },
                { month: 8, monthname: 'August' },
                { month: 9, monthname: 'September' },
                { month: 10, monthname: 'October' },
                { month: 11, monthname: 'November' },
                { month: 12, monthname: 'December' },
            ],
        },
    };
    return response;
}

export async function getMonthEndReport(data: MonthEndReportFormSchema) {
    // Generate dynamic mock data based on inputs
    const baseCount = 1000;
    const yearFactor = data.ASMAY_Id * 50;
    const monthFactor = data.month * 20;

    const totalStudents = baseCount + yearFactor + monthFactor;
    const participants = Math.floor(totalStudents * 0.4); // 40% participation
    const winners = Math.floor(participants * 0.1); // 10% of participants are winners
    const notParticipants = totalStudents - participants;

    const dummyData: IMonthEndReportData = {
        total_count_student: totalStudents,
        not_patr_std: notParticipants,
        total_partic_student: participants,
        total_winner_student: winners,
    };

    const response: ApiResponse<IMonthEndReportData> = {
        success: true,
        message: 'Report generated successfully',
        data: dummyData,
    };

    return response;
}
