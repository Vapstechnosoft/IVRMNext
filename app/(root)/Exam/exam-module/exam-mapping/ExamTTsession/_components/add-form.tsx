import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useExamTTSession } from '@/hooks/exam/exammodule/exam-mapping';
import { addOrUpdateExamTTSession } from '@/server/exam/exam-module/exam-mapping/exam-tt-session';
import type { IExamTTSession } from '@/types/exam/exam-module/exam-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    ettS_SessionName: z.string().min(1, { message: 'Session Name is required' }),
    ettS_StartTime: z.string().min(1, { message: 'Start Time is required' }),
    ettS_EndTime: z.string().min(1, { message: 'End Time is required' })
});

export default function AddExamTTSessionForm({
    onSuccess,
    rowData
}: {
    onSuccess?: () => void;
    rowData?: IExamTTSession;
}) {
    const [isPending, startTransition] = useTransition();
    const { refetchAll } = useExamTTSession();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ettS_SessionName: '',
            ettS_StartTime: '',
            ettS_EndTime: ''
        }
    });

    useEffect(() => {
        if (rowData) {
            // Convert time from h:mm a or h:mm:ss to HH:mm for the input type="time"
            const formatTimeForInput = (timeStr: string) => {
                if (!timeStr) return '';
                // If it's already HH:mm, return it
                if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

                // Try to parse it and convert to HH:mm
                try {
                    const match = timeStr.match(/(\d+):(\d+)\s?(AM|PM|am|pm)?/i);
                    if (match) {
                        let hours = Number.parseInt(match[1], 10);
                        const minutes = match[2];
                        const ampm = match[3]?.toUpperCase();

                        if (ampm === 'PM' && hours < 12) hours += 12;
                        if (ampm === 'AM' && hours === 12) hours = 0;

                        return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
                    }
                    return timeStr; // fallback
                } catch (_e) {
                    return timeStr;
                }
            };

            form.reset({
                ettS_SessionName: rowData.ettS_SessionName || '',
                ettS_StartTime: formatTimeForInput(rowData.ettS_StartTime),
                ettS_EndTime: formatTimeForInput(rowData.ettS_EndTime)
            });
        }
    }, [rowData, form]);

    function formatTimeForApi(timeStr: string) {
        if (!timeStr) return timeStr;
        // Assume timeStr is "HH:mm" from input type="time", convert to "h:mm a"
        try {
            const [h, m] = timeStr.split(':');
            let hours = Number.parseInt(h, 10);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            return `${hours}:${m} ${ampm}`;
        } catch (_e) {
            return timeStr;
        }
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                const dataToSave = {
                    ettS_Id: rowData ? rowData.ettS_Id : 0,
                    ettS_SessionName: values.ettS_SessionName,
                    ettS_StartTime: formatTimeForApi(values.ettS_StartTime),
                    ettS_EndTime: formatTimeForApi(values.ettS_EndTime),
                    ettS_Activeflag: rowData ? rowData.ettS_Activeflag : true
                };

                const response = await addOrUpdateExamTTSession(dataToSave);

                if (response?.success) {
                    toast.success(rowData ? 'Session Updated Successfully' : 'Session Added Successfully');
                    form.reset();
                    refetchAll();
                    if (onSuccess) onSuccess();
                } else {
                    toast.error(response.message || 'Failed to save session');
                }
            } catch (_error) {
                toast.error('An error occurred while saving the session');
            }
        });
    }

    return (
        <Card className='rounded-sm shadow-none'>
            <CardContent className='pt-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <FormField
                                control={form.control}
                                name='ettS_SessionName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-muted-foreground'>
                                            Session Name <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='Enter Session Name' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='ettS_StartTime'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-muted-foreground'>
                                            Start Time <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type='time' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='ettS_EndTime'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-muted-foreground'>
                                            End Time <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type='time' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='flex justify-center pt-4'>
                            <Button type='submit' className='w-full sm:w-auto' disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        {rowData ? 'Updating...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className='mr-2 h-4 w-4' />
                                        {rowData ? 'Update' : 'Save'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
