import { EXAM_QUERY_KEYS } from '@/constants/query-keys';
import { getCoScholasticActivityAreaMapping } from '@/server/exam/exam-module/exam-mapping/co-scholastic-activitiy-area-mapping';
import { getExamLoginPrivileges } from '@/server/exam/exam-module/exam-mapping/exam-login-privilages';
import {
    getExamSubjectGroupMapping,
    getExamSubjectGroupMappingDetails
} from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import {
    getExamSubjectWizard,
    getExamSubjectWizardDetails,
    getSubExamsMappedList,
    getSubSubjectsAndSubExamsMappedList,
    getSubSubjectsMappedList
} from '@/server/exam/exam-module/exam-mapping/exam-subject-wizard';
import {
    getExamTermAndExamMapping,
    getExamTermAndExamMappingDetails
} from '@/server/exam/exam-module/exam-mapping/examTerm-and-exam-mappiong';
import { getYearlyCategoryDatesMapping } from '@/server/exam/exam-module/exam-mapping/yearly-category-dates-mapping';
import { getYearlyCategorySubjectMapping } from '@/server/exam/exam-module/exam-mapping/yearly-category-subject-mapping';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useYearlyCategorySubjectMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.YEARLY_CATEGORY_SUBJECT_MAPPING, searchParams ?? {}],
            queryFn: async () => getYearlyCategorySubjectMapping(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.YEARLY_CATEGORY_SUBJECT_MAPPING]
            });
        }
    };
};

export const useExamLoginPrivileges = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.EXAM_LOGIN_PRIVILAGES, searchParams ?? {}],
            queryFn: async () => getExamLoginPrivileges(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.EXAM_LOGIN_PRIVILAGES]
            });
        }
    };
};

export const useYearlyCategoryDateMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.YEARLY_CATEGORY_DATES_MAPPING, searchParams ?? {}],
            queryFn: async () => getYearlyCategoryDatesMapping(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.YEARLY_CATEGORY_DATES_MAPPING]
            });
        }
    };
};

export const useExamSubjectGroupMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_GROUP_MAPPING, searchParams ?? {}],
            queryFn: async () => getExamSubjectGroupMapping(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_GROUP_MAPPING]
            });
        }
    };
};
export const useExamSubjectGroupMappingDetails = (sorgId: number, compulsary_flag: string, asmay_id: number, esG_Id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_GROUP_MAPPING_DETAILS],
            queryFn: async () => getExamSubjectGroupMappingDetails(sorgId, compulsary_flag, asmay_id, esG_Id),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_GROUP_MAPPING_DETAILS]
            });
        }
    };
};

export const useExamTermAndExamMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.EXAM_TERM_AND_EXAM_MAPPING, searchParams ?? {}],
            queryFn: async () => getExamTermAndExamMapping(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.EXAM_TERM_AND_EXAM_MAPPING]
            });
        }
    };
};

export const useExamTermAndExamMappingDetails = (mi_id: number, asmay_id: number, emca_id: number, ect_id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.EXAM_TERM_AND_EXAM_MAPPING_DETAILS],
            queryFn: async () => getExamTermAndExamMappingDetails(mi_id, asmay_id, emca_id, ect_id),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.EXAM_TERM_AND_EXAM_MAPPING_DETAILS]
            });
        }
    };
};

export const useExamSubjectWizard = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_WIZARD, searchParams ?? {}],
            queryFn: async () => getExamSubjectWizard(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_WIZARD]
            });
        }
    };
};

export const useExamSubjectWizardDetails = (org_Id: number, ecycE_Id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_WIZARD_DETAILS],
            queryFn: async () => getExamSubjectWizardDetails(org_Id, ecycE_Id),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_WIZARD_DETAILS]
            });
        }
    };
};

export const useSubExamsMappedList = (org_Id: number, eyceS_Id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.SUB_EXAMS_MAPPED_VIEW, org_Id, eyceS_Id],
            queryFn: async () => getSubExamsMappedList(org_Id, eyceS_Id),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.SUB_EXAMS_MAPPED_VIEW]
            });
        }
    };
};

export const useSubSubjectsMappedList = (org_Id: number, eyceS_Id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.SUB_SUBJECTS_MAPPED_VIEW, org_Id, eyceS_Id],
            queryFn: async () => getSubSubjectsMappedList(org_Id, eyceS_Id),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.SUB_SUBJECTS_MAPPED_VIEW]
            });
        }
    };
};

export const useSubSubjectsAndSubExamsMappedList = (org_Id: number, eyceS_Id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.SUB_BOTH_MAPPED_VIEW, org_Id, eyceS_Id],
            queryFn: async () => getSubSubjectsAndSubExamsMappedList(org_Id, eyceS_Id),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.SUB_BOTH_MAPPED_VIEW]
            });
        }
    };
};

export const useCoScholasticActivityAreaMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.CO_SCHOLASTIC_ACTIVITY_AREA_MAPPING, searchParams ?? {}],
            queryFn: async () => getCoScholasticActivityAreaMapping(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.CO_SCHOLASTIC_ACTIVITY_AREA_MAPPING]
            });
        }
    };
};
