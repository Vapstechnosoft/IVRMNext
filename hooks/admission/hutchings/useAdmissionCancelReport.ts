import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getAdmissionCancelReportInitialDetails,
    getAdmissionCancelReportByYear
} from '@/server/admission/hutchings/reports/admission_cancel_report';

export function useAdmissionCancelReportInitialDetails() {
    return useQuery({
        queryKey: ['admissionCancelReportInitialDetails'],
        queryFn: () => getAdmissionCancelReportInitialDetails()
    });
}

export function useAdmissionCancelReportByYearMutation() {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => getAdmissionCancelReportByYear(data)
    });
}
