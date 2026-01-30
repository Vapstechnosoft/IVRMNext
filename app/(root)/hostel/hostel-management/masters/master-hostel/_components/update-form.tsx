'use client';

import { IMasterHostelForm } from '@/schemas/hostel/master-hostel.schema';
import { getHostelPhotos, getMappedEmployees, getMappedFacilities, getMappedMesses, ICountry, IEmployee, IFacility, IMess, IState } from '@/server/hostel/hostel-management/masters/hostel';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddMasterHostelForm from './add-form';

interface UpdateMasterHostelFormProps {
    rowData: any;
    onSuccess: () => void;
    countries: ICountry[];
    facilities: IFacility[];
    messes: IMess[];
    employees: IEmployee[];
}

export default function UpdateMasterHostelForm({
    rowData,
    onSuccess,
    countries,
    facilities,
    messes,
    employees
}: UpdateMasterHostelFormProps) {
    const [initialData, setInitialData] = useState<Partial<IMasterHostelForm> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const hostelId = rowData.hlmH_Id;

                // Fetch mapped details in parallel
                const [facilitiesRes, wardensRes, messesRes, photosRes] = await Promise.all([
                    getMappedFacilities(hostelId),
                    getMappedEmployees(hostelId),
                    getMappedMesses(hostelId),
                    getHostelPhotos(hostelId)
                ]);

                // Map Facility IDs (fallback to name match if ID missing in mapped response)
                const mapFacilityId = (mappedItem: any) => {
                    if (mappedItem.hlmftY_Id) return mappedItem.hlmftY_Id;
                    const found = facilities.find(f => f.hlmftY_FacilityName === mappedItem.hlmftY_FacilityName);
                    return found ? found.hlmftY_Id : null;
                };

                // Map Warden IDs
                const mapWardenId = (mappedItem: any) => {
                    return mappedItem.hrmE_Id || null;
                };

                const selectedFacilityIds = (facilitiesRes.data || []).map(mapFacilityId).filter(Boolean);
                const selectedWardenIds = (wardensRes.data || []).map(mapWardenId).filter(Boolean);
                const selectedMessIds = (messesRes.data || []).map((m: any) => m.hlmM_Id).filter(Boolean);

                const hostelPhotos = (photosRes.data || []).map((p: any) => ({
                    hlmhP_FileName: p.hlmhP_FileName,
                    hlmhP_FilePath: p.hlmhP_FilePath,
                    filetype: p.hlmhP_FileName?.split('.').pop()
                }));

                setInitialData({
                    ...rowData,
                    ivrmmC_Id: rowData.ivrmmC_Id?.toString(),
                    ivrmmS_Id: rowData.ivrmmS_Id?.toString(),
                    hlmH_TotalCapacity: rowData.hlmH_TotalCapacity,
                    hlmH_Pincode: rowData.hlmH_Pincode,
                    hlmH_TotalFloor: rowData.hlmH_TotalFloor,
                    hlmH_TotalRoom: rowData.hlmH_TotalRoom,
                    selectedFacilityIds,
                    selectedWardenIds,
                    selectedMessIds,
                    hostelPhotos
                });
            } catch (error) {
                console.error("Failed to fetch hostel details", error);
                toast.error("Failed to load some hostel details. Please verify connections.");
                setInitialData({
                    ...rowData,
                    ivrmmC_Id: rowData.ivrmmC_Id?.toString()
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (rowData?.hlmH_Id) {
            fetchDetails();
        } else {
            setInitialData(rowData);
            setIsLoading(false);
        }
    }, [rowData, facilities]);

    if (isLoading) return <div>Loading details...</div>;

    return (
        <AddMasterHostelForm
            onSuccess={onSuccess}
            countries={countries}
            facilities={facilities}
            messes={messes}
            employees={employees}
            initialData={initialData}
        />
    );
}
