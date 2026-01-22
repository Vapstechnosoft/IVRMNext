'use server';

import { api } from '@/lib/apiService';
import { LeaveApplyPayload, LeaveLoadData } from './types';

// Mock Data
const MOCK_STUDENT_DETAILS = [
    {
        asmS_Id: 101,
        asmcL_Id: 10,
        asmcL_ClassName: "X",
        asmC_SectionName: "A",
        amsT_Id: 500,
        amsT_FirstName: "John Doe",
        amsT_RegistrationNo: "REG2023001",
        amsT_MobileNo: 9876543210,
        amsT_emailId: "john.doe@example.com"
    }
];

let MOCK_LEAVE_APPLICATIONS = [
    {
        aslA_Id: 1,
        asmS_Id: 101,
        aslA_Flag: "Leave",
        aslA_ApplyDate: "2023-10-01T00:00:00",
        aslA_FromDate: "2023-10-05T00:00:00",
        aslA_ToDate: "2023-10-06T00:00:00",
        aslA_Reason: "Fever",
        aslA_Status: "Approved",
        aslA_ActiveFlag: true,
        aslA_LeaveId: 1001,
        amsT_FirstName: "John Doe",
        asmcL_ClassName: "X",
        asmC_SectionName: "A"
    },
    {
        aslA_Id: 2,
        asmS_Id: 101,
        aslA_Flag: "OnStudy",
        aslA_ApplyDate: "2023-11-10T00:00:00",
        aslA_FromDate: "2023-11-15T00:00:00",
        aslA_ToDate: "2023-11-15T00:00:00",
        aslA_Reason: "Math Olympiad",
        aslA_Status: "Pending",
        aslA_ActiveFlag: true,
        aslA_LeaveId: 1002,
        amsT_FirstName: "John Doe",
        asmcL_ClassName: "X",
        asmC_SectionName: "A"
    }
];

export async function getLeaveLoadData(): Promise<LeaveLoadData> {
    console.info('Fetching Leave load data (mock)');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        roletype: "Student",
        studentdetails: MOCK_STUDENT_DETAILS,
        allstuddata: MOCK_LEAVE_APPLICATIONS
    };
}

export async function applyLeave(data: LeaveApplyPayload) {
    console.info('Applying Leave (mock):', data);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate saving
    const newLeave = {
        aslA_Id: data.ASLA_Id || Math.floor(Math.random() * 1000) + 10,
        asmS_Id: 101,
        aslA_Flag: data.ASLA_Flag,
        aslA_ApplyDate: data.ASLA_ApplyDate,
        aslA_FromDate: data.ASLA_FromDate,
        aslA_ToDate: data.ASLA_ToDate,
        aslA_Reason: data.ASLA_Reason,
        aslA_Status: "Pending",
        aslA_ActiveFlag: true,
        aslA_LeaveId: data.ASLA_LeaveId || 0,
        amsT_FirstName: "John Doe",
        asmcL_ClassName: "X",
        asmC_SectionName: "A"
    };

    // Update mock store (in-memory only for this session, resets on restart obviously)
    // In a real server action, this wouldn't persist across reloads without a DB, 
    // but for the UI flow it works.
    if (data.ASLA_Id && data.ASLA_Id > 0) {
        // Edit
        MOCK_LEAVE_APPLICATIONS = MOCK_LEAVE_APPLICATIONS.map(l => l.aslA_Id === data.ASLA_Id ? { ...l, ...newLeave, aslA_Status: l.aslA_Status } : l);
    } else {
        // Add
        MOCK_LEAVE_APPLICATIONS = [newLeave, ...MOCK_LEAVE_APPLICATIONS];
    }

    return {
        returnval: true,
        duplicate: false
    };
}

export async function cancelLeave(leaveId: number) {
    console.info('Cancelling Leave (mock):', leaveId);
    await new Promise(resolve => setTimeout(resolve, 500));

    MOCK_LEAVE_APPLICATIONS = MOCK_LEAVE_APPLICATIONS.map(l =>
        l.aslA_Id === leaveId ? { ...l, aslA_Status: "Cancelled" } : l
    );

    return {
        returnval: true
    };
}
