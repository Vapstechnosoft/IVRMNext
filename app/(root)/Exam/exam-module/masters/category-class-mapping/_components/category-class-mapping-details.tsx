'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Switch } from '@/components/ui/switch';
import { getCategoryMappedSections } from '@/server/exam/exam-module/masters/category-class-mapping';
import type { ICategoryMapping } from '@/types/exam/exam-module/masters';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// -------------------------
// Row data type
// -------------------------
export interface ICategoryClassMappingDetails {
    ex_Id: number;
    ex_ClassName: string;
    ex_SectionName: string;
    ex_IsActiveFlag: boolean;
}

// -------------------------
// Props for the page
// -------------------------
interface CategoryClassMappingDetailsPageProps {
    rowData: ICategoryMapping;
    onClose: () => void;
}

// -------------------------
// Page component
// -------------------------
export default function CategoryClassMappingDetailsPage({ rowData, onClose }: CategoryClassMappingDetailsPageProps) {
    const [mappings, setMappings] = useState<ICategoryClassMappingDetails[]>([]);
    const [loading, setLoading] = useState(false);

    // -------------------------
    // Fetch assigned sections when mappingId changes
    // -------------------------
    useEffect(() => {
        async function fetchMappings() {
            if (!rowData.ex_Id) return;
            setLoading(true);

            try {
                // Get assigned sections
                const res = await getCategoryMappedSections('sdf', 'sdf', 'lsdkf');
                // Map API response to table row structure
                const mappedData: ICategoryClassMappingDetails[] = res.map((s: any, index: number) => ({
                    ex_Id: s.id || index + 1,
                    ex_ClassName: rowData.ex_ClassName,
                    ex_SectionName: s.name,
                    ex_IsActiveFlag: s.isActive ?? true
                }));
                setMappings(mappedData);
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch mapping details');
            } finally {
                setLoading(false);
            }
        }

        fetchMappings();
    }, [rowData.ex_Id, rowData.ex_ClassName]);

    // -------------------------
    // Data table props
    // -------------------------
    const tableProps = useDataTableProps({
        data: mappings,
        total: mappings.length,
        pageIndex: 0,
        pageSize: 5
    });

    // -------------------------
    // Columns
    // -------------------------
    const columns = [
        {
            id: 'slno',
            header: 'SL No',
            cell: ({ row, table }: any) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                return pageIndex * pageSize + row.index + 1;
            },
            size: 60
        },
        { accessorKey: 'ex_ClassName', header: 'Class Name' },
        { accessorKey: 'ex_SectionName', header: 'Section Name' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => {
                const isActive = row.original.ex_IsActiveFlag;

                const handleToggle = async () => {
                    try {
                        // TODO: Call API to toggle status
                        const newStatus = !isActive;
                        row.original.ex_IsActiveFlag = newStatus;
                        setMappings([...mappings]); // refresh state
                        toast.success(`Mapping ${newStatus ? 'Activated' : 'Deactivated'} Successfully`);
                    } catch (error: any) {
                        toast.error(` ${error}`);
                    }
                };

                return (
                    <div className='flex justify-center'>
                        <Switch
                            checked={isActive}
                            onCheckedChange={handleToggle}
                            className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300'
                        />
                    </div>
                );
            },
            size: 100
        }
    ];

    return (
        <FormProvider<ICategoryClassMappingDetails>>
            <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh]'>
                <div className='relative mx-auto w-[70%] rounded-2xl bg-white p-6 shadow-xl'>
                    {/* Header Section */}
                    <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='space-y-1'>
                            <Heading
                                title={`Category-Class Mapping Details of ${rowData.ex_CategoryName ? ` - ${rowData.ex_ClassName}` : ''}`}
                                description='View mapped classes and sections for the selected category'
                            />
                        </div>
                        <div className='flex gap-2'>
                            <Button
                                variant='secondary'
                                onClick={onClose}
                                className='shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                Close
                            </Button>
                        </div>
                    </div>

                    {/* Data Table */}
                    <GenericDataTable<ICategoryClassMappingDetails>
                        {...tableProps}
                        columns={columns}
                        isLoading={loading}
                        columnPinning={{ right: ['actions'] }}
                        noDataTitle='No Mappings Found'
                        noDataDescription='No class-section mappings available for this category.'
                        errorTitle='Error Loading Mappings'
                        showViewOptions={false}
                    />
                </div>
            </div>
        </FormProvider>
    );
}
