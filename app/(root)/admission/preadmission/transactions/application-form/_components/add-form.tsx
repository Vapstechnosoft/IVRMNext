'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { MobileNumberInput } from '@/components/ui/extension/input-mobile-number';
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
    usePreadmissionDocumentsDropdown,
    useReferenceDropdown,
    useReligionDropdown,
    useSourceDropdown,
    useStateDropdown
} from '@/hooks/admission/preadmission/useTransactions';
import { getIconByName } from '@/lib/lucide-icon-registry';
import { calculateAge, cn } from '@/lib/utils';
import { studentApplicationFormSchema } from '@/schemas/admission/preadmission/transactions';
import { addStudentApplicationForm } from '@/server/admission/preadmission/transactions/application_form';
import type { CalculatedAgeDetails } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar, Check, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof studentApplicationFormSchema.add>;

interface AddStudentApplicationFormProps {
    onSuccess?: () => void;
    className?: string;
}

const steps = [
    {
        id: 1,
        name: 'Student Information',
        description: 'Basic details',
        icon: 'User'
    },
    {
        id: 2,
        name: 'Address Information',
        description: 'Residential & Permanent',
        icon: 'MapPinHouse'
    },
    {
        id: 3,
        name: 'Parents Information',
        description: 'Father & Mother details',
        icon: 'Users'
    },
    {
        id: 4,
        name: 'Other Information',
        description: 'Final details',
        icon: 'ReceiptText'
    }
];

