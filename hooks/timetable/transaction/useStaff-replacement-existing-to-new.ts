import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getSectionsByClass,
    getStaffReplacementExistingToNewMasters,
    getStaffReplacementGridData,
    getStaffReplacementInitialDetails,
    saveStaffReplacementExistingToNew
} from '@/server/timetable/transactions/staff-replacement-existing-to-new';
import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useStaffReplacementExistingToNewMasters = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_MASTERS],
        queryFn: getStaffReplacementExistingToNewMasters
    });
};

export const useSectionsByClass = (asmcL_Id: number) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_SECTIONS, asmcL_Id],
        queryFn: () => getSectionsByClass(asmcL_Id),
        enabled: !!asmcL_Id
    });
};

export const useStaffReplacementInitialDetails = (id = 0) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_MASTERS, 'details', id],
        queryFn: () => getStaffReplacementInitialDetails(id)
    });
};

export const useSaveStaffReplacementExistingToNew = () => {
    const queryClient = useQueryClient();
    console.log('queryClient', queryClient);
    return useMutation({
        mutationFn: saveStaffReplacementExistingToNew,
        onSuccess: (data: any) => {
            if (data.returnval === true) {
                queryClient.invalidateQueries({ queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_GRID_DATA] });
            } else if (data.returnval === false && data.returnduplicatestatus === 'Duplicate') {
            } else {
            }
        }
    });
};

export const useStaffReplacementGridData = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_GRID_DATA, searchParams ?? {}],
            queryFn: async () => getStaffReplacementGridData(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_GRID_DATA]
            });
        }
    };
};
