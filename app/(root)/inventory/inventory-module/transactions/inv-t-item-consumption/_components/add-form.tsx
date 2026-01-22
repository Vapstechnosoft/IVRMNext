
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInvTItemConsumption } from '@/hooks/inventory/transactions/use-inv-t-item-consumption';
import {
    invTItemConsumptionSchema,
    type InvTItemConsumptionSchema,
} from '@/schemas/inventory/transactions/inv-t-item-consumption';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Minus, Package, Plus, ReceiptText, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddItemConsumptionFormProps {
    onSuccess: () => void;
}

export default function AddItemConsumptionForm({ onSuccess }: AddItemConsumptionFormProps) {
    const {
        data: loadData,
        saveMutation,
        itemsOnStoreChangeMutation,
        itemStockDetailMutation,
    } = useInvTItemConsumption();

    const [itemsList, setItemsList] = useState<any[]>([]);
    const [availableStock, setAvailableStock] = useState<number>(0);

    const form = useForm<InvTItemConsumptionSchema>({
        resolver: zodResolver(invTItemConsumptionSchema),
        defaultValues: {
            invmiC_Id: 0,
            invmiC_ICDate: new Date(),
            invmiC_StuOtherFlg: 'Staff',
            invmiC_Remarks: '',
            staffIds: [],
            arrayIC: [
                {
                    invtiC_Id: 0,
                    invmI_Id: 0,
                    invtiC_BatchNo: '',
                    invtiC_ICQty: 0,
                    invtiC_ICPrice: 0,
                    invmuoM_Id: 0,
                    invtiC_Naration: '',
                    invmP_Id: 0
                }
            ]
        },
    });

    const { control, handleSubmit, register, setValue, watch, reset, formState: { errors } } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'arrayIC',
    });

    const watchedStoreId = watch('invmsT_Id');
    const watchedType = watch('invmiC_StuOtherFlg');

    // Fetch Items when Store changes
    useEffect(() => {
        if (watchedStoreId) {
            itemsOnStoreChangeMutation.mutate(watchedStoreId, {
                onSuccess: (res) => {
                    if (res?.data?.get_item) {
                        setItemsList(res.data.get_item);
                    } else {
                        setItemsList([]);
                        toast.info('No items found for this store');
                    }
                },
            });
        }
    }, [watchedStoreId]);

    const handleItemChange = (index: number, itemId: number) => {
        const item = itemsList.find((i: any) => i.invmI_Id === itemId);
        if (item) {
            setValue(`arrayIC.${index}.invtiC_ICPrice`, item.invstO_SalesRate || 0);
            setValue(`arrayIC.${index}.invtiC_BatchNo`, item.invstO_BatchNo || '');

            // Fetch Details (UOM, Stock)
            const data = {
                INVMI_Id: itemId,
                INVSTO_SalesRate: item.invstO_SalesRate,
                INVMST_Id: watchedStoreId
            };

            itemStockDetailMutation.mutate(data, {
                onSuccess: (res) => {
                    if (res?.data?.get_itemDetail && res.data.get_itemDetail.length > 0) {
                        const detail = res.data.get_itemDetail[0];
                        setValue(`arrayIC.${index}.invmuoM_Id`, detail.invmuoM_Id);
                        // Optionally set UOM Name in a local state if needed for display, 
                        // but we usually display UOM from a list or just ID if read-only text is sufficient 
                        // (legacy shows UOM Name in input).
                        // Since useFieldArray doesn't easily support arbitrary extra fields without dirtying schema, 
                        // we might rely on a lookup or just storing ID. 
                        // For display purposes, we can try to find UOM name from loadData if available, 
                        // OR we can add a transient field to the form (if schema allows loose check or we cast).
                    }

                    if (res?.data?.availablestock) {
                        let stock = 0;
                        res.data.availablestock.forEach((s: any) => stock += s.AvaiableStock);
                        setAvailableStock(stock);
                    }
                }
            });
        }
    };

    const onSubmit = (data: InvTItemConsumptionSchema) => {
        // Transform data for server
        const formattedData = {
            ...data,
            invmiC_ICDate: format(data.invmiC_ICDate, 'yyyy-MM-dd'),
            arrayStaff: data.staffIds ? data.staffIds.map(id => ({ hrmE_Id: id })) : [],
            // Ensure numbers
            arrayIC: data.arrayIC.map(item => ({
                ...item,
                invmI_Id: Number(item.invmI_Id),
                invtiC_ICQty: Number(item.invtiC_ICQty),
                invtiC_ICPrice: Number(item.invtiC_ICPrice),
                invmuoM_Id: Number(item.invmuoM_Id),
                invmP_Id: item.invmP_Id ? Number(item.invmP_Id) : 0
            }))
        };

        saveMutation.mutate(formattedData, {
            onSuccess: (res) => {
                if (res.returnval) {
                    reset();
                    onSuccess();
                }
            },
        });
    };

    const staffOptions = loadData?.data?.get_employee?.map((e: any) => ({
        label: `${e.employeename} (${e.hrmE_EmployeeCode})`,
        value: e.hrmE_Id.toString() // MultiSelect expects string values usually
    })) || [];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 max-w-[1400px] mx-auto'>
            <CollapsibleSection
                title="Consumption Header"
             
                defaultOpen={true}
                className="shadow-sm border-primary/10"
            >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-1'>
                    <div className='bg-muted/30 p-4 rounded-lg space-y-4'>
                        <Label>Type</Label>
                        <Controller
                            name="invmiC_StuOtherFlg"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Staff" id="r1" />
                                        <Label htmlFor="r1">Staff</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Department" id="r2" />
                                        <Label htmlFor="r2">Department</Label>
                                    </div>
                                    {/* <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Student" id="r3" />
                                        <Label htmlFor="r3">Student</Label>
                                    </div> */}
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label >IC Date</Label>
                            <Controller
                                name='invmiC_ICDate'
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type='date'
                                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                                        value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                )}
                            />
                            {errors.invmiC_ICDate && <span className='text-destructive text-xs'>{errors.invmiC_ICDate.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <Label >Store</Label>
                            <Controller
                                name='invmsT_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <SelectTrigger><SelectValue placeholder='Select Store' /></SelectTrigger>
                                        <SelectContent>
                                            {loadData?.data?.get_Store?.map((s: any) => (
                                                <SelectItem key={s.invmsT_Id} value={s.invmsT_Id.toString()}>{s.invmS_StoreName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.invmsT_Id && <span className='text-destructive text-xs'>{errors.invmsT_Id.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <div className='flex justify-between'>
                                <Label>IC No.</Label>
                            </div>
                            <InputText {...register('invmiC_ICNo')} placeholder='Auto Generated / Enter No.' />
                        </div>
                    </div>
                </div>

                {watchedType === 'Staff' && (
                    <div className='mt-4 p-4 border rounded-md'>
                        <Label >Select Staff</Label>
                        <Controller
                            name="staffIds"
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={staffOptions}
                                    onValueChange={(vals) => field.onChange(vals.map(v => Number(v)))}
                                    defaultValue={field.value?.map(String) || []}
                                    placeholder="Select Staff..."
                                    variant="inverted"
                                />
                            )}
                        />
                        {errors.staffIds && <span className='text-destructive text-xs'>{errors.staffIds.message}</span>}
                    </div>
                )}

                {watchedType === 'Department' && (
                    <div className='mt-4 p-4 border rounded-md'>
                        <Label >Department</Label>
                        <Controller
                            name='hrmD_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger><SelectValue placeholder='Select Department' /></SelectTrigger>
                                    <SelectContent>
                                        {loadData?.data?.get_Department?.map((d: any) => (
                                            <SelectItem key={d.hrmD_Id} value={d.hrmD_Id.toString()}>{d.hrmD_DepartmentName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.hrmD_Id && <span className='text-destructive text-xs'>{errors.hrmD_Id.message}</span>}
                    </div>
                )}

                {watchedType === 'Student' && (
                    <div className='mt-4 p-4 border rounded-md'>
                        <Label >Student</Label>
                        <Controller
                            name='amsT_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger><SelectValue placeholder='Select Student' /></SelectTrigger>
                                    <SelectContent>
                                        {loadData?.data?.get_Student?.map((s: any) => (
                                            <SelectItem key={s.amsT_Id} value={s.amsT_Id.toString()}>{s.studentname} ({s.amsT_AdmNo})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.amsT_Id && <span className='text-destructive text-xs'>{errors.amsT_Id.message}</span>}
                    </div>
                )}

            </CollapsibleSection>

            <CollapsibleSection
                title="Consumption Items"
              
                defaultOpen={true}
                className="shadow-sm border-primary/10"
            >
                <div className='overflow-x-auto -mx-1 p-1'>
                    <table className='w-full border-collapse text-xs min-w-[1000px]'>
                        <thead>
                            <tr className='bg-muted/50 text-muted-foreground uppercase tracking-wider text-[10px]'>
                                <th className='border p-3 w-[40px] text-center'>#</th>
                                <th className='border p-3 min-w-[200px] text-left'>Item Name</th>
                                <th className='border p-3 w-[150px] text-left'>Product</th>
                                <th className='border p-3 w-[100px] text-left'>Batch No</th>
                                <th className='border p-3 w-[80px] text-right'>Qty</th>
                                <th className='border p-3 min-w-[150px] text-left'>Narration</th>
                                <th className='border p-3 w-[50px] text-center'></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {fields.map((field, index) => (
                                <tr key={field.id} className='hover:bg-primary/5'>
                                    <td className='border p-2 text-center'>{index + 1}</td>
                                    <td className='border p-2'>
                                        <Controller
                                            name={`arrayIC.${index}.invmI_Id`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={(val) => {
                                                    const id = Number(val);
                                                    field.onChange(id);
                                                    handleItemChange(index, id);
                                                }} value={field.value?.toString()}>
                                                    <SelectTrigger><SelectValue placeholder='Select Item' /></SelectTrigger>
                                                    <SelectContent>
                                                        {itemsList.map((i: any) => (
                                                            <SelectItem key={i.invmI_Id} value={i.invmI_Id.toString()}>
                                                                {i.invmI_ItemName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.arrayIC?.[index]?.invmI_Id && <span className='text-destructive text-[10px]'>Required</span>}
                                    </td>
                                    <td className='border p-2'>
                                        <Controller
                                            name={`arrayIC.${index}.invmP_Id`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                                    <SelectTrigger><SelectValue placeholder='Select Product' /></SelectTrigger>
                                                    <SelectContent>
                                                        {loadData?.data?.get_Product?.map((p: any) => (
                                                            <SelectItem key={p.invmP_Id} value={p.invmP_Id.toString()}>{p.invmP_ProductName}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </td>
                                    <td className='border p-2'>
                                        <InputText {...register(`arrayIC.${index}.invtiC_BatchNo`)} className='h-8 text-xs' />
                                        {errors.arrayIC?.[index]?.invtiC_BatchNo && <span className='text-destructive text-[10px]'>Required</span>}
                                    </td>
                                    <td className='border p-2'>
                                        <InputText {...register(`arrayIC.${index}.invtiC_ICQty`, { valueAsNumber: true })} className='h-8 text-xs text-right' />
                                        {errors.arrayIC?.[index]?.invtiC_ICQty && <span className='text-destructive text-[10px]'>Invalid</span>}
                                    </td>
                                    <td className='border p-2'>
                                        <InputText {...register(`arrayIC.${index}.invtiC_Naration`)} className='h-8 text-xs' />
                                    </td>
                                    <td className='border p-2 text-center'>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            className='h-7 w-7 text-destructive/60 hover:text-destructive'
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <Minus className='h-3.5 w-3.5' />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='mt-4 flex justify-between items-center'>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => append({
                                invtiC_Id: 0,
                                invmI_Id: 0,
                                invtiC_BatchNo: '',
                                invtiC_ICQty: 0,
                                invtiC_ICPrice: 0,
                                invmuoM_Id: 0,
                                invtiC_Naration: '',
                                invmP_Id: 0
                            })}
                            className='h-8 text-[11px] font-bold'
                        >
                            <Plus className='mr-2 h-3 w-3' /> ADD ROW
                        </Button>
                        <div className='text-sm font-medium'>
                            Total Available Stock: <span className='font-bold text-primary'>{availableStock}</span>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2'>
                    <CollapsibleSection
                        title="Remarks"
                        defaultOpen={true}
                    >
                        <InputTextarea
                            label='Remarks / Narration'
                            {...register('invmiC_Remarks')}
                            rows={3}
                            className='resize-none rounded-lg'
                        />
                    </CollapsibleSection>
                </div>
                <div className='lg:col-span-1'>
                    <div className='flex flex-col gap-3'>
                        <Button type='submit' className='py-6 shadow-lg' isLoading={saveMutation.isPending}>
                            <Save className='mr-2 h-5 w-5' /> Save Consumption
                        </Button>
                        <Button type='button' variant='outline' className='py-6' onClick={() => reset()}>
                            <RotateCcw className='h-5 w-5 mr-2' /> Reset
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
