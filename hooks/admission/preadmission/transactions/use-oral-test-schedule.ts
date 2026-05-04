import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    checkAddParticipants,
    deleteOralTestSchedule,
    deleteOralTestScheduleStudentData,
    getClasswiseStudent,
    getOralTestScheduleDetails,
    getRemarksReportDetails,
    getScheduleReportDetails,
    getSelectedRowDetails,
    removeStudents,
    saveOralTestSchedule,
    sendReminder
} from '@/server/admission/preadmission/transactions/oral_test_schedule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useOralTestScheduleDetails() {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS],
        queryFn: () => getOralTestScheduleDetails()
    });
}

export function useClasswiseStudents(classId: number) {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.CLASSWISE_STUDENTS, classId],
        queryFn: () => getClasswiseStudent(classId),
        enabled: classId > 0
    });
}

export function useSaveOralTestSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveOralTestSchedule,
        onSuccess: (response) => {
            if (response?.returnvalue === 'false') {
                toast.error('Record Already Exist With Same Schedule Name/Date');
            } else {
                toast.success('Interview Scheduled Successfully');
                queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS] });
            }
        },
        onError: () => {
            toast.error('Failed to save schedule');
        }
    });
}

export function useDeleteOralTestSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteOralTestSchedule,
        onSuccess: () => {
            toast.success('Record Deleted successfully');
            queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS] });
        },
        onError: () => {
            toast.error('Failed to delete schedule');
        }
    });
}

export function useOralTestScheduleSelectedRow(id: number) {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS, id],
        queryFn: () => getSelectedRowDetails(id),
        enabled: id > 0
    });
}

export function useDeleteOralTestScheduleStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ paotsId, pasrId }: { paotsId: number; pasrId: number }) => 
            deleteOralTestScheduleStudentData(paotsId, pasrId),
        onSuccess: () => {
            toast.success('Record Deleted Successfully');
            queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS] });
        }
    });
}

export function useScheduleReportDetails() {
    return useMutation({
        mutationFn: (paotsId: number) => getScheduleReportDetails(paotsId)
    });
}

export function useRemarksReportDetails() {
    return useMutation({
        mutationFn: (paotsId: number) => getRemarksReportDetails(paotsId)
    });
}

export function useUpdateParticipants() {
    return useMutation({
        mutationFn: checkAddParticipants,
        onSuccess: (promise) => {
            if (promise.returnval === true) {
                toast.success('Record Updated successfully');
            } else {
                toast.error('Record update failed');
            }
        }
    });
}

export function useRemoveStudents() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeStudents,
        onSuccess: () => {
            toast.success('Records removed successfully');
            queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS] });
        }
    });
}

export function useSendReminder() {
    return useMutation({
        mutationFn: sendReminder,
        onSuccess: () => {
            toast.success('Reminder sent successfully');
        }
    });
}
