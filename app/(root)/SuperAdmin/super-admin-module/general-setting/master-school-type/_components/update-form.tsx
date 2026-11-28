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
import {
    getMasterSchoolTypeDetails,
    saveMasterSchoolType
} from '@/server/super-admin/super-admin-module/general-setting/master-school-type';
import type { IMasterSchoolType } from '@/types/super-admin/super-admin-module/general-setting/master-school-type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateMasterSchoolTypeFormProps {
    selectedRow: IMasterSchoolType;
    onSuccess?: () => void;
}

export default function UpdateMasterSchoolTypeForm({ selectedRow, onSuccess }: UpdateMasterSchoolTypeFormProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { closeEditForm } = useFormContext<IMasterSchoolType>();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterSchoolTypeSchema>({
        resolver: zodResolver(masterSchoolTypeSchema),
        defaultValues: {
            ivrmmtyP_Id: selectedRow.ivrmmtyP_Id,
            ivrmmtyP_Type: selectedRow.ivrmmtyP_Type,
            ivrmmtyP_Description: selectedRow.ivrmmtyP_Description
        }
    });

    useEffect(() => {
        let isCurrent = true;

        const fetchDetails = async () => {
            try {
                const result = await getMasterSchoolTypeDetails(selectedRow.ivrmmtyP_Id);
                if (!isCurrent) return;

                if (result.success && result.data) {
                    reset({
                        ivrmmtyP_Id: result.data.ivrmmtyP_Id,
                        ivrmmtyP_Type: result.data.ivrmmtyP_Type,
                        ivrmmtyP_Description: result.data.ivrmmtyP_Description
                    });
                } else {
                    toast.error(result.message || 'Failed to load school type details');
                }
            } catch {
                if (isCurrent) {
                    toast.error('Failed to load school type details');
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        fetchDetails();
        return () => {
            isCurrent = false;
        };
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterSchoolTypeSchema) => {
        setIsLoading(true);
        try {
            const result = await saveMasterSchoolType({
                ...data,
                ivrmmtyP_Id: selectedRow.ivrmmtyP_Id
            });
            if (result.success) {
                toast.success('Updated Successfully');
                onSuccess?.();
            } else {
                toast.error(result.message || 'Failed to update data');
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
                    <Button type='button' variant='destructive' onClick={closeEditForm} className='w-32 bg-red-500 hover:bg-red-600'>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>

                    <Button type='submit' disabled={isLoading} className='w-32 bg-blue-600 hover:bg-blue-700'>
                        {isLoading ? <LoadingSpinner /> : <Save className='mr-2 h-4 w-4' />}
                        Update
                    </Button>
                </div>
            </div>
        </form>
    );
}
