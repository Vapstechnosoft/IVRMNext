'use client';

import { format } from 'date-fns';
import React from 'react';
import { FIELD_CONFIG } from './columns';

interface AdmissionRegisterPrintProps {
    data: any[];
    selectedFields: string[];
}

export const AdmissionRegisterPrint = React.forwardRef<HTMLDivElement, AdmissionRegisterPrintProps>(
    ({ data, selectedFields }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        if (!data || data.length === 0) {
            return (
                <div ref={ref} className='bg-white p-5 text-center text-black'>
                    No data available for printing.
                </div>
            );
        }

        const formatDate = (date: unknown): string => {
            if (typeof date !== 'string' || !date) return 'N/A';
            try {
                return format(new Date(date), 'dd-MM-yyyy');
            } catch {
                return 'N/A';
            }
        };

        return (
            <div ref={ref} className='min-h-full w-full bg-white p-5 text-black print-preview-container'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 0;
                                size: A4 landscape;
                            }
                            body {
                                visibility: hidden;
                                background: white !important;
                                margin: 0;
                                padding: 0;
                            }
                            .no-print {
                                display: none !important;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                background: white !important;
                                z-index: 9999;
                                color: black !important;
                                padding: 15mm; /* Add padding here to compensate for 0 margin */
                            }
                            .print-preview-container * {
                                visibility: visible !important;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #000;
                            }
                            th, td {
                                border: 1px solid #000;
                                padding: 6px 4px;
                                text-align: center;
                                font-size: 10px;
                            }
                            th {
                                background-color: #f3f4f6 !important;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .text-left {
                                text-align: left !important;
                            }
                            .header-section {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .footer-section {
                                margin-top: 30px;
                                display: flex;
                                justify-content: space-between;
                                padding: 10px 0;
                            }
                        }
                    `}
                </style>

                {/* Header */}
                <div className='header-section mb-6'>
                    <h2 className='text-xl font-bold uppercase'>Admission Register Report</h2>
                    <p className='text-sm text-gray-600'>Generated Date: {currentDate}</p>
                </div>

                {/* Table */}
                <table className='w-full border-collapse border border-black'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='w-12 border border-black px-2 py-1'>Sl.No</th>
                            {selectedFields.map((fieldId) => (
                                <th key={fieldId} className='border border-black px-2 py-1 font-bold'>
                                    {FIELD_CONFIG[fieldId]?.label || fieldId}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((student, index) => (
                            <tr key={index}>
                                <td className='border border-black px-2 py-1'>{index + 1}</td>
                                {selectedFields.map((fieldId) => {
                                    const value = student[fieldId];
                                    const config = FIELD_CONFIG[fieldId];
                                    const displayValue = config?.isDate ? formatDate(value) : (value ?? 'N/A');
                                    return (
                                        <td key={`${index}-${fieldId}`} className='border border-black px-2 py-1'>
                                            {String(displayValue)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className='footer-section flex justify-between px-4'>
                    <div className='text-sm italic'>Printed on: {currentDate}</div>
                    <div className='border-t border-black px-8 pt-1 text-sm font-semibold'>Signature</div>
                </div>
            </div>
        );
    }
);

AdmissionRegisterPrint.displayName = 'AdmissionRegisterPrint';
