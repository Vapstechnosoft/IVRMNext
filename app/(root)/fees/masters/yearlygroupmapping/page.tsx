'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterAllFeeHead } from '@/hooks/fees/useMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IFeeGroupMapping } from '@/types/fees/masters/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useRef, useState } from 'react';
import YearlyFeeGroupMapping from './_components/add-form';
import { yearlyGroupMappingColumns } from './_components/columns';

type SearchParams = { [key: string]: string | string[] | undefined };

interface AcademicYearOption {
    asmaY_Id: number;
    asmaY_Year: string;
}

function FeeGroupMappingContent() {
    const { openAddForm } = useFormContext<IFeeGroupMapping>();
    const tableRef = useRef<DataTableRef>(null);

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [academicYearId, setAcademicYearId] = useState<number>(0);

    const { data: academicYearData, isLoading: academicYearLoading, error: academicYearError } = useAcademicYearDropdown();

    const apiSearchParams = academicYearId > 0 ? { ASMAY_Id: academicYearId } : undefined;

    const {
        data: feeHeadResponse,
        isLoading: feeHeadLoading,
        error: feeHeadError,
        isFetching
    } = useMasterAllFeeHead(apiSearchParams as unknown as any);

    // Extract actual data array safely
    const feeGroupData = Array.isArray(feeHeadResponse?.data) ? feeHeadResponse.data : [];

    const tableProps = useDataTableProps({
        ...feeHeadResponse,
        data: feeGroupData // Override with safe data
    });

    return (
        <div className='min-h-screen space-y-6'>
            {/* Top Bar: Filter Card and Add Button */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                {/* Filter Card */}
                <div className='w-full rounded-lg border bg-card p-6 shadow-sm sm:w-auto'>
                    <div className='flex flex-col gap-2 sm:w-64'>
                        <Label htmlFor='academic-year' className='font-semibold text-sm'>
                            Academic Year
                        </Label>
                        <Select
                            value={academicYearId > 0 ? String(academicYearId) : ''}
                            onValueChange={(val) => setAcademicYearId(Number(val) || 0)}
                            disabled={academicYearLoading}>
                            <SelectTrigger id='academic-year' className='w-full'>
                                <SelectValue placeholder='All' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYearLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : academicYearError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading years
                                    </SelectItem>
                                ) : !academicYearData?.data?.length ? (
                                    <SelectItem value='no-data' disabled>
                                        No academic years
                                    </SelectItem>
                                ) : (
                                    academicYearData.data.map((item: AcademicYearOption) => (
                                        <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Add Button */}
                <Button
                    onClick={openAddForm}
                    className='mt-8 h-10 w-full rounded-lg bg-orange-500 px-4 font-medium text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg sm:w-auto'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Yearly Group Mapping
                </Button>
            </div>

            {/* Data Table */}
            <div className='space-y-4'>
                <CollapsibleSection
                    defaultOpen
                    variant='default'
                    size='lg'
                    className='shadow-sm transition-shadow duration-300 hover:shadow-md'>
                    <GenericDataTable<IFeeGroupMapping>
                        {...tableProps}
                        ref={tableRef}
                        columns={yearlyGroupMappingColumns}
                        data={feeGroupData}
                        isLoading={feeHeadLoading || isFetching}
                        error={feeHeadError}
                        showViewOptions={false}
                        searchQuery={searchQuery}
                        loadingMessage='Loading fee group mappings...'
                        noDataTitle='No Records Found'
                        noDataDescription={
                            academicYearId === 0
                                ? 'Please select an Academic Year to view fee group mappings.'
                                : 'No records found for the selected academic year.'
                        }
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}

// Main Page Component
export default function FeeGroupMappingView({
    searchParams: _searchParams
}: {
    searchParams: SearchParams;
}) {
    return (
        <FormProvider<IFeeGroupMapping>>
            <FeeGroupMappingContent />
            <FormSections />
        </FormProvider>
    );
}

function FormSections() {
    const { isAddFormOpen, closeAddForm, addFormRef } = useFormContext<IFeeGroupMapping>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Fee Group Mapping'
                        description='Add a new yearly fee group mapping'
                        defaultOpen
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <YearlyFeeGroupMapping />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
