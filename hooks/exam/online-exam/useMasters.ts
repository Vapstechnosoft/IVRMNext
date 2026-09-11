import { ONLINE_EXAM_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterQuestionInitialData, getQuestionOptions } from '@/server/exam/online-exam/masters/master-question';
import { getMasterQuestionCollegeInitialData, getQuestionOptionsCollege } from '@/server/exam/online-exam/masters/master-question-college';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Hook for Master Question (School)
export function useMasterQuestion(searchParams?: ApiSearchparams, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION, searchParams ?? {}],
        queryFn: async () => {
            try {
                const miId = searchParams?.MI_Id || 30;
                const res = await fetch(`/api/exam/master-question?MI_Id=${miId}`, {
                    cache: 'no-store'
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json?.data) return json.data;
                }
            } catch (err) {
                console.warn('[useMasterQuestion] Route fetch error, trying Server Action:', err);
            }
            return getMasterQuestionInitialData(searchParams);
        },
        staleTime: 0,
        enabled: options?.enabled ?? true
    });

    return {
        ...query,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION]
            });
        }
    };
}

// Hook to Save / Update Master Question
export function useSaveMasterQuestion() {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async (payload: any) => {
            const res = await fetch('/api/exam/master-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save', ...payload })
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || json?.success === false) {
                throw new Error(json?.message || json?.error || `Request failed with status ${res.status}`);
            }
            queryClient.invalidateQueries({
                queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION]
            });
            return json;
        }
    };
}

// Hook to Toggle Master Question Status
export function useToggleMasterQuestion() {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async (questionId: number) => {
            const res = await fetch('/api/exam/master-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle', LPMOEQ_Id: questionId, MI_Id: 30 })
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || json?.success === false) {
                throw new Error(json?.message || json?.error || `Request failed with status ${res.status}`);
            }
            queryClient.invalidateQueries({
                queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION]
            });
            return json;
        }
    };
}

// Hook for Question Options (School)
export function useQuestionOptions(questionId: number | null) {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_OPTIONS, questionId],
        queryFn: async () => {
            if (!questionId) return null;
            return getQuestionOptions(questionId);
        },
        enabled: Boolean(questionId)
    });
}

// Hook for Question Options (College)
export function useQuestionOptionsCollege(questionId: number | null) {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_OPTIONS, questionId],
        queryFn: async () => {
            if (!questionId) return null;
            return getQuestionOptionsCollege(questionId);
        },
        enabled: Boolean(questionId)
    });
}

// Hook for Master Question College
export function useMasterQuestionCollege(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_COLLEGE, searchParams ?? {}],
        queryFn: async () => getMasterQuestionCollegeInitialData(searchParams),
        staleTime: 0
    });

    return {
        ...query,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_COLLEGE]
            });
        }
    };
}

// Hook for Master Complexity
export function useMasterComplexity(searchParams?: ApiSearchparams, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['MASTER_COMPLEXITY', searchParams ?? {}],
        queryFn: async () => {
            const miId = searchParams?.MI_Id || 30;
            const res = await fetch(`/api/exam/master-complexity?MI_Id=${miId}`, {
                cache: 'no-store'
            });
            if (!res.ok) {
                throw new Error('Failed to fetch master complexity');
            }
            const json = await res.json();
            return json?.data || {};
        },
        staleTime: 0,
        enabled: options?.enabled ?? true
    });

    return {
        ...query,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['MASTER_COMPLEXITY']
            });
        }
    };
}

// Hook to Save / Update Master Complexity
export function useSaveMasterComplexity() {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async (payload: any) => {
            const res = await fetch('/api/exam/master-complexity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save', ...payload })
            });
            const json = await res.json();
            await queryClient.invalidateQueries({
                queryKey: ['MASTER_COMPLEXITY']
            });
            return json;
        }
    };
}

// Hook to Toggle Master Complexity Status
export function useToggleMasterComplexity() {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async (complexityId: number) => {
            const res = await fetch('/api/exam/master-complexity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle', LPMCOMP_Id: complexityId, MI_Id: 30 })
            });
            const json = await res.json();
            await queryClient.invalidateQueries({
                queryKey: ['MASTER_COMPLEXITY']
            });
            return json;
        }
    };
}

// Hook to Delete Master Complexity
export function useDeleteMasterComplexity() {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async (complexityId: number) => {
            const res = await fetch('/api/exam/master-complexity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', LPMCOMP_Id: complexityId, MI_Id: 30 })
            });
            const json = await res.json();
            await queryClient.invalidateQueries({
                queryKey: ['MASTER_COMPLEXITY']
            });
            return json;
        }
    };
}
