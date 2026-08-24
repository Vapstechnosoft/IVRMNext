'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSaveMasterSection } from '@/hooks/college/useCollegeMasters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    ACMS_SectionName: z.string().min(1, 'Enter the Section Name').max(40, 'Maximum 40 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Only alphabetic characters allowed'),
    ACMS_Order: z.coerce.number().min(1, 'Enter the Section Order').max(99, 'Maximum 2 digits'),
    ACMS_SectionCode: z.string().min(1, 'Enter the Section Code').max(5, 'Maximum 5 characters')
        .regex(/^[a-zA-Z0-9\s]+$/, 'Alphanumeric and spaces only'),
    ACMS_MaxCapacity: z.coerce.number().min(1, 'Enter the Section Capacity').max(99999, 'Maximum 5 digits'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddMasterSectionForm({ onSuccess }: { onSuccess: () => void }) {
    const saveMutation = useSaveMasterSection();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ACMS_SectionName: '',
            ACMS_Order: undefined,
            ACMS_SectionCode: '',
            ACMS_MaxCapacity: undefined,
        }
    });

    const onSubmit = async (values: FormValues) => {
        const payload = {
            acmS_Id: 0,
            acmS_SectionName: values.ACMS_SectionName,
            acmS_SectionCode: values.ACMS_SectionCode,
            acmS_Order: values.ACMS_Order,
            acmS_MaxCapacity: values.ACMS_MaxCapacity
        };

        const promise = saveMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Saving record...',
            success: (data: any) => {
                if (data?.success) {
                    onSuccess();
                    return data?.message || 'Record Saved Successfully';
                }
                throw new Error(data?.message || 'Failed To Save Record');
            },
            error: (err: any) => err.message || 'Something went wrong'
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                        control={form.control}
                        name='ACMS_SectionName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section Name <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Section Name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='ACMS_Order'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section Order <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder='Enter Section Order' {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='ACMS_SectionCode'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section Code <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Section Code' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='ACMS_MaxCapacity'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section Capacity <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder='Enter Section Capacity' {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <div className='flex justify-center gap-4 mt-6'>
                    <Button type='submit' disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save
                    </Button>
                    <Button type='button' variant='destructive' onClick={() => {
                        form.reset();
                        onSuccess();
                    }} disabled={saveMutation.isPending}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
