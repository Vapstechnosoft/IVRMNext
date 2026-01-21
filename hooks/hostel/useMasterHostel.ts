import { fetchHostelData } from '@/server/hostel/hostel-management/masters/hostel';
import { useQuery } from '@tanstack/react-query';

export const useMasterHostel = () => {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['masterHostel'],
        queryFn: async () => {
            const response = await fetchHostelData();
            if(!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        }
    });

    return {
        hostelList: data?.hostelList || [],
        countries: data?.countries || [],
        states: data?.states || [],
        facilities: data?.facilities || [],
        messes: data?.messes || [],
        employees: data?.employees || [],
        isLoading,
        refetch
    };
};
