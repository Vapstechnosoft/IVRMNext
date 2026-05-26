'use server';

import type { GatePassSchema } from '@/schemas/visitors-management/transactions';
import type { GatePassInitialData, GatePassTransactionData } from '@/types/visitors-management/transactions';

// Mock Data
const mockEmployees = [
    {
        hrmE_Id: 101,
        hrmE_EmployeeFirstName: 'John Doe',
        hrmD_DepartmentName: 'Science',
        hrmdeS_DesignationName: 'Teacher',
        hrmE_MobileNo: '9988776655'
    },
    {
        hrmE_Id: 102,
        hrmE_EmployeeFirstName: 'Jane Smith',
        hrmD_DepartmentName: 'Maths',
        hrmdeS_DesignationName: 'HOD',
        hrmE_MobileNo: '9988776644'
    }
];

const mockStudents = [
    {
        amsT_Id: 201,
        amsT_FirstName: 'Alice Wonderland',
        amsT_AdmNo: 'ADM001',
        asmcL_ClassName: 'X',
        asmC_SectionName: 'A',
        amsT_MobileNo: '8877665544'
    },
    {
        amsT_Id: 202,
        amsT_FirstName: 'Bob Builder',
        amsT_AdmNo: 'ADM002',
        asmcL_ClassName: 'IX',
        asmC_SectionName: 'B',
        amsT_MobileNo: '8877665533'
    }
];

let mockGatePassQuery: GatePassTransactionData[] = [
    {
        id: 1,
        type: 'student',
        name: 'Alice Wonderland',
        code: 'ADM001',
        department: 'X',
        designation: 'A',
        dateTime: '2023-10-30T10:00:00',
        remarks: 'Doctor Appointment',
        studentId: 201
    }
];

export async function getGatePassData(): Promise<GatePassInitialData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        emplist: mockEmployees,
        studentlist: mockStudents,
        getdata: mockGatePassQuery
    };
}

export async function saveGatePassData(data: GatePassSchema) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newRecord: GatePassTransactionData = {
        id: Math.floor(Math.random() * 10000),
        type: data.gatePassType,
        name:
            data.gatePassType === 'student'
                ? mockStudents.find((s) => s.amsT_Id === data.studentId)?.amsT_FirstName || 'Unknown'
                : mockEmployees.find((e) => e.hrmE_Id === data.employeeId)?.hrmE_EmployeeFirstName || 'Unknown',
        code: data.gatePassType === 'student' ? mockStudents.find((s) => s.amsT_Id === data.studentId)?.amsT_AdmNo || '' : '',
        department:
            data.gatePassType === 'student'
                ? mockStudents.find((s) => s.amsT_Id === data.studentId)?.asmcL_ClassName || ''
                : mockEmployees.find((e) => e.hrmE_Id === data.employeeId)?.hrmD_DepartmentName || '',
        designation:
            data.gatePassType === 'student'
                ? mockStudents.find((s) => s.amsT_Id === data.studentId)?.asmC_SectionName || ''
                : mockEmployees.find((e) => e.hrmE_Id === data.employeeId)?.hrmdeS_DesignationName || '',
        dateTime: new Date().toISOString(),
        remarks: data.remarks,
        studentId: data.studentId,
        employeeId: data.employeeId
    };

    mockGatePassQuery = [newRecord, ...mockGatePassQuery];

    return { success: true, message: 'Gate Pass Generated Successfully' };
}
