'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { EmployeeDropdown } from '@/types/hrms/salary-updation';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface HeadOption {
    HRMED_Id: number;
    HRMED_Name: string;
    HRMED_EarnDedFlag?: string;
    HRMED_AmountPercentFlag?: string;
}

interface DynamicColumnsProps {
    selectedHeads: HeadOption[];
    employeeData: EmployeeDropdown[];
}

/**
 * Generate dynamic columns based on selected heads
 * The columns will include:
 * 1. Sl.No
 * 2. Employee Code
 * 3. Employee Name
 * 4. Dynamic columns for each selected head
 */
export function getSalaryUpdationColumns({ selectedHeads, employeeData }: DynamicColumnsProps): ColumnDef<EmployeeDropdown>[] {
    // Base columns that are always present
    const baseColumns: ColumnDef<EmployeeDropdown>[] = [
        {
            accessorKey: 'HRME_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div className='w-full pl-6'>{continuousIndex}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'HRME_EmployeeCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
            cell: ({ row }) => <div className='font-medium'>{row.original.HRME_EmployeeCode}</div>,
            enableSorting: true
        },
        {
            accessorKey: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => {
                const fullName = [
                    row.original.HRME_EmployeeFirstName,
                    row.original.HRME_EmployeeMiddleName,
                    row.original.HRME_EmployeeLastName
                ]
                    .filter(Boolean)
                    .join(' ');
                return <div className='font-medium'>{fullName}</div>;
            },
            enableSorting: true
        }
    ];

    // Dynamic columns for selected heads
    const dynamicColumns: ColumnDef<EmployeeDropdown>[] = useMemo(() => {
        if (!selectedHeads || selectedHeads.length === 0) {
            return [];
        }

        return selectedHeads.map((head) => {
            const headId = head.HRMED_Id;
            const headName = head.HRMED_Name;

            return {
                accessorKey: `head_${headId}`,
                header: ({ column }) => (
                    <div className='flex w-full justify-end'>
                        <DataTableColumnHeader column={column} title={headName} className='justify-end [&_button]:ml-auto' />
                    </div>
                ),
                cell: ({ row }) => {
                    // Get the value for this head from the employee data
                    // The employee data structure may vary, so we need to check the actual structure
                    const employee = row.original as any;
                    // Try to find the value - check various possible property names
                    // The API might return head values with different naming conventions
                    let value: number | string | undefined = undefined;
                    
                    // Try different property name patterns
                    if (employee[headName] !== undefined) {
                        value = employee[headName];
                    } else if (employee[`HRMED_${headId}`] !== undefined) {
                        value = employee[`HRMED_${headId}`];
                    } else if (employee[`head_${headId}`] !== undefined) {
                        value = employee[`head_${headId}`];
                    } else if (employee[headId] !== undefined) {
                        value = employee[headId];
                    }
                    
                    // If still no value, try to find in nested structure or return 0
                    if (value === undefined) {
                        value = 0;
                    }
                    
                    return (
                        <div className='pr-4 text-right'>
                            <span className='font-medium'>
                                {typeof value === 'number' ? `₹${Number(value).toFixed(2)}` : value || '-'}
                            </span>
                        </div>
                    );
                },
                enableSorting: true,
                enableHiding: true
            };
        });
    }, [selectedHeads]);

    return [...baseColumns, ...dynamicColumns];
}

// Default export for backward compatibility
export const salaryUpdationColumns: ColumnDef<EmployeeDropdown>[] = [];
