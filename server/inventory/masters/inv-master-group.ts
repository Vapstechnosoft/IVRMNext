'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IInvMasterGroupLoadResponse,
    IInvMasterMainGroup,
    IInvMasterUserGroup,
    IInvMasterItemGroup
} from '@/types/inventory/masters/inv-master-group';

const DUMMY_MAIN_GROUPS: IInvMasterMainGroup[] = [
    { invmG_Id: 1, invmG_GroupName: 'Electronics', invmG_AliasName: 'Elec', invmG_GroupPrefix: 'EL', invmG_GroupSuffix: 'S', invmG_GroupStartingNo: '100', invmG_ActiveFlg: true },
    { invmG_Id: 2, invmG_GroupName: 'Furniture', invmG_AliasName: 'Furn', invmG_GroupPrefix: 'FU', invmG_GroupSuffix: 'N', invmG_GroupStartingNo: '200', invmG_ActiveFlg: true },
    { invmG_Id: 3, invmG_GroupName: 'Stationery', invmG_AliasName: 'Stat', invmG_GroupPrefix: 'ST', invmG_GroupSuffix: 'Y', invmG_GroupStartingNo: '300', invmG_ActiveFlg: true },
    { invmG_Id: 4, invmG_GroupName: 'Sports Equipment', invmG_AliasName: 'Sport', invmG_GroupPrefix: 'SP', invmG_GroupSuffix: 'E', invmG_GroupStartingNo: '400', invmG_ActiveFlg: true },
    { invmG_Id: 5, invmG_GroupName: 'Lab Instruments', invmG_AliasName: 'Lab', invmG_GroupPrefix: 'LB', invmG_GroupSuffix: 'I', invmG_GroupStartingNo: '500', invmG_ActiveFlg: true },
    { invmG_Id: 6, invmG_GroupName: 'Library Books', invmG_AliasName: 'Lib', invmG_GroupPrefix: 'LI', invmG_GroupSuffix: 'B', invmG_GroupStartingNo: '600', invmG_ActiveFlg: true },
    { invmG_Id: 7, invmG_GroupName: 'Housekeeping', invmG_AliasName: 'House', invmG_GroupPrefix: 'HK', invmG_GroupSuffix: 'P', invmG_GroupStartingNo: '700', invmG_ActiveFlg: true },
    { invmG_Id: 8, invmG_GroupName: 'Uniforms', invmG_AliasName: 'Uni', invmG_GroupPrefix: 'UN', invmG_GroupSuffix: 'M', invmG_GroupStartingNo: '800', invmG_ActiveFlg: true },
    { invmG_Id: 9, invmG_GroupName: 'Vehicles', invmG_AliasName: 'Veh', invmG_GroupPrefix: 'VE', invmG_GroupSuffix: 'H', invmG_GroupStartingNo: '900', invmG_ActiveFlg: true },
    { invmG_Id: 10, invmG_GroupName: 'IT Peripherals', invmG_AliasName: 'IT', invmG_GroupPrefix: 'IT', invmG_GroupSuffix: 'P', invmG_GroupStartingNo: '1000', invmG_ActiveFlg: true },
    { invmG_Id: 11, invmG_GroupName: 'Medical Supplies', invmG_AliasName: 'Med', invmG_GroupPrefix: 'MD', invmG_GroupSuffix: 'S', invmG_GroupStartingNo: '1100', invmG_ActiveFlg: true },
    { invmG_Id: 12, invmG_GroupName: 'Cafeteria', invmG_AliasName: 'Cafe', invmG_GroupPrefix: 'CF', invmG_GroupSuffix: 'T', invmG_GroupStartingNo: '1200', invmG_ActiveFlg: true },
    { invmG_Id: 13, invmG_GroupName: 'Gardening', invmG_AliasName: 'Gard', invmG_GroupPrefix: 'GR', invmG_GroupSuffix: 'D', invmG_GroupStartingNo: '1300', invmG_ActiveFlg: true },
    { invmG_Id: 14, invmG_GroupName: 'Music Instruments', invmG_AliasName: 'Music', invmG_GroupPrefix: 'MU', invmG_GroupSuffix: 'I', invmG_GroupStartingNo: '1400', invmG_ActiveFlg: true },
    { invmG_Id: 15, invmG_GroupName: 'Art Supplies', invmG_AliasName: 'Art', invmG_GroupPrefix: 'AR', invmG_GroupSuffix: 'S', invmG_GroupStartingNo: '1500', invmG_ActiveFlg: true },
    { invmG_Id: 16, invmG_GroupName: 'Building Material', invmG_AliasName: 'Build', invmG_GroupPrefix: 'BM', invmG_GroupSuffix: 'T', invmG_GroupStartingNo: '1600', invmG_ActiveFlg: true },
    { invmG_Id: 17, invmG_GroupName: 'Electricals', invmG_AliasName: 'Elect', invmG_GroupPrefix: 'EC', invmG_GroupSuffix: 'L', invmG_GroupStartingNo: '1700', invmG_ActiveFlg: true },
    { invmG_Id: 18, invmG_GroupName: 'Plumbing', invmG_AliasName: 'Plumb', invmG_GroupPrefix: 'PL', invmG_GroupSuffix: 'B', invmG_GroupStartingNo: '1800', invmG_ActiveFlg: true },
    { invmG_Id: 19, invmG_GroupName: 'Software Licenses', invmG_AliasName: 'Soft', invmG_GroupPrefix: 'SW', invmG_GroupSuffix: 'L', invmG_GroupStartingNo: '1900', invmG_ActiveFlg: true },
    { invmG_Id: 20, invmG_GroupName: 'Events', invmG_AliasName: 'Event', invmG_GroupPrefix: 'EV', invmG_GroupSuffix: 'T', invmG_GroupStartingNo: '2000', invmG_ActiveFlg: true }
];

