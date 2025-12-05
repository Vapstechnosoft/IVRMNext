import { z } from 'zod';
import {
    createAlphanumericSchema,
    createAlphanumericSchemaPanCard,
    createEmailSchema,
    createNumberOnlyStringSchema,
    createOptionalAlphaNumericSchema,
    createOptionalNumberOnlyStringSchema,
    createOptionalStringSchema,
    createOptionalStringWithLettersSchema,
    createRequiredAlphaNumericWithSpaceSchema,
    createStringOnlyOptionalSchema,
    createStringOnlySchema,
    createStringSchema,
    deleteIdSchema
} from '../validationSchemas';

// Other Information schema (nested object for admission form)
const OtherInformationSchema = z.object({
    religion: createOptionalStringWithLettersSchema('Religion', 2, 50).optional(),
    motherTongue: createOptionalStringWithLettersSchema('Mother Tongue', 2, 50).optional(),
    nationality: createOptionalStringWithLettersSchema('Nationality', 2, 50).optional(),
    socialCategory: z.enum(['General', 'OBC', 'SC', 'ST', 'Other']).optional().or(z.literal('')),
    isMinority: z.boolean().optional(),
    identificationMark: createOptionalStringSchema('Identification Mark', 0, 100).optional(),
    additionalInfo: createOptionalStringSchema('Additional Info', 0, 500).optional()
});

// Health & Medical Details schema (nested object for admission form)
const HealthMedicalDetailsSchema = z
    .object({
        bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().or(z.literal('')),
        heightCm: createOptionalNumberOnlyStringSchema('Height (cm)', 1, 3).optional(),
        weightKg: createOptionalNumberOnlyStringSchema('Weight (kg)', 1, 3).optional(),
        isAllergic: z.boolean().optional(),
        allergies: createOptionalStringSchema('Allergies', 0, 255).optional(),
        chronicIllness: createOptionalStringSchema('Chronic Illness', 0, 255).optional(),
        immunization: createOptionalStringSchema('Immunization', 0, 255).optional(),
        disability: z.enum(['None', 'Visual', 'Hearing', 'Physical', 'Mental', 'Other']).optional().or(z.literal('')),
        disabilityDetails: createOptionalStringSchema('Disability Details', 0, 500).optional()
    })
    .refine(
        (data) => {
            if (data.isAllergic) {
                return !!data.allergies && data.allergies !== '';
            }
            return true;
        },
        { message: 'Allergies must be provided when "isAllergic" is true', path: ['allergies'] }
    );

