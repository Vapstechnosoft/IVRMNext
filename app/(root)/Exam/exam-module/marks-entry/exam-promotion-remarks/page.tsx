'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import type { IPromotionRemarksGrid } from '@/types/exam/exam-module/exam-mapping';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { PromotionRemarksColumns } from './_components/columns';

// Zod Schema for validation
const PromotionRemarksSchema = z.object({
    academicYear: z
        .number({
            required_error: 'Academic year is required',
            invalid_type_error: 'Academic year must be a number'
        })
        .positive('Please select a valid academic year'),
    class: z
        .number({
            required_error: 'Class is required',
            invalid_type_error: 'Class must be a number'
        })
        .positive('Please select a class'),
    section: z
        .number({
            required_error: 'Section is required',
            invalid_type_error: 'Section must be a number'
        })
        .positive('Please select a section'),
    term: z
        .number({
            invalid_type_error: 'Term must be a number'
        })
        .positive('Please select a term')
        .optional()
});

type FormData = z.infer<typeof PromotionRemarksSchema>;

/* -------------------------
   Placeholder fetch exams
   ------------------------- */
async function fetchexamsByClassAndSection(academicYearId: number | string, classId: number | string, sectionId: number | string) {
    const res = await fetch(
        `/api/master/exams?academicYearId=${encodeURIComponent(String(academicYearId))}&classId=${encodeURIComponent(
            String(classId)
        )}&sectionId=${encodeURIComponent(String(sectionId))}`
    );
    if (!res.ok) throw new Error('Failed to load exams');
    const json = await res.json();
    return Array.isArray(json) ? json : [];
}

/* -------------------------
   Placeholder fetch students
   ------------------------- */
async function getStudentDetails(academicYearId: number | string, classId: number | string, sectionId: number | undefined) {
    try {
        const res = await fetch(
            `/api/students?academicYearId=${encodeURIComponent(String(academicYearId))}&classId=${encodeURIComponent(
                String(classId)
            )}&sectionIds=${encodeURIComponent(String(sectionId))}`
        );
        if (!res.ok) throw new Error('Failed to fetch students');
        const json = await res.json();
        return { data: Array.isArray(json) ? json : [] };
    } catch (err) {
        console.error('Fetch failed, returning hardcoded data:', err);

        // Hardcoded 15 student records
        const hardcodedData = Array.from({ length: 15 }, (_, i) => ({
            slNo: i + 1,
            admNo: `ADM${1000 + i}`,
            studentName: `Student ${i + 1}`,
            studentId: i + 1,
            remarks: 'Good'
        }));

        return { data: hardcodedData };
    }
}

/* -------------------------
   Main Component
   ------------------------- */
export default function PromotionRemarksPage() {
    return <PromotionRemarksContent />;
}