const DUMMY_USER_GROUPS: IInvMasterUserGroup[] = [
    { invmG_Id: 101, invmG_GroupName: 'Computers', invmG_AliasName: 'Comp', invmG_ParentId: 1, invmG_GroupName_mn: 'Electronics', invmG_ActiveFlg: true },
    { invmG_Id: 102, invmG_GroupName: 'Chairs', invmG_AliasName: 'Cha', invmG_ParentId: 2, invmG_GroupName_mn: 'Furniture', invmG_ActiveFlg: true },
    { invmG_Id: 103, invmG_GroupName: 'Pens & Pencils', invmG_AliasName: 'Pen', invmG_ParentId: 3, invmG_GroupName_mn: 'Stationery', invmG_ActiveFlg: true },
    { invmG_Id: 104, invmG_GroupName: 'Footballs', invmG_AliasName: 'FBall', invmG_ParentId: 4, invmG_GroupName_mn: 'Sports Equipment', invmG_ActiveFlg: true },
    { invmG_Id: 105, invmG_GroupName: 'Microscopes', invmG_AliasName: 'Micro', invmG_ParentId: 5, invmG_GroupName_mn: 'Lab Instruments', invmG_ActiveFlg: true },
    { invmG_Id: 106, invmG_GroupName: 'Science Books', invmG_AliasName: 'SciBk', invmG_ParentId: 6, invmG_GroupName_mn: 'Library Books', invmG_ActiveFlg: true },
    { invmG_Id: 107, invmG_GroupName: 'Cleaning Agents', invmG_AliasName: 'Clean', invmG_ParentId: 7, invmG_GroupName_mn: 'Housekeeping', invmG_ActiveFlg: true },
    { invmG_Id: 108, invmG_GroupName: 'Boys Uniform', invmG_AliasName: 'BoyUni', invmG_ParentId: 8, invmG_GroupName_mn: 'Uniforms', invmG_ActiveFlg: true },
    { invmG_Id: 109, invmG_GroupName: 'School Buses', invmG_AliasName: 'Bus', invmG_ParentId: 9, invmG_GroupName_mn: 'Vehicles', invmG_ActiveFlg: true },
    { invmG_Id: 110, invmG_GroupName: 'Monitors', invmG_AliasName: 'Mon', invmG_ParentId: 1, invmG_GroupName_mn: 'Electronics', invmG_ActiveFlg: true },
    { invmG_Id: 111, invmG_GroupName: 'First Aid', invmG_AliasName: 'First', invmG_ParentId: 11, invmG_GroupName_mn: 'Medical Supplies', invmG_ActiveFlg: true },
    { invmG_Id: 112, invmG_GroupName: 'Snacks', invmG_AliasName: 'Snack', invmG_ParentId: 12, invmG_GroupName_mn: 'Cafeteria', invmG_ActiveFlg: true },
    { invmG_Id: 113, invmG_GroupName: 'Plants', invmG_AliasName: 'Plant', invmG_ParentId: 13, invmG_GroupName_mn: 'Gardening', invmG_ActiveFlg: true },
    { invmG_Id: 114, invmG_GroupName: 'Guitars', invmG_AliasName: 'Guit', invmG_ParentId: 14, invmG_GroupName_mn: 'Music Instruments', invmG_ActiveFlg: true },
    { invmG_Id: 115, invmG_GroupName: 'Paints', invmG_AliasName: 'Paint', invmG_ParentId: 15, invmG_GroupName_mn: 'Art Supplies', invmG_ActiveFlg: true },
    { invmG_Id: 116, invmG_GroupName: 'Cement', invmG_AliasName: 'Cem', invmG_ParentId: 16, invmG_GroupName_mn: 'Building Material', invmG_ActiveFlg: true },
    { invmG_Id: 117, invmG_GroupName: 'Wires', invmG_AliasName: 'Wire', invmG_ParentId: 17, invmG_GroupName_mn: 'Electricals', invmG_ActiveFlg: true },
    { invmG_Id: 118, invmG_GroupName: 'Pipes', invmG_AliasName: 'Pipe', invmG_ParentId: 18, invmG_GroupName_mn: 'Plumbing', invmG_ActiveFlg: true },
    { invmG_Id: 119, invmG_GroupName: 'Antivirus', invmG_AliasName: 'AV', invmG_ParentId: 19, invmG_GroupName_mn: 'Software Licenses', invmG_ActiveFlg: true },
    { invmG_Id: 120, invmG_GroupName: 'Annual Day', invmG_AliasName: 'AnnlDay', invmG_ParentId: 20, invmG_GroupName_mn: 'Events', invmG_ActiveFlg: true }
];

