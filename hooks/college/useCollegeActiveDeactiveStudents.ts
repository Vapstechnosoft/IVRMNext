import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    getCollegeActiveDeactiveInitialData,
    getCollegeActiveDeactiveCourses,
    getCollegeActiveDeactiveBranches,
    getCollegeActiveDeactiveSemesters,
    getCollegeActiveDeactiveSections,
    searchCollegeActiveDeactiveStudents,
    saveCollegeActiveDeactiveStudents
} from '@/server/college/CollegeAdmission/Transactions/college-active-deactive-students';
import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';

export const useCollegeActiveDeactiveInitialData = () => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_ACTIVE_DEACTIVE_STUDENTS, 'initialData'],
        queryFn: () => getCollegeActiveDeactiveInitialData(),
        staleTime: 0
    });
};

export const useCollegeActiveDeactiveCourses = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeActiveDeactiveCourses(data)
    });
};

export const useCollegeActiveDeactiveBranches = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeActiveDeactiveBranches(data)
    });
};

export const useCollegeActiveDeactiveSemesters = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeActiveDeactiveSemesters(data)
    });
};

export const useCollegeActiveDeactiveSections = () => {
    return useMutation({
        mutationFn: (data: any) => getCollegeActiveDeactiveSections(data)
    });
};

export const useCollegeActiveDeactiveSearch = () => {
    return useMutation({
        mutationFn: (data: any) => searchCollegeActiveDeactiveStudents(data)
    });
};

export const useCollegeActiveDeactiveSave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveCollegeActiveDeactiveStudents(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_ACTIVE_DEACTIVE_STUDENTS] });
        }
    });
};
