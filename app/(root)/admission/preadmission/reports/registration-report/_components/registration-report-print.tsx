'use client';

import type { IRigistrationReportList } from '@/types/admission/preadmission/reports';
import { format, isValid } from 'date-fns';
import React from 'react';

interface RegistrationReportPrintProps {
    data: IRigistrationReportList[];
    institutionName?: string;
}

export const RegistrationReportPrint = React.forwardRef<HTMLDivElement, RegistrationReportPrintProps>(
    ({ data, institutionName }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return isValid(date) ? format(date, 'dd/MM/yyyy') : '-';
        };

        if (!data || data.length === 0) {
            return (
                <div ref={ref} style={{ padding: '20px', background: 'white', color: 'black', textAlign: 'center' }}>
                    No data selected for printing.
                </div>
            );
        }

        return (
            <div ref={ref} className='print-preview-container' style={{ padding: '10mm', background: 'white', color: 'black', minHeight: '100%', width: '100%' }}>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 10mm;
                        }
                        .print-preview-container {
                            display: block !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                            width: 100% !important;
                            height: auto !important;
                            overflow: visible !important;
                            position: static !important;
                            background: white !important;
                            color: black !important;
                            padding: 0 !important;
                        }
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        th, td {
                            border: 1px solid black !important;
                        }
                    }
                `
                    }}
                />
                <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase' }}>
                        {institutionName || 'VAPS TECHNOSOFT'}
                    </h1>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', marginTop: '5px' }}>
                        REGISTRATION REPORT
                    </h2>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <th style={{ border: '1px solid black', padding: '8px', width: '60px', textAlign: 'center' }}>SL.NO</th>
                            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>NAME</th>
                            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>EMAIL</th>
                            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '120px' }}>MOBILE NO</th>
                            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '100px' }}>DATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{row.name}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{row.email_Id || '-'}</td>
                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{row.mob_No || '-'}</td>
                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                                    {formatDate(row.created_Date)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: '15px', textAlign: 'center', fontStyle: 'italic', fontSize: '10px', opacity: 0.7 }}>
                    Date: {currentDate} | Generated by Vaps Technosoft Pvt. Ltd.
                </div>
            </div>
        );
    }
);

RegistrationReportPrint.displayName = 'RegistrationReportPrint';
