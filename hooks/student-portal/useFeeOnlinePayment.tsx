import { PORTAL_QUERY_KEYS } from '@/constants/query-keys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {geStudentInformation,getGroupList} from '@/server/student-portal/masters/fee_online_payment';

export const useStudentInformation = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.FEE_ONLINE_PAYMENT_STUDENT_INFO],
            queryFn: async () => geStudentInformation()
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.FEE_ONLINE_PAYMENT_STUDENT_INFO]
            })
    };
};

export const useGroupList = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.FEE_ONLINE_PAYMENT_GROUP_LIST],
            queryFn: async () => getGroupList()
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.FEE_ONLINE_PAYMENT_GROUP_LIST]
            })
    };
};

