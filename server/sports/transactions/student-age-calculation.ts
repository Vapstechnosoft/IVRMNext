'use server';

import { type ApiResponse } from '@/lib/apiService';
import { IDropdown } from '@/types';
import { StudentAgeCalculationFormData, StudentAgeRecord } from '@/schemas/sports/transactions/student-age-calculation';

export async function getInitialData(): Promise<ApiResponse<{ academicYears: IDropdown[], classes: IDropdown[], sections: IDropdown[] }>> {
    const academicYears: IDropdown[] = [
        { id: 1, label: '2023-2024', code: '2023-2024', name: '2023-2024' },
        { id: 2, label: '2024-2025', code: '2024-2025', name: '2024-2025' },
        { id: 3, label: '2025-2026', code: '2025-2026', name: '2025-2026' }
    ];

    const classes: IDropdown[] = [
        { id: 1, label: 'Class I', code: 'I', name: 'Class I' },
        { id: 2, label: 'Class II', code: 'II', name: 'Class II' },
        { id: 3, label: 'Class III', code: 'III', name: 'Class III' },
        { id: 4, label: 'Class IV', code: 'IV', name: 'Class IV' },
        { id: 5, label: 'Class V', code: 'V', name: 'Class V' }
    ];

    const sections: IDropdown[] = [
        { id: 1, label: 'A', code: 'A', name: 'A' },
        { id: 2, label: 'B', code: 'B', name: 'B' },
        { id: 3, label: 'C', code: 'C', name: 'C' }
    ];

    return {
        success: true,
        message: 'Initial data fetched successfully',
        data: { academicYears, classes, sections }
    };
}

export async function getStudents(data: { ASMAY_Id: number, asmcL_Id: number, asmS_Id: number }): Promise<ApiResponse<IDropdown[]>> {
    // Simulate fetching students based on class and section
    const students: IDropdown[] = [
        { id: 101, label: 'John Doe', code: '101', name: 'John Doe' },
        { id: 102, label: 'Jane Smith', code: '102', name: 'Jane Smith' },
        { id: 103, label: 'Michael Johnson', code: '103', name: 'Michael Johnson' },
        { id: 104, label: 'Emily Davis', code: '104', name: 'Emily Davis' },
        { id: 105, label: 'David Wilson', code: '105', name: 'David Wilson' },
        { id: 106, label: 'Sarah Brown', code: '106', name: 'Sarah Brown' },
        { id: 107, label: 'James Taylor', code: '107', name: 'James Taylor' },
        { id: 108, label: 'Olivia Moore', code: '108', name: 'Olivia Moore' },
        { id: 109, label: 'William Jackson', code: '109', name: 'William Jackson' },
        { id: 110, label: 'Sophia Martin', code: '110', name: 'Sophia Martin' }
    ];

    return {
        success: true,
        message: 'Students fetched successfully',
        data: students
    };
}

export async function saveStudentAge(data: StudentAgeCalculationFormData): Promise<ApiResponse<StudentAgeRecord[]>> {
    const dummyRecords: StudentAgeRecord[] = await getDummyRecords();

    // In a real implementation, we would save to the database here.
    // For now, we just return the existing dummy records plus potentially a new one (simulated).

    return {
        success: true,
        message: 'Record saved successfully',
        data: dummyRecords
    };
}

