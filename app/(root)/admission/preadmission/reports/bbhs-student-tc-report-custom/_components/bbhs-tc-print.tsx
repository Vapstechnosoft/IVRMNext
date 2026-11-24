'use client';

import { format, isValid } from 'date-fns';
import { forwardRef } from 'react';

interface TcPrintProps {
    data: any;
}

const getText = (...values: unknown[]) => {
    const value = values.find((item) => item !== undefined && item !== null && String(item).trim() !== '');
    return value === undefined ? '---' : String(value);
};

const formatDate = (...values: (string | Date | null | undefined)[]) => {
    const value = values.find(Boolean);
    if (!value) return '---';

    const date = value instanceof Date ? value : new Date(value);
    return isValid(date) ? format(date, 'dd/MM/yyyy') : '---';
};

export const BbhsTcPrint = forwardRef<HTMLDivElement, TcPrintProps>(({ data }, ref) => {
    if (!data) return null;

    const student = data.studentTCList?.[0] || {};
    const company = data.masterCompany?.[0] || {};
    const fullName =
        data.studentFullName ||
        student.studentname ||
        `${student.amsT_FirstName || student.AMST_FirstName || ''} ${student.amsT_MiddleName || student.AMST_MiddleName || ''} ${student.amsT_LastName || student.AMST_LastName || ''}`.trim();
    const lastClass = getText(
        student.last_class_studied,
        student.last_Class_Studied,
        student.Last_Class_Studied,
        student.asmcL_ClassName,
        student.classname
    );
    const qualifiedClass = getText(student.qualificlass, data.nextclass, data.getnextclass?.[0]?.asmcL_ClassName);
    const promotion = qualifiedClass !== '---' ? `Promoted To Std ${qualifiedClass}` : getText(student.astc_qual_promotionflag);
    const casteCategory = getText(
        data.studcastecategory,
        (student.castecat || student.castecategory || '').toString().toUpperCase() === 'SC' ||
            (student.castecat || student.castecategory || '').toString().toUpperCase() === 'ST'
            ? 'YES'
            : 'NO'
    );
    const leftValues = [
        getText(student.amst_admno, student.amsT_AdmNo, student.AMST_AdmNo),
        getText(student.govtno, student.amst_sol, student.AMST_SOL),
        formatDate(student.amst_date, student.amsT_Date, student.AMST_Date, student.amst_admissiondate),
        fullName.toUpperCase(),
        getText(student.amst_sex, student.amsT_Sex, student.AMST_Sex).toUpperCase(),
        getText(student.nationality, student.amst_nationality, student.AMST_Nationality, 'INDIAN').toUpperCase(),
        `${getText(student.religion, student.AMST_Religion).toUpperCase()} / ${getText(student.caste, student.AMST_Caste).toUpperCase()}`,
        getText(student.amst_fathername, student.amsT_FatherName, student.AMST_FatherName).toUpperCase(),
        getText(student.amst_mothername, student.amsT_MotherName, student.AMST_MotherName).toUpperCase(),
        casteCategory,
        promotion,
        formatDate(student.amst_dob, student.amsT_DOB, student.AMST_DOB),
        getText(
            student.amst_birthplace,
            student.amsT_BirthPlace,
            student.AMST_BirthPlace,
            student.amst_percity,
            student.amsT_PerCity
        ).toUpperCase()
    ];
    const rightValues = [
        lastClass,
        [
            `a) Languages Studied / ${getText(data.language_studied, student.subjectstudied).toUpperCase()}`,
            `b) Elective Studied / ${getText(data.electivestudied, student.electivestudied).toUpperCase()}`
        ].join('\n'),
        '',
        getText(
            data.mediumofinstruction,
            data.mediumOfInstruction,
            student.mediumofinstruction,
            student.mediumOfInstruction,
            'ENGLISH'
        ).toUpperCase(),
        getText(student.astc_feepaid, student.ASTC_FeePaid).toUpperCase(),
        getText(student.fee_concesion, student.fee_concession),
        getText(student.astc_scholarship, student.ASTC_Scholarship),
        getText(student.medicallyexamined, student.medicallyExamined, student.astc_medicallyexamined, 'YES').toUpperCase(),
        formatDate(student.astc_lastattendeddate, student.astC_LastAttendedDate, student.ASTC_LastAttendedDate),
        formatDate(student.astc_tcapplicationdate, student.astC_TCApplicationDate, student.ASTC_TCApplicationDate),
        getText(student.noof_schooldays, student.noofSchoolDays),
        getText(student.noof_daysattended, student.noOfDaysAttended),
        getText(student.astc_conduct, student.astC_Conduct, student.ASTC_Conduct, 'GOOD').toUpperCase()
    ];

    const rows = [
        { left: 'Admission No', right: 'Standard in which the student is studying at the time of leaving the School' },
        { left: 'Cumulative Record No. / Enrollment No', right: 'Student opted Subject(s)', rightTall: true },
        { left: 'Date of Admission to School', right: '' },
        { left: 'Name of the Student full', right: 'Medium of Instruction' },
        { left: 'Gender', right: 'Whether the Student has paid all the fees due to School' },
        { left: 'Nationality', right: 'Fee Concession, if any (Nature and period to be specified)' },
        { left: 'Religion / Caste', right: 'Scholarship if any (Nature and period to be specified)' },
        { left: 'Name of the Father', right: 'Whether Medically Examined or not' },
        { left: 'Name of the Mother', right: 'Month of student last attendance at the School' },
        {
            left: 'Whether the candidate belongs to Schedule Caste or Schedule Tribe',
            right: 'Date on which the application for the Transfer Certificate was received'
        },
        {
            left: 'Whether qualified for promotion to a Higher Standard',
            right: 'Number of School Days to the date of leaving in academic year'
        },
        { left: 'Student Date of Birth', right: 'Number of Total Days the student attended in academic year' },
        { left: 'Place', right: 'Character and Conduct' }
    ];

    const tcNo = getText(student.astc_tcno, student.astC_TCNO, student.ASTC_TCNO);
    const academicYear =
        data.fromyear && data.toyear ? `${data.fromyear}-${data.toyear}` : getText(student.academicyear, student.asmaY_Year);
    const diseNo = getText(company.diseNo, company.dise_no, company.mI_DiseNo, '29200909303');
    const issueDate = formatDate(student.astc_tcissuedate, student.astC_TCIssueDate, student.ASTC_TCIssueDate, data.getdate);
    const institution = getText(student.institutionname, company.name, "Baldwin Boys' High School");

    return (
        <div ref={ref} className='printable-content bbhs-tc-print'>
            <style>{`
                        .bbhs-tc-print {
                            box-sizing: border-box;
                            width: 210mm;
                            min-height: 297mm;
                            margin: 0 auto;
                            padding: 8px 6px 12px;
                            background: #fff;
                            color: #173c69;
                            font-family: Arial, sans-serif;
                            font-size: 10px;
                        }
                        .bbhs-tc-print * { box-sizing: border-box; }
                        .bbhs-tc-header {
                            display: grid;
                            grid-template-columns: 1fr 1fr 1fr;
                            align-items: center;
                            min-height: 24px;
                            border: 1px solid #c8d6e5;
                            padding: 4px 22px;
                            white-space: nowrap;
                        }
                        .bbhs-tc-header > :nth-child(2) { text-align: center; }
                        .bbhs-tc-header > :last-child { text-align: right; }
                        .bbhs-tc-table {
                            width: 100%;
                            border-collapse: collapse;
                            table-layout: fixed;
                            line-height: 1.45;
                        }
                        .bbhs-tc-table td {
                            width: 50%;
                            border: 1px solid #c8d6e5;
                            padding: 6px 9px;
                            vertical-align: top;
                        }
                        .bbhs-tc-table td:first-child { border-right-color: #b8cce0; }
                        .bbhs-tc-label { margin-right: 4px; }
                        .bbhs-tc-value { font-weight: 700; }
                        .bbhs-tc-subjects { white-space: pre-line; }
                        .bbhs-tc-footer {
                            display: flex;
                            justify-content: space-between;
                            margin: 66px 12px 0;
                        }
                        .bbhs-tc-principal {
                            margin: 16px 18px 0 0;
                            text-align: right;
                            line-height: 1.5;
                        }
                        @media print {
                            @page { size: A4 portrait; margin: 0; }
                            body { margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            .bbhs-tc-print { width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 8px 6px 12px !important; }
                        }
                    `}</style>
            <div className='bbhs-tc-header'>
                <div>
                    School Dise No : <b>{diseNo}</b>
                </div>
                <div>
                    TC No : <b>{tcNo}</b>
                </div>
                <div>
                    Academic Year : <b>{academicYear}</b>
                </div>
            </div>
            <table className='bbhs-tc-table'>
                <tbody>
                    {rows.map((row, index) => {
                        const leftNumber = index + 1;
                        const rightNumber = index + 14 - (index >= 3 ? 1 : 0);
                        return (
                            <tr key={leftNumber}>
                                <td>
                                    <span className='bbhs-tc-label'>{leftNumber}.</span>
                                    {row.left} : <span className='bbhs-tc-value'>{leftValues[index]}</span>
                                </td>
                                <td rowSpan={row.rightTall ? 2 : undefined}>
                                    {row.right && (
                                        <>
                                            <span className='bbhs-tc-label'>{rightNumber}.</span>
                                            {row.right} :{' '}
                                            <span className={`bbhs-tc-value ${rightNumber === 15 ? 'bbhs-tc-subjects' : ''}`}>
                                                {rightValues[index]}
                                            </span>
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className='bbhs-tc-footer'>
                <div>
                    Date of Issue: <u>{issueDate}</u>
                </div>
                <div>Principal Sign: ....................................</div>
            </div>
            <div className='bbhs-tc-principal'>
                <div>
                    <b>PRINCIPAL</b>
                </div>
                <div>{institution}</div>
                <div>{getText(company.city, 'BANGALORE')}</div>
            </div>
        </div>
    );
});

BbhsTcPrint.displayName = 'BbhsTcPrint';
