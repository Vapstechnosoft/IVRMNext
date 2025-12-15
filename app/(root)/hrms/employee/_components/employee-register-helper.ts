import type { employeeRegisterSchemas } from '@/schemas/hrms/employee-register-schemas';
import type { SavePersonalDetailsApiRequest } from '@/types/hrms/employee-register';
import type { z } from 'zod';
import { format } from 'date-fns';

type FormFields = z.infer<typeof employeeRegisterSchemas.add>;

/**
 * Convert File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1] || result;
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Generate random image name: random number + random character
 * Example: "12345A", "67890B"
 */
export function generateRandomImageName(): string {
    // Generate random number (5-6 digits)
    const randomNumber = Math.floor(Math.random() * 900000) + 100000; // 100000-999999
    // Generate random uppercase character
    const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    return `${randomNumber}${randomChar}`;
}

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
export function mapFormDataToApiFormat(data: FormFields, employeeId = 0, selectedPhoto: string | null = null): SavePersonalDetailsApiRequest {
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

/**
 * Map API response from GetEmployeeDetailsById to form fields
 * Converts API response structure to form field structure
 */
export function mapApiResponseToFormFields(apiData: any): Partial<FormFields> {
    if (!apiData || !apiData.data) {
        return {};
    }

    const data = apiData.data;
    
    // Helper to format date from API (ISO string) to form format (YYYY-MM-DD)
    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) return '';
            return format(date, 'yyyy-MM-dd');
        } catch {
            return '';
        }
    };

    // Helper to convert number to string for form fields
    const numToString = (val: number | null | undefined): string => {
        if (val === null || val === undefined || val === 0) return '';
        return String(val);
    };

    // Map qualification details
    const qualificationDetails = Array.isArray(data.qualificationDetails)
        ? data.qualificationDetails.map((qual: any) => ({
            hrmeQ_Id: qual.hrmeQ_Id || qual.HRMEQ_Id || 0, // Preserve ID for updates
            qualification: qual.hrmE_QualificationName || '',
            course: numToString(qual.hrmC_Id),
            college: qual.hrmeQ_CollegeName || '',
            university: qual.hrmeQ_UniversityName || '',
            yearOfPassing: numToString(qual.hrmeQ_YearOfPassing),
            qualificationCountry: numToString(qual.hrmeQ_CountryId),
            qualificationState: numToString(qual.hrmeQ_StateId),
            registrationNo: qual.hrmeQ_RegistrationNo || '',
            result: qual.hrmeQ_Result || '',
            cgpaOrPercentage: qual.hrmeQ_CGPAOrPerFlag || 'CGPA',
            cgpa: qual.hrmeQ_CGPA || '',
            percentage: qual.hrmeQ_Percentage || '',
            areaOfSpecialisation: qual.hrmeQ_AreaOfSpecialisation || '',
            phdFlag: qual.hrmeQ_PHDFlg || false,
            medicalCouncil: qual.hrmeQ_MedicalCouncil || '',
            thesisTitle: qual.hrmeQ_ThesisTitle || '',
            registrationYear: numToString(qual.hrmeQ_RegistrationYear),
            guideName: qual.hrmeQ_GuideName || '',
            qualifiedDate: formatDate(qual.hrmeQ_Date),
            hardcopy: qual.hrmeQ_Hardcopy || ''
        }))
        : [];

    // Map experience details
    const experienceDetails = Array.isArray(data.experienceDetails)
        ? data.experienceDetails.map((exp: any) => ({
            hrmeE_Id: exp.hrmeE_Id || exp.HRMEE_Id || 0, // Preserve ID for updates
            organisationName: exp.hrmeE_OrganisationName || '',
            organisationAddress: exp.hrmeE_OrganisationAddress || '',
            department: exp.hrmeE_Department || '',
            designation: exp.hrmeE_Designation || '',
            joinDate: formatDate(exp.hrmeE_JoinDate),
            exitDate: formatDate(exp.hrmeE_ExitDate),
            noOfYears: numToString(exp.hrmeE_NoOfYears),
            noOfMonths: numToString(exp.hrmeE_NoOfMonths),
            annualSalary: numToString(exp.hrmeE_AnnualSalary),
            reasonForLeaving: exp.hrmeE_ReasonForLeaving || ''
        }))
        : [];

    // Map document list
    const documentList = Array.isArray(data.documentList)
        ? data.documentList.map((doc: any) => ({
            hrmedS_Id: doc.hrmedS_Id || doc.HRMEDS_Id || 0, // Preserve ID for updates
            documentName: doc.hrmedS_DocumentName || '',
            documentDescription: doc.hrmedS_DucumentDescription || '',
            document: null, // File will be handled separately if needed
            imageName: doc.hrmedS_DocumentImageName || ''
        }))
        : [];

    // Map bank details
    const bankDetails = Array.isArray(data.employeebankDetails)
        ? data.employeebankDetails.map((bank: any) => ({
            bank: numToString(bank.hrmbD_Id),
            bankAccountNo: bank.hrmeB_AccountNo || '',
            isActive: bank.hrmeB_ActiveFlag === 'Y' || bank.hrmeB_ActiveFlag === true
        }))
        : [];

    // Map mobile details (from selectedmobile_list_dto or use hrmE_MobileNo)
    const mobileDetails = Array.isArray(data.selectedmobile_list_dto) && data.selectedmobile_list_dto.length > 0
        ? data.selectedmobile_list_dto.map((mobile: any) => ({
            mobileNo: numToString(mobile.hrmemno_MobileNo || mobile.hrmemnO_MobileNo || mobile.hrmemno_MobileNo),
            type: mobile.hrmemno_DeFaultFlag || mobile.hrmemno_DeFaultFlag || 'Default'
        }))
        : data.hrmE_MobileNo
        ? [{ mobileNo: numToString(data.hrmE_MobileNo), type: 'Default' }]
        : [{ mobileNo: '', type: 'Default' }];

    // Map email details (from selectedemail_list_dto or use hrmE_EmailId)
    const emailDetails = Array.isArray(data.selectedemail_list_dto) && data.selectedemail_list_dto.length > 0
        ? data.selectedemail_list_dto.map((email: any) => ({
            emailId: email.hrmem_EmailId || email.hrmeM_EmailId || '',
            type: email.hrmem_DeFaultFlag || email.hrmem_DeFaultFlag || 'Default'
        }))
        : data.hrmE_EmailId
        ? [{ emailId: data.hrmE_EmailId, type: 'Default' }]
        : [{ emailId: '', type: 'Default' }];

    // Return mapped form fields
    return {
        // Basic employee info
        firstName: data.hrmE_EmployeeFirstName || '',
        middleName: data.hrmE_EmployeeMiddleName || '',
        lastName: data.hrmE_EmployeeLastName || '',
        employeeCode: data.hrmE_EmployeeCode || '',
        typeOfEmployment: numToString(data.hrmeT_Id),
        employeeGroup: numToString(data.hrmgT_Id),
        school: numToString(data.hrmD_Id),
        designation: numToString(data.hrmdeS_Id),
        grade: numToString(data.hrmG_Id),
        gender: numToString(data.ivrmmG_Id),
        maritalStatus: numToString(data.ivrmmmS_Id),
        religion: numToString(data.religionId),
        casteCategory: numToString(data.casteCategoryId),
        caste: numToString(data.casteId),
        bloodGroup: data.hrmE_BloodGroup || '',
        salaryType: data.hrmE_SalaryType || '',
        modeOfPayment: data.hrmE_PaymentType || '',
        subjectTaught: data.hrmE_SubjectsTaught || '',
        // Personal details
        fatherName: data.hrmE_FatherName || '',
        motherName: data.hrmE_MotherName || '',
        // Dates
        dateOfBirth: formatDate(data.hrmE_DOB),
        dateOfJoining: formatDate(data.hrmE_DOJ),
        dateOfConfirmation: formatDate(data.hrmE_DOC || data.hrmE_doc),
        dateOfRetirement: formatDate(data.hrmE_ExpectedRetirementDate),
        // Address - Contact/Local
        contactAddress: data.hrmE_LocStreet || '',
        contactArea: data.hrmE_LocArea || '',
        contactCity: data.hrmE_LocCity || '',
        contactState: numToString(data.hrmE_LocStateId),
        contactCountry: numToString(data.hrmE_LocCountryId),
        contactPincode: numToString(data.hrmE_LocPincode),
        // Address - Permanent
        permanentAddress: data.hrmE_PerStreet || '',
        permanentArea: data.hrmE_PerArea || '',
        permanentCity: data.hrmE_PerCity || '',
        permanentState: numToString(data.hrmE_PerStateId),
        permanentCountry: numToString(data.hrmE_PerCountryId),
        permanentPincode: numToString(data.hrmE_PerPincode),
        sameAsCommunicationAddress: false, // Will be set based on comparison
        // PF Details
        pfApplicable: data.hrmE_PFApplicableFlag || false,
        pfMaxAmount: data.hrmE_PFMaxFlag || false,
        pfFixedAmount: data.hrmE_PFFixedFlag || false,
        pfAccNo: data.hrmE_PFAccNo || '',
        uanNumber: data.hrmE_UINumber || '',
        pfDate: formatDate(data.hrmE_PFDate),
        // ESI Details
        esiApplicable: data.hrmE_ESIApplicableFlag || false,
        esiAccNo: data.hrmE_ESIAccNo || '',
        gratuityAccNo: data.hrmE_GratuityAccNo || '',
        esiDate: formatDate(data.hrmE_ESIDate),
        // Other flags
        epf: !data.hrmE_EPFNotApplicableFlg,
        ppf: !data.hrmE_FPFNotApplicableFlg,
        // Biometric and RFID
        biometricCode: data.hrmE_BiometricCode || '',
        rfCardId: data.hrmE_RFCardId || '',
        // Bank account is in bankDetails array
        // Contact arrays
        mobileDetails,
        emailDetails,
        bankDetails,
        // Arrays
        qualificationDetails,
        experienceDetails,
        documentList,
        // Other details tab
        employeeLeft: data.hrmE_LeftFlag || false,
        lastWorkingDay: formatDate(data.hrmE_DOL),
        reasonForLeaving: data.hrmE_LeavingReason || '',
        stopPension: data.hrmE_RetiredFlg || false,
        dateOfStopPension: formatDate(data.hrmE_PensionStoppedDate),
        // Medical details
        employeeHeight: data.hrmE_Height || '',
        employeeHeightUnit: data.hrmE_HeightUOM || '',
        employeeWeight: numToString(data.hrmE_Weight),
        employeeWeightUnit: data.hrmE_WeightUOM || '',
        identificationMark: data.hrmE_IdentificationMark || '',
        anyHealthIssue: data.hrmE_AnyHealthIssue || '',
        eyeSightIssue: data.hrmE_EyeSightIssue || '',
        // Documents
        panCardNo: data.hrmE_PANCardNo || '',
        aadharNo: numToString(data.hrmE_AadharCardNo),
        nationalSSN: data.hrmE_NationalSSN || '',
        // Other flags
        phdResearchGuide: data.hrmE_PHDResearchGuideFlg || false,
        teachingNonTeaching: data.hrmE_TechNonTeachingFlg || '',
        recognitionYear: numToString(data.hrmE_RGRecognitionYear),
        msTeamsUserName: data.hrmE_MSTeamsUserId || '',
        msTeamsPassword: data.hrmE_MSTeamsPassword || '',
        punchRelaxation: data.hrmE_ExcPunch || false
    };
}

