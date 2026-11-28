'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Spinner as LoadingSpinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import {
    type MasterSchoolTypeSchema,
    masterSchoolTypeSchema
} from '@/schemas/super-admin/super-admin-module/general-setting/master-school-type';
import { saveMasterSchoolType } from '@/server/super-admin/super-admin-module/general-setting/master-school-type';
import type { IMasterSchoolType } from '@/types/super-admin/super-admin-module/general-setting/master-school-type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterSchoolTypeFormProps {
    onSuccess?: () => void;
}

export default function AddMasterSchoolTypeForm({ onSuccess }: AddMasterSchoolTypeFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { closeAddForm } = useFormContext<IMasterSchoolType>();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterSchoolTypeSchema>({
        resolver: zodResolver(masterSchoolTypeSchema),
        defaultValues: {
            ivrmmtyP_Id: 0,
            ivrmmtyP_Type: '',
            ivrmmtyP_Description: ''
        }
    });

    const onSubmit = async (data: MasterSchoolTypeSchema) => {
        setIsLoading(true);
        try {
            const result = await saveMasterSchoolType(data);
            if (result.success) {
                toast.success('Saved Successfully');
                reset();
                onSuccess?.();
            } else {
                toast.error(result.message || 'Failed to save data');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='p-4'>
                <div className='mx-auto max-w-2xl space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            School Type <span className='text-red-500'>*</span>
                        </Label>
                        <Input {...register('ivrmmtyP_Type')} placeholder='Enter School Type' />
                        <FormError>{errors.ivrmmtyP_Type?.message}</FormError>
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            School Description <span className='text-red-500'>*</span>
                        </Label>
                        <Textarea {...register('ivrmmtyP_Description')} placeholder='Enter School Description' rows={3} />
                        <FormError>{errors.ivrmmtyP_Description?.message}</FormError>
                    </div>
                </div>

                <div className='mt-8 flex justify-center gap-4 border-t pt-4'>
                    <Button type='button' variant='destructive' onClick={closeAddForm} className='w-32 bg-red-500 hover:bg-red-600'>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>

                    <Button type='submit' disabled={isLoading} className='w-32 bg-blue-600 hover:bg-blue-700'>
                        {isLoading ? <LoadingSpinner /> : <Save className='mr-2 h-4 w-4' />}
                        Save
                    </Button>
                </div>
            </div>
        </form>
    );
}
