'use server';

import { SportsCCNameDTO, SportsCCNameMasterDataDTO } from "@/types/sports/masters/sports-cc-name";

// Mock Data
let MOCK_GROUPS = [
    { spccmsccG_Id: 1, spccmsccG_SportsCCGroupName: 'Athletics' },
    { spccmsccG_Id: 2, spccmsccG_SportsCCGroupName: 'Team Sports' },
    { spccmsccG_Id: 3, spccmsccG_SportsCCGroupName: 'Indoor Games' },
    { spccmsccG_Id: 4, spccmsccG_SportsCCGroupName: 'Swimming' },
];

let MOCK_DATA: SportsCCNameDTO[] = [
    {
        SPCCMSCC_Id: 1,
        SPCCMSCCG_Id: 1,
        groupName: 'Athletics',
        SPCCMSCC_SportsCCName: '100m Dash',
        SPCCMSCC_SportsCCDesc: '100 meter sprint',
        SPCCMSCC_SGFlag: 'Single',
        SPCCMSCC_NoOfMembers: 1,
        SPCCMSCC_RecHighLowFlag: 'High',
        SPCCMSCC_RecInfo: 'Time in seconds',
        SPCCMSCC_MultiAttemptFlg: false,
        spccmscC_ActiveFlag: true
    },
    {
        SPCCMSCC_Id: 2,
        SPCCMSCCG_Id: 2,
        groupName: 'Team Sports',
        SPCCMSCC_SportsCCName: 'Football',
        SPCCMSCC_SportsCCDesc: 'Standard Football',
        SPCCMSCC_SGFlag: 'Group',
        SPCCMSCC_NoOfMembers: 11,
        SPCCMSCC_RecHighLowFlag: 'Low',
        SPCCMSCC_RecInfo: 'Goals Scored',
        SPCCMSCC_MultiAttemptFlg: false,
        spccmscC_ActiveFlag: true
    },
    {
        SPCCMSCC_Id: 3,
        SPCCMSCCG_Id: 3,
        groupName: 'Indoor Games',
        SPCCMSCC_SportsCCName: 'Chess',
        SPCCMSCC_SportsCCDesc: 'Standard Chess',
        SPCCMSCC_SGFlag: 'Single',
        SPCCMSCC_NoOfMembers: 1,
        SPCCMSCC_RecHighLowFlag: 'High',
        SPCCMSCC_RecInfo: 'Points',
        SPCCMSCC_MultiAttemptFlg: false,
        spccmscC_ActiveFlag: false
    },
    {
        SPCCMSCC_Id: 4,
        SPCCMSCCG_Id: 1,
        groupName: 'Athletics',
        SPCCMSCC_SportsCCName: 'Long Jump',
        SPCCMSCC_SportsCCDesc: 'Long Jump Event',
        SPCCMSCC_SGFlag: 'Single',
        SPCCMSCC_NoOfMembers: 1,
        SPCCMSCC_RecHighLowFlag: 'High',
        SPCCMSCC_RecInfo: 'Distance in meters',
        SPCCMSCC_MultiAttemptFlg: true,
        SPCCMSCC_NoOfAttempts: 3,
        spccmscC_ActiveFlag: true,
        tempDatas: [{ SPCCMSCCG_UnderEvent: 'Qualifiers' }, { SPCCMSCCG_UnderEvent: 'Finals' }]
    }
];

export async function getSportsCCNameData(): Promise<SportsCCNameDTO[]> {
    return MOCK_DATA;
}

export async function getSportsCCNameMasterData(): Promise<SportsCCNameMasterDataDTO> {
    return {
        gropList: MOCK_GROUPS
    };
}

export async function saveSportsCCName(data: SportsCCNameDTO): Promise<{ success: boolean; message: string }> {
    console.log('Saving Data:', data);

    if (data.SPCCMSCC_Id && data.SPCCMSCC_Id > 0) {
        // Update
        const index = MOCK_DATA.findIndex(d => d.SPCCMSCC_Id === data.SPCCMSCC_Id);
        if (index !== -1) {
            const group = MOCK_GROUPS.find(g => g.spccmsccG_Id === data.SPCCMSCCG_Id);
            MOCK_DATA[index] = { ...data, groupName: group?.spccmsccG_SportsCCGroupName, spccmscC_ActiveFlag: MOCK_DATA[index].spccmscC_ActiveFlag };
            return { success: true, message: 'Record Updated Successfully' };
        }
        return { success: false, message: 'Record not found' };
    } else {
        // Create
        const group = MOCK_GROUPS.find(g => g.spccmsccG_Id === data.SPCCMSCCG_Id);
        const newRecord = {
            ...data,
            SPCCMSCC_Id: Math.floor(Math.random() * 10000),
            groupName: group?.spccmsccG_SportsCCGroupName,
            spccmscC_ActiveFlag: true
        };
        MOCK_DATA.push(newRecord);
        return { success: true, message: 'Record Saved Successfully' };
    }
}

export async function deleteSportsCCName(id: number, activeFlag: boolean): Promise<{ success: boolean; message: string }> {
    const index = MOCK_DATA.findIndex(item => item.SPCCMSCC_Id === id);
    if (index !== -1) {
        MOCK_DATA[index].spccmscC_ActiveFlag = !activeFlag;
        return { success: true, message: activeFlag ? 'Record Deactivated Successfully!' : 'Record Activated Successfully!' };
    }
    return { success: false, message: 'Record not found' };
}
