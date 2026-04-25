import { useQuery, useMutation } from "@tanstack/react-query";
import { getPDAReportInitialData, getPDAReport, getAcademicYearList } from "@/server/pettycash/PCReport";
import { IPDAReportParams } from "@/types/pettycash/PDAReport";


export const usePDAReportInitialData = () => {
    return useQuery({
        queryKey: ['PDA_REPORT_INITIAL_DATA'],
        queryFn: () => getPDAReportInitialData(),
    });
};

export const usePDAReportMutation = () => {
    return useMutation({
        mutationFn: (data: IPDAReportParams) => getPDAReport(data),
    });
};

export const useAcademicYearList = () => {
    return useQuery({
        queryKey: ['ACADEMIC_YEAR_LIST'],
        queryFn: () => getAcademicYearList(),
    });
};
