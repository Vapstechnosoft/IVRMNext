import { number, z } from 'zod';
import { createOptionalNumberOnlyStringSchema, createStringOnlySchema, deleteIdSchema } from '../validationSchemas';

export const masterDaySchema = {
    addOrUpdate: z.object({
        ttmD_Id: z.number().optional(),
        ttmD_DayName: createStringOnlySchema('Day Name', 1, 100),
        ttmD_DayCode: createStringOnlySchema('Day Code', 1, 100)
    }),
    delete: z.object({
        ttmD_Id: deleteIdSchema('ttmD_Id')
    })
};

export const masterBuildingSchema = {
    addOrUpdate: z.object({
        ttmB_Id: z.number().optional(),
        ttmB_BuildingName: createStringOnlySchema('Building Name', 1, 100)
    }),
    delete: z.object({
        ttmB_Id: deleteIdSchema('ttmB_Id')
    })
};

export const staffabbreviationsSchema = {
    addOrUpdate: z.object({
        TTMSAB_Id: z.number().optional(),
        HRME_Id: number().min(1, 'Please select an Staff'),
        // ttmB_BuildingName: createStringOnlySchema('Building Name', 1, 100),
        TTMSAB_Abbreviation: createStringOnlySchema('Abbreviation', 1, 100),
        TTMSAB_PerDayMaxDeputation: createOptionalNumberOnlyStringSchema('Per Day Max Deputation', 1, 100),
        TTMSAB_PerWeekMaxDeputation: createOptionalNumberOnlyStringSchema('Per Week Max Deputation', 1, 100),
        TTMSAB_PerMonthMaxDeputation: createOptionalNumberOnlyStringSchema('Per Month Max Deputation', 1, 100),
        TTMSAB_PerYearMaxDeputation: createOptionalNumberOnlyStringSchema('Per Month Max Deputation', 1, 100)
    }),
    delete: z.object({
        TTMSAB_Id: deleteIdSchema('TTMSAB_Id')
    })
};

export const subjectabbreviationsSchema = {
    addOrUpdate: z.object({
        // TTMSAB_Id: z.number().optional(),
        // HRME_Id: createNumberOnlyStringSchemaRequired('Staff', 1, 100),
        // // ttmB_BuildingName: createStringOnlySchema('Building Name', 1, 100),
        // TTMSAB_Abbreviation: createStringOnlySchema('Abbreviation', 1, 100),
        // TTMSAB_PerDayMaxDeputation: createOptionalNumberOnlyStringSchema('Per Day Max Deputation', 1, 100),
        // TTMSAB_PerWeekMaxDeputation: createOptionalNumberOnlyStringSchema('Per Week Max Deputation', 1, 100),
        // TTMSAB_PerMonthMaxDeputation: createOptionalNumberOnlyStringSchema('Per Month Max Deputation', 1, 100),
        // TTMSAB_PerYearMaxDeputation: createOptionalNumberOnlyStringSchema('Per Month Max Deputation', 1, 100)
    }),
    delete: z.object({
        ttmsuaB_Id: deleteIdSchema('ttmsuaB_Id')
    })
};
