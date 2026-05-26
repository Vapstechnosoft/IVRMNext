'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOnlineLeave } from '@/hooks/staff-portal/useOnlineLeave';
import { cn } from '@/lib/utils';
import { type OnlineLeaveValues, onlineLeaveSchema } from '@/types/staff-portal/online-leave-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format } from 'date-fns';
import { ArrowRight, CalendarIcon, FileText } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Props {
    selectedLeave: any | null | undefined;
    selectedFromDate: Date | undefined;
    selectedToDate: Date | undefined;
    totalDays: number | undefined;
    isHalfDay: boolean;
    setIsHalfDay: (val: boolean) => void;
    onSuccess?: () => void;
}

const LeaveApplicationForm = ({
    selectedLeave,
    selectedFromDate,
    selectedToDate,
    totalDays,
    isHalfDay,
    setIsHalfDay,
    onSuccess
}: Props) => {
    const { applyMutation } = useOnlineLeave();

    const form = useForm<OnlineLeaveValues>({
        resolver: zodResolver(onlineLeaveSchema),
        defaultValues: {
            leaveType: '',
            reason: '',
            contact: '',
            supportingDocument: '',
            isHalfDay: false
        }
    });

    // Sync with props
    useEffect(() => {
        if (selectedLeave) {
            form.setValue('leaveType', selectedLeave.hrmL_Id.toString());
            form.setValue('reportingDate', new Date());
        }
    }, [selectedLeave, form]);

    useEffect(() => {
        if (selectedFromDate) form.setValue('fromDate', selectedFromDate);
    }, [selectedFromDate, form]);

    useEffect(() => {
        if (selectedToDate) {
            form.setValue('toDate', selectedToDate);
            // Auto-set reporting date to day after toDate
            form.setValue('reportingDate', addDays(selectedToDate, 1));
        }
    }, [selectedToDate, form]);

    useEffect(() => {
        form.setValue('isHalfDay', isHalfDay);
    }, [isHalfDay, form]);

    // Handle form submission
    const onSubmit = (values: OnlineLeaveValues) => {
        if (!selectedLeave) {
            toast.error('Please select a leave type from the grid');
            return;
        }

        const payload = {
            hrelaP_Id: 0,
            hrelaP_ApplicationID: null,
            hrelaP_LeaveReason: values.reason,
            hrelT_LeaveReason: values.reason,
            hrelT_Reportingdate: values.reportingDate.toISOString(),
            hrelT_SupportingDocument: values.supportingDocument || 'leave_doc.pdf',
            asmay_id: 0,
            hrmE_MobileNo: Number(values.contact),
            frmToDates: [
                {
                    hrelaP_FromDate: (selectedFromDate || values.fromDate).toISOString(),
                    hrelaP_ToDate: (selectedToDate || values.toDate).toISOString(),
                    hrelaP_TotalDays: totalDays || 0
                }
            ],
            temp_table_data: [
                {
                    hrmL_Id: selectedLeave.hrmL_Id,
                    hrmL_LeaveName: selectedLeave.hrmL_LeaveName,
                    hrelS_Id: selectedLeave.hrelS_Id || 0,
                    hrelS_CBLeaves: selectedLeave.hrelS_CBLeaves || 0
                }
            ]
        };

        applyMutation.mutate(payload as any, {
            onSuccess: (res: any) => {
                if (res.success) {
                    form.reset({
                        leaveType: '',
                        reason: '',
                        contact: '',
                        supportingDocument: '',
                        isHalfDay: false
                    });
                    onSuccess?.();
                }
            }
        });
    };

    return (
        <div className='slide-in-from-top-2 animate-in space-y-8 px-6 pt-2 pb-6 duration-300'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Form Fields */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        <FormField
                            control={form.control}
                            name='reason'
                            render={({ field }) => (
                                <FormItem>
                                    <div className='mb-1 flex items-center gap-2'>
                                        <FormLabel className='font-black text-[10px] text-slate-500 uppercase tracking-wider'>
                                            Reasons for Leave: <span className='text-red-500'>*</span>
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            className='h-11 rounded-xl border-sky-100 bg-white shadow-sm focus:ring-sky-100'
                                            {...field}
                                            placeholder='Enter reason...'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='contact'
                            render={({ field }) => (
                                <FormItem>
                                    <div className='mb-1 flex items-center gap-1'>
                                        <FormLabel className='font-black text-[10px] text-slate-500 uppercase tracking-wider'>
                                            Contact Number: <span className='text-red-500'>*</span>
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            className='h-11 rounded-xl border-sky-100 bg-white shadow-sm focus:ring-sky-100'
                                            type='text'
                                            maxLength={10}
                                            {...field}
                                            placeholder='10 digit mobile'
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='reportingDate'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <FormLabel className='mb-1 block font-black text-[10px] text-slate-500 uppercase tracking-wider'>
                                        Date Reporting Back: <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    className={cn(
                                                        'h-11 w-full rounded-xl border-slate-200 bg-white text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4 text-slate-400' />
                                                    {field.value ? format(field.value, 'dd-MM-yyyy') : 'Pick a date'}
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

                        <FormField
                            control={form.control}
                            name='supportingDocument'
                            render={({ field }) => (
                                <FormItem className='flex flex-col justify-end'>
                                    <div className='mb-1 flex items-center gap-1'>
                                        <FormLabel className='font-black text-[10px] text-slate-500 uppercase tracking-wider'>
                                            Supporting Document:
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className='relative w-full'>
                                            <Input
                                                type='file'
                                                className='absolute inset-0 z-10 cursor-pointer opacity-0'
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) field.onChange(file.name);
                                                }}
                                            />
                                            <Button
                                                type='button'
                                                variant='outline'
                                                className='flex h-11 w-full items-center justify-center gap-2 rounded-xl border-none bg-amber-400 font-bold text-[10px] text-slate-900 uppercase shadow-sm hover:bg-amber-500'>
                                                <FileText className='h-4 w-4' /> {field.value ? 'Change File' : 'Choose File'}
                                            </Button>
                                            {field.value && (
                                                <span className='-bottom-5 absolute left-0 w-full truncate text-[10px] text-slate-400 italic'>
                                                    {field.value}
                                                </span>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col items-center gap-6 pt-8'>
                        <div className='flex items-center gap-4'>
                            <Button
                                type='submit'
                                disabled={applyMutation.isPending || !selectedLeave}
                                className='flex h-12 items-center gap-3 rounded-full bg-orange-500 px-16 font-black text-sm text-white uppercase shadow-orange-200 shadow-xl transition-all hover:bg-orange-600 active:scale-95'>
                                APPLY LEAVE NOW <ArrowRight className='h-5 w-5' />
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='flex h-12 items-center gap-2 rounded-full border-slate-200 px-10 font-bold text-slate-400 text-xs uppercase transition-all hover:bg-slate-50 hover:text-slate-600'
                                onClick={() => {
                                    form.reset();
                                }}>
                                <span className='text-xl leading-none'>×</span> CANCEL
                            </Button>
                        </div>

                        <p className='font-medium text-[10px] text-slate-400 uppercase tracking-widest opacity-60'>
                            Your application will be sent for approval once submitted.
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default LeaveApplicationForm;
