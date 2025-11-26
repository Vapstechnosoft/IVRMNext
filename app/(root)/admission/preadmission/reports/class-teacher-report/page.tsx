'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';

import type { IClassTeacherReportList } from '@/types/admission/preadmission/reports';
import { CheckSquare, FileSpreadsheet, FileText, Printer, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { classTeacherReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ClassTeacherReportPage(props: { searchParams: SearchParams }) {
    const tableRef = useRef<DataTableRef>(null);

    const { data: academicYearOptions, isLoading: academicYearLoading, isError: academicYearError } = useAcademicYearDropdown();

    // Filters
    const [academicYearId, setAcademicYearId] = useState(0);
    const [reportType, setReportType] = useState('all');

    // Table selection
    const [selectedStudents, setSelectedStudents] = useState<IClassTeacherReportList[]>([]);

    // TODO: Replace with actual API hook
    const studentsLoading = false;
    const error = null;

    // Use the data table hook
    const tableProps = useDataTableProps<IClassTeacherReportList>({
        data: [] as IClassTeacherReportList[], // TODO: Replace with actual data from API
        pageCount: 0
    });

    const refetchStudents = () => {
        // TODO: Implement refetch logic (e.g., call API or trigger table refetch)
    };

    // Auto-select first academic year when options load
    useEffect(() => {
        if ((academicYearId ?? 0) === 0 && academicYearOptions?.data && academicYearOptions.data.length > 0) {
            setAcademicYearId(Number(academicYearOptions.data[0].asmaY_Id));
        }
    }, [academicYearOptions, academicYearId]);

    const handleFilterChange = (filterType: string, value: number) => {
        if (filterType === 'academic_year') {
            setAcademicYearId(value);
        }
        // TODO: Trigger data refetch based on filters
        refetchStudents();
    };

    const handleSelectStudent = (selectedRows: IClassTeacherReportList[]) => {
        setSelectedStudents(selectedRows);
    };

    const handleReset = () => {
        setAcademicYearId(0);
        setReportType('all');
        setSelectedStudents([]);
        refetchStudents();
    };

    return (
        <div className='min-h-screen'>
            {/* Filters Header */}
            <div className='mb-3 flex w-fit flex-col gap-4 rounded-xl border p-5 shadow-xl'>
                <div className='flex flex-wrap items-center gap-10'>
                    {/* Academic Year Filter */}
                    <div className='flex flex-col gap-2 sm:w-56'>
                        <Label htmlFor='academic-year' className='mb-1 font-semibold'>
                            Academic Year
                        </Label>

                        <Select
                            onValueChange={(value) => handleFilterChange('academic_year', Number(value))}
                            value={academicYearId !== 0 ? academicYearId?.toString() || undefined : undefined}>
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

                    {/* Report Type */}
                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold'>Report Type</Label>

                        <RadioGroup value={reportType} onValueChange={setReportType} className='flex flex-wrap items-center gap-8'>
                            <div className='flex items-center gap-2'>
                                <RadioGroupItem value='all' id='report-all' />
                                <Label htmlFor='report-all' className='cursor-pointer'>
                                    Class Teacher
                                </Label>
                            </div>

                            <div className='flex items-center gap-2'>
                                <RadioGroupItem value='pending' id='report-pending' />
                                <Label htmlFor='report-pending' className='cursor-pointer'>
                                    Class Teacher having Attendance Privilege
                                </Label>
                            </div>

                            <div className='flex items-center gap-2'>
                                <RadioGroupItem value='approved' id='report-approved' />
                                <Label htmlFor='report-approved' className='cursor-pointer'>
                                    Subject Teacher having Attendance Privilege
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                    <Button type='button' onClick={() => {}} className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <FileText className='mr-2 h-4 w-4' />
                        Report
                    </Button>
                    <div className='flex gap-3'>
                        <Button variant='outline' className='w-fit'>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            Export to Excel
                        </Button>
                        <Button variant='outline' className='w-fit'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
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

                    <GenericDataTable<IClassTeacherReportList>
                        {...tableProps}
                        ref={tableRef}
                        columns={classTeacherReportColumns}
                        isLoading={studentsLoading}
                        error={error}
                        showViewOptions={false}
                        loadingMessage='Loading class teacher reports...'
                        noDataTitle='No Data Found'
                        noDataDescription='No class teacher reports found.'
                        errorTitle='Error Loading Class Teacher Reports'
                        onRowSelectionChange={handleSelectStudent}
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
