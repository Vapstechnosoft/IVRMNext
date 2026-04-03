import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getCbsTcInitialData,
    changeCbsTcYear,
    changeCbsTcClass,
    changeCbsTcSection,
    getCbsTcDetails,
    saveCbsTcCertificates
} from '@/server/admission/preadmission/reports/cbs-student-tc';

export const cbsTcKeys = {
    all: ['cbs-student-tc'] as const,
    load: () => [...cbsTcKeys.all, 'load'] as const,
    report: (data: any) => [...cbsTcKeys.all, 'report', data] as const,
};

export const useCbsTcInitialData = () => {
    return useQuery({
        queryKey: cbsTcKeys.load(),
        queryFn: getCbsTcInitialData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCbsTcYearChange = () => {
    return useMutation({
        mutationFn: changeCbsTcYear,
    });
};

export const useCbsTcClassChange = () => {
    return useMutation({
        mutationFn: changeCbsTcClass,
    });
};

export const useCbsTcSectionChange = () => {
    return useMutation({
        mutationFn: changeCbsTcSection,
    });
};

export const useCbsTcReport = () => {
    return useMutation({
        mutationFn: getCbsTcDetails,
    });
};

export const useCbsTcSave = () => {
    return useMutation({
        mutationFn: saveCbsTcCertificates,
    });
};
