'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bbhsStudentApplicationFormSchema } from '@/schemas/admission/preadmission/bbhs-student-application';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getReligionDropdown,
    getCasteDropdown,
    getCountryDropdown,
    getStateDropdown,
    getPreadmissionClassDropdown,
    getGenderDropdown,
    addBBHSStudentApplication,
    initiateApplicationPayment
} from '@/server/admission/preadmission/transactions/bbhs_student_application';
import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarYear as Calendar } from '@/components/ui/calendar_year';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Send, ChevronLeft, ChevronRight, User, Users, Home, School, FileUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadDocument } from '@/server/document_upload';
import Image from 'next/image';

type FormValues = z.infer<typeof bbhsStudentApplicationFormSchema.add>;

const steps = [
    { id: 'student', label: 'Student Info', icon: <User className="h-4 w-4" /> },
    { id: 'address', label: 'Address', icon: <Home className="h-4 w-4" /> },
    { id: 'parent', label: 'Parent Info', icon: <Users className="h-4 w-4" /> },
    { id: 'school', label: 'Previous School & Siblings', icon: <School className="h-4 w-4" /> },
    { id: 'upload', label: 'Uploads & Submit', icon: <FileUp className="h-4 w-4" /> }
];

export default function BBHSAddStudentApplicationForm({ onSuccess }: { onSuccess: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previews, setPreviews] = useState<{ student?: string; father?: string; mother?: string }>({});

    const form = useForm<FormValues>({
        resolver: zodResolver(bbhsStudentApplicationFormSchema.add),
        mode: 'onChange',
        defaultValues: {
            pasR_Nationality: 'Indian',
            pasR_FatherNationality: 'Indian',
            pasR_MotherNationality: 'Indian',
            pasR_ConCountry: 'India',
            pasR_PerCountry: 'India',
            siblingsDetails: [],
            previousSchoolDetails: [
                { pasrpS_PrvSchoolName: '', pasrpS_PreviousClass: '', pasrpS_Board: '', pasrpS_LeftYear: '', pasrpS_LeftReason: '', pasrpS_Address: '' }
            ]
        }
    });

    const { control, register, handleSubmit, watch, setValue, formState: { errors } } = form;

    const { fields: siblingFields, append: appendSibling, remove: removeSibling } = useFieldArray({
        control,
        name: 'siblingsDetails'
    });

    const { fields: previousSchoolFields, append: appendPrevSchool, remove: removePrevSchool } = useFieldArray({
        control,
        name: 'previousSchoolDetails'
    });

    // Dropdowns
    const { data: religions } = useQuery({ queryKey: [PREADMISSION_QUERY_KEYS.RELIGION_DROPDOWN], queryFn: () => getReligionDropdown() });
    
    const religionId = watch('religion_Id');
    const { data: castes } = useQuery({ 
        queryKey: [PREADMISSION_QUERY_KEYS.CASTE_DROPDOWN, religionId], 
        queryFn: () => getCasteDropdown(religionId),
        enabled: !!religionId
    });

    const { data: countries } = useQuery({ queryKey: [PREADMISSION_QUERY_KEYS.COUNTRY_DROPDOWN], queryFn: () => getCountryDropdown() });
    const { data: classes } = useQuery({ queryKey: [PREADMISSION_QUERY_KEYS.PREADMISSION_CLASS_DROPDOWN], queryFn: () => getPreadmissionClassDropdown() });
    const { data: genders } = useQuery({ queryKey: [PREADMISSION_QUERY_KEYS.GENDER_DROPDOWN], queryFn: () => getGenderDropdown() });
    
    const conCountry = watch('pasR_ConCountry');
    const { data: resStates } = useQuery({ 
        queryKey: [PREADMISSION_QUERY_KEYS.STATE_DROPDOWN, conCountry], 
        queryFn: () => {
            const countryId = countries?.data?.find(c => c.ivrmmC_CountryName === conCountry)?.ivrmmC_Id;
            return getStateDropdown(Number(countryId));
        },
        enabled: !!conCountry && !!countries?.data
    });

    const perCountry = watch('pasR_PerCountry');
    const { data: perStates } = useQuery({ 
        queryKey: [PREADMISSION_QUERY_KEYS.STATE_DROPDOWN, perCountry], 
        queryFn: () => {
            const countryId = countries?.data?.find(c => c.ivrmmC_CountryName === perCountry)?.ivrmmC_Id;
            return getStateDropdown(Number(countryId));
        },
        enabled: !!perCountry && !!countries?.data
    });

    const handlePhotoUpload = async (type: 'student' | 'father' | 'mother', file: File) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('SubContainerName', 'preadmission_photos');

        try {
            const res = await uploadDocument(formData);
            if (res.success) {
                const path = res.data as string;
                if (type === 'student') setValue('pasR_Student_Pic_Path' as any, path);
                if (type === 'father') setValue('pasR_FatherPhoto' as any, path);
                if (type === 'mother') setValue('pasR_MotherPhoto' as any, path);
                
                setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} photo uploaded`);
            }
        } catch (e) {
            toast.error('Failed to upload photo');
        }
    };

    const copyAddress = (checked: boolean) => {
        if (checked) {
            setValue('pasR_PerStreet', watch('pasR_ConStreet'));
            setValue('pasR_PerArea', watch('pasR_ConArea'));
            setValue('pasR_PerCountry', watch('pasR_ConCountry'));
            setValue('pasR_PerState', watch('pasR_ConState'));
            setValue('pasR_PerCity', watch('pasR_ConCity'));
            setValue('pasR_PerPincode', watch('pasR_ConPincode'));
        }
    };

    const handleSubmission = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const formattedData = {
                ...data,
                pasR_DOB: format(data.pasR_DOB, 'yyyy-MM-dd'),
                siblingsDetails: data.siblingsDetails?.map(s => s.pasrS_DOB ? { ...s, pasrS_DOB: format(s.pasrS_DOB, 'yyyy-MM-dd') } : s)
            };

            const response = (await addBBHSStudentApplication(formattedData)) as { success: boolean; message?: string; pasr_id?: number };
            if (response.success) {
                toast.success('Application submitted successfully');
                // Handle payment if required
                if (response.pasr_id) {
                    const payInit = (await initiateApplicationPayment(response.pasr_id)) as { payment_url?: string };
                    if (payInit.payment_url) {
                        window.location.href = payInit.payment_url;
                        return;
                    }
                }
                onSuccess();
            } else {
                toast.error(response.message || 'Submission failed');
            }
        } catch (error) {
            toast.error('An error occurred during submission');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    return (
        <form onSubmit={handleSubmit(handleSubmission)} className="space-y-6">
            {/* Stepper */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                {steps.map((step, index) => (
                    <div key={step.id} className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                        currentStep === index ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
                    )}>
                        {step.icon}
                        <span className="hidden md:inline font-medium text-sm">{step.label}</span>
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {currentStep === 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="font-bold text-lg border-b pb-2">Student Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>First Name <span className="text-red-500">*</span></Label>
                                <InputText {...register('pasR_FirstName')} placeholder="First Name" />
                                {errors.pasR_FirstName && <span className="text-destructive text-xs">{errors.pasR_FirstName.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Middle Name</Label>
                                <InputText {...register('pasR_MiddleName')} placeholder="Middle Name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name <span className="text-red-500">*</span></Label>
                                <InputText {...register('pasR_LastName')} placeholder="Last Name" />
                                {errors.pasR_LastName && <span className="text-destructive text-xs">{errors.pasR_LastName.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Date of Birth <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="pasR_DOB"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value instanceof Date ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.pasR_DOB && <span className="text-destructive text-xs">{errors.pasR_DOB.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Gender <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="pasR_Sex"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {genders?.data?.map((g: any) => (
                                                    <SelectItem key={g.ivrmmG_Id} value={g.ivrmmG_GenderName}>{g.ivrmmG_GenderName}</SelectItem>
                                                ))}
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Applying For Class <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="asmcL_Id"
                                    render={({ field }) => (
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes?.data?.map((cls: any) => (
                                                    <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>{cls.asmcL_ClassName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Religion <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="religion_Id"
                                    render={({ field }) => (
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Religion" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {religions?.data?.map((r: any) => (
                                                    <SelectItem key={r.ivrmmR_Id} value={r.ivrmmR_Id.toString()}>{r.ivrmmR_Name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Caste <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="caste_Id"
                                    render={({ field }) => (
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Caste" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {castes?.data?.map((c: any) => (
                                                    <SelectItem key={c.imC_Id} value={c.imC_Id.toString()}>{c.imC_CasteName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Sub-Caste</Label>
                                <InputText {...register('pasR_Caste')} placeholder="Specify Sub-Caste" />
                            </div>

                            <div className="space-y-2">
                                <Label>Mobile Number <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="pasR_MobileNo"
                                    render={({ field }) => (
                                        <InputNumber 
                                            value={field.value ? Number(field.value) : undefined} 
                                            onChange={(v) => field.onChange(v?.toString())} 
                                            placeholder="10 Digit Mobile" 
                                        />
                                    )}
                                />
                                {errors.pasR_MobileNo && <span className="text-destructive text-xs">{errors.pasR_MobileNo.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Email ID <span className="text-red-500">*</span></Label>
                                <InputText {...register('pasR_emailId')} placeholder="example@email.com" />
                            </div>

                            <div className="space-y-2">
                                <Label>Aadhar Number</Label>
                                <Controller
                                    control={control}
                                    name="pasR_AadharNo"
                                    render={({ field }) => (
                                        <InputNumber 
                                            value={field.value ? Number(field.value) : undefined} 
                                            onChange={(v) => field.onChange(v?.toString())} 
                                            placeholder="12 Digit Aadhar" 
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="font-bold text-lg border-b pb-2">Address Information</h3>
                        
                        <div className="space-y-4">
                            <h4 className="font-medium text-primary">Residential Address</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Street Address <span className="text-red-500">*</span></Label>
                                    <InputTextarea {...register('pasR_ConStreet')} rows={2} placeholder="Building No, Street Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Area / Locality <span className="text-red-500">*</span></Label>
                                    <InputText {...register('pasR_ConArea')} placeholder="Area" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Country <span className="text-red-500">*</span></Label>
                                    <Controller
                                        control={control}
                                        name="pasR_ConCountry"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Country" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries?.data?.map((c: any) => (
                                                        <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_CountryName}>{c.ivrmmC_CountryName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State <span className="text-red-500">*</span></Label>
                                    <Controller
                                        control={control}
                                        name="pasR_ConState"
                                        render={({ field }) => (
                                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select State" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {resStates?.data?.map((s: any) => (
                                                        <SelectItem key={s.ivrmmS_Id} value={s.ivrmmS_Id.toString()}>{s.ivrmmS_Name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>City <span className="text-red-500">*</span></Label>
                                    <InputText {...register('pasR_ConCity')} placeholder="City" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pincode <span className="text-red-500">*</span></Label>
                                    <Controller
                                        control={control}
                                        name="pasR_ConPincode"
                                        render={({ field }) => (
                                            <InputNumber 
                                                value={field.value ? Number(field.value) : undefined} 
                                                onChange={(v) => field.onChange(v?.toString())} 
                                                placeholder="Pincode" 
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-4 border-t">
                            <Checkbox id="copyAddr" onCheckedChange={(c) => copyAddress(!!c)} />
                            <Label htmlFor="copyAddr" className="text-sm font-medium leading-none cursor-pointer">
                                Permanent Address same as Residential Address
                            </Label>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-primary">Permanent Address</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Street Address</Label>
                                    <InputTextarea {...register('pasR_PerStreet')} rows={2} placeholder="Building No, Street Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Area / Locality</Label>
                                    <InputText {...register('pasR_PerArea')} placeholder="Area" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <Controller
                                        control={control}
                                        name="pasR_PerCountry"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Country" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries?.data?.map((c: any) => (
                                                        <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_CountryName}>{c.ivrmmC_CountryName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Controller
                                        control={control}
                                        name="pasR_PerState"
                                        render={({ field }) => (
                                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select State" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {perStates?.data?.map((s: any) => (
                                                        <SelectItem key={s.ivrmmS_Id} value={s.ivrmmS_Id.toString()}>{s.ivrmmS_Name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <InputText {...register('pasR_PerCity')} placeholder="City" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pincode</Label>
                                    <Controller
                                        control={control}
                                        name="pasR_PerPincode"
                                        render={({ field }) => (
                                            <InputNumber 
                                                value={field.value ? Number(field.value) : undefined} 
                                                onChange={(v) => field.onChange(v?.toString())} 
                                                placeholder="Pincode" 
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg border-b pb-2 flex items-center justify-between">
                                Father&apos;s Information
                                <div className="h-10 w-10 relative overflow-hidden rounded-full border bg-muted">
                                    {previews.father ? (
                                        <Image src={previews.father} alt="Father" fill className="object-cover" />
                                    ) : (
                                        <Users className="h-5 w-5 m-2.5 text-muted-foreground" />
                                    )}
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handlePhotoUpload('father', e.target.files[0])}
                                    />
                                </div>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Father Name <span className="text-red-500">*</span></Label>
                                    <InputText {...register('pasR_FatherName')} placeholder="Full Name" />
                                    {errors.pasR_FatherName && <span className="text-destructive text-xs">{errors.pasR_FatherName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Education</Label>
                                    <InputText {...register('pasR_FatherEducation')} placeholder="Highest Qualification" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Occupation Type <span className="text-red-500">*</span></Label>
                                    <Controller
                                        control={control}
                                        name="pasR_FatherOccupation"
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-4 pt-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Government" id="fg" />
                                                    <Label htmlFor="fg" className="font-normal italic">Government</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Private" id="fp" />
                                                    <Label htmlFor="fp" className="font-normal italic">Private</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Self" id="fs" />
                                                    <Label htmlFor="fs" className="font-normal italic">Self Employed</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Others" id="fo" />
                                                    <Label htmlFor="fo" className="font-normal italic">Others</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <InputText {...register('pasR_FatherDesignation')} placeholder="Designation" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Office Address</Label>
                                    <InputTextarea {...register('pasR_FatherOfficeAddr')} rows={1} placeholder="Office Address" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Father Mobile <span className="text-red-500">*</span></Label>
                                    <Controller
                                        control={control}
                                        name="pasR_FatherMobleNo"
                                        render={({ field }) => (
                                            <InputNumber 
                                                value={field.value ? Number(field.value) : undefined} 
                                                onChange={(v) => field.onChange(v?.toString())} 
                                                placeholder="10 Digit Mobile" 
                                            />
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Father Income (Annual)</Label>
                                    <Controller
                                        control={control}
                                        name="pasR_FatherIncome"
                                        render={({ field }) => (
                                            <InputNumber 
                                                value={field.value} 
                                                onChange={field.onChange} 
                                                placeholder="Annual Income" 
                                            />
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Father PAN</Label>
                                    <InputText {...register('pasR_FatherPanno')} placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Passing Year</Label>
                                    <InputText {...register('pasR_FatherPassingYear')} placeholder="YYYY" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t">
                            <h3 className="font-bold text-lg border-b pb-2 flex items-center justify-between">
                                Mother&apos;s Information
                                <div className="h-10 w-10 relative overflow-hidden rounded-full border bg-muted">
                                    {previews.mother ? (
                                        <Image src={previews.mother} alt="Mother" fill className="object-cover" />
                                    ) : (
                                        <Users className="h-5 w-5 m-2.5 text-muted-foreground" />
                                    )}
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handlePhotoUpload('mother', e.target.files[0])}
                                    />
                                </div>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Mother Name <span className="text-red-500">*</span></Label>
                                    <InputText {...register('pasR_MotherName')} placeholder="Full Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Education</Label>
                                    <InputText {...register('pasR_MotherEducation')} placeholder="Highest Qualification" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Occupation Type <span className="text-red-500">*</span></Label>
                                    <Controller
                                        control={control}
                                        name="pasR_MotherOccupation"
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-4 pt-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Government" id="mg" />
                                                    <Label htmlFor="mg" className="font-normal italic">Government</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Private" id="mp" />
                                                    <Label htmlFor="mp" className="font-normal italic">Private</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Self" id="ms" />
                                                    <Label htmlFor="ms" className="font-normal italic">Self Employed</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Others" id="mo" />
                                                    <Label htmlFor="mo" className="font-normal italic">Others</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mother Mobile</Label>
                                    <Controller
                                        control={control}
                                        name="pasR_MotherMobleNo"
                                        render={({ field }) => (
                                            <InputNumber 
                                                value={field.value ? Number(field.value) : undefined} 
                                                onChange={(v) => field.onChange(v?.toString())} 
                                                placeholder="10 Digit Mobile" 
                                            />
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mother Income</Label>
                                    <Controller
                                        control={control}
                                        name="pasR_MotherIncome"
                                        render={({ field }) => (
                                            <InputNumber 
                                                value={field.value} 
                                                onChange={field.onChange} 
                                                placeholder="Annual Income" 
                                            />
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mother PAN</Label>
                                    <InputText {...register('pasR_MotherPanno')} placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Passing Year</Label>
                                    <InputText {...register('pasR_MotherPassingYear')} placeholder="YYYY" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-bold text-lg">Sibling Details</h3>
                                <Button type="button" size="sm" onClick={() => appendSibling({ 
                                    pasrS_SiblingsName: '', pasrS_SiblingsClass: '', pasrS_SiblingsAdmissionNo: '', 
                                    pasrS_SchoolName: '', pasrS_Institution: 'BBHS' 
                                })}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Sibling
                                </Button>
                            </div>
                            
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="p-3 text-left">Sibling Name</th>
                                            <th className="p-3 text-left">Class</th>
                                            <th className="p-3 text-left">Adm No</th>
                                            <th className="p-3 text-left">School Name</th>
                                            <th className="p-3 text-left">Institution</th>
                                            <th className="p-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {siblingFields.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                                                    No sibling details added. Click &quot;Add Sibling&quot; if applicable.
                                                </td>
                                            </tr>
                                        ) : (
                                            siblingFields.map((field, index) => (
                                                <tr key={field.id} className="hover:bg-muted/50">
                                                    <td className="p-2">
                                                        <InputText {...register(`siblingsDetails.${index}.pasrS_SiblingsName`)} placeholder="Name" />
                                                    </td>
                                                    <td className="p-2">
                                                        <InputText {...register(`siblingsDetails.${index}.pasrS_SiblingsClass`)} placeholder="Class" />
                                                    </td>
                                                    <td className="p-2">
                                                        <InputText {...register(`siblingsDetails.${index}.pasrS_SiblingsAdmissionNo`)} placeholder="Adm No" />
                                                    </td>
                                                    <td className="p-2">
                                                        <InputText {...register(`siblingsDetails.${index}.pasrS_SchoolName`)} placeholder="School Name" />
                                                    </td>
                                                    <td className="p-2">
                                                        <Controller
                                                            control={control}
                                                            name={`siblingsDetails.${index}.pasrS_Institution`}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="BBHS">Baldwin Boys&apos; High School</SelectItem>
                                                                        <SelectItem value="BGHRS">Baldwin Girls&apos; High School</SelectItem>
                                                                        <SelectItem value="BCHRS">Baldwin Co-Education</SelectItem>
                                                                        <SelectItem value="Others">Others</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSibling(index)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-bold text-lg">Previous School Details</h3>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendPrevSchool({ 
                                    pasrpS_PrvSchoolName: '', pasrpS_PreviousClass: '', pasrpS_Board: '', 
                                    pasrpS_LeftYear: '', pasrpS_LeftReason: '', pasrpS_Address: '' 
                                })}>
                                    <Plus className="h-4 w-4 mr-1" /> Add School
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {previousSchoolFields.map((field, index) => (
                                    <div key={field.id} className="p-4 rounded-lg border bg-muted/20 relative">
                                        {index > 0 && (
                                            <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removePrevSchool(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <Label>School Name</Label>
                                                <InputText {...register(`previousSchoolDetails.${index}.pasrpS_PrvSchoolName`)} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Class</Label>
                                                <InputText {...register(`previousSchoolDetails.${index}.pasrpS_PreviousClass`)} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Board</Label>
                                                <InputText {...register(`previousSchoolDetails.${index}.pasrpS_Board`)} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Year Left</Label>
                                                <InputText {...register(`previousSchoolDetails.${index}.pasrpS_LeftYear`)} maxLength={4} />
                                            </div>
                                            <div className="md:col-span-2 space-y-1">
                                                <Label>Address</Label>
                                                <InputText {...register(`previousSchoolDetails.${index}.pasrpS_Address`)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="font-bold text-lg border-b pb-2">Final Step: Documents & Submit</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <Label className="text-primary font-bold">Uploaded Photos</Label>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-32 w-28 relative border-2 border-dashed rounded flex items-center justify-center bg-muted overflow-hidden">
                                            {previews.student ? (
                                                <Image src={previews.student} alt="Student" fill className="object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 p-2 text-center">
                                                    <FileUp className="h-6 w-6 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground">Student Photo</span>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handlePhotoUpload('student', e.target.files[0])}
                                            />
                                        </div>
                                        <span className="text-xs font-medium">Student</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-32 w-28 relative border-2 border-dashed rounded flex items-center justify-center bg-muted overflow-hidden">
                                            {previews.father ? (
                                                <Image src={previews.father} alt="Father" fill className="object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 p-2 text-center text-xs">
                                                    <FileUp className="h-6 w-6 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground">Father Photo</span>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handlePhotoUpload('father', e.target.files[0])}
                                            />
                                        </div>
                                        <span className="text-xs font-medium">Father</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-32 w-28 relative border-2 border-dashed rounded flex items-center justify-center bg-muted overflow-hidden">
                                            {previews.mother ? (
                                                <Image src={previews.mother} alt="Mother" fill className="object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 p-2 text-center text-xs">
                                                    <FileUp className="h-6 w-6 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground">Mother Photo</span>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handlePhotoUpload('mother', e.target.files[0])}
                                            />
                                        </div>
                                        <span className="text-xs font-medium">Mother</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-6 rounded-lg bg-primary/5 border border-primary/20">
                                <h4 className="font-bold flex items-center gap-2 text-primary">
                                    <Info className="h-4 w-4" /> Final Review
                                </h4>
                                <ul className="text-sm space-y-3">
                                    <li className="flex gap-2">
                                        <div className={cn("h-2 w-2 rounded-full mt-1.5", watch('pasR_FirstName') ? "bg-green-500" : "bg-red-500")} />
                                        <span>Student: {watch('pasR_FirstName')} {watch('pasR_LastName') || '(Missing)'}</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <div className={cn("h-2 w-2 rounded-full mt-1.5", watch('asmcL_Id') ? "bg-green-500" : "bg-red-500")} />
                                        <span>Applied Class: {classes?.data?.find(c => c.asmcL_Id === watch('asmcL_Id'))?.asmcL_ClassName || '(Missing)'}</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <div className={cn("h-2 w-2 rounded-full mt-1.5", watch('pasR_FatherName') ? "bg-green-500" : "bg-red-500")} />
                                        <span>Father: {watch('pasR_FatherName') || '(Missing)'}</span>
                                    </li>
                                </ul>

                                <div className="flex bg-white/50 items-start space-x-2 p-3 mt-4 rounded border">
                                    <Checkbox id="undertaking" onCheckedChange={(c) => setValue('pasR_UndertakingFlag', !!c)} />
                                    <Label htmlFor="undertaking" className="text-xs font-normal leading-tight italic">
                                        I hereby declare that all information provided is true and correct to the best of my knowledge. I understand that any false information may lead to rejection of this application.
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-10 border-t gap-4">
                           <p className="text-sm text-muted-foreground max-w-md text-center">
                               By clicking &quot;Submit Application&quot;, you will be redirected to the payment gateway to complete the registration process.
                           </p>
                           <Button 
                                type="submit" 
                                size="lg" 
                                className="w-full md:w-80 shadow-xl gap-2 font-bold" 
                                disabled={isSubmitting || !watch('pasR_UndertakingFlag')}
                            >
                                {isSubmitting ? <><Plus className="h-4 w-4 animate-spin" /> Processing...</> : <><Send className="h-4 w-4" /> Submit Application</>}
                           </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t pt-6 bg-background/80 backdrop-blur sticky bottom-0 pb-4">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={prevStep} 
                    disabled={currentStep === 0 || isSubmitting}
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                
                {currentStep < steps.length - 1 && (
                    <Button 
                        type="button" 
                        onClick={nextStep} 
                        disabled={isSubmitting}
                        className="gap-2"
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </form>
    );
}
