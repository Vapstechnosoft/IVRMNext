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
    CheckCircle2,
    Camera,
    Syringe,
    ArrowLeft
} from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SophiaRegistration() {
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
        ASMCL_Id: 657, // Default Class for this module (as per legacy filter)
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
        PASR_WillingToContributeFlg: true,
        PASR_Source: '',
        PASR_Reference: ''
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

    const [vaccines, setVaccines] = useState<any[]>([]);
    const [documentList, setDocumentList] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    /* -------------------- Hooks -------------------- */
    const { data: initialData, isLoading: isInitialLoading } = useSophiaRegistrationXIInitialData(0, 0);
    const casteMutation = useSophiaRegistrationXICaste();
    const classChangeMutation = useSophiaRegistrationXIClassChange();
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
            if (pData.vaccines) {
                setVaccines(pData.vaccines.map((v: any) => ({ ...v, pamvA_YesNoFlg: 'No' })));
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

    const handleCountryChange = async (type: 'per' | 'con', countryId: string) => {
        const id = Number(countryId);
        handleInputChange(`PASR_${type === 'per' ? 'Per' : 'Con'}Country`, id);
        try {
            await statesMutation.mutateAsync(id);
        } catch (e) {
            toast.error('Failed to load states');
        }
    };

    const handleStateChange = async (stateId: string) => {
        const id = Number(stateId);
        handleInputChange('PASR_PerState', id);
        try {
            await districtsMutation.mutateAsync(id);
        } catch (e) {
            toast.error('Failed to load districts');
        }
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
            setSiblings((prev) => [...prev, { pasrS_SiblingsName: '', pasrS_SiblingsClass: '', pasrS_Gender: 'Female', pasrS_DOB: null, pasrS_Age: null }]);
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
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
                age--;
            }
            newList[index].pasrS_Age = age;
        }
        setSiblings(newList);
    };

    const handleVaccineChange = (index: number, value: string) => {
        const newList = [...vaccines];
        newList[index].pamvA_YesNoFlg = value;
        setVaccines(newList);
    };

    const handleSave = async () => {
        const payload = {
            ...reg,
            siblings: siblings.filter(s => s.pasrS_SiblingsName),
            prevSchools: prevSchools.filter(s => s.pasrP_PreviousSchoolName),
            vaccines: vaccines,
            documents: documentList.filter(d => d.document_Path)
        };

        try {
            const res: any = await saveMutation.mutateAsync(payload);
            const pData = res?.data || res;
            if (pData.returnval) {
                Swal.fire('Success', 'Registration saved successfully.', 'success');
                setActiveTab('list');
            } else {
                toast.error(pData.message || 'Error saving registration');
            }
        } catch (e) {
            toast.error('Server error occurred');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete Record?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete'
        });

        if (result.isConfirmed) {
            try {
                await deleteMutation.mutateAsync(id);
                Swal.fire('Deleted', 'Record removed successfully.', 'success');
            } catch (e) {
                toast.error('Delete failed');
            }
        }
    };

    /* -------------------- Data Filtering -------------------- */
    const registrationList = useMemo(() => {
        const list = (initialData?.data as any)?.registrationList || [];
        // Filter for Class 657 as per legacy controller logic
        return list.filter((r: any) => r.asmcL_Id === 657);
    }, [initialData]);

    const filteredList = useMemo(() => {
        if (!studentSearch) return registrationList;
        const s = studentSearch.toLowerCase();
        return registrationList.filter((r: any) => 
            r.pasR_FirstName?.toLowerCase().includes(s) ||
            r.pasR_RegistrationNo?.toLowerCase().includes(s)
        );
    }, [registrationList, studentSearch]);

    return (
        <div className='p-6 space-y-6 min-h-screen bg-slate-50/50'>
            <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                    <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800'>
                        <Users className='h-7 w-7 text-indigo-600' />
                        Sophia Registration (Class IX)
                    </h1>
                    <p className='text-slate-500 text-sm'>Enrollment management for high school admissions.</p>
                </div>
                <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='bg-white shadow-sm px-4 py-1.5 border-indigo-100 text-indigo-700'>
                        AY: {(initialData?.data as any)?.academicdrp?.[0]?.asmaY_Year || '...'}
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                <TabsList className='bg-slate-200/40 p-1 rounded-xl w-fit h-12'>
                    <TabsTrigger value='entry' className='h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'>
                        <FileText className='h-4 w-4 mr-2' />
                        Registration Form
                    </TabsTrigger>
                    <TabsTrigger value='list' className='h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'>
                        <Search className='h-4 w-4 mr-2' />
                        View List
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='entry' className='space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500'>
                    <div className='grid grid-cols-1 gap-8'>
                        
                        {/* Tab 1: Basic Student Details */}
                        <CollapsibleSection title='Basic Student Details' icon={<User className='h-5 w-5 text-indigo-600' />} defaultOpen={true}>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6'>
                                <div className='space-y-2'>
                                    <Label className='text-[11px] font-bold uppercase text-slate-500 tracking-wider'>First Name <span className='text-red-500'>*</span></Label>
                                    <Input value={reg.PASR_FirstName} onChange={(e) => handleInputChange('PASR_FirstName', e.target.value)} placeholder='Enter first name' className='h-11 focus:ring-2 focus:ring-indigo-100 transition-all' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-[11px] font-bold uppercase text-slate-500 tracking-wider'>Middle Name</Label>
                                    <Input value={reg.PASR_MiddleName} onChange={(e) => handleInputChange('PASR_MiddleName', e.target.value)} placeholder='Enter middle name' className='h-11' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-[11px] font-bold uppercase text-slate-500 tracking-wider'>Last Name</Label>
                                    <Input value={reg.PASR_LastName} onChange={(e) => handleInputChange('PASR_LastName', e.target.value)} placeholder='Enter last name' className='h-11' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-[11px] font-bold uppercase text-slate-500 tracking-wider'>Date of Birth <span className='text-red-500'>*</span></Label>
                                    <div className='relative'>
                                        <Input type='date' value={reg.PASR_DOB ? format(new Date(reg.PASR_DOB), 'yyyy-MM-dd') : ''} onChange={(e) => handleInputChange('PASR_DOB', e.target.value)} className='h-11' />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-[11px] font-bold uppercase text-slate-500 tracking-wider'>Gender <span className='text-red-500'>*</span></Label>
                                    <RadioGroup value={reg.PASR_Sex} onValueChange={(v) => handleInputChange('PASR_Sex', v)} className='flex gap-6 h-11 items-center bg-slate-50 px-4 rounded-lg border'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Male' id='gm' />
                                            <Label htmlFor='gm' className='text-sm cursor-pointer'>Male</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Female' id='gf' />
                                            <Label htmlFor='gf' className='text-sm cursor-pointer'>Female</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-[11px] font-bold uppercase text-slate-500 tracking-wider'>Mobile No <span className='text-red-500'>*</span></Label>
                                    <Input maxLength={10} value={reg.PASR_MobileNo} onChange={(e) => handleInputChange('PASR_MobileNo', e.target.value)} placeholder='10-digit mobile number' className='h-11' />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-[11px] font-bold uppercase text-slate-500 tracking-wider'>Religion <span className='text-red-500'>*</span></Label>
                                    <Select value={reg.Religion_Id?.toString()} onValueChange={(v) => handleInputChange('Religion_Id', Number(v))}>
                                        <SelectTrigger className='h-11'><SelectValue placeholder='Select Religion' /></SelectTrigger>
                                        <SelectContent>
                                            {(initialData?.data as any)?.religiondrp?.map((r: any) => (
                                                <SelectItem key={r.ivrmmR_Id} value={r.ivrmmR_Id.toString()}>{r.ivrmmR_Name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='text-[11px] font-bold uppercase text-slate-500 tracking-wider'>Caste Category <span className='text-red-500'>*</span></Label>
                                    <Select value={reg.IMCC_Id?.toString()} onValueChange={handleCasteCategoryChange}>
                                        <SelectTrigger className='h-11'><SelectValue placeholder='Select Category' /></SelectTrigger>
                                        <SelectContent>
                                            {(initialData?.data as any)?.castecategorydrp?.map((c: any) => (
                                                <SelectItem key={c.imc_id} value={c.imc_id.toString()}>{c.imC_CategoryName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Section: Sibling Information */}
                        <CollapsibleSection title='Sibling Details' icon={<Users className='h-5 w-5 text-indigo-600' />} variant='outline'>
                            <div className='p-6 space-y-6'>
                                <div className='overflow-hidden rounded-xl border border-slate-200 shadow-sm'>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className='bg-slate-50/80'>
                                                <TableHead className='w-14 text-center font-bold text-slate-600'>#</TableHead>
                                                <TableHead className='font-bold text-slate-600'>Sibling Name</TableHead>
                                                <TableHead className='font-bold text-slate-600'>Class</TableHead>
                                                <TableHead className='font-bold text-slate-600'>Gender</TableHead>
                                                <TableHead className='font-bold text-slate-600'>DOB</TableHead>
                                                <TableHead className='w-28 text-center font-bold text-slate-600'>Age</TableHead>
                                                <TableHead className='w-16'></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {siblings.map((s, idx) => (
                                                <TableRow key={idx} className='hover:bg-indigo-50/20 transition-colors'>
                                                    <TableCell className='text-center text-slate-400 font-medium'>{idx + 1}</TableCell>
                                                    <TableCell><Input placeholder='Name' value={s.pasrS_SiblingsName} onChange={(e) => handleSiblingChange(idx, 'pasrS_SiblingsName', e.target.value)} className='h-10' /></TableCell>
                                                    <TableCell><Input placeholder='Class' value={s.pasrS_SiblingsClass} onChange={(e) => handleSiblingChange(idx, 'pasrS_SiblingsClass', e.target.value)} className='h-10' /></TableCell>
                                                    <TableCell>
                                                        <Select value={s.pasrS_Gender} onValueChange={(v) => handleSiblingChange(idx, 'pasrS_Gender', v)}>
                                                            <SelectTrigger className='h-10'><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='Male'>Male</SelectItem>
                                                                <SelectItem value='Female'>Female</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input type='date' value={s.pasrS_DOB ? format(new Date(s.pasrS_DOB), 'yyyy-MM-dd') : ''} onChange={(e) => handleSiblingChange(idx, 'pasrS_DOB', e.target.value)} className='h-10' />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='bg-indigo-50/50 rounded-lg h-10 flex items-center justify-center font-bold text-indigo-700 border border-indigo-100'>
                                                            {s.pasrS_Age || '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant='ghost' size='icon' onClick={() => handleRemoveSibling(idx)} className='text-rose-500 hover:bg-rose-50 rounded-full'>
                                                            <Trash2 className='h-4 w-4' />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Button variant='outline' onClick={handleAddSibling} disabled={siblings.length >= 5} className='w-full border-dashed border-2 py-8 bg-slate-50/30 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group'>
                                    <Plus className='h-5 w-5 mr-2 group-hover:scale-110 transition-transform' />
                                    Add Another Sibling Record (Max 5)
                                </Button>
                            </div>
                        </CollapsibleSection>

                        {/* Section: Medical Info / Vaccines */}
                        <CollapsibleSection title='Vaccination Record' icon={<Syringe className='h-5 w-5 text-indigo-600' />} variant='outline'>
                            <div className='p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {vaccines.map((v, idx) => (
                                    <Card key={idx} className='bg-white shadow-none border hover:border-indigo-200 transition-all'>
                                        <CardContent className='p-4 flex items-center justify-between'>
                                            <Label className='font-bold text-slate-700 text-sm'>{v.pamvA_VaccineName}</Label>
                                            <RadioGroup value={v.pamvA_YesNoFlg} onValueChange={(val) => handleVaccineChange(idx, val)} className='flex gap-3'>
                                                <div className='flex items-center space-x-1.5'>
                                                    <RadioGroupItem value='Yes' id={`v-y-${idx}`} className='h-4 w-4' />
                                                    <Label htmlFor={`v-y-${idx}`} className='text-xs font-medium text-slate-600 cursor-pointer'>Yes</Label>
                                                </div>
                                                <div className='flex items-center space-x-1.5'>
                                                    <RadioGroupItem value='No' id={`v-n-${idx}`} className='h-4 w-4' />
                                                    <Label htmlFor={`v-n-${idx}`} className='text-xs font-medium text-slate-600 cursor-pointer'>No</Label>
                                                </div>
                                            </RadioGroup>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CollapsibleSection>

                        {/* Section: Photos & Media */}
                        <CollapsibleSection title='Upload Photos' icon={<Camera className='h-5 w-5 text-indigo-600' />} variant='outline'>
                            <div className='p-6 grid grid-cols-1 md:grid-cols-3 gap-8'>
                                {[
                                    { label: 'Student Photo', key: 'PASR_Student_Pic_Path', icon: <User /> },
                                    { label: 'Father Photo', key: 'PASR_FatherPhoto', icon: <Users /> },
                                    { label: 'Mother Photo', key: 'PASR_MotherPhoto', icon: <Users /> }
                                ].map((item, idx) => (
                                    <div key={idx} className='space-y-4 text-center'>
                                        <div className='relative w-40 h-48 mx-auto group'>
                                            <div className='w-full h-full bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden group-hover:border-indigo-400 transition-all'>
                                                {reg[item.key] ? (
                                                    <img src={reg[item.key]} alt={item.label} className='w-full h-full object-cover' />
                                                ) : (
                                                    <>
                                                        <div className='bg-white p-3 rounded-full shadow-sm text-slate-400 mb-2'>
                                                            {item.icon}
                                                        </div>
                                                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>{item.label}</span>
                                                    </>
                                                )}
                                                <div className='absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer rounded-2xl'>
                                                    <Upload className='text-white h-8 w-8' />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex justify-center gap-2'>
                                            <Button variant='outline' size='sm' className='rounded-full h-9 px-4 text-xs font-bold'><Upload className='h-3 w-3 mr-2' />UPLOAD</Button>
                                            <Button variant='outline' size='sm' className='rounded-full h-9 px-4 text-xs font-bold'><Camera className='h-3 w-3 mr-2' />WEBCAM</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>

                        {/* Sticky Action Footer */}
                        <div className='sticky bottom-8 left-0 right-0 z-20 pointer-events-none px-6'>
                            <div className='max-w-4xl mx-auto pointer-events-auto'>
                                <Card className='bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-full overflow-hidden'>
                                    <CardContent className='p-2'>
                                        <div className='flex items-center justify-between px-6 py-2'>
                                            <div className='flex items-center gap-2'>
                                                <Badge className='bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 rounded-full px-4 h-8'>
                                                    <CheckCircle2 className='h-3.5 w-3.5 mr-2' />
                                                    Validation Passed
                                                </Badge>
                                            </div>
                                            <div className='flex gap-3'>
                                                <Button variant='ghost' onClick={() => setActiveTab('list')} className='rounded-full h-12 px-8 text-slate-600 hover:bg-slate-100 font-bold uppercase tracking-widest text-[10px]'>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleSave} disabled={saveMutation.isPending} className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-12 px-12 shadow-lg shadow-indigo-200 font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95'>
                                                    {saveMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : <Save className='h-4 w-4 mr-2' />}
                                                    Submit Registration
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value='list' className='animate-in fade-in slide-in-from-bottom-3 duration-500'>
                    <Card className='border-none shadow-2xl rounded-3xl overflow-hidden'>
                        <CardHeader className='bg-slate-50/50 border-b p-8'>
                            <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                                <div className='space-y-1'>
                                    <CardTitle className='text-xl font-bold text-slate-800'>Enrolled Students (Class IX)</CardTitle>
                                    <p className='text-sm text-slate-500'>Showing recent applications for the current academic session.</p>
                                </div>
                                <div className='relative w-full md:w-[400px]'>
                                    <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                                    <Input 
                                        placeholder='Search by Student Name or Reg No...' 
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className='pl-12 h-12 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-indigo-100 transition-all'
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <DataTable 
                                totalItems={filteredList.length}
                                columns={[
                                    { header: 'Reg No', accessorKey: 'pasR_RegistrationNo', cell: ({row}: any) => <span className='font-bold text-indigo-600 tracking-tight'>{row.original.pasR_RegistrationNo}</span> },
                                    { header: 'Student Name', accessorKey: 'pasR_FirstName', cell: ({row}: any) => (
                                        <div className='flex items-center gap-3'>
                                            <div className='h-9 w-9 rounded-full bg-slate-100 border flex items-center justify-center overflow-hidden'>
                                                {row.original.pasR_Student_Pic_Path ? <img src={row.original.pasR_Student_Pic_Path} className='object-cover h-full w-full' /> : <User className='h-4 w-4 text-slate-400' />}
                                            </div>
                                            <span className='font-medium text-slate-700'>{row.original.pasR_FirstName} {row.original.pasR_LastName || ''}</span>
                                        </div>
                                    )},
                                    { header: 'Mobile', accessorKey: 'pasR_MobileNo', cell: ({row}: any) => <span className='text-slate-500 font-mono'>{row.original.pasR_MobileNo}</span> },
                                    { header: 'Gender', accessorKey: 'pasR_Sex', cell: ({row}: any) => <Badge variant='outline' className='rounded-full'>{row.original.pasR_Sex}</Badge> },
                                    { header: 'App Date', accessorKey: 'pasR_Date', cell: ({row}: any) => row.original.pasR_Date ? format(new Date(row.original.pasR_Date), 'dd MMM yyyy') : '-' },
                                    { header: 'Status', accessorKey: 'pasR_ActiveFlag', cell: ({row}: any) => (
                                        <Badge variant={row.original.pasR_ActiveFlag ? 'success' : 'destructive'} className='rounded-full px-4 h-7 text-[10px] font-black uppercase tracking-widest'>
                                            {row.original.pasR_ActiveFlag ? 'Active' : 'Inactive'}
                                        </Badge>
                                    )},
                                    { header: 'Actions', id: 'actions', cell: ({row}: any) => (
                                        <div className='flex gap-1.5'>
                                            <Button variant='ghost' size='icon' className='h-9 w-9 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'><Eye className='h-4 w-4' /></Button>
                                            <Button variant='ghost' size='icon' onClick={() => handleDelete(row.original.pasR_Id || row.original.pasr_id)} className='h-9 w-9 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50'><Trash2 className='h-4 w-4' /></Button>
                                            <Button variant='ghost' size='icon' onClick={() => toggleStatusMutation.mutate(row.original.pasR_Id || row.original.pasr_id)} className='h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100'><ShieldAlert className='h-4 w-4' /></Button>
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
