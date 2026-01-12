import { z } from 'zod';

// Member type and book type enums
export const memberTypeSchema = z.enum(['std', 'stf', 'dep', 'gst']);
export const bookTypeSchema = z.enum(['issue', 'ref']);
export const bookCategorySchema = z.enum(['book', 'nonbook']);

// Base transaction schema
const baseTransactionSchema = z.object({
    LMBANO_Id: z.number().min(1, 'Please select a book'),
    LMB_Id: z.number().min(1, 'Book ID is required'),
    issuertype: memberTypeSchema,
    booktype: bookTypeSchema.default('issue'),
    bookcat_type: bookCategorySchema.default('book'),
    FODM_Id: z.number().optional(),
    LMAL_Id: z.number().optional()
});

// Book Issue Schema
export const bookIssueSchema = baseTransactionSchema
    .extend({
        Book_Trans_Id: z.number().optional(),
        LMB_BookTitle: z.string().min(1, 'Book title is required'),
        LMB_Price: z.number().min(0, 'Price must be positive'),
        Issue_Date: z.date(),
        Due_Date: z.date(),
        Return_Date: z.date(),
        Book_Trans_Status: z.enum(['Issue', 'Return']).default('Issue'),
        maxitem: z.number().min(1),

        // Student specific
        AMST_Id: z.number().optional(),
        ASMCL_Id: z.number().optional(),
        ASMAY_Id: z.number().optional(),

        // Staff specific
        HRME_Id: z.number().optional(),
        HRMD_Id: z.number().optional(),
        HRMDES_Id: z.number().optional(),

        // Guest specific
        LBTR_GuestName: z.string().optional(),
        LBTR_GuestContactNo: z
            .string()
            .regex(/^[6-9]\d{9}$/, 'Invalid mobile number')
            .optional(),
        LBTR_GuestEmailId: z.string().email('Invalid email').optional(),

        // Optional
        pushnotification: z.boolean().optional(),
        pushnotficationimsg: z.string().optional()
    })
    .refine(
        (data) => {
            // Validate based on member type
            if (data.issuertype === 'std' && !data.AMST_Id) {
                return false;
            }
            if (data.issuertype === 'stf' && !data.HRME_Id) {
                return false;
            }
            if (data.issuertype === 'dep' && !data.HRMD_Id) {
                return false;
            }
            if (data.issuertype === 'gst') {
                if (!data.LBTR_GuestName || !data.LBTR_GuestContactNo || !data.LBTR_GuestEmailId) {
                    return false;
                }
            }
            return true;
        },
        {
            message: 'Please provide required member information',
            path: ['AMST_Id']
        }
    );

// Book Return Schema
export const bookReturnSchema = z.object({
    Book_Trans_Id: z.number().min(1, 'Transaction ID is required'),
    LMBANO_Id: z.number().min(1, 'Accession number is required'),
    LMB_Id: z.number().min(1, 'Book ID is required'),
    Due_Date: z.date(),
    Return_Date: z.date(),
    booktype: bookTypeSchema,
    issuertype: memberTypeSchema,
    bookcat_type: bookCategorySchema,
    LBTR_FineCollected: z.number().min(0, 'Fine collected must be positive').default(0),
    FODM_Id: z.number().optional()
});

// Book Renewal Schema
export const bookRenewalSchema = z.object({
    Book_Trans_Id: z.number().min(1, 'Transaction ID is required'),
    LMBANO_Id: z.number().min(1, 'Accession number is required'),
    LMB_Id: z.number().min(1, 'Book ID is required'),
    Issue_Date: z.date(),
    Due_Date: z.date(),
    Return_Date: z.date(),
    Max_No_Renewals: z.number().min(1),
    issuertype: memberTypeSchema,
    bookcat_type: bookCategorySchema,
    LBTR_FineCollected: z.number().min(0).default(0),
    FODM_Id: z.number().optional()
});

// Student Filter Schema
export const studentFilterSchema = z.object({
    ASMAY_Id: z.number().min(1, 'Academic Year is required'),
    ASMCL_Id: z.number().min(1, 'Class is required'),
    ASMS_Id: z.number().min(1, 'Section is required'),
    FODM_Id: z.number().optional()
});

// Staff Filter Schema
export const staffFilterSchema = z.object({
    HRMD_Id: z.number().min(1, 'Department is required'),
    HRMDES_Id: z.number().min(1, 'Designation is required'),
    FODM_Id: z.number().optional()
});

// Guest Form Schema
export const guestFormSchema = z.object({
    LBTR_GuestName: z.string().min(1, 'Guest name is required').max(200),
    LBTR_GuestContactNo: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number (must start with 6-9 and be 10 digits)'),
    LBTR_GuestEmailId: z.string().email('Invalid email address').max(100)
});

// Search Filter Schema
export const searchFilterSchema = z.object({
    searctype: z.enum(['TL', 'ACN', 'CS', 'SN', 'ADN', 'ID']),
    searchfilter: z.string().optional(),
    ASMCL_Id: z.number().optional(),
    ASMS_Id: z.number().optional(),
    Issue_Date: z.date().optional(),
    booktype: bookTypeSchema,
    issuertype: memberTypeSchema,
    bookcat_type: bookCategorySchema,
    LMAL_Id: z.number().optional(),
    FODM_Id: z.number().optional()
});

// Export types
export type BookIssueFormValues = z.infer<typeof bookIssueSchema>;
export type BookReturnFormValues = z.infer<typeof bookReturnSchema>;
export type BookRenewalFormValues = z.infer<typeof bookRenewalSchema>;
export type StudentFilterValues = z.infer<typeof studentFilterSchema>;
export type StaffFilterValues = z.infer<typeof staffFilterSchema>;
export type GuestFormValues = z.infer<typeof guestFormSchema>;
export type SearchFilterValues = z.infer<typeof searchFilterSchema>;
