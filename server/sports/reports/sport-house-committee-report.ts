'use server';

import { type ApiResponse } from '@/lib/apiService';
import { type IDropdown } from '@/types';
import { type SportHouseCommitteeReportData } from '@/app/(root)/Sports/Reports/SportHouseCommitteeReport/types';

const dummyData: SportHouseCommitteeReportData[] = Array.from({ length: 23 }, (_, i) => ({
    id: i + 1,
    asmaY_Year: '2025-2026',
    spccmhD_DesignationName: i % 2 === 0 ? 'Captain' : 'Vice Captain',
    spccmH_HouseName: ['Red House', 'Blue House', 'Green House', 'Yellow House'][i % 4],
    studentname: `Student ${i + 1}`,
    amsT_AdmNo: `ADM${1000 + i}`,
    asmcL_ClassName: `Class ${10 - (i % 3)}`,
    asmC_SectionName: String.fromCharCode(65 + (i % 3)),
    spccmhC_ContactNo: `98765432${i.toString().padStart(2, '0')}`,
    spccmhC_EmailId: `student${i + 1}@school.com`
}));

export async function getSportHouseCommitteeReportData(data: any): Promise<ApiResponse<SportHouseCommitteeReportData[]>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter logic can be added here if needed, for now returning all dummy data
    let filteredData = [...dummyData];

    if (data.spccmH_Id && data.spccmH_Id.length > 0) {
        // In a real scenario, we'd filter by house IDs. 
        // For dummy data, let's just return all as the "House Name" string match is complex with IDs.
        // Or we can mock it if we had IDs.
    }

    return {
        success: true,
        message: 'Data fetched successfully',
        data: filteredData,
    };
}

export async function getInitialData(): Promise<ApiResponse<{
    academicYears: IDropdown[];
    houses: IDropdown[];
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
            ]
        }
    };
}