export const studentAdmissionFormSchema = {
    // Reuse the same schema for add
    add: z
        .object({
            // Student Details
            pasR_FirstName: createStringOnlySchema('First Name', 1, 100),
            pasR_MiddleName: createStringOnlySchema('Middle Name', 1, 100),
            pasR_LastName: createStringOnlySchema('Last Name', 1, 100),
            pasR_RegistrationNo: createNumberOnlyStringSchema('Registration No', 1, 50),
            pasR_AdmissionNo: createNumberOnlyStringSchema('Admission No', 1, 50),
            pasR_Student_Pic_Path: createOptionalStringSchema('Student Photo Path', 1, 500).optional(),
            pasR_Section: createStringOnlyOptionalSchema('Section', 1, 10),
            pasR_DOBInWords: createStringOnlyOptionalSchema('Date Of Birth In Words', 1, 1000).optional(),
            pasR_Age: createRequiredAlphaNumericWithSpaceSchema('Age', 1, 10),
            pasR_Caste: createStringOnlySchema('Caste', 1, 100),
            pasR_SubCaste: createStringOnlyOptionalSchema('Sub Caste', 1, 100),
            pasR_BirthCertificateNo: createOptionalAlphaNumericSchema('Birth Certificate No', 1, 50),
            pasR_CasteCertificateNo: createOptionalAlphaNumericSchema('Caste Certificate No', 1, 50),
            pasR_BiometricId: createOptionalAlphaNumericSchema('Biometric Id', 1, 50),
            pasR_RFCardNo: createOptionalAlphaNumericSchema('RF Card No', 1, 50),

            //ecs flag
            pasR_ECSFlag: z.number().int({ message: 'ECS Flag is required' }),

            pasR_ECSBankAccountNo: createNumberOnlyStringSchema('Bank Account No', 1, 50).optional(),
            pasR_ECSBankName: createStringOnlySchema('Bank Name', 1, 100).optional(),
            pasR_ECSIFSCCode: createAlphanumericSchema('IFSC Code', 1, 20).optional(),
            pasR_ECSBankAccountHolderName: createStringOnlySchema('Account Holder Name', 1, 100).optional(),
            pasR_ECSAccountType: createStringOnlySchema('Account Type', 1, 50).optional(),
            pasR_ECSMICRCode: createNumberOnlyStringSchema('MICR Code', 1, 20).optional(),

            pasR_ECSBranchName: createStringOnlySchema('Branch Name', 1, 100).optional(),

            // EMIS flag

            pasR_EMISFlag: z.number().int(),
            pasR_EMISCardNo: createOptionalAlphaNumericSchema('EMIS Card No', 1, 50).optional(),

            //bank details
            pasR_BankAccountNo: createOptionalNumberOnlyStringSchema('Bank Account No', 1, 50),
            pasR_BankName: createStringOnlyOptionalSchema('Bank Name', 1, 100),
            pasR_IFSCCode: createOptionalAlphaNumericSchema('IFSC Code', 1, 20),
            pasR_BankAccountHolderName: createStringOnlyOptionalSchema('Account Holder Name', 1, 100),
            pasR_AccountType: createStringOnlyOptionalSchema('Account Type', 1, 50),
            pasR_MICRCode: createOptionalNumberOnlyStringSchema('MICR Code', 1, 20),
            pasR_BranchName: createStringOnlyOptionalSchema('Branch Name', 1, 100),

            pasR_StudentTPIN: createOptionalAlphaNumericSchema('Student TPIN', 1, 50),
            pasR_GPSTracingId: createOptionalAlphaNumericSchema('GPS Tracing Id', 1, 50),
            pasR_MediumOfInstruction: createStringOnlyOptionalSchema('Medium Of Instruction', 1, 50),

            // NATIONALITY - STRING
            pasR_Nationality: z.string().min(1, 'Student nationality is required'),
            pasR_FatherNationality: z.number().int({ message: 'Nationality is required' }),
            pasR_MotherNationality: z.number().int({ message: 'Nationality is required' }),

            pasR_MobileNo: z.string().refine((val) => !val.startsWith('0'), {
                message: 'Mobile number cannot start with 0'
            }),

            pasR_BirthPlace: createStringOnlyOptionalSchema('Student Birth Place', 1, 100),
            religion_Id: z.number().int({ message: 'Religion is required' }),
            caste_Id: z.number().int({ message: 'Caste is required' }),
            pasR_Sex: createStringSchema('Gender', 1, 50),
            pasR_DateOfAdmission: z.date({ message: 'Date Of Admission is required' }),

            pasR_DOB: z.date({ message: 'Date Of Birth is required' }).refine(() => true),
            asmcL_Id: z.number(),
            // .int({ message: 'Applying For is required' })
            // .refine((val) => val > 0, { message: 'Please select a valid class' }),

            pasR_FeeConcessionType: createStringOnlySchema('Caste', 1, 100),
            pasR_emailId: createEmailSchema('Student Email', 1, 50),
            pasR_MotherTongue: createStringOnlyOptionalSchema('Student Mother Tongue', 1, 100),

            // Other Details
            pasR_AadharNo: z
                .string()
                .refine((val) => val === '' || val.length === 12, {
                    message: 'Aadhar No must be exactly 12 digits'
                })
                .optional(),
            pasR_Languagespeaking: createStringOnlyOptionalSchema('Student Language Speaking At Home', 1, 100),
            pasR_LastPlayGrndAttnd: createStringOnlyOptionalSchema('Student Last Play Ground Attended', 1, 50),
            pasR_ExtraActivity: createStringOnlyOptionalSchema('Student Extra Activity', 1, 50),
            source_ids: z.array(z.string()).optional(),
            reference_ids: z.array(z.string()).optional(),
            pasR_TransportReqdFlag: z.number().int({ message: 'Transport Required Flag is required' }),

            // Other Information (nested object)
            otherInformation: OtherInformationSchema.optional(),

            // Health & Medical Details (nested object)
            healthMedicalDetails: HealthMedicalDetailsSchema.optional(),

            // Residential Address
            pasR_ConStreet: createOptionalAlphaNumericSchema('Street', 1, 100),
            pasR_ConArea: createOptionalAlphaNumericSchema('Area', 1, 100),
            pasR_ConCountry: z.string().optional(),
            pasR_ConState: z.number().int().optional(),
            pasR_ConCity: createOptionalAlphaNumericSchema('City', 1, 100),
            pasR_ConPincode: z
                .union([z.string(), z.number()])
                .optional()
                .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),

            // Permanent Address
            pasR_PerStreet: createOptionalAlphaNumericSchema('Street', 1, 100),
            pasR_PerArea: createOptionalAlphaNumericSchema('Area', 1, 100),
            pasR_PerCountry: z.string().optional(),
            pasR_PerState: z.number().int().optional(),
            pasR_PerCity: createOptionalAlphaNumericSchema('City', 1, 100),
            pasR_PerPincode: z
                .union([z.string(), z.number()])
                .optional()
                .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),

            // Father Details
            pasR_FatherName: createStringOnlySchema('Father Name', 1, 100),
            pasR_FatherSurname: createStringOnlyOptionalSchema('Father Surname', 1, 100),
            pasR_FatherAadhaar_No: z
                .string()
                .optional()
                // Allow undefined or empty string (user cleared the field) OR a 12-digit Aadhar
                .refine((val) => val === undefined || val === '' || /^[0-9]{12}$/.test(val), {
                    message: 'Aadhar No must be exactly 12 digits'
                }),

            pasR_FatherEducation: createStringOnlyOptionalSchema('Father Education', 1, 100),
            // pasR_FatherOccupation: createOptionalStringSchema('Father Occupation', 1, 100),
            pasR_FatherPanno: createAlphanumericSchemaPanCard('Father PAN Number', true),
            pasR_FatherDesignation: createStringOnlyOptionalSchema('Father Designation', 1, 100),
            pasR_FatherOfficeAddr: createOptionalStringSchema('Father Office Address', 1, 100),
            pasR_FatherMobleNo: z
                .string()
                .refine((val) => !val.startsWith('0'), {
                    message: 'Mobile number cannot start with 0'
                })
                .optional(),
            pasR_FatherEmail_ID: createEmailSchema('Student Email', 1, 50),
            pasR_FatherHome_Phone_No: createOptionalNumberOnlyStringSchema('Father Home Phone No', 1, 15),
            pasA_FatherInstitution: createOptionalStringSchema('Father Attended Institution', 1, 150),
            pasA_FatherMotherTongue: createStringOnlyOptionalSchema('Father Mother Tongue', 1, 100),
            pasA_FatherBusiness: createOptionalStringSchema('Father Business', 1, 150),
            pasA_FatherCompany: createOptionalStringSchema('Father Company', 1, 150),
            pasR_qualification: createStringOnlyOptionalSchema('Qualification', 1, 100),
            pasR_FatherAddress: createOptionalStringSchema('Father Address', 1, 200),
            pasR_FatherCountry: z.string().optional(),
            pasR_FatherState: z.number().int().optional(),
            pasR_FatherCity: createOptionalAlphaNumericSchema('City', 1, 100),
            pasR_FatherPincode: z
                .union([z.string(), z.number()])
                .optional()
                .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),
            pasR_FatherPO: createOptionalStringSchema('PO', 1, 100),
            // alias used by form
            pasR_FatherOfficeAddress: createOptionalStringSchema('Father Office Address', 1, 100),
            // Father permanent address variants used in form
            pasR_FatherPermanentAddress: createOptionalStringSchema('Father Permanent Address', 1, 200),
            pasR_FatherPermanentCountry: z.string().optional(),
            pasR_FatherPermanentState: z.number().int().optional(),
            pasR_FatherPermanentCity: createOptionalAlphaNumericSchema('Father Permanent City', 1, 100),
            pasR_FatherPermanentPincode: z
                .union([z.string(), z.number()])
                .optional()
                .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),
            pasR_FatherPermanent_PS: createOptionalStringSchema('Father Permanent PS', 1, 100),
            pasR_FatherPermanent_PO: createOptionalStringSchema('Father Permanent PO', 1, 100),
            pasR_FatherPS: createOptionalStringSchema('Father PS', 1, 100),
            pasR_FatherOccupation: createStringOnlyOptionalSchema('Father Occupation', 1, 100),
            pasR_FatherCaste: createOptionalStringSchema('Father Caste', 1, 100),
            pasR_FatherSubCaste: createOptionalStringSchema('Father Sub Caste', 1, 100),
            pasR_FatherCaste_Certificate_No: createOptionalAlphaNumericSchema('Father Caste Certificate No', 1, 100),
            pasR_FatherOffice_PhNo: createOptionalNumberOnlyStringSchema('Father Office Phone No', 1, 15),
            pasR_FatherPhoto: createOptionalStringSchema('Father Photo Path', 1, 500).optional(),
            // Additional father fields used in the form
            pasR_FatherCasteCategory: createOptionalStringSchema('Father Caste Category', 1, 100),

            // Mother Details
            pasR_MotherName: createStringOnlySchema('Mother Name', 1, 100),
            pasR_MotherSurname: createStringOnlyOptionalSchema('Mother Surname', 1, 100),
            pasR_MotherEducation: createStringOnlyOptionalSchema('Mother Education', 1, 100),
            // pasR_MotherOccupation: createOptionalStringSchema('Mother Occupation', 1, 100),
            pasR_MotherPanno: createAlphanumericSchema('Mother PAN Number', 1, 10, true),
            pasR_MotherDesignation: createOptionalStringSchema('Mother Designation', 1, 100),
            pasR_MotherOfficeAddr: createOptionalStringSchema('Mother Office Address', 1, 100),
            pasR_MotherMobleNo: z
                .string()
                .refine((val) => !val.startsWith('0'), {
                    message: 'Mobile number cannot start with 0'
                })
                .optional(),
            pasA_MotherInstitution: createOptionalStringSchema('Mother Attended Institution', 1, 150),
            pasA_MotherMotherTongue: createStringOnlyOptionalSchema('Mother`s Mother Tongue', 1, 100),
            pasA_MotherBusiness: createOptionalStringSchema('Mother Business', 1, 150),
            pasA_MotherCompany: createOptionalStringSchema('Mother Company', 1, 150),
            // Mother permanent / extra fields used in form
            pasR_MotherAddress: createOptionalStringSchema('Mother Address', 1, 200),
            pasR_MotherCountry: z.string().optional(),
            pasR_MotherState: z.number().int().optional(),
            pasR_MotherCity: createOptionalAlphaNumericSchema('Mother City', 1, 100),
            pasR_MotherPincode: z
                .union([z.string(), z.number()])
                .optional()
                .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),
            pasR_MotherPS: createOptionalStringSchema('Mother PS', 1, 100),
            pasR_MotherPO: createOptionalStringSchema('Mother PO', 1, 100),
            // Permanent variants for mother used in form
            pasR_MotherPermanentAddress: createOptionalStringSchema('Mother Permanent Address', 1, 200),
            pasR_MotherPermanentCountry: z.string().optional(),
            pasR_MotherPermanentState: z.number().int().optional(),
            pasR_MotherPermanentCity: createOptionalAlphaNumericSchema('Mother Permanent City', 1, 100),
            pasR_MotherPermanentPincode: z
                .union([z.string(), z.number()])
                .optional()
                .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),
            pasR_MotherPermanent_PO: createOptionalStringSchema('Mother Permanent PO', 1, 100),
            pasR_MotherAadhaar_No: z
                .string()
                .optional()
                .refine((val) => val === undefined || val === '' || /^[0-9]{12}$/.test(val), {
                    message: 'Aadhar No must be exactly 12 digits'
                }),
            pasR_MotherEmail_ID: createEmailSchema('Mother Email', 1, 50).optional(),
            pasR_MotherHome_Phone_No: createOptionalNumberOnlyStringSchema('Mother Home Phone No', 1, 15),
            pasR_MotherPassing_Year: createOptionalNumberOnlyStringSchema('Mother Passing Year', 1, 4),
            pasR_MotherPhoto: createOptionalStringSchema('Mother Photo Path', 1, 500).optional(),
            // Additional mother fields used in the form
            pasR_MotherOccupation: createStringOnlyOptionalSchema('Mother Occupation', 1, 100),
            pasR_MotherCaste: createOptionalStringSchema('Mother Caste', 1, 100),
            pasR_MotherSubCaste: createOptionalStringSchema('Mother Sub Caste', 1, 100),
            pasR_MotherCaste_Certificate_No: createOptionalAlphaNumericSchema('Mother Caste Certificate No', 1, 100),
            pasR_MotherOffice_PhNo: createOptionalNumberOnlyStringSchema('Mother Office Phone No', 1, 15),
            // alias used by form
            pasR_MotherOfficeAddress: createOptionalStringSchema('Mother Office Address', 1, 100),
            pasA_Achievements: createOptionalStringSchema('Achievements', 1, 250),
            // Siblings Details (array, like add schema)
            siblingsDetails: z
                .array(
                    z.object({
                        pasR_Id: z.number().int().optional(),
                        pasrS_SchoolName: createOptionalAlphaNumericSchema('School Name', 1, 150).optional(),
                        pasrS_Age: z.number().int().optional(),
                        pasrS_Gender: createStringOnlyOptionalSchema('Gender', 1, 50),
                        pasrS_Institution: createOptionalAlphaNumericSchema('Institution', 1, 150).optional(),
                        pasrS_DOB: z.string().optional(),
                        verrejstatus: z.string().optional(),
                        pasrS_Id: z.number().int().optional(),
                        pasrS_SiblingsName: createStringOnlyOptionalSchema('Sibling Name', 1, 100),
                        pasrS_SiblingsClass: createStringOnlyOptionalSchema('Sibling Class', 1, 100),
                        pasrS_SiblingsAdmissionNo: createOptionalNumberOnlyStringSchema('Sibling Admission No', 1, 50),
                        pasrS_SiblingsSection: createStringOnlyOptionalSchema('Sibling Section', 1, 50)
                    })
                )
                .optional(),

            // Guardians Details (array)
            guardiansDetails: z
                .array(
                    z.object({
                        guardianName: createStringOnlyOptionalSchema('Guardian Name', 1, 150).optional(),
                        guardianPhone: z
                            .string()
                            .refine((val) => val === '' || !val.startsWith('0'), {
                                message: 'Mobile number cannot start with 0'
                            })
                            .optional(),
                        guardianAddress: createOptionalStringSchema('Guardian Address', 1, 200).optional()
                    })
                )
                .optional(),

            // Previous School Details (array, like siblingsDetails)
            previousSchoolDetails: z
                .array(
                    z.object({
                        pasrpS_PrvSchoolName: createOptionalAlphaNumericSchema('Previous School Name', 1, 150),
                        pasrpS_PrvMedium: createStringOnlyOptionalSchema('Previous School Medium', 1, 100),
                        pasrpS_PreviousClass: createOptionalNumberOnlyStringSchema('Previous Class', 1, 100),
                        pasrpS_Board: createStringOnlyOptionalSchema('Board', 1, 100),
                        pasrpS_LeftYear: createOptionalNumberOnlyStringSchema('Left Year', 1, 10),
                        pasrpS_LeftReason: createStringOnlyOptionalSchema('Reason for Leaving', 1, 150),
                        pasrpS_Address: createOptionalStringWithLettersSchema('School Address', 1, 200),
                        pasrpS_PrvPercentage: createOptionalNumberOnlyStringSchema('Previous Percentage', 1, 10),
                        pasrpS_PrvGrade: createOptionalNumberOnlyStringSchema('Previous Grade', 1, 10)
                    })
                )
                .optional(),

            // Income
            pasR_FatherIncome: z.number().default(0).optional(),
            pasR_MotherIncome: z.number().default(0).optional(),

            // Misc / aliases used in form
            pasR_Year: createOptionalNumberOnlyStringSchema('Year', 1, 10).optional(),
            pasR_State: z.number().int().optional(),

            // Alternate Contact
            pasR_AltContactNo: z
                .string()

                .refine((val) => val === '' || !val.startsWith('0'), {
                    message: 'Mobile number cannot start with 0'
                })
                .optional(),
            pasR_AltContactEmail: createEmailSchema('Alternate Contact Email', 1, 50, true),

            // Previous School Details

            //Other Details
            pasA_AdmittingReason: createOptionalStringSchema('Admitting Reason', 1, 250),
            pasA_WillingToContributeRemarks: createOptionalStringSchema('Willing to Contribute Remarks', 1, 250),
            pasA_WillingToContributeFlg: z.number().int({ message: 'Willing to Contribute Flag' }),

            //Place of Birth Details in other details

            pasA_District: createStringOnlyOptionalSchema('District', 1, 100),
            pasA_Taluk: createStringOnlyOptionalSchema('Taluk', 1, 100),
            pasA_Town: createStringOnlyOptionalSchema('Town', 1, 100),
            pasA_Village: createStringOnlyOptionalSchema('Village', 1, 100),

            //Siblings Count Details in other details
            pasA_No_of_Siblings: z.number().int().optional(),
            pasA_No_of_Siblings_in_School: z.number().int().optional(),
            pasA_No_of_Siblings_in_other_School: z.number().int().optional(),
            pasA_No_of_Sisters: z.number().int().optional(),
            pasA_No_of_Younger_Sisters: z.number().int().optional(),
            pasA_No_of_Elder_Sisters: z.number().int().optional(),
            pasA_No_of_Brothers: z.number().int().optional(),
            pasA_pasA_No_of_Younger_Brothers: z.number().int().optional(),
            pasA_No_of_Elder_Brothers: z.number().int().optional(),

            //health

            amsT_Studentillness: createStringOnlyOptionalSchema('Student Illness', 1, 100),
            amsT_MedicalComplaints: createStringOnlyOptionalSchema('Medical Complaints', 1, 255),
            amsT_AdmissionReason: createStringOnlyOptionalSchema('Admission Reason', 1, 255),
            amsT_OtherResidential_Addr: createOptionalStringSchema('Other Residential Address', 1, 255),
            amsT_SchoolDISECode: createOptionalStringSchema('School DISE Code', 1, 50),
            amsT_FirstLanguage: createStringOnlyOptionalSchema('First Language', 1, 100),
            amsT_SecondLanguage: createStringOnlyOptionalSchema('Second Language', 1, 100),
            amsT_Thirdlanguage: createStringOnlyOptionalSchema('Third Language', 1, 100),
            amsT_Illnessdetails: createOptionalStringSchema('Illness Details', 1, 500),
            amsT_OtherInformations: createOptionalStringSchema('Other Informations', 1, 500),
            amsT_ExtraActivity: createStringOnlyOptionalSchema('Extra Activity', 1, 100),
            amsT_Stayingwith: createStringOnlyOptionalSchema('Staying With', 1, 100),
            amsT_OtherPermanentAddr: createOptionalStringSchema('Other Permanent Address', 1, 255),
            amsT_Domicile: createStringOnlyOptionalSchema('Domicile', 1, 100),
            amsT_TransferrableJobFlg: z.oboolean().optional(),
            amsT_VaccinatedFlg: z.oboolean().optional(),
            amsT_Tcflag: z.oboolean().optional(),

            // Final
            pasR_UndertakingFlag: z.number().int({ message: 'Undertaking Flag is required' })
        })
        .refine(
            (data) => {
                if (data.pasR_EMISFlag === 1) {
                    const val = data.pasR_EMISCardNo;
                    return typeof val === 'string' && val.trim() !== '';
                }
                return true;
            },
            {
                message: 'EMIS / BPL / STS No. is required when EMIS is selected',
                path: ['pasR_EMISCardNo']
            }
        ),

    delete: z.object({
        pasr_id: deleteIdSchema('pasr_id')
    })
};

