'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { GetExamMarksEntryOnSearch, addOrUpdateStudentMarks } from '@/server/exam/exam-module/marks-entry/exam-marks-entry';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/* ============================================
   Types
   ============================================ */
interface SubSubjectData {
    emsS_Id: number;
    emsS_SubSubjectName: string;
    eycessS_MaxMarks: number;
    eycessS_MinMarks?: number;
    eycessS_MarksEntryMax: number;
}

interface SubExamData {
    emsE_Id: number;
    emsE_SubExamName: string;
    eycessE_MaxMarks: number;
    eycessE_MinMarks?: number;
    eycessE_MarksEntryMax: number;
}

interface StudentMarksEntry {
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_AdmNo: string;
    amsT_RegistrationNo: string;
    amaY_RollNo: number;
    ismS_Id: number;
    ismS_SubjectName: string;
    eyceS_MaxMarks: number;
    eyceS_MinMarks: number;
    eyceS_MarksEntryMax: number;
    estM_Marks?: number;
    estM_Grade?: string | null;
    estM_Flg?: string | null;
    estM_Id?: number;
    estmanssH_AnswerSheet?: string | null;
    estmanssH_FileLocation?: string | null;
    selected?: boolean;
    ESTM_Marks?: string | number;
    ESTMSS_Marks?: any;
    papertype?: string;
    papertypeid?: number;
}

interface Configuration {
    exmConfig_RegnoColumnDisplay: boolean;
    exmConfig_AdmnoColumnDisplay: boolean;
    exmConfig_RollnoColumnDisplay: boolean;
    exmConfig_Recordsearchtype: 'Name' | 'AdmNo' | 'RollNo' | 'RegNo';
}

interface SavedMarksEntry {
    AMST_Id: number;
    ISMS_Id: number;
    EMSS_Id?: number;
    EMSE_Id?: number;
    ESTM_MarksGradeFlg: string;
    ESTM_Marks: number;
    ESTM_Grade?: string | null;
    ESTM_Flg?: string | null;
    ESTMSS_Marks?: number;
    ESTMSS_Grade?: string | null;
    ESTMSS_Flg?: string | null;
}

interface SubjectMeta {
    subjectId: number;
    subjectName: string;
    subsubFlag: boolean;
    subexamFlag: boolean;
    maxMarks: number;
    minMarks: number;
    marksEntryMax: number;
    marksGradeEntryFlg: 'M' | 'G';
    subsubData: Array<{
        subsubId: number;
        subsubName: string;
        maxMarks: number;
        minMarks?: number;
        marksEntryMax: number;
    }>;
    subexamData: Array<{
        subexamId: number;
        subexamName: string;
        maxMarks: number;
        minMarks?: number;
        marksEntryMax: number;
    }>;
}

interface MarksCustomTableProps {
    ASMAY_Id: number | null;
    ASMCL_Id: number | null;
    ASMS_Id: number | null;
    EME_Id: number | null;
    ISMS_Id: number | null;
    onSave?: (data: any) => Promise<void>;
    userPrivileges?: any;
}

/* ============================================
   Table Cell Components (from example)
   ============================================ */
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    children?: React.ReactNode;
}

const TableCell = ({ className, children, ...props }: TableCellProps) => {
    const isCheckbox = React.isValidElement(children) && (children.type as any)?.displayName === 'Checkbox';

    return (
        <td
            className={`whitespace-nowrap p-2 align-middle text-[#0C0A09] text-[14px] ${isCheckbox ? 'pr-0' : ''} ${className || ''}`}
            {...props}>
            {isCheckbox ? <Checkbox {...(children as any).props} /> : children}
        </td>
    );
};

