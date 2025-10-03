import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterClassSchema = {
    addOrUpdate: z.object({
        asmcl_id: z.number().int({ message: 'ASMCL_Id is required' }).optional(),
        asmcl_classcode: createStringSchema('Code', 1, 100),
        asmcl_classname: createStringSchema('Name', 1, 100),
        asmcl_maxcapacity: z.number().int({ message: 'Max Capacity is required' }),
        asmcl_order: z.number().int({ message: 'Class Order is required' }),
        asmcl_minageyear: z.number().int({ message: 'Min Age Year is required' }),
        asmcl_minagemonth: z.number().int({ message: 'Min Age Month is required' }),
        asmcl_minagedays: z.number().int({ message: 'Min Age Day is required' }),
        asmcl_maxageyear: z.number().int({ message: 'Max Age Year is required' }),
        asmcl_maxagemonth: z.number().int({ message: 'Max Age Month is required' }),
        asmcl_maxagedays: z.number().int({ message: 'Max Age Day is required' }),
        asmcl_preadmflag: z.number().int({ message: 'Preadm Flag is required' })
    }),
    delete: z.object({
        asmcL_Id: deleteIdSchema('asmcL_Id')
    })
};

export const masterCategorySchema = {
    addOrUpdate: z.object({
        amC_Id: z.number().int({ message: 'AMC_ID is required' }).optional(),
        amC_Name: createStringSchema('Category Name', 1, 100),
        amC_Address: createStringSchema('Address', 1, 200),
        amC_Type: createStringSchema('Category Type', 1, 200)
    }),
    delete: z.object({
        amC_Id: deleteIdSchema('amC_Id')
    })
};

export const masterSectionSchema = {
    addOrUpdate: z.object({
        asmS_Id: z.number().int({ message: 'AsmS_Id is required' }).optional(),
        asmc_sectioncode: createStringSchema('Code', 1, 100),
        asmc_sectionname: createStringSchema('Name', 1, 100),
        asmc_maxcapacity: z.number().int({ message: 'Max Capacity is required' }),
        asmc_order: z.number().int({ message: 'Section Order is required' })
    }),
    delete: z.object({
        asmS_Id: deleteIdSchema('asmS_Id')
    })
};

export const masterReligionSchema = {
    addOrUpdate: z.object({
        ivrmmR_Id: z.number().int({ message: 'IVRMMR_ID is required' }).optional(),
        ivrmmR_Name: createStringSchema('Religion Name', 1, 100)
    }),
    delete: z.object({
        ivrmmR_Id: deleteIdSchema('ivrmmR_Id')
    })
};
