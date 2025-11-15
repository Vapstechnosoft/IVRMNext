'use server';

import { api } from '@/lib/apiService';
import type { CourseDetail, MasterCourseInput, MasterCourseResponse } from '@/types/hrms/master-course';

/**
 * Get all master course records (onload)
 * POST /api/MasterCourseFacade/onloadgetdetails
 */
export async function getMasterCourseList(roleId: number) {
    const url = '/api/MasterCourseFacade/onloadgetdetails';
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMC_Id: 0,
        MI_Id: roleId,
        HRMC_QulaificationName: 'string',
        HRMC_QualificationDesc: 'string',
        HRMC_Order: 0,
        HRMC_ActiveFlag: true,
        HRMC_DefaultQualFag: false,
        HRMC_SpecialisationFlag: false,
        CourseList: [],
        retrunMsg: 'string',
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
    console.log('🟠 [API] saveMasterCourse called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', !!data.HRMC_Id);
    
    const url = '/api/MasterCourseFacade';
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMC_Id: data.HRMC_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMC_QulaificationName: data.HRMC_QulaificationName,
        HRMC_QualificationDesc: data.HRMC_QualificationDesc,
        HRMC_Order: data.HRMC_Order || 0,
        HRMC_ActiveFlag: data.HRMC_ActiveFlag,
        HRMC_DefaultQualFag: data.HRMC_DefaultQualFag,
        HRMC_SpecialisationFlag: data.HRMC_SpecialisationFlag,
        CourseList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                HRMC_Id: data.HRMC_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMC_QulaificationName: data.HRMC_QulaificationName,
                HRMC_QualificationDesc: data.HRMC_QualificationDesc,
                HRMC_DefaultQualFag: data.HRMC_DefaultQualFag,
                HRMC_SpecialisationFlag: data.HRMC_SpecialisationFlag,
                HRMC_Order: data.HRMC_Order || 0,
                HRMC_ActiveFlag: data.HRMC_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        CourseDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterCourseResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMC_Id:', (response as any)?.HRMC_Id);
        
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const courseId = responseData?.HRMC_Id || (responseData?.data as any)?.HRMC_Id || 0;
        const hasCourseList = !!(responseData?.CourseList || responseData?.data?.CourseList);
        
        console.log('🟢 [API] Parsed - courseId:', courseId, 'retrunMsg:', retrunMsg, 'hasCourseList:', hasCourseList);
        
        // Check for duplicate
        const isDuplicate = retrunMsg === 'Duplicate' || retrunMsg.toLowerCase().includes('duplicate');
        
        console.log('🟢 [API] Duplicate check - retrunMsg:', retrunMsg, 'isDuplicate:', isDuplicate);
        
        // Check if "Update" or "Saved" message indicates success
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add';
        
        // Success if we have a course ID, CourseList, or success message (but not duplicate)
        const isSuccess = (courseId > 0 || hasCourseList || isUpdateSuccess) && !isDuplicate;
        
        console.log('🟢 [API] isSuccess:', isSuccess);
        
        let message = 'Failed to save course';
        if (isDuplicate) {
            message = 'Course with this name already exists';
        } else if (isSuccess) {
            message = data.HRMC_Id ? 'Course updated successfully' : 'Course added successfully';
        } else {
            message = retrunMsg || 'Failed to save course';
        }
        
        const formattedResponse = {
            success: isSuccess,
            message,
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred in api.post');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        throw error;
    }
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
    console.log('🟠 [API] activateDeactivateMasterCourse called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    
    const url = '/api/MasterCourseFacade/deactivateRecordById';
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMC_Id: data.HRMC_Id,
        MI_Id: data.MI_Id || 30,
        HRMC_QulaificationName: 'string',
        HRMC_QualificationDesc: 'string',
        HRMC_Order: 0,
        HRMC_ActiveFlag: data.HRMC_ActiveFlag,
        HRMC_DefaultQualFag: false,
        HRMC_SpecialisationFlag: false,
        CourseList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                HRMC_Id: data.HRMC_Id,
                MI_Id: data.MI_Id || 30,
                HRMC_QulaificationName: 'string',
                HRMC_QualificationDesc: 'string',
                HRMC_DefaultQualFag: false,
                HRMC_SpecialisationFlag: false,
                HRMC_Order: 0,
                HRMC_ActiveFlag: data.HRMC_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30,
        CourseDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await api.post<MasterCourseResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Toggle response received:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        const courseId = responseData?.HRMC_Id || 0;
        const isSuccess = courseId > 0 || responseData?.retrunMsg === 'Update';
        
        const formattedResponse = {
            success: isSuccess,
            message: isSuccess 
                ? `Course ${data.HRMC_ActiveFlag ? 'activated' : 'deactivated'} successfully`
                : 'Failed to toggle course status',
            data: responseData
        };
        
        console.log('🟢 [API] Formatted toggle response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Toggle error occurred');
        console.error('🔴 [API] Error:', error);
        throw error;
    }
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
