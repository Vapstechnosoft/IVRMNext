import { z } from 'zod';
import {
    createAlphanumericSchema,
    createEmailSchema,
    createOptionalStringSchema,
    createStringOnlySchema,
    createStringSchema
} from '../../validationSchemas';

export const preadmissionRegistrationSchema = {
    add: z.object({
        name: createStringOnlySchema('Name', 1, 50),
        email_id: createEmailSchema('Email Id', 1, 50),
        mobileno: z.string().min(10, { message: 'Minimum 10 digits' }).max(10, { message: 'Maximum 10 digits' }),
        username: createStringSchema('Username', 4, 50),
        password: createStringSchema('Password', 6, 8)
    })
};

export const studentApplicationFormSchema = {
    add: z.object({
        //Student Details
        pasR_FirstName: createStringSchema('First Name', 1, 100),
        pasR_MiddleName: createStringSchema('Middle Name', 1, 100),
        pasR_LastName: createStringSchema('Last Name', 1, 100),
        pasR_MobileNo: z.string().min(10, { message: 'Mobile No is 10 digits required' }).max(10, { message: 'Maximum 10 digits' }),
        pasR_BirthPlace: createOptionalStringSchema('Student Birth Place', 1, 100),
        religion_Id: z.number().int({ message: 'Religion is required' }),
        caste_Id: z.number().int({ message: 'Caste is required' }),
        pasR_Sex: createStringSchema('Gender', 1, 50),
        pasR_DOB: z.date({ message: 'Date Of Birth is required' }),
        asmcL_Id: z.number().int({ message: 'Applying For is required' }),
        pasR_emailId: createEmailSchema('Student Email', 1, 50),
        pasR_Nationality: z.string().nonempty({ message: 'Student Nationality is required' }),
        pasR_MotherTongue: createOptionalStringSchema('Student Mother Tongue', 1, 100),

        //Other Details
        pasR_AadharNo: z.string().max(12, { message: 'Maximum 12 digits' }).optional(),
        pasR_Languagespeaking: createOptionalStringSchema('Student Language Speaking At Home', 1, 100),
        pasR_LastPlayGrndAttnd: createOptionalStringSchema('Student Last Play Ground Attended', 1, 50),
        pasR_ExtraActivity: createOptionalStringSchema('Student Extra Activity', 1, 50),
        source_ids: z.array(z.string()).optional(),
        reference_ids: z.array(z.string()).optional(),
        pasR_TransportReqdFlag: z.number().int({ message: 'Transport Required Flag is required' }),

        //Student Residential Address
        pasR_ConStreet: createOptionalStringSchema('Street', 1, 100),
        pasR_ConArea: createOptionalStringSchema('Area', 1, 100),
        pasR_ConCountry: z.string().optional(),
        pasR_ConState: z.number().int({ message: 'State is required' }).optional(),
        pasR_ConCity: createOptionalStringSchema('City', 1, 100),
        pasR_ConPincode: z.string().max(10, { message: 'Maximum 10 digits' }).optional(),

        //Student Permanent Address
        pasR_PerStreet: createOptionalStringSchema('Street', 1, 100),
        pasR_PerArea: createOptionalStringSchema('Area', 1, 100),
        pasR_PerCountry: z.string().optional(),
        pasR_PerState: z.number().int({ message: 'State is required' }).optional(),
        pasR_PerCity: createOptionalStringSchema('City', 1, 100),
        pasR_PerPincode: z.string().max(10, { message: 'Maximum 10 digits' }).optional(),

        //Father Details
        pasR_FatherName: createStringSchema('Father Name', 1, 100),
        pasR_FatherSurname: createOptionalStringSchema('Father Surname', 1, 100),
        pasR_FatherEducation: createOptionalStringSchema('Father Education', 1, 100),
        pasR_FatherOccupation: createOptionalStringSchema('Father Occupation', 1, 100),
        pasR_FatherPanno: createAlphanumericSchema('Father PAN Number', 1, 100, true),
        pasR_FatherDesignation: createOptionalStringSchema('Father Designation', 1, 100),
        pasR_FatherNationality: z.number().int({ message: 'Nationality is required' }),
        pasR_FatherOfficeAddr: createOptionalStringSchema('Father Office Address', 1, 100),
        pasR_FatherMobleNo: z.string().max(10, { message: 'Maximum 10 digits' }).optional(),

        //Mother Details
        pasR_MotherName: createStringSchema('Mother Name', 1, 100),
        pasR_MotherSurname: createOptionalStringSchema('Mother Surname', 1, 100),
        pasR_MotherEducation: createOptionalStringSchema('Mother Education', 1, 100),
        pasR_MotherOccupation: createOptionalStringSchema('Mother Occupation', 1, 100),
        pasR_MotherPanno: createAlphanumericSchema('Mother PAN Number', 1, 100, true),
        pasR_MotherDesignation: createOptionalStringSchema('Mother Designation', 1, 100),
        pasR_MotherNationality: z.number().int({ message: 'Nationality is required' }),
        pasR_MotherOfficeAddr: createOptionalStringSchema('Mother Office Address', 1, 100),
        pasR_MotherMobleNo: z.string().max(10, { message: 'Maximum 10 digits' }).optional(),

        //Yearly Income
        pasR_FatherIncome: z.number().optional(),
        pasR_MotherIncome: z.number().optional(),
        pasR_AltContactNo: z.string().max(10, { message: 'Maximum 10 digits' }).optional(),
        pasR_AltContactEmail: createEmailSchema('Alternate Contact Email', 1, 50, true),

        //Sibling Details need to be added here

        //Previous institution details

        //Final
        pasR_UndertakingFlag: z.number().int({ message: 'Undertaking Flag is required' })
    })
};
