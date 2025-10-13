import { z } from 'zod';
import { createOptionalStringSchema, createStringSchema } from '../../validationSchemas';

export const preadmissionRegistrationSchema = {
    add: z.object({
        name: createStringSchema('Name', 1, 100),
        email_id: createStringSchema('Email Id', 1, 100),
        mobileno: z.string().min(1, { message: 'Mobile No is required' }).max(10, { message: 'Maximum 10 digits' }),
        username: createStringSchema('Username', 1, 100),
        password: createStringSchema('Password', 1, 100)
    })
};

export const studentApplicationFormSchema = {
    add: z.object({
        asmaY_Id: z.number().int({ message: 'Academic Year is required' }),

        //Student Details
        pasR_FirstName: createStringSchema('First Name', 1, 100),
        pasR_MiddleName: createOptionalStringSchema('Middle Name', 1, 100),
        pasR_LastName: createOptionalStringSchema('Last Name', 1, 100),
        pasR_MobileNo: z.number().int({ message: 'Student Mobile Number is required' }),
        pasR_BirthPlace: createOptionalStringSchema('Student Birth Place', 1, 100),
        religion_Id: z.number().int({ message: 'Religion is required' }),
        caste_Id: z.number().int({ message: 'Caste is required' }),
        pasR_Sex: createStringSchema('Gender', 1, 50),
        pasR_DOB: z.date({ message: 'Date Of Birth is required' }),
        pasR_Age: z.number().int({ message: 'Student Age is required' }),
        asmcL_Id: z.number().int({ message: 'Applying For is required' }),
        pasR_emailId: createStringSchema('Student Email', 1, 50),
        pasR_Nationality: z.string().nonempty({ message: 'Student Nationality is required' }),
        pasR_MotherTongue: createOptionalStringSchema('Student Mother Tongue', 1, 100),

        //Other Details
        pasR_AadharNo: z.number().int({ message: 'Student Aadhaar is required' }).max(12).optional(),
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
        pasR_ConPincode: z.number().int({ message: 'Pincode is required' }).optional(),

        //Student Permanent Address
        pasR_PerStreet: createOptionalStringSchema('Street', 1, 100),
        pasR_PerArea: createOptionalStringSchema('Area', 1, 100),
        pasR_PerCountry: z.string().optional(),
        pasR_PerState: z.number().int({ message: 'State is required' }).optional(),
        pasR_PerCity: createOptionalStringSchema('City', 1, 100),
        pasR_PerPincode: z.number().int({ message: 'Pincode is required' }).optional(),

        //Father Details
        pasR_FatherName: createStringSchema('Father Name', 1, 100),
        pasR_FatherSurname: createOptionalStringSchema('Father Surname', 1, 100),
        pasR_FatherEducation: createOptionalStringSchema('Father Education', 1, 100),
        pasR_FatherOccupation: createOptionalStringSchema('Father Occupation', 1, 100),
        pasR_FatherPanno: createOptionalStringSchema('Father PAN Number', 1, 100),
        pasR_FatherDesignation: createOptionalStringSchema('Father Designation', 1, 100),
        pasR_FatherNationality: z.number().int({ message: 'Nationality is required' }),
        pasR_FatherOfficeAddr: createOptionalStringSchema('Father Office Address', 1, 100),
        pasR_FatherMobleNo: z.number().optional(),

        //Mother Details
        pasR_MotherName: createStringSchema('Mother Name', 1, 100),
        pasR_MotherSurname: createOptionalStringSchema('Mother Surname', 1, 100),
        pasR_MotherEducation: createOptionalStringSchema('Mother Education', 1, 100),
        pasR_MotherOccupation: createOptionalStringSchema('Mother Occupation', 1, 100),
        pasR_MotherPanno: createOptionalStringSchema('Mother PAN Number', 1, 100),
        pasR_MotherDesignation: createOptionalStringSchema('Mother Designation', 1, 100),
        pasR_MotherNationality: z.number().int({ message: 'Nationality is required' }),
        pasR_MotherOfficeAddr: createOptionalStringSchema('Mother Office Address', 1, 100),
        pasR_MotherMobleNo: z.number().optional(),

        //Yearly Income
        pasR_FatherIncome: z.number().optional(),
        pasR_MotherIncome: z.number().optional(),
        pasR_AltContactNo: z.number().optional(),
        pasR_AltContactEmail: createOptionalStringSchema('Alternate Contact Email', 1, 50),

        //Sibling Details need to be added here

        //Previous institution details

        //Final
        pasR_UndertakingFlag: z.number().int({ message: 'Undertaking Flag is required' })
    })
};