/**
 * Map API response to form fields for Tab 1 (Employee Information) only
 */
export function mapApiResponseToTab1Fields(apiData: any): Partial<FormFields> {
    if (!apiData || !apiData.data) {
        return {};
    }

    const data = apiData.data;
    
    // Helper to format date from API (ISO string) to form format (YYYY-MM-DD)
    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) return '';
            return format(date, 'yyyy-MM-dd');
        } catch {
            return '';
        }
    };

    // Helper to convert number to string for form fields
    const numToString = (val: number | null | undefined): string => {
        if (val === null || val === undefined || val === 0) return '';
        return String(val);
    };

    // Map mobile details (from selectedmobile_list_dto or use hrmE_MobileNo)
    const mobileDetails = Array.isArray(data.selectedmobile_list_dto) && data.selectedmobile_list_dto.length > 0
        ? data.selectedmobile_list_dto.map((mobile: any) => ({
            mobileNo: numToString(mobile.hrmemno_MobileNo || mobile.hrmemnO_MobileNo || mobile.hrmemno_MobileNo),
            type: mobile.hrmemno_DeFaultFlag || mobile.hrmemno_DeFaultFlag || 'Default'
        }))
        : data.hrmE_MobileNo
        ? [{ mobileNo: numToString(data.hrmE_MobileNo), type: 'Default' }]
        : [{ mobileNo: '', type: 'Default' }];

    // Map email details (from selectedemail_list_dto or use hrmE_EmailId)
    const emailDetails = Array.isArray(data.selectedemail_list_dto) && data.selectedemail_list_dto.length > 0
        ? data.selectedemail_list_dto.map((email: any) => ({
            emailId: email.hrmem_EmailId || email.hrmeM_EmailId || '',
            type: email.hrmem_DeFaultFlag || email.hrmem_DeFaultFlag || 'Default'
        }))
        : data.hrmE_EmailId
        ? [{ emailId: data.hrmE_EmailId, type: 'Default' }]
        : [{ emailId: '', type: 'Default' }];

    // Return only Tab 1 fields (Employee Information)
    return {
        // Basic employee info
        firstName: data.hrmE_EmployeeFirstName || '',
        middleName: data.hrmE_EmployeeMiddleName || '',
        lastName: data.hrmE_EmployeeLastName || '',
        employeeCode: data.hrmE_EmployeeCode || '',
        typeOfEmployment: numToString(data.hrmeT_Id),
        employeeGroup: numToString(data.hrmgT_Id),
        school: numToString(data.hrmD_Id),
        designation: numToString(data.hrmdeS_Id),
        grade: numToString(data.hrmG_Id),
        gender: numToString(data.ivrmmG_Id),
        maritalStatus: numToString(data.ivrmmmS_Id),
        religion: numToString(data.religionId),
        casteCategory: numToString(data.casteCategoryId),
        caste: numToString(data.casteId),
        bloodGroup: data.hrmE_BloodGroup || '',
        salaryType: data.hrmE_SalaryType || '',
        modeOfPayment: data.hrmE_PaymentType || '',
        subjectTaught: data.hrmE_SubjectsTaught || '',
        // Personal details
        fatherName: data.hrmE_FatherName || '',
        motherName: data.hrmE_MotherName || '',
        // Dates
        dateOfBirth: formatDate(data.hrmE_DOB),
        dateOfJoining: formatDate(data.hrmE_DOJ),
        dateOfConfirmation: formatDate(data.hrmE_DOC || data.hrmE_doc),
        dateOfRetirement: formatDate(data.hrmE_ExpectedRetirementDate),
        // Contact arrays (for Tab 1)
        mobileDetails,
        emailDetails,
        // PF Details
        pfApplicable: data.hrmE_PFApplicableFlag || false,
        pfMaxAmount: data.hrmE_PFMaxFlag || false,
        pfFixedAmount: data.hrmE_PFFixedFlag || false,
        pfAccNo: data.hrmE_PFAccNo || '',
        uanNumber: data.hrmE_UINumber || '',
        pfDate: formatDate(data.hrmE_PFDate),
        // ESI Details
        esiApplicable: data.hrmE_ESIApplicableFlag || false,
        esiAccNo: data.hrmE_ESIAccNo || '',
        gratuityAccNo: data.hrmE_GratuityAccNo || '',
        esiDate: formatDate(data.hrmE_ESIDate),
        // Other flags
        epf: !data.hrmE_EPFNotApplicableFlg,
        ppf: !data.hrmE_FPFNotApplicableFlg,
        // Biometric and RFID
        biometricCode: data.hrmE_BiometricCode || '',
        rfCardId: data.hrmE_RFCardId || '',
        // Bank account is in bankDetails array
        // Documents (Tab 1)
        panCardNo: data.hrmE_PANCardNo || '',
        aadharNo: numToString(data.hrmE_AadharCardNo),
        nationalSSN: data.hrmE_NationalSSN || '',
        // Other flags (Tab 1)
        phdResearchGuide: data.hrmE_PHDResearchGuideFlg || false,
        teachingNonTeaching: data.hrmE_TechNonTeachingFlg || '',
        recognitionYear: numToString(data.hrmE_RGRecognitionYear)
    };
}

