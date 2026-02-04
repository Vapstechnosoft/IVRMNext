'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useInvMasterProduct } from '@/hooks/inventory/masters/use-inv-master-product';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProductTaxModal } from './product-tax-details-modal';

const formSchema = z.object({
    invmP_Id: z.number().optional(),
    invmP_ProductName: z.string().min(1, 'Product Name is required'),
    invmP_ProductCode: z.string().min(1, 'Product Code is required'),
    invmP_ProductPrice: z.coerce.number().min(0, 'Price must be positive'),
    invmP_TaxApplFlg: z.boolean().default(false),
    product_tax: z.array(z.object({
        invmT_Id: z.number(),
        invmpT_Id: z.number().optional(),
        invmpT_TaxValue: z.coerce.number(),
        selected: z.boolean().default(false),
        invmT_TaxName: z.string().optional(),
        invmT_TaxAliasName: z.string().optional(),
    })).optional()
});

export default function ProductTab() {
    const { loadData, saveProductMutation, deactiveProductMutation, isLoadDataLoading, getTaxListMutation } = useInvMasterProduct();
    const [taxModalOpen, setTaxModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invmP_ProductName: '',
            invmP_ProductCode: '',
            invmP_ProductPrice: 0,
            invmP_TaxApplFlg: false,
            invmP_Id: 0,
            product_tax: []
        }
    });

    const { fields, append, replace } = useFieldArray({
        control: form.control,
        name: "product_tax"
    });

    // useEffect(() => {
    //     if ((loadData as any)?.get_tax && fields.length === 0) {
    //         const taxes = (loadData as any).get_tax.map((t: any) => ({
    //             invmT_Id: t.invmT_Id,
    //             invmpT_Id: 0,
    //             invmpT_TaxValue: 0,
    //             selected: false,
    //             invmT_TaxName: t.invmT_TaxName,
    //             invmT_TaxAliasName: t.invmT_TaxAliasName
    //         }));
    //         replace(taxes);
    //     }
    // }, [loadData, replace]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const payload = {
            INVMP_Id: values.invmP_Id || 0,
            INVMP_ProductName: values.invmP_ProductName,
            INVMP_ProductCode: values.invmP_ProductCode,
            INVMP_ProductPrice: values.invmP_ProductPrice,
            INVMP_TaxApplFlg: values.invmP_TaxApplFlg,
            product_tax: values.invmP_TaxApplFlg ? values.product_tax?.filter(t => t.selected).map(t => ({
                INVMT_Id: t.invmT_Id,
                INVMPT_Id: t.invmpT_Id || 0,
                INVMPT_TaxValue: t.invmpT_TaxValue
            })) : []
        };
        saveProductMutation.mutate(payload, {
            onSuccess: () => {
                onCancel();
            }
        });
    };

    const onEdit = (item: any) => {
        form.setValue('invmP_Id', item.invmP_Id);
        form.setValue('invmP_ProductName', item.invmP_ProductName);
        form.setValue('invmP_ProductCode', item.invmP_ProductCode);
        form.setValue('invmP_ProductPrice', item.invmP_ProductPrice);
        form.setValue('invmP_TaxApplFlg', item.invmP_TaxApplFlg === true);
    };

    const onDeactive = (item: any) => {
        deactiveProductMutation.mutate(item);
    };

    const onCancel = () => {
        form.reset({
            invmP_ProductName: '',
            invmP_ProductCode: '',
            invmP_ProductPrice: 0,
            invmP_TaxApplFlg: false,
            invmP_Id: 0,
        });
        // if ((loadData as any)?.get_tax) {
        //     const taxes = (loadData as any).get_tax.map((t: any) => ({
        //         invmT_Id: t.invmT_Id,
        //         invmpT_Id: 0,
        //         invmpT_TaxValue: 0,
        //         selected: false,
        //         invmT_TaxName: t.invmT_TaxName,
        //         invmT_TaxAliasName: t.invmT_TaxAliasName
        //     }));
        //     replace(taxes);
        // }
    };

    // Columns for Data Table
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'index',
            header: 'SL NO',
            cell: ({ row }) => row.index + 1,
        },
        {
            accessorKey: 'invmP_ProductName',
            header: 'Product Name',
        },
        {
            accessorKey: 'invmP_ProductCode',
            header: 'Product Code',
        },
        {
            accessorKey: 'invmP_ProductPrice',
            header: 'Product Price',
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
                        <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeactive(row.original)}>
                        {row.original.invmP_ActiveFlg ? (
                            <Trash2 className="h-4 w-4 text-red-500" />
                        ) : (
                            <Badge variant="outline" className="text-green-500 cursor-pointer">Activate</Badge>
                        )}
                    </Button>
                    {row.original.invmP_TaxApplFlg && (
                        <Button variant="ghost" size="icon" onClick={() => {
                            setSelectedProductId(row.original.invmP_Id);
                            setTaxModalOpen(true);
                        }}>
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField control={form.control} name="invmP_ProductName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl><Input {...field} placeholder="Enter Product Name" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="invmP_ProductCode" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Code</FormLabel>
                                <FormControl><Input {...field} placeholder="Enter Product Code" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="invmP_ProductPrice" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Price</FormLabel>
                                <FormControl><Input {...field} type="number" placeholder="Enter Product Price" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="invmP_TaxApplFlg" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) {
                                        getTaxListMutation.mutate(undefined, {
                                            onSuccess: (res: any) => {
                                                let taxListRaw: any[] = [];
                                                if (res?.get_taxlist) {
                                                    taxListRaw = res.get_taxlist;
                                                } else if (Array.isArray(res)) {
                                                    taxListRaw = res;
                                                } else if (res?.data && Array.isArray(res.data)) {
                                                    taxListRaw = res.data;
                                                }

                                                // Normalize tax list keys
                                                const taxes = taxListRaw.map((item: any) => ({
                                                    invmT_Id: item.invmT_Id ?? item.INVMT_Id ?? item.id ?? 0,
                                                    invmpT_Id: 0,
                                                    invmpT_TaxValue: item.invmiT_TaxValue ?? item.INVMIT_TaxValue ?? 0, // Default value from master if available
                                                    selected: false,
                                                    invmT_TaxName: item.invmT_TaxName ?? item.INVMT_TaxName ?? '',
                                                    invmT_TaxAliasName: item.invmT_TaxAliasName ?? item.INVMT_TaxAliasName ?? ''
                                                }));
                                                replace(taxes);
                                            }
                                        });
                                    } else {
                                        replace([]);
                                    }
                                }} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Tax Applicable</FormLabel>
                            </div>
                        </FormItem>
                    )} />

                    {form.watch('invmP_TaxApplFlg') && (
                        <div className="border rounded-md p-4">
                            <h4 className="mb-4 text-sm font-medium">Select Taxes</h4>
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="text-left p-2">Select</th>
                                        <th className="text-left p-2">Tax Name</th>
                                        <th className="text-left p-2">Alias</th>
                                        <th className="text-left p-2">Current Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className="border-t">
                                            <td className="p-2">
                                                <FormField control={form.control} name={`product_tax.${index}.selected`} render={({ field: cbField }) => (
                                                    <FormControl>
                                                        <Checkbox checked={cbField.value} onCheckedChange={cbField.onChange} />
                                                    </FormControl>
                                                )} />
                                            </td>
                                            <td className="p-2">{form.getValues(`product_tax.${index}.invmT_TaxName`)}</td>
                                            <td className="p-2">{form.getValues(`product_tax.${index}.invmT_TaxAliasName`)}</td>
                                            <td className="p-2">
                                                <FormField control={form.control} name={`product_tax.${index}.invmpT_TaxValue`} render={({ field: inpField }) => (
                                                    <FormControl>
                                                        <Input {...inpField} type="number" className="w-24" disabled={!form.watch(`product_tax.${index}.selected`)} />
                                                    </FormControl>
                                                )} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-center space-x-4">
                        <Button type="submit">Save</Button>
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    </div>
                </form>
            </Form>

            <div className="mt-8">
                <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL NO</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Price</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(loadData as any)?.data?.map((row: any, index: number) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.invmP_ProductName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.invmP_ProductCode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.invmP_ProductPrice}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onDeactive(row)}>
                                                {row.invmP_ActiveFlg ? (
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                ) : (
                                                    <span className="text-green-500 font-bold text-xs border border-green-500 px-2 py-1 rounded cursor-pointer">Activate</span>
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductTaxModal
                isOpen={taxModalOpen}
                onClose={() => setTaxModalOpen(false)}
                productId={selectedProductId}
            />
        </div>
    );
}
