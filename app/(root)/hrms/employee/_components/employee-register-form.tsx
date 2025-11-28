'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    useEmployeeRegisterById,
    useEmployeeRegisterOnload,
    useSaveEmployeeDocument,
    useSaveEmployeeExperience,
    useSaveEmployeeMedical,
    useSaveEmployeePersonalDetails,
    useSaveEmployeeQualification,
    useSaveEmployeeBankDetails
} from '@/hooks/hrms/useEmployeeRegister';
import type { EmployeeListItem } from '@/types/hrms/employee';
import type { SavePersonalDetailsRequest } from '@/types/hrms/employee-register';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { AddressTab } from './tabs/address-tab';
import { UploadDocumentTab } from './tabs/document-tab';
import { EmployeeTab } from './tabs/employee-tab';
import { ExperienceTab } from './tabs/experience-tab';
import { MedicalRecordTab } from './tabs/medical-tab';
import { OtherDetailsTab } from './tabs/other-details-tab';
import { PayrollTab } from './tabs/payroll-tab-new';
import { QualificationTab } from './tabs/qualification-tab';

// Helper functions for validation
const validateMobileNumber = (mobile: string) => {
    const cleaned = mobile.replace(/\D/g, ''); // Remove non-digits
    return cleaned.length === 10;
};

const validateAadharNumber = (aadhar: string) => {
    const cleaned = aadhar.replace(/\D/g, ''); // Remove non-digits
    return cleaned.length === 12;
};

const validatePANNumber = (pan: string) => {
    // PAN format: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
};

const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePincode = (pincode: string) => {
    const cleaned = pincode.replace(/\D/g, ''); // Remove non-digits
    return cleaned.length >= 5 && cleaned.length <= 10;
};

// Qualification details schema (using actual form field names)
const qualificationDetailSchema = z
    .object({
        qualification: z.string().min(1, 'Qualification is required').max(50, 'Qualification must not exceed 50 characters'),
        course: z.string().min(1, 'Course is required'),
        college: z.string().min(1, 'College is required').max(100, 'College must not exceed 100 characters'),
        university: z.string().min(1, 'University is required').max(100, 'University must not exceed 100 characters'),
        yearOfPassing: z
            .string()
            .min(1, 'Year of Passing is required')
            .refine((val) => {
                const year = Number.parseInt(val);
                return !Number.isNaN(year) && year >= 1900 && year <= new Date().getFullYear();
            }, 'Year of Passing must be a valid year'),
        qualificationCountry: z.string().min(1, 'Country is required'),
        qualificationState: z.string().min(1, 'State is required'),
        registrationNo: z.string().max(50, 'Registration No must not exceed 50 characters').optional(),
        result: z.string().min(1, 'Result is required').max(20, 'Result must not exceed 20 characters'),
        cgpaOrPercentage: z.string().min(1, 'CGPA or Percentage type is required'),
        cgpa: z.string().optional(),
        percentage: z.string().optional(),
        areaOfSpecialisation: z.string().optional(),
        phdFlag: z.boolean().optional(),
        medicalCouncil: z.string().max(50, 'Medical Council must not exceed 50 characters').optional(),
        thesisTitle: z.string().max(255, 'Thesis Title must not exceed 255 characters').optional(),
        registrationYear: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true;
                const year = Number.parseInt(val);
                return !Number.isNaN(year) && year >= 1900 && year <= new Date().getFullYear();
            }, 'Registration Year must be a valid year'),
        guideName: z.string().max(100, 'Guide Name must not exceed 100 characters').optional(),
        qualifiedDate: z.string().min(1, 'Qualified Date is required')
    })
    .refine(
        (data) => {
            // Validate CGPA or Percentage based on selected type
            if (data.cgpaOrPercentage === 'CGPA') {
                if (!data.cgpa) return false;
                const num = Number.parseFloat(data.cgpa);
                return !Number.isNaN(num) && num >= 0 && num <= 10;
            }
            if (data.cgpaOrPercentage === 'Percentage') {
                if (!data.percentage) return false;
                const num = Number.parseFloat(data.percentage);
                return !Number.isNaN(num) && num >= 0 && num <= 100;
            }
            return true;
        },
        {
            message: 'CGPA must be between 0-10 or Percentage must be between 0-100 based on selected type',
            path: ['cgpa']
        }
    );

// Experience details schema (using actual form field names)
const experienceDetailSchema = z
    .object({
        organisationName: z.string().min(1, 'Organisation Name is required').max(255, 'Organisation Name must not exceed 255 characters'),
        organisationAddress: z
            .string()
            .min(1, 'Organisation Address is required')
            .max(500, 'Organisation Address must not exceed 500 characters'),
        department: z.string().min(1, 'Department is required').max(100, 'Department must not exceed 100 characters'),
        designation: z.string().min(1, 'Designation is required').max(100, 'Designation must not exceed 100 characters'),
        joinDate: z.string().min(1, 'Date of Joining is required'),
        exitDate: z.string().min(1, 'Date of Leaving is required'),
        noOfYears: z.string().optional(),
        noOfMonths: z.string().optional(),
        annualSalary: z.string().optional(),
        reasonForLeaving: z.string().min(1, 'Reason For Leaving is required').max(500, 'Reason For Leaving must not exceed 500 characters')
    })
    .refine(
        (data) => {
            if (data.joinDate && data.exitDate) {
                return new Date(data.exitDate) >= new Date(data.joinDate);
            }
            return true;
        },
        {
            message: 'Exit Date must be on or after Join Date',
            path: ['exitDate']
        }
    );

// Document schema (using actual form field names)
const documentSchema = z.object({
    documentName: z.string().min(1, 'Name of Document is required').max(255, 'Name of Document must not exceed 255 characters'),
    documentDescription: z.string().min(1, 'Document Description is required').max(400, 'Document Description must not exceed 400 characters'),
    document: z
        .any()
        .optional()
        .refine((file) => {
            // Handle null/undefined (for edit mode when document is not changed)
            if (!file) return true;

            // Handle FileList - extract first file
            let actualFile: File | null = null;
            if (file instanceof FileList) {
                actualFile = file[0] || null;
            } else if (file instanceof File) {
                actualFile = file;
            } else if (Array.isArray(file) && file.length > 0 && file[0] instanceof File) {
                // Handle array of files (sometimes React Hook Form returns arrays)
                actualFile = file[0];
            } else {
                // For edit mode, document might be a string (existing file name) or other type
                // Allow it to pass validation if it's not a File/FileList
                return true;
            }

            if (!actualFile) return true;
            
            const maxSize = 2 * 1024 * 1024; // 2MB
            const allowedTypes = [
                'image/jpeg',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/pdf'
            ];
            return actualFile.size <= maxSize && allowedTypes.includes(actualFile.type);
        }, 'File must be JPEG, DOC, DOCX, or PDF and not exceed 2MB')
});

// Extended form schema to include all tab fields (using tab field names)
const formSchema = z
    .object({
        // Employee tab fields (using tab field names)
        firstName: z.string().min(1, 'Name of the Employee is required').max(100, 'Name must not exceed 100 characters'),
        middleName: z.string().max(100, 'Middle Name must not exceed 100 characters').optional(),
        lastName: z.string().max(100, 'Last Name must not exceed 100 characters').optional(),
        employeeCode: z.string().min(1, 'Employee Code is required').max(20, 'Employee Code must not exceed 20 characters'),
        typeOfEmployment: z.string().min(1, 'Type of Employment is required'),
        employeeGroup: z.string().min(1, 'Employee Group is required'),
        school: z.string().min(1, 'Department is required'),
        designation: z.string().min(1, 'Designation is required'),
        grade: z.string().min(1, 'Grade is required'),
        fatherName: z.string().min(1, "Father's Name is required").max(100, "Father's Name must not exceed 100 characters"),
        motherName: z.string().min(1, "Mother's Name is required").max(100, "Mother's Name must not exceed 100 characters"),
        dateOfBirth: z.string().min(1, 'Date of Birth is required'),
        dateOfJoining: z.string().min(1, 'Date of Joining is required'),
        dateOfConfirmation: z.string().optional(),
        dateOfRetirement: z.string().optional(),
        gender: z.string().min(1, 'Gender is required'),
        maritalStatus: z.string().min(1, 'Marital Status is required'),
        religion: z.string().min(1, 'Religion is required'),
        casteCategory: z.string().min(1, 'Caste Category is required'),
        caste: z.string().min(1, 'Caste is required'),
        bloodGroup: z.string().optional(),
        salaryType: z.string().optional(),
        modeOfPayment: z.string().min(1, 'Mode of Payment is required'),
        subjectTaught: z.string().optional(),
        epf: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        ppf: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        phdResearchGuide: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        recognitionYear: z.string().optional(),
        teachingNonTeaching: z.string().min(1, 'Teaching/Non-Teaching is required'),
        pfApplicable: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        ptMaxAmount: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true;
                const num = Number.parseFloat(val);
                return !Number.isNaN(num) && num >= 0;
            }, 'PT Max Amount must be a positive number'),
        pfMaxAmount: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        pfFixedAmount: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        pfAccNo: z.string().max(20, 'PF Acc. No. must not exceed 20 characters').optional(),
        uanNumber: z.string().max(20, 'UAN Number must not exceed 20 characters').optional(),
        pfDate: z.string().optional(),
        esiApplicable: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        esiAccNo: z.string().max(20, 'ESI Acc. No. must not exceed 20 characters').optional(),
        gratuityAccNo: z.string().max(20, 'Gratuity Acc No. must not exceed 20 characters').optional(),
        esiDate: z.string().optional(),
        nationalSSN: z.string().max(20, 'National SSN must not exceed 20 characters').optional(),
        aadharNo: z
            .string()
            .max(12, 'Aadhar No. must not exceed 12 characters')
            .optional()
            .refine((val) => {
                if (!val) return true;
                return validateAadharNumber(val);
            }, 'Aadhar No. must be a valid 12-digit number'),
        panCardNo: z
            .string()
            .max(10, 'PAN Card No. must not exceed 10 characters')
            .optional()
            .refine((val) => {
                if (!val) return true;
                return validatePANNumber(val);
            }, 'PAN Card No. must be in valid format (e.g., ABCDE1234F)'),
        mobileDetails: z
            .array(
                z.object({
                    mobileNo: z
                        .string()
                        .min(1, 'Mobile No. is required')
                        .max(15, 'Mobile No. must not exceed 15 characters')
                        .refine((val) => validateMobileNumber(val), 'Mobile No. must be a valid 10-digit number'),
                    type: z.string().optional()
                })
            )
            .min(1, 'At least one mobile number is required'),
        emailDetails: z
            .array(
                z.object({
                    emailId: z
                        .string()
                        .max(100, 'Email must not exceed 100 characters')
                        .refine((val) => {
                            if (!val) return true;
                            return validateEmail(val);
                        }, 'Email must be in valid format')
                        .optional(),
                    type: z.string().optional()
                })
            )
            .optional(),
        bankDetails: z
            .array(
                z.object({
                    employerBankName: z.string().min(1, 'Bank Name is required'),
                    bankAccountNo: z
                        .string()
                        .min(1, 'Bank Account No. is required')
                        .max(20, 'Bank Account No. must not exceed 20 characters'),
                    accountType: z.string().optional()
                })
            )
            .optional(),
        // Address tab fields (optional in base schema, will be validated conditionally)
        contactAddress: z.string().max(100, 'Contact Address must not exceed 100 characters').optional(),
        contactArea: z.string().optional(),
        contactCountry: z.string().optional(),
        contactState: z.string().optional(),
        contactCity: z.string().optional(),
        contactPincode: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true;
                return validatePincode(val);
            }, 'Pincode must be a valid numerical value (5-10 digits)'),
        permanentAddress: z.string().max(100, 'Permanent Address must not exceed 100 characters').optional(),
        permanentArea: z.string().optional(),
        permanentCountry: z.string().optional(),
        permanentState: z.string().optional(),
        permanentCity: z.string().optional(),
        permanentPincode: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true;
                return validatePincode(val);
            }, 'Pincode must be a valid numerical value (5-10 digits)'),
        sameAsCommunicationAddress: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        // Other tabs
        qualificationDetails: z.array(qualificationDetailSchema).optional(),
        experienceDetails: z.array(experienceDetailSchema).optional(),
        documentList: z.array(documentSchema).optional(),
        employeeHeight: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true;
                const num = Number.parseFloat(val);
                if (Number.isNaN(num) || num < 0) return false;
                // Validate DECIMAL(5,2) format: max 3 digits before decimal, 2 digits after
                const decimalRegex = /^\d{1,3}(\.\d{1,2})?$/;
                return decimalRegex.test(val.trim());
            }, 'Height must be a valid number (max 999.99)'),
        employeeHeightUnit: z.string().max(10, 'Unit of measure (Height) must not exceed 10 characters').optional(),
        employeeWeight: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true;
                const num = Number.parseFloat(val);
                if (Number.isNaN(num) || num < 0) return false;
                // Validate DECIMAL(5,2) format: max 3 digits before decimal, 2 digits after
                const decimalRegex = /^\d{1,3}(\.\d{1,2})?$/;
                return decimalRegex.test(val.trim());
            }, 'Weight must be a valid number (max 999.99)'),
        employeeWeightUnit: z.string().max(10, 'Unit of measure (Weight) must not exceed 10 characters').optional(),
        eyeSightIssue: z.string().max(255, 'Eye Sight Issue must not exceed 255 characters').optional(),
        anyHealthIssue: z.string().max(500, 'Any Health Issue must not exceed 500 characters').optional(),
        identificationMark: z.string().max(255, 'Identification Mark must not exceed 255 characters').optional(),
        biometricCode: z
            .string()
            .max(50, 'Biometric Code must not exceed 50 characters')
            .refine((val) => {
                if (!val) return true; // Allow empty (optional field)
                // Must be alpha-numeric (letters and numbers only)
                return /^[A-Za-z0-9]+$/.test(val);
            }, 'Biometric Code must be an alpha-numeric string')
            .optional(),
        rfCardId: z
            .string()
            .max(50, 'RF card ID must not exceed 50 characters')
            .refine((val) => {
                if (!val) return true; // Allow empty (optional field)
                // Must be alpha-numeric (letters and numbers only)
                return /^[A-Za-z0-9]+$/.test(val);
            }, 'RF card ID must be an alpha-numeric string')
            .optional(),
        punchRelaxation: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        stopPension: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        dateOfStopPension: z.string().optional(),
        msTeamsUserName: z.string().max(100, 'MS Teams UserName must not exceed 100 characters').optional(),
        msTeamsPassword: z.string().max(255, 'MS Teams Password must not exceed 255 characters').optional(),
        employeeLeft: z.preprocess((val) => val === true || val === 'on', z.boolean()).optional(),
        lastWorkingDay: z.string().optional(),
        reasonForLeaving: z.string().max(50, 'Reason for leaving must not exceed 50 characters').optional()
    })
    .refine(
        (data) => {
            // Validate Date of Confirmation must be after Date of Joining
            if (data.dateOfConfirmation && data.dateOfJoining) {
                return new Date(data.dateOfConfirmation) >= new Date(data.dateOfJoining);
            }
            return true;
        },
        {
            message: 'Date of Confirmation must be after Date of Joining',
            path: ['dateOfConfirmation']
        }
    )
    .refine(
        (data) => {
            // Validate Date of Stop Pension is required when Stop Pension is checked
            if (data.stopPension && !data.dateOfStopPension) {
                return false;
            }
            return true;
        },
        {
            message: 'Date of Stop Pension is required when Stop Pension is checked',
            path: ['dateOfStopPension']
        }
    )
    .refine(
        (data) => {
            // Validate lastWorkingDay and reasonForLeaving are required when employeeLeft is true
            if (data.employeeLeft) {
                if (!data.lastWorkingDay) {
                    return false;
                }
                if (!data.reasonForLeaving) {
                    return false;
                }
            }
            return true;
        },
        {
            message: 'Last Working Day and Reason for Leaving are required when Employee Left is checked',
            path: ['lastWorkingDay']
        }
    );