/**
 * Map API response to form fields for Tab 2 (Address Information) only
 */
export function mapApiResponseToTab2Fields(apiData: any): Partial<FormFields> {
    if (!apiData || !apiData.data) {
        return {};
    }

    const data = apiData.data;
    
    // Helper to convert number to string for form fields
    const numToString = (val: number | null | undefined): string => {
        if (val === null || val === undefined || val === 0) return '';
        return String(val);
    };

    // Return only Tab 2 fields (Address Information)
    return {
        // Address - Contact/Local
        contactAddress: data.hrmE_LocStreet || '',
        contactArea: data.hrmE_LocArea || '',
        contactCity: data.hrmE_LocCity || '',
        contactState: numToString(data.hrmE_LocStateId),
        contactCountry: numToString(data.hrmE_LocCountryId),
        contactPincode: numToString(data.hrmE_LocPincode),
        // Address - Permanent
        permanentAddress: data.hrmE_PerStreet || '',
        permanentArea: data.hrmE_PerArea || '',
        permanentCity: data.hrmE_PerCity || '',
        permanentState: numToString(data.hrmE_PerStateId),
        permanentCountry: numToString(data.hrmE_PerCountryId),
        permanentPincode: numToString(data.hrmE_PerPincode),
        sameAsCommunicationAddress: false // Will be set based on comparison
    };
}

