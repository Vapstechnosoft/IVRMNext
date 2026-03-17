import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getEventsStudentSRKVSDropdowns,
    getClassHouse,
    getSectionList,
    getSportsName,
    getSubSubEvents,
    getStudents,
    saveEventsStudentSRKVS,
    getEventsStudentSRKVSList,
    deactivateEventsStudentSRKVS,
    getEventsStudentSRKVSDetails
} from '@/server/sports/events-student-srkvs';
import { toast } from 'sonner'; // Ensure toast is imported

export const useEventsStudentSRKVS = () => {
    const queryClient = useQueryClient();

    const dropdowns = useQuery({
        queryKey: ['eventsStudentSRKVSDropdowns'],
        queryFn: () => getEventsStudentSRKVSDropdowns(),
    });

    const gridData = useQuery({
        queryKey: ['eventsStudentSRKVSList'],
        queryFn: () => getEventsStudentSRKVSList(),
    });

    const fetchClassHouse = useMutation({
        mutationFn: (asamyId: number) => getClassHouse(asamyId),
    });

    const fetchSportsName = useMutation({
        mutationFn: (groupId: number) => getSportsName(groupId),
    });

    const fetchSubSubEvents = useMutation({
        mutationFn: ({ subEventId, groupId }: { subEventId: number, groupId: number }) => getSubSubEvents(subEventId, groupId),
    });

    const fetchSectionList = useMutation({
        mutationFn: (data: { ASMAY_Id: number, classListArray: any[] }) => getSectionList(data),
    });

    const fetchStudents = useMutation({
        mutationFn: (payload: any) => getStudents(payload),
    });

    const saveData = useMutation({
        mutationFn: (data: any) => saveEventsStudentSRKVS(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({ queryKey: ['eventsStudentSRKVSDropdowns'] }); // Refresh if needed
                queryClient.invalidateQueries({ queryKey: ['eventsStudentSRKVSList'] });
            } else {
                toast.error(response.message || 'Failed to save');
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error('An error occurred while saving');
        }
    });

    const fetchViewDetails = useMutation({
        mutationFn: (spccesT_Id: number) => getEventsStudentSRKVSDetails(spccesT_Id),
    });

    const deactivateData = useMutation({
        mutationFn: (data: { id: number, activeFlag: boolean }) => deactivateEventsStudentSRKVS(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({ queryKey: ['eventsStudentSRKVSList'] });
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error('An error occurred');
        }
    });

    return {
        dropdowns,
        gridData,
        fetchClassHouse,
        fetchSectionList,
        fetchSportsName,
        fetchSubSubEvents,
        fetchStudents,
        saveData,
        deactivateData,
        fetchViewDetails
    };
};
