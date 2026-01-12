'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessMenuSchema, type MessMenuSchemaType } from '@/schemas/hostel/mess-menu.schema';
import { saveMessMenu } from '@/server/hostel/mess-menu/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddFormProps {
    onSuccess: () => void;
    messList: { hlmM_Id: number; hlmM_Name: string }[];
    categoryList: { hlmmC_Id: number; hlmmC_Name: string }[];
}

export const AddForm = ({ onSuccess, messList, categoryList }: AddFormProps) => {
    const form = useForm<MessMenuSchemaType>({
        resolver: zodResolver(MessMenuSchema),
        defaultValues: {
            hlmmN_Id: 0,
            hlmM_Id: 0,
            hlmmC_Id: 0,
            hlmmN_MenuName: '',
            hlmmN_MenuDesc: ''
        }
    });

    const { formState } = form;
    const { isSubmitting } = formState;

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
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 rounded-md border bg-white p-4 shadow-sm'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='hlmM_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Mess Name <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Mess' />
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
                        name='hlmmC_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Mess Category <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Category' />
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
                        name='hlmmN_MenuName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Menu Name <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Menu Name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='hlmmN_MenuDesc'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder='Enter Description' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-end gap-2 pt-4'>
                    <Button type='submit' disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-4 w-4' />
                                Save
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
