'use server';

import { api } from '@/lib/apiService';

export async function getSopiaExamReportTermExam(data: {
    EME_Id: number;
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    Temp_AmstIds: { AMST_Id: number }[];
    selectedclass: { yearid: number }[];
}) {
    try {
        const mockData = {
            success: true,
            data: {
                examwisedetailsnew: [
                    {
                        AMST_Id: 1,
                        AMST_FirstName: 'PRANAV',
                        AMST_MiddleName: 'S',
                        AMST_LastName: 'JACK',
                        ASMCL_ClassName: 'VIII',
                        ASMC_SectionName: 'A',
                        AMST_DOB: '2012-05-20',
                        SPCCMH_HouseName: 'ASHOKA',
                        ISMS_SubjectName: 'English',
                        SUBJECTGROUP: 'MAIN',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        ESTMPS_ObtainedMarks: 85,
                        ESTMPS_ClassHighest: 92,
                        ESTMPS_SectionHighest: 90,
                        ESTMPS_ClassAverage: 75.5,
                        ESTMPS_SectionAverage: 72.3,
                        ESTMPS_ClassRank: 2,
                        ESTMPS_SectionRank: 1,
                        Percentile: 98.5,
                        EYCES_AplFResultFlg: false,
                        ISMS_Id1: 101,
                        rowNo: 1
                    },
                    {
                        AMST_Id: 1,
                        ISMS_SubjectName: 'Hindi',
                        SUBJECTGROUP: 'MAIN',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        ESTMPS_ObtainedMarks: 78,
                        ESTMPS_ClassHighest: 85,
                        ESTMPS_SectionHighest: 82,
                        ESTMPS_ClassAverage: 65,
                        ESTMPS_SectionAverage: 62,
                        ESTMPS_ClassRank: 5,
                        ESTMPS_SectionRank: 3,
                        Percentile: 85.0,
                        EYCES_AplFResultFlg: false,
                        ISMS_Id1: 102,
                        rowNo: 2
                    },
                    {
                        AMST_Id: 1,
                        ISMS_SubjectName: 'Mathematics',
                        SUBJECTGROUP: 'MAIN',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        ESTMPS_ObtainedMarks: 95,
                        ESTMPS_ClassHighest: 98,
                        ESTMPS_SectionHighest: 96,
                        ESTMPS_ClassAverage: 65.2,
                        ESTMPS_SectionAverage: 68.1,
                        ESTMPS_ClassRank: 1,
                        ESTMPS_SectionRank: 1,
                        Percentile: 99.8,
                        EYCES_AplFResultFlg: false,
                        ISMS_Id1: 103,
                        rowNo: 3
                    },
                    {
                        AMST_Id: 1,
                        ISMS_SubjectName: 'General Science',
                        SUBJECTGROUP: 'MAIN',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        ESTMPS_ObtainedMarks: 88,
                        ESTMPS_ClassHighest: 94,
                        ESTMPS_SectionHighest: 92,
                        ESTMPS_ClassAverage: 70,
                        ESTMPS_SectionAverage: 71,
                        ESTMPS_ClassRank: 3,
                        ESTMPS_SectionRank: 2,
                        Percentile: 95.5,
                        EYCES_AplFResultFlg: false,
                        ISMS_Id1: 104,
                        rowNo: 4
                    },
                    {
                        AMST_Id: 1,
                        ISMS_SubjectName: 'Social Science',
                        SUBJECTGROUP: 'MAIN',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        ESTMPS_ObtainedMarks: 92,
                        ESTMPS_ClassHighest: 95,
                        ESTMPS_SectionHighest: 94,
                        ESTMPS_ClassAverage: 78,
                        ESTMPS_SectionAverage: 76,
                        ESTMPS_ClassRank: 2,
                        ESTMPS_SectionRank: 2,
                        Percentile: 97.2,
                        EYCES_AplFResultFlg: false,
                        ISMS_Id1: 105,
                        rowNo: 5
                    }
                ],
                studentwise_total: [
                    {
                        AMST_Id: 1,
                        MaxMarks_Total: 500,
                        MinMarks_Total: 175,
                        ObtainedMarks_Total: 438,
                        Percentage: 87.6
                    }
                ],
                examwisemarksprocess: [
                    { AMST_Id: 1, ISMS_Id: 101, Percentile: 98.5, classstrength: 45, Sectionstrength: 22 },
                    { AMST_Id: 1, ISMS_Id: 102, Percentile: 85.0, classstrength: 45, Sectionstrength: 22 },
                    { AMST_Id: 1, ISMS_Id: 103, Percentile: 99.8, classstrength: 45, Sectionstrength: 22 },
                    { AMST_Id: 1, ISMS_Id: 104, Percentile: 95.5, classstrength: 45, Sectionstrength: 22 },
                    { AMST_Id: 1, ISMS_Id: 105, Percentile: 97.2, classstrength: 45, Sectionstrength: 22 }
                ],
                examwisemarksprocess1: [
                    { AMST_Id: 1, EME_ExamName: 'First Unit Test', TTMSUAB_Abbreviation: 'Eng', ESTMPS_ObtainedMarks: 42, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'First Unit Test', TTMSUAB_Abbreviation: 'Hin', ESTMPS_ObtainedMarks: 38, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'First Unit Test', TTMSUAB_Abbreviation: 'Math', ESTMPS_ObtainedMarks: 48, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'First Unit Test', TTMSUAB_Abbreviation: 'G.Sci', ESTMPS_ObtainedMarks: 44, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'First Unit Test', TTMSUAB_Abbreviation: 'S.Sci', ESTMPS_ObtainedMarks: 46, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    
                    { AMST_Id: 1, EME_ExamName: 'First Term Examination', TTMSUAB_Abbreviation: 'Eng', ESTMPS_ObtainedMarks: 85, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'First Term Examination', TTMSUAB_Abbreviation: 'Hin', ESTMPS_ObtainedMarks: 78, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'First Term Examination', TTMSUAB_Abbreviation: 'Math', ESTMPS_ObtainedMarks: 95, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'First Term Examination', TTMSUAB_Abbreviation: 'G.Sci', ESTMPS_ObtainedMarks: 88, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'First Term Examination', TTMSUAB_Abbreviation: 'S.Sci', ESTMPS_ObtainedMarks: 92, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    
                    { AMST_Id: 1, EME_ExamName: 'Second Unit Test', TTMSUAB_Abbreviation: 'Eng', ESTMPS_ObtainedMarks: 40, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'Second Unit Test', TTMSUAB_Abbreviation: 'Hin', ESTMPS_ObtainedMarks: 35, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'Second Unit Test', TTMSUAB_Abbreviation: 'Math', ESTMPS_ObtainedMarks: 46, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'Second Unit Test', TTMSUAB_Abbreviation: 'G.Sci', ESTMPS_ObtainedMarks: 41, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'Second Unit Test', TTMSUAB_Abbreviation: 'S.Sci', ESTMPS_ObtainedMarks: 43, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },

                    { AMST_Id: 1, EME_ExamName: 'Pre Final Examination', TTMSUAB_Abbreviation: 'Eng', ESTMPS_ObtainedMarks: 82, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'Pre Final Examination', TTMSUAB_Abbreviation: 'Hin', ESTMPS_ObtainedMarks: 75, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'Pre Final Examination', TTMSUAB_Abbreviation: 'Math', ESTMPS_ObtainedMarks: 94, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'Pre Final Examination', TTMSUAB_Abbreviation: 'G.Sci', ESTMPS_ObtainedMarks: 86, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'Pre Final Examination', TTMSUAB_Abbreviation: 'S.Sci', ESTMPS_ObtainedMarks: 90, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' }
                ],
                work_attendence: [
                    { AMST_Id: 1, TotalSchoolDays: 200, TotalWorkingDays: 185, Total_Percentage: 92.5 }
                ],
                getpromotionremarksdetails: [
                    { amsT_Id: 1, ecterE_Remarks: 'Excellent performance in all subjects. Promoted to IX Standard.' }
                ]
            }
        };
        // const url = '/BaldwinAllReport/GetSopiaReport';
        // const response = await api.post<any>('exam', url, data);
        // return response;
        return mockData;
    } catch (error) {
        console.error('getSopiaExamReportTermExam error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report'
        };
    }
}
