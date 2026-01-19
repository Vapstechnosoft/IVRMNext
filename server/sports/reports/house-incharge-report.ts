'use server';

import { type ApiResponse } from '@/lib/apiService';
import { type IDropdown } from '@/types';
import { type HouseInchargeReportData } from '@/app/(root)/Sports/Reports/HouseInchargeReport/types';

const dummyData: HouseInchargeReportData[] = Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    SPCCMH_HouseName: ['Red House', 'Blue House', 'Green House', 'Yellow House'][i % 4],
    EmpName: `Employee ${i + 1}`,
    HRME_EmployeeCode: `EMP${100 + i}`,
    HRMD_DepartmentName: ['Sports', 'Science', 'Math', 'English'][i % 4],
    HRMDES_DesignationName: ['Coach', 'Teacher', 'HOD', 'Coordinator'][i % 4],
    HRME_MobileNo: `98765432${i.toString().padStart(2, '0')}`,
    HRME_EmailId: `employee${i + 1}@school.com`
}));

export async function getHouseInchargeReportData(data: any): Promise<ApiResponse<HouseInchargeReportData[]>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter logic simulation
    let filteredData = [...dummyData];

    if (data.spccmH_Id && data.spccmH_Id.length > 0) {
        // Logic to filter by house would go here
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
