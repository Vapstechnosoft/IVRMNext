'use client';

import { RECRUITMENT_QUERY_KEYS } from '@/constants/query-keys';
import { getCadidateGridData, getCandidateDetails, saveOrUpdateCandidate, toggleCandidateStatus } from '@/server/hrms/recruitment/transactions/addCadidate';
import { getCandidatesAndInterviewers } from '@/server/hrms/recruitment/transactions/addCandidateInterview';
import { getInterviewFeedbackGridData, InterviewSchedule, saveInterviewerFeedback } from '@/server/hrms/recruitment/transactions/interviewFeedback';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ---------------- Add Candidate Hooks ----------------

export function useGetCandidateGridData() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST],
            queryFn: async () => getCadidateGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST]
            });
        }
    };
}

export function useGetCandidateDetails(hrcd_Id: number) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST, hrcd_Id],
            queryFn: async () => getCandidateDetails(hrcd_Id),
            enabled: !!hrcd_Id && hrcd_Id !== 0,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST, hrcd_Id]
            });
        }
    };
}

export function useSaveOrUpdateCandidate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveOrUpdateCandidate(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Candidate saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST]
                });
            } else {
                toast.error(response.message || 'Failed to save candidate');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while saving candidate');
        }
    });
}

export function useToggleCandidateStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hrcd_Id: number) => toggleCandidateStatus(hrcd_Id),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Status toggled successfully');
                queryClient.invalidateQueries({
                    queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST]
                });
            } else {
                toast.error(response.message || 'Failed to toggle status');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while toggling status');
        }
    });
}

// ---------------- Add Candidate Interview Hooks ----------------

export function useGetCandidateAndInterviewers() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_INTERVIEW_LIST],
            queryFn: async () => getCandidatesAndInterviewers(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_INTERVIEW_LIST]
            });
        }
    };
}


// ---------------- Add Candidate Interview Feedback Hooks ----------------

export function useGetInterviewerFeedbackGridData() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_INTERVIEW_FEEDBACK_LIST],
            queryFn: async () => getInterviewFeedbackGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_INTERVIEW_FEEDBACK_LIST]
            });
        }
    };
}

export function useSaveInterviewerFeedback() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: InterviewSchedule) => saveInterviewerFeedback(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Feedback saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_INTERVIEW_FEEDBACK_LIST]
                });
            } else {
                toast.error(response.message || 'Failed to save feedback');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while saving feedback');
        }
    });
}