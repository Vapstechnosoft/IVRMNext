// Refactored by automation script on 2025-10-28T15:40:35.778Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/apply-leave-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LeaveBalanceRow {
    leaveType: string;
    balance: number;
}

interface LeaveHistoryRow {
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    status: 'Applied' | 'Approved' | 'Rejected';
}

interface ApplyLeaveForm {
    employeeName: string;
    designation: string;
    doj: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    numDays: number;
    reason: string;
}

const defaultEmployee = {
    name: 'R Siddesh Kumar',
    designation: 'Sr. HR Executive',
    doj: '2020-01-01'
};

export default function ApplyLeavePage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [balances, setBalances] = useState<LeaveBalanceRow[]>([]);
    const [history, setHistory] = useState<LeaveHistoryRow[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<ApplyLeaveForm>({
        defaultValues: {
            employeeName: defaultEmployee.name,
            designation: defaultEmployee.designation,
            doj: defaultEmployee.doj,
            leaveType: '',
            fromDate: '',
            toDate: '',
            numDays: 0,
            reason: ''
        }
    });

    // Seed demo data
    useEffect(() => {
        setBalances([
            { leaveType: 'Casual Leave', balance: 8 },
            { leaveType: 'Sick Leave', balance: 6 },
            { leaveType: 'Earned Leave', balance: 12 }
        ]);
        setHistory([{ leaveType: 'Sick Leave', fromDate: '2025-01-03', toDate: '2025-01-04', days: 2, status: 'Approved' }]);
    }, []);

    // Auto-calc number of days and validate date sequence + not past
    const fromDate = watch('fromDate');
    const toDate = watch('toDate');
    useEffect(() => {
        if (!fromDate || !toDate) {
            setValue('numDays', 0);
            return;
        }
        const start = new Date(fromDate);
        const end = new Date(toDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            setValue('numDays', 0);
            return;
        }
        if (end < start) {
            setValue('numDays', 0);
            return;
        }
        const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setValue('numDays', diff);
    }, [fromDate, toDate, setValue]);

    const todayISO = new Date().toISOString().slice(0, 10);

    const onSubmit = (data: ApplyLeaveForm) => {
        // Validate dates are not in the past
        if (data.fromDate < todayISO || data.toDate < todayISO) {
            toast.error('Dates cannot be in the past');
            return;
        }
        if (new Date(data.toDate) < new Date(data.fromDate)) {
            toast.error('To Date cannot be before From Date');
            return;
        }
        if (!data.leaveType) {
            toast.error('Please select Leave Type');
            return;
        }
        if (!data.reason.trim()) {
            toast.error('Reason is required');
            return;
        }

        // Persist mock history
        setHistory((prev) => [
            ...prev,
            { leaveType: data.leaveType, fromDate: data.fromDate, toDate: data.toDate, days: data.numDays, status: 'Applied' }
        ]);
        toast.success('Leave application submitted');
        setIsFormOpen(false);
        reset({
            employeeName: defaultEmployee.name,
            designation: defaultEmployee.designation,
            doj: defaultEmployee.doj,
            leaveType: '',
            fromDate: '',
            toDate: '',
            numDays: 0,
            reason: ''
        });
    };

    const balanceColumns = useMemo(
        () => [
            { accessorKey: 'leaveType', header: 'Leave Type' },
            { accessorKey: 'balance', header: 'Balance' }
        ],
        []
    );

    const historyColumns = useMemo(
        () => [
            { accessorKey: 'leaveType', header: 'Leave Type' },
            { accessorKey: 'fromDate', header: 'From Date' },
            { accessorKey: 'toDate', header: 'To Date' },
            { accessorKey: 'days', header: 'Days' },
            { accessorKey: 'status', header: 'Status' }
        ],
        []
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Online Leave Application' description='' />
                    </div>
                    <Button onClick={() => setIsFormOpen(true)}>Apply Leave</Button>
                </div>

                {/* Employee Leave Details (table-first) */}
                <CollapsibleSection
                    title='Employee Leave Details'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div>
                            <h3 className='mb-2 font-semibold text-sm'>Current Balances</h3>
                            <GenericDataTable data={balances} columns={balanceColumns} totalItems={balances.length} isLoading={false} />
                        </div>
                        <div>
                            <h3 className='mb-2 font-semibold text-sm'>Past Applications</h3>
                            <GenericDataTable data={history} columns={historyColumns} totalItems={history.length} isLoading={false} />
                        </div>
                    </div>
                </CollapsibleSection>

                {isFormOpen && (
                    <CollapsibleSection
                        title='Apply for Leave'
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                            {/* Read-only employee details */}
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                <div>
                                    <label htmlFor='employee-name-input' className='font-medium text-sm'>
                                        Employee Name
                                    </label>
                                    <InputText id='employee-name-input' readOnly {...register('employeeName')} />
                                </div>
                                <div>
                                    <label htmlFor='designation-input' className='font-medium text-sm'>
                                        Designation
                                    </label>
                                    <InputText id='designation-input' readOnly {...register('designation')} />
                                </div>
                                <div>
                                    <label htmlFor='doj-input' className='font-medium text-sm'>
                                        DOJ
                                    </label>
                                    <InputText id='doj-input' type='date' readOnly {...register('doj')} />
                                </div>
                            </div>

                            {/* Leave inputs */}
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                <div>
                                    <label htmlFor='leave-type-select' className='font-medium text-sm'>
                                        Leave Type *
                                    </label>
                                    <Select value={watch('leaveType')} onValueChange={(v) => setValue('leaveType', v)}>
                                        <SelectTrigger id='leave-type-select'>
                                            <SelectValue placeholder='Select Leave Type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                            <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                            <SelectItem value='Earned Leave'>Earned Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.leaveType && <p className='mt-1 text-red-500 text-xs'>Leave Type is required</p>}
                                </div>
                                <div>
                                    <label htmlFor='from-date-input' className='font-medium text-sm'>
                                        From Date *
                                    </label>
                                    <InputText
                                        id='from-date-input'
                                        type='date'
                                        {...register('fromDate', { required: true })}
                                        min={todayISO}
                                    />
                                </div>
                                <div>
                                    <label htmlFor='to-date-input' className='font-medium text-sm'>
                                        To Date *
                                    </label>
                                    <InputText id='to-date-input' type='date' {...register('toDate', { required: true })} min={todayISO} />
                                </div>
                                <div>
                                    <label htmlFor='num-days-input' className='font-medium text-sm'>
                                        No. of Days
                                    </label>
                                    <InputText id='num-days-input' readOnly {...register('numDays', { valueAsNumber: true })} />
                                </div>
                                <div className='md:col-span-3'>
                                    <label htmlFor='reason-textarea' className='font-medium text-sm'>
                                        Reason *
                                    </label>
                                    <textarea
                                        id='reason-textarea'
                                        {...(register as any)('reason', { required: true, maxLength: 255 })}
                                        maxLength={255}
                                        placeholder='Enter reason (max 255 chars)'
                                        className='w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className='flex gap-2'>
                                <Button type='submit'>Submit</Button>
                                <Button type='button' variant='outline' onClick={() => setIsFormOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
