
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { invOpeningBalanceSchema, type TInvOpeningBalance } from '@/schemas/inventory/transactions/inv-opening-balance';
import { useInvOpeningBalance, useInvOpeningBalanceItemDetails, useInvOpeningBalanceDetails } from '@/hooks/inventory/transactions/use-inv-opening-balance';
import { toast } from 'sonner';

interface AddOBFormProps {
    onSuccess: () => void;
    storeList: any[];
    itemList: any[];
    initialData?: any;
    isEdit?: boolean;
}

export default function AddOBForm({ onSuccess, storeList, itemList, initialData, isEdit }: AddOBFormProps) {
    const { saveMutation } = useInvOpeningBalance();
    const itemDetailMutation = useInvOpeningBalanceItemDetails();
    const obDetailsMutation = useInvOpeningBalanceDetails();

    const form = useForm<TInvOpeningBalance>({
        resolver: zodResolver(invOpeningBalanceSchema),
        defaultValues: {
            invmsT_Id: 0,
            transrows: [
                {
                    itrS_Id: 'trans1',
                    invmI_Id: 0,
                    invmuoM_Id: 0,
                    invmuoM_UOMName: '',
                    invoB_BatchNo: '',
                    invoB_PurchaseDate: new Date(),
                    invoB_Qty: 0,
                    invstO_PurchaseRate: 0,
                    invstO_SalesRate: 0,
                    invoB_Naration: '',
                    invoB_TotalAmount: 0
                }
            ]
        }
    });

    const { control, handleSubmit, register, setValue, watch, reset, formState: { errors, isSubmitting } } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'transrows'
    });

    // Populate data for Edit
    useEffect(() => {
        if (isEdit && initialData?.invoB_Id) {
            obDetailsMutation.mutate({ INVOB_Id: initialData.invoB_Id }, {
                onSuccess: (res) => {
                    if (res.get_obdetails && res.get_obdetails.length > 0) {
                        const detail = res.get_obdetails[0]; // Assuming edit is for single item or first item of batch for now, or fetch all.
                        // Legacy logic loops: `angular.forEach($scope.get_obdetails...`
                        // So I should map all.

                        const rows = res.get_obdetails.map((obj: any, index: number) => ({
                            itrS_Id: `trans${index + 1}`,
                            invmI_Id: obj.invmI_Id,
                            invmI_ItemName: obj.invmI_ItemName,
                            invmuoM_Id: obj.invmuoM_Id,
                            invmuoM_UOMName: obj.invmuoM_UOMName,
                            invoB_BatchNo: obj.invoB_BatchNo,
                            invoB_PurchaseDate: new Date(obj.invoB_PurchaseDate),
                            invoB_Qty: obj.qty || obj.invoB_Qty, // Legacy mapping checks
                            invstO_PurchaseRate: obj.invoB_PurchaseRate,
                            invstO_SalesRate: obj.invoB_SaleRate,
                            invoB_Naration: obj.invoB_Naration,
                            invoB_TotalAmount: (obj.invoB_PurchaseRate || 0) * (obj.qty || obj.invoB_Qty || 0)
                        }));

                        reset({
                            invoB_Id: initialData.invoB_Id,
                            invmsT_Id: initialData.invmsT_Id || detail.invmsT_Id, // detail usually doesn't have store id in legacy get_obdetails loop but invmsT_Id is on scope
                            transrows: rows
                        });
                    }
                }
            });
        }
    }, [isEdit, initialData, reset]);

    const handleItemChange = (index: number, itemId: string) => {
        const id = Number(itemId);
        setValue(`transrows.${index}.invmI_Id`, id);

        if (id) {
            itemDetailMutation.mutate({ INVMI_Id: id }, {
                onSuccess: (res) => {
                    if (res.get_itemDetail && res.get_itemDetail.length > 0) {
                        const details = res.get_itemDetail[0];
                        setValue(`transrows.${index}.invmuoM_Id`, details.invmuoM_Id);
                        setValue(`transrows.${index}.invmuoM_UOMName`, details.invmuoM_UOMName);
                        // Reset other fields as per legacy
                        setValue(`transrows.${index}.invoB_BatchNo`, '0');
                        setValue(`transrows.${index}.invoB_Qty`, 0);
                        setValue(`transrows.${index}.invstO_PurchaseRate`, 0);
                        setValue(`transrows.${index}.invstO_SalesRate`, 0);
                        setValue(`transrows.${index}.invoB_PurchaseDate`, new Date());
                    }
                }
            });
        }
    };

    const calculateTotal = (index: number) => {
        const qty = watch(`transrows.${index}.invoB_Qty`) || 0;
        const rate = watch(`transrows.${index}.invstO_PurchaseRate`) || 0;
        const total = qty * rate;
        setValue(`transrows.${index}.invoB_TotalAmount`, Number(total.toFixed(2)));
    };

    const onSubmit = (data: TInvOpeningBalance) => {
        saveMutation.mutate(data, {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="invmsT_Id">Store <span className="text-red-500">*</span></Label>
                    <Controller
                        name="invmsT_Id"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value?.toString()}
                                disabled={isEdit}
                            >
                                <SelectTrigger className={errors.invmsT_Id ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select Store" />
                                </SelectTrigger>
                                <SelectContent>
                                    {storeList.map((store) => (
                                        <SelectItem key={store.invmsT_Id} value={store.invmsT_Id.toString()}>
                                            {store.invmS_StoreName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.invmsT_Id && <p className="text-red-500 text-xs">{errors.invmsT_Id.message}</p>}
                </div>
            </div>

            <div className="border rounded-md overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">SL.No</TableHead>
                            <TableHead className="min-w-[200px]">Item Name</TableHead>
                            <TableHead className="min-w-[100px]">UOM</TableHead>
                            <TableHead className="min-w-[100px]">Batch No</TableHead>
                            <TableHead className="min-w-[150px]">Purchase Date</TableHead>
                            <TableHead className="min-w-[100px]">Quantity</TableHead>
                            <TableHead className="min-w-[100px]">Purchase Price</TableHead>
                            <TableHead className="min-w-[100px]">Total Amount</TableHead>
                            <TableHead className="min-w-[100px]">Sales Price</TableHead>
                            <TableHead className="min-w-[150px]">Narration</TableHead>
                            <TableHead className="w-[50px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    {isEdit ? (
                                        <span className="text-sm">{watch(`transrows.${index}.invmI_ItemName`)}</span>
                                    ) : (
                                        <Controller
                                            name={`transrows.${index}.invmI_Id`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => handleItemChange(index, val)}
                                                    value={field.value?.toString()}
                                                >
                                                    <SelectTrigger className={errors.transrows?.[index]?.invmI_Id ? "border-red-500" : ""}>
                                                        <SelectValue placeholder="Select Item" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {itemList.map((item) => (
                                                            <SelectItem key={item.invmI_Id} value={item.invmI_Id.toString()}>
                                                                {item.invmI_ItemName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    )}
                                    {errors.transrows?.[index]?.invmI_Id && <p className="text-red-500 text-xs">{errors.transrows?.[index]?.invmI_Id?.message}</p>}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        {...register(`transrows.${index}.invmuoM_UOMName`)}
                                        disabled
                                        placeholder="UOM"
                                        className="bg-muted"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        {...register(`transrows.${index}.invoB_BatchNo`)}
                                        placeholder="Batch No"
                                        disabled={isEdit}
                                        className={errors.transrows?.[index]?.invoB_BatchNo ? "border-red-500" : ""}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Controller
                                        name={`transrows.${index}.invoB_PurchaseDate`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type='date'
                                                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200'
                                                value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                            />
                                        )}
                                    />
                                    {errors.transrows?.[index]?.invoB_PurchaseDate && <p className="text-red-500 text-xs">{errors.transrows?.[index]?.invoB_PurchaseDate?.message}</p>}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        {...register(`transrows.${index}.invoB_Qty`)}
                                        onChange={(e) => {
                                            register(`transrows.${index}.invoB_Qty`).onChange(e);
                                            calculateTotal(index);
                                        }}
                                        className={errors.transrows?.[index]?.invoB_Qty ? "border-red-500" : ""}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        {...register(`transrows.${index}.invstO_PurchaseRate`)}
                                        onChange={(e) => {
                                            register(`transrows.${index}.invstO_PurchaseRate`).onChange(e);
                                            calculateTotal(index);
                                        }}
                                        className={errors.transrows?.[index]?.invstO_PurchaseRate ? "border-red-500" : ""}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        readOnly
                                        {...register(`transrows.${index}.invoB_TotalAmount`)}
                                        className="bg-muted"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        {...register(`transrows.${index}.invstO_SalesRate`)}
                                        disabled={isEdit}
                                        className={errors.transrows?.[index]?.invstO_SalesRate ? "border-red-500" : ""}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        {...register(`transrows.${index}.invoB_Naration`)}
                                        disabled={isEdit}
                                        placeholder="Narration"
                                    />
                                </TableCell>
                                <TableCell>
                                    {!isEdit && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {!isEdit && (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({
                            itrS_Id: `trans${fields.length + 1}`,
                            invmI_Id: 0,
                            invmuoM_Id: 0,
                            invmuoM_UOMName: '',
                            invoB_BatchNo: '',
                            invoB_PurchaseDate: new Date(),
                            invoB_Qty: 0,
                            invstO_PurchaseRate: 0,
                            invstO_SalesRate: 0,
                            invoB_Naration: '',
                            invoB_TotalAmount: 0
                        })}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
