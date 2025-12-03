// app/exam/student-subject-mapping/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { Label } from '@/components/ui/extension/field'; // adjust if you use a different Label component
import { getSubjectGroupDropDownByYearCategoryList } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import { ISubject } from '@/types/exam/exam-module/report';

type FormValues = {
    asmaY_Id?: number; // Academic Year
    asmcL_Id?: number; // Class
    asmS_Id?: number; // Section
    emcA_Id?: number; // Category (Exam Category)
    eme_Id?: number; // Exam
    subject_group_id?: number; // Subject Group id
    Left_Flag?: boolean;
    Deactive_Flag?: boolean;
};
interface Subject {
    subjectId: number;
    subjectName: string;
}

export default function StudentSubjectMappingPage() {
    return <StudentSubjectMappingContent />;
}

function StudentSubjectMappingContent() {
    // react-hook-form
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

    // watch values for dependent loading
    const watchedAcademicYear = watch('asmaY_Id');
    const watchedClass = watch('asmcL_Id');
    const watchedCategory = watch('emcA_Id');

    // dropdown data stores
    const { data: academicDropdownData, isLoading: loadingAcademic } = useAcademicYearDropdown();
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string; emgR_Id?: number }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [categories, setCategories] = useState<{ emcA_Id: number; emcA_CategoryName: string }[]>([]);
    const [subjectGroups, setSubjectGroups] = useState<any[]>([]);

    // loading flags
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSG, setLoadingSG] = useState(false);

    // grid data & UI states
    const [students, setStudents] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isGridOpen, setIsGridOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const MI_Id = 30; // fixed MI_Id
    const FIXED_EMG_ID = 118; // fixed grade id

    // -------------------------
    // load academic years
    // -------------------------
    useEffect(() => {
        if (academicDropdownData?.data) {
            const yrs = academicDropdownData.data.map((y: any) => ({
                asmaY_Id: y.asmaY_Id,
                asmaY_Year: y.asmaY_Year
            }));
            setAcademicYears(yrs);
            if (yrs.length > 0 && !getValues('asmaY_Id')) {
                setValue('asmaY_Id', yrs[0].asmaY_Id);
            }
        }
    }, [academicDropdownData, setValue, getValues]);

    // -------------------------
    // load classes on academic year change
    // -------------------------
    useEffect(() => {
        const asmaY_Id = watchedAcademicYear;
        if (!asmaY_Id) {
            setClasses([]);
            setValue('asmcL_Id', undefined);
            return;
        }

        (async () => {
            setLoadingClasses(true);
            try {
                const { data } = await getClassDropDownByAcademicYearlist(asmaY_Id);
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

    // -------------------------
    // load sections on (academicYear + class) change
    // -------------------------
    useEffect(() => {
        const asmaY_Id = watchedAcademicYear;
        const asmcL_Id = watchedClass;

        if (!asmaY_Id || !asmcL_Id) {
            setSections([]);
            setValue('asmS_Id', undefined);
            return;
        }

        (async () => {
            setLoadingSections(true);
            try {
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(asmaY_Id, asmcL_Id);
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

    // -------------------------
    // load categories for selected academic year
    // -------------------------
    useEffect(() => {
        const asmaY_Id = watchedAcademicYear;
        if (!asmaY_Id) {
            setCategories([]);
            setValue('emcA_Id', undefined);
            return;
        }

        (async () => {
            setLoadingCategories(true);
            try {
                const { data: response } = await getCategoryDropDowByExamYearCategoryList(MI_Id, asmaY_Id);

                // ✅ Force it to always become an array (TypeScript safe)
                const cats: any[] = Array.isArray(response) ? response : [];

                // ✅ Now `.map()` is always safe
                const normalized = cats.map(c => ({
                    emcA_Id: c.emcA_Id ?? c.eyC_Id,
                    emcA_CategoryName: c.emcA_CategoryName ?? c.eyC_CategoryName,
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


    // -------------------------
    // load subject groups when category changes
    // -------------------------
    useEffect(() => {
        const asmaY_Id = watchedAcademicYear;
        const emcA_Id = watchedCategory;

        if (!asmaY_Id || !emcA_Id) {
            setSubjectGroups([]);
            setValue('subject_group_id', undefined);
            return;
        }

        (async () => {
            setLoadingSG(true);
            try {
                const data = await getSubjectGroupDropDownByYearCategoryList(asmaY_Id, emcA_Id);
                // function returns data array or { data: [] } depending on implementation; normalize:
                const groups = Array.isArray(data) ? data : (data?.data ?? data ?? []);
                console.log('groups', groups);
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

    // -------------------------
    // helper to transform API payload to grid format
    // -------------------------
    function transformApiDataToGrid(apiData: any) {
        if (!apiData || !apiData.students || !apiData.subjects) return { students: [], subjects: [] };

        const apiStudents: any[] = apiData.students;
        const apiSubjects: any[] = apiData.subjects;
        const mappedSubjects: any[] = apiData.mappedSubjects ?? [];
        const mappingByStudent = new Map<number, Set<number>>();
        for (const m of mappedSubjects) {
            const studentId = m.amsT_Id;
            const subId = m.ismS_Id;
            if (!mappingByStudent.has(studentId)) mappingByStudent.set(studentId, new Set<number>());
            mappingByStudent.get(studentId)!.add(subId);
        }

        const studentsGrid = apiStudents.map((st) => {
            const sid = st.amsT_Id;
            const row: any = {
                amsT_Id: st.amsT_Id,
                studentName: st.studentName ?? st.amsT_StudentName ?? st.name,
                amaY_RollNo: st.amaY_RollNo ?? st.rollNo,
                amsT_AdmNo: st.amsT_AdmNo ?? st.admNo ?? st.amsT_AdmNo
            };

            for (const subj of apiSubjects) {
                const key = subj.subjectId;
                const mappedSet = mappingByStudent.get(sid);
                row[key] = !!(mappedSet && mappedSet.has(subj.subjectId));
            }

            return row;
        });

        return {
            students: studentsGrid,
            subjects: apiSubjects.map((s) => ({
                subjectName: s.ismS_SubjectName,
                subjectId: s.ismS_Id,
            })),
        };

    }

    // -------------------------
    // handle search -> build params & call API
    // -------------------------
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

            const success = response?.success ? true : false;
            const data = response?.data ?? response;

            if (!success || !data) {
                toast.error(response?.message ?? 'Failed to fetch mapping data');
                setIsLoading(false);
                return;
            }

            const { students: resultStudents, subjects: resultSubjects } = transformApiDataToGrid(data);

            setStudents(resultStudents);
            setSubjects(resultSubjects);

            if (resultStudents.length === 0) {
                toast.info('No student mapping found');
            } else {
                setIsGridOpen(true);
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? 'Failed to fetch students for subject mapping');
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------
    // update mapping locally
    // -------------------------
    const updateStudentSubject = (studentIdentifier: number, subjectName: string, checked: boolean) => {
        setStudents((prev) =>
            prev.map((s) => (s.amsT_Id === studentIdentifier ? { ...s, [subjectName]: checked } : s))
        );
    };

    // -------------------------
    // prepare & save mapping (demo)
    // -------------------------
    const handleSave = async () => {
        const payloadMappings: { amsT_Id: number; ismS_Id: number }[] = [];

        for (const s of students) {
            for (const subj of subjects) {
                const key = subj.subjectId;
                if (s[key]) {
                    payloadMappings.push({
                        amsT_Id: s.amsT_Id,
                        ismS_Id: subj.subjectId
                    });
                }
            }
        }

        console.info('Prepared mapping payload (demo):', {
            MI_Id,
            ASMAY_Id: getValues('asmaY_Id'),
            ASMCL_Id: getValues('asmcL_Id'),
            ASMS_Id: getValues('asmS_Id'),
            EMCA_Id: getValues('emcA_Id'),
            mappings: payloadMappings
        });

        toast.success('Subject mapping prepared (check console). Implement API save when ready.');
    };

    // -------------------------
    // Render
    // -------------------------
    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="container mx-auto space-y-4">
                    <div className="rounded-md border bg-white p-4 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* LEFT */}
                            <div className="space-y-4 md:col-span-1">
                                <Controller
                                    control={control}
                                    name="asmaY_Id"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className="block text-sm font-medium text-slate-700 mb-1">
                                                Academic Year <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select Academic Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingAcademic ? (
                                                        <SelectItem value="loading">Loading...</SelectItem>
                                                    ) : (
                                                        academicYears.map((y) => (
                                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                                {y.asmaY_Year}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="emcA_Id"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className="block text-sm font-medium text-slate-700 mb-1">
                                                Exam Category <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))} disabled={loadingCategories}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingCategories ? (
                                                        <SelectItem value="loading">Loading...</SelectItem>
                                                    ) : (
                                                        categories.map((c) => (
                                                            <SelectItem key={c.emcA_Id} value={String(c.emcA_Id)}>
                                                                {c.emcA_CategoryName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="eme_Id"
                                    render={({ field }) => (
                                        <div>
                                            <Label className="block text-sm font-medium text-slate-700 mb-1">Exam</Label>
                                            <Select value={field.value !== undefined ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select Exam (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">Default (0)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* RIGHT */}
                            <div className="space-y-4 md:col-span-1">
                                <Controller
                                    control={control}
                                    name="asmcL_Id"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className="block text-sm font-medium text-slate-700 mb-1">
                                                Class <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))} disabled={!watchedAcademicYear || loadingClasses}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingClasses ? <SelectItem value="loading">Loading...</SelectItem> : classes.map((c) => (
                                                        <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                            {c.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="asmS_Id"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className="block text-sm font-medium text-slate-700 mb-1">
                                                Section <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))} disabled={!watchedClass || loadingSections}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select Section" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSections ? <SelectItem value="loading">Loading...</SelectItem> : sections.map((s) => (
                                                        <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                            {s.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="subject_group_id"
                                    rules={{ required: 'Subject Group is required' }}
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label className="block text-sm font-medium text-slate-700 mb-1">
                                                Subject Group <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))} disabled={!watchedCategory || loadingSG}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder={loadingSG ? 'Loading...' : 'Select Subject Group'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSG ? <SelectItem value="loading">Loading...</SelectItem> : subjectGroups.map((g: any) => (
                                                        <SelectItem key={g.emG_Id} value={String(g.emG_Id)}>
                                                            {g.emG_GroupName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <div className="flex flex-wrap gap-8 mt-4">
                                    <Controller
                                        control={control}
                                        name="Left_Flag"
                                        render={({ field }) => (
                                            <label className="flex items-center gap-2">
                                                <Checkbox checked={!!field.value} onCheckedChange={(c) => field.onChange(!!c)} />
                                                <span className="text-sm">Include Left Students</span>
                                            </label>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="Deactive_Flag"
                                        render={({ field }) => (
                                            <label className="flex items-center gap-2">
                                                <Checkbox checked={!!field.value} onCheckedChange={(c) => field.onChange(!!c)} />
                                                <span className="text-sm">Include Deactive Students</span>
                                            </label>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="mt-6 flex justify-center">
                            <div className="w-fit">
                                <Button type="button" className="px-8 py-2 shadow-lg" onClick={handleSearch} isLoading={isLoading}>
                                    Search
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    {isGridOpen && (
                        <CollapsibleSection defaultOpen variant="default" size="lg" className="shadow-lg">
                            <StudentSubjectMappingTable
                                students={students}
                                subjects={subjects}
                                onUpdateMapping={updateStudentSubject}
                                isloading={isLoading}
                            />

                            <div className="p-4 flex justify-end gap-3 border-t">
                                <Button variant="outline" onClick={() => setIsGridOpen(false)}>Cancel</Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
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
