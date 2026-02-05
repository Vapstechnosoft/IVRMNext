'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterCategoryClassMapping } from '@/hooks/exam/exammodule/usemasters';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { categoryClassMappingSchema } from '@/schemas/exam/exam-module/masters';
import {
    addOrUpdateCategoryClassMapping,
    getCategories,
    getClassMappedSections,
    getClasses
} from '@/server/exam/exam-module/masters/category-class-mapping';
import type { ICategory, IClass } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof categoryClassMappingSchema.addOrUpdate>;

interface AddCategoryClassFormProps {
    onSuccess?: () => void;
    initialData?: FormFields;
}

export default function AddCategoryClassForm({ onSuccess, initialData }: AddCategoryClassFormProps) {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    const tableRef = useRef<HTMLDivElement>(null);
    const { data: academicYear, isLoading: academicYearLoading, error: academicYearError } = useAcademicYearDropdown();
    // local list that holds added mappings (rows)
    const academicYears = academicYear?.data ? academicYear.data : [];

    const [mappingList, setMappingList] = useState<
        {
            asmaY_Id: number;
            emcA_Id: number;
            asmcL_Id: number;
            section_list: {
                asmC_SectionName: any;
                asmS_Id: number;
            }[];
        }[]
    >([]);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const { refetchAll } = useMasterCategoryClassMapping();

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(categoryClassMappingSchema.addOrUpdate),
        defaultValues: initialData || {
            mI_Id: 30, // fixed from payload
            emcA_Id: 0,
            ecaC_Id: 0,
            asmaY_Id: undefined,
            asmcL_Id: 0,
            section_list: []
        }
    });

    const watchedYear = watch('asmaY_Id');
    const watchedClass = watch('asmcL_Id');
    const watchedCategory = watch('emcA_Id');

    // ---------- Fetch categories & classes ----------
    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const { data: cats } = await getCategories();
                const { data: cls } = await getClasses();
                setCategories(Array.isArray(cats) ? cats : []);
                setClasses(Array.isArray(cls) ? cls : []);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load dropdowns');
            }
        }
        fetchDropdowns();
    }, []);

    // ---------- Fetch sections based on year + class ----------
    useEffect(() => {
        if (watchedYear && watchedClass) {
            async function fetchSections() {
                try {
                    setLoadingSections(true);
                    const res = await getClassMappedSections(watchedYear, watchedClass);
                    const sectionData = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

                    setSections(sectionData);
                    if (sectionData.length === 0) {
                        toast.info('No sections are mapped for your selections');
                    }
                } catch (err: any) {
                    toast.error(err.message || 'Failed to load sections');
                } finally {
                    setLoadingSections(false);
                }
            }
            fetchSections();
        } else {
            setSections([]);
            setValue('section_list', []);
        }
    }, [watchedYear, watchedClass, initialData, setValue]);

    // ---------- When user picks a class (or changes year/category) check mappingList for existing entry ----------
    // If existing mapping exists for the same year+category+class -> pre-select its sections
    useEffect(() => {
        if (!watchedYear || !watchedCategory || !watchedClass) {
            return;
        }

        // find mapping in local list
        const found = mappingList.find(
            (m) =>
                Number(m.asmaY_Id) === Number(watchedYear) &&
                Number(m.emcA_Id) === Number(watchedCategory) &&
                Number(m.asmcL_Id) === Number(watchedClass)
        );

        if (found) {
            // convert to actual section objects available in `sections` so CustomMultiSelectBox value mapping works
            const selected = sections.filter((s) => found.section_list.some((sel) => sel.asmS_Id === s.asmS_Id));
            setValue(
                'section_list',
                selected.map((s) => ({ asmS_Id: s.asmS_Id }))
            );
        } else {
            // No saved mapping in local list: clear selected sections (keeps sections options)
            setValue('section_list', []);
        }
    }, [watchedYear, watchedCategory, watchedClass, mappingList, sections, setValue]);

    // ---------- Local ADD / UPDATE / DELETE handlers ----------
    const handleAddOrUpdate = () => {
        const year = Number(watch('asmaY_Id') || 0);
        const cat = Number(watch('emcA_Id') || 0);
        const cls = Number(watch('asmcL_Id') || 0);
        const secs = (watch('section_list') || []) as { asmS_Id: number; asmC_SectionName: string }[];

        if (!year || !cat || !cls || secs.length === 0) {
            toast.error('All fields are required to add/update a mapping');
            return;
        }

        const newEntry = {
            asmaY_Id: year,
            emcA_Id: cat,
            asmcL_Id: cls,
            section_list: secs.map((s) => ({
                asmS_Id: Number(s.asmS_Id),
                asmC_SectionName: s.asmC_SectionName
            }))
        };

        if (editIndex !== null) {
            // ✔ UPDATE existing row inside update modal
            setMappingList((prev) => {
                const updated = [...prev];
                updated[editIndex] = newEntry;
                return updated;
            });

            toast.info('Mapping updated');
        } else {
            // ✔ ADD or replace if combination already exists
            const existingIndex = mappingList.findIndex(
                (m) => Number(m.asmaY_Id) === year && Number(m.emcA_Id) === cat && Number(m.asmcL_Id) === cls
            );

            if (existingIndex !== -1) {
                setMappingList((prev) => {
                    const updated = [...prev];
                    updated[existingIndex] = newEntry;
                    return updated;
                });
                toast.info('Existing mapping updated');
            } else {
                setMappingList((prev) => [...prev, newEntry]);
                toast.success('Mapping added');
            }
        }

        // ❌ DO NOT reset class in update form
        // In update page: keep user’s selected class & sections stable

        setEditIndex(null);
        setTimeout(scrollToBottom, 50);
        setValue('section_list', []);
        setValue('asmcL_Id', 0);
        setSections([]);
    };
    useEffect(() => {
        if (mappingList.length > 0) {
            tableRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mappingList]); // <-- Watch this

    const handleEdit = (index: number) => {
        const row = mappingList[index];
        if (!row) return;

        setEditIndex(index);

        // set dropdowns to the row values
        setValue('asmaY_Id', Number(row.asmaY_Id));
        setValue('emcA_Id', Number(row.emcA_Id));
        setValue('asmcL_Id', Number(row.asmcL_Id));

        // ensure sections for that class are fetched first. If sections already include needed ones, set them.
        const selected = sections.filter((s) => row.section_list.some((sel) => sel.asmS_Id === s.asmS_Id));
        setValue(
            'section_list',
            selected.map((s) => ({ asmS_Id: s.asmS_Id, asmC_SectionName: s.asmC_SectionName }))
        );
    };

    const handleDelete = (index: number) => {
        setMappingList((prev) => prev.filter((_, i) => i !== index));
        // if we're editing the deleted row, cancel edit
        if (editIndex === index) setEditIndex(null);
        toast.info('Mapping removed');
    };

    // ---------- FINAL SAVE (submit all mappings) ----------
    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            if (mappingList.length === 0) {
                toast.error('Add at least one mapping before saving');
                return;
            }

            // FINAL PAYLOAD IN REQUIRED FORMAT
            const payload = {
                MI_Id: 30,
                ECAC_Id: 0, // always 0 as per your requirement
                YearClassCategory: mappingList.map((m) => ({
                    ASMAY_Id: Number(m.asmaY_Id),
                    ASMCL_Id: Number(m.asmcL_Id),
                    EMCA_Id: Number(m.emcA_Id),
                    sections: m.section_list.map((s) => ({
                        ASMS_Id: Number(s.asmS_Id)
                    }))
                }))
            };

            const res = await addOrUpdateCategoryClassMapping(payload);

            if (res?.success) {
                toast.success(res.message || 'Saved successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(res?.message || 'Failed to save mappings');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to save mapping');
        }
    };

    const scrollToBottom = () => {
        if (tableRef.current) {
            tableRef.current.scrollTop = tableRef.current.scrollHeight;
        }
    };

    // ---------- JSX ----------
    return (
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* LEFT SIDE */}
            <div className='space-y-4'>
                {/* Academic Year */}
                <div className='flex flex-col gap-1'>
                    <span className='font-small'>
                        Academic Year <span className='text-red-600'>*</span>
                    </span>

                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select
                                key={field.value}
                                value={!field.value ? '' : String(field.value)}
                                onValueChange={(val) => field.onChange(Number(val))}
                                disabled={mappingList.length > 0 && field.value !== 0}>
                                <SelectTrigger id='asmaY_Id'>
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
                        )}
                    />

                    {errors.asmaY_Id && <p className='text-red-600 text-sm'>{errors.asmaY_Id.message}</p>}
                </div>

                {/* Category */}
                <div className='flex flex-col gap-1'>
                    <span className='font-small'>
                        Category <span className='text-red-600'>*</span>
                    </span>

                    <Controller
                        control={control}
                        name='emcA_Id'
                        render={({ field }) => (
                            <Select
                                key={field.value}
                                value={field.value === 0 ? '' : String(field.value)}
                                onValueChange={(val) => field.onChange(Number(val))}
                                disabled={mappingList.length > 0 && field.value !== 0}>
                                <SelectTrigger id='emcA_Id'>
                                    <SelectValue placeholder='Select Category' />
                                </SelectTrigger>

                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.emcA_Id} value={String(cat.emcA_Id)}>
                                            {cat.emcA_CategoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.emcA_Id && <p className='text-red-600 text-sm'>{errors.emcA_Id.message}</p>}
                </div>

                {/* Class */}
                <div className='flex flex-col gap-1'>
                    <span className='font-small'>
                        Class <span className='text-red-600'>*</span>
                    </span>

                    <Controller
                        control={control}
                        name='asmcL_Id'
                        render={({ field }) => (
                            <Select
                                key={field.value}
                                value={field.value === 0 ? '' : String(field.value)}
                                onValueChange={(val) => field.onChange(Number(val))}>
                                <SelectTrigger id='asmcL_Id'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>

                                <SelectContent>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                            {cls.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />

                    {errors.asmcL_Id && <p className='text-red-600 text-sm'>{errors.asmcL_Id.message}</p>}
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className='space-y-2'>
                <span className='font-medium'>
                    Sections <span className='text-red-600'>*</span>
                </span>

                <Controller
                    control={control}
                    name='section_list'
                    render={({ field }) =>
                        loadingSections ? (
                            <p>Loading sections...</p>
                        ) : sections.length ? (
                            <CustomMultiSelectBox
                                options={sections.map((section) => ({
                                    label: section.asmC_SectionName,
                                    value: section.asmS_Id.toString()
                                }))}
                                value={field.value?.map((s) => String(s.asmS_Id)) ?? []}
                                onChange={(vals) => {
                                    const selected = sections
                                        .filter((s) => vals.includes(s.asmS_Id.toString()))
                                        .map((s) => ({ asmS_Id: s.asmS_Id, asmC_SectionName: s.asmC_SectionName }));

                                    field.onChange(selected);
                                }}
                                isSearchRequired
                                error={errors.section_list?.message}
                            />
                        ) : (
                            <p className='text-gray-500'>Select Academic Year, Category, and Class to load sections</p>
                        )
                    }
                />

                {errors.section_list && <p className='text-red-600 text-sm'>{errors.section_list.message}</p>}
            </div>

            {/* ADD / CLEAR Buttons (span full width) */}
            <div className='flex w-fit items-center justify-center gap-3 md:col-span-2'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                        // Reset only class + sections but keep year & category
                        if (mappingList.length > 0) {
                            setValue('asmcL_Id', 0);
                            setValue('section_list', []);
                            setValue('ecaC_Id', 0);
                            setValue('asmcL_Id', 0);
                            setSections([]);
                            setEditIndex(null);
                        }
                        else {
                            setValue('asmaY_Id', 0);
                            setValue('emcA_Id', 0);
                            setValue('asmcL_Id', 0);
                            setValue('section_list', []);
                            setValue('ecaC_Id', 0);
                            setValue('asmcL_Id', 0);
                            setSections([]);
                            setEditIndex(null);
                        }

                    }}>
                    <X className='h-4 w-4 text-destructive' />
                    CLEAR
                </Button>
                <Button type='button' onClick={handleAddOrUpdate}>
                    {editIndex !== null ? 'Update' : '+ Add Mapping'}
                </Button>
            </div>

            {mappingList.length > 0 && (
                <>
                    <div className='col-span-2 mt-4 rounded border p-4' ref={tableRef}>
                        <h3 className='mb-2 font-semibold text-lg tracking-tight'>Details</h3>

                        <div className='overflow-x-auto'>
                            <table className='min-w-full border-collapse border'>
                                <thead>
                                    <tr>
                                        <th className='border p-2'>SLNO</th>
                                        <th className='border p-2'>Academic Year</th>
                                        <th className='border p-2'>Category</th>
                                        <th className='border p-2'>Class</th>
                                        <th className='border p-2'>Sections</th>
                                        <th className='border p-2'>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {mappingList.length === 0 ? (
                                        <tr>
                                            <td className='border p-4 text-center' colSpan={6}>
                                                No mappings added yet
                                            </td>
                                        </tr>
                                    ) : (
                                        mappingList.map((m, i) => (
                                            <tr key={i} className='even:bg-gray-50'>
                                                <td className='border p-2 text-center'>{i + 1}</td>
                                                <td className='border p-2 text-center'>
                                                    {
                                                        // academicYears stores ids as string in formatted list
                                                        academicYears.find((y) => String(y.asmaY_Id) === String(m.asmaY_Id))?.asmaY_Year ||
                                                        String(m.asmaY_Id)
                                                    }
                                                </td>
                                                <td className='border p-2 text-center'>
                                                    {categories.find((c) => Number(c.emcA_Id) === Number(m.emcA_Id))?.emcA_CategoryName ||
                                                        String(m.emcA_Id)}
                                                </td>
                                                <td className='border p-2 text-center'>
                                                    {classes.find((c) => Number(c.asmcL_Id) === Number(m.asmcL_Id))?.asmcL_ClassName ||
                                                        String(m.asmcL_Id)}
                                                </td>
                                                <td className='border p-2'>{m.section_list.map((s) => s.asmC_SectionName).join(' , ')}</td>
                                                <td className='flex justify-center gap-2 border p-2 text-center'>
                                                    {/* Edit Button */}
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => handleEdit(i)}
                                                        className='h-8 w-8 p-0 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600'>
                                                        <Edit className='h-4 w-4' />
                                                    </Button>

                                                    {/* Delete Button */}
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => {
                                                            setDeleteIndex(i); // store selected row index
                                                            setConfirmOpen(true); // open confirmation popup
                                                        }}
                                                        className='h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* SAVE / RESET (final) */}
                    <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start md:col-span-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                setValue('ecaC_Id', 0);
                                setValue('asmaY_Id', 0);
                                setValue('asmcL_Id', 0);
                                setValue('section_list', []);
                                setValue('emcA_Id', 0);
                                setValue('asmcL_Id', 0);
                                setSections([]);
                                setEditIndex(null);
                                setMappingList([]);
                            }}
                            disabled={isSubmitting}
                            className='order-3 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                            Reset
                        </Button>

                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                            isLoading={isSubmitting}
                            loadingText='Saving...'>
                            <div className='flex items-center gap-2'>
                                <Save className='h-4 w-4' />
                                Save Category Class Mapping
                            </div>
                        </Button>
                    </div>
                </>
            )}
            {confirmOpen && deleteIndex !== null && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
                    <div className='w-[360px] rounded-md bg-white p-6 text-center shadow-xl'>
                        <h2 className='mb-3 font-semibold text-lg'>Confirm Delete</h2>
                        <p className='mb-6 text-gray-700'>Are you sure you want to delete this mapping?</p>

                        <div className='flex justify-center gap-4'>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setDeleteIndex(null);
                                }}>
                                Cancel
                            </Button>

                            <Button
                                variant='destructive'
                                onClick={() => {
                                    if (deleteIndex !== null) handleDelete(deleteIndex); // 🔥 call your function
                                    setConfirmOpen(false);
                                    setDeleteIndex(null);
                                }}>
                                Yes, Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
