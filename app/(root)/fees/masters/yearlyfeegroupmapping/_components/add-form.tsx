'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Label } from '@/components/ui/extension/field';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterFeeGroupDropdown } from '@/hooks/fees/useMasters';
import { useFeeMasterHead, useFeeMasterInstallment } from '@/hooks/fees/useMasters';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface IHeadInstallment {
    id: number;
    feeHead: string;
    installment: string;
    fine: boolean;
    active: boolean;
    commonAmount: boolean;
}

interface IFeeGroupHeadMapping {
    id: number;
    groupName: string;
    headName: string;
    installment: string;
}

export default function YearlyFeeGroupMapping() {
    const { data: academicYearOptions } = useAcademicYearDropdown();
    const { data: feeGroupResponse } = useMasterFeeGroupDropdown() as {
        data?: {
            success?: boolean;
            message?: string;
            data?: { fmG_Id: number; feeGroups: string }[];
        };
    };

    const { data: feeHeadResponse, isLoading: isLoadingHeads, error: headError } = useFeeMasterHead();

    const { data: installmentResponse, isLoading: isLoadingInstallments, error: installmentError } = useFeeMasterInstallment();

    console.log('Fee Head Response:', feeHeadResponse);
    console.log('Fee Head Error:', headError);
    console.log('Installment Response:', installmentResponse);
    console.log('Installment Error:', installmentError);

    const academicYears = Array.isArray(academicYearOptions?.data) ? academicYearOptions.data : [];
    const feeGroups = Array.isArray(feeGroupResponse?.data) ? feeGroupResponse.data : [];

    const feeHeads = feeHeadResponse?.data || [];
    const installments = installmentResponse?.data || [];

    console.log('Processed Fee Heads:', feeHeads);
    console.log('Processed Installments:', installments);
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [feeGroup, setFeeGroup] = useState<string | null>(null);
    const [search, _setSearch] = useState('');

    const [headInstallments, setHeadInstallments] = useState<IHeadInstallment[]>([
        {
            id: 1,
            feeHead: '',
            installment: '',
            fine: false,
            active: false,
            commonAmount: false
        }
    ]);

    const feeGroupMappings: IFeeGroupHeadMapping[] = [
        {
            id: 1,
            groupName: 'Transport Fees New 10000',
            headName: 'VAN FEE',
            installment: 'Transport Installment'
        },
        {
            id: 2,
            groupName: 'Transport Charges 22500',
            headName: 'VAN FEE',
            installment: 'II Installment'
        },
        {
            id: 3,
            groupName: 'Library Charges 5000',
            headName: 'LIBRARY FEES',
            installment: 'III Installment'
        }
    ];

    const filteredMappings = useMemo(() => {
        if (!search) return feeGroupMappings;
        const term = search.toLowerCase();
        return feeGroupMappings.filter(
            (item) =>
                item.groupName.toLowerCase().includes(term) ||
                item.headName.toLowerCase().includes(term) ||
                item.installment.toLowerCase().includes(term)
        );
    }, [search, feeGroupMappings]);

    const handleToggle = (data: any) => console.log('Toggle:', data);

    const headInstallmentColumns: ColumnDef<IHeadInstallment>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 24
        },
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div>{continuousIndex}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'feeHead',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Head' />,
            cell: ({ row }) => (
                <Select
                    value={row.original.feeHead}
                    onValueChange={(value) => {
                        const updated = [...headInstallments];
                        updated[row.index].feeHead = value;
                        setHeadInstallments(updated);
                    }}>
                    <SelectTrigger>
                        <SelectValue placeholder='Select Head' />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.isArray(feeHeads) && feeHeads.length > 0 ? (
                            feeHeads.map((h: any) => (
                                <SelectItem key={h.fmH_Id} value={String(h.fmH_Id)}>
                                    {h.fmH_FeeName}
                                </SelectItem>
                            ))
                        ) : (
                            <div className='px-2 py-1 text-gray-500 text-sm'>No fee heads available</div>
                        )}
                    </SelectContent>
                </Select>
            )
        },
        {
            accessorKey: 'installment',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Installment' />,
            cell: ({ row }) => (
                <Select
                    value={row.original.installment}
                    onValueChange={(value) => {
                        const updated = [...headInstallments];
                        updated[row.index].installment = value;
                        setHeadInstallments(updated);
                    }}>
                    <SelectTrigger>
                        <SelectValue placeholder='Select Installment' />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.isArray(installments) && installments.length > 0 ? (
                            installments.map((i: any) => (
                                <SelectItem key={i.fmI_Id} value={String(i.fmI_Id)}>
                                    {i.fmI_Name}
                                </SelectItem>
                            ))
                        ) : (
                            <div className='px-2 py-1 text-gray-500 text-sm'>No installments available</div>
                        )}
                    </SelectContent>
                </Select>
            )
        },
        {
            accessorKey: 'fine',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Fine' />,
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.fine}
                    onCheckedChange={(v) => {
                        const updated = [...headInstallments];
                        updated[row.index].fine = !!v;
                        setHeadInstallments(updated);
                    }}
                />
            )
        },
        {
            accessorKey: 'active',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.active}
                    onCheckedChange={(v) => {
                        const updated = [...headInstallments];
                        updated[row.index].active = !!v;
                        setHeadInstallments(updated);
                    }}
                />
            )
        },
        {
            accessorKey: 'commonAmount',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Common Amount' />,
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.commonAmount}
                    onCheckedChange={(v) => {
                        const updated = [...headInstallments];
                        updated[row.index].commonAmount = !!v;
                        setHeadInstallments(updated);
                    }}
                />
            )
        }
    ];

    const addRow = () => {
        const nextId = headInstallments.length ? Math.max(...headInstallments.map((h) => h.id)) + 1 : 1;
        setHeadInstallments([
            ...headInstallments,
            {
                id: nextId,
                feeHead: '',
                installment: '',
                fine: false,
                active: false,
                commonAmount: false
            }
        ]);
    };

    const clearRows = () => {
        setHeadInstallments([
            {
                id: 1,
                feeHead: '',
                installment: '',
                fine: false,
                active: false,
                commonAmount: false
            }
        ]);
    };

    const saveRows = () => {
        //send to backend
    };

    const feeGroupColumns: ColumnDef<IFeeGroupHeadMapping>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 24
        },
        {
            accessorKey: 'id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div>{continuousIndex}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'groupName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
            cell: ({ row }) => <div>{row.getValue('groupName')}</div>
        },
        {
            accessorKey: 'headName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Head Name' />,
            cell: ({ row }) => <div>{row.getValue('headName')}</div>
        },
        {
            accessorKey: 'installment',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Installment' />,
            cell: ({ row }) => <div>{row.getValue('installment')}</div>
        },
        {
            id: 'actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
            accessorFn: (row) => row,
            enableSorting: false,
            cell: ({ row }) => (
                <ActionButtons
                    rowData={row.original}
                    buttons={{ toggle: true, delete: false }}
                    // onEdit={handleEdit}
                    onToggle={handleToggle}
                    toggleConditionKey='active'
                />
            )
        }
    ];

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='text-blue-700'>YEARLY FEE GROUP MAPPING</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-2 items-center gap-4'>
                    <div>
                        <Label>Academic Year *</Label>
                        <Select onValueChange={setAcademicYear} value={academicYear || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.length ? (
                                    academicYears.map((y: any) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id?.toString() || ''}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className='px-2 py-1 text-gray-500 text-sm'>No academic years available</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Fee Group *</Label>
                        <Select onValueChange={setFeeGroup} value={feeGroup || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Group' />
                            </SelectTrigger>
                            <SelectContent>
                                {feeGroups.length ? (
                                    feeGroups.map((f: any) => (
                                        <SelectItem key={f.fmG_Id} value={f.fmG_Id?.toString() || ''}>
                                            {f.feeGroups}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className='px-2 py-1 text-gray-500 text-sm'>No fee groups available</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {academicYear && feeGroup && (
                <Card>
                    <CardHeader>
                        <CardTitle className='text-blue-700'>HEAD INSTALLMENT LIST</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={headInstallmentColumns} data={headInstallments} totalItems={headInstallments.length} />

                        <div className='mt-4 flex items-center justify-end gap-2'>
                            <Button className='w-36' variant='accent' size='sm' onClick={addRow}>
                                Add another row
                            </Button>
                            <Button className='w-24' variant='success' size='sm' onClick={saveRows}>
                                Save
                            </Button>
                            <Button className='w-24' variant='danger' size='sm' onClick={clearRows}>
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className='flex justify-between text-blue-700'>
                        YEARLY FEE GROUP HEAD MAPPING LIST
                        <span className='text-gray-600 text-sm'>Total Grid Records: {filteredMappings.length}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={feeGroupColumns} data={filteredMappings} totalItems={filteredMappings.length} />
                </CardContent>
            </Card>
        </div>
    );
}
