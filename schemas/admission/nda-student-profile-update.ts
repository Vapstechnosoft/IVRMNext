import { z } from 'zod';

const mobilePattern = /^[7-9]\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const ndaStudentProfileUpdateSchema = z.object({
    ASTUREQ_Id: z.number().default(0),
    AMSTG_Id: z.number().default(0),
    AMST_ID: z.number().default(0),
    
    // Student Details
    Mobilenumber: z.string()
        .min(10, "Mobile number must contain 10 digits")
        .max(10, "Mobile number must contain 10 digits")
        .regex(mobilePattern, "Enter valid Mobile NO")
        .or(z.literal('')),
    EmailidforCandidate: z.string()
        .regex(emailPattern, "Enter valid Email")
        .or(z.literal('')),
    Bloodgroup: z.string().optional().or(z.literal('')),
    
    // Guardian Details
    Guardianname: z.string().optional().or(z.literal('')),
    AMSTG_GuardianPhoneNo: z.string()
        .regex(mobilePattern, "Enter valid Mobile NO")
        .or(z.literal('')),
    AMSTG_emailid: z.string()
        .regex(emailPattern, "Enter valid Email")
        .or(z.literal('')),
        
    // Father Details
    AMST_FatherMobleNo: z.string()
        .regex(mobilePattern, "Enter valid Mobile NO")
        .or(z.literal('')),
    AMST_FatheremailId: z.string()
        .regex(emailPattern, "Enter valid Email")
        .or(z.literal('')),
        
    // Mother Details
    AMST_MotherMobileNo: z.string()
        .regex(mobilePattern, "Enter valid Mobile NO")
        .or(z.literal('')),
    AMST_MotherEmailId: z.string()
        .regex(emailPattern, "Enter valid Email")
        .or(z.literal('')),
        
    // Photo URLs (base64 or blob strings from server)
    ASTUREQ_StudentPhoto: z.string().optional().or(z.literal('')),
    ASTUREQ_FatherPhoto: z.string().optional().or(z.literal('')),
    ASTUREQ_MotherPhoto: z.string().optional().or(z.literal('')),
    ASTUREQ_GuardianPhoto: z.string().optional().or(z.literal('')),
    
    // Residential Address
    Resstreet: z.string().optional().or(z.literal('')),
    ResArea: z.string().optional().or(z.literal('')),
    Rescity: z.string().optional().or(z.literal('')),
    Rescountry: z.union([z.number(), z.string()]).optional().or(z.literal('')),
    Resstate: z.union([z.number(), z.string()]).optional().or(z.literal('')),
    ResPincode: z.string().optional().or(z.literal('')),
    
    // Permanent Address
    Perstreett: z.string().optional().or(z.literal('')),
    PerArea: z.string().optional().or(z.literal('')),
    Percity: z.string().optional().or(z.literal('')),
    PerState: z.union([z.number(), z.string()]).optional().or(z.literal('')),
    PerPincode: z.string().optional().or(z.literal('')),
    
    // Meta fields
    STP_PERCOUNTRY: z.union([z.number(), z.string()]).optional(),
    STP_CURCOUNTRY: z.union([z.number(), z.string()]).optional(),
    AMST_BloodGroup: z.string().optional(),
});

export type NdaStudentProfileUpdateFields = z.infer<typeof ndaStudentProfileUpdateSchema>;
