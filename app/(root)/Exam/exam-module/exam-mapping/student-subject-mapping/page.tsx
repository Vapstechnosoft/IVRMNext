// app/exam/student-subject-mapping/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getCategoryDropDowByExamYearCategoryList } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import { getStudentsForSubjectMapping } from '@/server/exam/exam-module/exam-mapping/student-subject-mapping';
import { toast } from 'sonner';
import StudentSubjectMappingTable from './_components/student-mapping-table';
import { Label } from '@/components/ui/extension/field';
import { getSubjectGroupDropDownByYearCategoryList } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';

type FormValues = {
    asmaY_Id?: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    emcA_Id?: number;
    eme_Id?: number;
    subject_group_id?: number;
    Left_Flag?: boolean;
    Deactive_Flag?: boolean;
};

interface Subject {
    id: number;
    name: string;
}

interface Student {
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_AdmNo: string;
    amaY_RollNo: number;
    sub_list: { id: number; name: string; abc: boolean }[];
    sub_list_view: { id: number; name: string; abc: boolean }[];
}

export default function StudentSubjectMappingPage() {
    return <StudentSubjectMappingContent />;
}

function StudentSubjectMappingContent() {
    const methods = useForm<FormValues>({
        defaultValues: {
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            emcA_Id: undefined,
            eme_Id: 0,
            subject_group_id: undefined,
            Left_Flag: true,
            Deactive_Flag: true
        }
    });

    const { control, watch, setValue, getValues } = methods;

    const watchedAcademicYear = watch('asmaY_Id');
    const watchedClass = watch('asmcL_Id');
    const watchedCategory = watch('emcA_Id');

    const {
        data: academicYear,
        isLoading: academicYearLoading,
        error: academicYearError
    } = useAcademicYearDropdown();

    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [categories, setCategories] = useState<{ emcA_Id: number; emcA_CategoryName: string }[]>([]);
    const [subjectGroups, setSubjectGroups] = useState<any[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSG, setLoadingSG] = useState(false);

    const [students, setStudents] = useState<Student[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isGridOpen, setIsGridOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const MI_Id = 30;
    const FIXED_EMG_ID = 118;

    // Set default academic year
    useEffect(() => {
        if (academicYear?.data && academicYear.data.length > 0 && !getValues('asmaY_Id')) {
            setValue('asmaY_Id', academicYear.data[0].asmaY_Id);
        }
    }, [academicYear, setValue, getValues]);

    // Load classes
    useEffect(() => {
        if (!watchedAcademicYear) {
            setClasses([]);
            setValue('asmcL_Id', undefined);
            return;
        }

        (async () => {
            setLoadingClasses(true);
            try {
                const { data } = await getClassDropDownByAcademicYearlist(watchedAcademicYear);
                setClasses(Array.isArray(data) ? data : []);
                setValue('asmcL_Id', undefined);
                setValue('asmS_Id', undefined);
            } catch (err: any) {
                console.error(err);
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchedAcademicYear, setValue]);

    // Load sections
    useEffect(() => {
        if (!watchedAcademicYear || !watchedClass) {
            setSections([]);
            setValue('asmS_Id', undefined);
            return;
        }

        (async () => {
            setLoadingSections(true);
            try {
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(watchedAcademicYear, watchedClass);
                setSections(Array.isArray(data) ? data : []);
                setValue('asmS_Id', undefined);
            } catch (err: any) {
                console.error(err);
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchedAcademicYear, watchedClass, setValue]);

    // Load categories
    useEffect(() => {
        if (!watchedAcademicYear) {
            setCategories([]);
            setValue('emcA_Id', undefined);
            return;
        }

        (async () => {
            setLoadingCategories(true);
            try {
                const { data: response } = await getCategoryDropDowByExamYearCategoryList(MI_Id, watchedAcademicYear);
                const cats: any[] = Array.isArray(response) ? response : [];
                const normalized = cats.map((c) => ({
                    emcA_Id: c.emcA_Id ?? c.eyC_Id,
                    emcA_CategoryName: c.emcA_CategoryName ?? c.eyC_CategoryName
                }));
                setCategories(normalized);
                setValue('emcA_Id', undefined);
                setValue('subject_group_id', undefined);
            } catch (err: any) {
                console.error(err);
                toast.error(err?.message ?? 'Failed to load categories');
            } finally {
                setLoadingCategories(false);
            }
        })();
    }, [watchedAcademicYear, setValue]);

    // Load subject groups
    useEffect(() => {
        if (!watchedAcademicYear || !watchedCategory) {
            setSubjectGroups([]);
            setValue('subject_group_id', undefined);
            return;
        }

        (async () => {
            setLoadingSG(true);
            try {
                const data = await getSubjectGroupDropDownByYearCategoryList(watchedAcademicYear, watchedCategory);
                const groups = Array.isArray(data) ? data : data?.data ?? [];
                setSubjectGroups(groups);
                setValue('subject_group_id', undefined);
            } catch (err: any) {
                console.error(err);
                toast.error(err?.message ?? 'Failed to load subject groups');
            } finally {
                setLoadingSG(false);
            }
        })();
    }, [watchedAcademicYear, watchedCategory, setValue]);

    // Handle search
    const handleSearch = async () => {
        const form = getValues();

        if (!form.asmaY_Id || !form.asmcL_Id || !form.asmS_Id || !form.emcA_Id) {
            toast.info('Please select Academic Year, Class, Section and Category');
            return;
        }

        setIsLoading(true);
        setIsGridOpen(false);

        try {
            const params = {
                MI_Id,
                ASMAY_Id: form.asmaY_Id,
                ASMCL_Id: form.asmcL_Id,
                ASMS_Id: form.asmS_Id,
                EME_Id: form.eme_Id ?? 0,
                EMCA_Id: form.emcA_Id,
                Left_Flag: form.Left_Flag ?? true,
                Deactive_Flag: form.Deactive_Flag ?? true,
                EMG_Id: FIXED_EMG_ID
            };

            const response = await getStudentsForSubjectMapping(params);
            const success = response?.success ?? false;
            const data = Array.isArray(response?.data) ? response?.data : [];

            if (!success || data?.length === 0) {
                toast.error(response?.message ?? 'No data found');
                setStudents([]);
                setSubjects([]);
                setIsLoading(false);
                return;
            }

            // Extract subjects from first student
            const firstStudent = data[0];
            const subjectList = firstStudent.sub_list_view ?? firstStudent.sub_list ?? [];

            // Transform subjects
            const transformedSubjects = subjectList.map((s: any) => ({
                id: s.id,
                name: s.name
            }));

            setStudents(data);
            setSubjects(transformedSubjects);
            setIsGridOpen(true);

        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? 'Failed to fetch students');
        } finally {
            setIsLoading(false);
        }
    };

    // Update student-subject mapping
    const updateStudentSubject = (studentId: number, subjectId: number, checked: boolean) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.amsT_Id === studentId
                    ? {
                        ...student,
                        sub_list: student.sub_list.map((sub) =>
                            sub.id === subjectId ? { ...sub, abc: checked } : sub
                        ),
                        sub_list_view: student.sub_list_view.map((sub) =>
                            sub.id === subjectId ? { ...sub, abc: checked } : sub
                        )
                    }
                    : student
            )
        );
    };

    // Save mapping
    const handleSave = async () => {
        const form = getValues();
        const payloadMappings: { amsT_Id: number; ismS_Id: number }[] = [];

        for (const student of students) {
            for (const subject of student.sub_list) {
                if (subject.abc) {
                    payloadMappings.push({
                        amsT_Id: student.amsT_Id,
                        ismS_Id: subject.id
                    });
                }
            }
        }

        console.info('Prepared mapping payload:', {
            MI_Id,
            ASMAY_Id: form.asmaY_Id,
            ASMCL_Id: form.asmcL_Id,
            ASMS_Id: form.asmS_Id,
            EMCA_Id: form.emcA_Id,
            mappings: payloadMappings
        });

        toast.success(`Mapping prepared for ${payloadMappings.length} records. Implement API save.`);
    };

    return (
        <FormProvider {...methods}>
            <div className='min-h-screen bg-gray-50 p-4'>
                <div className='container mx-auto space-y-4'>
                    <div className='rounded-md border bg-white p-4 shadow-sm'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* LEFT */}
                            <div className='space-y-4'>
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className='block text-sm font-medium text-slate-700 mb-1'>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(v) => field.onChange(Number(v))}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYearLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : academicYearError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading
                                                        </SelectItem>
                                                    ) : (
                                                        academicYear?.data?.map((item) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className='text-red-500 text-xs mt-1'>{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='emcA_Id'
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className='block text-sm font-medium text-slate-700 mb-1'>
                                                Exam Category <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                disabled={loadingCategories}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Category' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingCategories ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        categories.map((c) => (
                                                            <SelectItem key={c.emcA_Id} value={String(c.emcA_Id)}>
                                                                {c.emcA_CategoryName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className='text-red-500 text-xs mt-1'>{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='eme_Id'
                                    render={({ field }) => (
                                        <div>
                                            <Label className='block text-sm font-medium text-slate-700 mb-1'>Exam</Label>
                                            <Select
                                                value={field.value !== undefined ? String(field.value) : undefined}
                                                onValueChange={(v) => field.onChange(Number(v))}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Exam (optional)' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='0'>Default (0)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* RIGHT */}
                            <div className='space-y-4'>
                                <Controller
                                    control={control}
                                    name='asmcL_Id'
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className='block text-sm font-medium text-slate-700 mb-1'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                disabled={!watchedAcademicYear || loadingClasses}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingClasses ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        classes.map((c) => (
                                                            <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                                {c.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className='text-red-500 text-xs mt-1'>{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='asmS_Id'
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className='block text-sm font-medium text-slate-700 mb-1'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                disabled={!watchedClass || loadingSections}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSections ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        sections.map((s) => (
                                                            <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                                {s.asmC_SectionName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className='text-red-500 text-xs mt-1'>{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='subject_group_id'
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className='block text-sm font-medium text-slate-700 mb-1'>Subject Group</Label>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                disabled={!watchedCategory || loadingSG}>
                                                <SelectTrigger className='h-10'>
                                                    <SelectValue placeholder={loadingSG ? 'Loading...' : 'Select Subject Group'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSG ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        subjectGroups.map((g: any) => (
                                                            <SelectItem key={g.emG_Id} value={String(g.emG_Id)}>
                                                                {g.emG_GroupName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className='text-red-500 text-xs mt-1'>{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <div className='flex flex-wrap gap-8 mt-4'>
                                    <Controller
                                        control={control}
                                        name='Left_Flag'
                                        render={({ field }) => (
                                            <label className='flex items-center gap-2'>
                                                <Checkbox checked={!!field.value} onCheckedChange={(c) => field.onChange(!!c)} />
                                                <span className='text-sm'>Include Left Students</span>
                                            </label>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name='Deactive_Flag'
                                        render={({ field }) => (
                                            <label className='flex items-center gap-2'>
                                                <Checkbox checked={!!field.value} onCheckedChange={(c) => field.onChange(!!c)} />
                                                <span className='text-sm'>Include Deactive Students</span>
                                            </label>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className='w-fit mt-6 flex justify-center'>
                            <Button type='button' className='px-8 py-2 shadow-lg' onClick={handleSearch} disabled={isLoading}>
                                {isLoading ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                    </div>

                    {/* Grid */}
                    {isGridOpen && (
                        <CollapsibleSection defaultOpen variant='default' size='lg' className='shadow-lg'>
                            <StudentSubjectMappingTable
                                students={students}
                                subjects={subjects}
                                onUpdateMapping={updateStudentSubject}
                                isloading={isLoading}
                            />

                            <div className='p-4 flex justify-end gap-3 border-t'>
                                <Button variant='outline' onClick={() => setIsGridOpen(false)}>
                                    Cancel
                                </Button>
                                <Button className='bg-green-600 hover:bg-green-700' onClick={handleSave}>
                                    Save Mapping
                                </Button>
                            </div>
                        </CollapsibleSection>
                    )}
                </div>
            </div>
        </FormProvider>
    );
}