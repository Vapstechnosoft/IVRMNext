'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { MobileNumberInput } from '@/components/ui/extension/input-mobile-number';
import { 
    ndaStudentProfileUpdateSchema, 
    NdaStudentProfileUpdateFields 
} from '@/schemas/admission/nda-student-profile-update';
import { 
    useNdaStudentProfileDetails, 
    useNdaSaveRequest, 
    useNdaSiblingDetails 
} from '@/hooks/admission/preadmission/useNdaStudentProfileUpdate';
import { AddressFields } from './AddressFields';
import { ImageUploadSection } from './ImageUploadSection';
import { cn } from '@/lib/utils';
import { Save, X, User, Phone, Mail, Droplets } from 'lucide-react';

export const StudentProfileUpdateForm = () => {
    const { data: initialData, isLoading: detailsLoading } = useNdaStudentProfileDetails();
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
        const detailsList = (initialData as any)?.data?.updatestudetailslist;
        if (detailsList && detailsList.length > 0) {
            const student = detailsList[0];
            
            // Populate basic fields
            setValue('ASTUREQ_Id', student.ASTUREQ_Id || 0);
            setValue('AMSTG_Id', student.AMSTG_Id || 0);
            setValue('AMST_ID', student.AMST_ID || 0);
            setValue('Mobilenumber', student.AMST_MobileNo || '');
            setValue('EmailidforCandidate', student.AMST_emailId || '');
            setValue('Bloodgroup', student.AMST_BloodGroup || '');
            setValue('Guardianname', student.AMSTG_GuardianName || '');
            setValue('AMSTG_GuardianPhoneNo', student.AMSTG_GuardianPhoneNo || '');
            setValue('AMSTG_emailid', student.AMSTG_emailid || '');
            setValue('AMST_FatherMobleNo', student.AMST_FatherMobleNo || '');
            setValue('AMST_FatheremailId', student.AMST_FatheremailId || '');
            setValue('AMST_MotherMobileNo', student.AMST_MotherMobileNo || '');
            setValue('AMST_MotherEmailId', student.AMST_MotherEmailId || '');

            // Photos
            setValue('ASTUREQ_StudentPhoto', student.AMST_Photoname || '');
            setValue('ASTUREQ_FatherPhoto', student.ANST_FatherPhoto || '');
            setValue('ASTUREQ_MotherPhoto', student.ANST_MotherPhoto || '');
            setValue('ASTUREQ_GuardianPhoto', student.ASTUREQ_GuardianPhoto || '');

            // Address
            setValue('Resstreet', student.AMST_ConStreet || '');
            setValue('ResArea', student.AMST_ConArea || '');
            setValue('Rescity', student.AMST_ConCity || '');
            setValue('Rescountry', student.AMST_ConCountry || '');
            setValue('Resstate', student.AMST_ConState || '');
            setValue('ResPincode', student.AMST_ConPincode || '');

            setValue('Perstreett', student.AMST_PerStreet || '');
            setValue('PerArea', student.AMST_PerArea || '');
            setValue('Percity', student.AMST_PerCity || '');
            setValue('PerState', student.AMST_PerState || '');
            setValue('PerPincode', student.AMST_PerPincode || '');
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
            cancelButtonText: "Cancel"
        });
        
        if (!confirm.isConfirmed) return;

        try {
            const payload = {
                ...data,
                "STP_PERCOUNTRY": data.Rescountry,
                "STP_CURCOUNTRY": data.Rescountry,
                "STP_CURPIN": data.ResPincode,
                "STP_PERPIN": data.PerPincode,
                "AMST_BloodGroup": data.Bloodgroup,
                "ASTUREQ_GuardianMobileNo": data.AMSTG_GuardianPhoneNo,
                "ASTUREQ_GuardianEmailId": data.AMSTG_emailid,
                "AMSTG_GuardianName": data.Guardianname
            };

            const res = await saveRequest(payload);
            if (res.success) {
                toast.success("Update request sent successfully!");
                // Optionally reload or redirect
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
            <div className="flex items-center justify-center h-64 p-12">
                <Spinner className="h-10 w-10 text-primary" />
                <span className="ms-3 text-lg font-medium text-primary">Loading Student Details...</span>
            </div>
        );
    }

    const studentInfo = initialData?.data?.updatestudetailslist?.[0] || {};
    const countries = initialData?.data?.countryDrpDown || [];
    const states = initialData?.data?.stateDrpDown || [];
    
    // Fee & Attendance Stats from legacy loaddata
    const feeStats = initialData?.data?.studentfeedetails?.[0] || {};
    const attendanceStats = initialData?.data?.yearattdetails || [];
    
    const totalHeld = attendanceStats.reduce((acc: number, curr: any) => acc + (parseInt(curr.CLASS_HELD) || 0), 0);
    const totalPresent = attendanceStats.reduce((acc: number, curr: any) => acc + (curr.TOTAL_PRESENT || 0), 0);
    const attendancePercentage = totalHeld > 0 ? ((totalPresent / totalHeld) * 100).toFixed(2) : '0.00';

    const getStatusInfo = (status: number | null) => {
        if (status === 1) return { label: 'Approved', color: 'text-green-600' };
        if (status === 0) return { label: 'Rejected', color: 'text-red-600' };
        return { label: 'Pending', color: 'text-neutral-500' };
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 rounded-3xl bg-primary/5 border border-primary/10 shadow-sm">
                <div>
                   <h2 className="text-3xl font-bold flex items-center gap-3 text-primary">
                    <User className="h-8 w-8 text-primary/70" />
                    Student Profile Update
                   </h2>
                   <p className="text-muted-foreground ms-11 mt-1 text-sm font-medium">Manage and update personal, family, and address information.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={isSaving} className="rounded-full px-6 shadow-md hover:shadow-lg transition-all duration-300">
                        {isSaving ? <Spinner className="me-2 h-4 w-4" /> : <Save className="me-2 h-4 w-4" />}
                        {studentInfo.ASTUREQ_Id > 0 ? 'UPDATE' : 'SUBMIT'}
                    </Button>
                    <Button type="button" variant="outline" className="rounded-full px-6 transition-all duration-300" onClick={() => reset()}>
                        <X className="me-2 h-4 w-4" /> CLOSE
                    </Button>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in duration-1000">
                <Card className="rounded-3xl border-none bg-indigo-500/10 shadow-none hover:bg-indigo-500/15 transition-colors overflow-hidden relative group">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-indigo-600/60 uppercase tracking-widest mb-1">Fee Balance</p>
                        <h4 className="text-2xl font-black text-indigo-700">₹{feeStats.balanceamount || 0}</h4>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Save className="h-12 w-12 text-indigo-900" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-none bg-emerald-500/10 shadow-none hover:bg-emerald-500/15 transition-colors overflow-hidden relative group">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest mb-1">Paid Amount</p>
                        <h4 className="text-2xl font-black text-emerald-700">₹{feeStats.paidamount || 0}</h4>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                           <Save className="h-12 w-12 text-emerald-900" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-none bg-amber-500/10 shadow-none hover:bg-amber-500/15 transition-colors overflow-hidden relative group">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-amber-600/60 uppercase tracking-widest mb-1">Attendance</p>
                        <h4 className="text-2xl font-black text-amber-700">{attendancePercentage}%</h4>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <User className="h-12 w-12 text-amber-900" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-none bg-rose-500/10 shadow-none hover:bg-rose-500/15 transition-colors overflow-hidden relative group">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-rose-600/60 uppercase tracking-widest mb-1">Pending Requests</p>
                        <h4 className="text-2xl font-black text-rose-700">{studentInfo.ASTUREQ_Id > 0 ? '1' : '0'}</h4>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Mail className="h-12 w-12 text-rose-900" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Core Student Info */}
                <Card className="lg:col-span-2 border-primary/10 shadow-lg shadow-primary/5 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 bg-white/80 backdrop-blur-md">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="text-xl flex items-center gap-2 text-primary">
                           <User className="h-5 w-5 opacity-70" />
                           Student Personal Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="well bg-accent/30 p-4 rounded-2xl flex items-center gap-2 border border-primary/5 italic">
                            <Label className="text-lg font-bold text-primary opacity-80 uppercase tracking-tighter">STUDENT NAME:</Label>
                            <span className="text-xl font-black text-primary drop-shadow-sm">{studentInfo.studentname}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <Label className="flex items-center gap-2 transition-transform duration-300 group-focus-within:translate-x-1">
                                    <Phone className="h-4 w-4 opacity-50" />
                                    Mobile Number <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="Mobilenumber"
                                    control={control}
                                    render={({ field }) => (
                                        <MobileNumberInput {...field} placeholder="Enter MobileNumber" maxLength={10} className="rounded-xl border-primary/20 focus:border-primary transition-all duration-300" />
                                    )}
                                />
                                {errors.Mobilenumber && <p className="text-xs font-semibold text-destructive animate-bounce">{errors.Mobilenumber.message}</p>}
                            </div>

                            <div className="space-y-2 group">
                                <Label className="flex items-center gap-2 transition-transform duration-300 group-focus-within:translate-x-1">
                                    <Mail className="h-4 w-4 opacity-50" />
                                    Email ID <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="EmailidforCandidate"
                                    control={control}
                                    render={({ field }) => (
                                        <InputText {...field} placeholder="Enter Email ID" className="rounded-xl border-primary/20 focus:border-primary transition-all duration-300" />
                                    )}
                                />
                                {errors.EmailidforCandidate && <p className="text-xs font-semibold text-destructive animate-bounce">{errors.EmailidforCandidate.message}</p>}
                            </div>

                            <div className="space-y-2 group">
                                <Label className="flex items-center gap-2 transition-transform duration-300 group-focus-within:translate-x-1">
                                    <Droplets className="h-4 w-4 opacity-50 text-red-500" />
                                    Blood Group
                                </Label>
                                <Controller
                                    name="Bloodgroup"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="rounded-xl border-primary/20 focus:border-primary transition-all duration-300">
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl border-primary/10">
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'A1+ve', 'A1-ve', 'B1+ve', 'B1-ve', 'A2+ve', 'A1B+ve', 'A2B+ve', 'A1B2', 'A1B-ve'].map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column - Photos */}
                <div className="space-y-6">
                   <div className="grid grid-cols-1 gap-6">
                        <Controller
                            name="ASTUREQ_StudentPhoto"
                            control={control}
                            render={({ field }) => (
                                <ImageUploadSection 
                                    label="Student Photo" 
                                    value={field.value || ''} 
                                    onChange={field.onChange}
                                    statusLabel={getStatusInfo(studentInfo.ASTUREQ_ConformFlg).label}
                                    statusColor={getStatusInfo(studentInfo.ASTUREQ_ConformFlg).color}
                                />
                            )}
                        />
                   </div>
                </div>
            </div>

            {/* Parents & Guardian Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Father Info */}
                <Card className="border-primary/10 shadow-md rounded-3xl group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="bg-primary/5 pb-2">
                        <CardTitle className="text-lg font-bold text-primary opacity-80 uppercase transition-colors group-hover:text-primary">FATHER NAME: <b>{studentInfo.fatherName}</b></CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <Controller
                            name="ASTUREQ_FatherPhoto"
                            control={control}
                            render={({ field }) => (
                                <ImageUploadSection 
                                    label="Father Photo" 
                                    value={field.value || ''} 
                                    onChange={field.onChange}
                                    borderColor="border-green-500"
                                    statusLabel={getStatusInfo(studentInfo.ASTUREQ_ConformFlgF).label}
                                    statusColor={getStatusInfo(studentInfo.ASTUREQ_ConformFlgF).color}
                                />
                            )}
                        />
                         <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold opacity-60">Mobile Number *</Label>
                                <Controller name="AMST_FatherMobleNo" control={control} render={({ field }) => <MobileNumberInput {...field} maxLength={10} />} />
                                {errors.AMST_FatherMobleNo && <p className="text-[10px] text-destructive">{errors.AMST_FatherMobleNo.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold opacity-60">Email ID *</Label>
                                <Controller name="AMST_FatheremailId" control={control} render={({ field }) => <InputText {...field} />} />
                                {errors.AMST_FatheremailId && <p className="text-[10px] text-destructive">{errors.AMST_FatheremailId.message}</p>}
                            </div>
                         </div>
                    </CardContent>
                </Card>

                {/* Mother Info */}
                <Card className="border-primary/10 shadow-md rounded-3xl group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="bg-primary/5 pb-2">
                         <CardTitle className="text-lg font-bold text-primary opacity-80 uppercase">MOTHER NAME: <b>{studentInfo.mothername}</b></CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <Controller
                            name="ASTUREQ_MotherPhoto"
                            control={control}
                            render={({ field }) => (
                                <ImageUploadSection 
                                    label="Mother Photo" 
                                    value={field.value || ''} 
                                    onChange={field.onChange}
                                    borderColor="border-green-500"
                                    statusLabel={getStatusInfo(studentInfo.ASTUREQ_ConformFlgM).label}
                                    statusColor={getStatusInfo(studentInfo.ASTUREQ_ConformFlgM).color}
                                />
                            )}
                        />
                         <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold opacity-60">Mobile Number</Label>
                                <Controller name="AMST_MotherMobileNo" control={control} render={({ field }) => <MobileNumberInput {...field} maxLength={10} />} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold opacity-60">Email ID</Label>
                                <Controller name="AMST_MotherEmailId" control={control} render={({ field }) => <InputText {...field} />} />
                            </div>
                         </div>
                    </CardContent>
                </Card>

                {/* Guardian Info */}
                <Card className="border-primary/10 shadow-md rounded-3xl group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="bg-primary/5 pb-2">
                        <CardTitle className="text-lg font-bold text-primary opacity-80 uppercase">GUARDIAN NAME: <b>{studentInfo.Guardianname}</b></CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <Controller
                            name="ASTUREQ_GuardianPhoto"
                            control={control}
                            render={({ field }) => (
                                <ImageUploadSection 
                                    label="Guardian Photo" 
                                    value={field.value || ''} 
                                    onChange={field.onChange}
                                    borderColor="border-primary/40"
                                    statusLabel={getStatusInfo(studentInfo.ASTUREQ_ConformFlgG).label}
                                    statusColor={getStatusInfo(studentInfo.ASTUREQ_ConformFlgG).color}
                                />
                            )}
                        />
                         <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold opacity-60">Guardian Name</Label>
                                <Controller name="Guardianname" control={control} render={({ field }) => <InputText {...field} />} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold opacity-60">Mobile Number</Label>
                                <Controller name="AMSTG_GuardianPhoneNo" control={control} render={({ field }) => <MobileNumberInput {...field} maxLength={10} />} />
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>

            {/* Address Information Section */}
            <Card className="border-primary/10 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500 bg-white/80 backdrop-blur-md">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-xl flex items-center gap-2 text-primary">
                       Address Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AddressFields 
                        control={control} 
                        type="Res" 
                        countries={countries} 
                        states={states}
                        onCountryChange={(id) => {
                            // Logic for state filter if needed
                        }}
                    />
                    <AddressFields 
                        control={control} 
                        type="Per" 
                        countries={countries} 
                        states={states}
                    />
                </CardContent>
            </Card>

            {/* Request Date Status */}
            {studentInfo.ASTUREQ_Id > 0 && studentInfo.ASTUREQ_Date && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 shadow-sm text-amber-800">
                    <span className="font-bold uppercase text-xs tracking-widest">Request Sent On:</span>
                    <span className="font-black text-lg drop-shadow-sm">
                        {new Date(studentInfo.ASTUREQ_Date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                </div>
            )}

            {/* Footer Form Controls */}
            <div className="flex items-center justify-center gap-4 py-8 border-t border-primary/10 mt-12 mb-20 bg-background/50 backdrop-blur-sm sticky bottom-0 z-50 rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
                <Button type="submit" size="lg" disabled={isSaving} className="rounded-full px-12 py-7 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all duration-300">
                    {isSaving ? <Spinner className="me-2 h-6 w-6 animate-spin" /> : <Save className="me-2 h-6 w-6" />}
                    {studentInfo.ASTUREQ_Id > 0 ? 'UPDATE REQUEST' : 'PROCEED SUBMISSION'}
                </Button>
                <Button type="button" variant="outline" size="lg" className="rounded-full px-12 py-7 text-lg font-bold hover:bg-neutral-100 transition-all duration-300" onClick={() => reset()}>
                    <X className="me-2 h-6 w-6" /> CANCEL CHANGES
                </Button>
            </div>
        </form>
    );
};
