'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterClass } from '@/hooks/admission/useMasters';
import { masterClassSchema } from '@/schemas/admission/masters';
import { addOrUpdateMasterClass } from '@/server/admission/masters/class';
import type { IMasterClassList } from '@/types/admission/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassSchema.addOrUpdate>;

export default function UpdateMasterClassForm({ cell }: { cell: any }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IMasterClassList | null | any>(null);
    const { refetchAll } = useMasterClass();

    const handleEdit = (row: IMasterClassList) => {
        setSelectedRow(row);
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
        resolver: zodResolver(masterClassSchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { code, name } = data;
            const payload = {
                id: selectedRow.id,
                code: code,
                name: name
            };

            const response = await addOrUpdateMasterClass(payload);

            if (response.success) {
                toast.success(response.message);
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
            <div className='dropdown-item flex gap-2' onClick={() => handleEdit(cell.getValue())}>
                <Pencil className='text-muted-foreground' /> Edit
            </div>

            {selectedRow && (
                <AdaptiveDialog title='Update Master Class' isOpen={isDialogOpen} onClose={closeDialog} size='xl'>
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                        <AdaptiveBody className='flex flex-col gap-5'>
                            <InputText
                                label='Class Code'
                                defaultValue={selectedRow?.code}
                                required
                                id='code'
                                {...register('code')}
                                error={errors.code?.message}
                            />
                            <InputText
                                label='Class Name'
                                defaultValue={selectedRow?.name}
                                required
                                id='name'
                                {...register('name')}
                                error={errors.name?.message}
                            />

                            <FormError>{errors.root?.message}</FormError>
                        </AdaptiveBody>
                        <AdaptiveFooter>
                            <Button variant='secondary' onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button type='submit' isLoading={isSubmitting}>
                                Update
                            </Button>
                        </AdaptiveFooter>
                    </form>
                </AdaptiveDialog>
            )}
        </>
    );
}
