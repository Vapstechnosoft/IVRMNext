'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/ClgSectionAllotment';

// Initial Load Data: GET /api/ClgSectionAllotment/GetDropDownList
export async function getClgSectionAllotmentInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/GetDropDownList`);
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

// Academic Courses on Year Change: POST /api/ClgSectionAllotment/Get_academiccourse
export async function getClgSectionAllotmentAcademicCourses(data: { ASMAY_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/Get_academiccourse?ASMAY_Id=${asmayId}`,
            { ASMAY_Id: asmayId, asmaY_Id: asmayId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentAcademicCourses error:', error);
        return { success: false, message: 'Failed to fetch academic courses' } as any;
    }
}

// Branch List on Course Change: POST /api/ClgSectionAllotment/Getbranch
export async function getClgSectionAllotmentBranches(data: { ASMAY_Id: number; AMCO_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        const amcoId = Number(data.AMCO_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/Getbranch?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}`,
            { ASMAY_Id: asmayId, AMCO_Id: amcoId, asmaY_Id: asmayId, amcO_Id: amcoId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentBranches error:', error);
        return { success: false, message: 'Failed to fetch branches' } as any;
    }
}

// Semesters on Branch Change: POST /api/ClgSectionAllotment/Get_semister
export async function getClgSectionAllotmentSemesters(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        const amcoId = Number(data.AMCO_Id || 0);
        const ambId = Number(data.AMB_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/Get_semister?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}`,
            { ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: ambId, asmaY_Id: asmayId, amcO_Id: amcoId, amB_Id: ambId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentSemesters error:', error);
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

// Students List by Year, Course, Branch, Semester, Section: POST /api/ClgSectionAllotment/GetstudentdetailsbyYearandclass
export async function getClgSectionAllotmentStudents(data: any) {
    try {
        const asmayId = Number(data.ASMAY_Id ?? data.asmaY_Id ?? 0);
        const amcoId = Number(data.AMCO_Id ?? data.amcO_Id ?? 0);
        const ambId = Number(data.AMB_Id ?? data.amB_Id ?? 0);
        const amseId = Number(data.AMSE_Id ?? data.amsE_Id ?? 0);
        const acmsId = Number(data.ACMS_Id ?? data.acmS_Id ?? 0);
        const type = data.SectionAllotmentType || data.sectionAllotmentType || '';

        return await api.post<any>(
            'college',
            `${BASE_URL}/GetstudentdetailsbyYearandclass?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}&ACMS_Id=${acmsId}&SectionAllotmentType=${encodeURIComponent(type)}`,
            {
                ASMAY_Id: asmayId,
                AMCO_Id: amcoId,
                AMB_Id: ambId,
                AMSE_Id: amseId,
                ACMS_Id: acmsId,
                SectionAllotmentType: type,
                asmaY_Id: asmayId,
                amcO_Id: amcoId,
                amB_Id: ambId,
                amsE_Id: amseId,
                acmS_Id: acmsId,
                sectionAllotmentType: type
            }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentStudents error:', error);
        return { success: false, message: 'Failed to fetch student list' } as any;
    }
}

// Save Section Allotment (New, Change, Delete, Promotion, YearLoss): POST /api/ClgSectionAllotment/saveSctionAllotment
export async function saveClgSectionAllotment(data: any) {
    try {
        const payload = {
            asmaY_Id: Number(data.ASMAY_Id ?? data.asmaY_Id),
            amcO_Id: Number(data.AMCO_Id ?? data.amcO_Id),
            amB_Id: Number(data.AMB_Id ?? data.amB_Id),
            amsE_Id: Number(data.AMSE_Id ?? data.amsE_Id),
            acmS_Id: Number(data.ACMS_Id ?? data.acmS_Id),
            sectionAllotmentType: data.SectionAllotmentType ?? data.sectionAllotmentType,
            promotedflag: data.promotedflag ?? null,
            resultData1: data.resultData1
        };

        return await api.post<any>('college', `${BASE_URL}/saveSctionAllotment`, payload);
    } catch (error) {
        console.error('[Server] saveClgSectionAllotment error:', error);
        return { success: false, message: 'Failed to save section allotment' } as any;
    }
}

// Promotion: Course list on Year change: POST /api/ClgSectionAllotment/GetPromocourse
export async function getClgSectionAllotmentPromoCourses(data: { ASMAY_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/GetPromocourse?ASMAY_Id=${asmayId}`,
            { ASMAY_Id: asmayId, asmaY_Id: asmayId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentPromoCourses error:', error);
        return { success: false, message: 'Failed to fetch promotion courses' } as any;
    }
}

// Promotion: Branch list on Course change: POST /api/ClgSectionAllotment/GetPromobranch
export async function getClgSectionAllotmentPromoBranches(data: { AMCO_Id: number; ASMAY_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        const amcoId = Number(data.AMCO_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/GetPromobranch?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}`,
            { ASMAY_Id: asmayId, AMCO_Id: amcoId, asmaY_Id: asmayId, amcO_Id: amcoId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentPromoBranches error:', error);
        return { success: false, message: 'Failed to fetch promotion branches' } as any;
    }
}

// Promotion: Sem list on Branch change: POST /api/ClgSectionAllotment/GetPromosem
export async function getClgSectionAllotmentPromoSemesters(data: { AMB_Id: number; ASMAY_Id: number; AMCO_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        const amcoId = Number(data.AMCO_Id || 0);
        const ambId = Number(data.AMB_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/GetPromosem?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}`,
            { ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: ambId, asmaY_Id: asmayId, amcO_Id: amcoId, amB_Id: ambId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentPromoSemesters error:', error);
        return { success: false, message: 'Failed to fetch promotion semesters' } as any;
    }
}

// Promotion: Target Semester on Sem change: POST /api/ClgSectionAllotment/promsemonchange
export async function getClgSectionAllotmentPromoSemOnChange(data: { ASMAY_Id: number; AMSE_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        const amseId = Number(data.AMSE_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/promsemonchange?ASMAY_Id=${asmayId}&AMSE_Id=${amseId}`,
            { ASMAY_Id: asmayId, AMSE_Id: amseId, asmaY_Id: asmayId, amsE_Id: amseId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentPromoSemOnChange error:', error);
        return { success: false, message: 'Failed to fetch promotion target semester' } as any;
    }
}

// Year Loss: Courses on Year change: POST /api/ClgSectionAllotment/OnChangeyearlossAcademic
export async function getClgSectionAllotmentYearLossAcademic(data: { ASMAY_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/OnChangeyearlossAcademic?ASMAY_Id=${asmayId}`,
            { ASMAY_Id: asmayId, asmaY_Id: asmayId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentYearLossAcademic error:', error);
        return { success: false, message: 'Failed to fetch year loss courses' } as any;
    }
}

// Year Loss: Branches on Course change: POST /api/ClgSectionAllotment/Getyearlossbranch
export async function getClgSectionAllotmentYearLossBranch(data: { ASMAY_Id: number; AMCO_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        const amcoId = Number(data.AMCO_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/Getyearlossbranch?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}`,
            { ASMAY_Id: asmayId, AMCO_Id: amcoId, asmaY_Id: asmayId, amcO_Id: amcoId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentYearLossBranch error:', error);
        return { success: false, message: 'Failed to fetch year loss branches' } as any;
    }
}

// Year Loss: Semesters on Branch change: POST /api/ClgSectionAllotment/Getyearlosssem
export async function getClgSectionAllotmentYearLossSem(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        const amcoId = Number(data.AMCO_Id || 0);
        const ambId = Number(data.AMB_Id || 0);
        return await api.post<any>(
            'college',
            `${BASE_URL}/Getyearlosssem?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}`,
            { ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: ambId, asmaY_Id: asmayId, amcO_Id: amcoId, amB_Id: ambId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentYearLossSem error:', error);
        return { success: false, message: 'Failed to fetch year loss semesters' } as any;
    }
}

// Year Loss: Students list: POST /api/ClgSectionAllotment/GetStudentListByYear_yearloss1
export async function getClgSectionAllotmentYearLossStudents(data: any) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        const amcoId = Number(data.AMCO_Id || 0);
        const ambId = Number(data.AMB_Id || 0);
        const amseId = Number(data.AMSE_Id || 0);
        const acmsId = Number(data.ACMS_Id || 0);

        return await api.post<any>(
            'college',
            `${BASE_URL}/GetStudentListByYear_yearloss1?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}&ACMS_Id=${acmsId}`,
            { ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: ambId, AMSE_Id: amseId, ACMS_Id: acmsId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentYearLossStudents error:', error);
        return { success: false, message: 'Failed to fetch year loss students' } as any;
    }
}

// Update Roll No: Get Students: POST /api/ClgSectionAllotment/GetStudentListByURN
export async function getClgSectionAllotmentStudentsByURN(data: any) {
    try {
        const asmayId = Number(data.ASMAY_Id || 0);
        const amcoId = Number(data.AMCO_Id || 0);
        const ambId = Number(data.AMB_Id || 0);
        const amseId = Number(data.AMSE_Id || 0);
        const acmsId = Number(data.ACMS_Id || 0);

        return await api.post<any>(
            'college',
            `${BASE_URL}/GetStudentListByURN?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}&ACMS_Id=${acmsId}`,
            { ASMAY_Id: asmayId, AMCO_Id: amcoId, AMB_Id: ambId, AMSE_Id: amseId, ACMS_Id: acmsId }
        );
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentStudentsByURN error:', error);
        return { success: false, message: 'Failed to fetch students for roll number update' } as any;
    }
}

// Update Roll No: Save Roll Numbers: POST /api/ClgSectionAllotment/GetStudentListByURNsave
export async function saveClgSectionAllotmentRollNo(data: any) {
    try {
        const payload = {
            updateRollNo: (data.updateRollNo || []).map((s: any) => ({
                amcsT_Id: Number(s.amcsT_Id ?? s.amsT_Id ?? 0),
                acysT_Id: Number(s.acysT_Id ?? 0),
                acysT_RollNo: Number(s.pdays ?? s.acysT_RollNo ?? 0)
            }))
        };

        return await api.post<any>('college', `${BASE_URL}/GetStudentListByURNsave`, payload);
    } catch (error) {
        console.error('[Server] saveClgSectionAllotmentRollNo error:', error);
        return { success: false, message: 'Failed to update roll numbers' } as any;
    }
}
