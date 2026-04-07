'use client';

import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NdaTcPrintProps {
    data: any;
    issuedDate: Date;
}

export const NdaTcPrint = forwardRef<HTMLDivElement, NdaTcPrintProps>(({ data, issuedDate }, ref) => {
    if (!data) return null;

    const capitalizeEachWord = (text: string) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        try {
            return format(new Date(date), 'dd-MMM-yyyy');
        } catch (e) {
            return date;
        }
    };

    return (
        <div ref={ref} className="nda-tc-container bg-white text-black font-serif" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body, html {
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .nda-tc-container {
                        display: block !important;
                        visibility: visible !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        padding: 15mm !important;
                        margin: 0 !important;
                        color: black !important;
                        background: white !important;
                        overflow: visible !important;
                        position: relative !important;
                    }
                    .nda-tc-container * {
                        color: black !important;
                        background: transparent !important;
                        visibility: visible !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                }
            `}} />

            <div className="mt-20 max-w-[98%] mx-auto font-serif text-black">
                <h1 className="text-center text-xl font-bold tracking-[0.1em] underline decoration-1 underline-offset-[8px] uppercase mb-8">
                    TRANSFER CERTIFICATE
                </h1>

                <div className="flex justify-between items-end px-2 pb-1 border-b border-black mb-4 text-[13.5pt] font-bold text-black">
                    <div>Admission Number: {data?.admno || ''}</div>
                    <div>Sl.No: {data?.tcno || ''}</div>
                </div>

                <div className="space-y-1.5 pl-6 text-[11.5pt]">
                    {[
                        { num: '1.', label: 'Name of Pupil', value: capitalizeEachWord(data?.lblstdname) },
                        { num: '2.', label: "Father's Name", value: capitalizeEachWord(data?.lblfathername) },
                        { num: '3.', label: "Mother's Name", value: capitalizeEachWord(data?.lblmothername) },
                        { num: '4.', label: 'Religion/Caste', value: (data?.lblreligioncaste ? capitalizeEachWord(data?.lblreligioncaste) + ' / ' + (capitalizeEachWord(data?.studcaste) || '') : '') },
                        { num: '5.', label: 'Nationality', value: data?.lblnationality },
                        { num: '6.', label: 'Date of Birth', value: formatDate(data?.lbldob) },
                        { num: '7.', label: 'School Last Attended', value: data?.lbllastschool },
                        { num: '8.', label: 'Date Of Admission', value: formatDate(data?.lbldoa) },
                        { num: '9.', label: 'Conduct', value: data?.lblconduct },
                        { num: '10.', label: 'Date Of Leaving', value: formatDate(data?.last_date_attended) },
                        { num: '11.', label: 'Studying In', value: (data?.Last_Class_Studied || '') + (data?.asmC_SectionName ? ' ' + data?.asmC_SectionName : '') },
                        { num: '12.', label: 'Remarks', value: data?.ASTC_Remarks },
                    ].map((item, idx) => (
                        <div key={idx} className="grid grid-cols-[30px_230px_20px_1fr] items-baseline leading-snug text-black">
                            <div className="text-right pr-4">{item.num}</div>
                            <div className="">{item.label}</div>
                            <div className="text-center">:</div>
                            <div className="font-bold pl-1">{item.value}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 px-2 space-y-4 text-black border-t border-black pt-4">
                    <div className="flex justify-between text-[13.5pt] font-bold text-black">
                        <div className="flex items-center gap-2">
                            <span>PEN No. :</span>
                            <span>{data?.AMST_PENNo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                            <span>SATS No. :</span>
                            <span>{data?.govtno}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[13.5pt] font-bold text-black">
                        <span className="uppercase">APAAR No. :</span>
                        <span>{data?.AMST_APAAANO}</span>
                    </div>

                    <p className="mt-8 text-left text-[11.5pt] font-serif leading-relaxed text-black">
                        Certified that the above-mentioned information is in accordance with the school register.
                    </p>

                    <div className="mt-12 flex justify-between items-center px-2 text-[13.5pt] font-bold text-black">
                        <div className="flex items-center gap-2">
                            <span>Date:</span>
                            <span>{formatDate(issuedDate)}</span>
                        </div>
                        <div className="text-right uppercase">
                            PRINCIPAL
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

NdaTcPrint.displayName = 'NdaTcPrint';
