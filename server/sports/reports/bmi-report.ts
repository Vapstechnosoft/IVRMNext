'use server';

import { IBMIReport, IBMIReportLoadData, IBMIReportRequest } from '@/types/sports/reports/bmi-report';

// Mock Data
const ACADEMIC_YEARS = [
    { asmaY_Id: 1, asmaY_Year: '2023-2024', Selected: true },
    { asmaY_Id: 2, asmaY_Year: '2024-2025', Selected: false },
    { asmaY_Id: 3, asmaY_Year: '2025-2026', Selected: false },
];

const HOUSES = [
    { spccmH_Id: 1, spccmH_HouseName: 'Red House', Selected: false },
    { spccmH_Id: 2, spccmH_HouseName: 'Blue House', Selected: false },
    { spccmH_Id: 3, spccmH_HouseName: 'Green House', Selected: false },
    { spccmH_Id: 4, spccmH_HouseName: 'Yellow House', Selected: false },
];

const CLASSES = [
    { asmcL_Id: 10, asmcL_ClassName: 'I' },
    { asmcL_Id: 20, asmcL_ClassName: 'II' },
    { asmcL_Id: 30, asmcL_ClassName: 'III' },
    { asmcL_Id: 40, asmcL_ClassName: 'X' },
];

const SECTIONS = [
    { asmS_Id: 100, asmC_SectionName: 'A' },
    { asmS_Id: 200, asmC_SectionName: 'B' },
    { asmS_Id: 300, asmC_SectionName: 'C' },
    { asmS_Id: 400, asmC_SectionName: 'D' },
    { asmS_Id: 500, asmC_SectionName: 'E' },
    { asmS_Id: 600, asmC_SectionName: 'F' },
];

const DUMMY_REPORT_DATA: IBMIReport[] = Array.from({ length: 18 }).map((_, i) => ({
    AMST_Id: i + 1,
    AMST_Name: `Student ${i + 1}`,
    AMST_AdmNo: `ADM00${i + 1}`,
    ASMCL_ClassName: i % 2 === 0 ? 'X' : 'IX',
    ASMC_SectionName: i % 3 === 0 ? 'A' : 'B',
    SPCCMH_HouseName: i % 4 === 0 ? 'Red House' : 'Blue House',
    AMST_DOB: '2008-05-15T00:00:00',
    SPCCSH_Age: '15.2',
    SPCCSH_Height: 160 + i,
    SPCCSH_Weight: 50 + i,
    SPCCSH_BMI: 20 + (i * 0.1),
    SPCCSH_BMIRemarks: i % 5 === 0 ? 'Overweight' : 'Normal',
}));

export async function getBMIReportLoadData(): Promise<IBMIReportLoadData> {
    // Simulate API call
    return {
        academicYear: ACADEMIC_YEARS,
        houseList: HOUSES,
    };
}

export async function getClassesForBMI(asMAY_Id: number) {
    // Simulate API call
    return CLASSES;
}

export async function getSectionsForBMI(asMAY_Id: number, asmcL_Id: number) {
    // Simulate API call
    return SECTIONS;
}

export async function getBMIReport(data: IBMIReportRequest): Promise<IBMIReport[]> {
    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Generating BMI Report for:', data);
    return DUMMY_REPORT_DATA;
}
