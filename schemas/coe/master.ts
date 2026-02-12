import { z } from 'zod';
import { deleteIdSchema } from '../validationSchemas';

export const masterEventCoeSchema = {
    addOrUpdate: z.object({
        masterevent: z.string().min(1, 'Master Event Name is required'),
        masterDescription: z.string().min(1, 'Master Description is required'),
        smsContent: z.string().optional(),
        smsparameter: z.string().optional(),
        emailSubject: z.string().min(1, 'Email Subject is required'),
        emailHeader: z.string().min(1, 'Email Header is required'),
        emailMessage: z.string().optional(),
        eemailParamter: z.string().optional(),
        emailFooter: z.string().min(1, 'Email Footer is required'),
        type: z.enum(['mc', 'dc']).default('mc'),
    }).superRefine((data, ctx) => {
        if (data.type === 'mc') {
            if (!data.smsContent) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "SMS Content is required",
                    path: ["smsContent"]
                });
            }
            if (!data.emailMessage) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Email Message is required",
                    path: ["emailMessage"]
                });
            }
        }
    }),
    delete: z.object({
        coemE_Id: deleteIdSchema('coemE_Id')
    })
};

export const mappingEventCoeSchema = {
    addOrUpdate: z.object({
        coee_Id: z.number().optional(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, 'Academic Year is required'),
        coemE_Id: z.number({ required_error: 'Event Name is required' }).min(1, 'Event Name is required'),
        startDate: z.date({ required_error: 'Start Date is required' }),
        endDate: z.date({ required_error: 'End Date is required' }),
        startTime: z.date({ required_error: 'Start Time is required' }),
        endTime: z.date({ required_error: 'End Time is required' }),
        reminderDate: z.date().optional(),
        reminderDays: z.string().optional(),
        smsActiveFlag: z.boolean().default(false),
        mailActiveFlag: z.boolean().default(false),
        repeatFlag: z.boolean().default(false),
        reminderSchedule: z.string().optional(),
        studentFlag: z.boolean().default(false),
        alumniFlag: z.boolean().default(false),
        employeeFlag: z.boolean().default(false),
        otherFlag: z.boolean().default(false),
        classes: z.array(z.number()).optional(),
        staffTypes: z.array(z.number()).optional(),
        alumniYear: z.number().optional(),
        others: z.array(z.object({
            name: z.string().min(1, "Name is required"),
            mobile: z.string().regex(/^[0-9]{10}$/, "Invalid Mobile Number"),
            email: z.string().email("Invalid Email")
        })).optional(),
        uploads: z.array(z.object({
            name: z.string().min(1, "File Name is required"),
            fileKey: z.string().optional(), // For storing the file path/url after upload
            // We might need to handle the actual File object separately in the form component state if not directly in z.infer
        })).optional(),
        videos: z.array(z.object({
            name: z.string().min(1, "Video Name is required"),
            url: z.string().url("Invalid URL").optional(), // Or fileKey if it's an uploaded video
        })).optional(),
        // smsMessage: z.string().optional(), // Read-only from master event usually, but payload includes it
        // mailSubject: z.string().optional(),
        // mailHeader: z.string().optional(),
        // mailFooter: z.string().optional(),
        // mailMessage: z.string().optional(),
        // mailTemplate: z.string().optional(),
    }).superRefine((data, ctx) => {
        if (data.studentFlag && (!data.classes || data.classes.length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select at least one class",
                path: ["classes"]
            });
        }
        if (data.employeeFlag && (!data.staffTypes || data.staffTypes.length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select at least one staff type",
                path: ["staffTypes"]
            });
        }
        if (data.alumniFlag && !data.alumniYear) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select Alumni Year",
                path: ["alumniYear"]
            });
        }
        if (data.otherFlag && (!data.others || data.others.length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please add at least one other recipient",
                path: ["others"]
            });
        }
        if (data.repeatFlag && !data.reminderSchedule) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select generic repeat schedule",
                path: ["reminderSchedule"]
            });
        }
        if (data.endDate < data.startDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End Date must be after Start Date",
                path: ["endDate"]
            });
        }
    })
};

export const coeReportSchema = {
    addOrUpdate: z.object({
        asmaY_Id: z.number({ required_error: 'Academic year is required' }),
        asmcl_Id: z.number().optional(),
        month: z.number().optional()
    })
};

export const coeMonthEndReportSchema = {
    addOrUpdate: z.object({
        asmaY_Id: z.number({ required_error: 'Academic year is required' }),
        ieName: z.string().optional(),
        month: z.string().optional()
    })
};
