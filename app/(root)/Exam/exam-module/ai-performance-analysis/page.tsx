'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { read, utils } from 'xlsx';
import { ClassAnalysisView } from './_components/class-analysis-view';
import { FileUploader } from './_components/file-uploader';
import { StudentAnalysisView } from './_components/student-analysis-view';

import { analyzeClassPerformance, analyzeStudentPerformance } from '@/server/exam/exam-module/ai-analysis_/ai-analysis';
import type { ClassAnalysis, IndividualAnalysis, StudentPerformance, StudentSubject } from '@/types/exam/exam-module/ai-analysis';
import { StudentTable } from './_components/student-table';

export default function AiPerformanceAnalysisPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [allStudents, setAllStudents] = useState<StudentPerformance[]>([]);
    const [classAnalysis, setClassAnalysis] = useState<ClassAnalysis | null>(null);
    const [selectedStudentName, setSelectedStudentName] = useState<string>('');
    const [studentAnalysis, setStudentAnalysis] = useState<IndividualAnalysis | null>(null);
    const [isAnalyzingStudent, setIsAnalyzingStudent] = useState(false);

    const handleFileSelect = async (file: File) => {
        setIsLoading(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = read(data);

            let students: StudentPerformance[] = [];

            // Iterate through sheets until we find valid data
            for (const sheetName of workbook.SheetNames) {
                const sheet = workbook.Sheets[sheetName];
                const jsonData = utils.sheet_to_json(sheet, { header: 1 }) as any[][];
                const parsed = parseStudentData(jsonData);

                if (parsed.length > 0) {
                    students = parsed;
                    break; // Found valid data, stop searching
                }
            }

            if (students.length === 0) {
                toast.error('No valid student data found in any sheet. Please check the file format.');
                return;
            }

            setAllStudents(students);
            toast.success(`Loaded ${students.length} students`);

            // Reset previous analysis
            setClassAnalysis(null);
            setStudentAnalysis(null);
            setSelectedStudentName('');
        } catch (error: any) {
            console.error(error);
            toast.error('Error parsing file: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClassAnalysis = async () => {
        if (!allStudents.length) return;

        setIsLoading(true);
        try {
            const sortedStudents = [...allStudents].sort((a, b) => b.averageScore - a.averageScore);
            const top5 = sortedStudents.slice(0, 5);
            const weak5 = sortedStudents.slice(-5);

            const analysisData = {
                totalStudents: allStudents.length,
                topPerformers: top5,
                weakPerformers: weak5.reverse() // Show weakest first
            };

            const result = await analyzeClassPerformance(analysisData);
            setClassAnalysis(result);
            toast.success('Class analysis complete');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudentAnalysis = async () => {
        const student = allStudents.find((s) => s.name === selectedStudentName);
        if (!student) return;

        setIsAnalyzingStudent(true);
        try {
            const reportData = {
                studentInfo: {
                    name: student.name,
                    averageScore: student.averageScore,
                    totalScore: student.totalScore
                },
                subjects: student.subjects
            };

            const result = await analyzeStudentPerformance(reportData);
            setStudentAnalysis(result);
            toast.success(`Analysis for ${student.name} complete`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsAnalyzingStudent(false);
        }
    };

    // Helper to find data start row and subject columns (Advanced logic for School Sheets)
    const parseStudentData = (data: any[][]): StudentPerformance[] => {
        if (data.length < 2) return [];

        let headerRowIndex = -1;
        const subjectIndices: number[] = [];
        let nameIndex = -1;

        // 1. DYNAMIC HEADER DETECTION - CELL BY CELL SCAN
        // Scan first 50 rows to find the "Student Name" header cell explicitly
        outerLoop: for (let i = 0; i < Math.min(50, data.length); i++) {
            const row = data[i];
            if (!row) continue;

            for (let j = 0; j < row.length; j++) {
                const cell = String(row[j] || '')
                    .toLowerCase()
                    .trim();

                // Strong signal: Exact match or variations of "Student Name"
                if (cell === 'student name' || cell === 'name of student' || cell === 'candidate name' || cell === 'studentname') {
                    headerRowIndex = i;
                    nameIndex = j;
                    break outerLoop;
                }
            }
        }

        // Fallback: If no explicit "Student Name" cell found, find row with "Name" and "Total" or similar context
        if (headerRowIndex === -1) {
            for (let i = 0; i < Math.min(50, data.length); i++) {
                const rowStr = (data[i] || []).join(' ').toLowerCase();
                if (rowStr.includes('name') && (rowStr.includes('total') || rowStr.includes('class') || rowStr.includes('english'))) {
                    headerRowIndex = i;
                    // Try to find name col in this row
                    const row = data[i];
                    row.forEach((c, idx) => {
                        if (String(c).toLowerCase().includes('name') && nameIndex === -1) nameIndex = idx;
                    });
                    break;
                }
            }
        }

        if (headerRowIndex === -1) return []; // Can't parse

        // 2. IDENTIFY COLUMNS
        const headerRow = data[headerRowIndex];
        const excludeKeywords = [
            'sl',
            'no',
            'id',
            'rank',
            'total',
            'avg',
            'average',
            'grade',
            'result',
            'class',
            'section',
            'division',
            'percentage',
            'attendance',
            'remarks',
            'pass',
            'fail',
            'promoted'
        ];

        // If name index still not found but we have a header row, guess it (col 1 or 2, usually after Sl No)
        if (nameIndex === -1) {
            const firstCell = String(headerRow[0] || '').toLowerCase();
            nameIndex = firstCell.includes('sl') || firstCell.includes('no') ? 1 : 0;
        }

        headerRow.forEach((cell, idx) => {
            if (idx === nameIndex) return; // Skip name col
            if (!cell) return;

            const val = String(cell).toLowerCase().trim();
            const cleanVal = val.replace(/[^a-z]/g, ''); // strict check

            // Check against exclude list
            // We use cleaner matching: if the cell matches exactly a keyword, or "keyword no", or "keyword."
            const isExcluded = excludeKeywords.some(
                (ex) => val === ex || val === `${ex} no` || val === `${ex}.` || val === `${ex} .` || val === `student ${ex}`
            );

            // Also exclude generic mostly-empty headers or known metadata
            if (!isExcluded && cleanVal.length > 2) {
                subjectIndices.push(idx);
            }
        });

        // 3. EXTRACT STUDENT DATA
        const students: StudentPerformance[] = [];

        // Start parsing rows AFTER the header
        for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || !row[nameIndex]) continue;

            // Check if this is a valid student row (and not a summary row at the bottom)
            const name = String(row[nameIndex]).trim();
            if (!name || name.toLowerCase().includes('total') || name.toLowerCase().includes('class average')) continue;

            const subjects: StudentSubject[] = [];

            subjectIndices.forEach((colIdx) => {
                const cellVal = row[colIdx];
                if (cellVal === undefined || cellVal === null || cellVal === '') return;

                let score = 0;
                let isValidScore = false;

                // Value handling: "59 | C", "59", "AB", "Abst", "59.5"
                const cellStr = String(cellVal).trim();

                // Skip absent/empty
                if (['ab', 'absent', '-', 'na', 'nil', 'abst'].includes(cellStr.toLowerCase())) return;

                // Regex to extract the first number found in the cell (integers or decimals)
                // This handles "59", "59.5", "59 | C", "59(A)", "59 [B]"
                // We use a boundary check or start check to avoid picking up random numbers in remarks
                const match = cellStr.match(/^([0-9]+(\.[0-9]+)?)/);

                if (match) {
                    score = Number.parseFloat(match[0]);
                    isValidScore = true;
                }

                if (isValidScore) {
                    // Normalize subject name
                    let subjectName = String(headerRow[colIdx])
                        .replace(/\(.*\)/g, '')
                        .replace(/\[.*\]/g, '')
                        .replace(/\|.*/g, '')
                        .trim();

                    // If subject name became empty (e.g. it was just "(Max 100)"), fallback
                    if (!subjectName || subjectName.length < 2) subjectName = `Subject ${colIdx}`;

                    // Sanity check: score shouldn't be ridiculous (unless it's out of >100, checking 0-200 to be safe for some boards)
                    if (score >= 0 && score <= 200) {
                        subjects.push({
                            subject: subjectName,
                            score: score,
                            maxScore: 100, // Assuming 100 for now, could infer from max valid score later
                            percentage: score > 100 ? score / 2 : score // Rough heuristic if out of 200
                        });
                    }
                }
            });

            if (subjects.length > 0) {
                const total = Number(subjects.reduce((sum, s) => sum + s.score, 0).toFixed(2));
                const avg = Number((total / subjects.length).toFixed(2));

                students.push({
                    name,
                    index: i,
                    subjects,
                    totalScore: total,
                    averageScore: avg,
                    subjectCount: subjects.length
                });
            }
        }

        return students;
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4 md:p-6'>
                <div className='flex flex-col gap-2'>
                    <h1 className='font-bold text-3xl tracking-tight'>AI Performance Analysis</h1>
                    <p className='text-muted-foreground'>Analyze performance metrics and AI-driven insights.</p>
                </div>
                <Separator />

                {/* Step 1: Upload */}
                <CollapsibleSection
                    title='1. Data Upload'
                    description='Upload class cumulative report (CSV/Excel)'
                    defaultOpen={!allStudents.length}>
                    <div className='p-4'>
                        <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />

                        {allStudents.length > 0 && (
                            <div className='mt-6 space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h3 className='font-semibold text-lg'>📄 Uploaded Report Data</h3>
                                        <p className='text-muted-foreground text-sm'>{allStudents.length} students found</p>
                                    </div>
                                </div>

                                <StudentTable students={allStudents} />

                                <div className='flex justify-end border-t pt-4'>
                                    <Button onClick={handleClassAnalysis} disabled={isLoading} size='lg' className='w-full sm:w-auto'>
                                        {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                                        Analyze Class Performance
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Step 2: Class Analysis */}
                {classAnalysis && (
                    <CollapsibleSection
                        title='2. Class Performance Overview'
                        description='AI-generated insights for the entire class'
                        defaultOpen={true}>
                        <div className='p-4'>
                            <ClassAnalysisView analysis={classAnalysis} />
                        </div>
                    </CollapsibleSection>
                )}

                {/* Step 3: Individual Analysis */}
                {allStudents.length > 0 && (
                    <CollapsibleSection
                        title='3. Individual Student Analysis'
                        description='Deep dive into specific student performance'
                        defaultOpen={false}>
                        <div className='space-y-4 p-4'>
                            <div className='flex items-end gap-4'>
                                <div className='max-w-md flex-1 space-y-2'>
                                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                    <label className='font-medium text-sm'>Select Student</label>
                                    <Select value={selectedStudentName} onValueChange={setSelectedStudentName}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Choose a student...' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allStudents.map((s, i) => (
                                                <SelectItem key={i} value={s.name}>
                                                    {s.name} (Avg: {s.averageScore}%)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleStudentAnalysis}
                                    disabled={!selectedStudentName || isAnalyzingStudent}
                                    variant='secondary'>
                                    {isAnalyzingStudent ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                                    Get Individual Analysis
                                </Button>
                            </div>

                            {studentAnalysis && selectedStudentName && (
                                <div className='mt-6 border-t pt-6'>
                                    <StudentAnalysisView
                                        student={allStudents.find((s) => s.name === selectedStudentName)!}
                                        analysis={studentAnalysis}
                                    />
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
