'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { masterSportsCCGroupSchema } from '@/schemas/sports/masters/sports-cc-group';
import { saveMasterSportsCCGroup } from '@/server/sports/masters/sports-cc-group';
import type { IMasterSportsCCGroup } from '@/types/sports/masters/sports-cc-group';
import { toast } from 'sonner';
import { useFormContext as useRHFContext } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label, FormError } from '@/components/ui/extension/field';

interface AddMasterSportsCCGroupFormProps {
    selectedRow?: IMasterSportsCCGroup;
    onSuccess?: () => void;
}

export default function AddMasterSportsCCGroupForm({
    selectedRow,
    onSuccess
}: AddMasterSportsCCGroupFormProps) {
    return (
        <GenericForm<IMasterSportsCCGroup, any>
            schema={masterSportsCCGroupSchema}
            initialValues={{
                spccmsccG_Id: selectedRow?.spccmsccG_Id ?? 0,
                spccmsccG_SportsCCGroupName: selectedRow?.spccmsccG_SportsCCGroupName ?? '',
                spccmsccG_SportsCCGroupDesc: selectedRow?.spccmsccG_SportsCCGroupDesc ?? '',
                spccmsccG_SCCFlag: selectedRow?.spccmsccG_SCCFlag ?? '',
                spccmsccG_ActiveFlag: selectedRow?.spccmsccG_ActiveFlag ?? true
            } as any}
            onSubmit={async (values) => {
                try {
                    const response = await saveMasterSportsCCGroup(values);
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
                    if (error.message !== 'duplicate' && !error.message?.includes('Failed to save record')) {
                        toast.error(error.message || 'Check internet connection');
                    }
                    throw error;
                }
            }}
            mode={selectedRow ? 'edit' : 'create'}
            successMessage={''}
            errorMessage={''}
            onSuccess={onSuccess}
            className='space-y-4'
        >
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <GenericInputField
                    name='spccmsccG_SportsCCGroupName'
                    label='Group Name'
                    placeholder='Enter Sports Group Name...'
                    required
                />

                <GenericTextAreaField
                    name='spccmsccG_SportsCCGroupDesc'
                    label='Description'
                    placeholder='Enter Description...'
                    required
                />
            </div>

            <CustomRadioField />
        </GenericForm>
    );
}

function CustomRadioField() {
    const { watch, setValue, formState: { errors } } = useRHFContext();
    const sccFlag = watch('spccmsccG_SCCFlag');

    return (
        <div className='flex flex-col gap-2 justify-center items-center p-4 border rounded-md bg-muted/20'>
            <Label>
                SCC Flag <span className='text-destructive'>*</span>
            </Label>
            <RadioGroup
                value={sccFlag}
                onValueChange={(val) => setValue('spccmsccG_SCCFlag', val, { shouldValidate: true })}
                className='flex gap-4'
            >
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='Sports' id='r1' />
                    <label htmlFor='r1' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Sports
                    </label>
                </div>
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='Co-Curricular' id='r2' />
                    <label htmlFor='r2' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Co-Curricular
                    </label>
                </div>
            </RadioGroup>
            {errors.spccmsccG_SCCFlag && <FormError>{(errors.spccmsccG_SCCFlag as any).message}</FormError>}
        </div>
    );
}
