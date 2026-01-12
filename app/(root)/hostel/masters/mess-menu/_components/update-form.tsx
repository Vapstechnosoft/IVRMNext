'use client';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessMenuSchema, MessMenuSchemaType } from '@/schemas/hostel/mess-menu.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveMessMenu, IMessMenu } from '@/server/hostel/mess-menu/server-action';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';

interface UpdateFormProps {
    rowData: IMessMenu;
    onSuccess: () => void;
    messList: { hlmM_Id: number; hlmM_Name: string }[];
    categoryList: { hlmmC_Id: number; hlmmC_Name: string }[];
}

export const UpdateForm = ({ rowData, onSuccess, messList, categoryList }: UpdateFormProps) => {
    const form = useForm<MessMenuSchemaType>({
        resolver: zodResolver(MessMenuSchema),
        defaultValues: {
            hlmmN_Id: rowData.hlmmN_Id,
            hlmM_Id: rowData.hlmM_Id,
            hlmmC_Id: rowData.hlmmC_Id,
            hlmmN_MenuName: rowData.hlmmN_MenuName,
            hlmmN_MenuDesc: rowData.hlmmN_MenuDesc,
        },
    });

    const { formState, reset } = form;
    const { isSubmitting } = formState;

    // Reset form when rowData changes
    useEffect(() => {
        if (rowData) {
            reset({
                hlmmN_Id: rowData.hlmmN_Id,
                hlmM_Id: rowData.hlmM_Id,
                hlmmC_Id: rowData.hlmmC_Id,
                hlmmN_MenuName: rowData.hlmmN_MenuName,
                hlmmN_MenuDesc: rowData.hlmmN_MenuDesc,
            });
        }
    }, [rowData, reset]);

    const onSubmit = async (data: MessMenuSchemaType) => {
        try {
            const result = await saveMessMenu(data);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md shadow-sm bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="hlmM_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Mess Name <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value ? String(field.value) : undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Mess" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {messList.map((mess) => (
                                            <SelectItem key={mess.hlmM_Id} value={String(mess.hlmM_Id)}>
                                                {mess.hlmM_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="hlmmC_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Mess Category <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value ? String(field.value) : undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categoryList.map((cat) => (
                                            <SelectItem key={cat.hlmmC_Id} value={String(cat.hlmmC_Id)}>
                                                {cat.hlmmC_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="hlmmN_MenuName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Menu Name <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Menu Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="hlmmN_MenuDesc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter Description" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-end pt-4 gap-2'>
                    <Button type='submit' disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-4 w-4' />
                                Update
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
