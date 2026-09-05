import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCollegeFeePrivilegeAcademicYears,
    getCollegeFeePrivilegeFeeGroups,
    getCollegeFeePrivilegeFeeHeads,
    getCollegeFeePrivilegeList,
    getCollegeFeePrivilegeUsersByRole
} from '@/server/fees/college/masters/masterclgfeeprevilege';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useCollegeFeePrivilegeAcademicYears = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_ACADEMIC_YEARS],
            queryFn: async () => getCollegeFeePrivilegeAcademicYears(),
            staleTime: 1000 * 60 * 10
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_ACADEMIC_YEARS]
            });
        }
    };
};

export const useCollegeFeePrivilegeFeeGroups = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_GROUPS],
            queryFn: async () => getCollegeFeePrivilegeFeeGroups(),
            staleTime: 1000 * 60 * 10
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_GROUPS]
            });
        }
    };
};

export const useCollegeFeePrivilegeFeeHeads = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_HEADS],
            queryFn: async () => getCollegeFeePrivilegeFeeHeads(),
            staleTime: 1000 * 60 * 10
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_HEADS]
            });
        }
    };
};

export const useCollegeFeePrivilegeUsersByRole = (roleId?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_USERS_BY_ROLE, roleId],
            queryFn: async () => {
                if (roleId === undefined || roleId === null) return null;
                return getCollegeFeePrivilegeUsersByRole(roleId);
            },
            enabled: roleId !== undefined && roleId !== null
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_USERS_BY_ROLE]
            });
        }
    };
};

export const useCollegeFeePrevilegeList = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_LIST, searchParams ?? {}],
            queryFn: async () => getCollegeFeePrivilegeList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_LIST]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_ACADEMIC_YEARS]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_GROUPS]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_HEADS]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_PREVILEGE_USERS_BY_ROLE]
                })
            ]);
        }
    };
};
