'use server';

import { api } from '@/lib/apiService';

import type { IInitialData, IReportResponse, IAttachmentResponse } from '@/types/upload/reports/classwork-upload-report';

// Initial Data
export async function getInitialData(_pageId: number) {
    // const url = `/HomeworkUpload/Getdata_class/${pageId}`;
    // return await api.get<IInitialData>('preadmission', url);

    // Static Data
    return {
        success: true,
        message: 'Static data fetched',
        data: {
            classlist: [
                { asmcL_Id: 1, asmcL_ClassName: 'Grade 1', asmcL_ActiveFlag: true, mI_Id: 30 },
                { asmcL_Id: 2, asmcL_ClassName: 'Grade 2', asmcL_ActiveFlag: true, mI_Id: 30 },
                { asmcL_Id: 3, asmcL_ClassName: 'Grade 3', asmcL_ActiveFlag: true, mI_Id: 30 },
            ]
        }
    } as any;
}

// Get Report Data
export async function getReportData(_data: any) {
    // const url = `/HomeworkUpload/getreport_class`;
    // return await api.post<IReportResponse>('preadmission', url, data);

    // Static Data
    return {
        success: true,
        message: 'Static report data fetched',
        data: {
            classreportlist: [
                {
                    icW_Id: 1,
                    icW_Topic: 'Mathematics Assignment',
                    asmcL_ClassName: 'Grade 1',
                    asmC_SectionName: 'Section A',
                    ismS_SubjectName: 'Math',
                    icwupl_FileName: 'assignment1.pdf',
                    icwupl_Date: '2026-01-13',
                    employeename: 'John Doe',
                    userName: 'jdoe',
                    icW_Attachment: 'att1',
                    FilesCount: 1
                },
                {
                    icW_Id: 2,
                    icW_Topic: 'Science Project',
                    asmcL_ClassName: 'Grade 2',
                    asmC_SectionName: 'Section B',
                    ismS_SubjectName: 'Science',
                    icwupl_FileName: 'project2.pdf',
                    icwupl_Date: '2026-01-12',
                    employeename: 'Jane Smith',
                    userName: 'jsmith',
                    icW_Attachment: 'att2',
                    FilesCount: 2
                },
                {
                    icW_Id: 3,
                    icW_Topic: 'History Essay',
                    asmcL_ClassName: 'Grade 3',
                    asmC_SectionName: 'Section C',
                    ismS_SubjectName: 'History',
                    icwupl_FileName: 'essay3.pdf',
                    icwupl_Date: '2026-01-11',
                    employeename: 'Bob Wilson',
                    userName: 'bwilson',
                    icW_Attachment: 'att3',
                    FilesCount: 1
                },
                {
                    icW_Id: 4,
                    icW_Topic: 'Art Portfolio',
                    asmcL_ClassName: 'Grade 1',
                    asmC_SectionName: 'Section A',
                    ismS_SubjectName: 'Art',
                    icwupl_FileName: 'art4.pdf',
                    icwupl_Date: '2026-01-10',
                    employeename: 'Alice Brown',
                    userName: 'abrown',
                    icW_Attachment: null,
                    FilesCount: 0
                },
                {
                    icW_Id: 5,
                    icW_Topic: 'Physics Lab Report',
                    asmcL_ClassName: 'Grade 2',
                    asmC_SectionName: 'Section B',
                    ismS_SubjectName: 'Physics',
                    icwupl_FileName: 'lab5.pdf',
                    icwupl_Date: '2026-01-09',
                    employeename: 'Charlie Davis',
                    userName: 'cdavis',
                    icW_Attachment: 'att5',
                    FilesCount: 3
                },
                {
                    icW_Id: 6,
                    icW_Topic: 'Geography Map Work',
                    asmcL_ClassName: 'Grade 3',
                    asmC_SectionName: 'Section C',
                    ismS_SubjectName: 'Geography',
                    icwupl_FileName: 'map6.pdf',
                    icwupl_Date: '2026-01-08',
                    employeename: 'David Miller',
                    userName: 'dmiller',
                    icW_Attachment: 'att6',
                    FilesCount: 1
                },
                {
                    icW_Id: 7,
                    icW_Topic: 'Music Theory Quiz',
                    asmcL_ClassName: 'Grade 1',
                    asmC_SectionName: 'Section B',
                    ismS_SubjectName: 'Music',
                    icwupl_FileName: 'quiz7.pdf',
                    icwupl_Date: '2026-01-07',
                    employeename: 'Eva Wilson',
                    userName: 'ewilson',
                    icW_Attachment: null,
                    FilesCount: 0
                }
            ]
        }
    } as any;
}

// View Attachment Data
export async function viewAttachmentData(_data: any) {
    // const url = `/HomeworkUpload/viewData`;
    // return await api.post<IAttachmentResponse>('preadmission', url, data);

    // Static Data
    return {
        success: true,
        message: 'Static attachment data fetched',
        data: {
            attachementlist: [
                {
                    icwatT_FileName: 'attachment_v1.pdf',
                    icwatT_Attachment: 'https://example.com/file1.pdf',
                    icW_Attachment: 'att1'
                },
                {
                    icwatT_FileName: 'attachment_v2.jpg',
                    icwatT_Attachment: 'https://example.com/file2.jpg',
                    icW_Attachment: 'att1'
                }
            ]
        }
    } as any;
}

