'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    uploadAndSchedule, 
    getLibrary, 
    deleteMedia, 
    getSchedule, 
    deleteSchedule, 
    getDisplays, 
    requestScreenshot 
} from '@/server/digital-signage';
import { toast } from 'sonner';

export const SIGNAGE_QUERY_KEYS = {
    LIBRARY: 'signage:library',
    SCHEDULE: 'signage:schedule',
    DISPLAYS: 'signage:displays'
};

/**
 * Hook for Digital Signage Operations
 */
export function useSignage() {
    const queryClient = useQueryClient();

    // --- LIBRARY ---
    const useLibrary = (page: number = 1) => {
        return useQuery({
            queryKey: [SIGNAGE_QUERY_KEYS.LIBRARY, page],
            queryFn: () => getLibrary(page),
            placeholderData: (previousData) => previousData,
        });
    };

    const deleteMediaMutation = useMutation({
        mutationFn: ({ mediaId, forceDelete }: { mediaId: number; forceDelete?: boolean }) => 
            deleteMedia(mediaId, forceDelete),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Media deleted successfully');
                queryClient.invalidateQueries({ queryKey: [SIGNAGE_QUERY_KEYS.LIBRARY] });
            } else {
                toast.error(response.message || 'Failed to delete media');
            }
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to delete media');
        }
    });

    // --- SCHEDULE ---
    const useSchedule = (page: number = 1) => {
        return useQuery({
            queryKey: [SIGNAGE_QUERY_KEYS.SCHEDULE, page],
            queryFn: () => getSchedule(page),
            placeholderData: (previousData) => previousData,
        });
    };

    const deleteScheduleMutation = useMutation({
        mutationFn: (eventId: number) => deleteSchedule(eventId),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Schedule event deleted successfully');
                queryClient.invalidateQueries({ queryKey: [SIGNAGE_QUERY_KEYS.SCHEDULE] });
            } else {
                toast.error(response.message || 'Failed to delete schedule');
            }
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to delete schedule');
        }
    });

    // --- DISPLAYS ---
    const useDisplays = (page: number = 1) => {
        return useQuery({
            queryKey: [SIGNAGE_QUERY_KEYS.DISPLAYS, page],
            queryFn: () => getDisplays(page),
            placeholderData: (previousData) => previousData,
        });
    };

    const requestScreenshotMutation = useMutation({
        mutationFn: (displayId: number) => requestScreenshot(displayId),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Screenshot request submitted');
            } else {
                toast.error(response.message || 'Failed to request screenshot');
            }
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to request screenshot');
        }
    });

    // --- UPLOAD & SCHEDULE ---
    const uploadMutation = useMutation({
        mutationFn: (formData: FormData) => uploadAndSchedule(formData),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Media uploaded and scheduled successfully');
                queryClient.invalidateQueries({ queryKey: [SIGNAGE_QUERY_KEYS.LIBRARY] });
                queryClient.invalidateQueries({ queryKey: [SIGNAGE_QUERY_KEYS.SCHEDULE] });
            } else {
                toast.error(response.message || 'Failed to upload and schedule');
            }
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to upload and schedule');
        }
    });

    return {
        useLibrary,
        deleteMedia: deleteMediaMutation,
        useSchedule,
        deleteSchedule: deleteScheduleMutation,
        useDisplays,
        requestScreenshot: requestScreenshotMutation,
        uploadAndSchedule: uploadMutation
    };
}
