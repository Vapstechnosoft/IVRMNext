'use server';

import { api } from '@/lib/apiService';
import type { IAcademicYearandClassandsection } from '@/types/exam/exam-module/report';

/**
 * BCEHS Final Promotion Report - Shared Dropdowns & Specific Actions
 */

// 🔹 Initial Data (Academic Years)
export async function getInitialData() {
    const url = '/Baldwin_Final_P_Report/Getdetails';
    return await api.get<any>('exam', url);
}

// 🔹 Class Dropdown (Shared pattern)
export async function getClassDropDownByAcademicYearlist(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    const url = `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

// 🔹 Section Dropdown (Shared pattern)
export async function getSectionsDropDownByAcademicYearandClasslist(asmaY_Id: number, asmcL_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    const url = `/exam_master_category/sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

// 🔹 Generate Report (Specific endpoint)
export async function getBCEHSFinalPromotionReport(data: any) {
    const url = '/Baldwin_All_Reports/Baldwin_Final_P_Report_card';
    const promise = await api.post<any>('exam', url, data);
    console.log('promise', promise);
    // Perform server-side data transformation as requested
    if (promise && promise.examlist && promise.subjectlist) {
        return transformReportData(promise, data.ASMAY_Id, data.ASMCL_Id, data.ASMS_Id);
    }
    return promise;
}

/**
 * Data Transformation logic moved from AngularJS controller to Server Action
 */
function transformReportData(promise: any, ASMAY_Id: number, ASMCL_Id: number, ASMS_Id: number) {
    const {
        examlist = [],
        subjectlist = [],
        studentmarks = [],
        examsubjectwise_details = [],
        process_examdetails = [],
        stu_subjects: studentwise_subjects = [],
        work_attendence = [],
        present_attendence = [],
        exmConfig_PromotionFlag,
        emP_MarksPerFlg,
        promotion_stumarks = [],
        promotion_stumarks_grpwise = [],
        prom_subj_groupdetails = [],
        prom_subj_grp_exms = [],
        prom_subj_groupdetails_all = [],
        promotion_subectdetails = []
    } = promise;

    // This logic mimics the AngularJS controller transformations
    // Grouping marks, calculating percentages, etc.
    
    // 1. Identify Final Exam
    let Final_Exam_Id: number | null = null;
    let Final_EYCE_Id: number | null = null;
    for (const exm of examlist) {
        if (exm.emE_FinalExamFlag) {
            Final_Exam_Id = exm.emE_Id;
            Final_EYCE_Id = exm.eycE_Id;
        }
    }

    // 2. Calculate Max Marks for Exams
    for (const exm of examlist) {
        const temp_subdetails = examsubjectwise_details.filter((sd: any) => sd.eycE_Id === exm.eycE_Id && sd.eyceS_AplResultFlg);
        const max_sub_marks = temp_subdetails.length > 0 ? Math.max(...temp_subdetails.map((item: any) => item.eyceS_MarksEntryMax)) : 0;
        exm.marks = max_sub_marks;
    }

    // 3. Process Subjects
    for (const sub of subjectlist) {
        const temp_subdetails = examsubjectwise_details.filter((sd: any) => sd.ismS_Id === sub.ismS_Id);
        const applicable_flag = temp_subdetails.length > 0 ? Math.max(...temp_subdetails.map((item: any) => item.eyceS_AplResultFlg ? 1 : 0)) : 0;
        sub.flag = applicable_flag === 1;
        
        const final_sd = temp_subdetails.find((sd: any) => sd.eycE_Id === Final_EYCE_Id);
        if (final_sd) {
            sub.emgR_Id = final_sd.emgR_Id;
        }
    }

    // 4. Transform Promotion Data if Flag is 'P'
    let temp_headers: any[] = [];
    if (exmConfig_PromotionFlag && emP_MarksPerFlg === 'P') {
        const final_exam_grps = prom_subj_grp_exms.filter((e1: any) => examlist.some((e2: any) => e2.emE_Id === e1.emE_Id && e2.emE_FinalExamFlag));
        const other_exam_grps = prom_subj_grp_exms.filter((e1: any) => examlist.some((e2: any) => e2.emE_Id === e1.emE_Id && !e2.emE_FinalExamFlag));

        const grp_ids_other = Array.from(new Set(other_exam_grps.map((ot: any) => ot.empsG_Id)));
        const grp_ids_final = Array.from(new Set(final_exam_grps.map((fin: any) => fin.empsG_Id)));

        let total_oth = 0;
        let oth_group_names: any[] = [];
        for (const grp of grp_ids_other) {
            const s_grp = prom_subj_groupdetails.find((sg: any) => sg.empsG_Id === grp);
            if (s_grp) {
                total_oth += Number(s_grp.empsG_PercentValue);
                oth_group_names.push(s_grp);
            }
        }
        if (total_oth > 0) {
            temp_headers.push({ flag: 'O', Per_val: total_oth, names: oth_group_names });
        }

        let total_fin = 0;
        let fin_group_names: any[] = [];
        for (const grp of grp_ids_final) {
            const s_grp = prom_subj_groupdetails.find((sg: any) => sg.empsG_Id === grp);
            if (s_grp) {
                total_fin += Number(s_grp.empsG_PercentValue);
                fin_group_names.push(s_grp);
            }
        }
        if (total_fin > 0) {
            let equal_flag = false;
            for (const exm of examlist) {
                if (exm.emE_FinalExamFlag && exm.marks === total_fin) {
                    equal_flag = true;
                }
            }
            temp_headers.push({ flag: 'F', Per_val: total_fin, names: fin_group_names, equal_flag });
        }
    }

    return {
        ...promise,
        examlist,
        subjectlist,
        temp_headers,
        Final_Exam_Id,
        Final_EYCE_Id
    };
}
