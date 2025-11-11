'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useEmployeeRegisterOnload, useSaveEmployeePersonalDetails, useEmployeeRegisterById, useSaveEmployeeQualification, useSaveEmployeeExperience, useSaveEmployeeDocument, useSaveEmployeeMedical, useEmployeeSalaryDetails } from '@/hooks/hrms/useEmployeeRegister';
import type { EmployeeListItem } from '@/types/hrms/employee';
import type { SavePersonalDetailsRequest } from '@/types/hrms/employee-register';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { EmployeeTab } from './tabs/employee-tab';
import { AddressTab } from './tabs/address-tab';
import { QualificationTab } from './tabs/qualification-tab';
import { ExperienceTab } from './tabs/experience-tab';
import { MedicalRecordTab } from './tabs/medical-tab';
import { OtherDetailsTab } from './tabs/other-details-tab';
import { UploadDocumentTab } from './tabs/document-tab';
import { PayrollTab } from './tabs/payroll-tab-new';

// Extended form schema to include all tab fields (using tab field names)
const formSchema = z.object({
    // Employee tab fields (using tab field names)
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    employeeCode: z.string().min(1, 'Employee code is required'),
    typeOfEmployment: z.string().min(1, 'Employee type is required'),
    employeeGroup: z.string().min(1, 'Employee group is required'),
    school: z.string().min(1, 'School/Department is required'),
    designation: z.string().min(1, 'Designation is required'),
    grade: z.string().optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    dateOfJoining: z.string().optional(),
    dateOfConfirmation: z.string().optional(),
    dateOfRetirement: z.string().optional(),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    religion: z.string().optional(),
    casteCategory: z.string().optional(),
    caste: z.string().optional(),
    bloodGroup: z.string().optional(),
    salaryType: z.string().optional(),
    modeOfPayment: z.string().optional(),
    subjectTaught: z.string().optional(),
    epf: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    ppf: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    phdResearchGuide: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    recognitionYear: z.string().optional(),
    teachingNonTeaching: z.string().optional(),
    pfApplicable: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    pfMaxAmount: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    pfFixedAmount: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    pfAccNo: z.string().optional(),
    uanNumber: z.string().optional(),
    pfDate: z.string().optional(),
    esiApplicable: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    esiAccNo: z.string().optional(),
    gratuityAccNo: z.string().optional(),
    esiDate: z.string().optional(),
    nationalSSN: z.string().optional(),
    aadharNo: z.string().optional(),
    panCardNo: z.string().optional(),
    mobileDetails: z.array(z.object({ mobileNo: z.string(), type: z.string() })).optional(),
    emailDetails: z.array(z.object({ emailId: z.string(), type: z.string() })).optional(),
    bankDetails: z.array(z.object({ employerBankName: z.string(), bankAccountNo: z.string(), accountType: z.string() })).optional(),
    // Address tab fields
    contactAddress: z.string().optional(),
    contactArea: z.string().optional(),
    contactCountry: z.string().optional(),
    contactState: z.string().optional(),
    contactCity: z.string().optional(),
    contactPincode: z.string().optional(),
    permanentAddress: z.string().optional(),
    permanentArea: z.string().optional(),
    permanentCountry: z.string().optional(),
    permanentState: z.string().optional(),
    permanentCity: z.string().optional(),
    permanentPincode: z.string().optional(),
    sameAsCommunicationAddress: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    // Other tabs
    qualificationDetails: z.array(z.any()).optional(),
    experienceDetails: z.array(z.any()).optional(),
    documentList: z.array(z.any()).optional(),
    employeeHeight: z.string().optional(),
    employeeHeightUnit: z.string().optional(),
    employeeWeight: z.string().optional(),
    employeeWeightUnit: z.string().optional(),
    eyeSightIssue: z.string().optional(),
    anyHealthIssue: z.string().optional(),
    identificationMark: z.string().optional(),
    biometricCode: z.string().optional(),
    rfCardId: z.string().optional(),
    punchRelaxation: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    stopPension: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    dateOfStopPension: z.string().optional(),
    msTeamsUserName: z.string().optional(),
    msTeamsPassword: z.string().optional(),
    employeeLeft: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
    lastWorkingDay: z.string().optional(),
    reasonForLeaving: z.string().optional()
});

type FormFields = z.infer<typeof formSchema>;

interface EmployeeRegisterFormProps {
    selectedRow?: EmployeeListItem;
    onSuccess?: () => void;
    className?: string;
}

