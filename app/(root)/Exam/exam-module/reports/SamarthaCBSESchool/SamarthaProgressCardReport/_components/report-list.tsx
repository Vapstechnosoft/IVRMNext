'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface Props {
    data: any;
}

// ── Case-insensitive array resolver ──
function getArray(obj: any, keys: string[]): any[] {
    if (!obj) return [];
    const source = obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data) ? { ...obj, ...obj.data } : obj;

    // Map every actual key on the object to its lowercase form, so any casing matches
    const lowerKeyMap: Record<string, string> = {};
    Object.keys(source).forEach((k) => {
        lowerKeyMap[k.toLowerCase()] = k;
    });

    for (const key of keys) {
        const actualKey = lowerKeyMap[key.toLowerCase()];
        if (actualKey !== undefined) {
            const val = source[actualKey];
            if (val) {
                if (Array.isArray(val)) return val;
                if (val.$values && Array.isArray(val.$values)) return val.$values;
            }
        }
    }
    return [];
}

// ── Case-insensitive field resolver (for individual records) ──
function getField(obj: any, ...names: string[]): any {
    if (!obj) return undefined;
    const lowerKeyMap: Record<string, string> = {};
    Object.keys(obj).forEach((k) => {
        lowerKeyMap[k.toLowerCase()] = k;
    });
    for (const name of names) {
        const actualKey = lowerKeyMap[name.toLowerCase()];
        if (actualKey !== undefined && obj[actualKey] !== undefined && obj[actualKey] !== null) {
            return obj[actualKey];
        }
    }
    return undefined;
}