function PromotionRemarksContent() {
    // Tabs
    const [activeTab, setActiveTab] = useState<number>(0);

    // Dropdown data
    const { data: academicDropdownData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setexams] = useState<{ termId: number; termName: string }[]>([]);

    // Selected values
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | undefined>();
    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>();
    const [selectedTerm, setSelectedTerm] = useState<number | undefined>();

    // Form errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Students
    const [students, setStudents] = useState<IPromotionRemarksGrid[]>([]);
    const [preSelectedStudentIds, setPreSelectedStudentIds] = useState<string[]>([]);
    const [tableProps, setTableProps] = useState<ReturnType<typeof useDataTableProps> | null>(null);
    const [isStudentsGridOpen, setIsStudentsGridOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Loading flags
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingexams, setLoadingexams] = useState(false);

    /* -------------------------
       Load academic years
       ------------------------- */
    useEffect(() => {
        if (academicError) {
            toast.error('Failed to load academic years');
            return;
        }

        if (academicDropdownData?.data && Array.isArray(academicDropdownData.data)) {
            const yrs = academicDropdownData.data.map((y: any) => ({
                asmaY_Id: y.asmaY_Id,
                asmaY_Year: y.asmaY_Year
            }));
            setAcademicYears(yrs);
            if (yrs.length > 0 && !selectedAcademicYear) {
                setSelectedAcademicYear(yrs[0].asmaY_Id);
            }
        }
    }, [academicDropdownData, academicError, selectedAcademicYear]);

    /* -------------------------
       Load classes when academic year changes
       ------------------------- */
    useEffect(() => {
        if (!selectedAcademicYear) {
            setClasses([]);
            setSelectedClass(undefined);
            return;
        }

        (async () => {
            setLoadingClasses(true);
            try {
                const { data } = await getClassDropDownByAcademicYearlist(selectedAcademicYear);
                setClasses(Array.isArray(data) ? data : []);
                setSections([]);
                setSelectedSectionId(undefined);
                setexams([]);
                setSelectedTerm(undefined);
                // Clear form errors when academic year changes
                setFormErrors((prev) => ({ ...prev, academicYear: '' }));
            } catch (err) {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedAcademicYear]);

    /* -------------------------
       Load sections when class changes
       ------------------------- */
    useEffect(() => {
        if (!selectedAcademicYear || !selectedClass) {
            setSections([]);
            setSelectedSectionId(undefined);
            return;
        }

        (async () => {
            setLoadingSections(true);
            try {
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedAcademicYear, selectedClass);
                setSections(Array.isArray(data) ? data : []);
                setSelectedSectionId(undefined);
                setexams([]);
                setSelectedTerm(undefined);
                // Clear form errors when class changes
                setFormErrors((prev) => ({ ...prev, class: '' }));
            } catch (err) {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedAcademicYear, selectedClass]);

    /* -------------------------
       Load exams
       ------------------------- */
    useEffect(() => {
        if (activeTab !== 0 || !selectedAcademicYear || !selectedClass || selectedSectionId) {
            setexams([]);
            setSelectedTerm(undefined);
            return;
        }

        (async () => {
            setLoadingexams(true);
            try {
                const termData = await fetchexamsByClassAndSection(selectedAcademicYear, selectedClass, Number(selectedSectionId));
                const normalized = Array.isArray(termData)
                    ? termData.map((t: any) => ({
                          termId: t.termId ?? t.id ?? 0,
                          termName: t.termName ?? t.name ?? ''
                      }))
                    : [];
                setexams(normalized);
                if (normalized.length > 0) setSelectedTerm(normalized[0].termId);
                else toast.info('No exams found for selected class and section');
            } catch (err) {
                toast.error('Failed to load exams');
                setexams([]);
                setSelectedTerm(undefined);
            } finally {
                setLoadingexams(false);
            }
        })();
    }, [activeTab, selectedAcademicYear, selectedClass, selectedSectionId]);

    /* -------------------------
       Handle search manually with validation
       ------------------------- */
    const handleSearch = async () => {
        // Clear previous errors
        setFormErrors({});

        // Validate form data using Zod schema
        const formData = {
            academicYear: selectedAcademicYear,
            class: selectedClass,
            section: selectedSectionId,
            term: activeTab === 0 ? selectedTerm : undefined
        };

        try {
            // Basic validation
            if (!selectedAcademicYear || !selectedClass || !selectedSectionId) {
                const newErrors: Record<string, string> = {};
                if (!selectedAcademicYear) newErrors.academicYear = 'Academic year is required';
                if (!selectedClass) newErrors.class = 'Class is required';
                if (!selectedSectionId) newErrors.section = 'Section is required';
                setFormErrors(newErrors);
                toast.error('Please fill all required fields');
                return;
            }

            // For Individual Term Wise, term is required
            if (activeTab === 0 && !selectedTerm) {
                setFormErrors((prev) => ({ ...prev, term: 'Term is required for Individual Term Wise' }));
                toast.error('Please select a term');
                return;
            }

            // Validate with Zod schema
            const validationData = {
                academicYear: selectedAcademicYear,
                class: selectedClass,
                section: selectedSectionId,
                term: selectedTerm
            };

            const result = PromotionRemarksSchema.safeParse(validationData);

            if (!result.success) {
                const newErrors: Record<string, string> = {};
                result.error.errors.forEach((err) => {
                    const path = err.path[0];
                    if (typeof path === 'string') {
                        newErrors[path] = err.message;
                    }
                });
                setFormErrors(newErrors);
                toast.error('Please fix validation errors');
                return;
            }

            // Proceed with search if validation passes
            setIsLoading(true);
            setIsStudentsGridOpen(true);

            try {
                const { data } = await getStudentDetails(selectedAcademicYear, selectedClass, selectedSectionId);
                const studentList: IPromotionRemarksGrid[] = Array.isArray(data)
                    ? data.map((s: any, index: number) => ({
                          slNo: index + 1,
                          admNo: s.admNo ?? '',
                          studentName: s.studentName ?? '',
                          studentId: s.studentId ?? 0,
                          remarks: s.remarks ?? ''
                      }))
                    : [];

                const preSelected = studentList.filter((s) => s.remarks && s.remarks.trim() !== '').map((s, index) => index.toString());
                setPreSelectedStudentIds(preSelected);

                setStudents(studentList);

                setTableProps(
                    useDataTableProps({
                        data: studentList,
                        total: studentList.length,
                        pageIndex: 0,
                        pageSize: 10
                    })
                );
            } catch (err: any) {
                toast.error(err?.message || 'Failed to fetch students');
            } finally {
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Validation error:', error);
            toast.error('Form validation failed');
        }
    };

    /* -------------------------
       Update student remarks
       ------------------------- */
    const updateStudent = (id: number, remarks: string) => {
        setStudents((prev) => {
            const updated = prev.map((s) => (s.studentId === id ? { ...s, remarks: remarks } : s));

            // also update table props
            setTableProps((tp: any) => ({
                ...tp,
                data: updated
            }));

            return updated;
        });
    };
    const columns = PromotionRemarksColumns(updateStudent);

    /* -------------------------
       Clear errors when field changes
       ------------------------- */
    const handleAcademicYearChange = (value: string) => {
        const numValue = value !== 'none' ? Number(value) : undefined;
        setSelectedAcademicYear(numValue);
        setFormErrors((prev) => ({ ...prev, academicYear: '' }));
    };

    const handleClassChange = (value: string) => {
        const numValue = value !== 'none' ? Number(value) : undefined;
        setSelectedClass(numValue);
        setFormErrors((prev) => ({ ...prev, class: '' }));
    };

    const handleSectionChange = (value: string) => {
        const numValue = value !== 'none' ? Number(value) : undefined;
        setSelectedSectionId(numValue);
        setFormErrors((prev) => ({ ...prev, section: '' }));
    };

    const handleTermChange = (value: string) => {
        const numValue = value !== 'none' && value !== 'disabled' ? Number(value) : undefined;
        setSelectedTerm(numValue);
        setFormErrors((prev) => ({ ...prev, term: '' }));
    };

    /* -------------------------
       Render
       ------------------------- */
    return (
        <div className='min-h-screen bg-gray-50 p-4'>
            <div className='container mx-auto space-y-4'>
                {/* Tabs */}
                <div className='flex items-center justify-center'>
                    <div className='mb-4 flex w-max gap-2 rounded-full bg-gray-200 p-1'>
                        <button
                            type='button'
                            className={`rounded-full px-6 py-2 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 0 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}
                            onClick={() => {
                                setActiveTab(0);
                                setSelectedTerm(undefined);
                                setFormErrors((prev) => ({ ...prev, term: '' }));
                            }}>
                            Individual Term Wise
                        </button>
                        <button
                            type='button'
                            className={`rounded-full px-6 py-2 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}
                            onClick={() => {
                                setActiveTab(1);
                                setSelectedTerm(undefined);
                                setFormErrors((prev) => ({ ...prev, term: '' }));
                            }}>
                            Overall Term Wise
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className='rounded-md border bg-white p-4 shadow-sm'>
                    <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-4'>
                        {/* Academic Year */}
                        <div>
                            <label htmlFor='academic-year-trigger' className='mb-1 block font-medium text-slate-700 text-sm'>
                                Academic Year <span className='text-red-500'>*</span>
                            </label>
                            <Select
                                value={selectedAcademicYear ? String(selectedAcademicYear) : ''}
                                onValueChange={handleAcademicYearChange}>
                                <SelectTrigger className='h-10' id='academic-year-trigger'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingAcademic
                                        ? [
                                              <SelectItem value='loading' key='loading'>
                                                  Loading...
                                              </SelectItem>
                                          ]
                                        : academicYears.length === 0
                                          ? [
                                                <SelectItem value='none' key='empty'>
                                                    -- No academic years --
                                                </SelectItem>
                                            ]
                                          : academicYears.map((y) => (
                                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                </SelectContent>
                            </Select>
                            {formErrors.academicYear && <p className='mt-1 text-red-500 text-sm'>{formErrors.academicYear}</p>}
                        </div>

                        {/* Class */}
                        <div>
                            <label htmlFor='class-select-trigger' className='mb-1 block font-medium text-slate-700 text-sm'>
                                Class <span className='text-red-500'>*</span>
                            </label>
                            <Select
                                value={selectedClass ? String(selectedClass) : ''}
                                onValueChange={handleClassChange}
                                disabled={!selectedAcademicYear || loadingClasses}>
                                <SelectTrigger className='h-10' id='class-select-trigger'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {!selectedAcademicYear
                                        ? [
                                              <SelectItem value='none' key='empty'>
                                                  -- Select Academic Year first --
                                              </SelectItem>
                                          ]
                                        : loadingClasses
                                          ? [
                                                <SelectItem value='loading' key='loading'>
                                                    Loading classes...
                                                </SelectItem>
                                            ]
                                          : classes.length === 0
                                            ? [
                                                  <SelectItem value='none' key='empty'>
                                                      -- No classes --
                                                  </SelectItem>
                                              ]
                                            : classes.map((c) => (
                                                  <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                      {c.asmcL_ClassName}
                                                  </SelectItem>
                                              ))}
                                </SelectContent>
                            </Select>
                            {formErrors.class && <p className='mt-1 text-red-500 text-sm'>{formErrors.class}</p>}
                        </div>

                        {/* Section */}
                        <div>
                            <label htmlFor='section-select-trigger' className='mb-1 block font-medium text-slate-700 text-sm'>
                                Section <span className='text-red-500'>*</span>
                            </label>
                            <Select
                                value={selectedSectionId ? String(selectedSectionId) : ''}
                                onValueChange={handleSectionChange}
                                disabled={!selectedClass || loadingSections}>
                                <SelectTrigger className='h-10' id='section-select-trigger'>
                                    <SelectValue placeholder='Select Section' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingSections
                                        ? [
                                              <SelectItem value='loading' key='loading'>
                                                  Loading sections...
                                              </SelectItem>
                                          ]
                                        : sections.length === 0
                                          ? [
                                                <SelectItem value='none' key='empty'>
                                                    -- No sections --
                                                </SelectItem>
                                            ]
                                          : sections.map((s) => (
                                                <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                    {s.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                </SelectContent>
                            </Select>
                            {formErrors.section && <p className='mt-1 text-red-500 text-sm'>{formErrors.section}</p>}
                        </div>

                        {/* Term */}
                        <div>
                            <label htmlFor='term-select-trigger' className='mb-1 block font-medium text-slate-700 text-sm'>
                                Term <span className='text-red-500'>*</span>
                            </label>
                            <Select
                                value={selectedTerm ? String(selectedTerm) : ''}
                                onValueChange={handleTermChange}
                                disabled={activeTab === 1 || loadingexams}>
                                <SelectTrigger className='h-10' id='term-select-trigger'>
                                    <SelectValue
                                        placeholder={
                                            activeTab === 1
                                                ? '-- Disabled for Overall --'
                                                : loadingexams
                                                  ? 'Loading exams...'
                                                  : 'Select Term'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeTab === 1
                                        ? [
                                              <SelectItem value='disabled' key='disabled'>
                                                  -- Disabled for Overall --
                                              </SelectItem>
                                          ]
                                        : loadingexams
                                          ? [
                                                <SelectItem value='loading' key='loading'>
                                                    Loading exams...
                                                </SelectItem>
                                            ]
                                          : exams.length === 0
                                            ? [
                                                  <SelectItem value='none' key='empty'>
                                                      -- No exams --
                                                  </SelectItem>
                                              ]
                                            : exams.map((t) => (
                                                  <SelectItem key={t.termId} value={String(t.termId)}>
                                                      {t.termName}
                                                  </SelectItem>
                                              ))}
                                </SelectContent>
                            </Select>
                            {formErrors.term && <p className='mt-1 text-red-500 text-sm'>{formErrors.term}</p>}
                        </div>
                    </div>

                    <div className='mx-auto mt-6 w-fit'>
                        <Button type='button' className='px-6 py-2 shadow' onClick={handleSearch}>
                            SEARCH
                        </Button>
                    </div>
                </div>

                {/* Students Grid */}
                {isStudentsGridOpen && tableProps && (
                    <CollapsibleSection
                        defaultOpen
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable<IPromotionRemarksGrid>
                            {...tableProps}
                            columns={columns}
                            isLoading={isLoading}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading remarks...'
                            noDataTitle='No Records Found'
                            noDataDescription='Click SEARCH to view remarks'
                            errorTitle='Error Loading Remarks'
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
