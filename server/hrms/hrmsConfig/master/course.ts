'use server';

import { api } from '@/lib/apiService';
import type { CourseDetail, MasterCourseInput, MasterCourseResponse } from '@/types/hrms/master-course';

/**
 * Get all master course records (onload)
 * POST /api/MasterCourseFacade/onloadgetdetails
 */
export async function getMasterCourseList(roleId: number) {
    const url = '/api/MasterCourseFacade/onloadgetdetails';
    const requestBody = {
        HRMC_Id: 0,
        MI_Id: 30,
        HRMC_QulaificationName: 'string',
        HRMC_QualificationDesc: 'string',
        HRMC_Order: 0,
        HRMC_ActiveFlag: true,
        HRMC_DefaultQualFag: false,
        HRMC_SpecialisationFlag: false,
        CourseList: [],
        retrunMsg: '',
        roleId: roleId,
        CourseDTO: []
    };
    return await api.post<MasterCourseResponse>('hrms', url, requestBody);
}

/**
 * Create or Update master course item
 * POST /api/MasterCourseFacade
 */
export async function saveMasterCourse(data: MasterCourseInput) {
    const url = '/api/MasterCourseFacade';
    const requestBody = {
        HRMC_Id: data.HRMC_Id || 0,
        MI_Id: 30,
        HRMC_QulaificationName: data.HRMC_QulaificationName,
        HRMC_QualificationDesc: data.HRMC_QualificationDesc,
        HRMC_Order: data.HRMC_Order || 0,
        HRMC_ActiveFlag: data.HRMC_ActiveFlag,
        HRMC_DefaultQualFag: data.HRMC_DefaultQualFag,
        HRMC_SpecialisationFlag: data.HRMC_SpecialisationFlag,
        CourseList: [],
        retrunMsg: '',
        roleId: data.MI_Id || 0,
        CourseDTO: []
    };
    return await api.post<MasterCourseResponse>('hrms', url, requestBody);
}

/**
 * Activate or Deactivate a master course record
 * POST /api/MasterCourseFacade/deactivateRecordById
 */
export async function activateDeactivateMasterCourse(data: {
    HRMC_Id: number;
    HRMC_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterCourseFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMC_Id: data.HRMC_Id,
        MI_Id: 30,
        HRMC_QulaificationName: 'string',
        HRMC_QualificationDesc: 'string',
        HRMC_Order: 0,
        HRMC_ActiveFlag: data.HRMC_ActiveFlag,
        HRMC_DefaultQualFag: false,
        HRMC_SpecialisationFlag: false,
        CourseList: [],
        retrunMsg: '',
        roleId: 0,
        CourseDTO: []
    };
    return await api.post<MasterCourseResponse>('hrms', url, requestBody);
}

/**
 * Get details of a specific master course by ID
 * GET /api/MasterCourseFacade/getRecordById/{id}
 */
export async function getMasterCourseDetails(id: number) {
    const url = `/api/MasterCourseFacade/getRecordById/${id}`;
    return await api.get<MasterCourseResponse>('hrms', url);
}

/**
 * Save order for multiple courses
 * POST /api/MasterCourseFacade
 */
export async function saveMasterCourseOrder(courses: CourseDetail[]) {
    const url = '/api/MasterCourseFacade';
    const requestBody = {
        HRMC_Id: 0,
        MI_Id: 30,
        HRMC_QulaificationName: 'string',
        HRMC_QualificationDesc: 'string',
        HRMC_Order: 0,
        HRMC_ActiveFlag: true,
        HRMC_DefaultQualFag: false,
        HRMC_SpecialisationFlag: false,
        CourseList: [],
        retrunMsg: '',
        roleId: 0,
        CourseDTO: courses.map((course) => ({
            HRMC_Id: course.HRMC_Id,
            MI_Id: 30,
            HRMC_QulaificationName: course.HRMC_QulaificationName,
            HRMC_QualificationDesc: course.HRMC_QualificationDesc,
            HRMC_Order: course.HRMC_Order,
            HRMC_ActiveFlag: course.HRMC_ActiveFlag,
            HRMC_DefaultQualFag: course.HRMC_DefaultQualFag,
            HRMC_SpecialisationFlag: course.HRMC_SpecialisationFlag
        }))
    };
    return await api.post<MasterCourseResponse>('hrms', url, requestBody);
}
