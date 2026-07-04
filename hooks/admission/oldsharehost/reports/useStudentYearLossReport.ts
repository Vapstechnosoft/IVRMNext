'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getStudentYearLossReportInitialDetails,
    getStudentYearLossReportData
} from '@/server/admission/oldsharehost/reports/student_year_loss_report';

export const useStudentYearLossReportInitialDetails = () => {
    return useQuery({
        queryKey: ['STUDENT_YEAR_LOSS_REPORT', 'initial_details'],
        queryFn: getStudentYearLossReportInitialDetails
    });
};

export const useStudentYearLossReportData = () => {
    return useMutation({
        mutationFn: (payload: any) => getStudentYearLossReportData(payload)
    });
};
