'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useLeaveBalanceByEmployeeId, useSaveAdminEmployeeLeaveApplication } from '@/hooks/hrms/leave-management/useOnlineAdminLeave';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, differenceInDays } from 'date-fns';
import {
    CalendarIcon,
    Clock,
    Info,
    FileText,
    ArrowRight,
} from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { OnlineAdminLeaveApplication } from '@/types/hrms/leave-management/online-admin-leave';

const formSchema = z.object({
    hrmE_Id: z.coerce.number().min(1, 'Employee is required'),
    hrmL_Id: z.coerce.number().min(1, 'Leave type is required'),
    fromDate: z.date({ required_error: 'From date is required' }),
    toDate: z.date({ required_error: 'To date is required' }),
    totalDays: z.coerce.number().min(0.5, 'Total days must be at least 0.5'),
    leaveReason: z.string().min(1, 'Reason is required'),
    reportingDate: z.date({ required_error: 'Reporting date is required' }),
    supportingDocument: z.string().optional(),
    contactNoOnLeave: z.string().min(10, 'Valid contact number is required')
}).refine((data) => data.toDate >= data.fromDate, {
    message: "To Date cannot be before From Date",
    path: ["toDate"]
});

type FormValues = z.infer<typeof formSchema>;

interface ApplyLeaveFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    editingRow?: OnlineAdminLeaveApplication | null;
    selectedEmployeeId: number | null;
    selectedLeave?: any | null;
    selectedFromDate?: Date;
    selectedToDate?: Date;
    totalDays?: number;
}

