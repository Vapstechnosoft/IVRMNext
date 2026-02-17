'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import {
    useAcademicYearDropdown,
    useMasterClassDropdown,
    useMasterSectionDropdown
} from '@/hooks/admission/preadmission/useMasters';
import {
    useStudentTCInitialData,
    useStudentTCList,
    useStudentTCDetails,
    useSaveStudentTC,
    useStudentsByAcademicYear,
    useStudentDetailsOnNameChange
} from '@/hooks/admission/preadmission/useStudentTc';
import { Search, Save, XCircle, ChevronRight, ChevronLeft, Loader2, Info, Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { type IStudentSearch, studentSearchColumns } from './_components/columns';
import {
    StudentDetailsTab,
    TCDetailsTab,
    OtherDetailsTab,
    DueDetailsTab
} from './_components';

export interface ITCFormData {
    tc_no: string;
    reason: string;
    last_class: string;
    app_date: string;
    tc_date: string;
    Promotion_Flag: string;
    Fee_Due_Flag: string;
    Medically_Exam_Flag: string;
    conduct: string;
    working_days: number;
    present_days: number;
    language_stud: string;
    extracurricular: string;
    games_played: string;
    academic_year_join: string;
    subjects_stud: string;
    qual_class: string;
}

export default function StudentTCApplyPage() {
    // --- State ---
    const [data, setData] = useState<IStudentSearch[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<IStudentSearch | null>(null);
    const [selectedStudentDetails, setSelectedStudentDetails] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('student-details');
    const [openStudentSelect, setOpenStudentSelect] = useState(false);

    // Search Parameters
    const [asmayId, setAsmayId] = useState<string>('');
    const [studentListId, setStudentListId] = useState<string>('');
    const [asmclId, setAsmclId] = useState<string>('0');
    const [asmsId, setAsmsId] = useState<string>('0');
    const [searchType, setSearchType] = useState<string>('all');
    const [studentStatus, setStudentStatus] = useState<string>('active');
    const [isTemporaryTC, setIsTemporaryTC] = useState<boolean>(false);
    const [searchOrder, setSearchOrder] = useState<string>('admno_name');

    // Form Data for TC Application
    const [formData, setFormData] = useState<ITCFormData>({
        tc_no: '',
        reason: '',
        last_class: '',
        app_date: new Date().toISOString().split('T')[0],
        tc_date: new Date().toISOString().split('T')[0],
        Promotion_Flag: 'qualified',
        Fee_Due_Flag: 'yes',
        Medically_Exam_Flag: 'no',
        conduct: 'Good',
        working_days: 0,
        present_days: 0,
        language_stud: '',
        extracurricular: '',
        games_played: '',
        academic_year_join: '',
        subjects_stud: '',
        qual_class: ''
    });

    // --- Hooks ---
    const { data: academicYears, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const { data: classes } = useMasterClassDropdown();
    const { data: sections } = useMasterSectionDropdown();

    const initialDataMutation = useStudentTCInitialData();
    const searchMutation = useStudentTCList();
    const detailsMutation = useStudentTCDetails();
    const saveMutation = useSaveStudentTC();
    const { data: studentListRaw, isLoading: studentListLoading } = useStudentsByAcademicYear(Number(asmayId));
    const studentList = Array.isArray(studentListRaw) ? studentListRaw : (studentListRaw?.studentList || studentListRaw?.$values || []);

    // --- Initial Data Loading ---
    useEffect(() => {
        initialDataMutation.mutate({
            ASMAY_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            flag: 'S'
        }, {
            onError: (error) => {
                console.error('Initial data load error:', error);
                toast.error('Failed to load initial data for TC application');
            }
        });
    }, []);

    // --- Handlers ---
    const handleSearch = () => {
        if (!asmayId) {
            toast.error('Please select Academic Year');
            return;
        }

        const payload = {
            ASMAY_Id: Number(asmayId),
            ASMCL_Id: Number(asmclId),
            ASMS_Id: Number(asmsId),
            Status_flag: studentStatus,
            allorindividual: searchType === 'all' ? 'All' : 'Individual',
            adm_num_flag: searchOrder
        };

        searchMutation.mutate(payload, {
            onSuccess: (response: any) => {
                if (response?.student_name_list && response.student_name_list.length > 0) {
                    const transformed = response.student_name_list.map((item: any) => ({
                        id: item.amsT_Id,
                        admNo: item.amsT_AdmNo,
                        studentName: item.studentName,
                        class: item.asmcL_ClassName,
                        section: item.asmS_SectionName,
                        original: item
                    }));
                    setData(transformed);
                } else {
                    setData([]);
                    toast.info('No students found for given criteria');
                }
            },
            onError: () => {
                toast.error('Failed to search students');
            }
        });
        setSelectedStudent(null);
        setSelectedStudentDetails(null);
    };

    const handleSelect = (student: IStudentSearch) => {
        setSelectedStudent(student);

        // Payload for `gettcdetails` as per controller
        const payload = {
            AMST_Id: student.id,
            ASMAY_Id: Number(asmayId),
            Status_flag: studentStatus,
            allorindividual: searchType === 'all' ? 'All' : 'Individual',
            adm_num_flag: searchOrder
        };

        // Use detailsMutation (getStudentTCDetails POST)
        detailsMutation.mutate(payload, {
            onSuccess: (response: any) => {
                if (response?.studentListById && response.studentListById.length > 0) {
                    setSelectedStudentDetails(response);

                    // --- 1. Dues & Configuration Check ---
                    const config = initialDataMutation.data?.admissioncongigurationList?.[0];
                    const paymentTcFlag = config?.admC_TCAllowBalanceFlg; // 1 means check dues
                    const libraryTcFlag = config?.asC_LibraryAllowBalanceFlg; // 1 means check dues

                    // Fee Dues
                    let feeDueAmount = 0;
                    response.studentListById.forEach((item: any) => {
                        if (item.feetobepaid > 0) feeDueAmount += item.feetobepaid;
                    });

                    // Library Dues
                    let libraryDueCount = 0;
                    if (response.count_issuebooks?.length > 0) {
                        libraryDueCount = response.count_issuebooks.length;
                    }

                    // PDA Dues
                    let pdaDueAmount = 0;
                    if (response.pdadata?.length > 0) {
                        pdaDueAmount = response.pdadata[0].pdaS_CBStudentDue;
                    }

                    // Blocking Logic based on Flags
                    let blockMessage = '';
                    if (paymentTcFlag === 1) {
                        if (feeDueAmount > 0) {
                            blockMessage += `Rs ${feeDueAmount}/- Amount is Due in Fee! `;
                        }
                        if (pdaDueAmount > 0) {
                            blockMessage += `Rs ${pdaDueAmount}/- Amount is Due in PDA! `;
                        }
                    }

                    if (libraryTcFlag === 1 && libraryDueCount > 0) {
                        blockMessage += `${libraryDueCount} Books Pending in Library! `;
                    }

                    if (blockMessage) {
                        Swal.fire({
                            title: 'Cannot Generate TC',
                            text: blockMessage + ' Please clear dues first.',
                            icon: 'error',
                            confirmButtonColor: '#d33'
                        });
                        // Optional: clear selection or allow view-only? Controller allows view but blocks save.
                        // For now we assume we load data but warn loudly.
                    }


                    // --- 2. Approval Workflow Check ---
                    // "acertapP_ApprovaReqlFlg"
                    const approvalMaster = response.getapprovalmasterdetails?.[0];
                    const allowApproval = approvalMaster?.acertapP_ApprovaReqlFlg;
                    const tcGenerated = response.tcgeneratedornot;

                    if (!tcGenerated && allowApproval === true) {
                        const studentApplied = response.getstudentapplieddetails?.[0];
                        const approvalResult = response.getapprovalresultdetails?.[0];

                        if (studentApplied) {
                            // Check status
                            const status = approvalResult?.ascaP_Status || studentApplied.ascA_Status;
                            if (status !== 'Approved') {
                                Swal.fire({
                                    title: 'Approval Pending',
                                    text: `Certificate Status is "${status}". TC cannot be generated.`,
                                    icon: 'warning'
                                });
                            }
                        } else {
                            Swal.fire({
                                title: 'Approval Required',
                                text: 'For Approval Process, First Student Need To Put Request For Certificate From Portal.',
                                icon: 'warning'
                            });
                        }
                    }


                    // --- 3. Populate Form Data ---
                    const studentInfo = response.studentListById[0];
                    if (studentInfo) {
                        setFormData((prev: ITCFormData) => ({
                            ...prev,
                            last_class: studentInfo.asmcL_ClassName || '',
                            academic_year_join: studentInfo.joinedYear || studentInfo.asmaY_Year || '',
                            language_stud: studentInfo.amsT_LanguageStudied || '',
                            extracurricular: studentInfo.amsT_ExtraCurricular || '',
                            games_played: studentInfo.amsT_GamesPlayed || '',
                            tc_no: response.astC_TCNO || ''
                        }));
                    }

                } else {
                    toast.error('No details found for the selected student.');
                }
            },
            onError: (err) => {
                console.error(err);
                toast.error('Failed to fetch student details');
            }
        });
    };

    const handleReset = () => {
        setAsmayId('');
        setAsmclId('0');
        setAsmsId('0');
        setSearchType('all');
        setStudentStatus('active');
        setIsTemporaryTC(false);
        setSearchOrder('admno_name');
        setStudentListId('');
        setData([]);
        setSelectedStudent(null);
        setSelectedStudentDetails(null);
    };

    const handleSave = () => {
        if (!formData.tc_no || !formData.reason || !formData.app_date || !formData.tc_date) {
            toast.error('Please fill all required fields in TC Details tab');
            setActiveTab('tc-details');
            return;
        }

        const payload = {
            ...formData,
            AMST_Id: selectedStudent?.id,
            ASMAY_Id: Number(asmayId),
            Status_flag: studentStatus,
            isTemporaryTC: isTemporaryTC
        };

        saveMutation.mutate(payload, {
            onSuccess: (response: any) => {
                if (response?.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Student TC details saved successfully.',
                        icon: 'success'
                    });
                    handleReset();
                } else {
                    toast.error(response?.message || 'Failed to save TC details');
                }
            },
            onError: () => {
                toast.error('An error occurred while saving.');
            }
        });
    };

    const tableProps = {
        data: data,
        totalItems: data.length,
        isLoading: searchMutation.isPending,
        error: null,
        success: true
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection title='STUDENT TC' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        {/* Left Side Group */}
                        <div className='space-y-4 rounded-md border p-4 shadow-sm'>
                            {/* Search Type Radio */}
                            <div className='flex items-center gap-6 rounded-md border p-3 bg-muted/20'>
                                <Label className="font-semibold px-2">Search Type:</Label>
                                <RadioGroup value={searchType} onValueChange={setSearchType} className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='all' id='st-all' />
                                        <Label htmlFor='st-all'>All</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='individual' id='st-individual' />
                                        <Label htmlFor='st-individual'>Individual</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Academic Year */}
                            <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[140px_1fr] md:gap-4'>
                                <Label htmlFor='academic-year-select' className='text-left font-medium text-sm md:text-right'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={asmayId} onValueChange={setAsmayId}>
                                    <SelectTrigger id='academic-year-select'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearLoading ? (
                                            <SelectItem value='loading' disabled>Loading...</SelectItem>
                                        ) : (
                                            academicYears?.data?.map((item) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Student Search Combobox - NEW */}
                            <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[140px_1fr] md:gap-4'>
                                <Label className='text-left font-medium text-sm md:text-right'>
                                    Student Name:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={openStudentSelect} onOpenChange={setOpenStudentSelect}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openStudentSelect}
                                            className="w-full justify-between"
                                            disabled={!asmayId}
                                        >
                                            {selectedStudent
                                                ? `${selectedStudent.studentName} (${selectedStudent.admNo})`
                                                : "Select student..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search student..." />
                                            <CommandList>
                                                <CommandEmpty>No student found.</CommandEmpty>
                                                <CommandGroup>
                                                    {studentList?.map((student: any) => (
                                                        <CommandItem
                                                            key={student.amsT_Id}
                                                            value={`${student.studentName} ${student.amsT_AdmNo}`}
                                                            onSelect={() => {
                                                                const mappedStudent: IStudentSearch = {
                                                                    id: student.amsT_Id,
                                                                    admNo: student.amsT_AdmNo,
                                                                    studentName: student.studentName,
                                                                    class: student.asmcL_ClassName,
                                                                    section: student.asmS_SectionName
                                                                };
                                                                handleSelect(mappedStudent);
                                                                setOpenStudentSelect(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedStudent?.id === student.amsT_Id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{student.studentName}</span>
                                                                <span className="text-xs text-muted-foreground">Adm: {student.amsT_AdmNo} | Class: {student.asmcL_ClassName}-{student.asmC_SectionName}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Class Selection */}
                            <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[140px_1fr] md:gap-4'>
                                <Label htmlFor='class-select' className='text-left font-medium text-sm md:text-right'>
                                    Class:
                                </Label>
                                <Select value={asmclId} onValueChange={setAsmclId}>
                                    <SelectTrigger id='class-select'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>All</SelectItem>
                                        {classes?.data?.map((item) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Section Selection */}
                            <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[140px_1fr] md:gap-4'>
                                <Label htmlFor='section-select' className='text-left font-medium text-sm md:text-right'>
                                    Section:
                                </Label>
                                <Select value={asmsId} onValueChange={setAsmsId}>
                                    <SelectTrigger id='section-select'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>All</SelectItem>
                                        {sections?.data?.map((item) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Side Group (Student Selection Box) */}
                        <div className='overflow-hidden rounded-md border border-indigo-600 shadow-sm'>
                            <div className='bg-indigo-600 px-4 py-2 font-medium text-white'>Selection Criteria</div>
                            <div className='space-y-4 bg-white p-4'>
                                {/* Student Status Radio */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Student Status</Label>
                                    <RadioGroup
                                        value={studentStatus}
                                        onValueChange={setStudentStatus}
                                        className='flex flex-wrap items-center gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='active' id='ss-active' />
                                            <Label htmlFor='ss-active'>Active</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='left' id='ss-left' />
                                            <Label htmlFor='ss-left'>Left</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='deactive' id='ss-deactive' />
                                            <Label htmlFor='ss-deactive'>Deactive</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='temporary' id='ss-temporary' />
                                            <Label htmlFor='ss-temporary'>Temporary</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className='my-2 border-t' />

                                {/* Temporary TC Checkbox */}
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='temp-tc'
                                        checked={isTemporaryTC}
                                        onCheckedChange={(checked) => setIsTemporaryTC(checked as boolean)}
                                    />
                                    <Label htmlFor='temp-tc' className="font-semibold">Temporary TC</Label>
                                </div>

                                <div className='my-2 border-t' />

                                {/* Search Order Radio */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Search Order</Label>
                                    <RadioGroup value={searchOrder} onValueChange={setSearchOrder} className='flex items-center gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='admno_name' id='so-adm' />
                                            <Label htmlFor='so-adm'>Adm. No : Name</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='name_admno' id='so-name' />
                                            <Label htmlFor='so-name'>Name : Adm. No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-6 flex justify-center gap-4'>
                        <Button
                            onClick={handleSearch}
                            disabled={searchMutation.isPending}
                            className='min-w-[120px] bg-indigo-600 px-8 text-white hover:bg-indigo-700'>
                            {searchMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className='mr-2 h-4 w-4' />} Search
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className='min-w-[120px]'>
                            <XCircle className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>
                </CollapsibleSection>

                {data.length > 0 && !selectedStudent && (
                    <CollapsibleSection title="Search Results" defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <GenericDataTable<IStudentSearch>
                            {...tableProps}
                            columns={studentSearchColumns(handleSelect)}
                            isLoading={searchMutation.isPending}
                            showViewOptions={false}
                            loadingMessage='Searching...'
                        />
                    </CollapsibleSection>
                )}

                {selectedStudent && (
                    <CollapsibleSection
                        title={`TC Application: ${selectedStudent.studentName} (${selectedStudent.admNo})`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg pb-6'>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-5 p-1 bg-muted/30">
                                <TabsTrigger value="student-details" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Student Details</TabsTrigger>
                                <TabsTrigger value="tc-details" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">TC Details</TabsTrigger>
                                <TabsTrigger value="other-details" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Other Details</TabsTrigger>
                                <TabsTrigger value="due-details" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Due Details</TabsTrigger>
                                <TabsTrigger value="approval-details" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Approval</TabsTrigger>
                            </TabsList>

                            <div className="mt-4 min-h-[400px] border rounded-lg p-2 bg-muted/5">
                                <TabsContent value="student-details">
                                    {detailsMutation.isPending ? (
                                        <div className="flex h-60 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>
                                    ) : (
                                        <StudentDetailsTab data={selectedStudentDetails} />
                                    )}
                                </TabsContent>
                                <TabsContent value="tc-details">
                                    <TCDetailsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                        initialData={initialDataMutation.data}
                                    />
                                </TabsContent>
                                <TabsContent value="other-details">
                                    <OtherDetailsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                    />
                                </TabsContent>
                                <TabsContent value="due-details">
                                    <DueDetailsTab data={selectedStudentDetails} />
                                </TabsContent>
                                <TabsContent value="approval-details">
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Info className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>Approval history and status information will appear here.</p>
                                    </div>
                                </TabsContent>
                            </div>

                            <div className="flex justify-between items-center px-4 mt-6 border-t pt-4">
                                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setSelectedStudent(null)}>
                                    <XCircle className="mr-2 h-4 w-4" /> Cancel Selection
                                </Button>
                                <div className="flex gap-4">
                                    <Button variant="outline" disabled={activeTab === 'student-details'} onClick={() => {
                                        const tabs = ['student-details', 'tc-details', 'other-details', 'due-details', 'approval-details'];
                                        const idx = tabs.indexOf(activeTab);
                                        if (idx > 0) setActiveTab(tabs[idx - 1]);
                                    }}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                    </Button>
                                    <Button variant="outline" disabled={activeTab === 'approval-details'} onClick={() => {
                                        const tabs = ['student-details', 'tc-details', 'other-details', 'due-details', 'approval-details'];
                                        const idx = tabs.indexOf(activeTab);
                                        if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                                    }}>
                                        Next <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saveMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]">
                                        {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Application
                                    </Button>
                                </div>
                            </div>
                        </Tabs>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
