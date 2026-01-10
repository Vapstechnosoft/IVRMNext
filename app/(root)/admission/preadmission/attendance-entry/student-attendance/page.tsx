'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterClassDropdown } from '@/hooks/admission/preadmission/useMasters';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { type IStudentAttendance, studentAttendanceColumns } from './_components/columns';

export default function StudentAttendancePage() {
    const [data, setData] = useState<IStudentAttendance[]>([]);
    const [searched, setSearched] = useState(false);

    // State for selections
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');

    // Fetch Masters
    const { data: academicYears } = useAcademicYearDropdown();
    const { data: classes } = useMasterClassDropdown();

    const handleSearch = () => {
        // Mock fetching data based on selection
        setData([
            { id: 1, studentName: 'John Doe', rollNo: '101', admNo: 'A001', status: 'Present' },
            { id: 2, studentName: 'Jane Smith', rollNo: '102', admNo: 'A002', status: 'Absent' },
            { id: 3, studentName: 'Sameer', rollNo: '103', admNo: 'A003', status: 'Present' }
        ]);
        setSearched(true);
    };

    const tableProps = {
        data: data,
        totalItems: data.length,
        isLoading: false,
        error: null,
        success: true
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection title='ATTENDANCE ENTRY' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='grid grid-cols-1 gap-6'>
                        {/* Left Column for Inputs */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                <Label htmlFor='academic-year' className='text-left font-medium text-sm md:text-right'>
                                    Academic Year: <span className='text-red-500'>*</span>
                                </Label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger id='academic-year' className='border-purple-500'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears?.data?.map((year) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Class */}
                            <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                <Label htmlFor='class-select' className='text-left font-medium text-sm md:text-right'>
                                    Class: <span className='text-red-500'>*</span>
                                </Label>
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger id='class-select' className='border-blue-400'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes?.data?.map((cls) => (
                                            <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                {cls.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex justify-end pt-2'>
                                <Button onClick={handleSearch} className='bg-orange-600 text-white hover:bg-orange-700'>
                                    <Search className='mr-2 h-4 w-4' /> Search
                                </Button>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {searched && (
                    <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <GenericDataTable<IStudentAttendance>
                            {...tableProps}
                            columns={studentAttendanceColumns}
                            isLoading={false}
                            showViewOptions={false}
                            loadingMessage='Loading students...'
                            noDataTitle='No Students Found'
                            noDataDescription='Try changing filters'
                        />
                        <div className='flex justify-end pt-4'>
                            <Button>Save Attendance</Button>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
