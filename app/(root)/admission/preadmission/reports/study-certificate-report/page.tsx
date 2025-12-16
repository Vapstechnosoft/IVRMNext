'use client';

import { format } from 'date-fns';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { DataTableRef } from '@/components/ui/data-table/data-table';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useAcademicYearDropdown, useMasterClassDropdown, useMasterSectionDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useStudyCertificateReport } from '@/hooks/admission/preadmission/useReports';
import { toast } from 'sonner';
import CharacterCertificate from './_components/columns';
import StudyCertificate from './_components/study-certificate';

export default function CertificateReportPage() {
    const tableRef = useRef<DataTableRef>(null);

    /* -------------------- Masters -------------------- */
    const { data: academicYear } = useAcademicYearDropdown();
    const { data: masterClass } = useMasterClassDropdown();
    const { data: masterSection } = useMasterSectionDropdown();

    /* -------------------- UI State -------------------- */
    const [studentScope, setStudentScope] = useState<'all' | 'individual'>('all');

    const [studentStatus, setStudentStatus] = useState<'studying' | 'left' | 'deactive'>('studying');

    const [certificateType, setCertificateType] = useState<'SC' | 'CC'>('SC');

    const [addressType, setAddressType] = useState<'permanent' | 'communication'>('permanent');

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [showCertificate, setShowCertificate] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);
    const [dateOpen, setDateOpen] = useState(false);

    const studyCertificate = {
        ASMAY_Id: academicYearId,
        ASMCL_Id: classId,
        ASMC_Id: sectionId,
        AMST_Id: studentId,
        ASCISS_CertificateFlg: certificateType
    };
    const { refetch } = useStudyCertificateReport(studyCertificate, false);

    /* -------------------- Actions -------------------- */
    const handleReport = async () => {
        if (!academicYearId || !classId || !sectionId || !selectedDate) {
            toast.error('Please select Academic Year, Class, Section and Date');
            return;
        }

        try {
            setIsLoading(true); // 🔄 start loader
            setShowCertificate(false);
            // setStudents([]);

            const res = await refetch();

            const studentList = res.data?.data?.studentList ?? [];

            if (studentList.length > 0) {
                // setStudents(studentList);
                setStudentData(studentList);
                setShowCertificate(true);
            }
        } catch (error) {
            toast.error('Report error:' + (error as Error).message);
        } finally {
            setIsLoading(false); // ✅ stop loader
        }
    };

    const handleReset = () => {
        setStudentScope('all');
        setStudentStatus('studying');
        setCertificateType('SC');
        setAddressType('permanent');

        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentId(null);
        setQrCode('');
        setSelectedDate(new Date());

        tableRef.current?.resetSelection();
    };

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen p-4'>
            <CollapsibleSection
                title='Add New Student Count Report'
                description='Fill in the details below to Student Count Report'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                <div className='space-y-6 rounded-xl border bg-white p-6 shadow-lg'>
                    {/* Row 1 */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <RadioGroup
                            value={studentScope}
                            onValueChange={(v) => setStudentScope(v as any)}
                            className='flex justify-center gap-6 rounded-lg border p-3'>
                            <RadioGroupItem value='all' />
                            <Label>All</Label>
                            <RadioGroupItem value='individual' />
                            <Label>Individual</Label>
                        </RadioGroup>

                        <RadioGroup
                            value={studentStatus}
                            onValueChange={(v) => setStudentStatus(v as any)}
                            className='flex justify-center gap-6 rounded-lg border p-3'>
                            <RadioGroupItem value='studying' />
                            <Label>Studying</Label>
                            <RadioGroupItem value='left' />
                            <Label>Left</Label>
                            <RadioGroupItem value='deactive' />
                            <Label>Deactive</Label>
                        </RadioGroup>

                        <RadioGroup
                            value={certificateType}
                            onValueChange={(v) => setCertificateType(v as any)}
                            className='flex justify-center gap-6 rounded-lg border p-3'>
                            <RadioGroupItem value='SC' />
                            <Label>Study Certificate</Label>
                            <RadioGroupItem value='CC' />
                            <Label>Character Certificate</Label>
                        </RadioGroup>
                    </div>

                    {/* Row 2 */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                            <div>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(v) => setAcademicYearId(Number(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYear?.data?.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(v) => setClassId(Number(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {masterClass?.data?.map((item) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(v) => setSectionId(Number(v))} disabled={!classId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {masterSection?.data?.map((item) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <div>
                                <Label>
                                    Date <span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='w-full justify-start'>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Select Date'}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent align='start' className='p-0'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={selectedDate || undefined}
                                            onDayClick={(date) => {
                                                setSelectedDate(date);
                                                setDateOpen(false); // ✅ auto close
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label>
                                    Student <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(v) => setStudentId(Number(v))} disabled={studentScope === 'all'}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Student' />
                                    </SelectTrigger>
                                </Select>
                            </div>
                        </div>

                        {/* Row 3 */}

                        <div>
                            <Label>QR Code</Label>
                            <input
                                value={qrCode}
                                onChange={(e) => setQrCode(e.target.value)}
                                className='w-full rounded-md border px-3 py-2'
                                placeholder='Scan QR Code'
                            />
                        </div>

                        {/* Address */}
                        <div className=''>
                            <RadioGroup
                                value={addressType}
                                onValueChange={(v) => setAddressType(v as any)}
                                className='flex justify-center gap-6 rounded-lg border p-3'>
                                <RadioGroupItem value='permanent' />
                                <Label>Permanent Address</Label>
                                <RadioGroupItem value='communication' />
                                <Label>Communication Address</Label>
                            </RadioGroup>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='flex justify-center gap-4 border-t pt-4'>
                        <Button onClick={handleReport} className='w-fit' disabled={isLoading}>
                            {isLoading ? (
                                <span className='flex items-center gap-2'>
                                    <RotateCcw className='h-4 w-4 animate-spin' />
                                    Loading...
                                </span>
                            ) : (
                                'REPORT'
                            )}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleReset}
                            className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                            Reset
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>
            <div className='mt-5'>
                <CollapsibleSection
                    title='Add New Student Count Report'
                    description='Fill in the details below to Student Count Report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    {showCertificate && studentData && (
                        <div className='mt-6'>
                            {certificateType === 'SC' ? (
                                <StudyCertificate
                                    data={studentData}
                                    selectedDate={selectedDate ? format(selectedDate, 'dd-MM-yyyy') : undefined}
                                />
                            ) : (
                                <CharacterCertificate data={studentData} />
                            )}
                        </div>
                    )}
                </CollapsibleSection>
            </div>
        </div>
    );
}
