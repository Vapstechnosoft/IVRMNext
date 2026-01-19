import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useInvMasterTax } from '@/hooks/inventory/masters/use-inv-master-tax';
import { invMasterTaxSchema, type InvMasterTaxSchema } from '@/schemas/inventory/masters/inv-master-tax';
import { saveInvMasterTax } from '@/server/inventory/masters/inv-master-tax';
import { toast } from 'sonner';
import type { IInvMasterTax } from '@/types/inventory/masters/inv-master-tax';
import { useEffect } from 'react';

interface UpdateInvMasterTaxFormProps {
    selectedRow: IInvMasterTax;
    onSuccess: () => void;
}

export default function UpdateInvMasterTaxForm({ selectedRow, onSuccess }: UpdateInvMasterTaxFormProps) {
    const { refetchAll } = useInvMasterTax();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors }
    } = useForm<InvMasterTaxSchema>({
        resolver: zodResolver(invMasterTaxSchema),
        defaultValues: {
            invmT_Id: selectedRow.invmT_Id,
            invmT_TaxName: selectedRow.invmT_TaxName,
            invmT_TaxAliasName: selectedRow.invmT_TaxAliasName,
            invmT_ActiveFlg: selectedRow.invmT_ActiveFlg
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                invmT_Id: selectedRow.invmT_Id,
                invmT_TaxName: selectedRow.invmT_TaxName,
                invmT_TaxAliasName: selectedRow.invmT_TaxAliasName,
                invmT_ActiveFlg: selectedRow.invmT_ActiveFlg
            });
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: InvMasterTaxSchema) => {
        try {
            const result = await saveInvMasterTax({ ...data, invmT_Id: selectedRow.invmT_Id } as any);
            if (result.returnval) {
                toast.success('Record updated successfully');
                refetchAll();
                onSuccess();
            } else if (result.returnduplicatestatus === 'Duplicate') {
                toast.error('Record already exists');
            } else {
                toast.error('Failed to update record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 p-4'>
            <div className='space-y-2'>
                <Label htmlFor='invmT_TaxName'>
                    Tax Name <span className='text-red-500'>*</span>
                </Label>
                <Controller
                    name='invmT_TaxName'
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id='invmT_TaxName'
                            placeholder='Enter Tax Name'
                            className={errors.invmT_TaxName ? 'border-red-500' : ''}
                        />
                    )}
                />
                {errors.invmT_TaxName && (
                    <p className='text-red-500 text-xs'>{errors.invmT_TaxName.message}</p>
                )}
            </div>

            <div className='space-y-2'>
                <Label htmlFor='invmT_TaxAliasName'>Alias Name</Label>
                <Controller
                    name='invmT_TaxAliasName'
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id='invmT_TaxAliasName'
                            placeholder='Enter Alias Name'
                        />
                    )}
                />
            </div>

            <div className='flex justify-end gap-2'>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
            </div>
        </form>
    );
}
