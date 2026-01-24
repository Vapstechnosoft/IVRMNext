'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePageMapping } from './mapping-context';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { availableGridColumns } from './available-grid-columns';
import { getAvailablePages } from '@/server/super-admin/super-admin-module/general-setting/page-mapping';
import { useQueryState, parseAsInteger } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import { IPageMappingData } from '@/types/super-admin/super-admin-module/general-setting/page-mapping';
import { IPageMappingData } from '@/types/super-admin/super-admin-module/general-setting/page-mapping';

export default function AvailableGrid() {
    const { selectedModuleId, addToCart, cartPages, saveCart } = usePageMapping();
    const [data, setData] = useState<IPageMappingData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    // Use query state for pagination to match SavedGrid behavior
    // We use different keys if we want independent pagination on same page, 
    // but usually user focuses one. Let's use standard keys or namespaced if needed.
    // SavedGrid uses standard. If we navigate both independently, they clash on URL params.
    // However, usually "Saved" is hidden when "Available" is shown, so clash is fine (state persistance).
    // Or we use internal state? User asked for "same" implementation (likely GenericDataTable).

    // Using standard keys implies URL updates.
    const [page] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false }).withDefault(10)
    );

    const fetchData = useCallback(async () => {
        if (!selectedModuleId) {
            setData([]);
            setTotalItems(0);
            return;
        }

        setIsLoading(true);
        const searchParams = {
            page: page,
            page_size: pageSize,
            ivrmM_Id: selectedModuleId
        };

        try {
            // @ts-ignore - searchParams typing
            const res = await getAvailablePages(searchParams);
            if (res.success) {
                setData(res.data || []);
                setTotalItems(res.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch master pages', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, selectedModuleId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handler for checkbox toggle passed to columns via meta
    const handleToggle = (page: IPageMappingData) => {
        addToCart([page]);
    };

    const isChecked = (id: number) => {
        return cartPages.some(p => p.ivrmP_Id === id);
    };

    if (!selectedModuleId) return null;

    return (
        <div className="border rounded-md shadow-sm bg-white h-full flex flex-col">
            <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Master Pages</h3>
            </div>

            <div className="flex-1 overflow-auto p-2">
                <GenericDataTable
                    data={data}
                    columns={availableGridColumns}
                    isLoading={isLoading}
                    isPaginationRequired={true}
                    totalItems={totalItems}
                    meta={{
                        handleToggle,
                        isChecked
                    }}
                />
            </div>

        </div>
    );
}
