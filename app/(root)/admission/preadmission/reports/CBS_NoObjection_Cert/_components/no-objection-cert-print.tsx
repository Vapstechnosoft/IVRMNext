'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';

interface NoObjectionCertPrintProps {
    data: any;
}

export const NoObjectionCertPrint = forwardRef<HTMLDivElement, NoObjectionCertPrintProps>(
    ({ data }, ref) => {
        if (!data) return null;

        // data could be a single student object or contain a studentList
        const students = data.studentList || (data.studentname ? [data] : []);

        return (
            <div ref={ref} className="print-container">
                <style dangerouslySetInnerHTML={{ __html: `
                    @font-face {
                        font-family: "Old English Text MT";
                        src: url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.eot");
                        src: url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.eot?#iefix")format("embedded-opentype"), 
                             url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.woff")format("woff"), 
                             url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.woff2")format("woff2"), 
                             url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.ttf")format("truetype"), 
                             url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.svg#Old English Text MT")format("svg");
                        font-weight: normal;
                        font-style: normal;
                        font-display: swap;
                    }

                    @page {
                        size: A4;
                        margin: 0;
                    }

                    .print-container {
                        background-color: white;
                        width: 210mm;
                    }

                    .page-break {
                        page-break-after: always;
                    }

                    .cert-border-outer {
                        border-left: 5px solid #d5303b !important;
                        min-height: 297mm;
                        display: flex;
                        flex-direction: column;
                    }

                    .cert-border-middle {
                        border-left: 5px solid #e7cb7d !important;
                        min-height: 297mm;
                        display: flex;
                        flex-direction: column;
                    }

                    .cert-border-inner {
                        border-left: 4px solid #211f21 !important;
                        min-height: 297mm;
                        padding: 30px;
                        display: flex;
                        flex-direction: column;
                    }

                    .georgia-text {
                        font-family: Georgia, serif;
                    }

                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                        }
                        .print-container {
                            width: 100%;
                            height: 100%;
                        }
                        .cert-border-outer, .cert-border-middle, .cert-border-inner {
                            height: 297mm;
                            min-height: 297mm;
                        }
                    }
                `}} />

                {students.map((student: any, index: number) => (
                    <div key={student.amsT_Id || index} className={index < students.length - 1 ? 'page-break' : ''}>
                        <div className="cert-border-outer">
                            <div className="cert-border-middle">
                                <div className="cert-border-inner">
                                    <div id="BBKVTC" className="w-full">
                                        {/* Header Image */}
                                        <div className="w-full mb-10">
                                            <img 
                                                src={student.milogo || "https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg"} 
                                                alt="School Logo" 
                                                className="w-full object-fill"
                                            />
                                        </div>

                                        {/* Title */}
                                        <div className="text-center mt-10 mb-10">
                                            <h3 className="text-3xl font-bold underline georgia-text tracking-wide uppercase">
                                                TO WHOM IT MAY CONCERN
                                            </h3>
                                        </div>

                                        {/* Content */}
                                        <div className="georgia-text text-[21px] leading-[40px] text-justify px-4">
                                            <p>
                                                It is hereby certified that {student.gender5} {student.studentname}, S/o {student.fathername}
                                                is a bonafide student of this school
                                                studying in Class {student.class} Section {student.section}, Roll No. {student.rollNo} and Scholar No. {student.admno} of this school.
                                            </p>
                                            
                                            <br />

                                            <p>
                                                The School has no objection to {student.studentname} applying for the Schengen Visa for visiting Norway, Denmark and Finland from Tuesday, 30th April 2024 to Wednesday 15th May 2024.
                                            </p>
                                        </div>

                                        {/* Signature Section */}
                                        <div className="mt-40 pr-10 text-right space-y-0">
                                            <p className="georgia-text font-bold text-xl mb-0"> (Raja McGee) &emsp;&emsp;</p>
                                            <p className="georgia-text font-bold text-xl underline leading-none"> Principal & Secretary </p>
                                        </div>

                                        {/* Dated Footer */}
                                        <div className="mt-10 px-4">
                                            <p className="georgia-text text-[22px]">
                                                Dated: <span className="border-b border-black inline-block px-4 font-semibold">
                                                    {student.date ? format(new Date(student.date), 'dd MMMM yyyy') : '--'}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Footer Image */}
                                        <div className="mt-10 px-4">
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
                ))}
            </div>
        );
    }
);

NoObjectionCertPrint.displayName = 'NoObjectionCertPrint';