export default function ApplyLeaveForm({
    onSuccess,
    onCancel,
    editingRow,
    selectedEmployeeId,
    selectedLeave,
    selectedFromDate,
    selectedToDate,
    totalDays
}: ApplyLeaveFormProps) {
    const { mutate: saveLeave, isPending } = useSaveAdminEmployeeLeaveApplication();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hrmE_Id: selectedEmployeeId || 0,
            hrmL_Id: 0,
            totalDays: 1,
            leaveReason: '',
            reportingDate: new Date(),
            supportingDocument: '',
            contactNoOnLeave: ''
        }
    });

    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const hrmL_Id = form.watch('hrmL_Id');
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const fromDate = form.watch('fromDate');
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const toDate = form.watch('toDate');

    // Sync hrmE_Id with selectedEmployeeId
    useEffect(() => {
        if (selectedEmployeeId) {
            form.setValue('hrmE_Id', selectedEmployeeId);
        }
    }, [selectedEmployeeId, form]);

    // Sync with selectedLeave and Picked Dates from Parent
    useEffect(() => {
        if (selectedLeave) {
            form.setValue('hrmL_Id', selectedLeave.hrmL_Id);
            form.setValue('reportingDate', new Date());
        }
    }, [selectedLeave, form]);

    useEffect(() => {
        if (selectedFromDate) form.setValue('fromDate', selectedFromDate);
    }, [selectedFromDate, form]);

    useEffect(() => {
        if (selectedToDate) form.setValue('toDate', selectedToDate);
    }, [selectedToDate, form]);

    useEffect(() => {
        if (totalDays !== undefined) form.setValue('totalDays', totalDays);
    }, [totalDays, form]);

    useEffect(() => {
        if (editingRow) {
            form.reset({
                hrmE_Id: selectedEmployeeId || 0,
                hrmL_Id: editingRow.hrmL_Id,
                fromDate: new Date(editingRow.hrelaP_FromDate),
                toDate: new Date(editingRow.hrelaP_ToDate),
                totalDays: editingRow.hreltD_TotDays,
                leaveReason: editingRow.hrelaP_LeaveReason,
                reportingDate: new Date(),
                supportingDocument: editingRow.hrelaP_SupportingDocument,
                contactNoOnLeave: ''
            });
        }
    }, [editingRow, form, selectedEmployeeId]);

    function onSubmit(values: FormValues) {
        saveLeave(
            {
                HRME_Id: values.hrmE_Id,
                HRELT_Reportingdate: values.reportingDate.toISOString(),
                HRELT_LeaveReason: values.leaveReason,
                HRELT_SupportingDocument: values.supportingDocument || '',
                HRELT_ContactNoOnLeave: values.contactNoOnLeave,
                frmToDates: [
                    {
                        HRELAP_FromDate: values.fromDate.toISOString(),
                        HRELAP_ToDate: values.toDate.toISOString(),
                        HRELAP_TotalDays: values.totalDays
                    }
                ],
                temp_table_data: [
                    {
                        HRML_Id: values.hrmL_Id
                    }
                ]
            },
            {
                onSuccess: () => {
                    form.reset({
                        hrmE_Id: selectedEmployeeId || 0,
                        hrmL_Id: 0,
                        totalDays: 1,
                        leaveReason: '',
                        reportingDate: new Date(),
                        fromDate: undefined,
                        toDate: undefined,
                        supportingDocument: '',
                        contactNoOnLeave: ''
                    });
                    onSuccess?.();
                }
            }
        );
    }

    return (
        <div className='p-6 pt-0 space-y-8 animate-in slide-in-from-top-2 duration-300'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>

                    {/* Middle Row: Details */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6'>
                        <FormField
                            control={form.control}
                            name='leaveReason'
                            render={({ field }) => (
                                <FormItem>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <FormLabel className='text-[10px] font-black text-slate-500 uppercase tracking-wider'>Reasons for Leave: <span className='text-red-500'>*</span></FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input className='h-11 border-sky-100 focus:ring-sky-100 rounded-xl bg-white shadow-sm' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='contactNoOnLeave'
                            render={({ field }) => (
                                <FormItem>
                                    <div className='flex items-center gap-1 mb-1'>
                                        <FormLabel className='text-[10px] font-black text-slate-500 uppercase tracking-wider'>Contact Number While on Leave: <span className='text-red-500'>*</span></FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input className='h-7 border-sky-100 focus:ring-sky-100 rounded-xl bg-white shadow-sm' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='reportingDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block'>Date Reporting Back</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant='outline' className={cn('w-full h-11 text-left font-normal border-slate-200 rounded-xl bg-white', !field.value && 'text-muted-foreground')}>
                                                    <CalendarIcon className='mr-2 h-4 w-4 text-slate-400' />
                                                    {field.value ? format(field.value, 'dd-MM-yyyy') : '01-03-2025'}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem className='flex flex-col justify-end pb-0.5'>
                            <FormControl>
                                <div className='relative w-full'>
                                    <Input
                                        type='file'
                                        className='absolute inset-0 opacity-0 cursor-pointer z-10'
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                form.setValue('supportingDocument', file.name);
                                            }
                                        }}
                                    />
                                    <Button
                                        type='button'
                                        variant='outline'
                                        className='w-full h-11 bg-amber-400 hover:bg-amber-500 text-slate-900 border-none font-bold flex items-center justify-center gap-2 rounded-xl shadow-sm uppercase text-[10px]'
                                    >
                                        <FileText className='h-4 w-4' /> Choose File
                                    </Button>
                                    {form.watch('supportingDocument') && (
                                        <span className='absolute -bottom-5 left-0 text-[10px] text-slate-400 italic truncate w-full'>
                                            {form.watch('supportingDocument')}
                                        </span>
                                    )}
                                </div>
                            </FormControl>
                        </FormItem>
                    </div>

                    {/* Bottom Actions Cluster */}
                    <div className='pt-8 flex flex-col items-center gap-6'>
                        <div className='flex items-center gap-4'>
                            <Button
                                type='submit'
                                disabled={isPending || !selectedEmployeeId}
                                className='bg-orange-500 hover:bg-orange-600 text-white font-black h-12 px-16 rounded-full shadow-xl shadow-orange-200 flex items-center gap-3 uppercase text-sm transition-all active:scale-95'
                            >
                                APPLY LEAVE NOW <ArrowRight className='h-5 w-5' />
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='text-slate-400 font-bold h-12 px-10 rounded-full border-slate-200 flex items-center gap-2 uppercase text-xs transition-all hover:bg-slate-50 hover:text-slate-600'
                                onClick={() => {
                                    form.reset();
                                    onCancel?.();
                                }}
                            >
                                <span className='text-xl leading-none'>×</span> CANCEL
                            </Button>
                        </div>

                        <p className='text-[10px] text-slate-400 font-medium tracking-widest uppercase opacity-60'>
                            This will directly update the employee's leave records as an administrator action.
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    );
}
