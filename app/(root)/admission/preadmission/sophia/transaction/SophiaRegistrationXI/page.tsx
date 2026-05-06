'use client';

import { format } from 'date-fns';
import { 
    Calendar, 
    ChevronDown, 
    FileText, 
    Loader2, 
    Plus, 
    RotateCcw, 
    Save, 
    Trash2, 
    User, 
    Users, 
    School, 
    BookOpen, 
    Upload, 
    Search, 
    Eye,
    ShieldAlert,
    CreditCard,
    CheckCircle2
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { 
    useSophiaRegistrationXIInitialData,
    useSophiaRegistrationXICaste,
    useSophiaRegistrationXIClassChange,
    useSophiaRegistrationXIStreams,
    useSophiaRegistrationXISubjects,
    useSophiaRegistrationXIStates,
    useSophiaRegistrationXIDistricts,
    useSophiaRegistrationXISave,
    useSophiaRegistrationXIDelete,
    useSophiaRegistrationXIToggleStatus
} from '@/hooks/admission/preadmission/transactions/useSophiaRegistrationXI';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DataTable } from '@/components/ui/data-table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SophiaRegistrationXI() {
    /* -------------------- State -------------------- */
    const [activeTab, setActiveTab] = useState('entry');
    const [reg, setReg] = useState<any>({
        ASMAY_Id: 0,
        PASR_FirstName: '',
        PASR_MiddleName: '',
        PASR_LastName: '',
        PASR_MobileNo: '',
        PASR_emailId: '',
        PASR_DOB: null,
        PASR_Sex: 'Male',
        ASMCL_Id: 575, // Default Class XI
        PASR_Nationality: 0,
        Religion_Id: 0,
        IMCC_Id: 0,
        Caste_Id: 0,
        PASR_PerStreet: '',
        PASR_PerArea: '',
        PASR_PerCity: '',
        PASR_PerCountry: 0,
        PASR_PerState: 0,
        PASR_PerDistrict: 0,
        PASR_PerPincode: '',
        PASR_FatherName: '',
        PASR_FatherMobileNo: '',
        PASR_FatherEmailId: '',
        PASR_MotherName: '',
        PASR_MotherMobileNo: '',
        PASR_MotherEmailId: '',
        PASR_JointPhoto: '',
        PASR_FatherPhoto: '',
        PASR_MotherPhoto: '',
        PASR_Student_Pic_Path: '',
        PASR_WillingToContributeFlg: true
    });

    const [siblings, setSiblings] = useState<any[]>([{ 
        pasrS_SiblingsName: '', 
        pasrS_SiblingsClass: '', 
        pasrS_Gender: 'Female', 
        pasrS_DOB: null, 
        pasrS_Age: null 
    }]);

    const [prevSchools, setPrevSchools] = useState<any[]>([{ 
        pasrP_PreviousSchoolName: '', 
        pasrP_PreviousClass: '', 
        pasrP_PreviousRegNo: '', 
        pasrP_PreviousYear: '',
        pasrP_PreviousMarks: '',
        pasrP_PreviousPer: '',
        pasrP_MediumInst: ''
    }]);

    const [marksMatrix, setMarksMatrix] = useState<any>({});
    const [selectedElectives, setSelectedElectives] = useState<any>({});
    const [documentList, setDocumentList] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    /* -------------------- Constants -------------------- */
    const exams = [
        { id: 1, name: 'IX' },
        { id: 2, name: 'X First Term Exam' },
        { id: 3, name: 'X First Pre-board' },
        { id: 4, name: 'Board Results' }
    ];

    const subjects = [
        { id: 1, name: 'English', desc: 'English' },
        { id: 2, name: 'Mathematics', desc: 'Mathematics / EVS' },
        { id: 3, name: 'Science', desc: 'Physics / Chemistry / Biology' },
        { id: 4, name: 'Social Studies', desc: 'History / Civics / Geography' },
        { id: 5, name: 'II Language', desc: 'Hindi / Kannada / French' },
        { id: 6, name: 'Sixth Subject', desc: 'Economics / Comp Sci / Art / etc.' }
    ];

    /* -------------------- Hooks -------------------- */
    const { data: initialData, isLoading: isInitialLoading } = useSophiaRegistrationXIInitialData(0, 0);
    const casteMutation = useSophiaRegistrationXICaste();
    const classChangeMutation = useSophiaRegistrationXIClassChange();
    const streamsMutation = useSophiaRegistrationXIStreams();
    const subjectsMutation = useSophiaRegistrationXISubjects();
    const statesMutation = useSophiaRegistrationXIStates();
    const districtsMutation = useSophiaRegistrationXIDistricts();
    const saveMutation = useSophiaRegistrationXISave();
    const deleteMutation = useSophiaRegistrationXIDelete();
    const toggleStatusMutation = useSophiaRegistrationXIToggleStatus();

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (initialData?.data) {
            const pData = initialData.data;
            if (pData.documentList) {
                setDocumentList(pData.documentList.map((d: any) => ({ ...d, document_Path: '' })));
            }
            if (pData.academicdrp?.length > 0) {
                setReg((prev: any) => ({ ...prev, ASMAY_Id: pData.academicdrp[0].asmaY_Id }));
            }
        }
    }, [initialData]);

    /* -------------------- Handlers -------------------- */
    const handleInputChange = (field: string, value: any) => {
        setReg((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleCountryChange = async (type: 'per' | 'con' | 'father' | 'mother', countryId: string) => {
        const id = Number(countryId);
        setReg((prev: any) => ({ ...prev, [`PASR_${type === 'per' ? 'Per' : type === 'con' ? 'Con' : type.charAt(0).toUpperCase() + type.slice(1)}Country`]: id }));
        try {
            await statesMutation.mutateAsync(id);
        } catch (e) {
            toast.error('Failed to load states');
        }
    };

    const handleStateChange = async (stateId: string) => {
        const id = Number(stateId);
        setReg((prev: any) => ({ ...prev, PASR_PerState: id }));
        try {
            await districtsMutation.mutateAsync(id);
        } catch (e) {
            toast.error('Failed to load districts');
        }
    };

    const handleReligionChange = async (val: string) => {
        const id = Number(val);
        handleInputChange('Religion_Id', id);
        // Special logic for Roman Catholic could go here if baptism cert needs to be required
    };

    const handleCasteCategoryChange = async (val: string) => {
        const id = Number(val);
        handleInputChange('IMCC_Id', id);
        try {
            await casteMutation.mutateAsync(id);
        } catch (e) {
            toast.error('Failed to load castes');
        }
    };

    const handleAddSibling = () => {
        if (siblings.length < 5) {
            setSiblings((prev: any[]) => [...prev, { pasrS_SiblingsName: '', pasrS_SiblingsClass: '', pasrS_Gender: 'Female', pasrS_DOB: null, pasrS_Age: null }]);
        }
    };

    const handleRemoveSibling = (index: number) => {
        const newList = [...siblings];
        newList.splice(index, 1);
        setSiblings(newList);
    };

    const handleSiblingChange = (index: number, field: string, value: any) => {
        const newList = [...siblings];
        newList[index][field] = value;
        if (field === 'pasrS_DOB' && value) {
            const age = calculateAge(value);
            newList[index].pasrS_Age = age;
        }
        setSiblings(newList);
    };

    const handleAddSchool = () => {
        if (prevSchools.length < 5) {
            setPrevSchools((prev: any[]) => [...prev, { pasrP_PreviousSchoolName: '', pasrP_PreviousClass: '', pasrP_PreviousRegNo: '', pasrP_PreviousYear: '', pasrP_PreviousMarks: '', pasrP_PreviousPer: '', pasrP_MediumInst: '' }]);
        }
    };

    const handleRemoveSchool = (index: number) => {
        const newList = [...prevSchools];
        newList.splice(index, 1);
        setPrevSchools(newList);
    };

    const handleSchoolChange = (index: number, field: string, value: any) => {
        const newList = [...prevSchools];
        newList[index][field] = value;
        setPrevSchools(newList);
    };

    const handleMarksChange = (examId: number, subId: number, value: string) => {
        const mark = parseFloat(value);
        if (isNaN(mark) || mark < 0 || mark > 100) {
            if (value !== '') return;
        }
        setMarksMatrix((prev: any) => ({
            ...prev,
            [examId]: {
                ...(prev[examId] || {}),
                [subId]: value
            }
        }));
    };

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const calculateTotalMarks = (examId: number) => {
        const examMarks = marksMatrix[examId] || {};
        let total = 0;
        Object.values(examMarks).forEach((v: any) => {
            const m = parseFloat(v);
            if (!isNaN(m)) total += m;
        });
        return total || '';
    };

    const calculatePercentage = (examId: number) => {
        const total = calculateTotalMarks(examId);
        if (total === '') return '';
        const max = subjects.length * 100;
        return ((Number(total) / max) * 100).toFixed(2);
    };

    const handleSave = async () => {
        // Prepare complex payload matching legacy backend expectations
        const payload = {
            ...reg,
            siblings: siblings.filter(s => s.pasrS_SiblingsName),
            prevSchools: prevSchools.filter(s => s.pasrP_PreviousSchoolName),
            marksMatrix: marksMatrix,
            selectedElectives: selectedElectives,
            documents: documentList.filter(d => d.document_Path)
        };

        try {
            const res: any = await saveMutation.mutateAsync(payload);
            const pData = res?.data || res;
            if (pData.returnval) {
                Swal.fire('Saved!', 'Registration submitted successfully.', 'success');
                setReg({ ...reg, PASR_FirstName: '', PASR_LastName: '', PASR_MobileNo: '' }); // Partial reset
            } else {
                toast.error(pData.message || 'Failed to save registration');
            }
        } catch (e) {
            toast.error('Internal server error');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteMutation.mutateAsync(id);
                Swal.fire('Deleted!', 'Record has been deleted.', 'success');
            } catch (e) {
                toast.error('Failed to delete');
            }
        }
    };

    /* -------------------- UI -------------------- */
    const registrationList = useMemo(() => {
        const list = (initialData?.data as any)?.registrationList || [];
        return list.filter((r: any) => r.asmcL_Id === 575); // Filter for XI as per legacy
    }, [initialData]);

    const filteredList = useMemo(() => {
        if (!studentSearch) return registrationList;
        return registrationList.filter((r: any) => 
            r.pasR_FirstName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
            r.pasR_RegistrationNo?.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [registrationList, studentSearch]);

    return (
        <div className='p-6 space-y-6 min-h-screen bg-slate-50/50'>
            <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                    <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800'>
                        <Users className='h-7 w-7 text-indigo-600' />
                        Sophia Registration (Class XI)
                    </h1>
                    <p className='text-slate-500 text-sm'>Manage student registrations and academic records for higher secondary admission.</p>
                </div>
                <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1 text-sm font-medium'>
                        Academic Year: {(initialData?.data as any)?.academicdrp?.[0]?.asmaY_Year || 'Loading...'}
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                <TabsList className='grid w-full grid-cols-2 lg:w-[400px] h-12 p-1 bg-slate-200/50'>
                    <TabsTrigger value='entry' className='data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md transition-all'>
                        <FileText className='h-4 w-4 mr-2' />
                        Registration Form
                    </TabsTrigger>
                    <TabsTrigger value='list' className='data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md transition-all'>
                        <Search className='h-4 w-4 mr-2' />
                        View Registrations
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='entry' className='space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                    <div className='grid grid-cols-1 gap-8'>
                        
                        {/* Section 1: Personal Information */}
                        <CollapsibleSection title='Personal Information' icon={<User className='h-5 w-5 text-indigo-600' />} defaultOpen={true}>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4'>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>First Name <span className='text-red-500'>*</span></Label>
                                    <Input placeholder='First Name' value={reg.PASR_FirstName} onChange={(e) => handleInputChange('PASR_FirstName', e.target.value)} className='h-10 focus:ring-2 focus:ring-indigo-100' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Middle Name</Label>
                                    <Input placeholder='Middle Name' value={reg.PASR_MiddleName} onChange={(e) => handleInputChange('PASR_MiddleName', e.target.value)} className='h-10' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Last Name</Label>
                                    <Input placeholder='Last Name' value={reg.PASR_LastName} onChange={(e) => handleInputChange('PASR_LastName', e.target.value)} className='h-10' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Date of Birth <span className='text-red-500'>*</span></Label>
                                    <Input type='date' value={reg.PASR_DOB ? format(new Date(reg.PASR_DOB), 'yyyy-MM-dd') : ''} onChange={(e) => handleInputChange('PASR_DOB', e.target.value)} className='h-10' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Gender <span className='text-red-500'>*</span></Label>
                                    <RadioGroup value={reg.PASR_Sex} onValueChange={(v) => handleInputChange('PASR_Sex', v)} className='flex gap-4 h-10 items-center'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Male' id='m' />
                                            <Label htmlFor='m' className='cursor-pointer'>Male</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Female' id='f' />
                                            <Label htmlFor='f' className='cursor-pointer'>Female</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Mobile No <span className='text-red-500'>*</span></Label>
                                    <Input placeholder='Mobile No' maxLength={10} value={reg.PASR_MobileNo} onChange={(e) => handleInputChange('PASR_MobileNo', e.target.value)} className='h-10' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Email ID</Label>
                                    <Input type='email' placeholder='Email ID' value={reg.PASR_emailId} onChange={(e) => handleInputChange('PASR_emailId', e.target.value)} className='h-10' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Religion <span className='text-red-500'>*</span></Label>
                                    <Select value={reg.Religion_Id?.toString()} onValueChange={handleReligionChange}>
                                        <SelectTrigger className='h-10'><SelectValue placeholder='Select' /></SelectTrigger>
                                        <SelectContent>
                                            {(initialData?.data as any)?.religiondrp?.map((r: any) => (
                                                <SelectItem key={r.ivrmmR_Id} value={r.ivrmmR_Id.toString()}>{r.ivrmmR_Name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Section 2: Address Information */}
                        <CollapsibleSection title='Permanent Address' icon={<School className='h-5 w-5 text-indigo-600' />} variant='outline'>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4'>
                                <div className='md:col-span-2 space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Street / Door No</Label>
                                    <Input value={reg.PASR_PerStreet} onChange={(e) => handleInputChange('PASR_PerStreet', e.target.value)} />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Area</Label>
                                    <Input value={reg.PASR_PerArea} onChange={(e) => handleInputChange('PASR_PerArea', e.target.value)} />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Country</Label>
                                    <Select value={reg.PASR_PerCountry?.toString()} onValueChange={(v) => handleCountryChange('per', v)}>
                                        <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                        <SelectContent>
                                            {(initialData?.data as any)?.countryDrpDown?.map((c: any) => (
                                                <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>{c.ivrmmC_CountryName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>State</Label>
                                    <Select value={reg.PASR_PerState?.toString()} onValueChange={handleStateChange} disabled={!reg.PASR_PerCountry}>
                                        <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                        <SelectContent>
                                            {(statesMutation.data as any)?.data?.stateDrpDown?.map((s: any) => (
                                                <SelectItem key={s.ivrmmS_Id} value={s.ivrmmS_Id.toString()}>{s.ivrmmS_Name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>District</Label>
                                    <Select value={reg.PASR_PerDistrict?.toString()} onValueChange={(v) => handleInputChange('PASR_PerDistrict', Number(v))} disabled={!reg.PASR_PerState}>
                                        <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                        <SelectContent>
                                            {(districtsMutation.data as any)?.data?.districtDrpDown?.map((d: any) => (
                                                <SelectItem key={d.ivrmmD_Id} value={d.ivrmmD_Id.toString()}>{d.ivrmmD_Name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold uppercase text-slate-500'>Pincode</Label>
                                    <Input value={reg.PASR_PerPincode} onChange={(e) => handleInputChange('PASR_PerPincode', e.target.value)} maxLength={6} />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Section 3: Sibling Details */}
                        <CollapsibleSection title='Sibling Details' icon={<Users className='h-5 w-5 text-indigo-600' />} variant='outline'>
                            <div className='p-4 space-y-4'>
                                <Table>
                                    <TableHeader>
                                        <TableRow className='bg-slate-50 hover:bg-slate-50'>
                                            <TableHead className='w-12'>SL.No</TableHead>
                                            <TableHead>Sibling Name</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Gender</TableHead>
                                            <TableHead>DOB</TableHead>
                                            <TableHead className='w-24'>Age</TableHead>
                                            <TableHead className='w-16'>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {siblings.map((s, idx) => (
                                            <TableRow key={idx} className='group hover:bg-indigo-50/30 transition-colors'>
                                                <TableCell className='text-center font-medium text-slate-400'>{idx + 1}</TableCell>
                                                <TableCell>
                                                    <Input placeholder='Sibling Name' value={s.pasrS_SiblingsName} onChange={(e) => handleSiblingChange(idx, 'pasrS_SiblingsName', e.target.value)} className='h-9' />
                                                </TableCell>
                                                <TableCell>
                                                    <Input placeholder='Class' value={s.pasrS_SiblingsClass} onChange={(e) => handleSiblingChange(idx, 'pasrS_SiblingsClass', e.target.value)} className='h-9' />
                                                </TableCell>
                                                <TableCell>
                                                    <Select value={s.pasrS_Gender} onValueChange={(v) => handleSiblingChange(idx, 'pasrS_Gender', v)}>
                                                        <SelectTrigger className='h-9'><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='Male'>Male</SelectItem>
                                                            <SelectItem value='Female'>Female</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input type='date' value={s.pasrS_DOB ? format(new Date(s.pasrS_DOB), 'yyyy-MM-dd') : ''} onChange={(e) => handleSiblingChange(idx, 'pasrS_DOB', e.target.value)} className='h-9' />
                                                </TableCell>
                                                <TableCell>
                                                    <Input value={s.pasrS_Age || ''} disabled className='h-9 bg-slate-50 text-center font-bold text-indigo-600' />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant='ghost' size='icon' onClick={() => handleRemoveSibling(idx)} className='text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button variant='outline' onClick={handleAddSibling} disabled={siblings.length >= 5} className='w-full border-dashed border-2 py-6 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all'>
                                    <Plus className='h-4 w-4 mr-2' />
                                    Add Another Sibling
                                </Button>
                            </div>
                        </CollapsibleSection>

                        {/* Section 4: Academic Marks Matrix */}
                        <CollapsibleSection title='Academic Record (Marks Matrix)' icon={<BookOpen className='h-5 w-5 text-indigo-600' />} variant='outline'>
                            <div className='p-4 overflow-x-auto'>
                                <Table className='border'>
                                    <TableHeader>
                                        <TableRow className='bg-indigo-600 hover:bg-indigo-600'>
                                            <TableHead className='text-white font-bold w-12'>SL</TableHead>
                                            <TableHead className='text-white font-bold min-w-[200px]'>Subjects</TableHead>
                                            {exams.map(e => (
                                                <TableHead key={e.id} className='text-white font-bold text-center'>{e.name}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subjects.map((sub, sIdx) => (
                                            <TableRow key={sub.id} className='hover:bg-indigo-50/50'>
                                                <TableCell className='font-medium text-slate-400'>{sIdx + 1}</TableCell>
                                                <TableCell className='space-y-1'>
                                                    <div className='font-bold text-slate-700'>{sub.name}</div>
                                                    <div className='text-[10px] text-slate-400 italic'>{sub.desc}</div>
                                                </TableCell>
                                                {exams.map(exam => (
                                                    <TableCell key={exam.id} className='p-1'>
                                                        <Input 
                                                            type='number'
                                                            placeholder='Marks (0-100)'
                                                            value={marksMatrix[exam.id]?.[sub.id] || ''}
                                                            onChange={(e) => handleMarksChange(exam.id, sub.id, e.target.value)}
                                                            className='h-10 text-center font-bold focus:bg-white transition-all bg-slate-50/50'
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                        {/* Totals Row */}
                                        <TableRow className='bg-slate-100/80 font-bold'>
                                            <TableCell colSpan={2} className='text-right pr-4 uppercase text-slate-500 text-xs tracking-wider'>Total Marks</TableCell>
                                            {exams.map(exam => (
                                                <TableCell key={exam.id} className='text-center text-indigo-700 bg-indigo-50/50 text-lg'>
                                                    {calculateTotalMarks(exam.id)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                        <TableRow className='bg-indigo-50 font-bold'>
                                            <TableCell colSpan={2} className='text-right pr-4 uppercase text-indigo-600 text-xs tracking-wider'>Percentage (%)</TableCell>
                                            {exams.map(exam => (
                                                <TableCell key={exam.id} className='text-center text-indigo-700 text-xl font-black'>
                                                    {calculatePercentage(exam.id)}{calculatePercentage(exam.id) ? '%' : ''}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CollapsibleSection>

                        {/* Section 5: Document Uploads */}
                        <CollapsibleSection title='Required Documents' icon={<Upload className='h-5 w-5 text-indigo-600' />} variant='outline'>
                            <div className='p-4 grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {documentList.map((doc, idx) => (
                                    <div key={idx} className='flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:border-indigo-200 transition-all group'>
                                        <div className='space-y-1'>
                                            <Label className='font-bold text-slate-700 flex items-center'>
                                                {doc.amsmD_DocumentName}
                                                {doc.amsmD_FLAG && <span className='text-red-500 ml-1'>*</span>}
                                            </Label>
                                            <p className='text-[10px] text-slate-400 italic'>Max file size: 2MB. Format: PDF/JPG/PNG</p>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            {doc.document_Path && (
                                                <Badge variant='success' className='bg-emerald-50 text-emerald-700 border-emerald-200'>
                                                    <CheckCircle2 className='h-3 w-3 mr-1' />
                                                    Uploaded
                                                </Badge>
                                            )}
                                            <Button variant='outline' size='sm' className='h-9 rounded-lg border-dashed border-2 hover:bg-indigo-50 hover:border-indigo-300'>
                                                <Upload className='h-3.5 w-3.5 mr-2' />
                                                Choose File
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>

                        {/* Sticky Action Footer */}
                        <div className='sticky bottom-6 left-0 right-0 z-10 flex justify-center'>
                            <Card className='shadow-2xl border-none bg-white/80 backdrop-blur-md rounded-full px-6 py-3 border border-slate-200/50'>
                                <div className='flex gap-4'>
                                    <Button onClick={handleSave} disabled={saveMutation.isPending} className='bg-indigo-600 hover:bg-indigo-700 rounded-full px-10 h-12 shadow-lg shadow-indigo-200 transition-all active:scale-95'>
                                        {saveMutation.isPending ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <Save className='mr-2 h-5 w-5' />}
                                        SAVE REGISTRATION
                                    </Button>
                                    <Button variant='outline' onClick={() => window.location.reload()} className='rounded-full px-10 h-12 border-slate-200 hover:bg-slate-100'>
                                        <RotateCcw className='mr-2 h-5 w-5' />
                                        CANCEL
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value='list' className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
                    <Card className='shadow-xl border-none overflow-hidden rounded-2xl'>
                        <CardHeader className='bg-slate-50/50 border-b p-6'>
                            <div className='flex items-center justify-between'>
                                <CardTitle className='text-lg font-bold text-slate-800'>Existing Registrations (Class XI)</CardTitle>
                                <div className='relative w-80'>
                                    <Search className='absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
                                    <Input 
                                        placeholder='Search by name or reg no...' 
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className='pl-10 h-10 bg-white rounded-full'
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <DataTable 
                                totalItems={filteredList.length}
                                columns={[
                                    { header: 'Reg No', accessorKey: 'pasR_RegistrationNo', cell: ({row}: any) => <span className='font-bold text-indigo-600'>{row.original.pasR_RegistrationNo}</span> },
                                    { header: 'Student Name', accessorKey: 'pasR_FirstName', cell: ({row}: any) => `${row.original.pasR_FirstName} ${row.original.pasR_LastName || ''}` },
                                    { header: 'Mobile', accessorKey: 'pasR_MobileNo' },
                                    { header: 'Gender', accessorKey: 'pasR_Sex' },
                                    { header: 'Date', accessorKey: 'pasR_Date', cell: ({row}: any) => row.original.pasR_Date ? format(new Date(row.original.pasR_Date), 'dd-MMM-yyyy') : '-' },
                                    { header: 'Status', accessorKey: 'pasR_ActiveFlag', cell: ({row}: any) => (
                                        <Badge variant={row.original.pasR_ActiveFlag ? 'success' : 'destructive'} className='rounded-full px-3'>
                                            {row.original.pasR_ActiveFlag ? 'Active' : 'Deactivated'}
                                        </Badge>
                                    )},
                                    { header: 'Actions', id: 'actions', cell: ({row}: any) => (
                                        <div className='flex gap-2'>
                                            <Button variant='ghost' size='icon' className='h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded-full'><Eye className='h-4 w-4' /></Button>
                                            <Button variant='ghost' size='icon' onClick={() => handleDelete(row.original.pasR_Id || row.original.pasr_id)} className='h-8 w-8 text-red-500 hover:bg-red-50 rounded-full'><Trash2 className='h-4 w-4' /></Button>
                                            <Button variant='ghost' size='icon' onClick={() => toggleStatusMutation.mutate(row.original.pasR_Id || row.original.pasr_id)} className='h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-full'><ShieldAlert className='h-4 w-4' /></Button>
                                        </div>
                                    )}
                                ]}
                                data={filteredList}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
