'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { useInvItemStoreMapping } from '@/hooks/inventory/masters/use-inv-item-store-mapping';
import { invItemStoreMappingSchema } from '@/schemas/inventory/masters/inv-item-store-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { IInvItemStoreMappingLoadData } from '@/types/inventory/masters/inv-item-store-mapping';

type FormFields = z.infer<typeof invItemStoreMappingSchema>;

interface AddItemStoreMappingFormProps {
    onSuccess?: () => void;
    initialData?: any;
}

export default function AddItemStoreMappingForm({ onSuccess, initialData }: AddItemStoreMappingFormProps) {
    const { data: loadData, saveMutation } = useInvItemStoreMapping();
    const dropdowns = (loadData?.data as IInvItemStoreMappingLoadData) || {
        get_store: [],
        get_maingroup: [],
        get_usergroup: [],
        get_itemgroup: [],
        get_item: []
    };

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(invItemStoreMappingSchema),
        defaultValues: {
            invmsT_Id: 0,
            mappedItems: []
        }
    });

    const watchedMainGroup = watch('invmG_Id');
    const watchedUserGroup = watch('userGroup_Id');
    const watchedItemGroup = watch('itemGroup_Id');

    const [filteredItems, setFilteredItems] = useState(dropdowns.get_item);

    useEffect(() => {
        let items = dropdowns.get_item;
        if (watchedMainGroup) {
            // Logic to filter items by main group would go here if data structure supported it directly
            // For now, it's just a placeholder for the logic
        }
        setFilteredItems(items);
    }, [watchedMainGroup, dropdowns.get_item]);

    const onSubmit = (data: FormFields) => {
        saveMutation.mutate(data, {
            onSuccess: (res) => {
                if (res.success) {
                    onSuccess?.();
                    reset();
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {/* Store selection */}
                <div className='flex flex-col gap-2'>
                    <Label>Store</Label>
                    <Controller
                        control={control}
                        name='invmsT_Id'
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ''}
                                onValueChange={(val) => field.onChange(Number(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Store' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdowns.get_store.map((s) => (
                                        <SelectItem key={s.invmsT_Id} value={String(s.invmsT_Id)}>
                                            {s.invmS_StoreName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.invmsT_Id && <p className='text-red-500 text-xs'>{errors.invmsT_Id.message}</p>}
                </div>

                {/* Filters */}
                <div className='flex flex-col gap-2'>
                    <Label>Main Group</Label>
                    <Controller
                        control={control}
                        name='invmG_Id'
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ''}
                                onValueChange={(val) => field.onChange(Number(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Main Group' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdowns.get_maingroup.map((g) => (
                                        <SelectItem key={g.invmG_Id} value={String(g.invmG_Id)}>
                                            {g.invmG_GroupName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            {/* Items Table */}
            <div className='border rounded-lg overflow-hidden'>
                <table className='w-full text-sm border-collapse'>
                    <thead className='bg-muted/50'>
                        <tr>
                            <th className='p-2 text-left border w-12'>
                                <Checkbox
                                    onCheckedChange={(checked) => {
                                        const allIds = filteredItems.map(i => ({ invmI_Id: i.invmI_Id, checked: !!checked, invmisM_Id: 0 }));
                                        setValue('mappedItems', allIds);
                                    }}
                                />
                            </th>
                            <th className='p-2 text-left border'>Item Name</th>
                            <th className='p-2 text-left border'>Group</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item, index) => (
                            <tr key={item.invmI_Id} className='hover:bg-muted/30'>
                                <td className='p-2 border text-center'>
                                    <Controller
                                        control={control}
                                        name={`mappedItems`}
                                        render={({ field }) => {
                                            const isChecked = field.value.some(v => v.invmI_Id === item.invmI_Id && v.checked);
                                            return (
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => {
                                                        const current = [...field.value];
                                                        const idx = current.findIndex(v => v.invmI_Id === item.invmI_Id);
                                                        if (idx > -1) {
                                                            current[idx].checked = !!checked;
                                                        } else {
                                                            current.push({ invmI_Id: item.invmI_Id, checked: !!checked, invmisM_Id: 0 });
                                                        }
                                                        field.onChange(current);
                                                    }}
                                                />
                                            );
                                        }}
                                    />
                                </td>
                                <td className='p-2 border'>{item.invmI_ItemName}</td>
                                <td className='p-2 border'>{dropdowns.get_maingroup.find(g => g.invmG_Id === item.invmG_Id)?.invmG_GroupName || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {errors.mappedItems && <p className='text-red-500 text-xs'>{errors.mappedItems.message}</p>}

            <div className='flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => reset()}>
                    <X className='h-4 w-4 mr-2' />
                    Cancel
                </Button>
                <Button type='submit' isLoading={saveMutation.isPending}>
                    <Save className='h-4 w-4 mr-2' />
                    Save Mapping
                </Button>
            </div>
        </form>
    );
}
