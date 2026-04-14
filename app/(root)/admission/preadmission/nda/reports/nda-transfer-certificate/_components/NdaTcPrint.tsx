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

    const capitalizeEachWord = (text: any) => {
        if (!text) return '';
        const str = String(text);
        return str
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
        <div ref={ref} className="nda-tc-container text-black">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .nda-tc-container {
                        display: block !important;
                        visibility: visible !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        padding: 20mm !important;
                        margin: 0 auto !important;
                        color: black !important;
                        background: white !important;
                        overflow: visible !important;
                        position: relative !important;
                        z-index: 9999 !important;
                    }
                    .nda-tc-container * {
                        visibility: visible !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                    .nda-tc-container .field-row { display: flex !important; align-items: baseline !important; }
                    .nda-tc-container .field-value { border-bottom: none !important; flex: 1 !important; }
                    .nda-tc-container .no-print { display: none !important; }
                }
                .nda-tc-container { 
                    font-family: 'Times New Roman', Times, serif; 
                    background-color: white;
                    padding: 10mm;
                }
                .nda-tc-container .field-row { display: flex; align-items: baseline; margin-bottom: 8px; width: 100%; }
                .nda-tc-container .field-num { width: 30px; font-size: 11pt; }
                .nda-tc-container .field-label { width: 180px; font-size: 11pt; }
                .nda-tc-container .field-colon { width: 20px; text-align: center; font-size: 11pt; }
                .nda-tc-container .field-value { flex: 1; border-bottom: none; font-weight: normal; font-size: 11pt; padding-left: 5px; }
                .nda-tc-container .text-black { color: #000; }
            `}} />

            <div className="mt-16 max-w-[95%] mx-auto font-serif text-black">
                <h1 className="text-center text-lg font-bold underline decoration-1 underline-offset-[4px] uppercase mb-8">
                    TRANSFER CERTIFICATE
                </h1>

                <div className="flex justify-between items-end px-1 pb-1 border-b border-gray-400 mb-6 text-[11pt] font-bold text-black uppercase">
                    <div>Admission Number: {data?.admno || ''}</div>
                    <div>Sl.No: {data?.tcno || ''}</div>
                </div>

                <div className="space-y-1 pl-4">
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
                        { num: '11.', label: 'Studying In', value: (data?.Last_Class_Studied ? 'Class ' + data?.Last_Class_Studied : '') + (data?.asmC_SectionName ? ' ' + data?.asmC_SectionName : '') },
                        { num: '12.', label: 'Remarks', value: data?.ASTC_Remarks },
                    ].map((item, idx) => (
                        <div key={idx} className="field-row">
                            <span className="field-num">{item.num}</span>
                            <span className="field-label">{item.label}</span>
                            <span className="field-colon">:</span>
                            <div className="field-value">{item.value}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-2 border-b border-gray-400 mb-6 w-full" />

                <div className="px-1 space-y-4 text-[11pt] text-black">
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <span>PEN No. :</span>
                            <span>{data?.AMST_PENNo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>SATS No. :</span>
                            <span>{data?.govtno}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-8">
                        <span>APAAR No. :</span>
                        <span>{data?.AMST_APAAANO}</span>
                    </div>

                    <p className="mt-10 text-[11pt] leading-relaxed">
                        Certified that the above-mentioned information is in accordance with the school register.
                    </p>

                    <div className="mt-16 flex justify-between items-center text-[11pt]">
                        <div className="flex items-center gap-2">
                            <span>Date:</span>
                            <span>{formatDate(issuedDate)}</span>
                        </div>
                        <div className="text-right">
                           <span className="font-bold">PRINCIPAL</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="no-print h-10" />
        </div>
    );
});

NdaTcPrint.displayName = 'NdaTcPrint';
