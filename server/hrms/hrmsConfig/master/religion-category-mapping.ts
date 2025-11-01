'use server';

import { api } from '@/lib/apiService';
import type { ReligionCategoryMappingInput, ReligionCategoryMappingResponse } from '@/types/hrms/religion-category-mapping';

/**
 * Get onload details for religion category mapping
 * POST /api/ReligionCategory_MappingFacade/loaddata
 */
export async function getReligionCategoryMappingList(_roleId = 0, userId = 2) {
    const url = '/api/ReligionCategory_MappingFacade/loaddata';
    const requestBody = {
        IRCC_Id: 0,
        MI_Id: 30,
        UserId: userId,
        IVRMMR_Id: 0,
        IMCC_Id: 0,
        IRCC_ActiveFlg: true,
        IRCC_CreatedBy: 0,
        IRCC_UpdatedBy: 0,
        IRCC_CreatedDate: new Date().toISOString(),
        IRCC_UpdatedDate: new Date().toISOString(),
        religion_list: [
            {
                CreatedDate: new Date().toISOString(),
                UpdatedDate: new Date().toISOString(),
                IVRMMR_Id: 0,
                IVRMMR_Name: 'string',
                Is_Active: true
            }
        ],
        get_masterlist: [],
        caste_list: [
            {
                CreatedDate: new Date().toISOString(),
                UpdatedDate: new Date().toISOString(),
                IMCC_Id: 0,
                IMCC_CategoryName: 'string',
                IMCC_CategoryCode: 'string',
                IMCC_CategoryDesc: 'string'
            }
        ],
        editlist: [],
        returnval: true,
        castid: [],
        duplicate: true,
        IVRMMR_Name: 'string',
        IMCC_CategoryName: 'string',
        msg: 'string'
    };
    return await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
}

/**
 * Save or Update religion category mapping record
 * POST /api/ReligionCategory_MappingFacade/savedata (create)
 * POST /api/ReligionCategory_MappingFacade/Editdata (update)
 */
export async function saveReligionCategoryMapping(data: ReligionCategoryMappingInput) {
    const isEdit = data.IRCC_Id && data.IRCC_Id > 0;
    const url = isEdit ? '/api/ReligionCategory_MappingFacade/Editdata' : '/api/ReligionCategory_MappingFacade/savedata';
    const requestBody = {
        IRCC_Id: data.IRCC_Id || 0,
        MI_Id: data.MI_Id || 30,
        UserId: data.UserId || 0,
        IVRMMR_Id: 0,
        IMCC_Id: 0,
        IRCC_ActiveFlg: data.IRCC_ActiveFlg ?? true,
        IRCC_CreatedBy: data.IRCC_CreatedBy || 0,
        IRCC_UpdatedBy: data.IRCC_UpdatedBy || 0,
        IRCC_CreatedDate: new Date().toISOString(),
        IRCC_UpdatedDate: new Date().toISOString(),
        religion_list: [
            {
                CreatedDate: new Date().toISOString(),
                UpdatedDate: new Date().toISOString(),
                IVRMMR_Id: data.IVRMMR_Id || 0,
                IVRMMR_Name: 'string',
                Is_Active: true
            }
        ],
        get_masterlist: [],
        caste_list: [
            {
                CreatedDate: new Date().toISOString(),
                UpdatedDate: new Date().toISOString(),
                IMCC_Id: data.IMCC_Id || 0,
                IMCC_CategoryName: 'string',
                IMCC_CategoryCode: 'string',
                IMCC_CategoryDesc: 'string'
            }
        ],
        editlist: [],
        returnval: true,
        castid: [],
        duplicate: true,
        IVRMMR_Name: 'string',
        IMCC_CategoryName: 'string',
        msg: 'string'
    };
    return await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
}

/**
 * Activate/Deactivate religion category mapping
 * POST /api/ReligionCategory_MappingFacade/masterDecative
 */
export async function activateDeactivateReligionCategoryMapping(data: { IRCC_Id: number; IRCC_ActiveFlg: boolean }) {
    const url = '/api/ReligionCategory_MappingFacade/masterDecative';
    const requestBody = {
        IRCC_Id: data.IRCC_Id,
        MI_Id: 30,
        UserId: 0,
        IVRMMR_Id: 0,
        IMCC_Id: 0,
        IRCC_ActiveFlg: data.IRCC_ActiveFlg,
        IRCC_CreatedBy: 0,
        IRCC_UpdatedBy: 0,
        IRCC_CreatedDate: new Date().toISOString(),
        IRCC_UpdatedDate: new Date().toISOString(),
        religion_list: [],
        get_masterlist: [],
        caste_list: [],
        editlist: [],
        returnval: true,
        castid: [],
        duplicate: true,
        IVRMMR_Name: 'string',
        IMCC_CategoryName: 'string',
        msg: 'string'
    };
    return await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
}
