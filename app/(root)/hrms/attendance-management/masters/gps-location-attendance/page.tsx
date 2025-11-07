'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type GPSAttendance, gpsAttendanceColumns } from './_components/columns';
import { type GPSForm, GPSAttendanceForm } from './_components/gps-attendance-form';

export default function GPSLocationAttendancePage() {
    const store = createLocalCrud<GPSAttendance>('attendance:gps-location-attendance');
    const [rows, setRows] = useState<GPSAttendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(true); // form visible by default per screenshot
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRows(store.list());
        setIsLoading(false);
    }, []);

    const handleFormSubmit = (data: GPSForm) => {
        try {
            store.create({ ...data });
            toast.success('GPS Attendance saved');
            setRows(store.list());
        } catch (e: any) {
            toast.error(e.message || 'Operation failed');
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='GPS Location Attendance' description='Capture attendance with GPS location details' />
                    </div>
                </div>

                {isFormOpen && (
                    <div ref={formRef}>
                        <CollapsibleSection
                            title='GPS Location Attendance'
                            description='Employee info and GPS parameters'
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <GPSAttendanceForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
                        </CollapsibleSection>
                    </div>
                )}

                <CollapsibleSection
                    title='GPS Location Attendance Records'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable isLoading={isLoading} columns={gpsAttendanceColumns} data={rows} totalItems={rows.length} showViewOptions />
                </CollapsibleSection>
            </div>
        </div>
    );
}
