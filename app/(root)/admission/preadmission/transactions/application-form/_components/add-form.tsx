'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useCasteDropdown,
    useCountryDropdown,
    useGenderDropdown,
    usePreadmissionClassDropdown,
    useReferenceDropdown,
    useReligionDropdown,
    useSourceDropdown,
    useStateDropdown
} from '@/hooks/admission/preadmission/useTransactions';
import { calculateAge, cn } from '@/lib/utils';
import { studentApplicationFormSchema } from '@/schemas/admission/preadmission/transactions';
import { addStudentApplicationForm } from '@/server/admission/preadmission/transactions/application_form';
import type { CalculatedAgeDetails } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof studentApplicationFormSchema.add>;

interface AddStudentApplicationFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddStudentApplicationForm({ onSuccess, className = '' }: AddStudentApplicationFormProps) {
    const {
        watch,
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(studentApplicationFormSchema.add),
        mode: 'onChange',
        defaultValues: {
            pasR_UndertakingFlag: 0
        }
    });

    const [isDobOpen, setIsDobOpen] = useState(false);

    const [calculatedAgeDetails, setCalculatedAgeDetails] = useState<CalculatedAgeDetails>();

    const [selectedSourceItems, setSelectedSourceItems] = useState<{ pamS_Id: string; pamS_SourceName: string }[]>([]);
    const [selectedReferenceItems, setSelectedReferenceItems] = useState<{ pamR_Id: string; pamR_ReferenceName: string }[]>([]);

    const { data: religion, isLoading: religionLoading, error: religionError, refetchAll: refetchReligion } = useReligionDropdown();

    const conConuntryId = watch('pasR_ConCountry');
    const perConuntryId = watch('pasR_PerCountry');

    const { data: caste, isLoading: casteLoading, error: casteError, refetchAll: refetchCaste } = useCasteDropdown(watch('religion_Id'));

    const { data: gender, isLoading: genderLoading, error: genderError, refetchAll: refetchGender } = useGenderDropdown();
    const {
        data: preadmissionClass,
        isLoading: classLoading,
        error: classError,
        refetchAll: refetchClass
    } = usePreadmissionClassDropdown();
    const { data: country, isLoading: countryLoading, error: countryError, refetchAll: refetchCountry } = useCountryDropdown();
    const {
        data: conState,
        isLoading: conStateLoading,
        error: conStateError,
        refetchAll: refetchConState
    } = useStateDropdown(Number(conConuntryId));
    const {
        data: perState,
        isLoading: perStateLoading,
        error: perStateError,
        refetchAll: refetchPerState
    } = useStateDropdown(Number(perConuntryId));
    const { data: source, isLoading: sourceLoading, refetchAll: refetchSource } = useSourceDropdown();
    const { data: reference, isLoading: referenceLoading, refetchAll: refetchReference } = useReferenceDropdown();

    const refetchDropdowns = () => {
        refetchReligion();
        refetchCaste();
        refetchGender();
        refetchClass();
        refetchCountry();
        refetchSource();
        refetchReference();
        refetchConState();
        refetchPerState();
    };

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        if (!calculatedAgeDetails) {
            toast.error('Please select date of birth');
            return;
        }

        if (data.pasR_UndertakingFlag === 0) {
            toast.error('Please accept undertaking');
            return;
        }

        try {
            const { pasR_DOB, source_ids, reference_ids, ...filteredData } = data;
            const payload = {
                ...filteredData,
                pasR_DOB: format(pasR_DOB, 'yyyy-MM-dd'),
                pasR_Age: calculatedAgeDetails.ageInYears,
                selectedSourceDetails: selectedSourceItems.map((item) => ({
                    pamS_Id: item.pamS_Id
                })),
                selectedRefrenceDetails: selectedReferenceItems.map((item) => ({
                    pamR_Id: item.pamR_Id
                })),
                examSubjectDTO: [],
                siblingsDetails: []
            };

            const response = await addStudentApplicationForm(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                refetchDropdowns();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
    };

    const handleSourceSelection = (selectedValues: string[]) => {
        const selectedSources = selectedValues.map((value) => {
            return { pamS_Id: value.toString(), pamS_SourceName: '' };
        });

        setSelectedSourceItems(selectedSources);
    };

    const handleReferenceSelection = (selectedValues: string[]) => {
        const selectedReferences = selectedValues.map((value) => {
            return { pamR_Id: value.toString(), pamR_ReferenceName: '' };
        });

        setSelectedReferenceItems(selectedReferences);
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='First Name'
                            required
                            id='pasR_FirstName'
                            placeholder='Enter First name'
                            {...register('pasR_FirstName')}
                            error={errors.pasR_FirstName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Middle Name'
                            id='pasR_MiddleName'
                            placeholder='Enter Middle name'
                            {...register('pasR_MiddleName')}
                            error={errors.pasR_MiddleName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Last Name'
                            id='pasR_LastName'
                            placeholder='Enter Last name'
                            {...register('pasR_LastName')}
                            error={errors.pasR_LastName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Date Of Birth' htmlFor='pasR_DOB'>
                                Date Of Birth<span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='pasR_DOB'
                                render={({ field }) => (
                                    <Popover open={isDobOpen} onOpenChange={(open) => setIsDobOpen(open)}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn('w-full font-normal', !field.value && 'text-muted-foreground')}>
                                                {field.value ? `${format(field.value, 'PPP')}` : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='flex w-auto items-start p-0' align='start'>
                                            <CalendarYear
                                                mode='single'
                                                captionLayout='dropdown'
                                                selected={field.value}
                                                onSelect={(selectedDate) => {
                                                    field.onChange(selectedDate);
                                                    setCalculatedAgeDetails(calculateAge(watch('pasR_DOB')));
                                                }}
                                                onDayClick={() => setIsDobOpen(false)}
                                                toDate={new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {calculatedAgeDetails && <p className='text-muted-foreground text-sm'>Age: {calculatedAgeDetails.ageString}</p>}
                            {errors.pasR_DOB && <FormError>{errors.pasR_DOB.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='pasR_MobileNo'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Mobile No.'
                                        required
                                        id='pasR_MobileNo'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.pasR_MobileNo && <FormError>{errors.pasR_MobileNo.message}</FormError>}
                        </div>
                        <InputText
                            label='Birth Place'
                            id='pasR_BirthPlace'
                            placeholder='Enter Birth Place'
                            {...register('pasR_BirthPlace')}
                            error={errors.pasR_BirthPlace?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Religion' htmlFor='religion_Id'>
                                Religion <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='religion_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a religion' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {religionLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading religion...
                                                </SelectItem>
                                            ) : religionError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading religion
                                                </SelectItem>
                                            ) : (
                                                religion?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmR_Id} value={item.ivrmmR_Id.toString()}>
                                                        {item.ivrmmR_Name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.religion_Id && <FormError>{errors.religion_Id.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Caste' htmlFor='caste_Id'>
                                Caste <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='caste_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}
                                        disabled={!watch('religion_Id')}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a caste' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {casteLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading caste...
                                                </SelectItem>
                                            ) : casteError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading caste
                                                </SelectItem>
                                            ) : (
                                                caste?.data?.map((item) => (
                                                    <SelectItem key={item.imC_Id} value={item.imC_Id.toString()}>
                                                        {item.imC_CasteName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.caste_Id && <FormError>{errors.caste_Id.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Gender' htmlFor='pasR_Sex'>
                                Gender <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='pasR_Sex'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a gender' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genderLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading gender...
                                                </SelectItem>
                                            ) : genderError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading gender
                                                </SelectItem>
                                            ) : (
                                                gender?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmG_Id} value={item.ivrmmG_GenderName}>
                                                        {item.ivrmmG_GenderName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pasR_Sex && <FormError>{errors.pasR_Sex.message}</FormError>}
                        </div>
                        {/* Date of Birth */}
                        {/* Age will be auto calculated */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Class' htmlFor='asmcL_Id'>
                                Class <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmcL_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading class...
                                                </SelectItem>
                                            ) : classError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading class
                                                </SelectItem>
                                            ) : (
                                                preadmissionClass?.data?.map((item) => (
                                                    <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                        {item.asmcL_ClassName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                        </div>
                        <InputText
                            label='Email'
                            required
                            id='pasR_emailId'
                            placeholder='Enter Email'
                            {...register('pasR_emailId')}
                            error={errors.pasR_emailId?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Nationality' htmlFor='pasR_Nationality'>
                                Nationality <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='pasR_Nationality'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a nationality' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading nationality...
                                                </SelectItem>
                                            ) : countryError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading nationality
                                                </SelectItem>
                                            ) : (
                                                country?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>
                                                        {item.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pasR_Nationality && <FormError>{errors.pasR_Nationality.message}</FormError>}
                        </div>
                        <InputText
                            label='Mother Tongue'
                            id='pasR_MotherTongue'
                            placeholder='Enter Mother Tongue'
                            {...register('pasR_MotherTongue')}
                            error={errors.pasR_MotherTongue?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='pasR_AadharNo'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Aadhaar No.'
                                        optional
                                        id='pasR_AadharNo'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.pasR_AadharNo && <FormError>{errors.pasR_AadharNo.message}</FormError>}
                        </div>
                        <InputText
                            label='Languages Spoken'
                            id='pasR_Languagespeaking'
                            placeholder='Enter Languages Spoken'
                            {...register('pasR_Languagespeaking')}
                            error={errors.pasR_Languagespeaking?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Last Played Ground Attended'
                            id='pasR_LastPlayGrndAttnd'
                            placeholder='Enter Last Played Ground Attended'
                            {...register('pasR_LastPlayGrndAttnd')}
                            error={errors.pasR_LastPlayGrndAttnd?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Extra Curriculum Activity'
                            id='pasR_ExtraActivity'
                            placeholder='Enter Extra Curriculum Activity'
                            {...register('pasR_ExtraActivity')}
                            error={errors.pasR_ExtraActivity?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Source' htmlFor='source_ids'>
                                Source
                            </Label>
                            <Controller
                                name='source_ids'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            source?.data?.map((data) => ({
                                                label: data.pamS_SourceName,
                                                value: data.pamS_Id.toString()
                                            })) || []
                                        }
                                        onValueChange={(selectedValues) => {
                                            field.onChange(selectedValues);
                                            handleSourceSelection(selectedValues);
                                        }}
                                        defaultValue={selectedSourceItems.map((data) => data.pamS_Id)}
                                        value={selectedSourceItems.map((data) => data.pamS_Id)}
                                        placeholder='Select Sources'
                                        variant='inverted'
                                        disabled={sourceLoading}
                                    />
                                )}
                            />

                            {errors.source_ids && <FormError>{errors.source_ids.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Reference' htmlFor='reference_ids'>
                                Reference
                            </Label>
                            <Controller
                                name='reference_ids'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            reference?.data?.map((data) => ({
                                                label: data.pamR_ReferenceName,
                                                value: data.pamR_Id.toString()
                                            })) || []
                                        }
                                        onValueChange={(selectedValues) => {
                                            field.onChange(selectedValues);
                                            handleReferenceSelection(selectedValues);
                                        }}
                                        defaultValue={selectedReferenceItems.map((data) => data.pamR_Id)}
                                        value={selectedReferenceItems.map((data) => data.pamR_Id)}
                                        placeholder='Select References'
                                        variant='inverted'
                                        disabled={referenceLoading}
                                    />
                                )}
                            />

                            {errors.reference_ids && <FormError>{errors.reference_ids.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Religion' htmlFor='pasR_TransportReqdFlag'>
                                Transport Required <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='pasR_TransportReqdFlag'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select is transport required' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem key={1} value={'1'}>
                                                Yes
                                            </SelectItem>
                                            <SelectItem key={2} value={'0'}>
                                                No
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pasR_TransportReqdFlag && <FormError>{errors.pasR_TransportReqdFlag.message}</FormError>}
                        </div>
                        {/* Residential Address */}
                        <InputText
                            label='Street'
                            id='pasR_ConStreet'
                            placeholder='Enter Street'
                            {...register('pasR_ConStreet')}
                            error={errors.pasR_ConStreet?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Area'
                            id='pasR_ConArea'
                            placeholder='Enter Area'
                            {...register('pasR_ConArea')}
                            error={errors.pasR_ConArea?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Country' htmlFor='pasR_ConCountry'>
                                Country
                            </Label>
                            <Controller
                                name='pasR_ConCountry'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a country' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading country...
                                                </SelectItem>
                                            ) : countryError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading country
                                                </SelectItem>
                                            ) : (
                                                country?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>
                                                        {item.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pasR_ConCountry && <FormError>{errors.pasR_ConCountry.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='State' htmlFor='pasR_ConState'>
                                State
                            </Label>
                            <Controller
                                name='pasR_ConState'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a state' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {conStateLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading state...
                                                </SelectItem>
                                            ) : conStateError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading state
                                                </SelectItem>
                                            ) : (
                                                conState?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmS_Id} value={item.ivrmmS_Id.toString()}>
                                                        {item.ivrmmS_Name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pasR_ConState && <FormError>{errors.pasR_ConState.message}</FormError>}
                        </div>
                        <InputText
                            label='City'
                            id='pasR_ConCity'
                            placeholder='Enter City'
                            {...register('pasR_ConCity')}
                            error={errors.pasR_ConCity?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='pasR_ConPincode'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Pin Code/Zip Code'
                                        required
                                        id='pasR_ConPincode'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.pasR_ConPincode && <FormError>{errors.pasR_ConPincode.message}</FormError>}
                        </div>
                        {/* Permanent Address */}
                        <InputText
                            label='Street'
                            id='pasR_PerStreet'
                            placeholder='Enter Street'
                            {...register('pasR_PerStreet')}
                            error={errors.pasR_PerStreet?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Area'
                            id='pasR_PerArea'
                            placeholder='Enter Area'
                            {...register('pasR_PerArea')}
                            error={errors.pasR_PerArea?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Country' htmlFor='pasR_PerCountry'>
                                Country
                            </Label>
                            <Controller
                                name='pasR_PerCountry'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a country' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading country...
                                                </SelectItem>
                                            ) : countryError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading country
                                                </SelectItem>
                                            ) : (
                                                country?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>
                                                        {item.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pasR_PerCountry && <FormError>{errors.pasR_PerCountry.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='State' htmlFor='pasR_PerState'>
                                State
                            </Label>
                            <Controller
                                name='pasR_PerState'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a state' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {perStateLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading state...
                                                </SelectItem>
                                            ) : perStateError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading state
                                                </SelectItem>
                                            ) : (
                                                perState?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmS_Id} value={item.ivrmmS_Id.toString()}>
                                                        {item.ivrmmS_Name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pasR_PerState && <FormError>{errors.pasR_PerState.message}</FormError>}
                        </div>
                        <InputText
                            label='City'
                            id='pasR_PerCity'
                            placeholder='Enter City'
                            {...register('pasR_PerCity')}
                            error={errors.pasR_PerCity?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='pasR_PerPincode'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Pin Code/Zip Code'
                                        required
                                        id='pasR_PerPincode'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.pasR_PerPincode && <FormError>{errors.pasR_PerPincode.message}</FormError>}
                        </div>
                        {/* Father Details */}
                        <InputText
                            label='Father Name'
                            required
                            id='pasR_FatherName'
                            placeholder='Enter Father name'
                            {...register('pasR_FatherName')}
                            error={errors.pasR_FatherName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Surname'
                            id='pasR_FatherSurname'
                            placeholder='Enter Surname'
                            {...register('pasR_FatherSurname')}
                            error={errors.pasR_FatherSurname?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Qualification'
                            id='pasR_FatherEducation'
                            placeholder='Enter Qualification'
                            {...register('pasR_FatherEducation')}
                            error={errors.pasR_FatherEducation?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Pan No'
                            id='pasR_FatherPanno'
                            placeholder='Enter Pan No'
                            {...register('pasR_FatherPanno')}
                            error={errors.pasR_FatherPanno?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Designation'
                            id='pasR_FatherDesignation'
                            placeholder='Enter Designation'
                            {...register('pasR_FatherDesignation')}
                            error={errors.pasR_FatherDesignation?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Country' htmlFor='pasR_FatherNationality'>
                                Country <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='pasR_FatherNationality'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a country' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading country...
                                                </SelectItem>
                                            ) : countryError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading country
                                                </SelectItem>
                                            ) : (
                                                country?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>
                                                        {item.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pasR_FatherNationality && <FormError>{errors.pasR_FatherNationality.message}</FormError>}
                        </div>
                        <InputText
                            label='Office Address'
                            id='pasR_FatherOfficeAddr'
                            placeholder='Enter Office Address'
                            {...register('pasR_FatherOfficeAddr')}
                            error={errors.pasR_FatherOfficeAddr?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='pasR_FatherMobleNo'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Mobile No.'
                                        id='pasR_FatherMobleNo'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.pasR_FatherMobleNo && <FormError>{errors.pasR_FatherMobleNo.message}</FormError>}
                        </div>
                        {/* Mother Details */}
                        <InputText
                            label='Mother Name'
                            required
                            id='pasR_MotherName'
                            placeholder='Enter Mother name'
                            {...register('pasR_MotherName')}
                            error={errors.pasR_MotherName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Surname'
                            id='pasR_MotherSurname'
                            placeholder='Enter Surname'
                            {...register('pasR_MotherSurname')}
                            error={errors.pasR_MotherSurname?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Qualification'
                            id='pasR_MotherEducation'
                            placeholder='Enter Qualification'
                            {...register('pasR_MotherEducation')}
                            error={errors.pasR_MotherEducation?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Pan No'
                            id='pasR_MotherPanno'
                            placeholder='Enter Pan No'
                            {...register('pasR_MotherPanno')}
                            error={errors.pasR_MotherPanno?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Designation'
                            id='pasR_MotherDesignation'
                            placeholder='Enter Designation'
                            {...register('pasR_MotherDesignation')}
                            error={errors.pasR_MotherDesignation?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Country' htmlFor='pasR_MotherNationality'>
                                Country <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='pasR_MotherNationality'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a country' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading country...
                                                </SelectItem>
                                            ) : countryError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading country
                                                </SelectItem>
                                            ) : (
                                                country?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>
                                                        {item.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.pasR_MotherNationality && <FormError>{errors.pasR_MotherNationality.message}</FormError>}
                        </div>
                        <InputText
                            label='Office Address'
                            id='pasR_MotherOfficeAddr'
                            placeholder='Enter Office Address'
                            {...register('pasR_MotherOfficeAddr')}
                            error={errors.pasR_MotherOfficeAddr?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='pasR_MotherMobleNo'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Mobile No.'
                                        id='pasR_MotherMobleNo'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.pasR_MotherMobleNo && <FormError>{errors.pasR_MotherMobleNo.message}</FormError>}
                        </div>
                        {/* Income */}
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='pasR_FatherIncome'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Father Income'
                                        id='pasR_FatherIncome'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.pasR_FatherIncome && <FormError>{errors.pasR_FatherIncome.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='pasR_MotherIncome'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Mother Income'
                                        id='pasR_MotherIncome'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.pasR_MotherIncome && <FormError>{errors.pasR_MotherIncome.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='pasR_AltContactNo'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Alternate Contact No.'
                                        id='pasR_AltContactNo'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.pasR_AltContactNo && <FormError>{errors.pasR_AltContactNo.message}</FormError>}
                        </div>
                        <InputText
                            label='Alternate Contact Email'
                            id='pasR_AltContactEmail'
                            placeholder='Enter Alternate Contact Email'
                            {...register('pasR_AltContactEmail')}
                            error={errors.pasR_AltContactEmail?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    <div className='group flex flex-col gap-1.5'>
                        <Controller
                            name='pasR_UndertakingFlag'
                            control={control}
                            render={({ field }) => (
                                <>
                                    <Label className='mb-2'>
                                        <p>
                                            <b>Undertaking by the Parents/Guardian:</b> I have read all the rules of the School and declare
                                            that they are acceptable to me and my ward I shall pay all the School fees quarterly or
                                            annually. I am willing to pay all other dues as necessary. I have no objection to my child
                                            participating in any extra curricular activities run by the school.
                                        </p>
                                    </Label>
                                    <RadioGroup
                                        id='pasR_UndertakingFlag'
                                        value={field.value !== undefined ? String(field.value) : '0'}
                                        onValueChange={(value) => field.onChange(Number(value.toString()))}
                                        required>
                                        <div className='flex items-center gap-4'>
                                            <RadioGroupItem value='1' id='pasR_UndertakingFlag_yes' />
                                            <Label htmlFor='pasR_UndertakingFlag_yes'>Yes</Label>
                                            <RadioGroupItem value='0' id='pasR_UndertakingFlag_no' />
                                            <Label htmlFor='pasR_UndertakingFlag_false'>No</Label>
                                        </div>
                                    </RadioGroup>
                                </>
                            )}
                        />
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Master Caste
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
