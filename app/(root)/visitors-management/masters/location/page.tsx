'use client';

import { useMasterLocation } from '@/hooks/visitors-management/masters/useMasterLocation';
import LocationForm from './_components/location-form';
import { columns } from './_components/columns';
import { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';

export default function MasterLocationPage() {
    const { data: loadedData, isLoading, refetch } = useMasterLocation();
    const [isFormOpen, setIsFormOpen] = useState(true);

    const data = loadedData?.getdata || [];

    return (
        <div className="p-4 space-y-6">
            <CollapsibleSection
                title="Master Location"
                isOpen={isFormOpen}
                onToggle={() => setIsFormOpen(!isFormOpen)}
            >
                <LocationForm onSuccess={() => {
                    refetch();
                }} />
            </CollapsibleSection>

            <CollapsibleSection
                title="Master Location List"
                isOpen={true}
                onToggle={() => { }}
            >
                <GenericDataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                //defaultSort={{ id: 'vmmL_Location', desc: false }}
                />
            </CollapsibleSection>
        </div>
    );
}
