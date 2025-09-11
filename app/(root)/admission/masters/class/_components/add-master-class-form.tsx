'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterClass } from '@/hooks/admission/useMasters';
import { masterClassSchema } from '@/schemas/admission/masters';
import { addOrUpdateMasterClass } from '@/server/admission/masters/class';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassSchema.addOrUpdate>;

export default function AddMasterClassForm() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { refetchAll: refetchData } = useMasterClass();

    function openDialog() {
        setIsDialogOpen(true);
    }

    function closeDialog() {
        setIsDialogOpen(false);
        reset();
    }

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassSchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { code, name } = data;
            const payload = {
                id: 0,
                code: code,
                name: name
            };

            const response = await addOrUpdateMasterClass(payload);

            if (response.success) {
                toast.success(response.message);
                refetchData();
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <Button onClick={openDialog} prefix={<PlusCircle className='size-4' />} className='w-fit'>
                Add Master Class
            </Button>

            <AdaptiveDialog title='Add Master Class' isOpen={isDialogOpen} onClose={closeDialog} size='xl'>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                    <AdaptiveBody className='flex flex-col gap-5'>
                        <InputText label='Class Code' required id='code' {...register('code')} error={errors.code?.message} />
                        <InputText label='Class Name' required id='name' {...register('name')} error={errors.name?.message} />

                        <FormError>{errors.root?.message}</FormError>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='secondary' onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button type='submit' isLoading={isSubmitting}>
                            Save
                        </Button>
                    </AdaptiveFooter>
                </form>
            </AdaptiveDialog>
        </>
    );
}
