'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    getReportDetails
} from '@/server/exam/exam-module/reports/percentagewise-details-report';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Printer, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { percentageWiseDetailsReportSchema, PercentageWiseDetailsReportSchema } from '@/schemas/exam/exam-module/reports';
import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';
import { getCategoryDropDownByAcademicYearlist, getExamGroupsByCategory } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import { getExamsByCategoryandAcademicYear } from '@/server/exam/exam-module/masters/exam';
import { getSectionListbyClassSectionSubjectGroup } from '@/server/exam/exam-module/exam-mapping/student-subject-mapping';
import { getClassDropDownByYearCategoryList, getSectionDropDownByYearCategoryClassList } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import { getClassDropDownByAcademicYearlist } from '@/server/exam/exam-module/reports/cumulative-report';

interface ReportFormProps {
    onReportGenerated: (data: any, payload: any) => void;
    onPrint?: () => void;
    onExcel?: () => void;
}

const percentageArray = [
    { id: '1', value: '80-100' },
    { id: '2', value: '60-80' },
    { id: '3', value: '40-60' },
    { id: '4', value: '30-40' },
    { id: '5', value: 'Less Than 30' }
];

export const ReportForm: React.FC<ReportFormProps> = ({ onReportGenerated, onPrint, onExcel }) => {
    const [loading, setLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    const form = useForm<PercentageWiseDetailsReportSchema>({
        resolver: zodResolver(percentageWiseDetailsReportSchema),
        defaultValues: {
            qualification_type: 'all',
            ASMAY_Id: 0,
            EMCA_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            EME_Id: 0,
            percent: '',
        }
    });

    const { watch, setValue, resetField, handleSubmit, control } = form;
    const qualificationType = watch('qualification_type');
    const selectedYear = watch('ASMAY_Id');
    const selectedCategory = watch('EMCA_Id');
    const selectedClass = watch('ASMCL_Id');
    const selectedSection = watch('ASMS_Id');

    // Initial Data
    useEffect(() => {
        const fetchInitialData = async () => {
            const response = await getAcademicYearDropdown();
            if (response.success) {
                setAcademicYears(response.data || []);
            }
        };
        fetchInitialData();
    }, []);

    // On Year Change
    useEffect(() => {
        if (selectedYear > 0) {
            const fetchData = async () => {
                const { data: cats } = await getCategoryDropDownByAcademicYearlist(30, selectedYear);
                const validCats = Array.isArray(cats) ? cats : [];
                setCategories(validCats);
            };
            fetchData();
        } else {
            setCategories([]);
        }
    }, [selectedYear]);

    // On Category Change
    useEffect(() => {
        if (selectedYear > 0 && selectedCategory > 0) {
            const fetchData = async () => {
                const response = await getExamGroupsByCategory(selectedYear, selectedCategory);
                if (qualificationType === 'individual') {
                    const classes_res = await getClassDropDownByYearCategoryList(selectedYear, selectedCategory);
                    const safeClasses = Array.isArray(classes_res) ? classes_res : [];
                    if (safeClasses.length === 0) {
                        toast.info('No classes found for this category');
                    }
                    setClasses(safeClasses);
                }

                if (response.success) {
                    if (response.data.length === 0) {
                        toast.info('No exams found for this category');
                    }
                    setExams(response.data || []);
                }
            };
            fetchData();
        } else {
            setClasses([]);
            setExams([]);
        }
    }, [selectedYear, selectedCategory, qualificationType]);

    // On Class Change
    useEffect(() => {
        if (selectedClass && selectedClass > 0 && selectedYear > 0 && selectedCategory > 0) {
            const fetchData = async () => {
                const response = await getSectionDropDownByYearCategoryClassList(selectedYear, selectedCategory, selectedClass);
                const safeSections = Array.isArray(response) ? response : [];
                if (safeSections.length === 0) {
                    toast.info('No sections found for this class');
                }
                setSections(safeSections);
            };
            fetchData();
        } else {
            setSections([]);
        }
    }, [selectedClass, selectedYear, selectedCategory]);



    const onSubmit = async (data: PercentageWiseDetailsReportSchema) => {
        setLoading(true);

        try {
            const classId = data.qualification_type === 'all' ? 0 : data.ASMCL_Id;
            const sectionId = data.qualification_type === 'all' ? 0 : data.ASMS_Id;

            const payload = {
                mI_Id: 0, // usually institution id (set from session later if needed)
                asmaY_Id: data.ASMAY_Id,
                emcA_Id: data.EMCA_Id,
                asmcL_Id: classId,
                asmS_Id: sectionId,
                emE_Id: data.EME_Id,

                // Student related fields (not used for report, send defaults)
                amsT_Id: 0,
                amsT_FirstName: '',
                amsT_AdmNo: '',

                // Marks related fields (calculated server-side)
                estmP_TotalMaxMarks: 0,
                estmP_TotalObtMarks: 0,
                estmP_Percentage: 0,

                report_type: data.qualification_type,
                percent: data.percent
            };
            console.log('payload', payload);
            const response = await getReportDetails(payload);
            console.log('response', response);

            if (response.success) {
                if (response.data.length === 0) {
                    toast.info('No records found');
                }
                onReportGenerated(response, payload);
            } else {
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };


    const handleCancel = () => {
        form.reset({
            qualification_type: 'all',
            ASMAY_Id: 0,
            EMCA_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            EME_Id: 0,
            percent: '',
        });
        onReportGenerated(null, null);
    };

    return (
        <Card className="mb-6">
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex justify-center mb-6 mt-6">
                        <Controller
                            control={control}
                            name="qualification_type"
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="r1" />
                                        <Label htmlFor="r1">All</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="individual" id="r2" />
                                        <Label htmlFor="r2">Individual</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Academic Year */}
                        <div className="space-y-2">
                            <Label>Academic Year <span className="text-red-500">*</span></Label>
                            <Controller
                                control={control}
                                name="ASMAY_Id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Academic Year" />
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
                            {form.formState.errors.ASMAY_Id && (
                                <p className="text-sm text-red-500">{form.formState.errors.ASMAY_Id.message}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Category <span className="text-red-500">*</span></Label>
                            <Controller
                                control={control}
                                name="EMCA_Id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
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
                            {form.formState.errors.EMCA_Id && (
                                <p className="text-sm text-red-500">{form.formState.errors.EMCA_Id.message}</p>
                            )}
                        </div>

                        {/* Class */}
                        <div className="space-y-2">
                            <Label>Class <span className="text-red-500">*</span></Label>
                            <Controller
                                control={control}
                                name="ASMCL_Id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : undefined}
                                        disabled={qualificationType === 'all'}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
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
                            {form.formState.errors.ASMCL_Id && (
                                <p className="text-sm text-red-500">{form.formState.errors.ASMCL_Id.message}</p>
                            )}
                        </div>

                        {/* Section */}
                        <div className="space-y-2">
                            <Label>Section <span className="text-red-500">*</span></Label>
                            <Controller
                                control={control}
                                name="ASMS_Id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value !== undefined ? String(field.value) : undefined}
                                        disabled={qualificationType === 'all'}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">All</SelectItem>
                                            {sections.map((item) => (
                                                <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                    {item.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.ASMS_Id && (
                                <p className="text-sm text-red-500">{form.formState.errors.ASMS_Id.message}</p>
                            )}
                        </div>

                        {/* Exam */}
                        <div className="space-y-2">
                            <Label>Exam <span className="text-red-500">*</span></Label>
                            <Controller
                                control={control}
                                name="EME_Id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Exam" />
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
                            {form.formState.errors.EME_Id && (
                                <p className="text-sm text-red-500">{form.formState.errors.EME_Id.message}</p>
                            )}
                        </div>

                        {/* Percentage */}
                        <div className="space-y-2">
                            <Label>Percentage <span className="text-red-500">*</span></Label>
                            <Controller
                                control={control}
                                name="percent"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Percentage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {percentageArray.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.percent && (
                                <p className="text-sm text-red-500">{form.formState.errors.percent.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Report
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onExcel}
                            className='border-primary text-primary hover:bg-primary/10'>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            Excel
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onPrint}
                            className='border-primary text-primary hover:bg-primary/10'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
