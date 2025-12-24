'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
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

import { useStudentYearlyAttendance, useadmissionStudentsDropdown } from '@/hooks/admission/preadmission/useReports';
import { birthCertificateColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function BirthCertificatePageReport(props: {
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

    const handleFilterChange = (filterType: 'class' | 'section' | 'academic_year' | 'student', value: number) => {
        if (filterType === 'class') {
            setClassId(value);
            setSectionId(0);
            setStudentId(0);
        } else if (filterType === 'section') {
            setSectionId(value);
            setStudentId(0);
        } else if (filterType === 'academic_year') {
            setAcademicYearId(value);
        } else if (filterType === 'student') {
            setStudentId(value);
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
    const [studentId, setStudentId] = useState<number>(0);
    const [purpose, setPurpose] = useState<string>('');

    const [selectedStudents, setSelectedStudents] = useState<IStudentYearlyAttendenceReportList[]>([]);

    const {
        data: admissionSection,
        isLoading: admissionSectionLoading,
        isError: admissionSectionError
    } = useadmissionSectionDropdown(Number(classId));

    const {
        data: admissionStudents,
        isLoading: admissionStudentsLoading,
        isError: admissionStudentsError
    } = useadmissionStudentsDropdown(Number(academicYearId), Number(classId), Number(sectionId));

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

    const handleSelectStudent = (selectedRows: IStudentYearlyAttendenceReportList[]) => {
        setSelectedStudents(selectedRows);
    };

    const handleClear = () => {
        setAcademicYearId(0);
        setClassId(0);
        setSectionId(0);
        setStudentId(0);
        setPurpose('');
        setSelectedStudents([]);
        setShowReport(false);
        handleResetSelection();

        router.replace(pathname);

        toast.success('Filters cleared successfully');
    };

    const handleCancel = () => {
        setShowReport(false);
        setSelectedStudents([]);
        handleResetSelection();
        toast.info('Report cancelled');
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

    const handleGenerate = () => {
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

        if (!studentId || studentId === 0) {
            toast.error('Please select Student');
            return;
        }

        if (!purpose.trim()) {
            toast.error('Please enter Purpose');
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
                    title='Date of Birth Certificate Report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='no-print slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                            <div className='space-y-4'>
                                <div className='space-y-2'>
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

                                <div className='space-y-2'>
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

                                <div className='space-y-2'>
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

                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='student' className='font-medium text-gray-900 text-sm'>
                                        Student <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleFilterChange('student', Number(value))}
                                        value={studentId !== 0 ? studentId?.toString() : undefined}
                                        disabled={sectionId === 0}>
                                        <SelectTrigger id='student' className='w-full'>
                                            <SelectValue placeholder='Select Student' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {admissionStudentsLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : admissionStudentsError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading
                                                </SelectItem>
                                            ) : admissionStudents?.data?.length === 0 ? (
                                                <SelectItem value='no-data' disabled>
                                                    No students found
                                                </SelectItem>
                                            ) : (
                                                admissionStudents?.data?.map((item: any) => (
                                                    <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                        {item.studentName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='purpose' className='font-medium text-gray-900 text-sm'>
                                        Purpose <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        id='purpose'
                                        type='text'
                                        placeholder='Enter purpose'
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                onClick={handleGenerate}
                                className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                                <FileText className='mr-2 h-4 w-4' />
                                Generate
                            </Button>

                            <Button
                                variant='outline'
                                className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'
                                onClick={handleClear}>
                                <X className='mr-2 h-4 w-4' />
                                Clear
                            </Button>

                            {showReport && transformedData && transformedData.length > 0 && (
                                <Button
                                    variant='outline'
                                    className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'
                                    onClick={handlePrint}
                                    disabled={selectedStudents.length === 0}>
                                    <Printer className='mr-2 h-4 w-4' />
                                    Print
                                </Button>
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
                                columns={birthCertificateColumns}
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
