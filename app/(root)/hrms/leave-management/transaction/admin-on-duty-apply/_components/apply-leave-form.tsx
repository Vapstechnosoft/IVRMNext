'use client';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEmployeeOnDutyDetails, useSaveOnDutyLeaveRequest } from '@/hooks/hrms/leave-management/useAdminOnDutyApply';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    hrmE_Id: z.coerce.number().min(1, 'Employee is required'),
    leaveType: z.string().min(1, 'Leave type is required'),
    fromDate: z.date({ required_error: 'From date is required' }),
    toDate: z.date({ required_error: 'To date is required' }),
    totalDays: z.coerce.number().min(0.5, 'Total days must be at least 0.5'),
    leaveReason: z.string().min(1, 'Reason is required'),
    inTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    outTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
});

type FormValues = z.infer<typeof formSchema>;

interface ApplyLeaveFormProps {
    onSuccess?: () => void;
}

export default function ApplyLeaveForm({ onSuccess }: ApplyLeaveFormProps) {
    const { mutate: saveLeave, isPending } = useSaveOnDutyLeaveRequest();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hrmE_Id: 0,
            leaveType: 'OD',
            totalDays: 1,
            leaveReason: '',
            inTime: '10:00',
            outTime: '17:00'
        }
    });

    const hrmE_Id = form.watch('hrmE_Id');
    const debouncedHrmE_Id = hrmE_Id > 0 ? hrmE_Id : null; // Simple check to avoid request for 0
    const { data: employeeData } = useEmployeeOnDutyDetails(debouncedHrmE_Id);

    function onSubmit(values: FormValues) {
        saveLeave(
            {
                HRME_Id: values.hrmE_Id,
                HRML_LeaveType: values.leaveType,
                HRELAP_FromDate: format(values.fromDate, 'yyyy-MM-dd'),
                HRELAP_ToDate: format(values.toDate, 'yyyy-MM-dd'),
                HRELAP_TotalDays: values.totalDays,
                HRELAP_LeaveReason: values.leaveReason,
                HRELAPD_InTime: values.inTime,
                HRELAPD_OutTime: values.outTime
            },
            {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                }
            }
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 rounded-md border p-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='hrmE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employee ID</FormLabel>
                                <FormControl>
                                    <div className='relative'>
                                        <UserIcon className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                        <Input
                                            type='number'
                                            placeholder='Enter Employee ID'
                                            className='pl-9'
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='leaveType'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Leave Type</FormLabel>
                                <FormControl>
                                    <Input placeholder='OD' {...field} readOnly />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {employeeData && (
                    <div className='rounded-lg border bg-muted/50 p-4'>
                        <h4 className='mb-2 font-medium text-sm'>Employee Details</h4>
                        <div className='grid gap-2 text-sm md:grid-cols-2'>
                            <div className='flex gap-2'>
                                <span className='text-muted-foreground'>Name:</span>
                                <span className='font-medium'>{employeeData.employeeDetails.name}</span>
                            </div>
                            <div className='flex gap-2'>
                                <span className='text-muted-foreground'>Designation:</span>
                                <span className='font-medium'>{employeeData.employeeDetails.designation}</span>
                            </div>
                            <div className='flex gap-2'>
                                <span className='text-muted-foreground'>Department:</span>
                                <span className='font-medium'>{employeeData.employeeDetails.email}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className='grid gap-4 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='fromDate'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>From Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, 'yyyy-MM-dd')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date('1900-01-01')
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='toDate'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>To Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, 'yyyy-MM-dd')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date('1900-01-01')
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid gap-4 md:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='totalDays'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Days</FormLabel>
                                <FormControl>
                                    <Input type='number' step='0.5' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='inTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>In Time</FormLabel>
                                <FormControl>
                                    <Input type='time' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='outTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Out Time</FormLabel>
                                <FormControl>
                                    <Input type='time' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name='leaveReason'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reason</FormLabel>
                            <FormControl>
                                <Input placeholder='Enter reason for leave' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='flex justify-end'>
                    <Button type='submit' disabled={isPending}>
                        {isPending ? 'Submitting...' : 'Apply Leave'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