/**
 * Map API response to form fields for Tab 3 (Qualification) only
 */
export function mapApiResponseToTab3Fields(apiData: any): Partial<FormFields> {
    if (!apiData || !apiData.data) {
        return {};
    }

    const data = apiData.data;
    
    // Helper to format date from API (ISO string) to form format (YYYY-MM-DD)
    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) return '';
            return format(date, 'yyyy-MM-dd');
        } catch {
            return '';
        }
    };

    // Helper to convert number to string for form fields
    const numToString = (val: number | null | undefined): string => {
        if (val === null || val === undefined || val === 0) return '';
        return String(val);
    };

    // Map qualification details
    const qualificationDetails = Array.isArray(data.qualificationDetails)
        ? data.qualificationDetails.map((qual: any) => ({
            hrmeQ_Id: qual.hrmeQ_Id || qual.HRMEQ_Id || 0, // Preserve ID for updates - CRITICAL!
            qualification: qual.hrmE_QualificationName || '',
            course: numToString(qual.hrmC_Id),
            college: qual.hrmeQ_CollegeName || '',
            university: qual.hrmeQ_UniversityName || '',
            yearOfPassing: numToString(qual.hrmeQ_YearOfPassing),
            qualificationCountry: numToString(qual.hrmeQ_CountryId),
            qualificationState: numToString(qual.hrmeQ_StateId),
            registrationNo: qual.hrmeQ_RegistrationNo || '',
            result: qual.hrmeQ_Result || '',
            cgpaOrPercentage: qual.hrmeQ_CGPAOrPerFlag || 'CGPA',
            cgpa: qual.hrmeQ_CGPA || '',
            percentage: qual.hrmeQ_Percentage || '',
            areaOfSpecialisation: qual.hrmeQ_AreaOfSpecialisation || '',
            phdFlag: qual.hrmeQ_PHDFlg || false,
            medicalCouncil: qual.hrmeQ_MedicalCouncil || '',
            thesisTitle: qual.hrmeQ_ThesisTitle || '',
            registrationYear: numToString(qual.hrmeQ_RegistrationYear),
            guideName: qual.hrmeQ_GuideName || '',
            qualifiedDate: formatDate(qual.hrmeQ_Date),
            hardcopy: qual.hrmeQ_Hardcopy || ''
        }))
        : [];

    return {
        qualificationDetails
    };
}

