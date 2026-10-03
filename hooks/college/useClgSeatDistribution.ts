import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getClgSeatDistributionInitialData,
    getClgSeatDistributionCourses,
    getClgSeatDistributionBranches,
    getClgSeatDistributionSemesters,
    getClgSeatDistributionCategories,
    saveClgSeatDistributionData
} from '@/server/college/CollegeAdmission/Transactions/clg-seat-distribution';

export const useClgSeatDistributionInitialData = () => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_CLG_SEAT_DISTRIBUTION, 'initialData'],
        queryFn: () => getClgSeatDistributionInitialData(),
        staleTime: 0
    });
};

export const useClgSeatDistributionCourses = () => {
    return useMutation({
        mutationFn: (data: any) => getClgSeatDistributionCourses(data)
    });
};

export const useClgSeatDistributionBranches = () => {
    return useMutation({
        mutationFn: (data: any) => getClgSeatDistributionBranches(data)
    });
};

export const useClgSeatDistributionSemesters = () => {
    return useMutation({
        mutationFn: (data: any) => getClgSeatDistributionSemesters(data)
    });
};

export const useClgSeatDistributionCategories = () => {
    return useMutation({
        mutationFn: (data: any) => getClgSeatDistributionCategories(data)
    });
};

export const useClgSeatDistributionSave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveClgSeatDistributionData(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_CLG_SEAT_DISTRIBUTION] });
        }
    });
};
