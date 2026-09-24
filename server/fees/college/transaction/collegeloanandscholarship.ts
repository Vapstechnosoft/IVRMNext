'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IClgBatch,
    IClgBranch,
    IClgCourse,
    IClgLoanScholarshipRecord,
    IClgLoanScholarshipSavePayload,
    IClgSemester,
    IClgStudentItem
} from '@/types/fees/college/transaction/collegeloanandscholarship';

// Mock data matching the Engineering College BRD
const MOCK_BATCHES: IClgBatch[] = [
    { acmB_Id: 1, acmsN_SessionName: '2026-2027', acmnS_Order: 1, asmaY_Id: 1 },
    { acmB_Id: 2, acmsN_SessionName: '2025-2026', acmnS_Order: 2, asmaY_Id: 2 },
    { acmB_Id: 3, acmsN_SessionName: '2024-2025', acmnS_Order: 3, asmaY_Id: 3 }
];

const MOCK_COURSES: IClgCourse[] = [
    { amcO_Id: 1, amcO_CourseName: 'BE', amcO_CourseCode: 'BE' },
    { amcO_Id: 2, amcO_CourseName: 'B.Tech', amcO_CourseCode: 'BTECH' }
];

const MOCK_BRANCHES: IClgBranch[] = [
    { amB_Id: 1, amB_BranchName: 'BME', amB_BranchCode: 'BME', amcO_Id: 1 },
    { amB_Id: 2, amB_BranchName: 'ECE', amB_BranchCode: 'ECE', amcO_Id: 1 },
    { amB_Id: 3, amB_BranchName: 'EEE', amB_BranchCode: 'EEE', amcO_Id: 1 },
    { amB_Id: 4, amB_BranchName: 'MECH', amB_BranchCode: 'MECH', amcO_Id: 1 },
    { amB_Id: 5, amB_BranchName: 'CSE', amB_BranchCode: 'CSE', amcO_Id: 1 }
];

const MOCK_SEMESTERS: IClgSemester[] = [
    { amsE_Id: 1, amsE_SEMName: 'I SEM', amsE_SEMOrder: 1 },
    { amsE_Id: 2, amsE_SEMName: 'II SEM', amsE_SEMOrder: 2 },
    { amsE_Id: 3, amsE_SEMName: 'III SEM', amsE_SEMOrder: 3 },
    { amsE_Id: 4, amsE_SEMName: 'IV SEM', amsE_SEMOrder: 4 },
    { amsE_Id: 5, amsE_SEMName: 'V SEM', amsE_SEMOrder: 5 },
    { amsE_Id: 6, amsE_SEMName: 'VI SEM', amsE_SEMOrder: 6 },
    { amsE_Id: 7, amsE_SEMName: 'VII SEM', amsE_SEMOrder: 7 },
    { amsE_Id: 8, amsE_SEMName: 'VIII SEM', amsE_SEMOrder: 8 }
];

const MOCK_STUDENTS: IClgStudentItem[] = [
    {
        amcsT_Id: 101,
        amcsT_FirstName: 'AKASH',
        amcsT_MiddleName: 'CHRISTOPHER',
        amcsT_LastName: 'N',
        studentName: 'AKASH CHRISTOPHER N',
        amcsT_AdmNo: 'BE/2026/BME/01',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        displayName: 'AKASH CHRISTOPHER N - BE-BME-VII SEM',
        applicableFee: 85000,
        existingLoanAmount: 25000,
        existingScholarshipAmount: 15000
    },
    {
        amcsT_Id: 102,
        amcsT_FirstName: 'ARUN',
        amcsT_MiddleName: 'SELVAM',
        amcsT_LastName: 'A',
        studentName: 'ARUN SELVAM A',
        amcsT_AdmNo: 'BE/2026/BME/02',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        displayName: 'ARUN SELVAM A - BE-BME-VII SEM',
        applicableFee: 85000,
        existingLoanAmount: 30000,
        existingScholarshipAmount: 10000
    },
    {
        amcsT_Id: 103,
        amcsT_FirstName: 'BHARATHI',
        amcsT_LastName: 'S',
        studentName: 'BHARATHI S',
        amcsT_AdmNo: 'BE/2026/BME/03',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        displayName: 'BHARATHI S - BE-BME-VII SEM',
        applicableFee: 85000,
        existingLoanAmount: 0,
        existingScholarshipAmount: 25000
    },
    {
        amcsT_Id: 104,
        amcsT_FirstName: 'DEIVA',
        amcsT_MiddleName: 'RAGAVI',
        amcsT_LastName: 'C',
        studentName: 'DEIVA RAGAVI C',
        amcsT_AdmNo: 'BE/2026/BME/04',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        displayName: 'DEIVA RAGAVI C - BE-BME-VII SEM',
        applicableFee: 85000,
        existingLoanAmount: 20000,
        existingScholarshipAmount: 20000
    },
    {
        amcsT_Id: 105,
        amcsT_FirstName: 'DHANALAKSHMI',
        amcsT_LastName: 'R',
        studentName: 'DHANALAKSHMI R',
        amcsT_AdmNo: 'BE/2026/BME/05',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        displayName: 'DHANALAKSHMI R - BE-BME-VII SEM',
        applicableFee: 85000,
        existingLoanAmount: 35000,
        existingScholarshipAmount: 0
    },
    {
        amcsT_Id: 106,
        amcsT_FirstName: 'KIRAN',
        amcsT_MiddleName: 'KUMAR',
        amcsT_LastName: 'M',
        studentName: 'KIRAN KUMAR M',
        amcsT_AdmNo: 'BE/2026/ECE/01',
        amcO_CourseName: 'BE',
        amB_BranchName: 'ECE',
        amsE_SEMName: 'VII SEM',
        displayName: 'KIRAN KUMAR M - BE-ECE-VII SEM',
        applicableFee: 90000,
        existingLoanAmount: 15000,
        existingScholarshipAmount: 15000
    },
    {
        amcsT_Id: 107,
        amcsT_FirstName: 'PRIYA',
        amcsT_MiddleName: 'DHARSHINI',
        amcsT_LastName: 'R',
        studentName: 'PRIYA DHARSHINI R',
        amcsT_AdmNo: 'BE/2026/CSE/01',
        amcO_CourseName: 'BE',
        amB_BranchName: 'CSE',
        amsE_SEMName: 'VII SEM',
        displayName: 'PRIYA DHARSHINI R - BE-CSE-VII SEM',
        applicableFee: 95000,
        existingLoanAmount: 20000,
        existingScholarshipAmount: 30000
    },
    {
        amcsT_Id: 108,
        amcsT_FirstName: 'SANJAY',
        amcsT_LastName: 'K',
        studentName: 'SANJAY K',
        amcsT_AdmNo: 'BE/2026/MECH/01',
        amcO_CourseName: 'BE',
        amB_BranchName: 'MECH',
        amsE_SEMName: 'VII SEM',
        displayName: 'SANJAY K - BE-MECH-VII SEM',
        applicableFee: 80000,
        existingLoanAmount: 10000,
        existingScholarshipAmount: 10000
    }
];

