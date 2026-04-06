'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    useEmployeesDropDown,
    useLeaveHistoryByEmployeeId,
    useLeaveBalanceByEmployeeId
} from '@/hooks/hrms/leave-management/useOnlineAdminLeave';
import { tableSearchVariables } from '@/lib/data-table.config';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useState, useMemo } from 'react';
import ApplyLeaveForm from './_components/apply-leave-form';
import { getOnlineAdminLeaveColumns } from './_components/columns';
import { Button } from '@/components/ui/button';
import { Search, UserCheck, Layers, ClipboardList, Info, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { OnlineAdminLeaveBalance } from '@/types/hrms/leave-management/online-admin-leave';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';

export default function OnlineAdminLeavePage() {
    // Search states for History Grid
    const [searchQuery, setSearchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    // Employee Selection State (URL bound)
    const [selectedEmployeeId, setSelectedEmployeeId] = useQueryState('hrmE_Id', parseAsInteger.withDefault(0));
    const [staffSearch, setStaffSearch] = useState('');

    const { data: employeeList, isLoading: isLoadingEmployees } = useEmployeesDropDown();

    // Memoized filtered employee list for the dropdown
    const filteredEmployeeList = useMemo(() => {
        if (!employeeList) return [];
        if (!staffSearch) return employeeList;
        const lowerSearch = staffSearch.toLowerCase();
        return employeeList.filter(
            (emp) =>
                emp.employeeName.toLowerCase().includes(lowerSearch) ||
                (emp.hrmE_EmployeeCode || '').toLowerCase().includes(lowerSearch) ||
                emp.hrmE_Id.toString().includes(lowerSearch)
        );
    }, [employeeList, staffSearch]);

    // Data for Grids
    const {
        data: leaveBalanceData,
        isLoading: isLoadingBalance,
    } = useLeaveBalanceByEmployeeId(selectedEmployeeId);

    const {
        data: leaveHistoryBatch,
        isLoading: isLoadingHistory,
        refetch: refetchHistory
    } = useLeaveHistoryByEmployeeId(selectedEmployeeId);

    // Unified History Data (Favor dedicated API, fallback to batch data from balance API)
    const effectiveHistory = useMemo(() => {
        if (Array.isArray(leaveHistoryBatch) && leaveHistoryBatch.length > 0) {
            return leaveHistoryBatch;
        }
        if (leaveHistoryBatch && !Array.isArray(leaveHistoryBatch) && Array.isArray((leaveHistoryBatch as any).get_leave_details) && (leaveHistoryBatch as any).get_leave_details.length > 0) {
            return (leaveHistoryBatch as any).get_leave_details;
        }
        if (leaveBalanceData?.get_leave_details && Array.isArray(leaveBalanceData.get_leave_details)) {
            return leaveBalanceData.get_leave_details;
        }
        return [];
    }, [leaveHistoryBatch, leaveBalanceData]);

    const isHistoryLoading = isLoadingHistory;

    // Filtered History Data
    const filteredHistoryData = useMemo(() => {
        if (!effectiveHistory) return [];
        if (!searchQuery) return effectiveHistory;

        const lowerSearch = searchQuery.toLowerCase();

        return effectiveHistory.filter((item: any) => {
            const leaveName = (item.hrmL_LeaveName || '').toLowerCase();
            const reason = (item.hrelaP_LeaveReason || '').toLowerCase();
            const status = (item.hrelaP_ApplicationStatus || '').toLowerCase();

            return leaveName.includes(lowerSearch) ||
                reason.includes(lowerSearch) ||
                status.includes(lowerSearch);
        });
    }, [effectiveHistory, searchQuery]);

    // Combined Data for Grid 1 (Balance + Latest History)
    const combinedBalanceData = useMemo(() => {
        if (!leaveBalanceData?.employeeLeaves) return [];

        return leaveBalanceData.employeeLeaves.map(balance => {
            // Find the most recent history record for this leave type
            const latestHistory = effectiveHistory
                ?.filter((h: any) => h.hrmL_Id === balance.hrmL_Id)
                .sort((a: any, b: any) => new Date(b.hrelaP_FromDate).getTime() - new Date(a.hrelaP_FromDate).getTime())[0];

            return {
                ...balance,
                latestFromDate: latestHistory?.hrelaP_FromDate || null,
                latestToDate: latestHistory?.hrelaP_ToDate || null,
                latestTotDays: latestHistory?.hreltD_TotDays || null
            };
        });
    }, [leaveBalanceData, effectiveHistory]);

    const [selectedLeave, setSelectedLeave] = useState<any>(null);
    const [selectedFromDate, setSelectedFromDate] = useState<Date | undefined>(undefined);
    const [selectedToDate, setSelectedToDate] = useState<Date | undefined>(undefined);
    const [isHalfDay, setIsHalfDay] = useState<boolean>(false);

    // Grid 1 Columns (Balance with Dates)
    const balanceColumns: ColumnDef<any>[] = [
        {
            id: 'select',
            header: '',
            cell: ({ row }) => (
                <div
                    className='flex items-center justify-center p-1 cursor-pointer'
                    onClick={() => {
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
            )
        },
        {
            header: 'SNO',
            cell: ({ row }) => (
                <div
                    className='font-mono text-xs cursor-pointer'
                    onClick={() => {
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
            )
        },
        {
            accessorKey: 'hrmL_LeaveName',
            header: 'LEAVE TYPE',
            cell: ({ row }) => (
                <span
                    className='font-bold text-slate-700 cursor-pointer hover:text-primary transition-colors'
                    onClick={() => {
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
            )
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
                const activeDate = isSelected ? selectedFromDate : undefined;

                return (
                    <div className='flex items-center gap-2 w-max'>
                        <span className={cn('font-medium text-[11px]', isSelected ? 'text-primary font-black' : 'text-slate-600')}>
                            {activeDate ? format(activeDate, 'dd-MM-yyyy') : '-- -- ----'}
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant='ghost' size='icon' className='h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-all p-0'>
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

                                        return date < today || date > maxDate;
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
                const activeDate = isSelected ? selectedToDate : undefined;

                return (
                    <div className='flex items-center gap-2 w-max'>
                        <span className={cn('font-medium text-[11px]', isSelected ? 'text-primary font-black' : 'text-slate-600')}>
                            {activeDate ? format(activeDate, 'dd-MM-yyyy') : '-- -- ----'}
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant='ghost' size='icon' className='h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-all p-0'>
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

                                        return date < minDate || date > maxDate;
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

                const isSingleDay = days === 1;
                const displayDays = (isSingleDay && isHalfDay) ? 0.5 : days;

                return (
                    <div className="flex items-center gap-3 w-max">
                        <Input
                            readOnly
                            value={displayDays || ''}
                            className="w-16 h-8 text-xs font-bold text-center bg-white"
                        />
                        <div className="flex items-center space-x-1.5">
                            <Checkbox
                                id={`half-day-${row.original.hrmL_Id}`}
                                disabled={!isSingleDay}
                                checked={isSingleDay && isHalfDay}
                                onCheckedChange={(checked) => setIsHalfDay(checked === true)}
                            />
                            <label
                                htmlFor={`half-day-${row.original.hrmL_Id}`}
                                className={cn("text-xs font-medium cursor-pointer whitespace-nowrap", !isSingleDay ? "opacity-50 cursor-not-allowed" : "text-slate-700")}
                            >
                                Half day
                            </label>
                        </div>
                    </div>
                );
            }
        }
    ];

    // Grid 2 Columns (History)
    const historyColumns = useMemo(() => getOnlineAdminLeaveColumns({
        onView: (row) => console.log('View', row),
        onDelete: (id) => {
            if (confirm('Are you sure you want to delete this leave application?')) {
                console.log('Delete', id);
            }
        },
        onEdit: () => { } // Edit is disabled in columns.tsx
    }), []);

    // Calculate current selection total days for form
    const currentTotalDays = useMemo(() => {
        if (selectedFromDate && selectedToDate) {
            const days = differenceInDays(selectedToDate, selectedFromDate) + 1;
            if (days === 1 && isHalfDay) {
                return 0.5;
            }
            return days;
        }
        return undefined;
    }, [selectedFromDate, selectedToDate, isHalfDay]);

    return (
        <div className='min-h-screen bg-slate-50/50 p-4 md:p-6'>
            <div className='max-w-[1400px] mx-auto space-y-6'>
                {/* Master Header with Dropdown */}
                <header className='bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6'>
                    <div className='flex items-center gap-4'>
                        <div className='p-3 bg-primary/10 rounded-2xl'>
                            <Layers className='h-7 w-7 text-primary' />
                        </div>
                        <div>
                            <h1 className='text-2xl font-black tracking-tight text-slate-900'>Online Leave Application</h1>
                            <p className='text-sm text-slate-500 font-medium'>Manage employee leaves efficiently</p>
                        </div>
                    </div>

                    <div className='w-full md:w-[400px] space-y-1.5'>
                        <label className='text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1'>Select Employee</label>
                        <Select
                            searchable={false}
                            onValueChange={(value) => {
                                setSelectedEmployeeId(Number(value));
                                setSelectedLeave(null);
                                setSelectedFromDate(undefined);
                                setSelectedToDate(undefined);
                            }}
                            value={selectedEmployeeId && selectedEmployeeId > 0 ? selectedEmployeeId.toString() : ''}
                        >
                            <SelectTrigger className='h-12 border-primary/20 bg-slate-50/50 hover:bg-slate-50 rounded-xl focus:ring-primary/20 transition-all'>
                                <SelectValue placeholder='Search and Select Staff...' />
                            </SelectTrigger>
                            <SelectContent className='max-h-80'>
                                <div className='p-2 sticky top-0 bg-white z-10 border-b mb-1'>
                                    <div className='relative'>
                                        <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                        <Input
                                            placeholder='Type Name or Code...'
                                            className='pl-8 h-9 text-xs border-primary/10 focus-visible:ring-primary/20'
                                            value={staffSearch}
                                            onChange={(e) => setStaffSearch(e.target.value)}
                                            onKeyDown={(e) => { if (e.key !== 'Escape') e.stopPropagation(); }}
                                        />
                                    </div>
                                </div>
                                {isLoadingEmployees ? (
                                    <div className='p-4 text-center text-sm text-slate-400 italic'>Loading staff...</div>
                                ) : filteredEmployeeList.length > 0 ? (
                                    filteredEmployeeList.map((emp) => (
                                        <SelectItem key={emp.hrmE_Id} value={emp.hrmE_Id.toString()} className='py-2.5'>
                                            <div className='flex flex-col'>
                                                <span className='font-bold text-sm'>{emp.employeeName}</span>
                                                <span className='text-[10px] text-slate-400'>Code: {emp.hrmE_EmployeeCode} | ID: {emp.hrmE_Id}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className='p-4 text-center text-sm text-slate-400 italic'>No matching staff found</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </header>

                {selectedEmployeeId ? (
                    <div className='grid grid-cols-1 gap-6 fade-in'>
                        {/* Selected Employee Info */}
                        {leaveBalanceData?.employeeDetails && (
                            <div className='bg-primary/5 border border-primary/10 p-4 rounded-xl flex flex-wrap items-center gap-8 shadow-inner'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-white rounded-lg shadow-sm font-black text-primary text-xs'>NAME</div>
                                    <span className='text-sm font-black text-slate-700'>{leaveBalanceData.employeeDetails.hrmE_EmployeeName}</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-white rounded-lg shadow-sm font-black text-primary text-xs'>CODE</div>
                                    <span className='text-sm font-black text-slate-700'>{leaveBalanceData.employeeDetails.hrmE_EmployeeCode}</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-white rounded-lg shadow-sm font-black text-primary text-xs'>DESIGNATION</div>
                                    <span className='text-sm font-black text-slate-700'>{leaveBalanceData.employeeDetails.hrmdeS_DesignationName}</span>
                                </div>
                            </div>
                        )}

                        <div className='grid grid-cols-1 gap-6'>
                            {/* Integrated Leave Balance & Application Card */}
                            <Card className='border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white'>
                                <CardHeader className='pb-4 border-b bg-slate-50/50'>
                                    <div className='flex items-center justify-between'>
                                        <div className='space-y-1'>
                                            <CardTitle className='text-base font-bold flex items-center gap-2 text-slate-800'>
                                                <Info className='h-4 w-4 text-primary' />
                                                Employee Leave Details
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
                                            isLoading={isLoadingBalance}
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
                                            selectedEmployeeId={selectedEmployeeId}
                                            selectedLeave={selectedLeave}
                                            selectedFromDate={selectedFromDate}
                                            selectedToDate={selectedToDate}
                                            totalDays={currentTotalDays}
                                            onSuccess={() => {
                                                setSelectedLeave(null);
                                                setSelectedFromDate(undefined);
                                                setSelectedToDate(undefined);
                                                refetchHistory();
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Grid 2: Leave History */}
                        <Card className='border-slate-200 shadow-sm rounded-2xl overflow-hidden'>
                            <CardHeader className='pb-4 border-b bg-slate-50/50 flex flex-row items-center justify-between'>
                                <div className='space-y-1'>
                                    <CardTitle className='text-base font-bold flex items-center gap-2'>
                                        <ClipboardList className='h-4 w-4 text-primary' />
                                        Leave History
                                    </CardTitle>
                                    <CardDescription className='text-xs'>Previously applied leaves</CardDescription>
                                </div>
                                <div className='relative w-64'>
                                    <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300' />
                                    <Input
                                        placeholder='Search in history...'
                                        className='pl-9 h-9 text-xs border-slate-200 bg-white ring-0'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className='p-0'>

                                <GenericDataTable
                                    columns={historyColumns}
                                    isLoading={isHistoryLoading}
                                    data={filteredHistoryData}
                                    totalItems={filteredHistoryData.length}
                                    success={true}
                                    loadingMessage='Loading history...'
                                    isSearchRequired={false}
                                />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className='bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center space-y-6'>
                        <div className='mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm'>
                            <UserCheck className='h-10 w-10 text-slate-300' />
                        </div>
                        <div className='max-w-md mx-auto space-y-2'>
                            <h2 className='text-xl font-black text-slate-800 uppercase tracking-tight'>No Staff Selected</h2>
                            <p className='text-slate-500 font-medium leading-relaxed'>
                                Please select an employee from the dropdown at the top to view their leave balance, apply for new leaves, and check history.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