export default function EmployeeRegisterForm({
    selectedRow,
    onSuccess,
    className = ''
}: EmployeeRegisterFormProps) {
    const { data: onloadData, isLoading: isLoadingOnload } = useEmployeeRegisterOnload();
    
    // Removed non-qualification debug logs
    const { mutate: savePersonalDetails, isPending } = useSaveEmployeePersonalDetails();
    const { mutate: saveQualificationDetails, isPending: isSavingQualification } = useSaveEmployeeQualification();
    const { mutate: saveExperienceDetails, isPending: isSavingExperience } = useSaveEmployeeExperience();
    const { mutate: saveDocumentDetails, isPending: isSavingDocument } = useSaveEmployeeDocument();
    const { mutate: saveMedicalDetails, isPending: isSavingMedical } = useSaveEmployeeMedical();
    const isEditMode = !!selectedRow;
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState('employee');
    const [savedEmployeeId, setSavedEmployeeId] = useState<number | null>(selectedRow?.HRME_Id || null);
    
    // Fetch full employee details when in edit mode
    const { data: employeeDetails, isLoading: isLoadingEmployee } = useEmployeeRegisterById(selectedRow?.HRME_Id || null);
    
    // Removed debug log

    // Compute default values based on edit mode and employee data
    const formDefaultValues = useMemo(() => {
        if (!isEditMode || !employeeDetails) {
            return {
                firstName: '',
                middleName: '',
                lastName: '',
                employeeCode: '',
                typeOfEmployment: '',
                employeeGroup: '',
                school: '',
                designation: '',
                gender: '',
                maritalStatus: '',
                religion: '',
                casteCategory: '',
                caste: '',
                bloodGroup: '',
                salaryType: '',
                modeOfPayment: '',
                contactCountry: '',
                contactState: '',
                permanentCountry: '',
                permanentState: '',
                sameAsCommunicationAddress: false,
                qualificationDetails: [],
                experienceDetails: [],
                documentList: [],
                mobileDetails: [],
                emailDetails: [],
                bankDetails: []
            };
        }
        
        const emp = employeeDetails;
        // Removed debug log
        
        return {
            // Employee tab
            firstName: emp.HRME_EmployeeFirstName || '',
            middleName: emp.HRME_EmployeeMiddleName || '',
            lastName: emp.HRME_EmployeeLastName || '',
            employeeCode: emp.HRME_EmployeeCode || '',
            typeOfEmployment: emp.HRMET_Id != null ? emp.HRMET_Id.toString() : '',
            employeeGroup: emp.HRMGT_Id != null ? emp.HRMGT_Id.toString() : '',
            school: emp.HRMD_Id != null ? emp.HRMD_Id.toString() : '',
            designation: emp.HRMDES_Id != null ? emp.HRMDES_Id.toString() : '',
            grade: emp.HRMG_Id != null ? emp.HRMG_Id.toString() : '',
            fatherName: emp.HRME_FatherName || '',
            motherName: emp.HRME_MotherName || '',
            dateOfBirth: emp.HRME_DOB ? new Date(emp.HRME_DOB).toISOString().split('T')[0] : '',
            dateOfJoining: emp.HRME_DOJ ? new Date(emp.HRME_DOJ).toISOString().split('T')[0] : '',
            dateOfConfirmation: emp.HRME_DOC ? new Date(emp.HRME_DOC).toISOString().split('T')[0] : '',
            dateOfRetirement: emp.HRME_ExpectedRetirementDate ? new Date(emp.HRME_ExpectedRetirementDate).toISOString().split('T')[0] : '',
            gender: emp.IVRMMG_Id != null ? emp.IVRMMG_Id.toString() : '',
            maritalStatus: emp.IVRMMMS_Id != null ? emp.IVRMMMS_Id.toString() : '',
            religion: emp.ReligionId != null ? emp.ReligionId.toString() : '',
            casteCategory: emp.CasteCategoryId != null ? emp.CasteCategoryId.toString() : '',
            caste: emp.CasteId != null ? emp.CasteId.toString() : '',
            bloodGroup: emp.HRME_BloodGroup || '',
            salaryType: emp.HRME_SalaryType || '',
            modeOfPayment: emp.HRME_PaymentType || '',
            subjectTaught: emp.HRME_SubjectsTaught || '',
            teachingNonTeaching: emp.HRME_TechNonTeachingFlg || 'Teaching',
            phdResearchGuide: emp.HRME_PHDResearchGuideFlg || false,
            recognitionYear: emp.HRME_RGRecognitionYear?.toString() || '',
            biometricCode: emp.HRME_BiometricCode || '',
            rfCardId: emp.HRME_RFCardId || '',
            epf: !emp.HRME_EPFNotApplicableFlg,
            ppf: !emp.HRME_FPFNotApplicableFlg,
            
            // PF/ESI
            pfApplicable: emp.HRME_PFApplicableFlag || false,
            pfAccNo: emp.HRME_PFAccNo || '',
            uanNumber: emp.HRME_UINumber || '',
            pfDate: emp.HRME_PFDate ? new Date(emp.HRME_PFDate).toISOString().split('T')[0] : '',
            pfMaxAmount: emp.HRME_PFMaxFlag || false,
            pfFixedAmount: emp.HRME_PFFixedFlag || false,
            esiApplicable: emp.HRME_ESIApplicableFlag || false,
            esiAccNo: emp.HRME_ESIAccNo || '',
            esiDate: emp.HRME_ESIDate ? new Date(emp.HRME_ESIDate).toISOString().split('T')[0] : '',
            gratuityAccNo: emp.HRME_GratuityAccNo || '',
            
            // IDs
            nationalSSN: emp.HRME_NationalSSN || '',
            aadharNo: emp.HRME_AadharCardNo?.toString() || '',
            panCardNo: emp.HRME_PANCardNo || '',
            
            // Contact
            mobileDetails: emp.HRME_MobileNo ? [{ mobileNo: emp.HRME_MobileNo.toString(), type: 'default' }] : [],
            emailDetails: emp.HRME_EmailId ? [{ emailId: emp.HRME_EmailId, type: 'default' }] : [],
            // Bank details - will be set properly after options load (see useEffect)
            bankDetails: emp.HRME_BankAccountNo ? [{ bankAccountNo: emp.HRME_BankAccountNo, employerBankName: '', accountType: 'default' }] : [],
            
            // Address
            contactAddress: emp.HRME_LocStreet || '',
            contactArea: emp.HRME_LocArea || '',
            contactCity: emp.HRME_LocCity || '',
            contactPincode: emp.HRME_LocPincode?.toString() || '',
            contactCountry: emp.HRME_LocCountryId != null ? emp.HRME_LocCountryId.toString() : '',
            contactState: emp.HRME_LocStateId != null ? emp.HRME_LocStateId.toString() : '',
            permanentAddress: emp.HRME_PerStreet || '',
            permanentArea: emp.HRME_PerArea || '',
            permanentCity: emp.HRME_PerCity || '',
            permanentPincode: emp.HRME_PerPincode != null ? emp.HRME_PerPincode.toString() : '',
            permanentCountry: emp.HRME_PerCountryId != null ? emp.HRME_PerCountryId.toString() : '',
            permanentState: emp.HRME_PerStateId != null ? emp.HRME_PerStateId.toString() : '',
            
            // Medical/Physical
            employeeHeight: emp.HRME_Height || '',
            employeeHeightUnit: emp.HRME_HeightUOM || '',
            employeeWeight: emp.HRME_Weight != null ? emp.HRME_Weight.toString() : '',
            employeeWeightUnit: emp.HRME_WeightUOM || '',
            identificationMark: emp.HRME_IdentificationMark || '',
            eyeSightIssue: emp.HRME_EyeSightIssue || '',
            anyHealthIssue: emp.HRME_AnyHealthIssue || '',
            
            // Other
            employeeLeft: emp.HRME_LeftFlag || false,
            lastWorkingDay: emp.HRME_DOL ? new Date(emp.HRME_DOL).toISOString().split('T')[0] : '',
            reasonForLeaving: emp.HRME_LeavingReason || '',
            msTeamsUserName: emp.HRME_MSTeamsUserId || '',
            msTeamsPassword: emp.HRME_MSTeamsPassword || '',
            punchRelaxation: emp.HRME_ExcPunch || false,
            stopPension: emp.HRME_RetiredFlg || false,
            dateOfStopPension: emp.HRME_PensionStoppedDate ? new Date(emp.HRME_PensionStoppedDate).toISOString().split('T')[0] : '',
            
            sameAsCommunicationAddress: false,
            qualificationDetails: (() => {
                const quals = emp.qualificationDetails || [];
                return quals.map((q: any) => ({
                    qualification: q.HRME_QualificationName || q.qualification || '',
                    course: q.HRMC_Id?.toString() || q.course || '',
                    college: q.HRMEQ_CollegeName || q.college || '',
                    university: q.HRMEQ_UniversityName || q.university || '',
                    yearOfPassing: q.HRMEQ_YearOfPassing?.toString() || q.yearOfPassing || '',
                    cgpaOrPercentage: q.HRMEQ_CGPAOrPerFlag || q.cgpaOrPercentage || 'CGPA',
                    cgpa: q.HRMEQ_CGPA || q.HRMEQ_Percentage || q.cgpa || '',
                    qualificationCountry: q.HRMEQ_CountryId?.toString() || q.qualificationCountry || '',
                    qualificationState: q.HRMEQ_StateId?.toString() || q.qualificationState || '',
                    registrationNo: q.HRMEQ_RegistrationNo || q.registrationNo || '',
                    result: q.HRMEQ_Result || q.result || '',
                    areaOfSpecialisation: q.HRMEQ_AreaOfSpecialisation || q.areaOfSpecialisation || '',
                    medicalCouncil: q.HRMEQ_MedicalCouncil || q.medicalCouncil || '',
                    phdFlag: q.HRMEQ_PHDFlg || q.phdFlag || false,
                    thesisTitle: q.HRMEQ_ThesisTitle || q.thesisTitle || '',
                    registrationYear: q.HRMEQ_RegistrationYear?.toString() || q.registrationYear || '',
                    guideName: q.HRMEQ_GuideName || q.guideName || '',
                    qualifiedDate: q.HRMEQ_Date || q.qualifiedDate || '',
                    specialisation: q.HRMEQ_AreaOfSpecialisation || q.specialisation || '',
                    HRMEQ_Id: q.HRMEQ_Id || 0
                }));
            })(),
            experienceDetails: (() => {
                const exps = emp.experienceDetails || [];
                return exps.map((exp: any) => ({
                    organisationName: exp.HRMEE_OrganisationName || exp.organisationName || '',
                    organisationAddress: exp.HRMEE_OrganisationAddress || exp.organisationAddress || '',
                    department: exp.HRMEE_Department || exp.department || '',
                    designation: exp.HRMEE_Designation || exp.designation || '',
                    joinDate: exp.HRMEE_JoinDate || exp.joinDate || '',
                    exitDate: exp.HRMEE_ExitDate || exp.exitDate || '',
                    noOfYears: exp.HRMEE_NoOfYears?.toString() || exp.noOfYears || '',
                    noOfMonths: exp.HRMEE_NoOfMonths?.toString() || exp.noOfMonths || '',
                    annualSalary: exp.HRMEE_AnnualSalary?.toString() || exp.annualSalary || '',
                    reasonForLeaving: exp.HRMEE_ReasonForLeaving || exp.reasonForLeaving || '',
                    HRMEE_Id: exp.HRMEE_Id || 0
                }));
            })(),
            documentList: (() => {
                const docs = emp.documentList || [];
                return docs.map((doc: any) => ({
                    documentName: doc.HRMEDS_DocumentName || doc.documentName || '',
                    documentDescription: doc.HRMEDS_DucumentDescription || doc.description || doc.documentDescription || '',
                    documentImageName: doc.HRMEDS_DocumentImageName || doc.imageName || '',
                    HRMEDS_Id: doc.HRMEDS_Id || 0,
                    document: doc.document || null // File object if available
                }));
            })()
        };
    }, [isEditMode, employeeDetails]);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        mode: 'onBlur',
        defaultValues: formDefaultValues
    });
    
    // Watch for country changes to help debug state loading
    const contactCountry = watch('contactCountry');
    const permanentCountry = watch('permanentCountry');

    // Update savedEmployeeId when selectedRow changes
    useEffect(() => {
        if (selectedRow?.HRME_Id) {
            setSavedEmployeeId(selectedRow.HRME_Id);
        }
    }, [selectedRow]);

    // Reset form when switching modes or when employee details load in edit mode
    useEffect(() => {
        // Only reset if we're not loading and have the necessary data
        if (!isLoadingEmployee && !isLoadingOnload) {
            if (isEditMode && employeeDetails) {
                // Edit mode: reset with employee data
                // Removed debug logs
                // Reset the entire form
                reset(formDefaultValues, { keepDefaultValues: false });
            } else if (!isEditMode) {
                // Add mode: reset to empty defaults
                reset(formDefaultValues, { keepDefaultValues: false });
            }
        }
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, formDefaultValues, reset]); // Reset when mode changes, employee ID changes, or form defaults update

    // Ensure dropdown values are set after options are loaded (handles timing issues)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && onloadData) {
            // Check if basic options are available
            const hasBasicOptions = 
                (onloadData.employeeTypedropdownlist?.length ?? 0) > 0 &&
                (onloadData.groupTypedropdownlist?.length ?? 0) > 0 &&
                (onloadData.departmentdropdownlist?.length ?? 0) > 0 &&
                (onloadData.designationdropdownlist?.length ?? 0) > 0 &&
                (onloadData.genderdropdownlist?.length ?? 0) > 0 &&
                (onloadData.maritalStatusdropdownlist?.length ?? 0) > 0 &&
                (onloadData.religiondropdownlist?.length ?? 0) > 0 &&
                (onloadData.casteCategorydropdownlist?.length ?? 0) > 0 &&
                (onloadData.castedropdownlist?.length ?? 0) > 0;
            
            if (hasBasicOptions && formDefaultValues) {
                // Removed debug log
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    // Explicitly set dropdown values to ensure Select components recognize them
                    if (formDefaultValues.typeOfEmployment) setValue('typeOfEmployment', formDefaultValues.typeOfEmployment, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.employeeGroup) setValue('employeeGroup', formDefaultValues.employeeGroup, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.school) setValue('school', formDefaultValues.school, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.designation) setValue('designation', formDefaultValues.designation, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.grade) setValue('grade', formDefaultValues.grade, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.gender) setValue('gender', formDefaultValues.gender, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.maritalStatus) setValue('maritalStatus', formDefaultValues.maritalStatus, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.religion) setValue('religion', formDefaultValues.religion, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.casteCategory) setValue('casteCategory', formDefaultValues.casteCategory, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.caste) setValue('caste', formDefaultValues.caste, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.bloodGroup) setValue('bloodGroup', formDefaultValues.bloodGroup, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.salaryType) setValue('salaryType', formDefaultValues.salaryType, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.modeOfPayment) setValue('modeOfPayment', formDefaultValues.modeOfPayment, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.teachingNonTeaching) setValue('teachingNonTeaching', formDefaultValues.teachingNonTeaching, { shouldValidate: false, shouldDirty: false });
                });
            }
        }
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, onloadData, formDefaultValues, setValue]);

    // Set address dropdown values after countries and states are loaded
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && onloadData) {
            const countriesCount = onloadData.countrydropdownlist?.length || 0;
            const statesCount = Array.isArray(onloadData.AllState) ? onloadData.AllState.length : 0; // AllState might be null
            const hasCountries = countriesCount > 0;
            // States might be filtered by country, so we'll set them separately
            
            // Debug: Check what state-related properties exist
            const stateProperties = Object.keys(onloadData || {}).filter(k => k.toLowerCase().includes('state'));
            
            if (hasCountries && formDefaultValues) {
                requestAnimationFrame(() => {
                    // Set countries first (they're available)
                    if (formDefaultValues.contactCountry) {
                        setValue('contactCountry', formDefaultValues.contactCountry, { shouldValidate: false, shouldDirty: false });
                    }
                    if (formDefaultValues.permanentCountry) {
                        setValue('permanentCountry', formDefaultValues.permanentCountry, { shouldValidate: false, shouldDirty: false });
                    }
                    
                    // Set states even if options aren't loaded yet - they'll appear when options load
                    if (formDefaultValues.contactState) {
                        setValue('contactState', formDefaultValues.contactState, { shouldValidate: false, shouldDirty: false });
                    }
                    if (formDefaultValues.permanentState) {
                        setValue('permanentState', formDefaultValues.permanentState, { shouldValidate: false, shouldDirty: false });
                    }
                });
            }
        }
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, onloadData, formDefaultValues, setValue]);
    
    // Set states when they become available (might load after country is selected or separately)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && onloadData) {
            const statesCount = Array.isArray(onloadData.AllState) ? onloadData.AllState.length : 0; // AllState might be null
            if (statesCount > 0 && formDefaultValues) {
                requestAnimationFrame(() => {
                    if (formDefaultValues.contactState) {
                        setValue('contactState', formDefaultValues.contactState, { shouldValidate: false, shouldDirty: false });
                    }
                    if (formDefaultValues.permanentState) {
                        setValue('permanentState', formDefaultValues.permanentState, { shouldValidate: false, shouldDirty: false });
                    }
                });
            }
        }
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, onloadData?.AllState?.length, formDefaultValues, setValue]);
    
    // Monitor when countries are selected to check if states become available
    useEffect(() => {
        // Removed debug logs
    }, [contactCountry, permanentCountry, onloadData?.AllState]);

    // Set bank details after banks are loaded
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && onloadData) {
            const hasBankOptions = (onloadData.bankdropdownlist?.length ?? 0) > 0;
            
            // Debug: Check what bank-related properties exist in employee data
            const bankProperties = Object.keys(employeeDetails || {}).filter(k => k.toLowerCase().includes('bank'));
            const allBankFields = Object.keys(employeeDetails).filter(k => k.toLowerCase().includes('bank')).reduce((acc, k) => ({ ...acc, [k]: (employeeDetails as any)[k] }), {});
            
            // Check for bank details in employee data
            const employeeBankDetails = (employeeDetails as any).employeebankDetails || [];
            const hasBankAccountNo = employeeDetails.HRME_BankAccountNo;
            
            if (hasBankOptions && (hasBankAccountNo || employeeBankDetails.length > 0)) {
                
                let bankId = '';
                let bankAccountNo = '';
                
                // First, check if bank ID is directly in employee details
                const directBankId = (employeeDetails as any).HRME_BankId || 
                                    (employeeDetails as any).HRMBD_Id || 
                                    (employeeDetails as any).BankId || 
                                    (employeeDetails as any).bankId;
                
                if (directBankId) {
                    bankId = directBankId.toString();
                    bankAccountNo = employeeDetails.HRME_BankAccountNo || '';
                }
                // Second, try to get bank details from employeebankDetails array
                else if (employeeBankDetails.length > 0) {
                    const firstBank = employeeBankDetails[0];
                    
                    // Try multiple possible field names for bank ID
                    bankId = (firstBank.HRMBD_Id || 
                             firstBank.BankId || 
                             firstBank.bankId || 
                             firstBank.HRMEB_BankId ||
                             firstBank.employerBankName ||
                             '').toString();
                    
                    bankAccountNo = firstBank.HRMEB_AccountNo || 
                                   firstBank.AccountNo || 
                                   firstBank.accountNo ||
                                   firstBank.bankAccountNo ||
                                   employeeDetails.HRME_BankAccountNo || 
                                   '';
                } 
                // Third, try to find bank ID by matching account number in bank list
                else if (hasBankAccountNo) {
                    // Try to find bank ID by matching account number in bank list
                    bankAccountNo = employeeDetails.HRME_BankAccountNo || '';
                    
                    // Normalize account numbers for comparison (remove spaces, leading zeros, etc.)
                    const normalizeAccountNo = (accNo: string | number | null | undefined): string => {
                        if (!accNo) return '';
                        return accNo.toString().trim().replace(/\s+/g, '').replace(/^0+/, '');
                    };
                    
                    const normalizedEmployeeAccount = normalizeAccountNo(bankAccountNo);
                    
                    const matchingBank = onloadData.bankdropdownlist?.find((bank: any) => {
                        const bankAccountNoFromList = bank.HRMBD_BankAccountNo || bank.BankAccountNo || bank.bankAccountNo;
                        const normalizedBankAccount = normalizeAccountNo(bankAccountNoFromList);
                        
                        // Try exact match first
                        const exactMatch = bankAccountNoFromList === bankAccountNo || 
                                         bankAccountNoFromList?.toString() === bankAccountNo?.toString();
                        
                        // Try normalized match
                        const normalizedMatch = normalizedBankAccount === normalizedEmployeeAccount && normalizedEmployeeAccount !== '';
                        
                        return exactMatch || normalizedMatch;
                    });
                    
                    if (matchingBank) {
                        bankId = (matchingBank.HRMBD_Id || matchingBank.BankId || matchingBank.id || '').toString();
                    }
                }
                
                // Update bank details with found bank ID
                // Only set bank ID if we found one, otherwise leave it empty for manual selection
                if (bankAccountNo) {
                    const updatedBankDetails = [{
                        bankAccountNo: bankAccountNo,
                        employerBankName: bankId || '', // Set bank ID here (empty string if not found - user will need to select manually)
                        accountType: 'default'
                    }];
                    
                    // Use requestAnimationFrame to ensure DOM is ready
                    requestAnimationFrame(() => {
                        setValue('bankDetails', updatedBankDetails, { shouldValidate: false, shouldDirty: false });
                    });
                }
            }
        }
    }, [isEditMode, employeeDetails?.HRME_Id, employeeDetails?.HRME_BankAccountNo, (employeeDetails as any)?.employeebankDetails, isLoadingEmployee, isLoadingOnload, onloadData, setValue]);

    // Set qualification details after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues) {
            const qualificationDetails = formDefaultValues.qualificationDetails || [];
            if (qualificationDetails.length > 0) {
                requestAnimationFrame(() => {
                    setValue('qualificationDetails', qualificationDetails, { shouldValidate: false, shouldDirty: false });
                });
            }
        }
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, formDefaultValues?.qualificationDetails, setValue]);

    // Set experience details after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues) {
            const experienceDetails = formDefaultValues.experienceDetails || [];
            if (experienceDetails.length > 0) {
                requestAnimationFrame(() => {
                    setValue('experienceDetails', experienceDetails, { shouldValidate: false, shouldDirty: false });
                });
            }
        }
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, formDefaultValues?.experienceDetails, setValue]);

    // Set document details after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues) {
            const documentList = formDefaultValues.documentList || [];
            if (documentList.length > 0) {
                requestAnimationFrame(() => {
                    setValue('documentList', documentList, { shouldValidate: false, shouldDirty: false });
                });
            }
        }
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, formDefaultValues?.documentList, setValue]);

    // Set medical fields after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues) {
            console.log('🔍 [MEDICAL EDIT] Setting medical fields:', {
                employeeId: employeeDetails?.HRME_Id,
                formDefaultValues: {
                    employeeHeight: formDefaultValues.employeeHeight,
                    employeeHeightUnit: formDefaultValues.employeeHeightUnit,
                    employeeWeight: formDefaultValues.employeeWeight,
                    employeeWeightUnit: formDefaultValues.employeeWeightUnit,
                    eyeSightIssue: formDefaultValues.eyeSightIssue,
                    anyHealthIssue: formDefaultValues.anyHealthIssue,
                    identificationMark: formDefaultValues.identificationMark
                },
                employeeDetails: {
                    HRME_Height: employeeDetails.HRME_Height,
                    HRME_HeightUOM: employeeDetails.HRME_HeightUOM,
                    HRME_Weight: employeeDetails.HRME_Weight,
                    HRME_WeightUOM: employeeDetails.HRME_WeightUOM,
                    HRME_EyeSightIssue: employeeDetails.HRME_EyeSightIssue,
                    HRME_AnyHealthIssue: employeeDetails.HRME_AnyHealthIssue,
                    HRME_IdentificationMark: employeeDetails.HRME_IdentificationMark
                }
            });
            
            // Set medical fields explicitly (set even if empty to ensure they're bound)
            requestAnimationFrame(() => {
                setValue('employeeHeight', formDefaultValues.employeeHeight || '', { shouldValidate: false, shouldDirty: false });
                setValue('employeeHeightUnit', formDefaultValues.employeeHeightUnit || '', { shouldValidate: false, shouldDirty: false });
                setValue('employeeWeight', formDefaultValues.employeeWeight || '', { shouldValidate: false, shouldDirty: false });
                setValue('employeeWeightUnit', formDefaultValues.employeeWeightUnit || '', { shouldValidate: false, shouldDirty: false });
                setValue('eyeSightIssue', formDefaultValues.eyeSightIssue || '', { shouldValidate: false, shouldDirty: false });
                setValue('anyHealthIssue', formDefaultValues.anyHealthIssue || '', { shouldValidate: false, shouldDirty: false });
                setValue('identificationMark', formDefaultValues.identificationMark || '', { shouldValidate: false, shouldDirty: false });
                
                // Verify they were set
                const currentValues = watch(['employeeHeight', 'employeeHeightUnit', 'employeeWeight', 'employeeWeightUnit', 'eyeSightIssue', 'anyHealthIssue', 'identificationMark']);
                console.log('🔍 [MEDICAL EDIT] Verified - Current form values:', currentValues);
            });
        }
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, formDefaultValues, setValue, watch]);

    // Set other details fields after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues) {
            console.log('🔍 [OTHER DETAILS EDIT] Setting other details fields:', {
                employeeId: employeeDetails?.HRME_Id,
                formDefaultValues: {
                    biometricCode: formDefaultValues.biometricCode,
                    rfCardId: formDefaultValues.rfCardId,
                    punchRelaxation: formDefaultValues.punchRelaxation,
                    stopPension: formDefaultValues.stopPension,
                    dateOfStopPension: formDefaultValues.dateOfStopPension,
                    msTeamsUserName: formDefaultValues.msTeamsUserName,
                    msTeamsPassword: formDefaultValues.msTeamsPassword,
                    employeeLeft: formDefaultValues.employeeLeft,
                    lastWorkingDay: formDefaultValues.lastWorkingDay,
                    reasonForLeaving: formDefaultValues.reasonForLeaving
                },
                employeeDetails: {
                    HRME_BiometricCode: employeeDetails.HRME_BiometricCode,
                    HRME_RFCardId: employeeDetails.HRME_RFCardId,
                    HRME_ExcPunch: employeeDetails.HRME_ExcPunch,
                    HRME_RetiredFlg: employeeDetails.HRME_RetiredFlg,
                    HRME_PensionStoppedDate: employeeDetails.HRME_PensionStoppedDate,
                    HRME_MSTeamsUserId: employeeDetails.HRME_MSTeamsUserId,
                    HRME_MSTeamsPassword: employeeDetails.HRME_MSTeamsPassword,
                    HRME_LeftFlag: employeeDetails.HRME_LeftFlag,
                    HRME_DOL: employeeDetails.HRME_DOL,
                    HRME_LeavingReason: employeeDetails.HRME_LeavingReason
                }
            });
            
            // Set other details fields explicitly (set even if empty to ensure they're bound)
            requestAnimationFrame(() => {
                setValue('biometricCode', formDefaultValues.biometricCode || '', { shouldValidate: false, shouldDirty: false });
                setValue('rfCardId', formDefaultValues.rfCardId || '', { shouldValidate: false, shouldDirty: false });
                setValue('punchRelaxation', formDefaultValues.punchRelaxation || false, { shouldValidate: false, shouldDirty: false });
                setValue('stopPension', formDefaultValues.stopPension || false, { shouldValidate: false, shouldDirty: false });
                setValue('dateOfStopPension', formDefaultValues.dateOfStopPension || '', { shouldValidate: false, shouldDirty: false });
                setValue('msTeamsUserName', formDefaultValues.msTeamsUserName || '', { shouldValidate: false, shouldDirty: false });
                setValue('msTeamsPassword', formDefaultValues.msTeamsPassword || '', { shouldValidate: false, shouldDirty: false });
                setValue('employeeLeft', formDefaultValues.employeeLeft || false, { shouldValidate: false, shouldDirty: false });
                setValue('lastWorkingDay', formDefaultValues.lastWorkingDay || '', { shouldValidate: false, shouldDirty: false });
                setValue('reasonForLeaving', formDefaultValues.reasonForLeaving || '', { shouldValidate: false, shouldDirty: false });
                
                // Verify they were set
                const currentValues = watch(['biometricCode', 'rfCardId', 'punchRelaxation', 'stopPension', 'dateOfStopPension', 'msTeamsUserName', 'msTeamsPassword', 'employeeLeft', 'lastWorkingDay', 'reasonForLeaving']);
                console.log('🔍 [OTHER DETAILS EDIT] Verified - Current form values:', currentValues);
            });
        }
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, formDefaultValues, setValue, watch]);

    // Set photo when employee details load
    useEffect(() => {
        if (employeeDetails?.HRME_Photo && isEditMode) {
            setSelectedPhoto(employeeDetails.HRME_Photo);
        }
    }, [employeeDetails, isEditMode]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Maps form field names (from tabs) to API field names
     */
    const mapFormDataToApiFormat = (data: FormFields): SavePersonalDetailsRequest => {

        // Get mobile and email from arrays (take first/default)
        const defaultMobile = data.mobileDetails?.[0]?.mobileNo || '';
        const defaultEmail = data.emailDetails?.[0]?.emailId || '';

        // Get bank account from bank details (take first/default)
        const defaultBankAccount = data.bankDetails?.[0]?.bankAccountNo || '';

        const payload: SavePersonalDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRME_Id: isEditMode && savedEmployeeId ? savedEmployeeId : 0, // Use employee ID for edit, 0 for new
            MI_Id: HRMS_MI_ID,
            dmoObj: {}, // Required by API
            // Employee basic info
            HRME_EmployeeFirstName: data.firstName || '',
            HRME_EmployeeMiddleName: data.middleName || '',
            HRME_EmployeeLastName: data.lastName || '',
            HRME_EmployeeCode: data.employeeCode || '',
            HRME_FatherName: data.fatherName || '',
            HRME_MotherName: data.motherName || '',
            HRME_SpouseName: (data as any).spouseName || '',
            HRME_SpouseOccupation: (data as any).spouseOccupation || '',
            HRME_SpouseMobileNo: Number((data as any).spouseMobileNo) || 0,
            HRME_SpouseEmailId: (data as any).spouseEmailId || '',
            HRME_SpouseAddress: (data as any).spouseAddress || '',
            // Employee type/group/department/designation (convert string IDs to numbers)
            HRMET_Id: Number(data.typeOfEmployment) || 0,
            HRMGT_Id: Number(data.employeeGroup) || 0,
            HRMD_Id: Number(data.school) || 0,
            HRMDES_Id: Number(data.designation) || 0,
            HRMG_Id: Number(data.grade) || 0,
            // Dates
            HRME_DOB: data.dateOfBirth || '',
            HRME_DOJ: data.dateOfJoining || '',
            HRME_DOC: data.dateOfConfirmation || '',
            HRME_ExpectedRetirementDate: data.dateOfRetirement || '',
            // Personal details
            IVRMMG_Id: Number(data.gender) || 0,
            IVRMMMS_Id: Number(data.maritalStatus) || 0,
            ReligionId: Number(data.religion) || 0,
            CasteCategoryId: Number(data.casteCategory) || 0,
            CasteId: Number(data.caste) || 0,
            HRME_BloodGroup: data.bloodGroup || '',
            HRME_SalaryType: data.salaryType || '',
            HRME_PaymentType: data.modeOfPayment || '',
            HRME_SubjectsTaught: data.subjectTaught || '',
            // Contact info
            HRME_MobileNo: Number(defaultMobile) || 0,
            HRME_EmailId: defaultEmail || '',
            // Address - Local/Contact Address
            HRME_LocStreet: data.contactAddress || '',
            HRME_LocArea: data.contactArea || '',
            HRME_LocCity: data.contactCity || '',
            HRME_LocAdd4: '', // Not in form
            HRME_LocStateId: Number(data.contactState) || 0,
            HRME_LocCountryId: Number(data.contactCountry) || 0,
            HRME_LocPincode: Number(data.contactPincode) || 0,
            // Address - Permanent Address
            HRME_PerStreet: data.permanentAddress || '',
            HRME_PerArea: data.permanentArea || '',
            HRME_PerCity: data.permanentCity || '',
            HRME_PerAdd4: '', // Not in form
            HRME_PerStateId: Number(data.permanentState) || 0,
            HRME_PerCountryId: Number(data.permanentCountry) || 0,
            HRME_PerPincode: Number(data.permanentPincode) || 0,
            // PF Details
            HRME_PFApplicableFlag: data.pfApplicable || false,
            HRME_PFMaxFlag: data.pfMaxAmount || false,
            HRME_PFFixedFlag: data.pfFixedAmount || false,
            HRME_PFAccNo: data.pfAccNo || '',
            HRME_UINumber: data.uanNumber || '',
            HRME_PFDate: data.pfDate || '',
            // ESI Details
            HRME_ESIApplicableFlag: data.esiApplicable || false,
            HRME_ESIAccNo: data.esiAccNo || '',
            HRME_GratuityAccNo: data.gratuityAccNo || '',
            HRME_ESIDate: data.esiDate || '',
            // Other flags
            HRME_EPFNotApplicableFlg: !data.epf,
            HRME_FPFNotApplicableFlg: !data.ppf,
            HRME_PHDResearchGuideFlg: data.phdResearchGuide || false,
            HRME_RGRecognitionYear: Number(data.recognitionYear) || 0,
            HRME_TechNonTeachingFlg: data.teachingNonTeaching === 'Non Teaching' ? 'Non Teaching' : 'Teaching',
            HRME_NationalSSN: data.nationalSSN || '',
            HRME_PANCardNo: data.panCardNo || '',
            HRME_AadharCardNo: Number(data.aadharNo) || 0,
            HRME_BankAccountNo: defaultBankAccount || '',
            HRME_BiometricCode: data.biometricCode || '',
            HRME_RFCardId: data.rfCardId || '',
            HRME_Photo: selectedPhoto || '', // Base64 photo
            HRME_ActiveFlag: true,
            HRME_LeftFlag: data.employeeLeft || false,
            HRME_DOL: data.lastWorkingDay || null,
            HRME_LeavingReason: data.reasonForLeaving || '',
            HRME_Height: data.employeeHeight || '',
            HRME_HeightUOM: data.employeeHeightUnit || '',
            HRME_Weight: Number(data.employeeWeight) || 0,
            HRME_WeightUOM: data.employeeWeightUnit || '',
            HRME_IdentificationMark: data.identificationMark || '',
            HRME_AnyHealthIssue: data.anyHealthIssue || '',
            HRME_EyeSightIssue: data.eyeSightIssue || '',
            HRME_SubstituteFlag: false,
            HRME_EmployeeOrder: 0,
            HRME_TransfferedTo: 0,
            HRME_RecordTransferredFlg: false,
            HRME_MSTeamsUserId: data.msTeamsUserName || '',
            HRME_MSTeamsEmailId: '',
            HRME_MSTeamsPassword: data.msTeamsPassword || '',
            HRME_ExcPunch: data.punchRelaxation || false,
            HRME_RetiredFlg: data.stopPension || false,
            HRME_PensionStoppedDate: data.dateOfStopPension || null,
            HRME_AllowSoftwareAccessFlg: false
        };

        return payload;
    };

    const onSubmit = async (data: FormFields) => {
        try {
            // Employee Tab: Just validate and move to Address tab (no API call)
            if (activeTab === 'employee') {
                // Check if there are any validation errors
                const errorCount = Object.keys(errors).length;
                if (errorCount > 0) {
                    toast.error(`Please fix ${errorCount} validation error(s) before proceeding`);
                    return;
                }
                
                toast.success('Employee details validated. Please fill Address details.');
                setActiveTab('address');
                return;
            }
            
            // Address Tab: Save Employee + Address together (same endpoint)
            if (activeTab === 'address') {
                const payload = mapFormDataToApiFormat(data);
                // Removed debug log
                savePersonalDetails(payload, {
                    onSuccess: async (response) => {
                        const responseData = (response as any)?.data;
                        const responseMessage = (response as any)?.message;
                        
                        // Check for duplicate employee code
                        if (responseData === 'Duplicate' || responseMessage === 'Duplicate') {
                            toast.error('Employee code already exists. Please use a different code.');
                            return;
                        }
                        
                        if (responseData === 'Add' || responseMessage === 'Add') {
                            toast.success('Employee and Address saved successfully!');
                            setActiveTab('qualification');
                            return;
                        }
                        
                        if (responseData === 'Update' || responseMessage === 'Update') {
                            toast.success('Employee and Address updated successfully!');
                            setActiveTab('qualification');
                            return;
                        }
                        
                        // Fallback for other success responses
                        if ((response as any)?.success) {
                            toast.success('Employee and Address details saved successfully');
                            setActiveTab('qualification');
                        }
                    },
                    onError: (error: any) => {
                        console.error('🔍 [SAVE] ERROR:', error?.message);
                        toast.error(error.message || 'Failed to save employee details');
                    }
                });
                return;
            }
            
            // Qualification Tab: Save qualification details
            if (activeTab === 'qualification') {
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setActiveTab('employee');
                    return;
                }

                const qualificationDetails = data.qualificationDetails || [];

                if (qualificationDetails.length === 0) {
                    toast.error('Please add at least one qualification');
                    return;
                }

                // Map form data to API format
                const qualificationsPayload = qualificationDetails.map((qual: any) => {
                    const cgpaValue = qual.cgpa || '';
                    const isPercentage = qual.cgpaOrPercentage === 'Percentage';
                    
                    // Ensure numeric fields are properly converted
                    const courseId = qual.course ? Number(qual.course) : 0;
                    const yearOfPassing = qual.yearOfPassing ? Number(qual.yearOfPassing) : 0;
                    const countryId = qual.qualificationCountry ? Number(qual.qualificationCountry) : 0;
                    const stateId = qual.qualificationState ? Number(qual.qualificationState) : 0;
                    const registrationYear = qual.registrationYear ? Number(qual.registrationYear) : 0;
                    const hrmEqId = qual.HRMEQ_Id ? Number(qual.HRMEQ_Id) : 0;
                    
                    // Validate required fields
                    if (!courseId) {
                        toast.error('Course is required for all qualifications');
                        throw new Error('Course is required');
                    }
                    if (!yearOfPassing) {
                        toast.error('Year of Passing is required for all qualifications');
                        throw new Error('Year of Passing is required');
                    }
                    if (!countryId) {
                        toast.error('Country is required for all qualifications');
                        throw new Error('Country is required');
                    }
                    // Check if states are available before requiring state
                    const statesAvailable = options.states && options.states.length > 0;
                    if (!stateId && statesAvailable) {
                        toast.error('State is required. Please select a state from the dropdown.');
                        throw new Error('State is required');
                    }
                    
                    return {
                        CreatedDate: new Date().toISOString(),
                        UpdatedDate: new Date().toISOString(),
                        HRMEQ_Id: hrmEqId,
                        MI_Id: HRMS_MI_ID,
                        HRMC_Id: courseId,
                        HRME_Id: savedEmployeeId,
                        HRME_QualificationName: qual.qualification || '',
                        HRMEQ_CollegeName: qual.college || '',
                        HRMEQ_UniversityName: qual.university || '',
                        HRMEQ_YearOfPassing: yearOfPassing,
                        HRMEQ_RegistrationNo: qual.registrationNo || '',
                        HRMEQ_Result: qual.result || '',
                        HRMEQ_CGPAOrPerFlag: qual.cgpaOrPercentage || 'CGPA',
                        HRMEQ_CGPA: isPercentage ? '' : cgpaValue,
                        HRMEQ_Percentage: isPercentage ? cgpaValue : '',
                        HRMEQ_AreaOfSpecialisation: qual.areaOfSpecialisation || '',
                        HRMEQ_MedicalCouncil: qual.medicalCouncil || '',
                        HRMEQ_Date: qual.qualifiedDate || '',
                        HRMEQ_Hardcopy: '',
                        HRMEQ_PHDFlg: qual.phdFlag || false,
                        HRMEQ_StateId: stateId,
                        HRMEQ_CountryId: countryId,
                        HRMEQ_ThesisTitle: qual.thesisTitle || '',
                        HRMEQ_RegistrationYear: registrationYear,
                        HRMEQ_GuideName: qual.guideName || '',
                        retrunMsg: ''
                    };
                });

                saveQualificationDetails(qualificationsPayload, {
                    onSuccess: (response) => {
                        toast.success('Qualification details saved successfully!');
                        setActiveTab('experience');
                    },
                    onError: (error: any) => {
                        toast.error(error.message || 'Failed to save qualification details');
                    }
                });
                return;
            }
            
            // Experience Tab: Save experience details
            if (activeTab === 'experience') {
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setActiveTab('employee');
                    return;
                }

                const experienceDetails = data.experienceDetails || [];

                if (experienceDetails.length === 0) {
                    toast.error('Please add at least one experience');
                    return;
                }

                // Map form data to API format
                const experiencesPayload = experienceDetails.map((exp: any) => ({
                    CreatedDate: new Date().toISOString(),
                    UpdatedDate: new Date().toISOString(),
                    HRMEE_Id: exp.HRMEE_Id ? Number(exp.HRMEE_Id) : 0,
                    MI_Id: HRMS_MI_ID,
                    HRME_Id: savedEmployeeId,
                    HRMEE_OrganisationName: exp.organisationName || '',
                    HRMEE_OrganisationAddress: exp.organisationAddress || '',
                    HRMEE_Department: exp.department || '',
                    HRMEE_Designation: exp.designation || '',
                    HRMEE_JoinDate: exp.joinDate || '',
                    HRMEE_ExitDate: exp.exitDate || '',
                    HRMEE_NoOfYears: exp.noOfYears ? Number(exp.noOfYears) : 0,
                    HRMEE_NoOfMonths: exp.noOfMonths ? Number(exp.noOfMonths) : 0,
                    HRMEE_AnnualSalary: exp.annualSalary ? Number(exp.annualSalary) : 0,
                    HRMEE_ReasonForLeaving: exp.reasonForLeaving || '',
                    retrunMsg: ''
                }));

                saveExperienceDetails(experiencesPayload, {
                    onSuccess: (response) => {
                        toast.success('Experience details saved successfully!');
                        setActiveTab('document');
                    },
                    onError: (error: any) => {
                        toast.error(error.message || 'Failed to save experience details');
                    }
                });
                return;
            }
            
            // Document Tab: Save document details
            if (activeTab === 'document') {
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setActiveTab('employee');
                    return;
                }

                const documentList = data.documentList || [];

                if (documentList.length === 0) {
                    toast.error('Please add at least one document');
                    return;
                }

                // Map form data to API format
                const documentsPayload = documentList.map((doc: any) => {
                    const documentName = doc.documentName || doc.name || '';
                    const documentImageName = doc.document?.[0]?.name || doc.imageName || '';
                    const documentDescription = doc.description || doc.documentDescription || '';
                    
                    return {
                        CreatedDate: new Date().toISOString(),
                        UpdatedDate: new Date().toISOString(),
                        HRMEDS_Id: doc.HRMEDS_Id ? Number(doc.HRMEDS_Id) : 0,
                        MI_Id: HRMS_MI_ID,
                        HRME_Id: savedEmployeeId,
                        HRMEDS_DocumentName: documentName,
                        HRMEDS_DocumentImageName: documentImageName,
                        HRMEDS_DucumentDescription: documentDescription,
                        retrunMsg: ''
                    };
                });

                saveDocumentDetails(documentsPayload, {
                    onSuccess: (response) => {
                        toast.success('Document details saved successfully!');
                        setActiveTab('medical');
                    },
                    onError: (error: any) => {
                        toast.error(error.message || 'Failed to save document details');
                    }
                });
                return;
            }
            
            // Medical Tab: Save medical details
            if (activeTab === 'medical') {
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setActiveTab('employee');
                    return;
                }

                // Medical endpoint requires full employee object, reuse the mapping function
                const payload = mapFormDataToApiFormat(data) as any;
                
                // Ensure HRME_Id is set
                payload.HRME_Id = savedEmployeeId;
                payload.CreatedDate = new Date().toISOString();
                payload.UpdatedDate = new Date().toISOString();

                console.log('🔍 [MEDICAL SAVE] Form - Preparing to save:', {
                    employeeId: savedEmployeeId,
                    medicalFields: {
                        height: data.employeeHeight,
                        heightUnit: data.employeeHeightUnit,
                        weight: data.employeeWeight,
                        weightUnit: data.employeeWeightUnit,
                        eyeSightIssue: data.eyeSightIssue,
                        anyHealthIssue: data.anyHealthIssue,
                        identificationMark: data.identificationMark
                    },
                    payloadKeys: Object.keys(payload),
                    payloadMedicalFields: {
                        HRME_Height: payload.HRME_Height,
                        HRME_HeightUOM: payload.HRME_HeightUOM,
                        HRME_Weight: payload.HRME_Weight,
                        HRME_WeightUOM: payload.HRME_WeightUOM,
                        HRME_EyeSightIssue: payload.HRME_EyeSightIssue,
                        HRME_AnyHealthIssue: payload.HRME_AnyHealthIssue,
                        HRME_IdentificationMark: payload.HRME_IdentificationMark
                    }
                });

                saveMedicalDetails(payload, {
                    onSuccess: (response) => {
                        console.log('🔍 [MEDICAL SAVE] Form - Save successful:', response);
                        toast.success('Medical details saved successfully!');
                        setActiveTab('other');
                    },
                    onError: (error: any) => {
                        console.error('🔍 [MEDICAL SAVE] Form - Save error:', error);
                        toast.error(error.message || 'Failed to save medical details');
                    }
                });
                return;
            }
            
            // Other Details Tab: Save via main employee endpoint (fields are part of employee object)
            if (activeTab === 'other') {
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setActiveTab('employee');
                    return;
                }

                // Other Details fields are part of the main employee object, so use the same endpoint
                const payload = mapFormDataToApiFormat(data) as any;
                
                // Ensure HRME_Id is set
                payload.HRME_Id = savedEmployeeId;
                payload.CreatedDate = new Date().toISOString();
                payload.UpdatedDate = new Date().toISOString();

                console.log('🔍 [OTHER DETAILS SAVE] Form - Preparing to save:', {
                    employeeId: savedEmployeeId,
                    otherDetailsFields: {
                        biometricCode: data.biometricCode,
                        rfCardId: data.rfCardId,
                        punchRelaxation: data.punchRelaxation,
                        stopPension: data.stopPension,
                        dateOfStopPension: data.dateOfStopPension,
                        msTeamsUserName: data.msTeamsUserName,
                        msTeamsPassword: data.msTeamsPassword,
                        employeeLeft: data.employeeLeft,
                        lastWorkingDay: data.lastWorkingDay,
                        reasonForLeaving: data.reasonForLeaving
                    }
                });
                
                // Log the payload to verify the fields are being mapped correctly
                console.log('🔍 [OTHER DETAILS SAVE] Form - Payload (other details fields):', {
                    HRME_BiometricCode: payload.HRME_BiometricCode,
                    HRME_RFCardId: payload.HRME_RFCardId,
                    HRME_ExcPunch: payload.HRME_ExcPunch,
                    HRME_RetiredFlg: payload.HRME_RetiredFlg,
                    HRME_PensionStoppedDate: payload.HRME_PensionStoppedDate,
                    HRME_MSTeamsUserId: payload.HRME_MSTeamsUserId,
                    HRME_MSTeamsPassword: payload.HRME_MSTeamsPassword ? '***' : '',
                    HRME_LeftFlag: payload.HRME_LeftFlag,
                    HRME_DOL: payload.HRME_DOL,
                    HRME_LeavingReason: payload.HRME_LeavingReason
                });

                savePersonalDetails(payload, {
                    onSuccess: (response) => {
                        console.log('🔍 [OTHER DETAILS SAVE] Form - Save successful:', response);
                        toast.success('Other details saved successfully!');
                        setActiveTab('payroll');
                    },
                    onError: (error: any) => {
                        console.error('🔍 [OTHER DETAILS SAVE] Form - Save error:', error);
                        toast.error(error.message || 'Failed to save other details');
                    }
                });
                return;
            }
            
            // Other tabs: Need employee to be saved first
            if (!savedEmployeeId) {
                toast.error('Please save Employee and Address details first');
                setActiveTab('employee');
            } else {
                toast.info(`Saving ${activeTab} tab data... (Not yet implemented)`);
            }
        } catch (error: any) {
            console.error('🔍 [SAVE] Submit error:', error);
            toast.error('An error occurred while submitting the form');
        }
    };

    // Clear form function - resets only the current tab's fields
    const clearForm = () => {
        const fieldsToClear: Partial<FormFields> = {};
        
        switch (activeTab) {
            case 'employee':
                // Clear only employee tab fields
                fieldsToClear.firstName = '';
                fieldsToClear.middleName = '';
                fieldsToClear.lastName = '';
                fieldsToClear.employeeCode = '';
                fieldsToClear.typeOfEmployment = '';
                fieldsToClear.employeeGroup = '';
                fieldsToClear.school = '';
                fieldsToClear.designation = '';
                fieldsToClear.grade = '';
                fieldsToClear.fatherName = '';
                fieldsToClear.motherName = '';
                fieldsToClear.dateOfBirth = '';
                fieldsToClear.dateOfJoining = '';
                fieldsToClear.dateOfConfirmation = '';
                fieldsToClear.dateOfRetirement = '';
                fieldsToClear.gender = '';
                fieldsToClear.maritalStatus = '';
                fieldsToClear.religion = '';
                fieldsToClear.casteCategory = '';
                fieldsToClear.caste = '';
                fieldsToClear.bloodGroup = '';
                fieldsToClear.salaryType = '';
                fieldsToClear.modeOfPayment = '';
                fieldsToClear.subjectTaught = '';
                fieldsToClear.epf = false;
                fieldsToClear.ppf = false;
                fieldsToClear.phdResearchGuide = false;
                fieldsToClear.recognitionYear = '';
                fieldsToClear.teachingNonTeaching = '';
                fieldsToClear.pfApplicable = false;
                fieldsToClear.pfMaxAmount = false;
                fieldsToClear.pfFixedAmount = false;
                fieldsToClear.pfAccNo = '';
                fieldsToClear.uanNumber = '';
                fieldsToClear.pfDate = '';
                fieldsToClear.esiApplicable = false;
                fieldsToClear.esiAccNo = '';
                fieldsToClear.gratuityAccNo = '';
                fieldsToClear.esiDate = '';
                fieldsToClear.nationalSSN = '';
                fieldsToClear.aadharNo = '';
                fieldsToClear.panCardNo = '';
                fieldsToClear.mobileDetails = [];
                fieldsToClear.emailDetails = [];
                fieldsToClear.bankDetails = [];
                
                // Clear photo only for employee tab
                setSelectedPhoto(null);
                setPhotoFile(null);
                const fileInput = document.getElementById('employeePhoto') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                break;
                
            case 'address':
                // Clear only address tab fields
                fieldsToClear.contactAddress = '';
                fieldsToClear.contactArea = '';
                fieldsToClear.contactCountry = '';
                fieldsToClear.contactState = '';
                fieldsToClear.contactCity = '';
                fieldsToClear.contactPincode = '';
                fieldsToClear.permanentAddress = '';
                fieldsToClear.permanentArea = '';
                fieldsToClear.permanentCountry = '';
                fieldsToClear.permanentState = '';
                fieldsToClear.permanentCity = '';
                fieldsToClear.permanentPincode = '';
                fieldsToClear.sameAsCommunicationAddress = false;
                break;
                
            case 'qualification':
                // Clear only qualification tab fields
                fieldsToClear.qualificationDetails = [];
                break;
                
            case 'experience':
                // Clear only experience tab fields
                fieldsToClear.experienceDetails = [];
                break;
                
            case 'document':
                // Clear only document tab fields
                fieldsToClear.documentList = [];
                break;
                
            case 'medical':
                // Clear only medical tab fields
                fieldsToClear.employeeHeight = '';
                fieldsToClear.employeeHeightUnit = '';
                fieldsToClear.employeeWeight = '';
                fieldsToClear.employeeWeightUnit = '';
                fieldsToClear.eyeSightIssue = '';
                fieldsToClear.anyHealthIssue = '';
                fieldsToClear.identificationMark = '';
                break;
                
            case 'other':
                // Clear only other details tab fields
                fieldsToClear.biometricCode = '';
                fieldsToClear.rfCardId = '';
                fieldsToClear.punchRelaxation = false;
                fieldsToClear.stopPension = false;
                fieldsToClear.dateOfStopPension = '';
                fieldsToClear.msTeamsUserName = '';
                fieldsToClear.msTeamsPassword = '';
                fieldsToClear.employeeLeft = false;
                fieldsToClear.lastWorkingDay = '';
                fieldsToClear.reasonForLeaving = '';
                break;
                
            default:
                toast.info('No fields to clear in this tab');
                return;
        }
        
        // Reset only the specific fields for the current tab
        Object.keys(fieldsToClear).forEach((key) => {
            setValue(key as keyof FormFields, fieldsToClear[key as keyof FormFields] as any, { shouldValidate: false });
        });
        
        // Format tab name for toast message
        const tabNames: Record<string, string> = {
            'employee': 'Employee',
            'address': 'Address',
            'qualification': 'Qualification',
            'experience': 'Experience',
            'document': 'Document',
            'medical': 'Medical',
            'other': 'Other Details'
        };
        
        toast.success(`${tabNames[activeTab] || activeTab} tab cleared successfully`);
    };

    // Prepare options for EmployeeTab and AddressTab (memoized to prevent unnecessary re-renders)
    const options = useMemo(() => {
        const opts = {
            empTypes: onloadData?.employeeTypedropdownlist || [],
            groupTypes: onloadData?.groupTypedropdownlist || [],
            departments: onloadData?.departmentdropdownlist || [],
            designations: onloadData?.designationdropdownlist || [],
            grades: onloadData?.gradedropdownlist || [],
            genders: onloadData?.genderdropdownlist || [],
            maritalStatuses: onloadData?.maritalStatusdropdownlist || [],
            religions: onloadData?.religiondropdownlist || [],
            casteCategories: onloadData?.casteCategorydropdownlist || [],
            castes: onloadData?.castedropdownlist || [],
            banks: onloadData?.bankdropdownlist || [],
            countries: onloadData?.countrydropdownlist || [],
            states: Array.isArray(onloadData?.AllState) ? onloadData.AllState : [], // AllState might be null, so check if it's an array
            courses: onloadData?.coursedropdownlist || [],
            specialisations: onloadData?.SpecialisationList || []
        };
        
        return opts;
    }, [onloadData]);
    

    if (isLoadingOnload || isLoadingEmployee) {
        return (
            <div className='flex items-center justify-center p-8'>
                <div className='text-muted-foreground'>
                    {isLoadingEmployee ? 'Loading employee data...' : 'Loading form data...'}
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <form 
                onSubmit={handleSubmit(onSubmit, (errors) => {
                    console.error('🔍 [CLIENT] Form validation failed:', errors);
                    const errorFields = Object.keys(errors);
                    const firstError = errors[errorFields[0] as keyof typeof errors];
                    toast.error(firstError?.message || `Please check ${errorFields.length} field(s) with errors`);
                })} 
                className='space-y-6'
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                    <TabsList className='grid w-full grid-cols-4 lg:grid-cols-8'>
                        <TabsTrigger value='employee'>Employee</TabsTrigger>
                        <TabsTrigger value='address'>Address</TabsTrigger>
                        <TabsTrigger value='qualification'>Qualification</TabsTrigger>
                        <TabsTrigger value='experience'>Experience</TabsTrigger>
                        <TabsTrigger value='document'>Document</TabsTrigger>
                        <TabsTrigger value='medical'>Medical</TabsTrigger>
                        <TabsTrigger value='other'>Other Details</TabsTrigger>
                        <TabsTrigger value='payroll' disabled={!savedEmployeeId}>
                            Payroll
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='employee' className='mt-4'>
                        <EmployeeTab
                            control={control}
                            register={register}
                            errors={errors}
                            selectedPhoto={selectedPhoto}
                            onPhotoUpload={handlePhotoUpload}
                            setSelectedPhoto={setSelectedPhoto}
                            setPhotoFile={setPhotoFile}
                            options={options}
                            isSubmitting={isSubmitting || isPending}
                            watch={watch}
                            onClear={clearForm}
                        />
                    </TabsContent>

                    <TabsContent value='address' className='mt-4'>
                        <AddressTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isPending}
                            watch={watch}
                            setValue={setValue}
                            countries={options.countries}
                            states={options.states}
                            onClear={clearForm}
                        />
                    </TabsContent>

                    <TabsContent value='qualification' className='mt-4'>
                        <QualificationTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isPending || isSavingQualification}
                            options={options}
                            countries={options.countries}
                            states={options.states}
                            onClear={clearForm}
                        />
                    </TabsContent>

                    <TabsContent value='experience' className='mt-4'>
                        <ExperienceTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isSavingExperience}
                            onClear={clearForm}
                        />
                    </TabsContent>

                    <TabsContent value='document' className='mt-4'>
                        <UploadDocumentTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isSavingDocument}
                            watch={watch}
                            onClear={clearForm}
                        />
                    </TabsContent>

                    <TabsContent value='medical' className='mt-4'>
                        <MedicalRecordTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isSavingMedical}
                            onClear={clearForm}
                        />
                    </TabsContent>

                    <TabsContent value='other' className='mt-4'>
                        <OtherDetailsTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isPending}
                            watch={watch}
                            onClear={clearForm}
                        />
                    </TabsContent>

                    <TabsContent value='payroll' className='mt-4'>
                        {savedEmployeeId && watch('employeeCode') ? (
                            <PayrollTab 
                                employeeId={savedEmployeeId} 
                                employeeCode={watch('employeeCode')} 
                            />
                        ) : (
                            <div className='rounded-md border p-6 text-center text-muted-foreground'>
                                Payroll tab will be available after saving employee details.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}
