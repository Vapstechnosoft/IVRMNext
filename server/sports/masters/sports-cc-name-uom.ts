'use server';

import { api } from '@/lib/apiService';
import type { IMasterSportsCCNameUOMResponse, IMasterSportsCCNameUOM } from '@/types/sports/masters/sports-cc-name-uom';

export async function getMasterSportsCCNameUOMs() {
    // Controller: [HttpGet("loadgrid/{id:int}")] public async Task<ActionResult> loadgrid(int id)
    const url = `/MasterSportsCCNameUOM/loadgrid/1`;

    const mockData: IMasterSportsCCNameUOMResponse = {
        sportsCCNameList: [
            { spccmscC_Id: 1, spccmscC_SportsCCName: 'Cricket' },
            { spccmscC_Id: 2, spccmscC_SportsCCName: 'Football' },
            { spccmscC_Id: 3, spccmscC_SportsCCName: 'Basketball' },
            { spccmscC_Id: 4, spccmscC_SportsCCName: 'Athletics' },
            { spccmscC_Id: 5, spccmscC_SportsCCName: 'Swimming' },
            { spccmscC_Id: 6, spccmscC_SportsCCName: 'Hockey' },
            { spccmscC_Id: 7, spccmscC_SportsCCName: 'Tennis' },
        ],
        uomList: [
            { spccmuoM_Id: 1, spccmuoM_UOMName: 'Runs' },
            { spccmuoM_Id: 2, spccmuoM_UOMName: 'Goals' },
            { spccmuoM_Id: 3, spccmuoM_UOMName: 'Points' },
            { spccmuoM_Id: 4, spccmuoM_UOMName: 'Meters' },
            { spccmuoM_Id: 5, spccmuoM_UOMName: 'Seconds' },
            { spccmuoM_Id: 6, spccmuoM_UOMName: 'Games' },
            { spccmuoM_Id: 7, spccmuoM_UOMName: 'Sets' },
        ],
        sportsCCNameUOMList: [
            { SPCCMSCCUOM_Id: 101, SPCCMSCC_Id: 1, SPCCMUOM_Id: 1, sportsCCName: 'Cricket', uomName: 'Runs', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 102, SPCCMSCC_Id: 2, SPCCMUOM_Id: 2, sportsCCName: 'Football', uomName: 'Goals', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 103, SPCCMSCC_Id: 3, SPCCMUOM_Id: 3, sportsCCName: 'Basketball', uomName: 'Points', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 104, SPCCMSCC_Id: 4, SPCCMUOM_Id: 4, sportsCCName: 'Athletics', uomName: 'Meters', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 105, SPCCMSCC_Id: 5, SPCCMUOM_Id: 5, sportsCCName: 'Swimming', uomName: 'Seconds', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 106, SPCCMSCC_Id: 1, SPCCMUOM_Id: 3, sportsCCName: 'Cricket', uomName: 'Points', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 107, SPCCMSCC_Id: 2, SPCCMUOM_Id: 3, sportsCCName: 'Football', uomName: 'Points', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 108, SPCCMSCC_Id: 4, SPCCMUOM_Id: 5, sportsCCName: 'Athletics', uomName: 'Seconds', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 109, SPCCMSCC_Id: 3, SPCCMUOM_Id: 1, sportsCCName: 'Basketball', uomName: 'Runs', SPCCMSCCUOM_ActiveFlag: false },
            { SPCCMSCCUOM_Id: 110, SPCCMSCC_Id: 5, SPCCMUOM_Id: 4, sportsCCName: 'Swimming', uomName: 'Meters', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 111, SPCCMSCC_Id: 1, SPCCMUOM_Id: 2, sportsCCName: 'Cricket', uomName: 'Goals', SPCCMSCCUOM_ActiveFlag: false },
            { SPCCMSCCUOM_Id: 112, SPCCMSCC_Id: 6, SPCCMUOM_Id: 2, sportsCCName: 'Hockey', uomName: 'Goals', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 113, SPCCMSCC_Id: 7, SPCCMUOM_Id: 6, sportsCCName: 'Tennis', uomName: 'Games', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 114, SPCCMSCC_Id: 7, SPCCMUOM_Id: 7, sportsCCName: 'Tennis', uomName: 'Sets', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 115, SPCCMSCC_Id: 6, SPCCMUOM_Id: 3, sportsCCName: 'Hockey', uomName: 'Points', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 116, SPCCMSCC_Id: 4, SPCCMUOM_Id: 3, sportsCCName: 'Athletics', uomName: 'Points', SPCCMSCCUOM_ActiveFlag: true },
            { SPCCMSCCUOM_Id: 117, SPCCMSCC_Id: 3, SPCCMUOM_Id: 4, sportsCCName: 'Basketball', uomName: 'Meters', SPCCMSCCUOM_ActiveFlag: false },
        ],
        count: 17
    };

    try {
        const response = await api.get<IMasterSportsCCNameUOMResponse>('sports', url);
        if (response?.data && response.data.sportsCCNameUOMList && response.data.sportsCCNameUOMList.length > 0) {
            const data = response.data;
            return {
                ...data,
                // Merge lists to ensure static data is also present if needed, 
                // but usually we prefer API data if it exists.
                // For now, we return API data if successful.
                sportsCCNameList: data.sportsCCNameList || mockData.sportsCCNameList,
                uomList: data.uomList || mockData.uomList,
                sportsCCNameUOMList: data.sportsCCNameUOMList
            };
        }
        return mockData;
    } catch (error) {
        console.error('Error fetching SportsCCNameUOM:', error);
        return mockData;
    }
}


export async function saveMasterSportsCCNameUOM(data: any) {
    // Controller: [HttpPost("saveRecord")]
    const url = `/MasterSportsCCNameUOM/saveRecord`;
    // return await api.post<any>('sports', url, data);

    // Mocking success response
    return { returnVal: data.SPCCMSCCUOM_Id > 0 ? 'updated' : 'saved' };
}

export async function editMasterSportsCCNameUOM(id: number) {
    // Controller: [HttpGet("Edit/{id:int}")]
    // The AngularJS code calls apiService.getURI("MasterSportsCCNameUOM/Edit/", $scope.SPCCMSCCUOM_Id)
    // and expects promise.editDetails which is an array.

    // Mocking edit details
    const mockEditDetails = [
        {
            spccmsccuoM_Id: id,
            spccmscC_Id: id % 5 + 1,
            spccmuoM_Id: id % 5 + 1
        }
    ];

    return { editDetails: mockEditDetails };
}

export async function deactivateMasterSportsCCNameUOM(data: any) {
    // Controller: [HttpPost("deactivate")]
    const url = `/MasterSportsCCNameUOM/deactivate`;
    // return await api.post<any>('sports', url, data);

    // Mocking success response
    return { retval: true };
}
