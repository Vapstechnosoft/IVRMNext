'use client';

import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label, FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    invTSalesSchema,
    type InvTSalesSchema
} from '@/schemas/inventory/transactions/inv-t-sales';
import { useInvTSales } from '@/hooks/inventory/transactions/use-inv-t-sales';
import { Plus, Minus, Save, RotateCcw, Calculator, Package, ReceiptIndianRupee, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Card } from '@/components/ui/card';
// import { MultiSelect } from '@/components/ui/extension/multi-select';

interface AddSalesFormProps {
    onSuccess: () => void;
}

export default function AddSalesForm({ onSuccess }: AddSalesFormProps) {
    const { data: loadData, saveMutation, studentClsSecMutation, studentListMutation, sectionListMutation, itemOnStoreChangeMutation, itemDetailMutation } = useInvTSales();
    const [discountType, setDiscountType] = useState<'A' | 'P'>('A');

    // Tax Modal State
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [selectedTaxRowIndex, setSelectedTaxRowIndex] = useState<number | null>(null);

    // Local state for dynamic lists
    const [studentClsSec, setStudentClsSec] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [itemsList, setItemsList] = useState<any[]>([]);

    const form = useForm<InvTSalesSchema>({
        resolver: zodResolver(invTSalesSchema),
        defaultValues: {
            invmsL_SalesDate: new Date(),
            invmsL_StuOtherFlg: 'Student',
            stu_Flag: 'I',
            invmsL_Remarks: '',
            invmsL_TotalAmount: 0,
            invmsL_TotDiscount: 0,
            invmsL_TotTaxAmt: 0,
            invmsL_SalesValue: 0,
            SalesItem: [
                {
                    invmI_Id: 0,
                    invtsL_SalesQty: 0,
                    invtsL_SalesPrice: 0,
                    invtsL_DiscountAmt: 0,
                    invtsL_TaxAmt: 0,
                    invtsL_Amount: 0,
                }
            ]
        }
    });

    const { control, handleSubmit, register, setValue, watch, reset, formState: { errors } } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'SalesItem'
    });

    const watchedItems = watch('SalesItem');
    const watchedType = watch('invmsL_StuOtherFlg');
    const watchedStuFlag = watch('stu_Flag');
    const watchedClassId = watch('asmcL_Id');
    const watchedSectionId = watch('asmS_Id');
    const watchedStoreId = watch('invmsT_Id');


    // Fetch Items when Store changes
    useEffect(() => {
        if (watchedStoreId) {
            itemOnStoreChangeMutation.mutate(watchedStoreId, {
                onSuccess: (res) => {
                    if (res?.data?.get_item) {
                        setItemsList(res.data.get_item);
                    }
                }
            });
        }
    }, [watchedStoreId]);

    // Fetch Student/Class/Sec when type or flag changes
    useEffect(() => {
        if (watchedType === 'Student' && watchedStuFlag) {
            studentClsSecMutation.mutate(watchedStuFlag, {
                onSuccess: (res) => {
                    setStudentClsSec(res?.data?.get_Student_Cls_Sec || []);
                }
            });
        }
    }, [watchedType, watchedStuFlag]);

    // Fetch Student List on Class Change (for I or C)
    useEffect(() => {
        if (watchedType === 'Student' && watchedClassId) {
            const data = {
                ASMCL_Id: watchedClassId,
                type: watchedStuFlag
            };
            // If C or CS logic differs, adjust here.
            // Angular: if C -> just ASMCL_Id. if CS -> ASMCL_Id and ASMS_Id
            if (watchedStuFlag === 'C') {
                studentListMutation.mutate(data, {
                    onSuccess: (res) => setStudentList(res?.data?.get_Studentlist || [])
                });

                // Also get sections if needed?
                sectionListMutation.mutate(data, {
                    onSuccess: (res) => setSectionList(res?.data?.get_sectionlist || [])
                });
            }
        }
    }, [watchedType, watchedStuFlag, watchedClassId]);

    // Fetch Student List on Section Change (for CS)
    useEffect(() => {
        if (watchedType === 'Student' && watchedStuFlag === 'CS' && watchedClassId && watchedSectionId) {
            const data = {
                ASMCL_Id: watchedClassId,
                ASMS_Id: watchedSectionId,
                type: watchedStuFlag
            };
            studentListMutation.mutate(data, {
                onSuccess: (res) => setStudentList(res?.data?.get_Studentlist || [])
            });
        }
    }, [watchedType, watchedStuFlag, watchedClassId, watchedSectionId]);


    // Calculate totals whenever items change
    useEffect(() => {
        calculateTotals();
    }, [watchedItems]);

    const calculateTotals = () => {
        let totalBasic = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        const items = form.getValues('SalesItem') || [];
        items.forEach((item) => {
            totalBasic += Number(item.invtsL_Amount) || 0;
            totalDiscount += Number(item.invtsL_DiscountAmt) || 0;
            totalTax += Number(item.invtsL_TaxAmt) || 0;
        });

        setValue('invmsL_TotalAmount', totalBasic);
        setValue('invmsL_TotDiscount', totalDiscount);
        setValue('invmsL_TotTaxAmt', totalTax);
        setValue('invmsL_SalesValue', totalBasic - totalDiscount + totalTax);
    };

    const handleItemChange = async (index: number, itemId: number) => {
        const item = itemsList.find((i: any) => i.invmI_Id === itemId);
        if (item) {
            const storeId = watch('invmsT_Id');
            const payload = {
                INVMI_Id: item.invmI_Id,
                INVSTO_SalesRate: item.invstO_SalesRate,
                INVMST_Id: storeId,
                INVSTO_BatchNo: item.invstO_BatchNo
            };

            itemDetailMutation.mutate(payload, {
                onSuccess: (res) => {
                    if (res?.data) {
                        const detail = res.data.get_itemDetail?.[0];
                        const taxes = res.data.get_itemTax || [];
                        const availableStock = res.data.availablestock?.[0]?.AvaiableStock || 0;

                        if (detail) {
                            setValue(`SalesItem.${index}.invmuoM_Id`, detail.invmuoM_Id);
                            setValue(`SalesItem.${index}.invtsL_BatchNo`, detail.invstO_BatchNo);
                            // Angular code sets sales price from detail or item list. 
                            // It seems detail return same batch/rate info.
                            setValue(`SalesItem.${index}.invtsL_SalesPrice`, detail.invstO_SalesRate || item.invstO_SalesRate || 0);
                        }

                        // Set taxes
                        if (taxes.length > 0) {
                            const mappedTaxes = taxes.map((t: any) => ({
                                invmT_Id: t.invmT_Id,
                                invtslT_TaxPer: t.invmiT_TaxValue,
                                invtslT_TaxAmt: 0
                            }));
                            setValue(`SalesItem.${index}.SalesItemTax`, mappedTaxes);
                        } else {
                            setValue(`SalesItem.${index}.SalesItemTax`, []);
                        }

                        // Store available stock in hidden field or usage state if needed (not in schema currently, maybe validation check)
                        // For now we will rely on calculating amount to check stock? 
                        // We can't easily store it in the form if it's not in schema. 
                        // We could use a temporary field or just re-fetch/check on validation.
                        // Or add a hidden 'availableStock' property to the item form object (if we cast it).
                        // Let's attach it to the form object by casting or using extra props not in schema (zod allows passThrough or we just setValue on any)
                        setValue(`SalesItem.${index}.availableStock`, availableStock);

                        calculateItemAmount(index);
                    }
                }
            });
        }
    };

    const calculateItemAmount = (index: number) => {
        const qty = watch(`SalesItem.${index}.invtsL_SalesQty`) || 0;
        const rate = watch(`SalesItem.${index}.invtsL_SalesPrice`) || 0;
        const availableStock = watch(`SalesItem.${index}.availableStock` as any) || 0;

        if (qty > availableStock) {
            // We might want to show error. For now, we can clamp or just warn. 
            // Since we can't easily toast from here repeatedly, let's just create a side effect or console warn, or reset.
            // Angular shows alert.
            // We can set an error on the field.
            form.setError(`SalesItem.${index}.invtsL_SalesQty`, { message: `Max stock: ${availableStock}` });
        } else {
            form.clearErrors(`SalesItem.${index}.invtsL_SalesQty`);
        }

        const basicAmt = qty * rate;
        setValue(`SalesItem.${index}.invtsL_Amount`, basicAmt);
        calculateDiscount(index);
    };

    const calculateDiscount = (index: number) => {
        const basicAmt = watch(`SalesItem.${index}.invtsL_Amount`) || 0;
        let discountAmt = watch(`SalesItem.${index}.invtsL_DiscountAmt`) || 0;

        if (discountType === 'P') {
            // If input is percentage
            const perc = discountAmt;
            // Logic: if user typed 10 (as 10%), we calc amount. 
            // But the field is `invtsL_DiscountAmt`. 
            // Angular has a toggle. Here we only have 1 input.
            // If we want to support percentage input, we need a separate state or field for Rate vs Amount.
            // For now, assuming Amount input as per schema.
        }

        if (discountAmt > basicAmt) {
            setValue(`SalesItem.${index}.invtsL_DiscountAmt`, 0);
            discountAmt = 0;
        }

        calculateTax(index);
    };

    const calculateTax = (index: number) => {
        const basicAmt = watch(`SalesItem.${index}.invtsL_Amount`) || 0;
        const discountAmt = watch(`SalesItem.${index}.invtsL_DiscountAmt`) || 0;
        const taxableAmt = basicAmt - discountAmt;

        const itemTaxes = watch(`SalesItem.${index}.SalesItemTax`) || [];
        let totalItemTax = 0;

        if (itemTaxes.length > 0) {
            const updatedTaxes = itemTaxes.map((tax: any) => {
                const taxVal = (taxableAmt * (tax.invtslT_TaxPer || 0)) / 100;
                totalItemTax += taxVal;
                return { ...tax, invtslT_TaxAmt: taxVal };
            });
            setValue(`SalesItem.${index}.SalesItemTax`, updatedTaxes);
        }

        setValue(`SalesItem.${index}.invtsL_TaxAmt`, totalItemTax);
        calculateTotals();
    };

    const onSubmit = (data: InvTSalesSchema) => {
        saveMutation.mutate(data, {
            onSuccess: (res) => {
                if (res.success) {
                    reset();
                    onSuccess();
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 max-w-[1400px] mx-auto'>
            {/* Header Details */}
            <CollapsibleSection
                title="Sales Header Information"

                defaultOpen={true}
                className="shadow-sm border-primary/10"
            >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-1'>
                    <div className='bg-muted/30 p-4 rounded-lg space-y-4'>
                        <label className="text-sm font-medium">Customer Type</label>
                        <Controller
                            name="invmsL_StuOtherFlg"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Student" id="r1" />
                                        <Label htmlFor="r1">Student</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Staff" id="r2" />
                                        <Label htmlFor="r2">Staff</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Customer" id="r3" />
                                        <Label htmlFor="r3">Customer</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label >Sale Date</Label>
                            <Controller
                                name='invmsL_SalesDate'
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
                        </div>
                    </div>
                </div>

                {watchedType === 'Student' && (
                    <div className='mt-4 p-4 border rounded-md bg-secondary/10'>
                        <Controller
                            name="stu_Flag"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 mb-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="I" id="s1" /><Label htmlFor="s1">Individual</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="C" id="s2" /><Label htmlFor="s2">Class</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="CS" id="s3" /><Label htmlFor="s3">Class & Section</Label></div>
                                </RadioGroup>
                            )}
                        />

                        {/* Individual Student Selection */}
                        {watchedStuFlag === 'I' && (
                            <div className='space-y-2'>
                                <Label >Student Name</Label>
                                {/* This should ideally be a combobox/autocomplete */}
                                {/* Mocking generic select for now */}
                                <Controller
                                    name='amsT_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <SelectTrigger><SelectValue placeholder='Select Student' /></SelectTrigger>
                                            <SelectContent>
                                                {studentClsSec.map((s: any) => (
                                                    <SelectItem key={s.amsT_Id} value={s.amsT_Id.toString()}>{s.studentname}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        )}

                        {/* Class / Section Selection */}
                        {(watchedStuFlag === 'C' || watchedStuFlag === 'CS') && (
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label >Class</Label>
                                    <Controller
                                        name='asmcL_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                <SelectTrigger><SelectValue placeholder='Select Class' /></SelectTrigger>
                                                <SelectContent>
                                                    {studentClsSec.map((s: any) => (
                                                        <SelectItem key={s.ASMCL_Id} value={s.ASMCL_Id.toString()}>{s.ASMCL_ClassName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                {watchedStuFlag === 'CS' && (
                                    <div className='space-y-2'>
                                        <Label >Section</Label>
                                        <Controller
                                            name='asmS_Id'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                    <SelectTrigger><SelectValue placeholder='Select Section' /></SelectTrigger>
                                                    <SelectContent>
                                                        {sectionList.map((s: any) => (
                                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>{s.asmC_SectionName}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {watchedType === 'Staff' && (
                    <div className='mt-4 p-4 border rounded-md'>
                        <Label >Staff</Label>
                        <Controller
                            name='hrmE_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger><SelectValue placeholder='Select Staff' /></SelectTrigger>
                                    <SelectContent>
                                        {loadData?.data?.get_employee?.map((s: any) => (
                                            <SelectItem key={s.hrmE_Id} value={s.hrmE_Id.toString()}>{s.employeename}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                )}

                {watchedType === 'Customer' && (
                    <div className='mt-4 p-4 border rounded-md'>
                        <Label >Customer</Label>
                        <Controller
                            name='invmC_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger><SelectValue placeholder='Select Customer' /></SelectTrigger>
                                    <SelectContent>
                                        {loadData?.data?.get_customer?.map((s: any) => (
                                            <SelectItem key={s.invmC_Id} value={s.invmC_Id.toString()}>{s.invmC_CustomerName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                )}
            </CollapsibleSection>

            {/* Tax Details Modal */}
            <Dialog open={isTaxModalOpen} onOpenChange={setIsTaxModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <ReceiptIndianRupee className="h-5 w-5" />
                            Tax Breakdown
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedTaxRowIndex !== null && (() => {
                            const currentTaxList = watch(`SalesItem.${selectedTaxRowIndex}.SalesItemTax`) || [];
                            const totalRowTax = watch(`SalesItem.${selectedTaxRowIndex}.invtsL_TaxAmt`) || 0;
                            return (
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-medium border-b pb-2">
                                        <span>Tax Name</span>
                                        <div className="flex gap-8">
                                            <span>Rate (%)</span>
                                            <span className="w-20 text-right">Amount</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {currentTaxList.length > 0 ? (
                                            currentTaxList.map((tax: any, i: number) => {
                                                // We need to fetch tax name from loadData if possible, but tax list in loadData might not be available or comprehensive.
                                                // Actually get_itemDetail returns tax list with names usually. 
                                                // But here we stored only IDs. 
                                                // Ideally we should have stored tax Name too in `SalesItemTax`.
                                                // For now, we just display percentages.
                                                return (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{tax.invmT_Id} (Ref ID)</span>
                                                        <div className="flex gap-8">
                                                            <span className="font-mono text-xs">{tax.invtslT_TaxPer}%</span>
                                                            <span className="w-20 text-right font-mono font-medium">₹{tax.invtslT_TaxAmt?.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center text-muted-foreground text-sm py-2">No taxes active for this item</div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-sm font-bold border-t pt-3 mt-2">
                                        <span>Total Tax</span>
                                        <span className="font-mono text-green-600">
                                            ₹{totalRowTax.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Items Collection */}
            <CollapsibleSection
                title="Sales Items"

                defaultOpen={true}
                className="shadow-sm border-primary/10"
            >
                <div className='overflow-x-auto -mx-1 p-1'>
                    <table className='w-full border-collapse text-xs min-w-[1000px]'>
                        <thead>
                            <tr className='bg-muted/50 text-muted-foreground uppercase tracking-wider text-[10px]'>
                                <th className='border p-3 w-[40px] text-center'>#</th>
                                <th className='border p-3 min-w-[200px] text-left'>Item Name</th>
                                <th className='border p-3 w-[100px] text-left'>Batch No</th>
                                <th className='border p-3 w-[80px] text-right'>Qty</th>
                                <th className='border p-3 w-[100px] text-right'>Rate</th>
                                <th className='border p-3 w-[100px] text-right'>Discount</th>
                                <th className='border p-3 w-[120px] text-right'>Amount</th>
                                <th className='border p-3 w-[50px] text-center'></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {fields.map((field, index) => (
                                <tr key={field.id} className='hover:bg-primary/5'>
                                    <td className='border p-2 text-center'>{index + 1}</td>
                                    <td className='border p-2'>
                                        <Controller
                                            name={`SalesItem.${index}.invmI_Id`}
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
                                    </td>
                                    <td className='border p-2'>
                                        <InputText {...register(`SalesItem.${index}.invtsL_BatchNo`)} className='h-8 text-xs' disabled />
                                    </td>
                                    <td className='border p-2'>
                                        <InputText {...register(`SalesItem.${index}.invtsL_SalesQty`, { valueAsNumber: true })} className='h-8 text-xs text-right' onBlur={() => calculateItemAmount(index)} />
                                    </td>
                                    <td className='border p-2'>
                                        <InputText {...register(`SalesItem.${index}.invtsL_SalesPrice`, { valueAsNumber: true })} className='h-8 text-xs text-right' disabled />
                                    </td>
                                    <td className='border p-2'>
                                        <InputText {...register(`SalesItem.${index}.invtsL_DiscountAmt`, { valueAsNumber: true })} className='h-8 text-xs text-right' onBlur={() => calculateDiscount(index)} />
                                    </td>
                                    <td className='border p-2'>
                                        <InputText {...register(`SalesItem.${index}.invtsL_Amount`, { valueAsNumber: true })} className='h-8 text-xs text-right' disabled />
                                    </td>
                                    <td className='border p-2 text-center'>
                                        <div
                                            className='flex items-center gap-1 justify-end font-mono text-green-700 text-xs font-semibold cursor-pointer hover:bg-green-100/50 p-1 rounded transition-colors'
                                            onClick={() => {
                                                setSelectedTaxRowIndex(index);
                                                setIsTaxModalOpen(true);
                                            }}
                                            title="Click to view Tax Details"
                                        >
                                            <span>{watch(`SalesItem.${index}.invtsL_TaxAmt`)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                                            <Calculator className='h-3 w-3 text-green-600' />
                                        </div>
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
                    <div className='mt-4 flex justify-start'>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => append({
                                invmI_Id: 0,
                                invtsL_SalesQty: 0,
                                invtsL_SalesPrice: 0,
                                invtsL_DiscountAmt: 0,
                                invtsL_TaxAmt: 0,
                                invtsL_Amount: 0,
                            })}
                            className='h-8 text-[11px] font-bold'
                        >
                            <Plus className='mr-2 h-3 w-3' /> ADD ROW
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Footer and Totals */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2'>
                    <CollapsibleSection
                        title="Remarks"
                        defaultOpen={true}
                    >
                        <InputTextarea
                            label='Remarks / Narration'
                            {...register('invmsL_Remarks')}
                            rows={3}
                            className='resize-none rounded-lg'
                        />
                    </CollapsibleSection>
                </div>
                <div className='lg:col-span-1'>
                    <Card className='p-6 shadow-md border-primary/20 bg-primary/5 space-y-4'>
                        <div className='space-y-3 pt-2 font-medium'>
                            <div className='flex justify-between items-center text-sm'>
                                <span className='text-muted-foreground'>Total Basic Amount:</span>
                                <span className='font-mono'>₹{watch('invmsL_TotalAmount')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className='flex justify-between items-center text-sm text-destructive'>
                                <span className='flex items-center gap-1.5'>
                                    Total Discount:
                                </span>
                                <span className='font-mono'>- ₹{watch('invmsL_TotDiscount')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className='flex justify-between items-center text-sm text-green-700'>
                                <span className='flex items-center gap-1.5'>
                                    Total Tax Amount:
                                </span>
                                <span className='font-mono'>+ ₹{watch('invmsL_TotTaxAmt')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                            <div className='pt-4 mt-2 border-t border-primary/20'>
                                <div className='flex justify-between items-end'>
                                    <div className='flex flex-col'>
                                        <span className='text-[10px] font-bold uppercase tracking-widest text-primary/70'>Net Sales Value</span>
                                        <span className='font-extrabold text-3xl tracking-tighter text-primary'>
                                            ₹{watch('invmsL_SalesValue')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-3 mt-6'>
                            <Button type='submit' className='flex-1 py-6 shadow-lg' isLoading={saveMutation.isPending}>
                                <Save className='mr-2 h-5 w-5' /> Save Sale
                            </Button>
                            <Button type='button' variant='outline' className='px-6 py-6' onClick={() => reset()}>
                                <RotateCcw className='h-5 w-5' />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

        </form>
    );
}
