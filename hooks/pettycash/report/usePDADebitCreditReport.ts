import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getPDADebitCreditReportInitialData,
    getPDADebitCreditReportSections,
    getPDADebitCreditReportStudents,
    getPDADebitCreditReport,
} from '@/server/pettycash/report/PDADebitCreditReport';
import { IPDADebitCreditReportParams } from '@/types/pettycash/report/PDADebitCreditReport';
import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';

export const usePDADebitCreditReportInitialData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, 'PDA_DEBIT_CREDIT_REPORT_INITIAL_DATA'],
            queryFn: () => getPDADebitCreditReportInitialData(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const usePDADebitCreditReportSectionsMutation = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number }) =>
            getPDADebitCreditReportSections(data),
    });
};

export const usePDADebitCreditReportStudentsMutation = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; AMSC_Id: number }) =>
            getPDADebitCreditReportStudents(data),
    });
};

export const usePDADebitCreditReportMutation = () => {
    return useMutation({
        mutationFn: (data: IPDADebitCreditReportParams) => getPDADebitCreditReport(data),
    });
};
