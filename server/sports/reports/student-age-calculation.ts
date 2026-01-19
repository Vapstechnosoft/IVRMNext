'use server';

import { api } from '@/lib/apiService';
import { IReportRequest, IReportResponse, IStudentAgeReport } from '@/types/sports/reports/student-age-calculation';

// Dummy Data
const dummyReports: IStudentAgeReport[] = Array.from({ length: 12 }, (_, i) => ({
    amsT_Id: 100 + i,
    amsT_AdmNo: `ADM-${202300 + i}`,
    studentName: `Student Name ${i + 1}`,
    asmcL_ClassName: `Class ${1 + (i % 5)}`,
    asmC_SectionName: String.fromCharCode(65 + (i % 3)),
    spccmH_HouseName: ['Red', 'Blue', 'Green', 'Yellow'][i % 4],
    amsT_DOB: new Date(2010 + (i % 5), i % 12, 1 + i).toISOString(),
    months: 120 + i,
    years: 10 + (i % 5),
    monthsd: i % 12,
    days: i % 30,
    spccmcL_CompitionLevel: ['Senior', 'Junior', 'Sub-Junior'][i % 3]
}));

export async function getStudentAgeReportLoadData(): Promise<IReportResponse> {
    // Mock Load Data
    return {
        success: true,
        yearlist: [
            { asmaY_Id: 1, asmaY_Year: '2023-2024' },
            { asmaY_Id: 2, asmaY_Year: '2024-2025' }
        ],
        categoryList: [
            { spccmcC_Id: 1, spccmcC_CompitionCategory: 'Football' },
            { spccmcC_Id: 2, spccmcC_CompitionCategory: 'Cricket' }
        ],
        houseList: [
            { spccmH_Id: 1, spccmH_HouseName: 'Red House' },
            { spccmH_Id: 2, spccmH_HouseName: 'Blue House' },
            { spccmH_Id: 3, spccmH_HouseName: 'Green House' },
            { spccmH_Id: 4, spccmH_HouseName: 'Yellow House' }
        ]
    };
}

export async function getClassesForYear(asmaY_Id: number): Promise<any> {
    // Mock Classes
    return {
        classList: [
            { asmcL_Id: 1, asmcL_ClassName: 'I' },
            { asmcL_Id: 2, asmcL_ClassName: 'II' },
            { asmcL_Id: 3, asmcL_ClassName: 'III' },
            { asmcL_Id: 4, asmcL_ClassName: 'IV' },
            { asmcL_Id: 5, asmcL_ClassName: 'V' }
        ],
        houseList: [
            { spccmH_Id: 1, spccmH_HouseName: 'Red House' },
            { spccmH_Id: 2, spccmH_HouseName: 'Blue House' },
            { spccmH_Id: 3, spccmH_HouseName: 'Green House' },
            { spccmH_Id: 4, spccmH_HouseName: 'Yellow House' }
        ]
    };
}

export async function getSectionsForClass(asmaY_Id: number, asmcL_Id: number): Promise<any> {
    // Mock Sections
    return {
        sectionList: [
            { asmS_Id: 1, asmC_SectionName: 'A' },
            { asmS_Id: 2, asmC_SectionName: 'B' },
            { asmS_Id: 3, asmC_SectionName: 'C' }
        ]
    };
}

export async function getStudentAgeReport(data: IReportRequest): Promise<IReportResponse> {
    try {
        // In a real app, we would post to the API
        // const response = await api.post<IReportResponse>('sports', 'StudentAgeCalcReport/showdetails', data);
        // return response;

        // Simulating delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            viewlist: dummyReports
        };
    } catch (error) {
        console.error("Error generating report:", error);
        return {
            success: false,
            message: "Failed to generate report"
        };
    }
}
