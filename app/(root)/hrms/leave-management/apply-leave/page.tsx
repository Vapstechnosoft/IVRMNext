'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ApplyLeaveForm } from './_components/apply-leave-form';
import { leaveBalanceColumns, leaveHistoryColumns, type ApplyLeave, type LeaveBalanceRow, type LeaveHistoryRow } from './_components/columns';

const defaultEmployee = {
    name: 'R Siddesh Kumar',
    designation: 'Sr. HR Executive',
    doj: '2020-01-01'
};

export default function ApplyLeavePage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [balances, setBalances] = useState<LeaveBalanceRow[]>([]);
    const [history, setHistory] = useState<LeaveHistoryRow[]>([]);

    // Seed demo data
    useEffect(() => {
        setBalances([
            { leaveType: 'Casual Leave', balance: 8 },
            { leaveType: 'Sick Leave', balance: 6 },
            { leaveType: 'Earned Leave', balance: 12 }
        ]);
        setHistory([{ leaveType: 'Sick Leave', fromDate: '2025-01-03', toDate: '2025-01-04', days: 2, status: 'Approved' }]);
    }, []);

    const todayISO = new Date().toISOString().slice(0, 10);

    const handleFormSubmit = (data: ApplyLeave) => {
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
    };

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
                            <GenericDataTable data={balances} columns={leaveBalanceColumns} totalItems={balances.length} isLoading={false} />
                        </div>
                        <div>
                            <h3 className='mb-2 font-semibold text-sm'>Past Applications</h3>
                            <GenericDataTable data={history} columns={leaveHistoryColumns} totalItems={history.length} isLoading={false} />
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
                        <ApplyLeaveForm defaultEmployee={defaultEmployee} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
