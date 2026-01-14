import { fetchRoomData, IFacility, IHostel, IRoomDisplay } from '@/server/hostel/master-room/server-action';
import { useEffect, useState } from 'react';

export function useMasterRoom() {
    const [roomList, setRoomList] = useState<IRoomDisplay[]>([]);
    const [hostels, setHostels] = useState<IHostel[]>([]);
    const [facilities, setFacilities] = useState<IFacility[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await fetchRoomData();
            if (result.success && result.data) {
                setRoomList(result.data.roomList);
                setHostels(result.data.hostels);
                setFacilities(result.data.facilities);
            }
        } catch (error) {
            console.error('Failed to fetch room data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        roomList,
        hostels,
        facilities,
        isLoading,
        refetch: fetchData
    };
}
