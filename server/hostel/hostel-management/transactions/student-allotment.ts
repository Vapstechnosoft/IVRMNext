'use server';

import { api } from '@/lib/apiService';
import { StudentAllotmentSchema } from '@/schemas/hostel/transactions/student-allotment.schema';
import { revalidatePath } from 'next/cache';

const URL_BASE = 'HostelAllotForStudent/';

// Types based on JS usage
export interface StudentAllotmentLoadData {
  yearlist: { asmaY_Id: number; asmaY_Year: string }[];
  hostel_list: { hlmH_Id: number; hlmH_Name: string }[];
  student_allotlist: any[]; // Define specific type if possible
  classlist: { asmcL_Id: number; asmcL_ClassName: string }[];
  sectionlist: { asmS_Id: number; asmC_SectionName: string }[];
  roomcatgry_list: { hlmrcA_Id: number; hlmrcA_RoomCategory: string }[];
  room_list: { hrmrM_Id: number; hrmrM_RoomNo: string }[];
  asmaY_Id: number;
}

export const getStudentAllotmentLoadData = async () => {
  try {
    const response = await api.get<StudentAllotmentLoadData>('default', URL_BASE + 'loaddata/2');
    return response.data;
  } catch (error) {
    console.error('Error fetching student allotment load data:', error);
    return { 
        yearlist: [], 
        hostel_list: [], 
        student_allotlist: [], 
        classlist: [], 
        sectionlist: [],
        roomcatgry_list: [],
        room_list: [],
        asmaY_Id: 0
    };
  }
};

export const getStudentInfo = async (HLMH_Id: number) => {
    try {
        const response = await api.create('default', URL_BASE + 'get_studInfo', { HLMH_Id });
        return response.data; // Expecting housewise_studentList
    } catch (error) {
        console.error('Error fetching student info:', error);
        return { housewise_studentList: [] };
    }
}

export const getRoomDetails = async (HRMRM_Id: number) => {
    try {
        const response = await api.create('default', URL_BASE + 'get_roomdetails', { HRMRM_Id });
        return response.data; // Expecting hrmrM_BedCapacity
    } catch (error) {
        console.error('Error fetching room details:', error);
        return null; 
    }
}

export const saveStudentAllotment = async (data: StudentAllotmentSchema) => {
  try {
    // Transform schema to payload expected by API
    // Note: JS code uses $filter date format 'yyyy-MM-dd'
    const payload = {
        HLHSALT_Id: data.HLHSALT_Id,
        HLHSALT_AllotmentDate: data.HLHSALT_AllotmentDate, //.toISOString(), // OR format as needed by backend
        ASMAY_Id: data.ASMAY_Id,
        HLMH_Id: data.HLMH_Id,
        HLMRCA_Id: data.HLMRCA_Id,
        AMST_Id: data.AMST_Id,
        ASMCL_Id: data.ASMCL_Id,
        ASMS_Id: data.ASMS_Id,
        HRMRM_Id: data.HRMRM_Id,
        HLHSALT_NoOfBeds: data.HLHSALT_NoOfBeds,
        HLHSALT_AllotRemarks: data.HLHSALT_AllotRemarks,
        HLHSALT_VacateFlg: data.HLHSALT_VacateFlg,
        HLHSALT_VacatedDate: data.HLHSALT_VacatedDate,
        HLHSALT_VacateRemarks: data.HLHSALT_VacateRemarks,
    };
    
    const response = await api.create('default', URL_BASE + 'savedata', payload);
     if (response.data.returnval) {
        revalidatePath('/hostel/transactions/student-allotment');
    }
    return response.data;
  } catch (error) {
    console.error('Error saving student allotment:', error);
    return { returnval: false, message: 'Failed to save' };
  }
};