const TableHeaderCell = ({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className={`whitespace-nowrap bg-[#7C3AED] p-2 text-center align-middle text-white ${className || ''}`} {...props}>
        {children}
    </th>
);

/* ============================================
   MarksInputCell with Validation and Arrow Navigation
   ============================================ */
interface MarksInputCellProps {
    value: number | '' | string | undefined;
    max: number;
    min?: number;
    onChange: (v: number | '' | string) => void;
    placeholder?: string;
    marksGradeEntryFlg: 'M' | 'G';
    gradeDetails: string[];
    papertypeid?: number;
    papertypeGradeDetails?: Array<{ empatY_Id: number; emgD_Name: string }>;
    onValidationError: (error: string) => void;
    onArrow?: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

const MarksInputCell = React.forwardRef<HTMLInputElement, MarksInputCellProps>(
    (
        {
            value,
            max,
            min,
            onChange,
            placeholder,
            marksGradeEntryFlg,
            gradeDetails,
            papertypeid,
            papertypeGradeDetails,
            onValidationError,
            onArrow
        },
        ref
    ) => {
        const [local, setLocal] = useState<string>(value === '' || value === undefined ? '' : String(value));
        const [error, setError] = useState<string>('');

        useEffect(() => {
            setLocal(value === '' || value === undefined ? '' : String(value));
            setError('');
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            setLocal(raw);

            // Allow empty
            if (raw.trim() === '') {
                setError('');
                onChange('');
                onValidationError('');
                return;
            }

            if (marksGradeEntryFlg === 'G') {
                // Grade validation
                const grade = raw.trim().toUpperCase();
                const validFlags = ['AB', 'L', 'M', 'OD'];

                // Check for valid flags
                if (validFlags.includes(grade)) {
                    setError('');
                    onChange(grade);
                    onValidationError('');
                    return;
                }

                // Check against grade details
                let isValidGrade = false;

                // First check paper type specific grades
                if (papertypeid && papertypeGradeDetails) {
                    isValidGrade = papertypeGradeDetails.some((gradeDetail) => gradeDetail.emgD_Name.toUpperCase() === grade);
                }

                // If not found in paper type grades, check general grades
                if (!isValidGrade && gradeDetails.length > 0) {
                    isValidGrade = gradeDetails.some((g) => g.toUpperCase() === grade);
                }

                if (!isValidGrade) {
                    const errorMsg = 'Entered Grade cant be out of master setting...!';
                    setError(errorMsg);
                    onValidationError(errorMsg);
                    onChange('');
                    return;
                }

                setError('');
                onChange(grade);
                onValidationError('');
            } else {
                // Marks validation
                if (raw.match(/[a-z]/i)) {
                    // Check for valid flags in marks mode
                    const flag = raw.trim().toUpperCase();
                    const validFlags = ['AB', 'L', 'M', 'OD'];

                    if (validFlags.includes(flag)) {
                        setError('');
                        onChange(flag);
                        onValidationError('');
                        return;
                    }

                    const errorMsg = 'Entered value cant be out of master setting...!';
                    setError(errorMsg);
                    onValidationError(errorMsg);
                    onChange('');
                    return;
                }

                // Numeric validation
                if (!/^\d*\.?\d*$/.test(raw.trim())) {
                    const errorMsg = 'Only numbers and decimal point allowed';
                    setError(errorMsg);
                    onValidationError(errorMsg);
                    return;
                }

                const num = Number.parseFloat(raw.trim());

                if (Number.isNaN(num)) {
                    setError('');
                    onChange('');
                    onValidationError('');
                    return;
                }

                if (num < 0) {
                    const errorMsg = 'Entered marks cant be in negative values...!';
                    setError(errorMsg);
                    onValidationError(errorMsg);
                    return;
                }

                if (num > max) {
                    const errorMsg = `Entered marks cant exceed ${max}`;
                    setError(errorMsg);
                    onValidationError(errorMsg);
                    return;
                }

                setError('');
                onChange(num.toString());
                onValidationError('');
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!onArrow) return;

            switch (e.key) {
                case 'ArrowRight':
                    onArrow('right');
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    onArrow('left');
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    onArrow('down');
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    onArrow('up');
                    e.preventDefault();
                    break;
                default:
                    break;
            }
        };

        return (
            <div className='flex flex-col items-start'>
                <Input
                    ref={ref}
                    className={`w-[120px] rounded border px-2 py-1 text-sm ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
                    placeholder={placeholder}
                    value={local}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    style={{
                        fontSize: '14px'
                    }}
                />
                {error ? <div className='mt-[2px] text-[11px] text-red-600 leading-none'>{error}</div> : null}
            </div>
        );
    }
);

MarksInputCell.displayName = 'MarksInputCell';

/* ============================================
   Main Component
   ============================================ */
export function MarksCustomTable({ ASMAY_Id, ASMCL_Id, ASMS_Id, EME_Id, ISMS_Id, onSave, userPrivileges }: MarksCustomTableProps) {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isStudentsGridOpen, setIsStudentsGridOpen] = useState(false);
    const [students, setStudents] = useState<StudentMarksEntry[]>([]);
    const [subjectMeta, setSubjectMeta] = useState<SubjectMeta | null>(null);
    const [config, setConfig] = useState<Configuration | null>(null);
    const [marksDeleteFlag, setMarksDeleteFlag] = useState(false);
    const [lastDateEntryFlag, setLastDateEntryFlag] = useState(true);
    const [lastDateExamFlag, setLastDateExamFlag] = useState(true);
    const [tempSubsMarksList, setTempSubsMarksList] = useState<SavedMarksEntry[]>([]);
    const [allSelected, setAllSelected] = useState(false);
    const [gradeDetails, setGradeDetails] = useState<string[]>([]);
    const [paperTypeGradeDetails, setPaperTypeGradeDetails] = useState<any[]>([]);
    const [subSubjectGradeDetails, setSubSubjectGradeDetails] = useState<any[]>([]);
    const [subExamGradeDetails, setSubExamGradeDetails] = useState<any[]>([]);

    // Ref for input navigation
    const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

    /* ============================================
       Handle Search (auto-trigger when params change)
       ============================================ */
    const handleSearch = useCallback(async () => {
        if (!ASMS_Id || !ASMCL_Id || !ASMAY_Id || !EME_Id || !ISMS_Id) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await GetExamMarksEntryOnSearch({
                ASMS_Id: ASMS_Id,
                ASMCL_Id: ASMCL_Id,
                ASMAY_Id: ASMAY_Id,
                EME_Id: EME_Id,
                ISMS_Id: ISMS_Id
            });

            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            console.log('data **', data);

            // Check for date restrictions
            if (!data.lastDateExamFlag) {
                setIsStudentsGridOpen(false);
                toast.error(`From ${new Date(data.marksEntryStateDate || '').toLocaleDateString()} You Can Start Enter The Marks`);
                setIsLoading(false);
                return;
            }

            if (!data.lastDateEntryFlag) {
                toast.error('Marks Entry Last Date Completed You Can Not Enter Marks');
                setIsStudentsGridOpen(false);
                setIsLoading(false);
                return;
            }

            if (!data.studentList || data.studentList.length === 0) {
                toast.error('This Subject Is Not Mapped With Students');
                setIsStudentsGridOpen(false);
                setIsLoading(false);
                return;
            }

            // Set configuration
            if (data.configuration && data.configuration.length > 0) {
                setConfig(data.configuration[0]);
            }

            // Set flags
            setMarksDeleteFlag(data.marksdeleteflag);
            setLastDateEntryFlag(data.lastDateEntryFlag);
            setLastDateExamFlag(data.lastDateExamFlag);

            // Set grade details
            setGradeDetails(data.grade_details || []);
            setPaperTypeGradeDetails(data.get_papertype_grade_details || []);
            setSubSubjectGradeDetails(data.subsubject_gradedetails || []);
            setSubExamGradeDetails(data.subexam_gradedetails || []);

            // Process student list
            let processedStudents = data.studentList.map((student: StudentMarksEntry) => ({
                ...student,
                selected: false,
                ESTM_Marks: ''
            }));

            // Add paper type info if available
            if (data.get_student_wise_papertype_list) {
                processedStudents = processedStudents.map((student: StudentMarksEntry) => {
                    const paperType = data.get_student_wise_papertype_list!.find((pt: any) => pt.amsT_Id === student.amsT_Id);
                    return {
                        ...student,
                        papertype: paperType?.empatY_PaperTypeName,
                        papertypeid: paperType?.empatY_Id
                    };
                });
            }

            // Map saved marks if available
            if (data.saved_studentList && data.saved_studentList.length > 0) {
                if (!data.eyceS_SubSubjectFlg && !data.eyceS_SubExamFlg) {
                    // Simple subject case
                    processedStudents = mapMarksSimple(processedStudents, data.saved_studentList, data.answer_sheet);
                }
            }

            setStudents(processedStudents);

            // Set subject meta
            const subjectData = data.subject_details[0];
            setSubjectMeta({
                subjectId: subjectData.ismS_Id,
                subjectName: processedStudents[0]?.ismS_SubjectName || '',
                subsubFlag: data.eyceS_SubSubjectFlg,
                subexamFlag: data.eyceS_SubExamFlg,
                maxMarks: subjectData.eyceS_MaxMarks,
                minMarks: subjectData.eyceS_MinMarks,
                marksEntryMax: subjectData.eyceS_MarksEntryMax,
                marksGradeEntryFlg: data.eyceS_MarksGradeEntryFlg,
                subsubData: data.subject_subsubjects.map((ss: SubSubjectData) => ({
                    subsubId: ss.emsS_Id,
                    subsubName: ss.emsS_SubSubjectName,
                    maxMarks: ss.eycessS_MaxMarks,
                    minMarks: ss.eycessS_MinMarks,
                    marksEntryMax: ss.eycessS_MarksEntryMax
                })),
                subexamData: data.subject_subexams.map((se: SubExamData) => ({
                    subexamId: se.emsE_Id,
                    subexamName: se.emsE_SubExamName,
                    maxMarks: se.eycessE_MaxMarks,
                    minMarks: se.eycessE_MinMarks,
                    marksEntryMax: se.eycessE_MarksEntryMax
                }))
            });

            setIsStudentsGridOpen(true);
            toast.success('Data loaded successfully');
        } catch (error: any) {
            console.error('Search error:', error);
            toast.error(error?.message || 'Failed to fetch data');
            setIsStudentsGridOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, [ASMAY_Id, ASMCL_Id, ASMS_Id, EME_Id, ISMS_Id]);

    /* ============================================
       Effect to trigger search when params change
       ============================================ */
    useEffect(() => {
        handleSearch();
    }, [handleSearch]);

    /* ============================================
       Mapping Functions
       ============================================ */
    const mapMarksSimple = (
        students: StudentMarksEntry[],
        savedStudents: StudentMarksEntry[],
        answerSheets?: any[]
    ): StudentMarksEntry[] => {
        return students.map((student) => {
            const saved = savedStudents.find((s) => s.amsT_Id === student.amsT_Id);
            if (saved) {
                let marksValue = '';

                if (subjectMeta?.marksGradeEntryFlg === 'M') {
                    if (saved.estM_Flg && saved.estM_Flg.trim() !== '') {
                        marksValue = saved.estM_Flg;
                    } else if (saved.estM_Marks !== undefined && saved.estM_Marks !== null) {
                        marksValue = String(saved.estM_Marks);
                    }
                } else if (subjectMeta?.marksGradeEntryFlg === 'G') {
                    if (saved.estM_Flg && saved.estM_Flg.trim() !== '') {
                        marksValue = saved.estM_Flg;
                    } else if (saved.estM_Grade) {
                        marksValue = saved.estM_Grade;
                    }
                }

                // Add answer sheet info
                if (answerSheets) {
                    const answerSheet = answerSheets.find((as) => as.estM_Id === saved.estM_Id);
                    if (answerSheet) {
                        student.estmanssH_FileLocation = answerSheet.estmanssH_FileLocation;
                    }
                }

                return {
                    ...student,
                    selected: true,
                    ESTM_Marks: marksValue
                };
            }
            return student;
        });
    };

    /* ============================================
       Update Functions
       ============================================ */
    const updateSimpleMark = (studentId: number, newMark: number | '' | string) => {
        setStudents((prev) =>
            prev.map((student) => {
                if (student.amsT_Id === studentId) {
                    return {
                        ...student,
                        ESTM_Marks: newMark
                    };
                }
                return student;
            })
        );

        // Update temp marks list
        updateTempMarksListSimple(studentId, newMark);
    };

    const updateTempMarksListSimple = (studentId: number, value: number | '' | string) => {
        const student = students.find((s) => s.amsT_Id === studentId);
        if (!student || !subjectMeta) return;

        if (value === '') {
            // Remove from temp list
            setTempSubsMarksList((prev) => prev.filter((item) => !(item.AMST_Id === studentId && item.ISMS_Id === student.ismS_Id)));
            return;
        }

        const newEntry: SavedMarksEntry = {
            AMST_Id: studentId,
            ISMS_Id: student.ismS_Id,
            ESTM_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
            ESTM_Marks: 0,
            ESTM_Grade: null,
            ESTM_Flg: null
        };

        if (subjectMeta.marksGradeEntryFlg === 'M') {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTM_Flg = value.toUpperCase();
                newEntry.ESTM_Marks = 0;
            } else {
                const numValue = Number.parseFloat(value as string);
                if (!Number.isNaN(numValue)) {
                    newEntry.ESTM_Marks = numValue;
                    newEntry.ESTM_Flg = '';
                }
            }
        } else {
            if (typeof value === 'string' && ['AB', 'L', 'M', 'OD'].includes(value.toUpperCase())) {
                newEntry.ESTM_Flg = value.toUpperCase();
                newEntry.ESTM_Grade = null;
            } else {
                newEntry.ESTM_Grade = value.toString();
                newEntry.ESTM_Flg = '';
            }
        }

        setTempSubsMarksList((prev) => {
            const existingIndex = prev.findIndex((item) => item.AMST_Id === studentId && item.ISMS_Id === student.ismS_Id);

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newEntry;
                return updated;
            } else {
                return [...prev, newEntry];
            }
        });
    };

    /* ============================================
       Arrow Navigation Functions
       ============================================ */
    const handleArrowNavigation = (rowIndex: number, colIndex: number, direction: 'left' | 'right' | 'up' | 'down') => {
        let nextRow = rowIndex;
        let nextCol = colIndex;

        if (direction === 'left') {
            nextCol = Math.max(0, colIndex - 1);
        } else if (direction === 'right') {
            nextCol = Math.min(getMaxColumnIndex(), colIndex + 1);
        } else if (direction === 'up') {
            nextRow = Math.max(0, rowIndex - 1);
        } else if (direction === 'down') {
            nextRow = Math.min(students.length - 1, rowIndex + 1);
        }

        inputRefs.current[nextRow]?.[nextCol]?.focus();
    };

    const getMaxColumnIndex = () => {
        if (!subjectMeta) return 0;

        if (!subjectMeta.subsubFlag && !subjectMeta.subexamFlag) {
            return 0; // Simple marks column
        } else if (subjectMeta.subsubFlag) {
            return subjectMeta.subsubData.length - 1;
        } else if (subjectMeta.subexamFlag) {
            return subjectMeta.subexamData.length - 1;
        }
        return 0;
    };

    /* ============================================
       Selection Functions
       ============================================ */
    const toggleAllSelection = () => {
        const newAllSelected = !allSelected;
        setAllSelected(newAllSelected);
        setStudents((prev) =>
            prev.map((student) => ({
                ...student,
                selected: newAllSelected
            }))
        );
    };

    const toggleStudentSelection = (studentId: number) => {
        setStudents((prev) =>
            prev.map((student) => (student.amsT_Id === studentId ? { ...student, selected: !student.selected } : student))
        );
    };

    /* ============================================
       Save Functions
       ============================================ */
    const handleSave = async (verifyflg?: string) => {
        if (!subjectMeta) {
            toast.error('No subject data available');
            return;
        }

        const selectedStudents = students.filter((s) => s.selected);
        if (selectedStudents.length === 0) {
            toast.error('Select Students For Saving Marks...');
            return;
        }

        // Simple check: If tempSubsMarksList has any entries with empty or invalid marks
        // and those students are selected, then show error
        let hasErrors = false;

        // Check based on subject type
        if (!subjectMeta.subsubFlag && !subjectMeta.subexamFlag) {
            // Simple subject check
            selectedStudents.forEach((student) => {
                const tempMark = tempSubsMarksList.find((t) => t.AMST_Id === student.amsT_Id && t.ISMS_Id === student.ismS_Id);

                // Check if mark exists in temp list but is invalid
                if (tempMark) {
                    // Check for special flags in marks mode
                    if (subjectMeta.marksGradeEntryFlg === 'M') {
                        if (tempMark.ESTM_Flg && !['AB', 'L', 'M', 'OD'].includes(tempMark.ESTM_Flg.toUpperCase())) {
                            hasErrors = true;
                        }
                    }
                    // Check for invalid grades in grade mode
                    else if (subjectMeta.marksGradeEntryFlg === 'G') {
                        if (tempMark.ESTM_Grade) {
                            const grade = tempMark.ESTM_Grade.toUpperCase();
                            const validFlags = ['AB', 'L', 'M', 'OD'];

                            if (!validFlags.includes(grade)) {
                                // Check if it's a valid grade in the grade list
                                let isValidGrade = false;

                                // Check paper type grades
                                if (student.papertypeid && paperTypeGradeDetails.length > 0) {
                                    isValidGrade = paperTypeGradeDetails.some(
                                        (gradeDetail) => gradeDetail.emgD_Name.toUpperCase() === grade
                                    );
                                }

                                // Check general grades
                                if (!isValidGrade && gradeDetails.length > 0) {
                                    isValidGrade = gradeDetails.some((g) => g.toUpperCase() === grade);
                                }

                                if (!isValidGrade) {
                                    hasErrors = true;
                                }
                            }
                        }
                    }
                }
            });
        } else {
            // For sub-subject or sub-exam, you'd need to check those specific lists
            // For now, we'll assume no errors if you want to skip validation for these cases
            // Or implement similar logic based on your data structure
        }

        // If any errors exist, show toast and return
        if (hasErrors) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        // Get current timestamp
        const currentTimestamp = new Date().toISOString();

        // Prepare main_save_list with correct field names
        const mainSaveList = selectedStudents.map((student) => {
            const tempMarks = tempSubsMarksList.find((t) => t.AMST_Id === student.amsT_Id && t.ISMS_Id === student.ismS_Id);

            return {
                amsT_Id: student.amsT_Id,
                amsT_FirstName: student.amsT_FirstName,
                amsT_AdmNo: student.amsT_AdmNo,
                amsT_RegistrationNo: student.amsT_RegistrationNo || '',
                amaY_RollNo: student.amaY_RollNo,
                ismS_Id: student.ismS_Id,
                ismS_SubjectName: student.ismS_SubjectName,
                eyceS_MaxMarks: student.eyceS_MaxMarks,
                eyceS_MinMarks: student.eyceS_MinMarks,
                eyceS_MarksEntryMax: student.eyceS_MarksEntryMax,
                estM_Marks: tempMarks?.ESTM_Marks || 0,
                estM_Grade: tempMarks?.ESTM_Grade || '',
                estM_Flg: tempMarks?.ESTM_Flg || '',
                estM_Id: 0, // Default value for new entries
                param: '',
                amsT_Sex: '',
                estmanssH_Id: 0,
                estmanssH_AnswerSheet: student.estmanssH_AnswerSheet || '',
                estmanssH_FileLocation: student.estmanssH_FileLocation || ''
            };
        });

        // Prepare temp_subs_marks_list based on scenario
        let tempSubsMarksListFormatted: any[] = [];

        // For simple subject (no sub-subject or sub-exam)
        if (!subjectMeta.subsubFlag && !subjectMeta.subexamFlag) {
            tempSubsMarksListFormatted = selectedStudents.map((student) => {
                const tempMarks = tempSubsMarksList.find((t) => t.AMST_Id === student.amsT_Id && t.ISMS_Id === student.ismS_Id);

                return {
                    estmsS_Id: 0,
                    amsT_Id: student.amsT_Id,
                    emsS_Id: 0, // No sub-subject
                    ismS_Id: student.ismS_Id,
                    emsE_Id: 0, // No sub-exam
                    estmsS_Marks: tempMarks?.ESTM_Marks || 0,
                    estmsS_MarksGradeFlg: subjectMeta.marksGradeEntryFlg,
                    estmsS_Grade: tempMarks?.ESTM_Grade || '',
                    estmsS_Flg: tempMarks?.ESTM_Flg || '',
                    estmsS_ActiveFlg: true
                };
            });
        }

        // Build the complete payload matching the AngularJS structure
        const saveData = {
            createdDate: currentTimestamp,
            updatedDate: currentTimestamp,
            emsS_Id: 0, // Default value
            asmaY_Id: ASMAY_Id!,
            asmcL_Id: ASMCL_Id!,
            asmS_Id: ASMS_Id!,
            emE_Id: EME_Id!,
            ismS_Id: ISMS_Id!,
            subject_details: [
                {
                    createdDate: currentTimestamp,
                    updatedDate: currentTimestamp,
                    eyceS_Id: 0,
                    eycE_Id: 0,
                    ismS_Id: ISMS_Id!,
                    emgR_Id: 0,
                    eyceS_MarksEntryMax: selectedStudents[0]?.eyceS_MarksEntryMax || 0,
                    eyceS_MaxMarks: selectedStudents[0]?.eyceS_MaxMarks || 0,
                    eyceS_MinMarks: selectedStudents[0]?.eyceS_MinMarks || 0,
                    eyceS_SubExamFlg: subjectMeta.subexamFlag,
                    eyceS_SubSubjectFlg: subjectMeta.subsubFlag,
                    eyceS_MarksGradeEntryFlg: subjectMeta.marksGradeEntryFlg,
                    eyceS_MarksDisplayFlg: true,
                    eyceS_GradeDisplayFlg: true,
                    eyceS_AplResultFlg: true,
                    eyceS_ActiveFlg: true,
                    eyceS_SubjectOrder: 0
                }
            ],
            eyceS_MarksGradeEntryFlg: subjectMeta.marksGradeEntryFlg,
            eyceS_SubSubjectFlg: subjectMeta.subsubFlag,
            subject_subsubjects: [], // Will be populated if sub-subject exists
            eyceS_SubExamFlg: subjectMeta.subexamFlag,
            subject_subexams: [], // Will be populated if sub-exam exists
            emgR_Id: 0,
            grade_details: [], // Will be populated if grade entry mode
            amaY_RollNo: 0,
            iP4: '', // You might want to get client IP here
            studentList: [], // This might be different from main_save_list
            get_student_wise_papertype_list: [],
            subsubject_gradedetails: [],
            subexam_gradedetails: [],
            main_save_list: mainSaveList,
            temp_subs_marks_list: tempSubsMarksListFormatted,
            saved_studentList: [], // Will be populated from server response
            marksdeleteflag: marksDeleteFlag,
            saved_sub_subject_exam_list: [],
            saved_sub_subject_list: [],
            saved_sub_subjectOrExam_list: [],
            configuration: [],
            subsubjectlist: [],
            subexamlist: [],
            savedMarksCount: mainSaveList.length,
            lastDateEntry: 0,
            lastDateEntryFlag: true,
            lastDateExam: 0,
            lastDateExamFlag: true,
            marksEntryStateDate: currentTimestamp,
            pagename: 'School',
            ivrmmaP_AddFlg: true,
            ivrmmaP_UpdateFlg: true,
            get_papertype_grade_details: [],
            answer_sheet: []
        };

        // Add orderflag for verification if provided
        if (verifyflg) {
            (saveData as any).orderflag = verifyflg;
        }

        console.log('Save payload:', saveData);

        try {
            // Call the actual API with the properly formatted payload
            const response = await addOrUpdateStudentMarks(saveData);

            if (response.success || response.returnval === true) {
                toast.success('Data saved successfully');
                // Clear temp marks list after successful save
                setTempSubsMarksList([]);

                // Optionally refresh data or show success message
                if (onSave) {
                    await onSave(saveData);
                }
            } else {
                toast.error(response.message || 'Failed to save data');
            }
        } catch (error: any) {
            console.error('Error saving marks:', error);
            toast.error(error.message || 'Failed to save data');
        }
    };
    const handleSaveVerify = () => {
        toast.custom((t) => (
            <div className='rounded-lg border bg-white p-4 shadow-lg'>
                <h3 className='mb-2 font-semibold text-lg'>Are You Sure?</h3>
                <p className='mb-4'>
                    Once verified, the marks will be frozen and cannot be updated. Do you want to proceed with verification?
                </p>
                <div className='flex justify-end gap-2'>
                    <Button variant='outline' onClick={() => toast.dismiss(t)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            handleSave('V');
                            toast.dismiss(t);
                        }}>
                        Yes, Verify It!
                    </Button>
                </div>
            </div>
        ));
    };

    const handleSaveMarks = () => {
        if (marksDeleteFlag) {
            toast.custom((t) => (
                <div className='rounded-lg border bg-white p-4 shadow-lg'>
                    <h3 className='mb-2 font-semibold text-lg'>Are You Sure?</h3>
                    <p className='mb-4'>
                        Marks Already Calculated, If You Update The Marks You Need To Recalculate Marks Again..Do You Want To Continue ..!?
                    </p>
                    <div className='flex justify-end gap-2'>
                        <Button variant='outline' onClick={() => toast.dismiss(t)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                handleSave('');
                                toast.dismiss(t);
                            }}>
                            Yes, Update It!
                        </Button>
                    </div>
                </div>
            ));
        } else {
            handleSave('');
        }
    };

    /* ============================================
       Render Table
       ============================================ */
    const renderTable = () => {
        if (!subjectMeta || students.length === 0) {
            return null;
        }

        // Initialize input refs array
        if (!inputRefs.current.length) {
            inputRefs.current = Array(students.length)
                .fill(null)
                .map(() => []);
        }

        const baseColumnsCount = 6; // Select, SL NO, Name, RegNo, AdmNo, RollNo
        let totalColumns = baseColumnsCount;

        if (subjectMeta.subsubFlag) {
            totalColumns += subjectMeta.subsubData.length + 1; // Sub subjects + TOTAL
        } else if (subjectMeta.subexamFlag) {
            totalColumns += subjectMeta.subexamData.length + 1; // Sub exams + TOTAL
        } else {
            totalColumns += 1; // Simple marks
        }

        return (
            <div className='mt-4 overflow-x-auto rounded border bg-white shadow-sm'>
                <table className='min-w-full table-fixed border-collapse border border-gray-300 [&_td]:border [&_td]:border-gray-300 [&_th]:border'>
                    <thead>
                        <tr>
                            <TableHeaderCell rowSpan={subjectMeta.subsubFlag || subjectMeta.subexamFlag ? 3 : 2}>
                                <div className='flex items-center justify-center'>
                                    <input
                                        type='checkbox'
                                        checked={allSelected}
                                        onChange={toggleAllSelection}
                                        className='rounded accent-white'
                                    />
                                </div>
                            </TableHeaderCell>
                            <TableHeaderCell rowSpan={subjectMeta.subsubFlag || subjectMeta.subexamFlag ? 3 : 2}>SL NO</TableHeaderCell>
                            <TableHeaderCell rowSpan={subjectMeta.subsubFlag || subjectMeta.subexamFlag ? 3 : 2} className='text-left'>
                                Student Name
                            </TableHeaderCell>

                            {(!config || config.exmConfig_RegnoColumnDisplay) && (
                                <TableHeaderCell rowSpan={subjectMeta.subsubFlag || subjectMeta.subexamFlag ? 3 : 2}>
                                    Reg No
                                </TableHeaderCell>
                            )}

                            {(!config || config.exmConfig_AdmnoColumnDisplay) && (
                                <TableHeaderCell rowSpan={subjectMeta.subsubFlag || subjectMeta.subexamFlag ? 3 : 2}>
                                    Admission No
                                </TableHeaderCell>
                            )}

                            {(!config || config.exmConfig_RollnoColumnDisplay) && (
                                <TableHeaderCell rowSpan={subjectMeta.subsubFlag || subjectMeta.subexamFlag ? 3 : 2}>
                                    Roll No
                                </TableHeaderCell>
                            )}

                            {subjectMeta.subsubFlag ? (
                                <TableHeaderCell colSpan={subjectMeta.subsubData.length + 1}>
                                    <div className='font-semibold'>{`${subjectMeta.subjectName} (M-${subjectMeta.maxMarks})`}</div>
                                    <div className='text-[12px]'>{`(ME-${subjectMeta.minMarks})`}</div>
                                </TableHeaderCell>
                            ) : subjectMeta.subexamFlag ? (
                                <TableHeaderCell colSpan={subjectMeta.subexamData.length + 1}>
                                    <div className='font-semibold'>{`${subjectMeta.subjectName} (M-${subjectMeta.maxMarks})`}</div>
                                    <div className='text-[12px]'>{`(ME-${subjectMeta.minMarks})`}</div>
                                </TableHeaderCell>
                            ) : (
                                <TableHeaderCell>
                                    <div className='font-semibold'>{`${subjectMeta.subjectName} (M-${subjectMeta.maxMarks})`}</div>
                                    <div className='text-[12px]'>{`(ME-${subjectMeta.minMarks})`}</div>
                                </TableHeaderCell>
                            )}
                        </tr>

                        {(subjectMeta.subsubFlag || subjectMeta.subexamFlag) && (
                            <tr>
                                {subjectMeta.subsubFlag ? (
                                    <>
                                        {subjectMeta.subsubData.map((ss) => (
                                            <TableHeaderCell key={ss.subsubId}>
                                                <div className='font-semibold text-sm'>{ss.subsubName}</div>
                                                <div className='text-[11px]'>{`(M-${ss.maxMarks}) (ME-${ss.minMarks || 0})`}</div>
                                            </TableHeaderCell>
                                        ))}
                                        <TableHeaderCell>
                                            <div className='font-semibold text-sm'>TOTAL</div>
                                            <div className='text-[11px]'>{`(M-${subjectMeta.maxMarks})`}</div>
                                        </TableHeaderCell>
                                    </>
                                ) : subjectMeta.subexamFlag ? (
                                    <>
                                        {subjectMeta.subexamData.map((se) => (
                                            <TableHeaderCell key={se.subexamId}>
                                                <div className='font-semibold text-sm'>{se.subexamName}</div>
                                                <div className='text-[11px]'>{`(M-${se.maxMarks}) (ME-${se.minMarks || 0})`}</div>
                                            </TableHeaderCell>
                                        ))}
                                        <TableHeaderCell>
                                            <div className='font-semibold text-sm'>EXAM TOTAL</div>
                                            <div className='text-[11px]'>{`(M-${subjectMeta.maxMarks})`}</div>
                                        </TableHeaderCell>
                                    </>
                                ) : null}
                            </tr>
                        )}
                    </thead>

                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <TableCell colSpan={totalColumns} className='py-8 text-center text-gray-500 text-sm'>
                                    No Records Found
                                </TableCell>
                            </tr>
                        ) : (
                            students.map((student, rowIndex) => {
                                // Calculate totals if needed
                                const subsum = 0; // You would need to calculate this based on sub-subject marks
                                const examsum = 0; // You would need to calculate this based on sub-exam marks
                                const subOver = subjectMeta.subsubFlag ? subsum > subjectMeta.maxMarks : false;
                                const examOver = subjectMeta.subexamFlag ? examsum > subjectMeta.maxMarks : false;

                                return (
                                    <tr key={student.amsT_Id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <TableCell className='text-center'>
                                            <input
                                                type='checkbox'
                                                checked={student.selected || false}
                                                onChange={(e) => toggleStudentSelection(student.amsT_Id)}
                                                className='rounded accent-[#7C3AED]'
                                            />
                                        </TableCell>
                                        <TableCell className='text-center'>{rowIndex + 1}</TableCell>
                                        <TableCell className='font-center'>{student.amsT_FirstName}</TableCell>

                                        {(!config || config.exmConfig_RegnoColumnDisplay) && (
                                            <TableCell className='text-center'>{student.amsT_RegistrationNo}</TableCell>
                                        )}

                                        {(!config || config.exmConfig_AdmnoColumnDisplay) && (
                                            <TableCell className='text-center'>{student.amsT_AdmNo}</TableCell>
                                        )}

                                        {(!config || config.exmConfig_RollnoColumnDisplay) && (
                                            <TableCell className='text-center'>{student.amaY_RollNo}</TableCell>
                                        )}

                                        {subjectMeta.subsubFlag ? (
                                            <>
                                                {subjectMeta.subsubData.map((subsub, colIndex) => {
                                                    const curValue = ''; // You would need to get this from student.subSubMarks
                                                    return (
                                                        <TableCell key={subsub.subsubId} className='text-center'>
                                                            <div className='flex justify-center'>
                                                                <MarksInputCell
                                                                    value={curValue}
                                                                    max={subsub.maxMarks}
                                                                    min={subsub.minMarks}
                                                                    onChange={(v) => {
                                                                        /* Update sub-subject mark */
                                                                    }}
                                                                    placeholder={
                                                                        subjectMeta.marksGradeEntryFlg === 'M'
                                                                            ? 'Enter Marks...'
                                                                            : 'Enter Grade...'
                                                                    }
                                                                    marksGradeEntryFlg={subjectMeta.marksGradeEntryFlg}
                                                                    gradeDetails={subSubjectGradeDetails.map((g) => g.emgD_Name)}
                                                                    papertypeid={student.papertypeid}
                                                                    papertypeGradeDetails={paperTypeGradeDetails}
                                                                    onValidationError={(error) => {
                                                                        if (error) {
                                                                            toast.error(error);
                                                                        }
                                                                    }}
                                                                    onArrow={(dir) => handleArrowNavigation(rowIndex, colIndex, dir)}
                                                                    ref={(el) => {
                                                                        if (!inputRefs.current[rowIndex]) {
                                                                            inputRefs.current[rowIndex] = [];
                                                                        }
                                                                        inputRefs.current[rowIndex][colIndex] = el;
                                                                    }}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell className='align-top'>
                                                    <div className='flex flex-col items-start'>
                                                        <div className={`px-3 py-1 text-sm ${subOver ? 'font-semibold text-red-600' : ''}`}>
                                                            {subsum}
                                                        </div>
                                                        {subOver && <div className='text-[11px] text-red-600'>Sum exceeds subject max</div>}
                                                    </div>
                                                </TableCell>
                                            </>
                                        ) : subjectMeta.subexamFlag ? (
                                            <>
                                                {subjectMeta.subexamData.map((subexam, colIndex) => {
                                                    const curValue = ''; // You would need to get this from student.subExamMarks
                                                    return (
                                                        <TableCell key={subexam.subexamId} className='text-center'>
                                                            <div className='flex justify-center'>
                                                                <MarksInputCell
                                                                    value={curValue}
                                                                    max={subexam.maxMarks}
                                                                    min={subexam.minMarks}
                                                                    onChange={(v) => {
                                                                        /* Update sub-exam mark */
                                                                    }}
                                                                    placeholder={
                                                                        subjectMeta.marksGradeEntryFlg === 'M'
                                                                            ? 'Enter Marks...'
                                                                            : 'Enter Grade...'
                                                                    }
                                                                    marksGradeEntryFlg={subjectMeta.marksGradeEntryFlg}
                                                                    gradeDetails={subExamGradeDetails.map((g) => g.emgD_Name)}
                                                                    papertypeid={student.papertypeid}
                                                                    papertypeGradeDetails={paperTypeGradeDetails}
                                                                    onValidationError={(error) => {
                                                                        if (error) {
                                                                            toast.error(error);
                                                                        }
                                                                    }}
                                                                    onArrow={(dir) => handleArrowNavigation(rowIndex, colIndex, dir)}
                                                                    ref={(el) => {
                                                                        if (!inputRefs.current[rowIndex]) {
                                                                            inputRefs.current[rowIndex] = [];
                                                                        }
                                                                        inputRefs.current[rowIndex][colIndex] = el;
                                                                    }}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell className='align-top'>
                                                    <div className='flex flex-col items-start'>
                                                        <div
                                                            className={`px-3 py-1 text-sm ${examOver ? 'font-semibold text-red-600' : ''}`}>
                                                            {examsum}
                                                        </div>
                                                        {examOver && (
                                                            <div className='text-[11px] text-red-600'>Sum exceeds subject max</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <TableCell className='text-center'>
                                                <div className='flex justify-center'>
                                                    <MarksInputCell
                                                        value={student.ESTM_Marks || ''}
                                                        max={subjectMeta.maxMarks}
                                                        min={subjectMeta.minMarks}
                                                        onChange={(v) => updateSimpleMark(student.amsT_Id, v)}
                                                        placeholder={
                                                            subjectMeta.marksGradeEntryFlg === 'M' ? 'Enter Marks...' : 'Enter Grade...'
                                                        }
                                                        marksGradeEntryFlg={subjectMeta.marksGradeEntryFlg}
                                                        gradeDetails={gradeDetails}
                                                        papertypeid={student.papertypeid}
                                                        papertypeGradeDetails={paperTypeGradeDetails}
                                                        onValidationError={(error) => {
                                                            if (error) {
                                                                toast.error(error);
                                                            }
                                                        }}
                                                        onArrow={(dir) => handleArrowNavigation(rowIndex, 0, dir)}
                                                        ref={(el) => {
                                                            if (!inputRefs.current[rowIndex]) {
                                                                inputRefs.current[rowIndex] = [];
                                                            }
                                                            inputRefs.current[rowIndex][0] = el;
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    /* ============================================
       Render
       ============================================ */
    return (
        <div className='space-y-4'>
            {/* Loader */}
            {isLoading && (
                <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-8 w-8 animate-spin text-[#7C3AED]' />
                    <span className='ml-2'>Loading data...</span>
                </div>
            )}

            {/* Students Grid */}
            {isStudentsGridOpen && !isLoading && (
                // <CollapsibleSection
                //     title={`Students List (${students.length})`}
                //     defaultOpen={true}
                //     className="mt-4"
                // >
                <div className='space-y-4'>
                    {renderTable()}

                    {/* Action Buttons */}
                    {students.length > 0 && (
                        <div className='flex justify-end gap-2'>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setStudents((prev) => prev.map((s) => ({ ...s, selected: false, ESTM_Marks: '' })));
                                    setAllSelected(false);
                                    setTempSubsMarksList([]);
                                }}>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Clear
                            </Button>

                            {userPrivileges?.canVerify && (
                                <Button onClick={handleSaveVerify} className=' hover:bg-green-700'>
                                    <Save className='mr-2 h-4 w-4' />
                                    Verify & Save
                                </Button>
                            )}

                            <Button onClick={handleSaveMarks} className=' hover:accent/90'>
                                <Save className='mr-2 h-4 w-4' />
                                Save Marks
                            </Button>
                        </div>
                    )}
                </div>
                // </CollapsibleSection>
            )}

            {/* No data message */}
            {!isLoading && !isStudentsGridOpen && (
                <div className='py-8 text-center text-gray-500'>No data available. Please check the selected parameters.</div>
            )}
        </div>
    );
}