/**
 * Map API response to form fields for Tab 4 (Experience) only
 */
export function mapApiResponseToTab4Fields(apiData: any): Partial<FormFields> {
    if (!apiData || !apiData.data) {
        return {};
    }

    const data = apiData.data;
    
    // Helper to format date from API (ISO string) to form format (YYYY-MM-DD)
    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) return '';
            return format(date, 'yyyy-MM-dd');
        } catch {
            return '';
        }
    };

    // Helper to convert number to string for form fields
    const numToString = (val: number | null | undefined): string => {
        if (val === null || val === undefined || val === 0) return '';
        return String(val);
    };

    // Map experience details
    const experienceDetails = Array.isArray(data.experienceDetails)
        ? data.experienceDetails.map((exp: any) => ({
            hrmeE_Id: exp.hrmeE_Id || exp.HRMEE_Id || 0, // Preserve ID for updates
            organisationName: exp.hrmeE_OrganisationName || '',
            organisationAddress: exp.hrmeE_OrganisationAddress || '',
            department: exp.hrmeE_Department || '',
            designation: exp.hrmeE_Designation || '',
            joinDate: formatDate(exp.hrmeE_JoinDate),
            exitDate: formatDate(exp.hrmeE_ExitDate),
            noOfYears: numToString(exp.hrmeE_NoOfYears),
            noOfMonths: numToString(exp.hrmeE_NoOfMonths),
            annualSalary: numToString(exp.hrmeE_AnnualSalary),
            reasonForLeaving: exp.hrmeE_ReasonForLeaving || ''
        }))
        : [];

    return {
        experienceDetails
    };
}

