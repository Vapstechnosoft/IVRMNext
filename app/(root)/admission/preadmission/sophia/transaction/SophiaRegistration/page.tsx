'use client';

import { format } from 'date-fns';
import {
    Camera,
    CheckCircle2,
    Eye,
    FileText,
    Loader2,
    Plus,
    Save,
    Search,
    ShieldAlert,
    Syringe,
    Trash2,
    Upload,
    User,
    Users
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import {
    useSophiaRegistrationXICaste,
    useSophiaRegistrationXIClassChange,
    useSophiaRegistrationXIDelete,
    useSophiaRegistrationXIDistricts,
    useSophiaRegistrationXIInitialData,
    useSophiaRegistrationXISave,
    useSophiaRegistrationXIStates,
    useSophiaRegistrationXIToggleStatus
} from '@/hooks/admission/preadmission/transactions/useSophiaRegistrationXI';
import { useAdmissionFormDetails } from '@/hooks/admission/admissionForm';
import { useActivePreadmissionDetails, useReligionDropdown } from '@/hooks/admission/preadmission/useTransactions';
import { useAcademicYearDropdown, useMasterCasteCategory, useMasterCasteCategoryDropdown, useMasterReligion } from '@/hooks/admission/preadmission/useMasters';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

    const [siblings, setSiblings] = useState<any[]>([
        {
            pasrS_SiblingsName: '',
            pasrS_SiblingsClass: '',
            pasrS_Gender: 'Female',
            pasrS_DOB: null,
            pasrS_Age: null
        }
    ]);

    const [prevSchools, setPrevSchools] = useState<any[]>([
        {
            pasrP_PreviousSchoolName: '',
            pasrP_PreviousClass: '',
            pasrP_PreviousRegNo: '',
            pasrP_PreviousYear: '',
            pasrP_PreviousMarks: '',
            pasrP_PreviousPer: '',
            pasrP_MediumInst: ''
        }
    ]);

    const [vaccines, setVaccines] = useState<any[]>([]);
    const [documentList, setDocumentList] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    /* -------------------- Hooks -------------------- */
    const { data: initialData, isLoading: isInitialLoading } = useSophiaRegistrationXIInitialData(0, 0);
    const { data: admissionDetails } = useAdmissionFormDetails();
    const { data: activePreadmission } = useActivePreadmissionDetails();
    const { data: academicYearDropdown } = useAcademicYearDropdown();
    const { data: religionDropdownData } = useReligionDropdown();
    const { data: masterReligionData } = useMasterReligion();
    const { data: casteCategoryDropdownData } = useMasterCasteCategoryDropdown();
    const { data: masterCasteCategoryData } = useMasterCasteCategory();
    const casteMutation = useSophiaRegistrationXICaste();
    const classChangeMutation = useSophiaRegistrationXIClassChange();
    const statesMutation = useSophiaRegistrationXIStates();
    const districtsMutation = useSophiaRegistrationXIDistricts();
    const saveMutation = useSophiaRegistrationXISave();
    const deleteMutation = useSophiaRegistrationXIDelete();
    const toggleStatusMutation = useSophiaRegistrationXIToggleStatus();

    const religions = useMemo(() => {
        return (
            (admissionDetails as any)?.religions ||
            (admissionDetails as any)?.allReligion ||
            (admissionDetails as any)?.allReligionList ||
            (admissionDetails as any)?.AllReligion ||
            (religionDropdownData as any)?.data ||
            (Array.isArray(religionDropdownData) ? religionDropdownData : null) ||
            (masterReligionData as any)?.data ||
            (Array.isArray(masterReligionData) ? masterReligionData : null) ||
            (initialData?.data as any)?.religiondrp ||
            (initialData as any)?.religiondrp ||
            []
        );
    }, [admissionDetails, initialData, religionDropdownData, masterReligionData]);

    const casteCategories = useMemo(() => {
        return (
            (admissionDetails as any)?.casteCategoryes ||
            (admissionDetails as any)?.allCasteCategory ||
            (admissionDetails as any)?.vpre_allCasteCategory ||
            (admissionDetails as any)?.allCasteCategoryList ||
            (admissionDetails as any)?.AllCasteCategory ||
            (casteCategoryDropdownData as any)?.data ||
            (Array.isArray(casteCategoryDropdownData) ? casteCategoryDropdownData : null) ||
            (masterCasteCategoryData as any)?.data ||
            (Array.isArray(masterCasteCategoryData) ? masterCasteCategoryData : null) ||
            (initialData?.data as any)?.castecategorydrp ||
            (initialData as any)?.castecategorydrp ||
            (initialData?.data as any)?.arrlist9 ||
            []
        );
    }, [admissionDetails, initialData, casteCategoryDropdownData, masterCasteCategoryData]);

    const activeAcademicYear = useMemo(() => {
        if (activePreadmission?.data?.asmaY_Year) return activePreadmission.data.asmaY_Year;
        const pData = (initialData as any)?.data || initialData;
        const academic = pData?.academicdrp || pData?.allAcademicYear;
        if (academic && Array.isArray(academic) && academic.length > 0) {
            const found = academic.find((y: any) => (y.asmaY_Id || y.ASMAY_Id) === reg.ASMAY_Id) || academic[0];
            return found?.asmaY_Year || found?.ASMAY_Year || '';
        }
        const dropdownList = (academicYearDropdown as any)?.data || (Array.isArray(academicYearDropdown) ? academicYearDropdown : null);
        if (dropdownList && Array.isArray(dropdownList) && dropdownList.length > 0) {
            const found = dropdownList.find((y: any) => (y.asmaY_Id || y.ASMAY_Id) === reg.ASMAY_Id) || dropdownList[0];
            return found?.asmaY_Year || found?.ASMAY_Year || '';
        }
        return (admissionDetails as any)?.allAcademicYear?.[0]?.asmaY_Year || '';
    }, [activePreadmission, initialData, reg.ASMAY_Id, academicYearDropdown, admissionDetails]);

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (initialData) {
            const pData = (initialData as any)?.data || initialData;
            const docs = pData?.documentList || pData?.DocumentList;
            if (docs && Array.isArray(docs)) {
                setDocumentList(docs.map((d: any) => ({ ...d, document_Path: '' })));
            }
            if (pData?.vaccines && Array.isArray(pData.vaccines)) {
                setVaccines(pData.vaccines.map((v: any) => ({ ...v, pamvA_YesNoFlg: 'No' })));
            }
            const academic = pData?.academicdrp || pData?.allAcademicYear;
            if (academic && Array.isArray(academic) && academic.length > 0) {
                const yearId = academic[0].asmaY_Id || academic[0].ASMAY_Id;
                if (yearId) {
                    setReg((prev: any) => ({ ...prev, ASMAY_Id: yearId }));
                }
            }
        }
    }, [initialData]);

    useEffect(() => {
        const yearId =
            activePreadmission?.data?.asmaY_Id ||
            (academicYearDropdown as any)?.data?.[0]?.asmaY_Id;
        if (yearId && (!reg.ASMAY_Id || reg.ASMAY_Id === 0)) {
            setReg((prev: any) => ({ ...prev, ASMAY_Id: yearId }));
        }
    }, [activePreadmission, academicYearDropdown, reg.ASMAY_Id]);

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
            setSiblings((prev) => [
                ...prev,
                { pasrS_SiblingsName: '', pasrS_SiblingsClass: '', pasrS_Gender: 'Female', pasrS_DOB: null, pasrS_Age: null }
            ]);
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
            if (
                today.getMonth() < birthDate.getMonth() ||
                (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
            ) {
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
            siblings: siblings.filter((s) => s.pasrS_SiblingsName),
            prevSchools: prevSchools.filter((s) => s.pasrP_PreviousSchoolName),
            vaccines: vaccines,
            documents: documentList.filter((d) => d.document_Path)
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
        return registrationList.filter(
            (r: any) => r.pasR_FirstName?.toLowerCase().includes(s) || r.pasR_RegistrationNo?.toLowerCase().includes(s)
        );
    }, [registrationList, studentSearch]);

    return (
        <div className='min-h-screen space-y-6 bg-slate-50/50 p-6'>
            <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                    <h1 className='flex items-center gap-2 font-bold text-2xl text-slate-800 tracking-tight'>
                        <Users className='h-7 w-7 text-indigo-600' />
                        Sophia Registration (Class IX)
                    </h1>
                    <p className='text-slate-500 text-sm'>Enrollment management for high school admissions.</p>
                </div>
                <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='border-indigo-100 bg-white px-4 py-1.5 text-indigo-700 shadow-sm'>
                        AY: {activeAcademicYear || '...'}
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                <TabsList className='h-12 w-fit rounded-xl bg-slate-200/40 p-1'>
                    <TabsTrigger
                        value='entry'
                        className='h-10 rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'>
                        <FileText className='mr-2 h-4 w-4' />
                        Registration Form
                    </TabsTrigger>
                    <TabsTrigger
                        value='list'
                        className='h-10 rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'>
                        <Search className='mr-2 h-4 w-4' />
                        View List
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='entry' className='fade-in slide-in-from-bottom-3 animate-in space-y-6 duration-500'>
                    <div className='grid grid-cols-1 gap-8'>
                        {/* Tab 1: Basic Student Details */}
                        <CollapsibleSection
                            title='Basic Student Details'
                            icon={<User className='h-5 w-5 text-indigo-600' />}
                            defaultOpen={true}>
                            <div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-4'>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-[11px] text-slate-500 uppercase tracking-wider'>
                                        First Name <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        value={reg.PASR_FirstName}
                                        onChange={(e) => handleInputChange('PASR_FirstName', e.target.value)}
                                        placeholder='Enter first name'
                                        className='h-11 transition-all focus:ring-2 focus:ring-indigo-100'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-[11px] text-slate-500 uppercase tracking-wider'>Middle Name</Label>
                                    <Input
                                        value={reg.PASR_MiddleName}
                                        onChange={(e) => handleInputChange('PASR_MiddleName', e.target.value)}
                                        placeholder='Enter middle name'
                                        className='h-11'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-[11px] text-slate-500 uppercase tracking-wider'>Last Name</Label>
                                    <Input
                                        value={reg.PASR_LastName}
                                        onChange={(e) => handleInputChange('PASR_LastName', e.target.value)}
                                        placeholder='Enter last name'
                                        className='h-11'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-[11px] text-slate-500 uppercase tracking-wider'>
                                        Date of Birth <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='relative'>
                                        <Input
                                            type='date'
                                            value={reg.PASR_DOB ? format(new Date(reg.PASR_DOB), 'yyyy-MM-dd') : ''}
                                            onChange={(e) => handleInputChange('PASR_DOB', e.target.value)}
                                            className='h-11'
                                        />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-[11px] text-slate-500 uppercase tracking-wider'>
                                        Gender <span className='text-red-500'>*</span>
                                    </Label>
                                    <RadioGroup
                                        value={reg.PASR_Sex}
                                        onValueChange={(v) => handleInputChange('PASR_Sex', v)}
                                        className='flex h-11 items-center gap-6 rounded-lg border bg-slate-50 px-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Male' id='gm' />
                                            <Label htmlFor='gm' className='cursor-pointer text-sm'>
                                                Male
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Female' id='gf' />
                                            <Label htmlFor='gf' className='cursor-pointer text-sm'>
                                                Female
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-[11px] text-slate-500 uppercase tracking-wider'>
                                        Mobile No <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        maxLength={10}
                                        value={reg.PASR_MobileNo}
                                        onChange={(e) => handleInputChange('PASR_MobileNo', e.target.value)}
                                        placeholder='10-digit mobile number'
                                        className='h-11'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-[11px] text-slate-500 uppercase tracking-wider'>
                                        Religion <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        value={reg.Religion_Id && reg.Religion_Id !== 0 ? reg.Religion_Id.toString() : ''}
                                        onValueChange={(v) => handleInputChange('Religion_Id', Number(v))}>
                                        <SelectTrigger className='h-11'>
                                            <SelectValue placeholder='Select Religion' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {religions.map((r: any) => {
                                                const id = r.ivrmmR_Id ?? r.IVRMMR_Id ?? r.religion_Id ?? r.religionId;
                                                const name = r.ivrmmR_ReligionName || r.ivrmmR_Name || r.IVRMMR_Name || r.religionName;
                                                if (id === undefined || id === null) return null;
                                                return (
                                                    <SelectItem key={id.toString()} value={id.toString()}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-[11px] text-slate-500 uppercase tracking-wider'>
                                        Caste Category <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        value={reg.IMCC_Id && reg.IMCC_Id !== 0 ? reg.IMCC_Id.toString() : ''}
                                        onValueChange={handleCasteCategoryChange}>
                                        <SelectTrigger className='h-11'>
                                            <SelectValue placeholder='Select Category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {casteCategories.map((c: any) => {
                                                const id = c.imcC_Id ?? c.imCC_Id ?? c.IMCC_Id ?? c.imc_id;
                                                const name = c.imcC_CategoryName || c.imCC_CategoryName || c.IMCC_CategoryName || c.imC_CategoryName;
                                                if (id === undefined || id === null) return null;
                                                return (
                                                    <SelectItem key={id.toString()} value={id.toString()}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Section: Sibling Information */}
                        <CollapsibleSection title='Sibling Details' icon={<Users className='h-5 w-5 text-indigo-600' />} variant='outline'>
                            <div className='space-y-6 p-6'>
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
                                                <TableRow key={idx} className='transition-colors hover:bg-indigo-50/20'>
                                                    <TableCell className='text-center font-medium text-slate-400'>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            placeholder='Name'
                                                            value={s.pasrS_SiblingsName}
                                                            onChange={(e) => handleSiblingChange(idx, 'pasrS_SiblingsName', e.target.value)}
                                                            className='h-10'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            placeholder='Class'
                                                            value={s.pasrS_SiblingsClass}
                                                            onChange={(e) =>
                                                                handleSiblingChange(idx, 'pasrS_SiblingsClass', e.target.value)
                                                            }
                                                            className='h-10'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={s.pasrS_Gender}
                                                            onValueChange={(v) => handleSiblingChange(idx, 'pasrS_Gender', v)}>
                                                            <SelectTrigger className='h-10'>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='Male'>Male</SelectItem>
                                                                <SelectItem value='Female'>Female</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type='date'
                                                            value={s.pasrS_DOB ? format(new Date(s.pasrS_DOB), 'yyyy-MM-dd') : ''}
                                                            onChange={(e) => handleSiblingChange(idx, 'pasrS_DOB', e.target.value)}
                                                            className='h-10'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='flex h-10 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50/50 font-bold text-indigo-700'>
                                                            {s.pasrS_Age || '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            onClick={() => handleRemoveSibling(idx)}
                                                            className='rounded-full text-rose-500 hover:bg-rose-50'>
                                                            <Trash2 className='h-4 w-4' />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Button
                                    variant='outline'
                                    onClick={handleAddSibling}
                                    disabled={siblings.length >= 5}
                                    className='group w-full border-2 border-dashed bg-slate-50/30 py-8 text-slate-500 transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600'>
                                    <Plus className='mr-2 h-5 w-5 transition-transform group-hover:scale-110' />
                                    Add Another Sibling Record (Max 5)
                                </Button>
                            </div>
                        </CollapsibleSection>

                        {/* Section: Medical Info / Vaccines */}
                        <CollapsibleSection
                            title='Vaccination Record'
                            icon={<Syringe className='h-5 w-5 text-indigo-600' />}
                            variant='outline'>
                            <div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3'>
                                {vaccines.map((v, idx) => (
                                    <Card key={idx} className='border bg-white shadow-none transition-all hover:border-indigo-200'>
                                        <CardContent className='flex items-center justify-between p-4'>
                                            <Label className='font-bold text-slate-700 text-sm'>{v.pamvA_VaccineName}</Label>
                                            <RadioGroup
                                                value={v.pamvA_YesNoFlg}
                                                onValueChange={(val) => handleVaccineChange(idx, val)}
                                                className='flex gap-3'>
                                                <div className='flex items-center space-x-1.5'>
                                                    <RadioGroupItem value='Yes' id={`v-y-${idx}`} className='h-4 w-4' />
                                                    <Label
                                                        htmlFor={`v-y-${idx}`}
                                                        className='cursor-pointer font-medium text-slate-600 text-xs'>
                                                        Yes
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-1.5'>
                                                    <RadioGroupItem value='No' id={`v-n-${idx}`} className='h-4 w-4' />
                                                    <Label
                                                        htmlFor={`v-n-${idx}`}
                                                        className='cursor-pointer font-medium text-slate-600 text-xs'>
                                                        No
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CollapsibleSection>

                        {/* Section: Photos & Media */}
                        <CollapsibleSection title='Upload Photos' icon={<Camera className='h-5 w-5 text-indigo-600' />} variant='outline'>
                            <div className='grid grid-cols-1 gap-8 p-6 md:grid-cols-3'>
                                {[
                                    { label: 'Student Photo', key: 'PASR_Student_Pic_Path', icon: <User /> },
                                    { label: 'Father Photo', key: 'PASR_FatherPhoto', icon: <Users /> },
                                    { label: 'Mother Photo', key: 'PASR_MotherPhoto', icon: <Users /> }
                                ].map((item, idx) => (
                                    <div key={idx} className='space-y-4 text-center'>
                                        <div className='group relative mx-auto h-48 w-40'>
                                            <div className='flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-300 border-dashed bg-slate-100 transition-all group-hover:border-indigo-400'>
                                                {reg[item.key] ? (
                                                    <img src={reg[item.key]} alt={item.label} className='h-full w-full object-cover' />
                                                ) : (
                                                    <>
                                                        <div className='mb-2 rounded-full bg-white p-3 text-slate-400 shadow-sm'>
                                                            {item.icon}
                                                        </div>
                                                        <span className='font-bold text-[10px] text-slate-400 uppercase tracking-widest'>
                                                            {item.label}
                                                        </span>
                                                    </>
                                                )}
                                                <div className='absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-indigo-900/40 opacity-0 transition-opacity group-hover:opacity-100'>
                                                    <Upload className='h-8 w-8 text-white' />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex justify-center gap-2'>
                                            <Button variant='outline' size='sm' className='h-9 rounded-full px-4 font-bold text-xs'>
                                                <Upload className='mr-2 h-3 w-3' />
                                                UPLOAD
                                            </Button>
                                            <Button variant='outline' size='sm' className='h-9 rounded-full px-4 font-bold text-xs'>
                                                <Camera className='mr-2 h-3 w-3' />
                                                WEBCAM
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>

                        {/* Sticky Action Footer */}
                        <div className='pointer-events-none sticky right-0 bottom-8 left-0 z-20 px-6'>
                            <div className='pointer-events-auto mx-auto max-w-4xl'>
                                <Card className='overflow-hidden rounded-full border border-slate-200/50 bg-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl'>
                                    <CardContent className='p-2'>
                                        <div className='flex items-center justify-between px-6 py-2'>
                                            <div className='flex items-center gap-2'>
                                                <Badge className='h-8 rounded-full border-emerald-200 bg-emerald-50 px-4 text-emerald-700 hover:bg-emerald-50'>
                                                    <CheckCircle2 className='mr-2 h-3.5 w-3.5' />
                                                    Validation Passed
                                                </Badge>
                                            </div>
                                            <div className='flex gap-3'>
                                                <Button
                                                    variant='ghost'
                                                    onClick={() => setActiveTab('list')}
                                                    className='h-12 rounded-full px-8 font-bold text-[10px] text-slate-600 uppercase tracking-widest hover:bg-slate-100'>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSave}
                                                    disabled={saveMutation.isPending}
                                                    className='h-12 rounded-full bg-indigo-600 px-12 font-bold text-[10px] text-white uppercase tracking-widest shadow-indigo-200 shadow-lg transition-all hover:bg-indigo-700 active:scale-95'>
                                                    {saveMutation.isPending ? (
                                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                    ) : (
                                                        <Save className='mr-2 h-4 w-4' />
                                                    )}
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

                <TabsContent value='list' className='fade-in slide-in-from-bottom-3 animate-in duration-500'>
                    <Card className='overflow-hidden rounded-3xl border-none shadow-2xl'>
                        <CardHeader className='border-b bg-slate-50/50 p-8'>
                            <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
                                <div className='space-y-1'>
                                    <CardTitle className='font-bold text-slate-800 text-xl'>Enrolled Students (Class IX)</CardTitle>
                                    <p className='text-slate-500 text-sm'>Showing recent applications for the current academic session.</p>
                                </div>
                                <div className='relative w-full md:w-[400px]'>
                                    <Search className='-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-slate-400' />
                                    <Input
                                        placeholder='Search by Student Name or Reg No...'
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className='h-12 rounded-2xl border-slate-200 bg-white pl-12 shadow-sm transition-all focus:ring-indigo-100'
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <DataTable
                                totalItems={filteredList.length}
                                columns={[
                                    {
                                        header: 'Reg No',
                                        accessorKey: 'pasR_RegistrationNo',
                                        cell: ({ row }: any) => (
                                            <span className='font-bold text-indigo-600 tracking-tight'>
                                                {row.original.pasR_RegistrationNo}
                                            </span>
                                        )
                                    },
                                    {
                                        header: 'Student Name',
                                        accessorKey: 'pasR_FirstName',
                                        cell: ({ row }: any) => (
                                            <div className='flex items-center gap-3'>
                                                <div className='flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-slate-100'>
                                                    {row.original.pasR_Student_Pic_Path ? (
                                                        <img
                                                            src={row.original.pasR_Student_Pic_Path}
                                                            className='h-full w-full object-cover'
                                                        />
                                                    ) : (
                                                        <User className='h-4 w-4 text-slate-400' />
                                                    )}
                                                </div>
                                                <span className='font-medium text-slate-700'>
                                                    {row.original.pasR_FirstName} {row.original.pasR_LastName || ''}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: 'Mobile',
                                        accessorKey: 'pasR_MobileNo',
                                        cell: ({ row }: any) => (
                                            <span className='font-mono text-slate-500'>{row.original.pasR_MobileNo}</span>
                                        )
                                    },
                                    {
                                        header: 'Gender',
                                        accessorKey: 'pasR_Sex',
                                        cell: ({ row }: any) => (
                                            <Badge variant='outline' className='rounded-full'>
                                                {row.original.pasR_Sex}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: 'App Date',
                                        accessorKey: 'pasR_Date',
                                        cell: ({ row }: any) =>
                                            row.original.pasR_Date ? format(new Date(row.original.pasR_Date), 'dd MMM yyyy') : '-'
                                    },
                                    {
                                        header: 'Status',
                                        accessorKey: 'pasR_ActiveFlag',
                                        cell: ({ row }: any) => (
                                            <Badge
                                                variant={row.original.pasR_ActiveFlag ? 'success' : 'destructive'}
                                                className='h-7 rounded-full px-4 font-black text-[10px] uppercase tracking-widest'>
                                                {row.original.pasR_ActiveFlag ? 'Active' : 'Inactive'}
                                            </Badge>
                                        )
                                    },
                                    {
                                        header: 'Actions',
                                        id: 'actions',
                                        cell: ({ row }: any) => (
                                            <div className='flex gap-1.5'>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-9 w-9 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'>
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() => handleDelete(row.original.pasR_Id || row.original.pasr_id)}
                                                    className='h-9 w-9 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600'>
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() =>
                                                        toggleStatusMutation.mutate(row.original.pasR_Id || row.original.pasr_id)
                                                    }
                                                    className='h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100'>
                                                    <ShieldAlert className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        )
                                    }
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
