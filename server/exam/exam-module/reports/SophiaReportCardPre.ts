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
                        AMST_FirstName: 'A LAKSHAYA',
                        AMST_MiddleName: '',
                        AMST_LastName: '',
                        ASMCL_ClassName: '3rd Division',
                        ASMC_SectionName: 'A',
                        AMST_DOB: '2016-09-19',
                        SPCCMH_HouseName: 'Barat'
                    }
                ],
                st_ThomosTotal: [
                    {
                        AMST_Id: 1,
                        AMST_FirstName: 'A LAKSHAYA',
                        AMST_MiddleName: '',
                        AMST_LastName: '',
                        ASMCL_ClassName: '3rd Division',
                        ASMC_SectionName: 'A',
                        AMST_DOB: '2016-09-19',
                        SPCCMH_HouseName: 'Barat'
                    }
                ],
                getstudentwisesubjectlistnew: [
                    // Main Subjects
                    { AMST_Id: 1, ISMS_Id: 101, ISMS_SubjectName: 'English', EYCES_SubjectOrder: 1, EME_Id: 1241, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true },
                    { AMST_Id: 1, ISMS_Id: 101, ISMS_SubjectName: 'English', EYCES_SubjectOrder: 1, EME_Id: 1243, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true },
                    { AMST_Id: 1, ISMS_Id: 101, ISMS_SubjectName: 'English', EYCES_SubjectOrder: 1, EME_Id: 1246, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true },
                    
                    { AMST_Id: 1, ISMS_Id: 102, ISMS_SubjectName: 'Kannada', EYCES_SubjectOrder: 2, EME_Id: 1241, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true },
                    { AMST_Id: 1, ISMS_Id: 102, ISMS_SubjectName: 'Kannada', EYCES_SubjectOrder: 2, EME_Id: 1243, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true },
                    { AMST_Id: 1, ISMS_Id: 102, ISMS_SubjectName: 'Kannada', EYCES_SubjectOrder: 2, EME_Id: 1246, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true },

                    { AMST_Id: 1, ISMS_Id: 103, ISMS_SubjectName: 'Hindi', EYCES_SubjectOrder: 3, EME_Id: 1241, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true },
                    { AMST_Id: 1, ISMS_Id: 103, ISMS_SubjectName: 'Hindi', EYCES_SubjectOrder: 3, EME_Id: 1243, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true },
                    { AMST_Id: 1, ISMS_Id: 103, ISMS_SubjectName: 'Hindi', EYCES_SubjectOrder: 3, EME_Id: 1246, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true },

                    { AMST_Id: 1, ISMS_Id: 104, ISMS_SubjectName: 'Mathematics', EYCES_SubjectOrder: 4, EME_Id: 1241, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true, ESTMPS_ObtainedMarks: 67 },
                    { AMST_Id: 1, ISMS_Id: 104, ISMS_SubjectName: 'Mathematics', EYCES_SubjectOrder: 4, EME_Id: 1243, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true, ESTMPS_ObtainedMarks: 66 },
                    { AMST_Id: 1, ISMS_Id: 104, ISMS_SubjectName: 'Mathematics', EYCES_SubjectOrder: 4, EME_Id: 1246, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true, ESTMPS_ObtainedMarks: 62 },

                    { AMST_Id: 1, ISMS_Id: 105, ISMS_SubjectName: 'Computer Science', EYCES_SubjectOrder: 5, EME_Id: 1241, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true, ESTMPS_ObtainedMarks: 94 },
                    { AMST_Id: 1, ISMS_Id: 105, ISMS_SubjectName: 'Computer Science', EYCES_SubjectOrder: 5, EME_Id: 1243, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true, ESTMPS_ObtainedMarks: 100 },
                    { AMST_Id: 1, ISMS_Id: 105, ISMS_SubjectName: 'Computer Science', EYCES_SubjectOrder: 5, EME_Id: 1246, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true, ESTMPS_ObtainedMarks: 91 },

                    { AMST_Id: 1, ISMS_Id: 106, ISMS_SubjectName: 'Science/Social Studies', EYCES_SubjectOrder: 6, EME_Id: 1241, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true, ESTMPS_ObtainedMarks: 74 },
                    { AMST_Id: 1, ISMS_Id: 106, ISMS_SubjectName: 'Science/Social Studies', EYCES_SubjectOrder: 6, EME_Id: 1243, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true, ESTMPS_ObtainedMarks: 69 },
                    { AMST_Id: 1, ISMS_Id: 106, ISMS_SubjectName: 'Science/Social Studies', EYCES_SubjectOrder: 6, EME_Id: 1246, EYCES_GradeDisplayFlg: false, EYCES_MarksDisplayFlg: true, ESTMPS_ObtainedMarks: 88 },

                    { AMST_Id: 1, ISMS_Id: 107, ISMS_SubjectName: 'Hand- Writing', EYCES_SubjectOrder: 7, EME_Id: 1241, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'B' },
                    { AMST_Id: 1, ISMS_Id: 107, ISMS_SubjectName: 'Hand- Writing', EYCES_SubjectOrder: 7, EME_Id: 1243, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'B' },
                    { AMST_Id: 1, ISMS_Id: 107, ISMS_SubjectName: 'Hand- Writing', EYCES_SubjectOrder: 7, EME_Id: 1246, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'B' },

                    { AMST_Id: 1, ISMS_Id: 108, ISMS_SubjectName: 'Singing', EYCES_SubjectOrder: 8, EME_Id: 1241, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'B' },
                    { AMST_Id: 1, ISMS_Id: 108, ISMS_SubjectName: 'Singing', EYCES_SubjectOrder: 8, EME_Id: 1243, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'B' },
                    { AMST_Id: 1, ISMS_Id: 108, ISMS_SubjectName: 'Singing', EYCES_SubjectOrder: 8, EME_Id: 1246, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'B' },

                    { AMST_Id: 1, ISMS_Id: 109, ISMS_SubjectName: 'Art', EYCES_SubjectOrder: 9, EME_Id: 1241, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'A' },
                    { AMST_Id: 1, ISMS_Id: 109, ISMS_SubjectName: 'Art', EYCES_SubjectOrder: 9, EME_Id: 1243, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'A' },
                    { AMST_Id: 1, ISMS_Id: 109, ISMS_SubjectName: 'Art', EYCES_SubjectOrder: 9, EME_Id: 1246, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'B' },

                    { AMST_Id: 1, ISMS_Id: 110, ISMS_SubjectName: 'Physical Training', EYCES_SubjectOrder: 10, EME_Id: 1241, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'A' },
                    { AMST_Id: 1, ISMS_Id: 110, ISMS_SubjectName: 'Physical Training', EYCES_SubjectOrder: 10, EME_Id: 1243, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'A' },
                    { AMST_Id: 1, ISMS_Id: 110, ISMS_SubjectName: 'Physical Training', EYCES_SubjectOrder: 10, EME_Id: 1246, EYCES_GradeDisplayFlg: true, EYCES_MarksDisplayFlg: false, ESTMPS_ObtainedGrade: 'A' },
                ],
                getstudentwisesubjectsubsubjectlist: [
                    // English
                    { AMST_Id: 1, ISMS_Id: 101, EMSS_Id: 1, EMSS_SubSubjectName: 'Grammar' },
                    { AMST_Id: 1, ISMS_Id: 101, EMSS_Id: 2, EMSS_SubSubjectName: 'Spelling' },
                    { AMST_Id: 1, ISMS_Id: 101, EMSS_Id: 3, EMSS_SubSubjectName: 'Literature' },
                    // Kannada
                    { AMST_Id: 1, ISMS_Id: 102, EMSS_Id: 4, EMSS_SubSubjectName: 'Language' },
                    { AMST_Id: 1, ISMS_Id: 102, EMSS_Id: 5, EMSS_SubSubjectName: 'Spelling' },
                    // Hindi
                    { AMST_Id: 1, ISMS_Id: 103, EMSS_Id: 6, EMSS_SubSubjectName: 'Language' },
                    { AMST_Id: 1, ISMS_Id: 103, EMSS_Id: 7, EMSS_SubSubjectName: 'Spelling' },
                ],
                getstudentmarksindidetails: [
                    // English - Grammar
                    { AMST_Id: 1, EME_Id: 1241, ISMS_Id: 101, EMSS_Id: 1, ESTMPSSS_ObtainedMarks: 73, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1243, ISMS_Id: 101, EMSS_Id: 1, ESTMPSSS_ObtainedMarks: 66, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1246, ISMS_Id: 101, EMSS_Id: 1, ESTMPSSS_ObtainedMarks: 79, ESTMPSSS_PassFailFlg: 'P' },
                    // English - Spelling
                    { AMST_Id: 1, EME_Id: 1241, ISMS_Id: 101, EMSS_Id: 2, ESTMPSSS_ObtainedMarks: 64, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1243, ISMS_Id: 101, EMSS_Id: 2, ESTMPSSS_ObtainedMarks: 50, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1246, ISMS_Id: 101, EMSS_Id: 2, ESTMPSSS_ObtainedMarks: 56, ESTMPSSS_PassFailFlg: 'P' },
                    // English - Literature
                    { AMST_Id: 1, EME_Id: 1241, ISMS_Id: 101, EMSS_Id: 3, ESTMPSSS_ObtainedMarks: 74, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1243, ISMS_Id: 101, EMSS_Id: 3, ESTMPSSS_ObtainedMarks: 76, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1246, ISMS_Id: 101, EMSS_Id: 3, ESTMPSSS_ObtainedMarks: 69, ESTMPSSS_PassFailFlg: 'P' },
                    // Kannada - Language
                    { AMST_Id: 1, EME_Id: 1241, ISMS_Id: 102, EMSS_Id: 4, ESTMPSSS_ObtainedMarks: 52, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1243, ISMS_Id: 102, EMSS_Id: 4, ESTMPSSS_ObtainedMarks: 58, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1246, ISMS_Id: 102, EMSS_Id: 4, ESTMPSSS_ObtainedMarks: 52, ESTMPSSS_PassFailFlg: 'P' },
                    // Kannada - Spelling
                    { AMST_Id: 1, EME_Id: 1241, ISMS_Id: 102, EMSS_Id: 5, ESTMPSSS_ObtainedMarks: 79, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1243, ISMS_Id: 102, EMSS_Id: 5, ESTMPSSS_ObtainedMarks: 70, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1246, ISMS_Id: 102, EMSS_Id: 5, ESTMPSSS_ObtainedMarks: 69, ESTMPSSS_PassFailFlg: 'P' },
                    // Hindi - Language
                    { AMST_Id: 1, EME_Id: 1241, ISMS_Id: 103, EMSS_Id: 6, ESTMPSSS_ObtainedMarks: 46, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1243, ISMS_Id: 103, EMSS_Id: 6, ESTMPSSS_ObtainedMarks: 30, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1246, ISMS_Id: 103, EMSS_Id: 6, ESTMPSSS_ObtainedMarks: 57, ESTMPSSS_PassFailFlg: 'P' },
                    // Hindi - Spelling
                    { AMST_Id: 1, EME_Id: 1241, ISMS_Id: 103, EMSS_Id: 7, ESTMPSSS_ObtainedMarks: 58, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1243, ISMS_Id: 103, EMSS_Id: 7, ESTMPSSS_ObtainedMarks: 26, ESTMPSSS_PassFailFlg: 'P' },
                    { AMST_Id: 1, EME_Id: 1246, ISMS_Id: 103, EMSS_Id: 7, ESTMPSSS_ObtainedMarks: 61, ESTMPSSS_PassFailFlg: 'P' },
                ],
                getstudentwiseactiviteslist: [
                    // Co-Scholastic
                    { AMST_Id: 1, ECACT_SkillName: 'Co-Scholastic', ECACT_Id: 10, ECACTA_SkillArea: 'Robotics', EME_Id: 1241, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Co-Scholastic', ECACT_Id: 10, ECACTA_SkillArea: 'Robotics', EME_Id: 1243, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Co-Scholastic', ECACT_Id: 10, ECACTA_SkillArea: 'Robotics', EME_Id: 1246, EMGD_Name: 'A' },
                    // Study Habits
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Regularity and punctuality', EME_Id: 1241, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Regularity and punctuality', EME_Id: 1243, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Regularity and punctuality', EME_Id: 1246, EMGD_Name: 'A' },

                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Is attentive in class', EME_Id: 1241, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Is attentive in class', EME_Id: 1243, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Is attentive in class', EME_Id: 1246, EMGD_Name: 'A' },

                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Understands and follows instructions', EME_Id: 1241, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Understands and follows instructions', EME_Id: 1243, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Understands and follows instructions', EME_Id: 1246, EMGD_Name: 'B' },

                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Works independently', EME_Id: 1241, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Works independently', EME_Id: 1243, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Works independently', EME_Id: 1246, EMGD_Name: 'B' },

                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Gives appropriate response in class', EME_Id: 1241, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Gives appropriate response in class', EME_Id: 1243, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Study Habits', ECACT_Id: 1, ECACTA_SkillArea: 'Gives appropriate response in class', EME_Id: 1246, EMGD_Name: 'B' },

                    // Personal and Social Habits
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Behaviour in school', EME_Id: 1241, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Behaviour in school', EME_Id: 1243, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Behaviour in school', EME_Id: 1246, EMGD_Name: 'A' },

                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Is Helpful and Cooperative', EME_Id: 1241, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Is Helpful and Cooperative', EME_Id: 1243, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Is Helpful and Cooperative', EME_Id: 1246, EMGD_Name: 'A' },

                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Respect and care for common property', EME_Id: 1241, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Respect and care for common property', EME_Id: 1243, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Respect and care for common property', EME_Id: 1246, EMGD_Name: 'A' },

                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Enjoys working', EME_Id: 1241, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Enjoys working', EME_Id: 1243, EMGD_Name: 'B' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Enjoys working', EME_Id: 1246, EMGD_Name: 'A' },

                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Overall neatness', EME_Id: 1241, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Overall neatness', EME_Id: 1243, EMGD_Name: 'A' },
                    { AMST_Id: 1, ECACT_SkillName: 'Personal and Social Habits', ECACT_Id: 2, ECACTA_SkillArea: 'Overall neatness', EME_Id: 1246, EMGD_Name: 'A' },
                ],
                work_attendence: [
                    { AMST_Id: 1, TotalSchoolDays: 174, TotalWorkingDays: 171, Total_Percentage: 98 }
                ],
                examwiseremarks: [
                    { AMST_Id: 1, ecterE_Remarks: 'Good performance. Keep it up.' }
                ],
                examwisemarksprocess: [
                    { classstrength: 200, Sectionstrength: 50 }
                ],
                examWise_PaperType: [
                    { classstrength: 200, Sectionstrength: 50 }
                ]
            }
        };

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
