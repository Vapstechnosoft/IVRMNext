'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { MobileNumberInput } from '@/components/ui/extension/input-mobile-number';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { calculateAge, dateToWords, formatAge } from '@/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearMasterConfiguration } from '@/hooks/admission/preadmission/useConfigurations';
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
import { cn } from '@/lib/utils';
import { studentAdmissionFormSchema } from '@/schemas/admission/admission-form';
// Add this import if not already present
import { addStudentApplicationForm } from '@/server/admission/preadmission/transactions/application_form';
import { deleteDocument, uploadDocument } from '@/server/document_upload';
import type { IPreadmissionClassDropdown } from '@/types/admission/preadmission/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronLeft, ChevronRight, Eye, Save, Trash } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { IneligibleClassesDialog } from './InEligibleDialog';

type FormFields = z.infer<typeof studentAdmissionFormSchema.add>;

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
        description: 'Additional details',
        icon: 'ReceiptText'
    },
    {
        id: 5,
        name: 'Health and Medical Details',
        description: 'Health & medical info',
        icon: 'Hospital'
    },
    {
        id: 6,
        name: 'Document Upload',
        description: 'Required documents',
        icon: 'FileUp'
    }
];

export default function AddStudentAdmissionForm({ onSuccess, className = '' }: AddStudentApplicationFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const {
        watch,
        control,
        register,
        handleSubmit,
        reset,
        trigger,
        setValue,
        getValues,
        setError,
        clearErrors,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(studentAdmissionFormSchema.add),
        mode: 'onChange',
        defaultValues: {
            pasA_WillingToContributeFlg: 0,
            pasR_UndertakingFlag: 0,
            previousSchoolDetails: [
                {
                    pasrpS_PrvSchoolName: '',
                    pasrpS_PreviousClass: '',
                    pasrpS_Board: '',
                    pasrpS_LeftYear: '',
                    pasrpS_LeftReason: '',
                    pasrpS_Address: ''
                }
            ],
            siblingsDetails: [],
            guardiansDetails: [],
            pasR_ECSFlag: 0,
            pasR_EMISFlag: 0
        }
    });

    // Define siblingFields using useFieldArray
    const {
        fields: siblingFields,
        append: appendSibling,
        remove
    } = useFieldArray({
        control,
        name: 'siblingsDetails'
    });

    // previous school entries (allow multiple)
    const {
        fields: previousSchoolFields,
        append: appendPreviousSchool,
        remove: removePreviousSchool
    } = useFieldArray({
        control,
        name: 'previousSchoolDetails'
    });

    // guardians entries (allow multiple)
    const {
        fields: guardianFields,
        append: appendGuardian,
        remove: removeGuardian
    } = useFieldArray({
        control,
        name: 'guardiansDetails'
    });

    //     const {
    //     fields: gaFields,
    //     append: appendGuardian,
    //     remove
    // } = useFieldArray({
    //     control,
    //     name: 'siblingsDetails'
    // });

    const [selectedSourceItems, setSelectedSourceItems] = useState<{ pamS_Id: string; pamS_SourceName: string }[]>([]);
    const [selectedReferenceItems, setSelectedReferenceItems] = useState<{ pamR_Id: string; pamR_ReferenceName: string }[]>([]);
    const [sameAsResidential, setSameAsResidential] = useState(false);
    const [filteredClasses, setFilteredClasses] = useState<IPreadmissionClassDropdown[]>([]);
    const [isClassDisabled, setIsClassDisabled] = useState(true);
    const [showIneligibleDialog, setShowIneligibleDialog] = useState(false);
    const [ineligibleClasses, setIneligibleClasses] = useState<IPreadmissionClassDropdown[]>([]);
    const [phoneExpectedInfo, setPhoneExpectedInfo] = useState<Record<string, { expected?: number; name?: string; dial?: string }>>({});
    const [phoneValues, setPhoneValues] = useState<Record<string, string>>({});
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

    const [fatherPhoto, setFatherPhoto] = useState<{
        pasR_FatherPhoto: string;
        isUploading?: boolean;
    } | null>(null);
    const [fatherPhotoError, setFatherPhotoError] = useState<string | null>(null);

    const [motherPhoto, setMotherPhoto] = useState<{
        pasR_MotherPhoto: string;
        isUploading?: boolean;
    } | null>(null);
    const [motherPhotoError, setMotherPhotoError] = useState<string | null>(null);

    const [documentErrors, setDocumentErrors] = useState<Record<number, string>>({});

    const { data: activePreadmission } = useActivePreadmissionDetails();

    const { data: masterConfig } = useAcademicYearMasterConfiguration(activePreadmission?.data?.asmaY_Id ?? 0);

    const { data: religion, isLoading: religionLoading, error: religionError, refetchAll: refetchReligion } = useReligionDropdown();
    const conConuntryId = watch('pasR_ConCountry');
    const perConuntryId = watch('pasR_PerCountry');
    const { data: caste, isLoading: casteLoading, error: casteError, refetchAll: refetchCaste } = useCasteDropdown(watch('religion_Id'));
    const { data: gender, isLoading: genderLoading, error: genderError, refetchAll: refetchGender } = useGenderDropdown();
    const { data: preadmissionClass, refetchAll: refetchClass } = usePreadmissionClassDropdown();
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

    // Helper to mark variables as used so TypeScript noUnusedLocals doesn't error
    const __markUsed = (..._args: any[]) => {
        /* intentionally empty */
    };

    __markUsed(refetchClass, reference, referenceLoading, refetchReference);

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];

        if (currentStep === 1) {
            fieldsToValidate = [
                'pasR_FirstName',
                'pasR_MiddleName',
                'pasR_LastName',
                'pasR_RegistrationNo',
                'pasR_DateOfAdmission',
                'pasR_AdmissionNo',
                'pasR_DOB',
                'pasR_Caste',
                'pasR_FeeConcessionType',
                'pasR_MobileNo',
                'pasR_BirthPlace',
                'pasR_EMISCardNo',
                'pasR_ECSBankAccountNo',
                'pasR_ECSBankName',
                'pasR_ECSIFSCCode',
                'pasR_ECSBankAccountHolderName',
                'pasR_ECSAccountType',
                'pasR_ECSMICRCode',
                'pasR_ECSBranchName',
                'religion_Id',
                'caste_Id',
                'pasR_Sex',
                // 'asmcL_Id',
                'pasR_emailId',
                'pasR_Nationality',
                'pasR_MotherTongue',
                'pasR_TransportReqdFlag'
            ];

            if (!studentPhoto?.pasR_Student_Pic_Path) {
                toast.error('Please upload student photo');
                return;
            }
            const fieldName = 'pasR_MobileNo';
            const info = phoneExpectedInfo[fieldName];
            const rawVal = String(watch(fieldName) ?? '');
            if (!rawVal || rawVal === '') {
                toast.error('Mobile number is required');
                return;
            }
            if (info?.expected) {
                const digits = rawVal.replace(/\D/g, '');
                if (digits.length !== info.expected) {
                    toast.error(`Mobile number must be exactly ${info.expected} digits`);
                    return;
                }
            }
        } else if (currentStep === 2) {
            fieldsToValidate = [
                'pasR_ConStreet',
                'pasR_ConArea',
                'pasR_ConCountry',
                'pasR_ConState',
                'pasR_ConCity',
                // include pincode fields so their validation runs when moving to next step
                'pasR_ConPincode',
                'pasR_PerStreet',
                'pasR_PerArea',
                'pasR_PerCountry',
                'pasR_PerState',
                'pasR_PerCity'
            ];
            // Only validate Permanent pincode when it's not marked same as residential
            if (!sameAsResidential) {
                fieldsToValidate.push('pasR_PerPincode');
            }
        } else if (currentStep === 3) {
            fieldsToValidate = ['pasR_FatherName', 'pasR_FatherNationality', 'pasR_MotherName', 'pasR_MotherNationality'];

            if (!fatherPhoto?.pasR_FatherPhoto) {
                toast.error('Please upload father photo');
                return;
            }

            if (!motherPhoto?.pasR_MotherPhoto) {
                toast.error('Please upload mother photo');
                return;
            }
            // Validate optional phone fields if they have values
            const phoneFieldsToCheck = [
                { name: 'pasR_FatherMobleNo', label: 'Father mobile number' },
                { name: 'pasR_MotherMobleNo', label: 'Mother mobile number' },
                { name: 'pasR_AltContactNo', label: 'Alternate contact number' }
            ];
            for (const phoneField of phoneFieldsToCheck) {
                const rawVal = String(watch(phoneField.name as any) ?? '');
                const info = phoneExpectedInfo[phoneField.name];
                if (rawVal && rawVal !== '' && info?.expected) {
                    const digits = rawVal.replace(/\D/g, '');
                    if (digits.length !== info.expected) {
                        toast.error(`${phoneField.label} must be ${info.expected} digits`);
                        return;
                    }
                }
            }
        } else if (currentStep === 6) {
            // Get selected religion details
            const selectedReligionId = watch('religion_Id');
            const selectedReligion = religion?.data?.find((r) => r.ivrmmR_Id === selectedReligionId);
            const isRomanCatholic = selectedReligion?.ivrmmR_Name === 'Roman Catholic';

            // Validate document uploads with conditional logic for Baptism Certificate
            const mandatoryDocs =
                preadmissionDocuments?.data?.filter((doc) => {
                    // Check if document is mandatory by default
                    if (doc.amsmD_FLAG) return true;

                    // Make Baptism Certificate mandatory for Roman Catholic religion
                    if (doc.amsmD_DocumentName === 'Baptism Certificate' && isRomanCatholic) {
                        return true;
                    }

                    return false;
                }) || [];

            const missingDocs = mandatoryDocs.filter((doc) => !isDocumentUploaded(doc.amsmD_Id));

            if (missingDocs.length > 0) {
                const docNames = missingDocs.map((doc) => doc.amsmD_DocumentName).join(', ');
                toast.error(`Please upload mandatory documents: ${docNames}`);
                return;
            }
        }

        const isValid = await trigger(fieldsToValidate as any);
        // Additional client-side checks for pincode length because schema is static
        if (isValid) {
            if (currentStep === 2) {
                const conPincodeVal = String(watch('pasR_ConPincode') ?? '');
                // if conZipLength is defined and user has entered a value, enforce exact length
                if (conZipLength && conPincodeVal !== '' && conPincodeVal.length !== conZipLength) {
                    setError('pasR_ConPincode', {
                        type: 'manual',
                        message: `Pin code must be ${conZipLength} digits`
                    });
                    return;
                }

                if (!sameAsResidential) {
                    const perPincodeVal = String(watch('pasR_PerPincode') ?? '');
                    if (perZipLength && perPincodeVal !== '' && perPincodeVal.length !== perZipLength) {
                        setError('pasR_PerPincode', {
                            type: 'manual',
                            message: `Pin code must be ${perZipLength} digits`
                        });
                        return;
                    }
                }
            }

            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const handleDOBChange = (date: Date | undefined) => {
        if (date) {
            // Convert date to words
            const dobInWords = dateToWords(date);
            setValue('amsT_DOB_Words', dobInWords);

            // Calculate and set age
            const age = calculateAge(date);
            const ageFormatted = formatAge(age);
            setValue('pasR_Age', ageFormatted);

            // Trigger validation if needed
            trigger(['amsT_DOB_Words', 'pasR_Age']);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const goToStep = async (targetStep: number) => {
        if (targetStep < 1 || targetStep > steps.length) return;

        // If moving backwards, allow immediately
        // if (targetStep < currentStep) {
        setCurrentStep(targetStep);
        return;
    };

    // Moving forward: validate each intermediate step before advancing
    // for (let s = currentStep; s < targetStep; s++) {
    //     let fieldsToValidate: any[] = [];

    //     if (s === 1) {
    //         fieldsToValidate = [
    //             'pasR_FirstName',
    //             'pasR_MiddleName',

    //             'pasR_LastName',
    //              'pasR_DateOfAdmission',
    //             'pasR_RegistrationNo',
    //              'pasR_Caste',
    //             'pasR_FeeConcessionType',
    //             'pasR_AdmissionNo',
    //             'pasR_DOB',
    //             'pasR_MobileNo',
    //             'pasR_BirthPlace',
    //             'religion_Id',
    //             'caste_Id',
    //             'pasR_Sex',
    //             'asmcL_Id',
    // 'pasR_EMISCardNo',
    //      'pasR_ECSBankAccountNo',
    //    'pasR_ECSBankName',
    //    'pasR_ECSIFSCCode',
    //     'pasR_ECSBankAccountHolderName',
    //    'pasR_ECSAccountType',
    //  'pasR_ECSMICRCode',
    //   'pasR_ECSBranchName'
    //             'pasR_emailId',
    //             'pasR_Nationality',
    //             'pasR_MotherTongue',
    //             'pasR_TransportReqdFlag'
    //         ];

    //         if (!studentPhoto?.pasR_Student_Pic_Path) {
    //             toast.error('Please upload student photo');
    //             setCurrentStep(1);
    //             return;
    //         }
    //     } else if (s === 2) {
    //         fieldsToValidate = [
    //             'pasR_ConStreet',
    //             'pasR_ConArea',
    //             'pasR_ConCountry',
    //             'pasR_ConState',
    //             'pasR_ConCity',
    //             'pasR_ConPincode',
    //             'pasR_PerStreet',
    //             'pasR_PerArea',
    //             'pasR_PerCountry',
    //             'pasR_PerState',
    //             'pasR_PerCity'
    //         ];

    //             if (!sameAsResidential) {
    //                 fieldsToValidate.push('pasR_PerPincode');
    //             }
    //         } else if (s === 3) {
    //             fieldsToValidate = ['pasR_FatherName', 'pasR_FatherNationality', 'pasR_MotherName', 'pasR_MotherNationality'];

    //             if (!fatherPhoto?.pasR_FatherPhoto) {
    //                 toast.error('Please upload father photo');
    //                 setCurrentStep(3);
    //                 return;
    //             }

    //             if (!motherPhoto?.pasR_MotherPhoto) {
    //                 toast.error('Please upload mother photo');
    //                 setCurrentStep(3);
    //                 return;
    //             }
    //         } else if (s === 4) {
    //             const selectedReligionId = watch('religion_Id');
    //             const selectedReligion = religion?.data?.find((r) => r.ivrmmR_Id === selectedReligionId);
    //             const isRomanCatholic = selectedReligion?.ivrmmR_Name === 'Roman Catholic';

    //             const mandatoryDocs =
    //                 preadmissionDocuments?.data?.filter((doc) => {
    //                     if (doc.amsmD_FLAG) return true;
    //                     if (doc.amsmD_DocumentName === 'Baptism Certificate' && isRomanCatholic) return true;
    //                     return false;
    //                 }) || [];

    //             const missingDocs = mandatoryDocs.filter((doc) => !isDocumentUploaded(doc.amsmD_Id));

    //             if (missingDocs.length > 0) {
    //                 const docNames = missingDocs.map((doc) => doc.amsmD_DocumentName).join(', ');
    //                 toast.error(`Please upload mandatory documents: ${docNames}`);
    //                 return;
    //             }
    //         }

    //         const isValid = await trigger(fieldsToValidate as any);

    //         // Additional pincode checks for step 2
    //         if (isValid && s === 2) {
    //             const conPincodeVal = String(watch('pasR_ConPincode') ?? '');
    //             if (conZipLength && conPincodeVal !== '' && conPincodeVal.length !== conZipLength) {
    //                 setError('pasR_ConPincode', {
    //                     type: 'manual',
    //                     message: `Pin code must be ${conZipLength} digits`
    //                 });
    //                 return;
    //             }

    //             if (!sameAsResidential) {
    //                 const perPincodeVal = String(watch('pasR_PerPincode') ?? '');
    //                 if (perZipLength && perPincodeVal !== '' && perPincodeVal.length !== perZipLength) {
    //                     setError('pasR_PerPincode', {
    //                         type: 'manual',
    //                         message: `Pin code must be ${perZipLength} digits`
    //                     });
    //                     return;
    //                 }
    //             }
    //         }

    //         if (!isValid) return;

    //         // Advance one step
    //         setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    //         // wait a tick for state to update before next iteration
    //         await new Promise((r) => setTimeout(r, 0));
    //     }
    // };

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        // Add photo validation
        if (!studentPhoto?.pasR_Student_Pic_Path) {
            toast.error('Please upload student photo');
            setCurrentStep(1);
            return;
        }

        if (!fatherPhoto?.pasR_FatherPhoto) {
            toast.error('Please upload father photo');
            setCurrentStep(3);
            return;
        }

        if (!motherPhoto?.pasR_MotherPhoto) {
            toast.error('Please upload mother photo');
            setCurrentStep(3);
            return;
        }

        // Add baptism certificate validation for Roman Catholic
        const selectedReligionId = watch('religion_Id');
        const selectedReligion = religion?.data?.find((r) => r.ivrmmR_Id === selectedReligionId);
        const isRomanCatholic = selectedReligion?.ivrmmR_Name === 'Roman Catholic';

        if (isRomanCatholic) {
            const baptismDoc = preadmissionDocuments?.data?.find((doc) => doc.amsmD_DocumentName === 'Baptism Certificate');
            if (baptismDoc && !isDocumentUploaded(baptismDoc.amsmD_Id)) {
                toast.error('Baptism Certificate is required for Roman Catholic religion');
                setCurrentStep(6);
                return;
            }
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
                pasA_WillingToContributeFlg,
                ...filteredData
            } = data;
            const payload = {
                ...filteredData,
                pasR_DOB: format(pasR_DOB, 'yyyy-MM-dd'),
                pasR_Age: 0,
                pasR_Student_Pic_Path: studentPhoto?.pasR_Student_Pic_Path || '',
                pasR_FatherPhoto: fatherPhoto?.pasR_FatherPhoto || '',
                pasR_MotherPhoto: motherPhoto?.pasR_MotherPhoto || '',
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
                siblingsDetails: (getValues('siblingsDetails') || []).map((sibling: any) => ({
                    pasR_Id: sibling.pasR_Id || 0,
                    pasrS_SchoolName: sibling.pasrS_SchoolName || '',
                    pasrS_Age: sibling.pasrS_Age || 0,
                    pasrS_Gender: sibling.pasrS_Gender || '',
                    pasrS_Institution: sibling.pasrS_Institution || '',
                    pasrS_DOB: sibling.pasrS_DOB || '',
                    verrejstatus: sibling.verrejstatus || '',
                    pasrS_SiblingsName: sibling.pasrS_SiblingsName || '',
                    pasrS_SiblingsClass: sibling.pasrS_SiblingsClass || '',
                    pasrS_SiblingsAdmissionNo: sibling.pasrS_SiblingsAdmissionNo || '',
                    pasrS_SiblingsSection: sibling.pasrS_SiblingsSection || ''
                })),
                // CHANGE THIS: Use array from form data
                previousSchoolList: (data.previousSchoolDetails || []).map((school: any) => ({
                    pasrpS_Id: 0,
                    pasR_Id: 0,
                    pasrpS_PrvSchoolName: school.pasrpS_PrvSchoolName || '',
                    pasrpS_PreviousClass: school.pasrpS_PreviousClass || '',
                    pasrpS_Board: school.pasrpS_Board || '',
                    pasrpS_LeftYear: school.pasrpS_LeftYear || '',
                    pasrpS_LeftReason: school.pasrpS_LeftReason || '',
                    pasrpS_Address: school.pasrpS_Address || '',
                    pasrpS_TcNo: '',
                    pasrpS_PreviousPer: '',
                    pasrpS_PreviousGrade: '',
                    pasrpS_PreviousMarks: '',
                    pasrpS_ConcOrScholarshipFlg: ''
                })),
                examSubjectDTO: [],
                elesubsubject: [],
                selectedDocuments: uploadedDocuments.map((doc) => ({
                    pasrD_Id: doc.pasrD_Id,
                    pasR_Id: doc.pasR_Id,
                    amsmD_Id: doc.amsmD_Id,
                    document_Path: doc.document_Path
                })),
                PASR_RegistrationNo: '',
                pasR_DateOfAdmission: '',
                pasA_WillingToContributeFlg: pasA_WillingToContributeFlg === 1,
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
        setSelectedSourceItems([]);
        setSelectedReferenceItems([]);
        setSameAsResidential(false);
        // REMOVE: setPreviousSchool(...);
        setUploadedDocuments([]);
        setStudentPhoto(null);
        setStudentPhotoError(null);
        setFatherPhoto(null);
        setFatherPhotoError(null);
        setMotherPhoto(null);
        setMotherPhotoError(null);
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

    // mark handleReferenceSelection as used (prevent no-unused-local errors)
    __markUsed(handleReferenceSelection);

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

            if (perZipLength && typeof conPincode === 'string') {
                setValue('pasR_PerPincode', conPincode.slice(0, perZipLength));
            } else if (perZipLength && typeof conPincode === 'number') {
                setValue('pasR_PerPincode', String(conPincode).slice(0, perZipLength));
            } else {
                setValue('pasR_PerPincode', conPincode);
            }
        }
    };
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
        // If empty or equal to dial code only, clear
        if (!phone || phone === countryData?.dialCode) {
            setPhoneValues((prev) => ({ ...prev, [fieldName]: '' }));
            setValue(fieldName as any, '');
            // trigger validation for this field
            trigger(fieldName as any);
            return;
        }

        const countryCode = countryData?.dialCode || '91';
        let numberPart = phone.replace(/[^\d]/g, '');
        if (numberPart.startsWith(countryCode)) {
            numberPart = numberPart.slice(String(countryCode).length);
        }
        const formattedPhone = `+${countryCode} ${numberPart}`;
        setPhoneValues((prev) => ({ ...prev, [fieldName]: formattedPhone }));
        // Store only digits as a number in form state
        setValue(fieldName as any, formattedPhone);
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
            if (numberPart.length < expected) {
                setError(fieldName as any, {
                    type: 'manual',
                    message: `Mobile number must be at least ${expected} digits for ${countryData?.name ?? countryData?.country ?? 'selected country'}`
                });
            } else if (numberPart.length > expected) {
                setError(fieldName as any, {
                    type: 'manual',
                    message: `Mobile number must be exactly ${expected} digits for ${countryData?.name ?? countryData?.country ?? 'selected country'}`
                });
            } else {
                clearErrors(fieldName as any);
            }
        }
        trigger(fieldName as any);
    };

    const addSibling = () => {
        appendSibling({
            pasR_Id: 0,
            pasrS_SchoolName: '',
            pasrS_Age: 0,
            pasrS_Gender: '',
            pasrS_Institution: '',
            pasrS_DOB: '',
            verrejstatus: '',
            pasrS_SiblingsName: '',
            pasrS_SiblingsClass: '',
            pasrS_SiblingsAdmissionNo: '',
            pasrS_SiblingsSection: ''
        });
    };

    const addPreviousSchool = () => {
        appendPreviousSchool({
            pasrpS_PrvSchoolName: '',
            pasrpS_PreviousClass: '',
            pasrpS_Board: '',
            pasrpS_LeftYear: '',
            pasrpS_LeftReason: '',
            pasrpS_Address: ''
        });
    };

    const addGuardian = () => {
        appendGuardian({
            guardianName: '',
            guardianPhone: '',
            guardianAddress: ''
        });
    };

    // Guardian management functions removed - useFieldArray not defined for guardians

    const removeSibling = (index: number) => {
        remove(index);
    };

    // const updatePreviousSchool = (field: string, value: string) => {
    //     setPreviousSchool({ ...previousSchool, [field]: value });
    // };

    const handleDocumentUpload = async (amsmD_Id: number, file: File, documentName: string) => {
        try {
            // Restrict file size to 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should not exceed 5MB');
                return;
            }
            // Block DOC and XLSX files
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                toast.error(' Only Pdf, PNG, JPG, and JPEG formats are allowed');
                return;
            }
            // Set uploading state - ADD document if it doesn't exist
            setUploadedDocuments((prev) => {
                const existingIndex = prev.findIndex((doc) => doc.amsmD_Id === amsmD_Id);

                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        isUploading: true
                    };
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
            // Validate file type
            const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedFormats.includes(file.type)) {
                toast.error('Only PNG, JPG, and JPEG formats are allowed');
                return;
            }
            // Restrict photo size to 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Photo size should not exceed 5MB');
                return;
            }

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

    const handleFatherPhotoUpload = async (file: File) => {
        try {
            // Validate file type
            const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedFormats.includes(file.type)) {
                toast.error('Only PNG, JPG, and JPEG formats are allowed');
                return;
            }
            // Restrict photo size to 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Photo size should not exceed 5MB');
                return;
            }

            setFatherPhoto({ pasR_FatherPhoto: '', isUploading: true });
            setFatherPhotoError(null);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('SubContainerName', 'preadmission_student_photo');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                setFatherPhoto({
                    pasR_FatherPhoto: response.data as string,
                    isUploading: false
                });
                toast.success('Father photo uploaded successfully');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Upload failed';
            setFatherPhotoError(errorMessage);
            setFatherPhoto(null);
            toast.error(`Failed to upload photo: ${errorMessage}`);
        }
    };

    const handleFatherPhotoDelete = async () => {
        if (!fatherPhoto?.pasR_FatherPhoto) return;

        try {
            const response = await deleteDocument(fatherPhoto.pasR_FatherPhoto);
            if (response.success) {
                setFatherPhoto(null);
                toast.success('Father photo deleted successfully');
            } else {
                throw new Error(response.message || 'Delete failed');
            }
        } catch (_error: any) {
            toast.error('Failed to delete photo');
        }
    };

    const handleMotherPhotoUpload = async (file: File) => {
        try {
            // Validate file type
            const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedFormats.includes(file.type)) {
                toast.error('Only PNG, JPG, and JPEG formats are allowed');
                return;
            }
            // Restrict photo size to 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Photo size should not exceed 5MB');
                return;
            }

            setMotherPhoto({ pasR_MotherPhoto: '', isUploading: true });
            setMotherPhotoError(null);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('SubContainerName', 'preadmission_student_photo');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                setMotherPhoto({
                    pasR_MotherPhoto: response.data as string,
                    isUploading: false
                });
                toast.success('Mother photo uploaded successfully');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Upload failed';
            setMotherPhotoError(errorMessage);
            setMotherPhoto(null);
            toast.error(`Failed to upload photo: ${errorMessage}`);
        }
    };

    const handleMotherPhotoDelete = async () => {
        if (!motherPhoto?.pasR_MotherPhoto) return;

        try {
            const response = await deleteDocument(motherPhoto.pasR_MotherPhoto);
            if (response.success) {
                setMotherPhoto(null);
                toast.success('Mother photo deleted successfully');
            } else {
                throw new Error(response.message || 'Delete failed');
            }
        } catch (_error: any) {
            toast.error('Failed to delete photo');
        }
    };

    // derive zip/pincode length allowed from selected country (useMemo to wait for data)
    const conCountryObj = useMemo(() => {
        if (!country?.data || conConuntryId === undefined || conConuntryId === null || conConuntryId === '') return undefined;
        return country.data.find((c: any) => String(c.ivrmmC_Id) === String(conConuntryId));
    }, [country?.data, conConuntryId]);

    const perCountryObj = useMemo(() => {
        if (!country?.data || perConuntryId === undefined || perConuntryId === null || perConuntryId === '') return undefined;
        return country.data.find((c: any) => String(c.ivrmmC_Id) === String(perConuntryId));
    }, [country?.data, perConuntryId]);

    const conZipLength: number | undefined = conCountryObj?.ivrmmC_ZipNoLength ?? undefined;
    const perZipLength: number | undefined = perCountryObj?.ivrmmC_ZipNoLength ?? undefined;

    // When the selected country changes, reset the corresponding pincode field
    useEffect(() => {
        // clear residential pincode when residential country changes
        setValue('pasR_ConPincode', '');
    }, [conConuntryId, setValue]);

    useEffect(() => {
        // clear permanent pincode when permanent country changes
        setValue('pasR_PerPincode', '');
    }, [perConuntryId, setValue]);

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
                                {steps.map((step, index) => {
                                    const IconComponent = getIconByName(step.icon);
                                    return (
                                        <div key={step.id} className='flex flex-1 items-center'>
                                            <div className='flex flex-col items-center'>
                                                <Button
                                                    type='button'
                                                    onClick={() => goToStep(step.id)}
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
                                                        <span className='text-lg'>
                                                            {IconComponent && <IconComponent className='h-5 w-5' />}
                                                        </span>
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
                                    );
                                })}
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
                                                    onClick={() => goToStep(step.id)}
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
                            {/* biome-ignore lint: template literal needed for bracket syntax in Tailwind */}
                            <div className={`max-h-[calc(100vh-2rem)] overflow-y-auto p-6 md:p-8`}>
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
                                                placeholder='Academic Year'
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
                                                                        Upload recent passport-size photo (Max size: 5MB, Format: JPG, PNG)
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
                                                                        if (file.size > 5 * 1024 * 1024) {
                                                                            toast.error('File size must be less than 5MB');
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
                                                id='amsT_FirstName'
                                                placeholder='Enter first name'
                                                {...register('amsT_FirstName')}
                                                error={errors.amsT_FirstName?.message}
                                            />
                                            <InputText
                                                label='Middle Name'
                                                required
                                                id='amsT_MiddleName'
                                                placeholder='Enter middle name'
                                                {...register('amsT_MiddleName')}
                                                error={errors.amsT_MiddleName?.message}
                                            />
                                            <InputText
                                                label='Last Name'
                                                required
                                                id='amsT_LastName'
                                                placeholder='Enter last name'
                                                {...register('amsT_LastName')}
                                                error={errors.amsT_LastName?.message}
                                            />
                                            <InputText
                                                label='Registration No'
                                                required
                                                id='amsT_RegistrationNo'
                                                placeholder='Enter registration number'
                                                {...register('amsT_RegistrationNo')}
                                                error={errors.amsT_RegistrationNo?.message}
                                            />
                                            <InputText
                                                label='Admission No'
                                                required
                                                id='amsT_AdmNo'
                                                placeholder='Enter admission number'
                                                {...register('amsT_AdmNo')}
                                                error={errors.amsT_AdmNo?.message}
                                            />
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='asmcL_Id'>
                                                    Class <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='asmcL_Id'
                                                    control={control}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <div className='flex flex-col space-y-2'>
                                                            <Select
                                                                value={field.value?.toString() || ''}
                                                                onValueChange={(value) => field.onChange(Number(value))}>
                                                                <SelectTrigger className={cn('w-full', error && 'border-red-500')}>
                                                                    <SelectValue placeholder='Select a class' />
                                                                </SelectTrigger>

                                                                <SelectContent>
                                                                    {filteredClasses.length > 0 ? (
                                                                        filteredClasses.map((classItem) => (
                                                                            <SelectItem
                                                                                key={classItem.asmcL_Id}
                                                                                value={classItem.asmcL_Id.toString()}>
                                                                                {classItem.asmcL_ClassName}
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <SelectItem value='0' disabled>
                                                                            No classes available
                                                                        </SelectItem>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                />

                                                {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                            </div>

                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_Section'>Section</Label>
                                                <Controller
                                                    name='pasR_Section'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => field.onChange(value)}
                                                            value={field.value?.toString() || ''}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select section' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='A'>A</SelectItem>
                                                                <SelectItem value='B'>B</SelectItem>
                                                                <SelectItem value='C'>C</SelectItem>
                                                                <SelectItem value='D'>D</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.pasR_Section && <FormError>{errors.pasR_Section.message}</FormError>}
                                            </div>

                                            <Controller
                                                name='amsT_Date'
                                                control={control}
                                                render={({ field, fieldState: { error } }) => (
                                                    <div className='flex flex-col space-y-2'>
                                                        <Label htmlFor='amsT_Date'>
                                                            Date of Admission <span className='ml-1 text-red-500'>*</span>
                                                        </Label>

                                                        <Popover
                                                            open={openPopover === 'amsT_Date'}
                                                            onOpenChange={(open) => setOpenPopover(open ? 'amsT_Date' : null)}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant={'outline'}
                                                                    className={cn(
                                                                        'w-full justify-start text-left font-normal',
                                                                        !field.value && 'text-muted-foreground',
                                                                        error && 'border-red-500'
                                                                    )}>
                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                    {field.value ? (
                                                                        format(field.value, 'dd/MM/yyyy')
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                <CalendarYear
                                                                    mode='single'
                                                                    selected={field.value}
                                                                    onSelect={(date: Date | undefined) => {
                                                                        if (date) {
                                                                            field.onChange(date);
                                                                            setOpenPopover(null);
                                                                        }
                                                                    }}
                                                                    disabled={(date: Date) =>
                                                                        date > new Date() || date < new Date('1900-01-01')
                                                                    }
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        {error && <span className='text-red-500 text-sm'>{error.message}</span>}
                                                    </div>
                                                )}
                                            />

                                            <Controller
                                                name='pasR_DOB'
                                                control={control}
                                                render={({ field, fieldState: { error } }) => (
                                                    <div className='flex flex-col space-y-2'>
                                                        <Label htmlFor='amsT_DOB'>
                                                            Date of Birth <span className='ml-1 text-red-500'>*</span>
                                                        </Label>
                                                        <Popover
                                                            open={openPopover === 'amsT_DOB'}
                                                            onOpenChange={(open) => setOpenPopover(open ? 'amsT_DOB' : null)}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant={'outline'}
                                                                    className={cn(
                                                                        'w-full justify-start text-left font-normal',
                                                                        !field.value && 'text-muted-foreground',
                                                                        error && 'border-red-500'
                                                                    )}>
                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                    {field.value ? (
                                                                        format(field.value, 'dd/MM/yyyy')
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                <CalendarYear
                                                                    mode='single'
                                                                    selected={field.value}
                                                                    onSelect={(date: Date | undefined) => {
                                                                        if (date) {
                                                                            field.onChange(date);
                                                                            handleDOBChange(date);
                                                                            setOpenPopover(null);
                                                                        }
                                                                    }}
                                                                    disabled={(date: Date) =>
                                                                        date > new Date() || date < new Date('1900-01-01')
                                                                    }
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        {error && <span className='text-red-500 text-sm'>{error.message}</span>}
                                                    </div>
                                                )}
                                            />

                                            {/* Date of Birth in Words - Auto-filled */}
                                            <InputText
                                                label='Date of Birth in Words'
                                                id='amsT_DOB_Words'
                                                placeholder='Date of birth in words'
                                                {...register('amsT_DOB_Words')}
                                                error={errors.amsT_DOB_Words?.message}
                                                disabled
                                            />

                                            {/* Age - Auto-calculated */}
                                            <InputText
                                                label='Age'
                                                id='pasR_Age'
                                                placeholder='Age'
                                                {...register('pasR_Age')}
                                                error={errors.pasR_Age?.message}
                                                disabled
                                            />

                                            <InputText
                                                label='Birth Place'
                                                id='amsT_BirthPlace'
                                                placeholder='Enter birth place'
                                                {...register('amsT_BirthPlace')}
                                                error={errors.amsT_BirthPlace?.message}
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
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString() || ''}>
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
                                                    Caste Category <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='caste_Id'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString() || ''}>
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
                                            <InputText
                                                label='Caste '
                                                required
                                                id='pasR_Caste'
                                                placeholder='Enter caste category'
                                                {...register('pasR_Caste')}
                                                error={errors.pasR_Caste?.message}
                                            />
                                            <InputText
                                                label='Sub Caste'
                                                id='pasR_SubCaste'
                                                placeholder='Enter sub caste'
                                                {...register('pasR_SubCaste')}
                                                error={errors.pasR_SubCaste?.message}
                                            />

                                            <InputText
                                                label='Birth Certificate No'
                                                id='amsT_BirthCertNO'
                                                placeholder='Enter birth certificate number'
                                                {...register('amsT_BirthCertNO')}
                                                error={errors.amsT_BirthCertNO?.message}
                                            />
                                            <InputText
                                                label='Caste Certificate No'
                                                id='amsT_StuCasteCertiNo"'
                                                placeholder='Enter caste certificate number'
                                                {...register('amsT_StuCasteCertiNo')}
                                                error={errors.amsT_StuCasteCertiNo?.message}
                                            />
                                            <InputText
                                                label='Biometric Id'
                                                id='amsT_BiometricId'
                                                placeholder='Enter biometric ID'
                                                {...register('amsT_BiometricId')}
                                                error={errors.amsT_BiometricId?.message}
                                            />
                                            <InputText
                                                label='RF Card No'
                                                id='amsT_RFCardNo'
                                                placeholder='Enter RF card number'
                                                {...register('amsT_RFCardNo')}
                                                error={errors.amsT_RFCardNo?.message}
                                            />

                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_Sex'>
                                                    Gender <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='pasR_Sex'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => field.onChange(value)}
                                                            value={field.value?.toString() || ''}>
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

                                            <InputText
                                                label='Mother Tongue'
                                                id='amsT_MotherTongue'
                                                placeholder='Enter mother tongue'
                                                {...register('amsT_MotherTongue')}
                                                error={errors.amsT_MotherTongue?.message}
                                            />
                                            <InputText
                                                label='Languages Spoken'
                                                id='pasR_Languagespeaking'
                                                placeholder='Enter languages'
                                                {...register('pasR_Languagespeaking')}
                                                error={errors.pasR_Languagespeaking?.message}
                                            />

                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_ConCountry'>
                                                    Country <span className='ml-1 text-red-500'>*</span>
                                                </Label>

                                                <Controller
                                                    name='pasR_ConCountry'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => field.onChange(value)}
                                                            value={field.value?.toString() || ''}>
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

                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_ConState'>State</Label>
                                                <Controller
                                                    name='pasR_ConState'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString() || ''}>
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

                                            <div className='flex flex-col gap-1.5 '>
                                                <Controller
                                                    name='pasR_MobileNo'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label htmlFor='pasR_MobileNo'>Mobile No.</Label>
                                                            <PhoneInput
                                                                country='in'
                                                                value={
                                                                    phoneValues.pasR_MobileNo ??
                                                                    (field.value != null ? String(field.value) : null)
                                                                }
                                                                onChange={(phone: any, countryData: any) =>
                                                                    handlePhoneChange(phone, countryData, 'pasR_MobileNo')
                                                                }
                                                                onBlur={() => trigger('pasR_MobileNo')}
                                                                inputProps={{
                                                                    id: 'pasR_MobileNo',
                                                                    name: 'pasR_MobileNo',
                                                                    maxLength: 25,
                                                                    required: false,
                                                                    style: {
                                                                        width: '87%',
                                                                        height: '36px',
                                                                        marginLeft: '40px',
                                                                        boxSizing: 'border-box',
                                                                        borderRadius: '4px',
                                                                        padding: '16.5px 14px',
                                                                        fontSize: '16px'
                                                                    }
                                                                }}
                                                                containerClass='w-full'
                                                                inputClass='w-full px-4 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                                enableSearch
                                                                disableCountryCode={false}
                                                                enableLongNumbers={true}
                                                                isValid={true}
                                                                preserveOrder={['country', 'nationalNumber']}
                                                            />
                                                            {phoneExpectedInfo.pasR_MobileNo?.expected && (
                                                                <span className='mt-1 text-muted-foreground text-xs'>
                                                                    {`Mobile number must be exactly ${phoneExpectedInfo.pasR_MobileNo.expected} digits for ${
                                                                        phoneExpectedInfo.pasR_MobileNo.name ?? 'selected country'
                                                                    }`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                                {errors.pasR_MobileNo && <FormError>{errors.pasR_MobileNo.message}</FormError>}
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

                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_TransportReqdFlag'>
                                                    Blood Group
                                                    {/* <span className='ml-1 text-red-500'>*</span> */}
                                                </Label>
                                                <Controller
                                                    name='pasR_TransportReqdFlag'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString() || ''}>
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

                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_TransportReqdFlag'>
                                                    Student Category <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='pasR_TransportReqdFlag'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString() || ''}>
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

                                            <div className='col-span-full'>
                                                <div className='flex items-center gap-6'>
                                                    <div className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='pasR_ECSFlag'
                                                            checked={Number(watch('pasR_ECSFlag')) === 1}
                                                            onCheckedChange={(checked) => {
                                                                const val = checked ? 1 : 0;
                                                                setValue('pasR_ECSFlag', val);
                                                            }}
                                                        />
                                                        <Label htmlFor='pasR_ECSFlag' className='cursor-pointer'>
                                                            ECS
                                                        </Label>
                                                    </div>

                                                    <div className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='pasR_EMISFlag'
                                                            checked={Number(watch('pasR_EMISFlag')) === 1}
                                                            onCheckedChange={(checked) => {
                                                                const val = checked ? 1 : 0;
                                                                setValue('pasR_EMISFlag', val);
                                                            }}
                                                        />
                                                        <Label htmlFor='pasR_EMISFlag' className='cursor-pointer'>
                                                            EMIS/BPL Card/STS No.
                                                        </Label>
                                                    </div>
                                                </div>

                                                {/* EMIS input when checked */}
                                                {Number(watch('pasR_EMISFlag')) === 1 && (
                                                    <div className='mt-3 w-1/2'>
                                                        <InputText
                                                            label='EMIS / BPL / STS No.'
                                                            required
                                                            id='pasR_EMISCardNo'
                                                            placeholder='Enter card or STS no.'
                                                            {...register('pasR_EMISCardNo')}
                                                            error={errors.pasR_EMISCardNo?.message}
                                                        />
                                                    </div>
                                                )}

                                                {/* ECS details panel */}
                                                {Number(watch('pasR_ECSFlag')) === 1 && (
                                                    <div className='mt-4 rounded border border-gray-200 bg-white p-4 shadow-sm'>
                                                        <div className='flex items-center justify-between border-b pb-2'>
                                                            <h4 className='font-semibold'>ECS STUDENT DETAILS</h4>
                                                            <Button size='sm' variant='ghost' onClick={() => setValue('pasR_ECSFlag', 0)}>
                                                                Close
                                                            </Button>
                                                        </div>

                                                        <div className='mt-3 grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                            <InputText
                                                                label='Account No.'
                                                                required
                                                                id='pasR_ECSBankAccountNo'
                                                                placeholder='Account number'
                                                                {...register('pasR_ECSBankAccountNo')}
                                                                error={errors.pasR_ECSBankAccountNo?.message}
                                                            />

                                                            <InputText
                                                                label='Account Holder Name'
                                                                required
                                                                id='pasR_ECSBankAccountHolderName'
                                                                placeholder='Account holder name'
                                                                {...register('pasR_ECSBankAccountHolderName')}
                                                                error={errors.pasR_ECSBankAccountHolderName?.message}
                                                            />

                                                            <InputText
                                                                label='Bank Name'
                                                                required
                                                                id='pasR_ECSBankName'
                                                                placeholder='Bank name'
                                                                {...register('pasR_ECSBankName')}
                                                                error={errors.pasR_ECSBankName?.message}
                                                            />

                                                            <InputText
                                                                label='Account Type'
                                                                required
                                                                id='pasR_ECSAccountType'
                                                                placeholder='Savings / Current'
                                                                {...register('pasR_ECSAccountType')}
                                                                error={errors.pasR_ECSAccountType?.message}
                                                            />

                                                            <InputText
                                                                label='MICR Code'
                                                                required
                                                                id='pasR_ECSMICRCode'
                                                                placeholder='MICR'
                                                                {...register('pasR_ECSMICRCode')}
                                                                error={errors.pasR_ECSMICRCode?.message}
                                                            />

                                                            <InputText
                                                                label='Branch Name'
                                                                required
                                                                id='pasR_ECSBranchName'
                                                                placeholder='Branch name'
                                                                {...register('pasR_ECSBranchName')}
                                                                error={errors.pasR_ECSBranchName?.message}
                                                            />
                                                        </div>

                                                        <div className='mt-4 flex justify-end'>
                                                            <Button onClick={() => setValue('pasR_ECSFlag', 0)} className='ml-2'>
                                                                ADD & CLOSE
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <InputText
                                                label='Bank Name'
                                                id='pasR_BankName'
                                                placeholder='Bank name'
                                                {...register('pasR_BankName')}
                                                error={errors.pasR_BankName?.message}
                                            />
                                            <InputText
                                                label='Branch Name'
                                                id='pasR_BranchName'
                                                placeholder='Branch name'
                                                {...register('pasR_BranchName')}
                                                error={errors.pasR_BranchName?.message}
                                            />
                                            <InputText
                                                label='Bank Account No.'
                                                id='pasR_BankAccountNo'
                                                placeholder='Bank Account Number'
                                                {...register('pasR_BankAccountNo')}
                                                error={errors.pasR_BankAccountNo?.message}
                                            />
                                            <InputText
                                                label='Bank IFSC Code.'
                                                id='pasR_BankAccountNo'
                                                placeholder='Bank IFSC Code'
                                                {...register('pasR_BankAccountNo')}
                                                error={errors.pasR_BankAccountNo?.message}
                                            />

                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='pasR_FeeConcessionType'>
                                                    Fee Concession Type <span className='ml-1 text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='pasR_FeeConcessionType'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => field.onChange(value)}
                                                            value={field.value?.toString() || ''}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select fee concession type' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='General'>General</SelectItem>
                                                                <SelectItem value='Prestigious'>Prestigious</SelectItem>
                                                                <SelectItem value='RTE'>RTE</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.pasR_FeeConcessionType && (
                                                    <FormError>{errors.pasR_FeeConcessionType.message}</FormError>
                                                )}
                                            </div>

                                            {/* Student TPIN */}
                                            <InputText
                                                label='Student TPIN'
                                                id='pasR_StudentTPIN'
                                                placeholder='Enter student TPIN'
                                                {...register('pasR_StudentTPIN')}
                                                error={errors.pasR_StudentTPIN?.message}
                                            />

                                            {/* GPS Tracing Id */}
                                            <InputText
                                                label='GPS Tracing Id'
                                                id='pasR_GPSTracingId'
                                                placeholder='Enter GPS tracing ID'
                                                {...register('pasR_GPSTracingId')}
                                                error={errors.pasR_GPSTracingId?.message}
                                            />

                                            {/* Medium Of Instruction */}
                                            <InputText
                                                label='Medium Of Instruction'
                                                id='pasR_MediumOfInstruction'
                                                placeholder='Enter medium of instruction'
                                                {...register('pasR_MediumOfInstruction')}
                                                error={errors.pasR_MediumOfInstruction?.message}
                                            />
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
                                                                    key={field.value || 'empty'}
                                                                    onValueChange={(value) => field.onChange(value)}
                                                                    value={field.value?.toString() || ''}>
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
                                                                    key={field.value || 'empty'}
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value?.toString() || ''}>
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
                                                            rules={
                                                                conZipLength
                                                                    ? {
                                                                          minLength: {
                                                                              value: conZipLength,
                                                                              message: `Pin code must be ${conZipLength} digits`
                                                                          },
                                                                          maxLength: {
                                                                              value: conZipLength,
                                                                              message: `Pin code must be ${conZipLength} digits`
                                                                          }
                                                                      }
                                                                    : undefined
                                                            }
                                                            render={({ field }) => (
                                                                <>
                                                                    <MobileNumberInput
                                                                        label='Pin Code/Zip Code'
                                                                        id='pasR_ConPincode'
                                                                        value={field.value}
                                                                        onChange={(valueOrEvent: any) => {
                                                                            // MobileNumberInput forwards the input event; accept either event or string
                                                                            const raw = valueOrEvent?.target?.value ?? valueOrEvent;
                                                                            const str = raw == null ? '' : String(raw).replace(/\D/g, '');
                                                                            const truncated = conZipLength
                                                                                ? str.slice(0, conZipLength)
                                                                                : str;
                                                                            field.onChange(truncated);
                                                                            // Set/clear a manual validation error so message appears immediately
                                                                            if (
                                                                                conZipLength &&
                                                                                truncated !== '' &&
                                                                                String(truncated).length !== conZipLength
                                                                            ) {
                                                                                setError('pasR_ConPincode', {
                                                                                    type: 'manual',
                                                                                    message: `Pin code must be ${conZipLength} digits`
                                                                                });
                                                                            } else {
                                                                                clearErrors('pasR_ConPincode');
                                                                            }
                                                                            // Also trigger the resolver-based validation
                                                                            trigger('pasR_ConPincode');
                                                                        }}
                                                                        minLength={conZipLength}
                                                                        maxLength={conZipLength}
                                                                        type='number'
                                                                        showSpinner={false}
                                                                    />
                                                                    {conCountryObj && conZipLength && (
                                                                        <span className='mt-1 text-muted-foreground text-xs'>
                                                                            {` Pin code must be ${conZipLength} digits for ${conCountryObj.ivrmmC_CountryName}`}
                                                                        </span>
                                                                    )}
                                                                </>
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
                                                                    key={field.value || 'empty'}
                                                                    onValueChange={(value) => field.onChange(value)}
                                                                    value={field.value?.toString() || ''}
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
                                                                    key={field.value || 'empty'}
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value?.toString() || ''}
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
                                                            rules={
                                                                perZipLength
                                                                    ? {
                                                                          minLength: {
                                                                              value: perZipLength,
                                                                              message: `Pin code must be ${perZipLength} digits`
                                                                          },
                                                                          maxLength: {
                                                                              value: perZipLength,
                                                                              message: `Pin code must be ${perZipLength} digits`
                                                                          }
                                                                      }
                                                                    : undefined
                                                            }
                                                            render={({ field }) => (
                                                                <>
                                                                    <MobileNumberInput
                                                                        label='Pin Code/Zip Code'
                                                                        id='pasR_PerPincode'
                                                                        value={field.value}
                                                                        onChange={(valueOrEvent: any) => {
                                                                            const raw = valueOrEvent?.target?.value ?? valueOrEvent;
                                                                            const str = raw == null ? '' : String(raw).replace(/\D/g, '');
                                                                            const truncated = perZipLength
                                                                                ? str.slice(0, perZipLength)
                                                                                : str;
                                                                            field.onChange(truncated);
                                                                            // Set/clear a manual validation error so message appears immediately
                                                                            if (
                                                                                perZipLength &&
                                                                                truncated !== '' &&
                                                                                String(truncated).length !== perZipLength
                                                                            ) {
                                                                                setError('pasR_PerPincode', {
                                                                                    type: 'manual',
                                                                                    message: `Pin code must be ${perZipLength} digits`
                                                                                });
                                                                            } else {
                                                                                clearErrors('pasR_PerPincode');
                                                                            }
                                                                            // Also trigger the resolver-based validation
                                                                            trigger('pasR_PerPincode');
                                                                        }}
                                                                        minLength={perZipLength}
                                                                        maxLength={perZipLength}
                                                                        type='number'
                                                                        showSpinner={false}
                                                                        disabled={sameAsResidential}
                                                                    />
                                                                    {perCountryObj && perZipLength && (
                                                                        <span className='mt-1 text-muted-foreground text-xs'>
                                                                            {`Pin code must be ${perZipLength} digits for ${perCountryObj.ivrmmC_CountryName}`}
                                                                        </span>
                                                                    )}
                                                                </>
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
                                                    {/* Father Photo Upload - Mandatory */}
                                                    <div className='col-span-full w-fit'>
                                                        <div className='rounded-lg border-2 border-blue-200 bg-blue-50 p-2'>
                                                            <div className='mb-1'>
                                                                <Label htmlFor='father_photo'>
                                                                    Father Photo <span className='ml-1 text-red-500'>*</span>
                                                                </Label>
                                                            </div>

                                                            {!fatherPhoto?.pasR_FatherPhoto ? (
                                                                <label
                                                                    htmlFor='father_photo'
                                                                    className={cn(
                                                                        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-2 py-3 text-center transition-all hover:border-primary hover:bg-white',
                                                                        fatherPhoto?.isUploading
                                                                            ? 'border-blue-400 bg-blue-100'
                                                                            : 'border-gray-300 bg-white'
                                                                    )}>
                                                                    {fatherPhoto?.isUploading ? (
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
                                                                                Upload recent passport-size photo (Max size: 5MB, Format:
                                                                                JPG, PNG)
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    <input
                                                                        id='father_photo'
                                                                        type='file'
                                                                        className='hidden'
                                                                        accept='image/jpeg,image/jpg,image/png'
                                                                        disabled={fatherPhoto?.isUploading || isSubmitting}
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                if (file.size > 5 * 1024 * 1024) {
                                                                                    toast.error('File size must be less than 5MB');
                                                                                    e.target.value = '';
                                                                                    return;
                                                                                }
                                                                                handleFatherPhotoUpload(file);
                                                                                e.target.value = '';
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            ) : (
                                                                <div className='flex w-fit flex-col items-start justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-4'>
                                                                    <div className='flex items-center gap-4'>
                                                                        <img
                                                                            src={fatherPhoto.pasR_FatherPhoto}
                                                                            alt='Father'
                                                                            className='h-20 w-20 rounded-lg border-2 border-green-300 object-cover'
                                                                        />
                                                                        <div>
                                                                            <div className='flex items-center gap-2 font-medium text-green-700'>
                                                                                <Check className='h-5 w-5' />
                                                                                Uploaded Successfully
                                                                            </div>
                                                                            <p className='mt-1 text-green-600 text-sm'>
                                                                                Father photo is ready
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex gap-2'>
                                                                        <Button
                                                                            type='button'
                                                                            variant='outline'
                                                                            size='sm'
                                                                            onClick={() =>
                                                                                window.open(fatherPhoto.pasR_FatherPhoto, '_blank')
                                                                            }>
                                                                            <Eye className='h-4 w-4' />
                                                                        </Button>
                                                                        <Button
                                                                            type='button'
                                                                            variant='destructive'
                                                                            size='sm'
                                                                            disabled={isSubmitting}
                                                                            onClick={handleFatherPhotoDelete}>
                                                                            <Trash className='h-4 w-4' />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {fatherPhotoError && (
                                                                <div className='mt-3 rounded-md border border-red-200 bg-red-50 p-3'>
                                                                    <p className='flex items-start gap-2 font-medium text-red-700 text-sm'>
                                                                        <span className='mt-0.5 text-red-500'>⚠</span>
                                                                        <span>{fatherPhotoError}</span>
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
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
                                                        label='Aadhaar No.'
                                                        id='pasR_FatherAadhaar_No'
                                                        placeholder='Enter surname'
                                                        {...register('pasR_FatherAadhaar_No')}
                                                        error={errors.pasR_FatherAadhaar_No?.message}
                                                    />
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label htmlFor='asmcL_Id'>
                                                            Marital Status <span className='ml-1 text-red-500'>*</span>
                                                        </Label>
                                                        <Controller
                                                            name='asmcL_Id'
                                                            control={control}
                                                            render={({ field, fieldState: { error } }) => (
                                                                <div className='flex flex-col space-y-2'>
                                                                    <Select
                                                                        value={field.value?.toString() || ''}
                                                                        onValueChange={(value) => field.onChange(Number(value))}>
                                                                        <SelectTrigger className={cn('w-full', error && 'border-red-500')}>
                                                                            <SelectValue placeholder='Select ' />
                                                                        </SelectTrigger>

                                                                        <SelectContent>
                                                                            {filteredClasses.length > 0 ? (
                                                                                filteredClasses.map((classItem) => (
                                                                                    <SelectItem
                                                                                        key={classItem.asmcL_Id}
                                                                                        value={classItem.asmcL_Id.toString()}>
                                                                                        {classItem.asmcL_ClassName}
                                                                                    </SelectItem>
                                                                                ))
                                                                            ) : (
                                                                                <SelectItem value='0' disabled>
                                                                                    No classes available
                                                                                </SelectItem>
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}
                                                        />

                                                        {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                                    </div>

                                                    <div className='flex flex-col gap-1.5 '>
                                                        <Controller
                                                            name='pasR_FatherMobleNo'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <div>
                                                                    <Label htmlFor='pasR_FatherMobleNo'>Mobile No.</Label>
                                                                    <PhoneInput
                                                                        country='in'
                                                                        value={
                                                                            phoneValues.pasR_FatherMobleNo ??
                                                                            (field.value != null ? String(field.value) : null)
                                                                        }
                                                                        onChange={(phone: any, countryData: any) =>
                                                                            handlePhoneChange(phone, countryData, 'pasR_FatherMobleNo')
                                                                        }
                                                                        onBlur={() => trigger('pasR_FatherMobleNo')}
                                                                        inputProps={{
                                                                            id: 'pasR_FatherMobleNo',
                                                                            name: 'pasR_FatherMobleNo',
                                                                            maxLength: 25,
                                                                            required: false,
                                                                            style: {
                                                                                width: '87%',
                                                                                height: '36px',
                                                                                marginLeft: '40px',
                                                                                boxSizing: 'border-box',
                                                                                borderRadius: '4px',
                                                                                padding: '16.5px 14px',
                                                                                fontSize: '16px'
                                                                            }
                                                                        }}
                                                                        containerClass='w-full'
                                                                        inputClass='w-full px-4 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                                        enableSearch
                                                                        disableCountryCode={false}
                                                                        enableLongNumbers={true}
                                                                        isValid={true}
                                                                        preserveOrder={['country', 'nationalNumber']}
                                                                    />
                                                                    {phoneExpectedInfo.pasR_FatherMobleNo?.expected && (
                                                                        <span className='mt-1 text-muted-foreground text-xs'>
                                                                            {`Mobile number must be exactly ${phoneExpectedInfo.pasR_FatherMobleNo.expected} digits for ${
                                                                                phoneExpectedInfo.pasR_FatherMobleNo.name ??
                                                                                'selected country'
                                                                            }`}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        />
                                                        {errors.pasR_FatherMobleNo && (
                                                            <FormError>{errors.pasR_FatherMobleNo.message}</FormError>
                                                        )}
                                                    </div>

                                                    <InputText
                                                        label='Email-ID'
                                                        id='pasR_FatherEmail_ID'
                                                        placeholder='Enter Email-ID'
                                                        {...register('pasR_FatherEmail_ID')}
                                                        error={errors.pasR_FatherEmail_ID?.message}
                                                    />

                                                    <InputText
                                                        label='Home Phone No'
                                                        id='pasR_FatherHome_Phone_No'
                                                        placeholder='Enter Home Phone No'
                                                        {...register('pasR_FatherHome_Phone_No')}
                                                        error={errors.pasR_FatherHome_Phone_No?.message}
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
                                                                    key={field.value || 'empty'}
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value?.toString() || ''}>
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

                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Education Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <InputText
                                                                label='Qualification'
                                                                id='pasR_qualification'
                                                                placeholder='Enter qualification'
                                                                {...register('pasR_qualification')}
                                                                error={errors.pasR_qualification?.message}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Present Address Details */}
                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Present Address Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <InputText
                                                                label='Address'
                                                                id='pasR_FatherAddress'
                                                                placeholder='Enter Address'
                                                                {...register('pasR_FatherAddress')}
                                                                error={errors.pasR_FatherAddress?.message}
                                                            />

                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='pasR_FatherCountry'>Country</Label>
                                                                <Controller
                                                                    name='pasR_FatherCountry'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(value)}
                                                                            value={field.value?.toString() || ''}
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
                                                                {errors.pasR_PerCountry && (
                                                                    <FormError>{errors.pasR_PerCountry.message}</FormError>
                                                                )}
                                                            </div>
                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='pasR_FatherState'>State</Label>
                                                                <Controller
                                                                    name='pasR_FatherState'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                                            value={field.value?.toString() || ''}
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
                                                                {errors.pasR_PerState && (
                                                                    <FormError>{errors.pasR_PerState.message}</FormError>
                                                                )}
                                                            </div>
                                                            <InputText
                                                                label='City'
                                                                id='pasR_FatherCity'
                                                                placeholder='Enter city'
                                                                {...register('pasR_FatherCity')}
                                                                error={errors.pasR_PerCity?.message}
                                                                disabled={sameAsResidential}
                                                            />
                                                            <div className='flex flex-col gap-1.5'>
                                                                <Controller
                                                                    name='pasR_FatherPincode'
                                                                    control={control}
                                                                    rules={
                                                                        perZipLength
                                                                            ? {
                                                                                  minLength: {
                                                                                      value: perZipLength,
                                                                                      message: `Pin code must be ${perZipLength} digits`
                                                                                  },
                                                                                  maxLength: {
                                                                                      value: perZipLength,
                                                                                      message: `Pin code must be ${perZipLength} digits`
                                                                                  }
                                                                              }
                                                                            : undefined
                                                                    }
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <MobileNumberInput
                                                                                label='Pin Code'
                                                                                id='pasR_FatherPincode'
                                                                                value={field.value}
                                                                                onChange={(valueOrEvent: any) => {
                                                                                    const raw = valueOrEvent?.target?.value ?? valueOrEvent;
                                                                                    const str =
                                                                                        raw == null ? '' : String(raw).replace(/\D/g, '');
                                                                                    const truncated = perZipLength
                                                                                        ? str.slice(0, perZipLength)
                                                                                        : str;
                                                                                    field.onChange(truncated);
                                                                                    // Set/clear a manual validation error so message appears immediately
                                                                                    if (
                                                                                        perZipLength &&
                                                                                        truncated !== '' &&
                                                                                        String(truncated).length !== perZipLength
                                                                                    ) {
                                                                                        setError('pasR_FatherPincode', {
                                                                                            type: 'manual',
                                                                                            message: `Pin code must be ${perZipLength} digits`
                                                                                        });
                                                                                    } else {
                                                                                        clearErrors('pasR_FatherPincode');
                                                                                    }
                                                                                    // Also trigger the resolver-based validation
                                                                                    trigger('pasR_FatherPincode');
                                                                                }}
                                                                                minLength={perZipLength}
                                                                                maxLength={perZipLength}
                                                                                type='number'
                                                                                showSpinner={false}
                                                                                disabled={sameAsResidential}
                                                                            />
                                                                            {perCountryObj && perZipLength && (
                                                                                <span className='mt-1 text-muted-foreground text-xs'>
                                                                                    {`Pin code must be ${perZipLength} digits for ${perCountryObj.ivrmmC_CountryName}`}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                />
                                                                {errors.pasR_PerPincode && (
                                                                    <FormError>{errors.pasR_PerPincode.message}</FormError>
                                                                )}
                                                            </div>

                                                            <InputText
                                                                label='PO'
                                                                id='pasR_FatherPO'
                                                                placeholder='Enter PO'
                                                                {...register('pasR_FatherPO')}
                                                                error={errors.pasR_FatherPO?.message}
                                                            />
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
                                                    {/* Permanent Address Details */}
                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Permanent Address Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <InputText
                                                                label=' Permanent Address'
                                                                id='pasR_FatherPermanentAddress'
                                                                placeholder='Enter Permanent Address'
                                                                {...register('pasR_FatherPermanentAddress')}
                                                                error={errors.pasR_FatherPermanentAddress?.message}
                                                            />

                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='pasR_FatherPermanentCountry'>Permanent Country</Label>
                                                                <Controller
                                                                    name='pasR_FatherPermanentCountry'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(value)}
                                                                            value={field.value?.toString() || ''}
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
                                                                {errors.pasR_PerCountry && (
                                                                    <FormError>{errors.pasR_PerCountry.message}</FormError>
                                                                )}
                                                            </div>
                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='pasR_FatherPermanentState'> Permanent State</Label>
                                                                <Controller
                                                                    name='pasR_FatherPermanentState'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                                            value={field.value?.toString() || ''}
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
                                                                {errors.pasR_PerState && (
                                                                    <FormError>{errors.pasR_PerState.message}</FormError>
                                                                )}
                                                            </div>
                                                            <InputText
                                                                label=' Permanent City'
                                                                id='pasR_FatherPermanentCity'
                                                                placeholder='Enter city'
                                                                {...register('pasR_FatherPermanentCity')}
                                                                error={errors.pasR_FatherPermanentCity?.message}
                                                                disabled={sameAsResidential}
                                                            />
                                                            <div className='flex flex-col gap-1.5'>
                                                                <Controller
                                                                    name='pasR_FatherPermanentPincode'
                                                                    control={control}
                                                                    rules={
                                                                        perZipLength
                                                                            ? {
                                                                                  minLength: {
                                                                                      value: perZipLength,
                                                                                      message: `Pin code must be ${perZipLength} digits`
                                                                                  },
                                                                                  maxLength: {
                                                                                      value: perZipLength,
                                                                                      message: `Pin code must be ${perZipLength} digits`
                                                                                  }
                                                                              }
                                                                            : undefined
                                                                    }
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <MobileNumberInput
                                                                                label='Permanent Pin Code'
                                                                                id='pasR_FatherPermanentPincode'
                                                                                value={field.value}
                                                                                onChange={(valueOrEvent: any) => {
                                                                                    const raw = valueOrEvent?.target?.value ?? valueOrEvent;
                                                                                    const str =
                                                                                        raw == null ? '' : String(raw).replace(/\D/g, '');
                                                                                    const truncated = perZipLength
                                                                                        ? str.slice(0, perZipLength)
                                                                                        : str;
                                                                                    field.onChange(truncated);
                                                                                    // Set/clear a manual validation error so message appears immediately
                                                                                    if (
                                                                                        perZipLength &&
                                                                                        truncated !== '' &&
                                                                                        String(truncated).length !== perZipLength
                                                                                    ) {
                                                                                        setError('pasR_FatherPermanentPincode', {
                                                                                            type: 'manual',
                                                                                            message: `Pin code must be ${perZipLength} digits`
                                                                                        });
                                                                                    } else {
                                                                                        clearErrors('pasR_FatherPermanentPincode');
                                                                                    }
                                                                                    // Also trigger the resolver-based validation
                                                                                    trigger('pasR_FatherPermanentPincode');
                                                                                }}
                                                                                minLength={perZipLength}
                                                                                maxLength={perZipLength}
                                                                                type='number'
                                                                                showSpinner={false}
                                                                                disabled={sameAsResidential}
                                                                            />
                                                                            {perCountryObj && perZipLength && (
                                                                                <span className='mt-1 text-muted-foreground text-xs'>
                                                                                    {`Pin code must be ${perZipLength} digits for ${perCountryObj.ivrmmC_CountryName}`}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                />
                                                                {errors.pasR_PerPincode && (
                                                                    <FormError>{errors.pasR_PerPincode.message}</FormError>
                                                                )}
                                                            </div>

                                                            <InputText
                                                                label='Permanent PS'
                                                                id='pasR_FatherPermanent_PS'
                                                                placeholder='Enter Permanent PS'
                                                                {...register('pasR_FatherPermanent_PS')}
                                                                error={errors.pasR_FatherPermanent_PS?.message}
                                                            />

                                                            <InputText
                                                                label='Permanent PO'
                                                                id='pasR_FatherPermanent_PO'
                                                                placeholder='Enter Permanent PO'
                                                                {...register('pasR_FatherPermanent_PO')}
                                                                error={errors.pasR_FatherPermanent_PO?.message}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Office Details */}
                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Office Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <InputText
                                                                label='Office Address'
                                                                id='pasR_FatherOfficeAddress'
                                                                placeholder='Enter office address'
                                                                {...register('pasR_FatherOfficeAddress')}
                                                                error={errors.pasR_FatherOfficeAddress?.message}
                                                            />

                                                            <div className='flex flex-col gap-1.5 '>
                                                                <Controller
                                                                    name='pasR_FatherOffice_PhNo'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <div>
                                                                            <Label htmlFor='pasR_FatherOffice_PhNo'>
                                                                                Father Office Phone No.
                                                                            </Label>
                                                                            <PhoneInput
                                                                                country='in'
                                                                                value={
                                                                                    phoneValues.pasR_FatherOffice_PhNo ??
                                                                                    (field.value != null ? String(field.value) : null)
                                                                                }
                                                                                onChange={(phone: any, countryData: any) =>
                                                                                    handlePhoneChange(
                                                                                        phone,
                                                                                        countryData,
                                                                                        'pasR_FatherOffice_PhNo'
                                                                                    )
                                                                                }
                                                                                onBlur={() => trigger('pasR_FatherOffice_PhNo')}
                                                                                inputProps={{
                                                                                    id: 'pasR_FatherOffice_PhNo',
                                                                                    name: 'pasR_FatherOffice_PhNo',
                                                                                    maxLength: 25,
                                                                                    required: false,
                                                                                    style: {
                                                                                        width: '87%',
                                                                                        height: '36px',
                                                                                        marginLeft: '40px',
                                                                                        boxSizing: 'border-box',
                                                                                        borderRadius: '4px',
                                                                                        padding: '16.5px 14px',
                                                                                        fontSize: '16px'
                                                                                    }
                                                                                }}
                                                                                containerClass='w-full'
                                                                                inputClass='w-full px-4 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                                                enableSearch
                                                                                disableCountryCode={false}
                                                                                enableLongNumbers={true}
                                                                                isValid={true}
                                                                                preserveOrder={['country', 'nationalNumber']}
                                                                            />
                                                                            {phoneExpectedInfo.pasR_FatherOffice_PhNo?.expected && (
                                                                                <span className='mt-1 text-muted-foreground text-xs'>
                                                                                    {`Mobile number must be exactly ${phoneExpectedInfo.pasR_FatherOffice_PhNo.expected} digits for ${
                                                                                        phoneExpectedInfo.pasR_FatherOffice_PhNo.name ??
                                                                                        'selected country'
                                                                                    }`}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                />
                                                                {errors.pasR_FatherOffice_PhNo && (
                                                                    <FormError>{errors.pasR_FatherOffice_PhNo.message}</FormError>
                                                                )}
                                                            </div>

                                                            <InputText
                                                                label='Occupation'
                                                                id='pasR_FatherOccupation'
                                                                placeholder='Enter Occupation'
                                                                {...register('pasR_FatherOccupation')}
                                                                error={errors.pasR_FatherOccupation?.message}
                                                            />

                                                            <InputText
                                                                label='Designation'
                                                                id='pasR_FatherDesignation'
                                                                placeholder='Enter designation'
                                                                {...register('pasR_FatherDesignation')}
                                                                error={errors.pasR_FatherDesignation?.message}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Other's Details */}
                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Other's Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='religion_Id'>
                                                                    Religion <span className='ml-1 text-red-500'>*</span>
                                                                </Label>
                                                                <Controller
                                                                    name='religion_Id'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                                            value={field.value?.toString() || ''}>
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
                                                                                        <SelectItem
                                                                                            key={item.ivrmmR_Id}
                                                                                            value={item.ivrmmR_Id.toString()}>
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
                                                                    Caste Category <span className='ml-1 text-red-500'>*</span>
                                                                </Label>
                                                                <Controller
                                                                    name='caste_Id'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                                            value={field.value?.toString() || ''}>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder='Select caste Category' />
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
                                                                                        <SelectItem
                                                                                            key={item.imC_Id}
                                                                                            value={item.imC_Id.toString()}>
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
                                                            <InputText
                                                                label='Caste '
                                                                required
                                                                id='pasR_FatherCaste'
                                                                placeholder='Enter caste'
                                                                {...register('pasR_FatherCaste')}
                                                                error={errors.pasR_FatherCasteCategory?.message}
                                                            />
                                                            <InputText
                                                                label='Sub Caste'
                                                                id='pasR_FatherSubCaste'
                                                                placeholder='Enter sub caste'
                                                                {...register('pasR_FatherSubCaste')}
                                                                error={errors.pasR_FatherSubCaste?.message}
                                                            />

                                                            <div className='flex flex-col gap-1.5'>
                                                                <Controller
                                                                    name='pasR_FatherIncome'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <InputNumber
                                                                            label='Father Income'
                                                                            id='pasR_FatherIncome'
                                                                            value={field.value || 0}
                                                                            onChange={(value) =>
                                                                                field.onChange(Number.isNaN(value) ? 0 : value)
                                                                            }
                                                                            minValue={0}
                                                                            maxDigits={15}
                                                                        />
                                                                    )}
                                                                />
                                                                {errors.pasR_FatherIncome && (
                                                                    <FormError>{errors.pasR_FatherIncome.message}</FormError>
                                                                )}
                                                            </div>

                                                            <InputText
                                                                label='Caste Certificate No'
                                                                id='pasR_FatherCaste_Certificate_No'
                                                                placeholder='Enter Caste Certificate No '
                                                                {...register('pasR_FatherCaste_Certificate_No')}
                                                                error={errors.pasR_FatherCaste_Certificate_No?.message}
                                                            />

                                                            <InputText
                                                                label='Pan No'
                                                                id='pasR_FatherPanno'
                                                                placeholder='Enter PAN'
                                                                {...register('pasR_FatherPanno')}
                                                                error={errors.pasR_FatherPanno?.message}
                                                            />
                                                            <div className='flex items-center space-x-2'>
                                                                <Checkbox
                                                                    id='amsT_VaccinatedFlg'
                                                                    checked={Boolean(watch('amsT_VaccinatedFlg'))}
                                                                    onCheckedChange={(checked) => {
                                                                        setValue('amsT_VaccinatedFlg', checked === true);
                                                                    }}
                                                                />
                                                                <Label htmlFor='amsT_VaccinatedFlg' className='cursor-pointer'>
                                                                    Self Employed Flg
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mother Details           */}
                                            <div className='space-y-4'>
                                                <h3 className='font-semibold text-gray-800 text-lg'>Mother Details</h3>
                                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                    {/* Mother Photo Upload - Mandatory */}
                                                    <div className='col-span-full w-fit'>
                                                        <div className='rounded-lg border-2 border-blue-200 bg-blue-50 p-2'>
                                                            <div className='mb-1'>
                                                                <Label htmlFor='mother_photo'>
                                                                    Mother Photo <span className='ml-1 text-red-500'>*</span>
                                                                </Label>
                                                            </div>

                                                            {!motherPhoto?.pasR_MotherPhoto ? (
                                                                <label
                                                                    htmlFor='mother_photo'
                                                                    className={cn(
                                                                        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-2 py-3 text-center transition-all hover:border-primary hover:bg-white',
                                                                        motherPhoto?.isUploading
                                                                            ? 'border-blue-400 bg-blue-100'
                                                                            : 'border-gray-300 bg-white'
                                                                    )}>
                                                                    {motherPhoto?.isUploading ? (
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
                                                                                Upload recent passport-size photo (Max size: 5MB, Format:
                                                                                JPG, PNG)
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    <input
                                                                        id='mother_photo'
                                                                        type='file'
                                                                        className='hidden'
                                                                        accept='image/jpeg,image/jpg,image/png'
                                                                        disabled={motherPhoto?.isUploading || isSubmitting}
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                if (file.size > 5 * 1024 * 1024) {
                                                                                    toast.error('File size must be less than 5MB');
                                                                                    e.target.value = '';
                                                                                    return;
                                                                                }
                                                                                handleMotherPhotoUpload(file);
                                                                                e.target.value = '';
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            ) : (
                                                                <div className='flex w-fit flex-col items-start justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-4'>
                                                                    <div className='flex items-center gap-4'>
                                                                        <img
                                                                            src={motherPhoto.pasR_MotherPhoto}
                                                                            alt='Mother'
                                                                            className='h-20 w-20 rounded-lg border-2 border-green-300 object-cover'
                                                                        />
                                                                        <div>
                                                                            <div className='flex items-center gap-2 font-medium text-green-700'>
                                                                                <Check className='h-5 w-5' />
                                                                                Uploaded Successfully
                                                                            </div>
                                                                            <p className='mt-1 text-green-600 text-sm'>
                                                                                Mother photo is ready
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex gap-2'>
                                                                        <Button
                                                                            type='button'
                                                                            variant='outline'
                                                                            size='sm'
                                                                            onClick={() =>
                                                                                window.open(motherPhoto.pasR_MotherPhoto, '_blank')
                                                                            }>
                                                                            <Eye className='h-4 w-4' />
                                                                        </Button>
                                                                        <Button
                                                                            type='button'
                                                                            variant='destructive'
                                                                            size='sm'
                                                                            disabled={isSubmitting}
                                                                            onClick={handleMotherPhotoDelete}>
                                                                            <Trash className='h-4 w-4' />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {motherPhotoError && (
                                                                <div className='mt-3 rounded-md border border-red-200 bg-red-50 p-3'>
                                                                    <p className='flex items-start gap-2 font-medium text-red-700 text-sm'>
                                                                        <span className='mt-0.5 text-red-500'>⚠</span>
                                                                        <span>{motherPhotoError}</span>
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
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
                                                        label='Aadhaar No.'
                                                        id='pasR_MotherAadhaar_No'
                                                        placeholder='Enter Aadhaar No'
                                                        {...register('pasR_MotherAadhaar_No')}
                                                        error={errors.pasR_MotherAadhaar_No?.message}
                                                    />

                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label htmlFor='asmcL_Id'>
                                                            Marital Status <span className='ml-1 text-red-500'>*</span>
                                                        </Label>
                                                        <Controller
                                                            name='asmcL_Id'
                                                            control={control}
                                                            render={({ field, fieldState: { error } }) => (
                                                                <div className='flex flex-col space-y-2'>
                                                                    <Select
                                                                        value={field.value?.toString() || ''}
                                                                        onValueChange={(value) => field.onChange(Number(value))}>
                                                                        <SelectTrigger className={cn('w-full', error && 'border-red-500')}>
                                                                            <SelectValue placeholder='Select ' />
                                                                        </SelectTrigger>

                                                                        <SelectContent>
                                                                            {filteredClasses.length > 0 ? (
                                                                                filteredClasses.map((classItem) => (
                                                                                    <SelectItem
                                                                                        key={classItem.asmcL_Id}
                                                                                        value={classItem.asmcL_Id.toString()}>
                                                                                        {classItem.asmcL_ClassName}
                                                                                    </SelectItem>
                                                                                ))
                                                                            ) : (
                                                                                <SelectItem value='0' disabled>
                                                                                    No classes available
                                                                                </SelectItem>
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}
                                                        />

                                                        {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                                    </div>

                                                    <div className='flex flex-col gap-1.5 '>
                                                        <Controller
                                                            name='pasR_MotherMobleNo'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <div>
                                                                    <Label htmlFor='pasR_MotherMobleNo'>Mobile No.</Label>
                                                                    <PhoneInput
                                                                        country='in'
                                                                        value={
                                                                            phoneValues.pasR_MotherMobleNo ??
                                                                            (field.value != null ? String(field.value) : null)
                                                                        }
                                                                        onChange={(phone: any, countryData: any) =>
                                                                            handlePhoneChange(phone, countryData, 'pasR_MotherMobleNo')
                                                                        }
                                                                        onBlur={() => trigger('pasR_MotherMobleNo')}
                                                                        inputProps={{
                                                                            id: 'pasR_MotherMobleNo',
                                                                            name: 'pasR_MotherMobleNo',
                                                                            maxLength: 25,
                                                                            required: false,
                                                                            style: {
                                                                                width: '87%',
                                                                                height: '36px',
                                                                                marginLeft: '40px',
                                                                                boxSizing: 'border-box',
                                                                                borderRadius: '4px',
                                                                                padding: '16.5px 14px',
                                                                                fontSize: '16px'
                                                                            }
                                                                        }}
                                                                        containerClass='w-full'
                                                                        inputClass='w-full px-4 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                                        enableSearch
                                                                        disableCountryCode={false}
                                                                        enableLongNumbers={true}
                                                                        isValid={true}
                                                                        preserveOrder={['country', 'nationalNumber']}
                                                                    />
                                                                    {phoneExpectedInfo.pasR_MotherMobleNo?.expected && (
                                                                        <span className='mt-1 text-muted-foreground text-xs'>
                                                                            {`Mobile number must be exactly ${phoneExpectedInfo.pasR_MotherMobleNo.expected} digits for ${
                                                                                phoneExpectedInfo.pasR_MotherMobleNo.name ??
                                                                                'selected country'
                                                                            }`}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        />
                                                        {errors.pasR_MotherMobleNo && (
                                                            <FormError>{errors.pasR_MotherMobleNo.message}</FormError>
                                                        )}
                                                    </div>

                                                    <InputText
                                                        label='Email-ID'
                                                        id='pasR_MotherEmail_ID'
                                                        placeholder='Enter Email-ID'
                                                        {...register('pasR_MotherEmail_ID')}
                                                        error={errors.pasR_FatherEmail_ID?.message}
                                                    />

                                                    <InputText
                                                        label='Home Phone No'
                                                        id='pasR_MotherHome_Phone_No'
                                                        placeholder='Enter Home Phone No'
                                                        {...register('pasR_MotherHome_Phone_No')}
                                                        error={errors.pasR_FatherHome_Phone_No?.message}
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
                                                                    key={field.value || 'empty'}
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value?.toString() || ''}>
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

                                                    {/* Education Details */}
                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Education Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <InputText
                                                                label='Qualification'
                                                                id='pasR_MotherEducation'
                                                                placeholder='Enter qualification'
                                                                {...register('pasR_MotherEducation')}
                                                                error={errors.pasR_MotherEducation?.message}
                                                            />

                                                            <InputText
                                                                label='Passing Year'
                                                                id='pasR_MotherPassing_Year'
                                                                placeholder='Enter Passing Year'
                                                                {...register('pasR_MotherPassing_Year')}
                                                                error={errors.pasR_MotherPassing_Year?.message}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Present Address Details */}
                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Present Address Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <InputText
                                                                label='Address'
                                                                id='pasR_MotherAddress'
                                                                placeholder='Enter Address'
                                                                {...register('pasR_MotherAddress')}
                                                                error={errors.pasR_MotherAddress?.message}
                                                            />

                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='pasR_MotherCountry'>Country</Label>
                                                                <Controller
                                                                    name='pasR_MotherCountry'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(value)}
                                                                            value={field.value?.toString() || ''}
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
                                                                {errors.pasR_MotherCountry && (
                                                                    <FormError>{errors.pasR_MotherCountry.message}</FormError>
                                                                )}
                                                            </div>
                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='pasR_MotherState'>State</Label>
                                                                <Controller
                                                                    name='pasR_MotherState'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                                            value={field.value?.toString() || ''}
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
                                                                {errors.pasR_PerState && (
                                                                    <FormError>{errors.pasR_PerState.message}</FormError>
                                                                )}
                                                            </div>
                                                            <InputText
                                                                label='City'
                                                                id='pasR_MotherCity'
                                                                placeholder='Enter city'
                                                                {...register('pasR_MotherCity')}
                                                                error={errors.pasR_MotherCity?.message}
                                                                disabled={sameAsResidential}
                                                            />

                                                            <div className='flex flex-col gap-1.5'>
                                                                <Controller
                                                                    name='pasR_FatherPincode'
                                                                    control={control}
                                                                    rules={
                                                                        perZipLength
                                                                            ? {
                                                                                  minLength: {
                                                                                      value: perZipLength,
                                                                                      message: `Pin code must be ${perZipLength} digits`
                                                                                  },
                                                                                  maxLength: {
                                                                                      value: perZipLength,
                                                                                      message: `Pin code must be ${perZipLength} digits`
                                                                                  }
                                                                              }
                                                                            : undefined
                                                                    }
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <MobileNumberInput
                                                                                label='Pin Code'
                                                                                id='pasR_MotherPincode'
                                                                                value={field.value}
                                                                                onChange={(valueOrEvent: any) => {
                                                                                    const raw = valueOrEvent?.target?.value ?? valueOrEvent;
                                                                                    const str =
                                                                                        raw == null ? '' : String(raw).replace(/\D/g, '');
                                                                                    const truncated = perZipLength
                                                                                        ? str.slice(0, perZipLength)
                                                                                        : str;
                                                                                    field.onChange(truncated);
                                                                                    // Set/clear a manual validation error so message appears immediately
                                                                                    if (
                                                                                        perZipLength &&
                                                                                        truncated !== '' &&
                                                                                        String(truncated).length !== perZipLength
                                                                                    ) {
                                                                                        setError('pasR_MotherPincode', {
                                                                                            type: 'manual',
                                                                                            message: `Pin code must be ${perZipLength} digits`
                                                                                        });
                                                                                    } else {
                                                                                        clearErrors('pasR_MotherPincode');
                                                                                    }
                                                                                    // Also trigger the resolver-based validation
                                                                                    trigger('pasR_MotherPincode');
                                                                                }}
                                                                                minLength={perZipLength}
                                                                                maxLength={perZipLength}
                                                                                type='number'
                                                                                showSpinner={false}
                                                                                disabled={sameAsResidential}
                                                                            />
                                                                            {perCountryObj && perZipLength && (
                                                                                <span className='mt-1 text-muted-foreground text-xs'>
                                                                                    {`Pin code must be ${perZipLength} digits for ${perCountryObj.ivrmmC_CountryName}`}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                />
                                                                {errors.pasR_PerPincode && (
                                                                    <FormError>{errors.pasR_PerPincode.message}</FormError>
                                                                )}
                                                            </div>

                                                            <InputText
                                                                label='PO'
                                                                id='pasR_MotherPO'
                                                                placeholder='Enter PO'
                                                                {...register('pasR_MotherPO')}
                                                                error={errors.pasR_FatherPO?.message}
                                                            />
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
                                                    {/* Permanent Address Details */}
                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Permanent Address Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <InputText
                                                                label=' Permanent Address'
                                                                id='pasR_MotherPermanentAddress'
                                                                placeholder='Enter Permanent Address'
                                                                {...register('pasR_MotherPermanentAddress')}
                                                                error={errors.pasR_MotherPermanentAddress?.message}
                                                            />

                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='pasR_MotherPermanentCountry'>Permanent Country</Label>
                                                                <Controller
                                                                    name='pasR_MotherPermanentCountry'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(value)}
                                                                            value={field.value?.toString() || ''}
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
                                                                {errors.pasR_PerCountry && (
                                                                    <FormError>{errors.pasR_PerCountry.message}</FormError>
                                                                )}
                                                            </div>
                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='pasR_MotherPermanentState'> Permanent State</Label>
                                                                <Controller
                                                                    name='pasR_MotherPermanentState'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                                            value={field.value?.toString() || ''}
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
                                                                {errors.pasR_PerState && (
                                                                    <FormError>{errors.pasR_PerState.message}</FormError>
                                                                )}
                                                            </div>
                                                            <InputText
                                                                label=' Permanent City'
                                                                id='pasR_MotherPermanentCity'
                                                                placeholder='Enter city'
                                                                {...register('pasR_MotherPermanentCity')}
                                                                error={errors.pasR_MotherPermanentCity?.message}
                                                                disabled={sameAsResidential}
                                                            />

                                                            <div className='flex flex-col gap-1.5'>
                                                                <Controller
                                                                    name='pasR_MotherPermanentPincode'
                                                                    control={control}
                                                                    rules={
                                                                        perZipLength
                                                                            ? {
                                                                                  minLength: {
                                                                                      value: perZipLength,
                                                                                      message: `Pin code must be ${perZipLength} digits`
                                                                                  },
                                                                                  maxLength: {
                                                                                      value: perZipLength,
                                                                                      message: `Pin code must be ${perZipLength} digits`
                                                                                  }
                                                                              }
                                                                            : undefined
                                                                    }
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <MobileNumberInput
                                                                                label='Permanent Pin Code'
                                                                                id='pasR_MotherPermanentPincode'
                                                                                placeholder='Enter Pincode'
                                                                                value={field.value}
                                                                                onChange={(valueOrEvent: any) => {
                                                                                    const raw = valueOrEvent?.target?.value ?? valueOrEvent;
                                                                                    const str =
                                                                                        raw == null ? '' : String(raw).replace(/\D/g, '');
                                                                                    const truncated = perZipLength
                                                                                        ? str.slice(0, perZipLength)
                                                                                        : str;
                                                                                    field.onChange(truncated);
                                                                                    // Set/clear a manual validation error so message appears immediately
                                                                                    if (
                                                                                        perZipLength &&
                                                                                        truncated !== '' &&
                                                                                        String(truncated).length !== perZipLength
                                                                                    ) {
                                                                                        setError('pasR_MotherPermanentPincode', {
                                                                                            type: 'manual',
                                                                                            message: `Pin code must be ${perZipLength} digits`
                                                                                        });
                                                                                    } else {
                                                                                        clearErrors('pasR_MotherPermanentPincode');
                                                                                    }
                                                                                    // Also trigger the resolver-based validation
                                                                                    trigger('pasR_MotherPermanentPincode');
                                                                                }}
                                                                                minLength={perZipLength}
                                                                                maxLength={perZipLength}
                                                                                type='number'
                                                                                showSpinner={false}
                                                                                disabled={sameAsResidential}
                                                                            />
                                                                            {perCountryObj && perZipLength && (
                                                                                <span className='mt-1 text-muted-foreground text-xs'>
                                                                                    {`Pin code must be ${perZipLength} digits for ${perCountryObj.ivrmmC_CountryName}`}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                />
                                                                {errors.pasR_PerPincode && (
                                                                    <FormError>{errors.pasR_PerPincode.message}</FormError>
                                                                )}
                                                            </div>

                                                            <InputText
                                                                label='Permanent PO'
                                                                id='pasR_MotherPermanent_PO'
                                                                placeholder='Enter Permanent PO'
                                                                {...register('pasR_MotherPermanent_PO')}
                                                                error={errors.pasR_MotherPermanent_PO?.message}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Office Details */}
                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Office Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <InputText
                                                                label='Office Address'
                                                                id='pasR_MotherOfficeAddress'
                                                                placeholder='Enter office address'
                                                                {...register('pasR_MotherOfficeAddress')}
                                                                error={errors.pasR_MotherOfficeAddress?.message}
                                                            />

                                                            <div className='flex flex-col gap-1.5 '>
                                                                <Controller
                                                                    name='pasR_MotherOffice_PhNo'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <div>
                                                                            <Label htmlFor='pasR_MotherOffice_PhNo'>
                                                                                Mother Office PhNo.
                                                                            </Label>
                                                                            <PhoneInput
                                                                                country='in'
                                                                                value={
                                                                                    phoneValues.pasR_MotherOffice_PhNo ??
                                                                                    (field.value != null ? String(field.value) : null)
                                                                                }
                                                                                onChange={(phone: any, countryData: any) =>
                                                                                    handlePhoneChange(
                                                                                        phone,
                                                                                        countryData,
                                                                                        'pasR_MotherOffice_PhNo'
                                                                                    )
                                                                                }
                                                                                onBlur={() => trigger('pasR_MotherOffice_PhNo')}
                                                                                inputProps={{
                                                                                    id: 'pasR_MotherOffice_PhNo',
                                                                                    name: 'pasR_MotherOffice_PhNo',
                                                                                    maxLength: 25,
                                                                                    required: false,
                                                                                    style: {
                                                                                        width: '87%',
                                                                                        height: '36px',
                                                                                        marginLeft: '40px',
                                                                                        boxSizing: 'border-box',
                                                                                        borderRadius: '4px',
                                                                                        padding: '16.5px 14px',
                                                                                        fontSize: '16px'
                                                                                    }
                                                                                }}
                                                                                containerClass='w-full'
                                                                                inputClass='w-full px-4 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                                                enableSearch
                                                                                disableCountryCode={false}
                                                                                enableLongNumbers={true}
                                                                                isValid={true}
                                                                                preserveOrder={['country', 'nationalNumber']}
                                                                            />
                                                                            {phoneExpectedInfo.pasR_MotherOffice_PhNo?.expected && (
                                                                                <span className='mt-1 text-muted-foreground text-xs'>
                                                                                    {`Mobile number must be exactly ${phoneExpectedInfo.pasR_MotherOffice_PhNo.expected} digits for ${
                                                                                        phoneExpectedInfo.pasR_MotherOffice_PhNo.name ??
                                                                                        'selected country'
                                                                                    }`}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                />
                                                                {errors.pasR_MotherOffice_PhNo && (
                                                                    <FormError>{errors.pasR_MotherOffice_PhNo.message}</FormError>
                                                                )}
                                                            </div>

                                                            <InputText
                                                                label='Occupation'
                                                                id='pasR_MotherOccupation'
                                                                placeholder='Enter Occupation'
                                                                {...register('pasR_MotherOccupation')}
                                                                error={errors.pasR_MotherOccupation?.message}
                                                            />

                                                            <InputText
                                                                label='Designation'
                                                                id='pasR_MotherDesignation'
                                                                placeholder='Enter designation'
                                                                {...register('pasR_MotherDesignation')}
                                                                error={errors.pasR_MotherDesignation?.message}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Other's Details */}
                                                    <div className='col-span-full space-y-4 md:col-span-2 lg:col-span-3'>
                                                        <h3 className='font-semibold text-gray-800 text-lg'>Other's Details</h3>
                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                            <div className='flex flex-col gap-1.5'>
                                                                <Label htmlFor='religion_Id'>
                                                                    Religion <span className='ml-1 text-red-500'>*</span>
                                                                </Label>
                                                                <Controller
                                                                    name='religion_Id'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                                            value={field.value?.toString() || ''}>
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
                                                                                        <SelectItem
                                                                                            key={item.ivrmmR_Id}
                                                                                            value={item.ivrmmR_Id.toString()}>
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
                                                                    Caste Category <span className='ml-1 text-red-500'>*</span>
                                                                </Label>
                                                                <Controller
                                                                    name='caste_Id'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            key={field.value || 'empty'}
                                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                                            value={field.value?.toString() || ''}>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder='Select caste Category' />
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
                                                                                        <SelectItem
                                                                                            key={item.imC_Id}
                                                                                            value={item.imC_Id.toString()}>
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
                                                            <InputText
                                                                label='Caste '
                                                                required
                                                                id='pasR_MotherCaste'
                                                                placeholder='Enter caste '
                                                                {...register('pasR_MotherCaste')}
                                                                error={errors.pasR_MotherCaste?.message}
                                                            />
                                                            <InputText
                                                                label='Sub Caste'
                                                                id='pasR_MotherSubCaste'
                                                                placeholder='Enter sub caste'
                                                                {...register('pasR_MotherSubCaste')}
                                                                error={errors.pasR_MotherSubCaste?.message}
                                                            />

                                                            <div className='flex flex-col gap-1.5'>
                                                                <Controller
                                                                    name='pasR_MotherIncome'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <InputNumber
                                                                            label='Mother Income'
                                                                            id='pasR_MotherIncome'
                                                                            value={field.value || 0}
                                                                            onChange={(value) =>
                                                                                field.onChange(Number.isNaN(value) ? 0 : value)
                                                                            }
                                                                            minValue={0}
                                                                            maxDigits={15}
                                                                        />
                                                                    )}
                                                                />
                                                                {errors.pasR_FatherIncome && (
                                                                    <FormError>{errors.pasR_FatherIncome.message}</FormError>
                                                                )}
                                                            </div>

                                                            <InputText
                                                                label='Caste Certificate No'
                                                                id='pasR_MotherCaste_Certificate_No'
                                                                placeholder='Enter Caste Certificate No'
                                                                {...register('pasR_MotherCaste_Certificate_No')}
                                                                error={errors.pasR_MotherCaste_Certificate_No?.message}
                                                            />

                                                            <InputText
                                                                label='Pan No'
                                                                id='pasR_MotherPanno'
                                                                placeholder='Enter PAN'
                                                                {...register('pasR_MotherPanno')}
                                                                error={errors.pasR_MotherPanno?.message}
                                                            />
                                                            <div className='flex items-center space-x-2'>
                                                                <Checkbox
                                                                    id='amsT_VaccinatedFlg'
                                                                    checked={Boolean(watch('amsT_VaccinatedFlg'))}
                                                                    onCheckedChange={(checked) => {
                                                                        setValue('amsT_VaccinatedFlg', checked === true);
                                                                    }}
                                                                />
                                                                <Label htmlFor='amsT_VaccinatedFlg' className='cursor-pointer'>
                                                                    Self Employed Flg
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 6: Document Upload */}
                                {currentStep === 6 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Document Upload</h2>
                                            <p className='text-sm *:text-gray-500'>
                                                Please upload the required documents. Documents marked with{' '}
                                                <span className='text-red-500'>*</span> are mandatory.
                                            </p>
                                            <p className='text-red-500 text-sm'>
                                                NOTE: All documents uploaded should be self-attested by parents
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
                                                                    className={(() => {
                                                                        // Get selected religion details
                                                                        const selectedReligionId = watch('religion_Id');
                                                                        const selectedReligion = religion?.data?.find(
                                                                            (r) => r.ivrmmR_Id === selectedReligionId
                                                                        );
                                                                        const isRomanCatholic =
                                                                            selectedReligion?.ivrmmR_Name === 'Roman Catholic';

                                                                        // Check if this document is conditionally mandatory
                                                                        const isConditionallyMandatory =
                                                                            document.amsmD_DocumentName === 'Baptism Certificate' &&
                                                                            isRomanCatholic;

                                                                        const isMandatory = document.amsmD_FLAG || isConditionallyMandatory;

                                                                        if (uploadedDoc && !isUploading) return 'bg-green-50';
                                                                        if (isMandatory) return 'bg-orange-50';
                                                                        return '';
                                                                    })()}>
                                                                    <td className='whitespace-nowrap px-6 py-4'>
                                                                        {(() => {
                                                                            // Get selected religion details
                                                                            const selectedReligionId = watch('religion_Id');
                                                                            const selectedReligion = religion?.data?.find(
                                                                                (r) => r.ivrmmR_Id === selectedReligionId
                                                                            );
                                                                            const isRomanCatholic =
                                                                                selectedReligion?.ivrmmR_Name === 'Roman Catholic';

                                                                            // Check if this document is conditionally mandatory
                                                                            const isConditionallyMandatory =
                                                                                document.amsmD_DocumentName === 'Baptism Certificate' &&
                                                                                isRomanCatholic;

                                                                            const isMandatory =
                                                                                document.amsmD_FLAG || isConditionallyMandatory;

                                                                            return (
                                                                                <>
                                                                                    <div className='flex items-center gap-2'>
                                                                                        <span className='font-semibold text-gray-900 text-sm'>
                                                                                            {document.amsmD_DocumentName}
                                                                                        </span>
                                                                                        {isMandatory && (
                                                                                            <span className='text-red-500'>*</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <p className='mt-0.5 text-gray-500 text-xs'>
                                                                                        {isMandatory ? 'Required' : 'Optional'}
                                                                                        {isConditionallyMandatory && (
                                                                                            <span className='ml-1 text-orange-600'>
                                                                                                (for Roman Catholic)
                                                                                            </span>
                                                                                        )}
                                                                                    </p>
                                                                                </>
                                                                            );
                                                                        })()}
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
                                                                                            if (file.size > 5 * 1024 * 1024) {
                                                                                                toast.error(
                                                                                                    'File size must be less than 5MB'
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
                                {currentStep === 4 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Other Information</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>
                                                Sibling details, previous school information, and undertaking
                                            </p>
                                        </div>
                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='source_ids'>Activities</Label>
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
                                                            placeholder='Select Activities'
                                                            variant='inverted'
                                                            disabled={sourceLoading}
                                                        />
                                                    )}
                                                />
                                                {errors.source_ids && <FormError>{errors.source_ids.message}</FormError>}
                                            </div>

                                            <div className='flex flex-col gap-1.5'>
                                                <Label htmlFor='source_ids'>Source Details</Label>
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

                                            <InputTextarea
                                                label='Achievements'
                                                id='pasA_Achievements'
                                                // placeholder={`Enter Mother's Business`}
                                                {...register('pasA_Achievements')}
                                                error={errors.pasA_Achievements?.message}
                                            />
                                        </div>

                                        {/* Previous School Details Section (multiple entries) */}
                                        <div className='space-y-4'>
                                            <div className='flex items-center justify-between'>
                                                <h3 className='font-semibold text-gray-800 text-lg'>Previous School Details</h3>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={addPreviousSchool}
                                                    disabled={isSubmitting}
                                                    className='w-fit'>
                                                    <span className='mr-2'>+</span>
                                                    Add Previous School Details
                                                </Button>
                                            </div>

                                            {previousSchoolFields.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>No previous school details added.</p>
                                            ) : (
                                                <div className='space-y-4'>
                                                    {previousSchoolFields.map((ps, idx) => (
                                                        <div key={ps.id} className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                                            <div className='mb-3 flex items-center justify-between'>
                                                                <h4 className='font-medium text-gray-700 text-sm'>
                                                                    Previous School {idx + 1}
                                                                </h4>
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={() => removePreviousSchool(idx)}
                                                                    disabled={isSubmitting}
                                                                    className='h-8 w-fit'>
                                                                    Remove
                                                                </Button>
                                                            </div>

                                                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                                                <InputText
                                                                    label='Previous School Name'
                                                                    id={`previous_school_name_${idx}`}
                                                                    placeholder='Enter school name'
                                                                    {...register(`previousSchoolDetails.${idx}.pasrpS_PrvSchoolName`)}
                                                                    error={
                                                                        errors.previousSchoolDetails?.[idx]?.pasrpS_PrvSchoolName?.message
                                                                    }
                                                                />
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label htmlFor='pasR_Section'>School Type</Label>
                                                                    <Controller
                                                                        name='pasR_Section'
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <Select
                                                                                key={field.value || 'empty'}
                                                                                onValueChange={(value) => field.onChange(value)}
                                                                                value={field.value?.toString() || ''}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder='Select Class' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value='A'>A</SelectItem>
                                                                                    <SelectItem value='B'>B</SelectItem>
                                                                                    <SelectItem value='C'>C</SelectItem>
                                                                                    <SelectItem value='D'>D</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                    />
                                                                    {errors.pasR_Section && (
                                                                        <FormError>{errors.pasR_Section.message}</FormError>
                                                                    )}
                                                                </div>
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label htmlFor='pasR_Section'>Class</Label>
                                                                    <Controller
                                                                        name='pasR_Section'
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <Select
                                                                                key={field.value || 'empty'}
                                                                                onValueChange={(value) => field.onChange(value)}
                                                                                value={field.value?.toString() || ''}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder='Select Class' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value='A'>A</SelectItem>
                                                                                    <SelectItem value='B'>B</SelectItem>
                                                                                    <SelectItem value='C'>C</SelectItem>
                                                                                    <SelectItem value='D'>D</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                    />
                                                                    {errors.pasR_Section && (
                                                                        <FormError>{errors.pasR_Section.message}</FormError>
                                                                    )}
                                                                </div>
                                                                <InputText
                                                                    label='Percentage'
                                                                    id={`previous_percentage_${idx}`}
                                                                    placeholder='Enter Percentage'
                                                                    {...register(`previousSchoolDetails.${idx}.pasrpS_PrvPercentage`)}
                                                                    error={
                                                                        errors.previousSchoolDetails?.[idx]?.pasrpS_PrvPercentage?.message
                                                                    }
                                                                />
                                                                <InputText
                                                                    label='Grade'
                                                                    id={`previous_grade_${idx}`}
                                                                    placeholder='Enter Grade'
                                                                    {...register(`previousSchoolDetails.${idx}.pasrpS_PrvGrade`)}
                                                                    error={errors.previousSchoolDetails?.[idx]?.pasrpS_PrvGrade?.message}
                                                                />
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label htmlFor='pasR_Section'>Passed Year</Label>
                                                                    <Controller
                                                                        name='pasR_Section'
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <Select
                                                                                key={field.value || 'empty'}
                                                                                onValueChange={(value) => field.onChange(value)}
                                                                                value={field.value?.toString() || ''}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder='Select Class' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value='A'>A</SelectItem>
                                                                                    <SelectItem value='B'>B</SelectItem>
                                                                                    <SelectItem value='C'>C</SelectItem>
                                                                                    <SelectItem value='D'>D</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                    />
                                                                    {errors.pasR_Section && (
                                                                        <FormError>{errors.pasR_Section.message}</FormError>
                                                                    )}
                                                                </div>
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label htmlFor='pasR_FatherPermanentCountry'>Country</Label>
                                                                    <Controller
                                                                        name='pasR_FatherPermanentCountry'
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <Select
                                                                                key={field.value || 'empty'}
                                                                                onValueChange={(value) => field.onChange(value)}
                                                                                value={field.value?.toString() || ''}
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
                                                                    {errors.pasR_PerCountry && (
                                                                        <FormError>{errors.pasR_PerCountry.message}</FormError>
                                                                    )}
                                                                </div>
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label htmlFor='pasR_FatherPermanentState'> State</Label>
                                                                    <Controller
                                                                        name='pasR_FatherPermanentState'
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <Select
                                                                                key={field.value || 'empty'}
                                                                                onValueChange={(value) => field.onChange(Number(value))}
                                                                                value={field.value?.toString() || ''}
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
                                                                    {errors.pasR_PerState && (
                                                                        <FormError>{errors.pasR_PerState.message}</FormError>
                                                                    )}
                                                                </div>

                                                                <InputText
                                                                    label='Address'
                                                                    id={`previous_address_${idx}`}
                                                                    placeholder='Enter address'
                                                                    {...register(`previousSchoolDetails.${idx}.pasrpS_Address`)}
                                                                    error={errors.previousSchoolDetails?.[idx]?.pasrpS_Address?.message}
                                                                />
                                                                <InputText
                                                                    label='Left Reason'
                                                                    id={`previous_leftreason_${idx}`}
                                                                    placeholder='Enter Left Reason'
                                                                    {...register(`previousSchoolDetails.${idx}.pasrpS_LeftReason`)}
                                                                    error={errors.previousSchoolDetails?.[idx]?.pasrpS_LeftReason?.message}
                                                                />
                                                                <InputText
                                                                    label='Medium'
                                                                    id={`previous_medium_${idx}`}
                                                                    placeholder='Enter Medium'
                                                                    {...register(`previousSchoolDetails.${idx}.pasrpS_PrvMedium`)}
                                                                    error={errors.previousSchoolDetails?.[idx]?.pasrpS_PrvMedium?.message}
                                                                />

                                                                <InputText
                                                                    label='TC No'
                                                                    id={`previous_tcno_${idx}`}
                                                                    placeholder='Enter TC No'
                                                                    {...register(`previousSchoolDetails.${idx}.pasrpS_PreviousClass`)}
                                                                    error={
                                                                        errors.previousSchoolDetails?.[idx]?.pasrpS_PreviousClass?.message
                                                                    }
                                                                />
                                                                <Controller
                                                                    name='amsT_Date'
                                                                    control={control}
                                                                    render={({ field, fieldState: { error } }) => (
                                                                        <div className='flex flex-col space-y-2'>
                                                                            <Label htmlFor='pasR_DateOfAdmission'>
                                                                                TC Date <span className='ml-1 text-red-500'>*</span>
                                                                            </Label>

                                                                            <Popover
                                                                                open={openPopover === 'amsT_Date'}
                                                                                onOpenChange={(open) =>
                                                                                    setOpenPopover(open ? 'amsT_Date' : null)
                                                                                }>
                                                                                <PopoverTrigger asChild>
                                                                                    <Button
                                                                                        variant={'outline'}
                                                                                        className={cn(
                                                                                            'w-full justify-start text-left font-normal',
                                                                                            !field.value && 'text-muted-foreground',
                                                                                            error && 'border-red-500'
                                                                                        )}>
                                                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                                                        {field.value ? (
                                                                                            format(field.value, 'dd/MM/yyyy')
                                                                                        ) : (
                                                                                            <span>Pick a date</span>
                                                                                        )}
                                                                                    </Button>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent className='w-auto p-0' align='start'>
                                                                                    <CalendarYear
                                                                                        mode='single'
                                                                                        selected={field.value}
                                                                                        onSelect={(date: Date | undefined) => {
                                                                                            if (date) {
                                                                                                field.onChange(date);
                                                                                                setOpenPopover(null);
                                                                                            }
                                                                                        }}
                                                                                        disabled={(date: Date) =>
                                                                                            date > new Date() ||
                                                                                            date < new Date('1900-01-01')
                                                                                        }
                                                                                        initialFocus
                                                                                    />
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                            {error && (
                                                                                <span className='text-red-500 text-sm'>
                                                                                    {error.message}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* GUARDIAN DETAILS Section (multiple entries) */}
                                        <div className='space-y-4'>
                                            <div className='flex items-center justify-between'>
                                                <h3 className='font-semibold text-gray-800 text-lg'>GUARDIAN DETAILS</h3>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={addGuardian}
                                                    disabled={isSubmitting}
                                                    className='w-fit'>
                                                    <span className='mr-2'>+</span>
                                                    Add GUARDIAN DETAILS
                                                </Button>
                                            </div>

                                            {guardianFields.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>No guardians added yet.</p>
                                            ) : (
                                                <div className='space-y-4'>
                                                    {guardianFields.map((g, idx) => (
                                                        <div key={g.id} className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                                            <div className='mb-3 flex items-center justify-between'>
                                                                <h4 className='font-medium text-gray-700 text-sm'>Guardian {idx + 1}</h4>
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={() => removeGuardian(idx)}
                                                                    disabled={isSubmitting}
                                                                    className='h-8 w-fit'>
                                                                    Remove
                                                                </Button>
                                                            </div>

                                                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                                                <InputText
                                                                    label='Guardian Name'
                                                                    {...register(`guardiansDetails.${idx}.guardianName` as const)}
                                                                    placeholder='Enter Guardian Name'
                                                                    {...register(`guardiansDetails.${idx}.guardianName`)}
                                                                    error={errors.guardiansDetails?.[idx]?.guardianName?.message}
                                                                />

                                                                <InputText
                                                                    label='Guardian Phone'
                                                                    id={`guardian_phone_${idx}`}
                                                                    placeholder='Enter Guardian Phone'
                                                                    {...register(`guardiansDetails.${idx}.guardianPhone`)}
                                                                    error={errors.guardiansDetails?.[idx]?.guardianPhone?.message}
                                                                />
                                                                <InputText
                                                                    label='Guardian Email'
                                                                    id={`guardian_address_${idx}`}
                                                                    placeholder='Enter Guardian Email'
                                                                    {...register(`guardiansDetails.${idx}.guardianAddress`)}
                                                                    error={errors.guardiansDetails?.[idx]?.guardianAddress?.message}
                                                                />

                                                                <InputText
                                                                    label='Guardian Address'
                                                                    id={`guardian_address_${idx}`}
                                                                    placeholder='Enter Guardian Address'
                                                                    {...register(`guardiansDetails.${idx}.guardianAddress`)}
                                                                    error={errors.guardiansDetails?.[idx]?.guardianAddress?.message}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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

                                            {siblingFields.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>
                                                    No siblings added yet. Click "Add Sibling" to add details.
                                                </p>
                                            ) : (
                                                <div className='space-y-4'>
                                                    {siblingFields.map((sibling, index) => (
                                                        <div key={sibling.id} className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
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
                                                                <Controller
                                                                    control={control}
                                                                    name={`siblingsDetails.${index}.pasrS_SiblingsName`}
                                                                    render={({ field }) => (
                                                                        <InputText
                                                                            label='Sibling Name'
                                                                            id={`sibling_name_${index}`}
                                                                            placeholder='Enter sibling name'
                                                                            {...field}
                                                                            error={
                                                                                errors.siblingsDetails?.[index]?.pasrS_SiblingsName?.message
                                                                            }
                                                                        />
                                                                    )}
                                                                />

                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label htmlFor='pasR_Section'>Class</Label>
                                                                    <Controller
                                                                        name='pasR_Section'
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <Select
                                                                                key={field.value || 'empty'}
                                                                                onValueChange={(value) => field.onChange(value)}
                                                                                value={field.value?.toString() || ''}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder='Select Class' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value='A'>A</SelectItem>
                                                                                    <SelectItem value='B'>B</SelectItem>
                                                                                    <SelectItem value='C'>C</SelectItem>
                                                                                    <SelectItem value='D'>D</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                    />
                                                                    {errors.pasR_Section && (
                                                                        <FormError>{errors.pasR_Section.message}</FormError>
                                                                    )}
                                                                </div>

                                                                <Controller
                                                                    control={control}
                                                                    name={`siblingsDetails.${index}.pasrS_SiblingsClass`}
                                                                    render={({ field }) => (
                                                                        <InputText
                                                                            label='Relation'
                                                                            id={`sibling_class_${index}`}
                                                                            placeholder='Enter Relation'
                                                                            {...field}
                                                                            error={
                                                                                errors.siblingsDetails?.[index]?.pasrS_SiblingsClass
                                                                                    ?.message
                                                                            }
                                                                        />
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Place of Birth Details */}
                                        <div className='space-y-4'>
                                            <h3 className='font-semibold text-gray-800 text-lg'>Place of Birth Details</h3>
                                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                <div className='flex flex-col gap-1.5'>
                                                    <Label htmlFor='pasR_MotherCountry'>Country</Label>
                                                    <Controller
                                                        name='pasR_MotherCountry'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                key={field.value || 'empty'}
                                                                onValueChange={(value) => field.onChange(value)}
                                                                value={field.value?.toString() || ''}
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
                                                    {errors.pasR_MotherCountry && (
                                                        <FormError>{errors.pasR_MotherCountry.message}</FormError>
                                                    )}
                                                </div>
                                                <div className='flex flex-col gap-1.5'>
                                                    <Label htmlFor='pasR_State'>State</Label>
                                                    <Controller
                                                        name='pasR_State'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                key={field.value || 'empty'}
                                                                onValueChange={(value) => field.onChange(Number(value))}
                                                                value={field.value?.toString() || ''}
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
                                                    label={'District'}
                                                    id='pasA_District'
                                                    placeholder={'Enter District'}
                                                    {...register('pasA_District')}
                                                    error={errors.pasA_District?.message}
                                                />

                                                <InputText
                                                    label={'Taluk'}
                                                    id='pasA_Taluk'
                                                    placeholder={'Enter Taluk'}
                                                    {...register('pasA_Taluk')}
                                                    error={errors.pasA_Taluk?.message}
                                                />

                                                <InputText
                                                    label={'Town'}
                                                    id='pasA_Town'
                                                    placeholder={'Enter Town'}
                                                    {...register('pasA_Town')}
                                                    error={errors.pasA_Town?.message}
                                                />

                                                <InputText
                                                    label={'Village'}
                                                    id='pasA_Village'
                                                    placeholder={'Enter Village'}
                                                    {...register('pasA_Village')}
                                                    error={errors.pasA_Village?.message}
                                                />
                                            </div>
                                        </div>

                                        {/* Siblings Count details */}

                                        <div className='space-y-4'>
                                            <h3 className='font-semibold text-gray-800 text-lg'>Siblings Count Details</h3>
                                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                <InputText
                                                    label='No of Siblings'
                                                    id='pasA_No_of_Siblings'
                                                    placeholder='Enter No of Siblings'
                                                    {...register('pasA_No_of_Siblings')}
                                                    error={errors.pasA_No_of_Siblings?.message}
                                                />

                                                <InputText
                                                    label={'No of Siblings in School '}
                                                    id='pasA_No_of_Siblings_in_School'
                                                    placeholder={'Enter No of Siblings in School '}
                                                    {...register('pasA_No_of_Siblings_in_School')}
                                                    error={errors.pasA_No_of_Siblings_in_School?.message}
                                                />

                                                <InputText
                                                    label={'No of Siblings in other School'}
                                                    id='pasA_No_of_Siblings_in_other_School'
                                                    placeholder={'Enter No of Siblings in other School'}
                                                    {...register('pasA_No_of_Siblings_in_other_School')}
                                                    error={errors.pasA_No_of_Siblings_in_other_School?.message}
                                                />

                                                <InputText
                                                    label={'No of Sisters'}
                                                    id='pasA_No_of_Sisters'
                                                    placeholder={'Enter No of Sisters'}
                                                    {...register('pasA_No_of_Sisters')}
                                                    error={errors.pasA_No_of_Sisters?.message}
                                                />

                                                <InputText
                                                    label={'No of Younger Sisters'}
                                                    id='pasA_No_of_Younger_Sisters'
                                                    placeholder={'Enter No of Younger Sisters'}
                                                    {...register('pasA_No_of_Younger_Sisters')}
                                                    error={errors.pasA_No_of_Younger_Sisters?.message}
                                                />

                                                <InputText
                                                    label={'No of Elder Sisters'}
                                                    id='pasA_No_of_Elder_Sisters'
                                                    placeholder={'Enter No of Elder Sisters'}
                                                    {...register('pasA_No_of_Elder_Sisters')}
                                                    error={errors.pasA_No_of_Elder_Sisters?.message}
                                                />

                                                <InputText
                                                    label={'No of Brothers '}
                                                    id='pasA_No_of_Brothers'
                                                    placeholder={'EnterNo of Brothers '}
                                                    {...register('pasA_No_of_Brothers')}
                                                    error={errors.pasA_No_of_Brothers?.message}
                                                />

                                                <InputText
                                                    label={'No of Younger Brothers '}
                                                    id='pasA_No_of_Younger_Brothers'
                                                    placeholder={'Enter No of Younger Brothers s'}
                                                    {...register('pasA_pasA_No_of_Younger_Brothers')}
                                                    error={errors.pasA_pasA_No_of_Younger_Brothers?.message}
                                                />

                                                <InputText
                                                    label={'No of Elder Brothers'}
                                                    id='pasA_No_of_Elder_Brothers'
                                                    placeholder={'Enter No of Elder Brothers'}
                                                    {...register('pasA_No_of_Elder_Brothers')}
                                                    error={errors.pasA_No_of_Elder_Brothers?.message}
                                                />
                                            </div>
                                        </div>

                                        {/* Undertaking Section */}
                                    </div>
                                )}

                                {/* Step 5: Health and Medical Details */}
                                {currentStep === 5 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Health and Medical Details</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>Please provide Health details</p>
                                        </div>

                                        <div className='space-y-8'>
                                            <div className='space-y-4'>
                                                {/* <h3 className='font-semibold text-gray-800 text-lg'>Residential Address</h3> */}
                                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                                    <InputText
                                                        label='Student Health'
                                                        id='amsT_Studentillness'
                                                        placeholder='Enter Student Health'
                                                        {...register('amsT_Studentillness')}
                                                        error={errors.amsT_Studentillness?.message}
                                                    />
                                                    <InputText
                                                        label='Medical Complaints'
                                                        id='amsT_MedicalComplaints'
                                                        placeholder='Enter Medical Complaints'
                                                        {...register('amsT_MedicalComplaints')}
                                                        error={errors.amsT_MedicalComplaints?.message}
                                                    />
                                                    <InputText
                                                        label='Admission Reason'
                                                        id='amsT_AdmissionReason'
                                                        placeholder='Enter Admission Reason'
                                                        {...register('amsT_AdmissionReason')}
                                                        error={errors.amsT_AdmissionReason?.message}
                                                    />

                                                    <InputTextarea
                                                        label='Other Residential Address'
                                                        id='amsT_OtherResidential_Addr'
                                                        placeholder='Enter Other Residential Address'
                                                        {...register('amsT_OtherResidential_Addr')}
                                                        error={errors.amsT_OtherResidential_Addr?.message}
                                                    />

                                                    <InputText
                                                        label='School DISE Code'
                                                        id='amsT_SchoolDISECode'
                                                        placeholder='Enter School DISE Code'
                                                        {...register('amsT_SchoolDISECode')}
                                                        error={errors.amsT_SchoolDISECode?.message}
                                                    />
                                                    <InputText
                                                        label='First Language'
                                                        id='amsT_FirstLanguage'
                                                        placeholder='Enter First Language'
                                                        {...register('amsT_FirstLanguage')}
                                                        error={errors.amsT_FirstLanguage?.message}
                                                    />
                                                    <InputText
                                                        label='  Second Language:'
                                                        id=' amsT_SecondLanguage'
                                                        placeholder='Enter Second Language:'
                                                        {...register('amsT_SecondLanguage')}
                                                        error={errors.amsT_SecondLanguage?.message}
                                                    />
                                                    <InputText
                                                        label='Third Language'
                                                        id='amsT_Thirdlanguage'
                                                        placeholder='Enter Third Language'
                                                        {...register('amsT_Thirdlanguage')}
                                                        error={errors.amsT_Thirdlanguage?.message}
                                                    />

                                                    <InputText
                                                        label='Illness Details '
                                                        id='amsT_Illnessdetails'
                                                        placeholder='Enter Illness Details '
                                                        {...register('amsT_Illnessdetails')}
                                                        error={errors.amsT_Illnessdetails?.message}
                                                    />

                                                    <InputText
                                                        label='Other Informations'
                                                        id='amsT_OtherInformations'
                                                        placeholder='Enter Other Informations'
                                                        {...register('amsT_OtherInformations')}
                                                        error={errors.amsT_OtherInformations?.message}
                                                    />

                                                    <InputText
                                                        label='Extra Activity'
                                                        id='amsT_ExtraActivity'
                                                        placeholder='Enter Extra Activity'
                                                        {...register('amsT_ExtraActivity')}
                                                        error={errors.amsT_ExtraActivity?.message}
                                                    />

                                                    <InputText
                                                        label='Staying with'
                                                        id='amsT_Stayingwith'
                                                        placeholder='Enter Staying with'
                                                        {...register('amsT_Stayingwith')}
                                                        error={errors.amsT_Stayingwith?.message}
                                                    />

                                                    <InputTextarea
                                                        label=' Other Permanent Address:'
                                                        id='amsT_OtherPermanentAddr'
                                                        placeholder='Enter Other Permanent Address:'
                                                        {...register('amsT_OtherPermanentAddr')}
                                                        error={errors.amsT_OtherPermanentAddr?.message}
                                                    />

                                                    <InputText
                                                        label=' Domicile:'
                                                        id='amsT_Domicile'
                                                        placeholder='Enter Domicile:'
                                                        {...register('amsT_Domicile')}
                                                        error={errors.amsT_Domicile?.message}
                                                    />

                                                    <div className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='amsT_TransferrableJobFlg'
                                                            checked={Boolean(watch('amsT_TransferrableJobFlg'))}
                                                            onCheckedChange={(checked) => {
                                                                setValue('amsT_TransferrableJobFlg', checked === true);
                                                            }}
                                                        />
                                                        <Label htmlFor='amsT_TransferrableJobFlg' className='cursor-pointer'>
                                                            Transferrable Flag
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='amsT_VaccinatedFlg'
                                                            checked={Boolean(watch('amsT_VaccinatedFlg'))}
                                                            onCheckedChange={(checked) => {
                                                                setValue('amsT_VaccinatedFlg', checked === true);
                                                            }}
                                                        />
                                                        <Label htmlFor='amsT_VaccinatedFlg' className='cursor-pointer'>
                                                            Vaccinated Flag
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='amsT_Tcflag'
                                                            checked={Boolean(watch('amsT_Tcflag'))}
                                                            onCheckedChange={(checked) => {
                                                                setValue('amsT_Tcflag', checked === true);
                                                            }}
                                                        />
                                                        <Label htmlFor='amsT_Tcflag' className='cursor-pointer'>
                                                            TC Flag
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
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
                                        <Button type='button' onClick={nextStep} disabled={isSubmitting}>
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
                        <IneligibleClassesDialog
                            open={showIneligibleDialog}
                            onOpenChange={setShowIneligibleDialog}
                            classes={ineligibleClasses}
                            cutOffDate={
                                masterConfig?.data &&
                                masterConfig.data.ispaC_ApplCutOffDateFlag === 1 &&
                                masterConfig.data.asmaY_Cut_Of_Date
                                    ? new Date(masterConfig.data.asmaY_Cut_Of_Date)
                                    : new Date()
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
