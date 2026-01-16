'use server';

import { api } from '@/lib/apiService';
import { RoomCategorySchemaType } from '@/schemas/hostel/room-category.schema';
import { revalidatePath } from 'next/cache';

const URL_GET_DATA = 'HS_Master/get_roomcatdata';
const URL_SAVE_DATA = 'HS_Master/save_roomcatdata';
const URL_DELETE_DATA = 'HS_Master/deactiveY_roomcatdata';

export interface RoomCategoryDataResponse {
  griddata: IRoomCategory[];
  hostellist: IHostel[];
  feegroupe: IFeeGroup[];
}

export interface IRoomCategory {
  hlmrcA_Id: number;
  hlmH_Id: number;
  fmG_Id: number;
  hlmrcA_RoomCategory: string;
  hlmrcA_SORate: number;
  hlmrcA_RoomRate: number;
  hlmrcA_MaxCapacity: number;
  hlmrcA_Description: string;
  hlmrcA_ACFlg: boolean;
  hlmrcA_SharingFlg: boolean;
  hlmrcA_ActiveFlag: boolean;
  hlmH_Name?: string; // from join likely
  fmG_GroupName?: string; // from join likely
}

export interface IHostel {
  hlmH_Id: number;
  hlmH_Name: string;
}

export interface IFeeGroup {
  fmG_Id: number;
  fmG_GroupName: string;
}

export const getRoomCategoryData = async () => {
    try {
        const response = await api.post<RoomCategoryDataResponse>('default', URL_GET_DATA, {
             pageid: 2 
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching room category data:', error);
        return { griddata: [], hostellist: [], feegroupe: [] };
    }
};

export const saveRoomCategory = async (data: RoomCategorySchemaType) => {
    try {
        const payload = {
            HLMRCA_Id: data.hlmrcA_Id,
            HLMH_Id: data.HLMH_Id,
            FMG_Id: data.FMG_Id,
            HLMRCA_RoomCategory: data.HLMRCA_RoomCategory,
            HLMRCA_SORate: data.HLMRCA_SORate,
            HLMRCA_RoomRate: data.HLMRCA_RoomRate,
            HLMRCA_MaxCapacity: data.HLMRCA_MaxCapacity,
            HLMRCA_Description: data.HLMRCA_Description,
            HLMRCA_ACFlg: data.hlmrcA_ACFlg ? 1 : 0,
            HLMRCA_SharingFlg: data.hlmrcA_SharingFlg ? 1 : 0
        };

        const response = await api.post<{ returnval: boolean; duplicate?: boolean }>('default', URL_SAVE_DATA, payload);
        
        if (response?.data?.returnval) {
            revalidatePath('/hostel/masters/room-category');
        }
        return response.data;
    } catch (error) {
        console.error('Error saving room category:', error);
        return { returnval: false };
    }
};

export const deleteRoomCategory = async (data: IRoomCategory) => {
    try {
         const payload = { ...data, hlmrcA_Id: data.hlmrcA_Id };
        const response = await api.post<{ returnval: boolean }>('default', URL_DELETE_DATA, payload);
        if (response.data?.returnval) {
             revalidatePath('/hostel/masters/room-category');
        }
        return response.data;
    } catch (error) {
        console.error('Error deleting room category:', error);
        return { returnval: false };
    }
};
