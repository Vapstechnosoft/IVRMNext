'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { tableSearchVariables } from '@/lib/data-table.config';
import { getAvailablePages, getSavedMappings } from '@/server/super-admin/super-admin-module/general-setting/page-mapping';
import type { IPageMappingData } from '@/types/super-admin/super-admin-module/general-setting/page-mapping';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import { usePageMapping } from './mapping-context';

import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

export default function AvailableGrid() {
    const { selectedModuleId, addToCart, cartPages, removeFromCart, saveCart } = usePageMapping();
    const [data, setData] = useState<IPageMappingData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!selectedModuleId) {
                const res = await getSavedMappings({});
                if (res.success) {
                    const mappedData = (res.data || []).map((item: any) => ({
                        ivrmP_Id: item.ivrmP_Id,
                        ivrmP_PageName: item.ivrmmP_PageName
                    }));
                    setData(mappedData);
                } else {
                    setData([]);
                }
            } else {
                const searchParams = { ivrmM_Id: selectedModuleId };
                const res = await getAvailablePages(searchParams);
                if (res.success) {
                    setData(res.data || []);
                } else {
                    setData([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch master pages', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedModuleId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter((item) => item.ivrmP_PageName?.toLowerCase().includes(lowerQuery));
    }, [data, searchQuery]);

    const paginatedData = useMemo(() => {
        const startIndex = (page - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, page, pageSize]);

    const currentTotalItems = filteredData.length;

    const handleToggle = (page: IPageMappingData, checked: boolean | 'indeterminate') => {
        if (checked === true) {
            addToCart([page]);
        } else {
            removeFromCart([page.ivrmP_Id]);
        }
    };

    const isChecked = (id: number) => {
        return cartPages.some((p) => p.ivrmP_Id === id);
    };

    const columns = useMemo<ColumnDef<IPageMappingData>[]>(
        () => [
            {
                accessorKey: 'serialNumber',
                header: 'SL.NO',
                cell: ({ row, table }) => {
                    const { pagination } = table.getState();
                    return pagination.pageIndex * pagination.pageSize + row.index + 1;
                },
                enableSorting: false
            },
            {
                accessorKey: 'ivrmP_PageName',
                header: 'Page Name'
            },
            {
                id: 'actions',
                header: 'Select',
                cell: ({ row }) => {
                    const checked = isChecked(row.original.ivrmP_Id);
                    return (
                        <div className='flex justify-center'>
                            <Checkbox
                                checked={checked}
                                onCheckedChange={(checked) => handleToggle(row.original, checked)}
                                aria-label='Select row'
                            />
                        </div>
                    );
                },
                enableSorting: false
            }
        ],
        [cartPages]
    );

    // Always render the grid, even if no module is selected
    // if (!selectedModuleId) return null;

    return (
        <div className='flex h-full flex-col rounded-md border bg-white shadow-sm'>
            <div className='flex items-center justify-between border-b bg-gray-50 p-3'>
                <h3 className='font-semibold text-lg'>Master Pages</h3>
            </div>

            <div className='flex-1 overflow-auto p-2'>
                <GenericDataTable
                    data={paginatedData}
                    columns={columns}
                    isLoading={isLoading}
                    isPaginationRequired={true}
                    totalItems={currentTotalItems}
                />
            </div>
        </div>
    );
}
