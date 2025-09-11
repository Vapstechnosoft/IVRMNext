'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { Switch } from '@/components/ui/switch';
import { useMasterClass } from '@/hooks/admission/useMasters';
import { masterClassSchema } from '@/schemas/admission/masters';
import { toggleMasterClass } from '@/server/admission/masters/class';
import type { IMasterClassList } from '@/types/admission/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassSchema.delete>;

export default function ToggleMasterClassForm({ cell }: { cell: any }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isActive, setIsActive] = useState(cell.getValue().active_flag);
    const [selectedRow, setSelectedRow] = useState<IMasterClassList | null | any>(null);
    const { refetchAll } = useMasterClass();

    const handleToggle = () => {
        setSelectedRow(cell.getValue());
        setIsDialogOpen(true);
    };

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
        resolver: zodResolver(masterClassSchema.delete),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { id } = data;
            const newStatus = !isActive;

            const response = await toggleMasterClass(String(id));

            if (response.success) {
                toast.success(response.message);
                setIsActive(newStatus);
                refetchAll();
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
            <div className='dropdown-item flex gap-1 px-1 py-2 '>
                <Switch checked={isActive} onCheckedChange={handleToggle} className='scale-[0.75] ' />
                {isActive ? 'Inactivate' : 'Activate'}
            </div>

            {selectedRow && (
                <AdaptiveDialog title='Active/Inactive Master Class' isOpen={isDialogOpen} onClose={closeDialog}>
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                        <AdaptiveBody className='flex flex-col gap-5'>
                            <input type='text' hidden={true} {...register('id')} defaultValue={selectedRow.id} />
                            <p>
                                Are you sure you want to {isActive ? 'inactivate' : 'activate'} {selectedRow.name}?
                            </p>

                            <FormError>{errors.id?.message}</FormError>
                            <FormError>{errors.root?.message}</FormError>
                        </AdaptiveBody>
                        <AdaptiveFooter>
                            <Button variant='secondary' onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button type='submit' isLoading={isSubmitting}>
                                {isActive ? 'Inactivate' : 'Activate'}
                            </Button>
                        </AdaptiveFooter>
                    </form>
                </AdaptiveDialog>
            )}
        </>
    );
}
