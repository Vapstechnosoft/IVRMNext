import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCollegeStudentTcInitialData,
    getCollegeStudentTcCourses,
    getCollegeStudentTcBranches,
    getCollegeStudentTcSemesters,
    getCollegeStudentTcSections,
    onCollegeStudentTcSectionChange,
    getCollegeStudentTcStudents,
    getCollegeStudentTcStudentDetails,
    checkCollegeStudentTcDuplicate,
    saveCollegeStudentTcData
} from '@/server/college/CollegeAdmission/Transactions/college-student-tc';

export const useCollegeStudentTcInitialData = () => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_COLLEGE_STUDENT_TC, 'initialData'],
        queryFn: () => getCollegeStudentTcInitialData(),
        staleTime: 0
    });
};

export const useCollegeStudentTcCourses = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeStudentTcCourses(data)
    });
};

export const useCollegeStudentTcBranches = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeStudentTcBranches(data)
    });
};

export const useCollegeStudentTcSemesters = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeStudentTcSemesters(data)
    });
};

export const useCollegeStudentTcSections = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeStudentTcSections(data)
    });
};

export const useCollegeStudentTcSectionChange = () => {
    return useMutation({
        mutationFn: (data: any) => onCollegeStudentTcSectionChange(data)
    });
};

export const useCollegeStudentTcStudents = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeStudentTcStudents(data)
    });
};

export const useCollegeStudentTcStudentDetails = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeStudentTcStudentDetails(data)
    });
};

export const useCollegeStudentTcCheckDuplicate = () => {
    return useMutation({
        mutationFn: (data: any) => checkCollegeStudentTcDuplicate(data)
    });
};

export const useCollegeStudentTcSave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveCollegeStudentTcData(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_COLLEGE_STUDENT_TC] });
        }
    });
};
