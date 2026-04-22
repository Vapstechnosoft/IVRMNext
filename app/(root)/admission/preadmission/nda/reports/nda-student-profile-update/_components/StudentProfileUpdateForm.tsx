'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { MobileNumberInput } from '@/components/ui/extension/input-mobile-number';
import { 
    ndaStudentProfileUpdateSchema, 
    NdaStudentProfileUpdateFields 
} from '@/schemas/admission/nda-student-profile-update';
import { Switch } from '@/components/ui/switch';
import { 
    useNdaStudentProfileDetails, 
    useNdaSaveRequest
} from '@/hooks/admission/preadmission/useNdaStudentProfileUpdate';
import { AddressFields } from './AddressFields';
import { ImageUploadSection } from './ImageUploadSection';
import { Save, X, User, Phone, Mail, Droplets, RefreshCcw } from 'lucide-react';

export const StudentProfileUpdateForm = () => {
    const [updateFlag, setUpdateFlag] = React.useState(false);
    const { data: initialData, isLoading: detailsLoading } = useNdaStudentProfileDetails(updateFlag);
    const { mutateAsync: saveRequest, isPending: isSaving } = useNdaSaveRequest();
    
    // Form setup
    const form = useForm<NdaStudentProfileUpdateFields>({
        resolver: zodResolver(ndaStudentProfileUpdateSchema),
        defaultValues: {
            ASTUREQ_Id: 0,
            AMSTG_Id: 0,
            AMST_ID: 0,
            Mobilenumber: '',
            EmailidforCandidate: '',
            Bloodgroup: '',
            Guardianname: '',
            AMSTG_GuardianPhoneNo: '',
            AMSTG_emailid: '',
            AMST_FatherMobleNo: '',
            AMST_FatheremailId: '',
            AMST_MotherMobileNo: '',
            AMST_MotherEmailId: '',
            Resstreet: '',
            ResArea: '',
            Rescity: '',
            Rescountry: '',
            Resstate: '',
            ResPincode: '',
            Perstreett: '',
            PerArea: '',
            Percity: '',
            PerState: '',
            PerPincode: ''
        }
    });

    const { control, handleSubmit, setValue, reset, formState: { errors } } = form;

    // Populate form data from initial data
    useEffect(() => {
        const student = (initialData as any)?.data || (initialData as any)?.updatestudetailslist?.[0];
        if (student) {
            // Populate basic fields
            setValue('ASTUREQ_Id', student.astureQ_Id || 0);
            setValue('AMSTG_Id', student.amstG_Id || 0);
            setValue('AMST_ID', student.amsT_Id || 0);
            setValue('Mobilenumber', student.amsT_MobileNo || student.mobilenumber ? String(student.amsT_MobileNo || student.mobilenumber) : '');
            setValue('EmailidforCandidate', student.amsT_emailId || student.emailidforCandidate || '');
            setValue('Bloodgroup', student.amsT_BloodGroup || '');
            setValue('Guardianname', student.amstG_GuardianName || student.Guardianname || '');
            setValue('AMSTG_GuardianPhoneNo', student.astureQ_GuardianMobileNo || student.amsT_GuardianPhoneNo ? String(student.astureQ_GuardianMobileNo || student.amsT_GuardianPhoneNo) : '');
            setValue('AMSTG_emailid', student.astureQ_GuardianEmailId || student.amsT_emailid || '');
            setValue('AMST_FatherMobleNo', student.amsT_FatherMobleNo ? String(student.amsT_FatherMobleNo) : '');
            setValue('AMST_FatheremailId', student.amsT_FatheremailId || '');
            setValue('AMST_MotherMobileNo', student.amsT_MotherMobileNo ? String(student.amsT_MotherMobileNo) : '');
            setValue('AMST_MotherEmailId', student.amsT_MotherEmailId || '');

            // Photos - Handle legacy names
            setValue('ASTUREQ_StudentPhoto', student.astureQ_StudentPhoto || student.amsT_Photoname || '');
            setValue('ASTUREQ_FatherPhoto', student.astureQ_FatherPhoto || student.ansT_FatherPhoto || '');
            setValue('ASTUREQ_MotherPhoto', student.astureQ_MotherPhoto || student.ansT_MotherPhoto || '');
            setValue('ASTUREQ_GuardianPhoto', student.astureQ_GuardianPhoto || student.astureQ_GuardianPhoto || '');

            // Address - Residential (Current in student profile)
            setValue('Resstreet', student.amsT_ConStreet || student.stP_CURSTREET || '');
            setValue('ResArea', student.amsT_ConArea || student.stP_CURAREA || '');
            setValue('Rescity', student.amsT_ConCity || student.stP_CURCITY || '');
            setValue('Rescountry', student.amsT_ConCountry || student.stP_CURCOUNTRY || '');
            setValue('Resstate', student.amsT_ConState || student.stP_CURSTATE || '');
            setValue('ResPincode', student.amsT_ConPincode || student.stP_CURPIN ? String(student.amsT_ConPincode || student.stP_CURPIN) : '');

            // Address - Permanent
            setValue('Perstreett', student.amsT_PerStreet || student.stP_PERSTREET || '');
            setValue('PerArea', student.amsT_PerArea || student.stP_PERAREA || '');
            setValue('Percity', student.amsT_PerCity || student.stP_PERCITY || '');
            setValue('Percountry', student.amsT_PerCountry || student.stP_PERCOUNTRY || '');
            setValue('PerState', student.amsT_PerState || student.stP_PERSTATE || '');
            setValue('PerPincode', student.amsT_PerPincode || student.stP_PERPIN ? String(student.amsT_PerPincode || student.stP_PERPIN) : '');
            
            // Meta
            setValue('ASTUREQ_Date', student.astureQ_Date || '');
        }
    }, [initialData, setValue]);

    const onSubmit = async (data: NdaStudentProfileUpdateFields) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to send update request?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#60cc91",
            confirmButtonText: "Yes, Send it!",
            cancelButtonText: "Cancel",
            customClass: {
                container: 'rounded-3xl',
                popup: 'rounded-3xl',
            }
        });
        
        if (!confirm.isConfirmed) return;

        try {
            const student = (initialData as any)?.data || {};
            
            const payload = {
                "ASTUREQ_Id": data.ASTUREQ_Id,
                "AMSTG_Id": data.AMSTG_Id,
                "AMST_ID": data.AMST_ID,
                "Mobilenumber": data.Mobilenumber,
                "EmailidforCandidate": data.EmailidforCandidate,
                "AMST_FatherMobleNo": data.AMST_FatherMobleNo,
                "AMST_MotherMobileNo": data.AMST_MotherMobileNo,
                "AMST_MotherEmailId": data.AMST_MotherEmailId,
                "AMST_FatheremailId": data.AMST_FatheremailId,
                "AMSTG_GuardianPhoneNo": data.AMSTG_GuardianPhoneNo,
                "AMSTG_emailid": data.AMSTG_emailid,
                "ASTUREQ_GuardianMobileNo": data.AMSTG_GuardianPhoneNo,
                "ASTUREQ_GuardianEmailId": data.AMSTG_emailid,
                "AMSTG_GuardianName": data.Guardianname,
                "ASTUREQ_StudentPhoto": data.ASTUREQ_StudentPhoto,
                "ASTUREQ_FatherPhoto": data.ASTUREQ_FatherPhoto,
                "ASTUREQ_MotherPhoto": data.ASTUREQ_MotherPhoto,
                "ASTUREQ_GuardianPhoto": data.ASTUREQ_GuardianPhoto,
                "STP_PERSTREET": data.Perstreett,
                "STP_PERAREA": data.PerArea,
                "STP_PERCITY": data.Percity,
                "STP_PERSTATE": data.PerState,
                "STP_PERCOUNTRY": data.Percountry,
                "STP_PERPIN": data.PerPincode,
                "STP_CURSTREET": data.Resstreet,
                "STP_CURAREA": data.ResArea,
                "STP_CURCITY": data.Rescity,
                "STP_CURSTATE": data.Resstate,
                "STP_CURCOUNTRY": data.Rescountry,
                "STP_CURPIN": data.ResPincode,
                "AMST_BloodGroup": data.Bloodgroup,
            };

            const res = await saveRequest(payload);
            if (res.success) {
                toast.success("Update request sent successfully!");
            } else {
                toast.error(res.message || "Failed to send update request.");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("An unexpected error occurred.");
        }
    };

    if (detailsLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] p-12 space-y-4">
                <Spinner className="h-16 w-16 text-primary animate-spin" />
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-primary animate-pulse">Fetching Profile</h3>
                    <p className="text-muted-foreground">Please wait while we load your information...</p>
                </div>
            </div>
        );
    }

    const studentInfo = (initialData as any)?.data || {};
    const countries = (initialData as any)?.data?.countryDrpDown || [];
    const states = (initialData as any)?.data?.stateDrpDown || [];
    
    const fullName = `${studentInfo.amsT_FirstName || ''} ${studentInfo.amsT_MiddleName || ''} ${studentInfo.amsT_LastName || ''}`.trim();
    
    const getStatusInfo = (status: any) => {
        if (status === true || status === 1) return { label: 'Approved', color: 'text-emerald-600 bg-emerald-50' };
        if (status === false || status === 0) return { label: 'Rejected', color: 'text-rose-600 bg-rose-50' };
        return { label: 'Pending', color: 'text-amber-600 bg-amber-50' };
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-20">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6 rounded-xl bg-white border border-primary/10 shadow-md sticky top-4 z-[60]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                        <Label htmlFor="view-mode" className="text-[10px] font-black uppercase tracking-widest text-primary/60 cursor-pointer">Original</Label>
                        <Switch id="view-mode" checked={updateFlag} onCheckedChange={setUpdateFlag} />
                        <Label htmlFor="view-mode" className="text-[10px] font-black uppercase tracking-widest text-primary cursor-pointer">Request</Label>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100/80 text-[10px] font-black text-neutral-500 uppercase tracking-widest border border-neutral-200">
                        {updateFlag ? <RefreshCcw className="h-3 w-3 animate-spin-slow text-primary" /> : <User className="h-3 w-3 text-primary" />}
                        {updateFlag ? 'Previewing Request' : 'Viewing Profile'}
                    </div>
                </div>
            </div>

            {/* Row 1: Student & Guardian Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Details */}
                <Card className="rounded-none border-t-4 border-t-[#3c8dbc] shadow-md">
                    <CardHeader className="bg-[#3c8dbc] py-2 px-4">
                        <CardTitle className="text-sm font-bold text-white uppercase text-center">
                            STUDENT NAME: {fullName || 'Student Name'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">Mobile Number:<span className="text-red-500">*</span></Label>
                                <div className="col-span-8">
                                    <Controller name="Mobilenumber" control={control} render={({ field }) => <MobileNumberInput {...field} maxLength={10} className="rounded-none h-8 text-xs" placeholder="Enter MobileNumber" />} />
                                    {errors.Mobilenumber && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.Mobilenumber.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">Email ID:<span className="text-red-500">*</span></Label>
                                <div className="col-span-8">
                                    <Controller name="EmailidforCandidate" control={control} render={({ field }) => <InputText {...field} className="rounded-none h-8 text-xs" placeholder="Enter Email ID" />} />
                                    {errors.EmailidforCandidate && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.EmailidforCandidate.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">Blood Group:</Label>
                                <div className="col-span-8">
                                    <Controller
                                        name="Bloodgroup"
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="rounded-none h-8 text-xs">
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'A1+ve', 'A1-ve', 'B1+ve', 'B1-ve', 'A2+ve', 'A1B+ve', 'A2B+ve', 'A1B2', 'A1B-ve'].map(bg => (
                                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guardian Details */}
                <Card className="rounded-none border-t-4 border-t-[#3c8dbc] shadow-md">
                    <CardHeader className="bg-[#3c8dbc] py-2 px-4">
                        <CardTitle className="text-sm font-bold text-white uppercase text-center">
                            GUARDIAN NAME: {studentInfo.amstG_GuardianName || studentInfo.Guardianname || 'N/A'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">GUARDIAN NAME:</Label>
                                <div className="col-span-8">
                                    <Controller name="Guardianname" control={control} render={({ field }) => <InputText {...field} className="rounded-none h-8 text-xs" placeholder="Enter Street" />} />
                                </div>
                            </div>
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">Mobile Number:</Label>
                                <div className="col-span-8">
                                    <Controller name="AMSTG_GuardianPhoneNo" control={control} render={({ field }) => <MobileNumberInput {...field} maxLength={10} className="rounded-none h-8 text-xs" placeholder="Enter MobileNumber" />} />
                                </div>
                            </div>
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">Email ID:</Label>
                                <div className="col-span-8">
                                    <Controller name="AMSTG_emailid" control={control} render={({ field }) => <InputText {...field} className="rounded-none h-8 text-xs" placeholder="Enter Email ID" />} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Photo Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Controller name="ASTUREQ_StudentPhoto" control={control} render={({ field }) => <ImageUploadSection label="Upload Student Photo" value={field.value || ''} onChange={field.onChange} variant="minimal" />} />
                <Controller name="ASTUREQ_MotherPhoto" control={control} render={({ field }) => <ImageUploadSection label="Upload Mother Photo" value={field.value || ''} onChange={field.onChange} variant="minimal" />} />
                <Controller name="ASTUREQ_FatherPhoto" control={control} render={({ field }) => <ImageUploadSection label="Upload Father Photo" value={field.value || ''} onChange={field.onChange} variant="minimal" />} />
                <Controller name="ASTUREQ_GuardianPhoto" control={control} render={({ field }) => <ImageUploadSection label="Upload Photo" value={field.value || ''} onChange={field.onChange} variant="minimal" />} />
            </div>

            {/* Row 3: Father & Mother Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Father Details */}
                <Card className="rounded-none border-t-4 border-t-[#3c8dbc] shadow-md">
                    <CardHeader className="bg-[#3c8dbc] py-2 px-4">
                        <CardTitle className="text-sm font-bold text-white uppercase text-center">
                            FATHER NAME: {studentInfo.fatherName || '---'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">Mobile Number:<span className="text-red-500">*</span></Label>
                                <div className="col-span-8">
                                    <Controller name="AMST_FatherMobleNo" control={control} render={({ field }) => <MobileNumberInput {...field} maxLength={10} className="rounded-none h-8 text-xs" placeholder="Enter MobileNumber" />} />
                                    {errors.AMST_FatherMobleNo && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.AMST_FatherMobleNo.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">Email ID:<span className="text-red-500">*</span></Label>
                                <div className="col-span-8">
                                    <Controller name="AMST_FatheremailId" control={control} render={({ field }) => <InputText {...field} className="rounded-none h-8 text-xs" placeholder="Enter Email ID" />} />
                                    {errors.AMST_FatheremailId && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.AMST_FatheremailId.message}</p>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mother Details */}
                <Card className="rounded-none border-t-4 border-t-[#3c8dbc] shadow-md">
                    <CardHeader className="bg-[#3c8dbc] py-2 px-4">
                        <CardTitle className="text-sm font-bold text-white uppercase text-center">
                            MOTHER NAME: {studentInfo.mothername || '---'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">Mobile Number:<span className="text-red-500">*</span></Label>
                                <div className="col-span-8">
                                    <Controller name="AMST_MotherMobileNo" control={control} render={({ field }) => <MobileNumberInput {...field} maxLength={10} className="rounded-none h-8 text-xs" placeholder="Enter MobileNumber" />} />
                                </div>
                            </div>
                            <div className="grid grid-cols-12 items-center gap-4">
                                <Label className="col-span-4 text-xs font-bold text-neutral-600">Email ID:</Label>
                                <div className="col-span-8">
                                    <Controller name="AMST_MotherEmailId" control={control} render={({ field }) => <InputText {...field} className="rounded-none h-8 text-xs" placeholder="Enter Email ID" />} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 4: Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Residential Address */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-neutral-600 uppercase">RESIDENTIAL ADDRESS :</h4>
                    <Card className="rounded-none shadow-sm">
                        <CardContent className="p-4">
                            <AddressFields control={control} type="Res" countries={countries} states={states} />
                        </CardContent>
                    </Card>
                </div>

                {/* Permanent Address */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-neutral-600 uppercase">PERMANENT ADDRESS :</h4>
                    <Card className="rounded-none shadow-sm">
                        <CardContent className="p-4">
                            <AddressFields control={control} type="Per" countries={countries} states={states} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap gap-4 justify-center py-4">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current shadow-sm ${getStatusInfo(studentInfo.astureQ_ConformFlg).color} bg-white`}>
                    Student Status: {getStatusInfo(studentInfo.astureQ_ConformFlg).label}
                </div>
                {studentInfo.astureQ_Date && (
                    <div className="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                        Last Requested: {new Date(studentInfo.astureQ_Date).toLocaleDateString('en-GB')}
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-center gap-4 py-6">
                <Button type="submit" disabled={isSaving} className="rounded-none bg-[#3c8dbc] hover:bg-[#357ca5] h-10 px-10 text-xs font-bold text-white shadow-md">
                    {isSaving ? <Spinner className="me-2 h-4 w-4" /> : <Save className="me-2 h-4 w-4" />}
                    SAVE REQUEST
                </Button>
                <Button type="button" variant="destructive" className="rounded-none bg-[#dd4b39] hover:bg-[#d73925] h-10 px-10 text-xs font-bold text-white shadow-md" onClick={() => window.location.reload()}>
                    <X className="me-2 h-4 w-4" /> CLOSE
                </Button>
            </div>
        </form>
    );
};
