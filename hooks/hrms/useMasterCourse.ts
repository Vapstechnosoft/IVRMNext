import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterCourse,
    getMasterCourseDetails,
    getMasterCourseList,
    saveMasterCourse,
    saveMasterCourseOrder
} from '@/server/hrms/hrmsConfig/master/course';
import type { CourseDetail, MasterCourseInput } from '@/types/hrms/master-course';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterCourse(roleId: number) {
    const queryClient = useQueryClient();

    // Query: Fetch list of courses
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE, roleId],
        queryFn: () => getMasterCourseList(roleId),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    // Mutation: Save (create/update) course
    const saveMutation = useMutation({
        mutationFn: (data: MasterCourseInput) => saveMasterCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
        }
    });

    // Mutation: Activate/Deactivate course
    const toggleMutation = useMutation({
        mutationFn: (data: { HRMC_Id: number; HRMC_ActiveFlag: boolean; MI_Id?: number }) => activateDeactivateMasterCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
        }
    });

    // Mutation: Save order for multiple courses
    const saveOrderMutation = useMutation({
        mutationFn: (courses: CourseDetail[]) => saveMasterCourseOrder(courses),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleMutation,
        saveOrderMutation
    };
}

// Hook for fetching course details by ID
export function useMasterCourseDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE, 'details', id],
        queryFn: () => getMasterCourseDetails(id),
        enabled: id > 0
    });
}
