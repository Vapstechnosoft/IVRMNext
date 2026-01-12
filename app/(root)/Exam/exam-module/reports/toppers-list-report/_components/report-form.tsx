'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ToppersListSchema, toppersListReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getCategoryDropDownByAcademicYearlist,
    getExamGroupsByCategory
} from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import { getReportDetails, getToppersReportDetails } from '@/server/exam/exam-module/reports/toppers-list-report';
import {
    getClassDropDownByYearCategoryList,
    getSectionDropDownByYearCategoryClassList
} from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any, institution: any, params: any) => void;
    onReset: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onReportGenerated, onReset }) => {
    const [loading, setLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const methods = useForm<ToppersListSchema>({
        resolver: zodResolver(toppersListReportSchema),
        mode: 'onChange',
        defaultValues: {
            type: '1',
            topper: '10',
            subjectwise: false,
            exm_check_type: '0',
            sub_check_type: '0',
            ASMAY_Id: '',
            EMCA_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            EME_Id: '',
            ISMS_Id: ''
        }
    });

    const { control, handleSubmit, setValue, reset, formState, trigger } = methods;
    const { isSubmitting, errors } = formState;

    // Watchers
    const watchType = useWatch({ control, name: 'type' });
    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchCategory = useWatch({ control, name: 'EMCA_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchExam = useWatch({ control, name: 'EME_Id' });
    const watchSubjectwise = useWatch({ control, name: 'subjectwise' });
    const watchSubject = useWatch({ control, name: 'ISMS_Id' });
    const watchTopper = useWatch({ control, name: 'topper' });

    // Initial Data - Academic Years
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getAcademicYearDropdown();
                if (response.success) {
                    setAcademicYears(response.data || []);
                } else {
                    toast.error('Failed to load academic years');
                }
            } catch (error) {
                console.error('Error fetching academic years:', error);
                toast.error('Error loading academic years');
            }
        };
        fetchInitialData();
    }, []);

    // Load Categories when Year changes
    useEffect(() => {
        if (watchYear) {
            const fetchCategories = async () => {
                try {
                    // Convert string to number for API call
                    const yearId = Number.parseInt(watchYear, 10);
                    const { data: cats } = await getCategoryDropDownByAcademicYearlist(30, yearId);
                    const validCats = Array.isArray(cats) ? cats : [];
                    setCategories(validCats);

                    // Reset dependent fields
                    setValue('EMCA_Id', '');
                    setClasses([]);
                    setSections([]);
                    setExams([]);
                    setSubjects([]);

                    if (validCats.length === 0) {
                        toast.info('No categories found for selected academic year');
                    }
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    toast.error('Failed to load categories');
                    setCategories([]);
                }
            };
            fetchCategories();
        } else {
            setCategories([]);
            setClasses([]);
            setSections([]);
            setExams([]);
            setSubjects([]);
            setValue('EMCA_Id', '');
            setValue('ASMCL_Id', '');
            setValue('ASMS_Id', '');
            setValue('EME_Id', '');
            setValue('ISMS_Id', '');
        }
    }, [watchYear, setValue]);

    // Load Classes and Exams when Category changes
    useEffect(() => {
        if (watchYear && watchCategory) {
            const fetchClassesAndExams = async () => {
                try {
                    // Convert strings to numbers for API calls
                    const yearId = Number.parseInt(watchYear, 10);
                    const categoryId = Number.parseInt(watchCategory, 10);

                    // Fetch exams for the category
                    const examsResponse = await getExamGroupsByCategory(yearId, categoryId);
                    if (examsResponse.success) {
                        setExams(examsResponse.data || []);
                    } else {
                        setExams([]);
                    }

                    // Fetch classes only if type is individual (type=2)
                    if (watchType === '2') {
                        const classesResponse = await getClassDropDownByYearCategoryList(yearId, categoryId);
                        const validClasses = Array.isArray(classesResponse) ? classesResponse : [];
                        setClasses(validClasses);

                        // Reset dependent fields
                        setValue('ASMCL_Id', '');
                        setSections([]);
                        setValue('ASMS_Id', '');

                        if (validClasses.length === 0) {
                            toast.info('No classes found for this category');
                        }
                    } else {
                        setClasses([]);
                        setSections([]);
                        setValue('ASMCL_Id', '');
                        setValue('ASMS_Id', '');
                    }

                    // Reset exams and subjects
                    setValue('EME_Id', '');
                    setSubjects([]);
                    setValue('ISMS_Id', '');

                } catch (error) {
                    console.error('Error fetching classes and exams:', error);
                    toast.error('Failed to load classes and exams');
                    setClasses([]);
                    setExams([]);
                }
            };
            fetchClassesAndExams();
        } else {
            setClasses([]);
            setExams([]);
            setSubjects([]);
            setValue('ASMCL_Id', '');
            setValue('ASMS_Id', '');
            setValue('EME_Id', '');
            setValue('ISMS_Id', '');
        }
    }, [watchYear, watchCategory, watchType, setValue]);

    // Load Sections when Class changes (only for individual type)
    useEffect(() => {
        if (watchType === '2' && watchYear && watchCategory && watchClass) {
            const fetchSections = async () => {
                try {
                    // Convert strings to numbers for API call
                    const yearId = Number.parseInt(watchYear, 10);
                    const categoryId = Number.parseInt(watchCategory, 10);
                    const classId = Number.parseInt(watchClass, 10);

                    const sectionsResponse = await getSectionDropDownByYearCategoryClassList(
                        yearId,
                        categoryId,
                        classId
                    );
                    const validSections = Array.isArray(sectionsResponse) ? sectionsResponse : [];
                    setSections(validSections);

                    // Reset dependent fields
                    setValue('ASMS_Id', '');
                    setValue('EME_Id', '');
                    setSubjects([]);
                    setValue('ISMS_Id', '');

                    if (validSections.length === 0) {
                        toast.info('No sections found for this class');
                    }
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    toast.error('Failed to load sections');
                    setSections([]);
                }
            };
            fetchSections();
        } else {
            setSections([]);
            setValue('ASMS_Id', '');
        }
    }, [watchType, watchYear, watchCategory, watchClass, setValue]);

    // Update check types when form values change
    useEffect(() => {
        // Set exam check type based on exam selection
        if (watchExam) {
            setValue('exm_check_type', '1'); // Examwise
        } else {
            setValue('exm_check_type', '0'); // All
        }

        // Set subject check type based on subjectwise checkbox
        if (watchSubjectwise && watchSubject) {
            setValue('sub_check_type', '1'); // Subjectwise
        } else {
            setValue('sub_check_type', '0'); // All
        }
    }, [watchExam, watchSubjectwise, watchSubject, setValue]);

    // Trigger validation when fields change for conditional validation
    useEffect(() => {
        if (watchType === '2' && watchSection) {
            trigger('ASMS_Id');
        }
        if (watchSubjectwise && watchSubject) {
            trigger('ISMS_Id');
        }
    }, [watchType, watchSection, watchSubjectwise, watchSubject, trigger]);

    const onSubmit = async (formValues: ToppersListSchema) => {
        setLoading(true);

        try {
            // Prepare payload according to the required structure
            const payload = {
                mI_Id: 30, // Institution ID - using 30 as per reference
                asmaY_Id: Number.parseInt(formValues.ASMAY_Id) || 0,
                asmcL_Id: formValues.type === '1' ? 0 : Number.parseInt(formValues.ASMCL_Id) || 0,
                asmS_Id: formValues.type === '1' ? 0 : Number.parseInt(formValues.ASMS_Id || '') || 0,
                emE_Id: Number.parseInt(formValues.EME_Id) || 0,
                ismS_Id: formValues.subjectwise ? Number.parseInt(formValues.ISMS_Id || '') || 0 : 0,
                report_type: formValues.type === '1' ? 'All' : 'Individual',
                sub_check_type: formValues.subjectwise ? '1' : '0',
                exm_check_type: formValues.EME_Id ? '1' : '0',
                topper: Number.parseInt(formValues.topper) || 0
            };

            console.log('Sending payload to API:', payload);

            const result = await getToppersReportDetails(payload);

            if (result.success) {
                onReportGenerated(result.data || result.datareport, result.masterinstitution, formValues);
            } else {
                toast.error(result.message || 'Failed to generate report');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error?.message || 'An error occurred while generating the report');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        reset({
            type: '1',
            topper: '10',
            subjectwise: false,
            exm_check_type: '0',
            sub_check_type: '0',
            ASMAY_Id: '',
            EMCA_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            EME_Id: '',
            ISMS_Id: ''
        });
        onReset();
    };

    return (
        <Card className='mb-6'>
            <CardContent>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='mt-6 mb-6 flex justify-center'>
                            <Controller
                                control={control}
                                name='type'
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='r1' />
                                            <Label htmlFor='r1'>All</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='2' id='r2' />
                                            <Label htmlFor='r2'>Individual</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Academic Year */}
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                // Trigger validation when changed
                                                trigger('ASMAY_Id');
                                            }}
                                            value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((item) => (
                                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMAY_Id && (
                                    <FormError>{errors.ASMAY_Id.message}</FormError>
                                )}
                            </div>

                            {/* Category */}
                            <div className='space-y-2'>
                                <Label>
                                    Category <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='EMCA_Id'
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                // Trigger validation when changed
                                                trigger('EMCA_Id');
                                            }}
                                            value={field.value}
                                            disabled={!watchYear}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((item) => (
                                                    <SelectItem key={item.emcA_Id} value={String(item.emcA_Id)}>
                                                        {item.emcA_CategoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.EMCA_Id && (
                                    <FormError>{errors.EMCA_Id.message}</FormError>
                                )}
                            </div>

                            {/* Class (Only for Individual type) */}
                            <div className='space-y-2'>
                                <Label>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMCL_Id'
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                // Trigger validation when changed
                                                trigger('ASMCL_Id');
                                            }}
                                            value={field.value}
                                            disabled={watchType === '1' || !watchCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((item) => (
                                                    <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                        {item.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMCL_Id && (
                                    <FormError>{errors.ASMCL_Id.message}</FormError>
                                )}
                            </div>

                            {/* Section (Only for Individual type) */}
                            <div className='space-y-2'>
                                <Label>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                // Trigger validation when changed
                                                trigger('ASMS_Id');
                                            }}
                                            value={field.value || ''}
                                            disabled={watchType === '1' || !watchClass}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((item) => (
                                                    <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                        {item.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMS_Id && (
                                    <FormError>{errors.ASMS_Id.message}</FormError>
                                )}
                            </div>

                            {/* Exam */}
                            <div className='space-y-2'>
                                <Label>
                                    Exam <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='EME_Id'
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                // Trigger validation when changed
                                                trigger('EME_Id');
                                            }}
                                            value={field.value}
                                            disabled={!watchCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Exam' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exams.map((item) => (
                                                    <SelectItem key={item.emE_Id} value={String(item.emE_Id)}>
                                                        {item.emE_ExamName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.EME_Id && (
                                    <FormError>{errors.EME_Id.message}</FormError>
                                )}
                            </div>

                            {/* Top */}
                            <div className='space-y-2'>
                                <Label>
                                    Top <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='topper'
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder='Enter Top Count'
                                            type='number'
                                            min="1"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Only allow positive numbers
                                                if (value === '' || (Number(value) > 0)) {
                                                    field.onChange(value);
                                                }
                                            }}
                                        />
                                    )}
                                />
                                {errors.topper && (
                                    <FormError>{errors.topper.message}</FormError>
                                )}
                            </div>

                            {/* Subjectwise Checkbox & Dropdown */}
                            <div className='flex items-center gap-2 col-span-1 md:col-span-2'>
                                {/* Checkbox part */}
                                <div className='flex items-center justify-end gap-2'>
                                    <Controller
                                        control={control}
                                        name='subjectwise'
                                        render={({ field }) => (
                                            <>
                                                <Checkbox
                                                    id='subCheck'
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(checked);
                                                        // Clear subject when unchecked
                                                        if (!checked) {
                                                            setValue('ISMS_Id', '');
                                                        }
                                                        trigger('ISMS_Id');
                                                    }}
                                                />
                                                <Label htmlFor='subCheck' className='cursor-pointer'>
                                                    Subjectwise
                                                </Label>
                                            </>
                                        )}
                                    />
                                </div>

                                {/* Dropdown part */}
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='ISMS_Id'
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    // Trigger validation when changed
                                                    trigger('ISMS_Id');
                                                }}
                                                value={field.value || ''}
                                                disabled={!watchSubjectwise || !watchExam}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Subject' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map((item) => (
                                                        <SelectItem key={item.ismS_Id} value={String(item.ismS_Id)}>
                                                            {item.ismS_SubjectName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.ISMS_Id && (
                                        <FormError>{errors.ISMS_Id.message}</FormError>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hidden fields for check types */}
                        <Controller
                            control={control}
                            name='exm_check_type'
                            render={({ field }) => <input type='hidden' {...field} />}
                        />
                        <Controller
                            control={control}
                            name='sub_check_type'
                            render={({ field }) => <input type='hidden' {...field} />}
                        />

                        <div className='flex justify-center space-x-4 pt-4'>
                            <Button
                                type='submit'
                                disabled={loading || isSubmitting}>
                                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                Generate Report
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
};