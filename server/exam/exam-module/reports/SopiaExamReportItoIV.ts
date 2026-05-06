'use server';

import { api } from '@/lib/apiService';

export async function getSopiaExamReportItoIV(data: {
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
                        ASMCL_ClassName: 'III',
                        ASMC_SectionName: 'A',
                        AMST_DOB: '2015-05-20',
                        SPCCMH_HouseName: 'ASHOKA',
                        ISMS_SubjectName: 'English',
                        SUBJECTGROUP: 'MAIN',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        ESTMPS_ObtainedMarks: 85,
                        EYCES_MarksDisplayFlg: true,
                        ESTMPS_Marks_Max: 400,
                        ESTMPS_Marks_Min: 140,
                        ESTMPS_Marks_Total: 340,
                        ESTMP_Percentage: 85,
                        ESTMP_ClassRank: 2,
                        ESTMP_Result: 'Pass',
                        ROWNUMBER: 1
                    },
                    {
                        AMST_Id: 1,
                        ISMS_SubjectName: 'Hindi',
                        SUBJECTGROUP: 'MAIN',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        ESTMPS_ObtainedMarks: 78,
                        EYCES_MarksDisplayFlg: true,
                        ROWNUMBER: 2
                    },
                    {
                        AMST_Id: 1,
                        ISMS_SubjectName: 'Mathematics',
                        SUBJECTGROUP: 'MAIN',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        ESTMPS_ObtainedMarks: 95,
                        EYCES_MarksDisplayFlg: true,
                        ROWNUMBER: 3
                    },
                    {
                        AMST_Id: 1,
                        ISMS_SubjectName: 'EVS',
                        SUBJECTGROUP: 'MAIN',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        ESTMPS_ObtainedMarks: 82,
                        EYCES_MarksDisplayFlg: true,
                        ROWNUMBER: 4
                    }
                ],
                getstudentwiseactiviteslist: [
                    { AMST_Id: 1, ECACT_SkillName: 'Cocurricular Activities', ECACTA_SkillArea: 'Music', EMGD_Name: 'A+', ECACT_Id: 1 },
                    { AMST_Id: 1, ECACT_SkillName: 'Cocurricular Activities', ECACTA_SkillArea: 'Dance', EMGD_Name: 'A', ECACT_Id: 1 },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal Qualities', ECACTA_SkillArea: 'Cleanliness', EMGD_Name: 'B+', ECACT_Id: 2 },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal Qualities', ECACTA_SkillArea: 'Punctuality', EMGD_Name: 'A', ECACT_Id: 2 }
                ],
                examwisemarksprocess: [
                    { AMST_Id: 1, classstrength: 40, Sectionstrength: 20 }
                ],
                examwisemarksprocess1: [
                    { AMST_Id: 1, EME_ExamName: 'First Unit Test', TTMSUAB_Abbreviation: 'Eng', ESTMPS_ObtainedMarks: 45, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'First Term Examination', TTMSUAB_Abbreviation: 'Eng', ESTMPS_ObtainedMarks: 85, ESTMPS_MaxMarks: 100, ESTMPS_MinMarks: 35, ESTMPS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_ExamName: 'Second Unit Test', TTMSUAB_Abbreviation: 'Eng', ESTMPS_ObtainedMarks: 40, ESTMPS_MaxMarks: 50, ESTMPS_MinMarks: 17.5, ESTMPS_PassFailFlg: 'P' }
                ],
                work_attendence: [
                    { AMST_Id: 1, TotalSchoolDays: 200, TotalWorkingDays: 180, Total_Percentage: 90 }
                ],
                getpromotionremarksdetails: [
                    { amsT_Id: 1, ecterE_Remarks: 'Good progress. Keep it up.' }
                ]
            }
        };
        return mockData;
    } catch (error) {
        console.error('getSopiaExamReportItoIV error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report'
        };
    }
}
