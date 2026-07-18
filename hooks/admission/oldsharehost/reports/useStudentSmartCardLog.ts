'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getStudentSmartCardLogInitialDetails,
    getStudentSmartCardLogNameRegNo,
    getStudentSmartCardLogReport
} from '@/server/admission/oldsharehost/reports/student_smart_card_log';

export const useStudentSmartCardLogInitialDetails = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'student_smart_card_log_initial_details'],
        queryFn: getStudentSmartCardLogInitialDetails
    });
};

export const useStudentSmartCardLogNameRegNo = () => {
    return useMutation({
        mutationFn: (payload: any) => getStudentSmartCardLogNameRegNo(payload)
    });
};

export const useStudentSmartCardLogReport = () => {
    return useMutation({
        mutationFn: (payload: any) => getStudentSmartCardLogReport(payload)
    });
};
