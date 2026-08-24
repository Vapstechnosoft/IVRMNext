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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSaveMasterSemester, useEditMasterSemester } from '@/hooks/college/useCollegeMasters';
import { IClgMasterSemester } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const formSchema = z.object({
    AMSE_SEMName: z.string().min(1, 'Please Enter Semester Name')
        .regex(/^[a-zA-Z0-9\s.]+$/, 'Only alphanumeric, space, and dot allowed'),
    AMSE_SEMOrder: z.coerce.number().min(1, 'Please Enter Semester Order').max(99999, 'Maximum 5 digits'),
    AMSE_Year: z.coerce.number().min(1, 'Please Enter Semester Year').max(99999, 'Maximum 5 digits'),
    radioption: z.enum(['General', 'Branch'], { required_error: 'Please Select Radio Button' }),
    AMSE_SEMCode: z.string().min(1, 'Please enter Semester code')
        .regex(/^[A-Za-z0-9\s]+$/, 'Alphanumeric and spaces only'),
    AMSE_SEMInfo: z.string().min(1, 'Please Enter SemesterInfo')
        .regex(/^[A-Za-z0-9\s]+$/, 'Alphanumeric and spaces only'),
    radiodd: z.enum(['Odd', 'Even'], { required_error: 'Please Select Radio Button' })
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdateMasterSemesterForm({ selectedRow, onSuccess }: { selectedRow: IClgMasterSemester, onSuccess: () => void }) {
    const saveMutation = useSaveMasterSemester();
    const editMutation = useEditMasterSemester();
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            AMSE_SEMName: '',
            AMSE_SEMOrder: undefined,
            AMSE_Year: undefined,
            radioption: undefined,
            AMSE_SEMCode: '',
            AMSE_SEMInfo: '',
            radiodd: undefined
        }
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data: any = await editMutation.mutateAsync(selectedRow.amsE_Id);
                const editData = data?.data?.query?.[0];
                if (editData) {
                    form.reset({
                        AMSE_SEMName: editData.amsE_SEMName,
                        AMSE_SEMOrder: editData.amsE_SEMOrder,
                        AMSE_Year: editData.amsE_Year,
                        radioption: editData.amsE_SEMTypeFlag as any,
                        AMSE_SEMCode: editData.amsE_SEMCode,
                        AMSE_SEMInfo: editData.amsE_SEMInfo,
                        radiodd: editData.amsE_EvenOdd as any
                    });
                }
            } catch (error) {
                toast.error('Failed to load details for editing');
                onSuccess();
            } finally {
                setIsLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [selectedRow.amsE_Id]);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            amsE_Id: selectedRow.amsE_Id,
            amsE_SEMName: values.AMSE_SEMName,
            amsE_SEMInfo: values.AMSE_SEMInfo,
            amsE_SEMCode: values.AMSE_SEMCode,
            amsE_SEMTypeFlag: values.radioption,
            amsE_SEMOrder: values.AMSE_SEMOrder,
            amsE_Year: values.AMSE_Year,
            amsE_EvenOdd: values.radiodd
        };

        const promise = saveMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Updating record...',
            success: (data: any) => {
                if (data?.success) {
                    onSuccess();
                    return data?.message || 'Record Updated Successfully';
                }
                throw new Error(data?.message || 'Failed To Update Record');
            },
            error: (err: any) => err.message || 'Something went wrong'
        });
    };

    if (isLoadingDetails) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading details...</span>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='AMSE_SEMName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester Name <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter Semester Name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='AMSE_SEMOrder'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester Order <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder='Enter Semester Order' {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='AMSE_Year'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester Year <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder='Enter Semester Year' {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="radioption"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Semester Type Flag <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="General" />
                                                </FormControl>
                                                <FormLabel className="font-normal">General</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Branch" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Branch</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='AMSE_SEMCode'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester Code <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter Semester Code' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='AMSE_SEMInfo'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester Info <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='Enter Semester Info' rows={3} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="radiodd"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Semester Odd / Even <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Odd" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Odd</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Even" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Even</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
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
                        Clear
                    </Button>
                </div>
            </form>
        </Form>
    );
}
