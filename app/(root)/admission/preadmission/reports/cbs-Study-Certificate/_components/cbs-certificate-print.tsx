'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';

interface CbsCertificatePrintProps {
    data: any;
    mode: '0' | '1'; // 0: Study, 1: Character
}

export const CbsCertificatePrint = forwardRef<HTMLDivElement, CbsCertificatePrintProps>(
    ({ data, mode }, ref) => {
        if (!data) return null;

        const {
            studentname,
            fathername,
            mothername,
            className, // from studentlist[0].class
            section,
            rollNo,
            admno,
            date,
            milogo,
            boardType,
            charType,
            genderLabel, // Master/Miss
        } = data;

        return (
            <div ref={ref} className="print-container bg-white p-0 m-0 w-[210mm] min-h-[297mm] relative overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: `
                    @page {
                        size: A4;
                        margin: 0;
                    }

                    .main-container {
                        padding: 56px 56px 38px 56px;
                        box-sizing: border-box;
                        min-height: 297mm;
                        background: url("https://vapsclg.blob.core.windows.net/files/57/COE_Images_Videos/f3a56e64-883f-4c81-9e9e-41c34eeb0b21.png") no-repeat center 320px;
                        background-size: 95% auto;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .cert-border-outer {
                        border-left: 5px solid #d5303b !important;
                        height: 100%;
                        min-height: 270mm;
                    }

                    .cert-border-middle {
                        border-left: 5px solid #e7cb7d !important;
                        height: 100%;
                        min-height: 270mm;
                    }

                    .cert-border-inner {
                        border-left: 4px solid #211f21 !important;
                        height: 100%;
                        min-height: 270mm;
                        padding: 30px;
                    }

                    .georgia-text {
                        font-family: Georgia, Times New Roman, serif;
                        line-height: 2.2;
                    }

                    .title-underline {
                        text-decoration: underline;
                        font-family: system-ui, -apple-system, sans-serif;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 1.25rem;
                        text-align: center;
                        margin-bottom: 2rem;
                    }

                    .content-text {
                        font-family: "Times New Roman", Times, serif;
                        font-size: 20px;
                        line-height: 1.8;
                        margin-top: 2rem;
                    }

                    .content-text b {
                        border-bottom: 1px solid #000;
                        padding-bottom: 1px;
                    }

                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                        }
                        .main-container {
                            width: 100%;
                        }
                    }
                `}} />

                <div className="main-container">
                    <div className="cert-border-outer">
                        <div className="cert-border-middle">
                            <div className="cert-border-inner">
                                <div id="BBKVTC" className="space-y-6">
                                    {/* Header Logo */}
                                    <div className="w-full">
                                        <img 
                                            src={milogo || "https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg"} 
                                            alt="School Logo" 
                                            className="w-full object-fill"
                                            style={{ height: 'auto', minHeight: '100px' }}
                                        />
                                    </div>

                                    {/* Title */}
                                    <div className="mt-12">
                                        <h4 className="title-underline">TO WHOM IT MAY CONCERN</h4>
                                    </div>

                                    {/* Main Body content */}
                                    <div className="content-text space-y-8">
                                        {mode === '1' ? (
                                            /* Character Certificate Layout */
                                            <>
                                                <p>
                                                    Certified that {genderLabel || 'Master'} <b>{studentname}</b> S/o <b>{fathername} and {mothername}</b> was a bonafide student of this school studying in <b>Class {className}-{section}</b> (Scholar ID) UID: <b>{admno}</b>
                                                </p>
                                                <p>
                                                    He appeared for and Passed the <b>{boardType}</b> Examination held in <b>March 2024</b> from this School.
                                                </p>
                                                <p>
                                                    To the best of my knowledge his conduct and character is <b>{charType}</b>.
                                                </p>
                                                <p>
                                                    I wish him all success in the future.
                                                </p>
                                            </>
                                        ) : (
                                            /* Study Certificate Layout (Dynamic based on logic) */
                                            <>
                                                <p>
                                                    This is to certify that {genderLabel || 'Master'} <b>{studentname}</b> S/o <b>{fathername} and {mothername}</b> is a bonafide student of this school.
                                                </p>
                                                <p>
                                                    He is presently/was studying in <b>Class {className}</b> section <b>{section}</b> with scholar number <b>{admno}</b> in the academic year <b>{data.acadamicyear}</b>.
                                                </p>
                                                <p>
                                                    His date of birth according to the school records is <b>{data.dob ? format(new Date(data.dob), 'dd/MM/yyyy') : '--'}</b> (in words: <b>{data.dobinwords}</b>).
                                                </p>
                                                <p>
                                                    He joined the school in <b>{data.admitedyear}</b> in class <b>{data.admitedclass}</b>.
                                                </p>
                                                <p>
                                                    His address in our record is <b>{data.street} {data.area} {data.city}</b>.
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* Signature Section */}
                                    <div className="mt-20">
                                        <div className="text-right pr-4 space-y-1">
                                            <p className="text-xl font-medium">(Raja McGee)</p>
                                            <p className="text-xl font-bold">Principal & Secretary</p>
                                        </div>
                                    </div>

                                    {/* Dated Footer */}
                                    <div className="mt-8 border-b border-black w-fit px-2 inline-block">
                                        <p className="text-xl font-medium">
                                            Dated: {date ? format(new Date(date), 'dd/MMMM/yyyy') : '--'}
                                        </p>
                                    </div>

                                    {/* Footer Image */}
                                    <div className="mt-12 flex justify-center">
                                        <img 
                                            src="https://calcuttaboy.blob.core.windows.net/files/Bonafied_Footer_cbs.jpg" 
                                            alt="Footer" 
                                            className="h-[100px] object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

CbsCertificatePrint.displayName = 'CbsCertificatePrint';
