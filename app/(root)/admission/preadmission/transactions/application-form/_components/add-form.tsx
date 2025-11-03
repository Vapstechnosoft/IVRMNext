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
    useActivePreadmissionDetails,
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
import { deleteDocument, uploadDocument } from '@/server/document_upload';
import type { CalculatedAgeDetails } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar, Check, ChevronLeft, ChevronRight, Eye, Save, Trash } from 'lucide-react';
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
        name: 'Document Upload',
        description: 'Required documents',
        icon: 'FileUp'
    },
    {
        id: 5,
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
    const [uploadedDocuments, setUploadedDocuments] = useState<
        Array<{
            pasrD_Id: number;
            pasR_Id: number;
            amsmD_Id: number;
            document_Path: string;
            documentName?: string;
            isUploading?: boolean;
        }>
    >([]);

    const [studentPhoto, setStudentPhoto] = useState<{
        pasR_Student_Pic_Path: string;
        isUploading?: boolean;
    } | null>(null);
    const [studentPhotoError, setStudentPhotoError] = useState<string | null>(null);

    const [documentErrors, setDocumentErrors] = useState<Record<number, string>>({});

    const { data: activePreadmission } = useActivePreadmissionDetails();

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

            if (!studentPhoto?.pasR_Student_Pic_Path) {
                toast.error('Please upload student photo');
                return;
            }
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
        } else if (currentStep === 4) {
            // Validate document uploads
            const mandatoryDocs = preadmissionDocuments?.data?.filter((doc) => doc.amsmD_FLAG) || [];
            const missingDocs = mandatoryDocs.filter((doc) => !isDocumentUploaded(doc.amsmD_Id));

            if (missingDocs.length > 0) {
                const docNames = missingDocs.map((doc) => doc.amsmD_DocumentName).join(', ');
                toast.error(`Please upload mandatory documents: ${docNames}`);
                return;
            }
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

    const goToStep = (step: number) => {
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
                pasR_Student_Pic_Path: studentPhoto?.pasR_Student_Pic_Path || '',
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
                siblingsDetails: siblings
                    .filter((sibling) => sibling.pasrS_SiblingsName !== '')
                    .map((sibling) => ({
                        ...sibling,
                        verrejstatus: '',
                        pasrS_SchoolName: '',
                        pasrS_Age: 0,
                        pasrS_Gender: '',
                        pasrS_Institution: '',
                        pasrS_DOB: ''
                    })),
                previousSchoolList:
                    previousSchool.pasrpS_PrvSchoolName !== ''
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
                selectedDocuments: uploadedDocuments.map((doc) => ({
                    pasrD_Id: doc.pasrD_Id,
                    pasR_Id: doc.pasR_Id,
                    amsmD_Id: doc.amsmD_Id,
                    document_Path: doc.document_Path
                })),
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
        setUploadedDocuments([]);
        setStudentPhoto(null);
        setStudentPhotoError(null);
        setDocumentErrors({});
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

    const handleDocumentUpload = async (amsmD_Id: number, file: File, documentName: string) => {
        try {
            // Set uploading state - ADD document if it doesn't exist
            setUploadedDocuments((prev) => {
                const existingIndex = prev.findIndex((doc) => doc.amsmD_Id === amsmD_Id);

                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...updated[existingIndex], isUploading: true };
                    return updated;
                }
                return [
                    ...prev,
                    {
                        pasrD_Id: 0,
                        pasR_Id: 0,
                        amsmD_Id,
                        document_Path: '',
                        documentName,
                        isUploading: true
                    }
                ];
            });

            setDocumentErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[amsmD_Id];
                return newErrors;
            });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('SubContainerName', 'preadmission_document');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                setUploadedDocuments((prev) => {
                    const existingIndex = prev.findIndex((doc) => doc.amsmD_Id === amsmD_Id);
                    const newDoc = {
                        pasrD_Id: 0,
                        pasR_Id: 0,
                        amsmD_Id,
                        document_Path: response.data as string,
                        documentName,
                        isUploading: false
                    };

                    if (existingIndex >= 0) {
                        const updated = [...prev];
                        updated[existingIndex] = newDoc;
                        return updated;
                    }
                    return [...prev, newDoc];
                });

                toast.success(`${documentName} uploaded successfully`);
            } else {
                console.log('Upload Failed:', response.message);
                toast.error(`Failed to upload ${documentName}`);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Upload failed';

            setDocumentErrors((prev) => ({
                ...prev,
                [amsmD_Id]: errorMessage
            }));

            setUploadedDocuments((prev) => prev.filter((doc) => doc.amsmD_Id !== amsmD_Id));

            toast.error(`Failed to upload ${documentName}: ${errorMessage}`);
        }
    };

    const handleDocumentDelete = async (amsmD_Id: number, blobUrl: string, documentName: string) => {
        try {
            const response = await deleteDocument(blobUrl);

            if (response.success) {
                setUploadedDocuments((prev) => prev.filter((doc) => doc.amsmD_Id !== amsmD_Id));
                toast.success(`${documentName} deleted successfully`);
            } else {
                throw new Error(response.message || 'Delete failed');
            }
        } catch (_error: any) {
            toast.error(`Failed to delete ${documentName}`);
        }
    };

    const handleStudentPhotoUpload = async (file: File) => {
        try {
            setStudentPhoto({ pasR_Student_Pic_Path: '', isUploading: true });
            setStudentPhotoError(null);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('SubContainerName', 'preadmission_student_photo');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                setStudentPhoto({
                    pasR_Student_Pic_Path: response.data as string,
                    isUploading: false
                });
                toast.success('Student photo uploaded successfully');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Upload failed';
            setStudentPhotoError(errorMessage);
            setStudentPhoto(null);
            toast.error(`Failed to upload photo: ${errorMessage}`);
        }
    };

    const handleStudentPhotoDelete = async () => {
        if (!studentPhoto?.pasR_Student_Pic_Path) return;

        try {
            const response = await deleteDocument(studentPhoto.pasR_Student_Pic_Path);
            if (response.success) {
                setStudentPhoto(null);
                toast.success('Student photo deleted successfully');
            } else {
                throw new Error(response.message || 'Delete failed');
            }
        } catch (_error: any) {
            toast.error('Failed to delete photo');
        }
    };

    const isDocumentUploaded = (amsmD_Id: number) => {
        return uploadedDocuments.some((doc) => doc.amsmD_Id === amsmD_Id);
    };

    const getUploadedDocument = (amsmD_Id: number) => {
        return uploadedDocuments.find((doc) => doc.amsmD_Id === amsmD_Id);
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
                                            <Button
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
                                            </Button>
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
                                        <div className='flex justify-between'>
                                            <InputText
                                                label='Academic Year'
                                                required
                                                id='academic_year'
                                                placeholder='Enter first name'
                                                defaultValue={activePreadmission?.data?.asmaY_Year}
                                                className='w-fit font-semibold'
                                                disabled
                                            />
                                            {/* Student Photo Upload - Mandatory */}
                                            <div className='col-span-full w-fit'>
                                                <div className='rounded-lg border-2 border-blue-200 bg-blue-50 p-2'>
                                                    <div className='mb-1'>
                                                        <Label htmlFor='student_photo'>
                                                            Student Photo <span className='ml-1 text-red-500'>*</span>
                                                        </Label>
                                                    </div>

                                                    {!studentPhoto?.pasR_Student_Pic_Path ? (
                                                        <label
                                                            htmlFor='student_photo'
                                                            className={cn(
                                                                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-2 py-3 text-center transition-all hover:border-primary hover:bg-white',
                                                                studentPhoto?.isUploading
                                                                    ? 'border-blue-400 bg-blue-100'
                                                                    : 'border-gray-300 bg-white'
                                                            )}>
                                                            {studentPhoto?.isUploading ? (
                                                                <div className='flex flex-col items-center gap-2'>
                                                                    <svg
                                                                        className='h-8 w-8 animate-spin text-primary'
                                                                        fill='none'
                                                                        stroke='currentColor'
                                                                        viewBox='0 0 24 24'>
                                                                        <circle
                                                                            className='opacity-25'
                                                                            cx='12'
                                                                            cy='12'
                                                                            r='10'
                                                                            strokeWidth='4'
                                                                            stroke='currentColor'
                                                                        />
                                                                        <path
                                                                            className='opacity-75'
                                                                            fill='currentColor'
                                                                            d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                                                                        />
                                                                    </svg>
                                                                    <span className='font-medium text-primary text-sm'>
                                                                        Uploading photo...
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <svg
                                                                        className='h-12 w-12 text-primary'
                                                                        fill='none'
                                                                        stroke='currentColor'
                                                                        viewBox='0 0 24 24'>
                                                                        <path
                                                                            strokeLinecap='round'
                                                                            strokeLinejoin='round'
                                                                            strokeWidth={2}
                                                                            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                                                        />
                                                                    </svg>
                                                                    <span className='font-medium text-gray-700 text-sm'>
                                                                        Click to upload
                                                                    </span>
                                                                    <span className='mt-1 max-w-[250px] text-gray-600 text-sm'>
                                                                        Upload recent passport-size photo (Max size: 1MB, Format: JPG, PNG)
                                                                    </span>
                                                                </>
                                                            )}
                                                            <input
                                                                id='student_photo'
                                                                type='file'
                                                                className='hidden'
                                                                accept='image/jpeg,image/jpg,image/png'
                                                                disabled={studentPhoto?.isUploading || isSubmitting}
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        if (file.size > 1 * 1024 * 1024) {
                                                                            toast.error('File size must be less than 1MB');
                                                                            e.target.value = '';
                                                                            return;
                                                                        }
                                                                        handleStudentPhotoUpload(file);
                                                                        e.target.value = '';
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    ) : (
                                                        <div className='flex w-fit flex-col items-start justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-4'>
                                                            <div className='flex items-center gap-4'>
                                                                <img
                                                                    src={studentPhoto.pasR_Student_Pic_Path}
                                                                    alt='Student'
                                                                    className='h-20 w-20 rounded-lg border-2 border-green-300 object-cover'
                                                                />
                                                                <div>
                                                                    <div className='flex items-center gap-2 font-medium text-green-700'>
                                                                        <Check className='h-5 w-5' />
                                                                        Uploaded Successfully
                                                                    </div>
                                                                    <p className='mt-1 text-green-600 text-sm'>Student photo is ready</p>
                                                                </div>
                                                            </div>
                                                            <div className='flex gap-2'>
                                                                <Button
                                                                    type='button'
                                                                    variant='outline'
                                                                    size='sm'
                                                                    onClick={() =>
                                                                        window.open(studentPhoto.pasR_Student_Pic_Path, '_blank')
                                                                    }>
                                                                    <Eye className='h-4 w-4' />
                                                                </Button>
                                                                <Button
                                                                    type='button'
                                                                    variant='destructive'
                                                                    size='sm'
                                                                    disabled={isSubmitting}
                                                                    onClick={handleStudentPhotoDelete}>
                                                                    <Trash className='h-4 w-4' />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {studentPhotoError && (
                                                        <div className='mt-3 rounded-md border border-red-200 bg-red-50 p-3'>
                                                            <p className='flex items-start gap-2 font-medium text-red-700 text-sm'>
                                                                <span className='mt-0.5 text-red-500'>⚠</span>
                                                                <span>{studentPhotoError}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
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
                                                                    disabled={sameAsResidential}
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

                                {/* Step 4: Document Upload */}
                                {currentStep === 4 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Document Upload</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>
                                                Please upload the required documents. Documents marked with{' '}
                                                <span className='text-red-500'>*</span> are mandatory.
                                            </p>
                                        </div>

                                        {preadmissionDocumentsLoading ? (
                                            <div className='flex items-center justify-center py-12'>
                                                <div className='text-center'>
                                                    <div className='mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                    <p className='mt-4 text-gray-600 text-sm'>Loading documents...</p>
                                                </div>
                                            </div>
                                        ) : preadmissionDocuments?.data && preadmissionDocuments.data.length > 0 ? (
                                            <div className='overflow-x-auto rounded-lg border border-gray-200'>
                                                <table className='min-w-full divide-y divide-gray-200'>
                                                    <thead className='bg-gray-50'>
                                                        <tr>
                                                            <th
                                                                scope='col'
                                                                className='px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider'>
                                                                Document Name
                                                            </th>
                                                            <th
                                                                scope='col'
                                                                className='px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider'>
                                                                Status
                                                            </th>
                                                            <th
                                                                scope='col'
                                                                className='px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider'>
                                                                Upload
                                                            </th>
                                                            <th
                                                                scope='col'
                                                                className='px-6 py-3 text-center font-medium text-gray-500 text-xs uppercase tracking-wider'>
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className='divide-y divide-gray-200 bg-white'>
                                                        {preadmissionDocuments.data.map((document) => {
                                                            const uploadedDoc = getUploadedDocument(document.amsmD_Id);
                                                            const isUploading = uploadedDoc?.isUploading;
                                                            const error = documentErrors[document.amsmD_Id];

                                                            return (
                                                                <tr
                                                                    key={document.amsmD_Id}
                                                                    className={
                                                                        uploadedDoc && !isUploading
                                                                            ? 'bg-green-50'
                                                                            : document.amsmD_FLAG
                                                                              ? 'bg-orange-50'
                                                                              : ''
                                                                    }>
                                                                    <td className='whitespace-nowrap px-6 py-4'>
                                                                        <div className='flex items-center gap-2'>
                                                                            <span className='font-semibold text-gray-900 text-sm'>
                                                                                {document.amsmD_DocumentName}
                                                                            </span>
                                                                            {document.amsmD_FLAG && <span className='text-red-500'>*</span>}
                                                                        </div>
                                                                        <p className='mt-0.5 text-gray-500 text-xs'>
                                                                            {document.amsmD_FLAG ? 'Required' : 'Optional'}
                                                                        </p>
                                                                    </td>

                                                                    <td className='whitespace-nowrap px-6 py-4'>
                                                                        {uploadedDoc && !isUploading ? (
                                                                            <div className='flex items-center gap-2 font-medium text-green-600 text-sm'>
                                                                                <Check className='h-5 w-5' />
                                                                                Uploaded
                                                                            </div>
                                                                        ) : isUploading ? (
                                                                            <div className='flex animate-pulse items-center gap-2 font-medium text-blue-600 text-sm'>
                                                                                <svg
                                                                                    className='h-5 w-5 animate-spin'
                                                                                    fill='none'
                                                                                    stroke='currentColor'
                                                                                    viewBox='0 0 24 24'>
                                                                                    <circle
                                                                                        className='opacity-25'
                                                                                        cx='12'
                                                                                        cy='12'
                                                                                        r='10'
                                                                                        strokeWidth='4'
                                                                                        stroke='currentColor'
                                                                                    />
                                                                                    <path
                                                                                        className='opacity-75'
                                                                                        fill='currentColor'
                                                                                        d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                                                                                    />
                                                                                </svg>
                                                                                Uploading...
                                                                            </div>
                                                                        ) : (
                                                                            <span className='text-gray-500 text-sm'>Not Uploaded</span>
                                                                        )}
                                                                        {error && (
                                                                            <p className='mt-1 flex items-center gap-1 font-medium text-red-600 text-xs'>
                                                                                <span>⚠</span> {error}
                                                                            </p>
                                                                        )}
                                                                    </td>

                                                                    <td className='whitespace-nowrap px-6 py-4'>
                                                                        {(!uploadedDoc || isUploading) && (
                                                                            <label
                                                                                htmlFor={`document-${document.amsmD_Id}`}
                                                                                className={cn(
                                                                                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-3 text-center transition-all hover:border-primary hover:bg-gray-50',
                                                                                    isUploading
                                                                                        ? 'border-blue-300 bg-blue-50'
                                                                                        : 'border-gray-300 bg-white'
                                                                                )}>
                                                                                <svg
                                                                                    className='mb-1 h-6 w-6 text-primary'
                                                                                    fill='none'
                                                                                    stroke='currentColor'
                                                                                    viewBox='0 0 24 24'>
                                                                                    <path
                                                                                        strokeLinecap='round'
                                                                                        strokeLinejoin='round'
                                                                                        strokeWidth={2}
                                                                                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                                                                                    />
                                                                                </svg>
                                                                                <span className='text-gray-600 text-xs'>
                                                                                    Click to upload
                                                                                </span>
                                                                                <input
                                                                                    id={`document-${document.amsmD_Id}`}
                                                                                    type='file'
                                                                                    className='hidden'
                                                                                    accept='.pdf,.jpg,.jpeg,.png'
                                                                                    disabled={isUploading || isSubmitting}
                                                                                    onChange={(e) => {
                                                                                        const file = e.target.files?.[0];
                                                                                        if (file) {
                                                                                            if (file.size > 1 * 1024 * 1024) {
                                                                                                toast.error(
                                                                                                    'File size must be less than 1MB'
                                                                                                );
                                                                                                e.target.value = ''; // Reset input
                                                                                                return;
                                                                                            }
                                                                                            handleDocumentUpload(
                                                                                                document.amsmD_Id,
                                                                                                file,
                                                                                                document.amsmD_DocumentName
                                                                                            );
                                                                                            e.target.value = ''; // Reset input after starting upload
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </label>
                                                                        )}
                                                                    </td>

                                                                    <td className='space-x-2 whitespace-nowrap px-6 py-4 text-center'>
                                                                        {uploadedDoc && !isUploading && (
                                                                            <>
                                                                                <Button
                                                                                    type='button'
                                                                                    className='w-fit'
                                                                                    onClick={() =>
                                                                                        window.open(uploadedDoc.document_Path, '_blank')
                                                                                    }>
                                                                                    <Eye className='h-4 w-4' />
                                                                                </Button>
                                                                                <Button
                                                                                    type='button'
                                                                                    className='w-fit'
                                                                                    variant='destructive'
                                                                                    disabled={isSubmitting}
                                                                                    onClick={() =>
                                                                                        handleDocumentDelete(
                                                                                            document.amsmD_Id,
                                                                                            uploadedDoc.document_Path,
                                                                                            document.amsmD_DocumentName
                                                                                        )
                                                                                    }>
                                                                                    <Trash className='h-4 w-4' />
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className='rounded-lg border-2 border-gray-300 border-dashed bg-gray-50 p-12 text-center'>
                                                <svg
                                                    className='mx-auto h-12 w-12 text-gray-400'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                                    />
                                                </svg>
                                                <p className='mt-4 text-gray-600 text-sm'>No documents required at this time</p>
                                            </div>
                                        )}

                                        {/* Upload Summary */}
                                        {preadmissionDocuments?.data && preadmissionDocuments.data.length > 0 && (
                                            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                                                <div className='flex items-start gap-3'>
                                                    <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100'>
                                                        <svg
                                                            className='h-5 w-5 text-blue-600'
                                                            fill='none'
                                                            stroke='currentColor'
                                                            viewBox='0 0 24 24'>
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                strokeWidth={2}
                                                                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div className='flex-1'>
                                                        <p className='font-medium text-blue-900 text-sm'>Upload Progress</p>
                                                        <p className='mt-1 text-blue-700 text-sm'>
                                                            {uploadedDocuments.length} of {preadmissionDocuments.data.length} documents
                                                            uploaded
                                                            {preadmissionDocuments.data.filter((d) => d.amsmD_FLAG).length > 0 && (
                                                                <>
                                                                    {' '}
                                                                    (
                                                                    {
                                                                        preadmissionDocuments.data.filter(
                                                                            (d) => d.amsmD_FLAG && isDocumentUploaded(d.amsmD_Id)
                                                                        ).length
                                                                    }{' '}
                                                                    of {preadmissionDocuments.data.filter((d) => d.amsmD_FLAG).length}{' '}
                                                                    mandatory)
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 4: Other Information */}
                                {currentStep === 5 && (
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
                                                                    minLength={1}
                                                                    maxLength={10}
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
