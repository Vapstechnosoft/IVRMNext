'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type IMasterFacility, masterFacilitySchema } from '@/schemas/hostel/masters';
import { saveMasterFacility } from '@/server/hostel/master-facility/masters/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateMasterFacilityFormProps {
    selectedRow: IMasterFacility;
    onSuccess: () => void;
}

export default function UpdateMasterFacilityForm({ selectedRow, onSuccess }: UpdateMasterFacilityFormProps) {
    const form = useForm<IMasterFacility>({
        resolver: zodResolver(masterFacilitySchema),
        defaultValues: {
            ...selectedRow
        }
    });

    const { formState, reset } = form;
    const { isSubmitting } = formState;

    useEffect(() => {
        if (selectedRow) {
            reset({ ...selectedRow });
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: IMasterFacility) => {
        try {
            const result = await saveMasterFacility(data);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to update facility');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-1 gap-4 p-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='hlmftY_FacilityName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Facility Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Facility Name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='hlmftY_FacilityDesc'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Description <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea placeholder='Enter Description' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* File Upload Mock */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='hlmftY_FacilityFileName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Upload File</FormLabel>
                                <FormControl>
                                    <div className='flex items-center gap-2'>
                                        <Input
                                            type='file'
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Mock file upload
                                                    field.onChange(file.name);
                                                    form.setValue('hlmftY_FacilityFilePath', URL.createObjectURL(file));
                                                    toast.success('File uploaded successfully (mock)');
                                                }
                                            }}
                                            className='w-full'
                                        />
                                        {field.value && (
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => {
                                                    field.onChange(null);
                                                    form.setValue('hlmftY_FacilityFilePath', null);
                                                }}
                                                className='text-destructive'>
                                                <X className='h-4 w-4' />
                                            </Button>
                                        )}
                                    </div>
                                </FormControl>
                                {field.value && <p className='text-muted-foreground text-xs'>Selected: {field.value}</p>}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-end pt-4'>
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
}
