'use server';

import { api } from '@/lib/apiService';
import { RoomTariffSchemaType } from '@/schemas/hostel/room-tariff.schema';
import { revalidatePath } from 'next/cache';

const URL_GET_DATA = 'Room_Tariff/loaddata';
const URL_SAVE_DATA = 'Room_Tariff/savedata';
const URL_DELETE_DATA = 'Room_Tariff/Ydeactive';
const URL_GET_BED_COUNT = 'Room_Tariff/get_bedcount';

export interface RoomTariffDataResponse {
  gridlistdata: IRoomTariff[];
  yeralist: IAcademicYear[];
  room_list: IRoom[];
}

export interface IRoomTariff {
  hlmrtF_Id: number;
  asmaY_Id: number;
  hrmrM_Id: number;
  hlmrtF_SORate: number;
  hlmrtF_RoomRate: number;
  hlmrtF_ActiveFlag: boolean;
  asmaY_Year?: string;
  hrmrM_RoomNo?: string;
}

export interface IAcademicYear {
  asmaY_Id: number;
  asmaY_Year: string;
}

export interface IRoom {
  hrmrM_Id: number;
  hrmrM_RoomNo: string;
}

export const getRoomTariffData = async () => {
    try {
        const response = await api.post<RoomTariffDataResponse>('default', URL_GET_DATA, {
             pageid: 2 
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching room tariff data:', error);
        return { gridlistdata: [], yeralist: [], room_list: [] };
    }
};

export const saveRoomTariff = async (data: RoomTariffSchemaType) => {
    try {
        const response = await api.post<{ returnval: boolean; duplicate?: boolean }>('default', URL_SAVE_DATA, data);
        
        if (response && response.data && response.data.returnval) {
            revalidatePath('/hostel/masters/room-tariff');
        }
        return response.data;
    } catch (error) {
        console.error('Error saving room tariff:', error);
        return { returnval: false };
    }
};

export const deleteRoomTariff = async (data: IRoomTariff) => {
    try {
        // AngularJS sends the entire object
        const response = await api.post<{ returnval: boolean }>('default', URL_DELETE_DATA, data);
        if ( response && response.data && response.data.returnval) {
             revalidatePath('/hostel/masters/room-tariff');
        }
        return response.data;
    } catch (error) {
        console.error('Error deleting room tariff:', error);
        return { returnval: false };
    }
};

export const getBedCount = async (roomId: number, singleRate: number) => {
    try {
        const payload = {
            HRMRM_Id: roomId,
            HLMRTF_SORate: singleRate
        };
        const response = await api.post<{ hrmrM_BedCapacity: number }>('default', URL_GET_BED_COUNT, payload);
        return response.data;
    } catch (error) {
        console.error('Error fetching bed count:', error);
        return { hrmrM_BedCapacity: 0 };
    }
}
