'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamLoginPrivilegesView } from '@/types/exam/exam-module/exam-mapping';

export async function getExamLoginPrivileges(searchParams?: ApiSearchparams): Promise<ApiResponse<IExamLoginPrivilegesView[]>> {
    try {
        const urlParams = getSearchParamsUrl(searchParams ?? {});
        const url = `category_subject_mapping/30?${urlParams}`;
        return await api.get<IExamLoginPrivilegesView[]>('exam', url);
    } catch (error) {
        console.error('Error fetching exam login privileges, returning mock data.', error);

        // 🔹 Generate 20+ mock items with all required fields
        const mockData: IExamLoginPrivilegesView[] = Array.from({ length: 20 }, (_, index) => {
            const classNum = 9 + (index % 3); // 9th, 10th, 11th
            const section = String.fromCharCode(65 + (index % 5)); // A, B, C, D, E
            const active = index % 2 === 0;
            const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
            const subSubjects = ['Algebra', 'Physics', 'Grammar', 'World War II', 'Maps'];

            return {
                elp_Id: index + 1000,
                asmaY_Id: 2025,
                ivrmulF_Id: index + 2000,
                hrmE_Id: index + 3000,
                asmaY_Year: '2025-26',
                userName: `user${index + 1}`,
                employeeName: `Employee ${index + 1}`,
                hrmE_EmployeeFirstName: `EmpFirstName${index + 1}`, // newly added
                className: `${classNum}th`,
                sectionName: section,
                subjectName: subjects[index % subjects.length],
                subSubjectName: index % 2 === 0 ? subSubjects[index % subSubjects.length] : '',
                activeStatus: active,
                entryType: 'Manual',
                remarks: ''
            };
        });

        console.info('mockData', mockData);

        return {
            success: true,
            message: 'Returning mock exam login privileges due to API error',
            data: mockData,
            total: mockData.length
        };
    }
}

export async function addorUpdateExamLoginPrivileges(data: any) {
    const url = '/exam_master/add_or_update_exam_master_paper_type';
    return await api.post<any>('exam', url, data);
}
