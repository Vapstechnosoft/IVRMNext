import { EXAM_QUERY_KEYS } from '@/constants/query-keys';
import { getExamMasterCategory } from '@/server/exam/exam-module/masters/category';
import { getExamMasterCategoryMapping } from '@/server/exam/exam-module/masters/category-class-mapping';
import { getMasterExam } from '@/server/exam/exam-module/masters/exam';
import { getMasterExamPaper } from '@/server/exam/exam-module/masters/exam-paper';
import { getMasterGrade, getMasterGradeDetails } from '@/server/exam/exam-module/masters/grade';
import { getMasterSubExam } from '@/server/exam/exam-module/masters/sub-exam';
import { getMasterSubject } from '@/server/exam/exam-module/masters/subject';
import {
    getAllMasterSubjectDetails,
    getMasterSubjectGroup,
    getMasterSubjectGroupDetails
} from '@/server/exam/exam-module/masters/subject-group';
import { getMasterSubSubject } from '@/server/exam/exam-module/masters/sus-subject';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterSubject = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_SUBJECT, searchParams ?? {}],
            queryFn: async () => getMasterSubject(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_SUBJECT]
            });
        }
    };
};

export const useMasterExam = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_EXAM, searchParams ?? {}],
            queryFn: async () => getMasterExam(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_EXAM]
            });
        }
    };
};

export const useMasterExamPaper = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_EXAM_PAPER, searchParams ?? {}],
            queryFn: async () => getMasterExamPaper(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_EXAM_PAPER]
            });
        }
    };
};

export const useMasterSubExam = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_SUB_EXAM, searchParams ?? {}],
            queryFn: async () => getMasterSubExam(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_SUB_EXAM]
            });
        }
    };
};

export const useMasterSubSubject = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_SUB_SUBJECT_EX, searchParams ?? {}],
            queryFn: async () => getMasterSubSubject(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_SUB_SUBJECT_EX]
            });
        }
    };
};

export const useMasterGrade = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_GRADE_EX, searchParams ?? {}],
            queryFn: async () => getMasterGrade(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_GRADE_EX]
            });
        }
    };
};

export const useMasterGradeDetails = (mi_Id: number, gradeId: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_GRADE_DETAILS, gradeId],
            queryFn: async () => getMasterGradeDetails(mi_Id, gradeId),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_GRADE_DETAILS]
            });
        }
    };
};

export const useMasterSubjectGroup = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_SUBJECT_GROUP_, searchParams ?? {}],
            queryFn: async () => getMasterSubjectGroup(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_SUBJECT_GROUP_]
            });
        }
    };
};

// ✅ Fetch details for a single Master Subject Group
export const useMasterSubjectGroupDetails = (mi_Id: number, subjectGroupId: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_SUBJECT_GROUP_DETAILS, subjectGroupId],
            queryFn: async () => getMasterSubjectGroupDetails(mi_Id, subjectGroupId),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_SUBJECT_GROUP_DETAILS]
            });
        }
    };
};

export const useMasterGetAllSubjectGroupDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_ALL_SUBJECT_GROUP_DETAILS, searchParams ?? {}],
            queryFn: async () => getAllMasterSubjectDetails(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_ALL_SUBJECT_GROUP_DETAILS]
            });
        }
    };
};

// MASTER CATEGORY --------------------------------------

export const useMasterCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_CATEGORY, searchParams ?? {}],
            queryFn: async () => getExamMasterCategory(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_CATEGORY]
            });
        }
    };
};

export const useMasterCategoryClassMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.MASTER_CATEGORY_CLASS_MAPPING, searchParams ?? {}],
            queryFn: async () => getExamMasterCategoryMapping(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.MASTER_CATEGORY_CLASS_MAPPING]
            });
        }
    };
};
