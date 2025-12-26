// app/exam/exam-module/student-marks-publish/_components/search-form.tsx
'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { studentMarksPublishSchema } from '@/schemas/exam/exam-module/marks-entry';

type FormFields = z.infer<typeof studentMarksPublishSchema.search>;

interface Props {
    onSuccess?: (params: any, data: any[]) => void;
    onRefresh?: (params: any, data: any[]) => void;
}

// Mock data
const MOCK_CLASSES = [
    { asmcL_Id: 1, asmcL_ClassName: 'Class I' },
    { asmcL_Id: 2, asmcL_ClassName: 'Class II' },
    { asmcL_Id: 3, asmcL_ClassName: 'Class III' },
    { asmcL_Id: 4, asmcL_ClassName: 'Class IV' },
    { asmcL_Id: 5, asmcL_ClassName: 'Class V' },
];

const MOCK_SECTIONS = [
    { asmS_Id: 1, asmC_SectionName: 'Section A' },
    { asmS_Id: 2, asmC_SectionName: 'Section B' },
    { asmS_Id: 3, asmC_SectionName: 'Section C' },
];

const MOCK_EXAMS = [
    { emE_Id: 1, emE_ExamName: 'First Term Exam' },
    { emE_Id: 2, emE_ExamName: 'Mid Term Exam' },
    { emE_Id: 3, emE_ExamName: 'Final Exam' },
];

const MOCK_STUDENTS = [
    {
        amsT_Id: 1,
        amsT_FirstName: "AADITRI SARKAR",
        amsT_AdmNo: "20139",
        amaY_Rollno: 28,
        obtainedmarks: 0,
        totalmaxmarks: 46,
        percentage: 0,
        estmP_PublishToStudentFlg: 1,
        estmP_Id: 101
    },
    {
        amsT_Id: 2,
        amsT_FirstName: "TAHA AFSAR KHAN",
        amsT_AdmNo: "19559",
        amaY_Rollno: 33,
        obtainedmarks: 35,
        totalmaxmarks: 46,
        percentage: 76,
        estmP_PublishToStudentFlg: 1,
        estmP_Id: 102
    },
    {
        amsT_Id: 3,
        amsT_FirstName: "MIRITTIJO NANDY",
        amsT_AdmNo: "19851",
        amaY_Rollno: 21,
        obtainedmarks: 0,
        totalmaxmarks: 46,
        percentage: 0,
        estmP_PublishToStudentFlg: 1,
        estmP_Id: 103
    },
    {
        amsT_Id: 4,
        amsT_FirstName: "ADRIJA DAS",
        amsT_AdmNo: "19858",
        amaY_Rollno: 43,
        obtainedmarks: 0,
        totalmaxmarks: 46,
        percentage: 0,
        estmP_PublishToStudentFlg: 1,
        estmP_Id: 104
    },
    {
        amsT_Id: 5,
        amsT_FirstName: "TANISTHA CHATTERJEE",
        amsT_AdmNo: "19846",
        amaY_Rollno: 59,
        obtainedmarks: 0,
        totalmaxmarks: 46,
        percentage: 0,
        estmP_PublishToStudentFlg: 0,
        estmP_Id: 105
    },
    {
        amsT_Id: 6,
        amsT_FirstName: "BIVAS MONDAL",
        amsT_AdmNo: "21290",
        amaY_Rollno: 46,
        obtainedmarks: 0,
        totalmaxmarks: 46,
        percentage: 0,
        estmP_PublishToStudentFlg: 0,
        estmP_Id: 106
    },
];

