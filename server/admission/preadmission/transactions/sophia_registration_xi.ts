import { api, ApiResponse } from "@/lib/apiService";

const API_BASE = 'StudentApplication';

export const server = {
    getInitialData: async (orgId: number, instId: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `${API_BASE}/getdpforreg`, { Organization: orgId, Institute: instId });
    },

    getCaste: async (imccId: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `${API_BASE}/getCaste`, { IMCC_Id: imccId });
    },

    onClassChange: async (classId: number, asmayId: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `${API_BASE}/classchange`, { ASMCL_Id: classId, ASMAY_Id: asmayId });
    },

    onClassChangeMaxMinAge: async (classId: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `${API_BASE}/classchangemaxminage`, { ASMCL_Id: classId });
    },

    getStreams: async (classId: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `${API_BASE}/getstreams`, { ASMCL_Id: classId });
    },

    getSubjects: async (classId: number, asmstId: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `${API_BASE}/GetSubjectsofinstitute`, { ASMCL_Id: classId, ASMST_Id: asmstId });
    },

    getStates: async (countryId: number): Promise<ApiResponse<any>> => {
        return api.get('preadmission', `${API_BASE}/getdpstate/${countryId}`);
    },

    getDistricts: async (stateId: number): Promise<ApiResponse<any>> => {
        return api.get('preadmission', `${API_BASE}/getdpdistrict/${stateId}`);
    },

    saveRegistration: async (payload: any): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `${API_BASE}/`, payload);
    },

    deleteRegistration: async (id: number): Promise<ApiResponse<any>> => {
        return api.get('preadmission', `${API_BASE}/deletedetails/${id}`);
    },

    toggleStatus: async (id: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `${API_BASE}/ActivateDactivate`, { pasr_id: id });
    },

    payNow: async (payload: any): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `${API_BASE}/paynow`, payload);
    }
};
