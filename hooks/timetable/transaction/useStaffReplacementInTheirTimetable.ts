import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getPossiblePeriods,
    getStaffReplacementExistingToNewMasters,
    getStaffReplacementReport,
    saveStaffReplacement
} from '@/server/timetable/transactions/staff-replacement-In-their-timeTable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useStafReplacementInThierTimetableMasters = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_THIER_TIMETABLE],
        queryFn: async () => await getStaffReplacementExistingToNewMasters()
    });
};

export const useStaffReplacementInTheirTimetableReport = (payload: { hrmE_Id: string }) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_THIER_TIMETABLE, 'report', payload.hrmE_Id],
        queryFn: async () => await getStaffReplacementReport(payload),
        enabled: !!payload.hrmE_Id
    });
};

export const useStaffReplacementInTheirTimetablePossiblePeriods = () => {
    return useMutation({
        mutationFn: async (payload: any) => await getPossiblePeriods(payload)
    });
};

export const useSaveStaffReplacementInTheirTimetable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => await saveStaffReplacement(payload),
        onSuccess: (data) => {
            if (data.returnval === true) {
                queryClient.invalidateQueries({ queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_THIER_TIMETABLE, 'report'] });
            }
        }
    });
};