export async function getStudentAgeRecords(data: any): Promise<ApiResponse<StudentAgeRecord[]>> {
    const dummyRecords: StudentAgeRecord[] = await getDummyRecords();
    return {
        success: true,
        message: 'Records fetched successfully',
        data: dummyRecords
    };
}
// Helper to generate 21 dummy records
async function getDummyRecords(): Promise<StudentAgeRecord[]> {
    return [
        { id: 1, asmaY_Year: '2025-2026', studentName: 'John Doe', asmcL_ClassName: 'Class X', asmC_SectionName: 'A', age_Years: 15, age_Months: 5, age_Days: 20 },
        { id: 2, asmaY_Year: '2025-2026', studentName: 'Jane Smith', asmcL_ClassName: 'Class X', asmC_SectionName: 'B', age_Years: 14, age_Months: 11, age_Days: 10 },
        { id: 3, asmaY_Year: '2025-2026', studentName: 'Michael Johnson', asmcL_ClassName: 'Class IX', asmC_SectionName: 'A', age_Years: 14, age_Months: 2, age_Days: 5 },
        { id: 4, asmaY_Year: '2025-2026', studentName: 'Emily Davis', asmcL_ClassName: 'Class IX', asmC_SectionName: 'B', age_Years: 13, age_Months: 8, age_Days: 15 },
        { id: 5, asmaY_Year: '2025-2026', studentName: 'David Wilson', asmcL_ClassName: 'Class VIII', asmC_SectionName: 'A', age_Years: 13, age_Months: 1, age_Days: 0 },
        { id: 6, asmaY_Year: '2025-2026', studentName: 'Sarah Brown', asmcL_ClassName: 'Class VIII', asmC_SectionName: 'B', age_Years: 12, age_Months: 9, age_Days: 25 },
        { id: 7, asmaY_Year: '2025-2026', studentName: 'James Taylor', asmcL_ClassName: 'Class VII', asmC_SectionName: 'A', age_Years: 12, age_Months: 3, age_Days: 12 },
        { id: 8, asmaY_Year: '2025-2026', studentName: 'Olivia Moore', asmcL_ClassName: 'Class VII', asmC_SectionName: 'B', age_Years: 11, age_Months: 10, age_Days: 18 },
        { id: 9, asmaY_Year: '2025-2026', studentName: 'William Jackson', asmcL_ClassName: 'Class VI', asmC_SectionName: 'A', age_Years: 11, age_Months: 4, age_Days: 8 },
        { id: 10, asmaY_Year: '2025-2026', studentName: 'Sophia Martin', asmcL_ClassName: 'Class VI', asmC_SectionName: 'B', age_Years: 10, age_Months: 11, age_Days: 30 },
        { id: 11, asmaY_Year: '2025-2026', studentName: 'Robert Anderson', asmcL_ClassName: 'Class V', asmC_SectionName: 'A', age_Years: 10, age_Months: 6, age_Days: 5 },
        { id: 12, asmaY_Year: '2025-2026', studentName: 'Isabella White', asmcL_ClassName: 'Class V', asmC_SectionName: 'B', age_Years: 9, age_Months: 11, age_Days: 15 },
        { id: 13, asmaY_Year: '2025-2026', studentName: 'Charles Harris', asmcL_ClassName: 'Class IV', asmC_SectionName: 'A', age_Years: 9, age_Months: 2, age_Days: 10 },
        { id: 14, asmaY_Year: '2025-2026', studentName: 'Amelia Clark', asmcL_ClassName: 'Class IV', asmC_SectionName: 'B', age_Years: 8, age_Months: 9, age_Days: 22 },
        { id: 15, asmaY_Year: '2025-2026', studentName: 'Daniel Lewis', asmcL_ClassName: 'Class III', asmC_SectionName: 'A', age_Years: 8, age_Months: 1, age_Days: 5 },
        { id: 16, asmaY_Year: '2025-2026', studentName: 'Mia Robinson', asmcL_ClassName: 'Class III', asmC_SectionName: 'B', age_Years: 7, age_Months: 8, age_Days: 14 },
        { id: 17, asmaY_Year: '2025-2026', studentName: 'Matthew Walker', asmcL_ClassName: 'Class II', asmC_SectionName: 'A', age_Years: 7, age_Months: 3, age_Days: 28 },
        { id: 18, asmaY_Year: '2025-2026', studentName: 'Charlotte Young', asmcL_ClassName: 'Class II', asmC_SectionName: 'B', age_Years: 6, age_Months: 10, age_Days: 2 },
        { id: 19, asmaY_Year: '2025-2026', studentName: 'Anthony Hall', asmcL_ClassName: 'Class I', asmC_SectionName: 'A', age_Years: 6, age_Months: 5, age_Days: 16 },
        { id: 20, asmaY_Year: '2025-2026', studentName: 'Ella Allen', asmcL_ClassName: 'Class I', asmC_SectionName: 'B', age_Years: 5, age_Months: 11, age_Days: 20 },
        { id: 21, asmaY_Year: '2025-2026', studentName: 'Mark King', asmcL_ClassName: 'Class I', asmC_SectionName: 'C', age_Years: 6, age_Months: 0, age_Days: 0 }
    ];
}
