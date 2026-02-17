import {
    getStudentTCDetails,
    // getStudentTCInitialData,
    // getStudentTCList,
    getStudentsByAcademicYear,
    getStudentDetailsOnNameChange,
    getTCCancelDetails,
    saveStudentTC
} from '@/server/admission/preadmission/transactions/student_tc';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useStudentsByAcademicYear = (asmayId: number) => {
    return useQuery({
        queryKey: ['student_tc_student_list', asmayId],
        queryFn: () => getStudentsByAcademicYear(asmayId),
        enabled: !!asmayId && asmayId > 0,
        staleTime: 0
    });
};

export const useStudentDetailsOnNameChange = () => {
    return useMutation({
        mutationFn: (params: { asmayId: number; amstId: number }) =>
            getStudentDetailsOnNameChange(params.asmayId, params.amstId),
        mutationKey: ['student_tc_details_name_change']
    });
};

export const useTCCancelDetails = () => {
    return useMutation({
        mutationFn: (params: { asmayId: number; amstId: number; reason?: string }) =>
            getTCCancelDetails(params.asmayId, params.amstId, params.reason),
        mutationKey: ['student_tc_cancel_details']
    });
};

// export const useStudentTCInitialData = () => {
//     return useMutation({
//         mutationFn: (data: any) => getStudentTCInitialData(data),
//         mutationKey: ['student_tc_initial_data']
//     });
// };

// export const useStudentTCList = () => {
//     return useMutation({
//         mutationFn: (data: any) => getStudentTCList(data),
//         mutationKey: ['student_tc_list']
//     });
// };

export const useStudentTCDetails = () => {
    return useMutation({
        mutationFn: (data: any) => getStudentTCDetails(data),
        mutationKey: ['student_tc_details']
    });
};

export const useSaveStudentTC = () => {
    return useMutation({
        mutationFn: (data: any) => saveStudentTC(data),
        mutationKey: ['save_student_tc']
    });
};
