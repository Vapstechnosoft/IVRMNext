'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterAllFeeHead, useMasterFeeGroupDropdown } from '@/hooks/fees/useMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import { CheckSquare, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useRef, useState } from 'react';
import YearlyFeeGroupMapping from './_components/add-form';
import { yearlyGroupMappingColumns } from './_components/columns';

type SearchParams = { [key: string]: string | string[] | undefined };

// === Types ===
interface IFeeGroupMapping {
    fyghM_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    fmG_Id: number;
    fmH_Id: number;
    fmI_Id: number;
    fyghM_FineApplicableFlag: boolean | null;
    fyghM_Common_AmountFlag: boolean | null;
    fyghM_ActiveFlag: boolean | null;
    fmG_GroupName: string;
    fmH_FeeName: string;
    fmI_Name: string;
    returnval: boolean;
    userid: number;
    deleteId: number;
}

interface AcademicYearOption {
    asmaY_Id: number;
    asmaY_Year: string;
}

interface FeeGroupOption {
    fmG_Id: number;
    feeGroups: string;
}

// Child component (inside FormProvider)
function FeeGroupMappingContent() {
    const { openAddForm } = useFormContext<IFeeGroupMapping>();
    const tableRef = useRef<DataTableRef>(null);

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    // === Dropdowns ===
    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [feeGroupId, setFeeGroupId] = useState<number>(0);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const { data: academicYearData, isLoading: academicYearLoading, error: academicYearError } = useAcademicYearDropdown();

    const { data: feeGroupData, isLoading: feeGroupLoading, error: feeGroupError } = useMasterFeeGroupDropdown(academicYearId);

    const { data: feeHeadResponse, isLoading: feeHeadLoading, error: feeHeadError } = useMasterAllFeeHead({ academicYearId, feeGroupId });

    const tableProps = useDataTableProps(feeHeadResponse);

    const handleSelectRows = (rows: any[]) => setSelectedRows(rows || []);

    return (
        <div className='min-h-screen space-y-6'>
            <div className='mt-8 mb-6 w-full rounded-xl border bg-card p-6 shadow-xl'>
                <div className='flex flex-wrap gap-6'>
                    {/* Academic Year */}
                    <div className='flex flex-col gap-2 sm:w-64'>
                        <Label htmlFor='academic-year' className='font-semibold'>
                            Academic Year
                        </Label>
                        <Select
                            value={academicYearId > 0 ? String(academicYearId) : ''}
                            onValueChange={(val) => setAcademicYearId(Number(val) || 0)}>
                            <SelectTrigger id='academic-year' className='w-full'>
                                <SelectValue placeholder='Select Academic Year' />
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

                    {/* Fee Group */}
                    <div className='flex flex-col gap-2 sm:w-64'>
                        <Label htmlFor='fee-group' className='font-semibold'>
                            Fee Group
                        </Label>
                        <Select
                            disabled={academicYearId === 0}
                            value={feeGroupId > 0 ? String(feeGroupId) : ''}
                            onValueChange={(val) => setFeeGroupId(Number(val) || 0)}>
                            <SelectTrigger id='fee-group' className='w-full'>
                                <SelectValue placeholder='Select Fee Group' />
                            </SelectTrigger>
                            <SelectContent>
                                {feeGroupLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : feeGroupError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading groups
                                    </SelectItem>
                                ) : !feeGroupData?.data?.length ? (
                                    <SelectItem value='no-data' disabled>
                                        No fee groups found
                                    </SelectItem>
                                ) : (
                                    feeGroupData.data.map((item: FeeGroupOption) => (
                                        <SelectItem key={item.fmG_Id} value={String(item.fmG_Id)}>
                                            {item.feeGroups}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    defaultOpen
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {selectedRows.length > 0 && (
                        <div className='mb-4 flex w-full justify-end'>
                            <Button variant='default' className='h-9 gap-2'>
                                <CheckSquare className='h-4 w-4' />
                                Update Status ({selectedRows.length})
                            </Button>
                        </div>
                    )}

                    <GenericDataTable<IFeeGroupMapping>
                        {...tableProps}
                        ref={tableRef}
                        columns={yearlyGroupMappingColumns}
                        isLoading={feeHeadLoading}
                        error={feeHeadError}
                        showViewOptions={false}
                        searchQuery={searchQuery}
                        loadingMessage='Loading fee group mappings...'
                        noDataTitle='No Data Found'
                        noDataDescription={
                            academicYearId === 0 || feeGroupId === 0
                                ? 'Please select both Academic Year and Fee Group to view mappings.'
                                : 'No fee group mappings found for the selected filters.'
                        }
                        errorTitle='Error Loading Data'
                        errorDescription='Failed to load fee group mappings. Please try again.'
                        onRowSelectionChange={handleSelectRows}
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
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        setRefreshKey((k) => k + 1);
    };

    return (
        <FormProvider<IFeeGroupMapping> key={refreshKey}>
            <FeeGroupMappingContent />
            <FormSections onSuccess={handleSuccess} />
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
