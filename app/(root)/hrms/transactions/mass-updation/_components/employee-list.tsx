'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import type { EmployeeDetail } from '@/types/hrms/mass-updation';
import type { ColumnDef } from '@tanstack/react-table';

interface EmployeeListProps {
    data: EmployeeDetail[];
    isLoading: boolean;
    selectedEmployees: number[];
    onSelectionChange: (employeeIds: number[]) => void;
}

export function EmployeeList({ data, isLoading, selectedEmployees, onSelectionChange }: EmployeeListProps) {
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(data.map((emp) => emp.HRME_Id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedEmployees, id]);
        } else {
            onSelectionChange(selectedEmployees.filter((empId) => empId !== id));
        }
    };

    const columns: ColumnDef<EmployeeDetail>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={data.length > 0 && data.every((emp) => selectedEmployees.includes(emp.HRME_Id))}
                    onCheckedChange={(value) => handleSelectAll(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedEmployees.includes(row.original.HRME_Id)}
                    onCheckedChange={(value) => handleSelectRow(row.original.HRME_Id, !!value)}
                    aria-label='Select row'
                />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'HRME_EmployeeCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />
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
            }
        },
        {
            accessorKey: 'HRMD_DepartmentName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />
        },
        {
            accessorKey: 'HRMDES_DesignationName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />
        },
        {
            accessorKey: 'HRMGT_EmployeeGroupType',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type' />
        }
    ];

    return (
        <div className='space-y-2'>
            <div className='text-muted-foreground text-sm'>
                {selectedEmployees.length} of {data.length} employee(s) selected
            </div>
            <GenericDataTable
                data={data}
                columns={columns}
                isLoading={isLoading}
                dataKey='HRME_Id'
                noDataTitle='No Employees Found'
                noDataDescription='Search above to find employees for mass updation.'
                errorTitle='Error Loading Employees'
            />
        </div>
    );
}
