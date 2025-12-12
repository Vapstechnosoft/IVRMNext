import type { employeeRegisterSchemas } from '@/schemas/hrms/employee-register-schemas';
import type { SavePersonalDetailsApiRequest } from '@/types/hrms/employee-register';
import type { z } from 'zod';

type FormFields = z.infer<typeof employeeRegisterSchemas.add>;

/**
 * Helper function to convert empty string to null
 */
function toNullIfEmpty(value: any): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const str = String(value).trim();
    return str === '' ? null : str;
}

/**
 * Map form data to API format for SavePersonalDetails
 * Uses lowercase field names and sends null for empty strings
 */
export function mapFormDataToApiFormat(
    data: FormFields,
    employeeId = 0,
    selectedPhoto: string | null = null
): SavePersonalDetailsApiRequest {
    // Get mobile and email from arrays (take first/default)
    const defaultMobile = data.mobileDetails?.[0]?.mobileNo || '';
    const defaultEmail = data.emailDetails?.[0]?.emailId || '';
    // Get bank account from bank details (take first/default)
    const defaultBankAccount = data.bankDetails?.[0]?.bankAccountNo || '';

    // Map form data to API format with lowercase field names
    // Send null for empty strings and null for other tab objects
    const payload: SavePersonalDetailsApiRequest = {
        hrmE_Id: employeeId,
        // Employee type/group/department/designation (convert string IDs to numbers)
        hrmeT_Id: Number(data.typeOfEmployment) || 0,
        hrmgT_Id: Number(data.employeeGroup) || 0,
        hrmD_Id: Number(data.school) || 0,
        hrmdeS_Id: Number(data.designation) || 0,
        hrmG_Id: Number(data.grade) || 0,
        // Employee basic info
        hrmE_EmployeeFirstName: toNullIfEmpty(data.firstName),
        hrmE_EmployeeMiddleName: toNullIfEmpty(data.middleName),
        hrmE_EmployeeLastName: toNullIfEmpty(data.lastName),
        hrmE_EmployeeCode: toNullIfEmpty(data.employeeCode),
        hrmE_FatherName: toNullIfEmpty(data.fatherName),
        hrmE_MotherName: toNullIfEmpty(data.motherName),
        hrmE_SpouseName: toNullIfEmpty((data as any).spouseName),
        hrmE_SpouseOccupation: toNullIfEmpty((data as any).spouseOccupation),
        hrmE_SpouseMobileNo: Number((data as any).spouseMobileNo) || 0,
        hrmE_SpouseEmailId: toNullIfEmpty((data as any).spouseEmailId),
        hrmE_SpouseAddress: toNullIfEmpty((data as any).spouseAddress),
        // Dates
        hrmE_DOB: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
        hrmE_DOJ: data.dateOfJoining ? new Date(data.dateOfJoining).toISOString() : null,
        hrmE_doc: data.dateOfConfirmation ? new Date(data.dateOfConfirmation).toISOString() : null,
        hrmE_ExpectedRetirementDate: data.dateOfRetirement ? new Date(data.dateOfRetirement).toISOString() : null,
        // Personal details
        ivrmmG_Id: Number(data.gender) || 0,
        ivrmmmS_Id: Number(data.maritalStatus) || 0,
        religionId: Number(data.religion) || 0,
        casteCategoryId: Number(data.casteCategory) || 0,
        casteId: Number(data.caste) || 0,
        hrmE_BloodGroup: toNullIfEmpty(data.bloodGroup),
        hrmE_SalaryType: toNullIfEmpty(data.salaryType),
        hrmE_PaymentType: toNullIfEmpty(data.modeOfPayment),
        hrmE_SubjectsTaught: toNullIfEmpty(data.subjectTaught),
        hrmE_AppDownloadedDeviceId: toNullIfEmpty(''), // Required by API
        // Contact info
        hrmE_MobileNo: Number(defaultMobile) || 0,
        hrmE_EmailId: toNullIfEmpty(defaultEmail),
        // Address - Local/Contact Address
        hrmE_LocStreet: toNullIfEmpty(data.contactAddress),
        hrmE_LocArea: toNullIfEmpty(data.contactArea),
        hrmE_LocCity: toNullIfEmpty(data.contactCity),
        hrmE_LocAdd4: null, // Not in form
        hrmE_LocStateId: Number(data.contactState) || 0,
        hrmE_LocCountryId: Number(data.contactCountry) || 0,
        hrmE_LocPincode: Number(data.contactPincode) || 0,
        // Address - Permanent Address
        hrmE_PerStreet: toNullIfEmpty(data.permanentAddress),
        hrmE_PerArea: toNullIfEmpty(data.permanentArea),
        hrmE_PerCity: toNullIfEmpty(data.permanentCity),
        hrmE_PerAdd4: null, // Not in form
        hrmE_PerStateId: Number(data.permanentState) || 0,
        hrmE_PerCountryId: Number(data.permanentCountry) || 0,
        hrmE_PerPincode: Number(data.permanentPincode) || 0,
        // PF Details
        hrmE_PFApplicableFlag: data.pfApplicable || false,
        hrmE_PFMaxFlag: data.pfMaxAmount || false,
        hrmE_PFFixedFlag: data.pfFixedAmount || false,
        hrmE_PFAccNo: toNullIfEmpty(data.pfAccNo),
        hrmE_UINumber: toNullIfEmpty(data.uanNumber),
        hrmE_PFDate: data.pfDate ? new Date(data.pfDate).toISOString() : null,
        // ESI Details
        hrmE_ESIApplicableFlag: data.esiApplicable || false,
        hrmE_ESIAccNo: toNullIfEmpty(data.esiAccNo),
        hrmE_GratuityAccNo: toNullIfEmpty(data.gratuityAccNo),
        hrmE_ESIDate: data.esiDate ? new Date(data.esiDate).toISOString() : null,
        // Other flags
        hrmE_EPFNotApplicableFlg: !data.epf,
        hrmE_FPFNotApplicableFlg: !data.ppf,
        hrmE_PHDResearchGuideFlg: data.phdResearchGuide || false,
        hrmE_RGRecognitionYear: Number(data.recognitionYear) || 0,
        hrmE_TechNonTeachingFlg: toNullIfEmpty(data.teachingNonTeaching === 'Non Teaching' ? 'Non Teaching' : 'Teaching'),
        hrmE_NationalSSN: toNullIfEmpty(data.nationalSSN),
        hrmE_PANCardNo: toNullIfEmpty(data.panCardNo),
        hrmE_AadharCardNo: Number(data.aadharNo) || 0,
        hrmE_BankAccountNo: toNullIfEmpty(defaultBankAccount),
        hrmE_BiometricCode: toNullIfEmpty(data.biometricCode),
        hrmE_RFCardId: toNullIfEmpty(data.rfCardId),
        hrmE_Photo: toNullIfEmpty(selectedPhoto), // Base64 photo
        hrmE_ActiveFlag: true,
        hrmE_LeftFlag: data.employeeLeft || false,
        hrmE_DOL: data.lastWorkingDay ? new Date(data.lastWorkingDay).toISOString() : null,
        hrmE_LeavingReason: toNullIfEmpty(data.reasonForLeaving),
        hrmE_Height: toNullIfEmpty(data.employeeHeight),
        hrmE_HeightUOM: toNullIfEmpty(data.employeeHeightUnit),
        hrmE_Weight: Number(data.employeeWeight) || 0,
        hrmE_WeightUOM: toNullIfEmpty(data.employeeWeightUnit),
        hrmE_IdentificationMark: toNullIfEmpty(data.identificationMark),
        hrmE_ApprovalNo: null, // Required by API
        hrmE_AnyHealthIssue: toNullIfEmpty(data.anyHealthIssue),
        hrmE_EyeSightIssue: toNullIfEmpty(data.eyeSightIssue),
        hrmE_SubstituteFlag: false,
        hrmE_EmployeeOrder: 0,
        hrmE_TransfferedTo: 0,
        hrmE_RecordTransferredFlg: false,
        hrmE_MSTeamsUserId: toNullIfEmpty(data.msTeamsUserName),
        hrmE_MSTeamsEmailId: null,
        hrmE_MSTeamsPassword: toNullIfEmpty(data.msTeamsPassword),
        hrmE_ExcPunch: data.punchRelaxation || false,
        hrmE_RetiredFlg: data.stopPension || false,
        hrmE_PensionStoppedDate: data.dateOfStopPension ? new Date(data.dateOfStopPension).toISOString() : null,
        hrmE_AllowSoftwareAccessFlg: false,
        // Other tab objects - send as null when saving personal details
        qualificationDetails: null,
        experienceDetails: null,
        documentList: null,
        medicalDetails: null,
        otherDetails: null,
        payrollDetails: null
    };
    return payload;
}

/**
 * Map form data to API format without address fields (for employee tab only)
 */
export function mapFormDataToApiFormatWithoutAddress(
    data: FormFields,
    employeeId = 0,
    selectedPhoto: string | null = null
): SavePersonalDetailsApiRequest {
    const payload = mapFormDataToApiFormat(data, employeeId, selectedPhoto);
    // Set all address fields to null/0
    payload.hrmE_LocStreet = null;
    payload.hrmE_LocArea = null;
    payload.hrmE_LocCity = null;
    payload.hrmE_LocAdd4 = null;
    payload.hrmE_LocStateId = 0;
    payload.hrmE_LocCountryId = 0;
    payload.hrmE_LocPincode = 0;
    payload.hrmE_PerStreet = null;
    payload.hrmE_PerArea = null;
    payload.hrmE_PerCity = null;
    payload.hrmE_PerAdd4 = null;
    payload.hrmE_PerStateId = 0;
    payload.hrmE_PerCountryId = 0;
    payload.hrmE_PerPincode = 0;
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
