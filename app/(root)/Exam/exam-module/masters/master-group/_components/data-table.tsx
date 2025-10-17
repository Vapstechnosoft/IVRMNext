'use client';
import { DataTableSkeleton } from '@/components/ui/data-table/data-table-skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCommonPinningStyles, tableSearchVariables } from '@/lib/data-table.config';
import {
    type ColumnDef,
    type ColumnPinningState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useState } from 'react';
import { toast } from 'sonner';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    totalItems: number;
    pageSizeOptions?: number[];
    isLoading?: boolean;
    showExportOptions?: boolean;
    showViewOptions?: boolean;
    columnPinning?: ColumnPinningState | undefined;

    // ✅ For selectable rows
    maxSelectableRows?: number;
    onRowSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData extends { selected?: boolean }, TValue>({
    columns,
    data,
    totalItems,
    pageSizeOptions = [10, 20, 30, 40, 50],
    isLoading,
    showExportOptions = false,
    showViewOptions = true,
    columnPinning,
    maxSelectableRows = 0,
    onRowSelectionChange
}: DataTableProps<TData, TValue>) {
    const [currentPage, setCurrentPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize, setPageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false, history: 'push' }).withDefault(10)
    );

    // Initialize rowSelection from pre-selected rows
    const initialSelection = data.reduce(
        (acc, row) => {
            const subjectRow = row as { ismS_Id?: number; selected?: boolean };
            if (subjectRow.selected && subjectRow.ismS_Id !== undefined) {
                acc[String(subjectRow.ismS_Id)] = true; // ID must match getRowId
            }
            return acc;
        },
        {} as Record<string, boolean>
    );

    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(initialSelection);

    const paginationState = { pageIndex: currentPage - 1, pageSize };
    const pageCount = Math.ceil(totalItems / pageSize);

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination: paginationState,
            rowSelection
        },
        onPaginationChange: (updaterOrValue) => {
            const pagination = typeof updaterOrValue === 'function' ? updaterOrValue(paginationState) : updaterOrValue;
            setCurrentPage(pagination.pageIndex + 1);
            setPageSize(pagination.pageSize);
        },
        onRowSelectionChange: (newSelection) => {
            const selectionObj = typeof newSelection === 'function' ? newSelection(rowSelection) : newSelection;
            const selectedCount = Object.keys(selectionObj).length;

            if (maxSelectableRows && selectedCount > maxSelectableRows) {
                toast.error(`You can select up to ${maxSelectableRows} rows only.`);
                return;
            }

            setRowSelection(selectionObj);

            const selectedRows = table
                .getFilteredRowModel()
                .rows.filter((r) => selectionObj[r.id])
                .map((r) => r.original);

            onRowSelectionChange?.(selectedRows);
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        initialState: {
            columnPinning: columnPinning || { right: ['actions'] }
        }
    });

    return (
        <div className='w-full space-y-2.5 overflow-auto'>
            {isLoading ? (
                <DataTableSkeleton columnCount={columns.length} rowCount={5} showPagination showViewOptions={false} />
            ) : (
                <div className='overflow-hidden rounded-md border'>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{ ...getCommonPinningStyles({ column: header.column }) }}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected()}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} style={{ ...getCommonPinningStyles({ column: cell.column }) }}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className='h-24 text-center'>
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
