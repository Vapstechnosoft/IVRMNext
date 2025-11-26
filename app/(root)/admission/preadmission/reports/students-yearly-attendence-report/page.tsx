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
    usePreadmissionAdmissionStatusDropdown,
    usePreadmissionClassDropdown,
    usePreadmissionStudentList
} from '@/hooks/admission/preadmission/useTransactions';

import { updateStudentPreadmissionStatus } from '@/server/admission/preadmission/transactions/transfer_preadmission_status';
import type { IStudentYearlyAttendenceReportList } from '@/types/admission/preadmission/reports';
import { CheckSquare, FileSpreadsheet, FileText, Printer, RotateCcw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { use, useRef, useState } from 'react';
import { toast } from 'sonner';
import { studentsYearlyAttendenceReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentsYearlyAttendenceReport(props: { searchParams: SearchParams }) {
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

    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<IStudentYearlyAttendenceReportList[]>([]);

    const {
        data: response,
        isLoading,
        error,
        refetch: refetchAdmissionStudents
    } = usePreadmissionStudentList((academicYearId || activePreadmission?.data?.asmaY_Id) ?? 0, classId, statusId, searchParams);
    const tableProps = useDataTableProps(response);

    const onUpdateAdmissionStatusClose = () => {
        refetchAdmissionStudents();
        setIsStatusDialogOpen(false);
        setSelectedStudents([]);
        handleResetSelection();
    };

    const handleAdmissionStatusUpdate = async (updates: Array<{ pasr_id: number; status_id: number; remarks: string }>) => {
        try {
            const response = await updateStudentPreadmissionStatus(updates);
            if (response.success === true) {
                toast.success(response.message);
                onUpdateAdmissionStatusClose();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(`Error updating status ${error}`);
        }
    };

    const handleSelectStudent = (selectedRows: IStudentYearlyAttendenceReportList[]) => {
        setSelectedStudents(selectedRows);
    };

    const handleDeselectStudent = (pasrId: number) => {
        setSelectedStudents((prev) => prev.filter((student) => student.pasr_id !== pasrId));
    };

    const handleReset = () => {
        setAcademicYearId(0);
        setClassId(0);
        setStatusId(0);
        setSelectedStudents([]);
        handleResetSelection();

        // Reset URL params
        router.replace(pathname);

        toast.success('Filters reset successfully');
    };

    const handleExportExcel = () => {
        if (!response?.data || response.data.length === 0) {
            toast.error('No data available to export');
            return;
        }

        // Implement Excel export logic here
        toast.info('Excel export feature coming soon');
    };

    const handlePrint = () => {
        if (!response?.data || response.data.length === 0) {
            toast.error('No data available to print');
            return;
        }

        window.print();
    };

    const handleReport = () => {
        if (!response?.data || response.data.length === 0) {
            toast.error('No data available to generate report');
            return;
        }

        // Placeholder for report generation logic — currently opens print preview
        toast.info('Generating report...');
        window.print();
    };

    return (
        <div className='min-h-screen'>
            {/* Header */}
            <div className='mb-3 flex w-fit flex-col gap-4 rounded-xl border p-4 shadow-xl'>
                {/* Filter Options */}
                <div className='flex flex-wrap justify-start gap-6'>
                    {/* Academic Year Filter */}
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

                    {/* Class Filter */}
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

                    {/* Section Filter */}
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
                </div>
                <div className='flex w-full flex-wrap items-center gap-3'>
                    <Button type='button' onClick={handleReport} className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <FileText className='mr-2 h-4 w-4' />
                        Report
                    </Button>

                    <Button type='button' onClick={handleReset} className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>

                    <div className='flex gap-3'>
                        <Button variant='outline' className='w-fit' onClick={handleExportExcel}>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            Export to Excel
                        </Button>
                        <Button variant='outline' className='w-fit' onClick={handlePrint}>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    </div>
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
                        columns={studentsYearlyAttendenceReportColumns}
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