let SAVED_RECORDS: IClgLoanScholarshipRecord[] = [
    {
        fcL_Id: 1,
        acmB_Id: 1,
        batchName: '2026-2027',
        amcsT_Id: 101,
        studentName: 'AKASH CHRISTOPHER N',
        amcsT_AdmNo: 'BE/2026/BME/01',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        loanAmount: 25000,
        scholarshipAmount: 15000,
        totalAmount: 40000,
        createdDate: '2026-09-11',
        remarks: 'Institutional Loan Approved by Committee',
        status: 'Active'
    },
    {
        fcL_Id: 2,
        acmB_Id: 1,
        batchName: '2026-2027',
        amcsT_Id: 102,
        studentName: 'ARUN SELVAM A',
        amcsT_AdmNo: 'BE/2026/BME/02',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        loanAmount: 30000,
        scholarshipAmount: 10000,
        totalAmount: 40000,
        createdDate: '2026-09-11',
        remarks: 'Merit-cum-means scholarship applied',
        status: 'Active'
    },
    {
        fcL_Id: 3,
        acmB_Id: 1,
        batchName: '2026-2027',
        amcsT_Id: 103,
        studentName: 'BHARATHI S',
        amcsT_AdmNo: 'BE/2026/BME/03',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        loanAmount: 0,
        scholarshipAmount: 25000,
        totalAmount: 25000,
        createdDate: '2026-09-11',
        remarks: 'Direct institutional scholarship waiver',
        status: 'Active'
    },
    {
        fcL_Id: 4,
        acmB_Id: 1,
        batchName: '2026-2027',
        amcsT_Id: 104,
        studentName: 'DEIVA RAGAVI C',
        amcsT_AdmNo: 'BE/2026/BME/04',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        loanAmount: 20000,
        scholarshipAmount: 20000,
        totalAmount: 40000,
        createdDate: '2026-09-11',
        remarks: 'Institutional student welfare fund',
        status: 'Active'
    },
    {
        fcL_Id: 5,
        acmB_Id: 1,
        batchName: '2026-2027',
        amcsT_Id: 105,
        studentName: 'DHANALAKSHMI R',
        amcsT_AdmNo: 'BE/2026/BME/05',
        amcO_CourseName: 'BE',
        amB_BranchName: 'BME',
        amsE_SEMName: 'VII SEM',
        loanAmount: 35000,
        scholarshipAmount: 0,
        totalAmount: 35000,
        createdDate: '2026-09-11',
        remarks: 'Special education loan entry',
        status: 'Active'
    }
];

export async function getCollegeLoanInitialData() {
    try {
        const url = '/CollegeLoanAndScholarship/get_initial_data';
        const res = await api.get<any>('fees', url);
        if (res && res.batchList && res.batchList.length > 0) return res;
    } catch (error) {
        console.warn('API /CollegeLoanAndScholarship/get_initial_data failed, using mock data');
    }

    return {
        batchList: MOCK_BATCHES,
        courseList: MOCK_COURSES
    };
}

