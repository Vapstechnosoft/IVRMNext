'use server';

import { api as apiService } from '@/lib/apiService';

export async function getMasterOEExamInitialLoad() {
    try {
        const response = await apiService.get('naac', '/MasterOEExamFacade/GetInitialLoadData');
        return response;
    } catch (error) {
        console.error('Error fetching initial load data:', error);
        return { success: false, message: error.message || String(error) };
    }
}

export async function getMasterExamList(request: any) {
    try {
        const response = await apiService.post('naac', '/MasterOEExamFacade/GetMasterExamList', request);
        return response;
    } catch (error) {
        console.error('Error fetching master exam list:', error);
        return { success: false, message: error.message || String(error) };
    }
}

export async function saveMasterExam(request: any) {
    try {
        const response = await apiService.post('naac', '/MasterOEExamFacade/SaveMasterExam', request);
        return response;
    } catch (error) {
        console.error('Error saving master exam:', error);
        return { success: false, message: error.message || String(error) };
    }
}

export async function toggleMasterExam(id: number) {
    try {
        const response = await apiService.patch('naac', `/MasterOEExamFacade/ToggleMasterExam/${id}`, {});
        return response;
    } catch (error) {
        console.error('Error toggling master exam:', error);
        return { success: false, message: error.message || String(error) };
    }
}

export async function deleteMasterExam(id: number) {
    try {
        const response = await apiService.delete('naac', `/MasterOEExamFacade/DeleteMasterExam/${id}`);
        return response;
    } catch (error) {
        console.error('Error deleting master exam:', error);
        return { success: false, message: error.message || String(error) };
    }
}
