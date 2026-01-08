'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useLibraryMasterAuthor } from '@/hooks/library/useMasters';
import { masterAuthorSchema } from '@/schemas/library/masters';
import { addOrUpdateMasterAuthor } from '@/server/library/masters/master_author';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterAuthorSchema.addOrUpdate>;

interface AddMasterAuthorFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterAuthorForm({ onSuccess, className = '' }: AddMasterAuthorFormProps) {
    const { refetchAll } = useLibraryMasterAuthor();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterAuthorSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            lmA_MobileNo: '',
            lmA_AuthorName: '',
            lmA_Address: '',
            lmA_EMailId: ''
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const { lmA_MobileNo, lmA_AuthorName, lmA_Address, lmA_EMailId } = data;

            const payload = {
                IMCC_ID: 0,
                lmA_MobileNo,
                lmA_AuthorName,
                lmA_Address,
                lmA_EMailId,
                lmA_ActiveFlag: true
            };

            // const js = JSON.stringify(payload);
            //console.log('Payload JSON:', js);

            const response = await addOrUpdateMasterAuthor(payload);

            if (response.success) {
                toast.success(response.message || 'Class Category saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save Class Category');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        }
    };

    const handleReset = () => reset();

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Author Name'
                            required
                            id='lmA_AuthorName'
                            {...register('lmA_AuthorName')}
                            error={errors.lmA_AuthorName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='Email Id'
                            id='lmA_EMailId'
                            {...register('lmA_EMailId')}
                            error={errors.lmA_EMailId?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Mobile No'
                            id='lmA_MobileNo'
                            {...register('lmA_MobileNo')}
                            error={errors.lmA_MobileNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='Author Address'
                            id='lmA_Address'
                            {...register('lmA_Address')}
                            error={errors.lmA_Address?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Phone No'
                            id='lmA_AuthorName'
                            {...register('lmA_AuthorName')}
                            error={errors.lmA_AuthorName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
