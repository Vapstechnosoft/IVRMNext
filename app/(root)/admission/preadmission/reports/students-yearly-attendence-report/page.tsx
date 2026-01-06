'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import {
    useActivePreadmissionDetails,
    usePreadmissionClassDropdown1,
    useadmissionSectionDropdown
} from '@/hooks/admission/preadmission/useTransactions';

import type { IStudentYearlyAttendenceReportList } from '@/types/admission/preadmission/reports';
import { FileText, Printer, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { use, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useStudentYearlyAttendance } from '@/hooks/admission/preadmission/useReports';
import { getExcelStudentYearlyReport } from '@/server/admission/preadmission/reports/month_end_report';
import { createStudentsYearlyAttendenceReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface MonthInfo {
    monthnamee: string;
    yearidname: string;
    monthidname: number;
    MONTH_NAME: string;
    total: number;
}

interface StudentAttendanceRecord {
    TOTAL_PRESENT: number;
    RowNo: number;
    name: string;
    AMST_AdmNo: string;
    AMST_RegistrationNo: string;
    AMAY_RollNo: number;
    yearidname: number;
    monthidname: number;
}

interface AttendanceResponse {
    mI_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    allOrIndiFlag: string;
    amC_Id: number;
    monthList: MonthInfo[];
    studentAttendanceList: StudentAttendanceRecord[];
}

export default function StudentsYearlyAttendenceReport(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const router = useRouter();
    const pathname = usePathname();

    const tableRef = useRef<DataTableRef>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [showReport, setShowReport] = useState(false);

    const handleResetSelection = () => {
        tableRef.current?.resetSelection();
    };

    const handleFilterChange = (filterType: 'class' | 'section' | 'academic_year', value: number) => {
        if (filterType === 'class') {
            setClassId(value);
            setSectionId(0);
        } else if (filterType === 'section') {
            setSectionId(value);
        } else if (filterType === 'academic_year') {
            setAcademicYearId(value);
        }
    };

    const { data: activePreadmission, isLoading: activePreadmissionDeLoading } = useActivePreadmissionDetails();

    const { data: academicYearOptions, isLoading: academicYearLoading, isError: academicYearError } = useAcademicYearDropdown();

    const {
        data: preadmissionClass,
        isLoading: preadmissionClassLoading,
        isError: preadmissionClassError
    } = usePreadmissionClassDropdown1();

    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [classId, setClassId] = useState<number>(0);
    const [sectionId, setSectionId] = useState<number>(0);

    const [selectedStudents, setSelectedStudents] = useState<IStudentYearlyAttendenceReportList[]>([]);

    const {
        data: admissionSection,
        isLoading: admissionSectionLoading,
        isError: admissionSectionError
    } = useadmissionSectionDropdown(Number(classId));

    const {
        data: response,
        isLoading,
        error,
        refetch: refetchAdmissionStudents
    } = useStudentYearlyAttendance((academicYearId || activePreadmission?.data?.asmaY_Id) ?? 0, classId, sectionId, searchParams);

    const transformedData = useMemo(() => {
        if (!response?.data || !showReport) {
            return [];
        }

        const attendanceData = response.data as any;

        if (!attendanceData.studentAttendanceList || !attendanceData.monthList) {
            return [];
        }

        const { studentAttendanceList, monthList } = attendanceData;

        const studentMap = new Map<number, IStudentYearlyAttendenceReportList>();

        studentAttendanceList.forEach((record: any) => {
            if (!studentMap.has(record.RowNo)) {
                studentMap.set(record.RowNo, {
                    RowNo: record.RowNo,
                    name: record.name,
                    AMST_AdmNo: record.AMST_AdmNo,
                    AMST_RegistrationNo: record.AMST_RegistrationNo,
                    AMAY_RollNo: record.AMAY_RollNo,
                    monthlyAttendance: {},
                    totalPresent: 0,
                    percentage: '0.00',
                    AMST_Id: 0
                });
            }

            const student = studentMap.get(record.RowNo)!;
            const monthKey = `${record.yearidname}-${record.monthidname}`;

            student.monthlyAttendance[monthKey] = record.TOTAL_PRESENT;
            student.totalPresent += record.TOTAL_PRESENT;
        });

        const totalWorkingDays = monthList.reduce((sum: any, month: any) => sum + month.total, 0);

        return Array.from(studentMap.values()).map((student) => ({
            ...student,
            percentage: totalWorkingDays > 0 ? ((student.totalPresent / totalWorkingDays) * 100).toFixed(2) : '0.00'
        }));
    }, [response?.data, showReport]);

    const tableProps = useDataTableProps({
        ...response,
        data: transformedData
    });

    const columns = useMemo(() => {
        if (!response?.data) {
            return createStudentsYearlyAttendenceReportColumns([]);
        }

        const attendanceData = response.data as any;
        const monthList = attendanceData.monthList || [];

        return createStudentsYearlyAttendenceReportColumns(monthList);
    }, [response?.data]);

    const handleSelectStudent = (selectedRows: IStudentYearlyAttendenceReportList[]) => {
        setSelectedStudents(selectedRows);
    };

    const handleReset = () => {
        setAcademicYearId(0);
        setClassId(0);
        setSectionId(0);
        setSelectedStudents([]);
        setShowReport(false);
        handleResetSelection();

        router.replace(pathname);

        toast.success('Filters reset successfully');
    };

    const handleCancel = () => {
        setShowReport(false);
        setSelectedStudents([]);
        handleResetSelection();
        toast.info('Report cancelled');
    };

    const downloadExcel = async () => {
        try {
            if (!academicYearId || !classId || !sectionId || !searchParams) {
                toast.error('Please fill all required fields!');
                return;
            }

            const response = await getExcelStudentYearlyReport(academicYearId, classId, sectionId, searchParams);

            // Ensure we have a Blob
            const blob =
                response instanceof Blob
                    ? response
                    : new Blob([new Uint8Array(response)], {
                          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'StudentYearlyAttendanceReport.xlsx';
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                link.remove();
                window.URL.revokeObjectURL(url);
            }, 100);

            setShowReport(false);

            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download Excel');
        }
    };

    const handlePrint = () => {
        if (!transformedData || transformedData.length === 0) {
            toast.error('No data available to print');
            return;
        }

        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student to print');
            return;
        }

        window.print();
    };

    const handleReport = () => {
        // Validate all dropdowns are selected
        if (!academicYearId || academicYearId === 0) {
            toast.error('Please select Academic Year');
            return;
        }

        if (!classId || classId === 0) {
            toast.error('Please select Class');
            return;
        }

        if (!sectionId || sectionId === 0) {
            toast.error('Please select Section');
            return;
        }

        setShowReport(true);
        toast.success('Generating report...');
    };

    return (
        <div className='min-h-screen p-8'>
            <style>
                {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-report, #printable-report * {
              visibility: visible;
            }
            #printable-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
            </style>

            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Student Yearly Attendance Report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='no-print slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className='flex flex-row justify-center gap-6'>
                            <div className='w-full max-w-xs space-y-2'>
                                <Label htmlFor='academic-year' className='font-medium text-gray-900 text-sm'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) => handleFilterChange('academic_year', Number(value))}
                                    value={academicYearId !== 0 ? academicYearId?.toString() : undefined}>
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

                            <div className='w-full max-w-xs space-y-2'>
                                <Label htmlFor='class' className='font-medium text-gray-900 text-sm'>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) => handleFilterChange('class', Number(value))}
                                    value={classId !== 0 ? classId?.toString() : undefined}>
                                    <SelectTrigger id='class' className='w-full'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
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

                            <div className='w-full max-w-xs space-y-2'>
                                <Label htmlFor='section' className='font-medium text-gray-900 text-sm'>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) => handleFilterChange('section', Number(value))}
                                    value={sectionId !== 0 ? sectionId?.toString() : undefined}
                                    disabled={classId === 0}>
                                    <SelectTrigger id='section' className='w-full'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem key={0} value={'0'}>
                                            All
                                        </SelectItem>
                                        {admissionSectionLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : admissionSectionError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading
                                            </SelectItem>
                                        ) : (
                                            admissionSection?.data?.map((item: any) => (
                                                <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                    {item.asmC_SectionName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                onClick={handleReport}
                                className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                                <FileText className='mr-2 h-4 w-4' />
                                Report
                            </Button>

                            <Button
                                variant='outline'
                                className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'
                                onClick={handleCancel}>
                                <X className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                            {showReport && transformedData && transformedData.length > 0 && (
                                <>
                                    <Button onClick={downloadExcel} className='w-fit'>
                                        Export to Excel
                                    </Button>
                                    <Button
                                        variant='outline'
                                        className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'
                                        onClick={handlePrint}
                                        disabled={selectedStudents.length === 0}>
                                        <Printer className='mr-2 h-4 w-4' />
                                        Print
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>

                {showReport && transformedData && transformedData.length > 0 && (
                    <div id='printable-report' ref={printRef}>
                        <CollapsibleSection
                            title='Student Yearly Attendance Report'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                            <GenericDataTable<IStudentYearlyAttendenceReportList>
                                {...tableProps}
                                ref={tableRef}
                                columns={columns}
                                isLoading={activePreadmissionDeLoading || isLoading}
                                error={error}
                                showViewOptions={false}
                                loadingMessage='Loading attendance report...'
                                noDataTitle='No Data Found'
                                noDataDescription='No attendance records found. Please select filters to view data.'
                                errorTitle='Error Loading Attendance Report'
                                onRowSelectionChange={handleSelectStudent}
                            />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
