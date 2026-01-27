'use server';

import { IStudentEligibleReportDetail } from '@/types/sports/reports/student-eligible-report';

export const getStudentEligibleReportLoadGrid = async () => {
    // Dummy data for initial load
    const yearlist = [
        { asmaY_Id: 1, asmaY_Year: '2023-2024' },
        { asmaY_Id: 2, asmaY_Year: '2024-2025' },
        { asmaY_Id: 3, asmaY_Year: '2025-2026' }
    ];

    const data: IStudentEligibleReportDetail[] = Array.from({ length: 17 }, (_, i) => ({
        amsT_Id: i + 1,
        adm_no: `ADM00${i + 1}`,
        studentname: `Student ${i + 1}`,
        classname: 'Class X',
        sectionname: 'Section A',
        spccE_StartDate: '2010-01-01',
        pasR_Age: 15,
        amsT_FatherName: `Father ${i + 1}`,
        amsT_MotherName: `Mother ${i + 1}`,
        address: `Address ${i + 1}`,
        Selected: false
    }));

    return { success: true, yearlist, data, total: 17 };
};

export const getStudentEligibleReportClasses = async (data: { ASMAY_Id: number }) => {
    const classList = [
        { asmcL_Id: 1, asmcL_ClassName: 'Class I' },
        { asmcL_Id: 2, asmcL_ClassName: 'Class II' },
        { asmcL_Id: 3, asmcL_ClassName: 'Class III' }
    ];
    return { success: true, classList };
};

export const getStudentEligibleReportSections = async (data: { ASMAY_Id: number; ASMCL_Id: number }) => {
    const sectionList = [
        { asmS_Id: 1, asmC_SectionName: 'Section A' },
        { asmS_Id: 2, asmC_SectionName: 'Section B' }
    ];
    return { success: true, sectionList };
};

export const getStudentEligibleReportStudents = async (data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) => {
    const studentList1 = Array.from({ length: 10 }, (_, i) => ({
        amsT_Id: i + 100,
        studentname: `Student ${i + 100}`,
        Selected: false
    }));
    return { success: true, studentList1 };
};

export const getStudentEligibleReportDetails = async (params: any) => {
    const data: IStudentEligibleReportDetail[] = Array.from({ length: 5 }, (_, i) => ({
        amsT_Id: i + 200,
        adm_no: `ADM00${i + 200}`,
        studentname: `Filtered Student ${i + 1}`,
        classname: 'Class X',
        sectionname: 'Section A',
        spccE_StartDate: '2010-01-01',
        pasR_Age: 15,
        amsT_FatherName: `Father ${i + 200}`,
        amsT_MotherName: `Mother ${i + 200}`,
        address: `Address ${i + 200}`,
        Selected: false
    }));
    return { success: true, data, total: 5 };
};
