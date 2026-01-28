import { z } from 'zod';

export const hostelFileSchema = z.object({
  hlmhP_FileName: z.string(),
  hlmhP_FilePath: z.string(),
  filetype: z.string().optional(),
});

export const masterHostelSchema = z.object({
  hlmH_Id: z.number().optional(),
  hlmH_Name: z.string().min(1, 'Hostel Name is required').max(50),
  hlmH_ContactNo: z
    .string()
    .min(10, 'Contact Number must be 10 digits')
    .max(10, 'Contact Number must be 10 digits')
    .regex(/^[6-9]{1}[0-9]{9}$/, 'Enter valid Contact Number'),
  hlmH_TotalCapacity: z.string().regex(/^\d+$/, 'Enter Number').max(5, 'Max 5 digits'),
  facilities: z.array(z.number()).min(1, 'Please Select Facility'),
  hlmhW_WardenType: z.string().optional(),
  wardens: z.array(z.number()).min(1, 'Please Select Warden'),
  messes: z.array(z.number()).min(1, 'Please Select Mess'),
  
  hlmH_BoysGirlsFlg: z.enum(['Boys', 'Girls'], {
    required_error: 'Please Select Any One Category',
  }),
  
  hlmH_Address: z.string().min(1, 'Enter the Address'),
  ivrmmC_Id: z.string().min(1, 'Select Country'),
  ivrmmS_Id: z.string().min(1, 'Select State'),
  hlmH_City: z.string().min(1, 'Enter City Name').max(50),
  hlmH_Pincode: z.string().regex(/^\d+$/, 'Enter Number').max(6).min(1, 'Please Enter Pincode'),
  
  hlmH_TotalFloor: z.string().regex(/^\d+$/, 'Please Enter Number').max(50, 'Max 50 digits?').min(1, 'Please Enter Total Floor'),
  hlmH_TotalRoom: z.string().regex(/^\d+$/, 'Please Enter Number').max(50).min(1, 'Please Enter Total Room'),
  
  hlmH_Desc: z.string().max(250).optional(),
  
  documents: z.array(hostelFileSchema).optional(),
  
  hlmH_ActiveFlag: z.boolean().optional().default(true),
});

export type IMasterHostelForm = z.infer<typeof masterHostelSchema>;
