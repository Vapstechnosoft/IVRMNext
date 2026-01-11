'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/apiService';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { type ITCCancelSearch, tcCancelColumns } from './_components/columns';

export default function StudentTCCancelPage() {
    const [data, setData] = useState<ITCCancelSearch[]>([]);
    const [selectedTC, setSelectedTC] = useState<ITCCancelSearch | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [studentDetails, setStudentDetails] = useState<any>(null);
    const [_rawStudentData, setRawStudentData] = useState<any>(null);
    const [remarks, setRemarks] = useState<string>('');

    // Fetch Academic Years
    const { data: academicYears } = useQuery({
        queryKey: ['academicYears'],
        queryFn: async () => {
            api.addBaseUrl('admission', '/api/admission');
            const response = await api.get<IAcademicYearDropDown[]>('admission', 'master_class_category/academic_year_drop_down_list');
            return response.data || [];
        }
    });

    // Fetch Students based on Academic Year
    const { data: students } = useQuery({
        queryKey: ['students', selectedYear],
        queryFn: async () => {
            if (!selectedYear) return [];
            const response = await api.get<any[]>('admission', `StudentTc/GetStudentsByAcademicYear?asmayId=${selectedYear}`);
            return response.data || [];
        },
        enabled: !!selectedYear
    });

    // Fetch Student Details when student is selected
    const { data: studentDetailsData, refetch: fetchStudentDetails } = useQuery({
        queryKey: ['studentDetails', selectedYear, selectedStudentId],
        queryFn: async () => {
            if (!selectedYear || !selectedStudentId) return null;
            const response = await api.post<any>(
                'admission',
                `StudentTc/OnStudentNameChange?ASMAY_Id=${selectedYear}&AMST_Id=${selectedStudentId}`,
                {}
            );

            // Extract student details from the response and store raw data
            const studentData = response.data?.getAdm_M_Student_Details?.[0];

            if (studentData) {
                // Store the complete raw data for save operation
                const fullData = {
                    raw: studentData,
                    display: {
                        studentName:
                            `${studentData.amsT_FirstName || ''} ${studentData.amsT_MiddleName || ''} ${studentData.amsT_LastName || ''}`.trim(),
                        admissionNo: studentData.amsT_AdmNo,
                        registrationNo: studentData.amsT_RegistrationNo,
                        joinedDetails: studentData.amsT_Date ? new Date(studentData.amsT_Date).toLocaleDateString() : 'N/A',
                        tcNo: 'N/A',
                        tcDate: 'N/A',
                        leftDetails: 'N/A',
                        studentPhoto: studentData.amsT_Photoname
                    }
                };
                return fullData;
            }
            return null;
        },
        enabled: false
    });

    // Update student details when data is fetched
    useEffect(() => {
        if (selectedStudentId && selectedYear) {
            fetchStudentDetails();
        } else {
            setStudentDetails(null);
        }
    }, [selectedStudentId, selectedYear]);

    useEffect(() => {
        if (studentDetailsData) {
            setStudentDetails(studentDetailsData.display);
            setRawStudentData(studentDetailsData.raw);
        }
    }, [studentDetailsData]);

    const handleSave = async () => {
        try {
            // Payload matching the curl example
            const payload = {
                mI_Id: 0,
                asmaY_Id: Number(selectedYear),
                amsT_Id: selectedStudentId, // Send as string, not number
                tC_CancelReason: remarks,
                userId: 'string'
            };

            const response = await api.post<any>('admission', 'StudentTc/SaveTccancel', payload);

            if (response.data?.returnval || response.data?.success || response.success) {
                handleClear(); // Clear the form after successful save
            }
        } catch (_error: any) {
            // Silent error handling
        }
    };

    const handleClear = () => {
        setSelectedYear('');
        setSelectedStudentId('');
        setStudentDetails(null);
        setRawStudentData(null);
        setRemarks('');
    };

    const _handleSearch = () => {
        setData([{ id: 1, tcAppNo: 'TC-2023-001', studentName: 'Mock Student', class: 'X', tcDate: '2023-10-01' }]);
        setSelectedTC(null);
    };

    const handleSelect = (tc: ITCCancelSearch) => {
        setSelectedTC(tc);
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
                <CollapsibleSection title='STUDENT TC CANCEL' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='grid grid-cols-1 items-center gap-6 md:grid-cols-2'>
                        {/* Academic Year */}
                        <div className='grid grid-cols-[auto_1fr] items-center gap-4'>
                            <Label htmlFor='academic-year-select' className='whitespace-nowrap text-right font-medium text-base'>
                                Academic Year:<span className='text-red-500'>*</span>
                            </Label>
                            <div>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger id='academic-year-select'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears?.map((year) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Student Name */}
                        <div className='grid grid-cols-[auto_1fr] items-center gap-4'>
                            <Label htmlFor='student-search' className='whitespace-nowrap text-right font-medium text-base'>
                                Student Name :<span className='text-red-500'>*</span>
                            </Label>
                            <div className='relative w-full'>
                                <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={!selectedYear}>
                                    <SelectTrigger id='student-search'>
                                        <SelectValue placeholder='Select Student' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students?.map((student: any, index: number) => (
                                            <SelectItem key={`${student.amsT_Id}-${index}`} value={student.amsT_Id.toString()}>
                                                {student.studentName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Student Details Section */}
                {studentDetails && (
                    <CollapsibleSection title='STUDENT DETAILS' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {/* Left Column - Student Information */}
                            <div className='space-y-3'>
                                <div className='grid grid-cols-[140px_1fr] items-center gap-2'>
                                    <span className='font-medium'>Student Name</span>
                                    <span className='font-medium'>: {studentDetails.studentName || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-[140px_1fr] items-center gap-2'>
                                    <span className='font-medium'>Admission No</span>
                                    <span>: {studentDetails.admissionNo || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-[140px_1fr] items-center gap-2'>
                                    <span className='font-medium'>Registration No</span>
                                    <span>: {studentDetails.registrationNo || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-[140px_1fr] items-center gap-2'>
                                    <span className='font-medium'>Joined Details</span>
                                    <span>: {studentDetails.joinedDetails || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-[140px_1fr] items-center gap-2'>
                                    <span className='font-medium'>TC No</span>
                                    <span>: {studentDetails.tcNo || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-[140px_1fr] items-center gap-2'>
                                    <span className='font-medium'>TC Date</span>
                                    <span>: {studentDetails.tcDate || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-[140px_1fr] items-center gap-2'>
                                    <span className='font-medium'>Left Details</span>
                                    <span>: {studentDetails.leftDetails || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Right Column - Student Photo and Remarks */}
                            <div className='space-y-4'>
                                <div className='flex justify-center'>
                                    <div className='h-32 w-32 overflow-hidden rounded border bg-gray-100'>
                                        {studentDetails.studentPhoto ? (
                                            <img src={studentDetails.studentPhoto} alt='Student' className='h-full w-full object-cover' />
                                        ) : (
                                            <div className='flex h-full w-full items-center justify-center text-gray-400'>
                                                <svg className='h-16 w-16' fill='currentColor' viewBox='0 0 20 20'>
                                                    <path
                                                        fillRule='evenodd'
                                                        d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                                                        clipRule='evenodd'
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='remarks' className='font-medium'>
                                        Remarks <span className='text-red-500'>*</span>
                                    </Label>
                                    <textarea
                                        id='remarks'
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className='flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                        placeholder='Enter remarks...'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save and Clear Buttons */}
                        <div className='mt-6 flex justify-center gap-4'>
                            <Button onClick={handleSave} className='px-8'>
                                SAVE
                            </Button>
                            <Button onClick={handleClear} variant='outline' className='px-8'>
                                CLEAR
                            </Button>
                        </div>
                    </CollapsibleSection>
                )}

                {/* Keeping the result table logical part below as it wasn't contradicted, just the top filter redesigned */}
                {data.length > 0 && !selectedTC && (
                    <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <GenericDataTable<ITCCancelSearch>
                            {...tableProps}
                            columns={tcCancelColumns(handleSelect)}
                            isLoading={false}
                            showViewOptions={false}
                            noDataTitle='No Active TCs Found'
                        />
                    </CollapsibleSection>
                )}

                {selectedTC && (
                    <CollapsibleSection
                        title={`Confirm Cancel TC: ${selectedTC.tcAppNo}`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg'>
                        <div className='space-y-4 p-4'>
                            <p>
                                Are you sure you want to cancel the Transfer Certificate application for{' '}
                                <strong>{selectedTC.studentName}</strong>?
                            </p>

                            <div className='space-y-2'>
                                <label htmlFor='tc-cancel-reason' className='font-medium text-sm'>
                                    Reason for Cancellation
                                </label>
                                <textarea id='tc-cancel-reason' className='flex h-20 w-full rounded-md border bg-background px-3 py-2' />
                            </div>

                            <div className='flex gap-4'>
                                <Button variant='destructive'>Confirm Cancellation</Button>
                                <Button variant='outline' onClick={() => setSelectedTC(null)}>
                                    Back
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
