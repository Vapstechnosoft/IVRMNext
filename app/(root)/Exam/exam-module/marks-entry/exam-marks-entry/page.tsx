'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    GetLoginPrivilegeClassesDropdown,
    GetLoginPrivilegeSectionsDropdown,
    getSubjectsByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/marks-entry/exam-marks-entry';
import { getExamsDropDownByAcademicYearandClassandSectionlist } from '@/server/exam/exam-module/reports/cumulative-report';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MarksCustomTable } from './_components/marks-entry-custom-table';

export default function MarksEntryPage() {
    return <MarksEntryContent />;
}

function MarksEntryContent() {
    // Tabs: Individual/Overall
    const [activeTab] = useState<number>(0);

    // dropdown data
    const { data: academicDropdownData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<{ subjectId: number; subjectName: string }[]>([]);

    // selected
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | undefined>();
    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>();
    const [selectedExam, setSelectedExam] = useState<number | undefined>();
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>();
    const [calculateMarks, setCalculateMarks] = useState(false);

    // data & table
    const [isStudentsGridOpen, setIsStudentsGridOpen] = useState(false);

    // loading flags
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    /* -------------------------
       Load academic years
       ------------------------- */
    useEffect(() => {
        if (academicError) {
            toast.error('Failed to load academic years');
            return;
        }
        if (academicDropdownData?.data && Array.isArray(academicDropdownData.data)) {
            const yrs = academicDropdownData.data.map((y: any) => ({ asmaY_Id: y.asmaY_Id, asmaY_Year: y.asmaY_Year }));
            setAcademicYears(yrs);
        }
    }, [academicDropdownData, academicError, selectedAcademicYear]);

    /* -------------------------
       Load classes when academic year changes
       ------------------------- */
    useEffect(() => {
        // Immediate reset of all downstream states
        setClasses([]);
        setSelectedClass(undefined);
        setSections([]);
        setSelectedSectionId(undefined);
        setExams([]);
        setSelectedExam(undefined);
        setSubjects([]);
        setSelectedSubjectId(undefined);
        setIsStudentsGridOpen(false);

        if (!selectedAcademicYear) return;

        (async () => {
            setLoadingClasses(true);
            try {
                // Use your privileged endpoint if available
                const res = await GetLoginPrivilegeClassesDropdown(selectedAcademicYear);
                const data = res?.data ?? [];
                if (!Array.isArray(data) || data.length === 0) {
                    toast.info('No classes are mapped for your selections');
                }
                setClasses(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
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
        // Immediate reset of all downstream states
        setSections([]);
        setSelectedSectionId(undefined);
        setExams([]);
        setSelectedExam(undefined);
        setSubjects([]);
        setSelectedSubjectId(undefined);
        setIsStudentsGridOpen(false);

        if (!selectedAcademicYear || !selectedClass) return;

        (async () => {
            setLoadingSections(true);
            try {
                const res = await GetLoginPrivilegeSectionsDropdown(selectedAcademicYear, selectedClass);
                const data = res?.data ?? [];
                setSections(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedAcademicYear, selectedClass]);

    /* -------------------------
       Load exams when section selected
       ------------------------- */
    useEffect(() => {
        // Immediate reset of all downstream states
        setExams([]);
        setSelectedExam(undefined);
        setSubjects([]);
        setSelectedSubjectId(undefined);
        setIsStudentsGridOpen(false);

        if (activeTab !== 0 || !selectedAcademicYear || !selectedClass || !selectedSectionId) return;

        (async () => {
            setLoadingExams(true);
            try {
                const res = await getExamsDropDownByAcademicYearandClassandSectionlist(
                    selectedAcademicYear,
                    selectedClass,
                    selectedSectionId
                );
                // Normalize possible shapes — your backend sometimes returns different keys
                const data = res?.data ?? [];
                // Some endpoints return { emE_Id, emE_ExamName } while others return { examId, examName }
                const normalized = (Array.isArray(data) ? data : []).map((x: any) => {
                    if (x.emE_Id !== undefined) return { examId: x.emE_Id, examName: x.emE_ExamName };
                    if (x.examId !== undefined) return { examId: x.examId, examName: x.examName };
                    // fallback: attempt to guess keys
                    const keys = Object.keys(x);
                    return { examId: x[keys[0]], examName: x[keys[1]] ?? JSON.stringify(x) };
                });
                setExams(normalized);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [activeTab, selectedAcademicYear, selectedClass, selectedSectionId]);

    /* -------------------------
       mock subjects list (still using your static list)
       ------------------------- */
    useEffect(() => {
        // Immediate reset of all downstream states
        setSubjects([]);
        setSelectedSubjectId(undefined);
        setIsStudentsGridOpen(false);

        if (!selectedAcademicYear || !selectedClass || !selectedSectionId || !selectedExam) return;

        const fetchSubjects = async () => {
            try {
                const res = await getSubjectsByAcademicYearandClassandSectionlist(
                    selectedAcademicYear,
                    selectedClass,
                    selectedSectionId,
                    selectedExam
                );

                const data = res?.data ?? [];
                setSubjects(
                    data.map((x: any) => ({
                        subjectId: x.ismS_Id,
                        subjectName: x.ismS_SubjectName
                    }))
                );
                // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            } catch (err) {
                toast.error('Failed to load subjects');
            }
        };

        fetchSubjects();
    }, [selectedAcademicYear, selectedClass, selectedSectionId, selectedExam]);

    /* -------------------------
       Note: Grid is NOT auto-closed when subject changes.
       User must click SEARCH button to fetch new data.
       ------------------------- */

    /* ----------
       handleSearch -> fetch subject+students
       ------------------------- */
    const handleSearch = () => {
        if (!selectedAcademicYear || !selectedClass || !selectedSectionId) {
            toast.info('Select all required fields before search');
            return;
        }
        if (!selectedSubjectId) {
            toast.info('Select subject before search');
            return;
        }
        setIsStudentsGridOpen(true);
    };

    const handleCancel = () => {
        setSelectedAcademicYear(undefined);
        setSelectedClass(undefined);
        setSelectedSectionId(undefined);
        setSelectedExam(undefined);
        setSelectedSubjectId(undefined);
        setCalculateMarks(false);
        setIsStudentsGridOpen(false);
        setClasses([]);
        setSections([]);
        setExams([]);
        setSubjects([]);
    };

    return (
        <div className='min-h-screen bg-gray-50 p-4'>
            <div className='container mx-auto space-y-4'>
                {/* Filters */}
                <div className='rounded-md border bg-white p-4 shadow-sm'>
                    <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-4'>
                        {/* Academic Year */}
                        <div>
                            <label htmlFor='academicYear' className='mb-1 block font-medium text-slate-700 text-sm'>
                                Academic Year <span className='text-red-500'>*</span>
                            </label>

                            <Select
                                key={selectedAcademicYear}
                                //id="academicYear"
                                value={selectedAcademicYear ? String(selectedAcademicYear) : undefined}
                                onValueChange={(v) => setSelectedAcademicYear(v !== 'none' ? Number(v) : undefined)}>
                                <SelectTrigger className='h-10'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>

                                <SelectContent>
                                    {loadingAcademic ? (
                                        <SelectItem value='loading'>Loading...</SelectItem>
                                    ) : academicYears.length === 0 ? (
                                        <SelectItem value='none'>-- No academic years --</SelectItem>
                                    ) : (
                                        academicYears.map((y) => (
                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Class */}
                        <div>
                            <label htmlFor='classSelect' className='mb-1 block font-medium text-slate-700 text-sm'>
                                Class <span className='text-red-500'>*</span>
                            </label>

                            <Select
                                key={selectedClass}
                                //id="classSelect"
                                value={selectedClass ? String(selectedClass) : undefined}
                                onValueChange={(v) => setSelectedClass(v !== 'none' ? Number(v) : undefined)}
                                disabled={!selectedAcademicYear || loadingClasses}>
                                <SelectTrigger className='h-10'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>

                                <SelectContent>
                                    {!selectedAcademicYear ? (
                                        <SelectItem value='none'>-- Select Academic Year first --</SelectItem>
                                    ) : loadingClasses ? (
                                        <SelectItem value='loading'>Loading classes...</SelectItem>
                                    ) : classes.length === 0 ? (
                                        <SelectItem value='none'>-- No classes --</SelectItem>
                                    ) : (
                                        classes.map((c) => (
                                            <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Section */}
                        <div>
                            <label htmlFor='sectionSelect' className='mb-1 block font-medium text-slate-700 text-sm'>
                                Section <span className='text-red-500'>*</span>
                            </label>

                            <Select
                                key={selectedSectionId}
                                //id="sectionSelect"
                                value={selectedSectionId ? String(selectedSectionId) : undefined}
                                onValueChange={(v) => setSelectedSectionId(v !== 'none' ? Number(v) : undefined)}
                                disabled={!selectedClass || loadingSections}>
                                <SelectTrigger className='h-10'>
                                    <SelectValue placeholder='Select Section' />
                                </SelectTrigger>

                                <SelectContent>
                                    {loadingSections ? (
                                        <SelectItem value='loading'>Loading sections...</SelectItem>
                                    ) : sections.length === 0 ? (
                                        <SelectItem value='none'>-- No sections --</SelectItem>
                                    ) : (
                                        sections.map((s) => (
                                            <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                {s.asmC_SectionName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Exam */}
                        <div>
                            <label htmlFor='examSelect' className='mb-1 block font-medium text-slate-700 text-sm'>
                                Exam <span className='text-red-500'>*</span>
                            </label>

                            <Select
                                key={selectedExam}
                                //id="examSelect"
                                value={selectedExam ? String(selectedExam) : undefined}
                                onValueChange={(v) => setSelectedExam(v !== 'none' && v !== 'disabled' ? Number(v) : undefined)}
                                disabled={activeTab === 1 || loadingExams}>
                                <SelectTrigger className='h-10'>
                                    <SelectValue placeholder={activeTab === 1 ? '-- Disabled for Overall --' : 'Select exam'} />
                                </SelectTrigger>

                                <SelectContent>
                                    {activeTab === 1 ? (
                                        <SelectItem value='disabled'>-- Disabled for Overall --</SelectItem>
                                    ) : loadingExams ? (
                                        <SelectItem value='loading'>Loading exams...</SelectItem>
                                    ) : exams.length === 0 ? (
                                        <SelectItem value='none'>-- No exams --</SelectItem>
                                    ) : (
                                        exams.map((t: any) => (
                                            <SelectItem key={String(t.examId)} value={String(t.examId)}>
                                                {t.examName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject */}
                        <div className='mt-4 md:col-span-1'>
                            <label htmlFor='subjectSelect' className='mb-1 block font-medium text-slate-700 text-sm'>
                                Subject <span className='text-red-500'>*</span>
                            </label>

                            <Select
                                key={selectedSubjectId}
                                //id="subjectSelect"
                                value={selectedSubjectId ? String(selectedSubjectId) : undefined}
                                onValueChange={(v) => setSelectedSubjectId(v !== 'none' ? Number(v) : undefined)}>
                                <SelectTrigger className='h-10'>
                                    <SelectValue placeholder='Select Subject' />
                                </SelectTrigger>

                                <SelectContent>
                                    {subjects.length === 0 ? (
                                        <SelectItem value='none'>-- No subjects --</SelectItem>
                                    ) : (
                                        subjects.map((s) => (
                                            <SelectItem key={s.subjectId} value={String(s.subjectId)}>
                                                {s.subjectName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='mt-3 text-sm'>
                        <div className='inline-flex items-center gap-2'>
                            <Checkbox
                                id='calculate-marks'
                                checked={calculateMarks}
                                onCheckedChange={(checked) => setCalculateMarks(!!checked)}
                            />
                            <label htmlFor='calculate-marks' className='cursor-pointer'>
                                Do You Want Calculate Marks?
                            </label>
                        </div>
                    </div>
                    <div className='mx-auto mt-6 flex w-fit gap-4'>
                        <Button className='px-6 py-2 shadow' onClick={handleSearch}>
                            SEARCH
                        </Button>
                        <Button variant='destructive' className='px-6 py-2 shadow' onClick={handleCancel}>
                            CANCEL
                        </Button>
                    </div>
                </div>

                {isStudentsGridOpen && selectedAcademicYear && selectedClass && selectedSectionId && selectedSubjectId && (
                    <CollapsibleSection
                        defaultOpen
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={() => setIsStudentsGridOpen(false)}
                                variant='ghost'
                                size='sm'
                                className='-top-[2.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                        </div>
                        <div>
                            {/* The custom table component handles rendering + inputs */}
                            <MarksCustomTable
                                ASMAY_Id={selectedAcademicYear === undefined ? null : selectedAcademicYear}
                                ASMCL_Id={selectedClass === undefined ? null : selectedClass}
                                ASMS_Id={selectedSectionId === undefined ? null : selectedSectionId}
                                EME_Id={selectedExam === undefined ? null : selectedExam}
                                ISMS_Id={selectedSubjectId === undefined ? null : selectedSubjectId}
                                onSave={async (data) => {
                                    console.info('Saving data:', data);
                                    // Refresh the grid after successful save
                                    await handleSearch();
                                }}
                                onClose={() => setIsStudentsGridOpen(false)}
                            />
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
