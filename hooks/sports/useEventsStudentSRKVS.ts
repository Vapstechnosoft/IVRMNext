import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import { getEventsStudentSRKVSList, saveEventsStudentSRKVS, deactivateEventsStudentSRKVS, getEventsStudentSRKVSDetails } from '@/server/sports/events-student-srkvs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useEventsStudentSRKVS = (searchParams?: any) => {
    const queryClient = useQueryClient();

    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [sortBy] = useQueryState(tableSearchVariables.sort_column, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [order] = useQueryState(tableSearchVariables.sort_direction, parseAsStringLiteral(['asc', 'desc'] as const).withOptions({ shallow: false }).withDefault('asc'));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const params = {
        page: page,
        page_size: pageSize,
        sort_column: sortBy,
        sort_direction: order,
        search_query: searchQuery,
    };

    const loadData = useQuery({
        queryKey: ['events-student-srkvs-details', page, pageSize, sortBy, order, searchQuery],
        queryFn: () => getEventsStudentSRKVSList(), // This mock doesn't seem to take params yet
        staleTime: 0
    });

    const save = useMutation({
        mutationFn: (data: any) => saveEventsStudentSRKVS(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Saved successfully');
            } else {
                toast.error(response.message || 'Failed to save');
            }
            queryClient.invalidateQueries({ queryKey: ['events-student-srkvs-details'] });
        },
    });

    const deactivateData = useMutation({
        mutationFn: (data: { id: number, activeFlag: boolean }) => deactivateEventsStudentSRKVS(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Status updated successfully');
            } else {
                toast.error(response.message || 'Failed to update status');
            }
            queryClient.invalidateQueries({ queryKey: ['events-student-srkvs-details'] });
        },
    });

    const fetchViewDetails = useMutation({
        mutationFn: (id: number) => getEventsStudentSRKVSDetails(id)
    });

    return {
        loadData,
        save,
        deactivateData,
        fetchViewDetails,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['events-student-srkvs-details']
            });
        }
    };
};