const DUMMY_ITEM_GROUPS: IInvMasterItemGroup[] = [
    { invmG_Id: 201, invmG_GroupName: 'Dell Laptops', invmG_AliasName: 'Dell', invmG_ParentId: 101, invmG_ActiveFlg: true },
    { invmG_Id: 202, invmG_GroupName: 'Plastic Chairs', invmG_AliasName: 'PCh', invmG_ParentId: 102, invmG_ActiveFlg: true },
    { invmG_Id: 203, invmG_GroupName: 'Ballpoint Pens', invmG_AliasName: 'BPen', invmG_ParentId: 103, invmG_ActiveFlg: true },
    { invmG_Id: 204, invmG_GroupName: 'Training Balls', invmG_AliasName: 'TrainB', invmG_ParentId: 104, invmG_ActiveFlg: true },
    { invmG_Id: 205, invmG_GroupName: 'Digital Microscope', invmG_AliasName: 'DigMicro', invmG_ParentId: 105, invmG_ActiveFlg: true },
    { invmG_Id: 206, invmG_GroupName: 'Physics Textbooks', invmG_AliasName: 'PhyTxt', invmG_ParentId: 106, invmG_ActiveFlg: true },
    { invmG_Id: 207, invmG_GroupName: 'Floor Cleaner', invmG_AliasName: 'FlrCln', invmG_ParentId: 107, invmG_ActiveFlg: true },
    { invmG_Id: 208, invmG_GroupName: 'Grade 1 Shirt', invmG_AliasName: 'G1Shirt', invmG_ParentId: 108, invmG_ActiveFlg: true },
    { invmG_Id: 209, invmG_GroupName: 'Mini Bus', invmG_AliasName: 'MiniB', invmG_ParentId: 109, invmG_ActiveFlg: true },
    { invmG_Id: 210, invmG_GroupName: 'HP Monitors', invmG_AliasName: 'HPMon', invmG_ParentId: 110, invmG_ActiveFlg: true },
    { invmG_Id: 211, invmG_GroupName: 'Bandages', invmG_AliasName: 'Band', invmG_ParentId: 111, invmG_ActiveFlg: true },
    { invmG_Id: 212, invmG_GroupName: 'Chips', invmG_AliasName: 'Chip', invmG_ParentId: 112, invmG_ActiveFlg: true },
    { invmG_Id: 213, invmG_GroupName: 'Rose Plants', invmG_AliasName: 'Rose', invmG_ParentId: 113, invmG_ActiveFlg: true },
    { invmG_Id: 214, invmG_GroupName: 'Acoustic Guitar', invmG_AliasName: 'AcGuit', invmG_ParentId: 114, invmG_ActiveFlg: true },
    { invmG_Id: 215, invmG_GroupName: 'Water Colors', invmG_AliasName: 'WatCol', invmG_ParentId: 115, invmG_ActiveFlg: true },
    { invmG_Id: 216, invmG_GroupName: 'Bricks', invmG_AliasName: 'Brick', invmG_ParentId: 116, invmG_ActiveFlg: true },
    { invmG_Id: 217, invmG_GroupName: 'Copper Wire', invmG_AliasName: 'CopWire', invmG_ParentId: 117, invmG_ActiveFlg: true },
    { invmG_Id: 218, invmG_GroupName: 'PVC Pipes', invmG_AliasName: 'PVC', invmG_ParentId: 118, invmG_ActiveFlg: true },
    { invmG_Id: 219, invmG_GroupName: 'Office 365', invmG_AliasName: 'O365', invmG_ParentId: 119, invmG_ActiveFlg: true },
    { invmG_Id: 220, invmG_GroupName: 'Trophies', invmG_AliasName: 'Trophy', invmG_ParentId: 120, invmG_ActiveFlg: true }
];