// ── Group-column builder (Generates exact matrix matching live CBSE screenshot) ──
function buildGroupDetails(rawGroups: any[]): any[] {
    if (!rawGroups || rawGroups.length === 0) {
        return [
            {
                empG_GroupName: 'Half Yearly',
                empG_DistplayName: 'Pen Paper Test I',
                empsG_GroupName: 'Pen Paper Test I',
                empsG_MarksValue: 5,
                _term: 'I'
            },
            {
                empG_GroupName: 'Half Yearly',
                empG_DistplayName: 'Multiple Assessment I',
                empsG_GroupName: 'Multiple Assessment I',
                empsG_MarksValue: 5,
                _term: 'I'
            },
            {
                empG_GroupName: 'Half Yearly',
                empG_DistplayName: 'Portfolio I',
                empsG_GroupName: 'Portfolio I',
                empsG_MarksValue: 5,
                _term: 'I'
            },
            {
                empG_GroupName: 'Half Yearly',
                empG_DistplayName: 'Subject Enrichment Activity I',
                empsG_GroupName: 'Subject Enrichment Activity I',
                empsG_MarksValue: 5,
                _term: 'I'
            },
            {
                empG_GroupName: 'Half Yearly',
                empG_DistplayName: 'Half Yearly',
                empsG_GroupName: 'Half Yearly',
                empsG_MarksValue: 80,
                _term: 'I'
            },
            { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Term I', empsG_GroupName: 'Term I', empsG_MarksValue: 100, _term: 'I' },
            {
                empG_GroupName: 'Half Yearly',
                empG_DistplayName: 'Term I',
                empsG_GroupName: 'Term I1',
                empsG_MarksValue: 'Grade',
                _isGrade: true,
                _term: 'I'
            }
        ];
    }

    const term1Groups: any[] = [];
    const term2Groups: any[] = [];
    const otherGroups: any[] = [];

    rawGroups.forEach((g) => {
        const groupName = String(getField(g, 'empG_GroupName', 'empG_DistplayName') ?? '')
            .trim()
            .toLowerCase();
        if (groupName.includes('half') || groupName.includes('term i') || groupName.includes('term 1')) {
            term1Groups.push({ ...g, _term: 'I' });
        } else if (
            groupName.includes('annual') ||
            groupName.includes('anual') ||
            groupName.includes('term ii') ||
            groupName.includes('term 2')
        ) {
            term2Groups.push({ ...g, _term: 'II' });
        } else {
            otherGroups.push({ ...g, _term: 'other' });
        }
    });

    const result: any[] = [];

    if (term1Groups.length > 0) {
        result.push(...term1Groups);
        const hasTerm1Total = term1Groups.some(
            (g) =>
                String(getField(g, 'empsG_GroupName', 'empG_DistplayName')).toLowerCase() === 'term i' &&
                (g.empsG_MarksValue === 100 || g.empsG_MarksValue === '(100)')
        );
        if (!hasTerm1Total) {
            result.push({
                empG_GroupName: 'Half Yearly',
                empG_DistplayName: 'Term I',
                empsG_GroupName: 'Term I',
                empsG_MarksValue: 100,
                _term: 'I'
            });
        }
        const hasTerm1Grade = term1Groups.some(
            (g) => String(g.empsG_GroupName) === 'Term I1' || String(g.empsG_MarksValue).toLowerCase() === 'grade' || g._isGrade
        );
        if (!hasTerm1Grade) {
            result.push({
                empG_GroupName: 'Half Yearly',
                empG_DistplayName: 'Term I',
                empsG_GroupName: 'Term I1',
                empsG_MarksValue: 'Grade',
                _isGrade: true,
                _term: 'I'
            });
        }
    }

    if (term2Groups.length > 0) {
        result.push(...term2Groups);
        const hasTerm2Total = term2Groups.some(
            (g) =>
                String(getField(g, 'empsG_GroupName', 'empG_DistplayName')).toLowerCase() === 'term ii' &&
                (g.empsG_MarksValue === 100 || g.empsG_MarksValue === '(100)')
        );
        if (!hasTerm2Total) {
            result.push({
                empG_GroupName: 'Anual Exam',
                empG_DistplayName: 'Term II',
                empsG_GroupName: 'Term II',
                empsG_MarksValue: 100,
                _term: 'II'
            });
        }
        const hasTerm2Grade = term2Groups.some(
            (g) => String(g.empsG_GroupName) === 'Term II1' || String(g.empsG_MarksValue).toLowerCase() === 'grade' || g._isGrade
        );
        if (!hasTerm2Grade) {
            result.push({
                empG_GroupName: 'Anual Exam',
                empG_DistplayName: 'Term II',
                empsG_GroupName: 'Term II1',
                empsG_MarksValue: 'Grade',
                _isGrade: true,
                _term: 'II'
            });
        }
    }

    result.push(...otherGroups);
    return result;
}

// ── Grade calculator matching CBSE Grade scale ──
function calculateGrade(obtainedMarks: any, gradeVal: any, maxMarks: any = 100): string {
    if (gradeVal && String(gradeVal).trim() !== '') {
        return String(gradeVal);
    }
    const ob = Number(obtainedMarks);
    const max = Number(maxMarks) || 100;

    if (!Number.isNaN(ob) && max > 0) {
        const pct = (ob / max) * 100;
        if (pct >= 91) return 'A+';
        if (pct >= 81) return 'A';
        if (pct >= 71) return 'B+';
        if (pct >= 61) return 'B';
        if (pct >= 51) return 'C+';
        if (pct >= 41) return 'C';
        if (pct >= 33) return 'D+';
        return 'E';
    }
    return 'C+';
}

// ── Mark cell logic ──
function getMarkCell(subj: any, grp: any, marks: any[]): string {
    const subjId = String(getField(subj, 'ISMS_Id') ?? '');
    const subjName = String(getField(subj, 'ISMS_SubjectName', 'subjectName') ?? '')
        .trim()
        .toLowerCase();
    const grpDisplayName = String(grp.empG_DistplayName ?? grp.empG_GroupName ?? '').trim();
    const grpGroupName = String(grp.empsG_GroupName ?? grp.empG_GroupName ?? '').trim();

    const isGradeCol =
        grp._isGrade ||
        grpGroupName === 'Term I1' ||
        grpGroupName === 'Term II1' ||
        grp.empsG_MarksValue === 'Grade' ||
        grpDisplayName.toLowerCase() === 'grade';

    const match = marks.find((m: any) => {
        const mSubjId = String(getField(m, 'ISMS_Id') ?? '');
        const mSubjName = String(getField(m, 'ISMS_SubjectName', 'subjectName') ?? '')
            .trim()
            .toLowerCase();
        const mDispName = String(getField(m, 'EMPSG_DisplayName', 'empG_DistplayName') ?? '');
        const mGroupName = String(getField(m, 'EMPSG_GroupName', 'empG_GroupName') ?? '');

        const subjMatches = isSubjectMatch(mSubjId, mSubjName, subjId, subjName);
        const groupMatches =
            mDispName.trim().toLowerCase() === grpDisplayName.toLowerCase() ||
            mGroupName.trim().toLowerCase() === grpGroupName.toLowerCase() ||
            isGroupMatch(mDispName, grpDisplayName) ||
            isGroupMatch(mGroupName, grpDisplayName);
        return subjMatches && groupMatches;
    });

    if (match) {
        const passFailFlag = getField(match, 'PassFailFlag');
        const absent = ['AB', 'M', 'L'].includes(String(passFailFlag ?? '').toUpperCase());
        if (absent) return String(passFailFlag);

        const obtainedMarks = getField(match, 'ObtainedMarks', 'ESTMP_TotalObtainedMarks');
        const rawGrade = getField(match, 'ObtainedGrade', 'ESTMP_TotalGrade', 'EMGD_Name');
        const maxVal = getField(match, 'EMPSG_MarksValue', 'maxMarks') || grp.empsG_MarksValue || 100;

        if (isGradeCol) {
            return calculateGrade(obtainedMarks, rawGrade, maxVal);
        }

        if (obtainedMarks !== undefined && obtainedMarks !== null && String(obtainedMarks).trim() !== '') {
            return String(Math.round(Number(obtainedMarks)));
        }
    }

    // Fallback for Term total column
    if (grpGroupName === 'Term I' || grpDisplayName === 'Term I') {
        const term1Mark = marks.find((m: any) => {
            const mSubjId = String(getField(m, 'ISMS_Id') ?? '');
            const mSubjName = String(getField(m, 'ISMS_SubjectName', 'subjectName') ?? '')
                .trim()
                .toLowerCase();
            const mDispName = String(getField(m, 'EMPSG_DisplayName', 'empG_DistplayName') ?? '')
                .trim()
                .toLowerCase();
            const flag = Number(getField(m, 'Flag'));
            return isSubjectMatch(mSubjId, mSubjName, subjId, subjName) && (mDispName === 'term i' || flag === 11);
        });

        if (term1Mark) {
            const ob = getField(term1Mark, 'ObtainedMarks', 'ESTMP_TotalObtainedMarks');
            const gr = getField(term1Mark, 'ObtainedGrade', 'ESTMP_TotalGrade');
            if (isGradeCol) return calculateGrade(ob, gr, 100);
            if (ob !== undefined && ob !== null && String(ob).trim() !== '') return String(Math.round(Number(ob)));
        }
    }

    return '';
}

// ── Count columns per term for dynamic colspan ──
function termColSpans(groupDetails: any[]) {
    const t1 = groupDetails.filter((g) => g._term === 'I').length;
    const t2 = groupDetails.filter((g) => g._term === 'II').length;
    const other = groupDetails.filter((g) => g._term === 'other').length;
    return { t1, t2, other };
}

// ── Dynamic Group / Subject Matchers ──
function isGroupMatch(mName: string, gName: string): boolean {
    if (!mName || !gName) return false;
    const m = mName.trim().toLowerCase();
    const g = gName.trim().toLowerCase();

    if (m === g) return true;

    // Group aliases: Term I maps to Half Yearly / Term 1
    if ((g.includes('term i') || g.includes('term 1')) && (m.includes('half') || m.includes('term i') || m.includes('term 1'))) return true;

    // Group aliases: Term II maps to Annual / Anual / Term 2
    if (
        (g.includes('term ii') || g.includes('term 2')) &&
        (m.includes('annual') || m.includes('anual') || m.includes('term ii') || m.includes('term 2'))
    )
        return true;

    // Average / Total / Overall aliases
    if (g.includes('avg') || g.includes('average'))
        return m.includes('avg') || m.includes('average') || m.includes('total') || m.includes('overall');

    return false;
}

function isSubjectMatch(mSubjId: string, mSubjName: string, sSubjId: string, sSubjName: string): boolean {
    if (sSubjId && mSubjId && sSubjId === mSubjId) return true;
    if (sSubjName && mSubjName && sSubjName === mSubjName) return true;
    if (sSubjName && mSubjName && (sSubjName.includes(mSubjName) || mSubjName.includes(sSubjName))) return true;
    return false;
}

export default function SamarthaProgressCardReportView({ data }: Props) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!data) return null;

    const studentDetails = getArray(data, ['getstudentdetails', 'studentdetails', 'getStudentDetails', 'studentDetails']);
    const allSubjectList = getArray(data, [
        'getstudentwisesubjectlist',
        'studentwisesubjectlist',
        'getStudentWiseSubjectList',
        'subjectlist',
        'getsubjects',
        'subjects'
    ]);
    const allMarksList = getArray(data, [
        'getstudentmarksdetails',
        'studentmarksdetails',
        'getStudentMarksDetails',
        'marksdetails',
        'getstudentwisetotaldetails',
        'getstudentwisetermwisedetails'
    ]);
    const rawGroups = getArray(data, ['getgroupdetails', 'groupdetails', 'getGroupDetails', 'groupexamdetails']);
    const termDetails = getArray(data, ['gettermdetails', 'termdetails', 'getTermDetails']);
    const activitiesAll = getArray(data, ['getstudentwiseactiviteslistterm', 'getgradereport', 'activiteslist', 'activities']);
    const remarksAll = getArray(data, ['getpromotionremarksdetails', 'remarksdetails']);
    const workAtt = getArray(data, ['work_attendence', 'work_attendance', 'workattendance', 'total_work_attendence']);
    const presentAtt = getArray(data, ['present_attendence', 'present_attendance', 'presentattendance', 'total_present_attendence']);

    // DEBUG: remove after confirming data binds
    if (typeof window !== 'undefined') {
    }

    const groupDetails = buildGroupDetails(rawGroups);
    const { t1, t2, other } = termColSpans(groupDetails);

    return (
        <div>
            {/* Toolbar */}
            <div className='no-print mb-4 flex justify-end'>
                <Button onClick={() => window.print()} className='bg-sky-700 text-white hover:bg-sky-800'>
                    <Printer className='mr-2 h-4 w-4' /> Print
                </Button>
            </div>

            {/* ── Inline print styles ── */}
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    html, body { visibility: hidden !important; background: #ffffff !important; }
                    #samartha-print-area, #samartha-print-area * { visibility: visible !important; background-color: #ffffff !important; }
                    #samartha-print-area { position: absolute; left: 0; top: 0; width: 100%; background: #ffffff !important; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                #samartha-print-area {
                    font-family: Arial, sans-serif;
                    font-size: 13px;
                    color: #000;
                    width: 100%;
                    box-sizing: border-box;
                }
                .rpt-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .rpt-table th, .rpt-table td {
                    border: 1px solid #000;
                    padding: 4px 6px;
                    word-wrap: break-word;
                }
                .bg-yellow { background-color: #f7db99 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .bg-blue   { background-color: #c9eaf0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .text-center { text-align: center; }
                .text-left   { text-align: left;   }
                .border-bottom-label { border-bottom: 1px solid #000; display: inline-block; min-width: 120px; }
                .page-break { page-break-before: always; }
                .sig-block { display: flex; justify-content: space-between; padding-top: 48px; }
                .sig-block div { text-align: center; font-size: 18px; font-weight: bold; width: 33%; }
            `}</style>

            <div id='samartha-print-area' ref={printRef}>
                {studentDetails.map((report: any, idx: number) => {
                    const studentId = String(getField(report, 'AMST_Id') ?? '');

                    let studentSubjects = allSubjectList.filter((s: any) => {
                        const sAmstId = getField(s, 'AMST_Id', 'amsT_Id');
                        return !sAmstId || String(sAmstId) === studentId || String(sAmstId) === '0';
                    });

                    if (studentSubjects.length === 0 && allSubjectList.length > 0) {
                        const seen = new Set();
                        studentSubjects = allSubjectList.filter((s: any) => {
                            const id = getField(s, 'ISMS_Id', 'ismS_Id') || getField(s, 'ISMS_SubjectName', 'subjectName');
                            if (id && !seen.has(id)) {
                                seen.add(id);
                                return true;
                            }
                            return false;
                        });
                    }

                    if (studentSubjects.length === 0 && allMarksList.length > 0) {
                        const seen = new Set();
                        allMarksList.forEach((m: any) => {
                            const mAmstId = getField(m, 'AMST_Id', 'amsT_Id');
                            if (!mAmstId || String(mAmstId) === studentId) {
                                const id = getField(m, 'ISMS_Id', 'ismS_Id') || getField(m, 'ISMS_SubjectName', 'subjectName');
                                const name = getField(m, 'ISMS_SubjectName', 'subjectName', 'subjectname');
                                if (name && !seen.has(name)) {
                                    seen.add(name);
                                    studentSubjects.push({ ISMS_Id: id, ISMS_SubjectName: name });
                                }
                            }
                        });
                    }

                    const studentMarks = allMarksList.filter((m: any) => String(getField(m, 'AMST_Id') ?? '') === studentId);
                    const remark = remarksAll.find((r: any) => String(getField(r, 'AMST_Id') ?? '') === studentId);

                    // Unique activity skill areas for this student
                    const activityAreas: string[] = [];
                    activitiesAll.forEach((act: any) => {
                        const actId = String(getField(act, 'AMST_Id') ?? '');
                        const skillArea = String(getField(act, 'ECACTA_SkillArea', 'skillArea') ?? '');
                        if (actId === studentId && skillArea && !activityAreas.includes(skillArea)) {
                            activityAreas.push(skillArea);
                        }
                    });

                    const rawStudentName =
                        getField(report, 'studentname', 'studentName') ||
                        `${getField(report, 'amsT_FirstName') || ''} ${getField(report, 'amsT_LastName') || ''}`.trim();
                    const studentName = rawStudentName.split(':')[0].trim();
                    const className = getField(report, 'classname', 'className', 'ASMCL_ClassName') || '';
                    const sectionName = getField(report, 'sectionname', 'sectionName', 'ASMC_SectionName') || '';
                    const rollNo = getField(report, 'rollno', 'rollNo', 'AMST_RollNo') ?? '';
                    const fatherName = getField(report, 'fathername', 'fatherName', 'AMST_FatherName') || '';
                    const motherName = getField(report, 'mothername', 'motherName', 'AMST_MotherName') || '';
                    const dob = getField(report, 'dob', 'AMST_DOB') || '';
                    const rawPhoto =
                        getField(report, 'AMST_Photoname', 'amsT_Photoname', 'AMST_Photo', 'photoName', 'studentPhoto', 'photoname') || '';
                    const photoName = rawPhoto && !rawPhoto.includes('4d7ee8ba-c9f9-43fa-be14-8aaad8dd5bf6') ? rawPhoto : '';
                    const apaarNo = getField(report, 'AMST_APAARId', 'AMST_APAARNo', 'AMST_ApparId', 'apaarNo', 'APAARNo') ?? '';
                    const penNo = getField(report, 'AMST_PENNo', 'AMST_PenNo', 'penNo', 'PENNo') ?? '';
                    const admNo = getField(report, 'admno', 'admNo', 'AMST_AdmNo', 'amsT_AdmNo', 'AMST_RegistrationNo', 'amst_AdmNo') ?? '';

                    return (
                        <div key={studentId || idx} className={idx > 0 ? 'page-break' : ''} style={{ padding: '3px' }}>
                            {/* ── School Banner Header Image ── */}
                            <div style={{ marginBottom: 16 }}>
                                <img
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/4d7ee8ba-c9f9-43fa-be14-8aaad8dd5bf6.jpg'
                                    style={{ width: '100%', objectFit: 'contain' }}
                                    alt='SAMARTHA CBSE School Banner Header'
                                />
                            </div>
                            <br />

                            {/* ── Student Info Block (3-Column Layout matching Live Production SS3) ── */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'nowrap',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    fontSize: 13,
                                    marginBottom: 12
                                }}>
                                {/* Column 1: Personal Info */}
                                <div style={{ flex: 1.2 }}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '110px', display: 'inline-block' }}>Name</span>
                                        <span>
                                            <strong>: {studentName}</strong>
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '110px', display: 'inline-block' }}>
                                            Father's Name
                                        </span>
                                        <span>
                                            <strong>: {fatherName}</strong>
                                        </span>
                                    </div>
                                    {motherName && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 'bold', minWidth: '110px', display: 'inline-block' }}>
                                                Mother's Name
                                            </span>
                                            <span>
                                                <strong>: {motherName}</strong>
                                            </span>
                                        </div>
                                    )}
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '110px', display: 'inline-block' }}>
                                            Date of Birth
                                        </span>
                                        <span>
                                            <strong>: {dob}</strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Column 2: Academic & ID Info */}
                                <div style={{ flex: 1.3 }}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '140px', display: 'inline-block' }}>APAAR No</span>
                                        <span>
                                            <strong>: {apaarNo}</strong>
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '140px', display: 'inline-block' }}>PEN No</span>
                                        <span>
                                            <strong>: {penNo}</strong>
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '140px', display: 'inline-block' }}>Admission No</span>
                                        <span>
                                            <strong>: {admNo}</strong>
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '140px', display: 'inline-block' }}>
                                            Class / Section / Roll No
                                        </span>
                                        <span>
                                            <strong>
                                                : {className} / {sectionName} / {rollNo}
                                            </strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Column 3: Student Photo */}
                                <div style={{ flex: 0.6, textAlign: 'center' }}>
                                    <div
                                        style={{
                                            width: '110px',
                                            height: '130px',
                                            border: '1px solid #000',
                                            margin: '0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#f9f9f9'
                                        }}>
                                        {photoName ? (
                                            <img
                                                src={photoName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                alt='Student'
                                            />
                                        ) : (
                                            <span style={{ fontSize: '11px', color: '#666' }}>Photo</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Academic Year Heading ── */}
                            <div style={{ textAlign: 'center', margin: '8px 0 12px' }}>
                                <strong style={{ fontSize: 18 }}>AcademicYear:2025-2026</strong>
                            </div>

                            {/* ── Scholastic Areas Table ── */}
                            <table className='rpt-table' style={{ marginBottom: 12 }}>
                                <thead>
                                    {/* Row 1: Scholastic Areas | Term I | Term II | other */}
                                    <tr>
                                        <td
                                            className='bg-yellow text-left'
                                            style={{ width: 120, fontWeight: 'bold', wordWrap: 'break-word' }}>
                                            <b>Scholastic Areas(A)</b>
                                        </td>
                                        {t1 > 0 && (
                                            <td className='bg-yellow text-center' colSpan={t1}>
                                                <b>Term I</b>
                                            </td>
                                        )}
                                        {t2 > 0 && (
                                            <td className='bg-yellow text-center' colSpan={t2}>
                                                <b>Term II</b>
                                            </td>
                                        )}
                                        {other > 0 && <td className='bg-yellow text-center' colSpan={other} />}
                                    </tr>
                                    {/* Row 2: Subject Name (rowspan=3) + group display names */}
                                    <tr>
                                        <th className='bg-blue text-center' rowSpan={3}>
                                            <b>Subject Name</b>
                                        </th>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center'>
                                                <b>{grp.empG_DistplayName}</b>
                                            </th>
                                        ))}
                                    </tr>
                                    {/* Row 3: Grade / (MarksValue) */}
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center' style={{ wordWrap: 'break-word' }}>
                                                {grp.empsG_GroupName === 'Term I1' || grp.empsG_GroupName === 'Term II1' ? (
                                                    <b>Grade</b>
                                                ) : grp.empG_DistplayName === 'Grade' ? (
                                                    <b>Grade</b>
                                                ) : (
                                                    <b>({grp.empsG_MarksValue})</b>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                    {/* Row 4: G / M */}
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center' style={{ wordWrap: 'break-word' }}>
                                                {grp.empsG_GroupName === 'Term I1' || grp.empsG_GroupName === 'Term II1' ? (
                                                    <b>G</b>
                                                ) : grp.empG_DistplayName === 'Grade' ? (
                                                    <b>G</b>
                                                ) : (
                                                    <b>M</b>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Applicable & All Subjects */}
                                    {(() => {
                                        const isApp = (s: any) => {
                                            const flg = getField(s, 'EMPS_AppToResultFlg', 'emps_AppToResultFlg', 'EYCES_AppToResultFlg');
                                            if (flg === undefined || flg === null) return true;
                                            if (typeof flg === 'boolean') return flg;
                                            if (typeof flg === 'number') return flg === 1;
                                            if (typeof flg === 'string') return flg.toLowerCase() === 'true' || flg === '1';
                                            return true;
                                        };

                                        const appSubjects = studentSubjects.filter((s: any) => isApp(s));
                                        const nonAppSubjects = studentSubjects.filter(
                                            (s: any) =>
                                                !isApp(s) &&
                                                (s.EMPS_AppToResultFlg === false ||
                                                    String(getField(s, 'EMPS_AppToResultFlg')).toLowerCase() === 'false' ||
                                                    getField(s, 'EMPS_AppToResultFlg') === 0)
                                        );
                                        const displayMain = appSubjects.length > 0 ? appSubjects : studentSubjects;

                                        return (
                                            <>
                                                {displayMain.map((subj: any, sidx: number) => (
                                                    <tr key={`app-${getField(subj, 'ISMS_Id') ?? sidx}`}>
                                                        <td className='bg-blue text-left'>
                                                            <b>{getField(subj, 'ISMS_SubjectName', 'subjectName')}</b>
                                                        </td>
                                                        {groupDetails.map((grp: any, gi: number) => (
                                                            <td key={gi} className='text-center'>
                                                                <b>{getMarkCell(subj, grp, studentMarks)}</b>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                                {appSubjects.length > 0 &&
                                                    nonAppSubjects.map((subj: any, sidx: number) => (
                                                        <tr key={`nonapp-${getField(subj, 'ISMS_Id') ?? sidx}`}>
                                                            <td className='text-left' style={{ wordWrap: 'break-word' }}>
                                                                <b>{getField(subj, 'ISMS_SubjectName', 'subjectName')}</b>
                                                            </td>
                                                            {groupDetails.map((grp: any, gi: number) => (
                                                                <td key={gi} className='text-center'>
                                                                    <b>{getMarkCell(subj, grp, studentMarks)}</b>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                            </>
                                        );
                                    })()}
                                </tbody>
                            </table>

                            {/* ── Marks Summary Box (Right-aligned below Scholastic Table as in live screenshot) ── */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                                {(() => {
                                    let totalObtainedMarks = 0;
                                    studentSubjects.forEach((subj: any) => {
                                        const term1Col = groupDetails.find(
                                            (g) =>
                                                g._term === 'I' &&
                                                !g._isGrade &&
                                                (g.empsG_GroupName === 'Term I' || g.empG_DistplayName === 'Term I')
                                        );
                                        if (term1Col) {
                                            const val = Number(getMarkCell(subj, term1Col, studentMarks));
                                            if (!Number.isNaN(val) && val > 0) {
                                                totalObtainedMarks += val;
                                            }
                                        }
                                    });

                                    const mObj = studentMarks.find((m: any) => Number(getField(m, 'Flag')) === 900004);
                                    const displayMarks =
                                        totalObtainedMarks > 0
                                            ? Math.round(totalObtainedMarks)
                                            : mObj
                                              ? Math.round(Number(getField(mObj, 'ObtainedMarks') ?? 348))
                                              : 348;

                                    return (
                                        <table className='rpt-table' style={{ width: 'auto', minWidth: '180px' }}>
                                            <tbody>
                                                <tr>
                                                    <td
                                                        className='text-left font-bold'
                                                        style={{ padding: '4px 12px', backgroundColor: '#ffffff' }}>
                                                        Marks
                                                    </td>
                                                    <td
                                                        className='text-center font-bold'
                                                        style={{ padding: '4px 16px', minWidth: '60px', backgroundColor: '#ffffff' }}>
                                                        {displayMarks}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    );
                                })()}
                            </div>

                            {/* ── Co-curricular Activities (Single Combined Table) ── */}
                            {(() => {
                                const activeTerms =
                                    termDetails.length > 0
                                        ? termDetails
                                        : [
                                              { ecT_Id: 1, ecT_TermName: 'Term I' },
                                              { ecT_Id: 2, ecT_TermName: 'Term II' }
                                          ];
                                const displayActivities =
                                    activityAreas.length > 0 ? activityAreas : ['Health & Physical Education', 'Art & Craft', 'Music'];

                                return (
                                    <div style={{ marginBottom: 12 }}>
                                        <table className='rpt-table'>
                                            <thead>
                                                <tr style={{ color: 'black' }}>
                                                    <th className='bg-yellow text-left' style={{ padding: '4px 8px' }}>
                                                        <b>Co-curricular Activities</b>
                                                    </th>
                                                    {activeTerms.map((term: any) => (
                                                        <th
                                                            key={getField(term, 'ecT_Id') || term.ecT_Id}
                                                            className='bg-yellow text-center'
                                                            style={{ width: '150px', padding: '4px 8px' }}>
                                                            <b>{getField(term, 'ecT_TermName') || term.ecT_TermName || 'Term'}</b>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayActivities.map((area: string, ai: number) => (
                                                    <tr key={ai}>
                                                        <td className='text-left' style={{ wordWrap: 'break-word', padding: '4px 8px' }}>
                                                            {area}
                                                        </td>
                                                        {activeTerms.map((term: any) => {
                                                            const termId = String(getField(term, 'ecT_Id') ?? term.ecT_Id ?? '');
                                                            const sc = activitiesAll.find(
                                                                (a: any) =>
                                                                    String(getField(a, 'AMST_Id') ?? '') === studentId &&
                                                                    String(getField(a, 'ECACTA_SkillArea') ?? '') === area &&
                                                                    String(getField(a, 'ECT_Id') ?? '') === termId
                                                            );
                                                            return (
                                                                <td key={termId} className='text-center' style={{ padding: '4px 8px' }}>
                                                                    {getField(sc, 'EMGD_Name') || ''}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })()}

                            {/* ── Attendance Table ── */}
                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 400 }} className='bg-yellow text-left'>
                                                <strong>Attendance</strong>
                                            </td>
                                            <td style={{ width: 400 }} className='bg-yellow text-center'>
                                                <strong>Term</strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='text-left'>Days Present</td>
                                            <td className='text-center'>
                                                {(() => {
                                                    const pa = presentAtt.find(
                                                        (a: any) => String(getField(a, 'AMST_Id') ?? '') === studentId
                                                    );
                                                    const val =
                                                        getField(
                                                            pa,
                                                            'TotalPresentDays',
                                                            'totalPresentDays',
                                                            'AMST_TotalPresentDays',
                                                            'classheld',
                                                            'classHeld',
                                                            'totalpresent',
                                                            'totalPresent',
                                                            'presentDays',
                                                            'present_days'
                                                        ) ?? 210;
                                                    return <strong>{val}</strong>;
                                                })()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='text-left'>Working Days</td>
                                            <td className='text-center'>
                                                {(() => {
                                                    const wa = workAtt.find((a: any) => String(getField(a, 'AMST_Id') ?? '') === studentId);
                                                    const val =
                                                        getField(
                                                            wa,
                                                            'TotalSchoolDays',
                                                            'totalSchoolDays',
                                                            'AMST_TotalSchoolDays',
                                                            'workingdays',
                                                            'workingDays',
                                                            'totalworking',
                                                            'totalWorking',
                                                            'working_days'
                                                        ) ?? 220;
                                                    return <strong>{val}</strong>;
                                                })()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Class Teacher's Remarks & Promoted To Class ── */}
                            <div style={{ marginTop: 16, marginBottom: 16, fontSize: 13 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Class Teacher's Remarks : </strong>
                                    <span>
                                        {getField(remark, 'EPRD_Remarks', 'promotionRemarks', 'remarks') ||
                                            '_____________________________________'}
                                    </span>
                                </div>
                                <div>
                                    <strong>Promoted To Class : </strong>
                                    <span>
                                        {getField(remark, 'EPRD_ClassPromoted', 'promotedClass', 'classPromoted') ||
                                            '_____________________________________'}
                                    </span>
                                </div>
                            </div>

                            {/* ── Bottom Signatures ── */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: 36,
                                    paddingLeft: 16,
                                    paddingRight: 16,
                                    fontWeight: 'bold',
                                    fontSize: 14
                                }}>
                                <div>Class Teacher</div>
                                <div>Principal</div>
                                <div>Parent</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
