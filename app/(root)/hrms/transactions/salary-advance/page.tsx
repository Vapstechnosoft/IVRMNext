'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useSalaryAdvanceList } from '@/hooks/hrms/useTransactions';
import { cn } from '@/lib/utils';
import type { EmployeeDropdown, LeaveYearDropdown, MonthDropdown, SalaryAdvanceItem } from '@/types/hrms/salary-advance';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ActionsCell } from './_components/actions-cell';
import FormSections from './_components/form-sections';

interface SalaryAdvance extends SalaryAdvanceItem {
    selected?: boolean;
}

export default function SalaryAdvancePage() {
    const roleId = 2;
    const { data: advanceData, isLoading, refetch } = useSalaryAdvanceList({ roleId });

    return (
        <FormProvider<SalaryAdvanceItem>>
            <SalaryAdvancePageContent advanceData={advanceData} isLoading={isLoading} refetch={refetch} />
        </FormProvider>
    );
}

function SalaryAdvancePageContent({
    advanceData,
    isLoading,
    refetch
}: {
    advanceData: any;
    isLoading: boolean;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<SalaryAdvanceItem>();
    const [selectedAdvances, setSelectedAdvances] = useState<number[]>([]);

    const _salaryAdvances: SalaryAdvance[] = (advanceData?.empadvaList || []).map((advance: any) => ({
        ...advance,
        selected: false
    }));
    const filteredAdvances = _salaryAdvances;
    const employees = advanceData?.employeedropdown || [];
    const leaveYears = advanceData?.leaveyeardropdown || [];
    const months = advanceData?.monthdropdown || [];
    const _modeOfPayments = advanceData?.modeOfPaymentdropdown || [];

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedAdvances(filteredAdvances.map((advance) => advance.HRESA_Id));
        } else {
            setSelectedAdvances([]);
        }
    };

    const handleAdvanceSelect = (advanceId: number, selected: boolean) => {
        if (selected) {
            setSelectedAdvances((prev) => [...prev, advanceId]);
        } else {
            setSelectedAdvances((prev) => prev.filter((id) => id !== advanceId));
        }
    };

    const getEmployeeName = (employee: EmployeeDropdown) => {
        return `${employee.HRME_EmployeeFirstName} ${
            employee.HRME_EmployeeMiddleName || ''
        } ${employee.HRME_EmployeeLastName || ''}`.trim();
    };

    const getEmployeeCode = (employeeId: number) => {
        const employee = employees.find((emp: EmployeeDropdown) => emp.HRME_Id === employeeId);
        return employee?.HRME_EmployeeCode || `EMP${employeeId}`;
    };

    const getLeaveYearName = (yearId: number) => {
        const year = leaveYears.find((y: LeaveYearDropdown) => y.HRMLY_Id === yearId);
        return year?.HRMLY_LeaveYear || `Year ${yearId}`;
    };

    const getMonthName = (monthId: number) => {
        const month = months.find((m: MonthDropdown) => m.IVRM_Month_Id === monthId);
        return month?.IVRM_Month_Name || `Month ${monthId}`;
    };

    const SalaryAdvanceTable = ({
        advances,
        isLoading,
        onSelectAll,
        onAdvanceSelect,
        getEmployeeCode,
        getEmployeeName,
        getLeaveYearName,
        getMonthName
    }: {
        advances: SalaryAdvance[];
        isLoading: boolean;
        onSelectAll: (selected: boolean) => void;
        onAdvanceSelect: (advanceId: number, selected: boolean) => void;
        getEmployeeCode: (employeeId: number) => string;
        getEmployeeName: (employee: EmployeeDropdown) => string;
        getLeaveYearName: (yearId: number) => string;
        getMonthName: (monthId: number) => string;
    }) => {
        const columns: ColumnDef<SalaryAdvance>[] = [
            {
                id: 'select',
                header: () => (
                    <Checkbox
                        checked={advances.length > 0 && selectedAdvances.length === advances.length}
                        onCheckedChange={(value) => onSelectAll(!!value)}
                        aria-label='Select all'
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={selectedAdvances.includes(row.original.HRESA_Id)}
                        onCheckedChange={(value) => onAdvanceSelect(row.original.HRESA_Id, !!value)}
                        aria-label='Select row'
                    />
                ),
                enableSorting: false,
                enableHiding: false
            },
            {
                accessorKey: 'HRESA_Id',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No.' />,
                cell: ({ row, table }) => {
                    const index = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id);
                    return <div>{index + 1}</div>;
                },
                enableSorting: false,
                enableHiding: false
            },
            {
                accessorKey: 'HRME_Id',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
                cell: ({ row }) => <div>{getEmployeeCode(row.getValue('HRME_Id'))}</div>,
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'MasterEmployee',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
                cell: ({ row }) => {
                    const employee = row.getValue('MasterEmployee') as EmployeeDropdown;
                    return <div>{getEmployeeName(employee)}</div>;
                },
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'HRESA_AdvYear',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Year' />,
                cell: ({ row }) => <div>{getLeaveYearName(row.getValue('HRESA_AdvYear'))}</div>,
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'HRESA_AdvMonth',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Month' />,
                cell: ({ row }) => <div>{getMonthName(Number(row.getValue('HRESA_AdvMonth')))}</div>,
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'HRESA_AppliedAmount',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Amount' />,
                cell: ({ row }) => <div>₹{row.getValue('HRESA_AppliedAmount')?.toLocaleString()}</div>,
                enableSorting: true,
                enableHiding: true
            },
            {
                accessorKey: 'HRESA_AdvStatus',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
                cell: ({ row }) => {
                    const status = row.getValue('HRESA_AdvStatus') as string;
                    return (
                        <span
                            className={cn(
                                'rounded-full px-2 py-1 font-medium text-xs',
                                status === 'Approved'
                                    ? 'bg-green-100 text-green-800'
                                    : status === 'Rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                            )}>
                            {status}
                        </span>
                    );
                },
                enableSorting: true,
                enableHiding: true
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => {
                    const advance = row.original;
                    return <ActionsCell rowData={advance} />;
                }
            }
        ];

        return (
            <div className='overflow-hidden rounded-lg bg-card'>
                <DataTable<SalaryAdvance, any> columns={columns} data={advances} totalItems={advances.length} isLoading={isLoading} />
            </div>
        );
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Salary Advance
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='space-y-4'>
                        {selectedAdvances.length > 0 && (
                            <div className='flex items-center gap-4 rounded-lg bg-blue-50 p-4'>
                                <span className='font-medium text-sm'>{selectedAdvances.length} record(s) selected</span>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                        toast.info('Bulk actions not implemented yet');
                                    }}>
                                    Bulk Actions
                                </Button>
                            </div>
                        )}

                        <SalaryAdvanceTable
                            advances={filteredAdvances}
                            isLoading={isLoading}
                            onSelectAll={handleSelectAll}
                            onAdvanceSelect={handleAdvanceSelect}
                            getEmployeeCode={getEmployeeCode}
                            getEmployeeName={getEmployeeName}
                            getLeaveYearName={getLeaveYearName}
                            getMonthName={getMonthName}
                        />
                    </div>
                </CollapsibleSection>

                {/* Forms Section - Moved after table */}
                <FormSections onloadData={advanceData} onSuccess={refetch} />
            </div>
        </div>
    );
}
