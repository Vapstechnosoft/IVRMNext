'use client';

import { useFormContext } from 'react-hook-form';
import { Label, FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Checkbox } from '@/components/ui/checkbox';

export function HealthSection() {
    const {
        register,
        watch,
        setValue,
        formState: { errors }
    } = useFormContext();

    return (
        <div className="space-y-10">
            {/* Health and Medical Details Head */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Medical & Language Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <Label>Student Illness</Label>
                        <InputText {...register('amsT_Studentillness')} placeholder="Enter Student Health" />
                        {errors.amsT_Studentillness && <FormError>{errors.amsT_Studentillness.message as string}</FormError>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Medical Complaints</Label>
                        <InputText {...register('amsT_MedicalComplaints')} placeholder="Enter Medical Complaints" />
                        {errors.amsT_MedicalComplaints && <FormError>{errors.amsT_MedicalComplaints.message as string}</FormError>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Admission Reason</Label>
                        <InputText {...register('amsT_AdmissionReason')} placeholder="Enter Admission Reason" />
                        {errors.amsT_AdmissionReason && <FormError>{errors.amsT_AdmissionReason.message as string}</FormError>}
                    </div>

                    <div className="flex flex-col gap-1.5 text-blue-600">
                        <Label className="text-blue-700">First Language</Label>
                        <InputText {...register('amsT_FirstLanguage')} placeholder="Enter First Language" className="border-blue-200 focus:ring-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Second Language</Label>
                        <InputText {...register('amsT_SecondLanguage')} placeholder="Enter Second Language" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Third Language</Label>
                        <InputText {...register('amsT_Thirdlanguage')} placeholder="Enter Third Language" />
                    </div>
                </div>
            </div>

            {/* Other Information */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Other Background Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <Label>Staying With</Label>
                        <InputText {...register('amsT_Stayingwith')} placeholder="e.g. Parents, Relative" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Domicile</Label>
                        <InputText {...register('amsT_Domicile')} placeholder="Enter Domicile" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Marital Status</Label>
                        <InputText {...register('amsT_MaritalStatus')} placeholder="Enter Marital Status" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>School DISE Code</Label>
                        <InputText {...register('amsT_SchoolDISECode')} placeholder="DISE Code" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Last Playground Attended</Label>
                        <InputText {...register('amsT_LastPlayGrndAttnd')} placeholder="Last Playground" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Boarding</Label>
                        <InputText {...register('amsT_Boarding')} placeholder="Boarding Details" />
                    </div>
                </div>
            </div>

            {/* Miscellaneous Flags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-3 cursor-pointer group">
                    <Checkbox
                        id="amsT_TransferrableJobFlg"
                        checked={Boolean(watch('amsT_TransferrableJobFlg'))}
                        onCheckedChange={(checked) => setValue('amsT_TransferrableJobFlg', checked === true)}
                    />
                    <Label htmlFor="amsT_TransferrableJobFlg" className="text-sm font-medium cursor-pointer group-hover:text-blue-700 transition-colors">
                        Parent has Transferrable Job
                    </Label>
                </div>

                <div className="flex items-center space-x-3 cursor-pointer group">
                    <Checkbox
                        id="amsT_VaccinatedFlg"
                        checked={Boolean(watch('amsT_VaccinatedFlg'))}
                        onCheckedChange={(checked) => setValue('amsT_VaccinatedFlg', checked === true)}
                    />
                    <Label htmlFor="amsT_VaccinatedFlg" className="text-sm font-medium cursor-pointer group-hover:text-blue-700 transition-colors">
                        Student is Vaccinated
                    </Label>
                </div>

                <div className="flex items-center space-x-3 cursor-pointer group">
                    <Checkbox
                        id="amsT_Tcflag"
                        checked={Boolean(watch('amsT_Tcflag'))}
                        onCheckedChange={(checked) => setValue('amsT_Tcflag', checked === true)}
                    />
                    <Label htmlFor="amsT_Tcflag" className="text-sm font-medium cursor-pointer group-hover:text-blue-700 transition-colors">
                        TC Provided
                    </Label>
                </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                    <Label>Other Residential Address</Label>
                    <InputTextarea {...register('amsT_OtherResidential_Addr')} placeholder="Enter Other Residential Address" className="min-h-[80px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label>Other Permanent Address</Label>
                    <InputTextarea {...register('amsT_OtherPermanentAddr')} placeholder="Enter Other Permanent Address" className="min-h-[80px]" />
                </div>
            </div>
        </div>
    );
}

