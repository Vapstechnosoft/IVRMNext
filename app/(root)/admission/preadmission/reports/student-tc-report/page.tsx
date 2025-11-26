'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import {
    useActivePreadmissionDetails,
    usePreadmissionAdmissionStatusDropdown,
    usePreadmissionClassDropdown,
    usePreadmissionStudentList
} from '@/hooks/admission/preadmission/useTransactions';
import { cn } from '@/lib/utils';

import type { IStudentYearlyAttendenceReportList } from '@/types/admission/preadmission/reports';
import { CheckSquare, FileText, RotateCcw, Search, Square } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { use, useRef, useState } from 'react';
import { toast } from 'sonner';
import { StudentTcReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentTcReportPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const router = useRouter();
    const pathname = usePathname();

    const tableRef = useRef<DataTableRef>(null);

    const handleResetSelection = () => {
        tableRef.current?.resetSelection();
    };

    const handleFilterChange = (filterType: 'class' | 'status' | 'academic_year', value: number) => {
        if (filterType === 'class') {
            setClassId(value);
        } else if (filterType === 'status') {
            setStatusId(value);
        } else if (filterType === 'academic_year') {
            setAcademicYearId(value);
        }

        // Reset to page 1 when filter changes
        const params = new URLSearchParams(searchParams as any);
        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    };

    const { data: activePreadmission, isLoading: activePreadmissionDeLoading } = useActivePreadmissionDetails();

    const { data: academicYearOptions, isLoading: academicYearLoading, isError: academicYearError } = useAcademicYearDropdown();

    const {
        data: preadmissionClass,
        isLoading: preadmissionClassLoading,
        isError: preadmissionClassError
    } = usePreadmissionClassDropdown();

    const {
        data: admissionStatus,
        isLoading: admissionStatusLoading,
        isError: admissionStatusError
    } = usePreadmissionAdmissionStatusDropdown();

    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [classId, setClassId] = useState<number>(0);
    const [statusId, setStatusId] = useState<number>(0);

    const [viewMode, setViewMode] = useState<'all' | 'individual'>('all');
    const [tcType, setTcType] = useState<'temporary' | 'permanent'>('temporary');

    const availableColumns = ['Student Name', 'Registration No.', 'TC No.', 'Leaving Class', 'Admission Class Name'];
    // Default: no columns selected so "Select All" is not checked by default
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [columnsSearch, setColumnsSearch] = useState('');

    const [selectedStudents, setSelectedStudents] = useState<IStudentYearlyAttendenceReportList[]>([]);

    const [, setIsStatusDialogOpen] = useState<boolean>(false);

    const {
        data: response,
        isLoading,
        error
    } = usePreadmissionStudentList((academicYearId || activePreadmission?.data?.asmaY_Id) ?? 0, classId, statusId, searchParams);
    const tableProps = useDataTableProps(response);

    const handleSelectStudent = (selectedRows: IStudentYearlyAttendenceReportList[]) => {
        setSelectedStudents(selectedRows);
    };

    const handleReset = () => {
        setAcademicYearId(0);
        setClassId(0);
        setStatusId(0);
        setViewMode('all');
        setTcType('temporary');
        setSelectedColumns([]);
        setSelectedStudents([]);
        handleResetSelection();

        // Reset URL params
        router.replace(pathname);

        toast.success('Filters reset successfully');
    };

    const handleReport = () => {
        if (!selectedColumns.length) {
            toast.error('Please select at least one column');
            return;
        }

        toast.success(`Report requested with columns: ${selectedColumns.join(', ')}`);
        // TODO: Replace with actual API call to generate/download TC report
    };

    return (
        <div className='min-h-screen'>
            {/* Header */}
            <div className='mb-3 flex w-fit flex-col gap-4 rounded-xl border p-4 shadow-xl'>
                {/* Filter Options */}
                <div className='flex flex-wrap justify-start gap-6'>
                    {/* View Mode Radio Buttons */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label className='mb-1 font-semibold'>View</Label>
                        <div className='flex items-center gap-4'>
                            <label className='flex items-center gap-2'>
                                <input type='radio' name='viewMode' checked={viewMode === 'all'} onChange={() => setViewMode('all')} />
                                <span>All</span>
                            </label>
                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='viewMode'
                                    checked={viewMode === 'individual'}
                                    onChange={() => setViewMode('individual')}
                                />
                                <span>Individual</span>
                            </label>
                        </div>
                    </div>

                    {/* Academic Year Filter (always shown) */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='academic-year' className='mb-1 font-semibold'>
                            Academic Year
                        </Label>
                        <Select
                            onValueChange={(value) => handleFilterChange('academic_year', Number(value))}
                            value={academicYearId !== 0 ? academicYearId?.toString() : undefined}>
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

                    {/* Class & Section only when Individual selected */}
                    {viewMode === 'individual' && (
                        <>
                            <div className='flex w-full flex-col gap-2 sm:w-56'>
                                <Label htmlFor='class' className='mb-1 font-semibold'>
                                    Class
                                </Label>
                                <Select
                                    onValueChange={(value) => handleFilterChange('class', Number(value))}
                                    value={classId !== 0 ? classId?.toString() : undefined}>
                                    <SelectTrigger id='class'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem key={0} value={'0'}>
                                            All
                                        </SelectItem>
                                        {preadmissionClassLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : preadmissionClassError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading
                                            </SelectItem>
                                        ) : (
                                            preadmissionClass?.data?.map((item) => (
                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                    {item.asmcL_ClassName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex w-full flex-col gap-2 sm:w-56'>
                                <Label htmlFor='admission-status' className='mb-1 font-semibold'>
                                    Section
                                </Label>
                                <Select
                                    onValueChange={(value) => handleFilterChange('status', Number(value))}
                                    value={statusId !== 0 ? statusId?.toString() : undefined}>
                                    <SelectTrigger id='admission-status'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem key={0} value={'0'}>
                                            All
                                        </SelectItem>
                                        {admissionStatusLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : admissionStatusError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading
                                            </SelectItem>
                                        ) : (
                                            admissionStatus?.data?.map((item) => (
                                                <SelectItem key={item.pamsT_Id} value={item.pamsT_Id.toString()}>
                                                    {item.pamsT_Status}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {/* TC Type Radio Buttons */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label className='mb-1 font-semibold'>TC Type</Label>
                        <div className='flex items-center gap-4'>
                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='tcType'
                                    value='temporary'
                                    checked={tcType === 'temporary'}
                                    onChange={() => setTcType('temporary')}
                                    className='h-4 w-4'
                                />
                                <span>Temporary TC</span>
                            </label>

                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='tcType'
                                    value='permanent'
                                    checked={tcType === 'permanent'}
                                    onChange={() => setTcType('permanent')}
                                    className='h-4 w-4'
                                />
                                <span>Permanent TC</span>
                            </label>
                        </div>
                    </div>

                    {/* Columns Checklist using Popover */}
                    <div className='flex w-full flex-col gap-2 sm:w-72'>
                        <Label className='mb-1 font-semibold'>Columns</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button type='button' variant='outline' className='w-full justify-between'>
                                    {selectedColumns.length ? `${selectedColumns.length} selected` : 'Select Columns'}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className='w-[260px] p-2 sm:w-[300px]'>
                                {/* Search Input */}
                                <div className='relative mb-2'>
                                    <Search className='absolute top-2.5 left-2 h-4 w-4 text-gray-400' />
                                    <Input
                                        placeholder='search here...'
                                        value={columnsSearch}
                                        onChange={(e) => setColumnsSearch(e.target.value)}
                                        className='h-8 pl-8 text-sm'
                                    />
                                </div>

                                <div className='max-h-[260px] overflow-y-auto rounded-md border p-1'>
                                    {/* Select All option */}
                                    <div
                                        onClick={() => {
                                            const isAllSelected = selectedColumns.length === availableColumns.length;
                                            setSelectedColumns(isAllSelected ? [] : [...availableColumns]);
                                        }}
                                        className={cn(
                                            'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                            selectedColumns.length === availableColumns.length
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 hover:border-primary/40'
                                        )}>
                                        {selectedColumns.length === availableColumns.length ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>

                                    {/* Individual column items */}
                                    {availableColumns
                                        .filter((c) => c.toLowerCase().includes(columnsSearch.toLowerCase().trim()))
                                        .map((col) => {
                                            const isSelected = selectedColumns.includes(col);
                                            return (
                                                <div
                                                    key={col}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedColumns((prev) => prev.filter((c) => c !== col));
                                                        } else {
                                                            setSelectedColumns((prev) => [...prev, col]);
                                                        }
                                                    }}
                                                    className={cn(
                                                        'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                        isSelected
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-gray-200 hover:border-primary/40'
                                                    )}>
                                                    {isSelected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{col}</span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                    <Button type='button' onClick={handleReport} className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <FileText className='mr-2 h-4 w-4' />
                        Report
                    </Button>
                </div>
            </div>

            <div className='container space-y-4 p-1'>
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {selectedStudents.length > 0 && (
                        <div className='flex w-full justify-end'>
                            <Button onClick={() => setIsStatusDialogOpen(true)} variant='default' className='h-8 w-fit gap-2'>
                                <CheckSquare className='h-4 w-4' />
                                Update Status ({selectedStudents.length})
                            </Button>
                        </div>
                    )}
                    <GenericDataTable<IStudentYearlyAttendenceReportList>
                        {...tableProps}
                        ref={tableRef}
                        columns={StudentTcReportColumns}
                        isLoading={activePreadmissionDeLoading || isLoading}
                        error={error}
                        showViewOptions={false}
                        loadingMessage='Loading preadmission admissions...'
                        noDataTitle='No Data Found'
                        noDataDescription='No preadmission admissions found.'
                        errorTitle='Error Loading Preadmission Admissions'
                        onRowSelectionChange={handleSelectStudent}
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