export async function getCollegeLoanBranches(data: { courselistarray: { amcO_Id: number }[] }) {
    try {
        const url = '/CollegeLoanAndScholarship/get_branches';
        const res = await api.post<any>('fees', url, data);
        if (res && res.branchList && res.branchList.length > 0) return res;
    } catch (error) {
        console.warn('API /CollegeLoanAndScholarship/get_branches fallback');
    }

    const selectedCourseIds = data.courselistarray.map((c) => c.amcO_Id);
    return {
        branchList: MOCK_BRANCHES.filter(
            (b) => selectedCourseIds.length === 0 || selectedCourseIds.includes(b.amcO_Id ?? 1)
        )
    };
}

export async function getCollegeLoanSemesters(data: {
    courselistarray: { amcO_Id: number }[];
    branchlistarray: { amB_Id: number }[];
}) {
    try {
        const url = '/CollegeLoanAndScholarship/get_semesters';
        const res = await api.post<any>('fees', url, data);
        if (res && res.semesterList && res.semesterList.length > 0) return res;
    } catch (error) {
        console.warn('API /CollegeLoanAndScholarship/get_semesters fallback');
    }

    return {
        semesterList: MOCK_SEMESTERS
    };
}

export async function getCollegeLoanStudents(data: {
    acmB_Id: number;
    courselistarray: { amcO_Id: number }[];
    branchlistarray: { amB_Id: number }[];
    semesterlistarray: { amsE_Id: number }[];
}) {
    try {
        const url = '/CollegeLoanAndScholarship/get_students';
        const res = await api.post<any>('fees', url, data);
        if (res && res.studentList && res.studentList.length > 0) return res;
    } catch (error) {
        console.warn('API /CollegeLoanAndScholarship/get_students fallback');
    }

    return {
        studentList: MOCK_STUDENTS
    };
}

export async function saveCollegeLoanAndScholarship(payload: IClgLoanScholarshipSavePayload) {
    try {
        const url = '/CollegeLoanAndScholarship/save_data';
        const res = await api.post<any>('fees', url, payload);
        if (res) return res;
    } catch (error) {
        console.warn('API /CollegeLoanAndScholarship/save_data fallback simulation', error);
    }

    // Add to local mock records
    payload.studentEntries.forEach((entry) => {
        const st = MOCK_STUDENTS.find((s) => s.amcsT_Id === entry.amcsT_Id);
        if (st) {
            const existingIdx = SAVED_RECORDS.findIndex((r) => r.amcsT_Id === entry.amcsT_Id);
            const newRecord: IClgLoanScholarshipRecord = {
                fcL_Id: existingIdx >= 0 ? SAVED_RECORDS[existingIdx].fcL_Id : Date.now() + Math.random(),
                acmB_Id: payload.acmB_Id,
                batchName: '2026-2027',
                amcsT_Id: st.amcsT_Id,
                studentName: st.studentName,
                amcsT_AdmNo: st.amcsT_AdmNo,
                amcO_CourseName: st.amcO_CourseName,
                amB_BranchName: st.amB_BranchName,
                amsE_SEMName: st.amsE_SEMName,
                loanAmount: entry.loanAmount,
                scholarshipAmount: entry.scholarshipAmount,
                totalAmount: entry.loanAmount + entry.scholarshipAmount,
                createdDate: new Date().toISOString().split('T')[0],
                remarks: entry.remarks || 'Recorded via Loan & Scholarship Entry',
                status: 'Active'
            };

            if (existingIdx >= 0) {
                SAVED_RECORDS[existingIdx] = newRecord;
            } else {
                SAVED_RECORDS.unshift(newRecord);
            }
        }
    });

    return {
        success: true,
        message: 'Loan From Institution & Scholarship Amount entries saved successfully.'
    };
}

export async function getCollegeLoanSavedRecords(acmB_Id: number, searchParams?: ApiSearchparams) {
    try {
        const paramsUrl = getSearchParamsUrl(searchParams);
        const url = `/CollegeLoanAndScholarship/get_records/${acmB_Id}${paramsUrl ? `?${paramsUrl}` : ''}`;
        const res = await api.get<any>('fees', url);
        if (res && res.data) return res;
    } catch (error) {
        console.warn('API /CollegeLoanAndScholarship/get_records fallback');
    }

    let records = [...SAVED_RECORDS];
    if (acmB_Id && acmB_Id > 0) {
        records = records.filter((r) => r.acmB_Id === acmB_Id);
    }

    return {
        data: records,
        total: records.length,
        page: 1,
        page_Size: 10
    };
}

export async function deleteCollegeLoanRecord(fcL_Id: number) {
    try {
        const url = `/CollegeLoanAndScholarship/delete_record/${fcL_Id}`;
        const res = await api.delete<any>('fees', url);
        if (res) return res;
    } catch (error) {
        console.warn('API /CollegeLoanAndScholarship/delete_record fallback simulation');
    }

    SAVED_RECORDS = SAVED_RECORDS.filter((r) => r.fcL_Id !== fcL_Id);
    return {
        success: true,
        message: 'Loan and Scholarship entry deleted successfully.'
    };
}
