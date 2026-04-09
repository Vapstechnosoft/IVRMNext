import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getBonafiedLoadData,
    getBonafiedStudentStatusChange,
    getBonafiedAcademicYearChange,
    getBonafiedSearchFilter,
    getBonafiedStudDetails
} from '@/server/admission/preadmission/reports/stjames_bonafied_report';

export const bonafiedReportKeys = {
    all: ['stjames-bonafied-report'] as const,
    load: () => [...bonafiedReportKeys.all, 'load'] as const,
};

export const useBonafiedLoadData = () => {
    return useQuery({
        queryKey: bonafiedReportKeys.load(),
        queryFn: getBonafiedLoadData,
        staleTime: 1000 * 60 * 5,
    });
};

export const useBonafiedStudentStatusChange = () => {
    return useMutation({
        mutationFn: getBonafiedStudentStatusChange,
    });
};

export const useBonafiedAcademicYearChange = () => {
    return useMutation({
        mutationFn: getBonafiedAcademicYearChange,
    });
};

export const useBonafiedSearchFilter = () => {
    return useMutation({
        mutationFn: getBonafiedSearchFilter,
    });
};

export const useBonafiedStudDetails = () => {
    return useMutation({
        mutationFn: getBonafiedStudDetails,
    });
};