/**
 * Map API response to form fields for Tab 5 (Documents) only
 */
export function mapApiResponseToTab5Fields(apiData: any): Partial<FormFields> {
    if (!apiData || !apiData.data) {
        return {};
    }

    const data = apiData.data;

    // Map document list
    const documentList = Array.isArray(data.documentList)
        ? data.documentList.map((doc: any) => ({
            hrmedS_Id: doc.hrmedS_Id || doc.HRMEDS_Id || 0, // Preserve ID for updates
            documentName: doc.hrmedS_DocumentName || '',
            documentDescription: doc.hrmedS_DucumentDescription || '',
            document: null, // File will be handled separately if needed
            imageName: doc.hrmedS_DocumentImageName || ''
        }))
        : [];

    return {
        documentList
    };
}

/**
 * Map API response to form fields for Tab 6 (Medical) only
 */
export function mapApiResponseToTab6Fields(apiData: any): Partial<FormFields> {
    if (!apiData || !apiData.data) {
        return {};
    }

    const data = apiData.data;
    
    // Helper to convert number to string for form fields
    const numToString = (val: number | null | undefined): string => {
        if (val === null || val === undefined || val === 0) return '';
        return String(val);
    };

    return {
        // Medical details
        employeeHeight: data.hrmE_Height || '',
        employeeHeightUnit: data.hrmE_HeightUOM || '',
        employeeWeight: numToString(data.hrmE_Weight),
        employeeWeightUnit: data.hrmE_WeightUOM || '',
        identificationMark: data.hrmE_IdentificationMark || '',
        anyHealthIssue: data.hrmE_AnyHealthIssue || '',
        eyeSightIssue: data.hrmE_EyeSightIssue || ''
    };
}

/**
 * Map API response to form fields for Tab 7 (Other Details) only
 */
export function mapApiResponseToTab7Fields(apiData: any): Partial<FormFields> {
    if (!apiData || !apiData.data) {
        return {};
    }

    const data = apiData.data;
    
    // Helper to format date from API (ISO string) to form format (YYYY-MM-DD)
    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) return '';
            return format(date, 'yyyy-MM-dd');
        } catch {
            return '';
        }
    };

    // Helper to convert number to string for form fields
    const numToString = (val: number | null | undefined): string => {
        if (val === null || val === undefined || val === 0) return '';
        return String(val);
    };

    return {
        // Other details tab
        employeeLeft: data.hrmE_LeftFlag || false,
        lastWorkingDay: formatDate(data.hrmE_DOL),
        reasonForLeaving: data.hrmE_LeavingReason || '',
        stopPension: data.hrmE_RetiredFlg || false,
        dateOfStopPension: formatDate(data.hrmE_PensionStoppedDate),
        // Documents
        panCardNo: data.hrmE_PANCardNo || '',
        aadharNo: numToString(data.hrmE_AadharCardNo),
        nationalSSN: data.hrmE_NationalSSN || '',
        // Other flags
        phdResearchGuide: data.hrmE_PHDResearchGuideFlg || false,
        teachingNonTeaching: data.hrmE_TechNonTeachingFlg || '',
        recognitionYear: numToString(data.hrmE_RGRecognitionYear),
        msTeamsUserName: data.hrmE_MSTeamsUserId || '',
        msTeamsPassword: data.hrmE_MSTeamsPassword || '',
        punchRelaxation: data.hrmE_ExcPunch || false
    };
}

/**
 * Map API response to form fields for Tab 8 (Bank Details) only
 */
export function mapApiResponseToTab8Fields(apiData: any): Partial<FormFields> {
    if (!apiData || !apiData.data) {
        return {};
    }

    const data = apiData.data;
    
    // Helper to convert number to string for form fields
    const numToString = (val: number | null | undefined): string => {
        if (val === null || val === undefined || val === 0) return '';
        return String(val);
    };

    // Map bank details
    const bankDetails = Array.isArray(data.employeebankDetails)
        ? data.employeebankDetails.map((bank: any) => ({
            bank: numToString(bank.hrmbD_Id),
            bankAccountNo: bank.hrmeB_AccountNo || '',
            isActive: bank.hrmeB_ActiveFlag === 'Y' || bank.hrmeB_ActiveFlag === true
        }))
        : [];

    return {
        bankDetails
    };
}
