import { useQuery } from '@tanstack/react-query';
import { fetchFloorData, fetchMappedFacilities, IFloorDisplay, IHostel, IFacility } from '@/server/hostel/master-floor/server-action';

interface IMasterFloorData {
  floorList: IFloorDisplay[];
  hostelList: IHostel[];
  facilityList: IFacility[];
}

export const useMasterFloor = () => {
  const { data, isLoading, refetch } = useQuery<IMasterFloorData>({
    queryKey: ['master-floor'],
    queryFn: async () => {
      const result = await fetchFloorData();
      return result;
    },
    staleTime: 5 * 60 * 1000
  });

  return {
    floorList: data?.floorList ?? [],
    hostelList: data?.hostelList ?? [],
    facilityList: data?.facilityList ?? [],
    isLoading,
    refetch
  };
};

export const useMappedFacilities = (floorId: number | undefined) => {
    return useQuery<IFacility[]>({
        queryKey: ['floor-mapped-facilities', floorId],
        queryFn: async () => {
            if (!floorId) return [];
            return await fetchMappedFacilities(floorId);
        },
        enabled: !!floorId,
        staleTime: 5 * 60 * 1000
    });
};
