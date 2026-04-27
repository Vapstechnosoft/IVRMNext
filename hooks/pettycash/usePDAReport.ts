import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPDAReportInitialData, getPDAReport, getAcademicYearList } from "@/server/pettycash/PCReport";
import { IPDAReportParams } from "@/types/pettycash/PDAReport";
import { TIMETABLE_QUERY_KEYS } from "@/constants/Timetable-query-keys";


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

export const usePDAReportQuery = (params: IPDAReportParams | null) => {
    return useQuery({
        queryKey: ['PDA_REPORT', params],
        queryFn: async () => {
            if (!params) return null;
            return await getPDAReport(params);
        },
        enabled: !!params,
    });
};

// export const useAcademicYearList = () => {
//     return useQuery({
//         queryKey: ['ACADEMIC_YEAR_LIST'],
//         queryFn: () => getAcademicYearList(),
//     });
// };


export const useAcademicYearList = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS ?? {}],
            queryFn: async () => getAcademicYearList(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};
