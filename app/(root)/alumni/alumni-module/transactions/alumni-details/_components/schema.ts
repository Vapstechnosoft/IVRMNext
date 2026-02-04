import { z } from 'zod';

export const qualificationSchema = z.object({
    Qualification: z.string().min(1, 'Qualification is required'),
    ALMST_PUC_INS_NAME: z.string().min(1, 'Institution is required'),
    ALMST_PUC_PASSED_OUT: z.string().min(1, 'Year is required'),
    ALSQU_Percentage: z.string().min(1, 'Percentage is required'),
    ALMST_PLACE: z.string().optional(),
    ALMST_PerState: z.number().optional(),
    ALSQU_OtherDetails: z.string().optional()
});

export const readmittedSchema = z.object({
    ALMSTRADM_YearJoined: z.number().min(1, 'Join Year is required'),
    ALMSTRADM_YearLeft: z.number().min(1, 'Left Year is required'),
    ALMSTRADM_ClassJoined: z.number().min(1, 'Join Class is required'),
    ALMSTRADM_ClassLeft: z.number().min(1, 'Left Class is required')
});

export const alumnusMembershipSchema = z.object({
    ALMST_Id: z.number().optional(),
    ALMST_FirstName: z.string().min(1, 'First Name is required'),
    ALMST_MiddleName: z.string().optional(),
    ALMST_LastName: z.string().optional(),
    ALMST_NickName: z.string().min(1, 'Nick Name is required'),
    ALMST_AdmNo: z.string().min(1, 'Admission No is required'),
    ALMST_DOB: z.date({ required_error: 'Date of Birth is required' }),
    ALMST_MobileNo: z.string().min(10, 'Mobile No must be 10 digits').max(10),
    ALMST_FatherName: z.string().min(1, 'Father Name is required'),
    ALMST_PhoneNo: z.string().optional(),
    ALMST_emailId: z.string().email('Invalid email address'),
    ALMST_BloodGroup: z.string().min(1, 'Blood Group is required'),
    ALMST_Marital_Status: z.string().default('0'),

    // Spouse details
    ALMST_SpouseName: z.string().optional(),
    ALMST_SpouseContactNo: z.string().optional(),
    ALMST_SpouseEmailId: z.string().optional(),
    ALMST_SpouseQulaification: z.string().optional(),
    ALMST_SpouseProfession: z.string().optional(),
    ALMST_WeddingAnniversaryDate: z.date().optional(),

    // Academic details
    ASMAY_Id_Join: z.string().optional(),
    ASMAY_Id_Left: z.string().optional(),
    ASMCL_Id_Join: z.string().optional(),
    ASMCL_Id_Left: z.string().optional(),

    // Membership
    ALMST_MembershipId: z.string().optional(),
    ALMST_AmountPaid: z.union([z.string(), z.number()]).optional(),
    ALMST_MembershipCategory: z.string().optional(),

    // Address
    ALMST_PerCountry: z.string().min(1, 'Country is required'),
    ALMST_PerState: z.string().min(1, 'State is required'),
    ALMST_PerDistrict: z.string().optional(),
    ALMST_ConCity: z.string().min(1, 'City is required'),
    ALMST_ConArea: z.string().min(1, 'Address Line 1 is required'),
    ALMST_ConStreet: z.string().optional(),
    ALMST_ConPincode: z.string().min(6, 'Pincode must be 6 digits').max(6),
    ALMST_FullAddess: z.string().optional(),

    // Professional & Achievements
    ALSPR_CompanyName: z.string().optional(),
    ALSPR_Designation: z.string().optional(),
    ALSPR_WorkingSince: z.string().optional(),
    ALSPR_CompanyAddress: z.string().optional(),
    ALSPR_EmailId: z.string().optional(),
    ALSPR_OtherDetails: z.string().optional(),
    ALSAC_Achievement: z.string().optional(),
    ALSAC_Remarks: z.string().optional(),

    // Arrays
    qualification_array: z.array(qualificationSchema).optional(),
    ReadmittedStudentDTO: z.array(readmittedSchema).optional()
});

export type IAlumnusMembershipFormValues = z.infer<typeof alumnusMembershipSchema>;
