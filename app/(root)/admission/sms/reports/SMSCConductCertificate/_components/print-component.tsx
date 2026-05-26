'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface PrintComponentProps {
    data: any;
    certType: '0' | '1'; // 0: Conduct, 1: Study
    logo?: string;
    extraFields?: {
        exmname?: string;
        exmmonth?: string;
        stdreg?: string;
    };
}

export const PrintComponent = forwardRef<HTMLDivElement, PrintComponentProps>(({ data, certType, logo, extraFields }, ref) => {
    if (!data || data.length === 0) return null;

    const student = data[0];
    const today = new Date();

    const renderStudyCertificate = () => (
        <div className='study-certificate-container border border-slate-200 bg-white p-[40px] font-['Times_New_Roman',_Times,_serif] text-[#1a1a1a] shadow-2xl'>
            {/* Contact Info Header */}
            <div className='mb-6 flex justify-between border-slate-100 border-b pb-4 text-[14px] leading-relaxed'>
                <div className="flex flex-col">
                    <span>E-mail: <strong className="font-bold">sms_college@yahoo.com</strong></span>
                    <span>Website: <strong className="font-bold">www.smscollegebrahmavar.com</strong></span>
                </div>
                <div className="flex flex-col text-right">
                    <span>Ph: <strong className="font-bold">8951615968 (Principal)</strong></span>
                    <span className="flex items-center justify-end gap-1">
                        <svg className='h-3 w-3' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <strong className="font-bold">6366415968 (Office)</strong>
                    </span>
                </div>
            </div>

            {/* Logo and Institution Header */}
            <div className='mb-10 text-center'>
                {logo && <img src={logo} alt="Logo" className='mx-auto mb-4 max-h-[120px] transition-transform duration-500 hover:scale-105' />}
                <div className='flex min-h-[60px] items-start justify-between'>
                    <div className='w-[20%] pt-2 text-left text-[13px] text-slate-500 italic leading-tight'>
                        Towards Moulding<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;Sublime Lives
                    </div>
                    <div className='flex w-[60%] flex-col gap-1'>
                        <span className="text-[12px] text-slate-600">(Managed by O.S.C Educational Society/Obtained minority status vide No. 919/2014 dt. 18.09.2014)</span>
                        <div className='font-bold text-[14px]'>
                            (Affiliated to Mangalore University)(NAAC Accredited A Grade <span className="text-blue-600">(CGPA: 3.20</span>))
                        </div>
                    </div>
                    <div className="w-[20%]" />
                </div>
                <hr className="mt-4 border-slate-300" />
            </div>

            {/* Reference and Date */}
            <div className='mb-12 flex justify-between px-2 text-[18px]'>
                <div contentEditable suppressContentEditableWarning className='min-w-[200px] rounded-md border border-transparent p-1 transition-colors hover:border-slate-200 hover:bg-slate-50'>
                    Ref: SMSC/S.Cer/{student.acadamicyear || student.yearname}
                </div>
                <div contentEditable suppressContentEditableWarning className='rounded-md border border-transparent p-1 transition-colors hover:border-slate-200 hover:bg-slate-50'>
                    Date: {format(today, 'dd/MM/yyyy')}
                </div>
            </div>

            {/* Title */}
            <div className='mb-16 text-center'>
                <h1 className='font-black text-[28px] tracking-[0.1em] underline decoration-2 underline-offset-8'>STUDY CERTIFICATE</h1>
            </div>

            {/* Content Body */}
            <div className='certificate-body mb-32 px-[30px] text-justify text-[20px] italic leading-[1.8]'>
                <p contentEditable suppressContentEditableWarning className='rounded-xl border-2 border-transparent p-4 outline-none transition-all hover:border-blue-100 hover:bg-blue-50/30'>
                    This is to certify that {student.gender === 'FEMALE' ? 'kumari' : 'kumar'} <strong className="font-bold not-italic">{student.studentname}</strong>, {student.gender === 'FEMALE' ? 'D/o' : 'S/o'} {student.gender === 'FEMALE' ? 'kumari' : 'kumar'} <strong className="font-bold not-italic">{student.fathername}</strong>,
                    student of our college is studying in <strong className="font-bold not-italic">{student.coursename} {student.semestername || student.classstudying}</strong> during the Academic year <strong className="font-bold not-italic">{student.acadamicyear || student.yearname}</strong>.
                </p>
            </div>

            {/* Signature */}
            <div className="flex justify-end pr-8">
                <div className='flex flex-col items-center text-right'>
                    <div className="h-[60px]" /> {/* Placeholder for signature seal */}
                    <span className='min-w-[150px] border-slate-800 border-t-2 pt-2 text-center font-bold text-[22px] uppercase tracking-wider'>Principal</span>
                </div>
            </div>
        </div>
    );

    const renderConductCertificate = (copyType: 'Original' | 'Carbon') => (
        <section className='conduct-copy relative mb-8 overflow-hidden rounded-[10px] border-2 border-slate-900 bg-white p-8 font-['Times_New_Roman',_serif]'>
            {/* Watermark/Copy Indicator */}
            <div className='-rotate-12 pointer-events-none absolute top-5 right-5 z-0 select-none font-black text-[100px] opacity-[0.03]'>
                {copyType.toUpperCase()}
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className='mb-4 flex justify-between font-bold text-[14px]'>
                    <div className="flex flex-col">
                        <span>E-mail: <b>sms_college@yahoo.com</b></span>
                        <span>Website: <b>www.smscollegebrahmavar.com</b></span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span><b className="text-blue-600">CC:</b> <b>{student.admno}</b></span>
                        <span><svg className='mr-1 inline h-3 w-3' fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.47 5.47l.773-1.548a1 1 0 011.06-.539l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg> <b>6366415968</b></span>
                    </div>
                </div>

                {/* Main Branding - Replicating legacy layout with stacked images */}
                <div className='mb-8 border-slate-100 border-b pb-4 text-center'>
                    <img src="https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/7ce3a963-7d4b-4165-80ef-193eccfa41fe.png" alt="Branch Logo" className="mx-auto max-h-[120px]" />
                    {/* The legacy code had a second image positioned relative, we'll try to balance it */}
                </div>

                {/* Ref and Date */}
                <div className='mb-8 flex justify-between px-6 text-[18px]'>
                    <div contentEditable suppressContentEditableWarning className='min-w-[200px] p-1 hover:bg-slate-50'>
                        <strong>Ref. No:</strong> SMSC/C.Cer/{student.acadamicyear || student.yearname}
                    </div>
                    <div contentEditable suppressContentEditableWarning className='p-1 hover:bg-slate-50'>
                        <strong>Date:</strong> {format(today, 'dd/MM/yyyy')}
                    </div>
                </div>

                {/* Titles */}
                <div className='mb-10 space-y-2 text-center'>
                    <div className='font-bold text-[24px] text-slate-400 uppercase tracking-widest'>{copyType} Copy</div>
                    <div className='font-black text-[28px] uppercase underline decoration-double underline-offset-[10px]'>CONDUCT CERTIFICATE</div>
                </div>

                {/* Body Text */}
                <div className='mb-20 px-4 text-justify text-[21px] italic leading-[1.8]'>
                    <p contentEditable suppressContentEditableWarning className='rounded-lg border border-transparent p-4 outline-none transition-all hover:border-slate-100 hover:bg-yellow-50/50'>
                        This &nbsp; is &nbsp; to &nbsp; certify &nbsp; that &nbsp; {student.gender === 'FEMALE' ? 'Ms' : 'Mr'}&nbsp; <strong className='font-bold uppercase not-italic tracking-wider'>{student.studentname}</strong> &nbsp; {student.gender === 'FEMALE' ? 'D/o' : 'S/o'}&nbsp; {student.gender === 'FEMALE' ? 'kumari' : 'kumar'}.&nbsp; <strong className="font-bold not-italic"> {student.fathername}</strong>,
                        &nbsp; was &nbsp; studying &nbsp; in &nbsp; this &nbsp; institution &nbsp; from &nbsp; <strong className="font-bold not-italic underline underline-offset-2">{student.ACAYCBS_SemStartDate ? format(new Date(student.ACAYCBS_SemStartDate), 'dd/MM/yyyy') : 'DD/MM/YYYY'}</strong> &nbsp; to &nbsp;<strong className="font-bold not-italic underline underline-offset-2">{student.ACAYCBS_SemEndDate ? format(new Date(student.ACAYCBS_SemEndDate), 'dd/MM/yyyy') : 'DD/MM/YYYY'}</strong>
                        &nbsp; in &nbsp; <strong className="font-bold not-italic"> I &nbsp; year {student.coursename}</strong> &nbsp; to &nbsp; <strong className="font-bold not-italic"> III &nbsp; year &nbsp; {student.coursename} </strong>&nbsp; and &nbsp; {student.gender === 'FEMALE' ? 'her' : 'his'} &nbsp; conduct &nbsp; and &nbsp; character &nbsp; were &nbsp; <strong className='font-bold text-blue-800 not-italic'>Good</strong>.
                    </p>
                </div>

                {/* Exam Details - Optional for Conduct */}
                {extraFields?.exmname && (
                   <div className='mt-[-60px] mb-20 flex flex-wrap gap-8 border-slate-100 border-t px-4 pt-6 font-medium text-[18px] italic'>
                        <div>Exam: <span className="font-bold not-italic">{extraFields.exmname}</span></div>
                        {extraFields.exmmonth && <div>Month/Year: <span className="font-bold not-italic">{extraFields.exmmonth}</span></div>}
                        {extraFields.stdreg && <div>Reg.No: <span className="font-bold not-italic">{extraFields.stdreg}</span></div>}
                   </div>
                )}

                {/* Footer Signature */}
                <div className='mb-6 flex items-end justify-between px-10'>
                    <div className="flex flex-col items-center">
                        <div className='flex h-[100px] w-[100px] items-center justify-center rounded-full border-2 border-slate-200 text-[10px] text-slate-300 italic'>
                            Institution Seal
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="h-[50px]" />
                        <div className='w-[180px] border-slate-900 border-t pt-1 text-center font-bold text-[20px] uppercase'>Principal</div>
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <div ref={ref} className='print-wrapper mx-auto max-w-[900px] rounded-[40px] bg-slate-100/30 p-8'>
            <style jsx global>{`
                @media print {
                    .print-wrapper {
                        padding: 0 !important;
                        background: none !important;
                        max-width: none !important;
                    }
                    .study-certificate-container {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 2cm !important;
                    }
                    .conduct-copy {
                        margin-bottom: 2cm !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>
            
            {certType === '1' ? renderStudyCertificate() : (
                <div className="space-y-12">
                    {renderConductCertificate('Original')}
                    <div className='relative my-8 border-slate-300 border-t-2 border-dashed py-8'>
                        <span className='-translate-x-1/2 absolute top-[-14px] left-1/2 bg-white px-4 font-black text-slate-400 text-xs uppercase tracking-widest'>Cut here</span>
                    </div>
                    {renderConductCertificate('Carbon')}
                </div>
            )}
        </div>
    );
});

PrintComponent.displayName = 'PrintComponent';