export default function AddStudentApplicationForm({ onSuccess, className = '' }: AddStudentApplicationFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const {
        watch,
        control,
        register,
        handleSubmit,
        reset,
        trigger,
        setValue,
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
    const [ageEligibilityError, setAgeEligibilityError] = useState<string | null>(null);
    const [selectedSourceItems, setSelectedSourceItems] = useState<{ pamS_Id: string; pamS_SourceName: string }[]>([]);
    const [selectedReferenceItems, setSelectedReferenceItems] = useState<{ pamR_Id: string; pamR_ReferenceName: string }[]>([]);
    const [sameAsResidential, setSameAsResidential] = useState(false);
    const [siblings, setSiblings] = useState<
        Array<{
            pasrS_Id: number;
            pasR_Id: number;
            pasrS_SiblingsName: string;
            pasrS_SiblingsClass: string;
            pasrS_SiblingsAdmissionNo: string;
            pasrS_SiblingsSection: string;
        }>
    >([]);

    const [previousSchool, setPreviousSchool] = useState({
        pasrpS_Id: 0,
        pasR_Id: 0,
        pasrpS_PrvSchoolName: '',
        pasrpS_PreviousClass: '',
        pasrpS_Board: '',
        pasrpS_LeftYear: '',
        pasrpS_LeftReason: '',
        pasrpS_Address: ''
    });

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
    const {
        data: preadmissionDocuments,
        isLoading: preadmissionDocumentsLoading,
        refetchAll: refetchPreadmissionDocuments
    } = usePreadmissionDocumentsDropdown();

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
        refetchPreadmissionDocuments();
    };

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];

        if (currentStep === 1) {
            fieldsToValidate = [
                'pasR_FirstName',
                'pasR_MiddleName',
                'pasR_LastName',
                'pasR_DOB',
                'pasR_MobileNo',
                'pasR_BirthPlace',
                'religion_Id',
                'caste_Id',
                'pasR_Sex',
                'asmcL_Id',
                'pasR_emailId',
                'pasR_Nationality',
                'pasR_MotherTongue',
                'pasR_TransportReqdFlag'
            ];
        } else if (currentStep === 2) {
            fieldsToValidate = [
                'pasR_ConStreet',
                'pasR_ConArea',
                'pasR_ConCountry',
                'pasR_ConState',
                'pasR_ConCity',
                'pasR_PerStreet',
                'pasR_PerArea',
                'pasR_PerCountry',
                'pasR_PerState',
                'pasR_PerCity'
            ];
        } else if (currentStep === 3) {
            fieldsToValidate = ['pasR_FatherName', 'pasR_FatherNationality', 'pasR_MotherName', 'pasR_MotherNationality'];
        }

        const isValid = await trigger(fieldsToValidate as any);

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }

        if (currentStep === 1) {
            const isAgeEligible = validateAgeEligibility(calculatedAgeDetails, watch('asmcL_Id'));
            if (!isAgeEligible) {
                toast.error("Please select a class that matches the student's age eligibility");
                return;
            }
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const _goToStep = (step: number) => {
        setCurrentStep(step);
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
            const {
                pasR_DOB,
                source_ids,
                reference_ids,
                pasR_PerState,
                pasR_ConCountry,
                pasR_PerCountry,
                pasR_ConPincode,
                pasR_PerPincode,
                ...filteredData
            } = data;
            const payload = {
                ...filteredData,
                pasR_DOB: format(pasR_DOB, 'yyyy-MM-dd'),
                pasR_Age: calculatedAgeDetails.ageInYears,
                PASR_PerState: pasR_PerState?.toString() ?? '',
                PASR_ConCountry: pasR_ConCountry?.toString() ?? '',
                PASR_PerCountry: pasR_PerCountry?.toString() ?? '',
                PASR_ConPincode:
                    pasR_ConPincode === undefined || pasR_ConPincode === null || pasR_ConPincode === '' ? 0 : Number(pasR_ConPincode),
                PASR_PerPincode:
                    pasR_PerPincode === undefined || pasR_PerPincode === null || pasR_PerPincode === '' ? 0 : Number(pasR_PerPincode),
                selectedSourceDetails: selectedSourceItems.map((item) => ({
                    pamS_Id: item.pamS_Id
                })),
                selectedRefrenceDetails: selectedReferenceItems.map((item) => ({
                    pamR_Id: item.pamR_Id
                })),
                siblingsDetails: siblings.map((sibling) => ({
                    ...sibling,
                    verrejstatus: '',
                    pasrS_SchoolName: '',
                    pasrS_Age: 0,
                    pasrS_Gender: '',
                    pasrS_Institution: '',
                    pasrS_DOB: ''
                })),
                previousSchoolList: previousSchool.pasrpS_PrvSchoolName
                    ? [
                          {
                              ...previousSchool,
                              pasrpS_TcNo: '',
                              pasrpS_PreviousPer: '',
                              pasrpS_PreviousGrade: '',
                              pasrpS_PreviousMarks: '',
                              pasrpS_ConcOrScholarshipFlg: ''
                          }
                      ]
                    : [],
                examSubjectDTO: [],
                elesubsubject: [],
                selectedDocuments: [],
                PASR_RegistrationNo: '',
                pasP_Id: 0
            };

            const response = await addStudentApplicationForm(payload);

            if (response.success) {
                reset();
                refetchDropdowns();
                handleReset();
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
        setCurrentStep(1);
        setCalculatedAgeDetails(undefined);
        setSelectedSourceItems([]);
        setSelectedReferenceItems([]);
        setSameAsResidential(false);
        setSiblings([]);
        setPreviousSchool({
            pasrpS_Id: 0,
            pasR_Id: 0,
            pasrpS_PrvSchoolName: '',
            pasrpS_PreviousClass: '',
            pasrpS_Board: '',
            pasrpS_LeftYear: '',
            pasrpS_LeftReason: '',
            pasrpS_Address: ''
        });
        setAgeEligibilityError(null);
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

    const handleSameAsResidential = (checked: boolean) => {
        setSameAsResidential(checked);
        if (checked) {
            const conStreet = watch('pasR_ConStreet');
            const conArea = watch('pasR_ConArea');
            const conCountry = watch('pasR_ConCountry');
            const conState = watch('pasR_ConState');
            const conCity = watch('pasR_ConCity');
            const conPincode = watch('pasR_ConPincode');

            setValue('pasR_PerStreet', conStreet);
            setValue('pasR_PerArea', conArea);
            setValue('pasR_PerCountry', conCountry);
            setValue('pasR_PerState', conState);
            setValue('pasR_PerCity', conCity);
            setValue('pasR_PerPincode', conPincode);
        }
    };

    // Add these functions after handleSameAsResidential
    const addSibling = () => {
        setSiblings([
            ...siblings,
            {
                pasrS_Id: 0,
                pasR_Id: 0,
                pasrS_SiblingsName: '',
                pasrS_SiblingsClass: '',
                pasrS_SiblingsAdmissionNo: '',
                pasrS_SiblingsSection: ''
            }
        ]);
    };

    const removeSibling = (index: number) => {
        setSiblings(siblings.filter((_, i) => i !== index));
    };

    const updateSibling = (index: number, field: string, value: string) => {
        const updatedSiblings = siblings.map((sibling, i) => {
            if (i === index) {
                return { ...sibling, [field]: value };
            }
            return sibling;
        });
        setSiblings(updatedSiblings);
    };

    const updatePreviousSchool = (field: string, value: string) => {
        setPreviousSchool({ ...previousSchool, [field]: value });
    };

    const validateAgeEligibility = (ageDetails: CalculatedAgeDetails | undefined, classId: number | undefined) => {
        if (!ageDetails || !classId || !preadmissionClass?.data) {
            setAgeEligibilityError(null);
            return true;
        }

        const selectedClass = preadmissionClass.data.find((cls) => cls.asmcL_Id === classId);
        if (!selectedClass) {
            setAgeEligibilityError(null);
            return true;
        }

        // Convert age to total days for accurate comparison
        const studentTotalDays = ageDetails.years * 365 + ageDetails.months * 30 + ageDetails.days;
        const minAgeDays = selectedClass.asmcL_MinAgeYear * 365 + selectedClass.asmcL_MinAgeMonth * 30 + selectedClass.asmcL_MinAgeDays;
        const maxAgeDays = selectedClass.asmcL_MaxAgeYear * 365 + selectedClass.asmcL_MaxAgeMonth * 30 + selectedClass.asmcL_MaxAgeDays;

        if (studentTotalDays < minAgeDays || studentTotalDays > maxAgeDays) {
            const minAgeString = `${selectedClass.asmcL_MinAgeYear} years, ${selectedClass.asmcL_MinAgeMonth} months, ${selectedClass.asmcL_MinAgeDays} days`;
            const maxAgeString = `${selectedClass.asmcL_MaxAgeYear} years, ${selectedClass.asmcL_MaxAgeMonth} months, ${selectedClass.asmcL_MaxAgeDays} days`;

            setAgeEligibilityError(
                `Student age (${ageDetails.ageString}) does not meet eligibility for ${selectedClass.asmcL_ClassName}. Required age range: ${minAgeString} to ${maxAgeString}`
            );
            return false;
        }

        setAgeEligibilityError(null);
        return true;
    };

    return (
        <>
            <div className={cn('mx-auto w-full max-w-7xl px-4 py-2', className)}>
                {/* Main Layout: Vertical Stepper + Form */}
                <div className='flex flex-col gap-6 lg:flex-row'>
                    {/* Stepper - Vertical on desktop, horizontal on mobile */}
                    <div className='lg:w-50 lg:flex-shrink-0'>
                        {/* Mobile: Horizontal Stepper */}
                        <div className='block overflow-x-auto lg:hidden'>
                            <div className='flex min-w-max items-center justify-between px-4'>
                                {steps.map((step, index) => (
                                    <div key={step.id} className='flex flex-1 items-center'>
                                        <div className='flex flex-col items-center'>
                                            <button
                                                type='button'
                                                // onClick={() => goToStep(step.id)}
                                                disabled={isSubmitting}
                                                className={cn(
                                                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
                                                    currentStep === step.id
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-blue-200 shadow-lg'
                                                        : currentStep > step.id
                                                          ? 'border-green-500 bg-green-500 text-white'
                                                          : 'border-gray-300 bg-white text-gray-400'
                                                )}>
                                                {currentStep > step.id ? (
                                                    <Check className='h-5 w-5' />
                                                ) : (
                                                    <span className='text-sm'>{step.id}</span>
                                                )}
                                            </button>
                                            <p
                                                className={cn(
                                                    'mt-1 text-nowrap text-center font-medium text-xs transition-colors',
                                                    currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                                                )}>
                                                {step.name}
                                            </p>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div
                                                className={cn(
                                                    'mx-2 h-0.5 flex-1 transition-all duration-300',
                                                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                                                )}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Desktop: Vertical Stepper */}
                        <div className='hidden lg:block'>
                            <div className='sticky top-4 space-y-2'>
                                {steps.map((step, index) => {
                                    const IconComponent = getIconByName(step.icon);
                                    return (
                                        <div key={step.id} className='flex items-start'>
                                            <div className='flex flex-col items-center'>
                                                <button
                                                    type='button'
                                                    // onClick={() => goToStep(step.id)}
                                                    disabled={isSubmitting}
                                                    className={cn(
                                                        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
                                                        currentStep === step.id
                                                            ? 'border-secondary bg-secondary text-white shadow-blue-200 shadow-lg'
                                                            : currentStep > step.id
                                                              ? 'border-green-500 bg-green-500 text-white'
                                                              : 'border-gray-300 bg-white text-gray-500'
                                                    )}>
                                                    {currentStep > step.id ? (
                                                        <Check className='h-6 w-6' />
                                                    ) : (
                                                        <span className='text-lg'>
                                                            {IconComponent && <IconComponent className='h-5 w-5' />}
                                                        </span>
                                                    )}
                                                </button>
                                                {index < steps.length - 1 && (
                                                    <div
                                                        className={cn(
                                                            'my-2 h-16 w-0.5 transition-all duration-300',
                                                            currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                                                        )}
                                                    />
                                                )}
                                            </div>
                                            <div className='ml-4 flex-1'>
                                                <p
                                                    className={cn(
                                                        'font-medium text-sm transition-colors',
                                                        currentStep === step.id ? 'text-primary' : 'text-gray-500'
                                                    )}>
                                                    {step.name}
                                                </p>
                                                <p className='text-gray-400 text-xs'>{step.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className='min-w-0 flex-1 space-y-6'>
                        <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
                            <div className='p-6 md:p-8'>
                                {/* Step 1: Student Information */}
                                {currentStep === 1 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Student Information</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>
                                                Please provide the student&apos;s basic information
                                            </p>
                                        </div>

                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                            <InputText
                                                label='First Name'
                                                required
                                                id='pasR_FirstName'
                                                placeholder='Enter first name'
                                                {...register('pasR_FirstName')}
                                                error={errors.pasR_FirstName?.message}
                                            />
                                            <InputText
                                                label='Middle Name'
                                                required
                                                id='pasR_MiddleName'
                                                placeholder='Enter middle name'
                                                {...register('pasR_MiddleName')}
                                                error={errors.pasR_MiddleName?.message}
                                            />
                                            <InputText
                                                label='Last Name'
                                                required
                                                id='pasR_LastName'
                                                placeholder='Enter last name'
                                                {...register('pasR_LastName')}
                                                error={errors.pasR_LastName?.message}
                                            />
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_DOB'>
                                                    Date Of Birth
                                                    <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    control={control}
                                                    name='pasR_DOB'
                                                    render={({ field }) => (
                                                        <Popover open={isDobOpen} onOpenChange={(open) => setIsDobOpen(open)}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant='outline'
                                                                    className={cn(
                                                                        'w-full font-normal',
                                                                        !field.value && 'text-muted-foreground'
                                                                    )}>
                                                                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                    <Calendar className='ml-auto h-4 w-4 opacity-50' />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className='flex w-auto items-start p-0' align='start'>
                                                                <CalendarYear
                                                                    mode='single'
                                                                    captionLayout='dropdown'
                                                                    selected={field.value}
                                                                    onSelect={(selectedDate) => {
                                                                        field.onChange(selectedDate);
                                                                        const ageDetails = calculateAge(selectedDate as Date);
                                                                        setCalculatedAgeDetails(ageDetails);
                                                                        validateAgeEligibility(ageDetails, watch('asmcL_Id'));
                                                                    }}
                                                                    onDayClick={() => setIsDobOpen(false)}
                                                                    toDate={new Date()}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}
                                                />
                                                {calculatedAgeDetails && (
                                                    <p className='text-muted-foreground text-sm'>Age: {calculatedAgeDetails.ageString}</p>
                                                )}
                                                {errors.pasR_DOB && <FormError>{errors.pasR_DOB.message}</FormError>}
                                            </div>
                                            <div className='flex flex-col gap-1.5'>
                                                <Controller
                                                    name='pasR_MobileNo'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <MobileNumberInput
                                                            label='Mobile No.'
                                                            id='pasR_MobileNo'
                                                            required
                                                            value={field.value}
                                                            onChange={(value) => field.onChange(value)}
                                                            type='number'
                                                            showSpinner={false}
                                                        />
                                                    )}
                                                />
                                                {errors.pasR_MobileNo && <FormError>{errors.pasR_MobileNo.message}</FormError>}
                                            </div>
                                            <InputText
                                                label='Birth Place'
                                                id='pasR_BirthPlace'
                                                placeholder='Enter birth place'
                                                {...register('pasR_BirthPlace')}
                                                error={errors.pasR_BirthPlace?.message}
                                            />
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='religion_Id'>
                                                    Religion <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='religion_Id'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString() || undefined}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select religion' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {religionLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : religionError ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading
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
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='caste_Id'>
                                                    Caste <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='caste_Id'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString() || undefined}
                                                            disabled={!watch('religion_Id')}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select caste' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {casteLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : casteError ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading
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
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_Sex'>
                                                    Gender <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='pasR_Sex'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => field.onChange(value)}
                                                            value={field.value?.toString() || undefined}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select gender' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {genderLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : genderError ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading
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
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='asmcL_Id'>
                                                    Class <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='asmcL_Id'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(Number(value));
                                                                validateAgeEligibility(calculatedAgeDetails, Number(value));
                                                            }}
                                                            value={field.value?.toString() || undefined}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select class' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {classLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : classError ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading
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
                                                {ageEligibilityError && (
                                                    <div className='mt-2 rounded-md border border-red-200 bg-red-50 p-3'>
                                                        <p className='flex items-start gap-2 font-medium text-red-700 text-sm'>
                                                            <span className='mt-0.5 text-red-500'>⚠</span>
                                                            <span>{ageEligibilityError}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <InputText
                                                label='Email'
                                                required
                                                id='pasR_emailId'
                                                placeholder='Enter email'
                                                {...register('pasR_emailId')}
                                                error={errors.pasR_emailId?.message}
                                            />
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_Nationality'>
                                                    Nationality <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='pasR_Nationality'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => field.onChange(value)}
                                                            value={field.value?.toString() || undefined}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select nationality' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {countryLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : countryError ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading
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
                                                placeholder='Enter mother tongue'
                                                {...register('pasR_MotherTongue')}
                                                error={errors.pasR_MotherTongue?.message}
                                            />
                                            <div className='flex flex-col gap-1.5'>
                                                <Controller
                                                    name='pasR_AadharNo'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <MobileNumberInput
                                                            label='Aadhaar No.'
                                                            id='pasR_AadharNo'
                                                            value={field.value}
                                                            onChange={(value) => field.onChange(value)}
                                                            type='number'
                                                            showSpinner={false}
                                                        />
                                                    )}
                                                />
                                                {errors.pasR_AadharNo && <FormError>{errors.pasR_AadharNo.message}</FormError>}
                                            </div>
                                            <InputText
                                                label='Languages Spoken'
                                                id='pasR_Languagespeaking'
                                                placeholder='Enter languages'
                                                {...register('pasR_Languagespeaking')}
                                                error={errors.pasR_Languagespeaking?.message}
                                            />
                                            <InputText
                                                label='Last Played Ground Attended'
                                                id='pasR_LastPlayGrndAttnd'
                                                placeholder='Enter details'
                                                {...register('pasR_LastPlayGrndAttnd')}
                                                error={errors.pasR_LastPlayGrndAttnd?.message}
                                            />
                                            <InputText
                                                label='Extra Curriculum Activity'
                                                id='pasR_ExtraActivity'
                                                placeholder='Enter activities'
                                                {...register('pasR_ExtraActivity')}
                                                error={errors.pasR_ExtraActivity?.message}
                                            />
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='source_ids'>Source</Label>
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
                                                            placeholder='Select sources'
                                                            variant='inverted'
                                                            disabled={sourceLoading}
                                                        />
                                                    )}
                                                />
                                                {errors.source_ids && <FormError>{errors.source_ids.message}</FormError>}
                                            </div>
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='reference_ids'>Reference</Label>
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
                                                            placeholder='Select references'
                                                            variant='inverted'
                                                            disabled={referenceLoading}
                                                        />
                                                    )}
                                                />
                                                {errors.reference_ids && <FormError>{errors.reference_ids.message}</FormError>}
                                            </div>
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_TransportReqdFlag'>
                                                    Transport Required <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='pasR_TransportReqdFlag'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString() || undefined}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select option' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='1'>Yes</SelectItem>
                                                                <SelectItem value='0'>No</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.pasR_TransportReqdFlag && (
                                                    <FormError>{errors.pasR_TransportReqdFlag.message}</FormError>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Address Information */}
                                {currentStep === 2 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Address Information</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>
                                                Please provide residential and permanent address details
                                            </p>
                                        </div>

                                        <div className='space-y-8'>
                                            <div className='space-y-4'>
                                                <h3 className='font-semibold text-gray-800 text-lg'>Residential Address</h3>
                                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                    <InputText
                                                        label='Street'
                                                        id='pasR_ConStreet'
                                                        placeholder='Enter street'
                                                        {...register('pasR_ConStreet')}
                                                        error={errors.pasR_ConStreet?.message}
                                                    />
                                                    <InputText
                                                        label='Area'
                                                        id='pasR_ConArea'
                                                        placeholder='Enter area'
                                                        {...register('pasR_ConArea')}
                                                        error={errors.pasR_ConArea?.message}
                                                    />
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label htmlFor='pasR_ConCountry'>Country</Label>
                                                        <Controller
                                                            name='pasR_ConCountry'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    onValueChange={(value) => field.onChange(value)}
                                                                    value={field.value?.toString() || undefined}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='Select country' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {countryLoading ? (
                                                                            <SelectItem value='loading' disabled>
                                                                                Loading...
                                                                            </SelectItem>
                                                                        ) : countryError ? (
                                                                            <SelectItem value='error' disabled>
                                                                                Error loading
                                                                            </SelectItem>
                                                                        ) : (
                                                                            country?.data?.map((item) => (
                                                                                <SelectItem
                                                                                    key={item.ivrmmC_Id}
                                                                                    value={item.ivrmmC_Id.toString()}>
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
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label htmlFor='pasR_ConState'>State</Label>
                                                        <Controller
                                                            name='pasR_ConState'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value?.toString() || undefined}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='Select state' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {conStateLoading ? (
                                                                            <SelectItem value='loading' disabled>
                                                                                Loading...
                                                                            </SelectItem>
                                                                        ) : conStateError ? (
                                                                            <SelectItem value='error' disabled>
                                                                                Error loading
                                                                            </SelectItem>
                                                                        ) : (
                                                                            conState?.data?.map((item) => (
                                                                                <SelectItem
                                                                                    key={item.ivrmmS_Id}
                                                                                    value={item.ivrmmS_Id.toString()}>
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
                                                        placeholder='Enter city'
                                                        {...register('pasR_ConCity')}
                                                        error={errors.pasR_ConCity?.message}
                                                    />
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Controller
                                                            name='pasR_ConPincode'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <MobileNumberInput
                                                                    label='Pin Code/Zip Code'
                                                                    id='pasR_ConPincode'
                                                                    value={field.value}
                                                                    onChange={(value) => field.onChange(value)}
                                                                    type='number'
                                                                    showSpinner={false}
                                                                />
                                                            )}
                                                        />
                                                        {errors.pasR_ConPincode && <FormError>{errors.pasR_ConPincode.message}</FormError>}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Same as Residential Address Checkbox */}
                                            <div className='flex items-center space-x-2 rounded-lg border border-blue-200 bg-blue-50 p-4'>
                                                <Checkbox
                                                    id='sameAsResidential'
                                                    checked={sameAsResidential}
                                                    onCheckedChange={handleSameAsResidential}
                                                />
                                                <Label
                                                    htmlFor='sameAsResidential'
                                                    className='cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                                    Same as Residential Address
                                                </Label>
                                            </div>
                                            <div className='space-y-4'>
                                                <h3 className='font-semibold text-gray-800 text-lg'>Permanent Address</h3>
                                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                    <InputText
                                                        label='Street'
                                                        id='pasR_PerStreet'
                                                        placeholder='Enter street'
                                                        {...register('pasR_PerStreet')}
                                                        error={errors.pasR_PerStreet?.message}
                                                        disabled={sameAsResidential}
                                                    />
                                                    <InputText
                                                        label='Area'
                                                        id='pasR_PerArea'
                                                        placeholder='Enter area'
                                                        {...register('pasR_PerArea')}
                                                        error={errors.pasR_PerArea?.message}
                                                        disabled={sameAsResidential}
                                                    />
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label htmlFor='pasR_PerCountry'>Country</Label>
                                                        <Controller
                                                            name='pasR_PerCountry'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    onValueChange={(value) => field.onChange(value)}
                                                                    value={field.value?.toString() || undefined}
                                                                    disabled={sameAsResidential}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='Select country' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {countryLoading ? (
                                                                            <SelectItem value='loading' disabled>
                                                                                Loading...
                                                                            </SelectItem>
                                                                        ) : countryError ? (
                                                                            <SelectItem value='error' disabled>
                                                                                Error loading
                                                                            </SelectItem>
                                                                        ) : (
                                                                            country?.data?.map((item) => (
                                                                                <SelectItem
                                                                                    key={item.ivrmmC_Id}
                                                                                    value={item.ivrmmC_Id.toString()}>
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
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label htmlFor='pasR_PerState'>State</Label>
                                                        <Controller
                                                            name='pasR_PerState'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value?.toString() || undefined}
                                                                    disabled={sameAsResidential}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='Select state' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {perStateLoading ? (
                                                                            <SelectItem value='loading' disabled>
                                                                                Loading...
                                                                            </SelectItem>
                                                                        ) : perStateError ? (
                                                                            <SelectItem value='error' disabled>
                                                                                Error loading
                                                                            </SelectItem>
                                                                        ) : (
                                                                            perState?.data?.map((item) => (
                                                                                <SelectItem
                                                                                    key={item.ivrmmS_Id}
                                                                                    value={item.ivrmmS_Id.toString()}>
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
                                                        placeholder='Enter city'
                                                        {...register('pasR_PerCity')}
                                                        error={errors.pasR_PerCity?.message}
                                                        disabled={sameAsResidential}
                                                    />
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Controller
                                                            name='pasR_PerPincode'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <MobileNumberInput
                                                                    label='Pin Code/Zip Code'
                                                                    id='pasR_PerPincode'
                                                                    value={field.value}
                                                                    onChange={(value) => field.onChange(value)}
                                                                    type='number'
                                                                    showSpinner={false}
                                                                />
                                                            )}
                                                        />
                                                        {errors.pasR_PerPincode && <FormError>{errors.pasR_PerPincode.message}</FormError>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Parents Information */}
                                {currentStep === 3 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Parents Information</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>Please provide father and mother details</p>
                                        </div>

                                        <div className='space-y-8'>
                                            <div className='space-y-4'>
                                                <h3 className='font-semibold text-gray-800 text-lg'>Father Details</h3>
                                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                    <InputText
                                                        label='Father Name'
                                                        required
                                                        id='pasR_FatherName'
                                                        placeholder='Enter father name'
                                                        {...register('pasR_FatherName')}
                                                        error={errors.pasR_FatherName?.message}
                                                    />
                                                    <InputText
                                                        label='Surname'
                                                        id='pasR_FatherSurname'
                                                        placeholder='Enter surname'
                                                        {...register('pasR_FatherSurname')}
                                                        error={errors.pasR_FatherSurname?.message}
                                                    />
                                                    <InputText
                                                        label='Qualification'
                                                        id='pasR_FatherEducation'
                                                        placeholder='Enter qualification'
                                                        {...register('pasR_FatherEducation')}
                                                        error={errors.pasR_FatherEducation?.message}
                                                    />
                                                    <InputText
                                                        label='Pan No'
                                                        id='pasR_FatherPanno'
                                                        placeholder='Enter PAN'
                                                        {...register('pasR_FatherPanno')}
                                                        error={errors.pasR_FatherPanno?.message}
                                                    />
                                                    <InputText
                                                        label='Designation'
                                                        id='pasR_FatherDesignation'
                                                        placeholder='Enter designation'
                                                        {...register('pasR_FatherDesignation')}
                                                        error={errors.pasR_FatherDesignation?.message}
                                                    />
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label htmlFor='pasR_FatherNationality'>
                                                            Nationality <span className='ml-1 text-red-500'>*</span>
                                                        </Label>
                                                        <Controller
                                                            name='pasR_FatherNationality'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value?.toString() || undefined}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='Select nationality' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {countryLoading ? (
                                                                            <SelectItem value='loading' disabled>
                                                                                Loading...
                                                                            </SelectItem>
                                                                        ) : countryError ? (
                                                                            <SelectItem value='error' disabled>
                                                                                Error loading
                                                                            </SelectItem>
                                                                        ) : (
                                                                            country?.data?.map((item) => (
                                                                                <SelectItem
                                                                                    key={item.ivrmmC_Id}
                                                                                    value={item.ivrmmC_Id.toString()}>
                                                                                    {item.ivrmmC_CountryName}
                                                                                </SelectItem>
                                                                            ))
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.pasR_FatherNationality && (
                                                            <FormError>{errors.pasR_FatherNationality.message}</FormError>
                                                        )}
                                                    </div>
                                                    <InputText
                                                        label='Office Address'
                                                        id='pasR_FatherOfficeAddr'
                                                        placeholder='Enter office address'
                                                        {...register('pasR_FatherOfficeAddr')}
                                                        error={errors.pasR_FatherOfficeAddr?.message}
                                                    />
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Controller
                                                            name='pasR_FatherMobleNo'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <MobileNumberInput
                                                                    label='Mobile No.'
                                                                    id='pasR_FatherMobleNo'
                                                                    value={field.value}
                                                                    onChange={(value) => field.onChange(value)}
                                                                    type='number'
                                                                    showSpinner={false}
                                                                />
                                                            )}
                                                        />
                                                        {errors.pasR_FatherMobleNo && (
                                                            <FormError>{errors.pasR_FatherMobleNo.message}</FormError>
                                                        )}
                                                    </div>
                                                    <div className='flex flex-col gap-1.5'>
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
                                                        {errors.pasR_FatherIncome && (
                                                            <FormError>{errors.pasR_FatherIncome.message}</FormError>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='space-y-4'>
                                                <h3 className='font-semibold text-gray-800 text-lg'>Mother Details</h3>
                                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                    <InputText
                                                        label='Mother Name'
                                                        required
                                                        id='pasR_MotherName'
                                                        placeholder='Enter mother name'
                                                        {...register('pasR_MotherName')}
                                                        error={errors.pasR_MotherName?.message}
                                                    />
                                                    <InputText
                                                        label='Surname'
                                                        id='pasR_MotherSurname'
                                                        placeholder='Enter surname'
                                                        {...register('pasR_MotherSurname')}
                                                        error={errors.pasR_MotherSurname?.message}
                                                    />
                                                    <InputText
                                                        label='Qualification'
                                                        id='pasR_MotherEducation'
                                                        placeholder='Enter qualification'
                                                        {...register('pasR_MotherEducation')}
                                                        error={errors.pasR_MotherEducation?.message}
                                                    />
                                                    <InputText
                                                        label='Pan No'
                                                        id='pasR_MotherPanno'
                                                        placeholder='Enter PAN'
                                                        {...register('pasR_MotherPanno')}
                                                        error={errors.pasR_MotherPanno?.message}
                                                    />
                                                    <InputText
                                                        label='Designation'
                                                        id='pasR_MotherDesignation'
                                                        placeholder='Enter designation'
                                                        {...register('pasR_MotherDesignation')}
                                                        error={errors.pasR_MotherDesignation?.message}
                                                    />
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label htmlFor='pasR_MotherNationality'>
                                                            Nationality <span className='ml-1 text-red-500'>*</span>
                                                        </Label>
                                                        <Controller
                                                            name='pasR_MotherNationality'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value?.toString() || undefined}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='Select nationality' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {countryLoading ? (
                                                                            <SelectItem value='loading' disabled>
                                                                                Loading...
                                                                            </SelectItem>
                                                                        ) : countryError ? (
                                                                            <SelectItem value='error' disabled>
                                                                                Error loading
                                                                            </SelectItem>
                                                                        ) : (
                                                                            country?.data?.map((item) => (
                                                                                <SelectItem
                                                                                    key={item.ivrmmC_Id}
                                                                                    value={item.ivrmmC_Id.toString()}>
                                                                                    {item.ivrmmC_CountryName}
                                                                                </SelectItem>
                                                                            ))
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.pasR_MotherNationality && (
                                                            <FormError>{errors.pasR_MotherNationality.message}</FormError>
                                                        )}
                                                    </div>
                                                    <InputText
                                                        label='Office Address'
                                                        id='pasR_MotherOfficeAddr'
                                                        placeholder='Enter office address'
                                                        {...register('pasR_MotherOfficeAddr')}
                                                        error={errors.pasR_MotherOfficeAddr?.message}
                                                    />
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Controller
                                                            name='pasR_MotherMobleNo'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <MobileNumberInput
                                                                    label='Mobile No.'
                                                                    id='pasR_MotherMobleNo'
                                                                    value={field.value}
                                                                    onChange={(value) => field.onChange(value)}
                                                                    type='number'
                                                                    showSpinner={false}
                                                                />
                                                            )}
                                                        />
                                                        {errors.pasR_MotherMobleNo && (
                                                            <FormError>{errors.pasR_MotherMobleNo.message}</FormError>
                                                        )}
                                                    </div>
                                                    <div className='flex flex-col gap-1.5'>
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
                                                        {errors.pasR_MotherIncome && (
                                                            <FormError>{errors.pasR_MotherIncome.message}</FormError>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='space-y-4'>
                                                <h3 className='font-semibold text-gray-800 text-lg'>Additional Contact</h3>
                                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Controller
                                                            name='pasR_AltContactNo'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <MobileNumberInput
                                                                    label='Alternate Contact No.'
                                                                    id='pasR_AltContactNo'
                                                                    value={field.value}
                                                                    onChange={(value) => field.onChange(value)}
                                                                    type='number'
                                                                    showSpinner={false}
                                                                />
                                                            )}
                                                        />
                                                        {errors.pasR_AltContactNo && (
                                                            <FormError>{errors.pasR_AltContactNo.message}</FormError>
                                                        )}
                                                    </div>
                                                    <InputText
                                                        label='Alternate Contact Email'
                                                        id='pasR_AltContactEmail'
                                                        placeholder='Enter alternate email'
                                                        {...register('pasR_AltContactEmail')}
                                                        error={errors.pasR_AltContactEmail?.message}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Other Information */}
                                {currentStep === 4 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Other Information</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>
                                                Sibling details, previous school information, and undertaking
                                            </p>
                                        </div>

                                        {/* Sibling Details Section */}
                                        <div className='space-y-4'>
                                            <div className='flex items-center justify-between'>
                                                <h3 className='font-semibold text-gray-800 text-lg'>Sibling Details</h3>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={addSibling}
                                                    disabled={isSubmitting}
                                                    className='w-fit'>
                                                    <span className='mr-2'>+</span>
                                                    Add Sibling
                                                </Button>
                                            </div>

                                            {siblings.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>
                                                    No siblings added yet. Click "Add Sibling" to add details.
                                                </p>
                                            ) : (
                                                <div className='space-y-4'>
                                                    {siblings.map((sibling, index) => (
                                                        <div key={index} className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                                            <div className='mb-3 flex items-center justify-between'>
                                                                <h4 className='font-medium text-gray-700 text-sm'>Sibling {index + 1}</h4>
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={() => removeSibling(index)}
                                                                    disabled={isSubmitting}
                                                                    className='h-8 w-fit bg-error text-white'>
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                                <InputText
                                                                    label='Sibling Name'
                                                                    id={`sibling_name_${index}`}
                                                                    placeholder='Enter sibling name'
                                                                    value={sibling.pasrS_SiblingsName}
                                                                    onChange={(e) =>
                                                                        updateSibling(index, 'pasrS_SiblingsName', e.target.value)
                                                                    }
                                                                />
                                                                <InputText
                                                                    label='Class'
                                                                    id={`sibling_class_${index}`}
                                                                    placeholder='Enter class'
                                                                    value={sibling.pasrS_SiblingsClass}
                                                                    onChange={(e) =>
                                                                        updateSibling(index, 'pasrS_SiblingsClass', e.target.value)
                                                                    }
                                                                />
                                                                <InputText
                                                                    label='Admission No'
                                                                    id={`sibling_admission_${index}`}
                                                                    placeholder='Enter admission number'
                                                                    value={sibling.pasrS_SiblingsAdmissionNo}
                                                                    onChange={(e) =>
                                                                        updateSibling(index, 'pasrS_SiblingsAdmissionNo', e.target.value)
                                                                    }
                                                                />
                                                                <InputText
                                                                    label='Section'
                                                                    id={`sibling_section_${index}`}
                                                                    placeholder='Enter section'
                                                                    value={sibling.pasrS_SiblingsSection}
                                                                    onChange={(e) =>
                                                                        updateSibling(index, 'pasrS_SiblingsSection', e.target.value)
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Previous School Details Section */}
                                        <div className='space-y-4'>
                                            <h3 className='font-semibold text-gray-800 text-lg'>Previous School Details</h3>
                                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                <InputText
                                                    label='Previous School Name'
                                                    id='pasrpS_PrvSchoolName'
                                                    placeholder='Enter school name'
                                                    value={previousSchool.pasrpS_PrvSchoolName}
                                                    onChange={(e) => updatePreviousSchool('pasrpS_PrvSchoolName', e.target.value)}
                                                />
                                                <InputText
                                                    label='Previous Class'
                                                    id='pasrpS_PreviousClass'
                                                    placeholder='Enter class'
                                                    value={previousSchool.pasrpS_PreviousClass}
                                                    onChange={(e) => updatePreviousSchool('pasrpS_PreviousClass', e.target.value)}
                                                />
                                                <InputText
                                                    label='Board'
                                                    id='pasrpS_Board'
                                                    placeholder='Enter board'
                                                    value={previousSchool.pasrpS_Board}
                                                    onChange={(e) => updatePreviousSchool('pasrpS_Board', e.target.value)}
                                                />
                                                <InputText
                                                    label='Left Year'
                                                    id='pasrpS_LeftYear'
                                                    placeholder='Enter year'
                                                    value={previousSchool.pasrpS_LeftYear}
                                                    onChange={(e) => updatePreviousSchool('pasrpS_LeftYear', e.target.value)}
                                                />
                                                <InputText
                                                    label='Reason for Leaving'
                                                    id='pasrpS_LeftReason'
                                                    placeholder='Enter reason'
                                                    value={previousSchool.pasrpS_LeftReason}
                                                    onChange={(e) => updatePreviousSchool('pasrpS_LeftReason', e.target.value)}
                                                />
                                                <InputText
                                                    label='School Address'
                                                    id='pasrpS_Address'
                                                    placeholder='Enter address'
                                                    value={previousSchool.pasrpS_Address}
                                                    onChange={(e) => updatePreviousSchool('pasrpS_Address', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Undertaking Section */}
                                        <div className='rounded-lg border border-gray-200 bg-gray-200 p-6'>
                                            <Controller
                                                name='pasR_UndertakingFlag'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='space-y-4'>
                                                        <Label className='text-base'>
                                                            <span className='font-bold text-gray-900'>
                                                                Undertaking by the Parents/Guardian:
                                                            </span>
                                                            <p className='mt-3 text-gray-700 text-sm leading-relaxed'>
                                                                I have read all the rules of the School and declare that they are acceptable
                                                                to me and my ward. I shall pay all the School fees quarterly or annually. I
                                                                am willing to pay all other dues as necessary. I have no objection to my
                                                                child participating in any extra curricular activities run by the school.
                                                            </p>
                                                        </Label>
                                                        <RadioGroup
                                                            id='pasR_UndertakingFlag'
                                                            value={field.value !== undefined ? String(field.value) : '0'}
                                                            onValueChange={(value) => field.onChange(Number(value.toString()))}
                                                            required
                                                            className='flex gap-6 pt-2'>
                                                            <div className='flex items-center gap-2'>
                                                                <RadioGroupItem
                                                                    value='1'
                                                                    id='pasR_UndertakingFlag_yes'
                                                                    className='h-5 w-5'
                                                                />
                                                                <Label
                                                                    htmlFor='pasR_UndertakingFlag_yes'
                                                                    className='cursor-pointer font-medium'>
                                                                    I Accept
                                                                </Label>
                                                            </div>
                                                            <div className='flex items-center gap-2'>
                                                                <RadioGroupItem
                                                                    value='0'
                                                                    id='pasR_UndertakingFlag_no'
                                                                    className='h-5 w-5'
                                                                />
                                                                <Label
                                                                    htmlFor='pasR_UndertakingFlag_no'
                                                                    className='cursor-pointer font-medium'>
                                                                    I Decline
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Footer */}
                            <div className='flex items-center justify-between border-t bg-gray-50 px-6 py-4 md:px-8'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleReset}
                                    disabled={isSubmitting}
                                    className='w-fit transition-all duration-200 hover:scale-105'>
                                    Reset Form
                                </Button>

                                <div className='flex gap-3'>
                                    {currentStep > 1 && (
                                        <Button type='button' variant='outline' onClick={prevStep} disabled={isSubmitting}>
                                            <ChevronLeft className='mr-2 h-4 w-4' />
                                            Previous
                                        </Button>
                                    )}

                                    {currentStep < steps.length ? (
                                        <Button type='button' onClick={nextStep} disabled={isSubmitting || ageEligibilityError !== null}>
                                            Next
                                            <ChevronRight className='ml-2 h-4 w-4' />
                                        </Button>
                                    ) : (
                                        <Button
                                            type='button'
                                            onClick={handleSubmit(onSubmit)}
                                            disabled={isSubmitting}
                                            className='min-w-[160px] transition-all duration-200 hover:scale-105'>
                                            {isSubmitting ? (
                                                <span>Saving...</span>
                                            ) : (
                                                <>
                                                    <Save className='mr-2 h-4 w-4' />
                                                    Submit Application
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
