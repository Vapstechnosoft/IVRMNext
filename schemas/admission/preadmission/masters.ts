import { createStringSchema, deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string({ message: 'Username is required' })
        .nonempty({ message: 'Username is required' })
        .refine((value) => value.trim() === value, {
            message: 'Username cannot have leading or trailing spaces'
        }),
    password: createStringSchema('Password', 6, 50)
});

export const masterClassSchema = {
    addOrUpdate: z
        .object({
            asmcl_id: z.number().int({ message: 'ASMCL_Id is required' }).optional(),
            asmcl_classcode: createStringSchema('Code', 1, 100),
            asmcl_classname: createStringSchema('Name', 1, 100),
            asmcl_maxcapacity: z.number().int({ message: 'Max Capacity is required' }),
            asmcl_order: z.number().int({ message: 'Class Order is required' }),
            asmcl_minageyear: z.number().int().min(0, 'Min Age Year must be at least 0').max(100, 'Min Age Year must not exceed 100'),
            asmcl_minagemonth: z.number().int().min(0, 'Min Age Month must be at least 0').max(11, 'Min Age Month must be between 0-11'),
            asmcl_minagedays: z.number().int().min(0, 'Min Age Days must be at least 0').max(31, 'Min Age Days must be between 0-31'),
            asmcl_maxageyear: z.number().int().min(0, 'Max Age Year must be at least 0').max(100, 'Max Age Year must not exceed 100'),
            asmcl_maxagemonth: z.number().int().min(0, 'Max Age Month must be at least 0').max(11, 'Max Age Month must be between 0-11'),
            asmcl_maxagedays: z.number().int().min(0, 'Max Age Days must be at least 0').max(31, 'Max Age Days must be between 0-31'),
            asmcl_preadmflag: z.number().int({ message: 'Preadm Flag is required' })
        })
        .refine(
            (data) => {
                // Compare year first
                if (data.asmcl_minageyear > data.asmcl_maxageyear) return false;
                if (data.asmcl_minageyear < data.asmcl_maxageyear) return true;

                // Years are equal, compare months
                if (data.asmcl_minagemonth > data.asmcl_maxagemonth) return false;
                if (data.asmcl_minagemonth < data.asmcl_maxagemonth) return true;

                // Years and months are equal, compare days
                if (data.asmcl_minagedays >= data.asmcl_maxagedays) return false;

                return true;
            },
            {
                message: 'Minimum age must be less than maximum age',
                path: ['asmcl_maxageyear']
            }
        ),
    delete: z.object({
        asmcL_Id: deleteIdSchema('asmcL_Id')
    })
};

export const masterCategorySchema = {
    addOrUpdate: z.object({
        amC_Id: z.number().int({ message: 'AMC_ID is required' }).optional(),
        amC_Name: createStringSchema('Category Name', 1, 100),
        amC_Address: createStringSchema('Address', 1, 200),
        amC_Type: z.string().nonempty({ message: 'Category Type is required' })
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

export const masterClassCategorySchema = {
    add: z.object({
        asmcC_Id: z.number().int({ message: 'ASMCC_ID is required' }).optional(),
        asmaY_Id: z.number().int({ message: 'Academic Year is required' }),
        amC_Id: z.number().int({ message: 'Category is required' }),
        class_ids: z.array(z.string()).nonempty('Please select at least one class')
    }),
    delete: z.object({
        asmcC_Id: deleteIdSchema('asmcC_Id')
    })
};

export const masterCasteCategorySchema = {
    addOrUpdate: z.object({
        imcC_Id: z.number().int({ message: 'IMCC_ID is required' }).optional(),
        imcC_CategoryCode: z.string().nonempty({ message: 'Caste Category Code is required' }),
        imcC_CategoryName: createStringSchema('Caste Category Code', 1, 100),
        imcC_CategoryDesc: createStringSchema('Caste Category Description', 1, 100)
    }),
    delete: z.object({
        imcC_Id: deleteIdSchema('imcC_Id')
    })
};

export const masterCasteSchema = {
    addOrUpdate: z.object({
        imC_Id: z.number().int({ message: 'IMC_ID is required' }).optional(),
        imcC_Id: z.number().int({ message: 'Caste Category is required' }),
        imC_CasteName: createStringSchema('Caste Caste Code', 1, 100),
        imC_CasteDesc: createStringSchema('Caste Caste Description', 1, 100)
    }),
    delete: z.object({
        imC_Id: deleteIdSchema('imC_Id')
    })
};

export const masterDocumentSchema = {
    addOrUpdate: z.object({
        amsmD_Id: z.number().int({ message: 'AMSMD_ID is required' }).optional(),
        amsmD_DocumentName: createStringSchema('Document Name', 1, 100),
        amsmD_Description: createStringSchema('Description', 1, 200),
        amsmD_FLAG: z.number().int({ message: 'Mandatory Flag is required' })
    }),
    delete: z.object({
        amsmD_Id: deleteIdSchema('amsmD_Id')
    })
};

export const masterReferenceSchema = {
    addOrUpdate: z.object({
        pamR_Id: z.number().int({ message: 'PAMR_Id is required' }).optional(),
        pamR_ReferenceName: createStringSchema('Reference Name', 1, 100),
        pamR_ReferenceDesc: createStringSchema('Description', 1, 200)
    }),
    delete: z.object({
        pamR_Id: deleteIdSchema('pamR_Id')
    })
};

export const masterSourceSchema = {
    addOrUpdate: z.object({
        pamS_Id: z.number().int({ message: 'PAMS_ID is required' }).optional(),
        pamS_SourceName: createStringSchema('Source Name', 1, 100),
        pamS_SourceDesc: createStringSchema('Description', 1, 200)
    }),
    delete: z.object({
        pamS_Id: deleteIdSchema('pamS_Id')
    })
};

export const masterReligionCasteCategorySchema = {
    add: z.object({
        ircC_Id: z.number().int({ message: 'IRCC_ID is required' }).optional(),
        ivrmmR_Id: z.number().int({ message: 'Religion is required' }),
        caste_category_ids: z.array(z.string()).nonempty('Please select at least one caste category')
    }),
    delete: z.object({
        ircC_Id: deleteIdSchema('ircC_Id')
    })
};
