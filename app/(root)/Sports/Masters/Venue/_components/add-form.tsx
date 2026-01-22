'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { masterVenueSchema } from '@/schemas/sports/masters/venue';
import { saveMasterVenue } from '@/server/sports/masters/venue';
import type { IMasterEventVenue } from '@/types/sports/masters/venue';

interface AddMasterVenueFormProps {
    onSuccess?: () => void;
}

export default function AddMasterVenueForm({ onSuccess }: AddMasterVenueFormProps) {
    return (
        <GenericForm<IMasterEventVenue, (typeof masterVenueSchema)['addOrUpdate']>
            schema={masterVenueSchema.addOrUpdate}
            initialValues={{
                spccmeV_Id: 0,
                mI_Id: 2, // Assuming Institute ID
                spccmeV_EventVenue: '',
                spccmeV_EventVenueDesc: '',
                spccmeV_ActiveFlag: true
            }}
            onSubmit={async (values) => {
                await saveMasterVenue(values);
            }}
            mode='create'
            successMessage='Master Venue saved successfully'
            errorMessage='Failed to save Master Venue'
            onSuccess={onSuccess}
            className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <GenericInputField name='spccmeV_EventVenue' label='Event Venue' placeholder='Enter Event Venue' required />
                <GenericTextAreaField
                    name='spccmeV_EventVenueDesc'
                    label='Event Venue Description'
                    placeholder='Enter Event Venue Description'
                    required
                />
            </div>
        </GenericForm>
    );
}
