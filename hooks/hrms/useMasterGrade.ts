import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterGrade,
    getMasterGradeList,
    saveMasterGrade,
    saveMasterGradeOrder
} from '@/server/hrms/hrmsConfig/master/grade';
import type { ApiSearchparams } from '@/types';
import type { GradeDetail, MasterGradeInput } from '@/types/hrms/master-grade';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterGrade = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE, { roleId }],
        queryFn: async () => getMasterGradeList(roleId),
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterGradeInput) => saveMasterGrade(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] })
    });

    const toggleActiveMutation = useMutation({
        mutationFn: (payload: { HRMG_Id: number; HRMG_ActiveFlag: boolean; roleId?: number }) => activateDeactivateMasterGrade(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] })
    });

    const saveOrderMutation = useMutation({
        mutationFn: (grades: GradeDetail[]) => saveMasterGradeOrder(grades),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] });

    return { listQuery, saveMutation, toggleActiveMutation, saveOrderMutation, refetchAll };
};
