'use server';

import { AcademicYear, StudentComplaint } from './types';

// Mock Data
const MOCK_ACADEMIC_YEARS: AcademicYear[] = [
    { asmaY_Id: 1, asmaY_Year: '2023-2024' },
    { asmaY_Id: 2, asmaY_Year: '2022-2023' },
    { asmaY_Id: 3, asmaY_Year: '2021-2022' }
];

const MOCK_COMPLAINTS: StudentComplaint[] = [
    {
        ASCOMP_Id: 101,
        AMST_FirstName: 'Rahul Kumar',
        AMST_AdmNo: 'ADM2023001',
        ASMCL_ClassName: 'X',
        ASMC_SectionName: 'A',
        ASCOMP_Subject: 'Discipline',
        ASCOMP_Complaints: 'Talkative in class',
        ASCOMP_Date: '2023-04-10T00:00:00',
        ASCOMP_FilePath: 'https://example.com/mock.pdf',
        ASCOMP_FileName: 'notes.pdf',
        filetype: 'pdf',
        document_Pathnew: ''
    },
    {
        ASCOMP_Id: 102,
        AMST_FirstName: 'Rahul Kumar',
        AMST_AdmNo: 'ADM2023001',
        ASMCL_ClassName: 'X',
        ASMC_SectionName: 'A',
        ASCOMP_Subject: 'Homework',
        ASCOMP_Complaints: 'Homework not submitted',
        ASCOMP_Date: '2023-05-15T00:00:00',
        ASCOMP_FilePath: 'https://example.com/mock.jpg',
        ASCOMP_FileName: 'proof.jpg',
        filetype: 'jpg',
        document_Pathnew: ''
    },
    {
        ASCOMP_Id: 103,
        AMST_FirstName: 'Rahul Kumar',
        AMST_AdmNo: 'ADM2023001',
        ASMCL_ClassName: 'X',
        ASMC_SectionName: 'A',
        ASCOMP_Subject: 'Project',
        ASCOMP_Complaints: 'Late submission of project',
        ASCOMP_Date: '2023-06-20T00:00:00',
        ASCOMP_FilePath: 'https://example.com/mock.docx',
        ASCOMP_FileName: 'details.docx',
        filetype: 'docx',
        document_Pathnew: 'https://view.officeapps.live.com/op/view.aspx?src=https://example.com/mock.docx'
    }
];

export async function getStudentComplaintsLoadData() {
    // In a real app, you would fetch from API
    // const response = await apiService.getURI("StudentCompliantsView/loaddata", 2);
    // return response;

    return {
        yearlist: MOCK_ACADEMIC_YEARS,
        studentdivlist: MOCK_COMPLAINTS,
        asmaY_Id: 1
    };
}

export async function getStudentComplaintsReport(data: { ASMAY_Id: number }) {
    // Mock filtering logic
    // In real app: apiService.create("StudentCompliantsView/report1", data)

    // For mock, just return the same list or filtered if we had more diverse data
    // Simulating a network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Returning same data for all years for simplicity in this mock
    return {
        studentdivlist: MOCK_COMPLAINTS,
    };
}
