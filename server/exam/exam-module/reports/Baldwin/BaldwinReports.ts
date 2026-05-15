'use server';

import { api } from '@/lib/apiService';

export async function getBBHSFinalPromotionReportBBHS(data: any) {
    return await getBaldwinReportDetails(data);
}

export async function getPromotionReportStdIX2021(data: any) {
    return await getBaldwinReportDetails(data);
}

export async function getPromotionReportIX(data: any) {
    return await getBaldwinReportDetails(data);
}

export async function getBaldwinReportDetails(data: any) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const { selectedStudents = [], studentDetails = [] } = data;

    const subjects = [
        { ismS_Id: 1, ismS_SubjectName: 'ENGLISH LANGUAGE', flag: true },
        { ismS_Id: 2, ismS_SubjectName: 'ENGLISH LITERATURE', flag: true },
        { ismS_Id: 3, ismS_SubjectName: 'MATHEMATICS', flag: true },
        { ismS_Id: 4, ismS_SubjectName: 'SCIENCE', flag: true },
        { ismS_Id: 5, ismS_SubjectName: 'SOCIAL STUDIES', flag: true },
        { ismS_Id: 6, ismS_SubjectName: 'KANNADA/HINDI', flag: true },
        { ismS_Id: 7, ismS_SubjectName: 'COMPUTER', flag: true },
        { ismS_Id: 8, ismS_SubjectName: 'VALUE EDUCATION', flag: false },
        { ismS_Id: 9, ismS_SubjectName: 'GENERAL KNOWLEDGE', flag: false }
    ];

    const exams = [
        { emE_Id: 1, emE_ExamName: 'UNIT TEST I', marks: 20, emE_FinalExamFlag: false },
        { emE_Id: 2, emE_ExamName: 'HALF YEARLY', marks: 80, emE_FinalExamFlag: false },
        { emE_Id: 3, emE_ExamName: 'ANNUAL EXAM', marks: 100, emE_FinalExamFlag: true }
    ];

    const student_list = (studentDetails.length > 0 ? studentDetails : selectedStudents.map((id: any) => ({ amsT_Id: Number(id), studentName: 'MOCK STUDENT', amsT_AdmNo: 'MOCK/001' }))).map((s: any, index: number) => ({
        amsT_Id: s.amsT_Id,
        amsT_FirstName: s.studentName || (index % 2 === 0 ? 'ARAVIND SWAMY' : 'SNEHA REDDY'),
        amsT_AdmNo: s.amsT_AdmNo || `B2023/00${index + 1}`,
        amsT_DOB: s.amsT_DOB || (index % 2 === 0 ? '2009-05-15' : '2009-11-22'),
        final_subj_marks: subjects.map(sub => ({
            sub_details: { ...sub, estmppS_ObtainedMarks: 85, estmppS_Remarks: 'Good' },
            subj_marks_details: exams.map(e => ({
                emE_Id: e.emE_Id,
                estmpS_ObtainedMarks: Math.floor(Math.random() * e.marks),
                estmpS_ObtainedGrade: 'A'
            }))
        })),
        stu_subjects: subjects.map(sub => ({ ...sub, estmppS_ObtainedMarks: 90 })),
        stu_student_marks: [],
        stu_Total_Array_Grp: [{ total_s_o: 550, total_s_f: 580 }],
        stu_Total_total_grp: 600,
        total_percentage: 85.5,
        overall_percentage: 87.2,
        total_Exams: 650
    }));

    const attendanceMonths = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'Febrauary', 'March', 'April'];
    const generateAttendance = (studentId: number) => {
        const att: any = { AMST_Id: studentId, TotalWorkingDays: 210, TotalPresentDays: 195, Total_Percentage: 92.8 };
        attendanceMonths.forEach(m => att[m] = Math.floor(Math.random() * 20) + 5);
        return [att];
    };

    return {
        student_list,
        exam_list: exams,
        temp_headers: [
            { flag: 'O', Per_val: 20, equal_flag: false },
            { flag: 'F', Per_val: 100, equal_flag: false }
        ],
        exam_process_details: student_list.flatMap(s => exams.map(e => ({
            amsT_Id: s.amsT_Id,
            emE_Id: e.emE_Id,
            estmP_TotalObtMarks: 150,
            estmP_Percentage: 75,
            estmP_SectionRank: 5,
            estmP_ClassRank: 12
        }))),
        promotion_student_marks: student_list.flatMap(s => subjects.map(sub => ({
            amsT_Id: s.amsT_Id,
            ismS_Id: sub.ismS_Id,
            estmppS_ObtainedMarks: 88,
            estmppS_MaxMarks: 100,
            estmppS_ObtainedGrade: 'A',
            estmppS_Remarks: 'Excellent'
        }))),
        promotion_main_marks: student_list.map(s => ({
            amsT_Id: s.amsT_Id,
            estmpP_SectionRank: 5
        })),
        stud_work_attendence: student_list.flatMap(s => generateAttendance(s.amsT_Id)),
        stud_present_attendence: student_list.flatMap(s => generateAttendance(s.amsT_Id)),
        ExmConfig_PromotionFlag: true,
        EMP_MarksPerFlg: 'P', // Toggle between 'P', 'F', 'T' to see variants
        Year_Name: '2023-24',
        Class_Teacher_Name: 'MS. SARAH WILLIAMS',
        Class_Name: 'IX',
        Section_Name: 'A',
        total_max_sub_marks: 100,
        masterinstitution: {
            mI_Name: 'BALDWIN BOYS HIGH SCHOOL',
            mI_Address1: '14, Richmond Road, Bangalore-560025',
            mI_Logo: 'https://dcampusstrg.blob.core.windows.net/files/Baldwin_Logo.png'
        }
    };
}
