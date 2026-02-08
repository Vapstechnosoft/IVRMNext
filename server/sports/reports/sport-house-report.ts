'use server';

import { type ApiResponse } from '@/lib/apiService';
import { type IDropdown } from '@/types';
import { type SportHouseReportData } from '@/app/(root)/Sports/Reports/SportHouseReport/types';

const dummyData: SportHouseReportData[] = Array.from({ length: 22 }, (_, i) => ({
    id: i + 1,
    SPCCMH_HouseName: ['Red House', 'Blue House', 'Green House', 'Yellow House'][i % 4],
    AMST_Name: `Student ${i + 1}`,
    AMST_AdmNo: `ADM${2000 + i}`,
    ASMCL_ClassName: ['Class 1', 'Class 2', 'Class 3', 'Class 4'][i % 4],
    ASMC_SectionName: ['A', 'B', 'C'][i % 3],
    AMST_MobileNo: `98765432${i.toString().padStart(2, '0')}`,
    AMST_emailId: `student${i + 1}@school.com`
}));

export async function getSportHouseReportData(data: any): Promise<ApiResponse<SportHouseReportData[]>> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulation of filtering would go here

    return {
        success: true,
        message: 'Data fetched successfully',
        data: dummyData,
    };
}

export async function getInitialData(): Promise<ApiResponse<{
    academicYears: IDropdown[];
    houses: IDropdown[];
    classes: IDropdown[];
    sections: IDropdown[];
}>> {
    return {
        success: true,
        message: 'Initial data fetched',
        data: {
            academicYears: [
                { id: 1, label: '2023-2024', code: '23-24', name: '2023-2024' },
                { id: 2, label: '2024-2025', code: '24-25', name: '2024-2025' },
                { id: 3, label: '2025-2026', code: '25-26', name: '2025-2026' }
            ],
            houses: [
                { id: 1, label: 'Red House', code: 'RED', name: 'Red House' },
                { id: 2, label: 'Blue House', code: 'BLUE', name: 'Blue House' },
                { id: 3, label: 'Green House', code: 'GREEN', name: 'Green House' },
                { id: 4, label: 'Yellow House', code: 'YELLOW', name: 'Yellow House' }
            ],
            classes: [
                { id: 1, label: 'Class 1', code: 'C1', name: 'Class 1' },
                { id: 2, label: 'Class 2', code: 'C2', name: 'Class 2' },
                { id: 3, label: 'Class 3', code: 'C3', name: 'Class 3' }
            ],
            sections: [
                { id: 1, label: 'Section A', code: 'A', name: 'Section A' },
                { id: 2, label: 'Section B', code: 'B', name: 'Section B' },
                { id: 3, label: 'Section C', code: 'C', name: 'Section C' }
            ]
        }
    };
}
