'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useDocumentView, usePreadmissionClassDropdown } from '@/hooks/admission/preadmission/useTransactions';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IPreadmissionDocumentView } from '@/types/admission/preadmission/transactions';
import { CheckSquare } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { use, useRef, useState } from 'react';
import { DocumentViewColoumn } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function DocumentView(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const tableRef = useRef<DataTableRef>(null);

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const { data: classOptions, isLoading: classLoading, isError: classError } = usePreadmissionClassDropdown();
    const { data: academicYearOptions, isLoading: academicYearLoading, isError: academicYearError } = useAcademicYearDropdown();

    // Filters
    const [classId, setClassId] = useState(0);
    const [academicYearId, setAcademicYearId] = useState(0);

    // Table selection
    const [selectedStudents, setSelectedStudents] = useState<IPreadmissionDocumentView[]>([]);

    const {
        data: response,
        isLoading: studentsLoading,
        error,
        refetch: refetchStudents
    } = useDocumentView(academicYearId ?? 0, classId, searchParams);

    const tableProps = useDataTableProps(response);

    const handleSelectStudent = (selectedRows: IPreadmissionDocumentView[]) => {
        setSelectedStudents(selectedRows);
    };

    return (
        <div className='min-h-screen'>
            {/* Filters Header */}
            <div className='mb-3 flex w-fit flex-col gap-4 rounded-xl border p-4 shadow-xl'>
                <div className='flex flex-wrap justify-start gap-6'>
                    {/* Academic Year Filter */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='academic-year' className='mb-1 font-semibold'>
                            Academic Year
                        </Label>
                        <Select
                            value={academicYearId !== 0 ? String(academicYearId) : undefined}
                            onValueChange={(value) => setAcademicYearId(Number(value))}>
                            <SelectTrigger id='academic-year'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYearLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : academicYearError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    academicYearOptions?.data?.map((item) => (
                                        <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Class Filter */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='class' className='mb-1 font-semibold'>
                            Class
                        </Label>
                        <Select value={classId !== 0 ? String(classId) : undefined} onValueChange={(value) => setClassId(Number(value))}>
                            <SelectTrigger id='class'>
                                <SelectValue placeholder='Select Class' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='0'>All</SelectItem>
                                {classLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : classError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    classOptions?.data?.map((item) => (
                                        <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                            {item.asmcL_ClassName}
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
                    {selectedStudents.length > 0 && (
                        <div className='flex w-full justify-end'>
                            <Button variant='default' className='h-8 w-fit gap-2'>
                                <CheckSquare className='h-4 w-4' />
                                Update Status ({selectedStudents.length})
                            </Button>
                        </div>
                    )}

                    <GenericDataTable<IPreadmissionDocumentView>
                        {...tableProps}
                        ref={tableRef}
                        columns={DocumentViewColoumn}
                        isLoading={studentsLoading}
                        error={error}
                        showViewOptions={false}
                        searchQuery={searchQuery}
                        loadingMessage='Loading preadmission applications...'
                        noDataTitle='No Data Found'
                        noDataDescription='No preadmission applications found.'
                        errorTitle='Error Loading Preadmission Applications'
                        onRowSelectionChange={handleSelectStudent}
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
