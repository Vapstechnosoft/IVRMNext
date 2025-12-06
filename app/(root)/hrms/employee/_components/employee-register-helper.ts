import type { employeeRegisterSchemas } from '@/schemas/hrms/employee-register-schemas';
import type { SavePersonalDetailsRequest } from '@/types/hrms/employee-register';
import type { z } from 'zod';

type FormFields = z.infer<typeof employeeRegisterSchemas.add>;

/**
 * Map form data to API format for SavePersonalDetails
 */
export function mapFormDataToApiFormat(data: FormFields, employeeId = 0, selectedPhoto: string | null = null): SavePersonalDetailsRequest {
    // Get mobile and email from arrays (take first/default)
    const defaultMobile = data.mobileDetails?.[0]?.mobileNo || '';
    const defaultEmail = data.emailDetails?.[0]?.emailId || '';
    // Get bank account from bank details (take first/default)
    const defaultBankAccount = data.bankDetails?.[0]?.bankAccountNo || '';

    // MI_Id is excluded from payload - backend extracts it from JWT
    const payload = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRME_Id: employeeId,
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
    } as SavePersonalDetailsRequest;
    return payload;
}

/**
 * Map form data to API format without address fields (for employee tab only)
 */
export function mapFormDataToApiFormatWithoutAddress(
    data: FormFields,
    employeeId = 0,
    selectedPhoto: string | null = null
): SavePersonalDetailsRequest {
    const payload = mapFormDataToApiFormat(data, employeeId, selectedPhoto);
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
}

/**
 * Tab field mapping for validation
 */
export const tabFieldMap: Record<string, (keyof FormFields)[]> = {
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
    medical: [
        'employeeHeight',
        'employeeHeightUnit',
        'employeeWeight',
        'employeeWeightUnit',
        'eyeSightIssue',
        'anyHealthIssue',
        'identificationMark'
    ],
    other: [
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
};

/**
 * Steps configuration for the form
 */
export const employeeRegisterSteps = [
    {
        id: 1,
        name: 'Employee Information',
        description: 'Basic details',
        icon: 'User',
        tabKey: 'employee'
    },
    {
        id: 2,
        name: 'Address Information',
        description: 'Residential & Permanent',
        icon: 'MapPinHouse',
        tabKey: 'address'
    },
    {
        id: 3,
        name: 'Qualification',
        description: 'Educational qualifications',
        icon: 'GraduationCap',
        tabKey: 'qualification'
    },
    {
        id: 4,
        name: 'Experience',
        description: 'Work experience',
        icon: 'Briefcase',
        tabKey: 'experience'
    },
    {
        id: 5,
        name: 'Document Upload',
        description: 'Required documents',
        icon: 'FileUp',
        tabKey: 'document'
    },
    {
        id: 6,
        name: 'Medical Record',
        description: 'Health information',
        icon: 'Heart',
        tabKey: 'medical'
    },
    {
        id: 7,
        name: 'Other Details',
        description: 'Additional information',
        icon: 'ReceiptText',
        tabKey: 'other'
    },
    {
        id: 8,
        name: 'Payroll',
        description: 'Salary & deductions',
        icon: 'DollarSign',
        tabKey: 'payroll'
    }
];

/**
 * Helper function to ensure SelectItem value is never empty string
 */
export function ensureNonEmptyValue(value: any, fallback: any = null): string | null {
    if (value == null || value === undefined) {
        if (fallback != null && fallback !== undefined) {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }
    if (value === '') {
        if (fallback != null && fallback !== undefined && fallback !== '') {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }
    const str = String(value);
    if (str === '' || str.trim() === '') {
        if (fallback != null && fallback !== undefined && fallback !== '') {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }
    const trimmed = str.trim();
    if (trimmed === '' || trimmed.length === 0) {
        return null;
    }
    return trimmed;
}
