'use server';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

const FACADE_URL = '/MasterBoardandSchoolTypeFacade';

export async function getMasterBoardData(searchParams: any) {
    const url = `${FACADE_URL}/getalldetails/2`;
    try {
        const response = await api.get<any>('admission', url);
        if (response.success && response.data) {
            return {
                success: true,
                message: response.message,
                data: response.data.boardList || [],
                total: response.data.boardList ? response.data.boardList.length : 0
            };
        }
        return {
            success: false,
            message: response.message || "Failed to fetch data",
            data: [],
            total: 0
        };
    } catch (error) {
        console.error("Error fetching board data:", error);
        return {
            success: false,
            message: "Failed to fetch data",
            data: [],
            total: 0
        };
    }
}

export async function saveMasterBoard(data: any) {
    const url = `${FACADE_URL}`;
    try {
        const response = await api.post('admission', url, data);
        if (response.success) {
            revalidatePath('/admission/oldsharehost/masters/master-board');
        }
        return response as any;
    } catch (error) {
        return {
            success: false,
            message: "Failed to save data",
            error: error
        } as any;
    }
}

export async function getMasterBoardDetails(id: number) {
    const url = `${FACADE_URL}/getdetails/${id}`;
    try {
        const response = await api.get<any>('admission', url);
        if (response.success && response.data && Array.isArray(response.data.boardList)) {
            return {
                success: true,
                message: response.message,
                data: response.data.boardList[0]
            };
        }
        return {
            success: false,
            message: response.message || "Failed to fetch details",
            data: null
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch details",
            data: null
        };
    }
}

export async function deleteMasterBoard(id: number) {
    const url = `${FACADE_URL}/deletedetails/${id}`;
    try {
        const response = await api.post('admission', url, {});
        if (response.success || response.returnval === true || response.returnval === "true") {
            revalidatePath('/admission/oldsharehost/masters/master-board');
        }
        return response as any;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete data",
        } as any;
    }
}
