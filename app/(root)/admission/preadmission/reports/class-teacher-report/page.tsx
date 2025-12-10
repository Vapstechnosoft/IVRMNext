'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useClassTeacherReport } from '@/hooks/admission/preadmission/useTransactions';
import type { IClassTeacherReportList } from '@/types/admission/preadmission/reports';
import { CheckSquare, FileSpreadsheet, FileText, Printer, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getClassTeacherReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ClassTeacherReportPage(props: {
    searchParams: SearchParams;
}) {
    const tableRef = useRef<DataTableRef>(null);

    const { data: academicYearOptions, isLoading: academicYearLoading, isError: academicYearError } = useAcademicYearDropdown();

    // Filters
    const [academicYearId, setAcademicYearId] = useState(0);
    const [reportType, setReportType] = useState('class_teacher');

    // Map report type to flag
    const flagMapping = {
        class_teacher: 3,
        class_teacher_attendance: 1,
        subject_teacher_attendance: 2
    };

    const flag = flagMapping[reportType as keyof typeof flagMapping];

    const [selectedStudents, setSelectedStudents] = useState<IClassTeacherReportList[]>([]);

    const { data: response, isLoading, error, refetch: refetchAdmissionStudents } = useClassTeacherReport(academicYearId, flag);

    const columns = useMemo(() => getClassTeacherReportColumns(reportType), [reportType]);

    const tableProps = useDataTableProps({
        data: response?.data || []
    });

    useEffect(() => {
        if ((academicYearId ?? 0) === 0 && academicYearOptions?.data && academicYearOptions.data.length > 0) {
            setAcademicYearId(Number(academicYearOptions.asmaY_Id));
        }
    }, [academicYearOptions, academicYearId]);

    const handleFilterChange = (filterType: string, value: number) => {
        if (filterType === 'academic_year') {
            setAcademicYearId(value);
        }
        refetchAdmissionStudents();
    };

    const handleSelectStudent = (selectedRows: IClassTeacherReportList[]) => {
        setSelectedStudents(selectedRows);
    };

    const handleReset = () => {
        if (academicYearOptions?.data && academicYearOptions.data.length > 0) {
            setAcademicYearId(Number(academicYearOptions.data[0].asmaY_Id));
        } else {
            setAcademicYearId(0);
        }
        setReportType('class_teacher');
        setSelectedStudents([]);
        tableRef.current?.resetSelection();
    };

    return (
        <div className='min-h-screen'>
            <div className='mb-3 flex w-full flex-col gap-6 rounded-xl border p-6 shadow-xl'>
                <div className='flex justify-center'>
                    <div className='flex w-full max-w-md items-center gap-4'>
                        <Label htmlFor='academic-year' className='whitespace-nowrap font-semibold'>
                            Academic Year
                        </Label>

                        <Select
                            onValueChange={(value) => handleFilterChange('academic_year', Number(value))}
                            value={academicYearId !== 0 ? academicYearId?.toString() || undefined : undefined}>
                            <SelectTrigger id='academic-year' className='w-48'>
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
                </div>

                <div className='flex flex-col items-center gap-3'>
                    <RadioGroup
                        value={reportType}
                        onValueChange={setReportType}
                        className='flex flex-wrap items-center justify-center gap-6'>
                        <div className='flex items-center gap-2'>
                            <RadioGroupItem value='class_teacher' id='report-class-teacher' />
                            <Label htmlFor='report-class-teacher' className='cursor-pointer'>
                                Class Teacher
                            </Label>
                        </div>

                        <div className='flex items-center gap-2'>
                            <RadioGroupItem value='class_teacher_attendance' id='report-class-attendance' />
                            <Label htmlFor='report-class-attendance' className='cursor-pointer'>
                                Class Teacher having Attendance Privilege
                            </Label>
                        </div>

                        <div className='flex items-center gap-2'>
                            <RadioGroupItem value='subject_teacher_attendance' id='report-subject-attendance' />
                            <Label htmlFor='report-subject-attendance' className='cursor-pointer'>
                                Subject Teacher having Attendance Privilege
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Action Buttons - Centered at Bottom */}
                <div className='flex items-center justify-center gap-3 border-t pt-4'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                    <Button
                        type='button'
                        onClick={() => refetchAdmissionStudents()}
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        <FileText className='mr-2 h-4 w-4' />
                        Report
                    </Button>
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
                        columns={columns}
                        isLoading={isLoading}
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
