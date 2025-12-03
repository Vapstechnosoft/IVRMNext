'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { hallTicketGenerationSchema } from '@/schemas/exam/exam-module/exam-mapping';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist,
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { set } from 'date-fns';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof hallTicketGenerationSchema>;

const mI_Id = 30; // adjust if dynamic

export default function HallTicketGenerationForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(hallTicketGenerationSchema),
        mode: 'all',
        defaultValues: {
            mI_Id,
            asmaY_Id: 0,
            asmcL_Id: 0,
            sectionList: [],
            emE_Id: 0,
            prefixNo: '',
            startingNo: '',
            increment: '',
            prefixNoFlag: 'N'
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    // Dropdown data
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);

    // Loading states
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    const {
        data: academicYear,
        isLoading: academicYearLoading,
        error: academicYearError,
    } = useAcademicYearDropdown();

    // Watchers
    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSections = useWatch({ control, name: 'sectionList' });
    //const prefixNoFlag = useWatch({ control, name: 'prefixNoFlag' });

    // Load Academic Years + Auto-select current (first)
    useEffect(() => {
        if (academicYearError) {
            toast.error('Failed to load academic years');
            return;
        }
        if (academicYear?.data) {
            const years = academicYear.data.map((i: any) => ({
                asmaY_Id: i.asmaY_Id,
                asmaY_Year: i.asmaY_Year
            }));
            if (years.length > 0 && !selectedYear) {
                setValue('asmaY_Id', years[0].asmaY_Id);
            }
        }
    }, [academicYear, academicYearError, setValue, selectedYear]);

    // ---------- Load Classes ----------
    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(selectedYear);
                setClasses(Array.isArray(data) ? data : []);
                setValue('sectionList', []);
                setValue('emE_Id', 0);
                setExams([]);
                setLoadingClasses(false);
            } catch {
                toast.error('Failed to load classes');
            }
        })();
    }, [selectedYear, setValue]);

    // ---------- Load Sections ----------
    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                setSections([]);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                setSections(Array.isArray(data) ? data : []);
                setValue('emE_Id', 0);
                setLoadingSections(false);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // ---------- Load Exams ----------
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSections.length) return;
        (async () => {
            setLoadingExams(true);
            const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSections[0].asmS_Id);
            const safeData = Array.isArray(data) ? data : [];
            setExams(safeData);
            if (safeData.length == 0) {
                toast.info('No exams are mapped for your selections');
            }
            setValue('emE_Id', 0);
            setLoadingExams(false);

        })();
    }, [selectedYear, selectedClass, selectedSections, setValue]);

    const onSubmit = async (data: FormFields) => {
        try {
            // Call your actual save/generate API here
            // await generateHallTickets(data);
            console.info(data);
            toast.success('Hall tickets generated successfully!');
            onSuccess?.();
            reset();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to generate hall tickets');
        }
    };

    return (
        <div className="w-full rounded-2xl bg-white p-8 shadow-lg">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* LEFT COLUMN */}
                        <div className="space-y-6">
                            {/* Academic Year */}
                            <Controller
                                control={control}
                                name="asmaY_Id"
                                render={({ field, fieldState }) => (
                                    <div className="flex items-center gap-4">
                                        <Label className="w-40 text-right">
                                            Academic Year <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex-1">
                                            <Select
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYearLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading Academic Year...
                                                        </SelectItem>
                                                    ) : academicYearError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading Academic Year
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
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />

                            {/* Class - Single Select */}
                            <Controller
                                control={control}
                                name="asmcL_Id" // changed from classList to classId for single selection
                                render={({ field, fieldState }) => (
                                    <div className="flex items-center gap-4">
                                        <Label className="w-40 text-right">
                                            Class <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex-1">
                                            <Select
                                                disabled={!selectedYear || loadingClasses}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {!selectedYear
                                                        ? 'First select Academic Year'
                                                        : loadingClasses
                                                            ? 'Loading classes...'
                                                            : classes.map((c) => (
                                                                <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                                    {c.asmcL_ClassName}
                                                                </SelectItem>
                                                            ))}

                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />


                            {/* Section - Multi Select */}
                            <Controller
                                control={control}
                                name="sectionList"
                                render={({ field, fieldState }) => (
                                    <div className="flex items-start gap-4">
                                        <Label className="w-40 text-right pt-2">
                                            Section <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex-1">
                                            <CustomMultiSelectBox
                                                options={sections.map(s => ({ label: s.asmC_SectionName, value: String(s.asmS_Id) }))}
                                                value={field.value?.map((s: { asmS_Id: any; }) => String(s.asmS_Id)) || []}
                                                onChange={(vals) =>
                                                    field.onChange(vals.map(id => ({ asmS_Id: Number(id) })))
                                                }
                                                disabled={!selectedYear || sections.length === 0}
                                                height="200px"
                                                isSearchRequired
                                                isLoading={loadingSections}
                                                error={fieldState.error?.message}
                                            />
                                        </div>
                                    </div>
                                )}
                            />

                            {/* Exam Name */}
                            <Controller
                                control={control}
                                name="emE_Id"
                                render={({ field, fieldState }) => (
                                    <div className="flex items-center gap-4">
                                        <Label className="w-40 text-right">
                                            Exam Name <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex-1">
                                            <Select
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Exam' />
                                                </SelectTrigger>
                                                <SelectContent>

                                                    {!selectedYear
                                                        ? <div>select Academic Year</div> // <div className="text-red-500">First select Academic Year</div>
                                                        : !selectedClass
                                                            ? <div className="text-red-500">select Class</div>
                                                            : selectedSections.length === 0
                                                                ? ' select Section'
                                                                : loadingExams
                                                                    ? 'Loading exams...'
                                                                    : exams.map((e) => (
                                                                        <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                                                            {e.emE_ExamName}
                                                                        </SelectItem>
                                                                    ))}

                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            {/* Prefix */}
                            <div className="flex items-center gap-4">
                                <Label className="w-40 text-right">Prefix</Label>
                                <div className="flex-1">
                                    <Input placeholder="Enter Prefix" className="w-full" />
                                </div>
                            </div>

                            {/* Starting No */}
                            <Controller
                                control={control}
                                name="startingNo"
                                render={({ field, fieldState }) => (
                                    <div className="flex items-center gap-4">
                                        <Label className="w-40 text-right">
                                            Starting No.notes <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex-1">
                                            <Input
                                                {...field}
                                                placeholder="Enter Starting No."
                                                className="w-full"
                                            />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />

                            {/* Increment */}
                            <Controller
                                control={control}
                                name="increment"
                                render={({ field, fieldState }) => (
                                    <div className="flex items-center gap-4">
                                        <Label className="w-40 text-right">
                                            Increment <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex-1">
                                            <Input
                                                {...field}
                                                placeholder="Enter Increment"
                                                className="w-full"
                                            />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />

                            {/* PrefixNo Yes/No */}
                            <div className="flex items-center gap-4">
                                <Label className="w-40 text-right">PrefixNo.</Label>
                                <div className="flex items-center gap-6">
                                    <Controller
                                        control={control}
                                        name="prefixNoFlag"
                                        render={({ field }) => (
                                            <>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <Checkbox
                                                        checked={field.value === 'Y'}
                                                        onCheckedChange={(checked) => field.onChange(checked ? 'Y' : 'N')}
                                                    />
                                                    <span>Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <Checkbox
                                                        checked={field.value === 'N'}
                                                        onCheckedChange={(checked) => field.onChange(checked ? 'N' : 'Y')}
                                                    />
                                                    <span>No</span>
                                                </label>
                                                <Input
                                                    placeholder="Enter Prefix No."
                                                    value={field.value === 'Y' ? methods.getValues('prefixNo') : ''}
                                                    onChange={(e) => methods.setValue('prefixNo', e.target.value)}
                                                    disabled={field.value !== 'Y'}
                                                    className="w-48 transition-opacity"
                                                />
                                            </>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="w-fit flex justify-center gap-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => reset()}
                            className="min-w-[120px]"
                        >
                            CANCEL
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            disabled={isSubmitting}
                            className="w-fit"
                        >
                            {isSubmitting ? 'Generating...' : 'SAVE AND GENERATE'}
                        </Button>

                    </div>
                </form>
            </FormProvider>
        </div>
    );
}