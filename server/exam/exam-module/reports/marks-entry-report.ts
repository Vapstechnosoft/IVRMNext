'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';

const ACADEMIC_YEARS = [{ asmaY_Id: 2023, asmaY_Year: '2023-2024' }];

const CLASSES = [
    { asmcL_Id: 10, asmcL_ClassName: 'I' },
    { asmcL_Id: 11, asmcL_ClassName: 'II' }
];

const SECTIONS = [
    { asmS_Id: 0, asmC_SectionName: 'All' },
    { asmS_Id: 100, asmC_SectionName: 'A' },
    { asmS_Id: 101, asmC_SectionName: 'B' }
];

const EXAMS = [
    { emE_Id: 50, emE_ExamName: 'Mid Term' },
    { emE_Id: 51, emE_ExamName: 'Annual' }
];

export async function getDetails() {
    return {
        acdlist: ACADEMIC_YEARS
    };
}

export async function getClasses(yearId: any) {
    return {
        ctlist: CLASSES
    };
}

export async function getSections(classId: any) {
    return {
        seclist: SECTIONS
    };
}

export async function getExams(sectionId: any) {
    return {
        examlist: EXAMS
    };
}

export async function getReportDetails(data: any) {
    try {
        const url = '/Marks_Entry_Report_/report';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch {
        return {
            subjectlist: [
                { ISMS_Id: 1, ISMS_SubjectName: 'English' },
                { ISMS_Id: 2, ISMS_SubjectName: 'Kannada' },
                { ISMS_Id: 3, ISMS_SubjectName: 'Mathematics' }
            ],
            sectionlist: [
                {
                    ASMCL_ClassName: 'I',
                    ASMC_SectionName: 'A',
                    subjecttemp: [
                        { ISMS_Id: 1, SourceMarksEntryFlag: 1, SourceMarksColorFlag: 'green', SourceMarksEntry: '25' },
                        { ISMS_Id: 2, SourceMarksEntryFlag: 2, SourceMarksColorFlag: 'orange', SourceMarksEntry: '18' },
                        { ISMS_Id: 3, SourceMarksEntryFlag: 0, SourceMarksColorFlag: 'black', SourceMarksEntry: 'ABS' }
                    ]
                },
                {
                    ASMCL_ClassName: 'I',
                    ASMC_SectionName: 'A',
                    subjecttemp: [
                        { ISMS_Id: 1, SourceMarksEntryFlag: 1, SourceMarksColorFlag: 'green', SourceMarksEntry: '24' },
                        { ISMS_Id: 2, SourceMarksEntryFlag: 1, SourceMarksColorFlag: 'green', SourceMarksEntry: '22' },
                        { ISMS_Id: 3, SourceMarksEntryFlag: 1, SourceMarksColorFlag: 'green', SourceMarksEntry: '20' }
                    ]
                }
            ],
            yearname: '2023-2024',
            classname: 'I',
            sectioname: 'A',
            examname: 'Mid Term'
        };
    }
}
