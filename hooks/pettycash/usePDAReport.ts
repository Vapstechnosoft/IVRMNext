import { getAcademicYearList, getPDAReport, getPDAReportInitialData } from '@/server/pettycash/PDAReport';
import type { IPDAReportParams } from '@/types/pettycash/PDAReport';
import { useMutation, useQuery } from '@tanstack/react-query';

export const usePDAReportInitialData = () => {
    return useQuery({
        queryKey: ['PDA_REPORT_INITIAL_DATA'],
        queryFn: () => getPDAReportInitialData()
    });
};

export const usePDAReportMutation = () => {
    return useMutation({
        mutationFn: (data: IPDAReportParams) => getPDAReport(data)
    });
};

export const useAcademicYearList = () => {
    return useQuery({
        queryKey: ['ACADEMIC_YEAR_LIST'],
        queryFn: () => getAcademicYearList()
    });
};
