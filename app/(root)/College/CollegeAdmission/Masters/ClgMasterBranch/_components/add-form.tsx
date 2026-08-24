'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useSaveClgMasterBranch } from '@/hooks/college/useCollegeMasters';

const addSchema = z.object({
    amB_BranchName: z.string().min(1, 'Branch Name is required').regex(/^[a-zA-Z\s.]+$/, 'Only alphabets, spaces and dots are allowed'),
    amB_BranchCode: z.string().min(1, 'Branch Code is required').regex(/^[\sA-Za-z0-9]+$/, 'Only alphanumeric characters are allowed'),
    amB_BranchInfo: z.string().min(1, 'Branch Info is required').regex(/^[\sa-zA-Z0-9.]+$/, 'Only alphanumeric characters, spaces and dots are allowed'),
    amB_BranchType: z.string().min(1, 'Branch Type is required'),
    amB_Order: z.coerce.number().min(1, 'Branch Order must be greater than 0'),
    amB_StudentCapacity: z.coerce.number().min(1, 'Branch Capacity must be greater than 0'),
    amB_AidedUnAided: z.string().min(1, 'Aided/Unaided selection is required')
});

type AddFormValues = z.infer<typeof addSchema>;

interface AddClgMasterBranchFormProps {
    onSuccess: () => void;
}

export default function AddClgMasterBranchForm({ onSuccess }: AddClgMasterBranchFormProps) {
    const saveMutation = useSaveClgMasterBranch();

    const form = useForm<AddFormValues>({
        resolver: zodResolver(addSchema),
        defaultValues: {
            amB_BranchName: '',
            amB_BranchCode: '',
            amB_BranchInfo: '',
            amB_BranchType: '',
            amB_AidedUnAided: '',
            amB_Order: '' as any,
            amB_StudentCapacity: '' as any
        }
    });

    const onSubmit = async (values: AddFormValues) => {
        const promise = saveMutation.mutateAsync({
            amB_Id: 0,
            amB_BranchName: values.amB_BranchName,
            amB_BranchCode: values.amB_BranchCode,
            amB_BranchInfo: values.amB_BranchInfo,
            amB_BranchType: values.amB_BranchType,
            amB_Order: values.amB_Order,
            amB_StudentCapacity: values.amB_StudentCapacity,
            amB_AidedUnAided: values.amB_AidedUnAided
        });

        toast.promise(promise, {
            loading: 'Saving branch...',
            success: (data: any) => {
                if (data?.success === false || data?.message === 'Duplicate') {
                    throw new Error(data?.message === 'Duplicate' ? 'Record Already Exists' : (data?.message || 'Failed to save record'));
                }
                if (data?.success || data?.returnval) {
                    onSuccess();
                    return data?.message && data.message !== 'Add' && data.message !== 'Duplicate' ? data.message : 'Record Saved Successfully';
                }
                throw new Error('Failed to save record');
            },
            error: (err: any) => err.message || 'Something Went Wrong Please Contact Administrator'
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='amB_BranchName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Name <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter branch name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amB_Order'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Order <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input type='number' placeholder='Enter branch order' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amB_BranchType'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Type <span className='text-red-500'>*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='Common Branch'>Common Branch</SelectItem>
                                            <SelectItem value='Different Branch'>Different Branch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amB_AidedUnAided'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Aided / Unaided <span className='text-red-500'>*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='Aided'>Aided</SelectItem>
                                            <SelectItem value='UnAided'>Unaided</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='amB_BranchCode'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Code <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter branch code' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amB_BranchInfo'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Info <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter branch info' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amB_StudentCapacity'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Capacity <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input type='number' placeholder='Enter branch capacity' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <div className='flex items-center gap-2 pt-4'>
                    <Button type='submit' disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save
                    </Button>
                    <Button type='button' variant='outline' onClick={() => form.reset()}>
                        Clear
                    </Button>
                </div>
            </form>
        </Form>
    );
}