type FormFields = z.infer<typeof formSchema>;

interface EmployeeRegisterFormProps {
    selectedRow?: EmployeeListItem;
    onSuccess?: () => void;
    className?: string;
}

export default function EmployeeRegisterForm({ selectedRow, onSuccess, className = '' }: EmployeeRegisterFormProps) {
    const { data: onloadData, isLoading: isLoadingOnload } = useEmployeeRegisterOnload();

    // Removed non-qualification debug logs
    const { mutate: savePersonalDetails, isPending } = useSaveEmployeePersonalDetails();
    const { mutate: saveQualificationDetails, isPending: isSavingQualification } = useSaveEmployeeQualification();
    const { mutate: saveExperienceDetails, isPending: isSavingExperience } = useSaveEmployeeExperience();
    const { mutate: saveDocumentDetails, isPending: isSavingDocument } = useSaveEmployeeDocument();
    const { mutate: saveMedicalDetails, isPending: isSavingMedical } = useSaveEmployeeMedical();
    const { mutate: saveBankDetails, isPending: isSavingBank } = useSaveEmployeeBankDetails();
    const isEditMode = !!selectedRow;
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [_photoFile, setPhotoFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState('employee');
    const [savedEmployeeId, setSavedEmployeeId] = useState<number | null>(selectedRow?.HRME_Id || null);

    // Tab order for navigation
    const tabOrder = ['employee', 'address', 'qualification', 'experience', 'document', 'medical', 'other', 'payroll'];
    
    // Function to go to previous tab
    const handlePreviousTab = () => {
        const currentIndex = tabOrder.indexOf(activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabOrder[currentIndex - 1]);
        }
    };

    // Refs to track if we've already initialized form values to prevent infinite loops
    const hasInitializedDropdowns = useRef(false);
    const hasInitializedAddress = useRef(false);
    const hasInitializedBank = useRef(false);
    const hasInitializedArrays = useRef(false);
    const lastEmployeeId = useRef<number | null>(null);
    const resetInProgress = useRef(false);

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
                mobileDetails: [{ mobileNo: '', type: 'Default' }],
                emailDetails: [{ emailId: '', type: 'Default' }],
                bankDetails: [],
                dateOfBirth: '',
                dateOfRetirement: '' // Will be auto-calculated when DOB is set
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
            mobileDetails: emp.HRME_MobileNo ? [{ mobileNo: emp.HRME_MobileNo.toString(), type: 'Default' }] : [],
            emailDetails: emp.HRME_EmailId ? [{ emailId: emp.HRME_EmailId, type: 'Default' }] : [],
            // Bank details - map from employeebankDetails array
            bankDetails: (() => {
                const bankDetailsArray = (emp as any).employeebankDetails || [];
                if (bankDetailsArray.length > 0) {
                    return bankDetailsArray.map((bank: any) => ({
                        bankAccountNo: bank.HRMEB_AccountNo || bank.AccountNo || bank.accountNo || '',
                        employerBankName: bank.HRMBD_Id ? bank.HRMBD_Id.toString() : '',
                        accountType: bank.HRMEB_ActiveFlag === 'Y' ? 'Default' : 'Alternate'
                    }));
                }
                // Fallback to legacy HRME_BankAccountNo if employeebankDetails is not available
                return emp.HRME_BankAccountNo
                    ? [{ bankAccountNo: emp.HRME_BankAccountNo, employerBankName: '', accountType: 'Default' }]
                    : [];
            })(),

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
        getValues,
        setValue,
        trigger,
        setError,
        clearErrors,
        formState
    } = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        mode: 'onChange', // Validate immediately on change
        reValidateMode: 'onChange', // Re-validate on change
        defaultValues: formDefaultValues
    });

    const { errors, isSubmitting } = formState;

    // Removed debug logging to reduce console noise and improve performance

    // Watch for country changes using useWatch (more optimized, doesn't cause re-renders)
    const contactCountry = useWatch({ control, name: 'contactCountry' });
    const permanentCountry = useWatch({ control, name: 'permanentCountry' });

    // Update savedEmployeeId when selectedRow changes
    useEffect(() => {
        if (selectedRow?.HRME_Id) {
            setSavedEmployeeId(selectedRow.HRME_Id);
        }
    }, [selectedRow]);

    // Reset form when switching modes or when employee details load in edit mode
    // CRITICAL: Only reset once per employee ID change to prevent infinite loops
    useEffect(() => {
        // Only reset if we're not loading and have the necessary data
        // Also check if employee ID has changed to prevent unnecessary resets
        const currentEmployeeId = employeeDetails?.HRME_Id || null;
        const employeeIdChanged = lastEmployeeId.current !== currentEmployeeId;
        const isFirstLoad = lastEmployeeId.current === null && currentEmployeeId !== null;
        const shouldReset = employeeIdChanged || isFirstLoad;
        
        // Prevent multiple resets from happening simultaneously
        if (resetInProgress.current) {
            return;
        }
        
        // Don't reset if formDefaultValues hasn't been computed yet
        if (!formDefaultValues) {
            return;
        }
        
        if (!isLoadingEmployee && !isLoadingOnload && shouldReset) {
            resetInProgress.current = true;
            
            // Reset initialization flags when resetting
            hasInitializedDropdowns.current = false;
            hasInitializedAddress.current = false;
            hasInitializedBank.current = false;
            hasInitializedArrays.current = false;
            
            // Update lastEmployeeId BEFORE reset to prevent re-triggering
            lastEmployeeId.current = currentEmployeeId;
            
            // Use requestAnimationFrame to ensure reset happens after current render cycle
            requestAnimationFrame(() => {
                try {
                    if (isEditMode && employeeDetails) {
                        // Edit mode: reset with employee data
                        reset(formDefaultValues, { keepDefaultValues: false });
                    } else if (!isEditMode) {
                        // Add mode: reset to empty defaults
                        reset(formDefaultValues, { keepDefaultValues: false });
                    }
                } finally {
                    // Always clear the flag, even if reset fails
                    resetInProgress.current = false;
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload]); // DO NOT include formDefaultValues - it causes infinite loops

    // Ensure dropdown values are set after options are loaded (handles timing issues)
    useEffect(() => {
        // Reset initialization flag when employee ID changes
        if (lastEmployeeId.current !== employeeDetails?.HRME_Id) {
            hasInitializedDropdowns.current = false;
            hasInitializedAddress.current = false;
            hasInitializedBank.current = false;
            hasInitializedArrays.current = false;
            lastEmployeeId.current = employeeDetails?.HRME_Id || null;
        }

        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && onloadData && !hasInitializedDropdowns.current) {
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
                // Mark as initialized before setting values to prevent re-running
                hasInitializedDropdowns.current = true;
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    // Explicitly set dropdown values to ensure Select components recognize them
                    if (formDefaultValues.typeOfEmployment)
                        setValue('typeOfEmployment', formDefaultValues.typeOfEmployment, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.employeeGroup)
                        setValue('employeeGroup', formDefaultValues.employeeGroup, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.school)
                        setValue('school', formDefaultValues.school, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.designation)
                        setValue('designation', formDefaultValues.designation, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.grade) setValue('grade', formDefaultValues.grade, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.gender)
                        setValue('gender', formDefaultValues.gender, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.maritalStatus)
                        setValue('maritalStatus', formDefaultValues.maritalStatus, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.religion)
                        setValue('religion', formDefaultValues.religion, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.casteCategory)
                        setValue('casteCategory', formDefaultValues.casteCategory, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.caste) setValue('caste', formDefaultValues.caste, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.bloodGroup)
                        setValue('bloodGroup', formDefaultValues.bloodGroup, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.salaryType)
                        setValue('salaryType', formDefaultValues.salaryType, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.modeOfPayment)
                        setValue('modeOfPayment', formDefaultValues.modeOfPayment, { shouldValidate: false, shouldDirty: false });
                    if (formDefaultValues.teachingNonTeaching)
                        setValue('teachingNonTeaching', formDefaultValues.teachingNonTeaching, {
                            shouldValidate: false,
                            shouldDirty: false
                        });
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, onloadData, setValue]);

    // Set address dropdown values after countries and states are loaded
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && onloadData && !hasInitializedAddress.current) {
            const countriesCount = onloadData.countrydropdownlist?.length || 0;
            const _statesCount = Array.isArray(onloadData.AllState) ? onloadData.AllState.length : 0; // AllState might be null
            const hasCountries = countriesCount > 0;
            // States might be filtered by country, so we'll set them separately

            // Debug: Check what state-related properties exist
            const _stateProperties = Object.keys(onloadData || {}).filter((k) => k.toLowerCase().includes('state'));

            if (hasCountries && formDefaultValues) {
                hasInitializedAddress.current = true;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, onloadData, setValue]);

    // Set states when they become available (might load after country is selected or separately)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && onloadData && hasInitializedAddress.current) {
            const statesCount = Array.isArray(onloadData.AllState) ? onloadData.AllState.length : 0; // AllState might be null
            if (statesCount > 0 && formDefaultValues) {
                // Only set states if they haven't been set yet (check current form values using getValues to avoid re-renders)
                const currentContactState = getValues('contactState');
                const currentPermanentState = getValues('permanentState');
                
                requestAnimationFrame(() => {
                    if (formDefaultValues.contactState && !currentContactState) {
                        setValue('contactState', formDefaultValues.contactState, { shouldValidate: false, shouldDirty: false });
                    }
                    if (formDefaultValues.permanentState && !currentPermanentState) {
                        setValue('permanentState', formDefaultValues.permanentState, { shouldValidate: false, shouldDirty: false });
                    }
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isEditMode,
        employeeDetails?.HRME_Id,
        isLoadingEmployee,
        isLoadingOnload,
        onloadData?.AllState?.length,
        setValue,
        getValues
    ]);

    // Monitor when countries are selected to check if states become available
    // NOTE: This useEffect was causing infinite loops. Removed dependency on contactCountry/permanentCountry
    // States are now set in the previous useEffect when AllState becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // States are handled in the previous useEffect when AllState length changes
        // No action needed here to prevent infinite loops
    }, [onloadData?.AllState?.length]);

    // Set bank details after banks are loaded
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && onloadData && !hasInitializedBank.current) {
            const hasBankOptions = (onloadData.bankdropdownlist?.length ?? 0) > 0;

            // Debug: Check what bank-related properties exist in employee data
            const _bankProperties = Object.keys(employeeDetails || {}).filter((k) => k.toLowerCase().includes('bank'));
            const _allBankFields: Record<string, any> = {};
            Object.keys(employeeDetails)
                .filter((k) => k.toLowerCase().includes('bank'))
                .forEach((k) => {
                    _allBankFields[k] = (employeeDetails as any)[k];
                });

            // Check for bank details in employee data
            const employeeBankDetails = (employeeDetails as any).employeebankDetails || [];
            const hasBankAccountNo = employeeDetails.HRME_BankAccountNo;

            if (hasBankOptions && (hasBankAccountNo || employeeBankDetails.length > 0)) {
                // If we have employeebankDetails array, use it directly
                if (employeeBankDetails.length > 0) {
                    hasInitializedBank.current = true;
                    const mappedBankDetails = employeeBankDetails.map((bank: any) => ({
                        bankAccountNo: bank.HRMEB_AccountNo || bank.AccountNo || bank.accountNo || '',
                        employerBankName: bank.HRMBD_Id ? bank.HRMBD_Id.toString() : '',
                        accountType: bank.HRMEB_ActiveFlag === 'Y' ? 'Default' : 'Alternate'
                    }));

                    // Use requestAnimationFrame to ensure DOM is ready
                    requestAnimationFrame(() => {
                        setValue('bankDetails', mappedBankDetails, { shouldValidate: false, shouldDirty: false });
                    });
                }
                // Fallback to legacy logic if employeebankDetails is not available
                else if (hasBankAccountNo) {
                    let bankId = '';
                    let bankAccountNo = '';

                    // First, check if bank ID is directly in employee details
                    const directBankId =
                        (employeeDetails as any).HRME_BankId ||
                        (employeeDetails as any).HRMBD_Id ||
                        (employeeDetails as any).BankId ||
                        (employeeDetails as any).bankId;

                    if (directBankId) {
                        bankId = directBankId.toString();
                        bankAccountNo = employeeDetails.HRME_BankAccountNo || '';
                    }
                    // Try to find bank ID by matching account number in bank list
                    else {
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
                            const exactMatch =
                                bankAccountNoFromList === bankAccountNo || bankAccountNoFromList?.toString() === bankAccountNo?.toString();

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
                        hasInitializedBank.current = true;
                        const updatedBankDetails = [
                            {
                                bankAccountNo: bankAccountNo,
                                employerBankName: bankId || '', // Set bank ID here (empty string if not found - user will need to select manually)
                                accountType: 'Default'
                            }
                        ];

                        // Use requestAnimationFrame to ensure DOM is ready
                        requestAnimationFrame(() => {
                            setValue('bankDetails', updatedBankDetails, { shouldValidate: false, shouldDirty: false });
                        });
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isEditMode,
        employeeDetails?.HRME_Id,
        employeeDetails?.HRME_BankAccountNo,
        isLoadingEmployee,
        isLoadingOnload,
        onloadData,
        setValue
    ]);

    // Set qualification details after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues && !hasInitializedArrays.current) {
            const qualificationDetails = formDefaultValues.qualificationDetails || [];
            if (qualificationDetails.length > 0) {
                hasInitializedArrays.current = true;
                requestAnimationFrame(() => {
                    setValue('qualificationDetails', qualificationDetails as any, { shouldValidate: false, shouldDirty: false });
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, formDefaultValues?.qualificationDetails?.length, setValue]);

    // Set experience details after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues && !hasInitializedArrays.current) {
            const experienceDetails = formDefaultValues.experienceDetails || [];
            if (experienceDetails.length > 0) {
                requestAnimationFrame(() => {
                    setValue('experienceDetails', experienceDetails as any, { shouldValidate: false, shouldDirty: false });
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, formDefaultValues?.experienceDetails?.length, setValue]);

    // Set document details after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues && !hasInitializedArrays.current) {
            const documentList = formDefaultValues.documentList || [];
            if (documentList.length > 0) {
                requestAnimationFrame(() => {
                    setValue('documentList', documentList as any, { shouldValidate: false, shouldDirty: false });
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, formDefaultValues?.documentList?.length, setValue]);

    // Set medical fields after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues) {
            // Set medical fields explicitly (set even if empty to ensure they're bound)
            requestAnimationFrame(() => {
                setValue('employeeHeight', formDefaultValues.employeeHeight || '', { shouldValidate: false, shouldDirty: false });
                setValue('employeeHeightUnit', formDefaultValues.employeeHeightUnit || '', { shouldValidate: false, shouldDirty: false });
                setValue('employeeWeight', formDefaultValues.employeeWeight || '', { shouldValidate: false, shouldDirty: false });
                setValue('employeeWeightUnit', formDefaultValues.employeeWeightUnit || '', { shouldValidate: false, shouldDirty: false });
                setValue('eyeSightIssue', formDefaultValues.eyeSightIssue || '', { shouldValidate: false, shouldDirty: false });
                setValue('anyHealthIssue', formDefaultValues.anyHealthIssue || '', { shouldValidate: false, shouldDirty: false });
                setValue('identificationMark', formDefaultValues.identificationMark || '', { shouldValidate: false, shouldDirty: false });
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, setValue]);

    // Set other details fields after form reset (for edit mode)
    useEffect(() => {
        if (isEditMode && employeeDetails && !isLoadingEmployee && !isLoadingOnload && formDefaultValues) {
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
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, employeeDetails?.HRME_Id, isLoadingEmployee, isLoadingOnload, setValue]);

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

    // Function to clear only the current tab's fields
    const handleClearCurrentTab = () => {
        // Define field groups for each tab with their default empty values
        const tabFields: Record<string, { fields: (keyof FormFields)[]; defaults?: Partial<FormFields> }> = {
            employee: {
                fields: [
                    'firstName',
                    'middleName',
                    'lastName',
                    'employeeCode',
                    'typeOfEmployment',
                    'employeeGroup',
                    'school',
                    'designation',
                    'grade',
                    'fatherName',
                    'motherName',
                    'dateOfBirth',
                    'dateOfJoining',
                    'dateOfConfirmation',
                    'dateOfRetirement',
                    'gender',
                    'maritalStatus',
                    'religion',
                    'casteCategory',
                    'caste',
                    'bloodGroup',
                    'salaryType',
                    'modeOfPayment',
                    'subjectTaught',
                    'epf',
                    'ppf',
                    'phdResearchGuide',
                    'recognitionYear',
                    'teachingNonTeaching',
                    'pfApplicable',
                    'ptMaxAmount',
                    'pfMaxAmount',
                    'pfFixedAmount',
                    'pfAccNo',
                    'uanNumber',
                    'pfDate',
                    'esiApplicable',
                    'esiAccNo',
                    'gratuityAccNo',
                    'esiDate',
                    'nationalSSN',
                    'aadharNo',
                    'panCardNo',
                    'mobileDetails',
                    'emailDetails',
                    'bankDetails'
                ]
            },
            address: {
                fields: [
                    'contactAddress',
                    'contactArea',
                    'contactCountry',
                    'contactState',
                    'contactCity',
                    'contactPincode',
                    'permanentAddress',
                    'permanentArea',
                    'permanentCountry',
                    'permanentState',
                    'permanentCity',
                    'permanentPincode',
                    'sameAsCommunicationAddress'
                ]
            },
            qualification: {
                fields: ['qualificationDetails']
            },
            experience: {
                fields: ['experienceDetails']
            },
            document: {
                fields: ['documentList']
            },
            medical: {
                fields: [
                    'employeeHeight',
                    'employeeHeightUnit',
                    'employeeWeight',
                    'employeeWeightUnit',
                    'eyeSightIssue',
                    'anyHealthIssue',
                    'identificationMark'
                ]
            },
            other: {
                fields: [
                    'biometricCode',
                    'rfCardId',
                    'punchRelaxation',
                    'stopPension',
                    'dateOfStopPension',
                    'msTeamsUserName',
                    'msTeamsPassword',
                    'employeeLeft',
                    'lastWorkingDay',
                    'reasonForLeaving'
                ]
            }
        };

        const tabConfig = tabFields[activeTab];
        if (!tabConfig) return;

        const fieldsToReset = tabConfig.fields;

        // Reset each field to its default empty value
        fieldsToReset.forEach((field) => {
            const currentValue = watch(field);
            if (Array.isArray(currentValue)) {
                setValue(field, [] as any, { shouldValidate: false, shouldDirty: false });
            } else if (typeof currentValue === 'boolean') {
                setValue(field, false as any, { shouldValidate: false, shouldDirty: false });
            } else {
                setValue(field, '' as any, { shouldValidate: false, shouldDirty: false });
            }
        });

        // Special handling for photo in employee tab
        if (activeTab === 'employee') {
            setSelectedPhoto(null);
            setPhotoFile(null);
        }
    };

    /**
     * Maps form field names (from tabs) to API field names
     */
    // Helper function to map form data with address fields as null (for employee tab)
    const mapFormDataToApiFormatWithoutAddress = (data: FormFields): SavePersonalDetailsRequest => {
        const payload = mapFormDataToApiFormat(data);
        // Set all address fields to null/0
        payload.HRME_LocStreet = null;
        payload.HRME_LocArea = null;
        payload.HRME_LocCity = null;
        payload.HRME_LocAdd4 = null;
        payload.HRME_LocStateId = 0;
        payload.HRME_LocCountryId = 0;
        payload.HRME_LocPincode = 0;
        payload.HRME_PerStreet = null;
        payload.HRME_PerArea = null;
        payload.HRME_PerCity = null;
        payload.HRME_PerAdd4 = null;
        payload.HRME_PerStateId = 0;
        payload.HRME_PerCountryId = 0;
        payload.HRME_PerPincode = 0;
        return payload;
    };

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
            HRME_AppDownloadedDeviceId: '', // Required by API
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
            HRME_ApprovalNo: '', // Required by API
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

    // Tab-specific field lists for validation
    const tabFieldMap: Record<string, (keyof FormFields)[]> = {
        employee: [
            'firstName',
            'middleName',
            'lastName',
            'employeeCode',
            'typeOfEmployment',
            'employeeGroup',
            'school',
            'designation',
            'grade',
            'fatherName',
            'motherName',
            'dateOfBirth',
            'dateOfJoining',
            'dateOfConfirmation',
            'dateOfRetirement',
            'gender',
            'maritalStatus',
            'religion',
            'casteCategory',
            'caste',
            'bloodGroup',
            'salaryType',
            'modeOfPayment',
            'subjectTaught',
            'epf',
            'ppf',
            'phdResearchGuide',
            'recognitionYear',
            'teachingNonTeaching',
            'pfApplicable',
            'ptMaxAmount',
            'pfMaxAmount',
            'pfFixedAmount',
            'pfAccNo',
            'uanNumber',
            'pfDate',
            'esiApplicable',
            'esiAccNo',
            'gratuityAccNo',
            'esiDate',
            'nationalSSN',
            'aadharNo',
            'panCardNo',
            'mobileDetails',
            'emailDetails',
            'bankDetails'
        ],
        address: [
            'contactAddress',
            'contactArea',
            'contactCountry',
            'contactState',
            'contactCity',
            'contactPincode',
            'permanentAddress',
            'permanentArea',
            'permanentCountry',
            'permanentState',
            'permanentCity',
            'permanentPincode',
            'sameAsCommunicationAddress'
        ],
        qualification: ['qualificationDetails'],
        experience: ['experienceDetails'],
        document: ['documentList'],
        medical: ['employeeHeight', 'employeeHeightUnit', 'employeeWeight', 'employeeWeightUnit', 'eyeSightIssue', 'anyHealthIssue', 'identificationMark'],
        other: ['biometricCode', 'rfCardId', 'punchRelaxation', 'stopPension', 'dateOfStopPension', 'msTeamsUserName', 'msTeamsPassword', 'employeeLeft', 'lastWorkingDay', 'reasonForLeaving']
    };

    // Custom tab-specific submit handler - now receives data from handleSubmit
    const handleTabSubmit = async (data: FormFields) => {
        console.log('🔍 [SUBMIT] handleTabSubmit called', { activeTab, isEditMode, savedEmployeeId });
        
        const currentTabFields = tabFieldMap[activeTab] || [];
        
        if (currentTabFields.length === 0) {
            // If no fields defined for this tab, proceed without validation
            console.log('🔍 [SUBMIT] No fields defined for tab, proceeding to processFormSubmission');
            await processFormSubmission(data);
            return;
        }

        // Clear previous errors for fields not in current tab
        // Get all possible fields from the tabFieldMap
        const allTabFields = Object.values(tabFieldMap).flat();
        const uniqueFields = Array.from(new Set(allTabFields)) as (keyof FormFields)[];
        uniqueFields.forEach((field) => {
            if (!currentTabFields.includes(field)) {
                clearErrors(field);
            }
        });

        // For qualification tab, validate qualificationDetails array directly
        if (activeTab === 'qualification') {
            const quals = data.qualificationDetails || [];
            if (quals.length === 0) {
                setError('qualificationDetails', {
                    type: 'manual',
                    message: 'At least one qualification is required'
                });
                return;
            }

            // Validate each qualification using the qualificationDetailSchema
            let hasErrors = false;
            quals.forEach((qual: any, index: number) => {
                const result = qualificationDetailSchema.safeParse(qual);
                if (!result.success) {
                    hasErrors = true;
                    result.error.errors.forEach((error) => {
                        const fieldPath = `qualificationDetails.${index}.${error.path.join('.')}`;
                        setError(fieldPath as any, {
                            type: 'validation',
                            message: error.message
                        });
                    });
                }
            });

            if (hasErrors) {
                const firstError = quals.find((qual: any, index: number) => {
                    const result = qualificationDetailSchema.safeParse(qual);
                    return !result.success;
                });
                if (firstError) {
                    const result = qualificationDetailSchema.safeParse(firstError);
                    if (result.error) {
                        // Set error on the qualification field - field will be highlighted
                        setError('qualificationDetails', { 
                            type: 'validation', 
                            message: result.error.errors[0]?.message || 'Please check qualification details' 
                        });
                    }
                }
                return;
            }
        }
        // For experience tab, validate experienceDetails array directly
        else if (activeTab === 'experience') {
            const exps = data.experienceDetails || [];
            if (exps.length === 0) {
                setError('experienceDetails', {
                    type: 'manual',
                    message: 'At least one experience is required'
                });
                return;
            }

            let hasErrors = false;
            exps.forEach((exp: any, index: number) => {
                const result = experienceDetailSchema.safeParse(exp);
                if (!result.success) {
                    hasErrors = true;
                    result.error.errors.forEach((error) => {
                        const fieldPath = `experienceDetails.${index}.${error.path.join('.')}`;
                        setError(fieldPath as any, {
                            type: 'validation',
                            message: error.message
                        });
                    });
                }
            });

            if (hasErrors) {
                const firstError = exps.find((exp: any, index: number) => {
                    const result = experienceDetailSchema.safeParse(exp);
                    return !result.success;
                });
                if (firstError) {
                    const result = experienceDetailSchema.safeParse(firstError);
                    if (result.error) {
                        // Set error on the experience field - field will be highlighted
                        setError('experienceDetails', { 
                            type: 'validation', 
                            message: result.error.errors[0]?.message || 'Please check experience details' 
                        });
                    }
                }
                return;
            }
        }
        // For document tab, validate documentList array directly
        else if (activeTab === 'document') {
            const docs = data.documentList || [];
            if (docs.length === 0) {
                setError('documentList', {
                    type: 'manual',
                    message: 'At least one document is required'
                });
                return;
            }

            let hasErrors = false;
            docs.forEach((doc: any, index: number) => {
                const result = documentSchema.safeParse(doc);
                if (!result.success) {
                    hasErrors = true;
                    result.error.errors.forEach((error) => {
                        const fieldPath = `documentList.${index}.${error.path.join('.')}`;
                        setError(fieldPath as any, {
                            type: 'validation',
                            message: error.message
                        });
                    });
                }
            });

            if (hasErrors) {
                const firstError = docs.find((doc: any, index: number) => {
                    const result = documentSchema.safeParse(doc);
                    return !result.success;
                });
                if (firstError) {
                    const result = documentSchema.safeParse(firstError);
                    if (result.error) {
                        // Set error on the document field - field will be highlighted
                        setError('documentList', { 
                            type: 'validation', 
                            message: result.error.errors[0]?.message || 'Please check document details' 
                        });
                    }
                }
                return;
            }
        }
        // For other tabs (including employee), use trigger to validate only current tab fields
        else {
            // Validate only the current tab's fields
            console.log('🔍 [VALIDATION] Triggering validation for fields:', currentTabFields);
            const isValid = await trigger(currentTabFields as any);
            console.log('🔍 [VALIDATION] Validation result:', { isValid, activeTab, errors: Object.keys(errors) });
            
            if (!isValid) {
                console.log('🔴 [VALIDATION] Validation failed for tab:', activeTab);
                // Wait a bit for errors to be set in the form state
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Get current errors after trigger (errors is already destructured from formState)
                // Re-read errors to get the latest state after trigger
                const formValues = getValues();
                const currentErrors: Record<string, any> = {};
                
                // Check each field and manually set errors if they're missing and required
                if (activeTab === 'employee') {
                    // Manually validate required employee fields and set errors
                    if (!formValues.firstName || formValues.firstName.trim() === '') {
                        setError('firstName', { type: 'required', message: 'Name of the Employee is required' });
                        currentErrors['firstName'] = { message: 'Name of the Employee is required' };
                    }
                    if (!formValues.employeeCode || formValues.employeeCode.trim() === '') {
                        setError('employeeCode', { type: 'required', message: 'Employee Code is required' });
                        currentErrors['employeeCode'] = { message: 'Employee Code is required' };
                    }
                    if (!formValues.typeOfEmployment || formValues.typeOfEmployment === '0' || formValues.typeOfEmployment === '') {
                        setError('typeOfEmployment', { type: 'required', message: 'Type of Employment is required' });
                        currentErrors['typeOfEmployment'] = { message: 'Type of Employment is required' };
                    }
                    if (!formValues.employeeGroup || formValues.employeeGroup === '0' || formValues.employeeGroup === '') {
                        setError('employeeGroup', { type: 'required', message: 'Employee Group is required' });
                        currentErrors['employeeGroup'] = { message: 'Employee Group is required' };
                    }
                    if (!formValues.school || formValues.school === '0' || formValues.school === '') {
                        setError('school', { type: 'required', message: 'Department is required' });
                        currentErrors['school'] = { message: 'Department is required' };
                    }
                    if (!formValues.designation || formValues.designation === '0' || formValues.designation === '') {
                        setError('designation', { type: 'required', message: 'Designation is required' });
                        currentErrors['designation'] = { message: 'Designation is required' };
                    }
                    if (!formValues.grade || formValues.grade === '0' || formValues.grade === '') {
                        setError('grade', { type: 'required', message: 'Grade is required' });
                        currentErrors['grade'] = { message: 'Grade is required' };
                    }
                    if (!formValues.fatherName || formValues.fatherName.trim() === '') {
                        setError('fatherName', { type: 'required', message: "Father's Name is required" });
                        currentErrors['fatherName'] = { message: "Father's Name is required" };
                    }
                    if (!formValues.motherName || formValues.motherName.trim() === '') {
                        setError('motherName', { type: 'required', message: "Mother's Name is required" });
                        currentErrors['motherName'] = { message: "Mother's Name is required" };
                    }
                    if (!formValues.dateOfBirth || formValues.dateOfBirth.trim() === '') {
                        setError('dateOfBirth', { type: 'required', message: 'Date of Birth is required' });
                        currentErrors['dateOfBirth'] = { message: 'Date of Birth is required' };
                    }
                    if (!formValues.dateOfJoining || formValues.dateOfJoining.trim() === '') {
                        setError('dateOfJoining', { type: 'required', message: 'Date of Joining is required' });
                        currentErrors['dateOfJoining'] = { message: 'Date of Joining is required' };
                    }
                    if (!formValues.gender || formValues.gender === '0' || formValues.gender === '') {
                        setError('gender', { type: 'required', message: 'Gender is required' });
                        currentErrors['gender'] = { message: 'Gender is required' };
                    }
                    if (!formValues.maritalStatus || formValues.maritalStatus === '0' || formValues.maritalStatus === '') {
                        setError('maritalStatus', { type: 'required', message: 'Marital Status is required' });
                        currentErrors['maritalStatus'] = { message: 'Marital Status is required' };
                    }
                    if (!formValues.religion || formValues.religion === '0' || formValues.religion === '') {
                        setError('religion', { type: 'required', message: 'Religion is required' });
                        currentErrors['religion'] = { message: 'Religion is required' };
                    }
                    if (!formValues.casteCategory || formValues.casteCategory === '0' || formValues.casteCategory === '') {
                        setError('casteCategory', { type: 'required', message: 'Caste Category is required' });
                        currentErrors['casteCategory'] = { message: 'Caste Category is required' };
                    }
                    if (!formValues.caste || formValues.caste === '0' || formValues.caste === '') {
                        setError('caste', { type: 'required', message: 'Caste is required' });
                        currentErrors['caste'] = { message: 'Caste is required' };
                    }
                    if (!formValues.teachingNonTeaching || formValues.teachingNonTeaching === '') {
                        setError('teachingNonTeaching', { type: 'required', message: 'Teaching/Non-Teaching is required' });
                        currentErrors['teachingNonTeaching'] = { message: 'Teaching/Non-Teaching is required' };
                    }
                    if (!formValues.modeOfPayment || formValues.modeOfPayment === '') {
                        setError('modeOfPayment', { type: 'required', message: 'Mode of Payment is required' });
                        currentErrors['modeOfPayment'] = { message: 'Mode of Payment is required' };
                    }
                }
                
                // Get errors from form state (after manual setError calls)
                const formStateErrors = errors;
                currentTabFields.forEach((field) => {
                    const fieldError = formStateErrors[field as keyof typeof formStateErrors];
                    if (fieldError && !currentErrors[field]) {
                        currentErrors[field] = fieldError;
                    }
                });
                
                // Also check nested fields for employee tab (mobileDetails, emailDetails, bankDetails)
                if (activeTab === 'employee') {
                    const mobileErrors = formStateErrors.mobileDetails;
                    const emailErrors = formStateErrors.emailDetails;
                    const bankErrors = formStateErrors.bankDetails;
                    
                    if (mobileErrors) {
                        currentErrors['mobileDetails'] = mobileErrors;
                    }
                    if (emailErrors) {
                        currentErrors['emailDetails'] = emailErrors;
                    }
                    if (bankErrors) {
                        currentErrors['bankDetails'] = bankErrors;
                    }
                }
                
                // For address tab, manually validate and set errors for required fields
                if (activeTab === 'address') {
                    if (!formValues.contactAddress || formValues.contactAddress.trim() === '') {
                        setError('contactAddress', { type: 'required', message: 'Contact Address is required' });
                        currentErrors['contactAddress'] = { message: 'Contact Address is required' };
                    }
                    if (!formValues.contactCountry || formValues.contactCountry === '0' || formValues.contactCountry === '') {
                        setError('contactCountry', { type: 'required', message: 'Contact Country is required' });
                        currentErrors['contactCountry'] = { message: 'Contact Country is required' };
                    }
                    if (!formValues.contactState || formValues.contactState === '0' || formValues.contactState === '') {
                        setError('contactState', { type: 'required', message: 'Contact State is required' });
                        currentErrors['contactState'] = { message: 'Contact State is required' };
                    }
                    if (!formValues.contactCity || formValues.contactCity.trim() === '') {
                        setError('contactCity', { type: 'required', message: 'Contact City is required' });
                        currentErrors['contactCity'] = { message: 'Contact City is required' };
                    }
                    if (!formValues.contactPincode || formValues.contactPincode.trim() === '') {
                        setError('contactPincode', { type: 'required', message: 'Contact Pincode is required' });
                        currentErrors['contactPincode'] = { message: 'Contact Pincode is required' };
                    }
                    
                    // Validate permanent address if "Same As Communication Address" is not checked
                    if (!formValues.sameAsCommunicationAddress) {
                        if (!formValues.permanentAddress || formValues.permanentAddress.trim() === '') {
                            setError('permanentAddress', { type: 'required', message: 'Permanent Address is required' });
                            currentErrors['permanentAddress'] = { message: 'Permanent Address is required' };
                        }
                        if (!formValues.permanentCountry || formValues.permanentCountry === '0' || formValues.permanentCountry === '') {
                            setError('permanentCountry', { type: 'required', message: 'Permanent Country is required' });
                            currentErrors['permanentCountry'] = { message: 'Permanent Country is required' };
                        }
                        if (!formValues.permanentState || formValues.permanentState === '0' || formValues.permanentState === '') {
                            setError('permanentState', { type: 'required', message: 'Permanent State is required' });
                            currentErrors['permanentState'] = { message: 'Permanent State is required' };
                        }
                        if (!formValues.permanentCity || formValues.permanentCity.trim() === '') {
                            setError('permanentCity', { type: 'required', message: 'Permanent City is required' });
                            currentErrors['permanentCity'] = { message: 'Permanent City is required' };
                        }
                        if (!formValues.permanentPincode || formValues.permanentPincode.trim() === '') {
                            setError('permanentPincode', { type: 'required', message: 'Permanent Pincode is required' });
                            currentErrors['permanentPincode'] = { message: 'Permanent Pincode is required' };
                        }
                    }
                }
                
                // All validation errors are already set and will be displayed inline
                // Scroll to first error field to help user see the errors
                const errorFields = Object.keys(currentErrors);
                if (errorFields.length > 0) {
                    const firstField = errorFields[0];
                    // Try different selectors for the field
                    let fieldElement = document.querySelector(`[name="${firstField}"]`) as HTMLElement ||
                                      document.querySelector(`#${firstField}`) as HTMLElement ||
                                      document.querySelector(`[id*="${firstField}"]`) as HTMLElement;
                    
                    // For nested fields, try to find the actual input
                    if (!fieldElement && firstField.includes('[')) {
                        const baseField = firstField.split('[')[0];
                        fieldElement = document.querySelector(`[name*="${baseField}"]`) as HTMLElement ||
                                      document.querySelector(`#${baseField}`) as HTMLElement;
                    }
                    
                    if (fieldElement) {
                        setTimeout(() => {
                            fieldElement.focus();
                            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                    }
                }
                return;
            }
        }

        // If validation passes, proceed with submission
        console.log('🔍 [SUBMIT] Validation passed, proceeding to processFormSubmission');
        await processFormSubmission(data);
    };

    const processFormSubmission = async (data: FormFields) => {
        console.log('🔍 [SUBMIT] processFormSubmission called', { activeTab, isEditMode, savedEmployeeId });
        try {
            // Employee Tab: Validate and save employee details (with address fields as null)
            if (activeTab === 'employee') {
                // Validate only employee tab fields
                const employeeErrors: string[] = [];

                // Required employee fields
                if (!data.firstName || data.firstName.trim() === '') {
                    employeeErrors.push('Name of the Employee is required');
                }
                if (!data.employeeCode || data.employeeCode.trim() === '') {
                    employeeErrors.push('Employee Code is required');
                }
                if (!data.typeOfEmployment || data.typeOfEmployment === '0' || data.typeOfEmployment === '') {
                    employeeErrors.push('Type of Employment is required');
                }
                if (!data.employeeGroup || data.employeeGroup === '0' || data.employeeGroup === '') {
                    employeeErrors.push('Employee Group is required');
                }
                if (!data.school || data.school === '0' || data.school === '') {
                    employeeErrors.push('Department is required');
                }
                if (!data.designation || data.designation === '0' || data.designation === '') {
                    employeeErrors.push('Designation is required');
                }
                if (!data.grade || data.grade === '0' || data.grade === '') {
                    employeeErrors.push('Grade is required');
                }
                if (!data.fatherName || data.fatherName.trim() === '') {
                    employeeErrors.push("Father's Name is required");
                }
                if (!data.motherName || data.motherName.trim() === '') {
                    employeeErrors.push("Mother's Name is required");
                }
                if (!data.dateOfBirth || data.dateOfBirth.trim() === '') {
                    employeeErrors.push('Date of Birth is required');
                }
                if (!data.dateOfJoining || data.dateOfJoining.trim() === '') {
                    employeeErrors.push('Date of Joining is required');
                }
                if (!data.gender || data.gender === '0' || data.gender === '') {
                    employeeErrors.push('Gender is required');
                }

                // Validate mobile number if provided
                const mobileNo = data.mobileDetails?.[0]?.mobileNo;
                if (mobileNo && mobileNo.trim() !== '' && !validateMobileNumber(mobileNo)) {
                    employeeErrors.push('Mobile Number must be 10 digits');
                }

                // Validate email if provided
                const emailId = data.emailDetails?.[0]?.emailId;
                if (emailId && emailId.trim() !== '' && !validateEmail(emailId)) {
                    employeeErrors.push('Email must be a valid email address');
                }

                // Validate Aadhar if provided
                if (data.aadharNo && data.aadharNo.trim() !== '' && !validateAadharNumber(data.aadharNo)) {
                    employeeErrors.push('Aadhar Number must be 12 digits');
                }

                // Validate PAN if provided
                if (data.panCardNo && data.panCardNo.trim() !== '' && !validatePANNumber(data.panCardNo)) {
                    employeeErrors.push('PAN Number must be in format ABCDE1234F');
                }

                // Validate date of confirmation if provided
                if (data.dateOfConfirmation && data.dateOfJoining) {
                    if (new Date(data.dateOfConfirmation) < new Date(data.dateOfJoining)) {
                        employeeErrors.push('Date of Confirmation must be after Date of Joining');
                    }
                }

                if (employeeErrors.length > 0) {
                    // Set errors on fields instead of showing toast
                    employeeErrors.forEach((errorMsg, index) => {
                        // Try to map error messages to field names
                        if (errorMsg.includes('Mobile')) {
                            setError('mobileDetails', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Email')) {
                            setError('emailDetails', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Aadhar')) {
                            setError('aadharNo', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('PAN')) {
                            setError('panCardNo', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Date of Confirmation')) {
                            setError('dateOfConfirmation', { type: 'validation', message: errorMsg });
                        } else {
                            // Set on first field if we can't map it
                            setError('firstName', { type: 'validation', message: errorMsg });
                        }
                    });
                    return;
                }

                // Call API with address fields as null
                console.log('🔍 [SUBMIT] Employee tab - preparing to save', { isEditMode, savedEmployeeId });
                const payload = mapFormDataToApiFormatWithoutAddress(data);
                console.log('🔍 [SUBMIT] Employee tab - payload prepared', { HRME_Id: payload.HRME_Id, employeeCode: payload.HRME_EmployeeCode });

                savePersonalDetails(payload, {
                    onSuccess: async (response) => {
                        const responseData = (response as any)?.data;
                        const responseMessage = (response as any)?.message;
                        const responseSuccess = (response as any)?.success;

                        // Check for duplicate employee code or error response
                        if (responseData === 'Duplicate' || responseMessage === 'Duplicate' || 
                            (responseSuccess === false && responseMessage)) {
                            // Show the API error message
                            const errorMessage = responseMessage || 'Duplicate Employee Code record cannot be added';
                            toast.error(errorMessage);
                            return;
                        }

                        // Extract HRME_Id from response
                        let employeeId: number | null = null;
                        
                        console.log('🔍 [SAVE] Full response structure:', {
                            responseType: typeof response,
                            responseKeys: typeof response === 'object' && response !== null ? Object.keys(response) : [],
                            responseData,
                            responseMessage,
                            responseSuccess,
                            responseHRME_Id: (response as any)?.HRME_Id,
                            responseDataHRME_Id: responseData?.HRME_Id
                        });

                        if (typeof response === 'object' && response !== null) {
                            // Check direct property on response
                            if ('HRME_Id' in response && typeof (response as any).HRME_Id === 'number' && (response as any).HRME_Id > 0) {
                                employeeId = (response as any).HRME_Id;
                            }
                            // Check in data property (for wrapped ApiResponse)
                            else if (responseData && typeof responseData === 'object' && 'HRME_Id' in responseData && typeof responseData.HRME_Id === 'number' && responseData.HRME_Id > 0) {
                                employeeId = responseData.HRME_Id;
                            }
                            // Check nested in data.data (double-wrapped)
                            else if (responseData && typeof responseData === 'object' && responseData.data && typeof responseData.data === 'object' && 'HRME_Id' in responseData.data) {
                                employeeId = responseData.data.HRME_Id;
                            }
                        }

                        // Store the employee ID for subsequent tabs
                        if (employeeId && employeeId > 0) {
                            console.log('✅ [SAVE] Extracted HRME_Id from response:', employeeId);
                            setSavedEmployeeId(employeeId);
                        } else if (!savedEmployeeId && (responseData === 'Add' || responseMessage === 'Add')) {
                            console.warn('⚠️ [SAVE] Employee created (Add response) but HRME_Id not found in response. Please check API response structure.');
                            console.warn('⚠️ [SAVE] Full response:', JSON.stringify(response, null, 2));
                        } else if (savedEmployeeId) {
                            console.log('ℹ️ [SAVE] Using existing savedEmployeeId:', savedEmployeeId);
                        }

                        if (responseData === 'Add' || responseMessage === 'Add') {
                            toast.success('Employee details saved successfully!');
                            setActiveTab('address');
                            return;
                        }

                        if (responseData === 'Update' || responseMessage === 'Update') {
                            toast.success('Employee details updated successfully!');
                            setActiveTab('address');
                            return;
                        }

                        // Fallback for other success responses
                        if (responseSuccess === true || responseSuccess === undefined) {
                            toast.success(responseMessage || 'Employee details saved successfully!');
                            setActiveTab('address');
                        }
                    },
                    onError: (error: any) => {
                        console.error('🔍 [SAVE] ERROR:', error);
                        
                        // Extract error message from API response
                        let errorMessage = 'Failed to save employee details';
                        
                        // Check if error has response data with message
                        if (error?.response?.data) {
                            const errorData = error.response.data;
                            if (typeof errorData === 'object' && errorData !== null) {
                                // Check for message in error response
                                if (errorData.message) {
                                    errorMessage = errorData.message;
                                } else if (errorData.error) {
                                    errorMessage = errorData.error;
                                }
                            } else if (typeof errorData === 'string') {
                                errorMessage = errorData;
                            }
                        } else if (error?.message) {
                            errorMessage = error.message;
                        }
                        
                        toast.error(errorMessage);
                    }
                });
                return;
            }

            // Address Tab: Save Address details (call same endpoint again with address fields)
            // Note: Only validate address fields here - employee fields are validated in employee tab
            if (activeTab === 'address') {
                if (!savedEmployeeId) {
                    toast.error('Please save Employee details first');
                    setActiveTab('employee');
                    return;
                }

                // Validate only address fields (employee fields are validated in employee tab)
                const addressErrors: string[] = [];
                if (!data.contactAddress || data.contactAddress.trim() === '') {
                    addressErrors.push('Contact Address is required');
                }
                if (!data.contactCountry || data.contactCountry === '0' || data.contactCountry === '') {
                    addressErrors.push('Contact Country is required');
                }
                if (!data.contactState || data.contactState === '0' || data.contactState === '') {
                    addressErrors.push('Contact State is required');
                }
                if (!data.contactCity || data.contactCity.trim() === '') {
                    addressErrors.push('Contact City is required');
                }
                if (!data.contactPincode || data.contactPincode.trim() === '') {
                    addressErrors.push('Contact Pincode is required');
                } else if (!validatePincode(data.contactPincode)) {
                    addressErrors.push('Contact Pincode must be a valid numerical value (5-10 digits)');
                }

                // Validate permanent address if "Same As Communication Address" is not checked
                if (!data.sameAsCommunicationAddress) {
                    if (!data.permanentAddress || data.permanentAddress.trim() === '') {
                        addressErrors.push('Permanent Address is required when "Same As Communication Address" is not checked');
                    }
                    if (!data.permanentCountry || data.permanentCountry === '0' || data.permanentCountry === '') {
                        addressErrors.push('Permanent Country is required when "Same As Communication Address" is not checked');
                    }
                    if (!data.permanentState || data.permanentState === '0' || data.permanentState === '') {
                        addressErrors.push('Permanent State is required when "Same As Communication Address" is not checked');
                    }
                    if (!data.permanentCity || data.permanentCity.trim() === '') {
                        addressErrors.push('Permanent City is required when "Same As Communication Address" is not checked');
                    }
                    if (!data.permanentPincode || data.permanentPincode.trim() === '') {
                        addressErrors.push('Permanent Pincode is required when "Same As Communication Address" is not checked');
                    } else if (!validatePincode(data.permanentPincode)) {
                        addressErrors.push('Permanent Pincode must be a valid numerical value (5-10 digits)');
                    }
                }

                // Set address errors on fields instead of showing toast
                if (addressErrors.length > 0) {
                    addressErrors.forEach((errorMsg) => {
                        // Map error messages to field names
                        if (errorMsg.includes('Contact Address')) {
                            setError('contactAddress', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Contact Country')) {
                            setError('contactCountry', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Contact State')) {
                            setError('contactState', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Contact City')) {
                            setError('contactCity', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Contact Pincode')) {
                            setError('contactPincode', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Permanent Address')) {
                            setError('permanentAddress', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Permanent Country')) {
                            setError('permanentCountry', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Permanent State')) {
                            setError('permanentState', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Permanent City')) {
                            setError('permanentCity', { type: 'validation', message: errorMsg });
                        } else if (errorMsg.includes('Permanent Pincode')) {
                            setError('permanentPincode', { type: 'validation', message: errorMsg });
                        }
                    });
                    return;
                }

                console.log('🔍 [SUBMIT] Address tab - preparing to save', { isEditMode, savedEmployeeId });
                const payload = mapFormDataToApiFormat(data);
                // Ensure HRME_Id is set from savedEmployeeId
                payload.HRME_Id = savedEmployeeId;
                console.log('🔍 [SUBMIT] Address tab - payload prepared', { HRME_Id: payload.HRME_Id, employeeCode: payload.HRME_EmployeeCode });

                savePersonalDetails(payload, {
                    onSuccess: async (response) => {
                        const responseData = (response as any)?.data;
                        const responseMessage = (response as any)?.message;
                        const responseSuccess = (response as any)?.success;

                        // Check for error response
                        if (responseSuccess === false && responseMessage) {
                            toast.error(responseMessage);
                            return;
                        }

                        // Save bank details if available
                        if (data.bankDetails && data.bankDetails.length > 0 && savedEmployeeId && savedEmployeeId > 0) {
                            const bankDetailsPayload = {
                                MI_Id: HRMS_MI_ID,
                                HRME_Id: savedEmployeeId,
                                BankDetails: data.bankDetails.map((bank: any) => ({
                                    CreatedDate: new Date().toISOString(),
                                    UpdatedDate: new Date().toISOString(),
                                    HRMEB_Id: 0, // New bank detail
                                    HRME_Id: savedEmployeeId,
                                    HRMBD_Id: Number(bank.employerBankName) || 0,
                                    HRMEB_AccountNo: bank.bankAccountNo || '',
                                    HRMEB_ActiveFlag: bank.accountType === 'Default' ? 'Y' : 'N'
                                }))
                            };

                            console.log('🔍 [BANK SAVE] Saving bank details:', bankDetailsPayload);
                            saveBankDetails(bankDetailsPayload);
                        }

                        if (responseData === 'Add' || responseMessage === 'Add') {
                            toast.success('Address details saved successfully!');
                            setActiveTab('qualification');
                            return;
                        }

                        if (responseData === 'Update' || responseMessage === 'Update') {
                            toast.success('Address details updated successfully!');
                            setActiveTab('qualification');
                            return;
                        }

                        // Fallback for other success responses
                        if (responseSuccess === true || responseSuccess === undefined) {
                            toast.success(responseMessage || 'Address details saved successfully!');
                            setActiveTab('qualification');
                        }
                    },
                    onError: (error: any) => {
                        console.error('🔍 [SAVE] ERROR:', error);
                        
                        // Extract error message from API response
                        let errorMessage = 'Failed to save address details';
                        
                        // Check if error has response data with message
                        if (error?.response?.data) {
                            const errorData = error.response.data;
                            if (typeof errorData === 'object' && errorData !== null) {
                                // Check for message in error response
                                if (errorData.message) {
                                    errorMessage = errorData.message;
                                } else if (errorData.error) {
                                    errorMessage = errorData.error;
                                }
                            } else if (typeof errorData === 'string') {
                                errorMessage = errorData;
                            }
                        } else if (error?.message) {
                            errorMessage = error.message;
                        }
                        
                        toast.error(errorMessage);
                    }
                });
                return;
            }

            // Qualification Tab: Save qualification details
            if (activeTab === 'qualification') {
                console.log('🔍 [SUBMIT] Qualification tab - checking savedEmployeeId', { savedEmployeeId, isEditMode });
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setActiveTab('employee');
                    return;
                }
                console.log('🔍 [SUBMIT] Qualification tab - proceeding with save');

                const qualificationDetails = data.qualificationDetails || [];

                if (qualificationDetails.length === 0) {
                    setError('qualificationDetails', {
                        type: 'required',
                        message: 'Please add at least one qualification'
                    });
                    return;
                }

                // Map form data to API format
                const qualificationsPayload = qualificationDetails.map((qual: any, index: number) => {
                    const cgpaValue = qual.cgpa || '';
                    const isPercentage = qual.cgpaOrPercentage === 'Percentage';

                    // Ensure numeric fields are properly converted
                    const courseId = qual.course ? Number(qual.course) : 0;
                    const yearOfPassing = qual.yearOfPassing ? Number(qual.yearOfPassing) : 0;
                    const countryId = qual.qualificationCountry ? Number(qual.qualificationCountry) : 0;
                    const stateId = qual.qualificationState ? Number(qual.qualificationState) : 0;
                    const registrationYear = qual.registrationYear ? Number(qual.registrationYear) : 0;
                    const hrmEqId = qual.HRMEQ_Id ? Number(qual.HRMEQ_Id) : 0;

                    // Validate required fields and set errors
                    if (!courseId) {
                        setError(`qualificationDetails.${index}.course`, {
                            type: 'required',
                            message: 'Course is required for all qualifications'
                        });
                        throw new Error('Course is required');
                    }
                    if (!yearOfPassing) {
                        setError(`qualificationDetails.${index}.yearOfPassing`, {
                            type: 'required',
                            message: 'Year of Passing is required for all qualifications'
                        });
                        throw new Error('Year of Passing is required');
                    }
                    if (!countryId) {
                        setError(`qualificationDetails.${index}.qualificationCountry`, {
                            type: 'required',
                            message: 'Country is required for all qualifications'
                        });
                        throw new Error('Country is required');
                    }
                    // Check if states are available before requiring state
                    const statesAvailable = options?.states && options.states.length > 0;
                    if (!stateId && statesAvailable) {
                        setError(`qualificationDetails.${index}.qualificationState`, {
                            type: 'required',
                            message: 'State is required. Please select a state from the dropdown.'
                        });
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
                    onSuccess: (_response) => {
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
                console.log('🔍 [SUBMIT] Experience tab - checking savedEmployeeId', { savedEmployeeId, isEditMode });
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setActiveTab('employee');
                    return;
                }
                console.log('🔍 [SUBMIT] Experience tab - proceeding with save');

                const experienceDetails = data.experienceDetails || [];

                if (experienceDetails.length === 0) {
                    setError('experienceDetails', {
                        type: 'required',
                        message: 'Please add at least one experience'
                    });
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
                    onSuccess: (_response) => {
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
                console.log('🔍 [SUBMIT] Document tab - checking savedEmployeeId', { savedEmployeeId, isEditMode });
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setActiveTab('employee');
                    return;
                }
                console.log('🔍 [SUBMIT] Document tab - proceeding with save');

                const documentList = data.documentList || [];

                if (documentList.length === 0) {
                    setError('documentList', {
                        type: 'required',
                        message: 'Please add at least one document'
                    });
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
                    onSuccess: (_response) => {
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

                saveMedicalDetails(payload, {
                    onSuccess: (_response) => {
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

                // Validate lastWorkingDay and reasonForLeaving if employeeLeft is true
                if (data.employeeLeft) {
                    const otherDetailsErrors: string[] = [];
                    if (!data.lastWorkingDay || data.lastWorkingDay.trim() === '') {
                        otherDetailsErrors.push('Last Working Day is required when Employee Left is checked');
                    }
                    if (!data.reasonForLeaving || data.reasonForLeaving.trim() === '') {
                        otherDetailsErrors.push('Reason for Leaving is required when Employee Left is checked');
                    }

                    if (otherDetailsErrors.length > 0) {
                        // Set errors on fields instead of showing toast
                        otherDetailsErrors.forEach((errorMsg) => {
                            // Map error messages to field names
                            if (errorMsg.includes('Date of Stop Pension')) {
                                setError('dateOfStopPension', { type: 'validation', message: errorMsg });
                            } else if (errorMsg.includes('Last Working Day')) {
                                setError('lastWorkingDay', { type: 'validation', message: errorMsg });
                            } else if (errorMsg.includes('Reason for Leaving')) {
                                setError('reasonForLeaving', { type: 'validation', message: errorMsg });
                            }
                        });
                        return;
                    }
                }

                // Other Details fields are part of the main employee object, so use the same endpoint
                const payload = mapFormDataToApiFormat(data) as any;

                // Ensure HRME_Id is set
                payload.HRME_Id = savedEmployeeId;
                payload.CreatedDate = new Date().toISOString();
                payload.UpdatedDate = new Date().toISOString();

                savePersonalDetails(payload, {
                    onSuccess: (_response) => {
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
        } catch (_error: any) {
            console.error('🔍 [SAVE] Submit error:', _error);
            toast.error('An error occurred while submitting the form');
        }
    };

    // Prepare options for EmployeeTab and AddressTab (memoized to prevent unnecessary re-renders)
    // Use array lengths in dependencies to prevent recreation when arrays are the same
    const options = useMemo(() => {
        if (!onloadData) return null;
        const opts = {
            empTypes: onloadData.employeeTypedropdownlist || [],
            groupTypes: onloadData.groupTypedropdownlist || [],
            departments: onloadData.departmentdropdownlist || [],
            designations: onloadData.designationdropdownlist || [],
            grades: onloadData.gradedropdownlist || [],
            genders: onloadData.genderdropdownlist || [],
            maritalStatuses: onloadData.maritalStatusdropdownlist || [],
            religions: onloadData.religiondropdownlist || [],
            casteCategories: onloadData.casteCategorydropdownlist || [],
            castes: onloadData.castedropdownlist || [],
            banks: onloadData.bankdropdownlist || [],
            countries: onloadData.countrydropdownlist || [],
            states: Array.isArray(onloadData.AllState) ? onloadData.AllState : [], // AllState might be null, so check if it's an array
            courses: onloadData.coursedropdownlist || [],
            specialisations: onloadData.SpecialisationList || [],
            // New dropdown lists from API (fallback to empty arrays if not provided)
            teachingNonTeaching: onloadData.teachingNonTeachingList || onloadData.teachingNonTeachingdropdownlist || [],
            bloodGroups: onloadData.bloodGroupList || onloadData.bloodGroupdropdownlist || [],
            salaryTypes: onloadData.salaryTypeList || onloadData.salaryTypedropdownlist || [],
            modeOfPayment: onloadData.modeOfPaymentList || onloadData.modeOfPaymentdropdownlist || [],
            addressTypes: onloadData.addressTypeList || onloadData.addressTypedropdownlist || [],
            phoneTypes: onloadData.phoneTypeList || onloadData.phoneTypedropdownlist || [],
            cgpaPercentageTypes: onloadData.cgpaPercentageTypeList || onloadData.cgpaPercentageTypedropdownlist || [],
            // Additional dropdowns from JSON
            leavingReasons: onloadData.LeavingReasonList || [],
            institutions: onloadData.institutiondropdownlist || [],
            earningList: onloadData.earningList || [],
            detectionList: onloadData.detectionList || [],
            arrearList: onloadData.arrearList || [],
            grossList: onloadData.grossList || [],
            documentList: onloadData.documentList || [],
            employeedetailList: onloadData.employeedetailList || []
        };

        return opts;
    }, [
        onloadData?.employeeTypedropdownlist?.length,
        onloadData?.groupTypedropdownlist?.length,
        onloadData?.departmentdropdownlist?.length,
        onloadData?.designationdropdownlist?.length,
        onloadData?.gradedropdownlist?.length,
        onloadData?.genderdropdownlist?.length,
        onloadData?.maritalStatusdropdownlist?.length,
        onloadData?.religiondropdownlist?.length,
        onloadData?.casteCategorydropdownlist?.length,
        onloadData?.castedropdownlist?.length,
        onloadData?.bankdropdownlist?.length,
        onloadData?.countrydropdownlist?.length,
        onloadData?.AllState?.length,
        onloadData?.coursedropdownlist?.length,
        onloadData?.SpecialisationList?.length
    ]);

    if (isLoadingOnload || isLoadingEmployee) {
        return (
            <div className='flex items-center justify-center p-8'>
                <div className='text-muted-foreground'>{isLoadingEmployee ? 'Loading employee data...' : 'Loading form data...'}</div>
            </div>
        );
    }

    // Custom submit handler that only validates current tab fields
    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔍 [SUBMIT] onFormSubmit called', { activeTab, isEditMode });
        
        // Get current tab fields
        const currentTabFields = tabFieldMap[activeTab] || [];
        
        // Only validate current tab fields, not all fields
        if (currentTabFields.length > 0) {
            console.log('🔍 [SUBMIT] Validating only current tab fields:', currentTabFields);
            
            // Clear errors from other tabs first to prevent them from blocking submission
            const allTabFields = Object.values(tabFieldMap).flat();
            const otherTabFields = allTabFields.filter(field => !currentTabFields.includes(field));
            otherTabFields.forEach((field) => {
                clearErrors(field);
            });
            
            // Validate only current tab fields
            const isValid = await trigger(currentTabFields as any);
            
            if (!isValid) {
                console.log('🔴 [SUBMIT] Current tab validation failed');
                // Wait a bit for errors to be set in form state
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Get errors from formState directly to ensure we have the latest errors after trigger
                // Access formState.errors directly instead of destructured errors for latest state
                const formErrors = formState.errors;
                
                // For employee tab, manually validate required fields if trigger didn't catch them
                if (activeTab === 'employee') {
                    const formValues = getValues();
                    
                    // Manually check required fields and set errors if missing
                    const requiredFields: Array<{ field: keyof FormFields; message: string }> = [
                        { field: 'firstName', message: 'Name of the Employee is required' },
                        { field: 'employeeCode', message: 'Employee Code is required' },
                        { field: 'typeOfEmployment', message: 'Type of Employment is required' },
                        { field: 'employeeGroup', message: 'Employee Group is required' },
                        { field: 'school', message: 'Department is required' },
                        { field: 'designation', message: 'Designation is required' },
                        { field: 'grade', message: 'Grade is required' },
                        { field: 'fatherName', message: "Father's Name is required" },
                        { field: 'motherName', message: "Mother's Name is required" },
                        { field: 'dateOfBirth', message: 'Date of Birth is required' },
                        { field: 'dateOfJoining', message: 'Date of Joining is required' },
                        { field: 'gender', message: 'Gender is required' },
                        { field: 'maritalStatus', message: 'Marital Status is required' },
                        { field: 'religion', message: 'Religion is required' },
                        { field: 'casteCategory', message: 'Caste Category is required' },
                        { field: 'caste', message: 'Caste is required' },
                        { field: 'modeOfPayment', message: 'Mode of Payment is required' },
                        { field: 'teachingNonTeaching', message: 'Teaching/Non-Teaching is required' }
                    ];
                    
                    requiredFields.forEach(({ field, message }) => {
                        const value = formValues[field];
                        if (!value || value === '' || value === '0') {
                            if (!formState.errors[field]) {
                                setError(field, {
                                    type: 'required',
                                    message
                                });
                            }
                        }
                    });
                    
                    // Check mobile details
                    if (!formValues.mobileDetails || formValues.mobileDetails.length === 0) {
                        if (!formState.errors.mobileDetails) {
                            setError('mobileDetails', {
                                type: 'required',
                                message: 'At least one mobile number is required'
                            });
                        }
                    }
                }
                
                // Get errors for current tab only
                const currentErrors: Record<string, any> = {};
                const errorMessages: string[] = [];
                
                currentTabFields.forEach((field) => {
                    const fieldError = formState.errors[field as keyof typeof formState.errors];
                    if (fieldError) {
                        currentErrors[field] = fieldError;
                        const errorMsg = typeof fieldError === 'string' ? fieldError : fieldError?.message;
                        if (errorMsg) {
                            errorMessages.push(errorMsg);
                        }
                    }
                });
                
                // Also check nested fields for employee tab
                if (activeTab === 'employee') {
                    if (formState.errors.mobileDetails) {
                        currentErrors['mobileDetails'] = formState.errors.mobileDetails;
                        const mobileError = typeof formState.errors.mobileDetails === 'string' 
                            ? formState.errors.mobileDetails 
                            : formState.errors.mobileDetails?.message || 'Mobile details validation failed';
                        errorMessages.push(mobileError);
                    }
                    if (formState.errors.emailDetails) {
                        currentErrors['emailDetails'] = formState.errors.emailDetails;
                        const emailError = typeof formState.errors.emailDetails === 'string' 
                            ? formState.errors.emailDetails 
                            : formState.errors.emailDetails?.message || 'Email details validation failed';
                        errorMessages.push(emailError);
                    }
                    if (formState.errors.bankDetails) {
                        currentErrors['bankDetails'] = formState.errors.bankDetails;
                        const bankError = typeof formState.errors.bankDetails === 'string' 
                            ? formState.errors.bankDetails 
                            : formState.errors.bankDetails?.message || 'Bank details validation failed';
                        errorMessages.push(bankError);
                    }
                }
                
                // Log all errors for debugging
                console.log('🔴 [SUBMIT] Validation errors found:', currentErrors);
                console.log('🔴 [SUBMIT] Error messages:', errorMessages);
                console.log('🔴 [SUBMIT] Form errors object:', formState.errors);
                console.log('🔴 [SUBMIT] All form errors keys:', Object.keys(formState.errors));
                
                // Show all validation errors - fields are already highlighted via react-hook-form
                const errorFields = Object.keys(currentErrors);
                if (errorFields.length > 0) {
                    // Show toast with first error message
                    const firstErrorMsg = errorMessages[0] || 'Please fix the validation errors in the form';
                    toast.error(firstErrorMsg);
                    
                    // Scroll to first error field to help user see the errors
                    setTimeout(() => {
                        const firstField = errorFields[0];
                        // Try different selectors for nested fields
                        let fieldElement = document.querySelector(`[name="${firstField}"]`) as HTMLElement ||
                                          document.querySelector(`#${firstField}`) as HTMLElement ||
                                          document.querySelector(`input[id*="${firstField}"]`) as HTMLElement ||
                                          document.querySelector(`select[id*="${firstField}"]`) as HTMLElement;
                        
                        // For nested fields like mobileDetails[0].mobileNo, try to find the actual input
                        if (!fieldElement && firstField.includes('[')) {
                            const baseField = firstField.split('[')[0];
                            fieldElement = document.querySelector(`[name*="${baseField}"]`) as HTMLElement ||
                                          document.querySelector(`#${baseField}`) as HTMLElement ||
                                          document.querySelector(`input[id*="${baseField}"]`) as HTMLElement ||
                                          document.querySelector(`select[id*="${baseField}"]`) as HTMLElement;
                        }
                        
                        // Try to find by label text if still not found
                        if (!fieldElement) {
                            // Get the field label from the error message or field name
                            const fieldLabels: Record<string, string> = {
                                firstName: 'First Name',
                                employeeCode: 'Employee Code',
                                typeOfEmployment: 'Type of Employment',
                                employeeGroup: 'Employee Group',
                                school: 'Department',
                                designation: 'Designation',
                                grade: 'Grade',
                                fatherName: "Father's Name",
                                motherName: "Mother's Name",
                                dateOfBirth: 'Date of Birth',
                                dateOfJoining: 'Date of Joining',
                                gender: 'Gender',
                                maritalStatus: 'Marital Status',
                                religion: 'Religion',
                                casteCategory: 'Caste Category',
                                caste: 'Caste',
                                modeOfPayment: 'Mode of Payment'
                            };
                            
                            const labelText = fieldLabels[firstField] || firstField;
                            // Try to find label and then the associated input
                            const labels = Array.from(document.querySelectorAll('label'));
                            const matchingLabel = labels.find(label => 
                                label.textContent?.includes(labelText) || 
                                label.getAttribute('for')?.includes(firstField)
                            );
                            
                            if (matchingLabel) {
                                const labelFor = matchingLabel.getAttribute('for');
                                if (labelFor) {
                                    fieldElement = document.querySelector(`#${labelFor}`) as HTMLElement;
                                }
                                if (!fieldElement && matchingLabel.parentElement) {
                                    fieldElement = matchingLabel.parentElement.querySelector('input, select, textarea') as HTMLElement;
                                }
                            }
                        }
                        
                        if (fieldElement) {
                            fieldElement.focus();
                            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                            // If we can't find the field, scroll to top of form to show errors
                            const formElement = document.querySelector('form') || document.querySelector('[class*="space-y"]');
                            if (formElement) {
                                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }
                    }, 200);
                    return;
                } else {
                    // If no errors found but validation failed, show generic message
                    console.warn('⚠️ [SUBMIT] Validation failed but no errors found in form state');
                    toast.error('Please check the form fields and fix any validation errors');
                    return;
                }
            }
        }
        
        // Get form data and proceed with submission
        const formData = getValues();
        console.log('🔍 [SUBMIT] Validation passed, proceeding with handleTabSubmit');
        try {
            await handleTabSubmit(formData);
        } catch (error: any) {
            console.error('🔴 [SUBMIT] Error in handleTabSubmit:', error);
            toast.error(error?.message || 'An error occurred while submitting the form');
        }
    };
    
    // Keep handleSubmit for backward compatibility but don't use it for form submission
    const _onFormSubmit = handleSubmit(
        async (data: FormFields) => {
            // This should not be called anymore, but kept for safety
            console.log('🔍 [SUBMIT] handleSubmit callback called (should not happen)');
            await handleTabSubmit(data);
        },
        (errors) => {
            console.error('🔴 [SUBMIT] Form validation errors:', errors);
            console.error('🔴 [SUBMIT] Error details:', JSON.stringify(errors, null, 2));
            console.error('🔴 [SUBMIT] Current tab:', activeTab);
            
            // Get current tab fields to show ONLY relevant errors for this tab
            const currentTabFields = tabFieldMap[activeTab] || [];
            console.error('🔴 [SUBMIT] Current tab fields:', currentTabFields);
            
            // Clear errors from other tabs - only keep errors for current tab
            const allTabFields = Object.values(tabFieldMap).flat();
            const otherTabFields = allTabFields.filter(field => !currentTabFields.includes(field));
            
            // Clear errors from other tabs
            otherTabFields.forEach((field) => {
                if (errors[field as keyof typeof errors]) {
                    clearErrors(field);
                }
            });
            
            // Find the first error ONLY for the current tab
            let firstError: any = null;
            let firstErrorField = '';
            
            // Check current tab fields ONLY
            for (const field of currentTabFields) {
                const fieldError = errors[field as keyof typeof errors];
                if (fieldError) {
                    firstError = fieldError;
                    firstErrorField = field as string;
                    break;
                }
            }
            
            // Also check nested fields for current tab (e.g., mobileDetails for employee tab)
            if (!firstError && activeTab === 'employee') {
                // Check mobileDetails, emailDetails, bankDetails for employee tab
                if (errors.mobileDetails) {
                    firstError = errors.mobileDetails;
                    firstErrorField = 'mobileDetails';
                } else if (errors.emailDetails) {
                    firstError = errors.emailDetails;
                    firstErrorField = 'emailDetails';
                } else if (errors.bankDetails) {
                    firstError = errors.bankDetails;
                    firstErrorField = 'bankDetails';
                }
            }
            
            // If no error found in current tab fields, don't show error from other tabs
            if (!firstError) {
                console.log('ℹ️ [SUBMIT] No errors found for current tab, ignoring errors from other tabs');
                // Don't show error if it's from another tab
                return;
            }
            
            // Show specific error message
            if (firstError) {
                let errorMessage = '';
                
                // Handle different error structures
                if (typeof firstError === 'object') {
                    // Check for direct message
                    if (firstError.message) {
                        errorMessage = firstError.message;
                    }
                    // Check for nested array errors (e.g., mobileDetails[0].mobileNo)
                    else if (Array.isArray(firstError)) {
                        const arrayError = firstError.find((err: any) => err && typeof err === 'object' && err.message);
                        if (arrayError) {
                            errorMessage = arrayError.message;
                        } else if (firstError[0]) {
                            const firstItem = firstError[0];
                            if (typeof firstItem === 'object') {
                                // Check nested fields like mobileNo
                                if (firstItem.mobileNo?.message) {
                                    errorMessage = firstItem.mobileNo.message;
                                } else if (firstItem.emailId?.message) {
                                    errorMessage = firstItem.emailId.message;
                                } else if (firstItem.message) {
                                    errorMessage = firstItem.message;
                                }
                            }
                        }
                    }
                    // Check for root error
                    else if (firstError.root?.message) {
                        errorMessage = firstError.root.message;
                    }
                    // Check for type-based error
                    else if (firstError.type) {
                        errorMessage = `Please check ${firstErrorField}`;
                    }
                }
                
                if (!errorMessage) {
                    // Try to get a meaningful field name
                    const fieldName = firstErrorField
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim();
                    errorMessage = `Please fix the error in ${fieldName}`;
                }
                
                // Errors are already set on fields, just scroll to first error
                setTimeout(() => {
                    const fieldElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement ||
                                       document.querySelector(`#${firstErrorField}`) as HTMLElement;
                    if (fieldElement) {
                        fieldElement.focus();
                        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        }
    );

    return (
        <div className={className || ''}>
            <form
                onSubmit={onFormSubmit}
                className='space-y-6'>
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
                            onClear={handleClearCurrentTab}
                            setValue={setValue}
                            getValues={getValues}
                            currentTab={activeTab}
                            onPreviousTab={handlePreviousTab}
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
                            countries={options?.countries || []}
                            states={options?.states || []}
                            onClear={handleClearCurrentTab}
                            currentTab={activeTab}
                            onPreviousTab={handlePreviousTab}
                        />
                    </TabsContent>

                    <TabsContent value='qualification' className='mt-4'>
                        <QualificationTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isPending || isSavingQualification}
                            options={options}
                            countries={options?.countries || []}
                            states={options?.states || []}
                            setValue={setValue}
                            onClear={handleClearCurrentTab}
                            currentTab={activeTab}
                            onPreviousTab={handlePreviousTab}
                        />
                    </TabsContent>

                    <TabsContent value='experience' className='mt-4'>
                        <ExperienceTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isSavingExperience}
                            setValue={setValue}
                            onClear={handleClearCurrentTab}
                            currentTab={activeTab}
                            onPreviousTab={handlePreviousTab}
                        />
                    </TabsContent>

                    <TabsContent value='document' className='mt-4'>
                        <UploadDocumentTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isSavingDocument}
                            watch={watch}
                            onClear={handleClearCurrentTab}
                            currentTab={activeTab}
                            onPreviousTab={handlePreviousTab}
                        />
                    </TabsContent>

                    <TabsContent value='medical' className='mt-4'>
                        <MedicalRecordTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isSavingMedical}
                            onClear={handleClearCurrentTab}
                            currentTab={activeTab}
                            onPreviousTab={handlePreviousTab}
                        />
                    </TabsContent>

                    <TabsContent value='other' className='mt-4'>
                        <OtherDetailsTab
                            control={control}
                            register={register}
                            errors={errors}
                            isSubmitting={isSubmitting || isPending}
                            watch={watch}
                            options={options}
                            onClear={handleClearCurrentTab}
                            currentTab={activeTab}
                            onPreviousTab={handlePreviousTab}
                        />
                    </TabsContent>

                    <TabsContent value='payroll' className='mt-4'>
                        {savedEmployeeId && watch('employeeCode') ? (
                            <PayrollTab 
                                employeeId={savedEmployeeId} 
                                employeeCode={watch('employeeCode')}
                                grossList={onloadData?.grossList || []}
                                earningList={onloadData?.earningList || []}
                                detectionList={onloadData?.detectionList || []}
                                arrearList={onloadData?.arrearList || []}
                                onSuccess={onSuccess}
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
