import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getAttenLoginUserInitialData,
    getAttenLoginUserCourses,
    getAttenLoginUserBranches,
    getAttenLoginUserSemesters,
    saveAttenLoginUserData,
    viewAttenLoginUserSubjects,
    toggleAttenLoginUserStatus
} from '@/server/college/CollegeAdmission/Transactions/atten-login-user';

export const useAttenLoginUserInitialData = () => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_ATTEN_LOGIN_USER, 'initialData'],
        queryFn: () => getAttenLoginUserInitialData(),
        staleTime: 0
    });
};

export const useAttenLoginUserCourses = () => {
    return useMutation({
        mutationFn: (data: any) => getAttenLoginUserCourses(data)
    });
};

export const useAttenLoginUserBranches = () => {
    return useMutation({
        mutationFn: (data: any) => getAttenLoginUserBranches(data)
    });
};

export const useAttenLoginUserSemesters = () => {
    return useMutation({
        mutationFn: (data: any) => getAttenLoginUserSemesters(data)
    });
};

export const useAttenLoginUserSave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveAttenLoginUserData(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_ATTEN_LOGIN_USER] });
        }
    });
};

export const useAttenLoginUserSubjects = () => {
    return useMutation({
        mutationFn: (data: any) => viewAttenLoginUserSubjects(data)
    });
};

export const useAttenLoginUserToggleStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => toggleAttenLoginUserStatus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_ATTEN_LOGIN_USER] });
        }
    });
};
