import { fetchFloorData, fetchMappedFacilities, IFloorDisplay } from '@/server/hostel/hostel-management/masters/floor';
import { IFacility, IHostel } from '@/types/hostel/hostel-management/masters';
import { useQuery } from '@tanstack/react-query';

interface IMasterFloorData {
  floorList: IFloorDisplay[];
  hostelList: IHostel[];
  facilityList: IFacility[];
}

// export const useMasterFloor = () => {
//   const { data, isLoading, refetch } = useQuery<IMasterFloorData>({
//     queryKey: ['master-floor'],
//     queryFn: async () => {
//       const result = await fetchFloorData();
//       return result;
//     },
//     staleTime: 5 * 60 * 1000
//   });

//   return {
//     floorList: data?.floorList ?? [],
//     hostelList: data?.hostelList ?? [],
//     facilityList: data?.facilityList ?? [],
//     isLoading,
//     refetch
//   };
// };

/*************  ✨ Windsurf Command 🌟  *************/
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
/*******  7dc81068-1a2f-4d5b-b247-bac2089e15da  *******/
