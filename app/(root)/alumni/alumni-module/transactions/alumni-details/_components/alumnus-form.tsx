'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    alumnusMembershipSchema,
    type IAlumnusMembershipFormValues
} from './schema';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, X, Plus, Save, RotateCcw, Image as ImageIcon, Briefcase, GraduationCap, Award, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    saveAlumnusData,
    saveNewAlumnus,
    uploadProfilePic,
    onCountryChange,
    onStateChange
} from '@/server/alumni/alumnus-membership';
import QualificationSection from './qualification-section';
import ProfessionalSection from './professional-section';
import AchievementSection from './achievement-section';
import ReadmittedSection from './readmitted-section';
import type {
    IYear,
    IClass,
    IMemberCategory,
    ICountry,
    IState,
    IDistrict
} from '@/types/alumni/alumnus-membership';

interface AlumnusFormProps {
    initialData?: any;
    years: IYear[];
    classes: IClass[];
    categories: IMemberCategory[];
    countries: ICountry[];
    states: IState[];
    districts: IDistrict[];
    onCancel: () => void;
    onSuccess: () => void;
    isAdmin: boolean;
}

export default function AlumnusForm({
    initialData,
    years,
    classes,
    categories,
    countries,
    states: initialStates,
    districts: initialDistricts,
    onCancel,
    onSuccess,
    isAdmin
}: AlumnusFormProps) {
    const [currentStates, setCurrentStates] = useState<IState[]>(initialStates);
    const [currentDistricts, setCurrentDistricts] = useState<IDistrict[]>(initialDistricts);
    const [stuPhoto, setStuPhoto] = useState<string>(initialData?.almsT_StudentPhoto || '');
    const [famPhoto, setFamPhoto] = useState<string>(initialData?.almsT_FamilyPhoto || '');

    const form = useForm<IAlumnusMembershipFormValues>({
        resolver: zodResolver(alumnusMembershipSchema),
        defaultValues: {
            ALMST_Id: initialData?.almsT_Id || 0,
            ALMST_FirstName: initialData?.amsT_FirstName || '',
            ALMST_MiddleName: initialData?.almsT_MiddleName || '',
            ALMST_LastName: initialData?.almsT_LastName || '',
            ALMST_NickName: initialData?.almsT_NickName || '',
            ALMST_AdmNo: initialData?.almsT_AdmNo || '',
            ALMST_DOB: initialData?.almsT_DOB ? new Date(initialData.almsT_DOB) : undefined,
            ALMST_MobileNo: initialData?.almsT_MobileNo?.toString() || '',
            ALMST_FatherName: initialData?.almsT_FatherName || '',
            ALMST_PhoneNo: initialData?.almsT_PhoneNo || '',
            ALMST_emailId: initialData?.almsT_emailId || '',
            ALMST_BloodGroup: initialData?.almsT_BloodGroup || '',
            ALMST_Marital_Status: initialData?.almsT_Marital_Status?.toString() || '0',

            ALMST_PerCountry: initialData?.ivrmmC_Id?.toString() || '',
            ALMST_PerState: initialData?.almsT_ConState?.toString() || '',
            ALMST_PerDistrict: initialData?.almsT_PerDistrict?.toString() || '',
            ALMST_ConCity: initialData?.almsT_ConCity || '',
            ALMST_ConArea: initialData?.almsT_ConArea || '',
            ALMST_ConStreet: initialData?.almsT_ConStreet || '',
            ALMST_ConPincode: initialData?.almsT_ConPincode || '',
            ALMST_FullAddess: initialData?.almsT_FullAddess || '',

            ASMAY_Id_Join: initialData?.asmaY_Id_Join?.toString() || '',
            ASMAY_Id_Left: initialData?.asmaY_Id_Left?.toString() || '',
            ASMCL_Id_Join: initialData?.asmcL_Id_Join?.toString() || '',
            ASMCL_Id_Left: initialData?.asmcL_Id_Left?.toString() || '',

            ALMST_MembershipCategory: initialData?.almsT_MembershipCategory?.toString() || '',
            ALMST_AmountPaid: initialData?.almsT_AmountPaid || '',
            ALMST_MembershipId: initialData?.almsT_MembershipId || '',

            ALSPR_CompanyName: initialData?.alspR_CompanyName || '',
            ALSPR_Designation: initialData?.alspR_Designation || '',
            ALSPR_WorkingSince: initialData?.alspR_WorkingSince?.toString() || '',
            ALSPR_CompanyAddress: initialData?.alspR_CompanyAddress || '',
            ALSPR_EmailId: initialData?.alspR_EmailId || '',
            ALSPR_OtherDetails: initialData?.alspR_OtherDetails || '',

            ALSAC_Achievement: initialData?.alsaC_Achievement || '',
            ALSAC_Remarks: initialData?.alsaC_Remarks || '',

            qualification_array: [],
            ReadmittedStudentDTO: []
        }
    });

    const handleCountryChange = async (countryId: string) => {
        form.setValue('ALMST_PerCountry', countryId);
        form.setValue('ALMST_PerState', '');
        form.setValue('ALMST_PerDistrict', '');
        if (!countryId) return;
        const res = await onCountryChange(parseInt(countryId));
        if (res.success) {
            setCurrentStates(res.data || []);
        }
    };

    const handleStateChange = async (stateId: string) => {
        form.setValue('ALMST_PerState', stateId);
        form.setValue('ALMST_PerDistrict', '');
        if (!stateId) return;
        const res = await onStateChange(parseInt(stateId));
        if (res.success) {
            setCurrentDistricts(res.data?.districtdropdown || []);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'stu' | 'fam') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        const formData = new FormData();
        formData.append('File', file);
        formData.append('Id', '0');

        const res = await uploadProfilePic(formData);
        if (res.success && res.data) {
            if (type === 'stu') setStuPhoto(res.data);
            else setFamPhoto(res.data);
            toast.success('Photo uploaded successfully');
        } else {
            toast.error(res.message || 'Photo upload failed');
        }
    };

    const onSubmit = async (values: IAlumnusMembershipFormValues) => {
        const payload: any = {
            ...values,
            ALMST_StudentPhoto: stuPhoto,
            ALMST_FamilyPhoto: famPhoto,
            ALMST_Marital_Status: parseInt(values.ALMST_Marital_Status),
            ASMAY_Id_Join: values.ASMAY_Id_Join ? parseInt(values.ASMAY_Id_Join) : undefined,
            ASMAY_Id_Left: values.ASMAY_Id_Left ? parseInt(values.ASMAY_Id_Left) : undefined,
            ASMCL_Id_Join: values.ASMCL_Id_Join ? parseInt(values.ASMCL_Id_Join) : undefined,
            ASMCL_Id_Left: values.ASMCL_Id_Left ? parseInt(values.ASMCL_Id_Left) : undefined,
            ALMST_MembershipCategory: values.ALMST_MembershipCategory ? parseInt(values.ALMST_MembershipCategory) : undefined,
            ALMST_PerCountry: values.ALMST_PerCountry ? parseInt(values.ALMST_PerCountry) : undefined,
            ALMST_PerState: values.ALMST_PerState ? parseInt(values.ALMST_PerState) : undefined,
            ALMST_PerDistrict: values.ALMST_PerDistrict ? parseInt(values.ALMST_PerDistrict) : 0,
            ALSPR_WorkingSince: values.ALSPR_WorkingSince ? parseInt(values.ALSPR_WorkingSince) : undefined,
            ALMST_DOB: values.ALMST_DOB.toISOString(),
            ALMST_WeddingAnniversaryDate: values.ALMST_WeddingAnniversaryDate?.toISOString()
        };

        const res = initialData ? await saveAlumnusData(payload) : await saveNewAlumnus(payload);

        if (res.success) {
            toast.success(res.message || 'Settings saved successfully');
            onSuccess();
        } else {
            toast.error(res.message || 'Failed to save settings');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <CollapsibleSection title="Basic Alumnus Information" defaultOpen={true} icon={<GraduationCap className="h-5 w-5" />}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Name Fields */}
                        <FormField
                            control={form.control}
                            name="ALMST_FirstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter first name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ALMST_MiddleName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Middle Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter middle name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ALMST_LastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter last name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ALMST_NickName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nick Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter nick name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ALMST_AdmNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Admission Number <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Admission No" {...field} disabled={!!initialData} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ALMST_DOB"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Personal & Membership Details" defaultOpen={false} icon={<ImageIcon className="h-5 w-5" />}>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField control={form.control} name="ALMST_MobileNo" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Number <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input placeholder="10-digit mobile" maxLength={10} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="ALMST_emailId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email ID <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input placeholder="email@example.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="ALMST_FatherName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Father Name <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input placeholder="Father's Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="ALMST_BloodGroup" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blood Group <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <FormField control={form.control} name="ALMST_MembershipCategory" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Membership Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem key={c.almmC_Id} value={c.almmC_Id.toString()}>{c.almmC_MembershipCategory}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="ALMST_AmountPaid" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fee Paid</FormLabel>
                                        <FormControl><Input placeholder="Amount" {...field} disabled={!isAdmin} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="ALMST_MembershipId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Membership ID</FormLabel>
                                        <FormControl><Input placeholder="ID" {...field} disabled={!isAdmin} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                        <div className="w-full lg:w-72 space-y-4">
                            <div className="space-y-4">
                                <FormLabel>Student Photo</FormLabel>
                                <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                                    {stuPhoto ? (
                                        <img src={stuPhoto} alt="Student" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" />
                                    )}
                                    <input type="file" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => handlePhotoUpload(e, 'stu')} />
                                </div>
                                <FormDescription className="text-xs text-center">Click to upload JPG/PNG (Max 2MB)</FormDescription>
                            </div>
                            <div className="space-y-4">
                                <FormLabel>Family Photo</FormLabel>
                                <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                                    {famPhoto ? (
                                        <img src={famPhoto} alt="Family" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" />
                                    )}
                                    <input type="file" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => handlePhotoUpload(e, 'fam')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Contact & Address" defaultOpen={false} icon={<MapPin className="h-5 w-5" />}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <FormField control={form.control} name="ALMST_PerCountry" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={handleCountryChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger></FormControl>
                                    <SelectContent>{countries.map(c => <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>{c.ivrmmC_CountryName}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ALMST_PerState" render={({ field }) => (
                            <FormItem>
                                <FormLabel>State <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={handleStateChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                                    <SelectContent>{currentStates.map(s => <SelectItem key={s.ivrmmS_Id} value={s.ivrmmS_Id.toString()}>{s.ivrmmS_Name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ALMST_PerDistrict" render={({ field }) => (
                            <FormItem>
                                <FormLabel>District</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                    <SelectContent>{currentDistricts.map(d => <SelectItem key={d.ivrmmD_Id} value={d.ivrmmD_Id.toString()}>{d.ivrmmD_Name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ALMST_ConCity" render={({ field }) => (
                            <FormItem>
                                <FormLabel>City <span className="text-destructive">*</span></FormLabel>
                                <FormControl><Input placeholder="City name" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ALMST_ConPincode" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pincode <span className="text-destructive">*</span></FormLabel>
                                <FormControl><Input placeholder="6-digit PIN" maxLength={6} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ALMST_ConArea" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address Line 1 <span className="text-destructive">*</span></FormLabel>
                                <FormControl><Input placeholder="Area/Locality" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="ALMST_ConStreet" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address Line 2 (Street)</FormLabel>
                                <FormControl><Input placeholder="Street name" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="md:col-span-2">
                            <FormField control={form.control} name="ALMST_FullAddess" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Address</FormLabel>
                                    <FormControl><Textarea placeholder="Generated full address" className="min-h-[100px]" {...field} disabled /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                </CollapsibleSection>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <QualificationSection form={form} states={initialStates} />
                    <ProfessionalSection form={form} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AchievementSection form={form} />
                    <ReadmittedSection form={form} years={years} classes={classes} />
                </div>

                <div className="flex justify-center gap-4 border-t pt-8">
                    <Button type="submit" size="lg" className="w-40 bg-primary hover:bg-primary/90">
                        <Save className="mr-2 h-5 w-5" /> Save Profile
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="w-40" onClick={onCancel}>
                        <RotateCcw className="mr-2 h-5 w-5" /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
