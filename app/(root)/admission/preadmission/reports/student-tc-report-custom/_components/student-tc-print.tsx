'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface StudentTcPrintProps {
    data: any;
}

export const StudentTcPrint = forwardRef<HTMLDivElement, StudentTcPrintProps>(({ data }, ref) => {
    const miid = data?.masterCompany?.[0]?.miid || data?.masterCompany?.[0]?.mI_Id || 0;
    const isBoys = parseInt(miid) === 6;
    const isGirls = parseInt(miid) === 4;
    const isCoEdu = !isBoys && !isGirls;

    if (!data) return null;

    return (
        <div ref={ref} className="bg-white printable-content print:p-0">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: portrait;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                    }
                    .printable-content {
                        visibility: visible !important;
                        display: block !important;
                    }
                    .pdf-page {
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        height: auto !important;
                        min-height: 290mm;
                    }
                }
                .pdf-page {
                    background: white;
                    position: relative;
                    box-sizing: border-box;
                    page-break-after: always;
                }
                .size-a4 {
                    width: 210mm;
                    min-height: 297mm;
                }
            ` }} />
            {isBoys && <BoysTemplate data={data} />}
            {isGirls && <GirlsTemplate data={data} />}
            {isCoEdu && <CoEduTemplate data={data} />}
        </div>
    );
});

StudentTcPrint.displayName = 'StudentTcPrint';

// --- Boys Template (miid === 6) ---
const BoysTemplate = ({ data }: { data: any }) => {
    const student = data.studentTCList?.[0] || {};
    return (
        <div className="pdf-page size-a4 p-8 border-none" style={{ width: '8.3in', margin: '0 auto', fontSize: '12px' }}>
            <div className="flex justify-between items-center mb-6 pt-20">
                <div>School Dise No: <b>29200909303</b></div>
                <div>TC No: <b>{student.astc_tcno || student.astC_TCNO || '---'}</b></div>
                <div>Academic Year: <b>{data.fromyear}-{data.toyear}</b></div>
            </div>

            <table className="w-full border-collapse border border-black text-sm">
                <tbody>
                    <tr>
                        <td className="border border-black p-2 w-1/2">
                            <span className="inline-block w-6">1.</span> Admission No: <b>{student.amst_admno || student.amsT_AdmNo || '---'}</b>
                        </td>
                        <td className="border border-black p-2 w-1/2 font-semibold">
                            <span className="inline-block w-6">14.</span> Standard in which student was studying: <b>{(student.last_class_studied || student.Last_Class_Studied || student.classname || '').toUpperCase()}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">2.</span> Enrollment No: <b>{student.govtno || '---'}</b>
                        </td>
                        <td className="border border-black p-2" rowSpan={2}>
                            <span className="inline-block w-6">15.</span> Student opted Subjects:
                            <div className="ml-6 mt-1">a) Languages: <b>{(data.language_studied || student.subjectstudied || '').toUpperCase()}</b></div>
                            <div className="ml-6">b) Elective: <b>{(data.electivestudied || '').toUpperCase()}</b></div>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">3.</span> Date of Admission: <b>{student.amst_date ? format(new Date(student.amst_date), 'dd/MM/yyyy') : (student.amsT_Date ? format(new Date(student.amsT_Date), 'dd/MM/yyyy') : '---')}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">4.</span> Full Name of Student: <b>{(data.studentname || '').toUpperCase()}</b>
                        </td>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">16.</span> Medium of Instruction: <b>{(data.mediumofinstruction || data.mediumOfInstruction || 'ENGLISH').toUpperCase()}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">5.</span> Gender: <b>{(student.amst_sex || student.amsT_Sex || '').toUpperCase()}</b>
                        </td>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">17.</span> Fees paid all dues: <b>{(student.astc_feepaid || student.ASTC_FeePaid || '---').toUpperCase()}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">6.</span> Nationality: <b>{(student.nationality || '---').toUpperCase()}</b>
                        </td>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">18.</span> Fee Concession: <b>{student.fee_concesion || '---'}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">7.</span> Religion / Caste: <b>{(student.religion || '').toUpperCase()} / {(student.caste || '').toUpperCase()}</b>
                        </td>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">19.</span> Scholarship: <b>{student.astc_scholarship || '---'}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">8.</span> Name of Father: <b>{(student.amst_fathername || student.amsT_FatherName || '').toUpperCase()}</b>
                        </td>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">20.</span> Medically Examined: <b>{student.medicallyexamined || 'YES'}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-6">9.</span> Name of Mother: <b>{(student.amst_mothername || student.amsT_MotherName || '').toUpperCase()}</b>
                        </td>
                        <td className="border border-black p-2 font-semibold">
                            <span className="inline-block w-6">21.</span> Last Attendance Date: <b>{student.astc_lastattendeddate ? format(new Date(student.astc_lastattendeddate), 'dd/MM/yyyy') : (student.astC_LastAttendedDate ? format(new Date(student.astC_LastAttendedDate), 'dd/MM/yyyy') : '---')}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-7">10.</span> SC / ST: <b>{data.studcastecategory || '---'}</b>
                        </td>
                        <td className="border border-black p-2">
                            <span className="inline-block w-7">22.</span> Application Date for TC: <b>{student.astc_tcissuedate ? format(new Date(student.astc_tcissuedate), 'dd/MM/yyyy') : (student.astC_TCIssueDate ? format(new Date(student.astC_TCIssueDate), 'dd/MM/yyyy') : '---')}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 font-semibold">
                            <span className="inline-block w-7">11.</span> Qualified for Promotion: <b>{(data.nextclass || '').toUpperCase()}</b>
                        </td>
                        <td className="border border-black p-2">
                            <span className="inline-block w-7">23.</span> School Days: <b>{student.noof_schooldays || '---'}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-7">12.</span> Date of Birth: <b>{student.amst_dob ? format(new Date(student.amst_dob), 'dd/MM/yyyy') : (student.amsT_DOB ? format(new Date(student.amsT_DOB), 'dd/MM/yyyy') : '---')}</b>
                        </td>
                        <td className="border border-black p-2">
                            <span className="inline-block w-7">24.</span> Days Attended: <b>{(student.noof_daysattended || '---').toString().toUpperCase()}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2">
                            <span className="inline-block w-7">13.</span> Place of Birth: <b>{(student.amst_percity || student.amsT_PerCity || '---').toUpperCase()}</b>
                        </td>
                        <td className="border border-black p-2">
                            <span className="inline-block w-7">25.</span> Conduct: <b>{(student.astc_conduct || student.astC_Conduct || '---').toUpperCase()}</b>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="mt-16 flex justify-between px-4 font-semibold">
                <div>Date of Issue: <u> {format(new Date(), 'dd/MM/yyyy')}</u></div>
                <div>Principal Sign: .................................</div>
            </div>

            <div className="mt-8 text-right pr-12 leading-relaxed">
                <div className="font-bold text-base">PRINCIPAL</div>
                <div>{student.institutionname || 'Baldwin Boys\' High School'}</div>
                <div>BANGALORE</div>
            </div>

            <div className="mt-12 flex justify-center">
                <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center text-xs font-bold -rotate-12">
                    SCHOOL SEAL
                </div>
            </div>
        </div>
    );
};

// --- Girls Template (miid === 4) ---
const GirlsTemplate = ({ data }: { data: any }) => {
    const student = data.studentTCList?.[0] || {};
    return (
        <div className="pdf-page size-a4 space-y-6 pt-32 px-12 pb-20 leading-relaxed font-serif text-[15px]" style={{ width: '8.3in', margin: '0 auto' }}>
            <h2 className="text-center text-2xl font-bold border-b-2 border-black pb-2 mb-8">STUDENT TRANSFER CERTIFICATE</h2>

            <div className="flex justify-between font-bold">
                <div className="flex gap-2">TC Serial No: <span className="border-b border-black px-4">{student.astc_tcno || student.astC_TCNO || '---'}</span></div>
                <div className="flex gap-2 text-right">Admission / Reg No: <span className="border-b border-black px-4">{student.amst_admno || student.amsT_AdmNo || '---'}</span></div>
            </div>

            <p className="flex gap-2 flex-wrap">
                This is to certify that <span className="flex-1 border-b border-black text-center font-bold px-2">{data.studentname?.toUpperCase() || '---'}</span>
            </p>

            <div className="flex justify-between items-center">
                <p className="flex-1 flex gap-2">Daughter of <span className="flex-1 border-b border-black text-center font-bold px-2">{student.amst_fathername?.toUpperCase() || student.amsT_FatherName?.toUpperCase() || '---'}</span></p>
                <p className="w-1/3 flex gap-2 pl-4">PEN No: <span className="flex-1 border-b border-black text-center font-bold">{student.amst_penno || student.amsT_PENNo || '---'}</span></p>
            </div>

            <p className="flex gap-4 flex-wrap">
                was admitted into this school on <span className="border-b border-black font-bold px-4">{student.amst_date ? format(new Date(student.amst_date), 'dd-MM-yyyy') : (student.amsT_Date ? format(new Date(student.amsT_Date), 'dd-MM-yyyy') : '---')}</span>
                in standard <span className="border-b border-black font-bold px-8 flex-1 text-center">{data.joinclass?.toUpperCase() || '---'}</span>
            </p>

            <p className="flex gap-2 flex-wrap">
                on a transfer from <span className="flex-1 border-b border-black text-center font-bold px-2">{data.stuschoolname?.toUpperCase() || '---'}</span>
            </p>

            <div className="flex gap-4 flex-wrap items-center">
                <span>and left on</span>
                <span className="border-b border-black font-bold px-4">{student.astc_lastattendeddate ? format(new Date(student.astc_lastattendeddate), 'dd-MM-yyyy') : (data.last_date_attended ? format(new Date(data.last_date_attended), 'dd-MM-yyyy') : '---')}</span>
                <span>with a</span>
                <span className="border-b border-black font-bold px-4">{(student.astc_conduct || student.astC_Conduct || 'GOOD').toUpperCase()}</span>
                <span>character.</span>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
                <span>She was then studying in (@)</span>
                <span className="flex-1 border-b border-black text-center font-bold">{(student.last_class_studied || student.Last_Class_Studied || data.data2girls || '---').toUpperCase()}</span>
                <span>standard of the (+)</span>
                <span className="border-b border-black font-bold px-6">ICSE</span>
                <span>stream.</span>
            </div>

            <div className="flex gap-4 items-center flex-wrap">
                <span>The school year being from (*)</span>
                <span className="border-b border-black font-bold px-4">{data.frommonth1} {data.fromyear}</span>
                <span>to (*)</span>
                <span className="border-b border-black font-bold px-4">{data.tomonth1} {data.toyear}</span>
            </div>

            <p className="font-bold pt-2">All sums due to the school (%) on her account has been remitted.</p>

            <p className="flex gap-2 flex-wrap items-center">
                Her date of birth, according to the Admission register, is <span className="border-b border-black font-bold px-4">(in figures) {student.amst_dob ? format(new Date(student.amst_dob), 'dd-MM-yyyy') : (student.amsT_DOB ? format(new Date(student.amsT_DOB), 'dd-MM-yyyy') : '---')}</span>
            </p>

            <p className="flex gap-2 flex-wrap">
                (Date in words) <span className="flex-1 border-b border-black px-2 italic font-medium">{data.stuDobwords?.toUpperCase() || '---'}</span>
            </p>

            <p className="flex gap-4 items-center">
                Promotion ($) <span className="flex-1 border-b border-black font-bold px-4">{(student.astc_qual_promotionflag || data.promotiontype || '---').toUpperCase()}</span>
            </p>

            <div className="pt-20 flex justify-between px-4 font-bold border-t mt-12 pt-8 border-slate-100 italic">
                <div className="flex gap-2">Date: <span className="border-b border-black w-32 text-center">{format(new Date(), 'dd-MM-yyyy')}</span></div>
                <div>Signature: ............................................</div>
            </div>

            <div className="flex justify-between items-start pt-12 text-sm text-slate-600 italic">
                <div className="w-1/2">Countersigned</div>
                <div className="w-1/2 text-center leading-relaxed">
                    School Seal / Rubber Stamp
                    <div className="h-10"></div>
                </div>
            </div>

            <div className="text-[11px] leading-tight pt-8 border-t border-slate-100 opacity-80 italic font-medium">
                <div>(@) - To be given in words</div>
                <div>(+) - Mention Whether ICSE/ISC Stream</div>
                <div>(*) - Write Month and year</div>
                <div>(%) - includes payments for which provision is made in the rules supplied to the parent when the student was admitted into the school</div>
                <div>($) - Granted/Refused/Not Applicable/Passed ICSE/ISC.</div>
            </div>
        </div>
    );
};

// --- Co-Edu Template (Default) ---
const CoEduTemplate = ({ data }: { data: any }) => {
    const student = data.studentTCList?.[0] || {};
    return (
        <div className="pdf-page size-a4 p-10 pt-36 space-y-0 flex flex-col font-serif" style={{ width: '8.3in', margin: '0 auto', fontSize: '10.5px' }}>
            {/* Import Google Font for cursive styling */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&display=swap');
                .cursive-font { font-family: 'Dancing Script', cursive; font-size: 1.1rem; color: #1a1a1a; }
                .heading-cursive { font-family: 'Great Vibes', cursive; color: #000; letter-spacing: 1px; }
            ` }} />

            <h1 className="text-center mb-6">
                <span className="text-xl border-b-2 border-black px-10 py-0.5 font-bold tracking-wider">TRANSFER CERTIFICATE</span>
            </h1>

            <div className="space-y-0">
                <div className="flex justify-between items-center gap-10">
                    <div className="font-bold flex-1 flex gap-2">School Dise No : <span className="cursive-font flex-1 border-b border-black text-center">29200111538</span></div>
                    <div className="font-bold flex-1 flex gap-2">Medium of Instruction : <span className="cursive-font flex-1 border-b border-black text-center">{(student.mediumofinstruction || student.mediumOfInstruction || 'ENGLISH').toUpperCase()}</span></div>
                </div>

                <div className="flex justify-between items-center gap-2">
                    <div className="font-bold flex gap-2">TC No : <span className="cursive-font border-b border-black px-6 min-w-[150px] text-center">{student.astc_tcno || student.astC_TCNO || '---'}</span></div>
                    <div className="font-bold flex gap-2 flex-1 pl-4">STS No : <span className="cursive-font border-b border-black flex-1 text-center">{student.govtno || '---'}</span></div>
                    <div className="font-bold flex gap-2 flex-1 pl-4">PEN No : <span className="cursive-font border-b border-black flex-1 text-center">{student.amst_penno || student.amsT_PENNo || '---'}</span></div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0">01. Name of the Student in full :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold px-2 min-h-[22px]">{data.studentname?.toUpperCase() || data.studentFullName?.toUpperCase() || '---'}</div>
                </div>

                <div className="flex justify-between items-center gap-2">
                    <div className="font-bold flex gap-2 shrink-0">02. Admission No : <span className="cursive-font border-b border-black px-4 min-w-[120px] text-center min-h-[20px]">{student.amst_admno || student.amsT_AdmNo || '---'}</span></div>
                    <div className="font-bold flex gap-2 flex-1 pl-4 text-center">Admn Date : <span className="cursive-font border-b border-black flex-1 px-4 text-center min-h-[20px]">{student.amst_date ? format(new Date(student.amst_date), 'dd/MM/yyyy') : (student.amsT_Date ? format(new Date(student.amsT_Date), 'dd/MM/yyyy') : '---')}</span></div>
                    <div className="font-bold flex gap-2 flex-1 pl-4">Admitted to : <span className="cursive-font border-b border-black flex-1 text-center min-h-[20px]">{data.joinclass?.toUpperCase() || '---'}</span></div>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <div className="font-bold flex gap-2 grow shrink-0">03. Place of Birth : <span className="cursive-font border-b border-black flex-1 min-w-[200px] text-center uppercase min-h-[20px]">{student.amst_percity || student.amsT_PerCity || '---'}</span></div>
                    <div className="font-bold flex gap-2 grow">State : <span className="cursive-font border-b border-black flex-1 text-center uppercase min-h-[20px]">{student.statename || data.statename || 'KARNATAKA'}</span></div>
                </div>

                <div className="space-y-0">
                    <div className="font-bold">04. Date of birth [in figure & word]</div>
                    <div className="flex gap-4 pl-10 items-center">
                        <div className="font-bold flex gap-2 shrink-0">In figures : <span className="cursive-font border-b border-black px-6 text-center min-h-[20px]">{student.amst_dob ? format(new Date(student.amst_dob), 'dd/MM/yyyy') : (student.amsT_DOB ? format(new Date(student.amsT_DOB), 'dd/MM/yyyy') : '---')}</span></div>
                        <div className="font-bold flex gap-2 flex-1 overflow-hidden">
                            In words : <span className="cursive-font border-b border-black flex-1 truncate text-center px-4 leading-normal min-h-[20px]">{data.stuDobwords?.toUpperCase() || '---'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-10">
                    <div className="font-bold flex-1 flex gap-2">05. Gender : <span className="cursive-font flex-1 border-b border-black text-center min-h-[20px]">{(student.amst_sex || student.amsT_Sex || '---').toUpperCase()}</span></div>
                    <div className="font-bold flex-1 flex gap-2 pl-6">Nationality : <span className="cursive-font flex-1 border-b border-black text-center min-h-[20px]">{(student.nationality || 'INDIAN').toUpperCase()}</span></div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0">06. Religion : <span className="cursive-font border-b border-black px-6 text-center min-h-[20px]">{(student.religion || '---').toUpperCase()}</span></div>
                    <div className="font-bold shrink-0 flex gap-2 pl-4">Caste : <span className="cursive-font border-b border-black px-6 text-center min-h-[20px]">{(student.caste || '---').toUpperCase()}</span></div>
                    <div className="font-bold flex-1 flex gap-2 pl-4">Sub Caste : <span className="cursive-font border-b border-black flex-1 text-center min-h-[20px]">{student.amst_subcasteimc_id || student.AMST_SubCasteIMC_Id || '---'}</span></div>
                </div>

                <div className="flex gap-2 items-center">
                    <div className="font-bold shrink-0 text-[9.5px]">07. Whether the candidate belongs to Scheduled Caste / Scheduled Tribe / OBC / General ? :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold min-h-[20px]">{(student.castecat || student.castecategory || 'GENERAL').toUpperCase()}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0">08. Name of the Father :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold uppercase min-h-[20px]">{(student.amst_fathername || student.amsT_FatherName || '---')}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0">09. Name of the Mother :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold uppercase min-h-[20px]">{(student.amst_mothername || student.amsT_MotherName || '---')}</div>
                </div>

                <div className="space-y-0 pt-0.5">
                    <div className="flex gap-2 items-center">
                        <div className="font-bold text-[9.5px]">10. Whether the candidate has qualified for promotion to a higher standard :</div>
                        <div className="cursive-font border-b border-black flex-1 text-center font-bold uppercase min-h-[20px]">{(data.promotiontype || student.astc_qual_promotionflag || 'YES').toUpperCase()}</div>
                    </div>
                    <div className="flex gap-2 items-center pl-10">
                        <div className="font-bold shrink-0">If yes to which class :</div>
                        <div className="cursive-font border-b border-black flex-1 text-center font-bold uppercase min-h-[20px]">{data.qualificlass || student.qualificlass || '---'}</div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[10px]">11. Standard in which the student was studying at the time of leaving :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold min-h-[20px]">{(student.last_class_studied || student.Last_Class_Studied || student.classname || '---').toUpperCase()}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[9.5px]">12. Subjects opted by the student :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold text-[8.5px] leading-tight uppercase px-1 min-h-[20px]">I LANGUAGE - ENGLISH, {(student.subjectstudied || data.language_studied || '---')}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[10px]">13. Whether medically examined or not ? :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold uppercase min-h-[20px]">{student.medicallyexamined || 'YES'}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[10px]">14. Number of School Days in the academic year :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold min-h-[20px]">{student.noof_schooldays || '---'}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[10px]">15. Total Number of Days attended by the student in the academic year :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold min-h-[20px]">{student.noof_daysattended || '---'}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[10px]">16. Month of Student's last attendance at the school :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold uppercase min-h-[20px]">{student.astc_lastattendeddate ? format(new Date(student.astc_lastattendeddate), 'dd/MM/yyyy') : (student.astC_LastAttendedDate ? format(new Date(student.astC_LastAttendedDate), 'dd/MM/yyyy') : '---')}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[10px]">17. Date on which the application for TC was received :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold min-h-[20px]">{student.astc_tcapplicationdate ? format(new Date(student.astc_tcapplicationdate), 'dd/MM/yyyy') : (student.astC_TCApplicationDate ? format(new Date(student.astC_TCApplicationDate), 'dd/MM/yyyy') : '---')}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[10px]">18. Reason for leaving School :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold text-[8.5px] leading-tight uppercase min-h-[20px]">{(student.astc_leavingreason || student.astC_LeavingReason || '---')}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[10px]">19. Character and Conduct :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold uppercase min-h-[20px]">{(student.astc_conduct || student.astC_Conduct || 'GOOD')}</div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="font-bold shrink-0 text-[10px]">20. Whether the student has paid all the fee due of the school? :</div>
                    <div className="cursive-font flex-1 border-b border-black text-center font-bold uppercase min-h-[20px]">{(student.astc_feepaid || student.ASTC_FeePaid || 'YES')}</div>
                </div>
            </div>

            <div className="mt-0.5 pt-0.5 font-bold flex gap-2 text-[9.5px]">
                Date of Issue : <span className="cursive-font border-b border-black px-6">{format(new Date(), 'dd/MM/yyyy')}</span>
            </div>

            <div className="mt-4 flex justify-between items-end px-4">
                <div className="text-center w-[200px] space-y-0 text-[10px]">
                    <div className="cursive-font h-10"></div>
                    <div className="border-t border-black pt-1 font-bold">Signature of Office Staff</div>
                </div>
                <div className="text-center w-[200px] space-y-0 text-[10px]">
                    <div className="cursive-font h-10"></div>
                    <div className="border-t border-black pt-1 font-bold">Signature of the Principal</div>
                </div>
            </div>
        </div>
    );
};
