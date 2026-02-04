'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterVehicle } from '@/types/transport/transport-module/masters';

export async function getMasterVehicle(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterVehicle/getdata/2?${urlParams}`;

    // Mock Data
    return {
        data: [
            {
                trmV_Id: 1,
                trmvT_Id: 1,
                trmfT_Id: 1,
                trmV_VehicleName: 'Yellow Bus 01',
                trmV_VehicleNo: 'KA-01-AB-1234',
                trmV_PurchaseDate: '2023-01-01',
                trmV_ChassisNo: 'CH123456789',
                trmV_EngineNo: 'EN987654321',
                trmV_PurchasedFrom: 'Tata Motors',
                trmV_Cost: 2500000,
                trmV_Capacity: 40,
                trmV_Desc: 'School Bus',
                trmV_CompanyName: 'Tata',
                trmV_RegistrationDate: '2023-01-15',
                trmV_ManufacturedDate: '2022-12-01',
                trmV_RegFCUpToDate: '2030-01-15',
                trmV_SWDOff: 'Yes',
                trmV_Address: 'Bangalore',
                trmV_OwnersName: 'Principal',
                trmV_Model: 'Starbus',
                trmV_Fuel: 'Diesel',
                trmV_Manufacturer: 'Tata',
                trmV_Class: 'HCV',
                trmV_Color: 'Yellow',
                trmV_Body: 'Bus',
                trmV_NoOfCylinder: 6,
                trmV_WheelBase: '4000mm',
                trmV_UnladenWeight: 5000,
                trmV_CC: '5000cc',
                trmV_TaxUpTo: '2025-01-01',
                trmV_ActiveFlag: true
            }
        ] as IMasterVehicle[],
        success: true,
        message: 'Mock Data Fetched Successfully'
    } as any;
}

export async function saveMasterVehicle(data: any) {
    const url = '/MasterVehicle/savedata';
    return await api.post<any>('transport', url, data);
}

export async function activeDeactiveVehicle(data: any) {
    const url = '/MasterVehicle/activedeactive/';
    return await api.post<any>('transport', url, data);
}

export async function checkVehicleDuplicate(data: any) {
    const url = '/MasterVehicle/validaevehicleno/';
    return await api.post<any>('transport', url, data);
}

export async function uploadVehicleFile(formData: FormData) {
    const url = '/MasterVehicle/uploadUserFile'; // Assumed endpoint, adjusted to typical pattern
    return await api.postMultipart<any>('transport', url, formData);
}
