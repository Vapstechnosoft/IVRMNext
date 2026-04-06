import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getStaffReplacementUnallocatedPeriodNewMasters,
    saveStaffReplacementInUnallocatedPeriod,
    TTStaffReplacementInUnallocatedPeriodReport
} from '@/server/timetable/transactions/staff-replacement-in-unallocated-period';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useStafReplacementInThierTimetableMasters = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_THIER_TIMETABLE],
        queryFn: async () => await getStaffReplacementUnallocatedPeriodNewMasters()
    });
};

export const useTTStaffReplacementInUnallocatedPeriodReport = (hrmE_Id: number) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_UNALLOCATED_PERIOD_REPORT, hrmE_Id],
        queryFn: async () => await TTStaffReplacementInUnallocatedPeriodReport(hrmE_Id),
        enabled: !!hrmE_Id
    });
};

export const useSaveStaffReplacementInUnallocatedPeriod = () => {
    const queryClient = useQueryClient();
     console.log("Replacement Payload:", queryClient);
    return useMutation({
        mutationFn: async (payload: any) => await saveStaffReplacementInUnallocatedPeriod(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_UNALLOCATED_PERIOD_REPORT] });
        }
    });
};
