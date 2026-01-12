'use client';

import type { IMasterHostelForm } from '@/schemas/hostel/master-hostel.schema';
import type { ICountry, IEmployee, IFacility, IMess, IState } from '@/server/hostel/master-hostel/server-action';
import AddMasterHostelForm from './add-form';

interface UpdateMasterHostelFormProps {
    rowData: any; // Using any to be flexible with IHostel vs IHostelDisplay
    onSuccess: () => void;
    countries: ICountry[];
    states: IState[];
    facilities: IFacility[];
    messes: IMess[];
    employees: IEmployee[];
}

export default function UpdateMasterHostelForm({
    rowData,
    onSuccess,
    countries,
    states,
    facilities,
    messes,
    employees
}: UpdateMasterHostelFormProps) {
    // Transform rowData if needed to match form schema
    // Since we use the same field names in server-action and schema, it should map 1:1 generally.
    // Except for optional chaining or null values
    const initialData: Partial<IMasterHostelForm> = {
        ...rowData,
        ivrmmC_Id: rowData.ivrmmC_Id?.toString(),
        ivrmmS_Id: rowData.ivrmmS_Id?.toString(),
        hlmH_TotalCapacity: rowData.hlmH_TotalCapacity?.toString(),
        hlmH_Pincode: rowData.hlmH_Pincode?.toString(),
        hlmH_TotalFloor: rowData.hlmH_TotalFloor?.toString(),
        hlmH_TotalRoom: rowData.hlmH_TotalRoom?.toString(),
        documents: rowData.documents || []
    };

    return (
        <AddMasterHostelForm
            onSuccess={onSuccess}
            countries={countries}
            states={states}
            facilities={facilities}
            messes={messes}
            employees={employees}
            initialData={initialData}
        />
    );
}