export const studentApplicationFormUpdateSchema = {
    update: z.object({
        pasR_Id: z.number().int().optional(), // Made optional for add operation

        // Student Details
        pasR_FirstName: createStringOnlySchema('First Name', 1, 100),
        pasR_MiddleName: createStringOnlySchema('Middle Name', 1, 100),
        pasR_LastName: createStringOnlySchema('Last Name', 1, 100),

        // NATIONALITY - STRING (to match API expectation)
        pasR_Nationality: z.string().min(1, 'Student nationality is required'),
        pasR_FatherNationality: z.string().min(1, 'Father nationality is required'),
        pasR_MotherNationality: z.string().min(1, 'Mother nationality is required'),

        pasR_MobileNo: z.string().refine((val) => !val.startsWith('0'), {
            message: 'Mobile number cannot start with 0'
        }),
        pasR_BirthPlace: createStringOnlyOptionalSchema('Student Birth Place', 1, 100),
        religion_Id: z.number().int({ message: 'Religion is required' }),
        // caste_Id: z.number().int({ message: 'Caste is required' }),
        caste_Id: createStringSchema('Caste is required', 1, 50),

        pasR_Sex: createStringSchema('Gender', 1, 50),
        pasR_DOB: z.date({ message: 'Date Of Birth is required' }),
        asmcL_Id: z.number().int({ message: 'Applying For is required' }),
        pasR_emailId: createEmailSchema('Student Email', 1, 50),

        pasR_MotherTongue: createStringOnlyOptionalSchema('Student Mother Tongue', 1, 100),

        // Other Details
        // Aadhar optional; if provided, must be exactly 12 digits in update schema
        pasR_AadharNo: z
            .string()
            .optional()
            // Allow undefined or empty string (user cleared the field) OR a 12-digit Aadhar
            .refine((val) => val === undefined || val === '' || /^[0-9]{12}$/.test(val), {
                message: 'Aadhar No must be exactly 12 digits'
            }),
        pasR_Languagespeaking: createStringOnlyOptionalSchema('Student Language Speaking At Home', 1, 100),
        pasR_LastPlayGrndAttnd: createStringOnlyOptionalSchema('Student Last Play Ground Attended', 1, 50),
        pasR_ExtraActivity: createStringOnlyOptionalSchema('Student Extra Activity', 1, 50),
        source_ids: z.array(z.string()).optional(),
        reference_ids: z.array(z.string()).optional(),
        pasR_TransportReqdFlag: z.number().int({ message: 'Transport Required Flag is required' }),

        // Residential Address
        pasR_ConStreet: createOptionalAlphaNumericSchema('Street', 1, 100),
        pasR_ConArea: createOptionalAlphaNumericSchema('Area', 1, 100),
        pasR_ConCountry: z.string().optional(),
        pasR_ConState: z.number().int().optional(),
        pasR_ConCity: createOptionalAlphaNumericSchema('City', 1, 100),
        pasR_ConPincode: z
            .union([z.string(), z.number()])
            .optional()
            .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),

        // Permanent Address
        pasR_PerStreet: createOptionalAlphaNumericSchema('Street', 1, 100),
        pasR_PerArea: createOptionalAlphaNumericSchema('Area', 1, 100),
        pasR_PerCountry: z.string().optional(),
        pasR_PerState: z.number().int().optional(),
        pasR_PerCity: createOptionalAlphaNumericSchema('City', 1, 100),
        pasR_PerPincode: z
            .union([z.string(), z.number()])
            .optional()
            .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),

        // Father Details
        pasR_FatherName: createStringOnlySchema('Father Name', 1, 100),
        pasR_FatherSurname: createStringOnlyOptionalSchema('Father Surname', 1, 100),
        pasR_FatherEducation: createStringOnlyOptionalSchema('Father Education', 1, 100),
        // pasR_FatherOccupation: createOptionalStringSchema('Father Occupation', 1, 100),
        // Father PAN optional in update schema (allow empty string)
        pasR_FatherPanno: createAlphanumericSchemaPanCard('Father PAN Number', true),
        pasR_FatherDesignation: createStringOnlyOptionalSchema('Father Designation', 1, 100),
        pasR_FatherOfficeAddr: createOptionalStringSchema('Father Office Address', 1, 100),
        pasR_FatherMobleNo: z
            .string()
            .refine((val) => !val.startsWith('0'), {
                message: 'Mobile number cannot start with 0'
            })
            .optional(),
        pasA_FatherInstitution: createOptionalStringSchema('Father Attended Institution', 1, 150),
        pasA_FatherMotherTongue: createStringOnlyOptionalSchema('Father Mother Tongue', 1, 100),
        pasA_FatherBusiness: createOptionalStringSchema('Father Business', 1, 150),
        pasA_FatherCompany: createOptionalStringSchema('Father Company', 1, 150),

        // Mother Details
        pasR_MotherName: createStringOnlySchema('Mother Name', 1, 100),
        pasR_MotherSurname: createStringOnlyOptionalSchema('Mother Surname', 1, 100),
        pasR_MotherEducation: createStringOnlyOptionalSchema('Mother Education', 1, 100),
        // pasR_MotherOccupation: createOptionalStringSchema('Mother Occupation', 1, 100),
        // Mother PAN optional in update schema (allow empty string)
        pasR_MotherPanno: createAlphanumericSchemaPanCard('Mother PAN Number', true),
        pasR_MotherDesignation: createStringOnlyOptionalSchema('Mother Designation', 1, 100),
        pasR_MotherOfficeAddr: createOptionalStringSchema('Mother Office Address', 1, 100),
        pasR_MotherMobleNo: z
            .string()
            .refine((val) => !val.startsWith('0'), {
                message: 'Mobile number cannot start with 0'
            })
            .optional(),
        pasA_MotherInstitution: createOptionalStringSchema('Mother Attended Institution', 1, 150),
        pasA_MotherMotherTongue: createStringOnlyOptionalSchema('Mother`s Mother Tongue', 1, 100),
        pasA_MotherBusiness: createOptionalStringSchema('Mother Business', 1, 150),
        pasA_MotherCompany: createOptionalStringSchema('Mother Company', 1, 150),

        // Income
        pasR_FatherIncome: z.number().optional(),
        pasR_MotherIncome: z.number().optional(),

        // Alternate Contact
        pasR_AltContactNo: z
            .string()

            .refine((val) => val === '' || !val.startsWith('0'), {
                message: 'Mobile number cannot start with 0'
            })
            .optional(),
        // Alternate contact email optional in update schema (allow empty string)
        pasR_AltContactEmail: z.union([createEmailSchema('Alternate Contact Email', 1, 50), z.literal('')]).optional(),

        //Other Details
        pasA_AdmittingReason: createOptionalStringSchema('Admitting Reason', 1, 250),
        pasA_WillingToContributeRemarks: createOptionalStringSchema('Willing to Contribute Remarks', 1, 250),
        pasA_WillingToContributeFlg: z.number().int({ message: 'Willing to Contribute Flag' }),

        // Other Information (nested object)
        otherInformation: OtherInformationSchema.optional(),

        // Health & Medical Details (nested object)
        healthMedicalDetails: HealthMedicalDetailsSchema.optional(),

        // Final
        pasR_UndertakingFlag: z.number().int({ message: 'Undertaking Flag is required' }),

        // Guardians Details (array)
        guardiansDetails: z
            .array(
                z.object({
                    guardianName: createStringOnlyOptionalSchema('Guardian Name', 1, 150).optional(),
                    guardianPhone: z
                        .string()
                        .refine((val) => val === '' || !val.startsWith('0'), {
                            message: 'Mobile number cannot start with 0'
                        })
                        .optional(),
                    guardianAddress: createOptionalStringSchema('Guardian Address', 1, 200).optional()
                })
            )
            .optional(),

        // Siblings Details (array, like add schema)
        siblingsDetails: z
            .array(
                z.object({
                    pasR_Id: z.number().int().optional(),
                    pasrS_SchoolName: createOptionalAlphaNumericSchema('School Name', 1, 150).optional(),
                    pasrS_Age: z.number().int().optional(),
                    pasrS_Gender: createStringOnlyOptionalSchema('Gender', 1, 50),
                    pasrS_Institution: createOptionalAlphaNumericSchema('Institution', 1, 150).optional(),
                    pasrS_DOB: z.string().optional(),
                    verrejstatus: z.string().optional(),
                    pasrS_Id: z.number().int().optional(),
                    pasrS_SiblingsName: createStringOnlyOptionalSchema('Sibling Name', 1, 100),
                    pasrS_SiblingsClass: createStringOnlyOptionalSchema('Sibling Class', 1, 100),
                    pasrS_SiblingsAdmissionNo: createOptionalNumberOnlyStringSchema('Sibling Admission No', 1, 50),
                    pasrS_SiblingsSection: createStringOnlyOptionalSchema('Sibling Section', 1, 50)
                })
            )
            .optional(),

        // Previous School Details (array, like siblingsDetails)
        previousSchoolDetails: z
            .array(
                z.object({
                    pasrpS_PrvSchoolName: createOptionalAlphaNumericSchema('Previous School Name', 1, 150),
                    pasrpS_PrvMedium: createStringOnlyOptionalSchema('Previous School Medium', 1, 100),
                    pasrpS_PreviousClass: createOptionalNumberOnlyStringSchema('Previous Class', 1, 100),
                    pasrpS_Board: createStringOnlyOptionalSchema('Board', 1, 100),
                    pasrpS_LeftYear: createOptionalNumberOnlyStringSchema('Left Year', 1, 10),
                    pasrpS_LeftReason: createStringOnlyOptionalSchema('Reason for Leaving', 1, 150),
                    pasrpS_Address: createOptionalStringWithLettersSchema('School Address', 1, 200)
                })
            )
            .optional()
    })
};
