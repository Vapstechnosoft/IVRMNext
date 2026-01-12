'use client';

import type { IFacility, IFloorDisplay, IHostel } from '@/server/hostel/master-floor/server-action';
import AddMasterFloorForm from './add-form';

interface UpdateMasterFloorFormProps {
    rowData: IFloorDisplay | any;
    onSuccess: () => void;
    hostels: IHostel[];
    facilities: IFacility[];
}

export default function UpdateMasterFloorForm({ rowData, onSuccess, hostels, facilities }: UpdateMasterFloorFormProps) {
    // Transform rowData if necessary to match form schema expectations
    // e.g., numbers to strings for inputs that expect strings during editing
    const initialData = {
        ...rowData,
        hlmH_Id: rowData.hlmH_Id?.toString(),
        hrmF_FloorName: rowData.hrmF_FloorName,
        hrmF_TotalRooms: rowData.hrmF_TotalRooms?.toString(),
        hrmF_FloorDesc: rowData.hrmF_FloorDesc,
        facilities: rowData.facilities || [] // Ensure this is matches the expected array format
    };

    return <AddMasterFloorForm onSuccess={onSuccess} hostels={hostels} facilities={facilities} initialData={initialData} />;
}
