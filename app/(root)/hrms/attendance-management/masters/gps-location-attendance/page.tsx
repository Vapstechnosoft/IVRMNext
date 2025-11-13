'use client';

import { Heading } from '@/components/layout/heading';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { toast } from 'sonner';
import { GPSAttendanceForm, type GPSForm } from './_components/gps-attendance-form';

export default function GPSLocationAttendancePage() {
    const store = createLocalCrud('attendance:gps-location-attendance');

    const handleFormSubmit = (data: GPSForm) => {
        try {
            store.create({ ...data });
            toast.success('GPS Attendance saved successfully');
        } catch (e: any) {
            toast.error(e.message || 'Operation failed');
        }
    };

    const handleFormCancel = () => {
        // Form stays open, just reset if needed
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='GPS Location Attendance' description='Capture attendance with GPS location details' />
                    </div>
                </div>

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
        </div>
    );
}
