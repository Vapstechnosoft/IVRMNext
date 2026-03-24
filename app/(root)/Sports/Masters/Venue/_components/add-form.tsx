'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { useMasterVenues } from '@/hooks/sports/useMasterVenues';
import { masterVenueSchema } from '@/schemas/sports/masters/venue';
import { saveMasterVenue } from '@/server/sports/masters/venue';
import type { IMasterEventVenue } from '@/types/sports/masters/venue';
import { toast } from 'sonner';

interface AddMasterVenueFormProps {
    onSuccess?: () => void;
}

export default function AddMasterVenueForm({ onSuccess }: AddMasterVenueFormProps) {
    const { refetchAll } = useMasterVenues();

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
                try {
                    const response = await saveMasterVenue(values);

                    // Robust success check for IVRM backend responses
                    const msg = (response?.message || response?.Message || '') as string;
                    const isSuccess = response?.success || 
                                     response?.returnval == true || 
                                     response?.returnVal == true ||
                                     response?.returnVal === 'saved' || 
                                     response?.returnVal === 'updated' || 
                                     msg.toLowerCase() === 'saved' ||
                                     msg.toLowerCase() === 'updated' ||
                                     msg.toLowerCase().includes('success');

                    if (isSuccess) {
                        toast.success('Record saved successfully');
                    } else if (response?.returnVal === 'duplicate' || msg.toLowerCase() === 'duplicate') {
                        toast.error('Record already exists');
                        throw new Error('duplicate');
                    } else {
                        const errorMsg = (response?.message || response?.Message || 'Failed to save record') as string;
                        toast.error(errorMsg);
                        throw new Error(errorMsg);
                    }
                } catch (error: any) {
                    if (error.message !== 'duplicate' && !error.message?.includes('Failed to save venue')) {
                        toast.error(error.message || 'Something went wrong');
                    }
                    throw error;
                }
            }}
            mode='create'
            formMode='onChange'
            successMessage={''}
            errorMessage={''}
            onSuccess={() => {
                refetchAll();
                onSuccess?.();
            }}
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
