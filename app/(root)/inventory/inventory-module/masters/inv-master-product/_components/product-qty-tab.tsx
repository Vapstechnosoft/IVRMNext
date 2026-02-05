'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useInvMasterProduct } from '@/hooks/inventory/masters/use-inv-master-product';
import { Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const formSchema = z.object({
    invmpI_Id: z.number().optional(),
    invmP_Id: z.coerce.number().min(1, 'Product is required'),
    invmI_Id: z.coerce.number().min(1, 'Item is required'),
    invmpI_ItemQty: z.coerce.number().min(1, 'Quantity must be greater than 0'),
});

export default function ProductQtyTab() {
    const { loadData, saveProductQtyMutation, deactiveProductQtyMutation, getProductListMutation, getItemListMutation, getProductItemListMutation } = useInvMasterProduct();
    const [productList, setProductList] = useState<any[]>([]);
    const [itemList, setItemList] = useState<any[]>([]);
    const [productItemList, setProductItemList] = useState<any[]>([]);

    const fetchProductItemList = () => {
        getProductItemListMutation.mutate(undefined, {
            onSuccess: (res: any) => {
                if (res.success && res.data) {
                    setProductItemList(res.data);
                }
            }
        });
    };

    useEffect(() => {
        getProductListMutation.mutate(undefined, {
            onSuccess: (res: any) => {
                if (res.success && res.data) {
                    setProductList(res.data);
                }
            }
        });

        getItemListMutation.mutate(undefined, {
            onSuccess: (res: any) => {
                if (res.success && res.data) {
                    setItemList(res.data);
                }
            }
        });

        fetchProductItemList();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invmpI_Id: 0,
            invmP_Id: 0,
            invmI_Id: 0,
            invmpI_ItemQty: 0,
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const payload = {
            INVMPI_Id: values.invmpI_Id || 0,
            INVMP_Id: values.invmP_Id,
            INVMI_Id: values.invmI_Id,
            INVMPI_ItemQty: values.invmpI_ItemQty
        };
        saveProductQtyMutation.mutate(payload, {
            onSuccess: (res: any) => {
                if (res.success) {
                    onCancel();
                    fetchProductItemList();
                }
            }
        });
    };

    const onEdit = (item: any) => {
        form.setValue('invmpI_Id', item.invmpI_Id);
        form.setValue('invmP_Id', item.invmP_Id);
        form.setValue('invmI_Id', item.invmI_Id);
        form.setValue('invmpI_ItemQty', item.invmpI_ItemQty);
    };

    const onDeactive = (item: any) => {
        deactiveProductQtyMutation.mutate({
            INVMPI_Id: item.invmpI_Id,
            INVMPI_ActiveFlg: item.invmpI_ActiveFlg
        });
    };

    const onCancel = () => {
        form.reset({
            invmpI_Id: 0,
            invmP_Id: 0,
            invmI_Id: 0,
            invmpI_ItemQty: 0,
        });
    };

    return (
        <div className="space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField control={form.control} name="invmP_Id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Product" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {productList.map((item: any) => (
                                            <SelectItem key={item.invmP_Id} value={item.invmP_Id.toString()}>
                                                {item.invmP_ProductName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="invmI_Id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Item" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {itemList.map((item: any) => (
                                            <SelectItem key={item.invmI_Id} value={item.invmI_Id.toString()}>
                                                {item.invmI_ItemName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="invmpI_ItemQty" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Quantity</FormLabel>
                                <FormControl><Input {...field} type="number" placeholder="Enter Quantity" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {productItemList.map((row: any, index: number) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.invmP_ProductName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.invmI_ItemName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.invmpI_ItemQty}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onDeactive(row)}>
                                                {row.invmpI_ActiveFlg ? (
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
        </div>
    );
}
