'use client';

import ToggleMasterCategoryForm from '@/app/(root)/admission/preadmission/masters/category/_components/toggle-form';
import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { getCategoryMappedSections } from '@/server/exam/exam-module/masters/category-class-mapping';
import type { IMasterCategoryList } from '@/types/admission/preadmission/masters';
import type { ICategoryClassMappingDetails, ICategoryMapping, ISection } from '@/types/exam/exam-module/masters';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CategoryClassMappingDetalisColumns } from './subject-group-details-columns';

interface CategoryClassMappingDetailsPageProps {
    rowData: ICategoryMapping;
    onClose: () => void;
}

export default function CategoryClassMappingDetailsPage({ rowData, onClose }: CategoryClassMappingDetailsPageProps) {
    const [mappings, setMappings] = useState<ICategoryClassMappingDetails[]>([]);
    const [loading, setLoading] = useState(false);

    // -------------------------
    // Fetch assigned sections when mappingId changes
    // -------------------------
    useEffect(() => {
        async function fetchMappings() {
            if (!rowData.emcA_Id) return;
            setLoading(true);

            try {
                const response = await getCategoryMappedSections(rowData.asmaY_Id, rowData.emcA_Id, rowData.asmcL_Id);

                const apiResponse = response as unknown as {
                    success: boolean;
                    message: string;
                    data: ISection[];
                };

                const data = apiResponse?.data || [];
                if (data.length === 0) {
                    setMappings([]);
                    setLoading(false);
                    return;
                }

                const mappedData: ICategoryClassMappingDetails[] = data.map((section, index) => ({
                    mI_Id: 30,
                    asmS_Id: section.asmS_Id,
                    asmcL_ClassName: rowData.asmcL_ClassName,
                    asmC_SectionCode: `SEC-${section.asmS_Id}`, // hardcoded
                    asmC_SectionName: `Section ${section.asmS_Id}`, // hardcoded
                    asmC_MaxCapacity: 40, // example hardcoded capacity
                    asmC_Order: index + 1,
                    asmC_ActiveFlag: true // active (true)
                }));

                setMappings(mappedData);
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch mapping details');
            } finally {
                setLoading(false);
            }
        }

        fetchMappings();
    }, [rowData]);

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
    return (
        <FormProvider<ICategoryClassMappingDetails>>
            <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh]'>
                <div className='relative mx-auto w-[70%] rounded-2xl bg-white p-6 shadow-xl'>
                    {/* Header Section */}
                    <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='space-y-1'>
                            <Heading
                                title={`Category-Class Mapping Details ${
                                    rowData.emcA_CategoryName ? ` - ${rowData.emcA_CategoryName}` : ''
                                }`}
                                description={`View mapped sections for class "${rowData.asmcL_ClassName}" (${rowData.asmaY_Year})`}
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
                        columns={CategoryClassMappingDetalisColumns}
                        isLoading={loading}
                        columnPinning={{ right: ['actions'] }}
                        noDataTitle='No Mappings Found'
                        noDataDescription='No class-section mappings available for this category.'
                        errorTitle='Error Loading Mappings'
                        showViewOptions={false}
                    />
                    <FormSections />
                </div>
            </div>
        </FormProvider>
    );
}

function FormSections() {
    const { isToggleFormOpen, selectedRow, closeToggleForm } = useFormContext<IMasterCategoryList>();

    return (
        <>
            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterCategoryForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
