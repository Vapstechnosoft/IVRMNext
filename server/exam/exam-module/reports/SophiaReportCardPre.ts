'use server';

import { api } from '@/lib/apiService';

export async function getSophiaReportCardPre(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    examlist: { EME_Id: number; EME_ExamName: string }[];
    flagtype: string;
    Temp_AmstIds: { AMST_Id: number }[];
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
                        ASMCL_ClassName: 'PRE-NURSERY',
                        ASMC_SectionName: 'A',
                        AMST_DOB: '2021-05-20',
                        SPCCMH_HouseName: 'ASHOKA'
                    }
                ],
                getstudentwisesubjectlistnew: [
                    // English
                    { AMST_Id: 1, ISMS_Id: 101, ISMS_SubjectName: 'English (Oral)', EYCES_SubjectOrder: 1, EME_Id: 1241, ESTMPS_ObtainedGrade: 'A', ESTMPS_ObtainedMarks: 85 },
                    { AMST_Id: 1, ISMS_Id: 101, ISMS_SubjectName: 'English (Oral)', EYCES_SubjectOrder: 1, EME_Id: 1243, ESTMPS_ObtainedGrade: 'A+', ESTMPS_ObtainedMarks: 92 },
                    { AMST_Id: 1, ISMS_Id: 101, ISMS_SubjectName: 'English (Oral)', EYCES_SubjectOrder: 1, EME_Id: 1246, ESTMPS_ObtainedGrade: 'A+', ESTMPS_ObtainedMarks: 95 },
                    // Number Work
                    { AMST_Id: 1, ISMS_Id: 102, ISMS_SubjectName: 'Number Work', EYCES_SubjectOrder: 2, EME_Id: 1241, ESTMPS_ObtainedGrade: 'B', ESTMPS_ObtainedMarks: 75 },
                    { AMST_Id: 1, ISMS_Id: 102, ISMS_SubjectName: 'Number Work', EYCES_SubjectOrder: 2, EME_Id: 1243, ESTMPS_ObtainedGrade: 'A', ESTMPS_ObtainedMarks: 88 },
                    { AMST_Id: 1, ISMS_Id: 102, ISMS_SubjectName: 'Number Work', EYCES_SubjectOrder: 2, EME_Id: 1246, ESTMPS_ObtainedGrade: 'A+', ESTMPS_ObtainedMarks: 93 }
                ],
                getstudentwisesubjectsubsubjectlist: [
                    { AMST_Id: 1, ISMS_Id: 101, EMSS_Id: 501, EMSS_SubSubjectName: 'Recitation' },
                    { AMST_Id: 1, ISMS_Id: 101, EMSS_Id: 502, EMSS_SubSubjectName: 'Conversation' }
                ],
                getstudentmarksindidetails: [
                    { AMST_Id: 1, EME_Id: 1241, ISMS_Id: 101, EMSS_Id: 501, ESTMPSSS_ObtainedGrade: 'A', ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1243, ISMS_Id: 101, EMSS_Id: 501, ESTMPSSS_ObtainedGrade: 'A+', ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1246, ISMS_Id: 101, EMSS_Id: 501, ESTMPSSS_ObtainedGrade: 'A+', ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1241, ISMS_Id: 101, EMSS_Id: 502, ESTMPSSS_ObtainedGrade: 'B', ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1243, ISMS_Id: 101, EMSS_Id: 502, ESTMPSSS_ObtainedGrade: 'A', ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1246, ISMS_Id: 101, EMSS_Id: 502, ESTMPSSS_ObtainedGrade: 'A', ESTMPSSS_PassFailFlg: 'P' }
                ],
                getstudentwiseactiviteslist: [
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Completes work on time', EME_Id: 1241, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Completes work on time', EME_Id: 1243, EMGD_Name: 'A+' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Completes work on time', EME_Id: 1246, EMGD_Name: 'A+' },
                    { AMST_Id: 1, ECACT_SkillName: 'Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Helps others', EME_Id: 1241, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Helps others', EME_Id: 1243, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Helps others', EME_Id: 1246, EMGD_Name: 'A+' }
                ],
                work_attendence: [
                    { AMST_Id: 1, TotalSchoolDays: 180, TotalWorkingDays: 165, Total_Percentage: 91.6 }
                ],
                examwiseremarks: [
                    { AMST_Id: 1, ecterE_Remarks: 'Excellent progress across all terms. Very active in class activities.' }
                ],
                examwisemarksprocess: [
                    { classstrength: 35, Sectionstrength: 18 }
                ]
            }
        };

        // const url = '/JSHSExamReports/donexamconsolidatedreport';
        // const response = await api.post<any>('exam', url, data);
        // return response;
        return mockData;
    } catch (error) {
        console.error('getSophiaReportCardPre error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report'
        };
    }
}
