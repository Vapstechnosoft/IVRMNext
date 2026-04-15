'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label, FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InputNumber } from '@/components/ui/extension/input-number';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ParentsSectionProps {
    religion: any[];
    country: any[];
    allState: any[];
    allCaste: any[];
    nationalityLoading?: boolean;
    religionLoading?: boolean;
}

export function ParentsSection({
    religion,
    country,
    allState,
    allCaste,
    nationalityLoading,
    religionLoading
}: ParentsSectionProps) {
    const {
        register,
        control,
        watch,
        setValue,
        trigger,
        setError,
        clearErrors,
        formState: { errors }
    } = useFormContext();

    const fatherAlive = watch('fatherAliveFlag');
    const motherAlive = watch('motherAliveFlag');

    const fatherCountryId = watch('fatherNationality');
    const motherCountryId = watch('motherNationality');

    const fatherRelId = watch('fatherReligionId');
    const motherRelId = watch('motherReligionId');

    // Phone helper states local to section for validation feedback
    const [phoneExpectedInfo, setPhoneExpectedInfo] = useState<Record<string, { expected?: number; name?: string; dial?: string }>>({});

    const getExpectedPhoneLength = (countryData: any): number | undefined => {
        if (!countryData) return undefined;
        const format = countryData?.format;
        if (format && typeof format === 'string') {
            const placeholders = (format.match(/[0-9xX\.\#9]/g) || []).length;
            if (placeholders > 0) return placeholders;
        }
        const dial = String(countryData?.dialCode ?? '').replace(/\D/g, '');
        const fallback: Record<string, number> = {
            '91': 10,
            '1': 10,
            '44': 10,
            '61': 9
        };
        return fallback[dial] ?? undefined;
    };

    const handlePhoneChange = (phone: string, countryData: any, fieldName: string) => {
        const countryCode = countryData?.dialCode || '91';
        let numberPart = phone.replace(/[^\d]/g, '');
        if (numberPart.startsWith(countryCode)) {
            numberPart = numberPart.slice(String(countryCode).length);
        }
        
        const formattedPhone = phone ? `+${countryCode} ${numberPart}` : '';
        setValue(fieldName as any, formattedPhone, { shouldValidate: true, shouldDirty: true });

        const expected = getExpectedPhoneLength(countryData);
        setPhoneExpectedInfo((prev) => ({
            ...prev,
            [fieldName]: {
                expected,
                name: countryData?.name ?? countryData?.country,
                dial: String(countryData?.dialCode ?? '')
            }
        }));

        if (expected !== undefined && numberPart.length > 0) {
            if (numberPart.length !== expected) {
                setError(fieldName as any, {
                    type: 'manual',
                    message: `Number must be exactly ${expected} digits for ${countryData?.name ?? countryData?.country ?? 'selected country'}`
                });
            } else {
                clearErrors(fieldName as any);
            }
        } else {
            clearErrors(fieldName as any);
        }
        trigger(fieldName as any);
    };

    const fatherStates = useMemo(() => {
        if (!fatherCountryId) return [];
        return allState.filter((s: any) => Number(s.ivrmmC_Id) === Number(fatherCountryId));
    }, [allState, fatherCountryId]);

    const motherStates = useMemo(() => {
        if (!motherCountryId) return [];
        return allState.filter((s: any) => Number(s.ivrmmC_Id) === Number(motherCountryId));
    }, [allState, motherCountryId]);

    const fatherCastes = useMemo(() => {
        if (!fatherRelId) return allCaste;
        return allCaste.filter((c: any) => Number(c.ivrmmR_Id) === Number(fatherRelId));
    }, [allCaste, fatherRelId]);

    const motherCastes = useMemo(() => {
        if (!motherRelId) return allCaste;
        return allCaste.filter((c: any) => Number(c.ivrmmR_Id) === Number(motherRelId));
    }, [allCaste, motherRelId]);

    return (
        <div className="space-y-12">
            {/* Father Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Father Details</h2>
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            <Checkbox
                                id="fatherAliveFlag"
                                checked={!!fatherAlive}
                                onCheckedChange={(checked) => setValue('fatherAliveFlag', !!checked)}
                            />
                            <Label htmlFor="fatherAliveFlag" className="text-sm font-medium text-blue-700 cursor-pointer">
                                Father is Alive
                            </Label>
                        </div>
                    </div>
                </div>

                {fatherAlive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Personal Info */}
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex flex-col gap-1.5">
                                <Label>Father Name <span className="ml-1 text-red-500">*</span></Label>
                                <InputText {...register('fatherName')} placeholder="Enter Father Name" />
                                {errors.fatherName && <FormError>{errors.fatherName.message as string}</FormError>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Surname</Label>
                                <InputText {...register('fatherSurname')} placeholder="Enter Surname" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Aadhar No.</Label>
                                <InputText {...register('fatherAadharNo')} placeholder="12 digit Aadhar" maxLength={12} />
                                {errors.fatherAadharNo && <FormError>{errors.fatherAadharNo.message as string}</FormError>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Mobile No.</Label>
                                <Controller
                                    name="pasR_FatherMobleNo"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="relative">
                                            <PhoneInput
                                                country="in"
                                                value={field.value}
                                                onChange={(phone, data) => handlePhoneChange(phone, data, 'pasR_FatherMobleNo')}
                                                containerClass="w-full"
                                                inputClass="w-full h-10 px-12 py-2 rounded-md border border-input bg-background"
                                            />
                                            {phoneExpectedInfo.pasR_FatherMobleNo?.expected && (
                                                <span className="text-[10px] text-muted-foreground mt-1 absolute -bottom-4 right-0">
                                                    Expected: {phoneExpectedInfo.pasR_FatherMobleNo.expected} digits
                                                </span>
                                            )}
                                        </div>
                                    )}
                                />
                                {errors.pasR_FatherMobleNo && <FormError>{errors.pasR_FatherMobleNo.message as string}</FormError>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Email ID</Label>
                                <InputText {...register('fatherEmail')} placeholder="Enter email" type="email" />
                                {errors.fatherEmail && <FormError>{errors.fatherEmail.message as string}</FormError>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Education</Label>
                                <InputText {...register('FatherEducation')} placeholder="Highest qualification" />
                            </div>
                        </div>

                        {/* Occupation & Others */}
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 border border-gray-100 rounded-xl">
                            <div className="flex flex-col gap-1.5">
                                <Label>Occupation</Label>
                                <InputText {...register('fatherOccupation')} placeholder="Enter Occupation" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Designation</Label>
                                <InputText {...register('fatherDesignation')} placeholder="Enter Designation" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Annual Income</Label>
                                <Controller
                                    name="fatherAnnualIncome"
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            value={field.value || 0}
                                            onChange={(val: number) => field.onChange(val)}
                                            placeholder="Enter annual income"
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Religion</Label>
                                <Controller
                                    name="fatherReligionId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={(val) => field.onChange(Number(val))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Religion" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {religion.map((item: any) => (
                                                    <SelectItem key={item.ivrmmR_Id} value={item.ivrmmR_Id.toString()}>
                                                        {item.ivrmmR_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Caste</Label>
                                <Controller
                                    name="fatherCasteId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={(val) => field.onChange(Number(val))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Caste" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fatherCastes.map((item: any) => (
                                                    <SelectItem key={item.imC_Id} value={item.imC_Id.toString()}>
                                                        {item.imC_CasteName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Sub-Caste</Label>
                                <InputText {...register('fatherSubCaste')} placeholder="Enter Sub-Caste" />
                            </div>
                        </div>

                        {/* Address Section - Father Present */}
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-50/30 rounded-xl border border-blue-50">
                            <h3 className="col-span-full text-sm font-semibold text-blue-800 uppercase tracking-wider">Present Address</h3>
                            <div className="flex flex-col gap-1.5 lg:col-span-2">
                                <Label>Address</Label>
                                <InputText {...register('fatherPresentAddress.address')} placeholder="Full address" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Country</Label>
                                <Controller
                                    name="fatherNationality"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={(val) => {
                                                field.onChange(Number(val));
                                                setValue('fatherPresentAddress.state', 0);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {country.map((item: any) => (
                                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>
                                                        {item.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>State</Label>
                                <Controller
                                    name="fatherPresentAddress.state"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            disabled={!fatherCountryId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select State" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fatherStates.map((item: any) => (
                                                    <SelectItem key={item.ivrmmS_Id} value={item.ivrmmS_Id.toString()}>
                                                        {item.ivrmmS_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Address Section - Father Permanent */}
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                            <h3 className="col-span-full text-sm font-semibold text-gray-600 uppercase tracking-wider">Permanent Address</h3>
                            <div className="flex flex-col gap-1.5 lg:col-span-2">
                                <Label>Address</Label>
                                <InputText {...register('fatherPermanentAddress.address')} placeholder="Full address" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>City</Label>
                                <InputText {...register('fatherPermanentAddress.city')} placeholder="City" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Pincode</Label>
                                <InputText {...register('fatherPermanentAddress.pincode')} placeholder="Pincode" maxLength={6} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mother Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Mother Details</h2>
                        <div className="flex items-center space-x-2 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
                            <Checkbox
                                id="motherAliveFlag"
                                checked={!!motherAlive}
                                onCheckedChange={(checked) => setValue('motherAliveFlag', !!checked)}
                            />
                            <Label htmlFor="motherAliveFlag" className="text-sm font-medium text-pink-700 cursor-pointer">
                                Mother is Alive
                            </Label>
                        </div>
                    </div>
                </div>

                {motherAlive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Mother Personal Info */}
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex flex-col gap-1.5">
                                <Label>Mother Name <span className="ml-1 text-red-500">*</span></Label>
                                <InputText {...register('motherName')} placeholder="Enter Mother Name" />
                                {errors.motherName && <FormError>{errors.motherName.message as string}</FormError>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Surname</Label>
                                <InputText {...register('motherSurname')} placeholder="Enter Surname" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Aadhar No.</Label>
                                <InputText {...register('motherAadharNo')} placeholder="12 digit Aadhar" maxLength={12} />
                                {errors.motherAadharNo && <FormError>{errors.motherAadharNo.message as string}</FormError>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Mobile No.</Label>
                                <Controller
                                    name="pasR_MotherMobleNo"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="relative">
                                            <PhoneInput
                                                country="in"
                                                value={field.value}
                                                onChange={(phone, data) => handlePhoneChange(phone, data, 'pasR_MotherMobleNo')}
                                                containerClass="w-full"
                                                inputClass="w-full h-10 px-12 py-2 rounded-md border border-input bg-background"
                                            />
                                            {phoneExpectedInfo.pasR_MotherMobleNo?.expected && (
                                                <span className="text-[10px] text-muted-foreground mt-1 absolute -bottom-4 right-0">
                                                    Expected: {phoneExpectedInfo.pasR_MotherMobleNo.expected} digits
                                                </span>
                                            )}
                                        </div>
                                    )}
                                />
                                {errors.pasR_MotherMobleNo && <FormError>{errors.pasR_MotherMobleNo.message as string}</FormError>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Email ID</Label>
                                <InputText {...register('motherEmail')} placeholder="Enter email" type="email" />
                                {errors.motherEmail && <FormError>{errors.motherEmail.message as string}</FormError>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Education</Label>
                                <InputText {...register('motherQualification')} placeholder="Highest qualification" />
                            </div>
                        </div>

                        {/* Mother Occupation & Others */}
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 border border-gray-100 rounded-xl">
                            <div className="flex flex-col gap-1.5">
                                <Label>Occupation</Label>
                                <InputText {...register('motherOccupation')} placeholder="Enter Occupation" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Designation</Label>
                                <InputText {...register('motherDesignation')} placeholder="Enter Designation" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Annual Income</Label>
                                <Controller
                                    name="motherAnnualIncome"
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            value={field.value || 0}
                                            onChange={(val: number) => field.onChange(val)}
                                            placeholder="Enter annual income"
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Religion</Label>
                                <Controller
                                    name="motherReligionId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={(val) => field.onChange(Number(val))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Religion" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {religion.map((item: any) => (
                                                    <SelectItem key={item.ivrmmR_Id} value={item.ivrmmR_Id.toString()}>
                                                        {item.ivrmmR_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Caste</Label>
                                <Controller
                                    name="motherCasteId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={(val) => field.onChange(Number(val))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Caste" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {motherCastes.map((item: any) => (
                                                    <SelectItem key={item.imC_Id} value={item.imC_Id.toString()}>
                                                        {item.imC_CasteName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Sub-Caste</Label>
                                <InputText {...register('motherSubCaste')} placeholder="Enter Sub-Caste" />
                            </div>
                        </div>

                        {/* Mother Present Address */}
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-pink-50/30 rounded-xl border border-pink-50">
                            <h3 className="col-span-full text-sm font-semibold text-pink-800 uppercase tracking-wider">Present Address</h3>
                            <div className="flex flex-col gap-1.5 lg:col-span-2">
                                <Label>Address</Label>
                                <InputText {...register('motherPresentAddress.address')} placeholder="Full address" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Country</Label>
                                <Controller
                                    name="motherNationality"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={(val) => {
                                                field.onChange(Number(val));
                                                setValue('motherPresentAddress.state', 0);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {country.map((item: any) => (
                                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>
                                                        {item.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>State</Label>
                                <Controller
                                    name="motherPresentAddress.state"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString() || ''}
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            disabled={!motherCountryId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select State" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {motherStates.map((item: any) => (
                                                    <SelectItem key={item.ivrmmS_Id} value={item.ivrmmS_Id.toString()}>
                                                        {item.ivrmmS_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

