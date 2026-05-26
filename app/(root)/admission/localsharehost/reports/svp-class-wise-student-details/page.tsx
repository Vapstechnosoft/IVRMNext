'use client';

import { FileSpreadsheet, Loader2, Printer, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
    useSVPClassByYear,
    useSVPClassWiseInitialData,
    useSVPClassWiseReportDetails,
    useSVPSectionByClass
} from '@/hooks/admission/preadmission/useSVPClassWiseStudentDetails';

const HEADER_FIELDS = [
    { id: 'AMST_FirstName', value: 'Student Name' },
    { id: 'AMST_AdmNo', value: 'Adm. No.' },
    { id: 'AMAY_RollNo', value: 'Roll No.' },
    { id: 'AMST_RegistrationNo', value: 'Reg. No.' },
    { id: 'ASMCL_ClassName', value: 'Current Trade' },
    { id: 'ASMC_SectionName', value: 'Current Unit' },
    { id: 'JoinedYear', value: 'JoinedYear' },
    { id: 'JoinedClass', value: 'JoinedClass' },
    { id: 'AMST_Sex', value: 'Gender' },
    { id: 'AMST_BloodGroup', value: 'Blood Group' },
    { id: 'AMST_MotherTongue', value: 'Mother Tongue' },
    { id: 'AMST_MobileNo', value: 'Phone No.' },
    { id: 'AMST_emailId', value: 'Email ID' },
    { id: 'AMST_PerAdd3', value: 'Permanent Address' },
    { id: 'AMST_ConCity', value: 'Present Address' },
    { id: 'IVRMMC_Nationality', value: 'Nationality' },
    { id: 'AMST_BiometricId', value: 'Biometric Code' },
    { id: 'AMST_Date', value: 'DOA' },
    { id: 'AMST_DOB', value: 'DOB' },
    { id: 'AMST_DOB_Words', value: 'DOB(Words)' },
    { id: 'PASR_Age', value: 'Age' },
    { id: 'AMST_Photoname', value: 'Student Photo' },
    { id: 'IMC_CasteName', value: 'Caste' },
    { id: 'IMCC_CategoryName', value: 'Caste Category' },
    { id: 'AMC_Name', value: 'Category' },
    { id: 'IVRMMR_Name', value: 'Religion' },
    { id: 'AMST_PerStreet', value: 'Street' },
    { id: 'AMST_PerCity', value: 'Town' },
    { id: 'IVRMMS_Name', value: 'State' },
    { id: 'AMST_FatherName', value: 'Father Name' },
    { id: 'AMST_FatherMobleNo', value: 'Father Mobile Number' },
    { id: 'AMST_FatheremailId', value: 'Father Email Id' },
    { id: 'AMST_FatherOccupation', value: 'Father Occupation' },
    { id: 'AMST_FatherMonIncome', value: 'Father Income' },
    { id: 'AMST_FatherEducation', value: 'Father Qualification' },
    { id: 'AMST_MotherName', value: 'Mother Name' },
    { id: 'AMST_MotherMobileNo', value: 'Mother Mobile Number' },
    { id: 'AMST_MotherEmailId', value: 'Mother Email Id' },
    { id: 'AMST_MotherOccupation', value: 'Mother Occupation' },
    { id: 'AMST_MotherMonIncome', value: 'Mother’s Income' },
    { id: 'AMST_MotherEducation', value: 'Mother Qualification' },
    { id: 'AMST_AadharNo', value: 'Aadhar Card Number' },
    { id: 'AMST_Tpin', value: 'Tpin' },
    { id: 'AMST_GovtAdmno', value: 'GovtAdmno' },
    { id: 'AMST_BPLCardNo', value: 'GovtNo' },
    { id: 'AMST_BirthPlace', value: 'Place Of Birth' },
    { id: 'AMSTPS_PrvSchoolName', value: 'Previous School Name' },
    { id: 'AMSTPS_PreviousClass', value: 'Previous Class' },
    { id: 'AMSTPS_PrvTCDate', value: 'Previous TC Date' },
    { id: 'AMSTPS_PrvTCNO', value: 'Previous TCNo' },
    { id: 'AMST_Village', value: 'Village' },
    { id: 'AMST_Town', value: 'Town' },
    { id: 'AMST_Taluk', value: 'Taluk' },
    { id: 'IVRMMD_Name', value: 'District' },
    { id: 'AMST_PlaceOfBirthState', value: 'State' },
    { id: 'AMST_PlaceOfBirthCountry', value: 'Country' },
    { id: 'SPCCMH_HouseName', value: 'House' },
    { id: 'Electives', value: 'Electives' },
    { id: 'AMST_PENNo', value: 'Pen No' },
    { id: 'Integrated', value: 'Integrated' },
    { id: 'PrevSchool', value: 'PrevSchool' },
    { id: 'Board', value: 'Board' },
    { id: 'Remarks', value: 'Remarks' },
    { id: 'ApaarNo', value: 'ApaarNo' }
];