export default function SearchForm({ onSuccess, onRefresh }: Props) {
    const [loading, setLoading] = useState(false);
    const [processBtnEnabled, setProcessBtnEnabled] = useState(false);
    const [feeGroups, setFeeGroups] = useState<any[]>([]);
    const [feeTerms, setFeeTerms] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const methods = useForm<FormFields>({
        resolver: zodResolver(studentMarksPublishSchema.search),
        defaultValues: {
            radiotype: 'EXAM',
            feeinstallmentcheckbox: false,
            SMSFLAG: false,
            EMAILFLAG: false,
            NOTIFYFLAG: false,
            feeGroupIds: []
        }
    });

    const { control, handleSubmit, watch, setValue, reset, formState: { errors, isValid }, getValues } = methods;

    const radiotype = watch('radiotype');
    const academicYearId = watch('asmaY_Id');
    const classId = watch('asmcL_Id');
    const sectionId = watch('asmS_Id');
    const feeInstallmentCheckbox = watch('feeinstallmentcheckbox');
    const feeGroupIds = watch('feeGroupIds');

    const { data: academicYears, isLoading: academicYearLoading } = useAcademicYearDropdown();

    // Mock hooks implementation
    const useClassesByAcademicYear = (academicYearId?: number) => {
        return {
            data: { data: MOCK_CLASSES },
            isLoading: false,
            refetch: () => Promise.resolve({ data: { data: MOCK_CLASSES } })
        };
    };

    const useSectionsByClass = (academicYearId?: number, classId?: number) => {
        return {
            data: { data: MOCK_SECTIONS },
            isLoading: false,
            refetch: () => Promise.resolve({ data: { data: MOCK_SECTIONS } })
        };
    };

    const useExamsByClassSection = (academicYearId?: number, classId?: number, sectionId?: number) => {
        return {
            data: { data: MOCK_EXAMS },
            isLoading: false,
            refetch: () => Promise.resolve({ data: { data: MOCK_EXAMS } })
        };
    };

    const { data: classes, isLoading: classesLoading, refetch: refetchClasses } = useClassesByAcademicYear(academicYearId);
    const { data: sections, isLoading: sectionsLoading, refetch: refetchSections } = useSectionsByClass(academicYearId, classId);
    const { data: exams, isLoading: examsLoading, refetch: refetchExams } = useExamsByClassSection(academicYearId, classId, sectionId);

    useEffect(() => {
        const fetchFeeData = async () => {
            try {
                const hardcodedFeeGroups = [
                    { fmG_Id: 1, fmG_GroupName: 'Opening Balance 2023-24' },
                    { fmG_Id: 2, fmG_GroupName: 'Test Group' },
                    { fmG_Id: 3, fmG_GroupName: 'new group' },
                    { fmG_Id: 4, fmG_GroupName: 'B.Tech Group' },
                ];

                const hardcodedFeeTerms = [
                    { fmT_Id: 1, fmT_Name: 'Term 1' },
                    { fmT_Id: 2, fmT_Name: 'Term 2' },
                    { fmT_Id: 3, fmT_Name: 'Term 3' },
                ];

                setFeeGroups(hardcodedFeeGroups);
                setFeeTerms(hardcodedFeeTerms);
            } catch (error) {
                console.error('Error setting fee data:', error);
            }
        };

        fetchFeeData();
    }, []);

    useEffect(() => {
        if (academicYearId) {
            refetchClasses();
            setValue('asmcL_Id', 0);
            setValue('asmS_Id', 0);
            setValue('emE_Id', 0);
            setProcessBtnEnabled(false);
        }
    }, [academicYearId]);

    useEffect(() => {
        if (classId && academicYearId) {
            refetchSections();
            setValue('asmS_Id', 0);
            setValue('emE_Id', 0);
            setProcessBtnEnabled(false);
        }
    }, [classId, academicYearId]);

    useEffect(() => {
        if (sectionId && classId && academicYearId) {
            if (radiotype === 'EXAM') {
                refetchExams();
            }
            // Simulate check marks calculation
            setTimeout(() => {
                setProcessBtnEnabled(true);
            }, 300);
        }
    }, [sectionId, classId, academicYearId, radiotype]);

    const handleSearch = async (formData: FormFields) => {
        setLoading(true);

        try {
            const payload = {
                ASMAY_Id: formData.asmaY_Id,
                ASMCL_Id: formData.asmcL_Id,
                ASMS_Id: formData.asmS_Id,
                EME_Id: formData.emE_Id || 0,
                radiotype: formData.radiotype,
                FMT_Id: formData.feeinstallmentcheckbox ? formData.FMT_Id : 0,
                TempGroupList: formData.feeGroupIds,
                feeinstallmentcheckbox: formData.feeinstallmentcheckbox
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockData = {
                datareport: MOCK_STUDENTS.map(student => ({
                    ...student,
                    // Add year/class/section info from form
                    asmaY_Year: academicYears?.data?.find((y: any) => y.asmaY_Id === formData.asmaY_Id)?.asmaY_Year || '2024-25',
                    asmcL_ClassName: MOCK_CLASSES.find(c => c.asmcL_Id === formData.asmcL_Id)?.asmcL_ClassName || 'Class',
                    asmC_SectionName: MOCK_SECTIONS.find(s => s.asmS_Id === formData.asmS_Id)?.asmC_SectionName || 'Section',
                    emE_ExamName: MOCK_EXAMS.find(e => e.emE_Id === formData.emE_Id)?.emE_ExamName || 'Exam'
                }))
            };

            if (isInitialLoad) {
                onSuccess?.(formData, mockData.datareport);
                setIsInitialLoad(false);
            } else {
                onRefresh?.(formData, mockData.datareport);
            }

            toast.success(`${mockData.datareport.length} students found`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to search students');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        reset({
            radiotype: 'EXAM',
            feeinstallmentcheckbox: false,
            SMSFLAG: false,
            EMAILFLAG: false,
            NOTIFYFLAG: false,
            feeGroupIds: []
        });
        setProcessBtnEnabled(false);
        setSearchTerm('');
    };

    const filteredFeeGroups = feeGroups.filter(group =>
        group.fmG_GroupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <form onSubmit={handleSubmit(handleSearch)} className="space-y-6">
            {/* Radio Buttons */}
            <div className="flex justify-center">
                <div className="inline-flex rounded-lg border p-1">
                    <Controller
                        control={control}
                        name="radiotype"
                        render={({ field }) => (
                            <>
                                <button
                                    type="button"
                                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${field.value === 'EXAM'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                                        }`}
                                    onClick={() => field.onChange('EXAM')}
                                >
                                    Exam Wise
                                </button>
                                <button
                                    type="button"
                                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${field.value === 'PROMOTION'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                                        }`}
                                    onClick={() => {
                                        field.onChange('PROMOTION');
                                        setValue('emE_Id', 0);
                                    }}
                                >
                                    Promotion
                                </button>
                            </>
                        )}
                    />
                </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    {/* Academic Year */}
                    <div>
                        <Label>Academic Year *</Label>
                        <Controller
                            control={control}
                            name="asmaY_Id"
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}
                                        disabled={academicYearLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Academic Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears?.data?.map((year: any) => (
                                                <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Class */}
                    <div>
                        <Label>Class *</Label>
                        <Controller
                            control={control}
                            name="asmcL_Id"
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}
                                        disabled={!academicYearId || classesLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes?.data?.map((cls: any) => (
                                                <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Section */}
                    <div>
                        <Label>Section *</Label>
                        <Controller
                            control={control}
                            name="asmS_Id"
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}
                                        disabled={!classId || sectionsLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections?.data?.map((sec: any) => (
                                                <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                    {sec.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Exam Name (only for Exam Wise) */}
                    <div>
                        <Label>Exam Name {radiotype === 'EXAM' && '*'}</Label>
                        <Controller
                            control={control}
                            name="emE_Id"
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}
                                        disabled={radiotype !== 'EXAM' || !sectionId || examsLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Exam Name" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {exams?.data?.map((exam: any) => (
                                                <SelectItem key={exam.emE_Id} value={String(exam.emE_Id)}>
                                                    {exam.emE_ExamName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Exclude Fee Defaulters */}
                    <div className="space-y-2">
                        <Controller
                            control={control}
                            name="feeinstallmentcheckbox"
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="feeinstallmentcheckbox"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label htmlFor="feeinstallmentcheckbox" className="font-medium">
                                        Exclude Fee Defaulters: *
                                    </Label>
                                </div>
                            )}
                        />
                    </div>

                    {/* Fee Term */}
                    <div>
                        <Label>Fee Term *</Label>
                        <Controller
                            control={control}
                            name="FMT_Id"
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}
                                        disabled={!feeInstallmentCheckbox}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Fee Term" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {feeTerms.map((term: any) => (
                                                <SelectItem key={term.fmT_Id} value={String(term.fmT_Id)}>
                                                    {term.fmT_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Fee Group Multi-select */}
                    <div>
                        <div className="mb-2">
                            <Label className="font-medium">Fee Group: *</Label>
                        </div>

                        <div className="border rounded-md p-2">
                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="w-full p-2 mb-2 border rounded"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={!feeInstallmentCheckbox}
                            />

                            {/* Fee Groups List */}
                            <div className="max-h-40 overflow-y-auto">
                                {filteredFeeGroups.map((group) => (
                                    <div key={group.fmG_Id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                                        <Controller
                                            control={control}
                                            name="feeGroupIds"
                                            render={({ field }) => (
                                                <Checkbox
                                                    id={`group-${group.fmG_Id}`}
                                                    checked={field.value?.includes(group.fmG_Id)}
                                                    onCheckedChange={(checked) => {
                                                        const updatedIds = checked
                                                            ? [...(field.value || []), group.fmG_Id]
                                                            : (field.value || []).filter((id: number) => id !== group.fmG_Id);
                                                        field.onChange(updatedIds);
                                                    }}
                                                    disabled={!feeInstallmentCheckbox}
                                                />
                                            )}
                                        />
                                        <Label htmlFor={`group-${group.fmG_Id}`} className="flex-1 cursor-pointer">
                                            {group.fmG_GroupName}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {errors.feeGroupIds && (
                            <FormError>{errors.feeGroupIds.message}</FormError>
                        )}
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 pt-4">
                <Button
                    type="submit"
                    disabled={loading || !isValid || !processBtnEnabled}
                    className="min-w-[120px]"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Searching...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </span>
                    )}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Cancel
                </Button>
            </div>
        </form>
    );
}