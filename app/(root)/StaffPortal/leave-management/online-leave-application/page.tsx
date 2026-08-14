
'use client';

import {
    useOnlineLeave
} from '@/hooks/staff-portal/useOnlineLeave';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Button } from '@/components/ui/button';
import { Info, CalendarIcon, ArrowRight, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import ApplyLeaveForm from './_components/leave-application-form';
import LeaveHistoryTable from './_components/leave-history-table';

const InfoField = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-slate-700">{value || '---'}</span>
    </div>
);

export default function OnlineLeavePage() {
    const {
        initialData,
        masterLeaveData,
        historyData,
        combinedBalanceData,
        isLoading,
        applyMutation,
        // Card States
        selectedLeave,
        setSelectedLeave,
        selectedFromDate,
        setSelectedFromDate,
        selectedToDate,
        setSelectedToDate,
        isHalfDay,
        setIsHalfDay,
        currentTotalDays
    } = useOnlineLeave();

    const employee = initialData?.employeeDetails?.[0];

    // Grid 1 Columns (Balance with Dates)
    const balanceColumns: ColumnDef<any>[] = [
        {
            id: 'select',
            header: '',
            cell: ({ row }) => {
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                return (
                    <div
                        className={cn(
                            'flex items-center justify-center p-1',
                            isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
                        )}
                        onClick={() => {
                            if (isDisabled) return;
                            setSelectedLeave(row.original);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            setSelectedFromDate(today);
                            setSelectedToDate(today);
                            setIsHalfDay(false);
                        }}
                    >
                        <div className={cn(
                            'h-4 w-4 rounded-full border-2 transition-all flex items-center justify-center',
                            selectedLeave?.hrmL_Id === row.original.hrmL_Id ? 'border-primary bg-primary' : 'border-slate-300'
                        )}>
                            {selectedLeave?.hrmL_Id === row.original.hrmL_Id && (
                                <div className='h-1.5 w-1.5 rounded-full bg-white' />
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'S.NO',
            cell: ({ row }) => {
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                return (
                    <div
                        className={cn(
                            'font-mono text-xs',
                            isDisabled ? 'cursor-not-allowed opacity-30 text-slate-400' : 'cursor-pointer text-slate-700'
                        )}
                        onClick={() => {
                            if (isDisabled) return;
                            setSelectedLeave(row.original);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            setSelectedFromDate(today);
                            setSelectedToDate(today);
                            setIsHalfDay(false);
                        }}
                    >
                        {row.index + 1}
                    </div>
                );
            }
        },
        {
            accessorKey: 'hrmL_LeaveName',
            header: 'LEAVE TYPE',
            cell: ({ row }) => {
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                return (
                    <span
                        className={cn(
                            'font-bold transition-colors',
                            isDisabled ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-slate-700 cursor-pointer hover:text-primary'
                        )}
                        onClick={() => {
                            if (isDisabled) return;
                            setSelectedLeave(row.original);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            setSelectedFromDate(today);
                            setSelectedToDate(today);
                            setIsHalfDay(false);
                        }}
                    >
                        {row.getValue('hrmL_LeaveName')}
                    </span>
                );
            }
        },
        {
            accessorKey: 'hrelS_TotalLeaves',
            header: 'TOTAL',
            cell: ({ row }) => <span className='font-black text-slate-500'>{row.getValue('hrelS_TotalLeaves')}</span>
        },
        {
            accessorKey: 'hrelS_CBLeaves',
            header: 'BALANCE',
            cell: ({ row }) => <span className='text-green-600 font-black'>{row.getValue('hrelS_CBLeaves')}</span>
        },
        {
            accessorKey: 'latestFromDate',
            header: 'FROM DATE',
            cell: ({ row }) => {
                const isSelected = selectedLeave?.hrmL_Id === row.original.hrmL_Id;
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                const activeDate = isSelected ? selectedFromDate : undefined;

                return (
                    <div className={cn('flex items-center gap-2 w-max', isDisabled && 'opacity-30 cursor-not-allowed')}>
                        <span className={cn('font-medium text-[11px]', isSelected ? 'text-primary font-black' : 'text-slate-600')}>
                            {activeDate ? format(activeDate, 'dd-MM-yyyy') : '-- -- ----'}
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    disabled={isDisabled}
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-all p-0'
                                >
                                    <CalendarIcon className='h-3 w-3' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start' side='bottom'>
                                <Calendar
                                    mode='single'
                                    selected={activeDate}
                                    onSelect={(date) => {
                                        setSelectedLeave(row.original);
                                        setSelectedFromDate(date);
                                        // Reset toDate if it's before the new fromDate
                                        if (selectedToDate && date && date > selectedToDate) {
                                            setSelectedToDate(date);
                                        }
                                        setIsHalfDay(false);
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const balance = Number(row.original.hrelS_CBLeaves) || 0;
                                        const maxDate = new Date(today);
                                        maxDate.setDate(today.getDate() + Math.max(0, Math.ceil(balance) - 1));

                                        return date < today; // Adjust logic if past dates are allowed
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                );
            }
        },
        {
            accessorKey: 'latestToDate',
            header: 'TO DATE',
            cell: ({ row }) => {
                const isSelected = selectedLeave?.hrmL_Id === row.original.hrmL_Id;
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                const activeDate = isSelected ? selectedToDate : undefined;

                return (
                    <div className={cn('flex items-center gap-2 w-max', isDisabled && 'opacity-30 cursor-not-allowed')}>
                        <span className={cn('font-medium text-[11px]', isSelected ? 'text-primary font-black' : 'text-slate-600')}>
                            {activeDate ? format(activeDate, 'dd-MM-yyyy') : '-- -- ----'}
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    disabled={isDisabled}
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-all p-0'
                                >
                                    <CalendarIcon className='h-3 w-3' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start' side='bottom'>
                                <Calendar
                                    mode='single'
                                    selected={activeDate}
                                    onSelect={(date) => {
                                        setSelectedLeave(row.original);
                                        setSelectedToDate(date);
                                        setIsHalfDay(false);
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const balance = Number(row.original.hrelS_CBLeaves) || 0;
                                        const maxDate = new Date(today);
                                        maxDate.setDate(today.getDate() + Math.max(0, Math.ceil(balance) - 1));

                                        // ToDate cannot be before selected FromDate (or Today if not selected)
                                        const minDate = (isSelected && selectedFromDate) ? new Date(selectedFromDate) : today;
                                        minDate.setHours(0, 0, 0, 0);

                                        return date < minDate;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                );
            }
        },
        {
            accessorKey: 'latestTotDays',
            header: 'TOTAL DAYS',
            cell: ({ row }) => {
                const isSelected = selectedLeave?.hrmL_Id === row.original.hrmL_Id;

                if (!isSelected) {
                    return <span className='text-slate-300'>---</span>;
                }

                let days = 0;
                if (selectedFromDate && selectedToDate) {
                    days = differenceInDays(selectedToDate, selectedFromDate) + 1;
                }

                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                const displayDays = isHalfDay ? Math.max(0, days - 0.5) : days;

                return (
                    <div className={cn("flex items-center gap-3 w-max", isDisabled && "opacity-30 cursor-not-allowed")}>
                        <Input
                            readOnly
                            disabled={isDisabled}
                            value={displayDays || ''}
                            className="w-16 h-8 text-xs font-bold text-center bg-white"
                        />
                        <div className="flex items-center space-x-1.5">
                            <Checkbox
                                id={`half-day-${row.original.hrmL_Id}`}
                                disabled={isDisabled}
                                checked={isHalfDay && isSelected}
                                onCheckedChange={(checked) => setIsHalfDay(checked === true)}
                            />
                            <label
                                htmlFor={`half-day-${row.original.hrmL_Id}`}
                                className={cn(
                                    "text-xs font-medium whitespace-nowrap",
                                    isDisabled ? "cursor-not-allowed text-slate-400" : "cursor-pointer text-slate-700"
                                )}
                            >
                                Half day
                            </label>
                        </div>
                    </div>
                );
            }
        }
    ];

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary tracking-tight">Online Leave Application</h1>
            </div>

            <div className='grid grid-cols-1 gap-6'>
                {/* 1. Employee Info Section */}
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl">
                    <CardHeader className="bg-primary/5 border-b border-white/20">
                        <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-primary">
                            <ClipboardList className="h-4 w-4" />
                            Employee Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                            <InfoField label="Employee Name" value={employee?.hrmE_EmployeeName} />
                            <InfoField label="Designation" value={employee?.hrmdeS_DesignationName} />
                            <InfoField label="DOJ" value={employee?.hrmE_DOJ ? format(new Date(employee.hrmE_DOJ), 'dd-MM-yyyy') : ''} />
                            <InfoField label="Email" value={employee?.hrmE_EmailId} />
                            <InfoField label="Phone" value={employee?.hrmE_MobileNo} />
                        </div>
                    </CardContent>
                </Card>
                {/* Integrated Leave Balance & Application Card */}
                <Card className='border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white'>
                    <CardHeader className='pb-4 border-b bg-slate-50/50'>
                        <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                                <CardTitle className='text-base font-bold flex items-center gap-2 text-slate-800'>
                                    <Info className='h-4 w-4 text-primary' />
                                    Leave Details
                                </CardTitle>
                                <CardDescription className='text-xs'>Current leave balance status</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className='p-0'>
                        {/* Balance Grid */}
                        <div className='border-b border-slate-100'>
                            <GenericDataTable
                                columns={balanceColumns}
                                isLoading={isLoading}
                                data={combinedBalanceData}
                                totalItems={combinedBalanceData.length}
                                success={true}
                                loadingMessage='Loading balance...'
                                noDataTitle='No Balance Found'
                                isPaginationRequired={false}
                                isSearchRequired={false}
                            />
                        </div>

                        {/* Selection Banner */}
                        <div className='px-6 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100'>
                            {selectedLeave ? (
                                <div className='flex items-center gap-4 animate-in slide-in-from-top-1 duration-200'>
                                    <Badge variant='outline' className='bg-primary text-white border-none text-[9px] font-black px-3 py-1 rounded-full uppercase'>SELECTED</Badge>
                                    <div className='flex flex-col'>
                                        <span className='text-xs font-black text-slate-800 uppercase'>{selectedLeave.hrmL_LeaveName}</span>
                                        <span className='text-[10px] text-slate-400 font-bold'>
                                            {selectedFromDate && selectedToDate
                                                ? `${format(selectedFromDate, 'dd MMM')} → ${format(selectedToDate, 'dd MMM')} (${currentTotalDays} Days)`
                                                : 'Please select dates in the grid above'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className='flex items-center gap-2 text-slate-300 italic'>
                                    <Info className='h-4 w-4' />
                                    <span className='text-[10px] font-bold uppercase tracking-widest'>Select a leave row and dates in the grid above</span>
                                </div>
                            )}
                            {selectedLeave && (
                                <Button
                                    variant='ghost'
                                    className='h-7 text-[10px] font-black text-primary hover:bg-primary/10 rounded-full px-4 uppercase'
                                    onClick={() => {
                                        setSelectedLeave(null);
                                        setSelectedFromDate(undefined);
                                        setSelectedToDate(undefined);
                                    }}
                                >
                                    Clear Selection
                                </Button>
                            )}
                        </div>

                        {/* Application Form Integrated Below Grid */}
                        <div className='mt-8 pb-4'>
                            <ApplyLeaveForm
                                employeeId={employee?.hrmE_Id}
                                selectedLeave={selectedLeave}
                                selectedFromDate={selectedFromDate}
                                selectedToDate={selectedToDate}
                                totalDays={currentTotalDays}
                                isHalfDay={isHalfDay}
                                setIsHalfDay={setIsHalfDay}
                                onSuccess={() => {
                                    setSelectedLeave(null);
                                    setSelectedFromDate(undefined);
                                    setSelectedToDate(undefined);
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leave History Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-slate-800">Leave History</h2>
                </div>
                <LeaveHistoryTable historyData={historyData} />
            </div>
        </div>
    );
}