export async function fetchInvMasterGroupData(searchParams?: ApiSearchparams): Promise<{ success: boolean; message?: string; data?: IInvMasterGroupLoadResponse }> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterGroup/getloaddata?${urlParams}`;

    try {
        const response = await api.get<any>('inventory', url);

        if (response.success) {
            return response;
        }

        // Dummy Data Fallback
        return {
            success: true,
            message: 'Data fetched successfully (Dummy)',
            data: {
                get_maingroup: DUMMY_MAIN_GROUPS,
                get_maingroupdd: DUMMY_MAIN_GROUPS,
                get_usergroup: DUMMY_USER_GROUPS,
                get_itemgroup: DUMMY_ITEM_GROUPS,
                get_usergp: DUMMY_USER_GROUPS,
                maingroupTotal: DUMMY_MAIN_GROUPS.length,
                usergroupTotal: DUMMY_USER_GROUPS.length,
                itemgroupTotal: DUMMY_ITEM_GROUPS.length,
            }
        };
    } catch (error) {
        console.error('Error fetching Master Group data:', error);
        return {
            success: true,
            message: 'Data fetched successfully (Dummy Fallback)',
            data: {
                get_maingroup: DUMMY_MAIN_GROUPS,
                get_maingroupdd: DUMMY_MAIN_GROUPS,
                get_usergroup: DUMMY_USER_GROUPS,
                get_itemgroup: DUMMY_ITEM_GROUPS,
                get_usergp: DUMMY_USER_GROUPS,
                maingroupTotal: DUMMY_MAIN_GROUPS.length,
                usergroupTotal: DUMMY_USER_GROUPS.length,
                itemgroupTotal: DUMMY_ITEM_GROUPS.length,
            }
        };
    }
}

export async function saveInvMasterMainGroup(data: any) {
    const url = `/INV_MasterGroup/savedetails`;
    const payload = {
        ...data,
        INVMG_MGUGIGFlg: "MG"
    };
    // return await api.post<any>('inventory', url, payload);
    return { returnval: true, invmG_Id: data.invmG_Id || 100, returnduplicatestatus: '' };
}

export async function saveInvMasterUserGroup(data: any) {
    const url = `/INV_MasterGroup/savedetailsUG`;
    // return await api.post<any>('inventory', url, data);
    return { returnval: true, invmG_Id: data.invmG_Id || 101, returnduplicatestatus: '' };
}

export async function saveInvMasterItemGroup(data: any) {
    const url = `/INV_MasterGroup/savedetailsIG`;
    // return await api.post<any>('inventory', url, data);
    return { returnval: true, invmG_Id: data.invmG_Id || 102, returnduplicatestatus: '' };
}

export async function deactivateInvMasterGroup(data: any) {
    const url = `/INV_MasterGroup/deactive`;
    // return await api.post<any>('inventory', url, data);
    return { returnval: true };
}