export default function SVPClassWiseStudentDetailsPage() {
    // Hooks
    const { data: initialData, isLoading: isInitialLoading } = useSVPClassWiseInitialData();
    const classByYearMutation = useSVPClassByYear();
    const sectionByClassMutation = useSVPSectionByClass();
    const reportDetailsMutation = useSVPClassWiseReportDetails();

    // Initial Data Effect
    useEffect(() => {
        if (initialData?.success && initialData?.data) {
            const data = initialData.data;
            if (data.academicListdefault?.length > 0) {
                setAcademicYearId(data.academicListdefault[0].asmaY_Id);
            }
            if (data.studentList) {
                setClassList(data.studentList);
            }
            if (data.fillsection) {
                setSectionList(
                    data.fillsection.map((s: any) => ({
                        ...s,
                        ASMS_Id: s.ASMS_Id ?? s.asmS_Id,
                        ASMC_SectionName: s.ASMC_SectionName ?? s.asmC_SectionName
                    }))
                );
            }
        }
    }, [initialData]);

    // Filter State
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [shiftId, setShiftId] = useState('0');
    const [admissionType, setAdmissionType] = useState('newad');
    const [reportFormat, setReportFormat] = useState('0'); // 0: Table, 1: Kendo
    const [selectedColumns, setSelectedColumns] = useState<string[]>(HEADER_FIELDS.map((f) => f.id));

    // Search States for Multiselects
    const [classSearch, setClassSearch] = useState('');
    const [sectionSearch, setSectionSearch] = useState('');
    const [columnSearch, setColumnSearch] = useState('');

    // Data States
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [reportColumns, setReportColumns] = useState<any[]>([]);
    const [showGrid, setShowGrid] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');

    // Row Selection for Print/Export
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    // Filtered Lists
    const filteredClassList = useMemo(
        () => classList.filter((c) => c.asmcL_ClassName.toLowerCase().includes(classSearch.toLowerCase())),
        [classList, classSearch]
    );

    const filteredSectionList = useMemo(
        () =>
            sectionList.filter((s) => (s.ASMC_SectionName || s.asmC_SectionName || '').toLowerCase().includes(sectionSearch.toLowerCase())),
        [sectionList, sectionSearch]
    );

    const filteredHeaderFields = useMemo(
        () => HEADER_FIELDS.filter((f) => f.value.toLowerCase().includes(columnSearch.toLowerCase())),
        [columnSearch]
    );

    const filteredStudents = useMemo(() => {
        if (!studentSearch) return students;
        return students.filter((s) => Object.values(s).some((val) => String(val).toLowerCase().includes(studentSearch.toLowerCase())));
    }, [students, studentSearch]);

    // Reusable Section Fetcher
    const fetchSections = async (yearId: number, classIds: number[]) => {
        if (yearId && classIds.length > 0) {
            try {
                const res = await sectionByClassMutation.mutateAsync({
                    asmaY_Id: yearId,
                    classlsttwo: classIds.map((id) => ({ asmcL_Id: id, asmS_Id: 0 }))
                });
                if (res?.data?.studentList) {
                    setSectionList(
                        res.data.studentList.map((s: any) => ({
                            ...s,
                            ASMS_Id: s.ASMS_Id ?? s.asmS_Id,
                            ASMC_SectionName: s.ASMC_SectionName ?? s.asmC_SectionName
                        }))
                    );
                }
            } catch (_error) {
                toast.error('Failed to load sections');
            }
        } else {
            setSectionList([]);
            setSelectedSections([]);
        }
    };

    // Handlers
    const handleYearChange = async (yearId: number) => {
        setAcademicYearId(yearId);
        try {
            const res = await classByYearMutation.mutateAsync(yearId);
            if (res?.data?.studentList) {
                setClassList(res.data.studentList);
            }
            // Refetch sections for currently selected classes with new year
            if (selectedClasses.length > 0) {
                await fetchSections(yearId, selectedClasses);
            }
        } catch (_error) {
            toast.error('Failed to load classes');
        }
    };

    const handleClassToggle = async (classId: number) => {
        let newSelected;
        if (selectedClasses.includes(classId)) {
            newSelected = selectedClasses.filter((id) => id !== classId);
        } else {
            newSelected = [...selectedClasses, classId];
        }
        setSelectedClasses(newSelected);

        if (newSelected.length > 0 && academicYearId) {
            await fetchSections(academicYearId, newSelected);
        } else {
            setSectionList([]);
            setSelectedSections([]);
        }
    };

    const handleAllClassesToggle = async (checked: boolean) => {
        const newSelected = checked ? classList.map((c) => c.asmcL_Id) : [];
        setSelectedClasses(newSelected);

        if (newSelected.length > 0 && academicYearId) {
            await fetchSections(academicYearId, newSelected);
        } else {
            setSectionList([]);
            setSelectedSections([]);
        }
    };

    const handleSectionToggle = (sectionId: number) => {
        if (selectedSections.includes(sectionId)) {
            setSelectedSections(selectedSections.filter((id) => id !== sectionId));
        } else {
            setSelectedSections([...selectedSections, sectionId]);
        }
    };

    const handleAllSectionsToggle = (checked: boolean) => {
        setSelectedSections(checked ? sectionList.map((s) => s.ASMS_Id) : []);
    };

    const handleColumnToggle = (columnId: string) => {
        if (selectedColumns.includes(columnId)) {
            setSelectedColumns(selectedColumns.filter((id) => id !== columnId));
        } else {
            setSelectedColumns([...selectedColumns, columnId]);
        }
    };

    const handleAllColumnsToggle = (checked: boolean) => {
        setSelectedColumns(checked ? HEADER_FIELDS.map((f) => f.id) : []);
    };

    const handleGenerateReport = async () => {
        if (!academicYearId || selectedClasses.length === 0 || selectedSections.length === 0) {
            toast.error('Please select Year, Class and Section');
            return;
        }

        try {
            setIsGenerating(true);
            setShowGrid(false);

            const payload = {
                ASMAY_Id: academicYearId!,
                classlsttwo: selectedClasses.map((id) => ({ ASMCL_Id: id, ASMS_Id: 0 })),
                sectionlistarray: selectedSections.map((id) => {
                    const sec = sectionList.find((s) => s.ASMS_Id === id);
                    return { ASMS_Id: id, ASMCL_Id: sec?.asmcL_Id || 0 };
                }),
                TempararyArrayheadList: selectedColumns.map((id) => ({
                    columnID: id,
                    columnName: HEADER_FIELDS.find((f) => f.id === id)?.value || id
                })),
                flag: admissionType,
                AMC_Id: 0,
                Concession_Id: shiftId.toString()
            };

            const res = await reportDetailsMutation.mutateAsync(payload);

            if (res?.data?.alldatagridreport && res.data.alldatagridreport.length > 0) {
                // Formatting data as per legacy logic
                const formattedStudents = res.data.alldatagridreport.map((s: any) => {
                    const formatted = { ...s };
                    if (formatted.AMST_FirstName) {
                        formatted.AMST_FirstName = formatted.AMST_FirstName.replace(/ {2,}/g, ' ');
                    }
                    // Handle 'Not Available' fields
                    [
                        'AMST_FatherOccupation',
                        'AMST_MotherOccupation',
                        'AMST_FatherEducation',
                        'AMST_MotherEducation',
                        'AMST_BirthPlace',
                        'ApaarNo'
                    ].forEach((key) => {
                        if (formatted[key] === '0' || formatted[key] === undefined) {
                            formatted[key] = 'Not Available';
                        }
                    });
                    return formatted;
                });

                setStudents(formattedStudents);
                setReportColumns(res.data.tempararyArrayheadList || []);
                setShowGrid(true);
                setSelectedRows([]);
            } else {
                toast.error('No records found');
            }
        } catch (_error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportExcel = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select records to export');
            return;
        }

        const exportData = filteredStudents
            .filter((_, idx) => selectedRows.includes(idx))
            .map((s, idx) => {
                const row: any = { 'SL No': idx + 1 };
                reportColumns.forEach((col) => {
                    row[col.columnName] = s[col.columnID];
                });
                return row;
            });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, 'Classwise_Student_Details.xlsx');
    };

    const handlePrint = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select records to print');
            return;
        }
        window.print();
    };

    const handleClear = () => {
        setAcademicYearId(null);
        setSelectedClasses([]);
        setSelectedSections([]);
        setShiftId('0');
        setAdmissionType('newad');
        setShowGrid(false);
        setStudents([]);
        setClassList([]);
        setSectionList([]);
    };

    const toggleRowSelection = (index: number) => {
        if (selectedRows.includes(index)) {
            setSelectedRows(selectedRows.filter((i) => i !== index));
        } else {
            setSelectedRows([...selectedRows, index]);
        }
    };

    const toggleAllRows = (checked: boolean) => {
        setSelectedRows(checked ? filteredStudents.map((_, i) => i) : []);
    };

    return (
        <div className='min-h-screen space-y-6 bg-gray-50 p-4 print:bg-white print:p-0'>
            <CollapsibleSection
                title='CLASSWISE STUDENT DETAILS'
                description='View and export class-wise student reports with custom fields'
                defaultOpen={true}
                variant='outline'
                className='shadow-md print:hidden'>
                <div className='space-y-8 rounded-lg bg-white p-6'>
                    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                        {/* Left Side Filters */}
                        <div className='space-y-6'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => handleYearChange(Number(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialData?.data?.fillyear?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-start gap-4'>
                                <Label className='mt-2 font-bold text-sm'>
                                    Trade Name (Class):<span className='text-red-500'>*</span>
                                </Label>
                                <div className='space-y-2 rounded-md border p-2'>
                                    <Input
                                        placeholder='Search here...'
                                        value={classSearch}
                                        onChange={(e) => setClassSearch(e.target.value)}
                                        className='h-8 text-xs'
                                    />
                                    <ScrollArea className='h-40'>
                                        <div className='space-y-2 p-1'>
                                            <div className='mb-2 flex items-center space-x-2 border-b pb-2'>
                                                <Checkbox
                                                    id='cls-all'
                                                    checked={selectedClasses.length === classList.length && classList.length > 0}
                                                    onCheckedChange={handleAllClassesToggle}
                                                />
                                                <Label htmlFor='cls-all' className='cursor-pointer font-bold text-xs'>
                                                    All
                                                </Label>
                                            </div>
                                            {filteredClassList.map((item) => (
                                                <div key={item.asmcL_Id} className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id={`cls-${item.asmcL_Id}`}
                                                        checked={selectedClasses.includes(item.asmcL_Id)}
                                                        onCheckedChange={() => handleClassToggle(item.asmcL_Id)}
                                                    />
                                                    <Label htmlFor={`cls-${item.asmcL_Id}`} className='cursor-pointer text-xs'>
                                                        {item.asmcL_ClassName}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            {selectedClasses.length > 0 && (
                                <div className='fade-in slide-in-from-top-2 grid animate-in grid-cols-[140px_1fr] items-start gap-4 duration-300'>
                                    <Label className='mt-2 font-bold text-sm'>
                                        Unit (Section):<span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='space-y-2 rounded-md border bg-white/50 p-2'>
                                        <Input
                                            placeholder='Search here...'
                                            value={sectionSearch}
                                            onChange={(e) => setSectionSearch(e.target.value)}
                                            className='h-8 text-xs'
                                        />
                                        <ScrollArea className='h-40'>
                                            <div className='space-y-2 p-1'>
                                                <div className='mb-2 flex items-center space-x-2 border-b pb-2'>
                                                    <Checkbox
                                                        id='sec-all'
                                                        checked={selectedSections.length === sectionList.length && sectionList.length > 0}
                                                        onCheckedChange={handleAllSectionsToggle}
                                                    />
                                                    <Label htmlFor='sec-all' className='cursor-pointer font-bold text-xs'>
                                                        All
                                                    </Label>
                                                </div>
                                                {filteredSectionList.map((item) => (
                                                    <div key={item.ASMS_Id} className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id={`sec-${item.ASMS_Id}`}
                                                            checked={selectedSections.includes(item.ASMS_Id)}
                                                            onCheckedChange={() => handleSectionToggle(item.ASMS_Id)}
                                                        />
                                                        <Label htmlFor={`sec-${item.ASMS_Id}`} className='cursor-pointer text-xs'>
                                                            {item.ASMC_SectionName}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            )}

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>Shift Name:</Label>
                                <Select value={shiftId} onValueChange={setShiftId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Shift' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>--Select--</SelectItem>
                                        {initialData?.data?.concession?.map((item: any) => (
                                            <SelectItem key={item.fmcC_Id} value={item.fmcC_Id.toString()}>
                                                {item.fmcC_ConcessionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Side Filters */}
                        <div className='space-y-6'>
                            <div className='grid grid-cols-[140px_1fr] items-start gap-4'>
                                <Label className='mt-2 font-bold text-sm'>
                                    Select Columns:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='space-y-2 rounded-md border p-2'>
                                    <Input
                                        placeholder='Search columns...'
                                        value={columnSearch}
                                        onChange={(e) => setColumnSearch(e.target.value)}
                                        className='h-8 text-xs'
                                    />
                                    <ScrollArea className='h-[400px]'>
                                        <div className='space-y-2 p-1'>
                                            <div className='mb-2 flex items-center space-x-2 border-b pb-2'>
                                                <Checkbox
                                                    id='col-all'
                                                    checked={selectedColumns.length === HEADER_FIELDS.length}
                                                    onCheckedChange={handleAllColumnsToggle}
                                                />
                                                <Label htmlFor='col-all' className='cursor-pointer font-bold text-xs'>
                                                    Select All
                                                </Label>
                                            </div>
                                            {filteredHeaderFields.map((item) => (
                                                <div key={item.id} className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id={`col-${item.id}`}
                                                        checked={selectedColumns.includes(item.id)}
                                                        onCheckedChange={() => handleColumnToggle(item.id)}
                                                    />
                                                    <Label htmlFor={`col-${item.id}`} className='cursor-pointer text-xs'>
                                                        {item.value}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            <div className='space-y-4 pt-4'>
                                <div className='rounded-lg border border-blue-100 bg-blue-50/50 p-3'>
                                    <RadioGroup
                                        value={admissionType}
                                        onValueChange={setAdmissionType}
                                        className='flex flex-wrap justify-center gap-4'>
                                        {['newad', 'totstd', 'prom', 'yrloss', 'deact'].map((type) => (
                                            <div key={type} className='flex items-center space-x-1'>
                                                <RadioGroupItem value={type} id={`type-${type}`} />
                                                <Label htmlFor={`type-${type}`} className='font-bold text-[10px] capitalize'>
                                                    {type === 'newad'
                                                        ? 'New Admission'
                                                        : type === 'totstd'
                                                          ? 'Total Students'
                                                          : type === 'prom'
                                                            ? 'Promoted'
                                                            : type === 'yrloss'
                                                              ? 'Year Loss'
                                                              : 'Deactivated'}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className='rounded-lg border border-green-100 bg-green-50/50 p-3'>
                                    <RadioGroup value={reportFormat} onValueChange={setReportFormat} className='flex justify-center gap-8'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='0' id='fmt-table' />
                                            <Label htmlFor='fmt-table' className='font-bold text-xs'>
                                                Table Format
                                            </Label>
                                        </div>
                                        <div className='flex cursor-not-allowed items-center space-x-2 opacity-50'>
                                            <RadioGroupItem value='1' id='fmt-kendo' disabled />
                                            <Label htmlFor='fmt-kendo' className='font-bold text-xs'>
                                                Kendo Format (Coming Soon)
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-wrap justify-center gap-4 border-t pt-6 font-sans'>
                        <Button
                            onClick={handleGenerateReport}
                            disabled={isGenerating || !academicYearId}
                            className='min-w-[140px] bg-indigo-600 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-200'>
                            {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        <Button onClick={handleClear} variant='destructive' className='min-w-[140px] font-bold uppercase tracking-wider'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePrint}
                            disabled={!showGrid || selectedRows.length === 0}
                            variant='outline'
                            className='min-w-[140px] border-2 border-primary font-bold text-primary uppercase tracking-wider hover:bg-primary/5'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                        <Button
                            onClick={handleExportExcel}
                            disabled={!showGrid || selectedRows.length === 0}
                            className='min-w-[140px] bg-green-600 font-bold text-white hover:bg-green-700'>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            Excel
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Grid Section */}
            {showGrid && (
                <div className='space-y-4 rounded-lg bg-white p-6 shadow-md'>
                    <div className='flex flex-wrap items-center justify-between gap-4'>
                        <div className='flex items-center gap-4'>
                            <h3 className='font-bold text-indigo-700 text-lg uppercase'>Classwise Student Details</h3>
                            <Badge variant='secondary' className='text-sm'>
                                Total: {students.length}
                            </Badge>
                            <Badge variant='outline' className='bg-indigo-50 text-sm'>
                                Selected: {selectedRows.length}
                            </Badge>
                        </div>
                        <div className='flex w-full max-w-sm items-center gap-2 print:hidden'>
                            <Search className='h-4 w-4 text-gray-400' />
                            <Input
                                placeholder='Search in results...'
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className='h-9'
                            />
                        </div>
                    </div>

                    <div className='overflow-x-auto rounded-md border print:overflow-visible'>
                        <Table className='min-w-max border-collapse'>
                            <TableHeader className='sticky top-0 z-10 bg-gray-50/80 print:static'>
                                <TableRow>
                                    <TableHead className='w-12 border text-center print:hidden'>
                                        <Checkbox
                                            checked={selectedRows.length === filteredStudents.length && filteredStudents.length > 0}
                                            onCheckedChange={toggleAllRows}
                                        />
                                    </TableHead>
                                    <TableHead className='w-16 border text-center font-bold'>SL.No</TableHead>
                                    {reportColumns.map((col) => (
                                        <TableHead key={col.columnID} className='border px-4 text-center font-bold'>
                                            {col.columnName}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((row, idx) => (
                                    <TableRow key={idx} className={selectedRows.includes(idx) ? 'bg-indigo-50/30' : ''}>
                                        <TableCell className='border text-center print:hidden'>
                                            <Checkbox
                                                checked={selectedRows.includes(idx)}
                                                onCheckedChange={() => toggleRowSelection(idx)}
                                            />
                                        </TableCell>
                                        <TableCell className='border text-center font-medium'>{idx + 1}</TableCell>
                                        {reportColumns.map((col) => (
                                            <TableCell key={col.columnID} className='max-w-[200px] break-words border text-center text-xs'>
                                                {col.columnID === 'AMST_Photoname' ? (
                                                    <div className='flex justify-center p-1'>
                                                        <img
                                                            src={row[col.columnID]}
                                                            alt='Photo'
                                                            className='h-16 w-16 rounded border bg-gray-50 object-cover shadow-sm'
                                                            onError={(e) => {
                                                                (e.target as any).src = 'https://via.placeholder.com/100?text=No+Photo';
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    row[col.columnID] || '-'
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Print Layout (Hidden in UI) */}
            <div className='hidden font-serif text-[10px] print:block'>
                <div className='mb-4 text-center'>
                    <h2 className='font-bold text-xl uppercase underline'>Classwise Student Details</h2>
                    <p className='mt-1'>Year: {initialData?.data?.fillyear?.find((y: any) => y.asmaY_Id === academicYearId)?.asmaY_Year}</p>
                </div>
                <Table className='w-full border-collapse border border-black'>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-8 border border-black p-1 text-center font-bold'>SL.No</TableHead>
                            {reportColumns.map((col) => (
                                <TableHead key={col.columnID} className='border border-black p-1 text-center font-bold'>
                                    {col.columnName}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents
                            .filter((_, idx) => selectedRows.includes(idx))
                            .map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className='border border-black p-1 text-center'>{idx + 1}</TableCell>
                                    {reportColumns.map((col) => (
                                        <TableCell key={col.columnID} className='border border-black p-1 text-center'>
                                            {col.columnID === 'AMST_Photoname' ? (
                                                <img src={row[col.columnID]} alt='Photo' className='mx-auto h-10 w-10' />
                                            ) : (
                                                row[col.columnID] || '-'
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <div className='mt-4 flex justify-between text-[8px]'>
                    <div>Date: {new Date().toLocaleDateString('en-GB')}</div>
                    <div>User: System Generated</div>
                    <div>© All Rights Reserved</div>
                </div>
            </div>
        </div>
    );
}
